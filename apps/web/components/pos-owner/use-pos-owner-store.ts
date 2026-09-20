'use client';

import { useState, useEffect } from 'react';
import {
  BankAccount,
  CashVault,
  RawMaterial,
  PurchaseOrder,
  StaffShift,
  StaffKPI,
  ActivePromo,
  CustomerMember,
  AssetRecord,
  SopItem,
  ParkingReport,
  AuditLog,
  ElectricityUsage,
} from './types';

// Initial Mock Data
const INITIAL_BANKS: BankAccount[] = [
  {
    id: 'BNK-01',
    bankName: 'Bank BCA',
    accountNumber: '890-552-1920',
    accountHolder: 'PT Kopi Ruang Temu',
    balance: 42500000,
    branchId: '01-MAIN',
    isMain: true,
  },
  {
    id: 'BNK-02',
    bankName: 'Bank BNI',
    accountNumber: '028-119-4821',
    accountHolder: 'Kopi Ruang Temu Rek 2',
    balance: 18200000,
    branchId: '01-MAIN',
    isMain: false,
  },
  {
    id: 'BNK-03',
    bankName: 'Bank Mandiri',
    accountNumber: '114-00-982145-2',
    accountHolder: 'Operasional Outlet Kemiling',
    balance: 25800000,
    branchId: '02-KEMILING',
    isMain: false,
  },
];

const INITIAL_VAULT: CashVault = {
  cashRegister: 1850000,
  pettyCash: 1500000,
  parkingCash: 420000,
  gatewayBalance: 6350000,
  gatewayProvider: 'Wesel Aja / Midtrans QRIS',
};

const INITIAL_ELECTRICITY: ElectricityUsage = {
  kwhUsed: 1450,
  estimatedCost: 2175000,
  month: 'September 2026',
  tariffPerKwh: 1500,
  peakHourUsagePercent: 62,
};

const INITIAL_MATERIALS: RawMaterial[] = [
  {
    id: 'MAT-01',
    name: 'Biji Kopi Arabika Ulubelu',
    category: 'Coffee Beans',
    currentStock: 3.5,
    minStock: 8.0,
    unit: 'kg',
    unitCost: 140000,
    supplierName: 'Koperasi Tani Lampung Coffee',
    lastRestocked: '2026-09-15',
  },
  {
    id: 'MAT-02',
    name: 'Susu Fresh Milk Pasteurisasi',
    category: 'Dairy',
    currentStock: 6,
    minStock: 20,
    unit: 'liter',
    unitCost: 21000,
    supplierName: 'Greenfields Dairy Direct',
    lastRestocked: '2026-09-18',
  },
  {
    id: 'MAT-03',
    name: 'Paper Cup Cold 16oz + Tutup',
    category: 'Packaging',
    currentStock: 80,
    minStock: 250,
    unit: 'pcs',
    unitCost: 850,
    supplierName: 'Mitra Kemasan Utama',
    lastRestocked: '2026-09-12',
  },
  {
    id: 'MAT-04',
    name: 'Sirup Karamel Monin 700ml',
    category: 'Syrups',
    currentStock: 4,
    minStock: 2,
    unit: 'botol',
    unitCost: 145000,
    supplierName: 'Barista Supply Store',
    lastRestocked: '2026-09-10',
  },
];

const INITIAL_POS: PurchaseOrder[] = [
  {
    id: 'PO-2026-091',
    poNumber: 'PO/2026/09/001',
    materialId: 'MAT-01',
    materialName: 'Biji Kopi Arabika Ulubelu (20 kg)',
    quantity: 20,
    unit: 'kg',
    totalCost: 2800000,
    supplierName: 'Koperasi Tani Lampung Coffee',
    orderDate: '2026-09-19',
    status: 'ORDERED',
  },
  {
    id: 'PO-2026-092',
    poNumber: 'PO/2026/09/002',
    materialId: 'MAT-02',
    materialName: 'Fresh Milk Pasteurisasi (30 liter)',
    quantity: 30,
    unit: 'liter',
    totalCost: 630000,
    supplierName: 'Greenfields Dairy Direct',
    orderDate: '2026-09-20',
    status: 'DRAFT',
  },
];

