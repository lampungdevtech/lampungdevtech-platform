'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import {
  ExternalLink,
  MessageCircle,
  Sparkles,
  ArrowRight,
  Loader2,
} from 'lucide-react';
import Link from 'next/link';

export default function OrderStatusAndAccessPage() {
  const params = useParams();
  const { toast } = useToast();

  const storeSlug = params.storeSlug as string;
  const orderId = params.orderId as string;
  const locale = (params.locale as string) || 'id';

  const [order, setOrder] = useState<any>(null);
  const [isVerifying, setIsVerifying] = useState(false);

  useEffect(() => {
    // Initial mock data or fetch
    setOrder({
      id: orderId,
      orderNumber: `ORD-WIN-20260918-${orderId.slice(-4).toUpperCase()}`,
      storeName: 'Lampung Digital Creative',
      storeWhatsapp: '6281234567890',
      buyer: {
        name: 'Rian Pratama',
        whatsapp: '081298765432',
      },
      items: [
        {
          productName: 'Bundle 50+ Template Canva Promosi UMKM Lampung',
          productType: 'DIGITAL',
          price: 49000,
          digitalDetails: {
            deliveryMethod: 'ACCESS_LINK',
            accessLink: 'https://canva.com/template-invite-demo-lampungdev',
            accessInstructions:
              'Klik tautan tombol di bawah untuk langsung menduplikasi 50+ template feeds & reels ke akun Canva kamu. Template bebas diedit kapan saja.',
          },
        },
      ],
      pricing: {
        grandTotal: 49000,
      },
      payment: {
        channel: 'QRIS',
        status: 'PAID', // Start with PAID or toggleable
      },
      fulfillment: {
        status: 'COMPLETED',
        digitalDelivered: true,
      },
    });
  }, [orderId]);

  const handleSimulatePayment = async () => {
    setIsVerifying(true);
    try {
      await new Promise((r) => setTimeout(r, 800));
      setOrder((prev: any) => ({
        ...prev,
        payment: { ...prev.payment, status: 'PAID' },
        fulfillment: { ...prev.fulfillment, status: 'COMPLETED', digitalDelivered: true },
      }));
      toast({
        title: '🎉 Pembayaran Berhasil Dikonfirmasi!',
        description: 'Tautan akses produk digital Anda kini telah aktif.',
      });
    } finally {
      setIsVerifying(false);
    }
  };

  const formatRupiah = (val: number) =>
    new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(val);

  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const isPaid = order.payment.status === 'PAID';
  const item = order.items[0];

  return (
    <div className="min-h-screen py-10 md:py-16 bg-muted/10">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 space-y-6">
        {/* Status Header */}
        <div className="text-center space-y-2">
          <Badge
            variant={isPaid ? 'default' : 'secondary'}
            className={`px-3 py-1 text-xs font-semibold ${
              isPaid
                ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30'
                : 'bg-amber-500/10 text-amber-600 border-amber-500/30'
            }`}
          >
            {isPaid ? 'PEMBAYARAN LUNAS · AKSES DIGITAL TERBUKA' : 'MENUNGGU PEMBAYARAN'}
          </Badge>

          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            {isPaid ? 'Terima Kasih Atas Pembelian Anda!' : 'Selesaikan Pembayaran Anda'}
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Nomor Pesanan: <strong className="font-mono text-foreground">#{order.orderNumber}</strong>
          </p>
        </div>

        {/* 1. KOTAK PENGIRIMAN PRODUK DIGITAL (JIKA LUNAS) */}
        {isPaid ? (
          <Card className="border-2 border-emerald-500/40 bg-gradient-to-br from-emerald-500/10 via-card to-background shadow-xl overflow-hidden">
            <CardContent className="p-6 sm:p-8 space-y-6">
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-2xl">
                  <Sparkles className="h-7 w-7" />
                </div>
                <div>
                  <h2 className="text-xl font-bold tracking-tight text-foreground">
                    Akses Produk Digital Anda Siap!
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    Produk: <strong>{item.productName}</strong>
                  </p>
                </div>
              </div>

              {/* Action Button Akses Digital */}
              <div className="p-5 rounded-2xl bg-card border space-y-3 shadow-sm">
                <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Petunjuk Penggunaan dari Penjual:
                </div>
                <p className="text-xs sm:text-sm text-foreground leading-relaxed">
                  {item.digitalDetails?.accessInstructions ||
                    'Klik tautan di bawah ini untuk langsung mengakses aset digital atau template Anda.'}
                </p>

                <div className="pt-2">
                  <Button
                    size="lg"
                    className="w-full h-12 bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-lg shadow-emerald-600/20"
                    asChild
                  >
                    <a
                      href={item.digitalDetails?.accessLink || 'https://canva.com'}
                      target="_blank"
                      rel="noreferrer"
                    >
                      <ExternalLink className="h-5 w-5 mr-2" />
                      Buka Tautan Akses / Template Sekarang
                    </a>
                  </Button>
                </div>
              </div>

              {/* Bantuan WA Penjual */}
              <div className="flex items-center justify-between text-xs text-muted-foreground pt-1">
                <span>Butuh bantuan atau pertanyaan?</span>
                <a
                  href={`https://wa.me/${order.storeWhatsapp.replace(/^0/, '62')}?text=Halo%20${encodeURIComponent(order.storeName)}%2C%20saya%20sudah%20membayar%20pesanan%20%23${order.orderNumber}.`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-emerald-600 hover:underline font-semibold flex items-center"
                >
                  <MessageCircle className="h-3.5 w-3.5 mr-1" />
                  Hubungi Penjual via WA
                </a>
              </div>
            </CardContent>
          </Card>
        ) : (
          /* 2. KOTAK MENUNGGU PEMBAYARAN (QRIS SCAN) */
          <Card className="border shadow-lg">
            <CardContent className="p-6 sm:p-8 text-center space-y-5">
              <div className="space-y-1">
                <div className="text-xs font-semibold text-muted-foreground uppercase">
                  Scan QRIS untuk Pembayaran Otomatis
                </div>
                <div className="text-2xl font-black text-foreground">
                  {formatRupiah(order.pricing.grandTotal)}
                </div>
              </div>

              {/* Ilustrasi Barcode QRIS */}
              <div className="p-6 bg-white rounded-2xl border inline-block mx-auto shadow-inner">
                <img
                  src="https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=https://lampungdev.tech/demo-qris"
                  alt="QRIS Code"
                  className="w-48 h-48 mx-auto"
                />
                <div className="text-[11px] font-bold text-slate-800 mt-2 tracking-wider">
                  NMID: ID102026LAMPUNGDEV
                </div>
              </div>

              <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                Dukungan semua e-wallet (GoPay, OVO, ShopeePay, DANA) dan BCA, Mandiri, BRI, BNI Mobile.
              </p>

              <div className="pt-2">
                <Button
                  size="lg"
                  variant="default"
                  onClick={handleSimulatePayment}
                  disabled={isVerifying}
                  className="w-full font-bold"
                >
                  {isVerifying ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Memeriksa Pembayaran...
                    </>
                  ) : (
                    'Saya Sudah Bayar (Konfirmasi Akses Sekarang)'
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Ringkasan Rincian Pesanan */}
        <Card className="p-5 space-y-3 bg-card/60">
          <div className="font-bold text-xs uppercase tracking-wider text-muted-foreground border-b pb-2">
            Rincian Pesanan
          </div>
          <div className="space-y-1.5 text-xs">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Toko Penjual:</span>
              <span className="font-semibold">{order.storeName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Nama Pembeli:</span>
              <span className="font-semibold">{order.buyer.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">WhatsApp:</span>
              <span className="font-semibold">{order.buyer.whatsapp}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Ongkos Kirim:</span>
              <span className="font-semibold text-emerald-600">Gratis (Produk Digital)</span>
            </div>
            <div className="flex justify-between pt-2 border-t font-bold text-sm">
              <span>Total Bayar:</span>
              <span className="text-primary">{formatRupiah(order.pricing.grandTotal)}</span>
            </div>
          </div>
        </Card>

        <div className="text-center pt-2">
          <Button variant="ghost" size="sm" asChild>
            <Link href={`/${locale}/store/${storeSlug}`}>
              <ArrowRight className="h-4 w-4 mr-1 rotate-180" />
              Kembali ke Toko {order.storeName}
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
