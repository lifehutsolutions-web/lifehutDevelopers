import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Service, Project, Enquiry, QuoteRequest, Settings, Testimonial } from '../types';
import { defaultProjects } from '../data/defaults';

// Environment variables for Cloudflare / Vite
const env = ((import.meta as unknown as { env?: Record<string, string> }).env) || {};
const supabaseUrl = env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = env.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = (): boolean => {
  return Boolean(
    supabaseUrl && 
    supabaseAnonKey && 
    supabaseUrl.startsWith('https://') && 
    !supabaseUrl.includes('your-project')
  );
};

export const supabase: SupabaseClient | null = isSupabaseConfigured()
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// Helper to upload image files to Supabase Storage bucket 'cms-uploads'
export async function uploadImageToSupabase(file: File, folder: string = 'general'): Promise<string | null> {
  if (!supabase || !isSupabaseConfigured()) {
    console.info('Supabase is not configured for remote storage upload, using local fallback.');
    return null;
  }

  try {
    const fileExt = file.name.split('.').pop() || 'jpg';
    const fileName = `${folder}/${Date.now()}_${Math.random().toString(36).substring(2, 9)}.${fileExt}`;

    let { data, error } = await supabase.storage
      .from('cms-uploads')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: true
      });

    // If bucket not found, attempt auto-creation via storage client API
    if (error && (error.message?.toLowerCase().includes('bucket not found') || (error as any).error === 'Bucket not found')) {
      try {
        const { error: createErr } = await supabase.storage.createBucket('cms-uploads', { public: true });
        if (!createErr) {
          const retry = await supabase.storage
            .from('cms-uploads')
            .upload(fileName, file, {
              cacheControl: '3600',
              upsert: true
            });
          data = retry.data;
          error = retry.error;
        }
      } catch {
        // Ignore API permission limits when creating buckets with anon key
      }
    }

    if (error) {
      console.warn('Supabase storage upload bypassed (bucket not initialized or restricted). Using optimized local storage fallback:', error.message || error);
      return null;
    }

    if (!data?.path) return null;

    const { data: publicUrlData } = supabase.storage
      .from('cms-uploads')
      .getPublicUrl(data.path);

    return publicUrlData?.publicUrl || null;
  } catch (err) {
    console.warn('Image upload to Supabase storage caught exception, using local fallback:', err);
    return null;
  }
}

// --- SERVICES DB HELPERS ---
export async function fetchSupabaseServices(): Promise<Service[] | null> {
  if (!supabase) return null;
  const { data, error } = await supabase.from('services').select('*').order('created_at', { ascending: true });
  if (error) {
    console.error('Error fetching services from Supabase:', error);
    return null;
  }
  return data.map(item => ({
    id: item.id,
    title: item.title,
    banner: item.banner || '',
    description: item.description || '',
    features: Array.isArray(item.features) ? item.features : [],
    gallery: Array.isArray(item.gallery) ? item.gallery : [],
    faqs: Array.isArray(item.faqs) ? item.faqs : []
  }));
}

export async function saveSupabaseService(service: Service): Promise<boolean> {
  if (!supabase) return false;
  const payload = {
    id: service.id,
    title: service.title,
    banner: service.banner,
    description: service.description,
    features: service.features,
    gallery: service.gallery,
    faqs: service.faqs
  };
  const { error } = await supabase.from('services').upsert(payload);
  if (error) console.error('Error saving service to Supabase:', error);
  return !error;
}

export async function deleteSupabaseService(id: string): Promise<boolean> {
  if (!supabase) return false;
  const { error } = await supabase.from('services').delete().eq('id', id);
  if (error) console.error('Error deleting service from Supabase:', error);
  return !error;
}

// --- AUTOMATIC METADATA PERSISTENCE IN SUPABASE ---
// Tracks project tags, client details, and featured status seamlessly across deploys
const PROJECT_METADATA_KEY = 'lifehut_project_metadata_map';

interface ProjectMetadataItem {
  tags?: string[];
  clientName?: string;
  clientAvatar?: string;
  clientTestimonial?: string;
  isRecent?: boolean;
}

