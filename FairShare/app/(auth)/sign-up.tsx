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
import { useAuthStore } from '@/stores/authStore';

const signUpSchema = z
  .object({
    displayName: z.string().min(1, '이름을 입력해주세요').max(20, '이름은 최대 20자입니다'),
    email: z.string().email('올바른 이메일 주소를 입력해주세요'),
    password: z
      .string()
      .min(8, '비밀번호는 최소 8자 이상이어야 합니다')
      .regex(/[a-zA-Z]/, '영문자를 포함해야 합니다')
      .regex(/[0-9]/, '숫자를 포함해야 합니다'),
    passwordConfirm: z.string(),
  })
  .refine((d) => d.password === d.passwordConfirm, {
    message: '비밀번호가 일치하지 않습니다',
    path: ['passwordConfirm'],
  });

type SignUpForm = {
  displayName: string;
  email: string;
  password: string;
  passwordConfirm: string;
};

export default function SignUpScreen() {
  const setUser = useAuthStore((s) => s.setUser);

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignUpForm>({
    resolver: zodResolver(signUpSchema) as any,
    defaultValues: { displayName: '', email: '', password: '', passwordConfirm: '' },
  });

  const onSubmit = async (data: SignUpForm) => {
    try {
      const result = await signUpWithEmail(data.email, data.password, data.displayName);
      setUser(result.user);
      router.replace('/');
    } catch (error: any) {
      const msg =
        error?.message?.includes('already registered')
          ? '이미 사용중인 이메일입니다.'
          : '회원가입에 실패했습니다. 다시 시도해주세요.';
      Alert.alert('회원가입 실패', msg);
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
                placeholder="영문+숫자 포함 8자 이상"
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
