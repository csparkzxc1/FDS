import React, { useEffect, useRef } from 'react';
import { Animated, Text, View } from 'react-native';
import { Colors } from '@/constants/design-tokens';

interface PointCounterProps {
  points: number;
  size?: 'sm' | 'md' | 'lg';
  animate?: boolean;
  showLabel?: boolean;
}

const sizeConfig = {
  sm: { fontSize: 16, labelSize: 11 },
  md: { fontSize: 24, labelSize: 13 },
  lg: { fontSize: 36, labelSize: 16 },
};

export function PointCounter({ points, size = 'md', animate = false, showLabel = true }: PointCounterProps) {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const { fontSize, labelSize } = sizeConfig[size];

  useEffect(() => {
    if (animate) {
      Animated.sequence([
        Animated.spring(scaleAnim, { toValue: 1.3, useNativeDriver: true, speed: 20 }),
        Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true, speed: 15 }),
      ]).start();
    }
  }, [points, animate]);

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }} className="flex-row items-baseline">
      <Text style={{ fontSize, fontWeight: '700', color: Colors.primary[600] }}>{points}</Text>
      {showLabel && (
        <Text style={{ fontSize: labelSize, fontWeight: '600', color: Colors.primary[400], marginLeft: 2 }}>
          pt
        </Text>
      )}
    </Animated.View>
  );
}

// Animated point burst (집안일 체크 시 포인트가 날아가는 애니메이션)
export function PointBurst({ points, visible }: { points: number; visible: boolean }) {
  const translateY = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      translateY.setValue(0);
      opacity.setValue(1);
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: -60,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.sequence([
          Animated.delay(400),
          Animated.timing(opacity, {
            toValue: 0,
            duration: 400,
            useNativeDriver: true,
          }),
        ]),
      ]).start();
    }
  }, [visible]);

  if (!visible) return null;

  return (
    <Animated.View
      style={{
        position: 'absolute',
        transform: [{ translateY }],
        opacity,
        zIndex: 10,
      }}
      pointerEvents="none"
    >
      <View className="bg-primary-500 px-2 py-1 rounded-full">
        <Text className="text-white font-bold text-sm">+{points}pt</Text>
      </View>
    </Animated.View>
  );
}
