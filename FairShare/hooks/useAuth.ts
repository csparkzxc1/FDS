import { useEffect } from 'react';
import { supabase } from '@/services/supabase';
import { useAuthStore } from '@/stores/authStore';
import { useHouseholdStore } from '@/stores/householdStore';
import type { AuthUser } from '@/types';

function sessionToAuthUser(session: import('@supabase/supabase-js').Session): AuthUser {
  return {
    id: session.user.id,
    email: session.user.email ?? null,
    displayName:
      session.user.user_metadata?.display_name ??
      session.user.email?.split('@')[0] ??
      '사용자',
    avatarUrl: session.user.user_metadata?.avatar_url ?? null,
  };
}

export function useAuthListener() {
  const { setSession, setUser, setInitialized } = useAuthStore();
  const clearHousehold = useHouseholdStore((s) => s.clear);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session ? sessionToAuthUser(session) : null);
      setInitialized(true);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session ? sessionToAuthUser(session) : null);
      if (!session) {
        clearHousehold();
      }
    });

    return () => subscription.unsubscribe();
  }, []);
}

export function useAuth() {
  const { session, user, isLoading, isInitialized } = useAuthStore();
  return { session, user, isLoading, isInitialized, isAuthenticated: !!session };
}

export async function signInWithEmail(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
}

export async function signUpWithEmail(
  email: string,
  password: string,
  displayName: string
) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { display_name: displayName },
    },
  });
  if (error) throw error;
  return data;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function resetPassword(email: string) {
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: 'fairshare://reset-password',
  });
  if (error) throw error;
}
