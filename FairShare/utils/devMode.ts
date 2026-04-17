/**
 * Dev mode bypass
 * __DEV__ 환경에서 Supabase 미연결 시 Mock 데이터로 앱 UI/로직 검증
 * 프로덕션 빌드에는 절대 포함되지 않음 (double guard: __DEV__ + env var 없음)
 */

const HAS_SUPABASE = !!(
  process.env.EXPO_PUBLIC_SUPABASE_URL &&
  process.env.EXPO_PUBLIC_SUPABASE_URL !== 'https://placeholder.supabase.co'
);

const DEV_SKIP_AUTH = process.env.EXPO_PUBLIC_DEV_SKIP_AUTH === 'true';
export const IS_DEV_BYPASS = __DEV__ && (!HAS_SUPABASE || DEV_SKIP_AUTH);

// ── Mock fixtures ──────────────────────────────────────────────────────────

export const MOCK_USER = {
  id: 'mock-user-001',
  email: 'dev@fairshare.app',
  display_name: '개발자',
  avatar_url: null,
  created_at: new Date().toISOString(),
};

export const MOCK_PARTNER = {
  id: 'mock-user-002',
  email: 'partner@fairshare.app',
  display_name: '파트너',
  avatar_url: null,
  created_at: new Date().toISOString(),
};

export const MOCK_HOUSEHOLD = {
  id: 'mock-household-001',
  name: '우리집 (DEV)',
  mode: 'couple' as const,
  invite_code: 'ABC123',
  invite_expires_at: new Date(Date.now() + 7 * 86400 * 1000).toISOString(),
  point_to_currency: 100,
  created_by: MOCK_USER.id,
  created_at: new Date().toISOString(),
};

export const MOCK_MEMBERS = [
  {
    id: 'mock-member-001',
    household_id: MOCK_HOUSEHOLD.id,
    user_id: MOCK_USER.id,
    role: 'partner' as const,
    nickname: null,
    birth_year: null,
    joined_at: new Date().toISOString(),
    status: 'active' as const,
    user: MOCK_USER,
  },
  {
    id: 'mock-member-002',
    household_id: MOCK_HOUSEHOLD.id,
    user_id: MOCK_PARTNER.id,
    role: 'partner' as const,
    nickname: null,
    birth_year: null,
    joined_at: new Date().toISOString(),
    status: 'active' as const,
    user: MOCK_PARTNER,
  },
];

export const MOCK_CHORES = [
  {
    id: 'mock-chore-001',
    household_id: MOCK_HOUSEHOLD.id,
    title: '설거지',
    icon: '🍽️',
    category: 'cooking',
    points: 3,
    requires_photo: false,
    requires_approval: false,
    is_invisible_labor: false,
    estimated_minutes: 15,
    created_at: new Date().toISOString(),
    archived_at: null,
  },
  {
    id: 'mock-chore-002',
    household_id: MOCK_HOUSEHOLD.id,
    title: '청소기 돌리기',
    icon: '🧹',
    category: 'cleaning',
    points: 3,
    requires_photo: false,
    requires_approval: false,
    is_invisible_labor: false,
    estimated_minutes: 15,
    created_at: new Date().toISOString(),
    archived_at: null,
  },
  {
    id: 'mock-chore-003',
    household_id: MOCK_HOUSEHOLD.id,
    title: '빨래 개기',
    icon: '🧺',
    category: 'laundry',
    points: 3,
    requires_photo: false,
    requires_approval: false,
    is_invisible_labor: false,
    estimated_minutes: 20,
    created_at: new Date().toISOString(),
    archived_at: null,
  },
  {
    id: 'mock-chore-004',
    household_id: MOCK_HOUSEHOLD.id,
    title: '병원 예약',
    icon: '🏥',
    category: 'invisible',
    points: 5,
    requires_photo: false,
    requires_approval: false,
    is_invisible_labor: true,
    estimated_minutes: 20,
    created_at: new Date().toISOString(),
    archived_at: null,
  },
  {
    id: 'mock-chore-005',
    household_id: MOCK_HOUSEHOLD.id,
    title: '저녁 준비',
    icon: '🍳',
    category: 'cooking',
    points: 7,
    requires_photo: true,
    requires_approval: false,
    is_invisible_labor: false,
    estimated_minutes: 45,
    created_at: new Date().toISOString(),
    archived_at: null,
  },
];

export const MOCK_CHORE_LOGS = [
  {
    id: 'mock-log-001',
    household_id: MOCK_HOUSEHOLD.id,
    chore_id: 'mock-chore-001',
    performed_by: MOCK_USER.id,
    performed_at: new Date(Date.now() - 3600 * 1000).toISOString(),
    points_awarded: 3,
    photo_url: null,
    note: null,
    status: 'approved',
    approved_by: null,
    approved_at: null,
    rejected_reason: null,
  },
  {
    id: 'mock-log-002',
    household_id: MOCK_HOUSEHOLD.id,
    chore_id: 'mock-chore-002',
    performed_by: MOCK_PARTNER.id,
    performed_at: new Date(Date.now() - 7200 * 1000).toISOString(),
    points_awarded: 3,
    photo_url: null,
    note: null,
    status: 'approved',
    approved_by: null,
    approved_at: null,
    rejected_reason: null,
  },
];

export const MOCK_NOTIFICATION_SETTINGS = {
  user_id: MOCK_USER.id,
  daily_reminder: true,
  daily_reminder_time: '20:00',
  weekly_report: true,
  approval_requests: true,
  imbalance_warning: true,
  push_token: null,
  updated_at: new Date().toISOString(),
};
