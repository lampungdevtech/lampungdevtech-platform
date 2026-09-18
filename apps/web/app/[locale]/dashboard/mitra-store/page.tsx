'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import {
  Store as StoreIcon,
  Plus,
  ExternalLink,
  Copy,
  Check,
  Download,
  Trash2,
  TrendingUp,
  ShoppingBag,
  Send,
  Loader2,
  FileCheck2,
  Sparkles,
} from 'lucide-react';
import Link from 'next/link';
import { StoreProduct, StoreOrder, DigitalDeliveryMethod } from '@/types/store';

export default function MitraStoreDashboardPage() {
  const { toast } = useToast();

  const [activeTab, setActiveTab] = useState<'products' | 'orders'>('products');
  const [store] = useState<any>({
    id: 'store-demo-01',
    name: 'Lampung Digital Creative',
    slug: 'lampung-digital',
    whatsappNumber: '6281234567890',
  });

  const [products, setProducts] = useState<StoreProduct[]>([]);
  const [orders, setOrders] = useState<StoreOrder[]>([]);
  const [copiedLink, setCopiedLink] = useState(false);

  // Form Tambah Produk Digital Modal State
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const [isSubmittingProd, setIsSubmittingProd] = useState(false);
  const [newProd, setNewProd] = useState({
    name: '',
    price: '',
    discountPrice: '',
    description: '',
    imageUrl: 'https://images.unsplash.com/photo-1626785774573-4b799315345d?w=800&auto=format&fit=crop&q=80',
    deliveryMethod: 'ACCESS_LINK' as DigitalDeliveryMethod,
    accessLink: '',
    accessInstructions: '',
  });

  // Fetch store data, products, orders
  const loadDashboardData = async () => {
    try {
      // 1. Fetch Products
      const resProds = await fetch(`/api/store/products?storeId=${store.id}`);
      const dataProds = await resProds.json();
      if (dataProds.products) setProducts(dataProds.products);

      // 2. Fetch Orders (mock fallback or real)
      // For instant showcase, we can load initial orders
      setOrders([
        {
          id: 'ord-demo-01',
          orderNumber: 'ORD-WIN-20260918-001',
          storeId: store.id,
          storeSlug: store.slug,
          storeName: store.name,
          storeWhatsapp: store.whatsappNumber,
          buyer: {
            name: 'Rian Pratama',
            whatsapp: '081298765432',
            email: 'rian.pratama@example.com',
            notes: 'Mohon kirimkan link template secepatnya kak.',
          },
          items: [
            {
              productId: 'prod-digital-01',
              productName: 'Bundle 50+ Template Canva Promosi UMKM Lampung',
              productType: 'DIGITAL',
              price: 49000,
              quantity: 1,
            },
          ],
          pricing: {
            subtotal: 49000,
            shippingCost: 0,
            discountAmount: 0,
            grandTotal: 49000,
          },
          payment: {
            channel: 'QRIS',
            status: 'PAID',
            paidAt: new Date().toISOString(),
          },
          fulfillment: {
            status: 'COMPLETED',
            digitalDelivered: true,
          },
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ]);
    } catch (e) {
      console.warn('Dashboard data fetch error:', e);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, [store.id]);

  const copyStoreLink = () => {
    const url = `${window.location.origin}/id/store/${store.slug}`;
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    toast({
      title: 'Tautan Berhasil Disalin!',
      description: 'Tempel tautan ini di Bio Instagram, TikTok, atau chat WhatsApp Anda.',
    });
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProd.name || !newProd.price) {
      toast({
        variant: 'destructive',
        title: 'Form Belum Lengkap',
        description: 'Nama dan harga produk digital wajib diisi.',
      });
      return;
    }

    setIsSubmittingProd(true);
    try {
      const res = await fetch('/api/store/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          storeId: store.id,
          name: newProd.name,
          price: Number(newProd.price),
          discountPrice: newProd.discountPrice ? Number(newProd.discountPrice) : undefined,
          description: newProd.description,
          images: [newProd.imageUrl],
          type: 'DIGITAL',
          digitalDetails: {
            deliveryMethod: newProd.deliveryMethod,
            accessLink: newProd.accessLink || 'https://canva.com',
            accessInstructions:
              newProd.accessInstructions ||
              'Silakan buka tautan di atas untuk langsung menduplikasi atau mengunduh aset digital ini.',
          },
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Gagal menambahkan produk');

      toast({
        title: '🎉 Produk Digital Diterbitkan!',
        description: `"${newProd.name}" sudah live di etalase toko online kamu.`,
      });

      setIsAddingProduct(false);
      setNewProd({
        name: '',
        price: '',
        discountPrice: '',
        description: '',
        imageUrl: 'https://images.unsplash.com/photo-1626785774573-4b799315345d?w=800&auto=format&fit=crop&q=80',
        deliveryMethod: 'ACCESS_LINK',
        accessLink: '',
        accessInstructions: '',
      });

      // Reload products
      loadDashboardData();
    } catch (err: any) {
      toast({
        variant: 'destructive',
        title: 'Gagal Menambah Produk',
        description: err.message || 'Terjadi kesalahan sistem.',
      });
    } finally {
      setIsSubmittingProd(false);
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus produk digital ini?')) return;
    try {
      const res = await fetch(`/api/store/products/${productId}?storeId=${store.id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setProducts((prev) => prev.filter((p) => p.id !== productId));
        toast({ title: 'Produk Dihapus' });
      }
    } catch (err) {
      toast({ variant: 'destructive', title: 'Gagal menghapus produk' });
    }
  };

  const handleMarkOrderPaid = async (orderId: string) => {
    try {
      const res = await fetch(`/api/store/orders/${orderId}/pay`, { method: 'POST' });
      await res.json();
      if (res.ok) {
        setOrders((prev) =>
          prev.map((o) =>
            o.id === orderId
              ? {
                  ...o,
                  payment: { ...o.payment, status: 'PAID' },
                  fulfillment: { ...o.fulfillment, status: 'COMPLETED', digitalDelivered: true },
                }
              : o
          )
        );
        toast({
          title: 'Pesanan Ditandai Lunas!',
          description: 'Akses produk digital telah dibuka untuk pembeli.',
        });
      }
    } catch (e) {
      toast({ variant: 'destructive', title: 'Gagal memperbarui status pesanan' });
    }
  };

  const formatRupiah = (val: number) =>
    new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(val);

  const totalRevenue = orders
    .filter((o) => o.payment.status === 'PAID')
    .reduce((sum, o) => sum + o.pricing.grandTotal, 0);

  return (
    <div className="min-h-screen py-8 md:py-12 bg-muted/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Header Toko & Quick Actions */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 p-6 rounded-2xl bg-card border shadow-sm">
          <div className="space-y-1.5">
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-primary/10 rounded-lg text-primary">
                <StoreIcon className="h-5 w-5" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                {store.name}
              </h1>
              <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 border-emerald-500/30 text-xs">
                Mitra Terverifikasi
              </Badge>
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground flex items-center gap-1">
              <span>Domain Toko:</span>
              <code className="text-primary font-mono bg-muted px-1.5 py-0.5 rounded">
                lampungdev.tech/store/{store.slug}
              </code>
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button variant="outline" size="sm" onClick={copyStoreLink}>
              {copiedLink ? <Check className="h-4 w-4 mr-1.5 text-green-500" /> : <Copy className="h-4 w-4 mr-1.5" />}
              {copiedLink ? 'Tersalin!' : 'Salin Link Toko'}
            </Button>
            <Button size="sm" variant="default" asChild>
              <Link href={`/id/store/${store.slug}`} target="_blank">
                <ExternalLink className="h-4 w-4 mr-1.5" />
                Buka Etalase Toko
              </Link>
            </Button>
          </div>
        </div>

        {/* 4 Kartu Metrik Toko */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-5 space-y-1">
              <div className="flex items-center justify-between text-muted-foreground">
                <span className="text-xs font-medium">Total Pendapatan</span>
                <TrendingUp className="h-4 w-4 text-emerald-500" />
              </div>
              <div className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
                {formatRupiah(totalRevenue)}
              </div>
              <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                0% potongan platform
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-5 space-y-1">
              <div className="flex items-center justify-between text-muted-foreground">
                <span className="text-xs font-medium">Total Pesanan</span>
                <ShoppingBag className="h-4 w-4 text-primary" />
              </div>
              <div className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
                {orders.length} Transaksi
              </div>
              <div className="text-[11px] text-muted-foreground">
                Order via WA & QRIS
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-5 space-y-1">
              <div className="flex items-center justify-between text-muted-foreground">
                <span className="text-xs font-medium">Produk Digital Aktif</span>
                <Download className="h-4 w-4 text-teal-500" />
              </div>
              <div className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
                {products.length} Produk
              </div>
              <div className="text-[11px] text-muted-foreground">
                Siap dikirim instan
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-5 space-y-1">
              <div className="flex items-center justify-between text-muted-foreground">
                <span className="text-xs font-medium">Kecepatan Pengiriman</span>
                <Sparkles className="h-4 w-4 text-amber-500" />
              </div>
              <div className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
                Otomatis
              </div>
              <div className="text-[11px] text-muted-foreground">
                Akses instan setelah bayar
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center space-x-2 border-b">
          <button
            onClick={() => setActiveTab('products')}
            className={`pb-3 px-4 text-sm font-semibold border-b-2 transition-colors ${
              activeTab === 'products'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            Katalog Produk ({products.length})
          </button>
          <button
            onClick={() => setActiveTab('orders')}
            className={`pb-3 px-4 text-sm font-semibold border-b-2 transition-colors ${
              activeTab === 'orders'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            Pesanan Masuk ({orders.length})
          </button>
        </div>

        {/* TAB 1: PRODUK */}
        {activeTab === 'products' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold">Produk Digital & Katalog Anda</h2>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Kelola e-book, template Canva, link Notion, dan modul yang tampil di etalase toko Anda.
                </p>
              </div>

              <Button onClick={() => setIsAddingProduct(true)} className="font-bold">
                <Plus className="h-4 w-4 mr-2" />
                Tambah Produk Digital Baru
              </Button>
            </div>

            {/* Modal / Form Tambah Produk Digital */}
            {isAddingProduct && (
              <Card className="border-2 border-primary/30 shadow-xl bg-card">
                <CardHeader className="border-b bg-muted/20">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-xl font-bold">
                        Tambah Produk Digital Baru
                      </CardTitle>
                      <CardDescription className="text-xs">
                        Produk digital akan otomatis dikirim link akses atau unduhannya setelah pembeli membayar.
                      </CardDescription>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsAddingProduct(false)}
                    >
                      Batal
                    </Button>
                  </div>
                </CardHeader>

                <CardContent className="p-6">
                  <form onSubmit={handleCreateProduct} className="space-y-5">
                    <div className="space-y-2">
                      <Label htmlFor="prodName" className="text-xs font-semibold">
                        Nama Produk Digital <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="prodName"
                        placeholder="cth. Bundle 50+ Template Canva Feeds & Reels Promosi"
                        value={newProd.name}
                        onChange={(e) => setNewProd({ ...newProd, name: e.target.value })}
                        required
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="price" className="text-xs font-semibold">
                          Harga Jual (Rp) <span className="text-destructive">*</span>
                        </Label>
                        <Input
                          id="price"
                          type="number"
                          placeholder="49000"
                          value={newProd.price}
                          onChange={(e) => setNewProd({ ...newProd, price: e.target.value })}
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="discountPrice" className="text-xs font-semibold">
                          Harga Asli / Coret (Opsional)
                        </Label>
                        <Input
                          id="discountPrice"
                          type="number"
                          placeholder="99000"
                          value={newProd.discountPrice}
                          onChange={(e) => setNewProd({ ...newProd, discountPrice: e.target.value })}
                        />
                        <p className="text-[11px] text-muted-foreground">
                          Akan ditampilkan sebagai harga coret diskon untuk menarik minat pembeli.
                        </p>
                      </div>
                    </div>

                    {/* Pengaturan Akses Digital */}
                    <div className="p-4 rounded-xl border border-primary/20 bg-primary/5 space-y-4">
                      <div className="flex items-center space-x-2 text-sm font-bold">
                        <Sparkles className="h-4 w-4 text-primary" />
                        <span>Metode Pengiriman Produk Digital</span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <label
                          className={`flex items-start p-3 rounded-lg border cursor-pointer transition-all ${
                            newProd.deliveryMethod === 'ACCESS_LINK'
                              ? 'border-primary bg-background ring-2 ring-primary/20'
                              : 'border-muted bg-background/50'
                          }`}
                        >
                          <input
                            type="radio"
                            name="deliveryMethod"
                            checked={newProd.deliveryMethod === 'ACCESS_LINK'}
                            onChange={() => setNewProd({ ...newProd, deliveryMethod: 'ACCESS_LINK' })}
                            className="mt-1 mr-2.5"
                          />
                          <div>
                            <div className="font-semibold text-xs">Link Akses Instan (Rekomendasi)</div>
                            <div className="text-[11px] text-muted-foreground">
                              Tautan Template Canva, Google Drive, Notion, atau Zoom.
                            </div>
                          </div>
                        </label>

                        <label
                          className={`flex items-start p-3 rounded-lg border cursor-pointer transition-all ${
                            newProd.deliveryMethod === 'FILE_DOWNLOAD'
                              ? 'border-primary bg-background ring-2 ring-primary/20'
                              : 'border-muted bg-background/50'
                          }`}
                        >
                          <input
                            type="radio"
                            name="deliveryMethod"
                            checked={newProd.deliveryMethod === 'FILE_DOWNLOAD'}
                            onChange={() => setNewProd({ ...newProd, deliveryMethod: 'FILE_DOWNLOAD' })}
                            className="mt-1 mr-2.5"
                          />
                          <div>
                            <div className="font-semibold text-xs">File Unduhan Langsung</div>
                            <div className="text-[11px] text-muted-foreground">
                              File PDF E-book, ZIP modul, atau software asset.
                            </div>
                          </div>
                        </label>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="accessLink" className="text-xs font-semibold">
                          URL / Link Akses Digital <span className="text-destructive">*</span>
                        </Label>
                        <Input
                          id="accessLink"
                          placeholder="cth. https://canva.com/template/... atau https://drive.google.com/..."
                          value={newProd.accessLink}
                          onChange={(e) => setNewProd({ ...newProd, accessLink: e.target.value })}
                          required
                        />
                        <p className="text-[11px] text-muted-foreground">
                          Link ini hanya akan diberikan kepada pembeli setelah pembayaran dinyatakan berhasil.
                        </p>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="accessInstructions" className="text-xs font-semibold">
                          Petunjuk Akses untuk Pembeli
                        </Label>
                        <Textarea
                          id="accessInstructions"
                          rows={2}
                          placeholder="cth. Klik link Canva di atas lalu klik tombol 'Gunakan Template' untuk mulai mengedit di akun Anda."
                          value={newProd.accessInstructions}
                          onChange={(e) => setNewProd({ ...newProd, accessInstructions: e.target.value })}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="desc" className="text-xs font-semibold">
                        Deskripsi & Keunggulan Produk
                      </Label>
                      <Textarea
                        id="desc"
                        rows={3}
                        placeholder="Jelaskan apa saja yang didapatkan pembeli dari produk digital ini..."
                        value={newProd.description}
                        onChange={(e) => setNewProd({ ...newProd, description: e.target.value })}
                      />
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setIsAddingProduct(false)}
                      >
                        Batal
                      </Button>
                      <Button type="submit" disabled={isSubmittingProd}>
                        {isSubmittingProd ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                            Menerbitkan...
                          </>
                        ) : (
                          'Terbitkan Produk ke Toko'
                        )}
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            )}

            {/* List Produk Digital */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((prod) => (
                <Card key={prod.id} className="overflow-hidden flex flex-col justify-between hover:border-primary/40 transition-colors">
                  <div>
                    <div className="relative aspect-video w-full bg-muted overflow-hidden">
                      <img
                        src={prod.images[0] || 'https://images.unsplash.com/photo-1626785774573-4b799315345d?w=800&auto=format&fit=crop&q=80'}
                        alt={prod.name}
                        className="w-full h-full object-cover"
                      />
                      <Badge className="absolute top-2.5 left-2.5 bg-background/90 text-foreground backdrop-blur text-[11px]">
                        ⚡ Produk Digital
                      </Badge>
                    </div>

                    <div className="p-5 space-y-2">
                      <h3 className="font-bold text-base line-clamp-2">{prod.name}</h3>
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {prod.description}
                      </p>

                      <div className="pt-2 flex items-baseline space-x-2">
                        <span className="text-lg font-extrabold text-foreground">
                          {formatRupiah(prod.discountPrice || prod.price)}
                        </span>
                        {prod.discountPrice && (
                          <span className="text-xs text-muted-foreground line-through">
                            {formatRupiah(prod.price)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-muted/20 border-t flex items-center justify-between">
                    <div className="text-xs text-muted-foreground">
                      Terjual: <strong>{prod.totalSales}x</strong>
                    </div>

                    <div className="flex items-center space-x-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-destructive hover:bg-destructive/10"
                        onClick={() => handleDeleteProduct(prod.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="outline" asChild>
                        <Link href={`/id/store/${store.slug}/${prod.slug}`} target="_blank">
                          <ExternalLink className="h-3.5 w-3.5 mr-1" />
                          Lihat
                        </Link>
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* TAB 2: PESANAN MASUK */}
        {activeTab === 'orders' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold">Daftar Pesanan Masuk</h2>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Pesanan yang masuk dari WhatsApp Direct maupun pembayaran otomatis QRIS.
              </p>
            </div>

            <div className="space-y-3">
              {orders.map((ord) => (
                <Card key={ord.id} className="p-5">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <span className="font-mono text-xs font-bold text-primary">
                          #{ord.orderNumber}
                        </span>
                        <Badge
                          variant={ord.payment.status === 'PAID' ? 'default' : 'secondary'}
                          className={
                            ord.payment.status === 'PAID'
                              ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30'
                              : 'bg-amber-500/10 text-amber-600 border-amber-500/30'
                          }
                        >
                          {ord.payment.status === 'PAID' ? 'LUNAS (PAID)' : 'MENUNGGU PEMBAYARAN'}
                        </Badge>
                      </div>

                      <div className="font-semibold text-sm">
                        {ord.items[0]?.productName}
                      </div>

                      <div className="text-xs text-muted-foreground flex flex-wrap gap-x-4 gap-y-1">
                        <span>Pembeli: <strong>{ord.buyer.name}</strong></span>
                        <span>WhatsApp: <strong>{ord.buyer.whatsapp}</strong></span>
                        <span>Metode: <strong>{ord.payment.channel}</strong></span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between md:justify-end gap-3 pt-2 md:pt-0 border-t md:border-t-0">
                      <div className="text-left md:text-right">
                        <div className="text-xs text-muted-foreground">Total Tagihan</div>
                        <div className="text-base font-bold">
                          {formatRupiah(ord.pricing.grandTotal)}
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        {ord.payment.status !== 'PAID' && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-xs text-emerald-600 border-emerald-500/40 hover:bg-emerald-50"
                            onClick={() => handleMarkOrderPaid(ord.id)}
                          >
                            <FileCheck2 className="h-3.5 w-3.5 mr-1" />
                            Tandai Lunas
                          </Button>
                        )}

                        <Button size="sm" variant="default" asChild>
                          <a
                            href={`https://wa.me/${ord.buyer.whatsapp.replace(/^0/, '62')}?text=Halo%20Kak%20${encodeURIComponent(ord.buyer.name)}%2C%20terima%20kasih%20telah%20order%20di%20${encodeURIComponent(store.name)}.`}
                            target="_blank"
                            rel="noreferrer"
                          >
                            <Send className="h-3.5 w-3.5 mr-1" />
                            Chat WA
                          </a>
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
