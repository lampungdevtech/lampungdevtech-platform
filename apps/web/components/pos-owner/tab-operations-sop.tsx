'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import {
  Car,
  FileText,
  Plus,
  Trash2,
  Activity,
  Wrench,
} from 'lucide-react';
import { usePosOwnerStore } from './use-pos-owner-store';
import { AssetRecord, SopItem } from './types';

interface TabOperationsSopProps {
  store: ReturnType<typeof usePosOwnerStore>;
}

export function TabOperationsSop({ store }: TabOperationsSopProps) {
  const { toast } = useToast();
  const {
    parkings,
    assets,
    sops,
    logs,
    addAsset,
    updateAssetCondition,
    deleteAsset,
    addSop,
    toggleSopStep,
    addParkingRecord,
  } = store;

  // Modal State: Tambah Aset Baru
  const [showAddAssetModal, setShowAddAssetModal] = useState(false);
  const [assetForm, setAssetForm] = useState({
    name: '',
    assetCode: '',
    category: 'EQUIPMENT' as AssetRecord['category'],
    brandModel: '',
    acquisitionCost: '',
    condition: 'EXCELLENT' as AssetRecord['condition'],
  });

  // Modal State: Tambah SOP Baru
  const [showAddSopModal, setShowAddSopModal] = useState(false);
  const [sopForm, setSopForm] = useState({
    title: '',
    category: 'OPENING' as SopItem['category'],
    estimatedMinutes: '15',
    targetRole: 'Kasir',
    rawSteps: '',
  });

  // Modal State: Input Parkir Mingguan
  const [showAddParkingModal, setShowAddParkingModal] = useState(false);
  const [parkingForm, setParkingForm] = useState({
    weekRange: '21 Sep - 27 Sep 2026',
    motorCount: '1200',
    mobilCount: '250',
    grossRevenue: '3500000',
    keeperName: 'Pak Sukirno',
  });

  const handleAddAssetSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!assetForm.name) return;
    addAsset({
      name: assetForm.name,
      assetCode: assetForm.assetCode || `AST-${Math.floor(100 + Math.random() * 900)}`,
      category: assetForm.category,
      brandModel: assetForm.brandModel || 'Standard',
      branchId: '01-MAIN',
      purchaseDate: new Date().toISOString().split('T')[0],
      acquisitionCost: parseInt(assetForm.acquisitionCost.replace(/\D/g, ''), 10) || 0,
      condition: assetForm.condition,
    });
    setAssetForm({
      name: '',
      assetCode: '',
      category: 'EQUIPMENT',
      brandModel: '',
      acquisitionCost: '',
      condition: 'EXCELLENT',
    });
    setShowAddAssetModal(false);
    toast({ title: 'Aset Berhasil Dicatat', description: `${assetForm.name} tersimpan dalam inventaris aset toko.` });
  };

  const handleAddSopSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!sopForm.title) return;
    const stepsArray = sopForm.rawSteps
      .split('\n')
      .filter((s) => s.trim().length > 0)
      .map((text, idx) => ({ id: `stp-${Date.now()}-${idx}`, text: text.trim(), done: false }));

    addSop({
      title: sopForm.title,
      category: sopForm.category,
      estimatedMinutes: parseInt(sopForm.estimatedMinutes, 10) || 15,
      targetRole: sopForm.targetRole,
      steps: stepsArray.length > 0 ? stepsArray : [{ id: 'stp-def', text: 'Langkah pertama SOP', done: false }],
    });

    setSopForm({ title: '', category: 'OPENING', estimatedMinutes: '15', targetRole: 'Kasir', rawSteps: '' });
    setShowAddSopModal(false);
    toast({ title: 'SOP Baru Dibuat', description: `Dokumen SOP ${sopForm.title} kini aktif untuk staf.` });
  };

  const handleAddParkingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const gross = parseInt(parkingForm.grossRevenue.replace(/\D/g, ''), 10) || 0;
    addParkingRecord({
      weekRange: parkingForm.weekRange,
      totalVehiclesMotor: parseInt(parkingForm.motorCount, 10) || 0,
      totalVehiclesMobil: parseInt(parkingForm.mobilCount, 10) || 0,
      grossRevenue: gross,
      storeSharePercent: 60,
      keeperSharePercent: 40,
      keeperName: parkingForm.keeperName,
      status: 'PENDING',
    });
    setShowAddParkingModal(false);
    toast({ title: 'Setoran Parkir Dicatat', description: `Laporan parkir mingguan Rp ${gross.toLocaleString('id-ID')} tersimpan.` });
  };

  return (
    <div className="space-y-6">
      {/* 1. PARKIR MINGGUAN & PEMBAGIAN HASIL */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div>
            <h3 className="text-lg font-bold flex items-center gap-2">
              <Car className="w-5 h-5 text-emerald-600" />
              Retribusi Parkir Mingguan & Pembagian Hasil
            </h3>
            <p className="text-xs text-muted-foreground">
              Skema pembagian hasil parkir toko: <strong>60% Pemilik Toko</strong> vs <strong>40% Juru Parkir</strong>.
            </p>
          </div>
          <Button size="sm" onClick={() => setShowAddParkingModal(true)} className="h-9 text-xs">
            <Plus className="w-4 h-4 mr-1.5" /> Input Laporan Parkir Mingguan
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {parkings.map((p) => (
            <Card key={p.id} className="border">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-sm font-bold">{p.weekRange}</CardTitle>
                    <CardDescription className="text-xs">{p.keeperName}</CardDescription>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      p.status === 'SETTLED'
                        ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20'
                        : 'bg-amber-500/10 text-amber-600 border border-amber-500/20'
                    }`}
                  >
                    {p.status === 'SETTLED' ? 'SUDAH DIBAGI (SETTLED)' : 'BERJALAN'}
                  </span>
                </div>
              </CardHeader>
              <CardContent className="space-y-3 text-xs pt-1">
                <div className="p-3 bg-muted/40 rounded-xl flex justify-between items-center">
                  <span className="text-muted-foreground font-medium">Total Bruto Parkir:</span>
                  <span className="text-base font-extrabold text-foreground font-mono">
                    Rp {p.grossRevenue.toLocaleString('id-ID')}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="p-2.5 rounded-lg border border-emerald-500/30 bg-emerald-500/5">
                    <span className="text-[10px] text-emerald-700 dark:text-emerald-400 font-bold uppercase">
                      Bagian Toko (60%):
                    </span>
                    <p className="text-sm font-extrabold text-emerald-700 dark:text-emerald-400 mt-0.5">
                      Rp {p.storeNet.toLocaleString('id-ID')}
                    </p>
                  </div>
                  <div className="p-2.5 rounded-lg border border-blue-500/30 bg-blue-500/5">
                    <span className="text-[10px] text-blue-700 dark:text-blue-400 font-bold uppercase">
                      Juru Parkir (40%):
                    </span>
                    <p className="text-sm font-extrabold text-blue-700 dark:text-blue-400 mt-0.5">
                      Rp {p.keeperNet.toLocaleString('id-ID')}
                    </p>
                  </div>
                </div>
                <div className="flex justify-between text-[11px] text-muted-foreground pt-1">
                  <span>Estimasi Motor: {p.totalVehiclesMotor} unit</span>
                  <span>Estimasi Mobil: {p.totalVehiclesMobil} unit</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* 2. KELOLA ASET & INVENTARIS TOKO */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div>
            <h3 className="text-lg font-bold flex items-center gap-2">
              <Wrench className="w-5 h-5 text-primary" />
              Kelola Aset & Peralatan Toko (Asset Management)
            </h3>
            <p className="text-xs text-muted-foreground">
              Pencatatan mesin kopi komersial, grinder, tablet POS, kulkas, AC, dan kondisi servis.
            </p>
          </div>
          <Button size="sm" onClick={() => setShowAddAssetModal(true)} className="h-9 text-xs">
            <Plus className="w-4 h-4 mr-1.5" /> Tambah Aset Baru
          </Button>
        </div>

        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-muted/50 text-muted-foreground uppercase text-[10px] font-bold border-b">
                  <tr>
                    <th className="py-3 px-4">Kode & Nama Aset</th>
                    <th className="py-3 px-4">Kategori / Merk</th>
                    <th className="py-3 px-4 text-right">Nilai Perolehan</th>
                    <th className="py-3 px-4 text-center">Tanggal Beli</th>
                    <th className="py-3 px-4 text-center">Status Kondisi</th>
                    <th className="py-3 px-4 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {assets.map((ast) => (
                    <tr key={ast.id} className="hover:bg-muted/30 transition-colors">
                      <td className="py-3 px-4">
                        <span className="font-bold text-sm text-foreground block">{ast.name}</span>
                        <span className="text-[11px] font-mono text-muted-foreground">{ast.assetCode}</span>
                      </td>
                      <td className="py-3 px-4 text-muted-foreground">
                        {ast.brandModel} ({ast.category})
                      </td>
                      <td className="py-3 px-4 text-right font-bold text-foreground font-mono">
                        Rp {ast.acquisitionCost.toLocaleString('id-ID')}
                      </td>
                      <td className="py-3 px-4 text-center text-muted-foreground">{ast.purchaseDate}</td>
                      <td className="py-3 px-4 text-center">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                            ast.condition === 'EXCELLENT'
                              ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20'
                              : ast.condition === 'GOOD'
                              ? 'bg-blue-500/10 text-blue-600 border border-blue-500/20'
                              : 'bg-amber-500/10 text-amber-600 border border-amber-500/20'
                          }`}
                        >
                          {ast.condition}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-7 text-xs"
                            onClick={() => {
                              const nextCondition =
                                ast.condition === 'EXCELLENT'
                                  ? 'GOOD'
                                  : ast.condition === 'GOOD'
                                  ? 'NEEDS_SERVICE'
                                  : 'EXCELLENT';
                              updateAssetCondition(ast.id, nextCondition);
                              toast({ title: 'Status Aset Diperbarui', description: `${ast.name}: ${nextCondition}` });
                            }}
                          >
                            Update Kondisi
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 px-2 text-destructive hover:bg-destructive/10"
                            onClick={() => {
                              if (confirm(`Hapus aset ${ast.name}?`)) {
                                deleteAsset(ast.id);
                                toast({ title: 'Aset Dihapus', description: `${ast.name} dikeluarkan dari inventaris.` });
                              }
                            }}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 3. SOP MANAGEMENT (STANDARDS & CHECKLISTS) */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div>
            <h3 className="text-lg font-bold flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary" />
              SOP Management & Panduan Kerja Staf
            </h3>
            <p className="text-xs text-muted-foreground">
              Standar Operasional Prosedur untuk menjaga konsistensi rasa kopi, kebersihan, dan akurasi kasir.
            </p>
          </div>
          <Button size="sm" onClick={() => setShowAddSopModal(true)} className="h-9 text-xs">
            <Plus className="w-4 h-4 mr-1.5" /> Buat SOP Baru
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {sops.map((sop) => (
            <Card key={sop.id} className="border flex flex-col justify-between">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start gap-2">
                  <CardTitle className="text-sm font-bold leading-tight">{sop.title}</CardTitle>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-primary/10 text-primary font-semibold shrink-0">
                    {sop.targetRole}
                  </span>
                </div>
                <CardDescription className="text-xs">Waktu estimasi: ~{sop.estimatedMinutes} menit</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2 text-xs pt-0 flex-1">
                <div className="space-y-2 pt-2 border-t">
                  {sop.steps.map((step) => (
                    <label
                      key={step.id}
                      className="flex items-start gap-2 cursor-pointer hover:bg-muted/30 p-1.5 rounded-lg transition-colors"
                    >
                      <input
                        type="checkbox"
                        checked={step.done}
                        onChange={() => toggleSopStep(sop.id, step.id)}
                        className="mt-0.5 rounded"
                      />
                      <span className={`text-[11px] ${step.done ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
                        {step.text}
                      </span>
                    </label>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* 4. LIVE AUDIT TRAIL (LOG AKTIVITAS REAL-TIME) */}
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-bold flex items-center gap-2">
            <Activity className="w-5 h-5 text-primary" />
            Live Audit Trail (Log Akses & Login Sistem Real-Time)
          </h3>
          <p className="text-xs text-muted-foreground">
            Mencatat setiap sesi login staf kasir, barista, perubahan shift, dan verifikasi keamanan Turnstile.
          </p>
        </div>

        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-muted/50 text-muted-foreground uppercase text-[10px] font-bold border-b">
                  <tr>
                    <th className="py-3 px-4">Waktu (WIB)</th>
                    <th className="py-3 px-4">Nama Akun & Role</th>
                    <th className="py-3 px-4">Cabang</th>
                    <th className="py-3 px-4">Aktivitas yang Dilakukan</th>
                    <th className="py-3 px-4">Perangkat & IP Address</th>
                    <th className="py-3 px-4 text-center">Status Keamanan</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {logs.map((lg) => (
                    <tr key={lg.id} className="hover:bg-muted/30 transition-colors">
                      <td className="py-3 px-4 font-mono text-muted-foreground">{lg.timestamp}</td>
                      <td className="py-3 px-4 font-bold text-foreground">
                        {lg.userName}
                        <span className="block text-[10px] text-muted-foreground font-normal">{lg.role}</span>
                      </td>
                      <td className="py-3 px-4 text-muted-foreground">{lg.branchName}</td>
                      <td className="py-3 px-4 font-medium text-foreground">{lg.action}</td>
                      <td className="py-3 px-4 text-[11px] text-muted-foreground">
                        <span className="block text-foreground font-semibold">{lg.deviceInfo}</span>
                        <span className="font-mono text-[10px]">{lg.ipAddress}</span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            lg.status === 'SUCCESS'
                              ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20'
                              : 'bg-amber-500/10 text-amber-600 border border-amber-500/20'
                          }`}
                        >
                          {lg.status === 'SUCCESS' ? 'VERIFIED' : 'FLAGGED'}
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

      {/* --- MODAL: TAMBAH ASET BARU --- */}
      {showAddAssetModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card w-full max-w-md rounded-2xl border p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="font-bold text-base flex items-center gap-2">
                <Wrench className="w-5 h-5 text-primary" />
                Daftarkan Aset Toko Baru
              </h3>
              <button onClick={() => setShowAddAssetModal(false)}>✕</button>
            </div>

            <form onSubmit={handleAddAssetSubmit} className="space-y-3 text-xs">
              <div>
                <Label>Nama Peralatan / Aset:</Label>
                <Input
                  placeholder="Contoh: Mesin Espresso Sanremo Zoe 2-Group"
                  value={assetForm.name}
                  onChange={(e) => setAssetForm({ ...assetForm, name: e.target.value })}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label>Kategori:</Label>
                  <select
                    className="w-full h-9 rounded-md border border-input bg-background px-3 text-xs"
                    value={assetForm.category}
                    onChange={(e) => setAssetForm({ ...assetForm, category: e.target.value as any })}
                  >
                    <option value="EQUIPMENT">Equipment Kopi</option>
                    <option value="ELECTRONICS">Elektronik POS</option>
                    <option value="FURNITURE">Mebel & Meja</option>
                    <option value="UTILITY">Utilitas (Genset/AC)</option>
                  </select>
                </div>
                <div>
                  <Label>Kode Tag Aset:</Label>
                  <Input
                    placeholder="EQ-SAN-01"
                    value={assetForm.assetCode}
                    onChange={(e) => setAssetForm({ ...assetForm, assetCode: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <Label>Merk & Model:</Label>
                <Input
                  placeholder="Sanremo / Italy 2025"
                  value={assetForm.brandModel}
                  onChange={(e) => setAssetForm({ ...assetForm, brandModel: e.target.value })}
                />
              </div>

              <div>
                <Label>Biaya Perolehan Aset (Rp):</Label>
                <Input
                  type="number"
                  placeholder="65000000"
                  value={assetForm.acquisitionCost}
                  onChange={(e) => setAssetForm({ ...assetForm, acquisitionCost: e.target.value })}
                  required
                />
              </div>

              <div className="flex gap-2 pt-3 border-t">
                <Button type="button" variant="outline" className="flex-1" onClick={() => setShowAddAssetModal(false)}>
                  Batal
                </Button>
                <Button type="submit" className="flex-1">
                  Simpan Aset
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL: TAMBAH SOP BARU --- */}
      {showAddSopModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card w-full max-w-md rounded-2xl border p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="font-bold text-base flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary" />
                Buat Dokumen SOP Baru
              </h3>
              <button onClick={() => setShowAddSopModal(false)}>✕</button>
            </div>

            <form onSubmit={handleAddSopSubmit} className="space-y-3 text-xs">
              <div>
                <Label>Judul SOP:</Label>
                <Input
                  placeholder="Contoh: SOP Penutupan Dapur & Cuci Portafilter"
                  value={sopForm.title}
                  onChange={(e) => setSopForm({ ...sopForm, title: e.target.value })}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label>Kategori SOP:</Label>
                  <select
                    className="w-full h-9 rounded-md border border-input bg-background px-3 text-xs"
                    value={sopForm.category}
                    onChange={(e) => setSopForm({ ...sopForm, category: e.target.value as any })}
                  >
                    <option value="OPENING">Buka Toko</option>
                    <option value="CLOSING">Tutup Toko</option>
                    <option value="BREWING">Penyeduhan Kopi</option>
                    <option value="HYGIENE">Sanitasi & Kebersihan</option>
                  </select>
                </div>
                <div>
                  <Label>Target Staf:</Label>
                  <Input
                    placeholder="Barista & Kasir"
                    value={sopForm.targetRole}
                    onChange={(e) => setSopForm({ ...sopForm, targetRole: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <Label>Langkah-Langkah Kerja (Pisahkan dengan Enter per baris):</Label>
                <textarea
                  className="w-full h-24 rounded-md border border-input bg-background p-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="1. Matikan saklar mesin espresso&#10;2. Bersihkan drip tray&#10;3. Rendam portafilter dengan chemical cafiza"
                  value={sopForm.rawSteps}
                  onChange={(e) => setSopForm({ ...sopForm, rawSteps: e.target.value })}
                  required
                />
              </div>

              <div className="flex gap-2 pt-3 border-t">
                <Button type="button" variant="outline" className="flex-1" onClick={() => setShowAddSopModal(false)}>
                  Batal
                </Button>
                <Button type="submit" className="flex-1">
                  Simpan SOP
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL: INPUT PARKIR MINGGUAN --- */}
      {showAddParkingModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card w-full max-w-md rounded-2xl border p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="font-bold text-base flex items-center gap-2">
                <Car className="w-5 h-5 text-emerald-600" />
                Catat Penerimaan Parkir Mingguan
              </h3>
              <button onClick={() => setShowAddParkingModal(false)}>✕</button>
            </div>

            <form onSubmit={handleAddParkingSubmit} className="space-y-3 text-xs">
              <div>
                <Label>Periode Minggu (Rentang Tanggal):</Label>
                <Input
                  value={parkingForm.weekRange}
                  onChange={(e) => setParkingForm({ ...parkingForm, weekRange: e.target.value })}
                  required
                />
              </div>

              <div>
                <Label>Total Penerimaan Bruto Parkir (Rp):</Label>
                <Input
                  type="number"
                  placeholder="3500000"
                  value={parkingForm.grossRevenue}
                  onChange={(e) => setParkingForm({ ...parkingForm, grossRevenue: e.target.value })}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label>Estimasi Jumlah Motor:</Label>
                  <Input
                    type="number"
                    value={parkingForm.motorCount}
                    onChange={(e) => setParkingForm({ ...parkingForm, motorCount: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Estimasi Jumlah Mobil:</Label>
                  <Input
                    type="number"
                    value={parkingForm.mobilCount}
                    onChange={(e) => setParkingForm({ ...parkingForm, mobilCount: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <Label>Nama Juru Parkir / Koordinator:</Label>
                <Input
                  value={parkingForm.keeperName}
                  onChange={(e) => setParkingForm({ ...parkingForm, keeperName: e.target.value })}
                />
              </div>

              <div className="flex gap-2 pt-3 border-t">
                <Button type="button" variant="outline" className="flex-1" onClick={() => setShowAddParkingModal(false)}>
                  Batal
                </Button>
                <Button type="submit" className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white">
                  Simpan Laporan Parkir
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
