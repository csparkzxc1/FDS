/**
 * Widget data synchronization layer.
 *
 * Stores widget-relevant data in AsyncStorage so that:
 * 1. Native home screen widgets (v1.2 — needs bare workflow + WidgetKit/AppWidgets)
 *    can read it via App Groups (iOS) / SharedPreferences (Android).
 * 2. The current v1.1 shortcuts (iOS Quick Actions / Android App Shortcuts) can
 *    optionally surface this data in the future.
 *
 * Call `syncWidgetData` after every chore completion, approval, or settlement.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

const WIDGET_KEY = '@fairshare/widgetData';

export interface WidgetTopChore {
  id: string;
  title: string;
  icon: string;
  points: number;
}

export interface WidgetFairness {
  myPercentage: number;
  status: 'balanced' | 'caution' | 'imbalanced';
}

export interface WidgetRewardGoal {
  title: string;
  current: number;
  target: number;
}

export interface WidgetData {
  userId: string;
  householdId: string;
  weeklyPoints: number;
  topChores: WidgetTopChore[];
  fairness?: WidgetFairness;
  rewardGoal?: WidgetRewardGoal;
  lastUpdated: string;
}

export async function syncWidgetData(data: WidgetData): Promise<void> {
  try {
    await AsyncStorage.setItem(WIDGET_KEY, JSON.stringify(data));
    // v1.2 TODO: after migrating to bare workflow, also write to App Groups (iOS)
    // via react-native-shared-group-preferences, then call WidgetKit.reloadAll().
  } catch {
    // Widget sync is non-critical; never throw
  }
}

export async function getWidgetData(): Promise<WidgetData | null> {
  try {
    const raw = await AsyncStorage.getItem(WIDGET_KEY);
    return raw ? (JSON.parse(raw) as WidgetData) : null;
  } catch {
    return null;
  }
}

export async function clearWidgetData(): Promise<void> {
  try {
    await AsyncStorage.removeItem(WIDGET_KEY);
  } catch {
    // no-op
  }
}

/** Compute fairness status from two point totals. */
export function computeFairness(myPoints: number, partnerPoints: number): WidgetFairness {
  const total = myPoints + partnerPoints;
  if (total === 0) return { myPercentage: 50, status: 'balanced' };
  const myPercentage = Math.round((myPoints / total) * 100);
  const diff = Math.abs(myPercentage - 50);
  const status = diff <= 10 ? 'balanced' : diff <= 20 ? 'caution' : 'imbalanced';
  return { myPercentage, status };
}
