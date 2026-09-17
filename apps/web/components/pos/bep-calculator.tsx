'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calculator, TrendingUp, DollarSign, Calendar, Coffee, AlertCircle } from 'lucide-react';

export function BepCalculator() {
  // Modal Investasi Awal (CapEx)
  const [rentCost, setRentCost] = useState<number>(36000000); // Sewa ruko 1 tahun
  const [espressoMachine, setEspressoMachine] = useState<number>(25000000); // Mesin espresso + grinder
  const [renovationCost, setRenovationCost] = useState<number>(20000000); // Renovasi & interior bar
  const [cashFloat, setCashFloat] = useState<number>(1000000); // Kas laci awal

  // Unit Economics (Per Cup)
  const [sellingPrice, setSellingPrice] = useState<number>(22000); // Harga jual rata-rata
  const [cogsPerCup, setCogsPerCup] = useState<number>(8500); // HPP rata-rata (biji kopi, susu, cup)

  // Volume & Biaya Operasional (OpEx)
  const [cupsPerDay, setCupsPerDay] = useState<number>(75); // Target penjualan per hari
  const [monthlyOpex, setMonthlyOpex] = useState<number>(6500000); // Gaji staf, listrik, wifi, air

  const calculations = useMemo(() => {
    // Total Investasi Awal (CapEx)
    const totalCapex = rentCost + espressoMachine + renovationCost + cashFloat;

    // Unit Economics
    const grossMarginPerCup = sellingPrice - cogsPerCup;
    const grossMarginPercentage = sellingPrice > 0 ? (grossMarginPerCup / sellingPrice) * 100 : 0;

    // Proyeksi Bulanan (30 hari)
    const monthlyCups = cupsPerDay * 30;
    const monthlyRevenue = monthlyCups * sellingPrice;
    const monthlyCogs = monthlyCups * cogsPerCup;
    const monthlyGrossProfit = monthlyRevenue - monthlyCogs;
    const monthlyNetProfit = monthlyGrossProfit - monthlyOpex;

    // Waktu Balik Modal (BEP)
    let bepMonths = 0;
    if (monthlyNetProfit > 0) {
      bepMonths = totalCapex / monthlyNetProfit;
    }

    return {
      totalCapex,
      grossMarginPerCup,
      grossMarginPercentage,
      monthlyRevenue,
      monthlyGrossProfit,
      monthlyNetProfit,
      bepMonths: Math.max(0, bepMonths),
    };
  }, [rentCost, espressoMachine, renovationCost, cashFloat, sellingPrice, cogsPerCup, cupsPerDay, monthlyOpex]);

  return (
    <Card className="border-primary/20 shadow-xl overflow-hidden">
      <CardHeader className="bg-muted/40 pb-6 border-b">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-primary/10 rounded-xl text-primary">
            <Calculator className="h-6 w-6" />
          </div>
          <div>
            <CardTitle className="text-2xl font-bold">Kalkulator Balik Modal (BEP & ROI Kafe)</CardTitle>
            <CardDescription className="text-base">
              Simulasi perhitungan modal awal investasi (CapEx), HPP per cup, dan estimasi waktu balik modal untuk bisnis kafe Anda di Lampung.
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-6 md:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Kolom Kiri: Form Input Parameter */}
          <div className="lg:col-span-7 space-y-6">
            {/* Bagian 1: Modal Investasi Awal (CapEx) */}
            <div className="space-y-4">
              <h4 className="font-semibold text-base flex items-center text-primary">
                <DollarSign className="h-4 w-4 mr-1.5" /> 1. Modal Investasi Awal (CapEx)
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="rentCost" className="text-xs text-muted-foreground">Sewa Tempat / Ruko (1 Thn)</Label>
                  <Input
                    id="rentCost"
                    type="number"
                    value={rentCost}
                    onChange={(e) => setRentCost(Number(e.target.value))}
                    step="1000000"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="espressoMachine" className="text-xs text-muted-foreground">Mesin Kopi & Grinder</Label>
                  <Input
                    id="espressoMachine"
                    type="number"
                    value={espressoMachine}
                    onChange={(e) => setEspressoMachine(Number(e.target.value))}
                    step="1000000"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="renovationCost" className="text-xs text-muted-foreground">Renovasi & Interior Bar</Label>
                  <Input
                    id="renovationCost"
                    type="number"
                    value={renovationCost}
                    onChange={(e) => setRenovationCost(Number(e.target.value))}
                    step="1000000"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="cashFloat" className="text-xs text-muted-foreground">Uang Kas Laci Awal (Float)</Label>
                  <Input
                    id="cashFloat"
                    type="number"
                    value={cashFloat}
                    onChange={(e) => setCashFloat(Number(e.target.value))}
                    step="100000"
                  />
                </div>
              </div>
            </div>

            {/* Bagian 2: Harga Jual & Resep HPP per Cup */}
            <div className="space-y-4 pt-2 border-t">
              <h4 className="font-semibold text-base flex items-center text-primary">
                <Coffee className="h-4 w-4 mr-1.5" /> 2. Rata-Rata per Cup (Unit Economics)
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="sellingPrice" className="text-xs text-muted-foreground">Harga Jual Rata-Rata</Label>
                  <Input
                    id="sellingPrice"
                    type="number"
                    value={sellingPrice}
                    onChange={(e) => setSellingPrice(Number(e.target.value))}
                    step="1000"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="cogsPerCup" className="text-xs text-muted-foreground">HPP (Biji Kopi, Susu, Cup)</Label>
                  <Input
                    id="cogsPerCup"
                    type="number"
                    value={cogsPerCup}
                    onChange={(e) => setCogsPerCup(Number(e.target.value))}
                    step="500"
                  />
                </div>
              </div>
            </div>

            {/* Bagian 3: Target Penjualan & Biaya Operasional */}
            <div className="space-y-4 pt-2 border-t">
              <h4 className="font-semibold text-base flex items-center text-primary">
                <TrendingUp className="h-4 w-4 mr-1.5" /> 3. Target Harian & Biaya Bulanan (OpEx)
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="cupsPerDay" className="text-xs text-muted-foreground">Target Penjualan Cup / Hari</Label>
                  <Input
                    id="cupsPerDay"
                    type="number"
                    value={cupsPerDay}
                    onChange={(e) => setCupsPerDay(Number(e.target.value))}
                    min="1"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="monthlyOpex" className="text-xs text-muted-foreground">Biaya Operasional Tetap (Gaji, Listrik, WiFi)</Label>
                  <Input
                    id="monthlyOpex"
                    type="number"
                    value={monthlyOpex}
                    onChange={(e) => setMonthlyOpex(Number(e.target.value))}
                    step="500000"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Kolom Kanan: Card Hasil & Proyeksi BEP */}
          <div className="lg:col-span-5 flex flex-col justify-between space-y-6 bg-muted/30 p-6 rounded-2xl border">
            <div className="space-y-6">
              <div className="text-center pb-4 border-b">
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Estimasi Waktu Balik Modal (BEP)
                </span>
                {calculations.monthlyNetProfit > 0 ? (
                  <div className="mt-2">
                    <span className="text-5xl font-extrabold text-primary">
                      {calculations.bepMonths.toFixed(1)}
                    </span>
                    <span className="text-xl font-semibold text-muted-foreground ml-2">Bulan</span>
                    <p className="text-xs text-muted-foreground mt-1.5 flex items-center justify-center">
                      <Calendar className="h-3.5 w-3.5 mr-1 text-green-500" />
                      Sekitar {Math.round(calculations.bepMonths * 30)} hari operasional
                    </p>
                  </div>
                ) : (
                  <div className="mt-2 text-destructive flex items-center justify-center space-x-1.5">
                    <AlertCircle className="h-5 w-5" />
                    <span className="font-semibold text-sm">Laba bersih belum menutup biaya operasional</span>
                  </div>
                )}
              </div>

              {/* Rincian Finansial */}
              <div className="space-y-3.5 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Total Modal Awal (CapEx):</span>
                  <span className="font-bold">Rp {calculations.totalCapex.toLocaleString('id-ID')}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Margin Kotor per Cup:</span>
                  <span className="font-semibold text-green-600 dark:text-green-400">
                    Rp {calculations.grossMarginPerCup.toLocaleString('id-ID')} ({calculations.grossMarginPercentage.toFixed(1)}%)
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Omset Penjualan / Bulan:</span>
                  <span className="font-semibold">Rp {calculations.monthlyRevenue.toLocaleString('id-ID')}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Laba Kotor / Bulan:</span>
                  <span className="font-semibold">Rp {calculations.monthlyGrossProfit.toLocaleString('id-ID')}</span>
                </div>
                <div className="flex justify-between items-center pt-2 border-t font-semibold">
                  <span>Estimasi Laba Bersih / Bulan:</span>
                  <span className={calculations.monthlyNetProfit > 0 ? 'text-green-600 dark:text-green-400 font-bold text-base' : 'text-destructive font-bold text-base'}>
                    Rp {calculations.monthlyNetProfit.toLocaleString('id-ID')}
                  </span>
                </div>
              </div>
            </div>

            <div className="p-4 bg-primary/5 rounded-xl border border-primary/10 text-xs text-muted-foreground space-y-1.5">
              <p className="font-semibold text-foreground flex items-center">
                💡 Rekomendasi LampungDevTech:
              </p>
              <p>
                Gunakan POS LampungDevTech untuk memantau realisasi penjualan harian terhadap target BEP secara otomatis, dan catat setiap pengurangan bahan baku agar HPP tetap akurat.
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
