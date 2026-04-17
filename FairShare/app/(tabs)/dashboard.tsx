import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import { useHouseholdStore } from '@/stores/householdStore';
import { Card, Avatar, EmptyState, LoadingSpinner } from '@/components/ui';
import { DonutChart } from '@/components/charts/DonutChart';
import { SeesawChart } from '@/components/charts/SeesawChart';
import { Colors, CategoryColors, CategoryIcons, CATEGORY_LABELS } from '@/constants/design-tokens';
import { getWeekRange, getMonthRange, formatDate } from '@/utils/date';
import { calculateFairnessIndex, getFairnessLabel, calculatePercentages } from '@/utils/fairness';
import { getChoreLogsForHousehold } from '@/services/choreService';
import { IS_DEV_BYPASS, MOCK_CHORE_LOGS, MOCK_MEMBERS } from '@/utils/devMode';
import type { FairnessData } from '@/types';

type Period = 'week' | 'month';


function buildStats(logs: any[], members: any[]) {
  const memberMap: Record<string, FairnessData> = {};
  const categoryMap: Record<string, number> = {};
  let totalPoints = 0;
  let invisiblePoints = 0;

  for (const member of members) {
    const userId = member.user_id ?? member.id;
    const name = member.user?.display_name ?? member.nickname ?? '?';
    const avatar = member.user?.avatar_url ?? null;
    memberMap[userId] = { userId, displayName: name, avatarUrl: avatar, totalPoints: 0, percentage: 0 };
  }

  for (const log of logs) {
    const pts = log.points_awarded ?? 0;
    const performedBy = log.performed_by;
    totalPoints += pts;

    if (memberMap[performedBy]) {
      memberMap[performedBy].totalPoints += pts;
    }

    const cat = log.chore?.category ?? log.category ?? 'etc';
    categoryMap[cat] = (categoryMap[cat] ?? 0) + pts;

    if (log.chore?.is_invisible_labor || log.is_invisible_labor) {
      invisiblePoints += pts;
    }
  }

  const memberStats = calculatePercentages(Object.values(memberMap).filter((m) => m.totalPoints > 0));
  const fairnessIndex = calculateFairnessIndex(memberStats);
  const invisiblePct = totalPoints > 0 ? Math.round((invisiblePoints / totalPoints) * 100) : 0;

  return { memberStats, fairnessIndex, totalPoints, categoryMap, invisiblePct };
}

