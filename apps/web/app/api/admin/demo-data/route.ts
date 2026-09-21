import { NextRequest, NextResponse } from 'next/server';
import {
  seedDemoData,
  cleanDemoData,
  getDemoDataStats,
} from '@/services/demo-data.service';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const stats = await getDemoDataStats();
    return NextResponse.json(stats, { status: 200 });
  } catch (error: any) {
    console.error('[API /api/admin/demo-data GET] Error:', error.message);
    return NextResponse.json(
      { error: error.message || 'Gagal mengambil statistik data demo.' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const action = body.action || 'clean';

    if (action === 'clean') {
      const result = await cleanDemoData();
      return NextResponse.json(result, { status: 200 });
    }

    if (action === 'seed') {
      const result = await seedDemoData();
      return NextResponse.json(result, { status: 200 });
    }

    if (action === 'reset') {
      await cleanDemoData();
      const result = await seedDemoData();
      return NextResponse.json(
        {
          ...result,
          message: 'Data demo lama berhasil dibersihkan dan diisi ulang data baru.',
        },
        { status: 200 }
      );
    }

    return NextResponse.json(
      { error: `Action '${action}' tidak dikenal. Gunakan 'clean', 'seed', atau 'reset'.` },
      { status: 400 }
    );
  } catch (error: any) {
    console.error('[API /api/admin/demo-data POST] Error:', error.message);
    return NextResponse.json(
      { error: error.message || 'Terjadi kesalahan saat memproses data demo.' },
      { status: 500 }
    );
  }
}