function getLocalProjectMetadataMap(): Record<string, ProjectMetadataItem> {
  try {
    const raw = localStorage.getItem(PROJECT_METADATA_KEY);
    if (!raw) return {};
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

function updateLocalProjectMetadata(id: string, meta: ProjectMetadataItem) {
  try {
    const map = getLocalProjectMetadataMap();
    map[id] = { ...(map[id] || {}), ...meta };
    localStorage.setItem(PROJECT_METADATA_KEY, JSON.stringify(map));
  } catch (e) {
    console.error('Failed to update local project metadata', e);
  }
}

// Save project tags and metadata into Supabase settings table so it persists across all devices & deploys
async function persistProjectMetaToSupabase(id: string, meta: ProjectMetadataItem) {
  if (!supabase) return;
  try {
    let { data } = await supabase.from('settings').select('stats').limit(1);
    let table = 'settings';
    if (!data || data.length === 0) {
      const res = await supabase.from('site_settings').select('stats').limit(1);
      data = res.data;
      table = 'site_settings';
    }

    const currentStats = (data && data[0] && typeof data[0].stats === 'object') ? data[0].stats : {};
    const metaMap = currentStats.project_metadata_map || {};
    metaMap[id] = { ...(metaMap[id] || {}), ...meta };

    await supabase.from(table).upsert({
      id: 'site_settings',
      stats: {
        ...currentStats,
        project_metadata_map: metaMap
      },
      updated_at: new Date().toISOString()
    });
  } catch (err) {
    console.warn('Auto meta persistence to Supabase settings:', err);
  }
}

// Fetch remote project metadata map stored in Supabase settings
async function fetchProjectMetaFromSupabase(): Promise<Record<string, ProjectMetadataItem>> {
  if (!supabase) return {};
  try {
    let { data } = await supabase.from('settings').select('stats').limit(1);
    if (!data || data.length === 0) {
      const res = await supabase.from('site_settings').select('stats').limit(1);
      data = res.data;
    }
    if (data && data[0]?.stats?.project_metadata_map) {
      return data[0].stats.project_metadata_map;
    }
  } catch {
    // Ignore fetch error
  }
  return {};
}

// Helper to reliably normalize tags from any format
function parseProjectTags(rawTags: any, fallbackTags?: string[], projectName?: string): string[] {
  if (Array.isArray(rawTags) && rawTags.length > 0) {
    return rawTags.map(t => String(t).trim()).filter(Boolean);
  }
  if (typeof rawTags === 'string' && rawTags.trim()) {
    try {
      const parsed = JSON.parse(rawTags);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.map(t => String(t).trim()).filter(Boolean);
      }
    } catch {
      if (rawTags.includes(',')) {
        return rawTags.split(',').map(t => t.trim()).filter(Boolean);
      }
      return [rawTags.trim()];
    }
  }
  if (Array.isArray(fallbackTags) && fallbackTags.length > 0) {
    return fallbackTags.map(t => String(t).trim()).filter(Boolean);
  }

  // Intelligent tag deduction fallback if tags column hasn't been added to Supabase yet
  const nameLower = (projectName || '').toLowerCase();
  const inferred: string[] = [];
  if (nameLower.includes('villa') || nameLower.includes('house') || nameLower.includes('residence') || nameLower.includes('home')) {
    inferred.push('Independent Villa');
  }
  if (nameLower.includes('apartment') || nameLower.includes('flat') || nameLower.includes('duplex')) {
    inferred.push('Apartments');
  }
  if (nameLower.includes('commercial') || nameLower.includes('park') || nameLower.includes('office')) {
    inferred.push('Commercial');
  }
  if (nameLower.includes('industrial') || nameLower.includes('hub') || nameLower.includes('warehouse')) {
    inferred.push('Industrial');
  }
  if (nameLower.includes('infra') || nameLower.includes('logistics') || nameLower.includes('civil')) {
    inferred.push('Infra');
  }
  return inferred.length > 0 ? inferred : ['Independent Villa'];
}

// --- PROJECTS DB HELPERS ---
export async function fetchSupabaseProjects(): Promise<Project[] | null> {
  if (!supabase) return null;
  const { data, error } = await supabase.from('projects').select('*').order('created_at', { ascending: false });
  if (error) {
    console.error('Error fetching projects from Supabase:', error);
    return null;
  }

  // Fetch remote project metadata map from Supabase settings
  const remoteMetaMap = await fetchProjectMetaFromSupabase();
  const localMetaMap = getLocalProjectMetadataMap();

  const projectsToAutoBackfill: { id: string; clientName: string; clientTestimonial?: string; clientAvatar?: string }[] = [];

  const projects = data.map(item => {
    const remoteMeta = remoteMetaMap[item.id] || {};
    const localMeta = localMetaMap[item.id] || {};
    const defaultMatch = defaultProjects.find(dp => dp.id === item.id || dp.name.toLowerCase() === (item.name || '').toLowerCase());

    const isRecentFromDb = item.is_recent ?? item.isRecent;
    const isRecent = isRecentFromDb !== undefined 
      ? Boolean(isRecentFromDb) 
      : (remoteMeta.isRecent !== undefined ? Boolean(remoteMeta.isRecent) : (defaultMatch ? Boolean(defaultMatch.isRecent) : true));

    const tags = parseProjectTags(item.tags || item.tag, remoteMeta.tags || localMeta.tags || defaultMatch?.tags, item.name);

    // Resolve clientName with multiple robust fallbacks
    const clientName = item.client_name || item.clientName || remoteMeta.clientName || localMeta.clientName || defaultMatch?.clientName || '';
    const clientTestimonial = item.client_testimonial || item.clientTestimonial || remoteMeta.clientTestimonial || localMeta.clientTestimonial || defaultMatch?.clientTestimonial || '';
    const clientAvatar = item.client_avatar || item.clientAvatar || remoteMeta.clientAvatar || localMeta.clientAvatar || (clientName ? clientName.split(' ').map((s: string) => s[0]).join('').slice(0, 2).toUpperCase() : 'LH');

    // If client_name in Supabase row is empty, schedule silent background update to Supabase
    if ((!item.client_name || item.client_name.trim() === '') && clientName) {
      projectsToAutoBackfill.push({
        id: item.id,
        clientName,
        clientTestimonial,
        clientAvatar
      });
    }

    return {
      id: item.id,
      name: item.name,
      heroImage: item.hero_image || item.heroImage || '',
      gallery: Array.isArray(item.gallery) && item.gallery.length > 0 ? item.gallery : (item.hero_image ? [item.hero_image] : []),
      completionDate: item.completion_date || item.completionDate || '',
      plotSize: item.plot_size || item.plotSize || '',
      builtUpArea: item.built_up_area || item.builtUpArea || '',
      floors: Number(item.floors || 1),
      bedrooms: Number(item.bedrooms || 1),
      budget: item.budget || '',
      location: item.location || '',
      clientTestimonial,
      clientName,
      clientAvatar,
      status: item.status || 'Completed',
      tags,
      isRecent
    };
  });

  // Auto-backfill any empty client_name fields in Supabase in background
  if (projectsToAutoBackfill.length > 0) {
    setTimeout(async () => {
      for (const p of projectsToAutoBackfill) {
        try {
          await supabase.from('projects').update({
            client_name: p.clientName,
            client_testimonial: p.clientTestimonial || null,
            client_avatar: p.clientAvatar || 'LH'
          }).eq('id', p.id);
        } catch {
          // Silent fallback
        }
      }
    }, 100);
  }

  return projects;
}

export async function saveSupabaseProject(project: Project): Promise<boolean> {
  if (!supabase) return false;

  // Persist locally for instant responsiveness
  updateLocalProjectMetadata(project.id, {
    tags: project.tags || [],
    clientName: project.clientName || '',
    clientAvatar: project.clientAvatar || '',
    clientTestimonial: project.clientTestimonial || '',
    isRecent: Boolean(project.isRecent)
  });

  // Persist metadata to Supabase settings in background so tags persist across deploys
  persistProjectMetaToSupabase(project.id, {
    tags: project.tags || [],
    clientName: project.clientName || '',
    clientAvatar: project.clientAvatar || '',
    clientTestimonial: project.clientTestimonial || '',
    isRecent: Boolean(project.isRecent)
  });

  const fullPayload: Record<string, any> = {
    id: project.id,
    name: project.name,
    hero_image: project.heroImage,
    gallery: Array.isArray(project.gallery) && project.gallery.length > 0 ? project.gallery : [project.heroImage],
    completion_date: project.completionDate,
    plot_size: project.plotSize || project.builtUpArea || '',
    built_up_area: project.builtUpArea || project.plotSize || '',
    floors: Number(project.floors || 1),
    bedrooms: Number(project.bedrooms || 1),
    budget: project.budget || '',
    location: project.location || '',
    client_name: project.clientName ? project.clientName.trim() : null,
    client_avatar: project.clientAvatar || (project.clientName ? project.clientName.split(' ').map(s => s[0]).join('').slice(0, 2).toUpperCase() : 'LH'),
    client_testimonial: project.clientTestimonial ? project.clientTestimonial.trim() : null,
    status: project.status || 'Completed',
    tags: Array.isArray(project.tags) && project.tags.length > 0 ? project.tags : ['Independent Villa'],
    is_recent: Boolean(project.isRecent)
  };

  const currentPayload = { ...fullPayload };
  let attempt = 0;
  let success = false;

  while (attempt < 6) {
    attempt++;
    const { error } = await supabase.from('projects').upsert(currentPayload);
    if (!error) {
      success = true;
      break;
    }

    // Check if error is missing column in PostgREST schema cache (PGRST204)
    if (error.code === 'PGRST204' || error.message?.includes('schema cache')) {
      const match = error.message?.match(/Could not find the '([^']+)' column/i);
      const missingCol = match ? match[1] : null;

      if (missingCol && missingCol in currentPayload) {
        delete currentPayload[missingCol];
        continue;
      }

      if (error.message?.includes('tags') && 'tags' in currentPayload) {
        delete currentPayload.tags;
        continue;
      }
      if (error.message?.includes('is_recent') && 'is_recent' in currentPayload) {
        delete currentPayload.is_recent;
        continue;
      }
      if (error.message?.includes('client_avatar') && 'client_avatar' in currentPayload) {
        delete currentPayload.client_avatar;
        continue;
      }
      if (error.message?.includes('client_testimonial') && 'client_testimonial' in currentPayload) {
        delete currentPayload.client_testimonial;
        continue;
      }
      if (error.message?.includes('client_name') && 'client_name' in currentPayload) {
        delete currentPayload.client_name;
        continue;
      }
      break;
    } else {
      console.error('Error saving project to Supabase:', error);
      break;
    }
  }

  return success;
}