export default function DashboardScreen() {
  const [period, setPeriod] = useState<Period>('week');
  const household = useHouseholdStore((s) => s.current);
  const members = useHouseholdStore((s) => s.members);

  const range = period === 'week' ? getWeekRange() : getMonthRange();

  const { data: stats, isLoading } = useQuery({
    queryKey: ['dashboardStats', household?.householdId, period],
    queryFn: async () => {
      if (IS_DEV_BYPASS) {
        return buildStats(MOCK_CHORE_LOGS, MOCK_MEMBERS);
      }

      if (!household?.householdId) return null;

      const logs = await getChoreLogsForHousehold(household.householdId, { limit: 200 });
      const filtered = logs.filter(
        (l) =>
          l.status === 'approved' &&
          l.performed_at >= range.start.toISOString() &&
          l.performed_at <= range.end.toISOString(),
      );

      return buildStats(filtered, members);
    },
    enabled: !!household?.householdId || IS_DEV_BYPASS,
  });

  const fairness = stats ? getFairnessLabel(stats.fairnessIndex) : null;

  return (
    <SafeAreaView className="flex-1 bg-surface-secondary">
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 40 }}>
        <Text className="text-2xl font-bold text-gray-900 mb-4">대시보드</Text>

        <View className="flex-row gap-2 mb-5">
          {(['week', 'month'] as const).map((p) => (
            <TouchableOpacity
              key={p}
              onPress={() => setPeriod(p)}
              className="px-5 py-2 rounded-full"
              style={{ backgroundColor: period === p ? Colors.primary[500] : Colors.gray[100] }}
            >
              <Text
                className="font-medium text-sm"
                style={{ color: period === p ? Colors.white : Colors.gray[600] }}
              >
                {p === 'week' ? '주간' : '월간'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {isLoading ? (
          <LoadingSpinner />
        ) : !stats || stats.totalPoints === 0 ? (
          <EmptyState
            emoji="📊"
            title="아직 데이터가 없어요"
            description="집안일을 완료하면 통계가 여기에 표시돼요"
          />
        ) : (
          <>
            <Card variant="elevated" className="mb-4">
              <Text className="text-sm text-gray-500 mb-1">총 포인트</Text>
              <Text className="text-4xl font-bold text-primary-500">{stats.totalPoints}pt</Text>
              <Text className="text-xs text-gray-400 mt-1">
                {formatDate(range.start)} – {formatDate(range.end)}
              </Text>
            </Card>

            {household?.mode !== 'family' && fairness && stats.memberStats.length >= 2 && (
              <Card variant="elevated" className="mb-4">
                <Text className="text-sm text-gray-500 mb-3">공정성 지수</Text>
                <View className="flex-row items-center mb-4">
                  <Text className="text-3xl font-bold mr-3" style={{ color: fairness.color }}>
                    {stats.fairnessIndex}%
                  </Text>
                  <Text className="text-sm" style={{ color: fairness.color }}>
                    {fairness.label}
                  </Text>
                </View>
                <SeesawChart
                  leftLabel={stats.memberStats[0].displayName}
                  rightLabel={stats.memberStats[1].displayName}
                  leftPct={stats.memberStats[0].percentage}
                  rightPct={stats.memberStats[1].percentage}
                  leftColor={Colors.primary[500]}
                  rightColor={Colors.kid[500]}
                />
                <Text className="text-xs text-gray-400 mt-3 text-center">
                  50%에 가까울수록 균형잡혔어요
                </Text>
              </Card>
            )}

            <Card variant="elevated" className="mb-4">
              <Text className="text-sm font-semibold text-gray-700 mb-3">구성원별 기여</Text>
              {stats.memberStats.map((m) => (
                <View key={m.userId} className="mb-3">
                  <View className="flex-row items-center mb-1">
                    <Avatar uri={m.avatarUrl} name={m.displayName} size="sm" />
                    <Text className="font-medium text-gray-800 ml-2 flex-1">{m.displayName}</Text>
                    <Text className="text-sm font-bold text-primary-500">{m.totalPoints}pt</Text>
                    <Text className="text-xs text-gray-400 ml-2">{m.percentage}%</Text>
                  </View>
                  <View className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <View
                      className="h-full rounded-full"
                      style={{ width: `${m.percentage}%`, backgroundColor: Colors.primary[500] }}
                    />
                  </View>
                </View>
              ))}
            </Card>

            <Card variant="elevated" className="mb-4">
              <Text className="text-sm font-semibold text-gray-700 mb-3">카테고리 분포</Text>
              <DonutChart
                data={Object.entries(stats.categoryMap)
                  .sort(([, a], [, b]) => b - a)
                  .map(([cat, pts]) => ({
                    label: `${CategoryIcons[cat as keyof typeof CategoryIcons] ?? '✨'} ${CATEGORY_LABELS[cat] ?? cat}`,
                    value: pts,
                    color: CategoryColors[cat as keyof typeof CategoryColors] ?? Colors.gray[300],
                  }))}
                centerLabel={`${stats.totalPoints}pt`}
                centerSub="총 포인트"
              />
            </Card>

            <Card variant="elevated">
              <View className="flex-row items-center mb-2">
                <Text className="text-lg mr-2">🧠</Text>
                <Text className="text-sm font-semibold text-gray-700 flex-1">정신노동 비율</Text>
                <Text className="text-invisible-500 font-bold">{stats.invisiblePct}%</Text>
              </View>
              <View className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <View
                  className="h-full rounded-full"
                  style={{ width: `${stats.invisiblePct}%`, backgroundColor: Colors.invisible[500] }}
                />
              </View>
            </Card>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
