import { useAuthStore } from '@/stores/authStore';
import { useHouseholdStore } from '@/stores/householdStore';
import * as authService from '@/services/authService';

export { useSession } from './useSession';

export function useAuth() {
  const { user, isLoading, isInitialized } = useAuthStore();
  return {
    user,
    isLoading,
    isInitialized,
    isAuthenticated: !!user,
  };
}

export async function signInWithEmail(email: string, password: string) {
  return authService.signInWithEmail(email, password);
}

export async function signUpWithEmail(email: string, password: string, displayName: string) {
  return authService.signUpWithEmail(email, password, displayName);
}

export async function signInWithApple() {
  return authService.signInWithApple();
}

export async function signInWithKakao() {
  return authService.signInWithKakao();
}

export async function signOut() {
  useHouseholdStore.getState().clear();
  useAuthStore.getState().clear();
  return authService.signOut();
}

export async function resetPassword(email: string) {
  return authService.resetPassword(email);
}
