-- ============================================================
-- FairShare – Full Schema (migrations 1-4 combined)
-- Supabase SQL Editor에 붙여넣기용
-- ============================================================


-- ============================================================
-- [1/4] initial_schema
-- ============================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE public.users (
  id           uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email        text,
  display_name text NOT NULL DEFAULT '',
  avatar_url   text,
  created_at   timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.households (
  id                uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name              text NOT NULL,
  mode              text NOT NULL CHECK (mode IN ('couple', 'family', 'roommate')),
  invite_code       text UNIQUE NOT NULL DEFAULT upper(substring(gen_random_uuid()::text, 1, 6)),
  invite_expires_at timestamptz DEFAULT (now() + interval '7 days'),
  point_to_currency numeric NOT NULL DEFAULT 100,
  created_by        uuid NOT NULL REFERENCES public.users(id),
  created_at        timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.household_members (
  id           uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  household_id uuid NOT NULL REFERENCES public.households(id) ON DELETE CASCADE,
  user_id      uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  role         text NOT NULL CHECK (role IN ('parent', 'child', 'partner', 'roommate')),
  nickname     text,
  birth_year   int,
  joined_at    timestamptz NOT NULL DEFAULT now(),
  UNIQUE (household_id, user_id)
);

CREATE TABLE public.chores (
  id                 uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  household_id       uuid NOT NULL REFERENCES public.households(id) ON DELETE CASCADE,
  title              text NOT NULL,
  icon               text NOT NULL DEFAULT '🧹',
  category           text NOT NULL DEFAULT 'etc'
                       CHECK (category IN ('cleaning','cooking','laundry','invisible','care','etc')),
  points             int NOT NULL DEFAULT 1 CHECK (points >= 0),
  requires_photo     boolean NOT NULL DEFAULT false,
  requires_approval  boolean NOT NULL DEFAULT false,
  is_invisible_labor boolean NOT NULL DEFAULT false,
  estimated_minutes  int,
  created_at         timestamptz NOT NULL DEFAULT now(),
  archived_at        timestamptz
);

CREATE TABLE public.chore_logs (
  id              uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  household_id    uuid NOT NULL REFERENCES public.households(id) ON DELETE CASCADE,
  chore_id        uuid NOT NULL REFERENCES public.chores(id) ON DELETE CASCADE,
  performed_by    uuid NOT NULL REFERENCES public.users(id),
  performed_at    timestamptz NOT NULL DEFAULT now(),
  points_awarded  int NOT NULL DEFAULT 0,
  photo_url       text,
  note            text,
  status          text NOT NULL DEFAULT 'approved'
                    CHECK (status IN ('pending','approved','rejected')),
  approved_by     uuid REFERENCES public.users(id),
  approved_at     timestamptz,
  rejected_reason text
);

CREATE TABLE public.allowance_settlements (
  id           uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  household_id uuid NOT NULL REFERENCES public.households(id) ON DELETE CASCADE,
  child_id     uuid NOT NULL REFERENCES public.users(id),
  period_start date NOT NULL,
  period_end   date NOT NULL,
  total_points int NOT NULL DEFAULT 0,
  total_amount numeric NOT NULL DEFAULT 0,
  paid_at      timestamptz,
  paid_by      uuid REFERENCES public.users(id),
  note         text,
  created_at   timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.reward_goals (
  id            uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  child_id      uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  household_id  uuid NOT NULL REFERENCES public.households(id) ON DELETE CASCADE,
  title         text NOT NULL,
  target_points int NOT NULL CHECK (target_points > 0),
  image_url     text,
  achieved_at   timestamptz,
  created_at    timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.notification_settings (
  user_id             uuid PRIMARY KEY REFERENCES public.users(id) ON DELETE CASCADE,
  daily_reminder      boolean NOT NULL DEFAULT true,
  daily_reminder_time time NOT NULL DEFAULT '20:00',
  weekly_report       boolean NOT NULL DEFAULT true,
  approval_requests   boolean NOT NULL DEFAULT true,
  imbalance_warning   boolean NOT NULL DEFAULT true,
  push_token          text,
  updated_at          timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_household_members_user_id          ON public.household_members(user_id);
CREATE INDEX idx_household_members_household_id     ON public.household_members(household_id);
CREATE INDEX idx_chores_household_id                ON public.chores(household_id);
CREATE INDEX idx_chore_logs_household_id            ON public.chore_logs(household_id);
CREATE INDEX idx_chore_logs_performed_by            ON public.chore_logs(performed_by);
CREATE INDEX idx_chore_logs_performed_at            ON public.chore_logs(performed_at DESC);
CREATE INDEX idx_chore_logs_status                  ON public.chore_logs(status);
CREATE INDEX idx_allowance_settlements_household_id ON public.allowance_settlements(household_id);
CREATE INDEX idx_allowance_settlements_child_id     ON public.allowance_settlements(child_id);
CREATE INDEX idx_reward_goals_child_id              ON public.reward_goals(child_id);

CREATE OR REPLACE FUNCTION public.get_user_household_ids()
RETURNS TABLE(household_id uuid)
LANGUAGE sql SECURITY DEFINER STABLE AS $$
  SELECT hm.household_id
  FROM public.household_members hm
  WHERE hm.user_id = auth.uid();
$$;

CREATE OR REPLACE FUNCTION public.is_household_member(hid uuid)
RETURNS boolean
LANGUAGE sql SECURITY DEFINER STABLE AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.household_members hm
    WHERE hm.household_id = hid
      AND hm.user_id = auth.uid()
  );
$$;

CREATE OR REPLACE FUNCTION public.is_household_parent(hid uuid)
RETURNS boolean
LANGUAGE sql SECURITY DEFINER STABLE AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.household_members hm
    WHERE hm.household_id = hid
      AND hm.user_id = auth.uid()
      AND hm.role = 'parent'
  );
$$;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER AS $$
DECLARE
  v_id           uuid;
  v_email        text;
  v_display_name text;
  v_avatar_url   text;
BEGIN
  v_id    := NEW.id;
  v_email := NEW.email;
  v_display_name := COALESCE(
    json_extract_path_text(NEW.raw_user_meta_data::json, 'display_name'),
    split_part(NEW.email, '@', 1),
    ''
  );
  v_avatar_url := json_extract_path_text(NEW.raw_user_meta_data::json, 'avatar_url');

  INSERT INTO public.users (id, email, display_name, avatar_url)
  VALUES (v_id, v_email, v_display_name, v_avatar_url);

  INSERT INTO public.notification_settings (user_id)
  VALUES (v_id)
  ON CONFLICT (user_id) DO NOTHING;

  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.refresh_invite_code(hid uuid)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER AS $$
DECLARE
  new_code text;
BEGIN
  IF NOT public.is_household_member(hid) THEN
    RAISE EXCEPTION 'Not a member of this household';
  END IF;
  new_code := upper(substring(gen_random_uuid()::text, 1, 6));
  UPDATE public.households
  SET invite_code = new_code,
      invite_expires_at = now() + interval '7 days'
  WHERE households.id = hid;
  RETURN new_code;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

ALTER TABLE public.users                  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.households             ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.household_members      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chores                 ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chore_logs             ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.allowance_settlements  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reward_goals           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_settings  ENABLE ROW LEVEL SECURITY;

-- ── users policies ───────────────────────────────────────────
-- users.id 로 명시: 서브쿼리 내 hm1.id / hm2.id 와 구분
CREATE POLICY "Users can view members of their household"
  ON public.users FOR SELECT
  USING (
    users.id = auth.uid()
    OR EXISTS (
      SELECT 1
      FROM public.household_members hm1
      JOIN public.household_members hm2
        ON hm1.household_id = hm2.household_id
      WHERE hm1.user_id = auth.uid()
        AND hm2.user_id = users.id
    )
  );

CREATE POLICY "Users can update own profile"
  ON public.users FOR UPDATE
  USING (users.id = auth.uid())
  WITH CHECK (users.id = auth.uid());

CREATE POLICY "Users can insert own profile"
  ON public.users FOR INSERT
  WITH CHECK (users.id = auth.uid());

-- ── households policies ──────────────────────────────────────
CREATE POLICY "Household members can view their household"
  ON public.households FOR SELECT
  USING (public.is_household_member(households.id));

CREATE POLICY "Authenticated users can create household"
  ON public.households FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL AND households.created_by = auth.uid());

CREATE POLICY "Household creator can update"
  ON public.households FOR UPDATE
  USING (households.created_by = auth.uid())
  WITH CHECK (households.created_by = auth.uid());

-- ── household_members policies ───────────────────────────────
CREATE POLICY "Members can view their household members"
  ON public.household_members FOR SELECT
  USING (public.is_household_member(household_members.household_id));

CREATE POLICY "Authenticated users can join household"
  ON public.household_members FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL AND household_members.user_id = auth.uid());

CREATE POLICY "Members can remove themselves"
  ON public.household_members FOR DELETE
  USING (household_members.user_id = auth.uid());

CREATE POLICY "Parents can remove child members"
  ON public.household_members FOR DELETE
  USING (
    public.is_household_parent(household_members.household_id)
    AND household_members.role = 'child'
  );

-- ── chores policies ──────────────────────────────────────────
CREATE POLICY "Household members can view chores"
  ON public.chores FOR SELECT
  USING (public.is_household_member(chores.household_id));

CREATE POLICY "Household members can create chores"
  ON public.chores FOR INSERT
  WITH CHECK (public.is_household_member(chores.household_id));

CREATE POLICY "Household members can update chores"
  ON public.chores FOR UPDATE
  USING (public.is_household_member(chores.household_id))
  WITH CHECK (public.is_household_member(chores.household_id));

CREATE POLICY "Household members can archive chores"
  ON public.chores FOR DELETE
  USING (public.is_household_member(chores.household_id));

-- ── chore_logs policies ──────────────────────────────────────
CREATE POLICY "Household members can view chore logs"
  ON public.chore_logs FOR SELECT
  USING (public.is_household_member(chore_logs.household_id));

CREATE POLICY "Household members can create chore logs"
  ON public.chore_logs FOR INSERT
  WITH CHECK (
    public.is_household_member(chore_logs.household_id)
    AND chore_logs.performed_by = auth.uid()
  );

CREATE POLICY "Performers can update own pending logs"
  ON public.chore_logs FOR UPDATE
  USING (chore_logs.performed_by = auth.uid() AND chore_logs.status = 'pending')
  WITH CHECK (chore_logs.performed_by = auth.uid() AND chore_logs.status = 'pending');

CREATE POLICY "Parents can approve/reject chore logs"
  ON public.chore_logs FOR UPDATE
  USING (
    public.is_household_parent(chore_logs.household_id)
    AND chore_logs.status = 'pending'
  )
  WITH CHECK (public.is_household_parent(chore_logs.household_id));

-- ── allowance_settlements policies ──────────────────────────
CREATE POLICY "Household members can view settlements"
  ON public.allowance_settlements FOR SELECT
  USING (public.is_household_member(allowance_settlements.household_id));

CREATE POLICY "Parents can create settlements"
  ON public.allowance_settlements FOR INSERT
  WITH CHECK (public.is_household_parent(allowance_settlements.household_id));

CREATE POLICY "Parents can update settlements"
  ON public.allowance_settlements FOR UPDATE
  USING (public.is_household_parent(allowance_settlements.household_id))
  WITH CHECK (public.is_household_parent(allowance_settlements.household_id));

-- ── reward_goals policies ────────────────────────────────────
CREATE POLICY "Household members can view reward goals"
  ON public.reward_goals FOR SELECT
  USING (public.is_household_member(reward_goals.household_id));

CREATE POLICY "Children can manage own goals"
  ON public.reward_goals FOR ALL
  USING (reward_goals.child_id = auth.uid())
  WITH CHECK (reward_goals.child_id = auth.uid());

CREATE POLICY "Parents can manage child goals"
  ON public.reward_goals FOR ALL
  USING (public.is_household_parent(reward_goals.household_id))
  WITH CHECK (public.is_household_parent(reward_goals.household_id));

-- ── notification_settings policies ──────────────────────────
CREATE POLICY "Users manage own notification settings"
  ON public.notification_settings FOR ALL
  USING (notification_settings.user_id = auth.uid())
  WITH CHECK (notification_settings.user_id = auth.uid());

ALTER PUBLICATION supabase_realtime ADD TABLE public.chore_logs;
ALTER PUBLICATION supabase_realtime ADD TABLE public.chores;
ALTER PUBLICATION supabase_realtime ADD TABLE public.household_members;


-- ============================================================
-- [2/4] storage
-- ============================================================

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('chore-photos', 'chore-photos', false, 5242880,
        ARRAY['image/jpeg','image/png','image/webp'])
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('avatars', 'avatars', true, 2097152,
        ARRAY['image/jpeg','image/png','image/webp'])
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('reward-goals', 'reward-goals', false, 2097152,
        ARRAY['image/jpeg','image/png','image/webp'])
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Household members can upload chore photos"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'chore-photos'
    AND auth.uid() IS NOT NULL
    AND public.is_household_member((storage.foldername(name))[1]::uuid)
  );

