'use client';

import { useState } from 'react';
import { Link } from '@/i18n/routing';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Store, ArrowLeft, CheckCircle2, Loader2, Sparkles, Building2 } from 'lucide-react';

export default function PosRegisterPage() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const [formData, setFormData] = useState({
    ownerName: '',
    email: '',
    phone: '',
    brandName: '',
    concept: 'Coffee Shop & Cafe',
    initialBranchAddress: '',
    estimatedCapex: '50000000',
    targetCupsPerDay: '75',
    notes: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await fetch('/api/pos/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Gagal mengirim formulir pengajuan.');
      }

      setIsSuccess(true);
      toast({
        title: 'Pengajuan Berhasil Terkirim!',
        description: 'Super Admin akan meninjau pendaftaran kafe Anda untuk aktivasi akun Mitra POS.',
      });
    } catch (err: any) {
      toast({
        variant: 'destructive',
        title: 'Pengajuan Gagal',
        description: err.message || 'Terjadi kesalahan sistem.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen py-12 md:py-16">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div>
          <Link
            href="/pos"
            className="inline-flex items-center text-sm text-muted-foreground hover:text-primary mb-4 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-1.5" />
            Kembali ke Informasi POS
          </Link>
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-primary/10 rounded-xl text-primary">
              <Store className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Pendaftaran Mitra POS Kafe</h1>
              <p className="text-muted-foreground text-sm mt-1">
                Dukungan khusus pebisnis awal di Lampung untuk mengelola modal, multi-cabang, dan operasional kasir.
              </p>
            </div>
          </div>
        </div>

        {isSuccess ? (
          <Card className="border-green-500/30 bg-green-500/5">
            <CardContent className="p-8 text-center space-y-6">
              <div className="flex justify-center">
                <div className="p-4 bg-green-500/10 rounded-full text-green-500">
                  <CheckCircle2 className="h-16 w-16" />
                </div>
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-bold text-green-600 dark:text-green-400">
                  Pengajuan Kemitraan Diterima!
                </h3>
                <p className="text-muted-foreground max-w-md mx-auto text-sm leading-relaxed">
                  Terima kasih, <strong>{formData.ownerName}</strong>. Pengajuan brand <strong>{formData.brandName}</strong> telah tercatat dengan status <span className="font-semibold text-amber-600 dark:text-amber-400">PENDING_APPROVAL</span>.
                </p>
                <p className="text-xs text-muted-foreground max-w-md mx-auto pt-2">
                  Super Admin LampungDevTech akan segera meninjau dan mengaktifkan peran <strong>MITRA_POS</strong> pada akun Anda. Anda akan menerima notifikasi email & WhatsApp saat akun diaktifkan.
                </p>
              </div>

              <div className="pt-4 flex justify-center gap-4">
                <Button asChild variant="outline">
                  <Link href="/pos">Halaman Utama POS</Link>
                </Button>
                <Button asChild>
                  <Link href="/pos/dashboard">Cek Portal Owner</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="shadow-lg border-primary/20">
            <CardHeader className="bg-muted/30 pb-6 border-b">
              <CardTitle className="text-xl">Formulir Profil Bisnis Kafe</CardTitle>
              <CardDescription>
                Isi rincian usaha kafe Anda. Setelah disetujui, Anda dapat mengatur cabang utama dan akun kasir.
              </CardDescription>
            </CardHeader>

            <CardContent className="p-6 md:p-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* 1. Informasi Pemilik */}
                <div className="space-y-4">
                  <h4 className="font-semibold text-sm text-primary uppercase tracking-wider flex items-center">
                    <Sparkles className="h-4 w-4 mr-1.5" /> 1. Data Pemilik / Pengelola
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="ownerName">Nama Lengkap Pemilik *</Label>
                      <Input
                        id="ownerName"
                        placeholder="Contoh: Budi Santoso"
                        value={formData.ownerName}
                        onChange={(e) => setFormData({ ...formData, ownerName: e.target.value })}
                        required
                        disabled={isLoading}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="email">Email Aktif (Google Account) *</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="nama@gmail.com"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        required
                        disabled={isLoading}
                      />
                    </div>
                    <div className="space-y-1.5 sm:col-span-2">
                      <Label htmlFor="phone">Nomor WhatsApp Aktif *</Label>
                      <Input
                        id="phone"
                        type="tel"
                        placeholder="08xxxxxxxxxx"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        required
                        disabled={isLoading}
                      />
                    </div>
                  </div>
                </div>

                {/* 2. Informasi Brand & Kafe */}
                <div className="space-y-4 pt-4 border-t">
                  <h4 className="font-semibold text-sm text-primary uppercase tracking-wider flex items-center">
                    <Building2 className="h-4 w-4 mr-1.5" /> 2. Profil Kafe & Cabang Pertama
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="brandName">Nama Brand Kafe *</Label>
                      <Input
                        id="brandName"
                        placeholder="Contoh: Kopi Ruang Temu"
                        value={formData.brandName}
                        onChange={(e) => setFormData({ ...formData, brandName: e.target.value })}
                        required
                        disabled={isLoading}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="concept">Konsep Bisnis *</Label>
                      <select
                        id="concept"
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        value={formData.concept}
                        onChange={(e) => setFormData({ ...formData, concept: e.target.value })}
                        disabled={isLoading}
                      >
                        <option value="Coffee Shop & Cafe">Coffee Shop & Cafe (Dine-in)</option>
                        <option value="Roastery & Brew Bar">Roastery & Manual Brew Bar</option>
                        <option value="Coffee Booth / To-Go">Kiosk / Booth To-Go</option>
                        <option value="Cafe & Eatery">Cafe & Eatery (Makanan & Kopi)</option>
                      </select>
                    </div>
                    <div className="space-y-1.5 sm:col-span-2">
                      <Label htmlFor="initialBranchAddress">Alamat Rencana Cabang Pertama di Lampung *</Label>
                      <Input
                        id="initialBranchAddress"
                        placeholder="Contoh: Jl. Raden Intan No. 45, Enggal, Bandar Lampung"
                        value={formData.initialBranchAddress}
                        onChange={(e) => setFormData({ ...formData, initialBranchAddress: e.target.value })}
                        required
                        disabled={isLoading}
                      />
                    </div>
                  </div>
                </div>

                {/* 3. Estimasi Keuangan Awal */}
                <div className="space-y-4 pt-4 border-t">
                  <h4 className="font-semibold text-sm text-primary uppercase tracking-wider flex items-center">
                    <Store className="h-4 w-4 mr-1.5" /> 3. Estimasi Finansial & Target
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="estimatedCapex">Perkiraan Modal Investasi Awal (Rp)</Label>
                      <Input
                        id="estimatedCapex"
                        type="number"
                        placeholder="50000000"
                        value={formData.estimatedCapex}
                        onChange={(e) => setFormData({ ...formData, estimatedCapex: e.target.value })}
                        disabled={isLoading}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="targetCupsPerDay">Target Penjualan (Cup / Hari)</Label>
                      <Input
                        id="targetCupsPerDay"
                        type="number"
                        placeholder="75"
                        value={formData.targetCupsPerDay}
                        onChange={(e) => setFormData({ ...formData, targetCupsPerDay: e.target.value })}
                        disabled={isLoading}
                      />
                    </div>
                  </div>
                </div>

                <Button type="submit" className="w-full h-11 text-base font-semibold" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Mengirimkan Pengajuan...
                    </>
                  ) : (
                    'Kirim Formulir Pendaftaran Mitra POS'
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
