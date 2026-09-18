import { NextResponse } from 'next/server';
import { checkSlugAvailable } from '@/services/store.service';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const slug = searchParams.get('slug');

    if (!slug) {
      return NextResponse.json({ available: false, error: 'Slug parameter is required' }, { status: 400 });
    }

    const cleanSlug = slug.toLowerCase().trim().replace(/[^a-z0-9-]/g, '-');
    if (cleanSlug.length < 3) {
      return NextResponse.json({ available: false, error: 'Slug must be at least 3 characters' });
    }

    const isAvailable = await checkSlugAvailable(cleanSlug);
    return NextResponse.json({
      available: isAvailable,
      slug: cleanSlug,
    });
  } catch (error: any) {
    return NextResponse.json({ available: false, error: error.message }, { status: 500 });
  }
}
