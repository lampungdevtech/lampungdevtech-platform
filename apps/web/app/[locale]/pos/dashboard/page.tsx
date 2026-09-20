'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Wallet,
  TrendingUp,
  Package,
  Users,
  Tag,
  Wrench,
  Layers,
  Building2,
  Plus,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { usePosOwnerStore } from '@/components/pos-owner/use-pos-owner-store';
import { HeaderContextBar } from '@/components/pos-owner/header-context-bar';
import { TabFinancial } from '@/components/pos-owner/tab-financial';
import { TabSalesAnalytics } from '@/components/pos-owner/tab-sales-analytics';
import { TabInventory } from '@/components/pos-owner/tab-inventory';
import { TabStaff } from '@/components/pos-owner/tab-staff';
import { TabMarketingCrm } from '@/components/pos-owner/tab-marketing-crm';
import { TabOperationsSop } from '@/components/pos-owner/tab-operations-sop';

export default function PosDashboardPage() {
  const store = usePosOwnerStore();
  const [selectedBranch, setSelectedBranch] = useState('ALL');
  const [activeTab, setActiveTab] = useState<
    'financial' | 'sales' | 'inventory' | 'staff' | 'marketing' | 'operations' | 'bep_branches'
  >('financial');

  // Cabang List
  const [branches, setBranches] = useState([
    {
      id: '01-MAIN',
      name: 'Cabang 01: Enggal (Pusat)',
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

  // Modal Investasi Awal (CapEx & BEP)
  const totalCapex = 82000000;
  const realizedNetProfit = 28700000;
  const bepPercentage = (realizedNetProfit / totalCapex) * 100;
  const remainingMonthsEst = 7.4;

  const handleSetMainBranch = (id: string) => {
    setBranches((prev) =>
      prev.map((b) => ({
        ...b,
        isMain: b.id === id,
      }))
    );
  };

  return (
    <div className="min-h-screen py-8 bg-muted/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* TOP CONTEXT BAR: Live Indonesian Clock (WIB), Weather & Cloud Cover (Open-Meteo), Branch Selector */}
        <HeaderContextBar
          selectedBranch={selectedBranch}
          onBranchChange={setSelectedBranch}
          branches={branches}
        />

        {/* NAVIGATION TABS */}
        <div className="flex flex-wrap items-center gap-2 border-b pb-3">
          <Button
            variant={activeTab === 'financial' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveTab('financial')}
            className="h-9 text-xs font-bold"
          >
            <Wallet className="h-4 w-4 mr-1.5" />
            Keuangan & Saldo Kas
          </Button>

          <Button
            variant={activeTab === 'sales' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveTab('sales')}
            className="h-9 text-xs font-bold"
          >
            <TrendingUp className="h-4 w-4 mr-1.5" />
            Analisis Penjualan & Grafik
          </Button>

          <Button
            variant={activeTab === 'inventory' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveTab('inventory')}
            className="h-9 text-xs font-bold relative"
          >
            <Package className="h-4 w-4 mr-1.5" />
            Stok & Purchasing
            {store.materials.some((m) => m.currentStock <= m.minStock) && (
              <span className="ml-1.5 w-2 h-2 rounded-full bg-red-500 animate-ping" />
            )}
          </Button>

          <Button
            variant={activeTab === 'staff' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveTab('staff')}
            className="h-9 text-xs font-bold"
          >
            <Users className="h-4 w-4 mr-1.5" />
            Staf, Jadwal 7 Hari & KPI
          </Button>

          <Button
            variant={activeTab === 'marketing' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveTab('marketing')}
            className="h-9 text-xs font-bold"
          >
            <Tag className="h-4 w-4 mr-1.5" />
            Member & Promo Web
          </Button>

          <Button
            variant={activeTab === 'operations' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveTab('operations')}
            className="h-9 text-xs font-bold"
          >
            <Wrench className="h-4 w-4 mr-1.5" />
            Parkir, Aset, SOP & Audit Log
          </Button>

          <Button
            variant={activeTab === 'bep_branches' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveTab('bep_branches')}
            className="h-9 text-xs font-bold"
          >
            <Layers className="h-4 w-4 mr-1.5" />
            Cabang & BEP CapEx
          </Button>
        </div>

        {/* TAB 1: KEUANGAN & SALDO KAS */}
        {activeTab === 'financial' && (
          <TabFinancial store={store} selectedBranch={selectedBranch} />
        )}

        {/* TAB 2: ANALISIS PENJUALAN & GRAFIK */}
        {activeTab === 'sales' && (
          <TabSalesAnalytics selectedBranch={selectedBranch} />
        )}

        {/* TAB 3: STOK & PURCHASING */}
        {activeTab === 'inventory' && (
          <TabInventory store={store} />
        )}

        {/* TAB 4: STAF, JADWAL 7 HARI & KPI */}
        {activeTab === 'staff' && (
          <TabStaff store={store} />
        )}

        {/* TAB 5: MEMBER & PROMO WEB */}
        {activeTab === 'marketing' && (
          <TabMarketingCrm store={store} />
        )}

        {/* TAB 6: OPERASIONAL, ASET, SOP & AUDIT LOG */}
        {activeTab === 'operations' && (
          <TabOperationsSop store={store} />
        )}

        {/* TAB 7: CABANG & BEP CAPEX TRACKER */}
        {activeTab === 'bep_branches' && (
          <div className="space-y-6">
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
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs">
                  <div className="p-3 bg-muted/40 rounded-xl">
                    <span className="text-muted-foreground">Total Investasi CapEx:</span>
                    <p className="text-base font-bold">Rp {totalCapex.toLocaleString('id-ID')}</p>
                  </div>
                  <div className="p-3 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
                    <span className="text-emerald-700 dark:text-emerald-400 font-medium">Laba Bersih Terkumpul:</span>
                    <p className="text-base font-bold text-emerald-700 dark:text-emerald-400">
                      Rp {realizedNetProfit.toLocaleString('id-ID')}
                    </p>
                  </div>
                  <div className="p-3 bg-primary/10 rounded-xl border border-primary/20">
                    <span className="text-primary font-medium">Estimasi Waktu BEP:</span>
                    <p className="text-base font-bold text-primary">{remainingMonthsEst} Bulan lagi</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Multi-Cabang Cards */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-bold flex items-center gap-2">
                    <Building2 className="w-5 h-5 text-primary" />
                    Manajemen Multi-Cabang Outlet
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Atur cabang utama sebagai acuan harga pusat dan resep standar.
                  </p>
                </div>
                <Button
                  size="sm"
                  onClick={() => {
                    const name = prompt('Nama cabang baru:', 'Cabang 03: Kedaton');
                    const addr = prompt('Alamat cabang:', 'Jl. ZA Pagar Alam, Bandar Lampung');
                    if (name) {
                      setBranches((prev) => [
                        ...prev,
                        {
                          id: `0${prev.length + 1}-NEW`,
                          name,
                          address: addr || 'Alamat Cabang',
                          isMain: false,
                          tablesCount: 10,
                          cashiersCount: 1,
                          todayRevenue: 0,
                        },
                      ]);
                    }
                  }}
                  className="h-9 text-xs"
                >
                  <Plus className="h-4 w-4 mr-1.5" /> Tambah Cabang
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {branches.map((b) => (
                  <Card key={b.id} className={b.isMain ? 'border-primary/40 shadow-sm' : ''}>
                    <CardHeader className="pb-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-base font-bold flex items-center gap-2">
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
                    <CardContent className="space-y-3 text-xs">
                      <div className="grid grid-cols-3 gap-2 bg-muted/40 p-2.5 rounded-xl text-center">
                        <div>
                          <span className="text-muted-foreground block text-[10px] uppercase font-bold">Meja</span>
                          <span className="font-extrabold text-sm">{b.tablesCount}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground block text-[10px] uppercase font-bold">Kasir</span>
                          <span className="font-extrabold text-sm">{b.cashiersCount}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground block text-[10px] uppercase font-bold">Omset Hari Ini</span>
                          <span className="font-bold text-sm text-emerald-600">
                            Rp {(b.todayRevenue / 1000).toFixed(0)}k
                          </span>
                        </div>
                      </div>

                      {!b.isMain && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full text-xs h-8"
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
          </div>
        )}
      </div>
    </div>
  );
}
