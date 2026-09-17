import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { ulid } from 'ulid';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      ownerName,
      email,
      phone,
      brandName,
      concept,
      initialBranchAddress,
      estimatedCapex,
      targetCupsPerDay,
    } = body;

    if (!ownerName || !email || !phone || !brandName || !initialBranchAddress) {
      return NextResponse.json(
        { error: 'Nama pemilik, email, nomor telepon, nama brand, dan alamat cabang wajib diisi.' },
        { status: 400 }
      );
    }

    const db = await getDatabase();
    const applicationId = ulid();

    const applicationData = {
      id: applicationId,
      ownerName,
      email: email.toLowerCase(),
      phone,
      brandName,
      concept: concept || 'Coffee Shop & Cafe',
      initialBranchAddress,
      estimatedCapex: parseInt(estimatedCapex, 10) || 0,
      targetCupsPerDay: parseInt(targetCupsPerDay, 10) || 0,
      status: 'PENDING_APPROVAL', // 'PENDING_APPROVAL' | 'APPROVED' | 'REJECTED'
      appliedAt: new Date(),
      updatedAt: new Date(),
    };

    if (db) {
      const collection = db.collection('pos_applications');
      await collection.insertOne(applicationData);
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Pengajuan mitra POS berhasil diterima.',
        applicationId,
        status: 'PENDING_APPROVAL',
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('[API /api/pos/apply] Error:', error.message);
    return NextResponse.json(
      { error: error.message || 'Terjadi kesalahan sistem saat mengirimkan formulir.' },
      { status: 500 }
    );
  }
}
