import { supabase } from './supabase';
import { IS_DEV_BYPASS, MOCK_HOUSEHOLD, MOCK_USER } from '@/utils/devMode';

export interface RewardGoal {
  id: string;
  child_id: string;
  household_id: string;
  title: string;
  target_points: number;
  image_url: string | null;
  achieved_at: string | null;
  created_at: string;
}

export interface CreateRewardGoalInput {
  childId: string;
  householdId: string;
  title: string;
  targetPoints: number;
  imageUrl?: string | null;
}

const MOCK_GOALS: RewardGoal[] = [
  {
    id: 'mock-goal-001',
    child_id: MOCK_USER.id,
    household_id: MOCK_HOUSEHOLD.id,
    title: '닌텐도 스위치',
    target_points: 500,
    image_url: null,
    achieved_at: null,
    created_at: new Date().toISOString(),
  },
];

export async function getRewardGoals(
  householdId: string,
  childId: string,
): Promise<RewardGoal[]> {
  if (IS_DEV_BYPASS) return MOCK_GOALS;

  const { data, error } = await (supabase.from('reward_goals') as any)
    .select('*')
    .eq('household_id', householdId)
    .eq('child_id', childId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data ?? []) as RewardGoal[];
}

export async function createRewardGoal(input: CreateRewardGoalInput): Promise<RewardGoal> {
  if (IS_DEV_BYPASS)
    return { ...MOCK_GOALS[0], id: `mock-goal-${Date.now()}`, title: input.title, target_points: input.targetPoints };

  const { data, error } = await (supabase.from('reward_goals') as any)
    .insert({
      child_id: input.childId,
      household_id: input.householdId,
      title: input.title,
      target_points: input.targetPoints,
      image_url: input.imageUrl ?? null,
    })
    .select()
    .single();

  if (error) throw error;
  return data as RewardGoal;
}

export async function updateRewardGoal(
  goalId: string,
  updates: Partial<Pick<CreateRewardGoalInput, 'title' | 'targetPoints' | 'imageUrl'>>,
): Promise<void> {
  if (IS_DEV_BYPASS) return;

  const payload: Record<string, unknown> = {};
  if (updates.title !== undefined) payload.title = updates.title;
  if (updates.targetPoints !== undefined) payload.target_points = updates.targetPoints;
  if (updates.imageUrl !== undefined) payload.image_url = updates.imageUrl;

  const { error } = await (supabase.from('reward_goals') as any)
    .update(payload)
    .eq('id', goalId);

  if (error) throw error;
}

export async function deleteRewardGoal(goalId: string): Promise<void> {
  if (IS_DEV_BYPASS) return;

  const { error } = await (supabase.from('reward_goals') as any)
    .delete()
    .eq('id', goalId);

  if (error) throw error;
}

export async function markGoalAchieved(goalId: string): Promise<void> {
  if (IS_DEV_BYPASS) return;

  const { error } = await (supabase.from('reward_goals') as any)
    .update({ achieved_at: new Date().toISOString() })
    .eq('id', goalId);

  if (error) throw error;
}
