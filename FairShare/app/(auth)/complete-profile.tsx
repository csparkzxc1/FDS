import React from 'react';
import { View, Text, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, Input } from '@/components/ui';
import { upsertUserProfile } from '@/services/authService';
import { useAuthStore } from '@/stores/authStore';

const schema = z.object({
  displayName: z.string().min(1, '이름을 입력해주세요').max(20, '이름은 최대 20자입니다'),
});

type Form = { displayName: string };

export default function CompleteProfileScreen() {
  const user = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<Form>({
    resolver: zodResolver(schema) as any,
    defaultValues: { displayName: '' },
  });

  const onSubmit = async (data: Form) => {
    if (!user) return;
    try {
      await upsertUserProfile(user.id, user.email ?? '', data.displayName);
      setUser({ ...user, displayName: data.displayName });
      router.replace('/');
    } catch {
      Alert.alert('오류', '프로필 저장에 실패했습니다.');
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1 px-6 justify-center"
      >
        <View className="mb-8">
          <Text className="text-6xl mb-4 text-center">👋</Text>
          <Text className="text-2xl font-bold text-gray-900 text-center mb-2">반갑습니다!</Text>
          <Text className="text-gray-500 text-center">앱에서 사용할 이름을 알려주세요</Text>
        </View>

        <Controller
          control={control}
          name="displayName"
          render={({ field: { onChange, onBlur, value } }) => (
            <Input
              label="이름"
              placeholder="예: 김민준"
              autoCapitalize="words"
              autoFocus
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              error={errors.displayName?.message}
              required
            />
          )}
        />

        <Button
          variant="primary"
          size="lg"
          fullWidth
          loading={isSubmitting}
          onPress={handleSubmit(onSubmit)}
          className="mt-4"
        >
          시작하기
        </Button>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
