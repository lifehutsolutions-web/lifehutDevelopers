// Cloudflare Pages Function: POST /api/payments/create-order
// Creates a genuine Razorpay payment order for house plans CAD & PDF package

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

    if (!planId) {
      return new Response(
        JSON.stringify({ success: false, message: 'Plan ID is required to initiate checkout.' }),
        { status: 400, headers: corsHeaders }
      );
    }

    const finalAmount = Number(amount) || 999;
    if (finalAmount <= 0) {
      return new Response(
        JSON.stringify({ success: false, message: 'This plan is free. Please claim via free download route.' }),
        { status: 400, headers: corsHeaders }
      );
    }

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
      } catch (err) {
        // ignore supabase fallback errors
      }
    }

    if (!keyId || !keySecret) {
      return new Response(
        JSON.stringify({
          success: false,
          message: 'Razorpay credentials (Key ID and Secret) are missing or not configured in Cloudflare Environment Variables or Admin Settings. Please visit /api/payments/debug-env to inspect environment.'
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
          planId: String(planId),
          clientName: String(clientName || ''),
          clientPhone: String(clientPhone || ''),
          clientEmail: String(clientEmail || '')
        }
      })
    });

    if (!rzpResponse.ok) {
      const errJson: any = await rzpResponse.json().catch(() => ({}));
      const errDescription = errJson?.error?.description || errJson?.message || 'Razorpay order creation failed.';
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
