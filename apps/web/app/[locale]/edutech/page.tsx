import { Metadata } from 'next';
import { EdutechPortalClient } from '@/components/edutech/edutech-portal-client';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const isEn = locale === 'en';

  return {
    title: isEn
      ? 'Game-Based STEM & EdTech Platform | LampungDevTech'
      : 'Game-Based STEM & Bimbel EdTech | LampungDevTech',
    description: isEn
      ? 'Roblox Game-Based STEM & Learning Center Platform. Self-serve class booking with concurrency slot locking, child-friendly AI progress reports for parents, and integrated teacher workflows.'
      : 'Platform Bimbel & STEM Game-Based Learning berbasis Roblox. Self-serve class booking anti double-booking, laporan progres AI mingguan untuk orang tua, dan dashboard terintegrasi guru.',
  };
}

export default function EdutechPage() {
  return <EdutechPortalClient />;
}
