import React, { useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import * as NetInfo from '@react-native-community/netinfo';
import { useAuthStore } from '@/stores/authStore';
import { useHouseholdStore } from '@/stores/householdStore';
import { useOfflineQueueStore } from '@/stores/offlineQueue';
import {
  Avatar,
  AvatarGroup,
  Card,
  Badge,
  EmptyState,
  LoadingSpinner,
  PointCounter,
} from '@/components/ui';
import { CategoryColors } from '@/constants/design-tokens';
import { useChores, useMyWeeklyPoints, useCreateChoreLog, useChoreLogs } from '@/hooks/queries/useChores';
import { useRewardGoals } from '@/hooks/queries/useRewardGoals';
import { getLevel, getLevelProgress, getNextLevel, calculateStreak, getStreakBadge } from '@/utils/gamification';
import type { ChoreRow } from '@/services/choreService';

export default function HomeScreen() {
  const user = useAuthStore((s) => s.user);
  const household = useHouseholdStore((s) => s.current);
  const members = useHouseholdStore((s) => s.members);
  const enqueue = useOfflineQueueStore((s) => s.enqueue);

  const { data: chores = [], isLoading: choresLoading } = useChores(household?.householdId);
  const { data: weeklyPoints = 0 } = useMyWeeklyPoints(household?.householdId, user?.id);
  const { mutateAsync: logChore } = useCreateChoreLog();

  const myMember = useMemo(() => members.find((m) => m.user_id === user?.id), [members, user?.id]);
  const isParent = myMember?.role === 'parent';
  const isChild = myMember?.role === 'child';

  const { data: myLogs = [] } = useChoreLogs(
    isChild ? household?.householdId : undefined,
    isChild ? { userId: user?.id, limit: 200 } : undefined,
  );
  const { data: goals = [] } = useRewardGoals(
    isChild ? household?.householdId : undefined,
    isChild ? user?.id : undefined,
  );

  const totalPoints = isChild
    ? myLogs.filter((l) => l.status === 'approved').reduce((s, l) => s + l.points_awarded, 0)
    : 0;
  const streak = isChild ? calculateStreak(myLogs) : 0;
  const streakBadge = getStreakBadge(streak);
  const level = getLevel(totalPoints);
  const levelProgress = getLevelProgress(totalPoints);
  const nextLevel = getNextLevel(totalPoints);
  const activeGoal = goals.find((g) => !g.achieved_at) ?? null;
  const goalProgress = activeGoal
    ? Math.min(100, Math.round((totalPoints / activeGoal.target_points) * 100))
    : 0;

  const handleChorePress = async (chore: ChoreRow) => {
    if (chore.requires_photo || chore.requires_approval) {
      router.push({ pathname: '/modals/chore-detail', params: { choreId: chore.id } });
      return;
    }

    const net = await NetInfo.fetch();
    if (!net.isConnected) {
      if (!user?.id || !household?.householdId) return;
      enqueue({
        type: 'chore_check',
        payload: {
          choreId: chore.id,
          householdId: household.householdId,
          performedBy: user.id,
          pointsAwarded: chore.points,
          performedAt: new Date().toISOString(),
          requiresApproval: chore.requires_approval,
        },
      });
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      Alert.alert('오프라인 저장', '인터넷 연결 후 자동으로 동기화됩니다');
      return;
    }

    try {
      await logChore({
        householdId: household!.householdId,
        choreId: chore.id,
        performedBy: user!.id,
        pointsAwarded: chore.points,
        requiresApproval: chore.requires_approval,
      });
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error: any) {
      if (error?.message === 'DUPLICATE') {
        Alert.alert(
          '중복 체크',
          '5분 이내에 같은 집안일을 이미 했어요. 계속 기록할까요?',
          [
            { text: '취소', style: 'cancel' },
            {
              text: '계속',
              onPress: () =>
                router.push({ pathname: '/modals/chore-detail', params: { choreId: chore.id } }),
            },
          ],
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
        <View className="px-5 pt-4 pb-3">
          <View className="flex-row items-center justify-between">
            <View>
              <Text className="text-sm text-gray-500">안녕하세요 👋</Text>
              <Text className="text-2xl font-bold text-gray-900">{user?.displayName ?? '사용자'}</Text>
            </View>
            <View className="items-end">
              <Text className="text-xs text-gray-400 mb-1">이번 주</Text>
              <PointCounter points={weeklyPoints} size="lg" />
            </View>
          </View>
        </View>

        {isChild && (
          <View className="px-5 mb-4" style={{ gap: 10 }}>
            <Card variant="elevated" padding="md">
              <View className="flex-row items-center mb-2">
                <Text className="text-3xl mr-2">{level.emoji}</Text>
                <View className="flex-1">
                  <Text className="text-base font-bold text-gray-900">
                    Lv.{level.level} {level.label}
                  </Text>
                  {nextLevel ? (
                    <Text className="text-xs text-gray-500">
                      다음 레벨까지 {nextLevel.remaining}pt
                    </Text>
                  ) : (
                    <Text className="text-xs text-primary-500">최고 레벨 달성!</Text>
                  )}
                </View>
                {streak > 0 && (
                  <View className="items-center">
                    <Text className="text-2xl">{streakBadge || '🔥'}</Text>
                    <Text className="text-xs text-gray-500">{streak}일 연속</Text>
                  </View>
                )}
              </View>
              <View className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <View
                  className="h-full rounded-full bg-primary-500"
                  style={{ width: `${levelProgress}%` }}
                />
              </View>
            </Card>

            {activeGoal && (
              <Card variant="elevated" padding="md">
                <View className="flex-row items-center mb-2">
                  <Text className="text-2xl mr-2">🎯</Text>
                  <View className="flex-1">
                    <Text className="text-sm font-semibold text-gray-800" numberOfLines={1}>
                      {activeGoal.title}
                    </Text>
                    <Text className="text-xs text-gray-500">
                      {totalPoints} / {activeGoal.target_points}pt ({goalProgress}%)
                    </Text>
                  </View>
                </View>
                <View className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <View
                    className="h-full rounded-full"
                    style={{ width: `${goalProgress}%`, backgroundColor: '#F59E0B' }}
                  />
                </View>
              </Card>
            )}
          </View>
        )}

        {members.length > 1 && (
          <View className="px-5 mb-4">
            <Card variant="default" padding="sm">
              <View className="flex-row items-center justify-between">
                <Text className="text-sm font-semibold text-gray-700">구성원</Text>
                <AvatarGroup
                  users={members.map((m) => ({
                    name: (m as any).nickname ?? (m as any).user?.display_name ?? '?',
                    avatarUrl: (m as any).user?.avatar_url ?? null,
                  }))}
                  size="sm"
                />
              </View>
            </Card>
          </View>
        )}

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
                      style={{ backgroundColor: `${CategoryColors[chore.category as keyof typeof CategoryColors] ?? '#E5E7EB'}20` }}
                    >
                      <Text className="text-2xl">{chore.icon}</Text>
                    </View>
                    <Text className="font-semibold text-gray-900 mb-1" numberOfLines={1}>
                      {chore.title}
                    </Text>
                    <View className="flex-row items-center justify-between">
                      <Text className="text-primary-500 font-bold text-sm">+{chore.points}pt</Text>
                      {chore.requires_approval && <Badge label="승인" variant="warning" dot />}
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
