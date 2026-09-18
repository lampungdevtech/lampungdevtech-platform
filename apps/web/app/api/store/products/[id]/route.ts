import { NextResponse } from 'next/server';
import { deleteProduct } from '@/services/store.service';

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(req.url);
    const storeId = searchParams.get('storeId') || 'store-demo-01';

    await deleteProduct(storeId, id);

    return NextResponse.json({
      success: true,
      message: 'Produk berhasil dihapus.',
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
