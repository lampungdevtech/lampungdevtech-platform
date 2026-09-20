'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  TrendingUp,
  DollarSign,
  ShoppingBag,
  Award,
  Calendar,
  ArrowUpRight,
  Flame,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

interface TabSalesAnalyticsProps {
  selectedBranch: string;
}

// Data Tren Penjualan Tahunan (Jan - Des 2026)
const ANNUAL_SALES_DATA = [
  { month: 'Jan', revenue: 62000000, profit: 21000000, cost: 41000000 },
  { month: 'Feb', revenue: 58000000, profit: 19500000, cost: 38500000 },
  { month: 'Mar', revenue: 74000000, profit: 26000000, cost: 48000000 },
  { month: 'Apr', revenue: 71000000, profit: 24500000, cost: 46500000 },
  { month: 'Mei', revenue: 82000000, profit: 29000000, cost: 53000000 },
  { month: 'Jun', revenue: 79000000, profit: 27500000, cost: 51500000 },
  { month: 'Jul', revenue: 86000000, profit: 30500000, cost: 55500000 },
  { month: 'Agu', revenue: 89000000, profit: 31800000, cost: 57200000 },
  { month: 'Sep', revenue: 84750000, profit: 28700000, cost: 56050000 },
  { month: 'Okt (Est)', revenue: 90000000, profit: 32000000, cost: 58000000 },
  { month: 'Nov (Est)', revenue: 95000000, profit: 34000000, cost: 61000000 },
  { month: 'Des (Est)', revenue: 110000000, profit: 40000000, cost: 70000000 },
];

// Data Tren Penjualan Harian Bulan Ini (10 Hari Terakhir)
const DAILY_SALES_DATA = [
  { day: '11 Sep', sales: 2450000, cups: 73 },
  { day: '12 Sep', sales: 2680000, cups: 80 },
  { day: '13 Sep', sales: 3100000, cups: 94 },
  { day: '14 Sep', sales: 3450000, cups: 106 },
  { day: '15 Sep', sales: 2320000, cups: 69 },
  { day: '16 Sep', sales: 2540000, cups: 76 },
  { day: '17 Sep', sales: 2890000, cups: 86 },
  { day: '18 Sep', sales: 2750000, cups: 82 },
  { day: '19 Sep', sales: 3620000, cups: 112 },
  { day: '20 Sep', sales: 2830000, cups: 84 },
];

// Top 5 Produk Terlaris by Quantity Bulan Ini
const TOP_PRODUCTS = [
  {
    rank: 1,
    name: 'Kopi Susu Gula Aren Ulubelu',
    category: 'Signature Coffee',
    qtySold: 840,
    unitPrice: 22000,
    totalRevenue: 18480000,
    growth: '+18%',
  },
  {
    rank: 2,
    name: 'Iced Caramel Macchiato',
    category: 'Espresso Bar',
    qtySold: 610,
    unitPrice: 28000,
    totalRevenue: 17080000,
    growth: '+12%',
  },
  {
    rank: 3,
    name: 'Croissant Butter Almond',
    category: 'Pastry & Bakery',
    qtySold: 420,
    unitPrice: 25000,
    totalRevenue: 10500000,
    growth: '+25%',
  },
  {
    rank: 4,
    name: 'Manual Brew V60 Flores Bajawa',
    category: 'Single Origin Filter',
    qtySold: 310,
    unitPrice: 26000,
    totalRevenue: 8060000,
    growth: '+8%',
  },
  {
    rank: 5,
    name: 'Matcha Latte Oatmilk',
    category: 'Non-Coffee',
    qtySold: 290,
    unitPrice: 30000,
    totalRevenue: 8700000,
    growth: '+15%',
  },
];