const INITIAL_SHIFTS: StaffShift[] = [
  {
    id: 'SFT-01',
    staffId: 'STF-01',
    staffName: 'Ahmad Fauzi',
    role: 'CASHIER',
    date: '2026-09-20',
    dayName: 'Minggu (Hari ini)',
    shiftType: 'PAGI',
    shiftHours: '07:00 - 15:00',
    attendanceStatus: 'ON_TIME',
    lateMinutes: 0,
  },
  {
    id: 'SFT-02',
    staffId: 'STF-02',
    staffName: 'Budi Santoso',
    role: 'BARISTA',
    date: '2026-09-20',
    dayName: 'Minggu (Hari ini)',
    shiftType: 'PAGI',
    shiftHours: '07:00 - 15:00',
    attendanceStatus: 'LATE',
    lateMinutes: 14,
  },
  {
    id: 'SFT-03',
    staffId: 'STF-03',
    staffName: 'Citra Dewi',
    role: 'CASHIER',
    date: '2026-09-20',
    dayName: 'Minggu (Hari ini)',
    shiftType: 'MALAM',
    shiftHours: '15:00 - 23:00',
    attendanceStatus: 'UPCOMING',
    lateMinutes: 0,
  },
  {
    id: 'SFT-04',
    staffId: 'STF-04',
    staffName: 'Dimas Pratama',
    role: 'BARISTA',
    date: '2026-09-20',
    dayName: 'Minggu (Hari ini)',
    shiftType: 'MALAM',
    shiftHours: '15:00 - 23:00',
    attendanceStatus: 'UPCOMING',
    lateMinutes: 0,
  },
  {
    id: 'SFT-05',
    staffId: 'STF-01',
    staffName: 'Ahmad Fauzi',
    role: 'CASHIER',
    date: '2026-09-21',
    dayName: 'Senin',
    shiftType: 'PAGI',
    shiftHours: '07:00 - 15:00',
    attendanceStatus: 'UPCOMING',
    lateMinutes: 0,
  },
  {
    id: 'SFT-06',
    staffId: 'STF-03',
    staffName: 'Citra Dewi',
    role: 'CASHIER',
    date: '2026-09-21',
    dayName: 'Senin',
    shiftType: 'MALAM',
    shiftHours: '15:00 - 23:00',
    attendanceStatus: 'UPCOMING',
    lateMinutes: 0,
  },
];

const INITIAL_KPIS: StaffKPI[] = [
  {
    rank: 1,
    staffId: 'STF-01',
    name: 'Ahmad Fauzi',
    role: 'Senior Cashier',
    ordersServed: 124,
    totalRevenue: 3720000,
    avgSpeedMinutes: 1.4,
    customerRating: 4.95,
    cashDiscrepancy: 0,
  },
  {
    rank: 2,
    staffId: 'STF-03',
    name: 'Citra Dewi',
    role: 'Outlet Cashier',
    ordersServed: 98,
    totalRevenue: 2940000,
    avgSpeedMinutes: 1.7,
    customerRating: 4.88,
    cashDiscrepancy: 0,
  },
  {
    rank: 3,
    staffId: 'STF-02',
    name: 'Budi Santoso',
    role: 'Head Barista',
    ordersServed: 85,
    totalRevenue: 2550000,
    avgSpeedMinutes: 2.1,
    customerRating: 4.82,
    cashDiscrepancy: -2000,
  },
];

