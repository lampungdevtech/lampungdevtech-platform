import axios from 'axios';
import { LocalRepository } from '../database/repository';

export interface SyncResult {
  totalProcessed: number;
  successCount: number;
  failedCount: number;
}

export class SyncEngine {
  private static isSyncing = false;
  private static backendUrl = 'http://localhost:8080'; // GoFiber backend

  public static setBackendUrl(url: string) {
    this.backendUrl = url;
  }

  public static async syncPending(token?: string): Promise<SyncResult> {
    if (this.isSyncing) {
      return { totalProcessed: 0, successCount: 0, failedCount: 0 };
    }

    this.isSyncing = true;
    let successCount = 0;
    let failedCount = 0;

    try {
      const queue = await LocalRepository.getQueue();
      const pendingItems = queue.filter((item) => item.status === 'PENDING');

      for (const item of pendingItems) {
        try {
          const payload = JSON.parse(item.payload);

          const headers: Record<string, string> = {
            'Content-Type': 'application/json',
            'X-Idempotency-Key': item.idempotencyKey,
          };

          if (token) {
            headers['Authorization'] = `Bearer ${token}`;
          }

          if (item.actionType === 'CREATE_ORDER') {
            await axios.post(
              `${this.backendUrl}/api/v1/pos/orders`,
              payload,
              { headers, timeout: 5000 }
            );
            await LocalRepository.markOrderSynced(payload.id);
          } else if (item.actionType === 'OPEN_SHIFT') {
            await axios.post(
              `${this.backendUrl}/api/v1/pos/shifts/open`,
              payload,
              { headers, timeout: 5000 }
            );
          } else if (item.actionType === 'CLOSE_SHIFT') {
            await axios.post(
              `${this.backendUrl}/api/v1/pos/shifts/close`,
              payload,
              { headers, timeout: 5000 }
            );
          }

          await LocalRepository.markSynced(item.id);
          successCount++;
        } catch (err) {
          console.warn(`[SyncEngine] Gagal sinkronisasi antrean #${item.id}:`, err);
          failedCount++;
        }
      }

      return {
        totalProcessed: pendingItems.length,
        successCount,
        failedCount,
      };
    } finally {
      this.isSyncing = false;
    }
  }
}
