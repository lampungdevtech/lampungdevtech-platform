'use client';

import { useState, useEffect } from 'react';
import { Link } from '@/i18n/routing';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import {
  ShieldCheck,
  CheckCircle,
  XCircle,
  Clock,
  Store,
  MapPin,
  DollarSign,
  Trash2,
  Sparkles,
  LayoutDashboard,
} from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

interface Application {
  id: string;
  ownerName: string;
  email: string;
  phone: string;
  brandName: string;
  concept: string;
  initialBranchAddress: string;
  estimatedCapex: number;
  targetCupsPerDay: number;
  status: 'PENDING_APPROVAL' | 'APPROVED' | 'REJECTED';
  appliedAt: string;
}

export default function AdminMitraPage() {
  const { toast } = useToast();
  const [applications, setApplications] = useState<Application[]>([]);
  const [filter, setFilter] = useState<'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED'>('ALL');
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [isDemoActionLoading, setIsDemoActionLoading] = useState(false);

  const fetchApplications = async () => {
    try {
      const res = await fetch('/api/pos/applications');
      if (res.ok) {
        const data = await res.json();
        setApplications(data);
      }
    } catch (err) {
      console.warn('Gagal memuat data pengajuan mitra:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  const handleCleanDemoData = async () => {
    setIsDemoActionLoading(true);
    try {
      const res = await fetch('/api/admin/demo-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'clean' }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Gagal membersihkan data demo');

      toast({
        title: 'Data Demo Berhasil Dibersihkan!',
        description: data.message || 'Semua koleksi pengujian telah dikosongkan.',
      });
      await fetchApplications();
    } catch (err: any) {
      toast({
        variant: 'destructive',
        title: 'Gagal Membersihkan Data',
        description: err.message,
      });
    } finally {
      setIsDemoActionLoading(false);
    }
  };

  const handleSeedDemoData = async () => {
    setIsDemoActionLoading(true);
    try {
      const res = await fetch('/api/admin/demo-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'seed' }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Gagal memasukkan data seeder');

      toast({
        title: 'Data Seeder Berhasil Dimuat!',
        description: `${data.message} (${data.counts?.events ?? 0} Events, ${data.counts?.posApplications ?? 0} Mitra)`,
      });
      await fetchApplications();
    } catch (err: any) {
      toast({
        variant: 'destructive',
        title: 'Gagal Memuat Seeder',
        description: err.message,
      });
    } finally {
      setIsDemoActionLoading(false);
    }
  };

  const handleUpdateStatus = async (id: string, newStatus: 'APPROVED' | 'REJECTED') => {
    setActionLoading(id);
    try {
      const res = await fetch(`/api/pos/applications/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!res.ok) throw new Error('Gagal memperbarui status');

      setApplications((prev) =>
        prev.map((app) => (app.id === id ? { ...app, status: newStatus } : app))
      );

      toast({
        title: newStatus === 'APPROVED' ? 'Mitra Disetujui!' : 'Pengajuan Ditolak',
        description: `Pengajuan mitra #${id} telah diubah menjadi ${newStatus}.`,
      });
    } catch (err: any) {
      toast({
        variant: 'destructive',
        title: 'Gagal',
        description: err.message,
      });
    } finally {
      setActionLoading(null);
    }
  };

  const filtered = applications.filter((app) => {
    if (filter === 'ALL') return true;
    if (filter === 'PENDING') return app.status === 'PENDING_APPROVAL';
    return app.status === filter;
  });

  return (
    <div className="min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b pb-6">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-primary/10 rounded-xl text-primary">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <Link
                  href="/admin"
                  className="text-xs text-primary font-medium hover:underline flex items-center gap-1 mb-0.5"
                >
                  <LayoutDashboard className="h-3 w-3" />
                  Pusat Admin
                </Link>
                <span className="text-xs text-muted-foreground">•</span>
                <span className="text-xs text-muted-foreground">Portal Mitra POS</span>
              </div>
              <h1 className="text-3xl font-bold tracking-tight">Portal Super Admin: Pengajuan Mitra POS</h1>
              <p className="text-sm text-muted-foreground mt-0.5">
                Tinjau dan berikan peran <strong>MITRA_POS</strong> kepada calon pebisnis kafe Lampung.
              </p>
            </div>
          </div>

          {/* Action & Demo Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-destructive border-destructive/30 hover:bg-destructive/10 hover:text-destructive transition-colors"
                  disabled={isDemoActionLoading}
                >
                  <Trash2 className="h-4 w-4 mr-1.5" />
                  {isDemoActionLoading ? 'Memproses...' : 'Bersihkan Data Demo'}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Bersihkan Seluruh Data Demo?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Tindakan ini akan mengosongkan seluruh data demo (Events yang selesai maupun mendatang, pendaftaran tiket, pengajuan mitra POS, serta toko online) dari database.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Batal</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleCleanDemoData}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    Ya, Bersihkan Data Demo
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

            <Button
              variant="secondary"
              size="sm"
              onClick={handleSeedDemoData}
              disabled={isDemoActionLoading}
              className="border shadow-xs"
            >
              <Sparkles className="h-4 w-4 mr-1.5 text-primary" />
              Muat Data Seeder
            </Button>
          </div>
        </div>

        {/* Toolbar & Filter Bar */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-muted/30 p-3 rounded-lg border">
          <div className="text-sm text-muted-foreground">
            Filter Status Pengajuan:
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              variant={filter === 'ALL' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('ALL')}
            >
              Semua ({applications.length})
            </Button>
            <Button
              variant={filter === 'PENDING' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('PENDING')}
            >
              Pending ({applications.filter((a) => a.status === 'PENDING_APPROVAL').length})
            </Button>
            <Button
              variant={filter === 'APPROVED' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('APPROVED')}
            >
              Disetujui
            </Button>
            <Button
              variant={filter === 'REJECTED' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('REJECTED')}
            >
              Ditolak
            </Button>
          </div>
        </div>

        {/* List Applications */}
        {loading ? (
          <div className="text-center py-16 text-muted-foreground">Memuat data pengajuan...</div>
        ) : filtered.length === 0 ? (
          <Card>
            <CardContent className="py-16 text-center text-muted-foreground space-y-2">
              <Store className="h-12 w-12 mx-auto text-muted-foreground/50" />
              <p className="font-semibold">Tidak ada pengajuan mitra dengan filter ini.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filtered.map((app) => (
              <Card key={app.id} className="border hover:border-primary/30 transition-colors flex flex-col justify-between">
                <div>
                  <CardHeader className="pb-3 border-b bg-muted/20">
                    <div className="flex justify-between items-start gap-2">
                      <div>
                        <CardTitle className="text-xl font-bold flex items-center gap-2">
                          <Store className="h-5 w-5 text-primary" />
                          {app.brandName}
                        </CardTitle>
                        <CardDescription className="text-xs mt-1">
                          Konsep: <span className="font-medium text-foreground">{app.concept}</span>
                        </CardDescription>
                      </div>
                      <span
                        className={`text-xs px-2.5 py-1 rounded-full font-semibold ${
                          app.status === 'APPROVED'
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/60 dark:text-green-300'
                            : app.status === 'REJECTED'
                            ? 'bg-red-100 text-red-800 dark:bg-red-900/60 dark:text-red-300'
                            : 'bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-300'
                        }`}
                      >
                        {app.status === 'APPROVED'
                          ? 'DISETUJUI (MITRA_POS)'
                          : app.status === 'REJECTED'
                          ? 'DITOLAK'
                          : 'MENUNGGU REVIEW'}
                      </span>
                    </div>
                  </CardHeader>

                  <CardContent className="p-6 space-y-3.5 text-sm">
                    <div>
                      <span className="text-xs text-muted-foreground uppercase font-semibold">Data Pemilik:</span>
                      <p className="font-semibold text-foreground">{app.ownerName}</p>
                      <p className="text-xs text-muted-foreground">{app.email} • {app.phone}</p>
                    </div>

                    <div className="flex items-start gap-2 text-xs text-muted-foreground pt-1">
                      <MapPin className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                      <span>{app.initialBranchAddress}</span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-2 border-t text-xs">
                      <div className="bg-muted/40 p-2.5 rounded-lg">
                        <span className="text-muted-foreground flex items-center gap-1">
                          <DollarSign className="h-3.5 w-3.5" /> Estimasi CapEx
                        </span>
                        <p className="font-bold text-sm text-foreground mt-0.5">
                          Rp {Number(app.estimatedCapex).toLocaleString('id-ID')}
                        </p>
                      </div>
                      <div className="bg-muted/40 p-2.5 rounded-lg">
                        <span className="text-muted-foreground flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5" /> Target Harian
                        </span>
                        <p className="font-bold text-sm text-foreground mt-0.5">
                          {app.targetCupsPerDay} Cup / Hari
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </div>

                {app.status === 'PENDING_APPROVAL' && (
                  <div className="p-4 border-t bg-muted/10 flex gap-3">
                    <Button
                      size="sm"
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                      disabled={actionLoading === app.id}
                      onClick={() => handleUpdateStatus(app.id, 'APPROVED')}
                    >
                      <CheckCircle className="h-4 w-4 mr-1.5" />
                      Setujui Jadi Mitra POS
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-destructive hover:text-destructive"
                      disabled={actionLoading === app.id}
                      onClick={() => handleUpdateStatus(app.id, 'REJECTED')}
                    >
                      <XCircle className="h-4 w-4 mr-1.5" />
                      Tolak
                    </Button>
                  </div>
                )}
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
