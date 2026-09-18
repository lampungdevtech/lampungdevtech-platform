import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';

export const dynamic = 'force-dynamic';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { status } = body; // 'APPROVED' | 'REJECTED'

    if (!['APPROVED', 'REJECTED'].includes(status)) {
      return NextResponse.json(
        { error: 'Status yang valid hanya APPROVED atau REJECTED.' },
        { status: 400 }
      );
    }

    const db = await getDatabase();
    if (db) {
      const collection = db.collection('pos_applications');
      await collection.updateOne(
        { id },
        { $set: { status, reviewedAt: new Date() } }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Status pengajuan #${id} berhasil diubah menjadi ${status}.`,
      status,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Gagal mengubah status pengajuan.' },
      { status: 500 }
    );
  }
}
