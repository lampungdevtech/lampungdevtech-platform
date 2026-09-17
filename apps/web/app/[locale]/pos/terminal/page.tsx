'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Tablet,
  Wifi,
  WifiOff,
  Printer,
  ShoppingBag,
  DollarSign,
  CheckCircle2,
  RotateCcw,
  Plus,
  Minus,
  Lock,
  LogOut,
  Coffee,
  UtensilsCrossed,
} from 'lucide-react';
import { ulid } from 'ulid';

interface Product {
  id: string;
  categoryId: string;
  name: string;
  price: number;
  category: string;
  stock: number;
}

interface CartItem {
  product: Product;
  quantity: number;
  notes?: string;
}

interface ShiftData {
  id: string;
  cashierName: string;
  cashFloatInitial: number;
  totalCashSales: number;
  totalNonCash: number;
  totalOrdersCount: number;
  openedAt: string;
  expectedCashEnd: number;
}

const SAMPLE_PRODUCTS: Product[] = [
  { id: 'PRD-01', categoryId: 'coffee', name: 'Espresso Single Origin', price: 18000, category: 'Kopi', stock: 50 },
  { id: 'PRD-02', categoryId: 'coffee', name: 'Americano / Long Black', price: 22000, category: 'Kopi', stock: 45 },
  { id: 'PRD-03', categoryId: 'milk', name: 'Caffe Latte Steamed Milk', price: 28000, category: 'Milk Based', stock: 40 },
  { id: 'PRD-04', categoryId: 'milk', name: 'Cappuccino Cinnamon Dust', price: 28000, category: 'Milk Based', stock: 35 },
  { id: 'PRD-05', categoryId: 'signature', name: 'Kopi Susu Gula Aren Lampung', price: 25000, category: 'Signature', stock: 60 },
  { id: 'PRD-06', categoryId: 'manual', name: 'V60 Robusta Ulubelu Tanggamus', price: 24000, category: 'Manual Brew', stock: 30 },
  { id: 'PRD-07', categoryId: 'pastry', name: 'Butter Croissant Artisan', price: 22000, category: 'Pastry & Food', stock: 20 },
  { id: 'PRD-08', categoryId: 'pastry', name: 'Cinnamon Roll Cream Cheese', price: 25000, category: 'Pastry & Food', stock: 15 },
  { id: 'PRD-09', categoryId: 'food', name: 'French Fries Truffle Herb', price: 24000, category: 'Pastry & Food', stock: 25 },
];

