import { create } from 'zustand';
import { CartItem, Product, PaymentMethod } from '../types/pos';

interface CartState {
  items: CartItem[];
  tableNumber: string;
  customerName: string;
  notes: string;
  paymentMethod: PaymentMethod;
  cashGiven: number;

  addItem: (product: Product, notes?: string) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, delta: number) => void;
  setItemNotes: (productId: string, notes: string) => void;
  setTableNumber: (table: string) => void;
  setCustomerName: (name: string) => void;
  setPaymentMethod: (method: PaymentMethod) => void;
  setCashGiven: (amount: number) => void;
  clearCart: () => void;

  getSubtotal: () => number;
  getTaxAmount: () => number;
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

  clearCart: () =>
    set({
      items: [],
      tableNumber: '01',
      customerName: '',
      notes: '',
      paymentMethod: 'CASH',
      cashGiven: 0,
    }),

  getSubtotal: () => {
    return get().items.reduce((sum, item) => sum + item.quantity * item.product.price, 0);
  },

  getTaxAmount: () => {
    // Pajak PB1 10%
    return Math.round(get().getSubtotal() * 0.1);
  },

  getTotal: () => {
    return get().getSubtotal() + get().getTaxAmount();
  },

  getChange: () => {
    const total = get().getTotal();
    const given = get().cashGiven;
    return Math.max(0, given - total);
  },
}));
