import { create } from 'zustand';
import type { HouseholdContext } from '@/types';
import type { HouseholdMemberWithUser } from '@/types/database';

interface HouseholdState {
  current: HouseholdContext | null;
  members: HouseholdMemberWithUser[];
  pendingApprovalCount: number;

  setCurrent: (household: HouseholdContext | null) => void;
  setMembers: (members: HouseholdMemberWithUser[]) => void;
  setPendingApprovalCount: (count: number) => void;
  clear: () => void;
}

export const useHouseholdStore = create<HouseholdState>((set) => ({
  current: null,
  members: [],
  pendingApprovalCount: 0,

  setCurrent: (current) => set({ current }),
  setMembers: (members) => set({ members }),
  setPendingApprovalCount: (pendingApprovalCount) => set({ pendingApprovalCount }),
  clear: () => set({ current: null, members: [], pendingApprovalCount: 0 }),
}));
