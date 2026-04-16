import { Tabs, Redirect } from 'expo-router';
import { View, Text } from 'react-native';
import { useAuth } from '@/hooks/useAuth';
import { useHouseholdStore } from '@/stores/householdStore';
import { Colors } from '@/constants/design-tokens';
import { NumericBadge } from '@/components/ui';

function TabIcon({
  emoji,
  label,
  focused,
  badge,
}: {
  emoji: string;
  label: string;
  focused: boolean;
  badge?: number;
}) {
  return (
    <View className="items-center pt-1">
      <View style={{ position: 'relative' }}>
        <Text style={{ fontSize: 22, opacity: focused ? 1 : 0.6 }}>{emoji}</Text>
        {badge ? <NumericBadge count={badge} /> : null}
      </View>
      <Text
        className="text-xs mt-0.5"
        style={{
          color: focused ? Colors.primary[500] : Colors.gray[400],
          fontWeight: focused ? '600' : '400',
        }}
      >
        {label}
      </Text>
    </View>
  );
}

export default function TabsLayout() {
  const { isAuthenticated } = useAuth();
  const pendingCount = useHouseholdStore((s) => s.pendingApprovalCount);

  if (!isAuthenticated) {
    return <Redirect href="/(auth)/sign-in" />;
  }

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: {
          backgroundColor: Colors.white,
          borderTopColor: Colors.gray[100],
          height: 72,
          paddingBottom: 8,
        },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon emoji="🏠" label="홈" focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="activity"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon emoji="📋" label="기록" focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="dashboard"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon emoji="📊" label="대시보드" focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon emoji="⚙️" label="설정" focused={focused} badge={pendingCount} />
          ),
        }}
      />
    </Tabs>
  );
}
