// Cloudflare Pages Function: GET /api/payments/debug-env
// Diagnostic endpoint to check if Cloudflare has injected PhonePe variables
// NOTE: Masks secrets completely for security

interface Env {
  PHONEPE_MERCHANT_ID?: string;
  PHONEPE_SALT_KEY?: string;
  PHONEPE_SALT_INDEX?: string;
  PHONEPE_MODE?: string;
  DOWNLOAD_SECRET?: string;
  [key: string]: any;
}

export const onRequestGet = async (context: { env: Env }) => {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Content-Type': 'application/json'
  };

  const merchantId = context.env.PHONEPE_MERCHANT_ID || '';
  const saltKey = context.env.PHONEPE_SALT_KEY || '';
  const saltIndex = context.env.PHONEPE_SALT_INDEX || '1';
  const mode = context.env.PHONEPE_MODE || 'UAT';

  return new Response(
    JSON.stringify({
      hasPhonePeMerchantId: Boolean(merchantId),
      merchantIdPreview: merchantId ? `${merchantId.slice(0, 8)}... (${merchantId.length} chars)` : 'MISSING_IN_ENV',
      hasPhonePeSaltKey: Boolean(saltKey),
      saltKeyPreview: saltKey ? `${saltKey.slice(0, 3)}*** (${saltKey.length} chars)` : 'MISSING_IN_ENV',
      saltIndex,
      mode,
      allEnvKeysAvailableInWorker: Object.keys(context.env).filter(k => !k.includes('SECRET') && !k.includes('KEY')),
      note: 'If values are MISSING_IN_ENV, check Cloudflare Pages > Settings > Environment variables > Production & Preview.'
    }),
    { status: 200, headers: corsHeaders }
  );
};
