'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import {
  Store,
  TrendingUp,
  Layers,
  ChefHat,
  BarChart3,
  DollarSign,
  KeyRound,
  CheckCircle2,
  AlertTriangle,
  Plus,
  Copy,
  Clock,
  Tablet,
  UtensilsCrossed,
} from 'lucide-react';

export default function PosDashboardPage() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<'overview' | 'branches' | 'investment' | 'recipes' | 'staff' | 'reports'>('overview');
  const [selectedBranch, setSelectedBranch] = useState('01-MAIN');

  // State Cabang
  const [branches, setBranches] = useState([
    {
      id: '01-MAIN',
      name: 'Cabang 01: Enggal (Cabang Utama)',
      address: 'Jl. Raden Intan No. 45, Enggal, Bandar Lampung',
      isMain: true,
      tablesCount: 14,
      cashiersCount: 2,
      todayRevenue: 1850000,
    },
    {
      id: '02-KEMILING',
      name: 'Cabang 02: Kemiling Outlet',
      address: 'Jl. Imam Bonjol No. 88, Kemiling, Bandar Lampung',
      isMain: false,
      tablesCount: 8,
      cashiersCount: 1,
      todayRevenue: 980000,
    },
  ]);

  // State Karyawan & PIN Kasir
  const [staffList, setStaffList] = useState([
    {
      id: 'STF-01',
      name: 'Ahmad Fauzi',
      email: 'ahmad.kasir@kopitemu.com',
      branchId: '01-MAIN',
      branchName: 'Enggal (Cabang Utama)',
      role: 'CASHIER',
      pin: '847291',
      ordersCount: 54,
      totalRevenue: 1188000,
      avgSpeedMin: 1.8,
      lastCashVariance: 0,
    },
    {
      id: 'STF-02',
      name: 'Budi Santoso',
      email: 'budi.barista@kopitemu.com',
      branchId: '01-MAIN',
      branchName: 'Enggal (Cabang Utama)',
      role: 'BARISTA',
      pin: '592014',
      ordersCount: 30,
      totalRevenue: 662000,
      avgSpeedMin: 2.1,
      lastCashVariance: -2000,
    },
    {
      id: 'STF-03',
      name: 'Citra Dewi',
      email: 'citra.kemiling@kopitemu.com',
      branchId: '02-KEMILING',
      branchName: 'Kemiling Outlet',
      role: 'CASHIER',
      pin: '338192',
      ordersCount: 42,
      totalRevenue: 980000,
      avgSpeedMin: 1.9,
      lastCashVariance: 0,
    },
  ]);

  // Form Tambah Karyawan Baru
  const [newStaff, setNewStaff] = useState({
    name: '',
    email: '',
    branchId: '01-MAIN',
    role: 'CASHIER',
  });

  // Modal Investasi Awal (CapEx)
  const totalCapex = 82000000;
  const realizedNetProfit = 28700000;
  const bepPercentage = (realizedNetProfit / totalCapex) * 100;
  const remainingMonthsEst = 7.4;

  const handleCreateStaff = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStaff.name || !newStaff.email) return;

    // Generate PIN 6-digit acak
    const generatedPin = Math.floor(100000 + Math.random() * 900000).toString();
    const branch = branches.find((b) => b.id === newStaff.branchId);

    const created = {
      id: `STF-${Date.now().toString().slice(-4)}`,
      name: newStaff.name,
      email: newStaff.email,
      branchId: newStaff.branchId,
      branchName: branch?.name || 'Cabang',
      role: newStaff.role,
      pin: generatedPin,
      ordersCount: 0,
      totalRevenue: 0,
      avgSpeedMin: 0,
      lastCashVariance: 0,
    };

    setStaffList([...staffList, created]);
    setNewStaff({ name: '', email: '', branchId: '01-MAIN', role: 'CASHIER' });

    toast({
      title: 'Karyawan Berhasil Ditambahkan!',
      description: `PIN Kasir ${created.name}: ${generatedPin}. Berikan PIN ini untuk login kasir di tablet.`,
    });
  };

  const handleCopyPin = (pin: string, name: string) => {
    navigator.clipboard.writeText(pin);
    toast({
      title: 'PIN Disalin',
      description: `Kode PIN ${name} (${pin}) tersalin ke clipboard.`,
    });
  };

  const handleSetMainBranch = (id: string) => {
    setBranches((prev) =>
      prev.map((b) => ({
        ...b,
        isMain: b.id === id,
      }))
    );
    toast({
      title: 'Cabang Utama Diperbarui',
      description: 'Cabang ini sekarang menjadi acuan harga pusat dan menu standar.',
    });
  };

  return (
    <div className="min-h-screen py-10 bg-muted/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Top Header */}
        <div className="bg-card p-6 rounded-2xl border shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center space-x-3.5">
            <div className="p-3 bg-primary/10 rounded-2xl text-primary">
              <Store className="h-7 w-7" />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-2xl font-bold tracking-tight">Kopi Ruang Temu</h1>
                <span className="text-xs bg-primary/15 text-primary px-2.5 py-0.5 rounded-full font-semibold">
                  Mitra POS Aktif
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                Owner Business Portal • Akses Pemilik Usaha Kafe
              </p>
            </div>
          </div>

          {/* Branch Switcher & Quick Launch Actions */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <Label htmlFor="branchSelect" className="text-xs text-muted-foreground whitespace-nowrap">
                Cabang:
              </Label>
              <select
                id="branchSelect"
                className="h-9 rounded-lg border border-input bg-background px-3 py-1 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-primary"
                value={selectedBranch}
                onChange={(e) => setSelectedBranch(e.target.value)}
              >
                {branches.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name} {b.isMain ? '★' : ''}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2">
              <Link href="/pos/terminal" target="_blank">
                <Button size="sm" className="h-9 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm">
                  <Tablet className="h-3.5 w-3.5 mr-1.5" />
                  Terminal Kasir POS
                </Button>
              </Link>
              <Link href="/pos/kds" target="_blank">
                <Button size="sm" variant="outline" className="h-9 text-xs font-semibold border-amber-500/40 text-amber-600 dark:text-amber-400 hover:bg-amber-500/10">
                  <UtensilsCrossed className="h-3.5 w-3.5 mr-1.5" />
                  KDS Dapur
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex flex-wrap gap-2 border-b pb-4">
          <Button
            variant={activeTab === 'overview' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveTab('overview')}
          >
            <TrendingUp className="h-4 w-4 mr-2" /> Ikhtisar & BEP
          </Button>
          <Button
            variant={activeTab === 'branches' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveTab('branches')}
          >
            <Layers className="h-4 w-4 mr-2" /> Multi-Cabang ({branches.length})
          </Button>
          <Button
            variant={activeTab === 'investment' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveTab('investment')}
          >
            <DollarSign className="h-4 w-4 mr-2" /> Modal Awal (CapEx)
          </Button>
          <Button
            variant={activeTab === 'recipes' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveTab('recipes')}
          >
            <ChefHat className="h-4 w-4 mr-2" /> Resep & HPP
          </Button>
          <Button
            variant={activeTab === 'staff' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveTab('staff')}
          >
            <KeyRound className="h-4 w-4 mr-2" /> Karyawan & PIN ({staffList.length})
          </Button>
          <Button
            variant={activeTab === 'reports' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveTab('reports')}
          >
            <BarChart3 className="h-4 w-4 mr-2" /> Laporan & Kinerja
          </Button>
        </div>

        {/* TAB 1: OVERVIEW & BEP TRACKER */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Quick Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-5 space-y-1">
                  <span className="text-xs text-muted-foreground uppercase font-semibold">Omset Hari Ini</span>
                  <p className="text-2xl font-bold">Rp 2.830.000</p>
                  <p className="text-xs text-green-600 dark:text-green-400 font-medium">84 Cup terjual (2 Cabang)</p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-5 space-y-1">
                  <span className="text-xs text-muted-foreground uppercase font-semibold">Total Modal Awal (CapEx)</span>
                  <p className="text-2xl font-bold">Rp {totalCapex.toLocaleString('id-ID')}</p>
                  <p className="text-xs text-muted-foreground">Sewa, mesin, interior, float</p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-5 space-y-1">
                  <span className="text-xs text-muted-foreground uppercase font-semibold">Akumulasi Laba Bersih</span>
                  <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                    Rp {realizedNetProfit.toLocaleString('id-ID')}
                  </p>
                  <p className="text-xs text-muted-foreground">Realisasi per hari ini</p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-5 space-y-1">
                  <span className="text-xs text-muted-foreground uppercase font-semibold">Estimasi Balik Modal (BEP)</span>
                  <p className="text-2xl font-bold text-primary">{remainingMonthsEst} Bulan</p>
                  <p className="text-xs text-muted-foreground">Tersisa ~220 hari lagi</p>
                </CardContent>
              </Card>
            </div>

            {/* BEP Progress Bar Card */}
            <Card className="border-primary/20">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Progress Balik Modal (BEP Tracker)</CardTitle>
                <CardDescription>
                  Laba bersih kumulatif terhadap total investasi awal kafe Anda.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between text-sm font-semibold">
                  <span>Realisasi: Rp {realizedNetProfit.toLocaleString('id-ID')} ({bepPercentage.toFixed(1)}%)</span>
                  <span>Target BEP: Rp {totalCapex.toLocaleString('id-ID')} (100%)</span>
                </div>
                <div className="w-full bg-muted rounded-full h-4 overflow-hidden border">
                  <div
                    className="bg-primary h-4 rounded-full transition-all duration-500"
                    style={{ width: `${bepPercentage}%` }}
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  💡 Setiap transaksi yang diselesaikan oleh kasir di tablet secara otomatis memperbarui kalkulasi laba bersih harian dikurangi HPP bahan baku.
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* TAB 2: MULTI-CABANG */}
        {activeTab === 'branches' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-xl font-bold">Manajemen Multi-Cabang</h3>
                <p className="text-sm text-muted-foreground">Atur cabang utama sebagai acuan harga dan resep pusat.</p>
              </div>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-1.5" /> Tambah Cabang
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {branches.map((b) => (
                <Card key={b.id} className={b.isMain ? 'border-primary/40 shadow-sm' : ''}>
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg font-bold flex items-center gap-2">
                          {b.name}
                        </CardTitle>
                        <CardDescription className="text-xs mt-1">{b.address}</CardDescription>
                      </div>
                      {b.isMain && (
                        <span className="text-xs bg-primary text-primary-foreground px-2.5 py-0.5 rounded-full font-bold">
                          CABANG UTAMA
                        </span>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4 text-sm">
                    <div className="grid grid-cols-2 gap-3 text-xs bg-muted/40 p-3 rounded-xl">
                      <div>
                        <span className="text-muted-foreground">Jumlah Meja:</span>
                        <p className="font-semibold text-sm">{b.tablesCount} Meja</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Staf Kasir:</span>
                        <p className="font-semibold text-sm">{b.cashiersCount} Kasir</p>
                      </div>
                      <div className="col-span-2 pt-1 border-t">
                        <span className="text-muted-foreground">Omset Hari Ini:</span>
                        <p className="font-bold text-sm text-green-600 dark:text-green-400">
                          Rp {b.todayRevenue.toLocaleString('id-ID')}
                        </p>
                      </div>
                    </div>

                    {!b.isMain && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full text-xs"
                        onClick={() => handleSetMainBranch(b.id)}
                      >
                        Jadikan Cabang Utama
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: MODAL INVESTASI AWAL (CAPEX) */}
        {activeTab === 'investment' && (
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Rincian Modal Investasi Awal (CapEx)</CardTitle>
              <CardDescription>
                Pencatatan modal yang dikeluarkan sebelum kafe beroperasi untuk mengukur waktu Break-Even Point (BEP).
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="divide-y text-sm">
                <div className="py-3 flex justify-between items-center">
                  <div>
                    <p className="font-semibold">Sewa Ruko Enggal (1 Tahun)</p>
                    <span className="text-xs text-muted-foreground">Tempat & Gedung</span>
                  </div>
                  <span className="font-bold">Rp 36.000.000</span>
                </div>
                <div className="py-3 flex justify-between items-center">
                  <div>
                    <p className="font-semibold">Mesin Espresso 2 Group + Grinder Komersial</p>
                    <span className="text-xs text-muted-foreground">Peralatan Bar</span>
                  </div>
                  <span className="font-bold">Rp 25.000.000</span>
                </div>
                <div className="py-3 flex justify-between items-center">
                  <div>
                    <p className="font-semibold">Renovasi Interior, Bar Slow-Bar, & Meja Kursi</p>
                    <span className="text-xs text-muted-foreground">Interior & Eksterior</span>
                  </div>
                  <span className="font-bold">Rp 20.000.000</span>
                </div>
                <div className="py-3 flex justify-between items-center">
                  <div>
                    <p className="font-semibold">Uang Kas Laci Awal (Cash Float Pertama)</p>
                    <span className="text-xs text-muted-foreground">Kasir Pembukaan</span>
                  </div>
                  <span className="font-bold">Rp 1.000.000</span>
                </div>
                <div className="py-4 flex justify-between items-center text-base font-bold text-primary">
                  <span>TOTAL MODAL AWAL (CAPEX):</span>
                  <span>Rp {totalCapex.toLocaleString('id-ID')}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* TAB 4: RESEP & HPP (BOM) */}
        {activeTab === 'recipes' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-bold">Resep Menu & HPP (Bill of Materials)</h3>
              <p className="text-sm text-muted-foreground">
                Setiap transaksi kasir otomatis memotong stok bahan baku ini di backend via RabbitMQ.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Recipe Card 1 */}
              <Card>
                <CardHeader className="pb-3 border-b">
                  <CardTitle className="text-base font-bold">Es Kopi Susu Gula Aren</CardTitle>
                  <CardDescription className="text-xs">Harga Jual: Rp 22.000</CardDescription>
                </CardHeader>
                <CardContent className="p-5 space-y-3 text-xs">
                  <span className="font-semibold text-muted-foreground uppercase">Formula Takaran:</span>
                  <ul className="space-y-1.5 text-muted-foreground">
                    <li>• Biji Kopi Robusta Lampung: <strong>18 gram</strong> (Rp 4.500)</li>
                    <li>• Fresh Milk Pasteurisasi: <strong>120 ml</strong> (Rp 2.160)</li>
                    <li>• Sirup Aren Organik: <strong>20 ml</strong> (Rp 1.200)</li>
                    <li>• Cup + Lid + Straw: <strong>1 Set</strong> (Rp 850)</li>
                  </ul>
                  <div className="pt-2 border-t flex justify-between font-bold text-sm">
                    <span>Total HPP / Cup:</span>
                    <span className="text-foreground">Rp 8.710</span>
                  </div>
                  <div className="flex justify-between text-xs text-green-600 dark:text-green-400 font-semibold">
                    <span>Gross Margin:</span>
                    <span>Rp 13.290 (60.4%)</span>
                  </div>
                </CardContent>
              </Card>

              {/* Recipe Card 2 */}
              <Card>
                <CardHeader className="pb-3 border-b">
                  <CardTitle className="text-base font-bold">Iced Americano</CardTitle>
                  <CardDescription className="text-xs">Harga Jual: Rp 18.000</CardDescription>
                </CardHeader>
                <CardContent className="p-5 space-y-3 text-xs">
                  <span className="font-semibold text-muted-foreground uppercase">Formula Takaran:</span>
                  <ul className="space-y-1.5 text-muted-foreground">
                    <li>• Biji Kopi Blend Lampung: <strong>18 gram</strong> (Rp 4.500)</li>
                    <li>• Air Mineral Filter: <strong>200 ml</strong> (Rp 300)</li>
                    <li>• Cup + Lid + Straw: <strong>1 Set</strong> (Rp 850)</li>
                  </ul>
                  <div className="pt-2 border-t flex justify-between font-bold text-sm">
                    <span>Total HPP / Cup:</span>
                    <span className="text-foreground">Rp 5.650</span>
                  </div>
                  <div className="flex justify-between text-xs text-green-600 dark:text-green-400 font-semibold">
                    <span>Gross Margin:</span>
                    <span>Rp 12.350 (68.6%)</span>
                  </div>
                </CardContent>
              </Card>

              {/* Recipe Card 3 */}
              <Card>
                <CardHeader className="pb-3 border-b">
                  <CardTitle className="text-base font-bold">Hot Cafe Latte</CardTitle>
                  <CardDescription className="text-xs">Harga Jual: Rp 25.000</CardDescription>
                </CardHeader>
                <CardContent className="p-5 space-y-3 text-xs">
                  <span className="font-semibold text-muted-foreground uppercase">Formula Takaran:</span>
                  <ul className="space-y-1.5 text-muted-foreground">
                    <li>• Biji Kopi Arabika: <strong>18 gram</strong> (Rp 5.400)</li>
                    <li>• Steamed Fresh Milk: <strong>180 ml</strong> (Rp 3.240)</li>
                    <li>• Keramik Cup (Depresiasi): <strong>-</strong> (Rp 200)</li>
                  </ul>
                  <div className="pt-2 border-t flex justify-between font-bold text-sm">
                    <span>Total HPP / Cup:</span>
                    <span className="text-foreground">Rp 8.840</span>
                  </div>
                  <div className="flex justify-between text-xs text-green-600 dark:text-green-400 font-semibold">
                    <span>Gross Margin:</span>
                    <span>Rp 16.160 (64.6%)</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* TAB 5: KARYAWAN & GENERATOR PIN KASIR */}
        {activeTab === 'staff' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Form Tambah Karyawan */}
            <div className="lg:col-span-5">
              <Card>
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg">Tambah Karyawan Baru</CardTitle>
                  <CardDescription className="text-xs">
                    Sistem akan otomatis menghasilkan <strong>Kode Unik / PIN 6-Digit</strong> untuk kasir masuk ke aplikasi tablet.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleCreateStaff} className="space-y-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="staffName" className="text-xs">Nama Karyawan *</Label>
                      <Input
                        id="staffName"
                        placeholder="Contoh: Doni Kasir"
                        value={newStaff.name}
                        onChange={(e) => setNewStaff({ ...newStaff, name: e.target.value })}
                        required
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="staffEmail" className="text-xs">Email Staf *</Label>
                      <Input
                        id="staffEmail"
                        type="email"
                        placeholder="doni@kopitemu.com"
                        value={newStaff.email}
                        onChange={(e) => setNewStaff({ ...newStaff, email: e.target.value })}
                        required
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="staffBranch" className="text-xs">Penempatan Cabang</Label>
                      <select
                        id="staffBranch"
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-xs"
                        value={newStaff.branchId}
                        onChange={(e) => setNewStaff({ ...newStaff, branchId: e.target.value })}
                      >
                        {branches.map((b) => (
                          <option key={b.id} value={b.id}>
                            {b.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="staffRole" className="text-xs">Peran / Posisi</Label>
                      <select
                        id="staffRole"
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-xs"
                        value={newStaff.role}
                        onChange={(e) => setNewStaff({ ...newStaff, role: e.target.value })}
                      >
                        <option value="CASHIER">Kasir (Cashier)</option>
                        <option value="BARISTA">Barista</option>
                        <option value="KITCHEN">Dapur (Kitchen)</option>
                        <option value="BRANCH_MANAGER">Branch Manager</option>
                      </select>
                    </div>

                    <Button type="submit" className="w-full text-xs font-semibold">
                      <KeyRound className="h-4 w-4 mr-1.5" />
                      Buat Akun & Generate PIN Kasir
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>

            {/* Daftar Karyawan & PIN */}
            <div className="lg:col-span-7 space-y-4">
              <h4 className="font-semibold text-base">Daftar Akun Kasir & Staf</h4>
              <div className="space-y-3">
                {staffList.map((s) => (
                  <Card key={s.id} className="border hover:border-primary/30 transition-colors">
                    <CardContent className="p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <h5 className="font-bold text-base">{s.name}</h5>
                          <span className="text-xs bg-muted px-2 py-0.5 rounded font-medium">
                            {s.role}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground">{s.email} • {s.branchName}</p>
                      </div>

                      {/* Box Kode PIN 6-Digit */}
                      <div className="flex items-center gap-2 bg-primary/10 border border-primary/20 px-3.5 py-2 rounded-xl">
                        <div>
                          <span className="text-[10px] text-muted-foreground uppercase font-bold block">PIN KASIR</span>
                          <span className="font-mono text-base font-extrabold tracking-widest text-primary">
                            {s.pin}
                          </span>
                        </div>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 ml-1"
                          onClick={() => handleCopyPin(s.pin, s.name)}
                          title="Salin PIN"
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 6: LAPORAN & PERFORMA KARYAWAN */}
        {activeTab === 'reports' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-bold">Laporan Penjualan & Kinerja Karyawan</h3>
              <p className="text-sm text-muted-foreground">
                Evaluasi omset harian per kasir, kecepatan pelayanan, serta ketelitian kasir (selisih uang kas saat tutup shift).
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left border rounded-xl overflow-hidden bg-card">
                <thead className="bg-muted text-xs uppercase font-semibold text-muted-foreground">
                  <tr>
                    <th className="p-4">Nama Karyawan</th>
                    <th className="p-4">Cabang</th>
                    <th className="p-4">Transaksi Diproses</th>
                    <th className="p-4">Total Rupiah</th>
                    <th className="p-4">Kecepatan Layanan</th>
                    <th className="p-4">Selisih Kas Tutup Shift</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {staffList.map((s) => (
                    <tr key={s.id} className="hover:bg-muted/30">
                      <td className="p-4 font-semibold">{s.name}</td>
                      <td className="p-4 text-xs text-muted-foreground">{s.branchName}</td>
                      <td className="p-4">{s.ordersCount} Pesanan</td>
                      <td className="p-4 font-bold text-foreground">Rp {s.totalRevenue.toLocaleString('id-ID')}</td>
                      <td className="p-4 text-xs">
                        <span className="inline-flex items-center">
                          <Clock className="h-3.5 w-3.5 mr-1 text-primary" />
                          {s.avgSpeedMin} Menit / Order
                        </span>
                      </td>
                      <td className="p-4">
                        {s.lastCashVariance === 0 ? (
                          <span className="inline-flex items-center text-xs font-semibold text-green-600 dark:text-green-400">
                            <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
                            Cocok (Rp 0)
                          </span>
                        ) : (
                          <span className="inline-flex items-center text-xs font-semibold text-red-600 dark:text-red-400">
                            <AlertTriangle className="h-3.5 w-3.5 mr-1" />
                            Defisit Rp {Math.abs(s.lastCashVariance).toLocaleString('id-ID')}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
