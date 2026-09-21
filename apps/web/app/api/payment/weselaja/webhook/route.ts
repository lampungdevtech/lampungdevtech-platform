import { NextRequest, NextResponse } from 'next/server';
import { verifyWeselAjaSignature } from '@/lib/payment/weselaja';
import { getOrderById, markOrderPaid } from '@/services/store.service';
import type { WeselAjaWebhookPayload } from '@/lib/payment/types';

export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.text();
    const signature = request.headers.get('xenith-request-signature') || request.headers.get('x-signature') || '';
    const timestamp = request.headers.get('xenith-request-timestamp') || request.headers.get('x-timestamp') || '';
    const pathname = new URL(request.url).pathname;

    const webhookSecret = process.env.WESELAJA_WEBHOOK_SECRET;
    const isProduction = process.env.NODE_ENV === 'production';

    // Production Security Guard: Signature is strictly mandatory in production
    if (isProduction) {
      if (!webhookSecret) {
        console.error('[WeselAja Webhook Security] Missing WESELAJA_WEBHOOK_SECRET in production.');
        return NextResponse.json({ success: false, message: 'Server configuration error' }, { status: 500 });
      }
      if (!signature || !timestamp) {
        console.warn('[WeselAja Webhook Security] Missing signature or timestamp header in production request.');
        return NextResponse.json({ success: false, message: 'Unauthorized: missing authentication headers' }, { status: 401 });
      }
    }

    // Verify HMAC signature if secret and signature are present
    if (webhookSecret && signature) {
      const isValid = verifyWeselAjaSignature('POST', pathname, rawBody, timestamp, signature);
      if (!isValid) {
        console.warn('[WeselAja Webhook Security] Invalid HMAC-SHA256 signature rejected.');
        return NextResponse.json({ success: false, message: 'Invalid signature' }, { status: 401 });
      }
    } else if (!isProduction && (!signature || !webhookSecret)) {
      console.warn('[WeselAja Webhook Security] Non-production test invocation without full signature verification.');
    }

    const payload: WeselAjaWebhookPayload = JSON.parse(rawBody || '{}');
    if (!payload.referenceCode) {
      return NextResponse.json({ success: false, message: 'Invalid payload: missing referenceCode' }, { status: 400 });
    }

    console.log('[WeselAja Webhook] Notification received:', {
      referenceCode: payload.referenceCode,
      status: payload.status,
      amount: payload.amount,
    });

    // Handle payment status settlement
    if (payload.status === 'PAID' || payload.status === 'SETTLED') {
      const ref = payload.referenceCode;
      const order = await getOrderById(ref);

      if (order) {
        // Price tampering & underpayment guard:
        if (payload.amount !== undefined && payload.amount < order.pricing.grandTotal) {
          console.error(
            `[WeselAja Webhook Security] UNDERPAYMENT DETECTED for Order ${order.id}: expected ${order.pricing.grandTotal}, received ${payload.amount}`
          );
          return NextResponse.json(
            { success: false, message: 'Payment rejected: amount does not match order total' },
            { status: 400 }
          );
        }

        await markOrderPaid(order.id, payload.amount);
        console.log(`[WeselAja Webhook] Order ${order.orderNumber} successfully marked as PAID.`);
      } else {
        console.log(`[WeselAja Webhook] Reference ${ref} does not map to store_order (likely EdTech enrollment).`);
      }
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
