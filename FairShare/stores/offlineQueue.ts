import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { ChoreCheckPayload } from '@/types';

interface QueuedAction {
  id: string;
  type: 'chore_check';
  payload: ChoreCheckPayload & {
    householdId: string;
    performedBy: string;
    pointsAwarded: number;
    performedAt: string;
    requiresApproval: boolean;
  };
  retryCount: number;
}

interface OfflineQueueState {
  queue: QueuedAction[];
  isSyncing: boolean;

  enqueue: (action: Omit<QueuedAction, 'id' | 'retryCount'>) => void;
  dequeue: (id: string) => void;
  incrementRetry: (id: string) => void;
  setIsSyncing: (syncing: boolean) => void;
  clear: () => void;
}

export const useOfflineQueueStore = create<OfflineQueueState>()(
  persist(
    (set) => ({
      queue: [],
      isSyncing: false,

      enqueue: (action) =>
        set((state) => ({
          queue: [
            ...state.queue,
            {
              ...action,
              id: `offline_${Date.now()}_${Math.random().toString(36).slice(2)}`,
              retryCount: 0,
            },
          ],
        })),

      dequeue: (id) =>
        set((state) => ({
          queue: state.queue.filter((item) => item.id !== id),
        })),

      incrementRetry: (id) =>
        set((state) => ({
          queue: state.queue.map((item) =>
            item.id === id ? { ...item, retryCount: item.retryCount + 1 } : item,
          ),
        })),

      setIsSyncing: (isSyncing) => set({ isSyncing }),
      clear: () => set({ queue: [], isSyncing: false }),
    }),
    {
      name: 'fairshare-offline-queue',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ queue: state.queue }),
    },
  ),
);
