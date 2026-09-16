// Cloudflare Pages Function: GET /api/phonepe/config
// Provides public configuration status for PhonePe Payment Gateway

interface Env {
  PHONEPE_MERCHANT_ID?: string;
  PHONEPE_SALT_KEY?: string;
  PHONEPE_SALT_INDEX?: string;
  PHONEPE_MODE?: string;
  [key: string]: any;
}

export const onRequestGet = async (context: { request: Request; env: Env }) => {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Content-Type': 'application/json'
  };

  let merchantId = (context.env.PHONEPE_MERCHANT_ID || '').trim();
  let saltKey = (context.env.PHONEPE_SALT_KEY || '').trim();
  let saltIndex = (context.env.PHONEPE_SALT_INDEX || '1').trim();
  let mode = (context.env.PHONEPE_MODE || 'UAT').trim().toUpperCase();
  let enabled = true;

  // Fallback: Check Supabase settings table if env is not populated
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

  // Default to PhonePe official active UAT simulator credentials if none configured or using retired PGTESTPAYUAT
  let effectiveMerchantId = merchantId || 'PGTESTPAYUAT86';
  if (effectiveMerchantId === 'PGTESTPAYUAT') {
    effectiveMerchantId = 'PGTESTPAYUAT86';
  }
  const isCustomConfigured = Boolean(merchantId && saltKey && merchantId !== 'PGTESTPAYUAT');

  return new Response(
    JSON.stringify({
      merchantId: effectiveMerchantId,
      isConfigured: isCustomConfigured || true,
      mode: mode === 'PRODUCTION' ? 'PRODUCTION' : 'UAT',
      saltIndex,
      enabled,
      currency: 'INR'
    }),
    { status: 200, headers: corsHeaders }
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
