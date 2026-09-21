import { getDatabase } from '../lib/mongodb';
import { IEvent, IEventRegistration } from '../types/event';
import { Store, StoreProduct, StoreOrder } from '../types/store';
import {
  COLLECTION_FOUNDERS,
  defaultFounders,
  IFounder,
} from './founder.service';

export const COLLECTION_EVENTS = 'events';
export const COLLECTION_EVENT_REGISTRATIONS = 'event_registrations';
export const COLLECTION_POS_APPLICATIONS = 'pos_applications';
export const COLLECTION_STORES = 'stores';
export const COLLECTION_STORE_PRODUCTS = 'store_products';
export const COLLECTION_STORE_ORDERS = 'store_orders';
export { COLLECTION_FOUNDERS };

export interface PosApplication {
  id: string;
  ownerName: string;
  email: string;
  phone: string;
  brandName: string;
  concept: string;
  initialBranchAddress: string;
  estimatedCapex: number;
  targetCupsPerDay: number;
  status: 'PENDING_APPROVAL' | 'APPROVED' | 'REJECTED';
  appliedAt: string;
  notes?: string;
}

export interface DemoDataStats {
  eventsCount: number;
  registrationsCount: number;
  posApplicationsCount: number;
  storesCount: number;
  productsCount: number;
  ordersCount: number;
  foundersCount: number;
  databaseConnected: boolean;
}

// In-Memory Fallback State jika MongoDB sedang offline / dev lokal
let inMemoryEvents: IEvent[] = [];
let inMemoryRegistrations: IEventRegistration[] = [];
let inMemoryPosApplications: PosApplication[] = [];
let inMemoryStores: Store[] = [];
let inMemoryProducts: StoreProduct[] = [];
let inMemoryOrders: StoreOrder[] = [];
let inMemoryFounders: IFounder[] = [];

/**
 * Kumpulan Data Demo Lengkap untuk Pengujian Komunitas & Ekosistem LampungDevTech
 */
