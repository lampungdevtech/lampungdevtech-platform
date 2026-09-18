import { NextResponse } from 'next/server';
import { createOrder } from '@/services/store.service';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      storeId,
      storeSlug,
      storeName,
      storeWhatsapp,
      buyerName,
      buyerWhatsapp,
      buyerEmail,
      buyerNotes,
      productId,
      paymentChannel,
    } = body;

    if (!storeId || !buyerName || !buyerWhatsapp || !productId) {
      return NextResponse.json(
        { error: 'Mohon lengkapi nama dan nomor WhatsApp Anda.' },
        { status: 400 }
      );
    }

    const order = await createOrder({
      storeId,
      storeSlug: storeSlug || 'toko',
      storeName: storeName || 'Toko Mitra',
      storeWhatsapp: storeWhatsapp || '6281234567890',
      buyerName,
      buyerWhatsapp,
      buyerEmail,
      buyerNotes,
      productId,
      paymentChannel: paymentChannel || 'WHATSAPP_DIRECT',
    });

    let whatsappRedirectUrl: string | undefined = undefined;

    if (order.payment.channel === 'WHATSAPP_DIRECT') {
      const cleanWa = (order.storeWhatsapp || '').replace(/[^0-9]/g, '');
      const item = order.items[0];
      const grandTotalFormatted = new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        maximumFractionDigits: 0,
      }).format(order.pricing.grandTotal);

      const messageText = [
        `Halo Kak ${order.storeName}, saya mau order produk digital:`,
        `📦 *${item.productName}*`,
        `💰 Total: *${grandTotalFormatted}*`,
        `---------------------------`,
        `👤 *Data Pembeli:*`,
        `Nama: ${order.buyer.name}`,
        `No WA: ${order.buyer.whatsapp}`,
        order.buyer.email ? `Email: ${order.buyer.email}` : '',
        order.buyer.notes ? `Catatan: ${order.buyer.notes}` : '',
        `---------------------------`,
        `No. Pesanan: #${order.orderNumber}`,
        `Mohon info rekening pembayaran dan link aksesnya ya kak. Terima kasih! 🙏`,
      ]
        .filter(Boolean)
        .join('\n');

      whatsappRedirectUrl = `https://wa.me/${cleanWa}?text=${encodeURIComponent(messageText)}`;
    }

    return NextResponse.json({
      success: true,
      message: 'Pesanan berhasil dibuat.',
      order,
      whatsappRedirectUrl,
    });
  } catch (error: any) {
    console.error('[API /api/store/checkout] Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
