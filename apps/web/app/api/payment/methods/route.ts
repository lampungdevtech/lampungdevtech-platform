import { NextRequest, NextResponse } from 'next/server';
import { getWeselAjaPaymentMethods } from '@/lib/payment/weselaja';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const amountParam = searchParams.get('amount');
    const amount = amountParam ? Math.max(0, parseInt(amountParam, 10)) : 0;

    const paymentMethods = getWeselAjaPaymentMethods(amount);

    return NextResponse.json({
      success: true,
      gateway: 'weselaja',
      amount,
      paymentMethods,
    });
  } catch (error) {
    console.error('[API Payment Methods Error]:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to retrieve payment methods',
      },
      { status: 500 }
    );
  }
}