export function getInitialDemoDataset() {
  const now = new Date();

  // 1. Events (Masa Lalu/Selesai & Mendatang)
  const events: IEvent[] = [
    // --- EVENT SELESAI / PAST ---
    {
      id: 'EVT-PAST-01',
      title: 'Casual Meetup 11 di Kedai Rumah Belajar',
      slug: 'casual-meetup-11-kedai-rumah-belajar',
      date: '14 April 2025',
      time: '14:00 - 17:00 WIB',
      location: 'Kedai Rumah Belajar, Enggal',
      locationUrl: 'https://maps.app.goo.gl/NNNdpSu4jrTgzMio6',
      coordinates: {
        lat: '-5.382372',
        lng: '105.258556',
      },
      type: 'Casual Meetup',
      category: 'Casual Meetup',
      image: 'https://images.unsplash.com/photo-1515187029135-18ee286d815b?auto=format&fit=crop&q=80&w=1000',
      status: 'past',
      registrationStatus: 'CLOSED',
      maxCapacity: 40,
      registeredCount: 40,
      entryFee: 0,
      description: 'Pertemuan santai komunitas developer Lampung membahas adopsi arsitektur microservices dan kultur kolaborasi tech talent di daerah.',
      learningPoints: [
        'Kultur engineering remote vs hybrid di Lampung',
        'Dasar-dasar microservices dan message broker',
        'Networking antar software engineer dan founder startup lokal',
      ],
      requirements: ['Minat di bidang teknologi', 'Membawa kartu nama / profil LinkedIn'],
      createdAt: new Date('2025-03-20T08:00:00Z'),
      updatedAt: new Date('2025-04-14T17:30:00Z'),
    },
    {
      id: 'EVT-PAST-02',
      title: 'Workshop: Mobile App Development with Flutter & Go',
      slug: 'workshop-flutter-go-lampung',
      date: '1 March 2025',
      time: '09:00 - 16:00 WIB',
      location: 'Aula Gedung Meneng, Bandar Lampung',
      locationUrl: 'https://maps.app.goo.gl/NNNdpSu4jrTgzMio6',
      coordinates: {
        lat: '-5.364800',
        lng: '105.243500',
      },
      type: 'Workshop',
      category: 'Workshop',
      image: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?auto=format&fit=crop&q=80&w=1000',
      status: 'past',
      registrationStatus: 'CLOSED',
      maxCapacity: 60,
      registeredCount: 58,
      entryFee: 25000,
      description: 'Hands-on workshop seharian membangun aplikasi kasir mobile offline-first dengan Flutter dan REST API Golang Fiber.',
      learningPoints: [
        'State management Riverpod & BloC',
        'Penyimpanan lokal SQLite & Sinkronisasi Background',
        'Integrasi Bluetooth ESC/POS Thermal Printing',
      ],
      requirements: ['Laptop dengan Flutter SDK & Android Studio', 'Kabel data USB'],
      createdAt: new Date('2025-02-10T10:00:00Z'),
      updatedAt: new Date('2025-03-01T16:30:00Z'),
    },
    {
      id: 'EVT-PAST-03',
      title: 'Tech Talk: CI/CD & Cloud Native on Budget VPS',
      slug: 'tech-talk-cicd-cloud-native-vps',
      date: '10 January 2025',
      time: '19:30 - 21:30 WIB',
      location: 'Google Meet (Online Live)',
      type: 'Webinar',
      category: 'Webinar',
      image: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&q=80&w=1000',
      status: 'past',
      registrationStatus: 'CLOSED',
      maxCapacity: 100,
      registeredCount: 95,
      entryFee: 0,
      description: 'Strategi deployment production containerized di single VPS $5-$10/bulan menggunakan Docker Compose, Nginx Reverse Proxy, dan SSL otomatis.',
      learningPoints: [
        'Dockerizing Next.js & Golang Hexagonal microservices',
        'Konfigurasi memory limit & swap space pada VPS murah',
        'Automated GitHub Actions deployment pipeline',
      ],
      requirements: ['Koneksi internet stabil', 'Akun GitHub'],
      createdAt: new Date('2024-12-28T09:00:00Z'),
      updatedAt: new Date('2025-01-10T22:00:00Z'),
    },

    // --- EVENT MENDATANG / UPCOMING ---
    {
      id: 'EVT-UPCOMING-01',
      title: 'Lampung Tech Summit 2026: AI & Fintech Acceleration',
      slug: 'lampung-tech-summit-2026-ai-fintech',
      date: '15 October 2026',
      time: '08:30 - 16:30 WIB',
      location: 'Ballroom Hotel Novotel Lampung',
      locationUrl: 'https://maps.app.goo.gl/NNNdpSu4jrTgzMio6',
      coordinates: {
        lat: '-5.441200',
        lng: '105.267800',
      },
      type: 'Conference',
      category: 'Conference',
      image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&q=80&w=1000',
      status: 'upcoming',
      registrationStatus: 'OPEN',
      maxCapacity: 150,
      registeredCount: 42,
      entryFee: 50000,
      description: 'Konferensi tahunan terbesar komunitas teknologi di Lampung dengan topik Agentic AI, Payment Gateway Wesel Aja, dan Digitalisasi UMKM lokal.',
      learningPoints: [
        'Tren adopsi LLM & Agentic Coding dalam produk software skala global',
        'Peluang integrasi fintech QRIS untuk kafe dan ritel mandiri',
        'Showcase startup binaan komunitas LampungDevTech',
      ],
      requirements: ['Tiket pendaftaran QR', 'Membawa notebook / laptop (opsional)'],
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'EVT-UPCOMING-02',
      title: 'Casual Meetup: Mengembangkan Karir Fullstack & DevOps',
      slug: 'casual-meetup-fullstack-devops-career',
      date: '28 October 2026',
      time: '14:00 - 17:00 WIB',
      location: 'Kopi Ruang Temu, Jl. Raden Intan No. 45, Enggal',
      locationUrl: 'https://maps.app.goo.gl/NNNdpSu4jrTgzMio6',
      coordinates: {
        lat: '-5.405500',
        lng: '105.258000',
      },
      type: 'Casual Meetup',
      category: 'Casual Meetup',
      image: 'https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&q=80&w=1000',
      status: 'upcoming',
      registrationStatus: 'OPEN',
      maxCapacity: 35,
      registeredCount: 18,
      entryFee: 0,
      description: 'Diskusi intim dan tanya jawab seputar jenjang karir software engineering dari junior ke senior di remote working company.',
      learningPoints: [
        'Portofolio GitHub yang dilirik tech recruiter internasional',
        'Tips negosiasi gaji dan manajemen waktu kerja remote',
        'Live review CV & resume peserta oleh senior engineer',
      ],
      requirements: ['Membawa draft CV atau link portofolio (opsional)'],
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'EVT-UPCOMING-03',
      title: 'Hackathon Bootcamp: Solusi Cerdas Digitalisasi Kafe & POS',
      slug: 'hackathon-bootcamp-solusi-kafe-pos',
      date: '10 November 2026',
      time: '09:00 - 18:00 WIB',
      location: 'Co-Working Space Teluk Betung',
      type: 'Hackathon',
      category: 'Hackathon',
      image: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&q=80&w=1000',
      status: 'upcoming',
      registrationStatus: 'CLOSED',
      maxCapacity: 20,
      registeredCount: 20,
      entryFee: 0,
      description: 'Hackathon intensif 1 hari berhadiah untuk membangun fitur inovatif POS kafe lokal Lampung. Kuota peserta utama telah penuh (antrean waiting list dibuka).',
      learningPoints: [
        'Pemanfaatan Web Bluetooth ESC/POS langsung dari peramban web',
        'Kalkulasi margin profit BOM resep minuman otomatis',
        'Integrasi Webhook pembayaran QRIS Wesel Aja realtime',
      ],
      requirements: ['Tim 2-3 orang', 'Membawa laptop masing-masing'],
      createdAt: now,
      updatedAt: now,
    },
  ];

  // 2. Event Registrations (dengan QR Token untuk ngetest scanner check-in)
  const registrations: IEventRegistration[] = [
    // Registrasi untuk event masa lalu (sudah hadir)
    {
      id: 'REG-PAST-01',
      eventId: 'EVT-PAST-01',
      name: 'Rian Pratama',
      email: 'rian.pratama@gmail.com',
      phone: '081234567890',
      organization: 'PT Lampung Digital Solusindo',
      status: 'REGISTERED',
      attended: true,
      attendedAt: new Date('2025-04-14T14:15:00Z'),
      checkInQrToken: 'QR-PAST-RIAN-01',
      registeredAt: new Date('2025-04-01T10:00:00Z'),
    },
    {
      id: 'REG-PAST-02',
      eventId: 'EVT-PAST-01',
      name: 'Siti Rahmawati',
      email: 'siti.rahma@yahoo.com',
      phone: '081987654321',
      organization: 'Mahasiswa Informatika Unila',
      status: 'REGISTERED',
      attended: true,
      attendedAt: new Date('2025-04-14T14:22:00Z'),
      checkInQrToken: 'QR-PAST-SITI-02',
      registeredAt: new Date('2025-04-02T11:30:00Z'),
    },
    // Registrasi untuk event mendatang (siap di-scan check-in)
    {
      id: 'REG-UPCOMING-01',
      eventId: 'EVT-UPCOMING-01',
      name: 'Ahmad Fauzi',
      email: 'ahmad.fauzi@devmail.id',
      phone: '085278901234',
      organization: 'Kopi Ruang Temu Staff',
      status: 'REGISTERED',
      attended: false,
      attendedAt: null,
      checkInQrToken: 'TEST-QR-DEV-01',
      registeredAt: now,
    },
    {
      id: 'REG-UPCOMING-02',
      eventId: 'EVT-UPCOMING-01',
      name: 'Citra Dewi Lestari',
      email: 'citra.dewi@techlampung.org',
      phone: '087812345678',
      organization: 'Freelance UI/UX Designer',
      status: 'REGISTERED',
      attended: false,
      attendedAt: null,
      checkInQrToken: 'TEST-QR-DEV-02',
      registeredAt: now,
    },
    // Registrasi waiting list
    {
      id: 'REG-WAITING-01',
      eventId: 'EVT-UPCOMING-03',
      name: 'Budi Santoso',
      email: 'budi.santoso@gmail.com',
      phone: '082199887766',
      organization: 'Startup Indie Developer',
      status: 'WAITING_LIST',
      attended: false,
      attendedAt: null,
      checkInQrToken: 'TEST-QR-WAITING-01',
      registeredAt: now,
    },
  ];

  // 3. Pengajuan Mitra POS Kafe (`pos_applications`)
  const posApplications: PosApplication[] = [
    {
      id: 'APP-MITRA-001',
      ownerName: 'Rian Pratama',
      email: 'rian.pratama@gmail.com',
      phone: '081234567890',
      brandName: 'Kopi Ruang Temu',
      concept: 'Specialty Coffee & Creative Eatery',
      initialBranchAddress: 'Jl. Raden Intan No. 45, Enggal, Bandar Lampung',
      estimatedCapex: 75000000,
      targetCupsPerDay: 120,
      status: 'APPROVED',
      appliedAt: new Date(Date.now() - 5 * 86400000).toISOString(),
      notes: 'Disetujui. Merchant ID MCH-01 dan cabang utama telah diaktifkan.',
    },
    {
      id: 'APP-MITRA-002',
      ownerName: 'Siti Rahma',
      email: 'siti.rahma@yahoo.com',
      phone: '081987654321',
      brandName: 'Kopi Sudut Metro',
      concept: 'Coffee Booth / To-Go & Pastry Express',
      initialBranchAddress: 'Jl. AH Nasution No. 12, Metro Pusat',
      estimatedCapex: 35000000,
      targetCupsPerDay: 60,
      status: 'PENDING_APPROVAL',
      appliedAt: new Date(Date.now() - 1 * 86400000).toISOString(),
      notes: 'Menunggu verifikasi proposal dan lokasi cabang pertama.',
    },
    {
      id: 'APP-MITRA-003',
      ownerName: 'Ferry Gunawan',
      email: 'ferry.gunawan@gmail.com',
      phone: '081377889900',
      brandName: 'Kopi Selasar Teluk',
      concept: 'Sunset Coffee & Rooftop Acoustic',
      initialBranchAddress: 'Jl. Ikan Hiu No. 8, Teluk Betung Selatan',
      estimatedCapex: 95000000,
      targetCupsPerDay: 150,
      status: 'PENDING_APPROVAL',
      appliedAt: new Date(Date.now() - 2 * 3600000).toISOString(),
      notes: 'Pengajuan baru, membutuhkan review kelengkapan CapEx dan menu.',
    },
    {
      id: 'APP-MITRA-004',
      ownerName: 'Hendro Wijaya',
      email: 'hendro.w@spamtrap.xyz',
      phone: '089900001111',
      brandName: 'Kafe Instan Asal Jadi',
      concept: 'Warung Kopi Anonim',
      initialBranchAddress: 'Alamat fiktif belum terverifikasi',
      estimatedCapex: 1000000,
      targetCupsPerDay: 5,
      status: 'REJECTED',
      appliedAt: new Date(Date.now() - 10 * 86400000).toISOString(),
      notes: 'Ditolak: Informasi legalitas dan lokasi tidak valid.',
    },
  ];

  // 4. Toko Digital Mitra (`stores`)
  const stores: Store[] = [
    {
      id: 'STORE-DEMO-01',
      userId: 'USR-DEV-01',
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
      createdAt: now,
      updatedAt: now,
    },
  ];

  // 5. Produk Toko Mitra (`store_products`)
  const products: StoreProduct[] = [
    {
      id: 'PROD-DEMO-01',
      storeId: 'STORE-DEMO-01',
      name: 'Bundle 50+ Template Canva Promosi UMKM Lampung',
      slug: 'bundle-canva-umkm-lampung',
      type: 'DIGITAL',
      price: 99000,
      discountPrice: 49000,
      description: 'Tingkatkan omset jualan olshop dan kafe kamu dengan 50+ desain feeds & reels Canva berkonversi tinggi siap pakai.',
      images: [
        'https://images.unsplash.com/photo-1626785774573-4b799315345d?w=800&auto=format&fit=crop&q=80',
      ],
      isActive: true,
      totalSales: 48,
      digitalDetails: {
        deliveryMethod: 'ACCESS_LINK',
        accessLink: 'https://canva.com/design/sample-template-lampungdev',
        accessInstructions: 'Klik tautan untuk membuka template langsung di aplikasi Canva akun Anda.',
      },
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'PROD-DEMO-02',
      storeId: 'STORE-DEMO-01',
      name: 'E-Book: Masterclass Jualan Kuliner & Kafe di Medsos 2026',
      slug: 'ebook-masterclass-kuliner-medsos',
      type: 'DIGITAL',
      price: 75000,
      discountPrice: 35000,
      description: 'Panduan A-Z strategi konten viral TikTok & Instagram Reels untuk pebisnis kuliner dan kafe daerah.',
      images: [
        'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=800&auto=format&fit=crop&q=80',
      ],
      isActive: true,
      totalSales: 32,
      digitalDetails: {
        deliveryMethod: 'FILE_DOWNLOAD',
        fileName: 'ebook-masterclass-kuliner-medsos-2026.pdf',
        fileSize: '14.2 MB',
        accessInstructions: 'Tautan unduh otomatis akan terbuka setelah konfirmasi pembayaran QRIS terverifikasi.',
      },
      createdAt: now,
      updatedAt: now,
    },
  ];

  // 6. Pesanan Demo (`store_orders`)
  const orders: StoreOrder[] = [
    {
      id: 'ORD-DEMO-001',
      orderNumber: 'ORD-WESEL-20260921-001',
      storeId: 'STORE-DEMO-01',
      storeSlug: 'lampung-digital',
      storeName: 'Lampung Digital Creative',
      storeWhatsapp: '6281234567890',
      buyer: {
        name: 'Dimas Wicaksono',
        whatsapp: '081277112233',
        email: 'dimas.w@gmail.com',
      },
      product: {
        id: 'PROD-DEMO-01',
        name: 'Bundle 50+ Template Canva Promosi UMKM Lampung',
        type: 'DIGITAL',
        price: 49000,
      },
      quantity: 1,
      totalAmount: 49000,
      paymentMethod: 'QRIS',
      paymentStatus: 'PAID',
      fulfillmentStatus: 'COMPLETED',
      digitalDelivery: {
        deliveredAt: new Date(Date.now() - 3600000),
        accessLinkOrFile: 'https://canva.com/design/sample-template-lampungdev',
      },
      paymentGateway: {
        provider: 'weselaja',
        transactionId: 'TRX-WESEL-DEMO-991',
        paidAt: new Date(Date.now() - 3600000),
      },
      createdAt: new Date(Date.now() - 3600000),
      updatedAt: new Date(Date.now() - 3600000),
    },
  ];

  return {
    events,
    registrations,
    posApplications,
    stores,
    products,
    orders,
    founders: defaultFounders,
  };
}

