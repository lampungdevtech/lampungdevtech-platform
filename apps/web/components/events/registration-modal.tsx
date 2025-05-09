'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { ExternalLink, Loader2 } from 'lucide-react';

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
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
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
        throw new Error(data.error || 'Failed to register');
      }

      toast({
        title: 'Registration Successful!',
        description: 'You have successfully registered for the event.',
      });

      setIsOpen(false);
      setFormData({ fullName: '', email: '' });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Registration Failed',
        description:
          error instanceof Error
            ? error.message
            : 'Failed to register for the event',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button className="w-full">
            Daftar Sekarang
            <ExternalLink className="ml-2 h-4 w-4" />
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Daftar Event</DialogTitle>
          <DialogDescription>
            Silakan isi form pendaftaran untuk mengikuti event {eventTitle}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="fullName">Nama Lengkap</Label>
            <Input
              id="fullName"
              value={formData.fullName}
              onChange={(e) =>
                setFormData({ ...formData, fullName: e.target.value })
              }
              required
              disabled={isLoading}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              required
              disabled={isLoading}
            />
          </div>
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Mendaftar...
              </>
            ) : (
              'Kirim Pendaftaran'
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
