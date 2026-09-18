'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import {
  Sparkles,
  CheckCircle2,
  XCircle,
  Loader2,
  Store,
  ExternalLink,
  ArrowRight,
  Zap,
  Smartphone,
} from 'lucide-react';
import Link from 'next/link';

export function StoreOnboardingForm() {
  const { data: session } = useSession();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    ownerName: '',
    email: '',
    storeName: '',
    slug: '',
    whatsappNumber: '',
    category: 'DIGITAL_CREATIVE',
    bio: '',
    primaryType: 'DIGITAL',
  });

  const [slugChecking, setSlugChecking] = useState(false);
  const [slugAvailable, setSlugAvailable] = useState<boolean | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdStore, setCreatedStore] = useState<any | null>(null);

  // Auto-fill user profile if logged in
  useEffect(() => {
    if (session?.user) {
      setFormData((prev) => ({
        ...prev,
        ownerName: prev.ownerName || session.user?.name || '',
        email: prev.email || session.user?.email || '',
      }));
    }
  }, [session]);

  // Auto slugify store name if slug hasn't been manually edited
  const handleStoreNameChange = (name: string) => {
    const autoSlug = name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    setFormData((prev) => ({
      ...prev,
      storeName: name,
      slug: autoSlug,
    }));
  };

  // Real-time slug validation
  useEffect(() => {
    if (!formData.slug || formData.slug.length < 3) {
      setSlugAvailable(null);
      return;
    }

    const timer = setTimeout(async () => {
      setSlugChecking(true);
      try {
        const res = await fetch(`/api/store/check-slug?slug=${encodeURIComponent(formData.slug)}`);
        const data = await res.json();
        setSlugAvailable(data.available);
      } catch {
        setSlugAvailable(null);
      } finally {
        setSlugChecking(false);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [formData.slug]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.storeName || !formData.slug || !formData.whatsappNumber) {
      toast({
        variant: 'destructive',
        title: 'Form Belum Lengkap',
        description: 'Nama Toko, Slug URL, dan Nomor WhatsApp wajib diisi.',
      });
      return;
    }

    if (slugAvailable === false) {
      toast({
        variant: 'destructive',
        title: 'Slug Tidak Tersedia',
        description: 'Silakan ganti URL slug toko Anda dengan yang lain.',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch('/api/store/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Gagal mendaftarkan toko online.');
      }

      setCreatedStore(data.store);
      toast({
        title: '🎉 Selamat! Toko Online Anda Aktif',
        description: `Toko "${data.store.name}" berhasil dibuat dan langsung bisa diakses.`,
      });
    } catch (err: any) {
      toast({
        variant: 'destructive',
        title: 'Pendaftaran Gagal',
        description: err.message || 'Terjadi kesalahan sistem.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (createdStore) {
    return (
      <Card className="border-2 border-primary/40 bg-gradient-to-br from-primary/5 via-background to-primary/10 shadow-2xl overflow-hidden">
        <CardContent className="p-8 md:p-10 text-center space-y-6">
          <div className="flex justify-center">
            <div className="p-4 bg-green-500/10 rounded-full text-green-500 ring-8 ring-green-500/5">
              <CheckCircle2 className="h-16 w-16" />
            </div>
          </div>

          <div className="space-y-2">
            <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Status Toko: AKTIF INSTAN</span>
            </div>
            <h3 className="text-2xl md:text-3xl font-extrabold tracking-tight">
              Toko Online Anda Siap Dipakai!
            </h3>
            <p className="text-muted-foreground text-sm max-w-lg mx-auto">
              Selamat, <strong>{createdStore.name}</strong> resmi menjadi Mitra Toko Online LampungDevTech. Sekarang Anda bisa mulai menjual produk digital tanpa potongan marketplace.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-card border text-left max-w-md mx-auto space-y-3">
            <div className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
              Tautan Toko Online Anda:
            </div>
            <div className="flex items-center justify-between p-2.5 rounded-lg bg-muted/60 text-sm font-mono break-all">
              <span className="text-primary font-semibold">
                /store/{createdStore.slug}
              </span>
              <a
                href={`/id/store/${createdStore.slug}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center text-xs text-muted-foreground hover:text-primary transition-colors ml-2 shrink-0"
              >
                <ExternalLink className="h-4 w-4" />
              </a>
            </div>
            <p className="text-xs text-muted-foreground">
              💡 Salin tautan di atas dan pasang di Bio Instagram, TikTok, atau pesan WhatsApp Anda.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2 max-w-md mx-auto">
            <Button size="lg" className="w-full sm:w-auto h-12 px-6" asChild>
              <Link href="/id/dashboard/mitra-store">
                <Store className="h-4 w-4 mr-2" />
                Buka Dashboard Penjual
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="w-full sm:w-auto h-12 px-6" asChild>
              <Link href={`/id/store/${createdStore.slug}`} target="_blank">
                Lihat Etalase Toko
                <ExternalLink className="h-4 w-4 ml-2" />
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border shadow-xl bg-card/80 backdrop-blur-sm relative overflow-hidden">
      <div className="absolute top-0 right-0 w-48 h-48 bg-primary/10 rounded-full blur-3xl -z-10" />
      <CardHeader className="p-6 md:p-8 border-b bg-muted/20">
        <div className="flex items-center space-x-2 text-primary text-xs font-bold uppercase tracking-wider mb-1">
          <Zap className="h-4 w-4" />
          <span>Formulir Pendaftaran Mitra Toko Online</span>
        </div>
        <CardTitle className="text-2xl md:text-3xl font-extrabold tracking-tight">
          Buka Toko Online Kamu Dalam 2 Menit
        </CardTitle>
        <CardDescription className="text-sm md:text-base text-muted-foreground">
          Khusus member LampungDevTech: Jual produk digital & fisik dengan 0% potongan komisi, checkout WhatsApp otomatis, dan web jualan super ngebut.
        </CardDescription>
      </CardHeader>

      <CardContent className="p-6 md:p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Identitas Member */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="ownerName" className="text-xs font-semibold">
                Nama Pemilik / Member <span className="text-destructive">*</span>
              </Label>
              <Input
                id="ownerName"
                placeholder="cth. Budi Setiawan"
                value={formData.ownerName}
                onChange={(e) => setFormData({ ...formData, ownerName: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-xs font-semibold">
                Email Terdaftar <span className="text-destructive">*</span>
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="email@anda.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>
          </div>

          {/* Nama Toko & Custom Slug */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="storeName" className="text-xs font-semibold">
                Nama Toko / Brand <span className="text-destructive">*</span>
              </Label>
              <Input
                id="storeName"
                placeholder="cth. Lampung Creative Studio"
                value={formData.storeName}
                onChange={(e) => handleStoreNameChange(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="slug" className="text-xs font-semibold">
                  URL Toko (Slug) <span className="text-destructive">*</span>
                </Label>
                {slugChecking && (
                  <span className="text-xs text-muted-foreground flex items-center">
                    <Loader2 className="h-3 w-3 animate-spin mr-1" />
                    Cek slug...
                  </span>
                )}
                {!slugChecking && slugAvailable === true && (
                  <span className="text-xs text-green-600 dark:text-green-400 font-semibold flex items-center">
                    <CheckCircle2 className="h-3 w-3 mr-1" /> Tersedia!
                  </span>
                )}
                {!slugChecking && slugAvailable === false && (
                  <span className="text-xs text-destructive font-semibold flex items-center">
                    <XCircle className="h-3 w-3 mr-1" /> Sudah dipakai
                  </span>
                )}
              </div>
              <div className="flex items-center rounded-md border bg-background focus-within:ring-2 focus-within:ring-primary focus-within:border-primary">
                <span className="px-3 text-xs text-muted-foreground select-none border-r bg-muted/40 py-2.5">
                  lampungdev.tech/store/
                </span>
                <input
                  id="slug"
                  className="flex-1 bg-transparent px-3 py-2 text-sm outline-none font-mono"
                  placeholder="nama-toko-kamu"
                  value={formData.slug}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-'),
                    })
                  }
                  required
                />
              </div>
              <p className="text-[11px] text-muted-foreground">
                Tautan unik toko online Anda untuk dipasang di Bio Instagram atau iklan.
              </p>
            </div>
          </div>

          {/* Kontak WA & Kategori */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="whatsappNumber" className="text-xs font-semibold">
                Nomor WhatsApp Toko <span className="text-destructive">*</span>
              </Label>
              <div className="relative">
                <Smartphone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="whatsappNumber"
                  className="pl-9"
                  placeholder="08123456789 atau 628..."
                  value={formData.whatsappNumber}
                  onChange={(e) => setFormData({ ...formData, whatsappNumber: e.target.value })}
                  required
                />
              </div>
              <p className="text-[11px] text-muted-foreground">
                Notifikasi pesanan pembeli & chat beli instan akan masuk langsung ke WA ini.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="category" className="text-xs font-semibold">
                Kategori Usaha
              </Label>
              <select
                id="category"
                className="w-full h-10 px-3 py-2 text-sm bg-background border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
              >
                <option value="DIGITAL_CREATIVE">Produk Digital, Ebook & Template Canva</option>
                <option value="EDUCATION">Kursus Online, Mentoring & Modul Belajar</option>
                <option value="FREELANCE_SERVICE">Jasa Desain, Copywriting & IT</option>
                <option value="FASHION">Fashion, Pakaian & Aksesori</option>
                <option value="FOOD_BEVERAGE">Kuliner, Makanan & Catering</option>
                <option value="OTHER">Lainnya</option>
              </select>
            </div>
          </div>

          {/* Fokus Jualan Produk Digital */}
          <div className="p-4 rounded-xl border border-primary/20 bg-primary/5 space-y-3">
            <div className="flex items-center space-x-2">
              <div className="p-1.5 bg-primary/10 rounded-lg text-primary">
                <Zap className="h-4 w-4" />
              </div>
              <span className="text-sm font-bold text-foreground">
                Dukungan Penuh Penjualan Produk Digital
              </span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Toko Anda langsung dilengkapi sistem pengiriman otomatis untuk file <strong>PDF E-Book, Template Canva, ZIP Source Code, hingga Link Notion/GDrive</strong>. Pembeli dapat langsung mengakses file setelah transaksi tanpa perlu cek mutasi manual.
            </p>
          </div>

          {/* Bio Singkat Toko */}
          <div className="space-y-2">
            <Label htmlFor="bio" className="text-xs font-semibold">
              Deskripsi Singkat / Bio Toko
            </Label>
            <Textarea
              id="bio"
              rows={2}
              placeholder="Ceritakan singkat produk yang Anda jual (akan tampil di halaman etalase toko)..."
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
            />
          </div>

          <Button
            type="submit"
            size="lg"
            disabled={isSubmitting || slugAvailable === false}
            className="w-full h-12 text-base font-bold shadow-lg shadow-primary/20"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin mr-2" />
                Mendaftarkan Toko Anda...
              </>
            ) : (
              <>
                Buka Toko Online Saya Sekarang 🚀
                <ArrowRight className="h-5 w-5 ml-2" />
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
