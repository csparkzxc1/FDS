import { useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { supabase } from '@/services/supabase';
import { useAuthStore } from '@/stores/authStore';
import type { AuthUser } from '@/types';

// Deep-link fallback for fairshare://auth/callback?code=...
// Normally openAuthSessionAsync intercepts the redirect before the app navigates here.
// This screen handles the rare case where the OS launches the app cold via the deep link.
export default function AuthCallbackScreen() {
  const params = useLocalSearchParams<{ code?: string }>();
  const setUser = useAuthStore((s) => s.setUser);

  useEffect(() => {
    const code = params.code;
    if (!code) {
      router.replace('/(auth)/sign-in');
      return;
    }

    (supabase.auth as any)
      .exchangeCodeForSession(`fairshare://auth/callback?code=${code}`)
      .then(({ data, error }: any) => {
        if (error || !data?.user) {
          router.replace('/(auth)/sign-in');
          return;
        }
        const u = data.user;
        const authUser: AuthUser = {
          id: u.id,
          email: u.email ?? '',
          displayName: u.user_metadata?.full_name ?? u.user_metadata?.name ?? null,
          avatarUrl: u.user_metadata?.avatar_url ?? null,
        };
        setUser(authUser);
        router.replace('/');
      });
  }, []);

  return (
    <View className="flex-1 items-center justify-center bg-white">
      <ActivityIndicator size="large" color="#5B8DEF" />
    </View>
  );
}
