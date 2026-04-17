export * from './database';

// ── App State Types ──────────────────────────────────────

export interface AuthUser {
  id: string;
  email: string | null;
  displayName: string | null;
  avatarUrl: string | null;
}

export interface HouseholdContext {
  householdId: string;
  name: string;
  mode: import('./database').HouseholdMode;
  inviteCode: string;
  pointToCurrency: number;
  memberStatus: 'pending' | 'active';
}

// ── API Result Pattern ──────────────────────────────────────

export type Result<T, E = Error> =
  | { ok: true; data: T }
  | { ok: false; error: E };

export function ok<T>(data: T): Result<T> {
  return { ok: true, data };
}

export function err<E = Error>(error: E): Result<never, E> {
  return { ok: false, error };
}

// ── Navigation Types ──────────────────────────────────────

export type RootStackParamList = {
  '(auth)/sign-in': undefined;
  '(auth)/sign-up': undefined;
  '(auth)/reset-password': undefined;
  '(onboarding)/welcome': undefined;
  '(onboarding)/household-choice': undefined;
  '(onboarding)/create-household': undefined;
  '(onboarding)/setup-chores': undefined;
  '(tabs)/home': undefined;
  '(tabs)/activity': undefined;
  '(tabs)/dashboard': undefined;
  '(tabs)/settings': undefined;
  'modals/chore-detail': { choreId: string };
  'modals/approval-queue': undefined;
  'modals/add-chore': { choreId?: string };
  'modals/settle-allowance': { childId: string };
  'modals/reward-goal': { goalId?: string };
};

// ── UI Component Types ──────────────────────────────────────

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'kid';
export type ButtonSize = 'sm' | 'md' | 'lg';

export type InputVariant = 'default' | 'filled' | 'outlined';

export type BadgeVariant = 'default' | 'success' | 'warning' | 'danger' | 'info' | 'invisible';

// ── Chore Types ──────────────────────────────────────

export interface ChoreCheckPayload {
  choreId: string;
  photoUri?: string;
  note?: string;
}

export interface FairnessData {
  userId: string;
  displayName: string;
  avatarUrl: string | null;
  totalPoints: number;
  percentage: number;
}

export interface WeeklyStats {
  startDate: string;
  endDate: string;
  memberStats: FairnessData[];
  totalPoints: number;
  fairnessIndex: number; // 0-100, 100 = perfectly fair
  categoryBreakdown: Record<string, number>;
  invisibleLaborPercentage: number;
}
