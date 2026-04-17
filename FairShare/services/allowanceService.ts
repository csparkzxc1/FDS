import { supabase } from './supabase';
import { IS_DEV_BYPASS, MOCK_USER, MOCK_HOUSEHOLD } from '@/utils/devMode';
import { getWeekRange } from '@/utils/date';

export interface Settlement {
  id: string;
  household_id: string;
  child_id: string;
  period_start: string;
  period_end: string;
  total_points: number;
  total_amount: number;
  paid_at: string | null;
  paid_by: string | null;
  note: string | null;
  created_at: string;
}

export async function getChildWeeklyPoints(
  householdId: string,
  childId: string,
): Promise<number> {
  if (IS_DEV_BYPASS) return 42;

  const { start, end } = getWeekRange();
  const { data } = await (supabase.from('chore_logs') as any)
    .select('points_awarded')
    .eq('household_id', householdId)
    .eq('performed_by', childId)
    .eq('status', 'approved')
    .gte('performed_at', start.toISOString())
    .lte('performed_at', end.toISOString());

  return ((data ?? []) as any[]).reduce((sum: number, r: any) => sum + r.points_awarded, 0);
}

export async function settleAllowance(
  householdId: string,
  childId: string,
  paidBy: string,
  weeklyPoints: number,
  totalAmount: number,
): Promise<void> {
  if (IS_DEV_BYPASS) return;

  const { start, end } = getWeekRange();

  const { error } = await (supabase.from('allowance_settlements') as any).insert({
    household_id: householdId,
    child_id: childId,
    period_start: start.toISOString().slice(0, 10),
    period_end: end.toISOString().slice(0, 10),
    total_points: weeklyPoints,
    total_amount: totalAmount,
    paid_at: new Date().toISOString(),
    paid_by: paidBy,
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
