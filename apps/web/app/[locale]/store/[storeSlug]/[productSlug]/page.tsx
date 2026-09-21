'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import {
  CheckCircle2,
  ArrowLeft,
  Smartphone,
  ShieldCheck,
  Send,
  Loader2,
  Sparkles,
  CreditCard,
} from 'lucide-react';
import Link from 'next/link';
import { PaymentMethodSelector } from '@/components/payment/payment-method-selector';
import { PaymentInstructionModal } from '@/components/payment/payment-instruction-modal';
import type { PaymentMethodItem, PaymentResult } from '@/lib/payment/types';

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();

  const storeSlug = params.storeSlug as string;
  const productSlug = params.productSlug as string;
  const locale = (params.locale as string) || 'id';

  const [product, setProduct] = useState<any>(null);
  const [store, setStore] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Form Checkout State
  const [buyerName, setBuyerName] = useState('');
  const [buyerWhatsapp, setBuyerWhatsapp] = useState('');
  const [buyerEmail, setBuyerEmail] = useState('');
  const [buyerNotes, setBuyerNotes] = useState('');
  const [paymentChannel, setPaymentChannel] = useState<'WHATSAPP_DIRECT' | 'GATEWAY'>('WHATSAPP_DIRECT');
  const [selectedGatewayMethod, setSelectedGatewayMethod] = useState<string>('QRIS');
  const [selectedGatewayItem, setSelectedGatewayItem] = useState<PaymentMethodItem | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [weselResult, setWeselResult] = useState<PaymentResult | null>(null);
  const [isInstructionOpen, setIsInstructionOpen] = useState(false);
  const [completedOrderId, setCompletedOrderId] = useState<string | null>(null);

  useEffect(() => {
    // For demo instant reliability: fetch products from store
    const loadData = async () => {
      try {
        const res = await fetch(`/api/store/products?storeId=store-demo-01`);
        const data = await res.json();
        if (data.products) {
          const found = data.products.find((p: any) => p.slug === productSlug) || data.products[0];
          setProduct(found);
        }
        setStore({
          id: 'store-demo-01',
          name: 'Lampung Digital Creative',
          slug: storeSlug,
          whatsappNumber: '6281234567890',
        });
      } catch (e) {
        console.warn('Load product error:', e);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [productSlug, storeSlug]);

  const formatRupiah = (val: number) =>
    new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(val);

  const finalPrice = product ? (product.discountPrice || product.price) : 0;
  const gatewayFee = paymentChannel === 'GATEWAY' && selectedGatewayItem ? (selectedGatewayItem.fee ?? selectedGatewayItem.totalFee ?? 0) : 0;
  const totalAmount = finalPrice + gatewayFee;

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!buyerName || !buyerWhatsapp) {
      toast({
        variant: 'destructive',
        title: 'Form Belum Lengkap',
        description: 'Nama dan nomor WhatsApp wajib diisi agar akses digital dapat dikirimkan.',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      if (paymentChannel === 'WHATSAPP_DIRECT') {
        const res = await fetch('/api/store/checkout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            storeId: store?.id || 'store-demo-01',
            storeSlug,
            storeName: store?.name || 'Lampung Digital Creative',
            storeWhatsapp: store?.whatsappNumber || '6281234567890',
            buyerName,
            buyerWhatsapp,
            buyerEmail,
            buyerNotes,
            productId: product?.id,
            paymentChannel: 'WHATSAPP_DIRECT',
          }),
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Gagal memproses pesanan.');

        if (data.whatsappRedirectUrl) {
          toast({
            title: 'Membuka WhatsApp Penjual...',
            description: 'Pesanan Anda telah disiapkan. Mengalihkan ke WhatsApp.',
          });
          window.open(data.whatsappRedirectUrl, '_blank');
        }
        router.push(`/${locale}/store/${storeSlug}/order/${data.order.id}`);
      } else {
        // Direct Gateway Payment via WeselAja (XenithPay Open API)
        const gatewayRes = await fetch('/api/payment/weselaja/create', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            amount: finalPrice,
            paymentMethod: selectedGatewayMethod || 'QRIS',
            customerName: buyerName,
            customerEmail: buyerEmail || undefined,
            customerPhone: buyerWhatsapp,
            description: `Beli ${product?.name} - ${store?.name || 'Toko Mitra'}`,
            metadata: {
              storeSlug,
              productId: product?.id,
            },
          }),
        });

        const gatewayData = await gatewayRes.json();
        if (!gatewayRes.ok || !gatewayData.success) {
          throw new Error(gatewayData.error || 'Gagal membuat tagihan pembayaran');
        }

        const payResult: PaymentResult = gatewayData.payment;

        // Persist order in store DB with WeselAja transaction reference
        const resOrder = await fetch('/api/store/checkout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            storeId: store?.id || 'store-demo-01',
            storeSlug,
            storeName: store?.name || 'Lampung Digital Creative',
            storeWhatsapp: store?.whatsappNumber || '6281234567890',
            buyerName,
            buyerWhatsapp,
            buyerEmail,
            buyerNotes,
            productId: product?.id,
            paymentChannel: selectedGatewayMethod,
            paymentFee: payResult.fee ?? payResult.feeAmount ?? 0,
            paymentCode: payResult.paymentCode,
            paymentUrl: payResult.paymentUrl,
            transactionReference: payResult.transactionReference ?? payResult.paymentReference,
          }),
        });

        const orderData = await resOrder.json();
        const orderId = orderData?.order?.id;
        if (orderId) {
          setCompletedOrderId(orderId);
        }

        setWeselResult(payResult);
        setIsInstructionOpen(true);
      }
    } catch (err: any) {
      toast({
        variant: 'destructive',
        title: 'Checkout Gagal',
        description: err.message || 'Terjadi kesalahan sistem.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading || !product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 md:py-12 bg-muted/10">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 space-y-6">
        {/* Back link */}
        <Link
          href={`/${locale}/store/${storeSlug}`}
          className="inline-flex items-center text-xs font-semibold text-muted-foreground hover:text-primary transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5 mr-1" />
          Kembali ke Etalase {store?.name}
        </Link>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          {/* Sisi Kiri: Detail & Informasi Produk Digital (7 kolom) */}
          <div className="md:col-span-7 space-y-6">
            <div className="aspect-video w-full rounded-2xl overflow-hidden bg-muted border shadow-sm relative">
              <img
                src={product.images[0] || 'https://images.unsplash.com/photo-1626785774573-4b799315345d?w=800&auto=format&fit=crop&q=80'}
                alt={product.name}
                className="w-full h-full object-cover"
              />
              <Badge className="absolute top-3 left-3 bg-background/90 text-foreground backdrop-blur text-xs">
                ⚡ Produk Digital · Akses Instan
              </Badge>
            </div>

            <div className="space-y-3">
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight leading-snug">
                {product.name}
              </h1>

              <div className="flex items-baseline space-x-3">
                <span className="text-3xl font-black text-primary">
                  {formatRupiah(finalPrice)}
                </span>
                {product.discountPrice && (
                  <span className="text-sm text-muted-foreground line-through">
                    {formatRupiah(product.price)}
                  </span>
                )}
                {product.discountPrice && (
                  <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/20 text-xs">
                    Hemat {formatRupiah(product.price - product.discountPrice)}
                  </Badge>
                )}
              </div>
            </div>

            {/* Apa yang didapatkan */}
            <div className="p-5 rounded-2xl bg-card border space-y-3 shadow-sm">
              <div className="font-bold text-sm text-foreground flex items-center space-x-2">
                <Sparkles className="h-4 w-4 text-primary" />
                <span>Keuntungan Pembelian Produk Digital Ini:</span>
              </div>
              <ul className="space-y-2 text-xs sm:text-sm text-muted-foreground">
                <li className="flex items-start">
                  <CheckCircle2 className="h-4 w-4 mr-2 text-emerald-500 shrink-0 mt-0.5" />
                  <span><strong>Akses Instan & Otomatis</strong>: Link Canva/E-Book langsung tampil setelah bayar.</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle2 className="h-4 w-4 mr-2 text-emerald-500 shrink-0 mt-0.5" />
                  <span><strong>100% Bebas Ongkir</strong>: Tidak ada biaya pengiriman tambahan sama sekali.</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle2 className="h-4 w-4 mr-2 text-emerald-500 shrink-0 mt-0.5" />
                  <span><strong>Dukungan Penjual Langsung</strong>: Bantuan via WhatsApp resmi toko mitra jika ada kendala.</span>
                </li>
              </ul>
            </div>

            {/* Deskripsi */}
            <div className="space-y-2">
              <h3 className="font-bold text-base">Deskripsi Produk</h3>
              <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
                {product.description}
              </p>
            </div>
          </div>

          {/* Sisi Kanan: Single-Step Checkout Box (5 kolom) */}
          <div className="md:col-span-5">
            <Card className="border-2 border-primary/30 shadow-xl bg-card sticky top-20">
              <CardContent className="p-6 space-y-5">
                <div className="border-b pb-3 space-y-1.5">
                  <div className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">
                    Form Pemesanan Instan
                  </div>
                  <div className="flex items-baseline justify-between text-xs">
                    <span className="text-muted-foreground">Harga Produk:</span>
                    <span className="font-semibold text-foreground">{formatRupiah(finalPrice)}</span>
                  </div>
                  {paymentChannel === 'GATEWAY' && gatewayFee > 0 && (
                    <div className="flex items-baseline justify-between text-xs text-muted-foreground">
                      <span>Biaya Layanan ({selectedGatewayItem?.name || selectedGatewayMethod}):</span>
                      <span className="font-semibold text-foreground">+{formatRupiah(gatewayFee)}</span>
                    </div>
                  )}
                  <div className="flex items-baseline justify-between pt-1 border-t">
                    <span className="text-xs font-bold text-foreground">Total Bayar:</span>
                    <span className="text-xl font-black text-primary">{formatRupiah(totalAmount)}</span>
                  </div>
                </div>

                <form onSubmit={handleCheckout} className="space-y-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="buyerName" className="text-xs font-semibold">
                      Nama Lengkap Anda <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="buyerName"
                      placeholder="Nama Anda"
                      value={buyerName}
                      onChange={(e) => setBuyerName(e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="buyerWhatsapp" className="text-xs font-semibold">
                      Nomor WhatsApp <span className="text-destructive">*</span>
                    </Label>
                    <div className="relative">
                      <Smartphone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="buyerWhatsapp"
                        className="pl-9"
                        placeholder="08123456789"
                        value={buyerWhatsapp}
                        onChange={(e) => setBuyerWhatsapp(e.target.value)}
                        required
                      />
                    </div>
                    <p className="text-[11px] text-muted-foreground">
                      Link akses produk digital akan dikirimkan ke nomor WhatsApp ini.
                    </p>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="buyerEmail" className="text-xs font-semibold">
                      Email (Opsional)
                    </Label>
                    <Input
                      id="buyerEmail"
                      type="email"
                      placeholder="email@anda.com"
                      value={buyerEmail}
                      onChange={(e) => setBuyerEmail(e.target.value)}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="buyerNotes" className="text-xs font-semibold">
                      Catatan untuk Penjual (Opsional)
                    </Label>
                    <Input
                      id="buyerNotes"
                      placeholder="Catatan tambahan jika ada..."
                      value={buyerNotes}
                      onChange={(e) => setBuyerNotes(e.target.value)}
                    />
                  </div>

                  {/* Pilihan Metode Bayar */}
                  <div className="space-y-2 pt-1">
                    <Label className="text-xs font-semibold">Pilih Metode Pembayaran</Label>
                    <div className="space-y-2">
                      <label
                        className={`flex items-center p-3 rounded-lg border cursor-pointer transition-all ${
                          paymentChannel === 'WHATSAPP_DIRECT'
                            ? 'border-primary bg-primary/5 ring-1 ring-primary'
                            : 'border-muted bg-background/50'
                        }`}
                      >
                        <input
                          type="radio"
                          name="channel"
                          checked={paymentChannel === 'WHATSAPP_DIRECT'}
                          onChange={() => setPaymentChannel('WHATSAPP_DIRECT')}
                          className="mr-3"
                        />
                        <div className="flex-1">
                          <div className="font-bold text-xs flex items-center">
                            <Send className="h-3.5 w-3.5 mr-1.5 text-emerald-500" />
                            Pesan via WhatsApp (Chat Langsung)
                          </div>
                          <div className="text-[11px] text-muted-foreground">
                            Format pesan otomatis ke chat WhatsApp penjual mitra.
                          </div>
                        </div>
                      </label>

                      <label
                        className={`flex items-center p-3 rounded-lg border cursor-pointer transition-all ${
                          paymentChannel === 'GATEWAY'
                            ? 'border-primary bg-primary/5 ring-1 ring-primary'
                            : 'border-muted bg-background/50'
                        }`}
                      >
                        <input
                          type="radio"
                          name="channel"
                          checked={paymentChannel === 'GATEWAY'}
                          onChange={() => setPaymentChannel('GATEWAY')}
                          className="mr-3"
                        />
                        <div className="flex-1">
                          <div className="font-bold text-xs flex items-center">
                            <CreditCard className="h-3.5 w-3.5 mr-1.5 text-primary" />
                            Bayar Otomatis (WeselAja Gateway)
                          </div>
                          <div className="text-[11px] text-muted-foreground">
                            QRIS, Virtual Account BCA/Mandiri/BNI/BRI, DANA, OVO.
                          </div>
                        </div>
                      </label>
                    </div>

                    {paymentChannel === 'GATEWAY' && (
                      <div className="pt-2">
                        <PaymentMethodSelector
                          amount={finalPrice}
                          selectedMethod={selectedGatewayMethod}
                          onSelectMethod={(item) => {
                            setSelectedGatewayMethod(item.code);
                            setSelectedGatewayItem(item);
                          }}
                          isEn={locale === 'en'}
                        />
                      </div>
                    )}
                  </div>

                  <Button
                    type="submit"
                    size="lg"
                    disabled={isSubmitting}
                    className="w-full h-12 text-sm font-bold shadow-lg shadow-primary/20"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        Memproses Pesanan...
                      </>
                    ) : paymentChannel === 'WHATSAPP_DIRECT' ? (
                      <>
                        Beli Sekarang via WhatsApp
                        <Send className="h-4 w-4 ml-2" />
                      </>
                    ) : (
                      <>
                        Bayar Sekarang ({formatRupiah(totalAmount)})
                        <CreditCard className="h-4 w-4 ml-2" />
                      </>
                    )}
                  </Button>

                  <div className="text-center text-[11px] text-muted-foreground flex items-center justify-center gap-1">
                    <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
                    <span>Terverifikasi Aman · Akses Digital Instan</span>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* WeselAja Payment Instruction Modal */}
      <PaymentInstructionModal
        isOpen={isInstructionOpen}
        onClose={() => {
          setIsInstructionOpen(false);
          if (completedOrderId) {
            router.push(`/${locale}/store/${storeSlug}/order/${completedOrderId}`);
          }
        }}
        paymentResult={weselResult}
        orderTitle={`Pembelian ${product?.name || 'Produk Digital'}`}
        isEn={locale === 'en'}
      />
    </div>
  );
}
