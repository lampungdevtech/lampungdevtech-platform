'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import {
  Tag,
  Users,
  Plus,
  Trash2,
  Globe,
  ToggleLeft,
  ToggleRight,
  Gift,
} from 'lucide-react';
import { usePosOwnerStore } from './use-pos-owner-store';
import { ActivePromo, CustomerMember } from './types';

interface TabMarketingCrmProps {
  store: ReturnType<typeof usePosOwnerStore>;
}

export function TabMarketingCrm({ store }: TabMarketingCrmProps) {
  const { toast } = useToast();
  const {
    promos,
    customers,
    addPromo,
    togglePromo,
    deletePromo,
    addCustomer,
    updateCustomer,
    deleteCustomer,
  } = store;

  // Modal State: Tambah Promo Baru
  const [showAddPromoModal, setShowAddPromoModal] = useState(false);
  const [promoForm, setPromoForm] = useState({
    title: '',
    code: '',
    discountType: 'PERCENTAGE' as ActivePromo['discountType'],
    value: '20',
    minSpend: '30000',
    quota: '100',
    validUntil: '2026-10-31',
    applicableCategory: 'All Menu',
  });

  // Modal State: Tambah Pelanggan / Member Baru
  const [showAddCustomerModal, setShowAddCustomerModal] = useState(false);
  const [customerForm, setCustomerForm] = useState({
    name: '',
    phone: '',
    email: '',
    points: '50',
    tier: 'BRONZE' as CustomerMember['tier'],
    canLoginWeb: true,
  });

  const handleAddPromoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!promoForm.title || !promoForm.code) return;
    addPromo({
      title: promoForm.title,
      code: promoForm.code.toUpperCase(),
      discountType: promoForm.discountType,
      value: parseFloat(promoForm.value) || 0,
      minSpend: parseInt(promoForm.minSpend.replace(/\D/g, ''), 10) || 0,
      quota: parseInt(promoForm.quota.replace(/\D/g, ''), 10) || 50,
      isActive: true,
      validUntil: promoForm.validUntil,
      applicableCategory: promoForm.applicableCategory,
    });
    setPromoForm({
      title: '',
      code: '',
      discountType: 'PERCENTAGE',
      value: '20',
      minSpend: '30000',
      quota: '100',
      validUntil: '2026-10-31',
      applicableCategory: 'All Menu',
    });
    setShowAddPromoModal(false);
    toast({
      title: 'Promo Baru Diterbitkan',
      description: `Kode kupon ${promoForm.code.toUpperCase()} aktif dan dapat digunakan di kasir & web order.`,
    });
  };

  const handleAddCustomerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerForm.name || !customerForm.phone) return;
    addCustomer({
      name: customerForm.name,
      phone: customerForm.phone,
      email: customerForm.email || `${customerForm.name.toLowerCase().replace(/\s/g, '')}@customer.com`,
      points: parseInt(customerForm.points.replace(/\D/g, ''), 10) || 0,
      tier: customerForm.tier,
      totalOrders: 1,
      totalSpent: 35000,
      canLoginWeb: customerForm.canLoginWeb,
    });
    setCustomerForm({
      name: '',
      phone: '',
      email: '',
      points: '50',
      tier: 'BRONZE',
      canLoginWeb: true,
    });
    setShowAddCustomerModal(false);
    toast({
      title: 'Member Baru Berhasil Didaftarkan',
      description: `${customerForm.name} terdaftar dengan status akses login website pemesanan aktif.`,
    });
  };

  const handleToggleWebLogin = (cust: CustomerMember) => {
    const nextVal = !cust.canLoginWeb;
    updateCustomer(cust.id, { canLoginWeb: nextVal });
    toast({
      title: nextVal ? 'Akses Web Order Diaktifkan' : 'Akses Web Order Dinonaktifkan',
      description: `Pelanggan ${cust.name} ${nextVal ? 'sekarang dapat' : 'tidak dapat lagi'} login di website untuk memesan online.`,
    });
  };

  return (
    <div className="space-y-6">
      {/* 1. ATUR PROMO & DISKON SECTION */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div>
            <h3 className="text-lg font-bold flex items-center gap-2">
              <Tag className="w-5 h-5 text-primary" />
              Manajemen Promo Aktif & Kupon Diskon
            </h3>
            <p className="text-xs text-muted-foreground">
              Atur kupon potongan belanja kasir dan diskon website pemesanan. Aktifkan/nonaktifkan secara instan.
            </p>
          </div>
          <Button size="sm" onClick={() => setShowAddPromoModal(true)} className="h-9 text-xs">
            <Plus className="w-4 h-4 mr-1.5" /> Buat Promo Baru
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {promos.map((p) => (
            <Card key={p.id} className={`relative border ${p.isActive ? 'border-primary/40' : 'opacity-60'}`}>
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-base font-bold">{p.title}</CardTitle>
                    <span className="text-xs font-mono font-bold text-primary bg-primary/10 px-2 py-0.5 rounded mt-1 inline-block">
                      {p.code}
                    </span>
                  </div>
                  <button
                    onClick={() => {
                      togglePromo(p.id);
                      toast({
                        title: p.isActive ? 'Promo Dinonaktifkan' : 'Promo Diaktifkan',
                        description: `Status promo ${p.title} telah diubah.`,
                      });
                    }}
                    className="cursor-pointer"
                    title="Toggle Promo Status"
                  >
                    {p.isActive ? (
                      <ToggleRight className="w-8 h-8 text-primary" />
                    ) : (
                      <ToggleLeft className="w-8 h-8 text-muted-foreground" />
                    )}
                  </button>
                </div>
              </CardHeader>
              <CardContent className="space-y-2 text-xs pt-1">
                <div className="flex justify-between text-muted-foreground">
                  <span>Tipe Diskon:</span>
                  <span className="font-semibold text-foreground">
                    {p.discountType === 'PERCENTAGE'
                      ? `${p.value}% OFF`
                      : p.discountType === 'FIXED'
                      ? `Rp ${p.value.toLocaleString('id-ID')} OFF`
                      : 'Buy 1 Get 1'}
                  </span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Minimal Belanja:</span>
                  <span className="font-semibold text-foreground">Rp {p.minSpend.toLocaleString('id-ID')}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Kuota Pemakaian:</span>
                  <span className="font-semibold text-foreground">
                    {p.usedCount} / {p.quota} terpakai
                  </span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Berlaku Hingga:</span>
                  <span className="font-semibold text-foreground">{p.validUntil}</span>
                </div>
                <div className="pt-2 border-t flex justify-end">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 text-destructive text-xs px-2"
                    onClick={() => {
                      if (confirm(`Hapus promo ${p.title}?`)) {
                        deletePromo(p.id);
                        toast({ title: 'Promo Dihapus', description: `${p.title} telah dihapus.` });
                      }
                    }}
                  >
                    <Trash2 className="w-3.5 h-3.5 mr-1" /> Hapus Promo
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* 2. DATA PELANGGAN & MEMBER (CRM & WEB ORDERING) */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div>
            <h3 className="text-lg font-bold flex items-center gap-2">
              <Users className="w-5 h-5 text-primary" />
              Data Pelanggan & Member Terdaftar (Customer Portal)
            </h3>
            <p className="text-xs text-muted-foreground">
              Kelola basis data pelanggan, akumulasi poin loyalty, serta aktivasi akun untuk login pemesanan di website.
            </p>
          </div>
          <Button size="sm" onClick={() => setShowAddCustomerModal(true)} className="h-9 text-xs">
            <Plus className="w-4 h-4 mr-1.5" /> Registrasi Pelanggan Baru
          </Button>
        </div>

        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-muted/50 text-muted-foreground uppercase text-[10px] font-bold border-b">
                  <tr>
                    <th className="py-3 px-4">Nama Pelanggan</th>
                    <th className="py-3 px-4">Kontak WhatsApp</th>
                    <th className="py-3 px-4 text-center">Tier Member</th>
                    <th className="py-3 px-4 text-center">Poin Reward</th>
                    <th className="py-3 px-4 text-center">Total Belanja</th>
                    <th className="py-3 px-4 text-center">Akses Login Web Order</th>
                    <th className="py-3 px-4 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {customers.map((c) => (
                    <tr key={c.id} className="hover:bg-muted/30 transition-colors">
                      <td className="py-3 px-4 font-bold text-sm text-foreground">
                        {c.name}
                        <span className="block text-[11px] text-muted-foreground font-normal">{c.email}</span>
                      </td>
                      <td className="py-3 px-4 font-mono text-muted-foreground">{c.phone}</td>
                      <td className="py-3 px-4 text-center">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                            c.tier === 'VIP' || c.tier === 'GOLD'
                              ? 'bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/30'
                              : 'bg-muted text-muted-foreground'
                          }`}
                        >
                          {c.tier}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center font-bold text-sm text-primary flex items-center justify-center gap-1">
                        <Gift className="w-3.5 h-3.5 text-primary" />
                        {c.points} pts
                      </td>
                      <td className="py-3 px-4 text-center font-bold text-foreground">
                        Rp {c.totalSpent.toLocaleString('id-ID')}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <button
                          onClick={() => handleToggleWebLogin(c)}
                          className={`px-2.5 py-1 rounded-full text-[10px] font-bold flex items-center justify-center gap-1 mx-auto transition-colors ${
                            c.canLoginWeb
                              ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/25'
                              : 'bg-muted text-muted-foreground hover:bg-muted/80'
                          }`}
                        >
                          <Globe className="w-3 h-3" />
                          {c.canLoginWeb ? 'Bisa Pesan Web' : 'Dinonaktifkan'}
                        </button>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 px-2 text-destructive hover:bg-destructive/10"
                          onClick={() => {
                            if (confirm(`Hapus pelanggan ${c.name}?`)) {
                              deleteCustomer(c.id);
                              toast({ title: 'Pelanggan Dihapus', description: `${c.name} telah dikeluarkan dari database.` });
                            }
                          }}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* --- MODAL: BUAT PROMO BARU --- */}
      {showAddPromoModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card w-full max-w-md rounded-2xl border p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="font-bold text-base flex items-center gap-2">
                <Tag className="w-5 h-5 text-primary" />
                Terbitkan Promo / Voucher Baru
              </h3>
              <button onClick={() => setShowAddPromoModal(false)}>✕</button>
            </div>

            <form onSubmit={handleAddPromoSubmit} className="space-y-3 text-xs">
              <div>
                <Label>Nama / Judul Promo:</Label>
                <Input
                  placeholder="Contoh: Diskon Weekend Kopi 25%"
                  value={promoForm.title}
                  onChange={(e) => setPromoForm({ ...promoForm, title: e.target.value })}
                  required
                />
              </div>

              <div>
                <Label>Kode Kupon (Uppercase):</Label>
                <Input
                  placeholder="WEEKEND25"
                  value={promoForm.code}
                  onChange={(e) => setPromoForm({ ...promoForm, code: e.target.value })}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label>Tipe Diskon:</Label>
                  <select
                    className="w-full h-9 rounded-md border border-input bg-background px-3 text-xs"
                    value={promoForm.discountType}
                    onChange={(e) => setPromoForm({ ...promoForm, discountType: e.target.value as any })}
                  >
                    <option value="PERCENTAGE">Persentase (%)</option>
                    <option value="FIXED">Potongan Nominal (Rp)</option>
                    <option value="BOGO">Beli 1 Gratis 1 (BOGO)</option>
                  </select>
                </div>
                <div>
                  <Label>Nilai Diskon ({promoForm.discountType === 'PERCENTAGE' ? '%' : 'Rp'}):</Label>
                  <Input
                    type="number"
                    value={promoForm.value}
                    onChange={(e) => setPromoForm({ ...promoForm, value: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label>Minimal Belanja (Rp):</Label>
                  <Input
                    type="number"
                    value={promoForm.minSpend}
                    onChange={(e) => setPromoForm({ ...promoForm, minSpend: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label>Kuota Kupon:</Label>
                  <Input
                    type="number"
                    value={promoForm.quota}
                    onChange={(e) => setPromoForm({ ...promoForm, quota: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div>
                <Label>Berlaku Hingga Tanggal:</Label>
                <Input
                  type="date"
                  value={promoForm.validUntil}
                  onChange={(e) => setPromoForm({ ...promoForm, validUntil: e.target.value })}
                  required
                />
              </div>

              <div className="flex gap-2 pt-3 border-t">
                <Button type="button" variant="outline" className="flex-1" onClick={() => setShowAddPromoModal(false)}>
                  Batal
                </Button>
                <Button type="submit" className="flex-1">
                  Simpan & Aktifkan Promo
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL: REGISTRASI MEMBER BARU --- */}
      {showAddCustomerModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card w-full max-w-md rounded-2xl border p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="font-bold text-base flex items-center gap-2">
                <Users className="w-5 h-5 text-primary" />
                Daftarkan Pelanggan / Member Baru
              </h3>
              <button onClick={() => setShowAddCustomerModal(false)}>✕</button>
            </div>

            <form onSubmit={handleAddCustomerSubmit} className="space-y-3 text-xs">
              <div>
                <Label>Nama Lengkap Pelanggan:</Label>
                <Input
                  placeholder="Contoh: Rian Hidayat"
                  value={customerForm.name}
                  onChange={(e) => setCustomerForm({ ...customerForm, name: e.target.value })}
                  required
                />
              </div>

              <div>
                <Label>Nomor WhatsApp (Untuk Notifikasi & Poin):</Label>
                <Input
                  placeholder="Contoh: 0812-3456-7890"
                  value={customerForm.phone}
                  onChange={(e) => setCustomerForm({ ...customerForm, phone: e.target.value })}
                  required
                />
              </div>

              <div>
                <Label>Email (Untuk Login Pesan di Website):</Label>
                <Input
                  type="email"
                  placeholder="rian@gmail.com"
                  value={customerForm.email}
                  onChange={(e) => setCustomerForm({ ...customerForm, email: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label>Bonus Poin Awal:</Label>
                  <Input
                    type="number"
                    value={customerForm.points}
                    onChange={(e) => setCustomerForm({ ...customerForm, points: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Tier Loyalty Awal:</Label>
                  <select
                    className="w-full h-9 rounded-md border border-input bg-background px-3 text-xs"
                    value={customerForm.tier}
                    onChange={(e) => setCustomerForm({ ...customerForm, tier: e.target.value as any })}
                  >
                    <option value="BRONZE">BRONZE (Member Baru)</option>
                    <option value="SILVER">SILVER (Regular)</option>
                    <option value="GOLD">GOLD (VIP Customer)</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-2 p-3 bg-muted/40 rounded-xl">
                <input
                  type="checkbox"
                  id="canLogin"
                  checked={customerForm.canLoginWeb}
                  onChange={(e) => setCustomerForm({ ...customerForm, canLoginWeb: e.target.checked })}
                  className="rounded"
                />
                <Label htmlFor="canLogin" className="text-xs cursor-pointer font-medium">
                  Aktifkan Akses Login Pemesanan Online di Website
                </Label>
              </div>

              <div className="flex gap-2 pt-3 border-t">
                <Button type="button" variant="outline" className="flex-1" onClick={() => setShowAddCustomerModal(false)}>
                  Batal
                </Button>
                <Button type="submit" className="flex-1">
                  Daftarkan Member
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
