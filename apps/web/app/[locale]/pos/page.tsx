import { Link } from '@/i18n/routing';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { BepCalculator } from '@/components/pos/bep-calculator';
import {
  Store,
  WifiOff,
  Layers,
  ChefHat,
  ArrowRight,
  TrendingUp,
  KeyRound,
  Printer,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';

export const metadata = {
  title: 'Solusi Cafe POS Multi-Cabang untuk Pebisnis | LampungDevTech',
  description:
    'Sistem POS Kafe lengkap untuk pebisnis awal di Lampung. Manajemen modal awal (CapEx), multi-cabang, kasir offline-first, resep HPP otomatis, dan bluetooth print.',
};

export default function PosLandingPage() {
  return (
    <div className="min-h-screen py-12 md:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16 md:space-y-24">
        {/* 1. Hero Section */}
        <div className="text-center space-y-6 max-w-4xl mx-auto">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-semibold border border-primary/20">
            <Sparkles className="h-4 w-4" />
            <span>Dukungan LampungDevTech untuk UMKM & Pebisnis Kafe Lampung</span>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight">
            Sistem Cafe POS Multi-Cabang, <br className="hidden sm:inline" />
            <span className="text-primary">Dari Modal Awal Hingga Ekspansi</span>
          </h1>

          <p className="text-lg sm:text-xl text-muted-foreground leading-relaxed max-w-3xl mx-auto">
            Solusi kasir dan manajemen kafe terlengkap untuk *early-stage business owner*. Pantau modal investasi awal (CapEx), kalkulasi Break-Even Point (BEP), kontrol resep HPP, dan nikmati kasir tablet yang tetap jalan 100% saat internet mati.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <Button size="lg" className="w-full sm:w-auto h-12 px-8 text-base shadow-lg shadow-primary/20" asChild>
              <Link href="/pos/register">
                Daftar Jadi Mitra POS
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="w-full sm:w-auto h-12 px-8 text-base" asChild>
              <Link href="/pos/dashboard">
                <Store className="mr-2 h-5 w-5" />
                Portal Owner Kafe
              </Link>
            </Button>
          </div>

          <div className="pt-4 flex flex-wrap items-center justify-center gap-6 text-xs text-muted-foreground">
            <div className="flex items-center">
              <CheckCircle2 className="h-4 w-4 mr-1.5 text-green-500" />
              <span>Login Google OAuth untuk Member</span>
            </div>
            <div className="flex items-center">
              <CheckCircle2 className="h-4 w-4 mr-1.5 text-green-500" />
              <span>Multi-Cabang & Cabang Utama</span>
            </div>
            <div className="flex items-center">
              <CheckCircle2 className="h-4 w-4 mr-1.5 text-green-500" />
              <span>Offline-First (SQLite + ULID)</span>
            </div>
            <div className="flex items-center">
              <CheckCircle2 className="h-4 w-4 mr-1.5 text-green-500" />
              <span>Support Printer Bluetooth ESC/POS</span>
            </div>
          </div>
        </div>

        {/* 2. Interactive BEP & ROI Calculator */}
        <section id="kalkulator-bep" className="scroll-mt-24">
          <BepCalculator />
        </section>

        {/* 3. 6 Fitur Utama untuk Pebisnis Kafe */}
        <div className="space-y-12">
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <h2 className="text-3xl font-bold tracking-tight">Semua Fitur yang Dibutuhkan Owner Kafe</h2>
            <p className="text-muted-foreground">
              Didesain berdasarkan permasalahan nyata pengusaha F&B: dari pencatatan modal awal hingga operasional sibuk di jam makan siang dan malam.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Feature 1 */}
            <Card className="hover:border-primary/40 transition-colors">
              <CardContent className="p-6 space-y-4">
                <div className="p-3 bg-primary/10 rounded-xl text-primary w-fit">
                  <TrendingUp className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-semibold">Investasi Awal & Tracker BEP</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Catat modal sewa ruko, mesin espresso, grinder, dan renovasi. Sistem secara otomatis menghitung sisa waktu balik modal dari laba bersih kumulatif harian Anda.
                </p>
              </CardContent>
            </Card>

            {/* Feature 2 */}
            <Card className="hover:border-primary/40 transition-colors">
              <CardContent className="p-6 space-y-4">
                <div className="p-3 bg-primary/10 rounded-xl text-primary w-fit">
                  <Layers className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-semibold">Multi-Cabang & Cabang Utama</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Kelola cabang pusat dan cabang-cabang baru dari satu portal web. Terapkan harga pusat atau sesuaikan ketersediaan menu per cabang dengan mudah.
                </p>
              </CardContent>
            </Card>

            {/* Feature 3 */}
            <Card className="hover:border-primary/40 transition-colors">
              <CardContent className="p-6 space-y-4">
                <div className="p-3 bg-primary/10 rounded-xl text-primary w-fit">
                  <WifiOff className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-semibold">Kasir Tablet Offline-First</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Koneksi internet mati di jam sibuk? Kasir tetap dapat memproses pesanan dan mencetak struk secara offline melalui SQLite dan ULID lokal tanpa tabrakan data.
                </p>
              </CardContent>
            </Card>

            {/* Feature 4 */}
            <Card className="hover:border-primary/40 transition-colors">
              <CardContent className="p-6 space-y-4">
                <div className="p-3 bg-primary/10 rounded-xl text-primary w-fit">
                  <ChefHat className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-semibold">Resep HPP & Stok Otomatis</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Formula Bill of Materials (BOM). Penjualan 1 cup Caramel Latte langsung memotong takaran gram biji kopi, mililiter susu, dan cup secara otomatis.
                </p>
              </CardContent>
            </Card>

            {/* Feature 5 */}
            <Card className="hover:border-primary/40 transition-colors">
              <CardContent className="p-6 space-y-4">
                <div className="p-3 bg-primary/10 rounded-xl text-primary w-fit">
                  <KeyRound className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-semibold">Kasir Cepat: Email + PIN</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Karyawan cukup memasukkan Email dan Kode Unik 6-Digit di tablet kasir bersama, mengisi modal kas laci awal (*cash float*), dan langsung siap melayani.
                </p>
              </CardContent>
            </Card>

            {/* Feature 6 */}
            <Card className="hover:border-primary/40 transition-colors">
              <CardContent className="p-6 space-y-4">
                <div className="p-3 bg-primary/10 rounded-xl text-primary w-fit">
                  <Printer className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-semibold">Printer Bluetooth & Notif Dapur</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Cetak struk thermal ESC/POS 58mm/80mm via Bluetooth. Pesanan baru otomatis muncul di layar Kitchen Display System (KDS) dan mencetak tiket dapur/bar.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* 4. Banner Alur Onboarding */}
        <Card className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border-primary/20">
          <CardContent className="p-8 md:p-12 space-y-6">
            <div className="max-w-3xl space-y-3">
              <h3 className="text-2xl md:text-3xl font-bold">Bagaimana Cara Memulai?</h3>
              <p className="text-muted-foreground leading-relaxed">
                1. Masuk ke platform dengan akun Google Anda $\rightarrow$ 2. Isi formulir pendaftaran Mitra POS $\rightarrow$ 3. Super Admin menyetujui $\rightarrow$ 4. Atur modal awal dan cabang di Owner Portal $\rightarrow$ 5. Buka aplikasi kasir di tablet kasir Anda!
              </p>
            </div>
            <div className="flex flex-wrap gap-4">
              <Button size="lg" asChild>
                <Link href="/pos/register">
                  Daftar Kemitraan Sekarang
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/contact">
                  Konsultasi Bisnis Gratis
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
