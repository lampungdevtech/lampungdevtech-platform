import { NextRequest, NextResponse } from 'next/server';
import {
  getFoundersService,
  createFounderService,
} from '@/services/founder.service';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const founders = await getFoundersService(false);
    return NextResponse.json(founders, { status: 200 });
  } catch (error: any) {
    console.error('[API /api/admin/founders GET] Error:', error.message);
    return NextResponse.json(
      { error: error.message || 'Gagal memuat daftar Co-Founder.' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.name || !body.image) {
      return NextResponse.json(
        { error: 'Nama dan foto Co-Founder wajib diisi.' },
        { status: 400 }
      );
    }

    const created = await createFounderService({
      name: body.name,
      title: body.title || 'Co-Founder',
      role: body.role || 'Co-Founder',
      bio: body.bio || '',
      bioEn: body.bioEn || '',
      image: body.image,
      linkedinUrl: body.linkedinUrl || '',
      githubUrl: body.githubUrl || '',
      twitterUrl: body.twitterUrl || '',
      order: typeof body.order === 'number' ? body.order : 99,
      isActive: body.isActive !== undefined ? Boolean(body.isActive) : true,
    });

    return NextResponse.json(
      {
        success: true,
        message: `Co-Founder ${created.name} berhasil ditambahkan.`,
        founder: created,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('[API /api/admin/founders POST] Error:', error.message);
    return NextResponse.json(
      { error: error.message || 'Gagal menambahkan Co-Founder baru.' },
      { status: 500 }
    );
  }
}
