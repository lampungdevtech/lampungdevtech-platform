import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getStoreBySlug, getProductsByStore } from '@/services/store.service';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Sparkles,
  ShoppingBag,
  MessageCircle,
  CheckCircle2,
  Download,
  ArrowRight,
} from 'lucide-react';
import Link from 'next/link';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ storeSlug: string; locale: string }>;
}): Promise<Metadata> {
  const { storeSlug } = await params;
  const store = await getStoreBySlug(storeSlug);

  if (!store) {
    return { title: 'Toko Tidak Ditemukan | LampungDevTech' };
  }

  return {
    title: `${store.name} - Toko Online Resmi Mitra LampungDevTech`,
    description: store.tagline || store.bio || `Katalog produk online resmi ${store.name}`,
    openGraph: {
      title: store.name,
      description: store.tagline || store.bio,
      images: store.bannerUrl ? [store.bannerUrl] : undefined,
    },
  };
}

export default async function PublicStorefrontPage({
  params,
}: {
  params: Promise<{ storeSlug: string; locale: string }>;
}) {
  const { storeSlug, locale } = await params;
  const store = await getStoreBySlug(storeSlug);

  if (!store) {
    notFound();
  }

  const products = await getProductsByStore(store.id);

  const formatRupiah = (val: number) =>
    new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(val);

  return (
    <div className="min-h-screen pb-16 bg-muted/10">
      {/* 1. Header Banner & Profil Toko (Winme Style) */}
      <div className="relative">
        <div className="h-44 sm:h-56 md:h-64 w-full bg-gradient-to-r from-primary/30 via-emerald-500/20 to-teal-500/30 overflow-hidden relative">
          {store.bannerUrl && (
            <img
              src={store.bannerUrl}
              alt={store.name}
              className="w-full h-full object-cover"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-black/20" />
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 relative -mt-16 sm:-mt-20">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
            <div className="flex items-end space-x-4">
              <div className="h-24 w-24 sm:h-28 sm:w-28 rounded-2xl bg-card border-4 border-background shadow-xl overflow-hidden shrink-0">
                <img
                  src={store.logoUrl || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=200&auto=format&fit=crop&q=80'}
                  alt={store.name}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="space-y-1 pb-1">
                <div className="flex items-center space-x-2">
                  <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                    {store.name}
                  </h1>
                  <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 border-emerald-500/30 text-xs hidden sm:inline-flex">
                    <CheckCircle2 className="h-3 w-3 mr-1" />
                    Mitra Terverifikasi
                  </Badge>
                </div>
                <p className="text-xs sm:text-sm text-muted-foreground font-medium">
                  {store.tagline || 'Pusat Produk Pilihan & Berkualitas'}
                </p>
              </div>
            </div>

            {/* Quick WhatsApp Chat */}
            <div className="pt-2 sm:pt-0">
              <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold" asChild>
                <a
                  href={`https://wa.me/${store.whatsappNumber.replace(/^0/, '62')}?text=Halo%20${encodeURIComponent(store.name)}%2C%20saya%20melihat%20toko%20online%20Anda.`}
                  target="_blank"
                  rel="noreferrer"
                >
                  <MessageCircle className="h-4 w-4 mr-1.5" />
                  Chat Penjual di WA
                </a>
              </Button>
            </div>
          </div>

          {/* Bio Singkat Toko */}
          {store.bio && (
            <div className="mt-4 p-4 rounded-xl bg-card border text-sm text-muted-foreground leading-relaxed">
              {store.bio}
            </div>
          )}

          {/* Jaminan Produk Digital */}
          <div className="mt-4 p-3 rounded-xl bg-primary/10 border border-primary/20 flex items-center space-x-3 text-xs text-primary font-medium">
            <Sparkles className="h-4 w-4 shrink-0" />
            <span>
              ⚡ Produk Digital di toko ini dikirim instan & otomatis ke WhatsApp / layar Anda setelah pembayaran (Bebas Ongkir).
            </span>
          </div>
        </div>
      </div>

      {/* 2. Katalog Produk Etalase */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 mt-8 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <ShoppingBag className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-bold tracking-tight">Katalog Produk ({products.length})</h2>
          </div>
          <span className="text-xs text-muted-foreground">Semua Produk Ready</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {products.map((prod) => (
            <Card
              key={prod.id}
              className="overflow-hidden hover:border-primary/40 transition-all hover:shadow-lg flex flex-col justify-between"
            >
              <div>
                <div className="relative aspect-video w-full bg-muted overflow-hidden">
                  <img
                    src={prod.images[0] || 'https://images.unsplash.com/photo-1626785774573-4b799315345d?w=800&auto=format&fit=crop&q=80'}
                    alt={prod.name}
                    className="w-full h-full object-cover"
                  />
                  <Badge className="absolute top-2.5 left-2.5 bg-background/90 text-foreground backdrop-blur text-[11px]">
                    <Download className="h-3 w-3 mr-1 text-primary" />
                    Produk Digital
                  </Badge>
                </div>

                <div className="p-5 space-y-2">
                  <h3 className="font-bold text-base line-clamp-2 hover:text-primary transition-colors">
                    <Link href={`/${locale}/store/${store.slug}/${prod.slug}`}>
                      {prod.name}
                    </Link>
                  </h3>
                  <p className="text-xs text-muted-foreground line-clamp-2">
                    {prod.description}
                  </p>

                  <div className="pt-2 flex items-baseline space-x-2">
                    <span className="text-xl font-extrabold text-foreground">
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
                <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold flex items-center">
                  <CheckCircle2 className="h-3.5 w-3.5 mr-1" /> Bebas Ongkir
                </span>

                <Button size="sm" className="font-bold shadow-sm" asChild>
                  <Link href={`/${locale}/store/${store.slug}/${prod.slug}`}>
                    Beli Sekarang
                    <ArrowRight className="h-3.5 w-3.5 ml-1" />
                  </Link>
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Footer Toko */}
      <div className="max-w-4xl mx-auto px-4 text-center mt-12 text-xs text-muted-foreground space-y-1">
        <div>Toko online resmi ini ditenagai oleh <strong>LampungDevTech Platform</strong></div>
        <div>0% Komisi Marketplace · Pengiriman File Otomatis · Transaksi Aman</div>
      </div>
    </div>
  );
}
