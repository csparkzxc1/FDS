import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

export function initNotificationHandler(): void {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });
}

export async function requestNotificationPermissions(): Promise<boolean> {
  if (Platform.OS === 'web') return false;

  const { status: existing } = await Notifications.getPermissionsAsync();
  if (existing === 'granted') return true;

  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
}

const DAILY_REMINDER_ID = 'fairshare-daily-reminder';

export async function scheduleDailyReminder(
  hour: number,
  minute: number,
): Promise<void> {
  await cancelDailyReminder();

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('daily-reminder', {
      name: '데일리 리마인더',
      importance: Notifications.AndroidImportance.DEFAULT,
      sound: 'default',
    });
  }

  await Notifications.scheduleNotificationAsync({
    identifier: DAILY_REMINDER_ID,
    content: {
      title: 'FairShare 🏠',
      body: '오늘 집안일 체크하셨나요?',
      sound: true,
      ...(Platform.OS === 'android' && { channelId: 'daily-reminder' }),
    },
    trigger: {
      hour,
      minute,
      repeats: true,
    } as any,
  });
}

export async function cancelDailyReminder(): Promise<void> {
  await Notifications.cancelScheduledNotificationAsync(DAILY_REMINDER_ID).catch((err) => {
    console.warn('[notificationService] cancelDailyReminder:', err);
  });
}

export async function sendLocalNotification(
  title: string,
  body: string,
): Promise<void> {
  await Notifications.scheduleNotificationAsync({
    content: { title, body, sound: true },
    trigger: null,
  });
}

export function parseReminderTime(timeStr: string): { hour: number; minute: number } {
  const [h, m] = timeStr.split(':').map(Number);
  return { hour: h ?? 20, minute: m ?? 0 };
}
