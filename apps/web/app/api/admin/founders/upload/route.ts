import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs';
import sharp from 'sharp';
import { ulid } from 'ulid';

export const dynamic = 'force-dynamic';

function getUploadDir(): string {
  // Dukungan bila Next.js dijalankan dari root monorepo atau langsung dari direktori apps/web
  const rootOption = path.join(process.cwd(), 'apps', 'web', 'public', 'uploads', 'founders');
  const webOption = path.join(process.cwd(), 'public', 'uploads', 'founders');

  if (fs.existsSync(path.join(process.cwd(), 'apps', 'web', 'public'))) {
    return rootOption;
  }
  return webOption;
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json(
        { error: 'File gambar wajib diunggah.' },
        { status: 400 }
      );
    }

    // Validasi tipe file MIME
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Format file tidak didukung. Harap gunakan format JPG, PNG, atau WebP.' },
        { status: 400 }
      );
    }

    // Batas ukuran 5MB
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'Ukuran file terlalu besar. Maksimum ukuran adalah 5MB.' },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const inputBuffer = Buffer.from(arrayBuffer);

    // Proses kompresi & konversi ke WebP menggunakan Sharp
    const webpBuffer = await sharp(inputBuffer)
      .resize(800, 800, {
        fit: 'cover',
        position: 'center',
      })
      .webp({ quality: 82, effort: 4 })
      .toBuffer();

    const uploadDir = getUploadDir();
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    // Nama file unik dengan ekstensi .webp
    const filename = `founder-${ulid().toLowerCase()}.webp`;
    const filePath = path.join(uploadDir, filename);

    await fs.promises.writeFile(filePath, webpBuffer);

    const publicUrl = `/uploads/founders/${filename}`;

    return NextResponse.json(
      {
        success: true,
        message: 'Foto Co-Founder berhasil dikompresi dan dikonversi ke format WebP.',
        url: publicUrl,
        filename,
        originalSize: file.size,
        compressedSize: webpBuffer.length,
        savedPercent: Math.max(0, Math.round(((file.size - webpBuffer.length) / file.size) * 100)),
        format: 'webp',
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('[API /api/admin/founders/upload] Error:', error.message);
    return NextResponse.json(
      { error: error.message || 'Gagal memproses dan mengompresi gambar.' },
      { status: 500 }
    );
  }
}