export async function deleteSupabaseProject(id: string): Promise<boolean> {
  if (!supabase) return false;
  const { error } = await supabase.from('projects').delete().eq('id', id);
  if (error) console.error('Error deleting project from Supabase:', error);
  return !error;
}

// --- ENQUIRIES DB HELPERS ---
export async function fetchSupabaseEnquiries(): Promise<Enquiry[] | null> {
  if (!supabase) return null;
  const { data, error } = await supabase.from('enquiries').select('*').order('created_at', { ascending: false });
  if (error) {
    console.error('Error fetching enquiries from Supabase:', error);
    return null;
  }
  return data.map(item => ({
    id: item.id,
    name: item.name,
    phone: item.phone,
    email: item.email || '',
    service: item.service || '',
    message: item.message || '',
    date: item.date || item.created_at?.split('T')[0] || new Date().toISOString().split('T')[0],
    status: item.status || 'New'
  }));
}

export async function insertSupabaseEnquiry(enquiry: Enquiry): Promise<boolean> {
  if (!supabase) return false;
  const payload = {
    id: enquiry.id,
    name: enquiry.name,
    phone: enquiry.phone,
    email: enquiry.email,
    service: enquiry.service,
    message: enquiry.message,
    date: enquiry.date,
    status: enquiry.status
  };
  const { error } = await supabase.from('enquiries').insert(payload);
  if (error) console.error('Error saving enquiry to Supabase:', error);
  return !error;
}

