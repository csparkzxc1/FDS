import { supabase } from './supabase';
import { IS_DEV_BYPASS } from '@/utils/devMode';

export interface Settlement {
  id: string;
  household_id: string;
  child_id: string;
  period_start: string;
  period_end: string;
  total_points: number;
  total_amount: number;
  carryover: boolean;
  paid_at: string | null;
  paid_by: string | null;
  note: string | null;
  created_at: string;
}

// Returns points earned since the most recent settlement (or all time if none).
// This is the correct basis for settlement: no double-counting across periods.
export async function getUnsettledPoints(
  householdId: string,
  childId: string,
): Promise<number> {
  if (IS_DEV_BYPASS) return 42;

  // Find the last settlement timestamp for this child
  const { data: last } = await (supabase.from('allowance_settlements') as any)
    .select('created_at')
    .eq('household_id', householdId)
    .eq('child_id', childId)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  const since: string = last?.created_at ?? new Date(0).toISOString();

  const { data } = await (supabase.from('chore_logs') as any)
    .select('points_awarded')
    .eq('household_id', householdId)
    .eq('performed_by', childId)
    .eq('status', 'approved')
    .gt('performed_at', since);

  return ((data ?? []) as any[]).reduce((sum: number, r: any) => sum + r.points_awarded, 0);
}

export async function settleAllowance(
  householdId: string,
  childId: string,
  paidBy: string,
  totalPoints: number,
  totalAmount: number,
  carryover: boolean,
): Promise<void> {
  if (IS_DEV_BYPASS) return;

  const now = new Date();
  const { error } = await (supabase.from('allowance_settlements') as any).insert({
    household_id: householdId,
    child_id: childId,
    period_start: now.toISOString().slice(0, 10),
    period_end: now.toISOString().slice(0, 10),
    total_points: totalPoints,
    total_amount: totalAmount,
    paid_at: now.toISOString(),
    paid_by: paidBy,
    carryover,
    note: carryover ? '포인트 이월' : '포인트 초기화',
  });

  if (error) throw error;
}

export async function getSettlements(
  householdId: string,
  childId?: string,
): Promise<Settlement[]> {
  if (IS_DEV_BYPASS) return [];

  let query = (supabase.from('allowance_settlements') as any)
    .select('*')
    .eq('household_id', householdId)
    .order('created_at', { ascending: false })
    .limit(20);

  if (childId) query = query.eq('child_id', childId);

  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []) as Settlement[];
}
