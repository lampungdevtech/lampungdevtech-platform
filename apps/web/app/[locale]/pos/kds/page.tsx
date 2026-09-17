'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  UtensilsCrossed,
  Clock,
  CheckCircle2,
  Printer,
  Volume2,
  VolumeX,
  Tablet,
} from 'lucide-react';

interface KdsItem {
  name: string;
  quantity: number;
  notes?: string;
}

interface KdsOrder {
  id: string;
  tableNumber: string;
  customerName: string;
  items: KdsItem[];
  total: number;
  status: 'SUBMITTED' | 'IN_PREPARATION' | 'READY' | 'COMPLETED';
  createdAt: string;
}

const DEFAULT_KDS_ORDERS: KdsOrder[] = [
  {
    id: '01J8R99XABC4',
    tableNumber: '04',
    customerName: 'Budi Santoso',
    items: [
      { name: 'Kopi Susu Gula Aren Lampung', quantity: 2, notes: 'Less ice, normal sugar' },
      { name: 'Caffe Latte Steamed Milk', quantity: 1, notes: 'Oat milk substitusi' },
      { name: 'Butter Croissant Artisan', quantity: 1, notes: 'Hangatkan / toasting' },
    ],
    total: 100000,
    status: 'IN_PREPARATION',
    createdAt: new Date(Date.now() - 4 * 60 * 1000).toISOString(), // 4 menit lalu
  },
  {
    id: '01J8R98ZDEF9',
    tableNumber: '08',
    customerName: 'Siti Rahmawati',
    items: [
      { name: 'V60 Robusta Ulubelu Tanggamus', quantity: 1, notes: 'Suhu 90C, ratio 1:15' },
      { name: 'French Fries Truffle Herb', quantity: 1, notes: 'Saus sambal terpisah' },
    ],
    total: 48000,
    status: 'SUBMITTED',
    createdAt: new Date(Date.now() - 11 * 60 * 1000).toISOString(), // 11 menit lalu (overdue / merah)
  },
  {
    id: '01J8R95YXYZ1',
    tableNumber: '12',
    customerName: 'Dimas Aditya',
    items: [
      { name: 'Americano / Long Black', quantity: 2, notes: 'Extra hot, no sugar' },
      { name: 'Cinnamon Roll Cream Cheese', quantity: 2 },
    ],
    total: 94000,
    status: 'READY',
    createdAt: new Date(Date.now() - 18 * 60 * 1000).toISOString(),
  },
];

