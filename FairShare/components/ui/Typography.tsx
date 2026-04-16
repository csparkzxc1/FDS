import React from 'react';
import { Text, TextProps } from 'react-native';

interface TypographyProps extends TextProps {
  children: React.ReactNode;
  color?: string;
}

export function Heading1({ children, className = '', style, ...props }: TypographyProps) {
  return (
    <Text
      className={`text-3xl font-bold text-gray-900 ${className}`}
      style={style}
      {...props}
    >
      {children}
    </Text>
  );
}

export function Heading2({ children, className = '', style, ...props }: TypographyProps) {
  return (
    <Text
      className={`text-2xl font-bold text-gray-900 ${className}`}
      style={style}
      {...props}
    >
      {children}
    </Text>
  );
}

export function Heading3({ children, className = '', style, ...props }: TypographyProps) {
  return (
    <Text
      className={`text-xl font-semibold text-gray-900 ${className}`}
      style={style}
      {...props}
    >
      {children}
    </Text>
  );
}

export function Body({ children, className = '', style, ...props }: TypographyProps) {
  return (
    <Text
      className={`text-base text-gray-700 leading-relaxed ${className}`}
      style={style}
      {...props}
    >
      {children}
    </Text>
  );
}

export function BodySmall({ children, className = '', style, ...props }: TypographyProps) {
  return (
    <Text
      className={`text-sm text-gray-600 ${className}`}
      style={style}
      {...props}
    >
      {children}
    </Text>
  );
}

export function Caption({ children, className = '', style, ...props }: TypographyProps) {
  return (
    <Text
      className={`text-xs text-gray-400 ${className}`}
      style={style}
      {...props}
    >
      {children}
    </Text>
  );
}

export function Label({ children, className = '', style, ...props }: TypographyProps) {
  return (
    <Text
      className={`text-sm font-semibold text-gray-700 ${className}`}
      style={style}
      {...props}
    >
      {children}
    </Text>
  );
}
