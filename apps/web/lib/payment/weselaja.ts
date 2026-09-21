import crypto from 'crypto';
import type { CreatePaymentParams, PaymentMethodItem, PaymentResult } from './types';

function getConfig() {
  return {
    apiUrl: process.env.WESELAJA_API_URL?.trim() || 'https://openapi.sandbox.xenithpay.com',
    apiKey: process.env.WESELAJA_API_KEY?.trim() || '',
    secretKey: process.env.WESELAJA_SECRET_KEY?.trim() || '',
    webhookSecret: process.env.WESELAJA_WEBHOOK_SECRET?.trim() || '',
  };
}

/**
 * Creates HMAC-SHA256 signature for XenithPay / WeselAja API requests.
 */
function createRequestSignature(
  method: string,
  uri: string,
  timestamp: string,
  bodyString: string,
  secretKey: string
): string {
  const payload = `${method}\n${uri}\n${timestamp}\n${bodyString}`;
  return crypto.createHmac('sha256', secretKey).update(payload).digest('base64');
}

/**
 * Calculate the gateway fee for a given payment method and amount.
 * - QRIS: 0.7% (default) rounded up
 * - BCA VA (INTERBANK_BCA.VA): flat Rp 7.000
 * - Other Bank VAs: flat Rp 5.000
 * - E-Wallets (DANA, OVO): flat Rp 5.000
 */
export function getWeselAjaMerchantFee(
  paymentMethodCode: string,
  amount: number,
  customQrisPercent?: number | null
): number {
  const codeUpper = paymentMethodCode.toUpperCase();
  if (codeUpper === 'QRIS' || codeUpper === 'SP' || codeUpper === 'QR_CODE') {
    const percent = customQrisPercent != null && !isNaN(customQrisPercent) ? customQrisPercent : 0.7;
    return Math.max(Math.ceil(amount * (percent / 100)), 500);
  }
  if (codeUpper === 'INTERBANK_BCA.VA' || codeUpper === 'BCA.VA') {
    return 7000;
  }
  return 5000;
}

/**
 * Retrieve supported payment methods filtered by minimum transaction amount.
 */
