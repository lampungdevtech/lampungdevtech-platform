export type PaymentMethod = 'CASH' | 'QRIS' | 'CARD';
export type PaymentStatus = 'PAID' | 'PENDING';
export type OrderStatus = 'SUBMITTED' | 'IN_PREPARATION' | 'READY' | 'COMPLETED' | 'CANCELLED';

export interface Category {
  id: string;
  name: string;
  icon: string;
}

export interface Product {
  id: string;
  categoryId: string;
  name: string;
  price: number;
  imageUrl?: string;
  isAvailable: boolean;
}

export interface CartItem {
  product: Product;
  quantity: number;
  notes?: string;
}

export interface OrderItemRecord {
  id: string;
  orderId: string;
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  notes?: string;
}

export interface OrderRecord {
  id: string; // ULID
  shiftId: string;
  branchId: string;
  cashierStaffId: string;
  tableNumber?: string;
  customerName?: string;
  subtotal: number;
  taxAmount: number;
  discountAmount: number;
  totalAmount: number;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  status: OrderStatus;
  items: OrderItemRecord[];
  createdAt: string;
  isSynced: boolean;
}

export interface CashierShiftRecord {
  id: string; // ULID
  merchantId: string;
  branchId: string;
  staffId: string;
  cashFloatInitial: number;
  totalCashSales: number;
  totalNonCash: number;
  totalOrdersCount: number;
  actualCashEnd?: number;
  expectedCashEnd: number;
  cashVariance?: number;
  status: 'OPEN' | 'CLOSED';
  openedAt: string;
  closedAt?: string;
}

export interface SyncQueueItem {
  id: number;
  actionType: 'CREATE_ORDER' | 'OPEN_SHIFT' | 'CLOSE_SHIFT';
  payload: string; // JSON
  idempotencyKey: string; // ULID
  status: 'PENDING' | 'SYNCED' | 'FAILED';
  retryCount: number;
  createdAt: string;
}

export interface ReceiptData {
  storeName: string;
  branchName: string;
  branchAddress: string;
  orderId: string;
  cashierName: string;
  tableNumber?: string;
  customerName?: string;
  items: {
    name: string;
    qty: number;
    price: number;
    notes?: string;
  }[];
  subtotal: number;
  taxAmount: number;
  discountAmount: number;
  total: number;
  cashGiven?: number;
  change?: number;
  paymentMethod: PaymentMethod;
  date: string;
}
