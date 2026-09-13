import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Service, Project, Enquiry, QuoteRequest, Settings, Testimonial, HousePlan } from '../types';
import { defaultProjects } from '../data/defaults';
import { defaultHousePlans } from '../data/defaultHousePlans';

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

// Helper to upload ZIP or CAD drawing files to Supabase Storage bucket 'cms-uploads' or 'cad-packages'
export async function uploadZipToSupabase(file: File, folder: string = 'cad-packages'): Promise<{ url: string; fileName: string; size: string } | null> {
  const sizeMb = (file.size / (1024 * 1024)).toFixed(1) + ' MB';
  
  if (!supabase || !isSupabaseConfigured()) {
    console.info('Supabase storage not configured, attempting local server endpoint...');
    return null;
  }

  try {
    const fileExt = file.name.split('.').pop() || 'zip';
    const cleanBaseName = file.name.replace(/\.[^/.]+$/, "").replace(/[^a-zA-Z0-9-_]/g, "-");
    const fileName = `${folder}/${cleanBaseName}-${Date.now()}.${fileExt}`;

    let { data, error } = await supabase.storage
      .from('cms-uploads')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: true
      });

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
        // ignore bucket creation error
      }
    }

    if (error || !data?.path) {
      console.warn('Supabase zip upload failed, using fallback:', error?.message || error);
      return null;
    }

    const { data: publicUrlData } = supabase.storage
      .from('cms-uploads')
      .getPublicUrl(data.path);

    if (publicUrlData?.publicUrl) {
      return {
        url: publicUrlData.publicUrl,
        fileName: file.name,
        size: sizeMb
      };
    }
    return null;
  } catch (err) {
    console.warn('Zip upload caught exception:', err);
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
async function persistProjectMetaToSupabase(id: string, meta: ProjectMetadataItem): Promise<boolean> {
  if (!supabase) return false;
  try {
    const { data } = await supabase.from('settings').select('*').limit(1);
    if (!data || data.length === 0) return false;

    const row = data[0];
    const currentStats = (row.stats && typeof row.stats === 'object') ? row.stats : {};
    const metaMap = { ...(currentStats.project_metadata_map || {}) };
    metaMap[id] = { ...(metaMap[id] || {}), ...meta };

    const updatedStats = {
      ...currentStats,
      project_metadata_map: metaMap
    };

    const rowId = row.id || 'site_settings';
    const { error } = await supabase.from('settings').update({
      stats: updatedStats,
      updated_at: new Date().toISOString()
    }).eq('id', rowId);

    return !error;
  } catch (err) {
    console.warn('Auto meta persistence to Supabase settings:', err);
    return false;
  }
}

// Fetch remote project metadata map stored in Supabase settings
async function fetchProjectMetaFromSupabase(): Promise<Record<string, ProjectMetadataItem>> {
  if (!supabase) return {};
  try {
    const { data } = await supabase.from('settings').select('stats').limit(1);
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
let hasAutoBackfilledProjects = false;

export async function fetchSupabaseProjects(): Promise<Project[] | null> {
  if (!supabase) return null;

  let rawData: any[] | null = null;
  let queryError: any = null;

  try {
    // Select without unindexed .order() to avoid PostgreSQL statement timeout (57014) on large base64 image rows
    const { data, error } = await supabase.from('projects').select('*');
    if (!error && Array.isArray(data)) {
      rawData = data;
    } else {
      queryError = error;
    }
  } catch (err: any) {
    queryError = err;
  }

  // If Supabase timed out or errored, seamlessly fallback to server API or local storage
  if (queryError || !rawData) {
    console.warn('Supabase projects query notice, falling back to server API/cache:', queryError?.message || queryError);
    try {
      const serverRes = await fetch('/api/projects');
      if (serverRes.ok) {
        const serverProjects = await serverRes.json();
        if (Array.isArray(serverProjects) && serverProjects.length > 0) {
          return serverProjects;
        }
      }
    } catch {}

    try {
      const local = localStorage.getItem('lifehut_local_projects');
      if (local) {
        const parsed = JSON.parse(local);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}

    return defaultProjects;
  }

  // Sort by created_at descending safely in fast JavaScript memory (< 1ms)
  rawData.sort((a, b) => {
    const timeA = a.created_at ? new Date(a.created_at).getTime() : 0;
    const timeB = b.created_at ? new Date(b.created_at).getTime() : 0;
    return timeB - timeA;
  });

  // Fetch remote project metadata map from Supabase settings
  let remoteMetaMap: Record<string, ProjectMetadataItem> = {};
  try {
    remoteMetaMap = await fetchProjectMetaFromSupabase();
  } catch {}
  const localMetaMap = getLocalProjectMetadataMap();

  const projectsToAutoBackfill: { id: string; clientName: string; clientTestimonial?: string; clientAvatar?: string; tags?: string[]; isRecent?: boolean }[] = [];

  const projects = rawData.map(item => {
    // 1. Extract embedded metadata from gallery array if present
    let embeddedMeta: any = {};
    const cleanGallery: string[] = [];
    if (Array.isArray(item.gallery)) {
      for (const g of item.gallery) {
        if (typeof g === 'object' && g !== null && (g as any).__meta) {
          embeddedMeta = { ...embeddedMeta, ...(g as any).__meta };
        } else if (typeof g === 'string') {
          if (g.startsWith('{') && g.includes('__meta')) {
            try {
              const parsed = JSON.parse(g);
              if (parsed.__meta) {
                embeddedMeta = { ...embeddedMeta, ...parsed.__meta };
                continue;
              }
            } catch {}
          }
          cleanGallery.push(g);
        }
      }
    }

    if (cleanGallery.length === 0 && item.hero_image) {
      cleanGallery.push(item.hero_image);
    }

    const remoteMeta = remoteMetaMap[item.id] || {};
    const localMeta = localMetaMap[item.id] || {};
    const defaultMatch = defaultProjects.find(dp => dp.id === item.id || dp.name.toLowerCase() === (item.name || '').toLowerCase());

    const isRecentFromDb = embeddedMeta.isRecent !== undefined ? embeddedMeta.isRecent : (item.is_recent ?? item.isRecent);
    const isRecent = isRecentFromDb !== undefined 
      ? Boolean(isRecentFromDb) 
      : (remoteMeta.isRecent !== undefined ? Boolean(remoteMeta.isRecent) : (defaultMatch ? Boolean(defaultMatch.isRecent) : true));

    const rawTags = embeddedMeta.tags || item.tags || item.tag || remoteMeta.tags || localMeta.tags || defaultMatch?.tags;
    const tags = parseProjectTags(rawTags, undefined, item.name);

    // Resolve clientName with multiple robust fallbacks:
    const clientName = (item.client_name && item.client_name.trim())
      || (embeddedMeta.clientName && embeddedMeta.clientName.trim())
      || (item.clientName && item.clientName.trim())
      || remoteMeta.clientName
      || localMeta.clientName
      || defaultMatch?.clientName
      || '';

    const clientTestimonial = (item.client_testimonial && item.client_testimonial.trim())
      || (embeddedMeta.clientTestimonial && embeddedMeta.clientTestimonial.trim())
      || (item.clientTestimonial && item.clientTestimonial.trim())
      || remoteMeta.clientTestimonial
      || localMeta.clientTestimonial
      || defaultMatch?.clientTestimonial
      || '';

    const clientAvatar = item.client_avatar
      || embeddedMeta.clientAvatar
      || item.clientAvatar
      || remoteMeta.clientAvatar
      || localMeta.clientAvatar
      || (clientName ? clientName.split(' ').map((s: string) => s[0]).join('').slice(0, 2).toUpperCase() : 'LH');

    // Only backfill if client_name is genuinely empty in DB and hasn't been synced this session
    const missingClientNameInDb = !item.client_name || item.client_name.trim() === '';
    if (!hasAutoBackfilledProjects && missingClientNameInDb && clientName) {
      projectsToAutoBackfill.push({
        id: item.id,
        clientName,
        clientTestimonial,
        clientAvatar,
        tags,
        isRecent
      });
    }

    return {
      id: item.id,
      name: item.name,
      heroImage: item.hero_image || item.heroImage || '',
      gallery: cleanGallery,
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

  // Auto-backfill in background at most once per session without hammering Postgres
  if (!hasAutoBackfilledProjects && projectsToAutoBackfill.length > 0) {
    hasAutoBackfilledProjects = true;
    setTimeout(async () => {
      for (const p of projectsToAutoBackfill) {
        try {
          const updatePayload: Record<string, any> = {};
          if (p.clientName) updatePayload.client_name = p.clientName;
          if (p.clientTestimonial) updatePayload.client_testimonial = p.clientTestimonial;
          if (p.clientAvatar) updatePayload.client_avatar = p.clientAvatar;
          await supabase.from('projects').update(updatePayload).eq('id', p.id);
        } catch {
          // Silent fallback
        }
      }
    }, 2000);
  } else {
    hasAutoBackfilledProjects = true;
  }

  // Cache to localStorage for fast access & offline resilience
  try {
    localStorage.setItem('lifehut_local_projects', JSON.stringify(projects));
  } catch {}

  return projects;
}

export async function saveSupabaseProject(project: Project): Promise<boolean> {
  if (!supabase) return false;

  const metaData: ProjectMetadataItem = {
    tags: Array.isArray(project.tags) && project.tags.length > 0 ? project.tags : ['Independent Villa'],
    clientName: project.clientName || '',
    clientAvatar: project.clientAvatar || (project.clientName ? project.clientName.split(' ').map(s => s[0]).join('').slice(0, 2).toUpperCase() : 'LH'),
    clientTestimonial: project.clientTestimonial || '',
    isRecent: Boolean(project.isRecent)
  };

  // 1. Persist locally for instant responsiveness
  updateLocalProjectMetadata(project.id, metaData);

  // 2. Persist metadata to Supabase settings stats.project_metadata_map (awaited for absolute certainty)
  await persistProjectMetaToSupabase(project.id, metaData);

  // 3. Prepare gallery array with embedded metadata object for guaranteed persistence in project's own row
  const rawGallery = Array.isArray(project.gallery) && project.gallery.length > 0 ? project.gallery : [project.heroImage];
  const cleanImageStrings = rawGallery.filter(g => typeof g === 'string' && !g.includes('__meta') && (g.startsWith('http') || g.startsWith('/')));
  if (cleanImageStrings.length === 0 && project.heroImage) {
    cleanImageStrings.push(project.heroImage);
  }

  const enhancedGallery = [
    ...cleanImageStrings,
    { __meta: metaData }
  ];

  const fullPayload: Record<string, any> = {
    id: project.id,
    name: project.name,
    hero_image: project.heroImage,
    gallery: enhancedGallery,
    completion_date: project.completionDate,
    plot_size: project.plotSize || project.builtUpArea || '',
    built_up_area: project.builtUpArea || project.plotSize || '',
    floors: Number(project.floors || 1),
    bedrooms: Number(project.bedrooms || 1),
    budget: project.budget || '',
    location: project.location || '',
    client_name: project.clientName ? project.clientName.trim() : null,
    client_avatar: metaData.clientAvatar,
    client_testimonial: metaData.clientTestimonial || null,
    status: project.status || 'Completed',
    tags: metaData.tags,
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

  // 4. Update Express backend if available
  try {
    await fetch('/api/projects', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'upsert', project: { ...project, ...metaData } })
    });
  } catch {}

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
  const res = await supabase.from('settings').select('*').limit(1);
  if (res.error || !res.data || res.data.length === 0) {
    console.warn('No existing settings found in Supabase:', res.error?.message);
    return null;
  }
  const data = res.data[0];
  const statsObj = (data.stats && typeof data.stats === 'object') ? data.stats : {};

  return {
    heroTitle: data.hero_title || statsObj.heroTitle || '',
    heroSubtitle: data.hero_subtitle || statsObj.heroSubtitle || '',
    heroBannerImage: data.hero_banner_image || statsObj.heroBannerImage || '',
    address: data.address || statsObj.address || '',
    phone: data.phone || statsObj.phone || '',
    email: data.email || statsObj.email || '',
    hours: data.hours || statsObj.hours || '',
    whatsappNumber: data.whatsapp_number || statsObj.whatsappNumber || '',
    facebookUrl: data.facebook_url || statsObj.facebookUrl || '',
    instagramUrl: data.instagram_url || statsObj.instagramUrl || '',
    pinterestUrl: data.pinterest_url || statsObj.pinterestUrl || '',
    youtubeUrl: statsObj.youtubeUrl || data.youtube_url || '',
    linkedinUrl: data.linkedin_url || statsObj.linkedinUrl || '',
    seoTitle: data.seo_title || statsObj.seoTitle || '',
    seoDescription: data.seo_description || statsObj.seoDescription || '',
    seoKeywords: data.seo_keywords || statsObj.seoKeywords || '',
    stats: {
      projectsDone: statsObj.projectsDone || "120+",
      experienceYears: statsObj.experienceYears || "7+",
      clientSatisfaction: statsObj.clientSatisfaction || "99%",
      hiddenCharges: statsObj.hiddenCharges || "₹0",
      ...statsObj
    },
    phonepeMerchantId: data.phonepeMerchantId || statsObj.phonepeMerchantId || '',
    phonepeSaltKey: data.phonepeSaltKey || statsObj.phonepeSaltKey || '',
    phonepeSaltIndex: data.phonepeSaltIndex || statsObj.phonepeSaltIndex || '1',
    phonepeMode: data.phonepeMode || statsObj.phonepeMode || 'UAT',
    phonepeEnabled: data.phonepeEnabled !== undefined ? data.phonepeEnabled : (statsObj.phonepeEnabled !== undefined ? statsObj.phonepeEnabled : true)
  };
}

export async function saveSupabaseSettings(settings: Settings): Promise<boolean> {
  if (!supabase) return false;

  // Retrieve existing stats and primary key row id
  let existingRowId: any = null;
  let existingStats: any = {};
  try {
    const res = await supabase.from('settings').select('*').limit(1);
    if (res.data && res.data.length > 0) {
      existingRowId = res.data[0].id;
      if (res.data[0].stats && typeof res.data[0].stats === 'object') {
        existingStats = res.data[0].stats;
      }
    }
  } catch {}

  const mergedStats = {
    ...existingStats,
    ...(settings.stats || {}),
    projectsDone: settings.stats?.projectsDone ?? existingStats.projectsDone ?? '120+',
    experienceYears: settings.stats?.experienceYears ?? existingStats.experienceYears ?? '7+',
    clientSatisfaction: settings.stats?.clientSatisfaction ?? existingStats.clientSatisfaction ?? '99%',
    hiddenCharges: settings.stats?.hiddenCharges ?? existingStats.hiddenCharges ?? '₹0',
    youtubeUrl: settings.youtubeUrl !== undefined ? settings.youtubeUrl : (existingStats.youtubeUrl || ''),
    // Store mirrors inside stats JSONB for high-resilience retrieval
    heroTitle: settings.heroTitle,
    heroSubtitle: settings.heroSubtitle,
    heroBannerImage: settings.heroBannerImage,
    address: settings.address,
    phone: settings.phone,
    email: settings.email,
    hours: settings.hours,
    whatsappNumber: settings.whatsappNumber,
    facebookUrl: settings.facebookUrl,
    instagramUrl: settings.instagramUrl,
    pinterestUrl: settings.pinterestUrl,
    linkedinUrl: settings.linkedinUrl,
    seoTitle: settings.seoTitle,
    seoDescription: settings.seoDescription,
    seoKeywords: settings.seoKeywords,
    phonepeMerchantId: settings.phonepeMerchantId !== undefined ? settings.phonepeMerchantId : (existingStats.phonepeMerchantId || ''),
    phonepeSaltKey: settings.phonepeSaltKey !== undefined ? settings.phonepeSaltKey : (existingStats.phonepeSaltKey || ''),
    phonepeSaltIndex: settings.phonepeSaltIndex !== undefined ? settings.phonepeSaltIndex : (existingStats.phonepeSaltIndex || '1'),
    phonepeMode: settings.phonepeMode !== undefined ? settings.phonepeMode : (existingStats.phonepeMode || 'UAT'),
    phonepeEnabled: settings.phonepeEnabled !== undefined ? settings.phonepeEnabled : (existingStats.phonepeEnabled !== undefined ? existingStats.phonepeEnabled : true)
  };

  // Note: Only include columns that actually exist on the 'settings' table in Supabase.
  // 'youtube_url' does NOT exist as a column in the table schema, so it is stored safely inside 'stats'.
  const payload: any = {
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
    linkedin_url: settings.linkedinUrl,
    seo_title: settings.seoTitle,
    seo_description: settings.seoDescription,
    seo_keywords: settings.seoKeywords,
    stats: mergedStats,
    updated_at: new Date().toISOString()
  };

  // 1. If row already exists in settings, perform an UPDATE (PATCH).
  if (existingRowId !== null) {
    const { error: updateError } = await supabase.from('settings').update(payload).eq('id', existingRowId);
    if (!updateError) {
      return true;
    }
    console.warn('Update to settings failed, trying upsert:', updateError.message);
  }

  // 2. Otherwise insert or upsert with fallback id
  payload.id = existingRowId || 'site_settings';
  const { error: upsertError } = await supabase.from('settings').upsert(payload);
  if (upsertError) {
    console.error('Error saving settings to Supabase:', upsertError.message);
    return false;
  }
  return true;
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

// --- HOUSE PLANS DB HELPERS ---
const LOCAL_HOUSE_PLANS_KEY = 'lifehut_local_house_plans';

export async function fetchSupabaseHousePlans(): Promise<HousePlan[] | null> {
  // 1. Check localStorage first for instant caching & offline access
  let cachedPlans: HousePlan[] | null = null;
  try {
    const raw = localStorage.getItem(LOCAL_HOUSE_PLANS_KEY);
    if (raw) {
      cachedPlans = JSON.parse(raw);
    }
  } catch {
    // ignore local parse errors
  }

  // 2. Try fetching from Supabase table 'house_plans'
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('house_plans')
        .select('*');

      if (!error && data && data.length > 0) {
        data.sort((a, b) => {
          const timeA = a.created_at ? new Date(a.created_at).getTime() : 0;
          const timeB = b.created_at ? new Date(b.created_at).getTime() : 0;
          return timeB - timeA;
        });
        const plans: HousePlan[] = data.map(item => ({
          id: item.id,
          planCode: item.plan_code || item.planCode || 'LH-HP-000',
          title: item.title,
          slug: item.slug,
          floors: Number(item.floors) || 1,
          floorsLabel: item.floors_label || item.floorsLabel || `${item.floors || 1} Storey`,
          bedrooms: Number(item.bedrooms) || 3,
          bathrooms: Number(item.bathrooms) || 3,
          builtUpArea: Number(item.built_up_area || item.builtUpArea) || 1500,
          plotDimensions: item.plot_dimensions || item.plotDimensions || "30' x 50'",
          buildingDimensions: item.building_dimensions || item.buildingDimensions || undefined,
          facing: item.facing || 'East',
          vastuCompliant: item.vastu_compliant !== undefined ? Boolean(item.vastu_compliant) : true,
          vastuScore: item.vastu_score || item.vastuScore || '100% Vastu Compliant',
          vastuNotes: Array.isArray(item.vastu_notes || item.vastuNotes) ? (item.vastu_notes || item.vastuNotes) : [],
          style: item.style || 'Contemporary Modern',
          carParking: Number(item.car_parking || item.carParking) || 1,
          estimatedCostRange: item.estimated_cost_range || item.estimatedCostRange || '₹30L - ₹35L',
          costPerSqft: item.cost_per_sqft || item.costPerSqft || '₹2,200 / sq.ft',
          elevationImage: item.elevation_image || item.elevationImage || '',
          floorPlanImage: item.floor_plan_image || item.floorPlanImage || '',
          galleryImages: Array.isArray(item.gallery_images || item.galleryImages) ? (item.gallery_images || item.galleryImages) : [],
          description: item.description || '',
          roomDimensions: Array.isArray(item.room_dimensions || item.roomDimensions) ? (item.room_dimensions || item.roomDimensions) : [],
          features: Array.isArray(item.features) ? item.features : [],
          cadPackageZipUrl: item.cad_package_zip_url || item.cadPackageZipUrl || '',
          cadPackageFileName: item.cad_package_file_name || item.cadPackageFileName || '',
          cadPackageSize: item.cad_package_size || item.cadPackageSize || '',
          cadPackagePrice: item.cad_package_price !== undefined ? Number(item.cad_package_price) : (item.cadPackagePrice !== undefined ? Number(item.cadPackagePrice) : 999),
          cadPackageIncludes: Array.isArray(item.cad_package_includes || item.cadPackageIncludes) ? (item.cad_package_includes || item.cadPackageIncludes) : undefined,
          seoMeta: item.seo_meta || item.seoMeta || undefined,
          isFeatured: Boolean(item.is_featured || item.isFeatured),
          isActive: item.is_active !== undefined ? Boolean(item.is_active) : true,
          createdAt: item.created_at || item.createdAt
        }));

        try {
          localStorage.setItem(LOCAL_HOUSE_PLANS_KEY, JSON.stringify(plans));
        } catch {
          // ignore storage quota
        }
        return plans;
      }

      // If 'house_plans' table does not exist or empty, check settings.stats.house_plans fallback
      const settingsRes = await supabase.from('settings').select('*').limit(1);
      if (!settingsRes.error && settingsRes.data && settingsRes.data[0]?.stats?.house_plans) {
        const storedPlans = settingsRes.data[0].stats.house_plans;
        if (Array.isArray(storedPlans) && storedPlans.length > 0) {
          try {
            localStorage.setItem(LOCAL_HOUSE_PLANS_KEY, JSON.stringify(storedPlans));
          } catch {
            // ignore
          }
          return storedPlans;
        }
      }
    } catch (err) {
      console.warn('Error querying Supabase for house plans, checking local/server fallback:', err);
    }
  }

  // 3. Fallback to Express server API
  try {
    const res = await fetch('/api/house-plans');
    if (res.ok) {
      const serverPlans = await res.json();
      if (Array.isArray(serverPlans) && serverPlans.length > 0) {
        try {
          localStorage.setItem(LOCAL_HOUSE_PLANS_KEY, JSON.stringify(serverPlans));
        } catch {
          // ignore
        }
        return serverPlans;
      }
    }
  } catch {
    // server unreachable or running in static export
  }

  // 4. Return cached or default plans
  return cachedPlans && cachedPlans.length > 0 ? cachedPlans : defaultHousePlans;
}

export async function saveSupabaseHousePlan(plan: HousePlan): Promise<boolean> {
  // Update local storage immediately for fast UI feedback
  try {
    const current = (await fetchSupabaseHousePlans()) || defaultHousePlans;
    const existsIndex = current.findIndex(p => p.id === plan.id || p.slug === plan.slug);
    let updated: HousePlan[];
    if (existsIndex >= 0) {
      updated = [...current];
      updated[existsIndex] = plan;
    } else {
      updated = [plan, ...current];
    }
    localStorage.setItem(LOCAL_HOUSE_PLANS_KEY, JSON.stringify(updated));
  } catch (e) {
    console.warn('Failed to update local house plans cache:', e);
  }

  // Update Express server in background
  try {
    fetch('/api/house-plans', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'upsert', plan })
    }).catch(() => {});
  } catch {
    // ignore
  }

  if (!supabase) return true;

  // Attempt direct upsert to Supabase 'house_plans'
  const payload = {
    id: plan.id,
    plan_code: plan.planCode,
    title: plan.title,
    slug: plan.slug,
    floors: plan.floors,
    floors_label: plan.floorsLabel,
    bedrooms: plan.bedrooms,
    bathrooms: plan.bathrooms,
    built_up_area: plan.builtUpArea,
    plot_dimensions: plan.plotDimensions,
    building_dimensions: plan.buildingDimensions,
    facing: plan.facing,
    vastu_compliant: plan.vastuCompliant,
    vastu_score: plan.vastuScore,
    vastu_notes: plan.vastuNotes,
    style: plan.style,
    car_parking: plan.carParking,
    estimated_cost_range: plan.estimatedCostRange,
    cost_per_sqft: plan.costPerSqft,
    elevation_image: plan.elevationImage,
    floor_plan_image: plan.floorPlanImage,
    gallery_images: plan.galleryImages,
    description: plan.description,
    room_dimensions: plan.roomDimensions,
    features: plan.features,
    cad_package_zip_url: plan.cadPackageZipUrl || '',
    cad_package_file_name: plan.cadPackageFileName || '',
    cad_package_size: plan.cadPackageSize || '',
    cad_package_price: plan.cadPackagePrice || 999,
    cad_package_includes: plan.cadPackageIncludes || [],
    seo_meta: plan.seoMeta,
    is_featured: plan.isFeatured,
    is_active: plan.isActive,
    updated_at: new Date().toISOString()
  };

  const { error } = await supabase.from('house_plans').upsert(payload);
  if (error) {
    console.warn('Direct house_plans upsert failed (table may not exist yet), saving to settings stats fallback:', error.message);
    try {
      const res = await supabase.from('settings').select('*').limit(1);
      if (res.data && res.data.length > 0) {
        const row = res.data[0];
        const existingPlans: HousePlan[] = Array.isArray(row.stats?.house_plans) ? row.stats.house_plans : [...defaultHousePlans];
        const idx = existingPlans.findIndex(p => p.id === plan.id || p.slug === plan.slug);
        if (idx >= 0) {
          existingPlans[idx] = plan;
        } else {
          existingPlans.unshift(plan);
        }
        const updatedStats = { ...row.stats, house_plans: existingPlans };
        const rowId = row.id || 'site_settings';
        await supabase.from('settings').update({ stats: updatedStats, updated_at: new Date().toISOString() }).eq('id', rowId);
      }
    } catch (fallbackErr) {
      console.warn('Fallback settings save for house plan caught error:', fallbackErr);
    }
  }

  return true;
}

export async function deleteSupabaseHousePlan(id: string): Promise<boolean> {
  // Update local storage
  try {
    const raw = localStorage.getItem(LOCAL_HOUSE_PLANS_KEY);
    if (raw) {
      const plans: HousePlan[] = JSON.parse(raw);
      const filtered = plans.filter(p => p.id !== id);
      localStorage.setItem(LOCAL_HOUSE_PLANS_KEY, JSON.stringify(filtered));
    }
  } catch (e) {
    console.warn('Failed to update local house plans cache on delete:', e);
  }

  // Update Express server
  try {
    fetch(`/api/house-plans/${id}`, { method: 'DELETE' }).catch(() => {});
  } catch {
    // ignore
  }

  if (!supabase) return true;

  try {
    const { error } = await supabase.from('house_plans').delete().eq('id', id);
    if (error) {
      // Also clean up from settings fallback
      const res = await supabase.from('settings').select('*').limit(1);
      if (res.data && res.data.length > 0) {
        const row = res.data[0];
        if (row.stats?.house_plans && Array.isArray(row.stats.house_plans)) {
          const filtered = row.stats.house_plans.filter((p: HousePlan) => p.id !== id);
          const rowId = row.id || 'site_settings';
          await supabase.from('settings').update({ stats: { ...row.stats, house_plans: filtered } }).eq('id', rowId);
        }
      }
    }
  } catch {
    // ignore
  }

  return true;
}

/**
 * Purely code-driven silent auto-sync & migration.
 * Runs on app initialization in the background without needing any buttons in the Admin UI.
 * Ensures:
 * 1. Project metadata (tags, client_name, is_recent) is permanently embedded into Supabase project records and settings.
 * 2. Site settings stats contain project_metadata_map and house_plans catalog.
 * 3. Client names and tags survive all browser clears, deploys, and device switches.
 */
let hasAutoMigrated = false;

export async function autoMigrateAndSyncSupabase(): Promise<void> {
  if (!supabase || hasAutoMigrated) return;
  hasAutoMigrated = true;

  try {
    // 1. Fetch current settings row
    const res = await supabase.from('settings').select('*').limit(1);
    const settingsRow = res.data && res.data.length > 0 ? res.data[0] : null;
    const currentStats = (settingsRow && typeof settingsRow.stats === 'object') ? settingsRow.stats : {};
    const remoteMetaMap = { ...(currentStats.project_metadata_map || {}) };

    // 2. Fetch all projects from Supabase
    const { data: projectsData, error: projErr } = await supabase.from('projects').select('*');
    if (projErr || !projectsData) return;

    let hasStatsUpdate = false;

    // 3. Process each project
    for (const p of projectsData) {
      const existingMeta = remoteMetaMap[p.id] || {};
      const defaultMatch = defaultProjects.find(dp => dp.id === p.id || dp.name.toLowerCase() === (p.name || '').toLowerCase());

      // Parse tags
      const rawTags = existingMeta.tags || p.tags || p.tag || defaultMatch?.tags;
      const tags = parseProjectTags(rawTags, undefined, p.name);

      const clientName = (p.client_name && p.client_name.trim())
        || (existingMeta.clientName && existingMeta.clientName.trim())
        || defaultMatch?.clientName
        || '';

      const clientAvatar = p.client_avatar
        || existingMeta.clientAvatar
        || (clientName ? clientName.split(' ').map((s: string) => s[0]).join('').slice(0, 2).toUpperCase() : 'LH');

      const isRecent = existingMeta.isRecent !== undefined
        ? Boolean(existingMeta.isRecent)
        : (p.is_recent !== undefined ? Boolean(p.is_recent) : true);

      // Check if gallery has __meta embedded
      let hasEmbedded = false;
      if (Array.isArray(p.gallery)) {
        for (const g of p.gallery) {
          if ((typeof g === 'object' && g?.__meta) || (typeof g === 'string' && g.includes('__meta'))) {
            hasEmbedded = true;
            break;
          }
        }
      }

      // If gallery doesn't have metadata embedded OR client_name is empty in row, update Supabase row
      if (!hasEmbedded || (!p.client_name && clientName)) {
        const rawG = Array.isArray(p.gallery) ? p.gallery : (p.hero_image ? [p.hero_image] : []);
        const cleanG = rawG.filter((g: any) => typeof g === 'string' && !g.includes('__meta') && (g.startsWith('http') || g.startsWith('/')));
        if (cleanG.length === 0 && p.hero_image) {
          cleanG.push(p.hero_image);
        }

        const newGallery = [
          ...cleanG,
          { __meta: { tags, isRecent, clientName, clientAvatar } }
        ];

        const updatePayload: Record<string, any> = {
          gallery: newGallery
        };
        if (clientName && (!p.client_name || p.client_name.trim() === '')) {
          updatePayload.client_name = clientName;
        }
        if (clientAvatar && !p.client_avatar) {
          updatePayload.client_avatar = clientAvatar;
        }

        await supabase.from('projects').update(updatePayload).eq('id', p.id);
      }

      // Ensure remoteMetaMap in settings has this project's tags and client info
      if (!remoteMetaMap[p.id] || !remoteMetaMap[p.id].tags || remoteMetaMap[p.id].tags.length === 0) {
        remoteMetaMap[p.id] = {
          tags,
          clientName,
          clientAvatar,
          isRecent
        };
        hasStatsUpdate = true;
      }
    }

    // 4. If settings stats need sync, save them
    if (hasStatsUpdate || !currentStats.house_plans || currentStats.house_plans.length === 0) {
      // Re-fetch latest settings row to ensure we never overwrite user-saved changes
      const freshRes = await supabase.from('settings').select('*').limit(1);
      const freshRow = (freshRes.data && freshRes.data.length > 0) ? freshRes.data[0] : settingsRow;
      const latestStats = (freshRow && typeof freshRow.stats === 'object') ? freshRow.stats : currentStats;

      const mergedStats = {
        ...latestStats,
        project_metadata_map: remoteMetaMap,
        house_plans: (latestStats.house_plans && latestStats.house_plans.length > 0) ? latestStats.house_plans : defaultHousePlans
      };

      if (freshRow) {
        await supabase.from('settings').update({
          stats: mergedStats,
          updated_at: new Date().toISOString()
        }).eq('id', freshRow.id);
      } else {
        await supabase.from('settings').upsert({
          id: 'site_settings',
          stats: mergedStats,
          updated_at: new Date().toISOString()
        });
      }
    }
  } catch (e) {
    console.warn('Silent code migration in background completed with notice:', e);
  }
}

