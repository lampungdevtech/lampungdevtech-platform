'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  QrCode,
  CheckCircle2,
  AlertTriangle,
  Search,
  Users,
  ArrowLeft,
  Sparkles,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

export default function EventCheckInPage() {
  const { toast } = useToast();
  const [qrToken, setQrToken] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [checkInResult, setCheckInResult] = useState<any>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // History check-in sesi ini di meja registrasi
  const [recentAttendees, setRecentAttendees] = useState<any[]>([
    {
      name: 'Rian Pratama',
      email: 'rian@lampungdev.org',
      eventName: 'Lampung Tech Summit 2026',
      time: '08:45 WIB',
      status: 'CHECKED_IN',
    },
    {
      name: 'Dewi Lestari',
      email: 'dewi@techcommunity.id',
      eventName: 'Lampung Tech Summit 2026',
      time: '08:52 WIB',
      status: 'CHECKED_IN',
    },
  ]);

  const handleCheckInSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!qrToken.trim()) return;

    setIsLoading(true);
    setErrorMessage(null);
    setCheckInResult(null);

    try {
      const res = await fetch('/api/events/check-in', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ qrToken: qrToken.trim() }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Gagal memproses check-in tiket.');
      }

      setCheckInResult(data);
      toast({
        title: 'Check-in Berhasil!',
        description: `Tiket valid untuk ${data.name || 'Peserta'}.`,
      });

      // Tambahkan ke history check-in
      setRecentAttendees((prev) => [
        {
          name: data.name || 'Peserta',
          email: data.email || '-',
          eventName: 'Lampung Tech Summit 2026',
          time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB',
          status: 'CHECKED_IN',
        },
        ...prev,
      ]);

      setQrToken('');
    } catch (err: any) {
      setErrorMessage(err.message);
      toast({
        variant: 'destructive',
        title: 'Check-in Gagal',
        description: err.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen py-10 bg-muted/20">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between">
          <Link
            href="/events"
            className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1.5 transition"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Kembali ke Daftar Event
          </Link>
          <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold border border-emerald-500/20">
            Meja Registrasi Hari-H
          </span>
        </div>

        {/* Header Desk */}
        <div className="bg-card p-6 rounded-2xl border shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center space-x-3.5">
            <div className="p-3 bg-primary/10 rounded-2xl text-primary">
              <QrCode className="h-7 w-7" />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-2xl font-bold tracking-tight">Scanner Check-in Peserta Event</h1>
                <span className="text-xs bg-primary/15 text-primary px-2.5 py-0.5 rounded-full font-semibold">
                  Panitia Desk
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                Validasi tiket registrasi peserta dan absensi kehadiran otomatis via MongoDB
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* SISI KIRI: FORM SCAN / INPUT KODE TIKET */}
          <div className="lg:col-span-7 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <Search className="w-4 h-4 text-primary" />
                  Pindai QR Code atau Masukkan Kode Tiket
                </CardTitle>
                <CardDescription className="text-xs">
                  Gunakan barcode scanner USB / Bluetooth, atau ketikkan kode QR Token tiket peserta.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleCheckInSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="qrToken" className="text-xs font-semibold">
                      Token QR Tiket Peserta
                    </Label>
                    <div className="mt-1 flex gap-2">
                      <Input
                        id="qrToken"
                        placeholder="Contoh: QR-01J... atau paste token QR tiket"
                        value={qrToken}
                        onChange={(e) => setQrToken(e.target.value)}
                        className="font-mono text-sm"
                        autoFocus
                      />
                      <Button type="submit" disabled={isLoading || !qrToken.trim()} className="font-bold">
                        {isLoading ? 'Memeriksa...' : 'Validasi'}
                      </Button>
                    </div>
                  </div>
                </form>

                {/* Status Sukses */}
                {checkInResult && (
                  <div className="mt-6 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-800 dark:text-emerald-200">
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                      <span className="font-bold text-sm">Tiket Valid & Terkonfirmasi Hadir!</span>
                    </div>
                    <div className="text-xs space-y-1 mt-2 text-muted-foreground font-mono">
                      <p>
                        <strong className="text-foreground">Nama:</strong> {checkInResult.name || 'Peserta Terdaftar'}
                      </p>
                      <p>
                        <strong className="text-foreground">Email:</strong> {checkInResult.email || '-'}
                      </p>
                      <p>
                        <strong className="text-foreground">Waktu Hadir:</strong>{' '}
                        {new Date().toLocaleTimeString('id-ID')} WIB
                      </p>
                    </div>
                  </div>
                )}

                {/* Status Error */}
                {errorMessage && (
                  <div className="mt-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-800 dark:text-red-200">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="w-5 h-5 text-red-500" />
                      <span className="font-bold text-sm">Validasi Tiket Gagal</span>
                    </div>
                    <p className="text-xs mt-1 text-red-600 dark:text-red-300">{errorMessage}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Panduan Panitia */}
            <div className="p-4 rounded-xl bg-muted/40 border text-xs text-muted-foreground space-y-2">
              <div className="flex items-center gap-2 text-foreground font-semibold">
                <Sparkles className="w-4 h-4 text-primary" />
                Tips Penggunaan di Hari-H:
              </div>
              <ul className="list-disc list-inside space-y-1 pl-1">
                <li>Scanner barcode fisik (USB/Bluetooth) akan otomatis menekan Enter setelah membaca QR.</li>
                <li>Sistem MongoDB menggunakan operator update atomik sehingga tiket tidak dapat digunakan ganda (*double check-in prevention*).</li>
                <li>Peserta yang berstatus *Waiting List* tidak dapat check-in sebelum kuotanya dikonfirmasi panitia.</li>
              </ul>
            </div>
          </div>

          {/* SISI KANAN: DAFTAR PESERTA CHECK-IN TERAKHIR */}
          <div className="lg:col-span-5 space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base font-bold flex items-center gap-2">
                    <Users className="w-4 h-4 text-primary" />
                    Kehadiran Terkini
                  </CardTitle>
                  <span className="text-xs px-2 py-0.5 rounded bg-muted font-bold text-primary">
                    {recentAttendees.length} Hadir
                  </span>
                </div>
                <CardDescription className="text-xs">
                  Riwayat peserta yang baru saja check-in di meja ini
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {recentAttendees.map((att, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl bg-muted/30 border flex items-center justify-between text-xs"
                    >
                      <div>
                        <h4 className="font-bold text-foreground">{att.name}</h4>
                        <span className="text-[11px] text-muted-foreground">{att.email}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-semibold">
                          {att.time}
                        </span>
                        <span className="block text-[10px] text-muted-foreground mt-0.5">Checked In</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
