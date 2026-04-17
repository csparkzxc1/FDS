'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { AuthTokens } from '@multicheck/shared';

interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  setTokens: (tokens: AuthTokens) => void;
  clear: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      accessToken: null,
      refreshToken: null,
      setTokens: (tokens) =>
        set({ accessToken: tokens.accessToken, refreshToken: tokens.refreshToken }),
      clear: () => set({ accessToken: null, refreshToken: null }),
    }),
    {
      name: 'multicheck.auth',
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
