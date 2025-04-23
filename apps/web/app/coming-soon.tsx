"use client";

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Home, Construction } from 'lucide-react';

export default function ComingSoon() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="max-w-2xl mx-auto px-4 py-8 text-center">
        <Construction className="h-24 w-24 mx-auto mb-8 text-primary" />
        <h1 className="text-4xl font-bold text-primary mb-4">Segera Hadir!</h1>
        <p className="text-xl text-muted-foreground mb-8">
          Halaman ini sedang dalam pengembangan. Kami sedang bekerja keras untuk menghadirkan konten terbaik untuk Anda.
        </p>
        <Button asChild>
          <Link href="/">
            <Home className="mr-2 h-4 w-4" />
            Kembali ke Beranda
          </Link>
        </Button>
      </div>
    </div>
  );
}