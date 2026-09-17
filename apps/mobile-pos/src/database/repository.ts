import AsyncStorage from '@react-native-async-storage/async-storage';
import { OrderRecord, CashierShiftRecord, SyncQueueItem, Product } from '../types/pos';
import { getULID } from '../utils/ulid';

const KEYS = {
  PRODUCTS: '@pos_products',
  ORDERS: '@pos_orders',
  SHIFTS: '@pos_shifts',
  QUEUE: '@pos_sync_queue',
};

// Initial default menu catalog for cafe testing
export const INITIAL_PRODUCTS: Product[] = [
  { id: 'PRD-01', categoryId: 'espresso', name: 'Espresso Single', price: 18000, isAvailable: true },
  { id: 'PRD-02', categoryId: 'espresso', name: 'Americano / Long Black', price: 22000, isAvailable: true },
  { id: 'PRD-03', categoryId: 'milk', name: 'Caffe Latte', price: 28000, isAvailable: true },
  { id: 'PRD-04', categoryId: 'milk', name: 'Cappuccino', price: 28000, isAvailable: true },
  { id: 'PRD-05', categoryId: 'signature', name: 'Kopi Susu Gula Aren Lampung', price: 25000, isAvailable: true },
  { id: 'PRD-06', categoryId: 'manual', name: 'V60 Robusta Ulubelu', price: 24000, isAvailable: true },
  { id: 'PRD-07', categoryId: 'pastry', name: 'Butter Croissant', price: 22000, isAvailable: true },
  { id: 'PRD-08', categoryId: 'pastry', name: 'Cinnamon Roll', price: 25000, isAvailable: true },
];

export class LocalRepository {
  public static async getProducts(): Promise<Product[]> {
    try {
      const raw = await AsyncStorage.getItem(KEYS.PRODUCTS);
      if (raw) return JSON.parse(raw);
      await AsyncStorage.setItem(KEYS.PRODUCTS, JSON.stringify(INITIAL_PRODUCTS));
      return INITIAL_PRODUCTS;
    } catch {
      return INITIAL_PRODUCTS;
    }
  }

  public static async saveOrder(order: OrderRecord): Promise<void> {
    const orders = await this.getOrders();
    orders.unshift(order);
    await AsyncStorage.setItem(KEYS.ORDERS, JSON.stringify(orders));

    // Enqueue to sync queue
    await this.enqueue({
      actionType: 'CREATE_ORDER',
      payload: JSON.stringify(order),
      idempotencyKey: order.id,
    });
  }

  public static async getOrders(): Promise<OrderRecord[]> {
    try {
      const raw = await AsyncStorage.getItem(KEYS.ORDERS);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  public static async saveShift(shift: CashierShiftRecord): Promise<void> {
    const shifts = await this.getShifts();
    const existingIndex = shifts.findIndex((s) => s.id === shift.id);
    if (existingIndex >= 0) {
      shifts[existingIndex] = shift;
    } else {
      shifts.unshift(shift);
    }
    await AsyncStorage.setItem(KEYS.SHIFTS, JSON.stringify(shifts));

    // Enqueue shift event
    await this.enqueue({
      actionType: shift.status === 'OPEN' ? 'OPEN_SHIFT' : 'CLOSE_SHIFT',
      payload: JSON.stringify(shift),
      idempotencyKey: `${shift.id}_${shift.status}`,
    });
  }

  public static async getShifts(): Promise<CashierShiftRecord[]> {
    try {
      const raw = await AsyncStorage.getItem(KEYS.SHIFTS);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  public static async enqueue(item: {
    actionType: 'CREATE_ORDER' | 'OPEN_SHIFT' | 'CLOSE_SHIFT';
    payload: string;
    idempotencyKey: string;
  }): Promise<void> {
    const queue = await this.getQueue();
    const newItem: SyncQueueItem = {
      id: Date.now(),
      actionType: item.actionType,
      payload: item.payload,
      idempotencyKey: item.idempotencyKey,
      status: 'PENDING',
      retryCount: 0,
      createdAt: new Date().toISOString(),
    };
    queue.push(newItem);
    await AsyncStorage.setItem(KEYS.QUEUE, JSON.stringify(queue));
  }

  public static async getQueue(): Promise<SyncQueueItem[]> {
    try {
      const raw = await AsyncStorage.getItem(KEYS.QUEUE);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  public static async markSynced(id: number): Promise<void> {
    const queue = await this.getQueue();
    const updated = queue.map((q) => (q.id === id ? { ...q, status: 'SYNCED' as const } : q));
    await AsyncStorage.setItem(KEYS.QUEUE, JSON.stringify(updated));
  }

  public static async markOrderSynced(orderId: string): Promise<void> {
    const orders = await this.getOrders();
    const updated = orders.map((o) => (o.id === orderId ? { ...o, isSynced: true } : o));
    await AsyncStorage.setItem(KEYS.ORDERS, JSON.stringify(updated));
  }
}
