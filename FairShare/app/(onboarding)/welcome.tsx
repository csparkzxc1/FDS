import React, { useRef, useState } from 'react';
import { View, Text, Dimensions, FlatList, ViewToken } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '@/components/ui';
import { Colors } from '@/constants/design-tokens';

const { width } = Dimensions.get('window');

const SLIDES = [
  {
    key: '1',
    emoji: '⚖️',
    title: '집안일을 공정하게',
    desc: '누가 얼마나 했는지\n투명하게 기록해요',
    bg: '#EEF4FF',
  },
  {
    key: '2',
    emoji: '🧠',
    title: '보이지 않는 노동도 포인트로',
    desc: '병원 예약, 준비물 챙기기 등\n정신노동도 인정받아요',
    bg: '#F5F3FF',
  },
  {
    key: '3',
    emoji: '🎁',
    title: '아이 용돈 교육까지',
    desc: '집안일로 포인트를 모아\n용돈으로 환산해요',
    bg: '#FDF2F8',
  },
];

export default function WelcomeScreen() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  const onViewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      if (viewableItems[0]) {
        setCurrentIndex(Number(viewableItems[0].index));
      }
    }
  ).current;

  const handleNext = () => {
    if (currentIndex < SLIDES.length - 1) {
      flatListRef.current?.scrollToIndex({ index: currentIndex + 1 });
    } else {
      router.push('/(onboarding)/household-choice');
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <FlatList
        ref={flatListRef}
        data={SLIDES}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item.key}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={{ viewAreaCoveragePercentThreshold: 50 }}
        renderItem={({ item }) => (
          <View style={{ width }} className="flex-1 items-center justify-center px-8">
            <View
              className="w-32 h-32 rounded-full items-center justify-center mb-8"
              style={{ backgroundColor: item.bg }}
            >
              <Text className="text-6xl">{item.emoji}</Text>
            </View>
            <Text className="text-2xl font-bold text-gray-900 text-center mb-4">
              {item.title}
            </Text>
            <Text className="text-base text-gray-500 text-center leading-6">{item.desc}</Text>
          </View>
        )}
      />

      {/* Pagination dots */}
      <View className="flex-row justify-center mb-8">
        {SLIDES.map((_, i) => (
          <View
            key={i}
            className="mx-1 rounded-full"
            style={{
              width: i === currentIndex ? 20 : 6,
              height: 6,
              backgroundColor: i === currentIndex ? Colors.primary[500] : Colors.gray[200],
            }}
          />
        ))}
      </View>

      <View className="px-6 pb-6">
        <Button variant="primary" size="lg" fullWidth onPress={handleNext}>
          {currentIndex < SLIDES.length - 1 ? '다음' : '시작하기'}
        </Button>
        {currentIndex < SLIDES.length - 1 && (
          <Button
            variant="ghost"
            size="md"
            fullWidth
            onPress={() => router.push('/(onboarding)/household-choice')}
            className="mt-2"
          >
            건너뛰기
          </Button>
        )}
      </View>
    </SafeAreaView>
  );
}
