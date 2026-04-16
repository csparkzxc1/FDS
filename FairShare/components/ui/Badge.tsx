import React from 'react';
import { View, Text } from 'react-native';
import type { BadgeVariant } from '@/types';

interface BadgeProps {
  label: string;
  variant?: BadgeVariant;
  dot?: boolean;
  pulse?: boolean;
}

const variantStyles: Record<BadgeVariant, { container: string; text: string }> = {
  default: { container: 'bg-gray-100', text: 'text-gray-600' },
  success: { container: 'bg-success-50', text: 'text-success-700' },
  warning: { container: 'bg-warning-50', text: 'text-warning-700' },
  danger: { container: 'bg-danger-50', text: 'text-danger-600' },
  info: { container: 'bg-primary-50', text: 'text-primary-600' },
  invisible: { container: 'bg-invisible-50', text: 'text-invisible-600' },
};

const dotColors: Record<BadgeVariant, string> = {
  default: 'bg-gray-400',
  success: 'bg-success-500',
  warning: 'bg-warning-500',
  danger: 'bg-danger-500',
  info: 'bg-primary-500',
  invisible: 'bg-invisible-500',
};

export function Badge({ label, variant = 'default', dot = false, pulse = false }: BadgeProps) {
  const { container, text } = variantStyles[variant];

  return (
    <View className={`flex-row items-center px-2 py-0.5 rounded-full ${container}`}>
      {dot && (
        <View className={`w-1.5 h-1.5 rounded-full mr-1.5 ${dotColors[variant]} ${pulse ? 'animate-pulse' : ''}`} />
      )}
      <Text className={`text-xs font-medium ${text}`}>{label}</Text>
    </View>
  );
}

// Numeric badge (for tab bar counts)
interface NumericBadgeProps {
  count: number;
  max?: number;
}

export function NumericBadge({ count, max = 99 }: NumericBadgeProps) {
  if (count <= 0) return null;
  const label = count > max ? `${max}+` : String(count);

  return (
    <View
      className="absolute -top-1.5 -right-1.5 min-w-5 h-5 bg-danger-500 rounded-full items-center justify-center px-1"
      accessibilityLabel={`${count} 개`}
    >
      <Text className="text-white text-xs font-bold">{label}</Text>
    </View>
  );
}
