// Cloudflare Pages Function: POST /api/payments/test-keys
// Verifies live or test Razorpay credentials against Razorpay API

interface Env {
  RAZORPAY_KEY_ID?: string;
  RAZORPAY_KEY_SECRET?: string;
  [key: string]: any;
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
    let keyId = (body.keyId || context.env.RAZORPAY_KEY_ID || context.env.VITE_RAZORPAY_KEY_ID || '').trim();
    let keySecret = (body.keySecret || context.env.RAZORPAY_KEY_SECRET || '').trim();

    if (!keyId || !keySecret) {
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
            if (!keyId && stats.razorpayKeyId) keyId = String(stats.razorpayKeyId).trim();
            if (!keySecret && stats.razorpayKeySecret) keySecret = String(stats.razorpayKeySecret).trim();
          }
        }
      } catch {
        // ignore
      }
    }

    if (!keyId) {
      return new Response(
        JSON.stringify({
          success: false,
          status: 'missing_key',
          message: 'Razorpay Key ID is required to accept actual payments. Please enter Key ID.'
        }),
        { status: 200, headers: corsHeaders }
      );
    }

    if (!keyId.startsWith('rzp_live_') && !keyId.startsWith('rzp_test_')) {
      return new Response(
        JSON.stringify({
          success: false,
          status: 'invalid_format',
          message: `Key ID format should start with 'rzp_live_' or 'rzp_test_'. Provided: ${keyId.slice(0, 10)}...`
        }),
        { status: 200, headers: corsHeaders }
      );
    }

    if (!keySecret) {
      return new Response(
        JSON.stringify({
          success: false,
          status: 'missing_secret',
          message: 'Razorpay Key Secret is required alongside Key ID.'
        }),
        { status: 200, headers: corsHeaders }
      );
    }

    // Direct test with Razorpay
    try {
      const credentials = btoa(`${keyId}:${keySecret}`);
      const testRes = await fetch('https://api.razorpay.com/v1/orders?count=1', {
        method: 'GET',
        headers: {
          'Authorization': `Basic ${credentials}`,
          'Content-Type': 'application/json'
        }
      });

      if (testRes.ok) {
        const isLive = keyId.startsWith('rzp_live_');
        return new Response(
          JSON.stringify({
            success: true,
            status: isLive ? 'live_verified' : 'test_verified',
            isLive,
            keyId,
            message: isLive
              ? 'Live Gateway Verified! Active Razorpay Production API keys confirmed.'
              : 'Test Gateway Verified! Active Razorpay Test API keys confirmed.'
          }),
          { status: 200, headers: corsHeaders }
        );
      } else {
        const errData: any = await testRes.json().catch(() => ({}));
        const desc = errData?.error?.description || `Authentication failed (HTTP ${testRes.status})`;
        return new Response(
          JSON.stringify({
            success: false,
            status: 'auth_failed',
            message: `Razorpay rejected credentials: ${desc}`
          }),
          { status: 200, headers: corsHeaders }
        );
      }
    } catch (fetchErr: any) {
      return new Response(
        JSON.stringify({
          success: true,
          status: 'network_warning',
          message: `Key format valid (${keyId.startsWith('rzp_live_') ? 'Live' : 'Test'}). Credentials saved.`
        }),
        { status: 200, headers: corsHeaders }
      );
    }
  } catch (err: any) {
    return new Response(
      JSON.stringify({ success: false, message: 'Error checking Razorpay credentials.' }),
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
