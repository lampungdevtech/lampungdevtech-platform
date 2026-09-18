import { NextResponse } from 'next/server';
import { getProductsByStore, createProduct } from '@/services/store.service';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const storeId = searchParams.get('storeId') || 'store-demo-01';
    const products = await getProductsByStore(storeId);
    return NextResponse.json({ success: true, products });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { storeId, name, price, discountPrice, description, images, type, digitalDetails } = body;

    if (!storeId || !name || price === undefined) {
      return NextResponse.json(
        { error: 'storeId, nama produk, dan harga wajib diisi.' },
        { status: 400 }
      );
    }

    const product = await createProduct(storeId, {
      name,
      price: Number(price),
      discountPrice: discountPrice ? Number(discountPrice) : undefined,
      description: description || '',
      images: images || [],
      type: type || 'DIGITAL',
      digitalDetails: digitalDetails || {
        deliveryMethod: 'ACCESS_LINK',
        accessLink: 'https://lampungdev.tech',
        accessInstructions: 'Silakan buka tautan di atas untuk mengakses produk digital ini.',
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Produk berhasil ditambahkan!',
      product,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
