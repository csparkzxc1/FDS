import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';

interface Props {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('[ErrorBoundary]', error, info.componentStack);
  }

  reset = () => this.setState({ hasError: false, error: null });

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;

      return (
        <View className="flex-1 items-center justify-center px-8 bg-white">
          <Text className="text-5xl mb-4">😵</Text>
          <Text className="text-xl font-bold text-gray-900 mb-2 text-center">
            문제가 발생했어요
          </Text>
          <Text className="text-sm text-gray-500 text-center mb-8">
            잠시 후 다시 시도해주세요
          </Text>
          <TouchableOpacity
            onPress={this.reset}
            className="px-6 py-3 bg-primary-500 rounded-full"
          >
            <Text className="text-white font-semibold">다시 시도</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return this.props.children;
  }
}
