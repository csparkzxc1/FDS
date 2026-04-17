import { supabase } from './supabase';
import { IS_DEV_BYPASS, MOCK_CHORES, MOCK_CHORE_LOGS, MOCK_USER } from '@/utils/devMode';

export interface ChoreRow {
  id: string;
  household_id: string;
  title: string;
  icon: string;
  category: string;
  points: number;
  requires_photo: boolean;
  requires_approval: boolean;
  is_invisible_labor: boolean;
  estimated_minutes: number | null;
  created_at: string;
  archived_at: string | null;
}

export interface ChoreLogRow {
  id: string;
  household_id: string;
  chore_id: string;
  performed_by: string;
  performed_at: string;
  points_awarded: number;
  photo_url: string | null;
  note: string | null;
  status: 'pending' | 'approved' | 'rejected';
  approved_by: string | null;
  approved_at: string | null;
  rejected_reason: string | null;
}

export interface CreateChoreInput {
  householdId: string;
  title: string;
  icon: string;
  category: string;
  points: number;
  requiresPhoto?: boolean;
  requiresApproval?: boolean;
  isInvisibleLabor?: boolean;
  estimatedMinutes?: number;
}

export async function getChores(householdId: string): Promise<ChoreRow[]> {
  if (IS_DEV_BYPASS) return MOCK_CHORES as ChoreRow[];

  const { data, error } = await (supabase.from('chores') as any)
    .select('*')
    .eq('household_id', householdId)
    .is('archived_at', null)
    .order('title');

  if (error) throw error;
  return (data ?? []) as ChoreRow[];
}

export async function getChoreById(choreId: string): Promise<ChoreRow | null> {
  if (IS_DEV_BYPASS) return (MOCK_CHORES.find((c) => c.id === choreId) as ChoreRow) ?? null;

  const { data, error } = await (supabase.from('chores') as any)
    .select('*')
    .eq('id', choreId)
    .is('archived_at', null)
    .single();

  if (error) throw error;
  return data as ChoreRow;
}

export async function createChores(chores: CreateChoreInput[]): Promise<ChoreRow[]> {
  if (IS_DEV_BYPASS) return [];

  const rows = chores.map((c) => ({
    household_id: c.householdId,
    title: c.title,
    icon: c.icon,
    category: c.category,
    points: c.points,
    requires_photo: c.requiresPhoto ?? false,
    requires_approval: c.requiresApproval ?? false,
    is_invisible_labor: c.isInvisibleLabor ?? false,
    estimated_minutes: c.estimatedMinutes ?? null,
  }));

  const { data, error } = await (supabase.from('chores') as any)
    .insert(rows)
    .select();

  if (error) throw error;
  return (data ?? []) as ChoreRow[];
}

export async function createChore(input: CreateChoreInput): Promise<ChoreRow> {
  const results = await createChores([input]);
  return results[0];
}

export async function updateChore(
  choreId: string,
  updates: Partial<Omit<CreateChoreInput, 'householdId'>>,
): Promise<void> {
  if (IS_DEV_BYPASS) return;

  const payload: Record<string, unknown> = {};
  if (updates.title !== undefined) payload.title = updates.title;
  if (updates.icon !== undefined) payload.icon = updates.icon;
  if (updates.category !== undefined) payload.category = updates.category;
  if (updates.points !== undefined) payload.points = updates.points;
  if (updates.requiresPhoto !== undefined) payload.requires_photo = updates.requiresPhoto;
  if (updates.requiresApproval !== undefined) payload.requires_approval = updates.requiresApproval;
  if (updates.isInvisibleLabor !== undefined) payload.is_invisible_labor = updates.isInvisibleLabor;
  if (updates.estimatedMinutes !== undefined) payload.estimated_minutes = updates.estimatedMinutes;

  const { error } = await (supabase.from('chores') as any).update(payload).eq('id', choreId);
  if (error) throw error;
}

export async function archiveChore(choreId: string): Promise<void> {
  if (IS_DEV_BYPASS) return;

  const { error } = await (supabase.from('chores') as any)
    .update({ archived_at: new Date().toISOString() })
    .eq('id', choreId);

  if (error) throw error;
}

export interface CreateChoreLogInput {
  householdId: string;
  choreId: string;
  performedBy: string;
  pointsAwarded: number;
  photoUrl?: string | null;
  note?: string | null;
  requiresApproval: boolean;
}

export async function createChoreLog(input: CreateChoreLogInput): Promise<ChoreLogRow> {
  if (IS_DEV_BYPASS) {
    return {
      id: `mock-log-${Date.now()}`,
      household_id: input.householdId,
      chore_id: input.choreId,
      performed_by: input.performedBy,
      performed_at: new Date().toISOString(),
      points_awarded: input.pointsAwarded,
      photo_url: input.photoUrl ?? null,
      note: input.note ?? null,
      status: input.requiresApproval ? 'pending' : 'approved',
      approved_by: null,
      approved_at: null,
      rejected_reason: null,
    };
  }

  const { data, error } = await (supabase.from('chore_logs') as any)
    .insert({
      household_id: input.householdId,
      chore_id: input.choreId,
      performed_by: input.performedBy,
      points_awarded: input.pointsAwarded,
      photo_url: input.photoUrl ?? null,
      note: input.note ?? null,
      status: input.requiresApproval ? 'pending' : 'approved',
    })
    .select()
    .single();

  if (error) throw error;
  return data as ChoreLogRow;
}

export async function getChoreLogsForHousehold(
  householdId: string,
  options?: { limit?: number; userId?: string },
): Promise<ChoreLogRow[]> {
  if (IS_DEV_BYPASS) return MOCK_CHORE_LOGS as ChoreLogRow[];

  let query = (supabase.from('chore_logs') as any)
    .select('*')
    .eq('household_id', householdId)
    .order('performed_at', { ascending: false });

  if (options?.userId) query = query.eq('performed_by', options.userId);
  if (options?.limit) query = query.limit(options.limit);

  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []) as ChoreLogRow[];
}

export async function getPendingApprovals(householdId: string): Promise<ChoreLogRow[]> {
  if (IS_DEV_BYPASS) return [];

  const { data, error } = await (supabase.from('chore_logs') as any)
    .select('*')
    .eq('household_id', householdId)
    .eq('status', 'pending')
    .order('performed_at', { ascending: false });

  if (error) throw error;
  return (data ?? []) as ChoreLogRow[];
}

export async function approveChoreLog(logId: string, approverId: string): Promise<void> {
  if (IS_DEV_BYPASS) return;

  const { error } = await (supabase.from('chore_logs') as any)
    .update({ status: 'approved', approved_by: approverId, approved_at: new Date().toISOString() })
    .eq('id', logId);

  if (error) throw error;
}

export async function getMyWeeklyPoints(
  householdId: string,
  userId: string,
): Promise<number> {
  if (IS_DEV_BYPASS) return 12;

  const now = new Date();
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() - now.getDay() + 1);
  weekStart.setHours(0, 0, 0, 0);

  const { data } = await (supabase.from('chore_logs') as any)
    .select('points_awarded')
    .eq('household_id', householdId)
    .eq('performed_by', userId)
    .eq('status', 'approved')
    .gte('performed_at', weekStart.toISOString());

  return ((data ?? []) as any[]).reduce((sum: number, r: any) => sum + r.points_awarded, 0);
}

export async function rejectChoreLog(logId: string, reason?: string): Promise<void> {
  if (IS_DEV_BYPASS) return;

  const { error } = await (supabase.from('chore_logs') as any)
    .update({ status: 'rejected', rejected_reason: reason ?? null })
    .eq('id', logId);

  if (error) throw error;
}
