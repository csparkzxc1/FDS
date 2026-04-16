import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  FlatList,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as Haptics from 'expo-haptics';
import { useAuthStore } from '@/stores/authStore';
import { useHouseholdStore } from '@/stores/householdStore';
import { supabase } from '@/services/supabase';
import {
  Avatar,
  AvatarGroup,
  Card,
  Badge,
  EmptyState,
  LoadingSpinner,
  PointCounter,
} from '@/components/ui';
import { Colors, CategoryColors } from '@/constants/design-tokens';
import { isWithinMinutes } from '@/utils/date';
import type { ChoreRow, ChoreLogRow } from '@/types/database';

function useChores(householdId?: string) {
  return useQuery({
    queryKey: ['chores', householdId],
    queryFn: async () => {
      if (!householdId) return [];
      const { data, error } = await supabase
        .from('chores')
        .select('*')
        .eq('household_id', householdId)
        .is('archived_at', null)
        .order('title');
      if (error) throw error;
      return (data ?? []) as any[];
    },
    enabled: !!householdId,
  });
}

function useMyWeeklyPoints(userId?: string, householdId?: string) {
  const now = new Date();
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() - now.getDay() + 1);
  weekStart.setHours(0, 0, 0, 0);

  return useQuery({
    queryKey: ['myWeeklyPoints', userId, householdId],
    queryFn: async () => {
      if (!userId || !householdId) return 0;
      const { data, error } = await supabase
        .from('chore_logs')
        .select('points_awarded')
        .eq('household_id', householdId)
        .eq('performed_by', userId)
        .eq('status', 'approved')
        .gte('performed_at', weekStart.toISOString());
      if (error) throw error;
      return ((data ?? []) as any[]).reduce((sum, r) => sum + r.points_awarded, 0);
    },
    enabled: !!userId && !!householdId,
  });
}