const INITIAL_PROMOS: ActivePromo[] = [
  {
    id: 'PRM-01',
    title: 'Happy Hour Coffee 20%',
    code: 'HAPPYCOFFEE',
    discountType: 'PERCENTAGE',
    value: 20,
    minSpend: 35000,
    quota: 100,
    usedCount: 43,
    isActive: true,
    validUntil: '2026-09-30',
    applicableCategory: 'Coffee & Beverages',
  },
  {
    id: 'PRM-02',
    title: 'Potongan Rp 10.000 QRIS Wesel Aja',
    code: 'WESELHEMAT',
    discountType: 'FIXED',
    value: 10000,
    minSpend: 50000,
    quota: 50,
    usedCount: 31,
    isActive: true,
    validUntil: '2026-09-28',
    applicableCategory: 'All Menu',
  },
  {
    id: 'PRM-03',
    title: 'Beli 1 Kopi Susu Gratis Donat',
    code: 'BOGODONUT',
    discountType: 'BOGO',
    value: 1,
    minSpend: 25000,
    quota: 30,
    usedCount: 18,
    isActive: false,
    validUntil: '2026-09-25',
    applicableCategory: 'Pastry & Coffee',
  },
];

const INITIAL_CUSTOMERS: CustomerMember[] = [
  {
    id: 'CUST-01',
    name: 'Reza Pratama',
    phone: '0812-7890-1234',
    email: 'reza.pratama@gmail.com',
    points: 450,
    tier: 'GOLD',
    totalOrders: 38,
    totalSpent: 1140000,
    canLoginWeb: true,
    registeredDate: '2026-05-10',
  },
  {
    id: 'CUST-02',
    name: 'Nadya Safitri',
    phone: '0857-8912-3456',
    email: 'nadya.s@yahoo.com',
    points: 210,
    tier: 'SILVER',
    totalOrders: 19,
    totalSpent: 570000,
    canLoginWeb: true,
    registeredDate: '2026-07-22',
  },
  {
    id: 'CUST-03',
    name: 'Doni Iskandar',
    phone: '0821-3456-7890',
    email: 'doni.iskandar@outlook.com',
    points: 80,
    tier: 'BRONZE',
    totalOrders: 6,
    totalSpent: 180000,
    canLoginWeb: false,
    registeredDate: '2026-09-02',
  },
];

const INITIAL_ASSETS: AssetRecord[] = [
  {
    id: 'AST-01',
    assetCode: 'EQ-LMR-01',
    name: 'La Marzocco Linea Classic 2-Group',
    category: 'EQUIPMENT',
    brandModel: 'La Marzocco / Italy 2024',
    branchId: '01-MAIN',
    purchaseDate: '2024-03-15',
    acquisitionCost: 145000000,
    condition: 'EXCELLENT',
    lastServiceDate: '2026-08-10',
    notes: 'Kalibrasi boiler tekanan 9 bar stabil',
  },
  {
    id: 'AST-02',
    assetCode: 'EQ-MHL-02',
    name: 'Grinder Mahlkonig EK43',
    category: 'EQUIPMENT',
    brandModel: 'Mahlkonig / Germany',
    branchId: '01-MAIN',
    purchaseDate: '2024-03-20',
    acquisitionCost: 48000000,
    condition: 'GOOD',
    lastServiceDate: '2026-07-15',
    notes: 'Pisau burr 98mm masih tajam',
  },
  {
    id: 'AST-03',
    assetCode: 'EL-POS-03',
    name: 'Tablet POS Kasir Samsung Galaxy Tab A9',
    category: 'ELECTRONICS',
    brandModel: 'Samsung Galaxy Tab A9 64GB',
    branchId: '01-MAIN',
    purchaseDate: '2025-01-10',
    acquisitionCost: 2800000,
    condition: 'EXCELLENT',
    notes: 'Dedicated terminal kasir counter',
  },
  {
    id: 'AST-04',
    assetCode: 'EL-PRN-04',
    name: 'Thermal Receipt Printer Bluetooth 80mm',
    category: 'ELECTRONICS',
    brandModel: 'Epson TM-T82X',
    branchId: '01-MAIN',
    purchaseDate: '2025-01-12',
    acquisitionCost: 1950000,
    condition: 'NEEDS_SERVICE',
    notes: 'Roller pemotong kertas kadang seret',
  },
];

