import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getRewardGoals,
  createRewardGoal,
  updateRewardGoal,
  deleteRewardGoal,
  markGoalAchieved,
  type CreateRewardGoalInput,
} from '@/services/rewardGoalService';

export function useRewardGoals(householdId?: string, childId?: string) {
  return useQuery({
    queryKey: ['rewardGoals', householdId, childId],
    queryFn: () => getRewardGoals(householdId!, childId!),
    enabled: !!householdId && !!childId,
    staleTime: 60 * 1000,
  });
}

export function useCreateRewardGoal() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateRewardGoalInput) => createRewardGoal(input),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['rewardGoals'] }),
  });
}

export function useUpdateRewardGoal() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      goalId,
      updates,
    }: {
      goalId: string;
      updates: Parameters<typeof updateRewardGoal>[1];
    }) => updateRewardGoal(goalId, updates),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['rewardGoals'] }),
  });
}

export function useDeleteRewardGoal() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (goalId: string) => deleteRewardGoal(goalId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['rewardGoals'] }),
  });
}

export function useMarkGoalAchieved() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (goalId: string) => markGoalAchieved(goalId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['rewardGoals'] }),
  });
}
