import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Alert,
  TextInput,
  Image,
  Modal,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '@/stores/authStore';
import { useHouseholdStore } from '@/stores/householdStore';
import { usePendingApprovals, useApproveChoreLog, useRejectChoreLog } from '@/hooks/queries/useChores';
import { Avatar, Button, EmptyState, LoadingSpinner } from '@/components/ui';
import { formatDateTime } from '@/utils/date';

export default function ApprovalQueueModal() {
  const user = useAuthStore((s) => s.user);
  const household = useHouseholdStore((s) => s.current);

  const [rejectTarget, setRejectTarget] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  const { data: pending = [], isLoading } = usePendingApprovals(household?.householdId);
  const { mutateAsync: approve, isPending: approving } = useApproveChoreLog();
  const { mutateAsync: reject, isPending: rejecting } = useRejectChoreLog();

  const handleReject = async () => {
    if (!rejectReason.trim()) {
      Alert.alert('알림', '반려 사유를 입력해주세요');
      return;
    }
    if (rejectTarget) {
      await reject({ logId: rejectTarget, reason: rejectReason.trim() });
      setRejectTarget(null);
      setRejectReason('');
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="items-center py-3">
        <View className="w-10 h-1 bg-gray-200 rounded-full" />
      </View>

      <View className="flex-row items-center justify-between px-6 pb-4">
        <Text className="text-xl font-bold text-gray-900">승인 대기</Text>
        <TouchableOpacity onPress={() => router.back()}>
          <Text className="text-gray-400 text-lg">✕</Text>
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <LoadingSpinner fullScreen />
      ) : pending.length === 0 ? (
        <EmptyState
          emoji="✅"
          title="모두 처리되었어요"
          description="대기 중인 승인 항목이 없습니다"
        />
      ) : (
        <FlatList
          data={pending}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 24 }}
          ItemSeparatorComponent={() => <View className="h-3" />}
          renderItem={({ item }) => {
            const log = item as any;
            return (
              <View className="bg-gray-50 rounded-2xl p-4">
                <View className="flex-row items-center mb-3">
                  <View className="w-12 h-12 bg-white rounded-xl items-center justify-center mr-3">
                    <Text className="text-2xl">{log.chore?.icon ?? '✨'}</Text>
                  </View>
                  <View className="flex-1">
                    <Text className="font-semibold text-gray-900">{log.chore?.title ?? '집안일'}</Text>
                    <View className="flex-row items-center mt-0.5">
                      <Avatar
                        uri={log.performer?.avatar_url}
                        name={log.performer?.display_name ?? '?'}
                        size="xs"
                      />
                      <Text className="text-xs text-gray-500 ml-1.5">
                        {log.performer?.display_name} · {formatDateTime(item.performed_at)}
                      </Text>
                    </View>
                  </View>
                  <Text className="font-bold text-primary-500">+{item.points_awarded}pt</Text>
                </View>

                {item.photo_url && (
                  <Image
                    source={{ uri: item.photo_url }}
                    className="w-full h-40 rounded-xl mb-3"
                    resizeMode="cover"
                  />
                )}

                {item.note && (
                  <Text className="text-sm text-gray-500 mb-3 bg-white rounded-xl px-3 py-2">
                    {item.note}
                  </Text>
                )}

                <View className="flex-row gap-3">
                  <Button
                    variant="danger"
                    size="sm"
                    onPress={() => setRejectTarget(item.id)}
                    className="flex-1"
                  >
                    반려
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    onPress={() => approve({ logId: item.id, approverId: user?.id ?? '' })}
                    loading={approving}
                    className="flex-1"
                  >
                    승인
                  </Button>
                </View>
              </View>
            );
          }}
        />
      )}

      <Modal visible={!!rejectTarget} transparent animationType="fade">
        <View className="flex-1 bg-black/50 items-center justify-center px-6">
          <View className="bg-white rounded-3xl p-6 w-full">
            <Text className="text-lg font-bold text-gray-900 mb-2">반려 사유</Text>
            <Text className="text-sm text-gray-500 mb-4">아이에게 반려 이유를 알려주세요</Text>
            <TextInput
              className="bg-gray-50 rounded-xl px-4 py-3 text-gray-900 mb-4"
              placeholder="예: 깨끗하게 다시 해봐요 😊"
              value={rejectReason}
              onChangeText={setRejectReason}
              multiline
              numberOfLines={3}
              style={{ textAlignVertical: 'top', height: 80 }}
            />
            <View className="flex-row gap-3">
              <Button
                variant="outline"
                size="md"
                onPress={() => { setRejectTarget(null); setRejectReason(''); }}
                className="flex-1"
              >
                취소
              </Button>
              <Button
                variant="danger"
                size="md"
                onPress={handleReject}
                loading={rejecting}
                disabled={!rejectReason.trim()}
                className="flex-1"
              >
                반려하기
              </Button>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