const INITIAL_SOPS: SopItem[] = [
  {
    id: 'SOP-01',
    title: 'SOP 01: Pembukaan Shift Kasir & Modal Awal',
    category: 'OPENING',
    estimatedMinutes: 15,
    targetRole: 'Kasir',
    lastUpdated: '2026-09-01',
    steps: [
      { id: 'st-1', text: 'Hitung uang kas modal laci kasir (harus persis Rp 200.000).', done: true },
      { id: 'st-2', text: 'Buka aplikasi terminal POS dan tekan tombol "Buka Shift".', done: true },
      { id: 'st-3', text: 'Cek persediaan kertas struk kasir thermal 80mm.', done: true },
      { id: 'st-4', text: 'Pastikan koneksi printer thermal Bluetooth dan scanner QRIS aktif.', done: true },
    ],
  },
  {
    id: 'SOP-02',
    title: 'SOP 02: Kalibrasi Espresso Pagi Barista',
    category: 'BREWING',
    estimatedMinutes: 20,
    targetRole: 'Barista',
    lastUpdated: '2026-09-05',
    steps: [
      { id: 'st-5', text: 'Buang 1 shot pertama untuk membilas group head.', done: true },
      { id: 'st-6', text: 'Timbang dosis kopi 18.5 gram pada portafilter.', done: true },
      { id: 'st-7', text: 'Ekstraksi 36 gram liquid dalam waktu 26 - 29 detik.', done: true },
      { id: 'st-8', text: 'Uji rasa (balance sweet & acidity, tidak over-extract).', done: false },
    ],
  },
  {
    id: 'SOP-03',
    title: 'SOP 03: Penutupan Shift & Rekonsiliasi Kasir',
    category: 'CLOSING',
    estimatedMinutes: 25,
    targetRole: 'Kasir & Supervisor',
    lastUpdated: '2026-09-08',
    steps: [
      { id: 'st-9', text: 'Cetak laporan ringkasan shift kasir (*Shift Summary*).', done: false },
      { id: 'st-10', text: 'Hitung total fisik uang tunai di laci dan bandingkan dengan sistem POS.', done: false },
      { id: 'st-11', text: 'Pisahkan uang omzet ke amplop setoran bank, sisakan Rp 200.000 untuk shift esok.', done: false },
      { id: 'st-12', text: 'Kunci laci kasir dan serahkan kunci ke supervisor/brankas.', done: false },
    ],
  },
];

const INITIAL_PARKING: ParkingReport[] = [
  {
    id: 'PRK-W37',
    weekRange: '08 Sep - 14 Sep 2026',
    totalVehiclesMotor: 1420,
    totalVehiclesMobil: 310,
    grossRevenue: 4390000,
    storeSharePercent: 60,
    keeperSharePercent: 40,
    storeNet: 2634000,
    keeperNet: 1756000,
    keeperName: 'Pak Sukirno (Koordinator Parkir)',
    status: 'SETTLED',
  },
  {
    id: 'PRK-W38',
    weekRange: '15 Sep - 20 Sep 2026 (Berjalan)',
    totalVehiclesMotor: 1180,
    totalVehiclesMobil: 265,
    grossRevenue: 3685000,
    storeSharePercent: 60,
    keeperSharePercent: 40,
    storeNet: 2211000,
    keeperNet: 1474000,
    keeperName: 'Pak Sukirno (Koordinator Parkir)',
    status: 'PENDING',
  },
];

