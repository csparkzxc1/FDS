import React, { useState } from 'react';
import {
  View,
  Text,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, Input } from '@/components/ui';
import { useJoinHousehold, useHouseholdByInviteCode } from '@/hooks/queries/useHousehold';
import { useAuthStore } from '@/stores/authStore';

const schema = z.object({
  inviteCode: z
    .string()
    .min(6, '초대 코드는 6자리입니다')
    .max(6, '초대 코드는 6자리입니다')
    .toUpperCase(),
});

type Form = { inviteCode: string };

export default function JoinHouseholdScreen() {
  const user = useAuthStore((s) => s.user);
  const { mutateAsync: joinHousehold, isPending } = useJoinHousehold();
  const [codeToPreview, setCodeToPreview] = useState('');

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<Form>({
    resolver: zodResolver(schema) as any,
    defaultValues: { inviteCode: '' },
  });

  const currentCode = watch('inviteCode');
  const previewCode = currentCode.length === 6 ? currentCode.toUpperCase() : '';

  const { data: previewHousehold, isLoading: previewLoading } = useHouseholdByInviteCode(previewCode);

  const onSubmit = async (data: Form) => {
    if (!user) return;
    try {
      await joinHousehold({ inviteCode: data.inviteCode, userId: user.id });
      router.replace('/(onboarding)/pending-approval');
    } catch (error: any) {
      Alert.alert('참여 실패', error?.message ?? '다시 시도해주세요.');
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1 px-6"
      >
        <View className="flex-row items-center pt-4 pb-6">
          <Button variant="ghost" size="sm" onPress={() => router.back()}>
            ← 뒤로
          </Button>
        </View>

        <View className="mb-8">
          <Text className="text-2xl font-bold text-gray-900 mb-2">초대 코드 입력</Text>
          <Text className="text-gray-500">가족 또는 파트너에게 받은 6자리 코드를 입력하세요</Text>
        </View>

        <Controller
          control={control}
          name="inviteCode"
          render={({ field: { onChange, onBlur, value } }) => (
            <Input
              label="초대 코드"
              placeholder="예: ABC123"
              autoCapitalize="characters"
              autoCorrect={false}
              maxLength={6}
              value={value}
              onChangeText={(text) => onChange(text.toUpperCase())}
              onBlur={onBlur}
              error={errors.inviteCode?.message}
              required
            />
          )}
        />

        {previewCode.length === 6 && (
          <View className="mt-2 mb-6 p-4 bg-gray-50 rounded-xl">
            {previewLoading ? (
              <ActivityIndicator size="small" />
            ) : previewHousehold ? (
              <View>
                <Text className="text-xs text-gray-400 mb-1">가구 확인됨</Text>
                <Text className="font-semibold text-gray-800">{previewHousehold.name}</Text>
              </View>
            ) : (
              <Text className="text-danger-500 text-sm">유효하지 않거나 만료된 코드입니다</Text>
            )}
          </View>
        )}

        <Button
          variant="primary"
          size="lg"
          fullWidth
          loading={isPending}
          onPress={handleSubmit(onSubmit)}
          disabled={!previewHousehold}
        >
          참여 요청하기
        </Button>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
