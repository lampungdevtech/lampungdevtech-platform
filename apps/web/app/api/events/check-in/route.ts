import { NextRequest, NextResponse } from 'next/server';
import { checkInAttendeeService } from '@/services/event.service';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { qrToken } = body;

    if (!qrToken) {
      return NextResponse.json(
        { error: 'Token QR tiket wajib disertakan.' },
        { status: 400 }
      );
    }

    const result = await checkInAttendeeService(qrToken);
    return NextResponse.json(result, { status: 200 });
  } catch (error: any) {
    console.error('[API /api/events/check-in] Error:', error.message);
    const statusCode = error.message.includes('tidak ditemukan') ? 404 : 400;
    return NextResponse.json(
      { error: error.message || 'Gagal memproses check-in tiket.' },
      { status: statusCode }
    );
  }
}
