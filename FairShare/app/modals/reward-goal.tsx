import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/stores/authStore';
import { useHouseholdStore } from '@/stores/householdStore';
import { supabase } from '@/services/supabase';
import { Button, Input } from '@/components/ui';

const schema = z.object({
  title: z.string().min(1, '목표 이름을 입력해주세요').max(50),
  targetPoints: z.preprocess((v) => Number(v), z.number().min(1, '목표 포인트를 입력해주세요')),
});

type Form = { title: string; targetPoints: number };

export default function RewardGoalModal() {
  const { goalId } = useLocalSearchParams<{ goalId?: string }>();
  const user = useAuthStore((s) => s.user);
  const household = useHouseholdStore((s) => s.current);
  const queryClient = useQueryClient();
  const isEdit = !!goalId;

  const { data: existing } = useQuery({
    queryKey: ['rewardGoal', goalId],
    queryFn: async () => {
      const { data } = await (supabase.from('reward_goals') as any).select('*').eq('id', goalId!).single();
      return data as any;
    },
    enabled: isEdit,
  });

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<Form>({
    resolver: zodResolver(schema) as any,
    values: existing
      ? { title: existing.title, targetPoints: existing.target_points }
      : { title: '', targetPoints: 100 },
  });

  const { mutateAsync: save } = useMutation({
    mutationFn: async (data: Form) => {
      if (!user?.id || !household?.householdId) throw new Error('Not ready');

      const payload = {
        child_id: user.id,
        household_id: household.householdId,
        title: data.title,
        target_points: data.targetPoints,
      };

      const tb = supabase.from('reward_goals') as any;
      if (isEdit) {
        const { error } = await tb.update(payload).eq('id', goalId!);
        if (error) throw error;
      } else {
        const { error } = await tb.insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rewardGoals'] });
      router.back();
    },
    onError: () => Alert.alert('오류', '저장에 실패했습니다'),
  });

  return (
    <SafeAreaView className="flex-1 bg-white">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <View className="items-center py-3">
          <View className="w-10 h-1 bg-gray-200 rounded-full" />
        </View>

        <View className="flex-row items-center justify-between px-6 pb-4">
          <Text className="text-xl font-bold text-gray-900">
            {isEdit ? '목표 수정' : '보상 목표 추가'}
          </Text>
          <TouchableOpacity onPress={() => router.back()}>
            <Text className="text-gray-400 text-lg">✕</Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          className="flex-1 px-6"
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ paddingBottom: 40 }}
        >
          <View className="items-center mb-8">
            <Text className="text-6xl mb-2">🎯</Text>
            <Text className="text-sm text-gray-500 text-center">
              포인트를 모아서 원하는 것을 얻어봐요!
            </Text>
          </View>

          <Controller
            control={control}
            name="title"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                label="목표 이름"
                placeholder="예: 닌텐도 스위치, 롤러블레이드"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                error={errors.title?.message}
                required
              />
            )}
          />

          <Controller
            control={control}
            name="targetPoints"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                label="목표 포인트"
                placeholder="100"
                keyboardType="number-pad"
                value={String(value)}
                onChangeText={onChange}
                onBlur={onBlur}
                error={errors.targetPoints?.message}
                required
              />
            )}
          />

          <Button
            variant="kid"
            size="lg"
            fullWidth
            loading={isSubmitting}
            onPress={handleSubmit((data) => save(data))}
          >
            {isEdit ? '수정 완료' : '목표 저장하기 🎯'}
          </Button>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
