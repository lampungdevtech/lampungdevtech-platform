import { NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const db = await getDatabase();

    if (!db) {
      // Data simulasi jika MongoDB belum aktif
      return NextResponse.json([
        {
          id: '01J7APPTEST1',
          ownerName: 'Rian Pratama',
          email: 'rian.pratama@gmail.com',
          phone: '081234567890',
          brandName: 'Kopi Ruang Temu',
          concept: 'Coffee Shop & Cafe',
          initialBranchAddress: 'Jl. Raden Intan No. 45, Enggal, Bandar Lampung',
          estimatedCapex: 75000000,
          targetCupsPerDay: 80,
          status: 'PENDING_APPROVAL',
          appliedAt: new Date().toISOString(),
        },
        {
          id: '01J7APPTEST2',
          ownerName: 'Siti Rahma',
          email: 'siti.rahma@gmail.com',
          phone: '081987654321',
          brandName: 'Kopi Sudut Metro',
          concept: 'Coffee Booth / To-Go',
          initialBranchAddress: 'Jl. AH Nasution No. 12, Metro Pusat',
          estimatedCapex: 35000000,
          targetCupsPerDay: 50,
          status: 'APPROVED',
          appliedAt: new Date(Date.now() - 86400000).toISOString(),
        },
      ]);
    }

    const collection = db.collection('pos_applications');
    const applications = await collection
      .find({})
      .sort({ appliedAt: -1 })
      .toArray();

    return NextResponse.json(applications);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Gagal mengambil daftar pengajuan mitra.' },
      { status: 500 }
    );
  }
}
