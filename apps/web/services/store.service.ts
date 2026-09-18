import { getDatabase } from '@/lib/mongodb';
import { ulid } from 'ulid';
import {
  Store,
  StoreProduct,
  StoreOrder,
  StoreApplyRequest,
} from '@/types/store';

const COLLECTION_STORES = 'stores';
const COLLECTION_PRODUCTS = 'store_products';
const COLLECTION_ORDERS = 'store_orders';

// In-Memory fallback data for high availability and instant preview
const mockStores: Store[] = [
  {
    id: 'store-demo-01',
    userId: 'demo-user-1',
    name: 'Lampung Digital Creative',
    slug: 'lampung-digital',
    tagline: 'Template Canva, E-Book & Aset Desain Terlengkap di Lampung',
    bio: 'Pusat produk digital, e-book praktis, dan template desain profesional siap pakai untuk UMKM & freelancer Lampung.',
    whatsappNumber: '6281234567890',
    category: 'DIGITAL_CREATIVE',
    primaryType: 'DIGITAL',
    logoUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=200&auto=format&fit=crop&q=80',
    bannerUrl: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=1200&auto=format&fit=crop&q=80',
    instagramHandle: '@lampungdigital.studio',
    paymentConfig: {
      enableDirectWhatsApp: true,
      enablePaymentGateway: true,
      bankAccount: {
        bankName: 'BCA',
        accountNumber: '0231928471',
        accountHolder: 'Mitra LampungDevTech',
      },
    },
    status: 'ACTIVE',
    createdAt: new Date('2026-09-01'),
    updatedAt: new Date('2026-09-01'),
  },
];

const mockProducts: StoreProduct[] = [
  {
    id: 'prod-digital-01',
    storeId: 'store-demo-01',
    name: 'Bundle 50+ Template Canva Promosi UMKM Lampung',
    slug: 'bundle-canva-umkm-lampung',
    type: 'DIGITAL',
    price: 99000,
    discountPrice: 49000,
    description:
      'Tingkatkan omset jualan olshop dan kafe kamu dengan 50+ desain feeds & reels Canva berkonversi tinggi. Mudah diedit langsung di HP atau laptop, gratis tanpa perlu Canva Pro!',
    images: [
      'https://images.unsplash.com/photo-1626785774573-4b799315345d?w=800&auto=format&fit=crop&q=80',
    ],
    isActive: true,
    totalSales: 84,
    digitalDetails: {
      deliveryMethod: 'ACCESS_LINK',
      accessLink: 'https://canva.com/template-invite-demo-lampungdev',
      accessInstructions:
        'Klik tautan di atas untuk langsung menduplikasi 50+ template ke akun Canva pribadi kamu. Template langsung bisa diedit teks, warna, dan logonya.',
    },
    createdAt: new Date('2026-09-02'),
    updatedAt: new Date('2026-09-02'),
  },
  {
    id: 'prod-digital-02',
    storeId: 'store-demo-01',
    name: 'E-Book Masterclass: Sukses Jualan di Medsos Tanpa Iklan Mahal',
    slug: 'ebook-sukses-jualan-medsos',
    type: 'DIGITAL',
    price: 149000,
    discountPrice: 75000,
    description:
      'Panduan lengkap A-Z cara jualan produk digital dan olshop di TikTok & Instagram. Dilengkapi studi kasus nyata pebisnis lokal Lampung, template copywriting chat closing WA, dan trik bio berkonversi tinggi.',
    images: [
      'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=800&auto=format&fit=crop&q=80',
    ],
    isActive: true,
    totalSales: 132,
    digitalDetails: {
      deliveryMethod: 'FILE_DOWNLOAD',
      fileName: 'ebook-masterclass-jualan-medsos-2026.pdf',
      fileSize: '14.2 MB',
      accessLink: 'https://drive.google.com/file/d/demo-lampungdev-ebook/view',
      accessInstructions:
        'File PDF e-book dapat langsung diunduh atau dibaca secara offline di perangkat HP, tablet, atau laptop kamu.',
    },
    createdAt: new Date('2026-09-05'),
    updatedAt: new Date('2026-09-05'),
  },
  {
    id: 'prod-digital-03',
    storeId: 'store-demo-01',
    name: 'Notion Life & Business OS Template (Indonesian Version)',
    slug: 'notion-business-os-template',
    type: 'DIGITAL',
    price: 199000,
    discountPrice: 99000,
    description:
      'Dashboard Notion all-in-one untuk melacak pencatatan keuangan harian, manajemen konten media sosial, dan inventaris pesanan toko online dalam satu tempat terintegrasi.',
    images: [
      'https://images.unsplash.com/photo-1517842645767-c639042777db?w=800&auto=format&fit=crop&q=80',
    ],
    isActive: true,
    totalSales: 47,
    digitalDetails: {
      deliveryMethod: 'ACCESS_LINK',
      accessLink: 'https://notion.so/lampungdev-template-demo',
      accessInstructions:
        'Buka link Notion di atas dan klik tombol "Duplicate" di pojok kanan atas untuk memasang template ke workspace Notion kamu.',
    },
    createdAt: new Date('2026-09-10'),
    updatedAt: new Date('2026-09-10'),
  },
];

