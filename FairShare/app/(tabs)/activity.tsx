import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '@/stores/authStore';
import { useHouseholdStore } from '@/stores/householdStore';
import { supabase } from '@/services/supabase';
import { Avatar, Badge, EmptyState, LoadingSpinner } from '@/components/ui';
import { formatDateTime } from '@/utils/date';
import { Colors } from '@/constants/design-tokens';
import type { ChoreLogRow, ChoreRow, UserRow } from '@/types/database';

type Filter = 'all' | 'mine' | 'pending';

interface LogEntry extends ChoreLogRow {
  chore: ChoreRow;
  performer: UserRow;
}

export default function ActivityScreen() {
  const [filter, setFilter] = useState<Filter>('all');
  const user = useAuthStore((s) => s.user);
  const household = useHouseholdStore((s) => s.current);

  const { data: logs = [], isLoading } = useQuery({
    queryKey: ['choreLogs', household?.householdId, filter],
    queryFn: async () => {
      if (!household?.householdId) return [];

      let query = supabase
        .from('chore_logs')
        .select('*, chore:chores(*), performer:users!performed_by(*)')
        .eq('household_id', household.householdId)
        .order('performed_at', { ascending: false })
        .limit(100);

      if (filter === 'mine') {
        query = query.eq('performed_by', user?.id ?? '');
      } else if (filter === 'pending') {
        query = query.eq('status', 'pending');
      }

      const { data, error } = await query;
      if (error) throw error;
      return (data ?? []) as unknown as LogEntry[];
    },
    enabled: !!household?.householdId,
  });

  const FILTERS: { key: Filter; label: string }[] = [
    { key: 'all', label: '전체' },
    { key: 'mine', label: '내 기록' },
    { key: 'pending', label: '승인 대기' },
  ];

  const statusBadge = (status: string) => {
    switch (status) {
      case 'approved': return <Badge label="승인됨" variant="success" dot />;
      case 'pending': return <Badge label="승인 대기" variant="warning" dot pulse />;
      case 'rejected': return <Badge label="반려됨" variant="danger" dot />;
      default: return null;
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-surface-secondary">
      {/* Header */}
      <View className="px-5 pt-4 pb-2">
        <Text className="text-2xl font-bold text-gray-900 mb-4">활동 기록</Text>
        <View className="flex-row gap-2">
          {FILTERS.map((f) => (
            <TouchableOpacity
              key={f.key}
              onPress={() => setFilter(f.key)}
              className="px-4 py-1.5 rounded-full"
              style={{
                backgroundColor: filter === f.key ? Colors.primary[500] : Colors.gray[100],
              }}
            >
              <Text
                className="text-sm font-medium"
                style={{ color: filter === f.key ? Colors.white : Colors.gray[600] }}
              >
                {f.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {isLoading ? (
        <LoadingSpinner fullScreen />
      ) : logs.length === 0 ? (
        <EmptyState
          emoji="📋"
          title="아직 기록이 없어요"
          description="집안일을 완료하면 여기에 기록이 남아요"
        />
      ) : (
        <FlatList
          data={logs}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 12, paddingBottom: 24 }}
          ItemSeparatorComponent={() => <View className="h-2" />}
          renderItem={({ item }) => (
            <View className="bg-white rounded-2xl p-4 flex-row items-center">
              <View
                className="w-12 h-12 rounded-xl items-center justify-center mr-3"
                style={{ backgroundColor: '#F3F4F6' }}
              >
                <Text className="text-2xl">{item.chore?.icon ?? '✨'}</Text>
              </View>
              <View className="flex-1">
                <Text className="font-semibold text-gray-900">{item.chore?.title}</Text>
                <View className="flex-row items-center mt-0.5">
                  <Avatar
                    uri={item.performer?.avatar_url}
                    name={item.performer?.display_name ?? '?'}
                    size="xs"
                  />
                  <Text className="text-xs text-gray-500 ml-1.5">
                    {item.performer?.display_name} · {formatDateTime(item.performed_at)}
                  </Text>
                </View>
                {item.status === 'rejected' && item.rejected_reason && (
                  <Text className="text-xs text-danger-500 mt-1">
                    반려 사유: {item.rejected_reason}
                  </Text>
                )}
              </View>
              <View className="items-end gap-1">
                <Text className="text-primary-500 font-bold text-sm">+{item.points_awarded}pt</Text>
                {statusBadge(item.status)}
              </View>
            </View>
          )}
        />
      )}
    </SafeAreaView>
  );
}
