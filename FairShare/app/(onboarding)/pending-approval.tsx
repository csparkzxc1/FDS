import React, { useEffect } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '@/components/ui';
import { supabase } from '@/services/supabase';
import { IS_DEV_BYPASS } from '@/utils/devMode';
import { useAuthStore } from '@/stores/authStore';
import { useHouseholdStore } from '@/stores/householdStore';
import { signOut } from '@/hooks/useAuth';

export default function PendingApprovalScreen() {
  const user = useAuthStore((s) => s.user);
  const household = useHouseholdStore((s) => s.current);

  useEffect(() => {
    if (IS_DEV_BYPASS || !user || !household) return;

    // Subscribe to realtime changes on household_members for this user
    const channel = supabase
      .channel('pending-approval')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'household_members',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          const newRow = payload.new as { status: string };
          if (newRow.status === 'active') {
            router.replace('/(tabs)/home');
          }
        },
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'household_members',
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          // Rejected
          router.replace('/(onboarding)/welcome');
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, household]);

  const handleCancel = async () => {
    await signOut();
    router.replace('/(auth)/sign-in');
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-1 items-center justify-center px-8">
        <Text className="text-6xl mb-6">⏳</Text>

        <Text className="text-2xl font-bold text-gray-900 text-center mb-3">
          승인을 기다리고 있어요
        </Text>

        <Text className="text-gray-500 text-center mb-8 leading-relaxed">
          가구 관리자가 참여 요청을 확인하는 중이에요.{'\n'}
          승인되면 자동으로 이동됩니다.
        </Text>

        <View className="bg-primary-50 rounded-2xl p-4 mb-8 w-full">
          <Text className="text-primary-700 text-sm text-center">
            앱을 닫아도 알림으로 알려드려요
          </Text>
        </View>

        <ActivityIndicator size="large" color="#5B8DEF" className="mb-8" />

        {IS_DEV_BYPASS && (
          <Button
            variant="primary"
            size="lg"
            fullWidth
            className="mb-3"
            onPress={() => router.replace('/(tabs)/home')}
          >
            🛠 DEV: 승인됨으로 이동
          </Button>
        )}

        <Button variant="ghost" size="sm" onPress={handleCancel}>
          취소하고 로그아웃
        </Button>
      </View>
    </SafeAreaView>
  );
}
