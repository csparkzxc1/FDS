/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,jsx,ts,tsx}',
    './components/**/*.{js,jsx,ts,tsx}',
  ],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#5B8DEF',
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
        },
        success: {
          DEFAULT: '#10B981',
          50: '#ECFDF5',
          100: '#D1FAE5',
          500: '#10B981',
          600: '#059669',
          700: '#047857',
        },
        warning: {
          DEFAULT: '#F59E0B',
          50: '#FFFBEB',
          100: '#FEF3C7',
          500: '#F59E0B',
          600: '#D97706',
          700: '#B45309',
        },
        danger: {
          DEFAULT: '#EF4444',
          50: '#FEF2F2',
          100: '#FEE2E2',
          500: '#EF4444',
          600: '#DC2626',
          700: '#B91C1C',
        },
        kid: {
          DEFAULT: '#F472B6',
          50: '#FDF2F8',
          100: '#FCE7F3',
          300: '#F9A8D4',
          400: '#F472B6',
          500: '#EC4899',
          600: '#DB2777',
        },
        invisible: {
          DEFAULT: '#8B5CF6',
          50: '#F5F3FF',
          100: '#EDE9FE',
          300: '#C4B5FD',
          400: '#A78BFA',
          500: '#8B5CF6',
          600: '#7C3AED',
        },
        surface: {
          DEFAULT: '#FFFFFF',
          secondary: '#F9FAFB',
          tertiary: '#F3F4F6',
        },
        'surface-dark': {
          DEFAULT: '#111827',
          secondary: '#1F2937',
          tertiary: '#374151',
        },
      },
      fontFamily: {
        pretendard: ['Pretendard', 'sans-serif'],
        inter: ['Inter', 'sans-serif'],
      },
      borderRadius: {
        '2xl': '16px',
        '3xl': '24px',
      },
    },
  },
  plugins: [],
};
