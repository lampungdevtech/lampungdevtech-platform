'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import {
  AlertTriangle,
  Package,
  ShoppingCart,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  Truck,
} from 'lucide-react';
import { usePosOwnerStore } from './use-pos-owner-store';
import { RawMaterial } from './types';

interface TabInventoryProps {
  store: ReturnType<typeof usePosOwnerStore>;
}

export function TabInventory({ store }: TabInventoryProps) {
  const { toast } = useToast();
  const {
    materials,
    purchaseOrders,
    addMaterial,
    updateStock,
    deleteMaterial,
    createPurchaseOrder,
    updatePOStatus,
  } = store;

  // Bahan Baku yang di bawah safety stock
  const lowStockItems = materials.filter((m) => m.currentStock <= m.minStock);

  // Modal State: Tambah Bahan Baku
  const [showAddMaterialModal, setShowAddMaterialModal] = useState(false);
  const [materialForm, setMaterialForm] = useState({
    name: '',
    category: 'Coffee Beans',
    currentStock: '',
    minStock: '',
    unit: 'kg',
    unitCost: '',
    supplierName: '',
  });

  // Modal State: Buat PO Baru
  const [showPOModal, setShowPOModal] = useState(false);
  const [selectedMaterialId, setSelectedMaterialId] = useState(materials[0]?.id || '');
  const [poQuantity, setPoQuantity] = useState('10');
  const [poSupplier, setPoSupplier] = useState('');

  // Modal State: Edit Stok Opname
  const [editingStockMaterial, setEditingStockMaterial] = useState<RawMaterial | null>(null);
  const [newStockValue, setNewStockValue] = useState('');

  const handleAddMaterialSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!materialForm.name) return;
    addMaterial({
      name: materialForm.name,
      category: materialForm.category,
      currentStock: parseFloat(materialForm.currentStock) || 0,
      minStock: parseFloat(materialForm.minStock) || 5,
      unit: materialForm.unit,
      unitCost: parseInt(materialForm.unitCost.replace(/\D/g, ''), 10) || 0,
      supplierName: materialForm.supplierName || 'Supplier Umum',
    });
    setMaterialForm({
      name: '',
      category: 'Coffee Beans',
      currentStock: '',
      minStock: '',
      unit: 'kg',
      unitCost: '',
      supplierName: '',
    });
    setShowAddMaterialModal(false);
    toast({
      title: 'Bahan Baku Ditambahkan',
      description: `Bahan baku ${materialForm.name} berhasil disimpan ke master inventaris.`,
    });
  };

  const handleCreatePOSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const qty = parseFloat(poQuantity) || 1;
    createPurchaseOrder(selectedMaterialId, qty, poSupplier);
    setShowPOModal(false);
    setPoQuantity('10');
    toast({
      title: 'Purchase Order Diterbitkan',
      description: 'PO pengadaan bahan baku berhasil dibuat dan dikirim ke daftar antrean supplier.',
    });
  };

  const handleSaveStockOpname = () => {
    if (!editingStockMaterial) return;
    const val = parseFloat(newStockValue) || 0;
    updateStock(editingStockMaterial.id, val);
    setEditingStockMaterial(null);
    toast({
      title: 'Stok Opname Diperbarui',
      description: `Stok fisik ${editingStockMaterial.name} disesuaikan menjadi ${val} ${editingStockMaterial.unit}.`,
    });
  };

  const handleQuickPO = (mat: RawMaterial) => {
    setSelectedMaterialId(mat.id);
    const suggestedQty = (mat.minStock * 2 - mat.currentStock).toFixed(0);
    setPoQuantity(suggestedQty);
    setPoSupplier(mat.supplierName);
    setShowPOModal(true);
  };

  return (
    <div className="space-y-6">
      {/* 1. CRITICAL LOW STOCK ALERT BANNER */}
      {lowStockItems.length > 0 && (
        <Card className="border-red-500/30 bg-red-500/5 shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-red-500/10 rounded-xl text-red-600 dark:text-red-400 shrink-0">
                  <AlertTriangle className="w-5 h-5 animate-pulse" />
                </div>
                <div>
                  <CardTitle className="text-base font-bold text-red-600 dark:text-red-400">
                    Peringatan: {lowStockItems.length} Bahan Baku Menipis di Bawah Batas Aman!
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Segera terbitkan Purchase Order (PO) agar operasional kasir dan barista tidak terganggu.
                  </CardDescription>
                </div>
              </div>
              <Button
                size="sm"
                className="bg-red-600 hover:bg-red-700 text-white text-xs font-bold shrink-0"
                onClick={() => handleQuickPO(lowStockItems[0])}
              >
                <ShoppingCart className="w-3.5 h-3.5 mr-1.5" />
                Buat PO untuk {lowStockItems[0].name.split(' ')[0]}
              </Button>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
              {lowStockItems.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-background border border-red-500/20 shadow-xs"
                >
                  <div>
                    <p className="font-bold text-sm text-foreground">{item.name}</p>
                    <p className="text-xs text-red-600 dark:text-red-400 font-semibold mt-0.5">
                      Sisa: {item.currentStock} {item.unit} (Min: {item.minStock} {item.unit})
                    </p>
                    <span className="text-[10px] text-muted-foreground">{item.supplierName}</span>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-8 text-xs border-red-500/30 text-red-600 hover:bg-red-500/10"
                    onClick={() => handleQuickPO(item)}
                  >
                    Pesan PO
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* 2. MASTER BAHAN BAKU SECTION & ACTIONS */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div>
            <h3 className="text-lg font-bold flex items-center gap-2">
              <Package className="w-5 h-5 text-primary" />
              Master Bahan Baku & Stok Gudang (BOM)
            </h3>
            <p className="text-xs text-muted-foreground">
              Monitor kuantitas bahan baku, stok opname fisik, serta biaya pokok per unit.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline" onClick={() => setShowAddMaterialModal(true)} className="h-9 text-xs">
              <Plus className="w-4 h-4 mr-1.5" /> Tambah Bahan Baru
            </Button>
            <Button size="sm" onClick={() => setShowPOModal(true)} className="h-9 text-xs bg-primary font-semibold">
              <ShoppingCart className="w-4 h-4 mr-1.5" /> Buat Purchase Order
            </Button>
          </div>
        </div>

        {/* Tabel Master Bahan Baku */}
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-muted/50 text-muted-foreground uppercase text-[10px] font-bold border-b">
                  <tr>
                    <th className="py-3 px-4">Nama Bahan</th>
                    <th className="py-3 px-4">Kategori</th>
                    <th className="py-3 px-4 text-center">Stok Saat Ini</th>
                    <th className="py-3 px-4 text-center">Batas Minimum</th>
                    <th className="py-3 px-4 text-right">Biaya Satuan</th>
                    <th className="py-3 px-4">Supplier Utama</th>
                    <th className="py-3 px-4 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {materials.map((m) => {
                    const isLow = m.currentStock <= m.minStock;
                    return (
                      <tr key={m.id} className="hover:bg-muted/30 transition-colors">
                        <td className="py-3.5 px-4 font-bold text-sm text-foreground">
                          {m.name}
                          {isLow && (
                            <span className="ml-2 text-[10px] px-1.5 py-0.5 rounded bg-red-500/10 text-red-600 font-bold border border-red-500/20">
                              MENIPIS
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-muted-foreground">{m.category}</td>
                        <td className="py-3.5 px-4 text-center font-extrabold text-sm">
                          <span className={isLow ? 'text-red-600' : 'text-emerald-600'}>
                            {m.currentStock} {m.unit}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-center text-muted-foreground font-semibold">
                          {m.minStock} {m.unit}
                        </td>
                        <td className="py-3.5 px-4 text-right font-mono font-medium">
                          Rp {m.unitCost.toLocaleString('id-ID')} / {m.unit}
                        </td>
                        <td className="py-3.5 px-4 text-muted-foreground">{m.supplierName}</td>
                        <td className="py-3.5 px-4 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-7 text-xs"
                              onClick={() => {
                                setEditingStockMaterial(m);
                                setNewStockValue(m.currentStock.toString());
                              }}
                            >
                              <Edit2 className="w-3 h-3 mr-1" /> Opname
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 px-2 text-destructive hover:bg-destructive/10"
                              onClick={() => {
                                if (confirm(`Hapus bahan baku ${m.name}?`)) {
                                  deleteMaterial(m.id);
                                  toast({ title: 'Bahan Dihapus', description: `${m.name} telah dihapus.` });
                                }
                              }}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 3. RIWAYAT PURCHASE ORDERS (PO) SECTION */}
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-bold flex items-center gap-2">
            <Truck className="w-5 h-5 text-primary" />
            Riwayat Purchase Order (Pengadaan Bahan Baku)
          </h3>
          <p className="text-xs text-muted-foreground">
            Lacak pesanan barang masuk dari supplier. Saat status diubah menjadi &quot;Diterima&quot;, stok gudang otomatis bertambah.
          </p>
        </div>

        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-muted/50 text-muted-foreground uppercase text-[10px] font-bold border-b">
                  <tr>
                    <th className="py-3 px-4">No. PO</th>
                    <th className="py-3 px-4">Bahan Baku & Kuantitas</th>
                    <th className="py-3 px-4">Supplier</th>
                    <th className="py-3 px-4 text-right">Total Biaya</th>
                    <th className="py-3 px-4 text-center">Tanggal Pesan</th>
                    <th className="py-3 px-4 text-center">Status</th>
                    <th className="py-3 px-4 text-center">Aksi Verifikasi</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {purchaseOrders.map((po) => (
                    <tr key={po.id} className="hover:bg-muted/30 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-foreground">{po.poNumber}</td>
                      <td className="py-3 px-4 font-semibold text-foreground">{po.materialName}</td>
                      <td className="py-3 px-4 text-muted-foreground">{po.supplierName}</td>
                      <td className="py-3 px-4 text-right font-bold text-foreground font-mono">
                        Rp {po.totalCost.toLocaleString('id-ID')}
                      </td>
                      <td className="py-3 px-4 text-center text-muted-foreground">{po.orderDate}</td>
                      <td className="py-3 px-4 text-center">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            po.status === 'RECEIVED'
                              ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20'
                              : po.status === 'ORDERED'
                              ? 'bg-blue-500/10 text-blue-600 border border-blue-500/20'
                              : 'bg-amber-500/10 text-amber-600 border border-amber-500/20'
                          }`}
                        >
                          {po.status === 'RECEIVED' ? 'DITERIMA' : po.status === 'ORDERED' ? 'DALAM PENGIRIMAN' : 'DRAFT'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        {po.status !== 'RECEIVED' ? (
                          <Button
                            size="sm"
                            className="h-7 text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-semibold"
                            onClick={() => {
                              updatePOStatus(po.id, 'RECEIVED');
                              toast({
                                title: 'Barang PO Diterima!',
                                description: `${po.materialName} telah diterima. Stok bahan baku otomatis bertambah!`,
                              });
                            }}
                          >
                            <CheckCircle2 className="w-3 h-3 mr-1" /> Terima Barang
                          </Button>
                        ) : (
                          <span className="text-[11px] text-muted-foreground font-medium flex items-center justify-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Selesai
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* --- MODAL: BUAT PURCHASE ORDER (PO) BARU --- */}
      {showPOModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card w-full max-w-md rounded-2xl border p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="font-bold text-base flex items-center gap-2">
                <ShoppingCart className="w-5 h-5 text-primary" />
                Terbitkan Purchase Order (PO) Bahan Baku
              </h3>
              <button onClick={() => setShowPOModal(false)}>✕</button>
            </div>

            <form onSubmit={handleCreatePOSubmit} className="space-y-3 text-xs">
              <div>
                <Label>Pilih Bahan Baku yang Dipesan:</Label>
                <select
                  className="w-full h-9 rounded-md border border-input bg-background px-3 text-xs"
                  value={selectedMaterialId}
                  onChange={(e) => {
                    setSelectedMaterialId(e.target.value);
                    const mat = materials.find((m) => m.id === e.target.value);
                    if (mat) setPoSupplier(mat.supplierName);
                  }}
                >
                  {materials.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name} (Sisa: {m.currentStock} {m.unit} | Rp {m.unitCost.toLocaleString('id-ID')}/{m.unit})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <Label>Jumlah Kuantitas Pesanan:</Label>
                <Input
                  type="number"
                  step="any"
                  value={poQuantity}
                  onChange={(e) => setPoQuantity(e.target.value)}
                  required
                />
              </div>

              <div>
                <Label>Nama Supplier / Vendor:</Label>
                <Input
                  value={poSupplier}
                  onChange={(e) => setPoSupplier(e.target.value)}
                  placeholder="Nama supplier bahan baku"
                  required
                />
              </div>

              <div className="p-3 bg-muted/40 rounded-xl">
                <span className="text-muted-foreground">Estimasi Total Biaya PO:</span>
                <p className="text-base font-bold text-primary">
                  Rp{' '}
                  {(
                    (parseFloat(poQuantity) || 0) *
                    (materials.find((m) => m.id === selectedMaterialId)?.unitCost || 0)
                  ).toLocaleString('id-ID')}
                </p>
              </div>

              <div className="flex gap-2 pt-3 border-t">
                <Button type="button" variant="outline" className="flex-1" onClick={() => setShowPOModal(false)}>
                  Batal
                </Button>
                <Button type="submit" className="flex-1 bg-primary text-primary-foreground font-semibold">
                  Terbitkan PO
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL: TAMBAH BAHAN BAKU BARU --- */}
      {showAddMaterialModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card w-full max-w-md rounded-2xl border p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="font-bold text-base flex items-center gap-2">
                <Package className="w-5 h-5 text-primary" />
                Tambah Bahan Baku Baru
              </h3>
              <button onClick={() => setShowAddMaterialModal(false)}>✕</button>
            </div>

            <form onSubmit={handleAddMaterialSubmit} className="space-y-3 text-xs">
              <div>
                <Label>Nama Bahan Baku:</Label>
                <Input
                  placeholder="Contoh: Biji Kopi Robusta Tanggamus"
                  value={materialForm.name}
                  onChange={(e) => setMaterialForm({ ...materialForm, name: e.target.value })}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label>Kategori:</Label>
                  <select
                    className="w-full h-9 rounded-md border border-input bg-background px-3 text-xs"
                    value={materialForm.category}
                    onChange={(e) => setMaterialForm({ ...materialForm, category: e.target.value })}
                  >
                    <option value="Coffee Beans">Coffee Beans</option>
                    <option value="Dairy">Dairy & Milk</option>
                    <option value="Syrups">Syrups & Sauce</option>
                    <option value="Packaging">Cup & Packaging</option>
                    <option value="Food & Powder">Food & Powder</option>
                  </select>
                </div>
                <div>
                  <Label>Satuan (Unit):</Label>
                  <Input
                    placeholder="kg, liter, pcs, botol"
                    value={materialForm.unit}
                    onChange={(e) => setMaterialForm({ ...materialForm, unit: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label>Stok Awal:</Label>
                  <Input
                    type="number"
                    step="any"
                    placeholder="10"
                    value={materialForm.currentStock}
                    onChange={(e) => setMaterialForm({ ...materialForm, currentStock: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label>Batas Minimum (Safety):</Label>
                  <Input
                    type="number"
                    step="any"
                    placeholder="5"
                    value={materialForm.minStock}
                    onChange={(e) => setMaterialForm({ ...materialForm, minStock: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div>
                <Label>Harga Beli Satuan (Rp):</Label>
                <Input
                  type="number"
                  placeholder="120000"
                  value={materialForm.unitCost}
                  onChange={(e) => setMaterialForm({ ...materialForm, unitCost: e.target.value })}
                  required
                />
              </div>

              <div>
                <Label>Supplier / Vendor:</Label>
                <Input
                  placeholder="Nama supplier atau nomor kontak"
                  value={materialForm.supplierName}
                  onChange={(e) => setMaterialForm({ ...materialForm, supplierName: e.target.value })}
                />
              </div>

              <div className="flex gap-2 pt-3 border-t">
                <Button type="button" variant="outline" className="flex-1" onClick={() => setShowAddMaterialModal(false)}>
                  Batal
                </Button>
                <Button type="submit" className="flex-1">
                  Simpan Bahan Baku
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL: EDIT STOK OPNAME --- */}
      {editingStockMaterial && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card w-full max-w-sm rounded-2xl border p-5 shadow-2xl space-y-4">
            <h3 className="font-bold text-base">Stok Opname Fisik</h3>
            <p className="text-xs text-muted-foreground">
              Sesuaikan stok riil gudang untuk <strong>{editingStockMaterial.name}</strong>.
            </p>
            <div>
              <Label className="text-xs">Stok Fisik Saat Ini ({editingStockMaterial.unit}):</Label>
              <Input
                type="number"
                step="any"
                value={newStockValue}
                onChange={(e) => setNewStockValue(e.target.value)}
                className="font-bold text-sm"
              />
            </div>
            <div className="flex gap-2 pt-2">
              <Button variant="outline" size="sm" className="flex-1" onClick={() => setEditingStockMaterial(null)}>
                Batal
              </Button>
              <Button size="sm" className="flex-1" onClick={handleSaveStockOpname}>
                Simpan Penyesuaian
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