export async function updateSupabaseEnquiryStatus(id: string, status: 'New' | 'Contacted' | 'Archived'): Promise<boolean> {
  if (!supabase) return false;
  const { error } = await supabase.from('enquiries').update({ status }).eq('id', id);
  if (error) console.error('Error updating enquiry status in Supabase:', error);
  return !error;
}

// --- QUOTES DB HELPERS ---
export async function fetchSupabaseQuotes(): Promise<QuoteRequest[] | null> {
  if (!supabase) return null;
  const { data, error } = await supabase.from('quotes').select('*').order('created_at', { ascending: false });
  if (error) {
    console.error('Error fetching quotes from Supabase:', error);
    return null;
  }
  return data.map(item => ({
    id: item.id,
    name: item.name,
    phone: item.phone,
    email: item.email || '',
    area: Number(item.area || 0),
    floors: item.floors || 'G+1',
    ctype: item.ctype || 'Standard',
    interior: item.interior || 'None',
    extras: item.extras || 'None',
    estimatedCost: item.estimated_cost || item.estimatedCost || '₹0',
    date: item.date || item.created_at?.split('T')[0] || new Date().toISOString().split('T')[0],
    status: item.status || 'New'
  }));
}

export async function insertSupabaseQuote(quote: QuoteRequest): Promise<boolean> {
  if (!supabase) return false;
  const payload = {
    id: quote.id,
    name: quote.name,
    phone: quote.phone,
    email: quote.email,
    area: quote.area,
    floors: quote.floors,
    ctype: quote.ctype,
    interior: quote.interior,
    extras: quote.extras,
    estimated_cost: quote.estimatedCost,
    date: quote.date,
    status: quote.status
  };
  const { error } = await supabase.from('quotes').insert(payload);
  if (error) console.error('Error saving quote to Supabase:', error);
  return !error;
}

