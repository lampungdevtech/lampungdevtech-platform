'use client';

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Check, Copy, ExternalLink, QrCode, Building2, ShieldCheck, Clock } from 'lucide-react';
import type { PaymentResult } from '@/lib/payment/types';

interface PaymentInstructionModalProps {
  isOpen: boolean;
  onClose: () => void;
  paymentResult: PaymentResult | null;
  orderTitle?: string;
  isEn?: boolean;
}

export function PaymentInstructionModal({
  isOpen,
  onClose,
  paymentResult,
  orderTitle = 'Pembayaran Layanan',
  isEn = false,
}: PaymentInstructionModalProps) {
  const [copied, setCopied] = useState(false);

  if (!paymentResult) return null;

  const isVA = paymentResult.paymentMethod?.includes('.VA');
  const isQRIS = paymentResult.paymentMethod === 'QRIS' || paymentResult.paymentMethod === 'QR_CODE';

  const handleCopyCode = () => {
    if (paymentResult.paymentCode) {
      navigator.clipboard.writeText(paymentResult.paymentCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="mx-auto w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center mb-2">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <DialogTitle className="text-center text-lg font-bold">
            {isEn ? 'Complete Your Payment' : 'Selesaikan Pembayaran Anda'}
          </DialogTitle>
          <DialogDescription className="text-center text-xs">
            {isEn
              ? 'Powered by WeselAja (XenithPay) Secure Gateway'
              : 'Diproses aman oleh Payment Gateway WeselAja (XenithPay)'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Amount Box */}
          <div className="p-3.5 rounded-xl bg-muted/40 border border-border/70 text-center space-y-1">
            <span className="text-[11px] text-muted-foreground uppercase tracking-wider font-semibold">
              {orderTitle}
            </span>
            <div className="text-2xl font-extrabold text-primary">
              Rp {paymentResult.totalAmount?.toLocaleString('id-ID')}
            </div>
            <div className="text-[11px] text-muted-foreground flex items-center justify-center gap-1">
              <Clock className="w-3 h-3 text-amber-500" />
              <span>{isEn ? 'Valid for 15 minutes' : 'Berlaku selama 15 menit'}</span>
            </div>
          </div>

          {/* VA Mode */}
          {isVA && (
            <div className="space-y-2 p-3.5 rounded-xl border border-primary/20 bg-primary/5">
              <div className="flex items-center justify-between text-xs text-muted-foreground font-medium">
                <span className="flex items-center gap-1">
                  <Building2 className="w-3.5 h-3.5 text-primary" />
                  Nomor Virtual Account
                </span>
                <span className="font-semibold text-foreground">{paymentResult.paymentMethod}</span>
              </div>
              <div className="flex items-center justify-between bg-card p-2.5 rounded-lg border border-border/60">
                <span className="font-mono text-base font-bold tracking-wider text-primary">
                  {paymentResult.paymentCode || '896501239847120'}
                </span>
                <Button size="sm" variant="ghost" onClick={handleCopyCode} className="h-8 px-2 text-xs">
                  {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                  <span className="ml-1 text-[11px]">{copied ? 'Tersalin' : 'Salin'}</span>
                </Button>
              </div>
              <p className="text-[10px] text-muted-foreground">
                Buka aplikasi m-Banking atau ATM, pilih menu Transfer Virtual Account, dan masukkan nomor di atas.
              </p>
            </div>
          )}

          {/* QRIS Mode */}
          {isQRIS && (
            <div className="flex flex-col items-center justify-center p-4 rounded-xl border border-border/70 bg-card space-y-2">
              <div className="w-44 h-44 p-2 bg-white rounded-xl border border-border shadow-xs flex items-center justify-center">
                <img
                  src={
                    paymentResult.paymentCode?.startsWith('http')
                      ? paymentResult.paymentCode
                      : `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(
                          paymentResult.paymentCode || 'WESELAJA_QRIS_DEMO'
                        )}`
                  }
                  alt="QRIS Code"
                  className="w-full h-full object-contain"
                />
              </div>
              <p className="text-xs font-semibold text-foreground flex items-center gap-1 mt-1">
                <QrCode className="w-3.5 h-3.5 text-primary" />
                Scan via BCA, Mandiri, GoPay, OVO, DANA
              </p>
            </div>
          )}

          {/* Reference & Simulation Notice */}
          <div className="text-[11px] text-muted-foreground space-y-1 bg-muted/20 p-2.5 rounded-lg border border-border/40">
            <div className="flex justify-between">
              <span>Ref ID:</span>
              <span className="font-mono font-medium text-foreground">{paymentResult.paymentReference}</span>
            </div>
            {paymentResult.isSimulated && (
              <p className="text-[10px] text-amber-600 dark:text-amber-400 font-medium">
                ⚡ Mode Simulasi Aktif: Transaksi terverifikasi otomatis untuk demo lokal.
              </p>
            )}
          </div>

          {/* Action buttons */}
          <div className="space-y-2 pt-1">
            {paymentResult.paymentUrl && !paymentResult.isSimulated && (
              <Button
                asChild
                className="w-full h-10 font-semibold bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                <a href={paymentResult.paymentUrl} target="_blank" rel="noopener noreferrer">
                  Buka Halaman Pembayaran
                  <ExternalLink className="w-4 h-4 ml-1.5" />
                </a>
              </Button>
            )}
            <Button
              variant="outline"
              onClick={onClose}
              className="w-full h-9 text-xs font-medium border-border/80"
            >
              {isEn ? 'Close & View Status' : 'Tutup & Lihat Status Transaksi'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
