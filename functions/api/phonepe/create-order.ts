// Cloudflare Pages Function: POST /api/razorpay/create-order
// Real Razorpay order creation only - No sandbox/test simulations

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
    const { planId, clientName, clientEmail, clientPhone, amount } = body;

    const finalAmount = Number(amount) || 999;
    const amountInPaise = Math.round(finalAmount * 100);

    let keyId = (context.env.RAZORPAY_KEY_ID || context.env.VITE_RAZORPAY_KEY_ID || body.keyId || '').trim();
    let keySecret = (context.env.RAZORPAY_KEY_SECRET || body.keySecret || '').trim();

    // Fallback: If not found in env, check Supabase settings table
    if (!keyId || !keySecret) {
      try {
        const sbUrl = context.env.VITE_SUPABASE_URL || context.env.SUPABASE_URL || 'https://vkthcqceywhdlmjsvsze.supabase.co';
        const sbKey = context.env.VITE_SUPABASE_ANON_KEY || context.env.SUPABASE_ANON_KEY || 'sb_publishable__eUGKx9jON0kZ1dVrBRmLw_-huhN1d7';
        const sbRes = await fetch(`${sbUrl}/rest/v1/settings?select=stats&limit=1`, {
          headers: {
            apikey: sbKey,
            Authorization: `Bearer ${sbKey}`
          }
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
        // ignore fallback errors
      }
    }

    const isPlaceholder = !keyId ||
      keyId === 'rzp_test_demo_lifehut' ||
      keyId === 'rzp_test_lifehut_demo' ||
      keySecret === 'demo_secret_12345' ||
      keyId.includes('placeholder') ||
      keySecret.length < 8;

    const isRealRazorpay = Boolean(
      keyId &&
      keySecret &&
      keyId.startsWith('rzp_') &&
      !isPlaceholder
    );

    if (!isRealRazorpay) {
      return new Response(
        JSON.stringify({
          success: false,
          message: 'Razorpay credentials (Key ID and Secret) are not configured. Please enter your Razorpay keys in Admin Settings or configure RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in Cloudflare environment variables.'
        }),
        { status: 400, headers: corsHeaders }
      );
    }

    const credentials = btoa(`${keyId}:${keySecret}`);
    const rzpResponse = await fetch('https://api.razorpay.com/v1/orders', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${credentials}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        amount: amountInPaise,
        currency: 'INR',
        receipt: `rcpt_lh_${Date.now().toString().slice(-8)}`,
        notes: {
          planId: planId || '',
          clientName: clientName || '',
          clientPhone: clientPhone || ''
        }
      })
    });

    if (!rzpResponse.ok) {
      const errJson: any = await rzpResponse.json().catch(() => ({}));
      const errDescription = errJson?.error?.description || errJson?.message || 'Failed to create order with Razorpay.';
      return new Response(
        JSON.stringify({
          success: false,
          message: `Razorpay Error: ${errDescription}`
        }),
        { status: rzpResponse.status, headers: corsHeaders }
      );
    }

    const orderData: any = await rzpResponse.json();
    return new Response(
      JSON.stringify({
        success: true,
        orderId: orderData.id,
        amount: orderData.amount,
        currency: orderData.currency || 'INR',
        keyId: keyId
      }),
      { status: 200, headers: corsHeaders }
    );
  } catch (err: any) {
    return new Response(
      JSON.stringify({ success: false, message: err?.message || 'Failed to create payment order' }),
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
