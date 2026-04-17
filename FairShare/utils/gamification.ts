export interface Level {
  level: number;
  label: string;
  emoji: string;
  minPoints: number;
  maxPoints: number;
}

export const LEVELS: Level[] = [
  { level: 1, label: '새싹', emoji: '🌱', minPoints: 0, maxPoints: 99 },
  { level: 2, label: '도우미', emoji: '⭐', minPoints: 100, maxPoints: 299 },
  { level: 3, label: '살림꾼', emoji: '💫', minPoints: 300, maxPoints: 599 },
  { level: 4, label: '집안일 고수', emoji: '🌟', minPoints: 600, maxPoints: 999 },
  { level: 5, label: '가사 마스터', emoji: '👑', minPoints: 1000, maxPoints: Infinity },
];

export function getLevel(totalPoints: number): Level {
  return LEVELS.findLast((l) => totalPoints >= l.minPoints) ?? LEVELS[0];
}

export function getNextLevel(totalPoints: number): { level: Level; remaining: number } | null {
  const current = getLevel(totalPoints);
  const next = LEVELS.find((l) => l.level === current.level + 1);
  if (!next) return null;
  return { level: next, remaining: next.minPoints - totalPoints };
}

export function getLevelProgress(totalPoints: number): number {
  const current = getLevel(totalPoints);
  if (current.maxPoints === Infinity) return 100;
  const range = current.maxPoints - current.minPoints + 1;
  return Math.round(((totalPoints - current.minPoints) / range) * 100);
}

// Streak: consecutive days with at least 1 approved chore
export function calculateStreak(
  logs: { performed_at: string; status: string }[],
): number {
  const approved = logs.filter((l) => l.status === 'approved');
  if (approved.length === 0) return 0;

  const activeDates = new Set(
    approved.map((l) => new Date(l.performed_at).toISOString().slice(0, 10)),
  );

  let streak = 0;
  const check = new Date();
  check.setHours(0, 0, 0, 0);

  // Allow today OR yesterday as the start (in case no chore today yet)
  const todayStr = check.toISOString().slice(0, 10);
  check.setDate(check.getDate() - 1);
  const yestStr = check.toISOString().slice(0, 10);

  const start = activeDates.has(todayStr) ? todayStr : yestStr;
  if (!activeDates.has(start)) return 0;

  const cursor = new Date(start);
  while (activeDates.has(cursor.toISOString().slice(0, 10))) {
    streak++;
    cursor.setDate(cursor.getDate() - 1);
  }

  return streak;
}

export const STREAK_MILESTONES = [3, 7, 14, 30];

export function getStreakBadge(streak: number): string {
  if (streak >= 30) return '🏆';
  if (streak >= 14) return '💎';
  if (streak >= 7) return '🔥';
  if (streak >= 3) return '✨';
  return '';
}
