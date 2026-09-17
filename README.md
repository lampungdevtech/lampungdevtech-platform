# LampungDevTech Platform

<div align="center">
  <img src="apps/web/public/lampungdevtech-logo.svg" alt="LampungDevTech Logo" width="80" height="80" />
  <h3>Platform Komunitas Developer Teknologi Lampung</h3>
  <p>Wadah kolaborasi, belajar, dan bertumbuh bagi para talenta teknologi di Lampung.</p>
</div>

---

## 🌟 Fitur Utama (Key Features)

- **🌐 Dukungan Bilingual Penuh (Bilingual Support / i18n)**:
  - **Bahasa Indonesia** (Default) dengan prefix URL `/id`
  - **English** dengan prefix URL `/en`
  - Redireksi otomatis dari `/` ke `/id` (atau bahasa yang tersimpan)
  - Komponen **Language Switcher** interaktif dengan bendera negara (🇮🇩 Indonesia, 🇺🇸 English)
  - Persistensi bahasa otomatis via cookie `NEXT_LOCALE` saat navigasi
  - SEO-friendly canonical URLs dan alternate hreflang tags (`/id` dan `/en`)
- **📱 Desain Modern & Responsif**: Dibangun dengan Tailwind CSS, Radix UI primitives, dan dark/light mode toggle.
- **⚡ Monorepo Terstruktur**: Menggunakan Nx dan pnpm workspace dengan pemisahan paket UI (`@lampung-devtech/shared-ui`) terinspirasi arsitektur monorepo Zero One Group.
- **🔐 Autentikasi & Integrasi Backend**: Terintegrasi dengan NextAuth dan Supabase.

---

## 🏗️ Struktur Arsitektur Monorepo (Workspace Architecture)

```
lampungdevtech-platform/
├── apps/
│   └── web/                                # Aplikasi Next.js 15 (App Router)
│       ├── app/
│       │   ├── [locale]/                   # Rute ter-lokalisasi (/id, /en)
│       │   │   ├── layout.tsx              # Root localized layout & SEO alternates
│       │   │   ├── page.tsx                # Halaman Beranda (Home)
│       │   │   ├── about/                  # Tentang Kami
│       │   │   ├── events/                 # Daftar & detail acara komunitas
│       │   │   ├── members/                # Direktori anggota
│       │   │   ├── dashboard/              # Dashboard member & pengaturan
│       │   │   └── not-found.tsx           # Halaman 404 ter-lokalisasi
│       │   └── api/                        # Next.js API route handlers (/api/...)
│       ├── components/                     # Komponen UI & Language Switcher
│       │   ├── language-switcher.tsx       # Dropdown bendera 🇮🇩 & 🇺🇸
│       │   ├── navbar.tsx                  # Header navigasi bilingual
│       │   └── footer.tsx                  # Footer navigasi bilingual
│       ├── i18n/
│       │   ├── routing.ts                  # Routing config next-intl (/id, /en)
│       │   └── request.ts                  # Resolver kamus terjemahan dinamis
│       ├── locales/
│       │   ├── id/common.json              # Kamus terjemahan Bahasa Indonesia
│       │   └── en/common.json              # Kamus terjemahan English
│       └── middleware.ts                   # Chained middleware (i18n + NextAuth)
├── packages/
│   └── shared-ui/                          # @lampung-devtech/shared-ui
│       └── src/                            # Reusable Radix/Tailwind components
├── pnpm-workspace.yaml                     # Konfigurasi workspace pnpm
└── package.json                            # Root workspace scripts & dependencies
```

---

## 🌐 Panduan Internasionalisasi (i18n Guide)

### Menambahkan / Mengubah Terjemahan
File terjemahan disimpan dalam format JSON di:
- `apps/web/locales/id/common.json` (Bahasa Indonesia)
- `apps/web/locales/en/common.json` (English)

Contoh penggunaan dalam komponen:
```tsx
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';

export function ExampleComponent() {
  const t = useTranslations('nav');

  return (
    <nav>
      <Link href="/about">{t('about')}</Link>
    </nav>
  );
}
```

### Navigasi Ter-lokalisasi
Gunakan `Link`, `useRouter`, dan `usePathname` dari `@/i18n/routing` agar prefix locale `/id` atau `/en` otomatis disertakan dan dipertahankan.

---

## 🚀 Memulai Pengembangan (Getting Started)

### Prasyarat
- Node.js 20+ atau 24+
- `pnpm` v9+ atau v11+

### Instalasi
```bash
# Clone repository
git clone https://github.com/lampungdevtech/lampungdevtech-platform.git
cd lampungdevtech-platform

# Install dependencies menggunakan pnpm
pnpm install
```

### Menjalankan Development Server
```bash
# Menjalankan aplikasi web
pnpm start:web
# atau
pnpm exec nx dev web
```
Aplikasi akan tersedia di:
- `http://localhost:3000/` (otomatis redirect ke `http://localhost:3000/id`)
- `http://localhost:3000/id` (Versi Bahasa Indonesia)
- `http://localhost:3000/en` (Versi English)

### Build & Testing
```bash
# Type check TypeScript
npx tsc --project apps/web/tsconfig.json --noEmit

# Unit testing
pnpm exec nx test web

# Production build
pnpm exec nx build web
```

---

## 🤝 Komunitas & Kontribusi

Kami menyambut kontribusi dari siapa pun! Untuk bergabung dan berdiskusi:
- **Telegram Community**: [t.me/lampungdevtech](https://t.me/lampungdevtech)
- **GitHub**: [github.com/lampungdevtech](https://github.com/lampungdevtech)
- **Website**: [lampungdev.tech](https://lampungdev.tech)

---

## 📄 Lisensi
Dilisensikan di bawah lisensi [MIT](LICENSE).
