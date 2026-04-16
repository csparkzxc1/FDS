import { Stack } from 'expo-router';

export default function ModalsLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="chore-detail" options={{ presentation: 'modal' }} />
      <Stack.Screen name="approval-queue" options={{ presentation: 'modal' }} />
      <Stack.Screen name="add-chore" options={{ presentation: 'modal' }} />
      <Stack.Screen name="settle-allowance" options={{ presentation: 'modal' }} />
      <Stack.Screen name="reward-goal" options={{ presentation: 'modal' }} />
    </Stack>
  );
}
