import React from 'react';
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  View,
  TouchableOpacityProps,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { Colors, MIN_TOUCH_TARGET } from '@/constants/design-tokens';
import type { ButtonVariant, ButtonSize } from '@/types';

interface ButtonProps extends Omit<TouchableOpacityProps, 'style'> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
  children: React.ReactNode;
  haptic?: boolean;
}

const variantStyles: Record<ButtonVariant, { container: string; text: string }> = {
  primary: {
    container: 'bg-primary-500 active:bg-primary-600',
    text: 'text-white font-semibold',
  },
  secondary: {
    container: 'bg-primary-50 active:bg-primary-100',
    text: 'text-primary-600 font-semibold',
  },
  outline: {
    container: 'border border-primary-500 bg-transparent active:bg-primary-50',
    text: 'text-primary-500 font-semibold',
  },
  ghost: {
    container: 'bg-transparent active:bg-gray-100',
    text: 'text-gray-700 font-medium',
  },
  danger: {
    container: 'bg-danger-500 active:bg-danger-600',
    text: 'text-white font-semibold',
  },
  kid: {
    container: 'bg-kid-400 active:bg-kid-500',
    text: 'text-white font-bold',
  },
};

const sizeStyles: Record<ButtonSize, { container: string; text: string; minHeight: number }> = {
  sm: {
    container: 'px-3 py-2 rounded-lg',
    text: 'text-sm',
    minHeight: MIN_TOUCH_TARGET,
  },
  md: {
    container: 'px-5 py-3 rounded-xl',
    text: 'text-base',
    minHeight: MIN_TOUCH_TARGET,
  },
  lg: {
    container: 'px-6 py-4 rounded-2xl',
    text: 'text-lg',
    minHeight: MIN_TOUCH_TARGET,
  },
};

export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  leftIcon,
  rightIcon,
  fullWidth = false,
  children,
  disabled,
  haptic = true,
  onPress,
  ...props
}: ButtonProps) {
  const { container, text } = variantStyles[variant];
  const { container: sizeContainer, text: sizeText, minHeight } = sizeStyles[size];

  const isDisabled = disabled || loading;

  const handlePress = async (e: Parameters<NonNullable<TouchableOpacityProps['onPress']>>[0]) => {
    if (haptic && !isDisabled) {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    onPress?.(e);
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      disabled={isDisabled}
      activeOpacity={0.8}
      style={{ minHeight, opacity: isDisabled ? 0.5 : 1 }}
      className={`
        flex-row items-center justify-center
        ${container}
        ${sizeContainer}
        ${fullWidth ? 'w-full' : ''}
      `}
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      {...props}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={variant === 'outline' || variant === 'ghost' ? Colors.primary[500] : Colors.white}
        />
      ) : (
        <>
          {leftIcon && <View className="mr-2">{leftIcon}</View>}
          <Text className={`${text} ${sizeText}`}>{children}</Text>
          {rightIcon && <View className="ml-2">{rightIcon}</View>}
        </>
      )}
    </TouchableOpacity>
  );
}
