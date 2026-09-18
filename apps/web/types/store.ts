export type ProductType = 'DIGITAL' | 'PHYSICAL' | 'SERVICE' | 'PAYMENT_LINK';

export type DigitalDeliveryMethod = 'ACCESS_LINK' | 'FILE_DOWNLOAD';

export type StoreCategory =
  | 'DIGITAL_CREATIVE'
  | 'EDUCATION'
  | 'FREELANCE_SERVICE'
  | 'FASHION'
  | 'FOOD_BEVERAGE'
  | 'OTHER';

export type OrderPaymentChannel = 'WHATSAPP_DIRECT' | 'QRIS' | 'VIRTUAL_ACCOUNT';

export type OrderPaymentStatus = 'PENDING' | 'PAID' | 'FAILED' | 'CANCELLED';

export type OrderFulfillmentStatus =
  | 'WAITING_PAYMENT'
  | 'PROCESSING'
  | 'COMPLETED'
  | 'CANCELLED';

export interface Store {
  id: string;
  userId?: string;
  name: string;
  slug: string;
  tagline?: string;
  bio?: string;
  logoUrl?: string;
  bannerUrl?: string;
  whatsappNumber: string;
  category: StoreCategory;
  primaryType: ProductType;
  instagramHandle?: string;
  tiktokHandle?: string;
  trackingPixels?: {
    metaPixelId?: string;
    tiktokPixelId?: string;
    googleAnalyticsId?: string;
  };
  paymentConfig: {
    enableDirectWhatsApp: boolean;
    enablePaymentGateway: boolean;
    bankAccount?: {
      bankName: string;
      accountNumber: string;
      accountHolder: string;
    };
  };
  status: 'ACTIVE' | 'PENDING' | 'SUSPENDED';
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface DigitalDetails {
  deliveryMethod: DigitalDeliveryMethod;
  accessLink?: string;          // e.g. Canva Template link, GDrive, Notion
  fileUrl?: string;             // e.g. S3 / Supabase / Local storage path
  fileName?: string;
  fileSize?: string;
  accessInstructions?: string;  // Petunjuk cara pakai / akses file
}

export interface StoreProduct {
  id: string;
  storeId: string;
  name: string;
  slug: string;
  type: ProductType;
  price: number;
  discountPrice?: number;
  description: string;
  images: string[];
  isActive: boolean;
  totalSales: number;
  
  // Specific details for Digital Products:
  digitalDetails?: DigitalDetails;

  // Specific details for Physical Products:
  physicalDetails?: {
    stock: number;
    weightGram: number;
  };

  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface StoreOrder {
  id: string;
  orderNumber: string;
  storeId: string;
  storeSlug: string;
  storeName: string;
  storeWhatsapp: string;
  buyer: {
    name: string;
    whatsapp: string;
    email?: string;
    notes?: string;
  };
  items: Array<{
    productId: string;
    productName: string;
    productType: ProductType;
    price: number;
    quantity: number;
    digitalDetails?: DigitalDetails;
  }>;
  pricing: {
    subtotal: number;
    shippingCost: number; // 0 for digital
    discountAmount: number;
    grandTotal: number;
  };
  payment: {
    channel: OrderPaymentChannel;
    status: OrderPaymentStatus;
    paidAt?: Date | string;
    transactionReference?: string;
  };
  fulfillment: {
    status: OrderFulfillmentStatus;
    completedAt?: Date | string;
    digitalDelivered: boolean;
  };
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface StoreApplyRequest {
  ownerName: string;
  email: string;
  storeName: string;
  slug: string;
  whatsappNumber: string;
  category: StoreCategory;
  bio?: string;
  primaryType?: ProductType;
}
