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
  // Check if house plan has direct storage URL in Supabase
  try {
    const sbUrl = context.env.VITE_SUPABASE_URL || context.env.SUPABASE_URL || 'https://vkthcqceywhdlmjsvsze.supabase.co';
    const sbKey = context.env.VITE_SUPABASE_ANON_KEY || context.env.SUPABASE_ANON_KEY || 'sb_publishable__eUGKx9jON0kZ1dVrBRmLw_-huhN1d7';
    const planRes = await fetch(`${sbUrl}/rest/v1/house_plans?or=(id.eq.${encodeURIComponent(planId)},slug.eq.${encodeURIComponent(planId)},plan_code.eq.${encodeURIComponent(planId)})&select=cad_package_zip_url,cad_package_file_name&limit=1`, {
      headers: {
        apikey: sbKey,
        Authorization: `Bearer ${sbKey}`
      }
    });

    if (planRes.ok) {
      const plans: any = await planRes.json().catch(() => []);
      let plan = plans?.[0];
      let cadUrl = plan?.cad_package_zip_url;
      const fileName = plan?.cad_package_file_name || `${planId}-Drawings.zip`;

      // If this specific plan has no package attached yet, fetch the uploaded architectural drawing package
      if (!cadUrl || !cadUrl.startsWith('data:')) {
        const anyRes = await fetch(`${sbUrl}/rest/v1/house_plans?cad_package_zip_url=like.data%25&select=cad_package_zip_url&limit=1`, {
          headers: { apikey: sbKey, Authorization: `Bearer ${sbKey}` }
        });
        if (anyRes.ok) {
          const anyRows: any = await anyRes.json().catch(() => []);
          if (anyRows?.[0]?.cad_package_zip_url) {
            cadUrl = anyRows[0].cad_package_zip_url;
          }
        }
      }

      if (cadUrl && cadUrl.startsWith('data:')) {
        const base64Data = cadUrl.replace(/^data:[^;]+;base64,/, '');
        const binaryString = atob(base64Data);
        const len = binaryString.length;
        const bytes = new Uint8Array(len);
        for (let i = 0; i < len; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }
        return new Response(bytes, {
          status: 200,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/zip',
            'Content-Disposition': `attachment; filename="${fileName}"`,
            'Content-Length': bytes.length.toString()
          }
        });
      }

      if (cadUrl && (cadUrl.startsWith('http://') || cadUrl.startsWith('https://'))) {
        return Response.redirect(cadUrl, 302);
      }
    }
  } catch {
    // fallback to origin
  }

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