export function getWeselAjaPaymentMethods(
  amount: number,
  customQrisPercent?: number | null
): PaymentMethodItem[] {
  const allMethods: PaymentMethodItem[] = [
    {
      code: 'QRIS',
      name: 'QRIS (Instant QR)',
      category: 'QRIS',
      image: 'https://images.duitku.com/hotlink-ok/SP.png',
      totalFee: getWeselAjaMerchantFee('QRIS', amount, customQrisPercent),
      minAmount: 1000,
      description: 'GoPay, ShopeePay, DANA, OVO, LinkAja & BCA/Mandiri Mobile',
    },
    {
      code: 'INTERBANK_BCA.VA',
      name: 'BCA Virtual Account',
      category: 'VIRTUAL_ACCOUNT',
      image: 'https://images.duitku.com/hotlink-ok/BC.png',
      totalFee: getWeselAjaMerchantFee('INTERBANK_BCA.VA', amount),
      minAmount: 10000,
      description: 'Transfer otomatis via BCA Mobile, myBCA, & KlikBCA',
    },
    {
      code: 'MDR.VA',
      name: 'Mandiri Virtual Account',
      category: 'VIRTUAL_ACCOUNT',
      image: 'https://images.duitku.com/hotlink-ok/M1.png',
      totalFee: getWeselAjaMerchantFee('MDR.VA', amount),
      minAmount: 10000,
      description: 'Transfer otomatis via Livin by Mandiri & ATM Mandiri',
    },
    {
      code: 'BNI.VA',
      name: 'BNI Virtual Account',
      category: 'VIRTUAL_ACCOUNT',
      image: 'https://images.duitku.com/hotlink-ok/I1.png',
      totalFee: getWeselAjaMerchantFee('BNI.VA', amount),
      minAmount: 10000,
      description: 'Transfer otomatis via BNI Mobile Banking & ATM BNI',
    },
    {
      code: 'BRI.VA',
      name: 'BRI Virtual Account (BRIVA)',
      category: 'VIRTUAL_ACCOUNT',
      image: 'https://images.duitku.com/hotlink-ok/BR.png',
      totalFee: getWeselAjaMerchantFee('BRI.VA', amount),
      minAmount: 10000,
      description: 'Transfer otomatis via BRImo & ATM BRI',
    },
    {
      code: 'PTB.VA',
      name: 'Permata Virtual Account',
      category: 'VIRTUAL_ACCOUNT',
      image: 'https://images.duitku.com/hotlink-ok/BT.png',
      totalFee: getWeselAjaMerchantFee('PTB.VA', amount),
      minAmount: 10000,
      description: 'Transfer otomatis via PermataMobile X & ATM',
    },
    {
      code: 'CIMBN.VA',
      name: 'CIMB Niaga Virtual Account',
      category: 'VIRTUAL_ACCOUNT',
      image: 'https://images.duitku.com/hotlink-ok/B1.png',
      totalFee: getWeselAjaMerchantFee('CIMBN.VA', amount),
      minAmount: 10000,
      description: 'Transfer otomatis via OCTO Mobile & OCTO Clicks',
    },
    {
      code: 'BDMN.VA',
      name: 'Danamon Virtual Account',
      category: 'VIRTUAL_ACCOUNT',
      image: 'https://images.duitku.com/hotlink-ok/A1.png',
      totalFee: getWeselAjaMerchantFee('BDMN.VA', amount),
      minAmount: 10000,
      description: 'Transfer otomatis via D-Bank PRO & ATM Danamon',
    },
    {
      code: 'BSI.VA',
      name: 'BSI Virtual Account',
      category: 'VIRTUAL_ACCOUNT',
      image: 'https://images.duitku.com/hotlink-ok/B1.png',
      totalFee: getWeselAjaMerchantFee('BSI.VA', amount),
      minAmount: 10000,
      description: 'Transfer syariah via BSI Mobile & ATM BSI',
    },
    {
      code: 'DANA',
      name: 'DANA E-Wallet',
      category: 'EWALLET',
      image: 'https://images.duitku.com/hotlink-ok/DA.png',
      totalFee: getWeselAjaMerchantFee('DANA', amount),
      minAmount: 10000,
      description: 'Pembayaran langsung aplikasi DANA',
    },
    {
      code: 'OVO',
      name: 'OVO E-Wallet',
      category: 'EWALLET',
      image: 'https://images.duitku.com/hotlink-ok/OV.png',
      totalFee: getWeselAjaMerchantFee('OVO', amount),
      minAmount: 10000,
      description: 'Pembayaran instan aplikasi OVO',
    },
  ];

  if (amount < 10000) {
    return allMethods.filter((m) => m.code === 'QRIS');
  }

  return allMethods;
}

/**
 * Create a WeselAja (XenithPay) payment transaction.
 * Supports direct payin (/v1/payins) and hosted links (/v1/payment-links).
 * Includes resilient simulation mode when credentials are not configured.
 */
