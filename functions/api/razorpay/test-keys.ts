// Cloudflare Pages Function: POST /api/razorpay/test-keys
// Tests Razorpay API credentials on Cloudflare Edge

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
    const keyId = (body.keyId || context.env.RAZORPAY_KEY_ID || '').trim();
    const keySecret = (body.keySecret || context.env.RAZORPAY_KEY_SECRET || '').trim();

    if (!keyId) {
      return new Response(
        JSON.stringify({
          success: true,
          status: 'sandbox',
          message: 'No Key ID entered. Simulated sandbox mode is active for safe test orders.'
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
          message: `Key format valid (${keyId.startsWith('rzp_live_') ? 'Live' : 'Test'}). Note: External Razorpay ping timed out, but keys are saved.`
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
