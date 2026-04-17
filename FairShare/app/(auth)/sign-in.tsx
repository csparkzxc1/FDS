import React from 'react';
import {
  View,
  Text,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { Button, Input, Divider } from '@/components/ui';
import { signInWithEmail, signInWithApple, signInWithKakao } from '@/hooks/useAuth';
import { useAuthStore } from '@/stores/authStore';
import { IS_DEV_BYPASS } from '@/utils/devMode';

const signInSchema = z.object({
  email: z.string().email('올바른 이메일 주소를 입력해주세요'),
  password: z.string().min(8, '비밀번호는 최소 8자 이상이어야 합니다'),
});

type SignInForm = { email: string; password: string };

// Kakao brand colors must stay fixed per Kakao's design guidelines (no dark-mode inversion)
const styles = StyleSheet.create({
  kakaoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FEE500',
    borderRadius: 12,
    height: 52,
    marginBottom: 12,
    gap: 8,
  },
  kakaoIcon: { fontSize: 20, lineHeight: 24 },
  kakaoText: { fontSize: 16, fontWeight: '600', color: '#191919' },
});

export default function SignInScreen() {
  const { t } = useTranslation();
  const setUser = useAuthStore((s) => s.setUser);

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignInForm>({
    resolver: zodResolver(signInSchema) as any,
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = async (data: SignInForm) => {
    try {
      const result = await signInWithEmail(data.email, data.password);
      setUser(result.user);
      router.replace('/');
    } catch {
      Alert.alert('로그인 실패', '이메일 또는 비밀번호를 확인해주세요.');
    }
  };

  const onAppleSignIn = async () => {
    try {
      const result = await signInWithApple();
      setUser(result.user);
      if (!result.user.displayName) {
        router.replace('/(auth)/complete-profile');
      } else {
        router.replace('/');
      }
    } catch (e: any) {
      if (e?.code !== 'ERR_REQUEST_CANCELED') {
        Alert.alert('Apple 로그인 실패', '다시 시도해주세요.');
      }
    }
  };

  const onKakaoSignIn = async () => {
    try {
      const result = await signInWithKakao();
      setUser(result.user);
      if (!result.user.displayName) {
        router.replace('/(auth)/complete-profile');
      } else {
        router.replace('/');
      }
    } catch (e: any) {
      if (e?.code !== 'ERR_REQUEST_CANCELED') {
        Alert.alert('카카오 로그인 실패', '다시 시도해주세요.');
      }
    }
  };

  const onDevBypass = () => {
    router.replace('/');
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
          <View className="mb-10">
            <Text className="text-4xl mb-2">🏠</Text>
            <Text className="text-3xl font-bold text-gray-900 mb-2">FairShare</Text>
            <Text className="text-gray-500">공정한 집안일 분담</Text>
          </View>

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

          <TouchableOpacity style={styles.kakaoButton} onPress={onKakaoSignIn} activeOpacity={0.85}>
            <Text style={styles.kakaoIcon}>💬</Text>
            <Text style={styles.kakaoText}>카카오로 시작하기</Text>
          </TouchableOpacity>

          {Platform.OS === 'ios' && (
            <Button variant="outline" size="lg" fullWidth className="mb-3" onPress={onAppleSignIn}>
              {t('auth.continueWithApple')}
            </Button>
          )}

          {IS_DEV_BYPASS && (
            <Button
              variant="ghost"
              size="lg"
              fullWidth
              className="mb-3 border border-dashed border-warning-400"
              onPress={onDevBypass}
            >
              🛠 개발자 로그인 (DEV)
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