export async function createWeselAjaPayment(params: CreatePaymentParams): Promise<PaymentResult> {
  const config = getConfig();
  const rawAmount = Math.round(params.amount);
  const selectedMethod = params.paymentMethod || 'QRIS';
  const fee = getWeselAjaMerchantFee(selectedMethod, rawAmount);
  const totalAmount = rawAmount + fee;

  // Fallback Simulation Mode (Zero-crash if API key is not configured)
  if (!config.apiKey || !config.secretKey) {
    console.warn('[WeselAja] Credentials not configured. Running in Resilient Simulation Mode.');
    const mockRef = `WESEL-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const isVA = selectedMethod.includes('.VA');
    const mockVA = isVA ? `8965${Math.floor(1000000000 + Math.random() * 9000000000)}` : undefined;

    return {
      success: true,
      paymentReference: mockRef,
      paymentCode: mockVA || `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=WESELAJA_SIMULATOR_${mockRef}`,
      paymentUrl: `/api/payment/weselaja/simulator?ref=${mockRef}&amount=${totalAmount}`,
      paymentMethod: selectedMethod,
      totalAmount,
      feeAmount: fee,
      isSimulated: true,
    };
  }

  try {
    let useDirectPayin = false;
    let paymentMethodField = '';
    let paymentChannelField = '';

    const methodUpper = selectedMethod.toUpperCase();
    if (methodUpper.includes('.VA')) {
      useDirectPayin = true;
      paymentMethodField = 'VIRTUAL_ACCOUNT';
      paymentChannelField = methodUpper;
    } else if (methodUpper === 'QRIS' || methodUpper === 'SP' || methodUpper === 'QR_CODE') {
      useDirectPayin = true;
      paymentMethodField = 'QR_CODE';
      paymentChannelField = 'QRIS';
    } else if (methodUpper === 'DANA' || methodUpper === 'OVO') {
      useDirectPayin = true;
      paymentMethodField = 'EWALLET';
      paymentChannelField = methodUpper;
    }

    const uri = useDirectPayin ? '/v1/payins' : '/v1/payment-links';
    const method = 'POST';
    const timestamp = new Date().toISOString();

    const requestBody = useDirectPayin
      ? {
          initiatedAmount: totalAmount,
          currency: 'IDR',
          paymentMethod: paymentMethodField,
          paymentChannel: paymentChannelField,
          referenceCode: params.orderId,
          customerReference: params.orderId,
          customerName: params.customerName || 'Customer',
          customerPhoneNumber: params.customerPhone || undefined,
          description: params.itemName || 'Payment',
          callbackUrl: params.callbackUrl,
          redirectUrl: params.successUrl,
        }
      : {
          amount: totalAmount,
          currency: 'IDR',
          redirectUrl: params.successUrl,
          paymentLinkCallbackUrl: params.callbackUrl,
          payinCallbackUrl: params.callbackUrl,
          customerReference: params.orderId,
          customerName: params.customerName || 'Customer',
          customerPhoneNumber: params.customerPhone || undefined,
          referenceCode: params.orderId,
        };

    const bodyString = JSON.stringify(requestBody);
    const signature = createRequestSignature(method, uri, timestamp, bodyString, config.secretKey);

    const response = await fetch(`${config.apiUrl}${uri}`, {
      method: 'POST',
      headers: {
        accept: 'application/json',
        'Content-Type': 'application/json',
        'Xenith-Api-Key': config.apiKey,
        'Xenith-Request-Timestamp': timestamp,
        'Xenith-Request-Signature': signature,
        'X-Idempotency-Key': crypto.randomUUID(),
      },
      body: bodyString,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data?.message || `Failed to create payment (${response.status})`);
    }

    return {
      success: true,
      paymentReference: data.id || data.referenceCode,
      paymentCode: data.paymentCode || data.virtualAccountNumber,
      paymentUrl: data.paymentLinkUrl || data.paymentUrl,
      paymentMethod: selectedMethod,
      totalAmount,
      feeAmount: fee,
      isSimulated: false,
    };
  } catch (error) {
    console.error('[WeselAja] API request failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Gagal menghubungi payment gateway WeselAja',
    };
  }
}

/**
 * Verify HMAC-SHA256 signature of incoming WeselAja / XenithPay webhook callbacks.
 */
export function verifyWeselAjaSignature(
  method: string,
  path: string,
  rawBody: string,
  timestamp: string,
  signature: string
): boolean {
  const config = getConfig();
  if (!config.webhookSecret) {
    console.error('[WeselAja] WESELAJA_WEBHOOK_SECRET is not configured');
    return false;
  }

  // Payload structure: {HTTP_METHOD}\n{URL_PATH}\n{REQUEST_BODY}\n{TIMESTAMP}
  const payload = `${method}\\n${path}\\n${rawBody}\\n${timestamp}`;
  const expectedSignature = crypto.createHmac('sha256', config.webhookSecret).update(payload).digest('base64');

  try {
    return crypto.timingSafeEqual(Buffer.from(expectedSignature), Buffer.from(signature));
  } catch {
    return false;
  }
}
