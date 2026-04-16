import { Redirect } from 'expo-router';
import { useAuth } from '@/hooks/useAuth';
import { useHousehold } from '@/hooks/useHousehold';
import { LoadingSpinner } from '@/components/ui';

export default function Index() {
  const { isAuthenticated, isInitialized } = useAuth();
  const { data: household, isLoading: householdLoading } = useHousehold();

  if (!isInitialized || householdLoading) {
    return <LoadingSpinner fullScreen />;
  }

  if (!isAuthenticated) {
    return <Redirect href="/(auth)/sign-in" />;
  }

  if (!household) {
    return <Redirect href="/(onboarding)/welcome" />;
  }

  return <Redirect href="/(tabs)/home" />;
}