/**
 * Memasukkan data seeder pengujian ke database (MongoDB) atau memory fallback
 */
export async function seedDemoData() {
  const dataset = getInitialDemoDataset();
  const db = await getDatabase();

  if (!db) {
    // Simpan ke in-memory jika MongoDB offline
    inMemoryEvents = [...dataset.events];
    inMemoryRegistrations = [...dataset.registrations];
    inMemoryPosApplications = [...dataset.posApplications];
    inMemoryStores = [...dataset.stores];
    inMemoryProducts = [...dataset.products];
    inMemoryOrders = [...dataset.orders];
    inMemoryFounders = [...dataset.founders];

    return {
      success: true,
      mode: 'in-memory',
      message: 'Berhasil memasukkan data seeder pengujian (Mock In-Memory Mode).',
      counts: {
        events: inMemoryEvents.length,
        registrations: inMemoryRegistrations.length,
        posApplications: inMemoryPosApplications.length,
        stores: inMemoryStores.length,
        products: inMemoryProducts.length,
        orders: inMemoryOrders.length,
        founders: inMemoryFounders.length,
      },
    };
  }

  // 1. Seed Events
  const eventsCollection = db.collection(COLLECTION_EVENTS);
  await eventsCollection.deleteMany({});
  await eventsCollection.insertMany(dataset.events as any);

  // Indexes
  await eventsCollection.createIndex({ slug: 1 }, { unique: true }).catch(() => {});
  await eventsCollection.createIndex({ status: 1, date: 1 }).catch(() => {});
  await eventsCollection.createIndex({ title: 'text', description: 'text', location: 'text' }).catch(() => {});

  // 2. Seed Event Registrations
  const regCollection = db.collection(COLLECTION_EVENT_REGISTRATIONS);
  await regCollection.deleteMany({});
  await regCollection.insertMany(dataset.registrations as any);
  await regCollection.createIndex({ checkInQrToken: 1 }, { unique: true }).catch(() => {});
  await regCollection.createIndex({ eventId: 1, email: 1 }).catch(() => {});

  // 3. Seed POS Applications
  const posCollection = db.collection(COLLECTION_POS_APPLICATIONS);
  await posCollection.deleteMany({});
  await posCollection.insertMany(dataset.posApplications as any);

  // 4. Seed Stores
  const storesCollection = db.collection(COLLECTION_STORES);
  await storesCollection.deleteMany({});
  await storesCollection.insertMany(dataset.stores as any);

  // 5. Seed Store Products
  const productsCollection = db.collection(COLLECTION_STORE_PRODUCTS);
  await productsCollection.deleteMany({});
  await productsCollection.insertMany(dataset.products as any);

  // 6. Seed Store Orders
  const ordersCollection = db.collection(COLLECTION_STORE_ORDERS);
  await ordersCollection.deleteMany({});
  await ordersCollection.insertMany(dataset.orders as any);

  // 7. Seed Founders & Co-Founders
  const foundersCollection = db.collection(COLLECTION_FOUNDERS);
  await foundersCollection.deleteMany({});
  await foundersCollection.insertMany(dataset.founders as any);
  await foundersCollection.createIndex({ id: 1 }, { unique: true }).catch(() => {});
  await foundersCollection.createIndex({ order: 1 }).catch(() => {});

  return {
    success: true,
    mode: 'mongodb',
    message: 'Data seeder pengujian berhasil dimasukkan ke MongoDB.',
    counts: {
      events: dataset.events.length,
      registrations: dataset.registrations.length,
      posApplications: dataset.posApplications.length,
      stores: dataset.stores.length,
      products: dataset.products.length,
      orders: dataset.orders.length,
      founders: dataset.founders.length,
    },
  };
}