export function TabSalesAnalytics({ selectedBranch }: TabSalesAnalyticsProps) {
  return (
    <div className="space-y-6">
      {/* 1. KEY SALES METRICS CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-border">
          <CardContent className="p-5 space-y-1">
            <div className="flex justify-between items-center text-xs text-muted-foreground uppercase font-semibold">
              <span>Penjualan Hari Ini</span>
              <Calendar className="w-4 h-4 text-primary" />
            </div>
            <p className="text-2xl font-bold">Rp 2.830.000</p>
            <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
              <ArrowUpRight className="w-3.5 h-3.5" />
              <span>+14.2% dibanding kemarin (84 cups)</span>
            </p>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardContent className="p-5 space-y-1">
            <div className="flex justify-between items-center text-xs text-muted-foreground uppercase font-semibold">
              <span>Penjualan Bulan Ini</span>
              <ShoppingBag className="w-4 h-4 text-emerald-500" />
            </div>
            <p className="text-2xl font-bold text-foreground">Rp 84.750.000</p>
            <p className="text-xs text-muted-foreground">Target bulanan: Rp 100.000.000 (84.7%)</p>
          </CardContent>
        </Card>

        <Card className="border-border bg-emerald-500/5 border-emerald-500/20">
          <CardContent className="p-5 space-y-1">
            <div className="flex justify-between items-center text-xs text-emerald-700 dark:text-emerald-400 uppercase font-semibold">
              <span>Net Profit Global</span>
              <TrendingUp className="w-4 h-4" />
            </div>
            <p className="text-2xl font-bold text-emerald-700 dark:text-emerald-400">
              Rp 28.700.000
            </p>
            <p className="text-xs text-emerald-600 font-medium">Margin Bersih: 33.8% (Setelah HPP & Beban)</p>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardContent className="p-5 space-y-1">
            <div className="flex justify-between items-center text-xs text-muted-foreground uppercase font-semibold">
              <span>Average Order Value</span>
              <DollarSign className="w-4 h-4 text-primary" />
            </div>
            <p className="text-2xl font-bold">Rp 33.700</p>
            <p className="text-xs text-muted-foreground">Rata-rata belanja per struk kasir</p>
          </CardContent>
        </Card>
      </div>

      {/* 2. CHARTS SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Grafik Tren Penjualan Tahunan (Recharts AreaChart) */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-primary" />
                  Grafik Tren Penjualan Tahunan (2026)
                </CardTitle>
                <CardDescription className="text-xs">
                  Perkembangan omset kotor vs estimasi laba bersih (Januari - Desember)
                </CardDescription>
              </div>
              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-primary/10 text-primary">
                Tahun Berjalan
              </span>
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="h-[280px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={ANNUAL_SALES_DATA} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0} />
                    </linearGradient>
                    <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                  <YAxis
                    tick={{ fontSize: 10 }}
                    tickFormatter={(val) => `${(val / 1000000).toFixed(0)}M`}
                  />
                  <Tooltip
                    formatter={(val: any) => [`Rp ${Number(val).toLocaleString('id-ID')}`, '']}
                    contentStyle={{ borderRadius: '12px', fontSize: '12px', border: '1px solid #e2e8f0' }}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    name="Omset Penjualan"
                    stroke="#3b82f6"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#colorRevenue)"
                  />
                  <Area
                    type="monotone"
                    dataKey="profit"
                    name="Net Profit (Laba Bersih)"
                    stroke="#10b981"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#colorProfit)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Grafik Tren Penjualan Harian Bulan Ini (Recharts BarChart) */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <BarChart className="w-4 h-4 text-emerald-500" />
                  Tren Laporan Penjualan Bulan Ini (September)
                </CardTitle>
                <CardDescription className="text-xs">
                  Fluktuasi omset harian & kuantitas pesanan 10 hari terakhir
                </CardDescription>
              </div>
              <span className="text-xs text-muted-foreground">Puncak: Akhir Pekan</span>
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="h-[280px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={DAILY_SALES_DATA} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                  <XAxis dataKey="day" tick={{ fontSize: 11 }} />
                  <YAxis
                    tick={{ fontSize: 10 }}
                    tickFormatter={(val) => `${(val / 1000000).toFixed(1)}M`}
                  />
                  <Tooltip
                    formatter={(val: any) => [`Rp ${Number(val).toLocaleString('id-ID')}`, 'Omset Harian']}
                    contentStyle={{ borderRadius: '12px', fontSize: '12px', border: '1px solid #e2e8f0' }}
                  />
                  <Bar dataKey="sales" name="Omset Harian (Rp)" fill="#3b82f6" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 3. TOP 5 PRODUK TERLARIS BY QUANTITY BULAN INI */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <Flame className="w-5 h-5 text-amber-500" />
                Produk Terlaris Bulan Ini (Top Sellers by Quantity)
              </CardTitle>
              <CardDescription className="text-xs">
                Menu paling banyak dipesan di kasir dan website pemesanan pelanggan
              </CardDescription>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-600 border border-amber-500/20 flex items-center gap-1">
              <Award className="w-3.5 h-3.5" /> Best Seller Rankings
            </span>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-muted/50 text-muted-foreground uppercase text-[10px] font-bold border-y">
                <tr>
                  <th className="py-2.5 px-3">Peringkat</th>
                  <th className="py-2.5 px-3">Nama Menu / Produk</th>
                  <th className="py-2.5 px-3">Kategori</th>
                  <th className="py-2.5 px-3 text-center">Qty Terjual</th>
                  <th className="py-2.5 px-3 text-right">Harga Satuan</th>
                  <th className="py-2.5 px-3 text-right">Total Pendapatan</th>
                  <th className="py-2.5 px-3 text-center">Tren</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {TOP_PRODUCTS.map((prod) => (
                  <tr key={prod.rank} className="hover:bg-muted/30 transition-colors">
                    <td className="py-3 px-3 font-extrabold">
                      <span
                        className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs ${
                          prod.rank === 1
                            ? 'bg-amber-500 text-white font-bold'
                            : prod.rank === 2
                            ? 'bg-slate-300 text-slate-800 font-bold dark:bg-slate-700 dark:text-slate-200'
                            : prod.rank === 3
                            ? 'bg-amber-700 text-white font-bold'
                            : 'bg-muted text-muted-foreground font-semibold'
                        }`}
                      >
                        #{prod.rank}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-semibold text-foreground text-sm">{prod.name}</td>
                    <td className="py-3 px-3 text-muted-foreground">{prod.category}</td>
                    <td className="py-3 px-3 text-center font-bold text-sm text-primary">
                      {prod.qtySold.toLocaleString('id-ID')} cup
                    </td>
                    <td className="py-3 px-3 text-right font-mono text-muted-foreground">
                      Rp {prod.unitPrice.toLocaleString('id-ID')}
                    </td>
                    <td className="py-3 px-3 text-right font-bold text-foreground">
                      Rp {prod.totalRevenue.toLocaleString('id-ID')}
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span className="text-[11px] font-bold text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                        {prod.growth}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
