import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, Card } from '@/components/ui';

export default function HouseholdChoiceScreen() {
  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView
        className="flex-1 px-6"
        contentContainerStyle={{ paddingTop: 48, paddingBottom: 40 }}
      >
        <Text className="text-2xl font-bold text-gray-900 mb-2">어떻게 시작할까요?</Text>
        <Text className="text-gray-500 mb-10">가구를 새로 만들거나, 초대받은 가구에 참여하세요</Text>

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

        <Card
          variant="outlined"
          onPress={() => router.push('/(onboarding)/join-household')}
        >
          <View className="flex-row items-center">
            <View className="w-14 h-14 bg-success-50 rounded-2xl items-center justify-center mr-4">
              <Text className="text-3xl">🔑</Text>
            </View>
            <View className="flex-1">
              <Text className="text-lg font-semibold text-gray-900">초대 코드로 참여</Text>
              <Text className="text-sm text-gray-500 mt-0.5">
                가족이나 파트너에게 받은 6자리 코드를 입력하세요
              </Text>
            </View>
            <Text className="text-gray-400 text-lg">→</Text>
          </View>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}