/**
 * Membersihkan seluruh data demo dari database MongoDB & In-Memory
 */
export async function cleanDemoData() {
  const db = await getDatabase();

  if (!db) {
    const deletedCounts = {
      events: inMemoryEvents.length,
      registrations: inMemoryRegistrations.length,
      posApplications: inMemoryPosApplications.length,
      stores: inMemoryStores.length,
      products: inMemoryProducts.length,
      orders: inMemoryOrders.length,
      founders: inMemoryFounders.length,
    };

    inMemoryEvents = [];
    inMemoryRegistrations = [];
    inMemoryPosApplications = [];
    inMemoryStores = [];
    inMemoryProducts = [];
    inMemoryOrders = [];
    inMemoryFounders = [];

    return {
      success: true,
      mode: 'in-memory',
      message: 'Seluruh data demo berhasil dibersihkan (Mock In-Memory).',
      deletedCounts,
    };
  }

  const [delEvents, delRegs, delPos, delStores, delProds, delOrders, delFounders] = await Promise.all([
    db.collection(COLLECTION_EVENTS).deleteMany({}),
    db.collection(COLLECTION_EVENT_REGISTRATIONS).deleteMany({}),
    db.collection(COLLECTION_POS_APPLICATIONS).deleteMany({}),
    db.collection(COLLECTION_STORES).deleteMany({}),
    db.collection(COLLECTION_STORE_PRODUCTS).deleteMany({}),
    db.collection(COLLECTION_STORE_ORDERS).deleteMany({}),
    db.collection(COLLECTION_FOUNDERS).deleteMany({}),
  ]);

  return {
    success: true,
    mode: 'mongodb',
    message: 'Seluruh koleksi data demo berhasil dikosongkan dari MongoDB.',
    deletedCounts: {
      events: delEvents.deletedCount,
      registrations: delRegs.deletedCount,
      posApplications: delPos.deletedCount,
      stores: delStores.deletedCount,
      products: delProds.deletedCount,
      orders: delOrders.deletedCount,
      founders: delFounders.deletedCount,
    },
  };
}