const INITIAL_LOGS: AuditLog[] = [
  {
    id: 'LOG-01',
    timestamp: '2026-09-20 11:32:15',
    userName: 'Ahmad Fauzi',
    role: 'CASHIER',
    branchName: 'Enggal (Cabang Utama)',
    action: 'Login Kasir Tablet (Cloudflare Turnstile Verified)',
    deviceInfo: 'Samsung Tab A9 • Chrome Android 14',
    ipAddress: '182.1.204.88 (Telkomsel)',
    status: 'SUCCESS',
  },
  {
    id: 'LOG-02',
    timestamp: '2026-09-20 07:14:20',
    userName: 'Budi Santoso',
    role: 'BARISTA',
    branchName: 'Enggal (Cabang Utama)',
    action: 'Presensi Masuk (Terlambat 14 menit)',
    deviceInfo: 'Xiaomi Redmi Note 13 • Android 14',
    ipAddress: '182.1.204.88 (Wi-Fi Kafe)',
    status: 'WARNING',
  },
  {
    id: 'LOG-03',
    timestamp: '2026-09-20 07:00:10',
    userName: 'Ahmad Fauzi',
    role: 'CASHIER',
    branchName: 'Enggal (Cabang Utama)',
    action: 'Pembukaan Shift 1 (Modal Kas Rp 200.000)',
    deviceInfo: 'Samsung Tab A9 • POS App v1.0',
    ipAddress: '182.1.204.88 (Wi-Fi Kafe)',
    status: 'SUCCESS',
  },
  {
    id: 'LOG-04',
    timestamp: '2026-09-19 23:15:40',
    userName: 'Citra Dewi',
    role: 'CASHIER',
    branchName: 'Kemiling Outlet',
    action: 'Penutupan Shift Kasir (Laporan Omset Rp 980.000)',
    deviceInfo: 'iPad 10th Gen • Safari iOS 18',
    ipAddress: '103.144.17.20 (Indihome)',
    status: 'SUCCESS',
  },
];

// Helper to safely load localStorage
function loadStored<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const item = localStorage.getItem(`pos_owner_${key}`);
    return item ? JSON.parse(item) : fallback;
  } catch (e) {
    return fallback;
  }
}