CREATE POLICY "Household members can view chore photos"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'chore-photos'
    AND public.is_household_member((storage.foldername(name))[1]::uuid)
  );

CREATE POLICY "Uploaders can delete own chore photos"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'chore-photos'
    AND auth.uid()::text = (storage.foldername(name))[2]
  );

CREATE POLICY "Users can upload own avatar"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'avatars'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Avatars are publicly viewable"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'avatars');

CREATE POLICY "Users can update own avatar"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'avatars'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can manage own reward goal images"
  ON storage.objects FOR ALL
  USING (
    bucket_id = 'reward-goals'
    AND auth.uid()::text = (storage.foldername(name))[1]
  )
  WITH CHECK (
    bucket_id = 'reward-goals'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );


-- ============================================================
-- [3/4] member_pending
-- ============================================================

ALTER TABLE public.household_members ALTER COLUMN role DROP NOT NULL;

ALTER TABLE public.household_members
  ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'active'
  CHECK (status IN ('pending', 'active'));

CREATE OR REPLACE FUNCTION public.is_household_member(hid uuid)
RETURNS boolean
LANGUAGE sql SECURITY DEFINER STABLE AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.household_members hm
    WHERE hm.household_id = hid
      AND hm.user_id = auth.uid()
      AND hm.status = 'active'
  );