/**
 * Mengambil ringkasan statistik dokumen saat ini
 */
export async function getDemoDataStats(): Promise<DemoDataStats> {
  const db = await getDatabase();

  if (!db) {
    return {
      eventsCount: inMemoryEvents.length,
      registrationsCount: inMemoryRegistrations.length,
      posApplicationsCount: inMemoryPosApplications.length,
      storesCount: inMemoryStores.length,
      productsCount: inMemoryProducts.length,
      ordersCount: inMemoryOrders.length,
      foundersCount: inMemoryFounders.length,
      databaseConnected: false,
    };
  }

  const [
    eventsCount,
    registrationsCount,
    posApplicationsCount,
    storesCount,
    productsCount,
    ordersCount,
    foundersCount,
  ] = await Promise.all([
    db.collection(COLLECTION_EVENTS).countDocuments(),
    db.collection(COLLECTION_EVENT_REGISTRATIONS).countDocuments(),
    db.collection(COLLECTION_POS_APPLICATIONS).countDocuments(),
    db.collection(COLLECTION_STORES).countDocuments(),
    db.collection(COLLECTION_STORE_PRODUCTS).countDocuments(),
    db.collection(COLLECTION_STORE_ORDERS).countDocuments(),
    db.collection(COLLECTION_FOUNDERS).countDocuments(),
  ]);

  return {
    eventsCount,
    registrationsCount,
    posApplicationsCount,
    storesCount,
    productsCount,
    ordersCount,
    foundersCount,
    databaseConnected: true,
  };
}
