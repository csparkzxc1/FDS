-- ============================================================
-- FairShare – Initial Schema Migration
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- TABLES
-- ============================================================

-- 사용자 (기본 profiles – Supabase auth.users 와 연결)
CREATE TABLE public.users (
  id          uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email       text,
  display_name text NOT NULL DEFAULT '',
  avatar_url  text,
  created_at  timestamptz NOT NULL DEFAULT now()
);

-- 가구(세대)
CREATE TABLE public.households (
  id                uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name              text NOT NULL,
  mode              text NOT NULL CHECK (mode IN ('couple', 'family', 'roommate')),
  invite_code       text UNIQUE NOT NULL DEFAULT upper(substring(gen_random_uuid()::text, 1, 6)),
  invite_expires_at timestamptz DEFAULT (now() + interval '7 days'),
  point_to_currency numeric NOT NULL DEFAULT 100,  -- 1pt = 100원
  created_by        uuid NOT NULL REFERENCES public.users(id),
  created_at        timestamptz NOT NULL DEFAULT now()
);

-- 구성원
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

-- 집안일 카탈로그
CREATE TABLE public.chores (
  id                  uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  household_id        uuid NOT NULL REFERENCES public.households(id) ON DELETE CASCADE,
  title               text NOT NULL,
  icon                text NOT NULL DEFAULT '🧹',
  category            text NOT NULL DEFAULT 'etc'
                        CHECK (category IN ('cleaning', 'cooking', 'laundry', 'invisible', 'care', 'etc')),
  points              int NOT NULL DEFAULT 1 CHECK (points >= 0),
  requires_photo      boolean NOT NULL DEFAULT false,
  requires_approval   boolean NOT NULL DEFAULT false,
  is_invisible_labor  boolean NOT NULL DEFAULT false,
  estimated_minutes   int,
  created_at          timestamptz NOT NULL DEFAULT now(),
  archived_at         timestamptz
);

-- 집안일 수행 기록
CREATE TABLE public.chore_logs (
  id             uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  household_id   uuid NOT NULL REFERENCES public.households(id) ON DELETE CASCADE,
  chore_id       uuid NOT NULL REFERENCES public.chores(id) ON DELETE CASCADE,
  performed_by   uuid NOT NULL REFERENCES public.users(id),
  performed_at   timestamptz NOT NULL DEFAULT now(),
  points_awarded int NOT NULL DEFAULT 0,
  photo_url      text,
  note           text,
  status         text NOT NULL DEFAULT 'approved'
                   CHECK (status IN ('pending', 'approved', 'rejected')),
  approved_by    uuid REFERENCES public.users(id),
  approved_at    timestamptz,
  rejected_reason text
);

-- 용돈 정산 기록 (family 모드)
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

-- 보상 목표 (아이가 저축하는 목표)
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

-- 알림 설정
CREATE TABLE public.notification_settings (
  user_id               uuid PRIMARY KEY REFERENCES public.users(id) ON DELETE CASCADE,
  daily_reminder        boolean NOT NULL DEFAULT true,
  daily_reminder_time   time NOT NULL DEFAULT '20:00',
  weekly_report         boolean NOT NULL DEFAULT true,
  approval_requests     boolean NOT NULL DEFAULT true,
  imbalance_warning     boolean NOT NULL DEFAULT true,
  push_token            text,
  updated_at            timestamptz NOT NULL DEFAULT now()
);

-- ============================================================
-- INDEXES
-- ============================================================

CREATE INDEX idx_household_members_user_id ON public.household_members(user_id);
CREATE INDEX idx_household_members_household_id ON public.household_members(household_id);
CREATE INDEX idx_chores_household_id ON public.chores(household_id);
CREATE INDEX idx_chore_logs_household_id ON public.chore_logs(household_id);
CREATE INDEX idx_chore_logs_performed_by ON public.chore_logs(performed_by);
CREATE INDEX idx_chore_logs_performed_at ON public.chore_logs(performed_at DESC);
CREATE INDEX idx_chore_logs_status ON public.chore_logs(status);
CREATE INDEX idx_allowance_settlements_household_id ON public.allowance_settlements(household_id);
CREATE INDEX idx_allowance_settlements_child_id ON public.allowance_settlements(child_id);
CREATE INDEX idx_reward_goals_child_id ON public.reward_goals(child_id);

-- ============================================================
-- FUNCTIONS
-- ============================================================

-- 현재 사용자의 household_id 조회 헬퍼
CREATE OR REPLACE FUNCTION public.get_user_household_ids()
RETURNS TABLE(household_id uuid)
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT hm.household_id
  FROM public.household_members hm
  WHERE hm.user_id = auth.uid();
$$;

-- 사용자가 특정 가구의 구성원인지 확인
CREATE OR REPLACE FUNCTION public.is_household_member(hid uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.household_members
    WHERE household_id = hid AND user_id = auth.uid()
  );
$$;

-- 사용자가 특정 가구의 부모인지 확인
CREATE OR REPLACE FUNCTION public.is_household_parent(hid uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.household_members
    WHERE household_id = hid AND user_id = auth.uid() AND role = 'parent'
  );
$$;

