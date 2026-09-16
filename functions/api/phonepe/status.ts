// Cloudflare Pages Function: /api/phonepe/status
// Verifies PhonePe payment status directly with PhonePe Gateway API
// Upon confirmed success, issues cryptographically signed download token for CAD & PDF drawings

interface Env {
  PHONEPE_MERCHANT_ID?: string;
  PHONEPE_SALT_KEY?: string;
  PHONEPE_SALT_INDEX?: string;
  PHONEPE_MODE?: string;
  DOWNLOAD_SECRET?: string;
  [key: string]: any;
}

async function sha256Hex(data: string): Promise<string> {
  const encoder = new TextEncoder();
  const hash = await crypto.subtle.digest('SHA-256', encoder.encode(data));
  return Array.from(new Uint8Array(hash))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
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
  const signatureBuffer = await crypto.subtle.sign('HMAC', cryptoKey, encoder.encode(data));
  return Array.from(new Uint8Array(signatureBuffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

async function verifyAndRespond(context: { request: Request; env: Env }, transactionId: string, planId: string, clientName?: string, clientPhone?: string, clientEmail?: string) {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Content-Type': 'application/json'
  };

  if (!transactionId) {
    return new Response(
      JSON.stringify({ success: false, verified: false, message: 'Transaction ID is required to check payment status.' }),
      { status: 400, headers: corsHeaders }
    );
  }

  // Resolve PhonePe credentials from env or fallback to Supabase
  let merchantId = (context.env.PHONEPE_MERCHANT_ID || '').trim();
  let saltKey = (context.env.PHONEPE_SALT_KEY || '').trim();
  let saltIndex = (context.env.PHONEPE_SALT_INDEX || '1').trim();
  let mode = (context.env.PHONEPE_MODE || 'UAT').trim().toUpperCase();

  if (!merchantId || !saltKey) {
    try {
      const sbUrl = context.env.VITE_SUPABASE_URL || context.env.SUPABASE_URL || 'https://vkthcqceywhdlmjsvsze.supabase.co';
      const sbKey = context.env.VITE_SUPABASE_ANON_KEY || context.env.SUPABASE_ANON_KEY || 'sb_publishable__eUGKx9jON0kZ1dVrBRmLw_-huhN1d7';
      const sbRes = await fetch(`${sbUrl}/rest/v1/settings?select=stats&limit=1`, {
        headers: { apikey: sbKey, Authorization: `Bearer ${sbKey}` }
      });
      if (sbRes.ok) {
        const rows: any = await sbRes.json().catch(() => []);
        const stats = rows?.[0]?.stats;
        if (stats) {
          if (!merchantId && stats.phonepeMerchantId) merchantId = String(stats.phonepeMerchantId).trim();
          if (!saltKey && stats.phonepeSaltKey) saltKey = String(stats.phonepeSaltKey).trim();
          if (stats.phonepeSaltIndex) saltIndex = String(stats.phonepeSaltIndex).trim();
          if (stats.phonepeMode) mode = String(stats.phonepeMode).trim().toUpperCase();
        }
      }
    } catch {}
  }

  if (!merchantId || merchantId === 'PGTESTPAYUAT') {
    merchantId = 'PGTESTPAYUAT86';
    saltKey = '96434309-7796-489d-8924-ab56988a6076';
    saltIndex = '1';
  }
  if (!saltKey || saltKey === '099eb0cd-02cf-4e2a-8aca-3e6c6aff0399') {
    saltKey = '96434309-7796-489d-8924-ab56988a6076';
  }
  if (!saltIndex) saltIndex = '1';

  const isProduction = mode === 'PRODUCTION';
  const apiHost = isProduction
    ? 'https://api.phonepe.com/apis/hermes'
    : 'https://api-preprod.phonepe.com/apis/pg-sandbox';

  // Helper to query PhonePe status
  async function queryStatus(mid: string, sKey: string, sIdx: string) {
    const statusPath = `/pg/v1/status/${mid}/${transactionId}`;
    const stringToHash = statusPath + sKey;
    const sha256Hash = await sha256Hex(stringToHash);
    const xVerifyHeader = `${sha256Hash}###${sIdx}`;

    try {
      const res = await fetch(`${apiHost}${statusPath}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'X-VERIFY': xVerifyHeader,
          'X-MERCHANT-ID': mid
        }
      });
      const data = await res.json().catch(() => ({}));
      return { res, data, ok: res.ok };
    } catch (err: any) {
      return { res: null, data: null, ok: false, error: err };
    }
  }

  let statusCheck = await queryStatus(merchantId, saltKey, saltIndex);

  // If in UAT and key returned KEY_NOT_CONFIGURED or "Key not found", fallback to PGTESTPAYUAT86
  if (
    !isProduction &&
    (!statusCheck.ok || !statusCheck.data?.success) &&
    (statusCheck.data?.code === 'KEY_NOT_CONFIGURED' ||
     String(statusCheck.data?.message || '').toLowerCase().includes('key not found') ||
     merchantId !== 'PGTESTPAYUAT86')
  ) {
    const fallbackCheck = await queryStatus('PGTESTPAYUAT86', '96434309-7796-489d-8924-ab56988a6076', '1');
    if (fallbackCheck.ok || fallbackCheck.data?.code !== 'KEY_NOT_CONFIGURED') {
      statusCheck = fallbackCheck;
    }
  }

  if (!statusCheck.res && statusCheck.error) {
    return new Response(
      JSON.stringify({ success: false, verified: false, message: `Could not reach PhonePe status API: ${statusCheck.error.message}` }),
      { status: 502, headers: corsHeaders }
    );
  }

  const statusData = statusCheck.data;

  const isSuccess = Boolean(
    statusData?.success === true &&
    (statusData?.code === 'PAYMENT_SUCCESS' || statusData?.data?.responseCode === 'SUCCESS' || statusData?.data?.state === 'COMPLETED')
  );

  if (!isSuccess) {
    const code = statusData?.code || 'PAYMENT_PENDING';
    const message = statusData?.message || 'Payment has not been completed yet.';
    return new Response(
      JSON.stringify({
        success: false,
        verified: false,
        code,
        message,
        transactionId
      }),
      { status: 200, headers: corsHeaders }
    );
  }

  // Payment is confirmed authentic and successful!
  const effectivePlanId = planId || 'house_plan_default';
  const downloadSecret = context.env.DOWNLOAD_SECRET || saltKey || 'lifehut_secure_cad_token_key';
  const expiresAt = Date.now() + 24 * 60 * 60 * 1000;
  const tokenPayload = `${effectivePlanId}:${transactionId}:${expiresAt}`;
  const tokenSignature = await hmacSha256(downloadSecret, tokenPayload);
  const downloadToken = `${expiresAt}.${tokenSignature}`;
  const downloadUrl = `/api/download?planId=${encodeURIComponent(effectivePlanId)}&token=${encodeURIComponent(downloadToken)}&paymentId=${encodeURIComponent(transactionId)}`;

  // Log successful purchase to Supabase enquiries if available
  try {
    const sbUrl = context.env.VITE_SUPABASE_URL || context.env.SUPABASE_URL || 'https://vkthcqceywhdlmjsvsze.supabase.co';
    const sbKey = context.env.VITE_SUPABASE_ANON_KEY || context.env.SUPABASE_ANON_KEY || 'sb_publishable__eUGKx9jON0kZ1dVrBRmLw_-huhN1d7';
    await fetch(`${sbUrl}/rest/v1/enquiries`, {
      method: 'POST',
      headers: {
        apikey: sbKey,
        Authorization: `Bearer ${sbKey}`,
        'Content-Type': 'application/json',
        Prefer: 'return=minimal'
      },
      body: JSON.stringify({
        id: `phonepe_${Date.now()}`,
        name: clientName || 'Verified Homeowner',
        email: clientEmail || '',
        phone: clientPhone || '',
        service: `CAD & PDF Drawings (PhonePe: ${transactionId})`,
        message: `Paid via PhonePe Payment Gateway (Transaction ID: ${transactionId}). Plan ID: ${effectivePlanId}.`,
        date: new Date().toISOString(),
        status: 'New'
      })
    });
  } catch {}

  return new Response(
    JSON.stringify({
      success: true,
      verified: true,
      code: 'PAYMENT_SUCCESS',
      message: 'Payment verified successfully! Your CAD drawings package is unlocked.',
      transactionId,
      phonepeTxnId: statusData?.data?.transactionId || transactionId,
      amount: (statusData?.data?.amount || 99900) / 100,
      downloadToken,
      downloadUrl
    }),
    { status: 200, headers: corsHeaders }
  );
}

export const onRequestGet = async (context: { request: Request; env: Env }) => {
  const url = new URL(context.request.url);
  const transactionId = url.searchParams.get('transactionId') || url.searchParams.get('txnId') || url.searchParams.get('id') || '';
  const planId = url.searchParams.get('planId') || url.searchParams.get('plan_id') || '';
  const clientName = url.searchParams.get('clientName') || '';
  const clientPhone = url.searchParams.get('clientPhone') || '';
  const clientEmail = url.searchParams.get('clientEmail') || '';

  return verifyAndRespond(context, transactionId, planId, clientName, clientPhone, clientEmail);
};

export const onRequestPost = async (context: { request: Request; env: Env }) => {
  const body: any = await context.request.json().catch(() => ({}));
  const transactionId = body.transactionId || body.txnId || body.merchantTransactionId || '';
  const planId = body.planId || body.plan_id || '';
  const clientName = body.clientName;
  const clientPhone = body.clientPhone;
  const clientEmail = body.clientEmail;

  return verifyAndRespond(context, transactionId, planId, clientName, clientPhone, clientEmail);
};

export const onRequestOptions = async () => {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    }
  });
};
