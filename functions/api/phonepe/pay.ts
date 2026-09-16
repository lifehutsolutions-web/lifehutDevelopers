// Cloudflare Pages Function: POST /api/phonepe/pay
// Initiates PhonePe Payment Gateway checkout session for House Plan Blueprints CAD & PDF package

interface Env {
  PHONEPE_MERCHANT_ID?: string;
  PHONEPE_SALT_KEY?: string;
  PHONEPE_SALT_INDEX?: string;
  PHONEPE_MODE?: string;
  [key: string]: any;
}

async function sha256Hex(data: string): Promise<string> {
  const encoder = new TextEncoder();
  const hash = await crypto.subtle.digest('SHA-256', encoder.encode(data));
  return Array.from(new Uint8Array(hash))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

function toBase64(str: string): string {
  const bytes = new TextEncoder().encode(str);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
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
    const { planId, clientName, clientEmail, clientPhone, amount } = body;

    if (!planId) {
      return new Response(
        JSON.stringify({ success: false, message: 'Plan ID is required to initiate PhonePe checkout.' }),
        { status: 400, headers: corsHeaders }
      );
    }

    const finalAmount = Number(amount) || 999;
    if (finalAmount <= 0) {
      return new Response(
        JSON.stringify({ success: false, message: 'This plan is free. Please claim via the free download route.' }),
        { status: 400, headers: corsHeaders }
      );
    }

    const amountInPaise = Math.round(finalAmount * 100);

    // Resolve PhonePe credentials from env or body overrides
    let merchantId = (context.env.PHONEPE_MERCHANT_ID || body.merchantId || '').trim();
    let saltKey = (context.env.PHONEPE_SALT_KEY || body.saltKey || '').trim();
    let saltIndex = (context.env.PHONEPE_SALT_INDEX || body.saltIndex || '1').trim();
    let mode = (context.env.PHONEPE_MODE || body.mode || 'UAT').trim().toUpperCase();
    let enabled = true;

    // Fallback: Check Supabase settings table if credentials are not in environment
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
            if (stats.phonepeEnabled !== undefined) enabled = stats.phonepeEnabled;
          }
        }
      } catch {}
    }

    if (!enabled) {
      return new Response(
        JSON.stringify({ success: false, message: 'Online checkout is currently disabled by administrator.' }),
        { status: 403, headers: corsHeaders }
      );
    }

    // Default to PhonePe UAT Sandbox (PGTESTPAYUAT86) if not provided or if using deprecated PGTESTPAYUAT
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

    const cleanPhone = (clientPhone || '').replace(/\D/g, '').slice(-10) || '9876543210';
    const merchantTransactionId = `MT_LH_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const merchantUserId = `MUID_LH_${Date.now()}`;

    // Construct redirect URL back to the house plans view with payment transaction ID
    const requestUrl = new URL(context.request.url);
    const origin = requestUrl.origin;
    const redirectUrl = `${origin}/house-plans?phonepe_txn=${encodeURIComponent(merchantTransactionId)}&plan_id=${encodeURIComponent(planId)}&mid=${encodeURIComponent(merchantId)}`;
    const callbackUrl = `${origin}/api/phonepe/status`;

    // Helper to send payment initiation request to PhonePe
    async function requestPhonePePayment(targetMid: string, targetSaltKey: string, targetSaltIdx: string) {
      const payload = {
        merchantId: targetMid,
        merchantTransactionId,
        merchantUserId,
        amount: amountInPaise,
        redirectUrl: `${origin}/house-plans?phonepe_txn=${encodeURIComponent(merchantTransactionId)}&plan_id=${encodeURIComponent(planId)}&mid=${encodeURIComponent(targetMid)}`,
        redirectMode: 'REDIRECT',
        callbackUrl,
        mobileNumber: cleanPhone,
        paymentInstrument: {
          type: 'PAY_PAGE'
        }
      };

      const base64Payload = toBase64(JSON.stringify(payload));
      const stringToHash = base64Payload + '/pg/v1/pay' + targetSaltKey;
      const sha256Hash = await sha256Hex(stringToHash);
      const xVerifyHeader = `${sha256Hash}###${targetSaltIdx}`;

      const res = await fetch(`${apiHost}/pg/v1/pay`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-VERIFY': xVerifyHeader
        },
        body: JSON.stringify({ request: base64Payload })
      });

      const data: any = await res.json().catch(() => ({}));
      return { res, data, mid: targetMid };
    }

    let result = await requestPhonePePayment(merchantId, saltKey, saltIndex);

    // If in UAT and the provided key was rejected with "Key not found" or KEY_NOT_CONFIGURED,
    // automatically fallback to the active PhonePe official UAT simulator credentials (PGTESTPAYUAT86)
    if (
      !isProduction &&
      (!result.res.ok || !result.data?.success) &&
      (result.data?.code === 'KEY_NOT_CONFIGURED' ||
       String(result.data?.message || '').toLowerCase().includes('key not found') ||
       merchantId !== 'PGTESTPAYUAT86')
    ) {
      const fallbackResult = await requestPhonePePayment('PGTESTPAYUAT86', '96434309-7796-489d-8924-ab56988a6076', '1');
      if (fallbackResult.res.ok && fallbackResult.data?.success) {
        result = fallbackResult;
      }
    }

    if (!result.res.ok || !result.data?.success) {
      const errMsg = result.data?.message || `PhonePe PG responded with status ${result.res.status}`;
      return new Response(
        JSON.stringify({ success: false, message: `PhonePe error: ${errMsg}` }),
        { status: 400, headers: corsHeaders }
      );
    }

    const redirectInfo = result.data?.data?.instrumentResponse?.redirectInfo;
    const paymentUrl = redirectInfo?.url;

    if (!paymentUrl) {
      return new Response(
        JSON.stringify({ success: false, message: 'Could not obtain checkout URL from PhonePe.' }),
        { status: 500, headers: corsHeaders }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        transactionId: merchantTransactionId,
        paymentUrl,
        redirectUrl: paymentUrl,
        amount: finalAmount,
        currency: 'INR',
        merchantId: result.mid,
        mode: isProduction ? 'PRODUCTION' : 'UAT'
      }),
      { status: 200, headers: corsHeaders }
    );
  } catch (err: any) {
    return new Response(
      JSON.stringify({ success: false, message: err?.message || 'Internal error creating PhonePe transaction.' }),
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
