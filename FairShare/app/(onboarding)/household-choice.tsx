import React, { useState } from 'react';
import {
  View,
  Text,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, Input, Card } from '@/components/ui';
import { useJoinHousehold } from '@/hooks/useHousehold';

export default function HouseholdChoiceScreen() {
  const [inviteCode, setInviteCode] = useState('');
  const { mutateAsync: joinHousehold, isPending } = useJoinHousehold();

  const handleJoin = async () => {
    if (inviteCode.trim().length !== 6) {
      Alert.alert('오류', '초대 코드는 6자리입니다');
      return;
    }
    try {
      await joinHousehold(inviteCode.trim());
      router.replace('/(tabs)/home');
    } catch (error: any) {
      if (error.message === 'INVALID_CODE') {
        Alert.alert('오류', '올바르지 않거나 만료된 초대 코드입니다');
      } else {
        Alert.alert('오류', '참여에 실패했습니다. 다시 시도해주세요');
      }
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
          contentContainerStyle={{ paddingTop: 48, paddingBottom: 40 }}
          keyboardShouldPersistTaps="handled"
        >
          <Text className="text-2xl font-bold text-gray-900 mb-2">어떻게 시작할까요?</Text>
          <Text className="text-gray-500 mb-10">가구를 새로 만들거나, 초대받은 가구에 참여하세요</Text>

          {/* Create new */}
          <Card
            variant="elevated"
            onPress={() => router.push('/(onboarding)/create-household')}
            className="mb-4"
          >
            <View className="flex-row items-center">
              <View className="w-14 h-14 bg-primary-50 rounded-2xl items-center justify-center mr-4">
                <Text className="text-3xl">🏠</Text>
              </View>
              <View className="flex-1">
                <Text className="text-lg font-semibold text-gray-900">새 가구 만들기</Text>
                <Text className="text-sm text-gray-500 mt-0.5">
                  가구 이름과 모드를 설정하고 초대 코드를 공유하세요
                </Text>
              </View>
              <Text className="text-gray-400 text-lg">→</Text>
            </View>
          </Card>

          {/* Join via invite code */}
          <Card variant="outlined" className="mb-8">
            <Text className="text-lg font-semibold text-gray-900 mb-4">초대 코드로 참여</Text>
            <Input
              placeholder="초대 코드 6자리 입력"
              value={inviteCode}
              onChangeText={(text) => setInviteCode(text.toUpperCase())}
              maxLength={6}
              autoCapitalize="characters"
              autoCorrect={false}
            />
            <Button
              variant="secondary"
              size="md"
              fullWidth
              onPress={handleJoin}
              loading={isPending}
              disabled={inviteCode.length !== 6}
            >
              참여하기
            </Button>
          </Card>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
