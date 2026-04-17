import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Avatar, Button, LoadingSpinner } from '@/components/ui';
import { usePendingMembers, useApproveMember, useRejectMember, useHouseholdMembers } from '@/hooks/queries/useHousehold';
import { useHouseholdStore } from '@/stores/householdStore';
import type { MemberRole } from '@/types/database';
import type { MemberRow } from '@/services/householdService';
import { Colors } from '@/constants/design-tokens';

const ROLE_OPTIONS: Array<{ role: MemberRole; label: string; emoji: string }> = [
  { role: 'parent', label: '부모', emoji: '👨‍👩‍👧' },
  { role: 'child', label: '자녀', emoji: '👦' },
  { role: 'partner', label: '파트너', emoji: '💑' },
  { role: 'roommate', label: '룸메이트', emoji: '🏘️' },
];

function PendingMemberCard({
  member,
  onApprove,
  onReject,
}: {
  member: MemberRow;
  onApprove: (memberId: string, role: MemberRole) => void;
  onReject: (memberId: string) => void;
}) {
  const [selectedRole, setSelectedRole] = useState<MemberRole>('partner');

  return (
    <View className="bg-white rounded-2xl p-4 mb-3 border border-gray-100">
      <View className="flex-row items-center mb-4">
        <Avatar
          uri={member.user?.avatar_url}
          name={member.user?.display_name ?? '?'}
          size="md"
        />
        <View className="ml-3 flex-1">
          <Text className="font-semibold text-gray-900">{member.user?.display_name ?? '알 수 없음'}</Text>
          <Text className="text-sm text-gray-500">{member.user?.email}</Text>
        </View>
      </View>

      <Text className="text-xs font-semibold text-gray-500 mb-2">역할 지정</Text>
      <View className="flex-row flex-wrap gap-2 mb-4">
        {ROLE_OPTIONS.map((option) => (
          <TouchableOpacity
            key={option.role}
            onPress={() => setSelectedRole(option.role)}
            activeOpacity={0.7}
          >
            <View
              className="flex-row items-center px-3 py-1.5 rounded-full border"
              style={{
                backgroundColor: selectedRole === option.role ? Colors.primary[500] : Colors.white,
                borderColor: selectedRole === option.role ? Colors.primary[500] : Colors.gray[200],
              }}
            >
              <Text className="text-sm mr-1">{option.emoji}</Text>
              <Text
                className="text-sm font-medium"
                style={{ color: selectedRole === option.role ? Colors.white : Colors.gray[700] }}
              >
                {option.label}
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>

      <View className="flex-row gap-2">
        <Button
          variant="danger"
          size="sm"
          onPress={() => onReject(member.id)}
          className="flex-1"
        >
          거절
        </Button>
        <Button
          variant="primary"
          size="sm"
          onPress={() => onApprove(member.id, selectedRole)}
          className="flex-1"
        >
          승인
        </Button>
      </View>
    </View>
  );
}

export default function MemberApprovalModal() {
  const household = useHouseholdStore((s) => s.current);
  const { data: pendingMembers, isLoading: pendingLoading } = usePendingMembers(household?.householdId);
  const { data: activeMembers, isLoading: activeLoading } = useHouseholdMembers(household?.householdId);
  const { mutateAsync: approveMember } = useApproveMember();
  const { mutateAsync: rejectMember } = useRejectMember();

  const handleApprove = async (memberId: string, role: MemberRole) => {
    try {
      await approveMember({ memberId, role });
    } catch {
      Alert.alert('오류', '승인에 실패했습니다');
    }
  };

  const handleReject = (memberId: string) => {
    Alert.alert('참여 거절', '이 요청을 거절하시겠어요?', [
      { text: '취소', style: 'cancel' },
      {
        text: '거절',
        style: 'destructive',
        onPress: async () => {
          try {
            await rejectMember(memberId);
          } catch {
            Alert.alert('오류', '거절에 실패했습니다');
          }
        },
      },
    ]);
  };

  const roleLabels: Record<string, string> = {
    parent: '부모',
    child: '자녀',
    partner: '파트너',
    roommate: '룸메이트',
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="items-center py-3">
        <View className="w-10 h-1 bg-gray-200 rounded-full" />
      </View>

      <View className="flex-row items-center justify-between px-6 pb-4">
        <Text className="text-xl font-bold text-gray-900">구성원 관리</Text>
        <TouchableOpacity onPress={() => router.back()}>
          <Text className="text-gray-400 text-lg">✕</Text>
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1 px-6" contentContainerStyle={{ paddingBottom: 40 }}>
        {pendingLoading || activeLoading ? (
          <LoadingSpinner />
        ) : (
          <>
            {(pendingMembers?.length ?? 0) > 0 && (
              <View className="mb-6">
                <View className="flex-row items-center mb-3">
                  <Text className="text-sm font-semibold text-gray-500 flex-1">승인 대기중</Text>
                  <View className="px-2 py-0.5 bg-danger-100 rounded-full">
                    <Text className="text-danger-600 text-xs font-bold">{pendingMembers!.length}명</Text>
                  </View>
                </View>
                {pendingMembers!.map((member) => (
                  <PendingMemberCard
                    key={member.id}
                    member={member}
                    onApprove={handleApprove}
                    onReject={handleReject}
                  />
                ))}
              </View>
            )}

            <View>
              <Text className="text-sm font-semibold text-gray-500 mb-3">현재 구성원</Text>
              {(activeMembers ?? []).map((member) => (
                <View key={member.id} className="flex-row items-center py-3 border-b border-gray-50">
                  <Avatar
                    uri={member.user?.avatar_url}
                    name={member.user?.display_name ?? '?'}
                    size="sm"
                  />
                  <View className="ml-3 flex-1">
                    <Text className="font-medium text-gray-900">{member.user?.display_name ?? '알 수 없음'}</Text>
                    <Text className="text-xs text-gray-400">{member.user?.email}</Text>
                  </View>
                  <View className="px-2 py-1 bg-primary-50 rounded-lg">
                    <Text className="text-xs text-primary-600 font-medium">
                      {roleLabels[member.role ?? ''] ?? member.role ?? '-'}
                    </Text>
                  </View>
                </View>
              ))}
              {(activeMembers ?? []).length === 0 && (
                <Text className="text-gray-400 text-sm py-4 text-center">구성원이 없습니다</Text>
              )}
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
