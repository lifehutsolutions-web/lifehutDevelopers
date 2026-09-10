// Cloudflare Pages Function: GET /api/razorpay/config
// Provides client checkout with Razorpay public key ID

interface Env {
  RAZORPAY_KEY_ID?: string;
  RAZORPAY_KEY_SECRET?: string;
  [key: string]: any;
}

export const onRequestGet = async (context: { request: Request; env: Env }) => {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Content-Type': 'application/json'
  };

  const keyId = context.env.RAZORPAY_KEY_ID || '';
  const keySecret = context.env.RAZORPAY_KEY_SECRET || '';

  const isReal = Boolean(
    (keyId.startsWith('rzp_live_') || keyId.startsWith('rzp_test_')) &&
    !keyId.includes('demo') &&
    !keyId.includes('placeholder')
  );

  return new Response(
    JSON.stringify({
      keyId: isReal ? keyId : 'rzp_test_lifehut_demo',
      isConfigured: isReal && Boolean(keySecret),
      testMode: !isReal,
      enabled: true,
      currency: 'INR'
    }),
    {
      status: 200,
      headers: corsHeaders
    }
  );
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
