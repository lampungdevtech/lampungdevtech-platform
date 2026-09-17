import { NextRequest, NextResponse } from 'next/server';
import { registerToEventService } from '@/services/event.service';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { fullName, name, email, phone, organization, eventId } = body;

    const participantName = fullName || name;

    if (!participantName || !email || !eventId) {
      return NextResponse.json(
        { error: 'Nama lengkap, email, dan ID event wajib diisi.' },
        { status: 400 }
      );
    }

    const result = await registerToEventService({
      eventId,
      name: participantName,
      email,
      phone: phone || '',
      organization: organization || '',
    });

    return NextResponse.json(result, { status: 201 });
  } catch (error: any) {
    console.error('[API /api/events/register] Error:', error.message);
    const statusCode = error.message.includes('sudah terdaftar') ? 409 : 500;
    return NextResponse.json(
      { error: error.message || 'Terjadi kesalahan pada server saat mendaftar.' },
      { status: statusCode }
    );
  }
}
