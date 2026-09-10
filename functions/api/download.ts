// Cloudflare Pages Function: GET /api/download
// Validates cryptographic download token issued after Razorpay payment verification
// Blocks any download attempts without valid payment verification

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

export const onRequestGet = async (context: { request: Request; env: Env }) => {
  const url = new URL(context.request.url);
  const planId = url.searchParams.get('planId') || url.searchParams.get('id');
  const token = url.searchParams.get('token');
  const paymentId = url.searchParams.get('paymentId') || url.searchParams.get('payment_id');

  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization'
  };

  if (!planId) {
    return new Response(
      JSON.stringify({ success: false, message: 'Plan identifier is missing.' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  if (!token || !paymentId) {
    return new Response(
      JSON.stringify({
        success: false,
        message: 'Payment verification required. Downloads are strictly protected and require a verified purchase through Razorpay checkout.'
      }),
      { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  // Token format: `${expiresAt}.${tokenSignature}`
  const tokenParts = token.split('.');
  if (tokenParts.length !== 2) {
    return new Response(
      JSON.stringify({ success: false, message: 'Invalid or forged download token.' }),
      { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  const [expiresAtStr, providedSignature] = tokenParts;
  const expiresAt = Number(expiresAtStr);

  if (isNaN(expiresAt) || Date.now() > expiresAt) {
    return new Response(
      JSON.stringify({ success: false, message: 'Download token has expired. Please contact support with your Payment ID.' }),
      { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  const downloadSecret = context.env.DOWNLOAD_SECRET || context.env.RAZORPAY_KEY_SECRET || 'lifehut_secure_cad_token_key';
  const tokenPayload = `${planId}:${paymentId}:${expiresAt}`;
  const expectedSignature = await hmacSha256(downloadSecret, tokenPayload);

  if (expectedSignature.toLowerCase() !== providedSignature.toLowerCase()) {
    return new Response(
      JSON.stringify({ success: false, message: 'Cryptographic token validation failed. Download denied.' }),
      { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  // Token is valid and payment is verified!
  // Forward to origin Express download endpoint with confirmed verified flag
  const forwardUrl = new URL(`/api/house-plans/${encodeURIComponent(planId)}/download-cad`, url.origin);
  forwardUrl.searchParams.set('verified_token', token);
  forwardUrl.searchParams.set('payment_id', paymentId);

  return Response.redirect(forwardUrl.toString(), 302);
};

export const onRequestOptions = async () => {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    }
  });
};
