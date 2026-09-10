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

    const keyId = (context.env.RAZORPAY_KEY_ID || '').trim();
    const keySecret = (context.env.RAZORPAY_KEY_SECRET || '').trim();

    if (!keyId || !keySecret) {
      return new Response(
        JSON.stringify({
          success: false,
          message: 'Razorpay payment gateway credentials are not configured on the server. Please enter valid Key ID and Key Secret in Admin Settings.'
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
        keyId: keyId,
        testMode: false,
        isDemo: false
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
