// Cloudflare Pages Function: POST /api/payments/claim-free
// Handles authorized download claims for free house plans or promo downloads

interface Env {
  DOWNLOAD_SECRET?: string;
  RAZORPAY_KEY_SECRET?: string;
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
    const { planId, clientName, clientEmail, clientPhone, isFreePlan } = body;

    if (!planId) {
      return new Response(
        JSON.stringify({ success: false, message: 'Plan ID is required.' }),
        { status: 400, headers: corsHeaders }
      );
    }

    if (!isFreePlan) {
      return new Response(
        JSON.stringify({
          success: false,
          message: 'This CAD drawings package requires a paid purchase through Razorpay checkout.'
        }),
        { status: 403, headers: corsHeaders }
      );
    }

    if (!clientName || !clientPhone) {
      return new Response(
        JSON.stringify({ success: false, message: 'Please provide your name and mobile number to claim.' }),
        { status: 400, headers: corsHeaders }
      );
    }

    const freeClaimId = `FREE_${Date.now()}`;
    const downloadSecret = context.env.DOWNLOAD_SECRET || context.env.RAZORPAY_KEY_SECRET || 'lifehut_secure_cad_token_key';
    const expiresAt = Date.now() + 24 * 60 * 60 * 1000;
    const tokenPayload = `${planId}:${freeClaimId}:${expiresAt}`;
    const tokenSignature = await hmacSha256(downloadSecret, tokenPayload);
    const downloadToken = `${expiresAt}.${tokenSignature}`;

    const downloadUrl = `/api/download?planId=${encodeURIComponent(planId)}&token=${encodeURIComponent(downloadToken)}&paymentId=${encodeURIComponent(freeClaimId)}`;

    return new Response(
      JSON.stringify({
        success: true,
        verified: true,
        isFree: true,
        paymentId: freeClaimId,
        downloadToken,
        downloadUrl
      }),
      { status: 200, headers: corsHeaders }
    );
  } catch (err: any) {
    return new Response(
      JSON.stringify({ success: false, message: err?.message || 'Failed to claim download' }),
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
