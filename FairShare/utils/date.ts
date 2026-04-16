import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from 'date-fns';
import { ko } from 'date-fns/locale';

export const KST_OFFSET = 9 * 60; // UTC+9

export function formatDate(date: string | Date, pattern = 'MM월 dd일'): string {
  return format(new Date(date), pattern, { locale: ko });
}

export function formatDateFull(date: string | Date): string {
  return format(new Date(date), 'yyyy년 MM월 dd일', { locale: ko });
}

export function formatTime(date: string | Date): string {
  return format(new Date(date), 'HH:mm', { locale: ko });
}

export function formatDateTime(date: string | Date): string {
  return format(new Date(date), 'MM월 dd일 HH:mm', { locale: ko });
}

export function getWeekRange(date = new Date()) {
  return {
    start: startOfWeek(date, { weekStartsOn: 1 }),
    end: endOfWeek(date, { weekStartsOn: 1 }),
  };
}

export function getMonthRange(date = new Date()) {
  return {
    start: startOfMonth(date),
    end: endOfMonth(date),
  };
}

export function toISODateString(date: Date): string {
  return format(date, 'yyyy-MM-dd');
}

export function isWithinMinutes(date1: Date, date2: Date, minutes: number): boolean {
  return Math.abs(date1.getTime() - date2.getTime()) < minutes * 60 * 1000;
}