export default function KitchenDisplayPage() {
  const [orders, setOrders] = useState<KdsOrder[]>(DEFAULT_KDS_ORDERS);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'READY'>('ACTIVE');
  const [now, setNow] = useState(Date.now());

  // Interval to update timers every 10 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setNow(Date.now());
    }, 10000);
    return () => clearInterval(timer);
  }, []);

  // Sync with localStorage if terminal created new orders
  useEffect(() => {
    try {
      const stored = localStorage.getItem('pos_kds_orders');
      if (stored) {
        const parsed: KdsOrder[] = JSON.parse(stored);
        if (parsed && parsed.length > 0) {
          // Merge unique by ID
          setOrders((prev) => {
            const map = new Map<string, KdsOrder>();
            parsed.forEach((o) => map.set(o.id, o));
            prev.forEach((o) => {
              if (!map.has(o.id)) map.set(o.id, o);
            });
            return Array.from(map.values());
          });
        }
      }
    } catch (err) {
      console.warn('Gagal membaca KDS orders dari localStorage', err);
    }
  }, []);

  const updateOrderStatus = (id: string, newStatus: KdsOrder['status']) => {
    setOrders((prev) => {
      const updated = prev.map((o) => (o.id === id ? { ...o, status: newStatus } : o));
      try {
        localStorage.setItem('pos_kds_orders', JSON.stringify(updated));
      } catch (err) {
        console.warn('Gagal menyimpan status KDS ke localStorage', err);
      }
      return updated;
    });
  };

  const getElapsedTimeMinutes = (createdAt: string) => {
    const diff = Math.floor((now - new Date(createdAt).getTime()) / 60000);
    return Math.max(0, diff);
  };

  const filteredOrders = orders.filter((o) => {
    if (statusFilter === 'ALL') return true;
    if (statusFilter === 'ACTIVE') return o.status === 'SUBMITTED' || o.status === 'IN_PREPARATION';
    if (statusFilter === 'READY') return o.status === 'READY';
    return true;
  });

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col select-none">
      {/* KDS TOP BAR */}
      <header className="h-16 bg-slate-900 border-b border-slate-800 px-6 flex items-center justify-between z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
            <UtensilsCrossed className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold text-white">Kitchen Display System (KDS)</h1>
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-semibold border border-amber-500/30">
                Area Bar & Dapur
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Kopi Ruang Temu - Cabang Utama | RabbitMQ Topic: <code className="text-emerald-400">order.created</code>
            </p>
          </div>
        </div>

        {/* Filter Tabs & Sound Settings */}
        <div className="flex items-center gap-3">
          <div className="flex bg-slate-800 p-1 rounded-xl border border-slate-700">
            {(
              [
                { id: 'ACTIVE', label: 'Pesanan Aktif' },
                { id: 'READY', label: 'Siap Saji' },
                { id: 'ALL', label: 'Semua Riwayat' },
              ] as const
            ).map((tab) => (
              <button
                key={tab.id}
                onClick={() => setStatusFilter(tab.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                  statusFilter === tab.id
                    ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`p-2 rounded-xl border transition ${
              soundEnabled
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                : 'bg-slate-800 text-slate-500 border-slate-700'
            }`}
            title={soundEnabled ? 'Notifikasi Suara Aktif' : 'Notifikasi Suara Dinonaktifkan'}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          <Link
            href="/pos/terminal"
            className="text-xs px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 flex items-center gap-1.5"
          >
            <Tablet className="w-3.5 h-3.5" />
            Layar Kasir POS
          </Link>
        </div>
      </header>

      {/* KDS MAIN TICKET GRID */}
      <main className="flex-1 p-6 overflow-y-auto">
        {filteredOrders.length === 0 ? (
          <div className="h-96 flex flex-col items-center justify-center text-slate-500 text-center">
            <CheckCircle2 className="w-12 h-12 mb-3 stroke-1 text-emerald-500/60" />
            <h3 className="text-base font-semibold text-slate-300">Semua Tiket Dapur Selesai!</h3>
            <p className="text-xs text-slate-500 mt-1">
              Dapur siap menerima pesanan berikutnya dari kasir POS.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredOrders.map((order) => {
              const elapsed = getElapsedTimeMinutes(order.createdAt);
              const isOverdue = elapsed >= 10;
              const isWarning = elapsed >= 5 && elapsed < 10;

              return (
                <div
                  key={order.id}
                  className={`bg-slate-900 border rounded-2xl flex flex-col overflow-hidden transition shadow-xl ${
                    order.status === 'READY'
                      ? 'border-emerald-500/40 opacity-75'
                      : isOverdue
                      ? 'border-red-500/60 ring-2 ring-red-500/20'
                      : isWarning
                      ? 'border-amber-500/50'
                      : 'border-slate-800'
                  }`}
                >
                  {/* Ticket Header */}
                  <div
                    className={`p-3.5 flex items-center justify-between border-b ${
                      order.status === 'READY'
                        ? 'bg-emerald-500/10 border-emerald-500/20'
                        : isOverdue
                        ? 'bg-red-500/10 border-red-500/20'
                        : isWarning
                        ? 'bg-amber-500/10 border-amber-500/20'
                        : 'bg-slate-850 border-slate-800'
                    }`}
                  >
                    <div>
                      <span className="text-base font-black text-white tracking-wider">
                        MEJA #{order.tableNumber}
                      </span>
                      <span className="text-[11px] text-slate-400 block">
                        Tamu: {order.customerName}
                      </span>
                    </div>

                    <div className="text-right">
                      <div
                        className={`flex items-center gap-1 text-xs font-bold ${
                          isOverdue
                            ? 'text-red-400 animate-pulse'
                            : isWarning
                            ? 'text-amber-400'
                            : 'text-emerald-400'
                        }`}
                      >
                        <Clock className="w-3.5 h-3.5" />
                        <span>{elapsed} mnt</span>
                      </div>
                      <span className="text-[10px] text-slate-500 font-mono">
                        #{order.id.slice(-6)}
                      </span>
                    </div>
                  </div>

                  {/* Item List */}
                  <div className="p-4 flex-1 space-y-3">
                    {order.items.map((item, idx) => (
                      <div key={idx} className="flex flex-col">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-2">
                            <span className="w-6 h-6 rounded bg-slate-800 text-amber-400 font-bold text-xs flex items-center justify-center">
                              {item.quantity}x
                            </span>
                            <span className="text-xs font-semibold text-slate-100 leading-snug">
                              {item.name}
                            </span>
                          </div>
                        </div>

                        {item.notes && (
                          <div className="ml-8 mt-1 px-2 py-1 rounded bg-amber-500/10 border border-amber-500/20 text-[11px] font-medium text-amber-300">
                            👉 Catatan: {item.notes}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Actions Bar */}
                  <div className="p-3 bg-slate-950 border-t border-slate-800/80 flex items-center gap-2">
                    <button
                      onClick={() => {
                        alert(`Mencetak ulang tiket dapur untuk Meja #${order.tableNumber} via ESC/POS`);
                      }}
                      className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white"
                      title="Cetak Tiket Dapur (ESC/POS)"
                    >
                      <Printer className="w-4 h-4" />
                    </button>

                    {order.status === 'SUBMITTED' && (
                      <button
                        onClick={() => updateOrderStatus(order.id, 'IN_PREPARATION')}
                        className="flex-1 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-lg text-xs transition"
                      >
                        Mulai Siapkan
                      </button>
                    )}

                    {order.status === 'IN_PREPARATION' && (
                      <button
                        onClick={() => updateOrderStatus(order.id, 'READY')}
                        className="flex-1 py-2 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold rounded-lg text-xs transition shadow-lg shadow-emerald-500/20"
                      >
                        Selesai (Siap Saji)
                      </button>
                    )}

                    {order.status === 'READY' && (
                      <button
                        onClick={() => updateOrderStatus(order.id, 'COMPLETED')}
                        className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium rounded-lg text-xs transition"
                      >
                        Sajikan ke Tamu ✓
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
