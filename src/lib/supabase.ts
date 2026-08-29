import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Service, Project, Enquiry, QuoteRequest, Settings, Testimonial } from '../types';

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

// Local helper to track project tags & attributes if Supabase table lacks columns
const PROJECT_METADATA_KEY = 'lifehut_project_metadata_map';

interface ProjectMetadataLocal {
  tags?: string[];
  clientName?: string;
  clientAvatar?: string;
  clientTestimonial?: string;
}

function getLocalProjectMetadataMap(): Record<string, ProjectMetadataLocal> {
  try {
    const raw = localStorage.getItem(PROJECT_METADATA_KEY);
    if (!raw) return {};
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

function updateLocalProjectMetadata(id: string, meta: ProjectMetadataLocal) {
  try {
    const map = getLocalProjectMetadataMap();
    map[id] = { ...(map[id] || {}), ...meta };
    localStorage.setItem(PROJECT_METADATA_KEY, JSON.stringify(map));
  } catch (e) {
    console.error('Failed to update local project metadata', e);
  }
}

// Local helper to track recent project IDs if Supabase table lacks column
const RECENT_PROJECTS_KEY = 'lifehut_recent_project_ids';

function getLocalRecentIds(): Set<string> {
  try {
    const raw = localStorage.getItem(RECENT_PROJECTS_KEY);
    if (!raw) return new Set();
    return new Set(JSON.parse(raw));
  } catch {
    return new Set();
  }
}

function updateLocalRecentId(id: string, isRecent: boolean) {
  try {
    const set = getLocalRecentIds();
    if (isRecent) {
      set.add(id);
    } else {
      set.delete(id);
    }
    localStorage.setItem(RECENT_PROJECTS_KEY, JSON.stringify(Array.from(set)));
  } catch (e) {
    console.error('Failed to update local recent project ids', e);
  }
}

// Helper to reliably normalize tags from any Supabase format (JSON array, string, comma separated, or local metadata)
function parseProjectTags(rawTags: any, fallbackTags?: string[]): string[] {
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
  return [];
}

// --- PROJECTS DB HELPERS ---
export async function fetchSupabaseProjects(): Promise<Project[] | null> {
  if (!supabase) return null;
  const { data, error } = await supabase.from('projects').select('*').order('created_at', { ascending: false });
  if (error) {
    console.error('Error fetching projects from Supabase:', error);
    return null;
  }
  const localRecentSet = getLocalRecentIds();
  const localMetaMap = getLocalProjectMetadataMap();

  return data.map(item => {
    const isRecentFromDb = item.is_recent ?? item.isRecent;
    const isRecent = isRecentFromDb !== undefined ? Boolean(isRecentFromDb) : localRecentSet.has(item.id);
    const localMeta = localMetaMap[item.id] || {};

    const tags = parseProjectTags(item.tags || item.tag, localMeta.tags);
    const clientName = item.client_name || item.clientName || localMeta.clientName || '';
    const clientTestimonial = item.client_testimonial || item.clientTestimonial || localMeta.clientTestimonial || '';
    const clientAvatar = item.client_avatar || item.clientAvatar || localMeta.clientAvatar || (clientName ? clientName.split(' ').map((s: string) => s[0]).join('').slice(0, 2).toUpperCase() : '');

    return {
      id: item.id,
      name: item.name,
      heroImage: item.hero_image || item.heroImage || '',
      gallery: Array.isArray(item.gallery) ? item.gallery : [],
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
      tags: tags.length > 0 ? tags : ['Independent Villa'],
      isRecent
    };
  });
}

export async function saveSupabaseProject(project: Project): Promise<boolean> {
  if (!supabase) return false;

  // Persist locally as fallback in case remote table hasn't added column yet
  updateLocalRecentId(project.id, Boolean(project.isRecent));
  updateLocalProjectMetadata(project.id, {
    tags: project.tags || [],
    clientName: project.clientName || '',
    clientAvatar: project.clientAvatar || '',
    clientTestimonial: project.clientTestimonial || ''
  });

  const basePayload: Record<string, any> = {
    id: project.id,
    name: project.name,
    hero_image: project.heroImage,
    gallery: project.gallery,
    completion_date: project.completionDate,
    plot_size: project.plotSize,
    built_up_area: project.builtUpArea,
    floors: project.floors,
    bedrooms: project.bedrooms,
    budget: project.budget,
    location: project.location,
    client_testimonial: project.clientTestimonial,
    client_name: project.clientName,
    client_avatar: project.clientAvatar,
    status: project.status,
  };

  const payload: Record<string, any> = {
    ...basePayload,
    tags: project.tags || [],
    is_recent: Boolean(project.isRecent)
  };

  let { error } = await supabase.from('projects').upsert(payload);

  // Progressive resilient retry if any optional/new columns do not exist in user's database (PGRST204)
  if (error && error.code === 'PGRST204') {
    const errorMsg = (error.message || '').toLowerCase();
    console.warn('Supabase projects table schema difference detected (PGRST204):', error.message);

    // Iterative removal of problematic columns
    const fallbackPayload = { ...payload };
    if (errorMsg.includes('tags')) delete fallbackPayload.tags;
    if (errorMsg.includes('is_recent')) delete fallbackPayload.is_recent;
    if (errorMsg.includes('client_name')) delete fallbackPayload.client_name;
    if (errorMsg.includes('client_avatar')) delete fallbackPayload.client_avatar;
    if (errorMsg.includes('client_testimonial')) delete fallbackPayload.client_testimonial;

    let retry = await supabase.from('projects').upsert(fallbackPayload);
    
    // If it still fails with PGRST204 on another optional column, strip all newly added optional columns
    if (retry.error && retry.error.code === 'PGRST204') {
      const minimalPayload = { ...basePayload };
      delete minimalPayload.client_name;
      delete minimalPayload.client_avatar;
      delete minimalPayload.client_testimonial;
      retry = await supabase.from('projects').upsert(minimalPayload);
    }

    if (!retry.error) {
      error = null;
    } else {
      console.error('Error saving project to Supabase after fallback:', retry.error);
      return false;
    }
  } else if (error) {
    console.error('Error saving project to Supabase:', error);
    return false;
  }
  return true;
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
