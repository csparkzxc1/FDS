import React, { useState } from 'react';
import {
  View,
  Text,
  SectionList,
  TouchableOpacity,
  Alert,
  TextInput,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '@/components/ui';
import { CHORE_PRESETS, CATEGORY_LABELS, type ChorePreset, type ChoreCategory } from '@/constants/chore-presets';
import { useHouseholdStore } from '@/stores/householdStore';
import { useCreateChores } from '@/hooks/queries/useChores';
import { Colors } from '@/constants/design-tokens';
import type { CreateChoreInput } from '@/services/choreService';

const CATEGORIES = Object.keys(CATEGORY_LABELS) as ChoreCategory[];

function getSections(mode: 'couple' | 'family' | 'roommate') {
  return CATEGORIES.map((cat) => ({
    category: cat,
    title: CATEGORY_LABELS[cat],
    data: CHORE_PRESETS.filter((p) => p.category === cat && p.modes.includes(mode)),
  })).filter((s) => s.data.length > 0);
}

export default function SetupChoresScreen() {
  const household = useHouseholdStore((s) => s.current);
  const mode = household?.mode ?? 'couple';
  const sections = getSections(mode);

  const [selected, setSelected] = useState<Set<string>>(
    () => new Set(CHORE_PRESETS.filter((p) => p.modes.includes(mode)).map((p) => p.title)),
  );
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const [quickTitle, setQuickTitle] = useState('');

  const { mutateAsync: createChores, isPending } = useCreateChores();

  const toggle = (title: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(title) ? next.delete(title) : next.add(title);
      return next;
    });
  };

  const handleAdd = async () => {
    if (!household?.householdId) return;

    const presets = CHORE_PRESETS.filter((p) => selected.has(p.title));
    const toCreate: CreateChoreInput[] = presets.map((p) => ({
      householdId: household.householdId,
      title: p.title,
      icon: p.icon,
      category: p.category,
      points: p.points,
      requiresPhoto: p.requiresPhoto,
      requiresApproval: p.requiresApproval,
      isInvisibleLabor: p.isInvisibleLabor,
      estimatedMinutes: p.estimatedMinutes,
    }));

    if (quickTitle.trim()) {
      toCreate.push({
        householdId: household.householdId,
        title: quickTitle.trim(),
        icon: '✨',
        category: 'etc',
        points: 3,
      });
    }

    try {
      if (toCreate.length > 0) await createChores(toCreate);
      router.replace('/(tabs)/home');
    } catch {
      Alert.alert('오류', '집안일 추가에 실패했습니다');
    }
  };

  const allCount = sections.reduce((sum, s) => sum + s.data.length, 0);
  const isAllSelected = selected.size === allCount;

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="px-6 pt-6 pb-4 border-b border-gray-100">
        <Text className="text-2xl font-bold text-gray-900 mb-1">집안일 선택</Text>
        <Text className="text-gray-500 text-sm">나중에 언제든지 추가하거나 수정할 수 있어요</Text>
        <View className="flex-row items-center justify-between mt-3">
          <TouchableOpacity
            onPress={() =>
              setSelected(
                isAllSelected
                  ? new Set()
                  : new Set(sections.flatMap((s) => s.data.map((d) => d.title))),
              )
            }
          >
            <Text className="text-primary-500 font-medium">
              {isAllSelected ? '전체 해제' : '전체 선택'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setShowQuickAdd((v) => !v)}>
            <Text className="text-primary-500 font-medium">+ 직접 추가</Text>
          </TouchableOpacity>
        </View>

        {showQuickAdd && (
          <View className="mt-3 flex-row items-center gap-2">
            <TextInput
              className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-gray-900"
              placeholder="집안일 이름 입력"
              value={quickTitle}
              onChangeText={setQuickTitle}
              maxLength={30}
              autoFocus
            />
            <TouchableOpacity onPress={() => { setShowQuickAdd(false); setQuickTitle(''); }}>
              <Text className="text-gray-400 px-2">✕</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      <SectionList
        sections={sections}
        keyExtractor={(item) => item.title}
        renderSectionHeader={({ section }) => (
          <View className="px-6 py-2 bg-gray-50">
            <Text className="text-sm font-semibold text-gray-500">{section.title}</Text>
          </View>
        )}
        renderItem={({ item }) => {
          const isSelected = selected.has(item.title);
          return (
            <TouchableOpacity
              onPress={() => toggle(item.title)}
              className="flex-row items-center px-6 py-3"
              activeOpacity={0.7}
            >
              <View
                className="w-10 h-10 rounded-xl items-center justify-center mr-3"
                style={{ backgroundColor: isSelected ? Colors.primary[50] : Colors.gray[100] }}
              >
                <Text className="text-xl">{item.icon}</Text>
              </View>
              <View className="flex-1">
                <Text className="font-medium text-gray-900">{item.title}</Text>
                <Text className="text-xs text-gray-400">{item.points}pt · {item.estimatedMinutes}분</Text>
              </View>
              <View
                className="w-6 h-6 rounded-full border-2 items-center justify-center"
                style={{
                  borderColor: isSelected ? Colors.primary[500] : Colors.gray[300],
                  backgroundColor: isSelected ? Colors.primary[500] : Colors.white,
                }}
              >
                {isSelected && <Text className="text-white text-xs font-bold">✓</Text>}
              </View>
            </TouchableOpacity>
          );
        }}
        contentContainerStyle={{ paddingBottom: 120 }}
      />

      <View className="absolute bottom-0 left-0 right-0 px-6 pb-8 pt-4 bg-white border-t border-gray-100">
        <Button variant="primary" size="lg" fullWidth loading={isPending} onPress={handleAdd}>
          {selected.size + (quickTitle.trim() ? 1 : 0)}개 추가하기
        </Button>
        <Button
          variant="ghost"
          size="md"
          fullWidth
          onPress={() => router.replace('/(tabs)/home')}
          className="mt-2"
        >
          나중에 추가하기
        </Button>
      </View>
    </SafeAreaView>
  );
}
