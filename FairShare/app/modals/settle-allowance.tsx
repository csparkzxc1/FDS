import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, Switch } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/stores/authStore';
import { useHouseholdStore } from '@/stores/householdStore';
import { Avatar, Button, Card, LoadingSpinner } from '@/components/ui';
import { formatDate, getWeekRange } from '@/utils/date';
import { getChildWeeklyPoints, settleAllowance } from '@/services/allowanceService';
import { IS_DEV_BYPASS, MOCK_PARTNER } from '@/utils/devMode';
import { Colors } from '@/constants/design-tokens';

export default function SettleAllowanceModal() {
  const { childId } = useLocalSearchParams<{ childId: string }>();
  const user = useAuthStore((s) => s.user);
  const household = useHouseholdStore((s) => s.current);
  const queryClient = useQueryClient();
  const { start, end } = getWeekRange();
  const [carryover, setCarryover] = useState(false);

  const members = useHouseholdStore((s) => s.members);
  const childMember = IS_DEV_BYPASS
    ? { user: MOCK_PARTNER }
    : members.find((m) => m.user_id === childId);

  const { data: weeklyPoints = 0, isLoading } = useQuery({
    queryKey: ['childWeeklyPoints', childId, household?.householdId],
    queryFn: () => getChildWeeklyPoints(household!.householdId, childId!),
    enabled: !!childId && !!household?.householdId,
  });

  const totalAmount = weeklyPoints * (household?.pointToCurrency ?? 100);

  const { mutateAsync: settle, isPending } = useMutation({
    mutationFn: () =>
      settleAllowance(
        household!.householdId,
        childId!,
        user!.id,
        weeklyPoints,
        totalAmount,
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settlements'] });
      const childName = (childMember as any)?.user?.display_name ?? '자녀';
      const carryoverNote = carryover ? '\n포인트가 다음 주로 이월됩니다.' : '\n이번 주 포인트가 초기화됩니다.';
      Alert.alert(
        '지급 완료',
        `${childName}에게 ${totalAmount.toLocaleString()}원 지급 완료! 🎉${carryoverNote}`,
        [{ text: '확인', onPress: () => router.back() }],
      );
    },
    onError: () => Alert.alert('오류', '정산에 실패했습니다'),
  });

  if (isLoading) return <LoadingSpinner fullScreen />;

  const childUser = (childMember as any)?.user;

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="items-center py-3">
        <View className="w-10 h-1 bg-gray-200 rounded-full" />
      </View>

      <View className="flex-row items-center justify-between px-6 pb-4">
        <Text className="text-xl font-bold text-gray-900">용돈 정산</Text>
        <TouchableOpacity onPress={() => router.back()}>
          <Text className="text-gray-400 text-lg">✕</Text>
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1 px-6" contentContainerStyle={{ paddingBottom: 40 }}>
        <Card variant="elevated" className="mb-5 items-center py-6">
          <Avatar
            uri={childUser?.avatar_url}
            name={childUser?.display_name ?? '?'}
            size="xl"
          />
          <Text className="text-xl font-bold text-gray-900 mt-3">
            {childUser?.display_name ?? '자녀'}
          </Text>
          <Text className="text-sm text-gray-500 mt-1">
            {formatDate(start)} – {formatDate(end)}
          </Text>
        </Card>

        <Card variant="elevated" className="mb-5">
          <View className="flex-row items-center justify-between py-3 border-b border-gray-50">
            <Text className="text-gray-600">획득 포인트</Text>
            <Text className="text-2xl font-bold text-primary-500">{weeklyPoints}pt</Text>
          </View>
          <View className="flex-row items-center justify-between py-3 border-b border-gray-50">
            <Text className="text-gray-600">환율</Text>
            <Text className="text-gray-800">1pt = {household?.pointToCurrency ?? 100}원</Text>
          </View>
          <View className="flex-row items-center justify-between py-3">
            <Text className="text-gray-900 font-semibold text-lg">지급 금액</Text>
            <Text className="text-3xl font-bold text-success-600">
              {totalAmount.toLocaleString()}원
            </Text>
          </View>
        </Card>

        <Card variant="default" className="mb-5 px-4 py-4">
          <View className="flex-row items-center justify-between">
            <View className="flex-1 mr-4">
              <Text className="text-base font-medium text-gray-800">포인트 이월</Text>
              <Text className="text-xs text-gray-500 mt-0.5">
                {carryover
                  ? '정산 후 포인트가 다음 주로 이월됩니다'
                  : '정산 후 이번 주 포인트가 초기화됩니다'}
              </Text>
            </View>
            <Switch
              value={carryover}
              onValueChange={setCarryover}
              trackColor={{ true: Colors.primary[500] }}
            />
          </View>
        </Card>

        <Button
          variant="primary"
          size="lg"
          fullWidth
          loading={isPending}
          onPress={() => {
            const childName = childUser?.display_name ?? '자녀';
            const carryoverNote = carryover
              ? '\n포인트는 다음 주로 이월됩니다.'
              : '\n이번 주 포인트가 초기화됩니다.';
            Alert.alert(
              '용돈 지급',
              `${childName}에게 ${totalAmount.toLocaleString()}원을 지급하시겠어요?${carryoverNote}`,
              [
                { text: '취소', style: 'cancel' },
                { text: '지급 완료', onPress: () => settle() },
              ],
            );
          }}
        >
          {totalAmount.toLocaleString()}원 지급하기
        </Button>
        <Text className="text-xs text-gray-400 text-center mt-3">
          실제 이체는 앱 외부에서 별도로 진행해주세요
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}
