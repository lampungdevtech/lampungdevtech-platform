'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { ExternalLink, Loader2, CheckCircle2, Clock } from 'lucide-react';

interface RegistrationModalProps {
  eventId: string;
  eventTitle: string;
  trigger?: React.ReactNode;
}

export function RegistrationModal({
  eventId,
  eventTitle,
  trigger,
}: RegistrationModalProps) {
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [successData, setSuccessData] = useState<{
    status: 'REGISTERED' | 'WAITING_LIST';
    message: string;
    qrToken?: string;
  } | null>(null);

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    organization: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch('/api/events/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          eventId,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Gagal mengirim pendaftaran');
      }

      setSuccessData({
        status: data.status,
        message: data.message,
        qrToken: data.qrToken,
      });

      toast({
        title: data.status === 'REGISTERED' ? 'Pendaftaran Berhasil!' : 'Masuk Waiting List',
        description: data.message,
      });

      setFormData({ fullName: '', email: '', phone: '', organization: '' });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Pendaftaran Gagal',
        description:
          error instanceof Error
            ? error.message
            : 'Gagal melakukan pendaftaran event.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleModalClose = (open: boolean) => {
    setIsOpen(open);
    if (!open) {
      setSuccessData(null);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleModalClose}>
      <DialogTrigger asChild>
        {trigger || (
          <Button className="w-full">
            Daftar Sekarang
            <ExternalLink className="ml-2 h-4 w-4" />
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{successData ? 'Status Pendaftaran' : 'Form Pendaftaran Event'}</DialogTitle>
          <DialogDescription>
            {successData
              ? `Konfirmasi keikutsertaan Anda pada acara ${eventTitle}`
              : `Silakan isi formulir untuk mendaftar acara ${eventTitle}`}
          </DialogDescription>
        </DialogHeader>

        {successData ? (
          <div className="py-4 space-y-4 text-center">
            {successData.status === 'REGISTERED' ? (
              <div className="flex flex-col items-center space-y-2">
                <CheckCircle2 className="h-14 w-14 text-green-500" />
                <h4 className="text-lg font-bold text-green-600 dark:text-green-400">Tiket Terbit!</h4>
                <p className="text-sm text-muted-foreground px-4">{successData.message}</p>
                {successData.qrToken && (
                  <div className="bg-muted p-3 rounded-lg mt-2 text-xs font-mono">
                    Kode Tiket: <span className="font-bold">{successData.qrToken}</span>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center space-y-2">
                <Clock className="h-14 w-14 text-amber-500" />
                <h4 className="text-lg font-bold text-amber-600 dark:text-amber-400">Antrean Waiting List</h4>
                <p className="text-sm text-muted-foreground px-4">{successData.message}</p>
              </div>
            )}
            <Button className="w-full mt-4" onClick={() => handleModalClose(false)}>
              Tutup
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">Nama Lengkap *</Label>
              <Input
                id="fullName"
                placeholder="Nama Anda"
                value={formData.fullName}
                onChange={(e) =>
                  setFormData({ ...formData, fullName: e.target.value })
                }
                required
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email Aktif *</Label>
              <Input
                id="email"
                type="email"
                placeholder="nama@email.com"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                required
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Nomor WhatsApp</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="08xxxxxxxxxx"
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="organization">Institusi / Perusahaan (Opsional)</Label>
              <Input
                id="organization"
                placeholder="Universitas / Perusahaan"
                value={formData.organization}
                onChange={(e) =>
                  setFormData({ ...formData, organization: e.target.value })
                }
                disabled={isLoading}
              />
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Memproses Tiket...
                </>
              ) : (
                'Kirim Pendaftaran'
              )}
            </Button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
