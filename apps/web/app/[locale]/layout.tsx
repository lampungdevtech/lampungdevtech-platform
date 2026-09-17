import '../globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { ThemeProvider } from '@/components/theme-provider';
import { Providers } from '../providers';
import { Toaster } from '@/components/ui/toaster';
import Navbar from '@/components/navbar';
import Footer from '@/components/footer';
import ScrollToTop from '@/components/scroll-to-top';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';

const inter = Inter({ subsets: ['latin'] });

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const isId = locale === 'id';

  return {
    title: isId
      ? 'LampungDevTech - Komunitas Developer Teknologi Lampung'
      : 'LampungDevTech - Lampung Technology Developer Community',
    description: isId
      ? 'Platform komunitas developer teknologi di Lampung untuk berbagi pengetahuan, pengalaman, dan kesempatan.'
      : 'Technology developer community platform in Lampung to share knowledge, experience, and opportunities.',
    keywords: [
      'Lampung',
      'LampungDevTech',
      'Developer Teknologi',
      'Komunitas',
      'Programming',
      'Tech Community',
    ],
    alternates: {
      canonical: `/${locale}`,
      languages: {
        id: '/id',
        en: '/en',
      },
    },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  // Validate locale
  if (!routing.locales.includes(locale as any)) {
    notFound();
  }

  // Load all messages for the current locale
  const messages = await getMessages();

  return (
    <html lang={locale} suppressHydrationWarning>
      <body className={inter.className}>
        <NextIntlClientProvider locale={locale} messages={messages}>
          <Providers>
            <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
              <div className="flex min-h-screen flex-col">
                <Navbar />
                <main className="flex-1">{children}</main>
                <Footer />
                <ScrollToTop />
              </div>
              <Toaster />
            </ThemeProvider>
          </Providers>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
