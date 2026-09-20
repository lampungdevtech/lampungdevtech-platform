'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import {
  Wallet,
  Building2,
  Plus,
  Trash2,
  Edit2,
  TrendingUp,
  Receipt,
  Zap,
  ArrowUpRight,
  CreditCard,
  CircleDollarSign,
} from 'lucide-react';
import { usePosOwnerStore } from './use-pos-owner-store';
import { BankAccount } from './types';

interface TabFinancialProps {
  store: ReturnType<typeof usePosOwnerStore>;
  selectedBranch: string;
}

export function TabFinancial({ store, selectedBranch }: TabFinancialProps) {
  const { toast } = useToast();
  const {
    banks,
    vault,
    electricity,
    totalGrandBalance,
    totalBankBalance,
    totalPhysicalCash,
    addBank,
    updateBank,
    deleteBank,
    updateVault,
    transferGatewayToBank,
    setElectricity,
  } = store;

  // Filter banks by branch if branch selected
  const filteredBanks = selectedBranch === 'ALL'
    ? banks
    : banks.filter((b) => b.branchId === selectedBranch || b.isMain);

  // Modal State: Tambah Bank Baru
  const [showAddBankModal, setShowAddBankModal] = useState(false);
  const [newBankForm, setNewBankForm] = useState({
    bankName: '',
    accountNumber: '',
    accountHolder: '',
    balance: '',
    branchId: '01-MAIN',
  });

  // Modal State: Edit Saldo Bank
  const [editingBank, setEditingBank] = useState<BankAccount | null>(null);
  const [editBalanceInput, setEditBalanceInput] = useState('');

  // Modal State: Tarik Saldo Payment Gateway
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [transferAmount, setTransferAmount] = useState('');
  const [targetBankId, setTargetBankId] = useState(banks[0]?.id || '');

  // Form State: Penggunaan Listrik
  const [isEditingElectricity, setIsEditingElectricity] = useState(false);
  const [kwhInput, setKwhInput] = useState(electricity.kwhUsed.toString());
  const [costInput, setCostInput] = useState(electricity.estimatedCost.toString());

  const handleAddBankSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBankForm.bankName || !newBankForm.accountNumber || !newBankForm.accountHolder) {
      toast({ title: 'Data Belum Lengkap', description: 'Mohon isi semua field bank.', variant: 'destructive' });
      return;
    }
    const balanceNum = parseInt(newBankForm.balance.replace(/\D/g, ''), 10) || 0;
    addBank({
      bankName: newBankForm.bankName,
      accountNumber: newBankForm.accountNumber,
      accountHolder: newBankForm.accountHolder,
      balance: balanceNum,
      branchId: newBankForm.branchId,
      isMain: false,
    });
    setNewBankForm({ bankName: '', accountNumber: '', accountHolder: '', balance: '', branchId: '01-MAIN' });
    setShowAddBankModal(false);
    toast({
      title: 'Rekening Bank Berhasil Ditambahkan',
      description: `${newBankForm.bankName} (${newBankForm.accountNumber}) kini terhubung ke portal kasir.`,
    });
  };

  const handleSaveEditBalance = () => {
    if (!editingBank) return;
    const newBal = parseInt(editBalanceInput.replace(/\D/g, ''), 10) || 0;
    updateBank(editingBank.id, { balance: newBal });
    setEditingBank(null);
    toast({
      title: 'Saldo Rekening Diperbarui',
      description: `Saldo ${editingBank.bankName} diupdate menjadi Rp ${newBal.toLocaleString('id-ID')}.`,
    });
  };

  const handleDeleteBank = (id: string, name: string) => {
    if (confirm(`Apakah Anda yakin ingin menghapus rekening ${name}?`)) {
      deleteBank(id);
      toast({ title: 'Rekening Dihapus', description: `Rekening ${name} telah dikeluarkan dari portal.` });
    }
  };

  const handleTransferSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amountNum = parseInt(transferAmount.replace(/\D/g, ''), 10) || 0;
    if (amountNum <= 0 || amountNum > vault.gatewayBalance) {
      toast({
        title: 'Nominal Tidak Valid',
        description: 'Nominal transfer melebihi saldo payment gateway yang tersedia.',
        variant: 'destructive',
      });
      return;
    }
    const success = transferGatewayToBank(amountNum, targetBankId);
    if (success) {
      setShowTransferModal(false);
      setTransferAmount('');
      const targetBank = banks.find((b) => b.id === targetBankId);
      toast({
        title: 'Pencairan Berhasil (Settlement Sukses)',
        description: `Dana Rp ${amountNum.toLocaleString('id-ID')} berhasil dipindahkan dari Gateway ke ${targetBank?.bankName || 'Rekening Bank'}.`,
      });
    }
  };

  const handleSaveElectricity = () => {
    const kwh = parseInt(kwhInput.replace(/\D/g, ''), 10) || 0;
    const cost = parseInt(costInput.replace(/\D/g, ''), 10) || 0;
    setElectricity({
      ...electricity,
      kwhUsed: kwh,
      estimatedCost: cost,
    });
    setIsEditingElectricity(false);
    toast({
      title: 'Data Listrik Diperbarui',
      description: `Beban listrik bulan ini tercatat ${kwh.toLocaleString('id-ID')} kWh (Rp ${cost.toLocaleString('id-ID')}).`,
    });
  };

  return (
    <div className="space-y-6">
      {/* 1. TOP GRAND BALANCE OVERVIEW CARD */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="md:col-span-2 bg-gradient-to-br from-card via-card to-primary/5 border-primary/20 shadow-md">
          <CardHeader className="pb-2">
            <div className="flex justify-between items-center">
              <span className="text-xs uppercase font-bold text-muted-foreground flex items-center gap-1.5">
                <Wallet className="w-4 h-4 text-primary" />
                Saldo Total Kas Konsolidasi
              </span>
              <span className="text-[11px] bg-primary/15 text-primary px-2.5 py-0.5 rounded-full font-semibold">
                Real-Time Liquid Asset
              </span>
            </div>
            <CardTitle className="text-3xl font-extrabold tracking-tight mt-1">
              Rp {totalGrandBalance.toLocaleString('id-ID')}
            </CardTitle>
            <CardDescription className="text-xs">
              Akumulasi dari rekening bank, uang tunai fisik laci, kas operasional, parkir, dan saldo gateway.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-2">
            <div className="grid grid-cols-3 gap-2 pt-3 border-t text-xs">
              <div>
                <span className="text-muted-foreground">Saldo di Bank:</span>
                <p className="font-bold text-foreground">Rp {totalBankBalance.toLocaleString('id-ID')}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Kas Fisik Toko:</span>
                <p className="font-bold text-foreground">Rp {totalPhysicalCash.toLocaleString('id-ID')}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Gateway / E-Wallet:</span>
                <p className="font-bold text-emerald-600 dark:text-emerald-400">
                  Rp {vault.gatewayBalance.toLocaleString('id-ID')}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Card Laci Kasir (Cash Register) */}
        <Card className="border-border">
          <CardHeader className="pb-2">
            <span className="text-xs uppercase font-semibold text-muted-foreground flex items-center justify-between">
              <span>Laci Kasir (Drawer)</span>
              <CircleDollarSign className="w-4 h-4 text-amber-500" />
            </span>
            <CardTitle className="text-xl font-bold">
              Rp {vault.cashRegister.toLocaleString('id-ID')}
            </CardTitle>
            <CardDescription className="text-xs">Uang fisik di mesin kasir saat ini</CardDescription>
          </CardHeader>
          <CardContent className="pt-0 text-xs text-muted-foreground">
            <div className="flex justify-between pt-2 border-t">
              <span>Modal Awal Shift:</span>
              <span className="font-semibold text-foreground">Rp 200.000</span>
            </div>
            <div className="flex justify-between pt-1">
              <span>Penjualan Tunai:</span>
              <span className="font-semibold text-emerald-600">Rp {(vault.cashRegister - 200000).toLocaleString('id-ID')}</span>
            </div>
          </CardContent>
        </Card>

        {/* Card Saldo Gateway (Wesel Aja / Midtrans) */}
        <Card className="border-emerald-500/30 bg-emerald-500/5">
          <CardHeader className="pb-2">
            <span className="text-xs uppercase font-semibold text-emerald-700 dark:text-emerald-400 flex items-center justify-between">
              <span>Payment Gateway (QRIS)</span>
              <CreditCard className="w-4 h-4 text-emerald-600" />
            </span>
            <CardTitle className="text-xl font-bold text-emerald-700 dark:text-emerald-400">
              Rp {vault.gatewayBalance.toLocaleString('id-ID')}
            </CardTitle>
            <CardDescription className="text-xs">
              {vault.gatewayProvider} • Siap dicairkan
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <Button
              size="sm"
              className="w-full h-8 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white"
              onClick={() => {
                setTransferAmount(vault.gatewayBalance.toString());
                setShowTransferModal(true);
              }}
            >
              <ArrowUpRight className="w-3.5 h-3.5 mr-1" /> Tarik ke Rekening Bank
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* 2. REKENING BANK DINAMIS SECTION */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div>
            <h3 className="text-lg font-bold flex items-center gap-2">
              <Building2 className="w-5 h-5 text-primary" />
              Rekening Bank Usaha (Dinamis)
            </h3>
            <p className="text-xs text-muted-foreground">
              Kelola rekening perbankan toko (BCA, BNI, Mandiri, BRI, dll) dengan pencatatan saldo terpisah.
            </p>
          </div>
          <Button size="sm" onClick={() => setShowAddBankModal(true)} className="h-9 text-xs font-semibold">
            <Plus className="w-4 h-4 mr-1.5" /> Tambah Rekening Bank
          </Button>
        </div>

        {/* Grid Kartu Bank */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {filteredBanks.map((bank) => (
            <Card key={bank.id} className={`relative overflow-hidden ${bank.isMain ? 'border-primary/40 shadow-sm' : ''}`}>
              {bank.isMain && (
                <div className="absolute top-0 right-0 bg-primary text-primary-foreground text-[10px] font-bold px-2 py-0.5 rounded-bl-lg">
                  REKENING UTAMA
                </div>
              )}
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
                    {bank.bankName.slice(0, 4)}
                  </div>
                  <div>
                    <CardTitle className="text-base font-bold">{bank.bankName}</CardTitle>
                    <p className="text-xs text-muted-foreground font-mono">{bank.accountNumber}</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3 pt-1">
                <div>
                  <span className="text-[11px] text-muted-foreground">Atas Nama:</span>
                  <p className="text-xs font-semibold text-foreground">{bank.accountHolder}</p>
                </div>
                <div className="p-2.5 rounded-xl bg-muted/40 border">
                  <span className="text-[10px] uppercase font-bold text-muted-foreground">Saldo Rekening:</span>
                  <p className="text-lg font-extrabold text-foreground">
                    Rp {bank.balance.toLocaleString('id-ID')}
                  </p>
                </div>
                <div className="flex items-center gap-2 pt-1 border-t">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 h-7 text-xs"
                    onClick={() => {
                      setEditingBank(bank);
                      setEditBalanceInput(bank.balance.toString());
                    }}
                  >
                    <Edit2 className="w-3 h-3 mr-1" /> Edit Saldo
                  </Button>
                  {!bank.isMain && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 px-2 text-destructive hover:bg-destructive/10"
                      onClick={() => handleDeleteBank(bank.id, bank.bankName)}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* 3. ALOKASI KAS PARKIR & KAS BELANJA OPERASIONAL */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Kas Belanja / Operasional (Petty Cash) */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <Receipt className="w-4 h-4 text-primary" />
                  Kas Belanja & Operasional Harian
                </CardTitle>
                <CardDescription className="text-xs">
                  Petty cash untuk belanja bahan segar harian di pasar / kebutuhan darurat
                </CardDescription>
              </div>
              <span className="text-base font-extrabold text-primary">
                Rp {vault.pettyCash.toLocaleString('id-ID')}
              </span>
            </div>
          </CardHeader>
          <CardContent className="space-y-3 text-xs">
            <p className="text-muted-foreground">
              Dana operasional dipegang oleh Head Barista / Kitchen Manager untuk kebutuhan harian.
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className="text-xs flex-1 h-8"
                onClick={() => {
                  const addAmount = prompt('Tambah dana kas belanja operasional (Rp):', '500000');
                  if (addAmount) {
                    const num = parseInt(addAmount.replace(/\D/g, ''), 10) || 0;
                    updateVault({ pettyCash: vault.pettyCash + num });
                    toast({ title: 'Kas Belanja Ditambah', description: `Rp ${num.toLocaleString('id-ID')} ditambahkan ke kas belanja.` });
                  }
                }}
              >
                + Tambah Dana Kas
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="text-xs flex-1 h-8"
                onClick={() => {
                  const spend = prompt('Catat pengeluaran belanja harian (Rp):', '150000');
                  if (spend) {
                    const num = parseInt(spend.replace(/\D/g, ''), 10) || 0;
                    if (num > vault.pettyCash) {
                      alert('Saldo kas belanja tidak mencukupi!');
                      return;
                    }
                    updateVault({ pettyCash: vault.pettyCash - num });
                    toast({ title: 'Pengeluaran Dicatat', description: `Rp ${num.toLocaleString('id-ID')} dikeluarkan dari kas belanja.` });
                  }
                }}
              >
                - Catat Belanja Pasar
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Kas Parkir Harian */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <CircleDollarSign className="w-4 h-4 text-emerald-500" />
                  Kas Parkir Harian
                </CardTitle>
                <CardDescription className="text-xs">
                  Penerimaan retribusi parkir pelanggan hari ini sebelum pembagian mingguan
                </CardDescription>
              </div>
              <span className="text-base font-extrabold text-emerald-600 dark:text-emerald-400">
                Rp {vault.parkingCash.toLocaleString('id-ID')}
              </span>
            </div>
          </CardHeader>
          <CardContent className="space-y-3 text-xs">
            <div className="grid grid-cols-2 gap-2 bg-muted/40 p-2.5 rounded-lg">
              <div>
                <span className="text-muted-foreground">Porsi Toko (60%):</span>
                <p className="font-bold text-foreground">Rp {((vault.parkingCash * 60) / 100).toLocaleString('id-ID')}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Juru Parkir (40%):</span>
                <p className="font-bold text-foreground">Rp {((vault.parkingCash * 40) / 100).toLocaleString('id-ID')}</p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="w-full text-xs h-8"
              onClick={() => {
                const addPark = prompt('Input setoran tunai parkir hari ini (Rp):', '120000');
                if (addPark) {
                  const num = parseInt(addPark.replace(/\D/g, ''), 10) || 0;
                  updateVault({ parkingCash: vault.parkingCash + num });
                  toast({ title: 'Setoran Parkir Dicatat', description: `Rp ${num.toLocaleString('id-ID')} masuk ke kas parkir.` });
                }
              }}
            >
              + Input Setoran Parkir Hari Ini
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* 4. BEBAN PENGGUNAAN LISTRIK & CASH FLOW BULANAN */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Indikator Listrik PLN */}
        <Card className="md:col-span-1">
          <CardHeader className="pb-2">
            <div className="flex justify-between items-center">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-500" />
                Penggunaan Listrik PLN
              </CardTitle>
              <span className="text-[10px] bg-amber-500/10 text-amber-600 px-2 py-0.5 rounded font-bold">
                {electricity.month}
              </span>
            </div>
            <CardDescription className="text-xs">Monitoring konsumsi daya mesin & pendingin</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-xs pt-1">
            {!isEditingElectricity ? (
              <>
                <div className="flex justify-between items-baseline p-2.5 bg-muted/30 rounded-xl border">
                  <div>
                    <span className="text-muted-foreground">Total Pemakaian:</span>
                    <p className="text-xl font-extrabold">{electricity.kwhUsed.toLocaleString('id-ID')} kWh</p>
                  </div>
                  <div className="text-right">
                    <span className="text-muted-foreground">Estimasi Tagihan:</span>
                    <p className="text-base font-bold text-amber-600 dark:text-amber-400">
                      Rp {electricity.estimatedCost.toLocaleString('id-ID')}
                    </p>
                  </div>
                </div>
                <div className="flex justify-between text-[11px] text-muted-foreground">
                  <span>Tarif Dasar: Rp {electricity.tariffPerKwh}/kWh</span>
                  <span>Beban Jam Sibuk: {electricity.peakHourUsagePercent}%</span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full text-xs h-7"
                  onClick={() => setIsEditingElectricity(true)}
                >
                  <Edit2 className="w-3 h-3 mr-1" /> Update Meteran Listrik
                </Button>
              </>
            ) : (
              <div className="space-y-2 p-2 bg-muted/40 rounded-xl">
                <div>
                  <Label className="text-[11px]">Total kWh Terpakai:</Label>
                  <Input
                    value={kwhInput}
                    onChange={(e) => setKwhInput(e.target.value)}
                    className="h-7 text-xs"
                    type="number"
                  />
                </div>
                <div>
                  <Label className="text-[11px]">Estimasi Biaya Tagihan (Rp):</Label>
                  <Input
                    value={costInput}
                    onChange={(e) => setCostInput(e.target.value)}
                    className="h-7 text-xs"
                    type="number"
                  />
                </div>
                <div className="flex gap-2 pt-1">
                  <Button size="sm" className="h-7 text-xs flex-1" onClick={handleSaveElectricity}>
                    Simpan
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-7 text-xs"
                    onClick={() => setIsEditingElectricity(false)}
                  >
                    Batal
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Cash Flow Ringkasan Bulanan */}
        <Card className="md:col-span-2">
          <CardHeader className="pb-2">
            <div className="flex justify-between items-center">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-primary" />
                Arus Kas Bulanan (Cash Flow Statement)
              </CardTitle>
              <span className="text-xs text-muted-foreground">Per 20 September 2026</span>
            </div>
            <CardDescription className="text-xs">
              Perbandingan total penerimaan kas operasional terhadap beban pengeluaran
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 pt-1 text-xs">
            <div className="grid grid-cols-3 gap-3">
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400 uppercase">
                  Cash Inflow (Masuk)
                </span>
                <p className="text-lg font-extrabold text-emerald-700 dark:text-emerald-400 mt-1">
                  Rp 84.750.000
                </p>
                <span className="text-[10px] text-muted-foreground">Penjualan kopi & makanan</span>
              </div>

              <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl">
                <span className="text-[11px] font-bold text-red-600 dark:text-red-400 uppercase">
                  Cash Outflow (Keluar)
                </span>
                <p className="text-lg font-extrabold text-red-600 dark:text-red-400 mt-1">
                  Rp 56.050.000
                </p>
                <span className="text-[10px] text-muted-foreground">HPP bahan, listrik, gaji, operasional</span>
              </div>

              <div className="p-3 bg-primary/10 border border-primary/20 rounded-xl">
                <span className="text-[11px] font-bold text-primary uppercase">
                  Net Operating Cash
                </span>
                <p className="text-lg font-extrabold text-primary mt-1">
                  + Rp 28.700.000
                </p>
                <span className="text-[10px] text-muted-foreground">Surplus kas bersih bulan ini</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* --- MODAL: TAMBAH REKENING BANK BARU --- */}
      {showAddBankModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card w-full max-w-md rounded-2xl border p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="font-bold text-lg flex items-center gap-2">
                <Building2 className="w-5 h-5 text-primary" />
                Tambah Rekening Bank Baru
              </h3>
              <button onClick={() => setShowAddBankModal(false)} className="text-muted-foreground hover:text-foreground">
                ✕
              </button>
            </div>

            <form onSubmit={handleAddBankSubmit} className="space-y-3 text-xs">
              <div>
                <Label htmlFor="bankName">Nama Bank (misal: Bank BCA, Bank BNI, Bank Mandiri):</Label>
                <Input
                  id="bankName"
                  placeholder="Contoh: Bank BCA"
                  value={newBankForm.bankName}
                  onChange={(e) => setNewBankForm({ ...newBankForm, bankName: e.target.value })}
                  required
                />
              </div>

              <div>
                <Label htmlFor="accNumber">Nomor Rekening:</Label>
                <Input
                  id="accNumber"
                  placeholder="Contoh: 8905521920"
                  value={newBankForm.accountNumber}
                  onChange={(e) => setNewBankForm({ ...newBankForm, accountNumber: e.target.value })}
                  required
                />
              </div>

              <div>
                <Label htmlFor="accHolder">Nama Pemilik Rekening (Atas Nama):</Label>
                <Input
                  id="accHolder"
                  placeholder="Contoh: PT Kopi Ruang Temu"
                  value={newBankForm.accountHolder}
                  onChange={(e) => setNewBankForm({ ...newBankForm, accountHolder: e.target.value })}
                  required
                />
              </div>

              <div>
                <Label htmlFor="accBalance">Saldo Awal Saat Ini (Rp):</Label>
                <Input
                  id="accBalance"
                  placeholder="Contoh: 15000000"
                  type="number"
                  value={newBankForm.balance}
                  onChange={(e) => setNewBankForm({ ...newBankForm, balance: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="accBranch">Alokasi Cabang:</Label>
                <select
                  id="accBranch"
                  className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-xs"
                  value={newBankForm.branchId}
                  onChange={(e) => setNewBankForm({ ...newBankForm, branchId: e.target.value })}
                >
                  <option value="01-MAIN">Cabang 01: Enggal (Pusat)</option>
                  <option value="02-KEMILING">Cabang 02: Kemiling Outlet</option>
                </select>
              </div>

              <div className="flex gap-2 pt-3 border-t">
                <Button type="button" variant="outline" className="flex-1" onClick={() => setShowAddBankModal(false)}>
                  Batal
                </Button>
                <Button type="submit" className="flex-1">
                  Simpan Rekening
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL: EDIT SALDO BANK --- */}
      {editingBank && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card w-full max-w-sm rounded-2xl border p-5 shadow-2xl space-y-4">
            <h3 className="font-bold text-base">Edit Saldo {editingBank.bankName}</h3>
            <p className="text-xs text-muted-foreground font-mono">{editingBank.accountNumber}</p>
            <div className="space-y-2">
              <Label className="text-xs">Saldo Terkoreksi (Rp):</Label>
              <Input
                type="number"
                value={editBalanceInput}
                onChange={(e) => setEditBalanceInput(e.target.value)}
                className="text-sm font-bold"
              />
            </div>
            <div className="flex gap-2 pt-2">
              <Button variant="outline" size="sm" className="flex-1" onClick={() => setEditingBank(null)}>
                Batal
              </Button>
              <Button size="sm" className="flex-1" onClick={handleSaveEditBalance}>
                Update Saldo
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL: TARIK / PINDAH SALDO PAYMENT GATEWAY --- */}
      {showTransferModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card w-full max-w-md rounded-2xl border p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="font-bold text-base flex items-center gap-2 text-emerald-700 dark:text-emerald-400">
                <ArrowUpRight className="w-5 h-5" />
                Pencairan Saldo Payment Gateway
              </h3>
              <button onClick={() => setShowTransferModal(false)}>✕</button>
            </div>

            <form onSubmit={handleTransferSubmit} className="space-y-3 text-xs">
              <div className="p-3 bg-muted/40 rounded-xl">
                <span className="text-muted-foreground">Saldo Tersedia di Gateway:</span>
                <p className="text-lg font-bold text-emerald-600">
                  Rp {vault.gatewayBalance.toLocaleString('id-ID')}
                </p>
              </div>

              <div>
                <Label>Nominal Pencairan (Rp):</Label>
                <Input
                  type="number"
                  value={transferAmount}
                  onChange={(e) => setTransferAmount(e.target.value)}
                  max={vault.gatewayBalance}
                  required
                />
              </div>

              <div>
                <Label>Transfer ke Rekening Bank Tujuan:</Label>
                <select
                  className="w-full h-9 rounded-md border border-input bg-background px-3 text-xs"
                  value={targetBankId}
                  onChange={(e) => setTargetBankId(e.target.value)}
                >
                  {banks.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.bankName} - {b.accountNumber} ({b.accountHolder})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex gap-2 pt-3 border-t">
                <Button type="button" variant="outline" className="flex-1" onClick={() => setShowTransferModal(false)}>
                  Batal
                </Button>
                <Button type="submit" className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white">
                  Konfirmasi Pencairan
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
