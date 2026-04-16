import React, { forwardRef, useState } from 'react';
import {
  TextInput,
  View,
  Text,
  TouchableOpacity,
  TextInputProps,
} from 'react-native';
import { Colors, MIN_TOUCH_TARGET } from '@/constants/design-tokens';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  rightAction?: {
    label: string;
    onPress: () => void;
  };
  variant?: 'default' | 'filled' | 'outlined';
  required?: boolean;
}

export const Input = forwardRef<TextInput, InputProps>(
  (
    {
      label,
      error,
      hint,
      leftIcon,
      rightIcon,
      rightAction,
      variant = 'outlined',
      required,
      editable = true,
      ...props
    },
    ref
  ) => {
    const [focused, setFocused] = useState(false);

    const containerStyle = {
      default: `bg-gray-50 border-b border-gray-200 ${focused ? 'border-primary-500' : ''} ${error ? 'border-danger-500' : ''}`,
      filled: `bg-gray-100 rounded-xl ${focused ? 'bg-primary-50' : ''} ${error ? 'bg-danger-50' : ''}`,
      outlined: `bg-white border rounded-xl ${focused ? 'border-primary-500' : 'border-gray-200'} ${error ? 'border-danger-500' : ''}`,
    }[variant];

    return (
      <View className="mb-4">
        {label && (
          <Text className="text-sm font-medium text-gray-700 mb-1.5">
            {label}
            {required && <Text className="text-danger-500"> *</Text>}
          </Text>
        )}
        <View className={`flex-row items-center px-3 ${containerStyle}`} style={{ minHeight: MIN_TOUCH_TARGET }}>
          {leftIcon && <View className="mr-2">{leftIcon}</View>}
          <TextInput
            ref={ref}
            className="flex-1 text-base text-gray-900 py-3"
            placeholderTextColor={Colors.gray[400]}
            editable={editable}
            onFocus={(e) => {
              setFocused(true);
              props.onFocus?.(e);
            }}
            onBlur={(e) => {
              setFocused(false);
              props.onBlur?.(e);
            }}
            style={{ opacity: editable ? 1 : 0.5 }}
            accessibilityLabel={label}
            accessibilityHint={hint}
            {...props}
          />
          {rightIcon && <View className="ml-2">{rightIcon}</View>}
          {rightAction && (
            <TouchableOpacity onPress={rightAction.onPress} className="ml-2 py-1 px-2">
              <Text className="text-primary-500 font-medium text-sm">{rightAction.label}</Text>
            </TouchableOpacity>
          )}
        </View>
        {error && (
          <Text className="text-danger-500 text-xs mt-1" accessibilityRole="alert">
            {error}
          </Text>
        )}
        {hint && !error && (
          <Text className="text-gray-400 text-xs mt-1">{hint}</Text>
        )}
      </View>
    );
  }
);

Input.displayName = 'Input';
