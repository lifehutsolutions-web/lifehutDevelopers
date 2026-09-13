// Cloudflare Pages Function: /api/settings
// Handles GET, POST, OPTIONS so Cloudflare never returns 405 Method Not Allowed

interface Env {
  SUPABASE_URL?: string;
  SUPABASE_SERVICE_ROLE_KEY?: string;
  VITE_SUPABASE_URL?: string;
  VITE_SUPABASE_ANON_KEY?: string;
  [key: string]: any;
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Content-Type': 'application/json'
};

const DEFAULT_SETTINGS = {
  heroTitle: "Residential Building Construction Company in Chennai",
  heroSubtitle: "Custom Luxury Villa Builders & Turnkey Residential House Contractors with Civil Engineering Precision.",
  heroBannerImage: "/src/assets/images/hero_villa_1784191464588.jpg",
  address: "Ground Floor, No. 4, Thirualluvar Nagar 1st Street, Keelkattalai, Chennai, Tamil Nadu 600117",
  phone: "+91 80721 63330",
  email: "lifehutdevelopers@gmail.com",
  hours: "Mon – Sat: 9:00 AM – 6:00 PM",
  whatsappNumber: "918072163330",
  instagramUrl: "https://www.instagram.com/lifehut_developers/",
  pinterestUrl: "https://in.pinterest.com/lifehutdevelopers/",
  youtubeUrl: "https://www.youtube.com/@lifehutdevelopers",
  facebookUrl: "https://facebook.com/lifehutdevelopers",
  seoTitle: "Top Residential Building Construction Company in Chennai | Lifehut Developers",
  seoDescription: "Leading residential building construction company in Chennai.",
  seoKeywords: "residential building construction company, turnkey house builders chennai",
  stats: {
    projectsDone: "120+",
    experienceYears: "7+",
    clientSatisfaction: "99%",
    hiddenCharges: "₹0"
  }
};

export const onRequestGet = async (context: { request: Request; env: Env }) => {
  try {
    const sbUrl = context.env.VITE_SUPABASE_URL || context.env.SUPABASE_URL || 'https://vkthcqceywhdlmjsvsze.supabase.co';
    const sbKey = context.env.VITE_SUPABASE_ANON_KEY || context.env.SUPABASE_ANON_KEY || 'sb_publishable__eUGKx9jON0kZ1dVrBRmLw_-huhN1d7';

    const sbRes = await fetch(`${sbUrl}/rest/v1/settings?select=*&limit=1`, {
      headers: {
        apikey: sbKey,
        Authorization: `Bearer ${sbKey}`
      }
    });

    if (sbRes.ok) {
      const rows: any = await sbRes.json().catch(() => []);
      if (Array.isArray(rows) && rows.length > 0) {
        const data = rows[0];
        const statsObj = (data.stats && typeof data.stats === 'object') ? data.stats : {};
        const normalized = {
          heroTitle: data.hero_title || statsObj.heroTitle || DEFAULT_SETTINGS.heroTitle,
          heroSubtitle: data.hero_subtitle || statsObj.heroSubtitle || DEFAULT_SETTINGS.heroSubtitle,
          heroBannerImage: data.hero_banner_image || statsObj.heroBannerImage || DEFAULT_SETTINGS.heroBannerImage,
          address: data.address || statsObj.address || DEFAULT_SETTINGS.address,
          phone: data.phone || statsObj.phone || DEFAULT_SETTINGS.phone,
          email: data.email || statsObj.email || DEFAULT_SETTINGS.email,
          hours: data.hours || statsObj.hours || DEFAULT_SETTINGS.hours,
          whatsappNumber: data.whatsapp_number || statsObj.whatsappNumber || DEFAULT_SETTINGS.whatsappNumber,
          facebookUrl: data.facebook_url || statsObj.facebookUrl || DEFAULT_SETTINGS.facebookUrl,
          instagramUrl: data.instagram_url || statsObj.instagramUrl || DEFAULT_SETTINGS.instagramUrl,
          pinterestUrl: data.pinterest_url || statsObj.pinterestUrl || DEFAULT_SETTINGS.pinterestUrl,
          youtubeUrl: statsObj.youtubeUrl || data.youtube_url || DEFAULT_SETTINGS.youtubeUrl,
          linkedinUrl: data.linkedin_url || statsObj.linkedinUrl || '',
          seoTitle: data.seo_title || statsObj.seoTitle || DEFAULT_SETTINGS.seoTitle,
          seoDescription: data.seo_description || statsObj.seoDescription || DEFAULT_SETTINGS.seoDescription,
          seoKeywords: data.seo_keywords || statsObj.seoKeywords || DEFAULT_SETTINGS.seoKeywords,
          stats: {
            projectsDone: statsObj.projectsDone || DEFAULT_SETTINGS.stats.projectsDone,
            experienceYears: statsObj.experienceYears || DEFAULT_SETTINGS.stats.experienceYears,
            clientSatisfaction: statsObj.clientSatisfaction || DEFAULT_SETTINGS.stats.clientSatisfaction,
            hiddenCharges: statsObj.hiddenCharges || DEFAULT_SETTINGS.stats.hiddenCharges,
            ...statsObj
          },
          phonepeMerchantId: data.phonepeMerchantId || statsObj.phonepeMerchantId || '',
          phonepeSaltKey: data.phonepeSaltKey || statsObj.phonepeSaltKey || '',
          phonepeSaltIndex: data.phonepeSaltIndex || statsObj.phonepeSaltIndex || '1',
          phonepeMode: data.phonepeMode || statsObj.phonepeMode || 'UAT',
          phonepeEnabled: data.phonepeEnabled !== undefined ? data.phonepeEnabled : (statsObj.phonepeEnabled !== undefined ? statsObj.phonepeEnabled : true)
        };

        return new Response(JSON.stringify(normalized), { status: 200, headers: corsHeaders });
      }
    }
  } catch {
    // fallback below
  }

  return new Response(JSON.stringify(DEFAULT_SETTINGS), { status: 200, headers: corsHeaders });
};