export default function PosTerminalPage() {
  // Auth state
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [email, setEmail] = useState('kasir@kopitemu.com');
  const [pin, setPin] = useState('123456');

  // Shift & Cash float
  const [activeShift, setActiveShift] = useState<ShiftData | null>(null);
  const [showOpenShiftModal, setShowOpenShiftModal] = useState(false);
  const [initialFloatInput, setInitialFloatInput] = useState(200000);

  // Close shift modal
  const [showCloseShiftModal, setShowCloseShiftModal] = useState(false);
  const [actualCashInput, setActualCashInput] = useState<number>(0);
  const [shiftReportResult, setShiftReportResult] = useState<any>(null);

  // POS & Catalog
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [tableNumber, setTableNumber] = useState('01');
  const [customerName, setCustomerName] = useState('');
  const [activeItemNote, setActiveItemNote] = useState<{ id: string; note: string } | null>(null);

  // Offline/Online simulation
  const [isOnline, setIsOnline] = useState(true);
  const [offlineQueueCount, setOfflineQueueCount] = useState(0);

  // Checkout modal
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'CASH' | 'QRIS' | 'CARD'>('CASH');
  const [cashTendered, setCashTendered] = useState<number>(50000);
  const [lastReceipt, setLastReceipt] = useState<any>(null);
  const [showReceiptModal, setShowReceiptModal] = useState(false);

  // Login handler
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (pin.length < 4) {
      alert('PIN Kasir minimal 4 digit.');
      return;
    }
    setIsLoggedIn(true);
    if (!activeShift) {
      setShowOpenShiftModal(true);
    }
  };

  // Open shift handler
  const handleStartShift = () => {
    const shift: ShiftData = {
      id: ulid(),
      cashierName: 'Ahmad Fauzi',
      cashFloatInitial: Number(initialFloatInput) || 0,
      totalCashSales: 0,
      totalNonCash: 0,
      totalOrdersCount: 0,
      openedAt: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
      expectedCashEnd: Number(initialFloatInput) || 0,
    };
    setActiveShift(shift);
    setShowOpenShiftModal(false);
  };

  // Cart operations
  const addToCart = (product: Product) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
  };

  const updateQuantity = (productId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.product.id === productId) {
            const nextQty = item.quantity + delta;
            return nextQty > 0 ? { ...item, quantity: nextQty } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  const setItemNotes = (productId: string, notes: string) => {
    setCart((prev) =>
      prev.map((item) => (item.product.id === productId ? { ...item, notes } : item))
    );
    setActiveItemNote(null);
  };

  // Subtotals & Tax
  const subtotal = cart.reduce((sum, item) => sum + item.quantity * item.product.price, 0);
  const taxAmount = Math.round(subtotal * 0.1); // PB1 10%
  const grandTotal = subtotal + taxAmount;
  const changeAmount = Math.max(0, cashTendered - grandTotal);

  // Submit Order
  const handleCompleteOrder = () => {
    if (cart.length === 0) return;

    if (paymentMethod === 'CASH' && cashTendered < grandTotal) {
      alert('Uang yang dibayarkan kurang dari total tagihan.');
      return;
    }

    const orderId = ulid();
    const orderData = {
      orderId,
      branchName: 'Kopi Ruang Temu - Cabang Utama',
      branchAddress: 'Jl. ZA. Pagar Alam No. 42, Bandar Lampung',
      cashier: activeShift?.cashierName || 'Kasir',
      tableNumber,
      customerName: customerName || 'Pelanggan Meja ' + tableNumber,
      items: [...cart],
      subtotal,
      taxAmount,
      grandTotal,
      paymentMethod,
      cashTendered: paymentMethod === 'CASH' ? cashTendered : undefined,
      changeAmount: paymentMethod === 'CASH' ? changeAmount : undefined,
      timestamp: new Date().toLocaleTimeString('id-ID'),
    };

    // Update shift totals
    if (activeShift) {
      const isCash = paymentMethod === 'CASH';
      setActiveShift({
        ...activeShift,
        totalOrdersCount: activeShift.totalOrdersCount + 1,
        totalCashSales: isCash ? activeShift.totalCashSales + grandTotal : activeShift.totalCashSales,
        totalNonCash: !isCash ? activeShift.totalNonCash + grandTotal : activeShift.totalNonCash,
        expectedCashEnd: isCash ? activeShift.expectedCashEnd + grandTotal : activeShift.expectedCashEnd,
      });
    }

    // If offline, increment queue
    if (!isOnline) {
      setOfflineQueueCount((prev) => prev + 1);
    }

    // Save to localStorage for KDS sync
    try {
      const existingKds = JSON.parse(localStorage.getItem('pos_kds_orders') || '[]');
      existingKds.unshift({
        id: orderId,
        tableNumber,
        customerName: orderData.customerName,
        items: cart.map((c) => ({
          name: c.product.name,
          quantity: c.quantity,
          notes: c.notes || '',
        })),
        total: grandTotal,
        status: 'IN_PREPARATION',
        createdAt: new Date().toISOString(),
      });
      localStorage.setItem('pos_kds_orders', JSON.stringify(existingKds));
    } catch (err) {
      console.warn('Gagal menyimpan pesanan KDS ke localStorage', err);
    }

    setLastReceipt(orderData);
    setShowCheckoutModal(false);
    setShowReceiptModal(true);
    setCart([]);
    setCustomerName('');
  };

  // Close shift submission
  const handleCloseShift = () => {
    if (!activeShift) return;
    const variance = actualCashInput - activeShift.expectedCashEnd;
    setShiftReportResult({
      ...activeShift,
      actualCashEnd: actualCashInput,
      variance,
      closedAt: new Date().toLocaleTimeString('id-ID'),
    });
    setShowCloseShiftModal(false);
  };

  // Manual Sync trigger
  const handleSyncOffline = () => {
    alert(`Berhasil menyinkronkan ${offlineQueueCount} pesanan offline ke server database!`);
    setOfflineQueueCount(0);
  };

  // 1. Tampilan Login Kasir
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Tablet className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">Kasir POS Terminal</h1>
              <p className="text-xs text-slate-400">LampungDevTech Platform</p>
            </div>
          </div>

          <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-3 mb-6 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs text-emerald-400 font-medium">
              Offline-First Ready: Transaksi tetap jalan tanpa internet
            </span>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Email Staf Kasir
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-slate-950 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:border-emerald-500"
                placeholder="kasir@kopitemu.com"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                PIN Kasir Unik (6-Digit)
              </label>
              <input
                type="password"
                maxLength={6}
                required
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                className="w-full px-4 py-3 bg-slate-950 border border-slate-700 rounded-xl text-white text-center text-xl tracking-[0.5em] font-mono focus:outline-none focus:border-emerald-500"
                placeholder="123456"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3.5 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold rounded-xl transition shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2"
            >
              <Lock className="w-4 h-4" />
              Masuk Terminal Kasir
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-slate-800 text-center">
            <p className="text-xs text-slate-500">
              Akses cepat demo: Email <code className="text-slate-300">kasir@kopitemu.com</code> | PIN <code className="text-slate-300">123456</code>
            </p>
            <div className="mt-4">
              <Link href="/pos/dashboard" className="text-xs text-emerald-400 hover:underline">
                ← Kembali ke Owner Dashboard
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Filter menu catalog
  const filteredProducts = SAMPLE_PRODUCTS.filter((p) => {
    const matchesCategory = selectedCategory === 'all' || p.categoryId === selectedCategory;
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col select-none">
      {/* 1. TOP HEADER BAR */}
      <header className="h-14 bg-slate-900 border-b border-slate-800 px-4 flex items-center justify-between z-10">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="font-bold text-emerald-400 text-base">LampungDev POS</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
              Kopi Ruang Temu (Utama)
            </span>
          </div>

          {/* Quick links to KDS & Dashboard */}
          <div className="hidden md:flex items-center gap-2 ml-4">
            <Link
              href="/pos/kds"
              target="_blank"
              className="text-xs px-2.5 py-1 rounded-md bg-amber-500/10 text-amber-300 border border-amber-500/30 hover:bg-amber-500/20 flex items-center gap-1.5"
            >
              <UtensilsCrossed className="w-3.5 h-3.5" />
              Buka Layar KDS Dapur
            </Link>
            <Link
              href="/pos/dashboard"
              className="text-xs px-2.5 py-1 rounded-md bg-slate-800 text-slate-300 hover:bg-slate-700 flex items-center gap-1.5"
            >
              Owner Portal
            </Link>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Online/Offline Simulation Toggle */}
          <button
            onClick={() => setIsOnline(!isOnline)}
            className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full font-medium transition ${
              isOnline
                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                : 'bg-red-500/20 text-red-300 border border-red-500/40 animate-pulse'
            }`}
          >
            {isOnline ? <Wifi className="w-3.5 h-3.5" /> : <WifiOff className="w-3.5 h-3.5" />}
            {isOnline ? 'Online Sync Aktif' : 'Mode Offline (Lokal)'}
          </button>

          {/* Offline Queue Badge */}
          {offlineQueueCount > 0 && (
            <button
              onClick={handleSyncOffline}
              className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30"
              title="Klik untuk sinkronkan ke server"
            >
              <RotateCcw className="w-3 h-3" />
              {offlineQueueCount} Tertunda
            </button>
          )}

          {/* Active Shift Indicator */}
          {activeShift && (
            <button
              onClick={() => setShowCloseShiftModal(true)}
              className="flex items-center gap-2 text-xs px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-slate-200"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span>Shift: Rp {activeShift.expectedCashEnd.toLocaleString('id-ID')}</span>
              <span className="text-[10px] text-slate-400">(Tutup)</span>
            </button>
          )}

          <button
            onClick={() => setIsLoggedIn(false)}
            className="p-1.5 text-slate-400 hover:text-red-400 rounded-lg hover:bg-slate-800"
            title="Keluar Akun Kasir"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* 2. MAIN TERMINAL WORKSPACE */}
      <div className="flex-1 flex overflow-hidden">
        {/* SISI KIRI: KATALOG MENU */}
        <div className="flex-1 flex flex-col bg-slate-950 border-r border-slate-800 overflow-hidden">
          {/* Search & Category Tabs */}
          <div className="p-3 bg-slate-900 border-b border-slate-800 flex items-center gap-3">
            <input
              type="text"
              placeholder="Cari menu kopi, minuman, pastry..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
            <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
              {[
                { id: 'all', label: 'Semua' },
                { id: 'coffee', label: 'Kopi' },
                { id: 'milk', label: 'Milk Based' },
                { id: 'signature', label: 'Signature' },
                { id: 'manual', label: 'Manual Brew' },
                { id: 'pastry', label: 'Pastry' },
              ].map((c) => (
                <button
                  key={c.id}
                  onClick={() => setSelectedCategory(c.id)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg whitespace-nowrap transition ${
                    selectedCategory === c.id
                      ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                      : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>

          {/* Product Grid */}
          <div className="flex-1 overflow-y-auto p-4 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {filteredProducts.map((product) => (
              <button
                key={product.id}
                onClick={() => addToCart(product)}
                className="flex flex-col text-left p-3.5 bg-slate-900/80 hover:bg-slate-800/90 border border-slate-800 hover:border-emerald-500/50 rounded-xl transition duration-150 active:scale-95 group"
              >
                <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-2 group-hover:scale-110 transition">
                  <Coffee className="w-5 h-5" />
                </div>
                <h3 className="font-semibold text-sm text-slate-100 line-clamp-2 leading-snug">
                  {product.name}
                </h3>
                <span className="text-[11px] text-slate-500 mt-0.5">{product.category}</span>
                <div className="mt-auto pt-2 flex items-center justify-between w-full">
                  <span className="text-xs font-bold text-emerald-400">
                    Rp {product.price.toLocaleString('id-ID')}
                  </span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">
                    Stok: {product.stock}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* SISI KANAN: KERANJANG BELANJA & TAGIHAN */}
        <div className="w-80 md:w-96 bg-slate-900 flex flex-col border-l border-slate-800">
          {/* Table & Customer Header */}
          <div className="p-3 border-b border-slate-800 bg-slate-900/90 flex items-center gap-2">
            <div className="flex items-center gap-1.5 flex-1">
              <span className="text-xs font-semibold text-slate-400">Meja:</span>
              <input
                type="text"
                value={tableNumber}
                onChange={(e) => setTableNumber(e.target.value)}
                className="w-16 px-2 py-1 bg-slate-950 border border-slate-700 rounded text-center text-xs font-bold text-emerald-400 focus:outline-none"
                placeholder="01"
              />
            </div>
            <input
              type="text"
              placeholder="Nama Tamu (opsional)"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              className="flex-1 px-2.5 py-1 bg-slate-950 border border-slate-700 rounded text-xs text-slate-200 focus:outline-none"
            />
          </div>

          {/* Cart Item List */}
          <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-500 text-center p-6">
                <ShoppingBag className="w-10 h-10 mb-2 stroke-1 opacity-50" />
                <p className="text-xs font-medium">Keranjang Pesanan Kosong</p>
                <p className="text-[11px] text-slate-600 mt-1">Pilih menu dari katalog di sebelah kiri</p>
              </div>
            ) : (
              cart.map((item) => (
                <div
                  key={item.product.id}
                  className="bg-slate-950/60 border border-slate-800 rounded-xl p-2.5 flex flex-col gap-1.5"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="text-xs font-semibold text-slate-200">{item.product.name}</h4>
                      <span className="text-[11px] text-emerald-400">
                        Rp {item.product.price.toLocaleString('id-ID')}
                      </span>
                    </div>
                    <span className="text-xs font-bold text-white">
                      Rp {(item.quantity * item.product.price).toLocaleString('id-ID')}
                    </span>
                  </div>

                  {/* Notes display or input */}
                  {item.notes && (
                    <span className="text-[11px] text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                      📝 {item.notes}
                    </span>
                  )}

                  <div className="flex items-center justify-between pt-1 border-t border-slate-800/80">
                    <button
                      onClick={() =>
                        setActiveItemNote({
                          id: item.product.id,
                          note: item.notes || '',
                        })
                      }
                      className="text-[10px] text-slate-400 hover:text-slate-200"
                    >
                      {item.notes ? 'Edit Catatan' : '+ Catatan (Less Sugar, dll)'}
                    </button>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => updateQuantity(item.product.id, -1)}
                        className="w-5 h-5 rounded bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-xs text-white"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="text-xs font-bold w-5 text-center text-white">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.product.id, 1)}
                        className="w-5 h-5 rounded bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-xs text-white"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Cart Footer / Summary */}
          <div className="p-4 bg-slate-950 border-t border-slate-800 space-y-2">
            <div className="flex justify-between text-xs text-slate-400">
              <span>Subtotal</span>
              <span>Rp {subtotal.toLocaleString('id-ID')}</span>
            </div>
            <div className="flex justify-between text-xs text-slate-400">
              <span>Pajak Resto (PB1 10%)</span>
              <span>Rp {taxAmount.toLocaleString('id-ID')}</span>
            </div>
            <div className="flex justify-between text-sm font-bold text-white pt-2 border-t border-slate-800">
              <span>Total Tagihan</span>
              <span className="text-emerald-400 text-base">
                Rp {grandTotal.toLocaleString('id-ID')}
              </span>
            </div>

            <button
              disabled={cart.length === 0}
              onClick={() => {
                setCashTendered(grandTotal);
                setShowCheckoutModal(true);
              }}
              className={`w-full py-3 rounded-xl font-bold text-sm transition flex items-center justify-center gap-2 shadow-lg ${
                cart.length === 0
                  ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                  : 'bg-emerald-500 hover:bg-emerald-600 text-slate-950 shadow-emerald-500/20 active:scale-98'
              }`}
            >
              <DollarSign className="w-4 h-4" />
              Bayar & Cetak Struk
            </button>
          </div>
        </div>
      </div>

      {/* 3. MODAL: BUKA SHIFT AWAL (MODAL KAS AWAL) */}
      {showOpenShiftModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl">
            <h2 className="text-lg font-bold text-white mb-1">Buka Shift Kasir Baru</h2>
            <p className="text-xs text-slate-400 mb-5">
              Masukkan jumlah modal uang receh awal di laci kasir (Cash Float) sebelum mulai melayani.
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-2">
                  Modal Kas Laci Awal (Rp)
                </label>
                <input
                  type="number"
                  step="10000"
                  value={initialFloatInput}
                  onChange={(e) => setInitialFloatInput(Number(e.target.value))}
                  className="w-full px-4 py-3 bg-slate-950 border border-slate-700 rounded-xl text-emerald-400 font-bold text-lg focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                {[100000, 200000, 300000].map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => setInitialFloatInput(amt)}
                    className="py-1.5 bg-slate-800 hover:bg-slate-700 rounded-lg text-xs text-slate-300 font-medium"
                  >
                    Rp {(amt / 1000).toLocaleString('id-ID')}k
                  </button>
                ))}
              </div>

              <button
                type="button"
                onClick={handleStartShift}
                className="w-full py-3.5 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold rounded-xl transition shadow-lg shadow-emerald-500/20"
              >
                Mulai Shift Kasir
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. MODAL: CHECKOUT & PEMBAYARAN */}
      {showCheckoutModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-white">Pembayaran Pesanan</h2>
              <button
                onClick={() => setShowCheckoutModal(false)}
                className="text-xs text-slate-400 hover:text-white"
              >
                ✕ Batal
              </button>
            </div>

            <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 mb-5 text-center">
              <span className="text-xs text-slate-400 block mb-1">Total Tagihan (Termasuk PB1 10%)</span>
              <span className="text-3xl font-black text-emerald-400">
                Rp {grandTotal.toLocaleString('id-ID')}
              </span>
            </div>

            {/* Metode Bayar Tab */}
            <div className="grid grid-cols-3 gap-2 mb-5">
              {(['CASH', 'QRIS', 'CARD'] as const).map((m) => (
                <button
                  key={m}
                  onClick={() => setPaymentMethod(m)}
                  className={`py-2.5 rounded-xl font-bold text-xs transition border ${
                    paymentMethod === m
                      ? 'bg-emerald-500 text-slate-950 border-emerald-400 shadow-lg shadow-emerald-500/20'
                      : 'bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700'
                  }`}
                >
                  {m === 'CASH' && '💵 Tunai (Cash)'}
                  {m === 'QRIS' && '📱 QRIS Statis'}
                  {m === 'CARD' && '💳 Kartu Debit/EDC'}
                </button>
              ))}
            </div>

            {paymentMethod === 'CASH' && (
              <div className="space-y-3 mb-5">
                <label className="block text-xs font-semibold text-slate-300 uppercase">
                  Uang Tunai Diterima
                </label>
                <input
                  type="number"
                  step="5000"
                  value={cashTendered}
                  onChange={(e) => setCashTendered(Number(e.target.value))}
                  className="w-full px-4 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white font-bold text-base focus:outline-none focus:border-emerald-500"
                />

                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setCashTendered(grandTotal)}
                    className="py-1.5 bg-slate-800 hover:bg-slate-700 rounded-lg text-xs text-slate-200"
                  >
                    Uang Pas
                  </button>
                  <button
                    type="button"
                    onClick={() => setCashTendered(50000)}
                    className="py-1.5 bg-slate-800 hover:bg-slate-700 rounded-lg text-xs text-slate-200"
                  >
                    Rp 50.000
                  </button>
                  <button
                    type="button"
                    onClick={() => setCashTendered(100000)}
                    className="py-1.5 bg-slate-800 hover:bg-slate-700 rounded-lg text-xs text-slate-200"
                  >
                    Rp 100.000
                  </button>
                </div>

                <div className="p-3 bg-slate-950 rounded-xl flex items-center justify-between border border-slate-800">
                  <span className="text-xs text-slate-400">Kembalian:</span>
                  <span className="text-sm font-bold text-emerald-400">
                    Rp {changeAmount.toLocaleString('id-ID')}
                  </span>
                </div>
              </div>
            )}

            {paymentMethod === 'QRIS' && (
              <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 text-center mb-5">
                <div className="w-36 h-36 bg-white mx-auto rounded-lg p-2 flex items-center justify-center text-slate-900 font-mono text-xs">
                  [ SIMULASI QRIS DINAMIS RP {grandTotal.toLocaleString('id-ID')} ]
                </div>
                <p className="text-xs text-slate-400 mt-2">
                  Arahkan pelanggan scan QRIS QR code di atas
                </p>
              </div>
            )}

            <button
              onClick={handleCompleteOrder}
              className="w-full py-3.5 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold rounded-xl transition shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2"
            >
              <Printer className="w-4 h-4" />
              Selesaikan & Kirim ke Dapur (KDS)
            </button>
          </div>
        </div>
      )}

      {/* 5. MODAL: STRUK KASIR THERMAL (ESC/POS SIMULASI) */}
      {showReceiptModal && lastReceipt && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-white text-slate-900 rounded-2xl p-6 shadow-2xl font-mono text-xs">
            {/* Header struk */}
            <div className="text-center border-b border-dashed border-slate-300 pb-3 mb-3">
              <h3 className="font-bold text-sm tracking-wider uppercase">{lastReceipt.branchName}</h3>
              <p className="text-[10px] text-slate-500">{lastReceipt.branchAddress}</p>
              <div className="mt-2 text-[10px] text-slate-600 flex justify-between">
                <span>Order: #{lastReceipt.orderId.slice(-8)}</span>
                <span>{lastReceipt.timestamp}</span>
              </div>
              <div className="text-[10px] text-slate-600 flex justify-between">
                <span>Kasir: {lastReceipt.cashier}</span>
                <span>Meja: #{lastReceipt.tableNumber}</span>
              </div>
            </div>

            {/* Items */}
            <div className="space-y-1.5 border-b border-dashed border-slate-300 pb-3 mb-3">
              {lastReceipt.items.map((it: CartItem) => (
                <div key={it.product.id}>
                  <div className="flex justify-between">
                    <span>
                      {it.quantity}x {it.product.name}
                    </span>
                    <span>Rp {(it.quantity * it.product.price).toLocaleString('id-ID')}</span>
                  </div>
                  {it.notes && (
                    <span className="text-[9px] text-slate-500 block pl-4">
                      * {it.notes}
                    </span>
                  )}
                </div>
              ))}
            </div>

            {/* Total */}
            <div className="space-y-1 border-b border-dashed border-slate-300 pb-3 mb-3">
              <div className="flex justify-between text-[11px]">
                <span>Subtotal</span>
                <span>Rp {lastReceipt.subtotal.toLocaleString('id-ID')}</span>
              </div>
              <div className="flex justify-between text-[11px]">
                <span>PB1 (10%)</span>
                <span>Rp {lastReceipt.taxAmount.toLocaleString('id-ID')}</span>
              </div>
              <div className="flex justify-between font-bold text-xs pt-1">
                <span>TOTAL</span>
                <span>Rp {lastReceipt.grandTotal.toLocaleString('id-ID')}</span>
              </div>
              <div className="flex justify-between text-[10px] text-slate-600">
                <span>Metode</span>
                <span>{lastReceipt.paymentMethod}</span>
              </div>
              {lastReceipt.cashTendered && (
                <>
                  <div className="flex justify-between text-[10px] text-slate-600">
                    <span>Tunai</span>
                    <span>Rp {lastReceipt.cashTendered.toLocaleString('id-ID')}</span>
                  </div>
                  <div className="flex justify-between text-[10px] text-slate-600">
                    <span>Kembali</span>
                    <span>Rp {lastReceipt.changeAmount.toLocaleString('id-ID')}</span>
                  </div>
                </>
              )}
            </div>

            {/* Footer */}
            <div className="text-center text-[10px] text-slate-500 space-y-0.5">
              <p>Terima kasih atas kunjungan Anda!</p>
              <p>Powered by LampungDev POS Microservice</p>
            </div>

            <div className="mt-5 pt-3 border-t border-slate-200 flex gap-2">
              <button
                onClick={() => {
                  alert('Perintah ESC/POS dikirim ke Bluetooth Thermal 58mm & KDS Kitchen Printer!');
                  setShowReceiptModal(false);
                }}
                className="flex-1 py-2 bg-emerald-600 text-white rounded-lg font-sans font-bold text-xs flex items-center justify-center gap-1.5"
              >
                <Printer className="w-3.5 h-3.5" />
                Cetak Struk Fisik
              </button>
              <button
                onClick={() => setShowReceiptModal(false)}
                className="px-3 py-2 bg-slate-200 text-slate-800 rounded-lg font-sans text-xs"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 6. MODAL: TUTUP SHIFT & REKONSILIASI KAS (Z-REPORT) */}
      {showCloseShiftModal && activeShift && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl">
            <h2 className="text-base font-bold text-white mb-1">Tutup Shift Kasir (Z-Report)</h2>
            <p className="text-xs text-slate-400 mb-4">
              Hitung uang fisik di laci kasir dan masukkan nilainya untuk mencocokkan dengan catatan sistem.
            </p>

            <div className="bg-slate-950 border border-slate-800 rounded-xl p-3.5 space-y-2 mb-4 text-xs">
              <div className="flex justify-between text-slate-400">
                <span>Modal Awal Kas:</span>
                <span className="text-white font-semibold">
                  Rp {activeShift.cashFloatInitial.toLocaleString('id-ID')}
                </span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Penjualan Tunai:</span>
                <span className="text-emerald-400 font-semibold">
                  Rp {activeShift.totalCashSales.toLocaleString('id-ID')}
                </span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Penjualan Non-Tunai:</span>
                <span className="text-slate-200 font-semibold">
                  Rp {activeShift.totalNonCash.toLocaleString('id-ID')}
                </span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Jumlah Transaksi:</span>
                <span className="text-white font-semibold">{activeShift.totalOrdersCount} Order</span>
              </div>
              <div className="pt-2 border-t border-slate-800 flex justify-between text-amber-400 font-bold">
                <span>Uang Kas Harus Ada di Laci:</span>
                <span>Rp {activeShift.expectedCashEnd.toLocaleString('id-ID')}</span>
              </div>
            </div>

            <div className="space-y-3 mb-5">
              <label className="block text-xs font-semibold text-slate-300 uppercase">
                Uang Fisik Kasir (Hasil Hitung Manual)
              </label>
              <input
                type="number"
                value={actualCashInput || ''}
                onChange={(e) => setActualCashInput(Number(e.target.value))}
                placeholder="Contoh: 350000"
                className="w-full px-4 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white font-bold text-base focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setShowCloseShiftModal(false)}
                className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs rounded-xl"
              >
                Batal
              </button>
              <button
                onClick={handleCloseShift}
                className="flex-1 py-2.5 bg-red-500 hover:bg-red-600 text-white font-bold text-xs rounded-xl shadow-lg shadow-red-500/20"
              >
                Tutup Shift Sekarang
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 7. MODAL: HASIL LAPORAN Z-REPORT */}
      {shiftReportResult && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl text-center">
            <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mx-auto mb-3">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h2 className="text-base font-bold text-white mb-1">Shift Berhasil Ditutup</h2>
            <p className="text-xs text-slate-400 mb-4">Laporan Z-Report Kasir telah diarsipkan</p>

            <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 text-xs space-y-2 mb-4 text-left">
              <div className="flex justify-between">
                <span className="text-slate-400">Total Penjualan:</span>
                <span className="font-bold text-white">
                  Rp {(shiftReportResult.totalCashSales + shiftReportResult.totalNonCash).toLocaleString('id-ID')}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Uang Diharapkan:</span>
                <span className="font-semibold text-slate-200">
                  Rp {shiftReportResult.expectedCashEnd.toLocaleString('id-ID')}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Uang Fisik Kasir:</span>
                <span className="font-semibold text-slate-200">
                  Rp {shiftReportResult.actualCashEnd.toLocaleString('id-ID')}
                </span>
              </div>
              <div className="pt-2 border-t border-slate-800 flex justify-between font-bold">
                <span className="text-slate-300">Varians / Selisih:</span>
                <span
                  className={
                    shiftReportResult.variance === 0
                      ? 'text-emerald-400'
                      : shiftReportResult.variance > 0
                      ? 'text-blue-400'
                      : 'text-red-400'
                  }
                >
                  {shiftReportResult.variance === 0
                    ? 'PAS (Rp 0)'
                    : shiftReportResult.variance > 0
                    ? `SURPLUS +Rp ${shiftReportResult.variance.toLocaleString('id-ID')}`
                    : `MINUS -Rp ${Math.abs(shiftReportResult.variance).toLocaleString('id-ID')}`}
                </span>
              </div>
            </div>

            <button
              onClick={() => {
                setShiftReportResult(null);
                setActiveShift(null);
                setIsLoggedIn(false);
              }}
              className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold rounded-xl text-xs"
            >
              Selesai & Keluar Terminal
            </button>
          </div>
        </div>
      )}

      {/* 8. MODAL: EDIT NOTE ITEM */}
      {activeItemNote && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-2xl">
            <h3 className="text-sm font-bold text-white mb-2">Catatan Khusus Barista / Dapur</h3>
            <input
              type="text"
              placeholder="Contoh: Less Sugar, Extra Ice, Oat Milk"
              value={activeItemNote.note}
              onChange={(e) => setActiveItemNote({ ...activeItemNote, note: e.target.value })}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none mb-3"
            />
            <div className="flex gap-2">
              <button
                onClick={() => setActiveItemNote(null)}
                className="flex-1 py-2 bg-slate-800 text-slate-300 rounded-lg text-xs"
              >
                Batal
              </button>
              <button
                onClick={() => setItemNotes(activeItemNote.id, activeItemNote.note)}
                className="flex-1 py-2 bg-emerald-500 text-slate-950 font-bold rounded-lg text-xs"
              >
                Simpan Catatan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
