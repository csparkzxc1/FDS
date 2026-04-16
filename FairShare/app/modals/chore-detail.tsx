import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as ImagePicker from 'expo-image-picker';
import * as Haptics from 'expo-haptics';
import { useAuthStore } from '@/stores/authStore';
import { useHouseholdStore } from '@/stores/householdStore';
import { supabase } from '@/services/supabase';
import { Button, Input, Card } from '@/components/ui';
import { resizeAndCompressImage, generatePhotoFileName } from '@/utils/image';
import { Colors } from '@/constants/design-tokens';

export default function ChoreDetailModal() {
  const { choreId } = useLocalSearchParams<{ choreId: string }>();
  const user = useAuthStore((s) => s.user);
  const household = useHouseholdStore((s) => s.current);
  const queryClient = useQueryClient();

  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [note, setNote] = useState('');

  const { data: chore, isLoading } = useQuery({
    queryKey: ['chore', choreId],
    queryFn: async () => {
      const { data, error } = await (supabase
        .from('chores') as any)
        .select('*')
        .eq('id', choreId!)
        .single();
      if (error) throw error;
      return data as import('@/types/database').ChoreRow;
    },
    enabled: !!choreId,
  });

  const { mutateAsync: submitLog, isPending } = useMutation({
    mutationFn: async () => {
      if (!user?.id || !household?.householdId || !chore) throw new Error('Not ready');

      let photoUrl: string | null = null;
      if (photoUri) {
        const compressed = await resizeAndCompressImage(photoUri);
        const fileName = generatePhotoFileName(user.id);
        const path = `${household.householdId}/${user.id}/${fileName}`;

        const response = await fetch(compressed);
        const blob = await response.blob();
        const arrayBuffer = await new Promise<ArrayBuffer>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as ArrayBuffer);
          reader.onerror = reject;
          reader.readAsArrayBuffer(blob);
        });

        const { error: uploadError } = await supabase.storage
          .from('chore-photos')
          .upload(path, arrayBuffer, { contentType: 'image/jpeg', upsert: false });

        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage.from('chore-photos').getPublicUrl(path);
        photoUrl = urlData.publicUrl;
      }

      const { error } = await (supabase.from('chore_logs') as any).insert({
        household_id: household.householdId,
        chore_id: chore.id,
        performed_by: user.id,
        points_awarded: chore.points,
        photo_url: photoUrl,
        note: note.trim() || null,
        status: chore.requires_approval ? 'pending' : 'approved',
      });
      if (error) throw error;
    },
    onSuccess: async () => {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      queryClient.invalidateQueries({ queryKey: ['choreLogs'] });
      queryClient.invalidateQueries({ queryKey: ['myWeeklyPoints'] });
      router.back();
    },
    onError: () => {
      Alert.alert('오류', '집안일 기록에 실패했습니다');
    },
  });

  const pickImage = async (source: 'camera' | 'gallery') => {
    const fn =
      source === 'camera'
        ? ImagePicker.launchCameraAsync
        : ImagePicker.launchImageLibraryAsync;

    const result = await fn({
      mediaTypes: ['images'],
      quality: 1,
      allowsEditing: true,
      aspect: [4, 3],
    });

    if (!result.canceled && result.assets[0]) {
      setPhotoUri(result.assets[0].uri);
    }
  };

  const handleSubmit = async () => {
    if (chore?.requires_photo && !photoUri) {
      Alert.alert('사진 필요', '이 집안일은 사진 인증이 필요해요');
      return;
    }
    await submitLog();
  };

  if (isLoading || !chore) return null;

  return (
    <SafeAreaView className="flex-1 bg-white">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        {/* Handle bar */}
        <View className="items-center py-3">
          <View className="w-10 h-1 bg-gray-200 rounded-full" />
        </View>

        <ScrollView
          className="flex-1 px-6"
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ paddingBottom: 40 }}
        >
          {/* Chore info */}
          <View className="items-center mb-6">
            <View className="w-20 h-20 bg-primary-50 rounded-3xl items-center justify-center mb-3">
              <Text className="text-5xl">{chore.icon}</Text>
            </View>
            <Text className="text-2xl font-bold text-gray-900 mb-1">{chore.title}</Text>
            <Text className="text-primary-500 font-bold text-lg">+{chore.points}pt</Text>
            {chore.requires_approval && (
              <Text className="text-xs text-warning-600 mt-1">승인 후 포인트가 지급됩니다</Text>
            )}
          </View>

          {/* Photo section */}
          <View className="mb-5">
            <Text className="text-sm font-medium text-gray-700 mb-2">
              사진 인증{chore.requires_photo ? ' *' : ' (선택)'}
            </Text>
            {photoUri ? (
              <View className="relative">
                <Image
                  source={{ uri: photoUri }}
                  className="w-full h-48 rounded-xl"
                  resizeMode="cover"
                />
                <TouchableOpacity
                  onPress={() => setPhotoUri(null)}
                  className="absolute top-2 right-2 w-8 h-8 bg-black/50 rounded-full items-center justify-center"
                >
                  <Text className="text-white text-xs">✕</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View className="flex-row gap-3">
                <Button
                  variant="outline"
                  size="md"
                  onPress={() => pickImage('camera')}
                  className="flex-1"
                >
                  📷 카메라
                </Button>
                <Button
                  variant="outline"
                  size="md"
                  onPress={() => pickImage('gallery')}
                  className="flex-1"
                >
                  🖼️ 갤러리
                </Button>
              </View>
            )}
          </View>

          {/* Note */}
          <Input
            label="메모"
            placeholder="특이사항을 입력하세요 (선택)"
            value={note}
            onChangeText={setNote}
            multiline
            numberOfLines={3}
            style={{ textAlignVertical: 'top', height: 80 }}
          />

          <Button
            variant="primary"
            size="lg"
            fullWidth
            loading={isPending}
            onPress={handleSubmit}
          >
            완료 기록하기
          </Button>

          <Button
            variant="ghost"
            size="md"
            fullWidth
            onPress={() => router.back()}
            className="mt-2"
          >
            취소
          </Button>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