// Hook Store Utama
export function usePosOwnerStore() {
  const [banks, setBanks] = useState<BankAccount[]>(() => loadStored('banks', INITIAL_BANKS));
  const [vault, setVault] = useState<CashVault>(() => loadStored('vault', INITIAL_VAULT));
  const [electricity, setElectricity] = useState<ElectricityUsage>(() => loadStored('electricity', INITIAL_ELECTRICITY));
  const [materials, setMaterials] = useState<RawMaterial[]>(() => loadStored('materials', INITIAL_MATERIALS));
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>(() => loadStored('pos', INITIAL_POS));
  const [shifts, setShifts] = useState<StaffShift[]>(() => loadStored('shifts', INITIAL_SHIFTS));
  const [kpis] = useState<StaffKPI[]>(INITIAL_KPIS);
  const [promos, setPromos] = useState<ActivePromo[]>(() => loadStored('promos', INITIAL_PROMOS));
  const [customers, setCustomers] = useState<CustomerMember[]>(() => loadStored('customers', INITIAL_CUSTOMERS));
  const [assets, setAssets] = useState<AssetRecord[]>(() => loadStored('assets', INITIAL_ASSETS));
  const [sops, setSops] = useState<SopItem[]>(() => loadStored('sops', INITIAL_SOPS));
  const [parkings, setParkings] = useState<ParkingReport[]>(() => loadStored('parkings', INITIAL_PARKING));
  const [logs] = useState<AuditLog[]>(INITIAL_LOGS);

  // Auto-sync ke localStorage setiap ada perubahan
  useEffect(() => {
    try {
      localStorage.setItem('pos_owner_banks', JSON.stringify(banks));
      localStorage.setItem('pos_owner_vault', JSON.stringify(vault));
      localStorage.setItem('pos_owner_electricity', JSON.stringify(electricity));
      localStorage.setItem('pos_owner_materials', JSON.stringify(materials));
      localStorage.setItem('pos_owner_pos', JSON.stringify(purchaseOrders));
      localStorage.setItem('pos_owner_shifts', JSON.stringify(shifts));
      localStorage.setItem('pos_owner_promos', JSON.stringify(promos));
      localStorage.setItem('pos_owner_customers', JSON.stringify(customers));
      localStorage.setItem('pos_owner_assets', JSON.stringify(assets));
      localStorage.setItem('pos_owner_sops', JSON.stringify(sops));
      localStorage.setItem('pos_owner_parkings', JSON.stringify(parkings));
    } catch (e) {}
  }, [banks, vault, electricity, materials, purchaseOrders, shifts, promos, customers, assets, sops, parkings]);

  // Initial background fetch from backend API
  useEffect(() => {
    fetch('/api/pos/owner/banks')
      .then((res) => res.json())
      .then((json) => {
        if (json.success && Array.isArray(json.data) && json.data.length > 0) {
          setBanks((prev) => {
            const apiBankIds = new Set(json.data.map((b: any) => b.id));
            const localOnly = prev.filter((b) => !apiBankIds.has(b.id));
            return [...json.data, ...localOnly];
          });
        }
      })
      .catch(() => {});
  }, []);

  // Kalkulasi Saldo Total Konsolidasi
  const totalBankBalance = banks.reduce((acc, b) => acc + b.balance, 0);
  const totalPhysicalCash = vault.cashRegister + vault.pettyCash + vault.parkingCash;
  const totalGrandBalance = totalBankBalance + totalPhysicalCash + vault.gatewayBalance;

  // --- CRUD BANK ---
  const addBank = (data: Omit<BankAccount, 'id'>) => {
    const newBank: BankAccount = {
      ...data,
      id: `BNK-${Date.now().toString().slice(-4)}`,
    };
    setBanks((prev) => [...prev, newBank]);
    fetch('/api/pos/owner/banks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newBank),
    }).catch(() => {});
  };

  const updateBank = (id: string, updates: Partial<BankAccount>) => {
    setBanks((prev) => prev.map((b) => (b.id === id ? { ...b, ...updates } : b)));
    fetch(`/api/pos/owner/banks/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    }).catch(() => {});
  };

  const deleteBank = (id: string) => {
    setBanks((prev) => prev.filter((b) => b.id !== id));
    fetch(`/api/pos/owner/banks/${id}`, {
      method: 'DELETE',
    }).catch(() => {});
  };

  // --- MUTASI KAS ---
  const updateVault = (updates: Partial<CashVault>) => {
    setVault((prev) => ({ ...prev, ...updates }));
  };

  const transferGatewayToBank = (amount: number, targetBankId: string) => {
    if (amount <= 0 || amount > vault.gatewayBalance) return false;
    setVault((prev) => ({ ...prev, gatewayBalance: prev.gatewayBalance - amount }));
    setBanks((prev) =>
      prev.map((b) => (b.id === targetBankId ? { ...b, balance: b.balance + amount } : b))
    );
    fetch('/api/pos/owner/finance/withdraw-gateway', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ targetBankId, amount }),
    }).catch(() => {});
    return true;
  };

  // --- CRUD BAHAN BAKU & PO ---
  const addMaterial = (data: Omit<RawMaterial, 'id' | 'lastRestocked'>) => {
    const newMat: RawMaterial = {
      ...data,
      id: `MAT-${Date.now().toString().slice(-4)}`,
      lastRestocked: new Date().toISOString().split('T')[0],
    };
    setMaterials((prev) => [...prev, newMat]);
    fetch('/api/pos/owner/inventory/materials', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newMat),
    }).catch(() => {});
  };

  const updateStock = (id: string, newStock: number) => {
    setMaterials((prev) =>
      prev.map((m) =>
        m.id === id
          ? { ...m, currentStock: newStock, lastRestocked: new Date().toISOString().split('T')[0] }
          : m
      )
    );
    fetch(`/api/pos/owner/inventory/materials/${id}/opname`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ actualStock: newStock }),
    }).catch(() => {});
  };

  const deleteMaterial = (id: string) => {
    setMaterials((prev) => prev.filter((m) => m.id !== id));
    fetch(`/api/pos/owner/inventory/materials/${id}`, {
      method: 'DELETE',
    }).catch(() => {});
  };

  const createPurchaseOrder = (materialId: string, quantity: number, supplierName?: string) => {
    const mat = materials.find((m) => m.id === materialId);
    if (!mat) return;
    const po: PurchaseOrder = {
      id: `PO-${Date.now().toString().slice(-4)}`,
      poNumber: `PO/${new Date().getFullYear()}/${(new Date().getMonth() + 1).toString().padStart(2, '0')}/${Math.floor(100 + Math.random() * 900)}`,
      materialId: mat.id,
      materialName: `${mat.name} (${quantity} ${mat.unit})`,
      quantity,
      unit: mat.unit,
      totalCost: quantity * mat.unitCost,
      supplierName: supplierName || mat.supplierName,
      orderDate: new Date().toISOString().split('T')[0],
      status: 'ORDERED',
    };
    setPurchaseOrders((prev) => [po, ...prev]);
    fetch('/api/pos/owner/inventory/purchase-orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(po),
    }).catch(() => {});
  };

  const updatePOStatus = (id: string, status: PurchaseOrder['status']) => {
    setPurchaseOrders((prev) => {
      const updated = prev.map((p) => (p.id === id ? { ...p, status } : p));
      // Jika status berubah jadi RECEIVED, otomatis tambah stok bahan baku
      if (status === 'RECEIVED') {
        const order = prev.find((p) => p.id === id);
        if (order) {
          setMaterials((mats) =>
            mats.map((m) =>
              m.id === order.materialId
                ? { ...m, currentStock: m.currentStock + order.quantity }
                : m
            )
          );
        }
      }
      return updated;
    });

    if (status === 'RECEIVED') {
      fetch(`/api/pos/owner/inventory/purchase-orders/${id}/receive`, {
        method: 'PUT',
      }).catch(() => {});
    }
  };

  // --- CRUD STAFF & SHIFTS ---
  const addStaffShift = (shift: Omit<StaffShift, 'id'>) => {
    const newShift: StaffShift = {
      ...shift,
      id: `SFT-${Date.now().toString().slice(-4)}`,
    };
    setShifts((prev) => [...prev, newShift]);
    fetch('/api/pos/owner/staff/shifts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newShift),
    }).catch(() => {});
  };

  const updateShift = (id: string, updates: Partial<StaffShift>) => {
    setShifts((prev) => prev.map((s) => (s.id === id ? { ...s, ...updates } : s)));
    fetch(`/api/pos/owner/staff/shifts/${id}/rotate`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    }).catch(() => {});
  };

  // --- CRUD PROMO ---
  const addPromo = (promo: Omit<ActivePromo, 'id' | 'usedCount'>) => {
    const newPromo: ActivePromo = {
      ...promo,
      id: `PRM-${Date.now().toString().slice(-4)}`,
      usedCount: 0,
    };
    setPromos((prev) => [...prev, newPromo]);
    fetch('/api/pos/owner/promos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newPromo),
    }).catch(() => {});
  };

  const togglePromo = (id: string) => {
    setPromos((prev) => {
      const target = prev.find((p) => p.id === id);
      const nextActive = target ? !target.isActive : true;
      fetch(`/api/pos/owner/promos/${id}/toggle`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: nextActive }),
      }).catch(() => {});
      return prev.map((p) => (p.id === id ? { ...p, isActive: !p.isActive } : p));
    });
  };

  const deletePromo = (id: string) => {
    setPromos((prev) => prev.filter((p) => p.id !== id));
    fetch(`/api/pos/owner/promos/${id}`, {
      method: 'DELETE',
    }).catch(() => {});
  };

  // --- CRUD CUSTOMER / MEMBER ---
  const addCustomer = (cust: Omit<CustomerMember, 'id' | 'registeredDate'>) => {
    const newCust: CustomerMember = {
      ...cust,
      id: `CUST-${Date.now().toString().slice(-4)}`,
      registeredDate: new Date().toISOString().split('T')[0],
    };
    setCustomers((prev) => [newCust, ...prev]);
    fetch('/api/pos/owner/customers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newCust),
    }).catch(() => {});
  };

  const updateCustomer = (id: string, updates: Partial<CustomerMember>) => {
    setCustomers((prev) => prev.map((c) => (c.id === id ? { ...c, ...updates } : c)));
  };

  const deleteCustomer = (id: string) => {
    setCustomers((prev) => prev.filter((c) => c.id !== id));
  };

  // --- CRUD ASET ---
  const addAsset = (asset: Omit<AssetRecord, 'id'>) => {
    const newAsset: AssetRecord = {
      ...asset,
      id: `AST-${Date.now().toString().slice(-4)}`,
    };
    setAssets((prev) => [...prev, newAsset]);
    fetch('/api/pos/owner/operations/assets', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newAsset),
    }).catch(() => {});
  };

  const updateAssetCondition = (id: string, condition: AssetRecord['condition']) => {
    setAssets((prev) => prev.map((a) => (a.id === id ? { ...a, condition } : a)));
    fetch(`/api/pos/owner/operations/assets/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ condition }),
    }).catch(() => {});
  };

  const deleteAsset = (id: string) => {
    setAssets((prev) => prev.filter((a) => a.id !== id));
    fetch(`/api/pos/owner/operations/assets/${id}`, {
      method: 'DELETE',
    }).catch(() => {});
  };

  // --- CRUD SOP ---
  const addSop = (sop: Omit<SopItem, 'id' | 'lastUpdated'>) => {
    const newSop: SopItem = {
      ...sop,
      id: `SOP-${Date.now().toString().slice(-4)}`,
      lastUpdated: new Date().toISOString().split('T')[0],
    };
    setSops((prev) => [...prev, newSop]);
  };

  const toggleSopStep = (sopId: string, stepId: string) => {
    setSops((prev) =>
      prev.map((sop) => {
        if (sop.id !== sopId) return sop;
        return {
          ...sop,
          steps: sop.steps.map((st) => (st.id === stepId ? { ...st, done: !st.done } : st)),
        };
      })
    );
  };

  // --- PARKIR MINGGUAN ---
  const addParkingRecord = (data: Omit<ParkingReport, 'id' | 'storeNet' | 'keeperNet'>) => {
    const storeNet = (data.grossRevenue * data.storeSharePercent) / 100;
    const keeperNet = (data.keeperSharePercent * data.grossRevenue) / 100;
    const newPark: ParkingReport = {
      ...data,
      id: `PRK-W${Date.now().toString().slice(-3)}`,
      storeNet,
      keeperNet,
    };
    setParkings((prev) => [newPark, ...prev]);
    fetch('/api/pos/owner/operations/parking', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        periodLabel: data.weekRange,
        coordinatorName: data.keeperName,
        grossAmount: data.grossRevenue,
        motorcycleCount: data.totalVehiclesMotor,
        carCount: data.totalVehiclesMobil,
      }),
    }).catch(() => {});
  };

  return {
    banks,
    vault,
    electricity,
    materials,
    purchaseOrders,
    shifts,
    kpis,
    promos,
    customers,
    assets,
    sops,
    parkings,
    logs,
    totalBankBalance,
    totalPhysicalCash,
    totalGrandBalance,
    // Actions
    addBank,
    updateBank,
    deleteBank,
    updateVault,
    transferGatewayToBank,
    setElectricity,
    addMaterial,
    updateStock,
    deleteMaterial,
    createPurchaseOrder,
    updatePOStatus,
    addStaffShift,
    updateShift,
    addPromo,
    togglePromo,
    deletePromo,
    addCustomer,
    updateCustomer,
    deleteCustomer,
    addAsset,
    updateAssetCondition,
    deleteAsset,
    addSop,
    toggleSopStep,
    addParkingRecord,
  };
}
