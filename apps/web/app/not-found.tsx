"use client";

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Home, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FCF5E9] dark:bg-background">
      <div className="max-w-2xl mx-auto px-4 py-8 text-center">
        <div className="mb-8">
          <h1 className="text-[120px] font-bold text-[#2D1C07] dark:text-primary mb-4 leading-none">404</h1>
          <p className="text-2xl text-[#2D1C07] dark:text-primary mb-2">Halaman tidak ditemukan</p>
          <p className="text-[#6F5737] dark:text-muted-foreground">
            Maaf, halaman yang Anda cari tidak dapat ditemukan atau telah dipindahkan.
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button asChild>
            <Link href="/">
              <Home className="mr-2 h-4 w-4" />
              Kembali ke Beranda
            </Link>
          </Button>
          <Button variant="outline" onClick={() => window.history.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Kembali ke Halaman Sebelumnya
          </Button>
        </div>
      </div>
    </div>
  );
}