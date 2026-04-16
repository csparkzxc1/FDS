import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  Switch,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/stores/authStore';
import { useHouseholdStore } from '@/stores/householdStore';
import { supabase } from '@/services/supabase';
import { Avatar, Card, Divider, LoadingSpinner } from '@/components/ui';
import { signOut } from '@/hooks/useAuth';
import { Colors } from '@/constants/design-tokens';

function SettingsRow({
  icon,
  label,
  value,
  onPress,
  showArrow = true,
}: {
  icon: string;
  label: string;
  value?: string;
  onPress?: () => void;
  showArrow?: boolean;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={onPress ? 0.7 : 1}
      className="flex-row items-center px-4 py-3"
    >
      <Text className="text-xl mr-3">{icon}</Text>
      <Text className="flex-1 text-base text-gray-800">{label}</Text>
      {value && <Text className="text-gray-400 text-sm mr-2">{value}</Text>}
      {showArrow && onPress && <Text className="text-gray-300">›</Text>}
    </TouchableOpacity>
  );
}

export default function SettingsScreen() {
  const user = useAuthStore((s) => s.user);
  const household = useHouseholdStore((s) => s.current);

  const { data: notifSettings } = useQuery({
    queryKey: ['notifSettings', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data } = await (supabase
        .from('notification_settings') as any)
        .select('*')
        .eq('user_id', user.id)
        .single();
      return data as any;
    },
    enabled: !!user?.id,
  });

  const handleSignOut = () => {
    Alert.alert('로그아웃', '정말 로그아웃하시겠어요?', [
      { text: '취소', style: 'cancel' },
      {
        text: '로그아웃',
        style: 'destructive',
        onPress: async () => {
          try {
            await signOut();
            router.replace('/(auth)/sign-in');
          } catch {
            Alert.alert('오류', '로그아웃에 실패했습니다');
          }
        },
      },
    ]);
  };

  const modeLabels: Record<string, string> = {
    couple: '커플 / 동거',
    family: '가족',
    roommate: '룸메이트',
  };

  const roleLabels: Record<string, string> = {
    parent: '부모',
    child: '자녀',
    partner: '파트너',
    roommate: '룸메이트',
  };

  return (
    <SafeAreaView className="flex-1 bg-surface-secondary">
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
        <View className="px-5 pt-4 pb-2">
          <Text className="text-2xl font-bold text-gray-900">설정</Text>
        </View>

        {/* Profile */}
        <Card variant="default" padding="md" className="mx-5 mb-4">
          <View className="flex-row items-center">
            <Avatar
              uri={user?.avatarUrl}
              name={user?.displayName ?? '?'}
              size="lg"
            />
            <View className="ml-4 flex-1">
              <Text className="text-lg font-bold text-gray-900">{user?.displayName}</Text>
              <Text className="text-sm text-gray-500">{user?.email}</Text>
              {household && (
                <Text className="text-xs text-primary-500 mt-0.5">
                  {household.householdName} · {roleLabels[household.role] ?? household.role}
                </Text>
              )}
            </View>
            <TouchableOpacity className="px-3 py-1 bg-gray-100 rounded-lg">
              <Text className="text-sm text-gray-600">수정</Text>
            </TouchableOpacity>
          </View>
        </Card>

        {/* Household */}
        {household && (
          <Card variant="default" padding="none" className="mx-5 mb-4">
            <View className="px-4 py-3 border-b border-gray-50">
              <Text className="text-sm font-semibold text-gray-500">가구 관리</Text>
            </View>
            <SettingsRow
              icon="🏠"
              label="가구 이름"
              value={household.householdName}
              onPress={() => {}}
            />
            <Divider />
            <SettingsRow
              icon="👥"
              label="가구 형태"
              value={modeLabels[household.mode] ?? household.mode}
            />
            <Divider />
            {household.mode === 'family' && (
              <>
                <SettingsRow
                  icon="💰"
                  label="포인트 환율"
                  value={`1pt = ${household.pointToCurrency}원`}
                  onPress={() => {}}
                />
                <Divider />
              </>
            )}
            <SettingsRow
              icon="🔗"
              label="초대 코드"
              onPress={() => {}}
            />
            <Divider />
            <SettingsRow
              icon="👤"
              label="구성원 관리"
              onPress={() => {}}
            />
          </Card>
        )}

        {/* Chores catalog */}
        <Card variant="default" padding="none" className="mx-5 mb-4">
          <View className="px-4 py-3 border-b border-gray-50">
            <Text className="text-sm font-semibold text-gray-500">집안일</Text>
          </View>
          <SettingsRow
            icon="🧹"
            label="집안일 카탈로그"
            onPress={() => router.push('/modals/add-chore')}
          />
        </Card>

        {/* Notifications */}
        <Card variant="default" padding="none" className="mx-5 mb-4">
          <View className="px-4 py-3 border-b border-gray-50">
            <Text className="text-sm font-semibold text-gray-500">알림</Text>
          </View>
          <View className="flex-row items-center px-4 py-3">
            <Text className="text-xl mr-3">⏰</Text>
            <Text className="flex-1 text-base text-gray-800">데일리 리마인더</Text>
            <Switch
              value={notifSettings?.daily_reminder ?? true}
              onValueChange={() => {}}
              trackColor={{ true: Colors.primary[500] }}
            />
          </View>
          <Divider />
          <View className="flex-row items-center px-4 py-3">
            <Text className="text-xl mr-3">📅</Text>
            <Text className="flex-1 text-base text-gray-800">주간 리포트</Text>
            <Switch
              value={notifSettings?.weekly_report ?? true}
              onValueChange={() => {}}
              trackColor={{ true: Colors.primary[500] }}
            />
          </View>
        </Card>

        {/* Sign out */}
        <Card variant="default" padding="none" className="mx-5 mb-4">
          <TouchableOpacity
            onPress={handleSignOut}
            className="flex-row items-center px-4 py-3"
          >
            <Text className="text-xl mr-3">🚪</Text>
            <Text className="flex-1 text-base text-danger-500 font-medium">로그아웃</Text>
          </TouchableOpacity>
        </Card>

        <Text className="text-center text-xs text-gray-300 mt-2">FairShare v1.0.0</Text>
      </ScrollView>
    </SafeAreaView>
  );
}
