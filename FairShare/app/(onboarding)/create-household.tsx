import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, Input, Card } from '@/components/ui';
import { useCreateHousehold } from '@/hooks/useHousehold';
import { Colors } from '@/constants/design-tokens';

type Mode = 'couple' | 'family' | 'roommate';

const MODE_OPTIONS: Array<{
  mode: Mode;
  emoji: string;
  title: string;
  desc: string;
  color: string;
}> = [
  {
    mode: 'couple',
    emoji: '💑',
    title: '커플 / 동거',
    desc: '둘이서 함께 가사를 분담해요',
    color: Colors.primary[50],
  },
  {
    mode: 'family',
    emoji: '👨‍👩‍👧',
    title: '가족',
    desc: '부모와 아이가 함께, 용돈 교육도 해요',
    color: Colors.kid[50],
  },
  {
    mode: 'roommate',
    emoji: '🏘️',
    title: '룸메이트',
    desc: '여러 명이 함께 공동 생활을 해요',
    color: Colors.success[50],
  },
];

export default function CreateHouseholdScreen() {
  const [name, setName] = useState('');
  const [selectedMode, setSelectedMode] = useState<Mode>('couple');
  const [pointRate, setPointRate] = useState('100');
  const { mutateAsync: createHousehold, isPending } = useCreateHousehold();

  const handleCreate = async () => {
    if (!name.trim()) {
      Alert.alert('알림', '가구 이름을 입력해주세요');
      return;
    }
    try {
      await createHousehold({
        name: name.trim(),
        mode: selectedMode,
        pointToCurrency: parseInt(pointRate, 10) || 100,
      });
      router.replace('/(onboarding)/setup-chores');
    } catch {
      Alert.alert('오류', '가구 생성에 실패했습니다. 다시 시도해주세요');
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
          contentContainerStyle={{ paddingTop: 40, paddingBottom: 40 }}
          keyboardShouldPersistTaps="handled"
        >
          <Text className="text-2xl font-bold text-gray-900 mb-2">가구 만들기</Text>
          <Text className="text-gray-500 mb-8">우리 집 정보를 설정해요</Text>

          <Input
            label="가구 이름"
            placeholder="예: 우리집, 행복한 가정"
            value={name}
            onChangeText={setName}
            maxLength={30}
            required
          />

          <Text className="text-sm font-medium text-gray-700 mb-3">가구 형태</Text>
          <View className="gap-3 mb-6">
            {MODE_OPTIONS.map((option) => (
              <TouchableOpacity
                key={option.mode}
                onPress={() => setSelectedMode(option.mode)}
                activeOpacity={0.7}
              >
                <View
                  className="flex-row items-center p-4 rounded-2xl border-2"
                  style={{
                    backgroundColor: selectedMode === option.mode ? option.color : Colors.white,
                    borderColor: selectedMode === option.mode ? Colors.primary[500] : Colors.gray[200],
                  }}
                >
                  <Text className="text-3xl mr-4">{option.emoji}</Text>
                  <View className="flex-1">
                    <Text className="font-semibold text-gray-900">{option.title}</Text>
                    <Text className="text-sm text-gray-500 mt-0.5">{option.desc}</Text>
                  </View>
                  {selectedMode === option.mode && (
                    <View
                      className="w-6 h-6 rounded-full items-center justify-center"
                      style={{ backgroundColor: Colors.primary[500] }}
                    >
                      <Text className="text-white text-xs font-bold">✓</Text>
                    </View>
                  )}
                </View>
              </TouchableOpacity>
            ))}
          </View>

          {selectedMode === 'family' && (
            <Input
              label="포인트 환율"
              hint={`1포인트 = ${parseInt(pointRate, 10) || 100}원`}
              placeholder="100"
              keyboardType="number-pad"
              value={pointRate}
              onChangeText={setPointRate}
              rightAction={{ label: '원', onPress: () => {} }}
            />
          )}

          <Button
            variant="primary"
            size="lg"
            fullWidth
            loading={isPending}
            disabled={!name.trim()}
            onPress={handleCreate}
            className="mt-4"
          >
            가구 만들기
          </Button>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
