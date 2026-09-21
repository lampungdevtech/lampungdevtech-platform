import { NextRequest, NextResponse } from 'next/server';
import { verifyWeselAjaSignature } from '@/lib/payment/weselaja';
import type { WeselAjaWebhookPayload } from '@/lib/payment/types';

export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.text();
    const signature = request.headers.get('xenith-request-signature') || request.headers.get('x-signature') || '';
    const timestamp = request.headers.get('xenith-request-timestamp') || request.headers.get('x-timestamp') || '';
    const pathname = new URL(request.url).pathname;

    const webhookSecret = process.env.WESELAJA_WEBHOOK_SECRET;

    // Verify HMAC signature if webhook secret is configured
    if (webhookSecret && signature) {
      const isValid = verifyWeselAjaSignature('POST', pathname, rawBody, timestamp, signature);
      if (!isValid) {
        console.warn('[WeselAja Webhook] Invalid signature rejected');
        return NextResponse.json({ success: false, message: 'Invalid signature' }, { status: 401 });
      }
    }

    const payload: WeselAjaWebhookPayload = JSON.parse(rawBody || '{}');
    console.log('[WeselAja Webhook] Notification received:', {
      referenceCode: payload.referenceCode,
      status: payload.status,
      amount: payload.amount,
    });

    // Handle payment status settlement
    if (payload.status === 'PAID' || payload.status === 'SETTLED') {
      console.log(`[WeselAja Webhook] Order ${payload.referenceCode} successfully paid.`);
    }

    return NextResponse.json({
      success: true,
      message: 'Webhook processed successfully',
      referenceCode: payload.referenceCode,
      status: payload.status,
    });
  } catch (error) {
    console.error('[WeselAja Webhook Error]:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Failed to process webhook' },
      { status: 500 }
    );
  }
}
