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
import { Link } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { Button, Input, Divider } from '@/components/ui';
import { signInWithEmail } from '@/hooks/useAuth';

const signInSchema = z.object({
  email: z.string().email('올바른 이메일 주소를 입력해주세요'),
  password: z.string().min(8, '비밀번호는 최소 8자 이상이어야 합니다'),
});

type SignInForm = z.infer<typeof signInSchema>;

export default function SignInScreen() {
  const { t } = useTranslation();
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignInForm>({
    resolver: zodResolver(signInSchema),
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = async (data: SignInForm) => {
    try {
      await signInWithEmail(data.email, data.password);
    } catch (error) {
      Alert.alert(
        '로그인 실패',
        '이메일 또는 비밀번호를 확인해주세요.'
      );
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
          contentContainerStyle={{ paddingTop: 60, paddingBottom: 40 }}
        >
          {/* Header */}
          <View className="mb-10">
            <Text className="text-4xl mb-2">🏠</Text>
            <Text className="text-3xl font-bold text-gray-900 mb-2">FairShare</Text>
            <Text className="text-gray-500">공정한 집안일 분담</Text>
          </View>

          {/* Form */}
          <View className="mb-6">
            <Controller
              control={control}
              name="email"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  label="이메일"
                  placeholder={t('auth.emailPlaceholder')}
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
                  placeholder={t('auth.passwordPlaceholder')}
                  secureTextEntry
                  autoComplete="password"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={errors.password?.message}
                  required
                />
              )}
            />
          </View>

          <Link href="/(auth)/reset-password" asChild>
            <Text className="text-primary-500 text-sm text-right mb-6">
              {t('auth.forgotPassword')}
            </Text>
          </Link>

          <Button
            variant="primary"
            size="lg"
            fullWidth
            loading={isSubmitting}
            onPress={handleSubmit(onSubmit)}
          >
            {t('auth.signIn')}
          </Button>

          <Divider label="또는" className="my-6" />

          {/* Social Sign In – placeholders for Phase 2 */}
          <Button variant="outline" size="lg" fullWidth className="mb-3">
            {t('auth.continueWithKakao')}
          </Button>
          {Platform.OS === 'ios' && (
            <Button variant="outline" size="lg" fullWidth>
              {t('auth.continueWithApple')}
            </Button>
          )}

          <View className="flex-row justify-center mt-8">
            <Text className="text-gray-500">{t('auth.dontHaveAccount')} </Text>
            <Link href="/(auth)/sign-up" asChild>
              <Text className="text-primary-500 font-semibold">{t('auth.signUp')}</Text>
            </Link>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
