-- ============================================================
-- FairShare – Storage Buckets
-- ============================================================

-- 집안일 인증 사진 버킷
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'chore-photos',
  'chore-photos',
  false,
  5242880,  -- 5MB
  ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- 아바타 버킷
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'avatars',
  'avatars',
  true,
  2097152,  -- 2MB
  ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- 보상 목표 이미지 버킷
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'reward-goals',
  'reward-goals',
  false,
  2097152,  -- 2MB
  ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- STORAGE RLS POLICIES
-- ============================================================

-- 집안일 사진: 같은 가구 구성원만 접근
-- 경로: chore-photos/{household_id}/{user_id}/{filename}
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

-- 아바타: 본인만 업로드, 모두 조회
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

-- 보상 목표 이미지: 해당 아이와 부모만
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
