import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { createStore, checkSlugAvailable } from '@/services/store.service';

export async function POST(req: Request) {
  try {
    const session = await getServerSession();
    const body = await req.json();

    const {
      ownerName,
      email,
      storeName,
      slug,
      whatsappNumber,
      category,
      bio,
      primaryType,
    } = body;

    if (!storeName || !slug || !whatsappNumber) {
      return NextResponse.json(
        { error: 'Nama Toko, Slug URL, dan Nomor WhatsApp wajib diisi.' },
        { status: 400 }
      );
    }

    // Check slug format
    const cleanSlug = slug.toLowerCase().trim().replace(/[^a-z0-9-]/g, '-');
    if (cleanSlug.length < 3) {
      return NextResponse.json(
        { error: 'Slug toko minimal 3 karakter huruf dan angka.' },
        { status: 400 }
      );
    }

    const isAvailable = await checkSlugAvailable(cleanSlug);
    if (!isAvailable) {
      return NextResponse.json(
        { error: `Slug "${cleanSlug}" sudah dipakai oleh toko lain. Silakan pilih slug yang berbeda.` },
        { status: 409 }
      );
    }

    const userId = session?.user?.name || (session as any)?.user?.id || 'member-user';

    const store = await createStore({
      ownerName: ownerName || session?.user?.name || 'Mitra Penjual',
      email: email || session?.user?.email || 'mitra@lampungdev.tech',
      storeName,
      slug: cleanSlug,
      whatsappNumber,
      category: category || 'DIGITAL_CREATIVE',
      bio: bio || '',
      primaryType: primaryType || 'DIGITAL',
      userId,
    });

    return NextResponse.json({
      success: true,
      message: 'Toko online Anda berhasil dibuat dan langsung aktif!',
      store,
    });
  } catch (error: any) {
    console.error('[API /api/store/apply] Error:', error);
    return NextResponse.json(
      { error: error.message || 'Terjadi kesalahan sistem saat membuat toko.' },
      { status: 500 }
    );
  }
}
