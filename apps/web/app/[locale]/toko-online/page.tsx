import { Metadata } from 'next';
import { StoreOnboardingForm } from '@/components/store/store-onboarding-form';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Sparkles,
  Zap,
  ShoppingBag,
  Download,
  CheckCircle2,
  XCircle,
  ArrowRight,
  Send,
} from 'lucide-react';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Buka Toko Online Instan & Jual Produk Digital 0% Potongan | LampungDevTech',
  description:
    'Platform toko online untuk penjual medsos & kreator digital Lampung. 0% komisi marketplace, kirim file e-book & template Canva otomatis, checkout WhatsApp super cepat.',
};

export default function TokoOnlineLandingPage() {
  return (
    <div className="min-h-screen py-10 md:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-20 md:space-y-28">
        {/* 1. Hero Section */}
        <section className="text-center space-y-6 max-w-4xl mx-auto pt-4">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-primary/10 text-primary text-xs sm:text-sm font-semibold border border-primary/20 animate-pulse">
            <Sparkles className="h-4 w-4" />
            <span>Fitur Baru: Program Mitra Toko Online LampungDevTech</span>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight leading-tight">
            Toko Online-nya Penjual Medsos & <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-primary via-emerald-500 to-teal-500 bg-clip-text text-transparent">
              Kreator Produk Digital
            </span>
          </h1>

          <p className="text-lg sm:text-xl text-muted-foreground leading-relaxed max-w-3xl mx-auto">
            Gak perlu ngerti coding atau bayar jutaan ke developer. Buka web jualan instan dalam 2 menit, jual <strong>E-Book, Template Canva, Modul & Barang Fisik</strong> dengan <strong>0% potongan marketplace</strong> dan sistem pengiriman file otomatis!
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Button size="lg" className="w-full sm:w-auto h-12 px-8 text-base shadow-xl shadow-primary/25 font-bold" asChild>
              <a href="#daftar-mitra">
                Buka Toko Saya Sekarang (Gratis)
                <ArrowRight className="ml-2 h-5 w-5" />
              </a>
            </Button>
            <Button size="lg" variant="outline" className="w-full sm:w-auto h-12 px-8 text-base" asChild>
              <Link href="/id/store/lampung-digital" target="_blank">
                <ShoppingBag className="mr-2 h-5 w-5 text-primary" />
                Lihat Contoh Toko Online Demo
              </Link>
            </Button>
          </div>

          <div className="pt-6 flex flex-wrap items-center justify-center gap-6 text-xs text-muted-foreground">
            <div className="flex items-center">
              <CheckCircle2 className="h-4 w-4 mr-1.5 text-emerald-500 shrink-0" />
              <span>0% Potongan Penjualan</span>
            </div>
            <div className="flex items-center">
              <CheckCircle2 className="h-4 w-4 mr-1.5 text-emerald-500 shrink-0" />
              <span>Kirim File & Akses Canva Otomatis</span>
            </div>
            <div className="flex items-center">
              <CheckCircle2 className="h-4 w-4 mr-1.5 text-emerald-500 shrink-0" />
              <span>Link Siap Iklan Meta / TikTok Ads</span>
            </div>
            <div className="flex items-center">
              <CheckCircle2 className="h-4 w-4 mr-1.5 text-emerald-500 shrink-0" />
              <span>Checkout Langsung via WhatsApp</span>
            </div>
          </div>
        </section>

        {/* 2. Mengapa Banyak yang Pindah dari Marketplace? */}
        <section className="space-y-8">
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <h2 className="text-3xl font-extrabold tracking-tight">
              Kapok Jualan di Marketplace Tradisional?
            </h2>
            <p className="text-muted-foreground text-sm sm:text-base">
              Kalau kamu sudah punya audiens dari Instagram, TikTok, atau WhatsApp, kamu gak butuh potongan besar mereka lagi.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {/* Sisi Marketplace */}
            <Card className="border-destructive/20 bg-destructive/5">
              <CardContent className="p-6 md:p-8 space-y-4">
                <div className="flex items-center space-x-2 text-destructive font-bold text-lg">
                  <XCircle className="h-6 w-6 shrink-0" />
                  <span>Jualan di Marketplace Tradisional</span>
                </div>
                <ul className="space-y-3 text-sm text-muted-foreground">
                  <li className="flex items-start">
                    <span className="mr-2 text-destructive">✕</span>
                    <span>Potongan komisi 10% - 20% per transaksi yang menggerus margin laba.</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2 text-destructive">✕</span>
                    <span>Perang harga brutal dengan ratusan kompetitor di halaman yang sama.</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2 text-destructive">✕</span>
                    <span>Data pembeli disembunyikan, sulit membangun relasi dan repeat order.</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2 text-destructive">✕</span>
                    <span>Sering kesulitan menjual produk digital (Canva/Ebook) karena wajib resi pengiriman fisik.</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Sisi Mitra Toko Online */}
            <Card className="border-emerald-500/30 bg-emerald-500/5 ring-2 ring-emerald-500/10">
              <CardContent className="p-6 md:p-8 space-y-4">
                <div className="flex items-center space-x-2 text-emerald-600 dark:text-emerald-400 font-bold text-lg">
                  <CheckCircle2 className="h-6 w-6 shrink-0" />
                  <span>Mitra Toko Online LampungDevTech</span>
                </div>
                <ul className="space-y-3 text-sm text-foreground">
                  <li className="flex items-start">
                    <span className="mr-2 text-emerald-500 font-bold">✓</span>
                    <span><strong>0% Potongan Penjualan</strong>: 100% pendapatan masuk utuh ke kantong Anda.</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2 text-emerald-500 font-bold">✓</span>
                    <span><strong>Fokus ke Produkmu</strong>: Gak ada iklan toko orang lain di etalase kamu.</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2 text-emerald-500 font-bold">✓</span>
                    <span><strong>Data Pembeli Lengkap</strong>: Terhubung langsung ke WhatsApp pembeli untuk repeat order.</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2 text-emerald-500 font-bold">✓</span>
                    <span><strong>Sistem Produk Digital Cerdas</strong>: Akses link Canva/GDrive/PDF otomatis terbuka setelah bayar.</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* 3. 4 Fitur Kunci Jualan Online */}
        <section className="space-y-12">
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <h2 className="text-3xl font-extrabold tracking-tight">
              Satu Link, Semua Proses Jualan Beres Sendiri
            </h2>
            <p className="text-muted-foreground text-sm sm:text-base">
              Didesain khusus untuk penjual yang mau fokus jualan dan promosi, bukan pusing mikirin teknis web.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Fitur 1: Produk Digital */}
            <Card className="hover:border-primary/40 transition-all hover:shadow-lg">
              <CardContent className="p-6 space-y-4">
                <div className="p-3 bg-primary/10 rounded-xl text-primary w-fit">
                  <Download className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold">Jual Produk Digital Tanpa Ongkir</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Jual template Canva, e-book PDF, modul video, atau link Notion. Pembeli bayar, sistem otomatis menampilkan link akses dan tombol download instan tanpa repot kirim manual satu per satu.
                </p>
              </CardContent>
            </Card>

            {/* Fitur 2: Web Jualan Instan */}
            <Card className="hover:border-primary/40 transition-all hover:shadow-lg">
              <CardContent className="p-6 space-y-4">
                <div className="p-3 bg-primary/10 rounded-xl text-primary w-fit">
                  <Zap className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold">Loading Super Ngebut (&lt; 1 Detik)</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Dibuat dengan Next.js 15 Server Components. Tampilan mobile-first yang sangat ringan. Calon pembeli dari TikTok Ads atau Meta Ads gak kabur karena loading lambat.
                </p>
              </CardContent>
            </Card>

            {/* Fitur 3: Checkout WhatsApp & QRIS */}
            <Card className="hover:border-primary/40 transition-all hover:shadow-lg">
              <CardContent className="p-6 space-y-4">
                <div className="p-3 bg-primary/10 rounded-xl text-primary w-fit">
                  <Send className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold">Checkout Langsung via WhatsApp</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Fitur favorit seller medsos! Pembeli klik beli, pesan otomatis terformat rapi dengan rincian produk, harga, dan identitas pembeli langsung di chat WhatsApp penjual.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* 4. Formulir Pendaftaran Mitra Toko Online (Langsung di Landing Page) */}
        <section id="daftar-mitra" className="scroll-mt-20 max-w-3xl mx-auto space-y-6">
          <div className="text-center space-y-2">
            <h2 className="text-3xl font-extrabold tracking-tight">
              Mulai Toko Online Kamu Sekarang
            </h2>
            <p className="text-muted-foreground text-sm sm:text-base">
              Isi formulir singkat di bawah ini. Toko online kamu akan langsung aktif seketika!
            </p>
          </div>

          <StoreOnboardingForm />
        </section>

        {/* 5. Contoh Yang Paling Cocok Dijual */}
        <section className="space-y-8 bg-muted/30 p-8 md:p-12 rounded-3xl border">
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Cocok Buat Siapa Saja?
            </h2>
            <p className="text-muted-foreground text-sm">
              Semua orang yang punya keahlian atau barang dagangan di Lampung bisa mulai jualan online hari ini.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl bg-card border space-y-2">
              <div className="font-bold text-foreground">🎨 Desainer & Kreator</div>
              <p className="text-xs text-muted-foreground">Template Canva promosi, preset Lightroom, font grafis, dan aset desain.</p>
            </div>
            <div className="p-4 rounded-xl bg-card border space-y-2">
              <div className="font-bold text-foreground">📚 Penulis & Edukator</div>
              <p className="text-xs text-muted-foreground">E-Book panduan, modul coding, tips bisnis lokal, dan kelas webinar.</p>
            </div>
            <div className="p-4 rounded-xl bg-card border space-y-2">
              <div className="font-bold text-foreground">👗 Seller Fashion & Olshop</div>
              <p className="text-xs text-muted-foreground">Baju, hijab, aksesoris, dan produk pre-order dengan katalog link in bio.</p>
            </div>
            <div className="p-4 rounded-xl bg-card border space-y-2">
              <div className="font-bold text-foreground">💼 Freelancer & Jasa</div>
              <p className="text-xs text-muted-foreground">Jasa pembuatan website, konsultasi IT, fotografi, dan e-invoice kilat.</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
