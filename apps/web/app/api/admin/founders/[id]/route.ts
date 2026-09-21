import { NextRequest, NextResponse } from 'next/server';
import {
  getFounderByIdService,
  updateFounderService,
  deleteFounderService,
} from '@/services/founder.service';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const founder = await getFounderByIdService(id);

    if (!founder) {
      return NextResponse.json(
        { error: 'Data Co-Founder tidak ditemukan.' },
        { status: 404 }
      );
    }

    return NextResponse.json(founder, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Gagal memuat detail Co-Founder.' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const updated = await updateFounderService(id, body);

    if (!updated) {
      return NextResponse.json(
        { error: 'Data Co-Founder tidak ditemukan atau gagal diperbarui.' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: `Data ${updated.name} berhasil diperbarui.`,
        founder: updated,
      },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Gagal memperbarui data Co-Founder.' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const deleted = await deleteFounderService(id);

    if (!deleted) {
      return NextResponse.json(
        { error: 'Data Co-Founder tidak ditemukan.' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: true, message: 'Data Co-Founder berhasil dihapus.' },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Gagal menghapus data Co-Founder.' },
      { status: 500 }
    );
  }
}