$$;

CREATE OR REPLACE FUNCTION public.is_pending_member(hid uuid)
RETURNS boolean
LANGUAGE sql SECURITY DEFINER STABLE AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.household_members hm
    WHERE hm.household_id = hid
      AND hm.user_id = auth.uid()
      AND hm.status = 'pending'
  );
$$;

CREATE OR REPLACE FUNCTION public.is_household_admin(hid uuid)
RETURNS boolean
LANGUAGE sql SECURITY DEFINER STABLE AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.household_members hm
    WHERE hm.household_id = hid
      AND hm.user_id = auth.uid()
      AND hm.role = 'parent'
      AND hm.status = 'active'
  );
$$;

DROP POLICY IF EXISTS "Members can view household members"  ON public.household_members;
DROP POLICY IF EXISTS "Users can join households"           ON public.household_members;
DROP POLICY IF EXISTS "Members can update own record"       ON public.household_members;
DROP POLICY IF EXISTS "Members can leave household"         ON public.household_members;

CREATE POLICY "Active members can view household members"
  ON public.household_members FOR SELECT
  USING (
    (household_members.status = 'active'
      AND public.is_household_member(household_members.household_id))
    OR household_members.user_id = auth.uid()
  );

CREATE POLICY "Users can join households"
  ON public.household_members FOR INSERT
  WITH CHECK (household_members.user_id = auth.uid());

CREATE POLICY "Members can update own or admin can update household members"
  ON public.household_members FOR UPDATE
  USING (
    household_members.user_id = auth.uid()
    OR public.is_household_admin(household_members.household_id)
  );

CREATE POLICY "Members can leave or admin can remove"
  ON public.household_members FOR DELETE
  USING (
    household_members.user_id = auth.uid()
    OR public.is_household_admin(household_members.household_id)
  );


-- ============================================================
-- [4/4] allowance_carryover
-- ============================================================

ALTER TABLE public.allowance_settlements
  ADD COLUMN IF NOT EXISTS carryover boolean NOT NULL DEFAULT false;

DROP POLICY IF EXISTS "Members can view their household members"
  ON public.household_members;
