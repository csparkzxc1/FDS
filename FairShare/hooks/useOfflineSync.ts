import { useEffect } from 'react';
import NetInfo from '@react-native-community/netinfo';
import { useOfflineQueueStore } from '@/stores/offlineQueue';
import { createChoreLog } from '@/services/choreService';
import { IS_DEV_BYPASS } from '@/utils/devMode';

const MAX_RETRIES = 3;

export function useOfflineSync() {
  const { queue, dequeue, incrementRetry, setIsSyncing } = useOfflineQueueStore();

  useEffect(() => {
    if (IS_DEV_BYPASS) return;

    const unsubscribe = NetInfo.addEventListener(async (state) => {
      if (!state.isConnected || queue.length === 0) return;

      setIsSyncing(true);

      for (const action of [...queue]) {
        if (action.retryCount >= MAX_RETRIES) {
          dequeue(action.id);
          continue;
        }

        try {
          if (action.type === 'chore_check') {
            const { householdId, choreId, performedAt, photoUri, note } = action.payload;
            await createChoreLog({
              householdId,
              choreId,
              performedBy: action.payload.choreId, // filled from queue context
              pointsAwarded: 0, // re-fetched or stored in payload
              requiresApproval: false,
              note: note ?? null,
            });
            dequeue(action.id);
          }
        } catch {
          incrementRetry(action.id);
        }
      }

      setIsSyncing(false);
    });

    return () => unsubscribe();
  }, [queue, dequeue, incrementRetry, setIsSyncing]);
}