const mockOrders: StoreOrder[] = [
  {
    id: 'ord-demo-01',
    orderNumber: 'ORD-WIN-20260918-001',
    storeId: 'store-demo-01',
    storeSlug: 'lampung-digital',
    storeName: 'Lampung Digital Creative',
    storeWhatsapp: '6281234567890',
    buyer: {
      name: 'Rian Pratama',
      whatsapp: '081298765432',
      email: 'rian.pratama@example.com',
      notes: 'Mohon kirimkan link template secepatnya kak.',
    },
    items: [
      {
        productId: 'prod-digital-01',
        productName: 'Bundle 50+ Template Canva Promosi UMKM Lampung',
        productType: 'DIGITAL',
        price: 49000,
        quantity: 1,
        digitalDetails: mockProducts[0].digitalDetails,
      },
    ],
    pricing: {
      subtotal: 49000,
      shippingCost: 0,
      discountAmount: 0,
      grandTotal: 49000,
    },
    payment: {
      channel: 'QRIS',
      status: 'PAID',
      paidAt: new Date(),
      transactionReference: 'QRIS-DEMO-SUCCESS',
    },
    fulfillment: {
      status: 'COMPLETED',
      completedAt: new Date(),
      digitalDelivered: true,
    },
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

export async function getStoreBySlug(slug: string): Promise<Store | null> {
  const db = await getDatabase();
  if (db) {
    try {
      const store = await db.collection<Store>(COLLECTION_STORES).findOne({ slug });
      if (store) return { ...store, id: store._id ? String(store._id) : store.id };
    } catch (e) {
      console.warn('[StoreService] MongoDB error:', e);
    }
  }
  return mockStores.find((s) => s.slug === slug.toLowerCase()) || null;
}

export async function getStoreByUserId(userId: string): Promise<Store | null> {
  const db = await getDatabase();
  if (db) {
    try {
      const store = await db.collection<Store>(COLLECTION_STORES).findOne({ userId });
      if (store) return { ...store, id: store._id ? String(store._id) : store.id };
    } catch (e) {
      console.warn('[StoreService] MongoDB error:', e);
    }
  }
  return mockStores.find((s) => s.userId === userId) || mockStores[0] || null;
}

export async function checkSlugAvailable(slug: string): Promise<boolean> {
  const cleanSlug = slug.toLowerCase().trim();
  const db = await getDatabase();
  if (db) {
    try {
      const count = await db.collection(COLLECTION_STORES).countDocuments({ slug: cleanSlug });
      return count === 0;
    } catch (e) {
      console.warn('[StoreService] MongoDB error checkSlugAvailable:', e);
    }
  }
  return !mockStores.some((s) => s.slug === cleanSlug);
}

export async function createStore(data: StoreApplyRequest & { userId?: string }): Promise<Store> {
  const id = `store-${ulid()}`;
  const cleanSlug = data.slug.toLowerCase().trim().replace(/[^a-z0-9-]/g, '-');
  
  const newStore: Store = {
    id,
    userId: data.userId || 'guest-member',
    name: data.storeName,
    slug: cleanSlug,
    tagline: data.bio ? data.bio.slice(0, 80) : `Toko Online Resmi ${data.storeName}`,
    bio: data.bio || '',
    whatsappNumber: data.whatsappNumber.replace(/^0/, '62'),
    category: data.category,
    primaryType: data.primaryType || 'DIGITAL',
    paymentConfig: {
      enableDirectWhatsApp: true,
      enablePaymentGateway: true,
    },
    status: 'ACTIVE',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const db = await getDatabase();
  if (db) {
    try {
      await db.collection(COLLECTION_STORES).insertOne(newStore as any);
    } catch (e) {
      console.warn('[StoreService] MongoDB error createStore:', e);
    }
  }

  // Always register to in-memory too so it's instantly available in current session
  mockStores.unshift(newStore);
  return newStore;
}

export async function getProductsByStore(storeId: string): Promise<StoreProduct[]> {
  const db = await getDatabase();
  if (db) {
    try {
      const prods = await db
        .collection<StoreProduct>(COLLECTION_PRODUCTS)
        .find({ storeId, isActive: true })
        .toArray();
      if (prods && prods.length > 0) {
        return prods.map((p) => ({ ...p, id: p._id ? String(p._id) : p.id }));
      }
    } catch (e) {
      console.warn('[StoreService] MongoDB error getProductsByStore:', e);
    }
  }

  // Fallback to in-memory mock products
  return mockProducts.filter((p) => p.storeId === storeId || storeId === 'store-demo-01');
}

export async function getProductBySlug(storeId: string, slug: string): Promise<StoreProduct | null> {
  const db = await getDatabase();
  if (db) {
    try {
      const prod = await db
        .collection<StoreProduct>(COLLECTION_PRODUCTS)
        .findOne({ slug });
      if (prod) return { ...prod, id: prod._id ? String(prod._id) : prod.id };
    } catch (e) {
      console.warn('[StoreService] MongoDB error getProductBySlug:', e);
    }
  }
  return mockProducts.find((p) => p.slug === slug) || null;
}

export async function createProduct(
  storeId: string,
  productData: Partial<StoreProduct>
): Promise<StoreProduct> {
  const id = `prod-${ulid()}`;
  const slug = (productData.name || 'produk')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

  const newProduct: StoreProduct = {
    id,
    storeId,
    name: productData.name || 'Produk Digital',
    slug: `${slug}-${id.slice(-4)}`,
    type: productData.type || 'DIGITAL',
    price: Number(productData.price) || 0,
    discountPrice: productData.discountPrice ? Number(productData.discountPrice) : undefined,
    description: productData.description || '',
    images:
      productData.images && productData.images.length > 0
        ? productData.images
        : ['https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80'],
    isActive: true,
    totalSales: 0,
    digitalDetails: productData.digitalDetails || {
      deliveryMethod: 'ACCESS_LINK',
      accessLink: 'https://lampungdev.tech',
      accessInstructions: 'Silakan buka tautan di atas untuk mengakses produk.',
    },
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const db = await getDatabase();
  if (db) {
    try {
      await db.collection(COLLECTION_PRODUCTS).insertOne(newProduct as any);
    } catch (e) {
      console.warn('[StoreService] MongoDB error createProduct:', e);
    }
  }

  mockProducts.unshift(newProduct);
  return newProduct;
}

export async function deleteProduct(storeId: string, productId: string): Promise<boolean> {
  const db = await getDatabase();
  if (db) {
    try {
      await db.collection(COLLECTION_PRODUCTS).deleteOne({ id: productId, storeId });
    } catch (e) {
      console.warn('[StoreService] MongoDB error deleteProduct:', e);
    }
  }
  const idx = mockProducts.findIndex((p) => p.id === productId);
  if (idx !== -1) {
    mockProducts.splice(idx, 1);
    return true;
  }
  return true;
}

export async function createOrder(data: {
  storeId: string;
  storeSlug: string;
  storeName: string;
  storeWhatsapp: string;
  buyerName: string;
  buyerWhatsapp: string;
  buyerEmail?: string;
  buyerNotes?: string;
  productId: string;
  paymentChannel: 'WHATSAPP_DIRECT' | 'QRIS';
}): Promise<StoreOrder> {
  const product = await getProductBySlug(data.storeId, data.productId) || mockProducts.find((p) => p.id === data.productId || p.slug === data.productId);

  const price = product?.discountPrice ?? product?.price ?? 50000;
  const id = `ord-${ulid()}`;
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const orderNumber = `ORD-WIN-${dateStr}-${id.slice(-4).toUpperCase()}`;

  const newOrder: StoreOrder = {
    id,
    orderNumber,
    storeId: data.storeId,
    storeSlug: data.storeSlug,
    storeName: data.storeName,
    storeWhatsapp: data.storeWhatsapp,
    buyer: {
      name: data.buyerName,
      whatsapp: data.buyerWhatsapp,
      email: data.buyerEmail,
      notes: data.buyerNotes,
    },
    items: [
      {
        productId: product?.id || data.productId,
        productName: product?.name || 'Produk Digital',
        productType: product?.type || 'DIGITAL',
        price,
        quantity: 1,
        digitalDetails: product?.digitalDetails,
      },
    ],
    pricing: {
      subtotal: price,
      shippingCost: 0,
      discountAmount: 0,
      grandTotal: price,
    },
    payment: {
      channel: data.paymentChannel,
      status: 'PENDING',
    },
    fulfillment: {
      status: 'WAITING_PAYMENT',
      digitalDelivered: false,
    },
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const db = await getDatabase();
  if (db) {
    try {
      await db.collection(COLLECTION_ORDERS).insertOne(newOrder as any);
    } catch (e) {
      console.warn('[StoreService] MongoDB error createOrder:', e);
    }
  }

  mockOrders.unshift(newOrder);
  return newOrder;
}

export async function getOrderById(orderId: string): Promise<StoreOrder | null> {
  const db = await getDatabase();
  if (db) {
    try {
      const order = await db.collection<StoreOrder>(COLLECTION_ORDERS).findOne({ id: orderId });
      if (order) return { ...order, id: order._id ? String(order._id) : order.id };
    } catch (e) {
      console.warn('[StoreService] MongoDB error getOrderById:', e);
    }
  }
  return mockOrders.find((o) => o.id === orderId || o.orderNumber === orderId) || null;
}

export async function markOrderPaid(orderId: string): Promise<StoreOrder | null> {
  const db = await getDatabase();
  if (db) {
    try {
      await db.collection(COLLECTION_ORDERS).updateOne(
        { id: orderId },
        {
          $set: {
            'payment.status': 'PAID',
            'payment.paidAt': new Date(),
            'fulfillment.status': 'COMPLETED',
            'fulfillment.completedAt': new Date(),
            'fulfillment.digitalDelivered': true,
            updatedAt: new Date(),
          },
        }
      );
    } catch (e) {
      console.warn('[StoreService] MongoDB error markOrderPaid:', e);
    }
  }

  const order = mockOrders.find((o) => o.id === orderId);
  if (order) {
    order.payment.status = 'PAID';
    order.payment.paidAt = new Date();
    order.fulfillment.status = 'COMPLETED';
    order.fulfillment.completedAt = new Date();
    order.fulfillment.digitalDelivered = true;
    return order;
  }
  return null;
}

export async function getOrdersByStore(storeId: string): Promise<StoreOrder[]> {
  const db = await getDatabase();
  if (db) {
    try {
      const orders = await db
        .collection<StoreOrder>(COLLECTION_ORDERS)
        .find({ storeId })
        .sort({ createdAt: -1 })
        .toArray();
      if (orders && orders.length > 0) {
        return orders.map((o) => ({ ...o, id: o._id ? String(o._id) : o.id }));
      }
    } catch (e) {
      console.warn('[StoreService] MongoDB error getOrdersByStore:', e);
    }
  }
  return mockOrders.filter((o) => o.storeId === storeId || storeId === 'store-demo-01');
}
