import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/services/supabase';
import { useAuthStore } from '@/stores/authStore';
import { useHouseholdStore } from '@/stores/householdStore';
import type { HouseholdContext } from '@/types';
import type { HouseholdMemberWithUser } from '@/types/database';

export const HOUSEHOLD_KEYS = {
  all: ['household'] as const,
  current: () => [...HOUSEHOLD_KEYS.all, 'current'] as const,
  members: (householdId: string) => [...HOUSEHOLD_KEYS.all, 'members', householdId] as const,
};

export function useHousehold() {
  const userId = useAuthStore((s) => s.user?.id);
  const { setCurrent } = useHouseholdStore();

  return useQuery({
    queryKey: HOUSEHOLD_KEYS.current(),
    queryFn: async () => {
      if (!userId) return null;

      const { data: memberData, error } = await (supabase
        .from('household_members') as any)
        .select('household_id, role, households(*)')
        .eq('user_id', userId)
        .order('joined_at', { ascending: false })
        .limit(1)
        .single();

      if (error || !memberData) return null;

      const household = memberData.households as any;
      const context: HouseholdContext = {
        householdId: household.id,
        householdName: household.name,
        mode: household.mode,
        role: memberData.role,
        pointToCurrency: household.point_to_currency,
      };

      setCurrent(context);
      return context;
    },
    enabled: !!userId,
    staleTime: 5 * 60 * 1000,
  });
}

export function useHouseholdMembers(householdId?: string) {
  const { setMembers } = useHouseholdStore();

  return useQuery({
    queryKey: HOUSEHOLD_KEYS.members(householdId ?? ''),
    queryFn: async () => {
      if (!householdId) return [];

      const { data, error } = await (supabase
        .from('household_members') as any)
        .select('*, user:users(*)')
        .eq('household_id', householdId)
        .order('joined_at', { ascending: true });

      if (error) throw error;
      const members = (data ?? []) as unknown as HouseholdMemberWithUser[];
      setMembers(members);
      return members;
    },
    enabled: !!householdId,
    staleTime: 5 * 60 * 1000,
  });
}

export function useCreateHousehold() {
  const queryClient = useQueryClient();
  const userId = useAuthStore((s) => s.user?.id);

  return useMutation({
    mutationFn: async (input: {
      name: string;
      mode: 'couple' | 'family' | 'roommate';
      pointToCurrency?: number;
    }) => {
      if (!userId) throw new Error('Not authenticated');

      const { data: household, error: hError } = await (supabase
        .from('households') as any)
        .insert({
          name: input.name,
          mode: input.mode,
          point_to_currency: input.pointToCurrency ?? 100,
          created_by: userId,
        })
        .select()
        .single();

      if (hError) throw hError;

      const role = input.mode === 'family' ? 'parent' : input.mode === 'couple' ? 'partner' : 'roommate';
      const { error: mError } = await (supabase.from('household_members') as any).insert({
        household_id: household.id,
        user_id: userId,
        role,
      });

      if (mError) throw mError;
      return household;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: HOUSEHOLD_KEYS.all });
    },
  });
}

export function useJoinHousehold() {
  const queryClient = useQueryClient();
  const userId = useAuthStore((s) => s.user?.id);

  return useMutation({
    mutationFn: async (inviteCode: string) => {
      if (!userId) throw new Error('Not authenticated');

      const { data: household, error: hError } = await (supabase
        .from('households') as any)
        .select('*')
        .eq('invite_code', inviteCode.toUpperCase())
        .gt('invite_expires_at', new Date().toISOString())
        .single();

      if (hError || !household) {
        throw new Error('INVALID_CODE');
      }

      const role = household.mode === 'family' ? 'child' : household.mode === 'couple' ? 'partner' : 'roommate';
      const { error: mError } = await (supabase.from('household_members') as any).insert({
        household_id: household.id,
        user_id: userId,
        role,
      });

      if (mError) throw mError;
      return household;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: HOUSEHOLD_KEYS.all });
    },
  });
}
