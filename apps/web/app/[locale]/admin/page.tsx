'use client';

import { useState, useEffect } from 'react';
import { Link } from '@/i18n/routing';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import {
  ShieldCheck,
  Calendar,
  Users,
  Store,
  QrCode,
  Sparkles,
  Trash2,
  RefreshCw,
  ArrowRight,
  Database,
  CheckCircle2,
  ShoppingBag,
} from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

interface StatsState {
  eventsCount: number;
  registrationsCount: number;
  posApplicationsCount: number;
  storesCount: number;
  productsCount: number;
  ordersCount: number;
  databaseConnected: boolean;
}

export default function AdminDashboardPage() {
  const { toast } = useToast();
  const [stats, setStats] = useState<StatsState | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/admin/demo-data');
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch (err) {
      console.warn('Gagal memuat statistik admin:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const handleCleanDemoData = async () => {
    setActionLoading(true);
    try {
      const res = await fetch('/api/admin/demo-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'clean' }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Gagal membersihkan data demo');

      toast({
        title: 'Data Demo Dibersihkan!',
        description: data.message || 'Semua koleksi data demo telah dikosongkan.',
      });
      await fetchStats();
    } catch (err: any) {
      toast({
        variant: 'destructive',
        title: 'Gagal Membersihkan Data',
        description: err.message,
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleSeedDemoData = async () => {
    setActionLoading(true);
    try {
      const res = await fetch('/api/admin/demo-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'seed' }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Gagal memasukkan data seeder');

      toast({
        title: 'Data Seeder Berhasil Dimuat!',
        description: `${data.message} (${data.counts?.events ?? 0} Events, ${data.counts?.registrations ?? 0} Tiket, ${data.counts?.posApplications ?? 0} Mitra)`,
      });
      await fetchStats();
    } catch (err: any) {
      toast({
        variant: 'destructive',
        title: 'Gagal Memuat Seeder',
        description: err.message,
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleResetDemoData = async () => {
    setActionLoading(true);
    try {
      const res = await fetch('/api/admin/demo-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'reset' }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Gagal mereset data demo');

      toast({
        title: 'Reset Selesai!',
        description: data.message,
      });
      await fetchStats();
    } catch (err: any) {
      toast({
        variant: 'destructive',
        title: 'Gagal Reset Data',
        description: err.message,
      });
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b pb-6">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-primary/10 rounded-2xl text-primary ring-1 ring-primary/20">
              <ShieldCheck className="h-7 w-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-primary bg-primary/10 px-2.5 py-0.5 rounded-full">
                  Super Admin Console
                </span>
                {stats && (
                  <span
                    className={`text-xs px-2.5 py-0.5 rounded-full font-medium flex items-center gap-1 ${
                      stats.databaseConnected
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                        : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                    }`}
                  >
                    <Database className="h-3 w-3" />
                    {stats.databaseConnected ? 'MongoDB Connected' : 'Mock In-Memory Mode'}
                  </span>
                )}
              </div>
              <h1 className="text-3xl font-bold tracking-tight mt-1">Pusat Kendali Super Admin</h1>
              <p className="text-sm text-muted-foreground mt-0.5">
                Kelola data pengujian, verifikasi mitra kafe Lampung, pantau acara komunitas, dan toko online.
              </p>
            </div>
          </div>

          {/* Quick Refresh Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={fetchStats}
            disabled={loading || actionLoading}
            className="flex items-center gap-1.5"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Segarkan Status
          </Button>
        </div>

        {/* Panel Manajemen Data Demo */}
        <Card className="border-2 border-primary/20 bg-linear-to-r from-primary/5 via-background to-muted/20 shadow-sm">
          <CardHeader className="pb-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <CardTitle className="text-xl font-bold flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-primary" />
                  Manajemen Data Demo & Uji Coba Ekosistem
                </CardTitle>
                <CardDescription className="text-sm mt-1">
                  Gunakan tombol di bawah untuk mengosongkan data atau mengisi dataset pengujian realistis (Events lampau & mendatang, tiket absensi QR, proposal kafe, dan toko).
                </CardDescription>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-2.5">
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-destructive border-destructive/30 hover:bg-destructive/10 hover:text-destructive font-medium"
                      disabled={actionLoading}
                    >
                      <Trash2 className="h-4 w-4 mr-1.5" />
                      {actionLoading ? 'Memproses...' : 'Bersihkan Data Demo'}
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Bersihkan Seluruh Data Demo?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Tindakan ini akan mengosongkan data demo pada koleksi <strong>events</strong>, <strong>event_registrations</strong>, <strong>pos_applications</strong>, <strong>stores</strong>, <strong>store_products</strong>, dan <strong>store_orders</strong>.
                        <br />
                        <br />
                        Anda selalu dapat memuat ulang dataset kapan saja dengan tombol <em>"Muat Data Seeder"</em>.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Batal</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleCleanDemoData}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        Ya, Bersihkan Data Demo
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>

                <Button
                  variant="default"
                  size="sm"
                  onClick={handleSeedDemoData}
                  disabled={actionLoading}
                  className="font-medium shadow-sm"
                >
                  <Sparkles className="h-4 w-4 mr-1.5" />
                  Muat Data Seeder (Events & Mitra)
                </Button>

                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleResetDemoData}
                  disabled={actionLoading}
                  className="font-medium"
                >
                  <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
                  Reset & Muat Ulang
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              <div className="p-3 bg-background/80 rounded-xl border">
                <div className="text-xs text-muted-foreground">Events Komunitas</div>
                <div className="text-2xl font-bold mt-1 text-foreground">
                  {loading ? '...' : stats?.eventsCount ?? 0}
                </div>
                <div className="text-[11px] text-muted-foreground mt-0.5">Selesai & Mendatang</div>
              </div>

              <div className="p-3 bg-background/80 rounded-xl border">
                <div className="text-xs text-muted-foreground">Registrasi Tiket</div>
                <div className="text-2xl font-bold mt-1 text-foreground">
                  {loading ? '...' : stats?.registrationsCount ?? 0}
                </div>
                <div className="text-[11px] text-muted-foreground mt-0.5">QR Absensi Check-in</div>
              </div>

              <div className="p-3 bg-background/80 rounded-xl border">
                <div className="text-xs text-muted-foreground">Pengajuan Mitra POS</div>
                <div className="text-2xl font-bold mt-1 text-foreground">
                  {loading ? '...' : stats?.posApplicationsCount ?? 0}
                </div>
                <div className="text-[11px] text-muted-foreground mt-0.5">Kafe Lampung</div>
              </div>

              <div className="p-3 bg-background/80 rounded-xl border">
                <div className="text-xs text-muted-foreground">Toko Digital Mitra</div>
                <div className="text-2xl font-bold mt-1 text-foreground">
                  {loading ? '...' : stats?.storesCount ?? 0}
                </div>
                <div className="text-[11px] text-muted-foreground mt-0.5">Toko Binaan</div>
              </div>

              <div className="p-3 bg-background/80 rounded-xl border">
                <div className="text-xs text-muted-foreground">Katalog Produk</div>
                <div className="text-2xl font-bold mt-1 text-foreground">
                  {loading ? '...' : stats?.productsCount ?? 0}
                </div>
                <div className="text-[11px] text-muted-foreground mt-0.5">Digital & Fisik</div>
              </div>

              <div className="p-3 bg-background/80 rounded-xl border">
                <div className="text-xs text-muted-foreground">Pesanan Wesel Aja</div>
                <div className="text-2xl font-bold mt-1 text-foreground">
                  {loading ? '...' : stats?.ordersCount ?? 0}
                </div>
                <div className="text-[11px] text-muted-foreground mt-0.5">Transaksi QRIS</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Modul & Navigasi Super Admin */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold tracking-tight">Modul Operasional Super Admin</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Card 0: Kelola Founder & Co-Founder */}
            <Card className="hover:border-primary/50 transition-all hover:shadow-md flex flex-col justify-between border-2 border-primary/20 bg-linear-to-b from-primary/5 to-transparent">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="p-2.5 bg-primary/10 rounded-xl text-primary">
                    <Users className="h-6 w-6" />
                  </div>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 font-semibold">
                    WebP Ready
                  </span>
                </div>
                <CardTitle className="text-lg font-bold mt-3">Kelola Founder & Co-Founder</CardTitle>
                <CardDescription className="text-xs leading-relaxed">
                  Kelola data perintis komunitas, unggah foto dengan kompresi & konversi otomatis ke <strong>WebP</strong> untuk ditampilkan di halaman About.
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <Button asChild className="w-full justify-between" variant="default">
                  <Link href="/admin/founders">
                    <span>Buka Kelola Co-Founder</span>
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>

            {/* Card 1: Pengajuan Mitra POS */}
            <Card className="hover:border-primary/50 transition-all hover:shadow-md flex flex-col justify-between">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="p-2.5 bg-primary/10 rounded-xl text-primary">
                    <Store className="h-6 w-6" />
                  </div>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">
                    Aktif
                  </span>
                </div>
                <CardTitle className="text-lg font-bold mt-3">Verifikasi Mitra POS Kafe</CardTitle>
                <CardDescription className="text-xs leading-relaxed">
                  Tinjau proposal pendaftaran calon mitra POS kafe Lampung, cek rincian CapEx & target cup, lalu setujui peranan MITRA_POS.
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <Button asChild className="w-full justify-between" variant="default">
                  <Link href="/admin/mitra">
                    <span>Buka Portal Mitra POS</span>
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>

            {/* Card 2: Monitoring Acara Komunitas */}
            <Card className="hover:border-primary/50 transition-all hover:shadow-md flex flex-col justify-between">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="p-2.5 bg-sky-500/10 rounded-xl text-sky-600">
                    <Calendar className="h-6 w-6" />
                  </div>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-sky-500/10 text-sky-700 dark:text-sky-300 font-medium">
                    Publik & Peserta
                  </span>
                </div>
                <CardTitle className="text-lg font-bold mt-3">Events & Kegiatan Komunitas</CardTitle>
                <CardDescription className="text-xs leading-relaxed">
                  Lihat tampilan katalog acara komunitas LampungDevTech, cek filter acara selesai/terdahulu dan acara mendatang.
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <Button asChild className="w-full justify-between" variant="outline">
                  <Link href="/events">
                    <span>Lihat Halaman Events</span>
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>

            {/* Card 3: Check-in Scanner QR */}
            <Card className="hover:border-primary/50 transition-all hover:shadow-md flex flex-col justify-between">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="p-2.5 bg-purple-500/10 rounded-xl text-purple-600">
                    <QrCode className="h-6 w-6" />
                  </div>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-700 dark:text-purple-300 font-medium">
                    Scanner Absensi
                  </span>
                </div>
                <CardTitle className="text-lg font-bold mt-3">Scanner Check-in Peserta Event</CardTitle>
                <CardDescription className="text-xs leading-relaxed">
                  Uji coba fitur scan tiket QR kehadiran peserta pada hari-H acara. Gunakan QR Token pengujian: <code>TEST-QR-DEV-01</code>.
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <Button asChild className="w-full justify-between" variant="outline">
                  <Link href="/events/check-in">
                    <span>Buka Scanner Check-in</span>
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>

            {/* Card 4: Toko Mitra & Produk Digital */}
            <Card className="hover:border-primary/50 transition-all hover:shadow-md flex flex-col justify-between">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="p-2.5 bg-amber-500/10 rounded-xl text-amber-600">
                    <ShoppingBag className="h-6 w-6" />
                  </div>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-300 font-medium">
                    Merch & Digital
                  </span>
                </div>
                <CardTitle className="text-lg font-bold mt-3">Toko Mitra Digital & Merch</CardTitle>
                <CardDescription className="text-xs leading-relaxed">
                  Tinjau toko binaan UMKM Lampung Digital, produk template Canva, e-book, dan integrasi pembayaran Wesel Aja.
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <Button asChild className="w-full justify-between" variant="outline">
                  <Link href="/store/lampung-digital">
                    <span>Kunjungi Toko Demo</span>
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>

            {/* Card 5: Panduan Uji Coba Data */}
            <Card className="md:col-span-2 hover:border-primary/50 transition-all hover:shadow-md flex flex-col justify-between bg-muted/20">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                  <CardTitle className="text-base font-bold">Panduan Pengujian Data Demo</CardTitle>
                </div>
                <CardDescription className="text-xs space-y-2 mt-2 leading-relaxed text-muted-foreground">
                  <p>
                    1. Klik <strong>"Muat Data Seeder (Events & Mitra)"</strong> untuk mengisi otomatis data event lampau (selesai) & mendatang, registrasi ber-QR token, serta 4 proposal mitra kafe.
                  </p>
                  <p>
                    2. Buka <Link href="/events" className="text-primary hover:underline font-medium">Katalog Events</Link> lalu pilih tab <strong>"Selesai"</strong> untuk menguji riwayat kegiatan yang sudah lalu.
                  </p>
                  <p>
                    3. Buka <Link href="/events/check-in" className="text-primary hover:underline font-medium">Scanner Check-in</Link> dan masukkan token <code>TEST-QR-DEV-01</code> untuk menguji absensi otomatis.
                  </p>
                  <p>
                    4. Klik tombol <strong>"Bersihkan Data Demo"</strong> kapan saja untuk mengosongkan kembali database ke kondisi bersih.
                  </p>
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
