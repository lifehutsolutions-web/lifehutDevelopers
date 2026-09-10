// Cloudflare Pages Function: GET /api/payments/debug-env
// Temporary diagnostic endpoint to check if Cloudflare has injected variables
// NOTE: Masks secrets completely for security

interface Env {
  RAZORPAY_KEY_ID?: string;
  RAZORPAY_KEY_SECRET?: string;
  VITE_RAZORPAY_KEY_ID?: string;
  [key: string]: any;
}

export const onRequestGet = async (context: { env: Env }) => {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Content-Type': 'application/json'
  };

  const keyId = context.env.RAZORPAY_KEY_ID || context.env.VITE_RAZORPAY_KEY_ID || '';
  const secret = context.env.RAZORPAY_KEY_SECRET || '';

  return new Response(
    JSON.stringify({
      hasRazorpayKeyId: Boolean(keyId),
      keyIdPreview: keyId ? `${keyId.slice(0, 8)}... (${keyId.length} chars)` : 'MISSING_IN_ENV',
      hasRazorpayKeySecret: Boolean(secret),
      secretPreview: secret ? `${secret.slice(0, 3)}*** (${secret.length} chars)` : 'MISSING_IN_ENV',
      allEnvKeysAvailableInWorker: Object.keys(context.env).filter(k => !k.includes('SECRET') && !k.includes('KEY')),
      note: 'If values are MISSING_IN_ENV, check Cloudflare Pages > Settings > Environment variables > Production & Preview, or if they were added under Secrets/Encrypted.'
    }),
    { status: 200, headers: corsHeaders }
  );
};
