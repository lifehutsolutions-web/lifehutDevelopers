// Cloudflare Pages Function: POST /api/razorpay/create-order
// Runs directly on Cloudflare Edge using environment variables configured in your Cloudflare dashboard

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

    const keyId = context.env.RAZORPAY_KEY_ID;
    const keySecret = context.env.RAZORPAY_KEY_SECRET;

    if (keyId && keySecret) {
      try {
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

        if (rzpResponse.ok) {
          const orderData: any = await rzpResponse.json();
          return new Response(
            JSON.stringify({
              success: true,
              orderId: orderData.id,
              amount: orderData.amount,
              currency: orderData.currency,
              keyId: keyId,
              testMode: false,
              isDemo: false
            }),
            { status: 200, headers: corsHeaders }
          );
        } else {
          const errText = await rzpResponse.text();
          console.warn('Razorpay API error, falling back to simulated order:', errText);
        }
      } catch (apiErr: any) {
        console.warn('Direct Razorpay API fetch failed:', apiErr);
      }
    }

    // Fallback: simulated order if keys are pending in Cloudflare
    const mockOrderId = `order_test_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    return new Response(
      JSON.stringify({
        success: true,
        orderId: mockOrderId,
        amount: amountInPaise,
        currency: 'INR',
        keyId: keyId || 'rzp_test_demo_lifehut',
        testMode: true,
        isDemo: !keyId
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
