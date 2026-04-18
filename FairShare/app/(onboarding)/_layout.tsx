import { Stack, Redirect } from 'expo-router';
import { useAuth } from '@/hooks/useAuth';

export default function OnboardingLayout() {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Redirect href="/(auth)/sign-in" />;
  }

  return (
    <Stack screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
      <Stack.Screen name="welcome" />
      <Stack.Screen name="household-choice" />
      <Stack.Screen name="create-household" />
      <Stack.Screen name="join-household" />
      <Stack.Screen name="pending-approval" />
      <Stack.Screen name="setup-chores" />
    </Stack>
  );
}