function useCheckChore(householdId?: string) {
  const queryClient = useQueryClient();
  const userId = useAuthStore((s) => s.user?.id);

  return useMutation({
    mutationFn: async ({
      chore,
      requiresApproval,
    }: {
      chore: ChoreRow;
      requiresApproval: boolean;
    }) => {
      if (!userId || !householdId) throw new Error('Not ready');

      // 5분 중복 체크
      const fiveMinAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
      const { data: recent } = await supabase
        .from('chore_logs')
        .select('id, performed_at')
        .eq('chore_id', chore.id)
        .eq('performed_by', userId)
        .gte('performed_at', fiveMinAgo)
        .limit(1);

      if (recent && recent.length > 0) {
        throw new Error('DUPLICATE');
      }

      const { error } = await supabase.from('chore_logs').insert({
        household_id: householdId,
        chore_id: chore.id,
        performed_by: userId,
        points_awarded: chore.points,
        status: requiresApproval ? 'pending' : 'approved',
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chores'] });
      queryClient.invalidateQueries({ queryKey: ['myWeeklyPoints'] });
      queryClient.invalidateQueries({ queryKey: ['choreLogs'] });
    },
  });
}

export default function HomeScreen() {
  const user = useAuthStore((s) => s.user);
  const household = useHouseholdStore((s) => s.current);
  const members = useHouseholdStore((s) => s.members);

  const { data: chores = [], isLoading: choresLoading } = useChores(household?.householdId);
  const { data: weeklyPoints = 0 } = useMyWeeklyPoints(user?.id, household?.householdId);
  const { mutateAsync: checkChore } = useCheckChore(household?.householdId);

  const role = household?.role;
  const isParent = role === 'parent';

  const handleChorePress = async (chore: ChoreRow) => {
    const needsPhoto = chore.requires_photo;
    const needsApproval = chore.requires_approval;

    if (needsPhoto || needsApproval) {
      router.push({ pathname: '/modals/chore-detail', params: { choreId: chore.id } });
      return;
    }

    try {
      await checkChore({ chore, requiresApproval: needsApproval });
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error: any) {
      if (error.message === 'DUPLICATE') {
        Alert.alert(
          '중복 체크',
          '5분 이내에 같은 집안일을 이미 했어요. 계속 기록할까요?',
          [
            { text: '취소', style: 'cancel' },
            {
              text: '계속',
              onPress: async () => {
                // Force add without dupe check by going to detail modal
                router.push({ pathname: '/modals/chore-detail', params: { choreId: chore.id } });
              },
            },
          ]
        );
      } else {
        Alert.alert('오류', '집안일 기록에 실패했습니다');
      }
    }
  };

  if (choresLoading) {
    return <LoadingSpinner fullScreen message="불러오는 중..." />;
  }

  return (
    <SafeAreaView className="flex-1 bg-surface-secondary">
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 24 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View className="px-5 pt-4 pb-3">
          <View className="flex-row items-center justify-between">
            <View>
              <Text className="text-sm text-gray-500">안녕하세요 👋</Text>
              <Text className="text-2xl font-bold text-gray-900">{user?.displayName}</Text>
            </View>
            <View className="items-end">
              <Text className="text-xs text-gray-400 mb-1">이번 주</Text>
              <PointCounter points={weeklyPoints} size="lg" />
            </View>
          </View>
        </View>

        {/* Members row */}
        {members.length > 1 && (
          <View className="px-5 mb-4">
            <Card variant="default" padding="sm">
              <View className="flex-row items-center justify-between">
                <Text className="text-sm font-semibold text-gray-700">구성원</Text>
                <AvatarGroup
                  users={members.map((m) => ({
                    name: m.nickname ?? m.user?.display_name ?? '?',
                    avatarUrl: m.user?.avatar_url,
                  }))}
                  size="sm"
                />
              </View>
            </Card>
          </View>
        )}

        {/* Approval badge for parents */}
        {isParent && (
          <TouchableOpacity
            className="mx-5 mb-4"
            onPress={() => router.push('/modals/approval-queue')}
          >
            <View className="bg-warning-50 border border-warning-200 rounded-2xl p-4 flex-row items-center">
              <Text className="text-2xl mr-3">🔔</Text>
              <View className="flex-1">
                <Text className="font-semibold text-warning-700">승인 대기 항목이 있어요</Text>
                <Text className="text-sm text-warning-600">탭해서 확인하세요</Text>
              </View>
              <Text className="text-warning-400">→</Text>
            </View>
          </TouchableOpacity>
        )}

        {/* Quick check grid */}
        <View className="px-5">
          <View className="flex-row items-center justify-between mb-3">
            <Text className="text-lg font-bold text-gray-900">빠른 체크</Text>
            <TouchableOpacity onPress={() => router.push('/modals/add-chore')}>
              <Text className="text-primary-500 text-sm font-medium">+ 추가</Text>
            </TouchableOpacity>
          </View>

          {chores.length === 0 ? (
            <EmptyState
              emoji="🧹"
              title="집안일을 추가해보세요"
              description="첫 번째 집안일을 등록하고 포인트를 받아보세요!"
              actionLabel="집안일 추가"
              onAction={() => router.push('/modals/add-chore')}
            />
          ) : (
            <View className="flex-row flex-wrap" style={{ gap: 10 }}>
              {chores.map((chore) => (
                <TouchableOpacity
                  key={chore.id}
                  onPress={() => handleChorePress(chore)}
                  activeOpacity={0.7}
                  style={{ width: '47%' }}
                >
                  <Card variant="elevated" padding="md">
                    <View
                      className="w-10 h-10 rounded-xl items-center justify-center mb-2"
                      style={{ backgroundColor: `${CategoryColors[chore.category]}20` }}
                    >
                      <Text className="text-2xl">{chore.icon}</Text>
                    </View>
                    <Text className="font-semibold text-gray-900 mb-1" numberOfLines={1}>
                      {chore.title}
                    </Text>
                    <View className="flex-row items-center justify-between">
                      <Text className="text-primary-500 font-bold text-sm">+{chore.points}pt</Text>
                      {chore.requires_approval && (
                        <Badge label="승인" variant="warning" dot />
                      )}
                    </View>
                  </Card>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
