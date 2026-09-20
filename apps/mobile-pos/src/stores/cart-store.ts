import { create } from 'zustand';
import { CartItem, Product, PaymentMethod } from '../types/pos';

export interface ActivePromo {
  id: string;
  code: string;
  title: string;
  discountType: 'FIXED' | 'PERCENTAGE';
  discountValue: number;
  minSpend: number;
}

interface CartState {
  items: CartItem[];
  tableNumber: string;
  customerName: string;
  notes: string;
  paymentMethod: PaymentMethod;
  cashGiven: number;
  appliedPromo: ActivePromo | null;

  addItem: (product: Product, notes?: string) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, delta: number) => void;
  setItemNotes: (productId: string, notes: string) => void;
  setTableNumber: (table: string) => void;
  setCustomerName: (name: string) => void;
  setPaymentMethod: (method: PaymentMethod) => void;
  setCashGiven: (amount: number) => void;
  applyPromo: (promo: ActivePromo) => { success: boolean; message: string };
  removePromo: () => void;
  clearCart: () => void;

  getSubtotal: () => number;
  getTaxAmount: () => number;
  getDiscountAmount: () => number;
  getTotal: () => number;
  getChange: () => number;
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  tableNumber: '01',
  customerName: '',
  notes: '',
  paymentMethod: 'CASH',
  cashGiven: 0,
  appliedPromo: null,

  addItem: (product, notes) => {
    set((state) => {
      const existing = state.items.find((i) => i.product.id === product.id);
      if (existing) {
        return {
          items: state.items.map((i) =>
            i.product.id === product.id ? { ...i, quantity: i.quantity + 1, notes: notes || i.notes } : i
          ),
        };
      }
      return { items: [...state.items, { product, quantity: 1, notes }] };
    });
  },

  removeItem: (productId) => {
    set((state) => ({
      items: state.items.filter((i) => i.product.id !== productId),
    }));
  },

  updateQuantity: (productId, delta) => {
    set((state) => {
      const updated = state.items
        .map((i) => {
          if (i.product.id === productId) {
            const newQty = i.quantity + delta;
            return newQty > 0 ? { ...i, quantity: newQty } : null;
          }
          return i;
        })
        .filter(Boolean) as CartItem[];
      return { items: updated };
    });
  },

  setItemNotes: (productId, notes) => {
    set((state) => ({
      items: state.items.map((i) => (i.product.id === productId ? { ...i, notes } : i)),
    }));
  },

  setTableNumber: (tableNumber) => set({ tableNumber }),
  setCustomerName: (customerName) => set({ customerName }),
  setPaymentMethod: (paymentMethod) => set({ paymentMethod }),
  setCashGiven: (cashGiven) => set({ cashGiven }),

  applyPromo: (promo) => {
    const subtotal = get().getSubtotal();
    if (subtotal < promo.minSpend) {
      return {
        success: false,
        message: `Minimal belanja Rp ${promo.minSpend.toLocaleString('id-ID')} untuk promo ${promo.code}`,
      };
    }
    set({ appliedPromo: promo });
    return {
      success: true,
      message: `Promo ${promo.code} berhasil diterapkan!`,
    };
  },

  removePromo: () => set({ appliedPromo: null }),

  clearCart: () =>
    set({
      items: [],
      tableNumber: '01',
      customerName: '',
      notes: '',
      paymentMethod: 'CASH',
      cashGiven: 0,
      appliedPromo: null,
    }),

  getSubtotal: () => {
    return get().items.reduce((sum, item) => sum + item.quantity * item.product.price, 0);
  },

  getTaxAmount: () => {
    // Pajak PB1 10%
    return Math.round(get().getSubtotal() * 0.1);
  },

  getDiscountAmount: () => {
    const promo = get().appliedPromo;
    if (!promo) return 0;
    const subtotal = get().getSubtotal();
    if (subtotal < promo.minSpend) return 0;
    if (promo.discountType === 'FIXED') {
      return Math.min(subtotal, promo.discountValue);
    }
    return Math.round((subtotal * promo.discountValue) / 100);
  },

  getTotal: () => {
    const subtotal = get().getSubtotal();
    const tax = get().getTaxAmount();
    const discount = get().getDiscountAmount();
    return Math.max(0, subtotal + tax - discount);
  },

  getChange: () => {
    const total = get().getTotal();
    const given = get().cashGiven;
    return Math.max(0, given - total);
  },
}));
