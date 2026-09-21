'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { Check, Loader2, QrCode, Building2, Wallet, RefreshCw, AlertCircle } from 'lucide-react';
import type { PaymentMethodCategory, PaymentMethodItem } from '@/lib/payment/types';

interface PaymentMethodSelectorProps {
  amount: number;
  selectedMethod: string;
  onSelectMethod: (method: PaymentMethodItem) => void;
  disabled?: boolean;
  className?: string;
  isEn?: boolean;
}

export function PaymentMethodSelector({
  amount,
  selectedMethod,
  onSelectMethod,
  disabled = false,
  className = '',
  isEn = false,
}: PaymentMethodSelectorProps) {
  const [methods, setMethods] = useState<PaymentMethodItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<PaymentMethodCategory>('ALL');

  const fetchMethods = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`/api/payment/methods?amount=${amount}`);
      const data = await res.json();

      if (data.success && Array.isArray(data.paymentMethods)) {
        setMethods(data.paymentMethods);
        // If current selection is not in list or empty, select first
        if (!selectedMethod && data.paymentMethods.length > 0) {
          onSelectMethod(data.paymentMethods[0]);
        }
      } else {
        throw new Error(data.error || 'Gagal memuat metode pembayaran');
      }
    } catch (err) {
      console.error('[PaymentMethodSelector] Fetch error:', err);
      setError(err instanceof Error ? err.message : 'Gagal memuat metode pembayaran');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMethods();
  }, [amount]);

  const filteredMethods = useMemo(() => {
    if (activeCategory === 'ALL') return methods;
    return methods.filter((m) => m.category === activeCategory);
  }, [methods, activeCategory]);

  return (
    <div className={`space-y-3 ${className}`}>
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
          <Wallet className="w-3.5 h-3.5 text-primary" />
          {isEn ? 'Select Payment Method (WeselAja)' : 'Pilih Metode Pembayaran (WeselAja)'}
        </label>
        <span className="text-[10px] text-muted-foreground bg-muted/60 px-2 py-0.5 rounded-full">
          {isEn ? 'Automatic Verification' : 'Verifikasi Otomatis'}
        </span>
      </div>

      {/* Category Tabs */}
      <div className="flex items-center gap-1.5 p-1 bg-muted/50 rounded-lg text-[11px] overflow-x-auto">
        <button
          type="button"
          onClick={() => setActiveCategory('ALL')}
          className={`px-2.5 py-1 rounded-md transition-all font-medium whitespace-nowrap ${
            activeCategory === 'ALL'
              ? 'bg-card text-foreground shadow-xs font-semibold'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          {isEn ? 'All Methods' : 'Semua'}
        </button>
        <button
          type="button"
          onClick={() => setActiveCategory('QRIS')}
          className={`flex items-center gap-1 px-2.5 py-1 rounded-md transition-all font-medium whitespace-nowrap ${
            activeCategory === 'QRIS'
              ? 'bg-card text-foreground shadow-xs font-semibold'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <QrCode className="w-3 h-3 text-primary" />
          QRIS
        </button>
        <button
          type="button"
          onClick={() => setActiveCategory('VIRTUAL_ACCOUNT')}
          className={`flex items-center gap-1 px-2.5 py-1 rounded-md transition-all font-medium whitespace-nowrap ${
            activeCategory === 'VIRTUAL_ACCOUNT'
              ? 'bg-card text-foreground shadow-xs font-semibold'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <Building2 className="w-3 h-3 text-primary" />
          Virtual Account
        </button>
        <button
          type="button"
          onClick={() => setActiveCategory('EWALLET')}
          className={`flex items-center gap-1 px-2.5 py-1 rounded-md transition-all font-medium whitespace-nowrap ${
            activeCategory === 'EWALLET'
              ? 'bg-card text-foreground shadow-xs font-semibold'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <Wallet className="w-3 h-3 text-primary" />
          E-Wallet
        </button>
      </div>

      {/* Methods Cards List */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-6 border border-dashed border-border/70 rounded-xl bg-muted/20">
          <Loader2 className="w-5 h-5 animate-spin text-primary mb-1.5" />
          <span className="text-xs text-muted-foreground">
            {isEn ? 'Loading payment channels...' : 'Memuat saluran pembayaran WeselAja...'}
          </span>
        </div>
      ) : error ? (
        <div className="p-3 border border-destructive/30 rounded-xl bg-destructive/10 text-xs text-destructive flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
          <button
            type="button"
            onClick={fetchMethods}
            className="flex items-center gap-1 px-2 py-1 text-[10px] font-semibold bg-destructive/20 hover:bg-destructive/30 rounded"
          >
            <RefreshCw className="w-3 h-3" />
            {isEn ? 'Retry' : 'Coba Lagi'}
          </button>
        </div>
      ) : filteredMethods.length === 0 ? (
        <div className="text-center py-4 text-xs text-muted-foreground">
          {isEn ? 'No payment methods available for this amount.' : 'Tidak ada metode pembayaran tersedia untuk nominal ini.'}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-2 max-h-[220px] overflow-y-auto p-1 -m-1 custom-scrollbar">
          {filteredMethods.map((method) => {
            const isSelected = selectedMethod === method.code;

            return (
              <button
                key={method.code}
                type="button"
                disabled={disabled}
                onClick={() => onSelectMethod(method)}
                className={`relative flex items-center gap-2.5 p-2.5 rounded-xl border-2 transition-all text-left group ${
                  isSelected
                    ? 'border-emerald-500 bg-emerald-50/70 dark:bg-emerald-950/20 shadow-xs ring-2 ring-emerald-500/20'
                    : 'border-border/60 bg-card hover:border-emerald-400/50 hover:bg-muted/40'
                } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
              >
                {/* Active Checkmark Pill */}
                {isSelected && (
                  <div className="absolute top-1.5 right-1.5 w-4 h-4 bg-emerald-500 rounded-full flex items-center justify-center shadow-xs ring-2 ring-card z-10">
                    <Check className="w-2.5 h-2.5 text-white stroke-[3.5]" />
                  </div>
                )}

                {/* Channel Logo */}
                <div className="w-8 h-8 rounded-lg bg-white p-0.5 shrink-0 flex items-center justify-center border border-border/40 shadow-2xs">
                  <img
                    src={method.image}
                    alt={method.name}
                    className="w-full h-full object-contain"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />
                </div>

                {/* Channel Info */}
                <div className="min-w-0 flex-1 pr-3">
                  <p className={`text-xs font-bold truncate leading-tight ${isSelected ? 'text-emerald-700 dark:text-emerald-400' : 'text-foreground'}`}>
                    {method.name}
                  </p>
                  <p className="text-[10px] text-muted-foreground font-medium mt-0.5">
                    {method.totalFee > 0 ? `+Rp ${method.totalFee.toLocaleString('id-ID')}` : 'Bebas Biaya'}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
