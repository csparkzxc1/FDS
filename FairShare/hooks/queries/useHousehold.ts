import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  createHousehold,
  getMyHousehold,
  getMembers,
  getPendingMembers,
  approveMember,
  rejectMember,
  joinHousehold,
  getHouseholdByInviteCode,
  refreshInviteCode,
  type CreateHouseholdInput,
} from '@/services/householdService';
import { useHouseholdStore } from '@/stores/householdStore';
import type { MemberRole } from '@/types/database';

export function useMyHousehold(userId: string | undefined) {
  const setHousehold = useHouseholdStore((s) => s.setHousehold);

  return useQuery({
    queryKey: ['myHousehold', userId],
    queryFn: async () => {
      const result = await getMyHousehold(userId!);
      if (result) {
        setHousehold({
          householdId: result.household.id,
          name: result.household.name,
          mode: result.household.mode,
          inviteCode: result.household.invite_code,
          pointToCurrency: result.household.point_to_currency,
          memberStatus: result.memberStatus,
        });
      }
      return result;
    },
    enabled: !!userId,
    staleTime: 5 * 60 * 1000,
  });
}

export function useHouseholdMembers(householdId: string | undefined) {
  return useQuery({
    queryKey: ['householdMembers', householdId],
    queryFn: () => getMembers(householdId!),
    enabled: !!householdId,
    staleTime: 2 * 60 * 1000,
  });
}

export function usePendingMembers(householdId: string | undefined) {
  return useQuery({
    queryKey: ['pendingMembers', householdId],
    queryFn: () => getPendingMembers(householdId!),
    enabled: !!householdId,
    staleTime: 30 * 1000,
  });
}

export function useHouseholdByInviteCode(inviteCode: string) {
  return useQuery({
    queryKey: ['householdByCode', inviteCode],
    queryFn: () => getHouseholdByInviteCode(inviteCode),
    enabled: inviteCode.length === 6,
    staleTime: 30 * 1000,
  });
}

export function useCreateHousehold() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateHouseholdInput) => createHousehold(input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['myHousehold'] }),
  });
}

export function useJoinHousehold() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ inviteCode, userId }: { inviteCode: string; userId: string }) =>
      joinHousehold(inviteCode, userId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['myHousehold'] }),
  });
}

export function useApproveMember() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ memberId, role }: { memberId: string; role: MemberRole }) =>
      approveMember(memberId, role),
    onSuccess: (_data, vars) => {
      queryClient.invalidateQueries({ queryKey: ['pendingMembers'] });
      queryClient.invalidateQueries({ queryKey: ['householdMembers'] });
    },
  });
}

export function useRejectMember() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (memberId: string) => rejectMember(memberId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pendingMembers'] });
    },
  });
}

export function useRefreshInviteCode() {
  const queryClient = useQueryClient();
  const setHousehold = useHouseholdStore((s) => s.setHousehold);
  const household = useHouseholdStore((s) => s.current);

  return useMutation({
    mutationFn: (householdId: string) => refreshInviteCode(householdId),
    onSuccess: (newCode) => {
      if (household) {
        setHousehold({ ...household, inviteCode: newCode });
      }
      queryClient.invalidateQueries({ queryKey: ['myHousehold'] });
    },
  });
}
