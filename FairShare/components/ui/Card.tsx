import React from 'react';
import { View, TouchableOpacity, ViewProps } from 'react-native';
import { Shadow } from '@/constants/design-tokens';

interface CardProps extends ViewProps {
  variant?: 'default' | 'elevated' | 'outlined' | 'ghost';
  onPress?: () => void;
  children: React.ReactNode;
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

const paddingStyles = {
  none: '',
  sm: 'p-3',
  md: 'p-4',
  lg: 'p-6',
};

const variantContainerStyles = {
  default: 'bg-white rounded-2xl',
  elevated: 'bg-white rounded-2xl',
  outlined: 'bg-white rounded-2xl border border-gray-200',
  ghost: 'bg-transparent',
};

export function Card({
  variant = 'default',
  onPress,
  children,
  padding = 'md',
  className = '',
  ...props
}: CardProps) {
  const containerStyle = `${variantContainerStyles[variant]} ${paddingStyles[padding]} ${className}`;
  const shadowStyle = variant === 'elevated' ? Shadow.DEFAULT : variant === 'default' ? Shadow.sm : undefined;

  if (onPress) {
    return (
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.75}
        style={shadowStyle}
        className={containerStyle}
        accessibilityRole="button"
      >
        {children}
      </TouchableOpacity>
    );
  }

  return (
    <View style={shadowStyle} className={containerStyle} {...props}>
      {children}
    </View>
  );
}

// Convenience sub-components
Card.Header = function CardHeader({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <View className={`mb-3 ${className}`}>{children}</View>;
};

Card.Body = function CardBody({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <View className={className}>{children}</View>;
};

Card.Footer = function CardFooter({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <View className={`mt-3 pt-3 border-t border-gray-100 ${className}`}>{children}</View>;
};