-- 새 사용자 생성 시 users 테이블에 자동 삽입
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.users (id, email, display_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1), ''),
    NEW.raw_user_meta_data->>'avatar_url'
  );
  INSERT INTO public.notification_settings (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$;

-- 초대 코드 갱신 함수
CREATE OR REPLACE FUNCTION public.refresh_invite_code(hid uuid)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
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
  WHERE id = hid;
  RETURN new_code;
END;
$$;

-- ============================================================
-- TRIGGERS
-- ============================================================

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.households ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.household_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chore_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.allowance_settlements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reward_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_settings ENABLE ROW LEVEL SECURITY;

-- users: 본인만 수정 가능, 같은 가구 구성원은 조회 가능
CREATE POLICY "Users can view members of their household"
  ON public.users FOR SELECT
  USING (
    id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.household_members hm1
      JOIN public.household_members hm2 ON hm1.household_id = hm2.household_id
      WHERE hm1.user_id = auth.uid() AND hm2.user_id = public.users.id
    )
  );

CREATE POLICY "Users can update own profile"
  ON public.users FOR UPDATE
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

CREATE POLICY "Users can insert own profile"
  ON public.users FOR INSERT
  WITH CHECK (id = auth.uid());

-- households: 구성원만 조회, 생성자만 수정
CREATE POLICY "Household members can view their household"
  ON public.households FOR SELECT
  USING (public.is_household_member(id));

CREATE POLICY "Authenticated users can create household"
  ON public.households FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL AND created_by = auth.uid());

CREATE POLICY "Household creator can update"
  ON public.households FOR UPDATE
  USING (created_by = auth.uid())
  WITH CHECK (created_by = auth.uid());

-- household_members: 구성원끼리 조회, 자신만 삭제
CREATE POLICY "Members can view their household members"
  ON public.household_members FOR SELECT
  USING (public.is_household_member(household_id));

CREATE POLICY "Authenticated users can join household"
  ON public.household_members FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL AND user_id = auth.uid());

CREATE POLICY "Members can remove themselves"
  ON public.household_members FOR DELETE
  USING (user_id = auth.uid());

CREATE POLICY "Parents can remove child members"
  ON public.household_members FOR DELETE
  USING (
    public.is_household_parent(household_id)
    AND role = 'child'
  );

-- chores: 같은 가구 구성원만 접근
CREATE POLICY "Household members can view chores"
  ON public.chores FOR SELECT
  USING (public.is_household_member(household_id));

CREATE POLICY "Household members can create chores"
  ON public.chores FOR INSERT
  WITH CHECK (public.is_household_member(household_id));

CREATE POLICY "Household members can update chores"
  ON public.chores FOR UPDATE
  USING (public.is_household_member(household_id))
  WITH CHECK (public.is_household_member(household_id));

CREATE POLICY "Household members can archive chores"
  ON public.chores FOR DELETE
  USING (public.is_household_member(household_id));

-- chore_logs: 같은 가구 구성원만 접근
CREATE POLICY "Household members can view chore logs"
  ON public.chore_logs FOR SELECT
  USING (public.is_household_member(household_id));

CREATE POLICY "Household members can create chore logs"
  ON public.chore_logs FOR INSERT
  WITH CHECK (
    public.is_household_member(household_id)
    AND performed_by = auth.uid()
  );

CREATE POLICY "Performers can update own pending logs"
  ON public.chore_logs FOR UPDATE
  USING (
    performed_by = auth.uid()
    AND status = 'pending'
  )
  WITH CHECK (
    performed_by = auth.uid()
    AND status = 'pending'
  );

CREATE POLICY "Parents can approve/reject chore logs"
  ON public.chore_logs FOR UPDATE
  USING (
    public.is_household_parent(household_id)
    AND status = 'pending'
  )
  WITH CHECK (
    public.is_household_parent(household_id)
  );

-- allowance_settlements: 가구 구성원 조회, 부모만 생성/수정
CREATE POLICY "Household members can view settlements"
  ON public.allowance_settlements FOR SELECT
  USING (public.is_household_member(household_id));

CREATE POLICY "Parents can create settlements"
  ON public.allowance_settlements FOR INSERT
  WITH CHECK (public.is_household_parent(household_id));

CREATE POLICY "Parents can update settlements"
  ON public.allowance_settlements FOR UPDATE
  USING (public.is_household_parent(household_id))
  WITH CHECK (public.is_household_parent(household_id));

-- reward_goals: 해당 아이와 같은 가구 구성원
CREATE POLICY "Household members can view reward goals"
  ON public.reward_goals FOR SELECT
  USING (public.is_household_member(household_id));

CREATE POLICY "Children can manage own goals"
  ON public.reward_goals FOR ALL
  USING (child_id = auth.uid())
  WITH CHECK (child_id = auth.uid());

CREATE POLICY "Parents can manage child goals"
  ON public.reward_goals FOR ALL
  USING (public.is_household_parent(household_id))
  WITH CHECK (public.is_household_parent(household_id));

-- notification_settings: 본인만
CREATE POLICY "Users manage own notification settings"
  ON public.notification_settings FOR ALL
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- ============================================================
-- REALTIME
-- ============================================================

ALTER PUBLICATION supabase_realtime ADD TABLE public.chore_logs;
ALTER PUBLICATION supabase_realtime ADD TABLE public.chores;
ALTER PUBLICATION supabase_realtime ADD TABLE public.household_members;
