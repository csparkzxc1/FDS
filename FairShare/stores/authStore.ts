import { create } from 'zustand';
import type { Session, User } from '@supabase/supabase-js';
import type { AuthUser } from '@/types';

interface AuthState {
  session: Session | null;
  user: AuthUser | null;
  isLoading: boolean;
  isInitialized: boolean;

  setSession: (session: Session | null) => void;
  setUser: (user: AuthUser | null) => void;
  setLoading: (loading: boolean) => void;
  setInitialized: (initialized: boolean) => void;
  clear: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  session: null,
  user: null,
  isLoading: false,
  isInitialized: false,

  setSession: (session) => set({ session }),
  setUser: (user) => set({ user }),
  setLoading: (isLoading) => set({ isLoading }),
  setInitialized: (isInitialized) => set({ isInitialized }),
  clear: () => set({ session: null, user: null }),
}));
