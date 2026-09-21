import { NextRequest, NextResponse } from 'next/server';
import { createWeselAjaPayment } from '@/lib/payment/weselaja';
import type { CreatePaymentParams } from '@/lib/payment/types';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      orderId,
      amount,
      customerName,
      customerEmail,
      customerPhone,
      itemName,
      description,
      paymentMethod,
    } = body;

    if (!amount) {
      return NextResponse.json(
        { success: false, error: 'Missing required parameter: amount' },
        { status: 400 }
      );
    }

    const finalOrderId = orderId || `WESEL-${Date.now()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
    const origin = request.headers.get('origin') || 'http://localhost:3000';

    const params: CreatePaymentParams = {
      orderId: finalOrderId,
      amount: Number(amount),
      customerName: customerName || 'Pelanggan LampungDevTech',
      customerEmail: customerEmail || 'customer@lampungdevtech.my.id',
      customerPhone: customerPhone || undefined,
      itemName: itemName || description || 'Pembayaran Layanan',
      callbackUrl: `${origin}/api/payment/weselaja/webhook`,
      successUrl: `${origin}/id/edutech?payment=success&ref=${finalOrderId}`,
      paymentMethod: paymentMethod || 'QRIS',
    };

    const result = await createWeselAjaPayment(params);

    if (!result.success) {
      return NextResponse.json(result, { status: 400 });
    }

    return NextResponse.json(
      {
        ...result,
        payment: result,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('[API WeselAja Create Error]:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error during payment creation',
      },
      { status: 500 }
    );
  }
}
