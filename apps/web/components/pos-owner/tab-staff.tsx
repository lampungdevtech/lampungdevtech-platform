'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import {
  Users,
  Trophy,
  Calendar,
  Clock,
  Plus,
  CheckCircle2,
  AlertCircle,
  Star,
  Zap,
} from 'lucide-react';
import { usePosOwnerStore } from './use-pos-owner-store';
import { StaffShift } from './types';

interface TabStaffProps {
  store: ReturnType<typeof usePosOwnerStore>;
}

export function TabStaff({ store }: TabStaffProps) {
  const { toast } = useToast();
  const { shifts, kpis, addStaffShift, updateShift } = store;

  // Form State: Tambah Staf Baru
  const [showAddStaffModal, setShowAddStaffModal] = useState(false);
  const [newStaffForm, setNewStaffForm] = useState({
    name: '',
    email: '',
    role: 'CASHIER',
    branchId: '01-MAIN',
  });

  const handleCreateStaffSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStaffForm.name || !newStaffForm.email) return;

    // Generate PIN 6-digit
    const generatedPin = Math.floor(100000 + Math.random() * 900000).toString();

    // Add shift for today for this new staff
    addStaffShift({
      staffId: `STF-${Date.now().toString().slice(-4)}`,
      staffName: newStaffForm.name,
      role: newStaffForm.role,
      date: new Date().toISOString().split('T')[0],
      dayName: 'Hari Ini',
      shiftType: 'PAGI',
      shiftHours: '07:00 - 15:00',
      attendanceStatus: 'UPCOMING',
      lateMinutes: 0,
    });

    toast({
      title: 'Karyawan Baru Terdaftar!',
      description: `PIN Kasir ${newStaffForm.name}: ${generatedPin}. Berikan PIN ini untuk login kasir di tablet POS.`,
    });

    setNewStaffForm({ name: '', email: '', role: 'CASHIER', branchId: '01-MAIN' });
    setShowAddStaffModal(false);
  };

  const handleToggleShiftType = (shift: StaffShift) => {
    const nextType: StaffShift['shiftType'] =
      shift.shiftType === 'PAGI' ? 'MALAM' : shift.shiftType === 'MALAM' ? 'OFF' : 'PAGI';
    const nextHours =
      nextType === 'PAGI' ? '07:00 - 15:00' : nextType === 'MALAM' ? '15:00 - 23:00' : 'Libur (OFF)';
    updateShift(shift.id, { shiftType: nextType, shiftHours: nextHours });
    toast({
      title: 'Jadwal Shift Diperbarui',
      description: `${shift.staffName} dialihkan ke Shift ${nextType} (${nextHours}).`,
    });
  };

  return (
    <div className="space-y-6">
      {/* 1. TOP 3 KPI STAFF LEADERBOARD (PODIUM RANKING) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold flex items-center gap-2">
              <Trophy className="w-5 h-5 text-amber-500" />
              Papan Peringkat Kinerja Staf (Top 3 KPI Leaderboard)
            </h3>
            <p className="text-xs text-muted-foreground">
              Evaluasi staf terbaik bulan ini berdasarkan omset, kecepatan transaksi, dan kepuasan pelanggan
            </p>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-600 border border-amber-500/20 flex items-center gap-1">
            <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" /> Top Performer Rewards
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {kpis.map((staff) => (
            <Card
              key={staff.staffId}
              className={`relative overflow-hidden border-2 transition-all hover:shadow-md ${
                staff.rank === 1
                  ? 'border-amber-400 bg-gradient-to-b from-amber-500/5 to-transparent'
                  : staff.rank === 2
                  ? 'border-slate-300 dark:border-slate-700 bg-gradient-to-b from-slate-500/5 to-transparent'
                  : 'border-amber-700/50 bg-gradient-to-b from-amber-800/5 to-transparent'
              }`}
            >
              <div
                className={`absolute top-0 right-0 px-3 py-1 rounded-bl-xl text-[11px] font-black uppercase text-white flex items-center gap-1 ${
                  staff.rank === 1
                    ? 'bg-amber-500'
                    : staff.rank === 2
                    ? 'bg-slate-500'
                    : 'bg-amber-800'
                }`}
              >
                <Trophy className="w-3 h-3" />
                Juara #{staff.rank}
              </div>

              <CardHeader className="pb-2">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center font-extrabold text-lg text-white shadow-sm ${
                      staff.rank === 1
                        ? 'bg-amber-500'
                        : staff.rank === 2
                        ? 'bg-slate-500'
                        : 'bg-amber-800'
                    }`}
                  >
                    {staff.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <CardTitle className="text-base font-bold">{staff.name}</CardTitle>
                    <p className="text-xs text-muted-foreground">{staff.role}</p>
                    <div className="flex items-center gap-1 text-amber-500 text-xs mt-0.5">
                      <Star className="w-3 h-3 fill-amber-500" />
                      <span className="font-bold text-foreground">{staff.customerRating}</span>
                      <span className="text-muted-foreground text-[10px]">/ 5.0</span>
                    </div>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-2.5 pt-1 text-xs">
                <div className="grid grid-cols-2 gap-2 bg-muted/40 p-2.5 rounded-xl border">
                  <div>
                    <span className="text-[10px] text-muted-foreground uppercase font-bold">Omset Kasir:</span>
                    <p className="font-extrabold text-sm text-foreground">
                      Rp {staff.totalRevenue.toLocaleString('id-ID')}
                    </p>
                  </div>
                  <div>
                    <span className="text-[10px] text-muted-foreground uppercase font-bold">Pesanan:</span>
                    <p className="font-extrabold text-sm text-primary">{staff.ordersServed} Struk</p>
                  </div>
                </div>

                <div className="flex justify-between items-center text-muted-foreground pt-1 text-[11px]">
                  <span className="flex items-center gap-1">
                    <Zap className="w-3.5 h-3.5 text-amber-500" /> Kecepatan Transaksi:
                  </span>
                  <span className="font-bold text-foreground font-mono">{staff.avgSpeedMinutes} menit/pesanan</span>
                </div>

                <div className="flex justify-between items-center text-muted-foreground text-[11px]">
                  <span>Selisih Kas (*Discrepancy*):</span>
                  <span className={`font-bold ${staff.cashDiscrepancy === 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                    {staff.cashDiscrepancy === 0 ? 'Rp 0 (Sempurna)' : `- Rp ${Math.abs(staff.cashDiscrepancy).toLocaleString('id-ID')}`}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* 2. JADWAL 7 HARI MENDATANG & PRESENSI KETERLAMBATAN */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div>
            <h3 className="text-lg font-bold flex items-center gap-2">
              <Calendar className="w-5 h-5 text-primary" />
              Roster Jadwal Kerja 7 Hari & Pemantau Presensi
            </h3>
            <p className="text-xs text-muted-foreground">
              Dua shift dinamis (Shift Pagi: 07:00 - 15:00 & Shift Malam: 15:00 - 23:00). Klik tombol shift untuk rotasi.
            </p>
          </div>
          <Button size="sm" onClick={() => setShowAddStaffModal(true)} className="h-9 text-xs">
            <Plus className="w-4 h-4 mr-1.5" /> Tambah Staf Baru
          </Button>
        </div>

        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-muted/50 text-muted-foreground uppercase text-[10px] font-bold border-b">
                  <tr>
                    <th className="py-3 px-4">Nama Staf</th>
                    <th className="py-3 px-4">Posisi</th>
                    <th className="py-3 px-4">Hari & Tanggal</th>
                    <th className="py-3 px-4 text-center">Tipe Shift</th>
                    <th className="py-3 px-4 text-center">Jam Kerja</th>
                    <th className="py-3 px-4 text-center">Status Kehadiran</th>
                    <th className="py-3 px-4 text-center">Aksi Roster</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {shifts.map((s) => (
                    <tr key={s.id} className="hover:bg-muted/30 transition-colors">
                      <td className="py-3 px-4 font-bold text-sm text-foreground">{s.staffName}</td>
                      <td className="py-3 px-4 text-muted-foreground">{s.role}</td>
                      <td className="py-3 px-4">
                        <span className="font-semibold text-foreground">{s.dayName}</span>
                        <span className="text-[11px] text-muted-foreground block font-mono">{s.date}</span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold ${
                            s.shiftType === 'PAGI'
                              ? 'bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/30'
                              : s.shiftType === 'MALAM'
                              ? 'bg-blue-500/15 text-blue-700 dark:text-blue-400 border border-blue-500/30'
                              : 'bg-muted text-muted-foreground'
                          }`}
                        >
                          SHIFT {s.shiftType}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center font-mono font-medium">{s.shiftHours}</td>
                      <td className="py-3 px-4 text-center">
                        {s.attendanceStatus === 'ON_TIME' && (
                          <span className="inline-flex items-center gap-1 text-emerald-600 font-bold text-[11px]">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Hadir Tepat Waktu
                          </span>
                        )}
                        {s.attendanceStatus === 'LATE' && (
                          <span className="inline-flex items-center gap-1 text-red-600 font-bold text-[11px]">
                            <AlertCircle className="w-3.5 h-3.5" /> Terlambat {s.lateMinutes} menit
                          </span>
                        )}
                        {s.attendanceStatus === 'UPCOMING' && (
                          <span className="inline-flex items-center gap-1 text-muted-foreground text-[11px]">
                            <Clock className="w-3.5 h-3.5" /> Belum Mulai
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-7 text-[11px]"
                          onClick={() => handleToggleShiftType(s)}
                        >
                          Rotasi Shift
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

      {/* --- MODAL: TAMBAH STAF BARU --- */}
      {showAddStaffModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card w-full max-w-md rounded-2xl border p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="font-bold text-base flex items-center gap-2">
                <Users className="w-5 h-5 text-primary" />
                Registrasi Karyawan Kasir / Barista Baru
              </h3>
              <button onClick={() => setShowAddStaffModal(false)}>✕</button>
            </div>

            <form onSubmit={handleCreateStaffSubmit} className="space-y-3 text-xs">
              <div>
                <Label>Nama Lengkap Karyawan:</Label>
                <Input
                  placeholder="Contoh: Dimas Aditya"
                  value={newStaffForm.name}
                  onChange={(e) => setNewStaffForm({ ...newStaffForm, name: e.target.value })}
                  required
                />
              </div>

              <div>
                <Label>Email Kerja Karyawan:</Label>
                <Input
                  type="email"
                  placeholder="dimas@kopitemu.com"
                  value={newStaffForm.email}
                  onChange={(e) => setNewStaffForm({ ...newStaffForm, email: e.target.value })}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label>Posisi / Role:</Label>
                  <select
                    className="w-full h-9 rounded-md border border-input bg-background px-3 text-xs"
                    value={newStaffForm.role}
                    onChange={(e) => setNewStaffForm({ ...newStaffForm, role: e.target.value })}
                  >
                    <option value="CASHIER">Kasir (CASHIER)</option>
                    <option value="BARISTA">Barista (BARISTA)</option>
                    <option value="BRANCH_MANAGER">Branch Manager</option>
                  </select>
                </div>
                <div>
                  <Label>Penempatan Cabang:</Label>
                  <select
                    className="w-full h-9 rounded-md border border-input bg-background px-3 text-xs"
                    value={newStaffForm.branchId}
                    onChange={(e) => setNewStaffForm({ ...newStaffForm, branchId: e.target.value })}
                  >
                    <option value="01-MAIN">Cabang 01: Enggal</option>
                    <option value="02-KEMILING">Cabang 02: Kemiling</option>
                  </select>
                </div>
              </div>

              <p className="text-[11px] text-muted-foreground p-2.5 bg-muted/40 rounded-xl">
                💡 Sistem akan secara otomatis men-generate **PIN 6-digit rahasia** untuk karyawan ini agar dapat login di tablet kasir.
              </p>

              <div className="flex gap-2 pt-3 border-t">
                <Button type="button" variant="outline" className="flex-1" onClick={() => setShowAddStaffModal(false)}>
                  Batal
                </Button>
                <Button type="submit" className="flex-1">
                  Daftarkan Staf
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