export const onRequestPost = async (context: { request: Request; env: Env }) => {
  try {
    const body: any = await context.request.json().catch(() => ({}));
    const sbUrl = context.env.VITE_SUPABASE_URL || context.env.SUPABASE_URL || 'https://vkthcqceywhdlmjsvsze.supabase.co';
    const sbKey = context.env.VITE_SUPABASE_ANON_KEY || context.env.SUPABASE_ANON_KEY || 'sb_publishable__eUGKx9jON0kZ1dVrBRmLw_-huhN1d7';

    // Fetch existing stats to merge properly
    let existingStats: any = {};
    let existingId: string | null = null;
    try {
      const existingRes = await fetch(`${sbUrl}/rest/v1/settings?select=*&limit=1`, {
        headers: { apikey: sbKey, Authorization: `Bearer ${sbKey}` }
      });
      if (existingRes.ok) {
        const rows: any = await existingRes.json().catch(() => []);
        if (rows && rows[0]) {
          existingId = rows[0].id;
          if (rows[0].stats && typeof rows[0].stats === 'object') {
            existingStats = rows[0].stats;
          }
        }
      }
    } catch {}

    const mergedStats = {
      ...existingStats,
      ...(body.stats || {}),
      projectsDone: body.stats?.projectsDone ?? existingStats.projectsDone ?? '120+',
      experienceYears: body.stats?.experienceYears ?? existingStats.experienceYears ?? '7+',
      clientSatisfaction: body.stats?.clientSatisfaction ?? existingStats.clientSatisfaction ?? '99%',
      hiddenCharges: body.stats?.hiddenCharges ?? existingStats.hiddenCharges ?? '₹0',
      youtubeUrl: body.youtubeUrl !== undefined ? body.youtubeUrl : (existingStats.youtubeUrl || ''),
      heroTitle: body.heroTitle,
      heroSubtitle: body.heroSubtitle,
      address: body.address,
      phone: body.phone,
      email: body.email,
      hours: body.hours,
      whatsappNumber: body.whatsappNumber,
      phonepeMerchantId: body.phonepeMerchantId !== undefined ? body.phonepeMerchantId : (existingStats.phonepeMerchantId || ''),
      phonepeSaltKey: body.phonepeSaltKey !== undefined ? body.phonepeSaltKey : (existingStats.phonepeSaltKey || ''),
      phonepeSaltIndex: body.phonepeSaltIndex !== undefined ? body.phonepeSaltIndex : (existingStats.phonepeSaltIndex || '1'),
      phonepeMode: body.phonepeMode !== undefined ? body.phonepeMode : (existingStats.phonepeMode || 'UAT'),
      phonepeEnabled: body.phonepeEnabled !== undefined ? body.phonepeEnabled : (existingStats.phonepeEnabled !== undefined ? existingStats.phonepeEnabled : true)
    };

    const payload: any = {
      hero_title: body.heroTitle,
      hero_subtitle: body.heroSubtitle,
      hero_banner_image: body.heroBannerImage,
      address: body.address,
      phone: body.phone,
      email: body.email,
      hours: body.hours,
      whatsapp_number: body.whatsappNumber,
      facebook_url: body.facebookUrl,
      instagram_url: body.instagramUrl,
      pinterest_url: body.pinterestUrl,
      linkedin_url: body.linkedinUrl,
      seo_title: body.seoTitle,
      seo_description: body.seoDescription,
      seo_keywords: body.seoKeywords,
      stats: mergedStats,
      updated_at: new Date().toISOString()
    };

    if (existingId) {
      await fetch(`${sbUrl}/rest/v1/settings?id=eq.${existingId}`, {
        method: 'PATCH',
        headers: {
          apikey: sbKey,
          Authorization: `Bearer ${sbKey}`,
          'Content-Type': 'application/json',
          Prefer: 'return=minimal'
        },
        body: JSON.stringify(payload)
      });
    }

    return new Response(
      JSON.stringify({ success: true, message: 'Settings saved successfully.' }),
      { status: 200, headers: corsHeaders }
    );
  } catch (err: any) {
    return new Response(
      JSON.stringify({ success: false, message: err?.message || 'Error processing settings' }),
      { status: 200, headers: corsHeaders }
    );
  }
};

export const onRequestOptions = async () => {
  return new Response(null, {
    status: 204,
    headers: corsHeaders
  });
};
