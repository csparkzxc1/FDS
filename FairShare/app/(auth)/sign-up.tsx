import React from 'react';
import {
  View,
  Text,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, Input } from '@/components/ui';
import { signUpWithEmail } from '@/hooks/useAuth';

const signUpSchema = z
  .object({
    displayName: z.string().min(1, '이름을 입력해주세요').max(20, '이름은 최대 20자입니다'),
    email: z.string().email('올바른 이메일 주소를 입력해주세요'),
    password: z.string().min(8, '비밀번호는 최소 8자 이상이어야 합니다'),
    passwordConfirm: z.string(),
  })
  .refine((d) => d.password === d.passwordConfirm, {
    message: '비밀번호가 일치하지 않습니다',
    path: ['passwordConfirm'],
  });

type SignUpForm = z.infer<typeof signUpSchema>;

export default function SignUpScreen() {
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignUpForm>({
    resolver: zodResolver(signUpSchema),
    defaultValues: { displayName: '', email: '', password: '', passwordConfirm: '' },
  });

  const onSubmit = async (data: SignUpForm) => {
    try {
      await signUpWithEmail(data.email, data.password, data.displayName);
      Alert.alert('회원가입 완료', '이메일 인증 후 로그인해주세요.', [
        { text: '확인', onPress: () => router.replace('/(auth)/sign-in') },
      ]);
    } catch (error) {
      Alert.alert('회원가입 실패', '다시 시도해주세요.');
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <ScrollView
          className="flex-1 px-6"
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ paddingTop: 40, paddingBottom: 40 }}
        >
          <View className="mb-8">
            <Text className="text-2xl font-bold text-gray-900 mb-1">회원가입</Text>
            <Text className="text-gray-500">FairShare와 함께 공정한 생활을 시작하세요</Text>
          </View>

          <Controller
            control={control}
            name="displayName"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                label="이름"
                placeholder="예: 김민준"
                autoCapitalize="words"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                error={errors.displayName?.message}
                required
              />
            )}
          />
          <Controller
            control={control}
            name="email"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                label="이메일"
                placeholder="이메일 주소를 입력하세요"
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                error={errors.email?.message}
                required
              />
            )}
          />
          <Controller
            control={control}
            name="password"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                label="비밀번호"
                placeholder="8자 이상 입력하세요"
                secureTextEntry
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                error={errors.password?.message}
                required
              />
            )}
          />
          <Controller
            control={control}
            name="passwordConfirm"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                label="비밀번호 확인"
                placeholder="비밀번호를 다시 입력하세요"
                secureTextEntry
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                error={errors.passwordConfirm?.message}
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
            className="mt-2"
          >
            회원가입
          </Button>

          <View className="flex-row justify-center mt-6">
            <Text className="text-gray-500">이미 계정이 있으신가요? </Text>
            <Link href="/(auth)/sign-in" asChild>
              <Text className="text-primary-500 font-semibold">로그인</Text>
            </Link>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
