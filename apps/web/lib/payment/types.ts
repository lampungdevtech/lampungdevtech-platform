export type PaymentGateway = 'weselaja' | 'duitku' | 'manual';

export type PaymentMethodCategory = 'ALL' | 'QRIS' | 'VIRTUAL_ACCOUNT' | 'EWALLET';

export interface PaymentMethodItem {
  code: string;
  name: string;
  category: 'QRIS' | 'VIRTUAL_ACCOUNT' | 'EWALLET';
  image: string;
  totalFee: number;
  fee?: number;
  minAmount: number;
  description?: string;
}

export interface CreatePaymentParams {
  orderId: string;
  amount: number;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  itemName: string;
  callbackUrl?: string;
  successUrl?: string;
  paymentMethod?: string;
}

export interface PaymentResult {
  success: boolean;
  paymentUrl?: string;
  paymentReference?: string;
  transactionReference?: string;
  paymentCode?: string;
  paymentMethod?: string;
  totalAmount?: number;
  feeAmount?: number;
  fee?: number;
  error?: string;
  isSimulated?: boolean;
}

export interface WeselAjaWebhookPayload {
  id: string;
  referenceCode: string;
  status: 'PENDING' | 'PAID' | 'SETTLED' | 'EXPIRED' | 'FAILED';
  amount: number;
  paymentMethod?: string;
  paymentChannel?: string;
  paidAt?: string;
}
