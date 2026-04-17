import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Switch,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQuery } from '@tanstack/react-query';
import { useHouseholdStore } from '@/stores/householdStore';
import { useCreateChore, useUpdateChore } from '@/hooks/queries/useChores';
import { getChores } from '@/services/choreService';
import { Button, Input } from '@/components/ui';
import { Colors } from '@/constants/design-tokens';
import type { ChoreCategory } from '@/types/database';

const schema = z.object({
  title: z.string().min(1, '집안일 이름을 입력해주세요').max(50),
  icon: z.string().min(1),
  category: z.enum(['cleaning', 'cooking', 'laundry', 'invisible', 'care', 'etc']),
  points: z.preprocess((v) => Number(v), z.number().min(0).max(100)),
  requiresPhoto: z.boolean(),
  requiresApproval: z.boolean(),
  isInvisibleLabor: z.boolean(),
  estimatedMinutes: z.preprocess(
    (v) => (v === '' || v == null ? undefined : Number(v)),
    z.number().min(0).max(480).optional(),
  ),
});

type Form = {
  title: string;
  icon: string;
  category: 'cleaning' | 'cooking' | 'laundry' | 'invisible' | 'care' | 'etc';
  points: number;
  requiresPhoto: boolean;
  requiresApproval: boolean;
  isInvisibleLabor: boolean;
  estimatedMinutes?: number;
};

const CATEGORY_OPTIONS: { value: ChoreCategory; label: string; emoji: string }[] = [
  { value: 'cleaning', label: '청소', emoji: '🧹' },
  { value: 'cooking', label: '요리', emoji: '🍳' },
  { value: 'laundry', label: '세탁', emoji: '🧺' },
  { value: 'invisible', label: '정신노동', emoji: '🧠' },
  { value: 'care', label: '돌봄', emoji: '💝' },
  { value: 'etc', label: '기타', emoji: '✨' },
];

const ICON_PRESETS = ['🧹', '🍳', '🧺', '🛒', '🚽', '🪟', '🗑️', '♻️', '🐾', '📋', '📅', '🔧', '🎁', '🌱', '📦'];

export default function AddChoreModal() {
  const { choreId } = useLocalSearchParams<{ choreId?: string }>();
  const household = useHouseholdStore((s) => s.current);
  const isEdit = !!choreId;

  const { mutateAsync: createChore } = useCreateChore();
  const { mutateAsync: updateChore } = useUpdateChore();

  const { data: existing } = useQuery({
    queryKey: ['chore', choreId],
    queryFn: async () => {
      if (!household?.householdId) return null;
      const chores = await getChores(household.householdId);
      return chores.find((c) => c.id === choreId) ?? null;
    },
    enabled: isEdit && !!household?.householdId,
  });

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<Form>({
    resolver: zodResolver(schema) as any,
    values: existing
      ? {
          title: existing.title,
          icon: existing.icon,
          category: existing.category as Form['category'],
          points: existing.points,
          requiresPhoto: existing.requires_photo,
          requiresApproval: existing.requires_approval,
          isInvisibleLabor: existing.is_invisible_labor,
          estimatedMinutes: existing.estimated_minutes ?? undefined,
        }
      : {
          title: '',
          icon: '✨',
          category: 'etc',
          points: 2,
          requiresPhoto: false,
          requiresApproval: household?.mode === 'family',
          isInvisibleLabor: false,
          estimatedMinutes: undefined,
        },
  });

  const selectedCategory = watch('category');
  const selectedIcon = watch('icon');

  const onSubmit = async (data: Form) => {
    if (!household?.householdId) return;

    try {
      if (isEdit && choreId) {
        await updateChore({
          choreId,
          updates: {
            title: data.title,
            icon: data.icon,
            category: data.category,
            points: data.points,
            requiresPhoto: data.requiresPhoto,
            requiresApproval: data.requiresApproval,
            isInvisibleLabor: data.isInvisibleLabor,
            estimatedMinutes: data.estimatedMinutes,
          },
        });
      } else {
        await createChore({
          householdId: household.householdId,
          title: data.title,
          icon: data.icon,
          category: data.category,
          points: data.points,
          requiresPhoto: data.requiresPhoto,
          requiresApproval: data.requiresApproval,
          isInvisibleLabor: data.isInvisibleLabor,
          estimatedMinutes: data.estimatedMinutes,
        });
      }
      router.back();
    } catch {
      Alert.alert('오류', '저장에 실패했습니다');
    }
  };

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
            {isEdit ? '집안일 수정' : '집안일 추가'}
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
          <Text className="text-sm font-medium text-gray-700 mb-2">아이콘</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-4">
            <View className="flex-row gap-2">
              {ICON_PRESETS.map((icon) => (
                <TouchableOpacity
                  key={icon}
                  onPress={() => setValue('icon', icon)}
                  className="w-12 h-12 rounded-xl items-center justify-center"
                  style={{
                    backgroundColor: selectedIcon === icon ? Colors.primary[100] : Colors.gray[100],
                    borderWidth: selectedIcon === icon ? 2 : 0,
                    borderColor: Colors.primary[500],
                  }}
                >
                  <Text className="text-2xl">{icon}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>

          <Controller
            control={control}
            name="title"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                label="집안일 이름"
                placeholder="예: 설거지"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                error={errors.title?.message}
                required
              />
            )}
          />

          <Text className="text-sm font-medium text-gray-700 mb-2">카테고리</Text>
          <View className="flex-row flex-wrap gap-2 mb-4">
            {CATEGORY_OPTIONS.map((opt) => (
              <TouchableOpacity
                key={opt.value}
                onPress={() => setValue('category', opt.value)}
                className="flex-row items-center px-3 py-2 rounded-full"
                style={{
                  backgroundColor:
                    selectedCategory === opt.value ? Colors.primary[500] : Colors.gray[100],
                }}
              >
                <Text className="text-sm mr-1">{opt.emoji}</Text>
                <Text
                  className="text-sm font-medium"
                  style={{
                    color: selectedCategory === opt.value ? Colors.white : Colors.gray[700],
                  }}
                >
                  {opt.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Controller
            control={control}
            name="points"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                label="포인트"
                placeholder="2"
                keyboardType="number-pad"
                value={String(value)}
                onChangeText={onChange}
                onBlur={onBlur}
                error={errors.points?.message}
                required
              />
            )}
          />

          <Controller
            control={control}
            name="estimatedMinutes"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                label="예상 시간 (분)"
                placeholder="15"
                keyboardType="number-pad"
                value={value != null ? String(value) : ''}
                onChangeText={onChange}
                onBlur={onBlur}
              />
            )}
          />

          {(['requiresPhoto', 'requiresApproval', 'isInvisibleLabor'] as const).map((field) => {
            const labels: Record<string, string> = {
              requiresPhoto: '사진 인증 필요',
              requiresApproval: '부모 승인 필요',
              isInvisibleLabor: '정신노동 태그',
            };
            return (
              <Controller
                key={field}
                control={control}
                name={field}
                render={({ field: { onChange, value } }) => (
                  <View className="flex-row items-center justify-between mb-4">
                    <Text className="text-base text-gray-800">{labels[field]}</Text>
                    <Switch
                      value={value}
                      onValueChange={onChange}
                      trackColor={{ true: Colors.primary[500] }}
                    />
                  </View>
                )}
              />
            );
          })}

          <Button
            variant="primary"
            size="lg"
            fullWidth
            loading={isSubmitting}
            onPress={handleSubmit(onSubmit)}
          >
            {isEdit ? '수정 완료' : '추가하기'}
          </Button>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