// --- SETTINGS DB HELPERS ---
export async function fetchSupabaseSettings(): Promise<Settings | null> {
  if (!supabase) return null;
  let res = await supabase.from('settings').select('*').limit(1);
  if (res.error || !res.data || res.data.length === 0) {
    res = await supabase.from('site_settings').select('*').limit(1);
  }
  if (res.error || !res.data || res.data.length === 0) {
    console.warn('No existing settings found in Supabase:', res.error?.message);
    return null;
  }
  const data = res.data[0];
  return {
    heroTitle: data.hero_title || '',
    heroSubtitle: data.hero_subtitle || '',
    heroBannerImage: data.hero_banner_image || '',
    address: data.address || '',
    phone: data.phone || '',
    email: data.email || '',
    hours: data.hours || '',
    whatsappNumber: data.whatsapp_number || '',
    facebookUrl: data.facebook_url || '',
    instagramUrl: data.instagram_url || '',
    pinterestUrl: data.pinterest_url || '',
    youtubeUrl: data.youtube_url || '',
    linkedinUrl: data.linkedin_url || '',
    seoTitle: data.seo_title || '',
    seoDescription: data.seo_description || '',
    seoKeywords: data.seo_keywords || '',
    stats: data.stats || {
      projectsDone: "120+",
      experienceYears: "7+",
      clientSatisfaction: "99%",
      hiddenCharges: "₹0"
    }
  };
}

export async function saveSupabaseSettings(settings: Settings): Promise<boolean> {
  if (!supabase) return false;
  const payload = {
    id: 'site_settings',
    hero_title: settings.heroTitle,
    hero_subtitle: settings.heroSubtitle,
    hero_banner_image: settings.heroBannerImage,
    address: settings.address,
    phone: settings.phone,
    email: settings.email,
    hours: settings.hours,
    whatsapp_number: settings.whatsappNumber,
    facebook_url: settings.facebookUrl,
    instagram_url: settings.instagramUrl,
    pinterest_url: settings.pinterestUrl,
    youtube_url: settings.youtubeUrl,
    linkedin_url: settings.linkedinUrl,
    seo_title: settings.seoTitle,
    seo_description: settings.seoDescription,
    seo_keywords: settings.seoKeywords,
    stats: settings.stats,
    updated_at: new Date().toISOString()
  };

  let { error } = await supabase.from('settings').upsert(payload);
  if (error) {
    console.warn('Upsert to settings failed, trying site_settings table:', error.message);
    const retry = await supabase.from('site_settings').upsert(payload);
    if (!retry.error) {
      error = null;
    } else {
      console.error('Error saving settings to Supabase:', retry.error);
    }
  }
  return !error;
}

// --- TESTIMONIALS DB HELPERS ---
export async function fetchSupabaseTestimonials(): Promise<Testimonial[] | null> {
  if (!supabase) return null;
  const { data, error } = await supabase.from('testimonials').select('*').order('created_at', { ascending: false });
  if (error) {
    console.error('Error fetching testimonials from Supabase:', error);
    return null;
  }
  return data.map(item => ({
    id: item.id,
    name: item.name,
    text: item.text,
    rating: Number(item.rating || 5),
    avatar: item.avatar || '',
    date: item.date || '',
    location: item.location || ''
  }));
}

export async function saveSupabaseTestimonial(testimonial: Testimonial): Promise<boolean> {
  if (!supabase) return false;
  const { error } = await supabase.from('testimonials').upsert(testimonial);
  if (error) console.error('Error saving testimonial to Supabase:', error);
  return !error;
}
