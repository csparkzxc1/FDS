// Re-exports for backwards compatibility — use hooks/queries/useHousehold for new code
export {
  useMyHousehold as useHousehold,
  useHouseholdMembers,
  useCreateHousehold,
  useJoinHousehold,
  usePendingMembers,
  useApproveMember,
  useRejectMember,
  useRefreshInviteCode,
} from './queries/useHousehold';
