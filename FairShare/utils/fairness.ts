import type { FairnessData, WeeklyStats } from '@/types';

/**
 * 공정성 지수 계산
 * 0 = 완전 불공평 (한 명이 전부)
 * 100 = 완전 공평 (모두 동일)
 */
export function calculateFairnessIndex(members: FairnessData[]): number {
  if (members.length === 0) return 100;
  if (members.length === 1) return 100;

  const total = members.reduce((sum, m) => sum + m.totalPoints, 0);
  if (total === 0) return 100;

  const idealShare = 100 / members.length;
  const sumDeviation = members.reduce((sum, m) => {
    const actualShare = (m.totalPoints / total) * 100;
    return sum + Math.abs(actualShare - idealShare);
  }, 0);

  // Maximum possible deviation (one person does everything)
  const maxDeviation = idealShare * (members.length - 1) * 2;
  const fairness = Math.max(0, 100 - (sumDeviation / maxDeviation) * 100);

  return Math.round(fairness);
}

export function getFairnessLabel(index: number): { label: string; color: string } {
  if (index >= 80) return { label: '매우 공평해요 👏', color: '#10B981' };
  if (index >= 60) return { label: '꽤 균형잡혔어요', color: '#5B8DEF' };
  if (index >= 40) return { label: '조금 불균형해요', color: '#F59E0B' };
  return { label: '많이 불균형해요 😔', color: '#EF4444' };
}

export function calculatePercentages(members: FairnessData[]): FairnessData[] {
  const total = members.reduce((sum, m) => sum + m.totalPoints, 0);
  if (total === 0) {
    return members.map((m) => ({ ...m, percentage: 0 }));
  }
  return members.map((m) => ({
    ...m,
    percentage: Math.round((m.totalPoints / total) * 100),
  }));
}
