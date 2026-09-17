import { create } from 'zustand';
import { CashierShiftRecord } from '../types/pos';
import { getULID } from '../utils/ulid';

interface ShiftState {
  activeShift: CashierShiftRecord | null;
  isOpenModalVisible: boolean;
  isCloseModalVisible: boolean;
  openShift: (staffId: string, branchId: string, merchantId: string, cashFloat: number) => CashierShiftRecord;
  recordSale: (amount: number, isCash: boolean) => void;
  closeShift: (actualCashEnd: number) => { variance: number; shift: CashierShiftRecord };
  setOpenModalVisible: (visible: boolean) => void;
  setCloseModalVisible: (visible: boolean) => void;
  restoreShift: (shift: CashierShiftRecord) => void;
}

export const useShiftStore = create<ShiftState>((set, get) => ({
  activeShift: null,
  isOpenModalVisible: false,
  isCloseModalVisible: false,

  openShift: (staffId, branchId, merchantId, cashFloat) => {
    const shift: CashierShiftRecord = {
      id: getULID(),
      merchantId,
      branchId,
      staffId,
      cashFloatInitial: cashFloat,
      totalCashSales: 0,
      totalNonCash: 0,
      totalOrdersCount: 0,
      expectedCashEnd: cashFloat,
      status: 'OPEN',
      openedAt: new Date().toISOString(),
    };
    set({ activeShift: shift, isOpenModalVisible: false });
    return shift;
  },

  recordSale: (amount, isCash) => {
    const current = get().activeShift;
    if (!current) return;

    const updated: CashierShiftRecord = {
      ...current,
      totalOrdersCount: current.totalOrdersCount + 1,
      totalCashSales: isCash ? current.totalCashSales + amount : current.totalCashSales,
      totalNonCash: !isCash ? current.totalNonCash + amount : current.totalNonCash,
      expectedCashEnd: isCash ? current.expectedCashEnd + amount : current.expectedCashEnd,
    };
    set({ activeShift: updated });
  },

  closeShift: (actualCashEnd) => {
    const current = get().activeShift;
    if (!current) {
      throw new Error('Tidak ada shift yang aktif');
    }

    const variance = actualCashEnd - current.expectedCashEnd;
    const closed: CashierShiftRecord = {
      ...current,
      actualCashEnd,
      cashVariance: variance,
      status: 'CLOSED',
      closedAt: new Date().toISOString(),
    };

    set({ activeShift: null, isCloseModalVisible: false });
    return { variance, shift: closed };
  },

  setOpenModalVisible: (visible) => set({ isOpenModalVisible: visible }),
  setCloseModalVisible: (visible) => set({ isCloseModalVisible: visible }),
  restoreShift: (shift) => set({ activeShift: shift }),
}));
