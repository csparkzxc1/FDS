/**
 * Offline queue store
 * 오프라인 상태에서 집안일 체크 시 큐에 넣고
 * 온라인 복귀 시 자동 동기화
 */
import { create } from 'zustand';
import type { ChoreCheckPayload } from '@/types';

interface QueuedAction {
  id: string;
  type: 'chore_check';
  payload: ChoreCheckPayload & { householdId: string; performedAt: string };
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

export const useOfflineQueueStore = create<OfflineQueueState>((set) => ({
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
        item.id === id ? { ...item, retryCount: item.retryCount + 1 } : item
      ),
    })),

  setIsSyncing: (isSyncing) => set({ isSyncing }),
  clear: () => set({ queue: [], isSyncing: false }),
}));
