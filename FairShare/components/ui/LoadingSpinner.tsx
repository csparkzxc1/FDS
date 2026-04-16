import React from 'react';
import { ActivityIndicator, View, Text } from 'react-native';
import { Colors } from '@/constants/design-tokens';

interface LoadingSpinnerProps {
  size?: 'small' | 'large';
  message?: string;
  fullScreen?: boolean;
  color?: string;
}

export function LoadingSpinner({
  size = 'large',
  message,
  fullScreen = false,
  color = Colors.primary[500],
}: LoadingSpinnerProps) {
  const content = (
    <View className="items-center justify-center gap-3">
      <ActivityIndicator size={size} color={color} />
      {message && (
        <Text className="text-gray-500 text-sm text-center">{message}</Text>
      )}
    </View>
  );

  if (fullScreen) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        {content}
      </View>
    );
  }

  return content;
}
