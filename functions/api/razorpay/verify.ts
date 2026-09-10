// Cloudflare Pages Function: POST /api/payments/verify
// Cryptographically verifies Razorpay payment signature using Web Crypto HMAC-SHA256
// Upon genuine verification, generates a signed download token

interface Env {
  RAZORPAY_KEY_SECRET?: string;
  DOWNLOAD_SECRET?: string;
  [key: string]: any;
}

async function hmacSha256(secret: string, data: string): Promise<string> {
  const encoder = new TextEncoder();
  const keyData = encoder.encode(secret);
  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    keyData,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const signatureBuffer = await crypto.subtle.sign(
    'HMAC',
    cryptoKey,
    encoder.encode(data)
  );
  return Array.from(new Uint8Array(signatureBuffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

export const onRequestPost = async (context: { request: Request; env: Env }) => {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Content-Type': 'application/json'
  };

  try {
    const body: any = await context.request.json().catch(() => ({}));
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      planId,
      clientName,
      clientEmail,
      clientPhone
    } = body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return new Response(
        JSON.stringify({
          success: false,
          verified: false,
          message: 'Missing required payment verification parameters.'
        }),
        { status: 400, headers: corsHeaders }
      );
    }

    const keySecret = (context.env.RAZORPAY_KEY_SECRET || '').trim();
    if (!keySecret) {
      return new Response(
        JSON.stringify({
          success: false,
          verified: false,
          message: 'Razorpay Secret Key is not configured on the server. Please configure it in settings.'
        }),
        { status: 500, headers: corsHeaders }
      );
    }

    // Strictly verify signature: HMAC-SHA256(order_id + '|' + payment_id, secret)
    const payload = `${razorpay_order_id}|${razorpay_payment_id}`;
    const expectedSignature = await hmacSha256(keySecret, payload);

    if (expectedSignature.toLowerCase() !== razorpay_signature.toLowerCase()) {
      return new Response(
        JSON.stringify({
          success: false,
          verified: false,
          message: 'Cryptographic signature verification failed. Payment was not confirmed by Razorpay.'
        }),
        { status: 400, headers: corsHeaders }
      );
    }

    // Payment is genuinely verified! Generate time-limited signed download token (valid 24h)
    const downloadSecret = context.env.DOWNLOAD_SECRET || keySecret || 'lifehut_secure_cad_token_key';
    const expiresAt = Date.now() + 24 * 60 * 60 * 1000;
    const tokenPayload = `${planId}:${razorpay_payment_id}:${expiresAt}`;
    const tokenSignature = await hmacSha256(downloadSecret, tokenPayload);
    const downloadToken = `${expiresAt}.${tokenSignature}`;

    const downloadUrl = `/api/download?planId=${encodeURIComponent(planId)}&token=${encodeURIComponent(downloadToken)}&paymentId=${encodeURIComponent(razorpay_payment_id)}`;

    return new Response(
      JSON.stringify({
        success: true,
        verified: true,
        message: 'Payment verified successfully! Your CAD & PDF drawings package has been unlocked.',
        paymentId: razorpay_payment_id,
        orderId: razorpay_order_id,
        planId: planId,
        downloadToken,
        downloadUrl
      }),
      { status: 200, headers: corsHeaders }
    );
  } catch (err: any) {
    return new Response(
      JSON.stringify({ success: false, verified: false, message: err?.message || 'Payment verification failed' }),
      { status: 500, headers: corsHeaders }
    );
  }
};

export const onRequestOptions = async () => {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    }
  });
};
