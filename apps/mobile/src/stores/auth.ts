import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { AuthTokens } from '@multicheck/shared';

interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  activeOrgId: string | null;
  setTokens: (tokens: AuthTokens) => void;
  setActiveOrg: (orgId: string | null) => void;
  clear: () => void;
}

export const useAuth = create<AuthState>()(
  persist(
    (set) => ({
      accessToken: null,
      refreshToken: null,
      activeOrgId: null,
      setTokens: (tokens) =>
        set({ accessToken: tokens.accessToken, refreshToken: tokens.refreshToken }),
      setActiveOrg: (orgId) => set({ activeOrgId: orgId }),
      clear: () => set({ accessToken: null, refreshToken: null, activeOrgId: null }),
    }),
    {
      name: 'multicheck.auth',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
