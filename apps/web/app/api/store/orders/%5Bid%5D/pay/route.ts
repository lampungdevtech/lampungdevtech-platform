import { NextResponse } from 'next/server';
import { markOrderPaid } from '@/services/store.service';

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const order = await markOrderPaid(id);

    if (!order) {
      return NextResponse.json({ error: 'Pesanan tidak ditemukan' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: 'Pembayaran berhasil dikonfirmasi! Akses produk digital siap diunduh.',
      order,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
