import { Redirect } from 'expo-router';
import { useAuth } from '@/hooks/useAuth';
import { useMyHousehold } from '@/hooks/queries/useHousehold';
import { LoadingSpinner } from '@/components/ui';

export default function Index() {
  const { user, isLoading: authLoading } = useAuth();
  const { data: householdData, isLoading: householdLoading } = useMyHousehold(user?.id);

  if (authLoading || (user && householdLoading)) {
    return <LoadingSpinner fullScreen />;
  }

  if (!user) {
    return <Redirect href="/(auth)/sign-in" />;
  }

  if (!householdData) {
    return <Redirect href="/(onboarding)/welcome" />;
  }

  if (householdData.memberStatus === 'pending') {
    return <Redirect href="/(onboarding)/pending-approval" />;
  }

  return <Redirect href="/(tabs)/home" />;
}
