import { NextResponse } from 'next/server';
import { getFoundersService } from '@/services/founder.service';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const founders = await getFoundersService(true);
    return NextResponse.json(founders, { status: 200 });
  } catch (error: any) {
    console.error('[API /api/founders] Error:', error.message);
    return NextResponse.json(
      { error: error.message || 'Gagal memuat data founder.' },
      { status: 500 }
    );
  }
}
