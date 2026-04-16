import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/stores/authStore';
import { useHouseholdStore } from '@/stores/householdStore';
import { supabase } from '@/services/supabase';
import { Avatar, Button, Card, LoadingSpinner } from '@/components/ui';
import { formatDate, getWeekRange } from '@/utils/date';
import { Colors } from '@/constants/design-tokens';

export default function SettleAllowanceModal() {
  const { childId } = useLocalSearchParams<{ childId: string }>();
  const user = useAuthStore((s) => s.user);
  const household = useHouseholdStore((s) => s.current);
  const queryClient = useQueryClient();
  const range = getWeekRange();

  const { data: childData } = useQuery({
    queryKey: ['childUser', childId],
    queryFn: async () => {
      const { data } = await (supabase
        .from('users') as any)
        .select('*')
        .eq('id', childId!)
        .single();
      return data as any;
    },
    enabled: !!childId,
  });

  const { data: weeklyPoints = 0, isLoading } = useQuery({
    queryKey: ['childWeeklyPoints', childId, household?.householdId],
    queryFn: async () => {
      const { data } = await (supabase
        .from('chore_logs') as any)
        .select('points_awarded')
        .eq('household_id', household!.householdId)
        .eq('performed_by', childId!)
        .eq('status', 'approved')
        .gte('performed_at', range.start.toISOString())
        .lte('performed_at', range.end.toISOString());
      return ((data ?? []) as any[]).reduce((sum, r) => sum + r.points_awarded, 0);
    },
    enabled: !!childId && !!household?.householdId,
  });

  const totalAmount = weeklyPoints * (household?.pointToCurrency ?? 100);

  const { mutateAsync: settle, isPending } = useMutation({
    mutationFn: async () => {
      if (!user?.id || !household?.householdId || !childId) throw new Error('Not ready');
      const { error } = await (supabase.from('allowance_settlements') as any).insert({
        household_id: household.householdId,
        child_id: childId,
        period_start: formatDate(range.start, 'yyyy-MM-dd'),
        period_end: formatDate(range.end, 'yyyy-MM-dd'),
        total_points: weeklyPoints,
        total_amount: totalAmount,
        paid_at: new Date().toISOString(),
        paid_by: user.id,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settlements'] });
      Alert.alert('지급 완료', `${totalAmount.toLocaleString()}원이 지급 완료되었습니다! 🎉`, [
        { text: '확인', onPress: () => router.back() },
      ]);
    },
    onError: () => Alert.alert('오류', '정산에 실패했습니다'),
  });

  if (isLoading) return <LoadingSpinner fullScreen />;

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
        {/* Child info */}
        <Card variant="elevated" className="mb-5 items-center py-6">
          <Avatar
            uri={childData?.avatar_url}
            name={childData?.display_name ?? '?'}
            size="xl"
          />
          <Text className="text-xl font-bold text-gray-900 mt-3">{childData?.display_name}</Text>
          <Text className="text-sm text-gray-500 mt-1">
            {formatDate(range.start)} – {formatDate(range.end)}
          </Text>
        </Card>

        {/* Points & Amount */}
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
            <Text className="text-3xl font-bold text-success-600">{totalAmount.toLocaleString()}원</Text>
          </View>
        </Card>

        <Button
          variant="primary"
          size="lg"
          fullWidth
          loading={isPending}
          onPress={() => {
            Alert.alert(
              '용돈 지급',
              `${childData?.display_name}에게 ${totalAmount.toLocaleString()}원을 지급하시겠어요?`,
              [
                { text: '취소', style: 'cancel' },
                { text: '지급 완료', onPress: () => settle() },
              ]
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
