import { NextRequest, NextResponse } from 'next/server';
import { getEventsService } from '@/services/event.service';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const status = (searchParams.get('status') || 'all') as 'all' | 'upcoming' | 'past';
    const category = searchParams.get('category') || undefined;
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '10', 10);

    const result = await getEventsService({
      search,
      status,
      category,
      page,
      limit,
    });

    return NextResponse.json(result, { status: 200 });
  } catch (error: any) {
    console.error('[API /api/events] Error:', error.message);
    return NextResponse.json(
      { error: error.message || 'Gagal mengambil data acara.' },
      { status: 500 }
    );
  }
}
