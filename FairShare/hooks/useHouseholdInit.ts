import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/services/supabase';
import { IS_DEV_BYPASS, MOCK_MEMBERS } from '@/utils/devMode';
import { useAuthStore } from '@/stores/authStore';
import { useHouseholdStore } from '@/stores/householdStore';
import { useMyHousehold, useHouseholdMembers } from './queries/useHousehold';
import { usePendingApprovals } from './queries/useChores';

export function useHouseholdInit() {
  const user = useAuthStore((s) => s.user);
  const household = useHouseholdStore((s) => s.current);
  const setMembers = useHouseholdStore((s) => s.setMembers);
  const setPendingApprovalCount = useHouseholdStore((s) => s.setPendingApprovalCount);
  const queryClient = useQueryClient();

  useMyHousehold(user?.id);

  const { data: members = [] } = useHouseholdMembers(household?.householdId);
  const { data: pendingApprovals = [] } = usePendingApprovals(household?.householdId);

  useEffect(() => {
    if (IS_DEV_BYPASS) {
      setMembers(MOCK_MEMBERS as any);
    } else {
      setMembers(members as any);
    }
  }, [members, setMembers]);

  useEffect(() => {
    setPendingApprovalCount(IS_DEV_BYPASS ? 0 : pendingApprovals.length);
  }, [pendingApprovals, setPendingApprovalCount]);

  // Realtime subscription: invalidate chore-related queries on changes
  useEffect(() => {
    const householdId = household?.householdId;
    if (!householdId || IS_DEV_BYPASS) return;

    const channel = supabase
      .channel(`household-${householdId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'chore_logs',
          filter: `household_id=eq.${householdId}`,
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['pendingApprovals', householdId] });
          queryClient.invalidateQueries({ queryKey: ['choreLogs', householdId] });
          queryClient.invalidateQueries({ queryKey: ['myWeeklyPoints', householdId] });
        },
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'household_members',
          filter: `household_id=eq.${householdId}`,
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['householdMembers', householdId] });
          queryClient.invalidateQueries({ queryKey: ['pendingMembers', householdId] });
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [household?.householdId, queryClient]);
}
