import { useEffect } from 'react';
import { supabase } from '@/services/supabase';
import { IS_DEV_BYPASS, MOCK_USER } from '@/utils/devMode';
import { useAuthStore } from '@/stores/authStore';
import type { AuthUser } from '@/types';

function mockAuthUser(): AuthUser {
  return {
    id: MOCK_USER.id,
    email: MOCK_USER.email,
    displayName: MOCK_USER.display_name,
    avatarUrl: null,
  };
}

export function useSession() {
  const setUser = useAuthStore((s) => s.setUser);
  const setLoading = useAuthStore((s) => s.setLoading);
  const setInitialized = useAuthStore((s) => s.setInitialized);

  useEffect(() => {
    if (IS_DEV_BYPASS) {
      setUser(mockAuthUser());
      setLoading(false);
      setInitialized(true);
      return;
    }

    supabase.auth.getSession().then(({ data }) => {
      if (data.session?.user) {
        const u = data.session.user;
        setUser({
          id: u.id,
          email: u.email ?? '',
          displayName: u.user_metadata?.display_name ?? null,
          avatarUrl: u.user_metadata?.avatar_url ?? null,
        });
      }
      setLoading(false);
      setInitialized(true);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        const u = session.user;
        setUser({
          id: u.id,
          email: u.email ?? '',
          displayName: u.user_metadata?.display_name ?? null,
          avatarUrl: u.user_metadata?.avatar_url ?? null,
        });
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => listener.subscription.unsubscribe();
  }, [setUser, setLoading]);
}
