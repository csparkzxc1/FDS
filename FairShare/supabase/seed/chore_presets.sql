-- ============================================================
-- FairShare – Chore Preset Seed Data
-- This is applied per-household during onboarding via Edge Function
-- or client-side. This file is for reference only.
-- ============================================================

-- NOTE: These are inserted relative to a household_id.
-- The actual seeding uses the constants/chore-presets.ts JSON.

-- For direct SQL testing, replace 'HOUSEHOLD_ID_HERE' with a real UUID.

/*
INSERT INTO public.chores (household_id, title, icon, category, points, requires_photo, requires_approval, is_invisible_labor, estimated_minutes) VALUES
-- 청소 (Cleaning)
('HOUSEHOLD_ID_HERE', '거실 청소', '🛋️', 'cleaning', 3, false, false, false, 20),
('HOUSEHOLD_ID_HERE', '화장실 청소', '🚽', 'cleaning', 5, false, false, false, 30),
('HOUSEHOLD_ID_HERE', '방 청소', '🛏️', 'cleaning', 3, false, false, false, 20),
('HOUSEHOLD_ID_HERE', '창문 닦기', '🪟', 'cleaning', 4, false, false, false, 25),
('HOUSEHOLD_ID_HERE', '바닥 청소기', '🧹', 'cleaning', 3, false, false, false, 15),
('HOUSEHOLD_ID_HERE', '걸레질', '🧽', 'cleaning', 2, false, false, false, 15),
('HOUSEHOLD_ID_HERE', '쓰레기 분리수거', '♻️', 'cleaning', 3, false, false, false, 10),
('HOUSEHOLD_ID_HERE', '쓰레기 버리기', '🗑️', 'cleaning', 2, false, false, false, 5),
-- 요리 (Cooking)
('HOUSEHOLD_ID_HERE', '밥 짓기', '🍚', 'cooking', 2, false, false, false, 30),
('HOUSEHOLD_ID_HERE', '아침 준비', '🌅', 'cooking', 5, false, false, false, 20),
('HOUSEHOLD_ID_HERE', '저녁 준비', '🍳', 'cooking', 7, false, false, false, 45),
('HOUSEHOLD_ID_HERE', '설거지', '🍽️', 'cooking', 3, false, false, false, 15),
('HOUSEHOLD_ID_HERE', '식기세척기 넣기/빼기', '🫙', 'cooking', 2, false, false, false, 10),
('HOUSEHOLD_ID_HERE', '장보기', '🛒', 'cooking', 5, false, false, false, 60),
('HOUSEHOLD_ID_HERE', '냉장고 정리', '🧊', 'cooking', 3, false, false, false, 20),
-- 세탁 (Laundry)
('HOUSEHOLD_ID_HERE', '세탁기 돌리기', '🫧', 'laundry', 2, false, false, false, 10),
('HOUSEHOLD_ID_HERE', '빨래 널기', '👕', 'laundry', 3, false, false, false, 15),
('HOUSEHOLD_ID_HERE', '빨래 개기', '🧺', 'laundry', 3, false, false, false, 20),
('HOUSEHOLD_ID_HERE', '빨래 정리', '👔', 'laundry', 2, false, false, false, 10),
-- 돌봄 (Care)
('HOUSEHOLD_ID_HERE', '반려동물 밥주기', '🐾', 'care', 2, false, false, false, 10),
('HOUSEHOLD_ID_HERE', '반려동물 산책', '🦮', 'care', 5, false, false, false, 30),
('HOUSEHOLD_ID_HERE', '아이 목욕시키기', '🛁', 'care', 5, false, false, false, 30),
('HOUSEHOLD_ID_HERE', '아이 숙제 도와주기', '📚', 'care', 4, false, false, false, 30),
-- 정신노동 (Invisible)
('HOUSEHOLD_ID_HERE', '병원 예약', '🏥', 'invisible', 5, false, false, true, 20),
('HOUSEHOLD_ID_HERE', '공과금 납부', '📋', 'invisible', 4, false, false, true, 15),
('HOUSEHOLD_ID_HERE', '준비물 챙기기', '🎒', 'invisible', 3, false, false, true, 15),
('HOUSEHOLD_ID_HERE', '집 수리 예약', '🔧', 'invisible', 5, false, false, true, 20),
('HOUSEHOLD_ID_HERE', '가족 일정 관리', '📅', 'invisible', 4, false, false, true, 20),
('HOUSEHOLD_ID_HERE', '선물 구매', '🎁', 'invisible', 4, false, false, true, 30);
*/
