import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getChores,
  createChores,
  createChore,
  updateChore,
  archiveChore,
  createChoreLog,
  getChoreLogsForHousehold,
  getPendingApprovals,
  approveChoreLog,
  rejectChoreLog,
  getMyWeeklyPoints,
  type CreateChoreInput,
  type CreateChoreLogInput,
} from '@/services/choreService';

export function useChores(householdId: string | undefined) {
  return useQuery({
    queryKey: ['chores', householdId],
    queryFn: () => getChores(householdId!),
    enabled: !!householdId,
    staleTime: 5 * 60 * 1000,
  });
}

export function useCreateChore() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateChoreInput) => createChore(input),
    onSuccess: (_data, vars) => {
      queryClient.invalidateQueries({ queryKey: ['chores', vars.householdId] });
    },
  });
}

export function useCreateChores() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (chores: CreateChoreInput[]) => createChores(chores),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['chores'] }),
  });
}

export function useUpdateChore() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ choreId, updates }: { choreId: string; updates: Partial<Omit<CreateChoreInput, 'householdId'>> }) =>
      updateChore(choreId, updates),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['chores'] }),
  });
}

export function useArchiveChore() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (choreId: string) => archiveChore(choreId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['chores'] }),
  });
}

export function useChoreLogs(householdId: string | undefined, options?: { limit?: number; userId?: string }) {
  return useQuery({
    queryKey: ['choreLogs', householdId, options],
    queryFn: () => getChoreLogsForHousehold(householdId!, options),
    enabled: !!householdId,
    staleTime: 60 * 1000,
  });
}

export function usePendingApprovals(householdId: string | undefined) {
  return useQuery({
    queryKey: ['pendingApprovals', householdId],
    queryFn: () => getPendingApprovals(householdId!),
    enabled: !!householdId,
    staleTime: 30 * 1000,
  });
}

export function useCreateChoreLog() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateChoreLogInput) => createChoreLog(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['choreLogs'] });
      queryClient.invalidateQueries({ queryKey: ['pendingApprovals'] });
    },
  });
}

export function useApproveChoreLog() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ logId, approverId }: { logId: string; approverId: string }) =>
      approveChoreLog(logId, approverId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['choreLogs'] });
      queryClient.invalidateQueries({ queryKey: ['pendingApprovals'] });
    },
  });
}

export function useMyWeeklyPoints(householdId: string | undefined, userId: string | undefined) {
  return useQuery({
    queryKey: ['myWeeklyPoints', householdId, userId],
    queryFn: () => getMyWeeklyPoints(householdId!, userId!),
    enabled: !!householdId && !!userId,
    staleTime: 60 * 1000,
  });
}

export function useRejectChoreLog() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ logId, reason }: { logId: string; reason?: string }) =>
      rejectChoreLog(logId, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['choreLogs'] });
      queryClient.invalidateQueries({ queryKey: ['pendingApprovals'] });
    },
  });
}
