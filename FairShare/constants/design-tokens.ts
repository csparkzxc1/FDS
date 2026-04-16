/**
 * FairShare Design Tokens
 * Single source of truth for all design values.
 * Use these in NativeWind className OR StyleSheet.create.
 */

export const Colors = {
  // Primary (차분한 블루)
  primary: {
    50: '#EEF4FF',
    100: '#D9E8FF',
    200: '#B3D0FF',
    300: '#8DB8FF',
    400: '#6DA0FF',
    500: '#5B8DEF',
    600: '#3A6FD0',
    700: '#2A54A8',
    800: '#1D3B7A',
    900: '#112350',
    DEFAULT: '#5B8DEF',
  },
  // Success
  success: {
    50: '#ECFDF5',
    100: '#D1FAE5',
    500: '#10B981',
    600: '#059669',
    700: '#047857',
    DEFAULT: '#10B981',
  },
  // Warning
  warning: {
    50: '#FFFBEB',
    100: '#FEF3C7',
    500: '#F59E0B',
    600: '#D97706',
    700: '#B45309',
    DEFAULT: '#F59E0B',
  },
  // Danger
  danger: {
    50: '#FEF2F2',
    100: '#FEE2E2',
    500: '#EF4444',
    600: '#DC2626',
    700: '#B91C1C',
    DEFAULT: '#EF4444',
  },
  // Kid accent (밝은 핑크)
  kid: {
    50: '#FDF2F8',
    100: '#FCE7F3',
    300: '#F9A8D4',
    400: '#F472B6',
    500: '#EC4899',
    600: '#DB2777',
    DEFAULT: '#F472B6',
  },
  // Invisible labor (보라)
  invisible: {
    50: '#F5F3FF',
    100: '#EDE9FE',
    300: '#C4B5FD',
    400: '#A78BFA',
    500: '#8B5CF6',
    600: '#7C3AED',
    DEFAULT: '#8B5CF6',
  },
  // Neutral
  gray: {
    50: '#F9FAFB',
    100: '#F3F4F6',
    200: '#E5E7EB',
    300: '#D1D5DB',
    400: '#9CA3AF',
    500: '#6B7280',
    600: '#4B5563',
    700: '#374151',
    800: '#1F2937',
    900: '#111827',
  },
  // Semantic surface
  surface: {
    primary: '#FFFFFF',
    secondary: '#F9FAFB',
    tertiary: '#F3F4F6',
  },
  surfaceDark: {
    primary: '#111827',
    secondary: '#1F2937',
    tertiary: '#374151',
  },
  // Text
  text: {
    primary: '#111827',
    secondary: '#6B7280',
    disabled: '#9CA3AF',
    inverse: '#FFFFFF',
  },
  textDark: {
    primary: '#F9FAFB',
    secondary: '#9CA3AF',
    disabled: '#6B7280',
    inverse: '#111827',
  },
  // Background
  background: '#F9FAFB',
  backgroundDark: '#111827',
  white: '#FFFFFF',
  black: '#000000',
  transparent: 'transparent',
} as const;

export const Spacing = {
  0: 0,
  0.5: 2,
  1: 4,
  1.5: 6,
  2: 8,
  2.5: 10,
  3: 12,
  4: 16,
  5: 20,
  6: 24,
  7: 28,
  8: 32,
  9: 36,
  10: 40,
  12: 48,
  14: 56,
  16: 64,
  20: 80,
  24: 96,
} as const;

export const BorderRadius = {
  none: 0,
  sm: 4,
  DEFAULT: 8,
  md: 8,
  lg: 12,
  xl: 16,
  '2xl': 20,
  '3xl': 24,
  full: 9999,
} as const;

export const FontSize = {
  xs: 12,
  sm: 14,
  base: 16,
  lg: 18,
  xl: 20,
  '2xl': 24,
  '3xl': 30,
  '4xl': 36,
  '5xl': 48,
} as const;

export const FontWeight = {
  normal: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
  extrabold: '800' as const,
};

export const LineHeight = {
  tight: 1.25,
  snug: 1.375,
  normal: 1.5,
  relaxed: 1.625,
} as const;

export const Shadow = {
  sm: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  DEFAULT: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  md: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 8,
  },
} as const;

export const Animation = {
  duration: {
    fast: 150,
    normal: 250,
    slow: 400,
    verySlow: 600,
  },
  easing: {
    easeIn: 'ease-in',
    easeOut: 'ease-out',
    easeInOut: 'ease-in-out',
    spring: 'spring',
  },
} as const;

// Touch target minimum (accessibility)
export const MIN_TOUCH_TARGET = 44;

// Category color mapping
export const CategoryColors: Record<string, string> = {
  cleaning: Colors.primary[500],
  cooking: Colors.success[500],
  laundry: Colors.warning[500],
  invisible: Colors.invisible[500],
  care: Colors.kid[500],
  etc: Colors.gray[400],
};

// Category icon mapping
export const CategoryIcons: Record<string, string> = {
  cleaning: '🧹',
  cooking: '🍳',
  laundry: '🧺',
  invisible: '🧠',
  care: '💝',
  etc: '✨',
};

export const CATEGORY_LABELS: Record<string, string> = {
  cleaning: '청소',
  cooking: '요리',
  laundry: '세탁',
  invisible: '정신노동',
  care: '돌봄',
  etc: '기타',
};

export type ColorToken = typeof Colors;
export type SpacingToken = typeof Spacing;
