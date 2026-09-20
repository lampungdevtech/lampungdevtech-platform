export interface BankAccount {
  id: string;
  bankName: string;
  accountNumber: string;
  accountHolder: string;
  balance: number;
  branchId: string;
  isMain?: boolean;
}

export interface CashVault {
  cashRegister: number; // Laci Kasir (Cash in drawer)
  pettyCash: number;     // Kas Belanja / Operasional
  parkingCash: number;   // Kas Parkir Harian
  gatewayBalance: number;// Saldo Payment Gateway (Wesel Aja / Midtrans / QRIS)
  gatewayProvider: string;
}

export interface WeatherData {
  temperature: number;
  cloudCover: number; // in percentage (0 - 100%)
  weatherCode: number;
  weatherDescription: string;
  humidity: number;
  windSpeed: number;
  city: string;
  lastUpdated: string;
}

export interface ElectricityUsage {
  kwhUsed: number;
  estimatedCost: number;
  month: string;
  tariffPerKwh: number;
  peakHourUsagePercent: number;
}

export interface RawMaterial {
  id: string;
  name: string;
  category: string;
  currentStock: number;
  minStock: number;
  unit: string;
  unitCost: number;
  supplierName: string;
  lastRestocked: string;
}

export interface PurchaseOrder {
  id: string;
  poNumber: string;
  materialId: string;
  materialName: string;
  quantity: number;
  unit: string;
  totalCost: number;
  supplierName: string;
  orderDate: string;
  status: 'DRAFT' | 'ORDERED' | 'RECEIVED' | 'CANCELLED';
}

export interface StaffShift {
  id: string;
  staffId: string;
  staffName: string;
  role: string;
  date: string; // YYYY-MM-DD
  dayName: string;
  shiftType: 'PAGI' | 'MALAM' | 'OFF';
  shiftHours: string;
  attendanceStatus: 'ON_TIME' | 'LATE' | 'ABSENT' | 'UPCOMING';
  lateMinutes: number;
}

export interface StaffKPI {
  rank: number;
  staffId: string;
  name: string;
  role: string;
  avatar?: string;
  ordersServed: number;
  totalRevenue: number;
  avgSpeedMinutes: number;
  customerRating: number;
  cashDiscrepancy: number;
}

export interface ActivePromo {
  id: string;
  title: string;
  code: string;
  discountType: 'PERCENTAGE' | 'FIXED' | 'BOGO' | 'CASHBACK';
  value: number;
  minSpend: number;
  quota: number;
  usedCount: number;
  isActive: boolean;
  validUntil: string;
  applicableCategory: string;
}

export interface CustomerMember {
  id: string;
  name: string;
  phone: string;
  email: string;
  points: number;
  tier: 'BRONZE' | 'SILVER' | 'GOLD' | 'VIP';
  totalOrders: number;
  totalSpent: number;
  canLoginWeb: boolean;
  registeredDate: string;
}

export interface AssetRecord {
  id: string;
  assetCode: string;
  name: string;
  category: 'EQUIPMENT' | 'ELECTRONICS' | 'FURNITURE' | 'UTILITY';
  brandModel: string;
  branchId: string;
  purchaseDate: string;
  acquisitionCost: number;
  condition: 'EXCELLENT' | 'GOOD' | 'NEEDS_SERVICE' | 'BROKEN';
  lastServiceDate?: string;
  notes?: string;
}

export interface SopItem {
  id: string;
  title: string;
  category: 'OPENING' | 'CLOSING' | 'BREWING' | 'HYGIENE';
  estimatedMinutes: number;
  steps: { id: string; text: string; done: boolean }[];
  targetRole: string;
  lastUpdated: string;
}

export interface ParkingReport {
  id: string;
  weekRange: string;
  totalVehiclesMotor: number;
  totalVehiclesMobil: number;
  grossRevenue: number;
  storeSharePercent: number; // e.g. 60%
  keeperSharePercent: number; // e.g. 40%
  storeNet: number;
  keeperNet: number;
  keeperName: string;
  status: 'SETTLED' | 'PENDING';
}

export interface AuditLog {
  id: string;
  timestamp: string;
  userName: string;
  role: string;
  branchName: string;
  action: string;
  deviceInfo: string;
  ipAddress: string;
  status: 'SUCCESS' | 'WARNING' | 'FAILED';
}
