import React, { useState } from 'react';
import {
  View,
  Text,
  KeyboardAvoidingView,
  Platform,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, Input } from '@/components/ui';
import { resetPassword } from '@/hooks/useAuth';

const schema = z.object({
  email: z.string().email('올바른 이메일 주소를 입력해주세요'),
});

type Form = z.infer<typeof schema>;

export default function ResetPasswordScreen() {
  const [sent, setSent] = useState(false);
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<Form>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: Form) => {
    try {
      await resetPassword(data.email);
      setSent(true);
    } catch {
      Alert.alert('오류', '이메일 전송에 실패했습니다. 다시 시도해주세요.');
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1 px-6"
      >
        <TouchableOpacity onPress={() => router.back()} className="mt-4 mb-8">
          <Text className="text-primary-500">← 뒤로</Text>
        </TouchableOpacity>

        {sent ? (
          <View className="flex-1 items-center justify-center">
            <Text className="text-5xl mb-4">📧</Text>
            <Text className="text-xl font-bold text-gray-900 mb-2">이메일을 확인하세요</Text>
            <Text className="text-gray-500 text-center">
              비밀번호 재설정 링크를 이메일로 보냈습니다
            </Text>
            <Button
              variant="primary"
              size="md"
              onPress={() => router.replace('/(auth)/sign-in')}
              className="mt-8"
            >
              로그인으로 돌아가기
            </Button>
          </View>
        ) : (
          <View>
            <Text className="text-2xl font-bold text-gray-900 mb-2">비밀번호 재설정</Text>
            <Text className="text-gray-500 mb-8">
              가입한 이메일 주소를 입력하면 재설정 링크를 보내드려요
            </Text>
            <Controller
              control={control}
              name="email"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  label="이메일"
                  placeholder="이메일 주소를 입력하세요"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  value={value ?? ''}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={errors.email?.message}
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
            >
              재설정 링크 보내기
            </Button>
          </View>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
