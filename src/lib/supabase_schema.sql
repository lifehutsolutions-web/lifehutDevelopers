-- Lifehut Developers Supabase SQL Migration Schema
-- Copy & Paste into Supabase SQL Editor (https://app.supabase.com -> SQL Editor)

-- ==============================================================================
-- OPTION A: QUICK FIX FOR EXISTING TABLES (If you already created tables with UUIDs)
-- ==============================================================================
ALTER TABLE IF EXISTS public.projects ALTER COLUMN id TYPE TEXT;
ALTER TABLE IF EXISTS public.services ALTER COLUMN id TYPE TEXT;
ALTER TABLE IF EXISTS public.testimonials ALTER COLUMN id TYPE TEXT;
ALTER TABLE IF EXISTS public.enquiries ALTER COLUMN id TYPE TEXT;
ALTER TABLE IF EXISTS public.quotes ALTER COLUMN id TYPE TEXT;
ALTER TABLE IF EXISTS public.quote_requests ALTER COLUMN id TYPE TEXT;

-- ==============================================================================
-- OPTION B: COMPLETE CLEAN TABLE RECREATION (Recommended)
-- ==============================================================================

-- 1. Services Table
CREATE TABLE IF NOT EXISTS public.services (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    banner TEXT,
    description TEXT,
    features JSONB DEFAULT '[]'::jsonb,
    gallery JSONB DEFAULT '[]'::jsonb,
    faqs JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Projects Table
CREATE TABLE IF NOT EXISTS public.projects (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    hero_image TEXT,
    gallery JSONB DEFAULT '[]'::jsonb,
    completion_date TEXT,
    plot_size TEXT,
    built_up_area TEXT,
    floors INTEGER DEFAULT 1,
    bedrooms INTEGER DEFAULT 1,
    budget TEXT,
    location TEXT,
    client_testimonial TEXT,
    client_name TEXT,
    client_avatar TEXT,
    status TEXT DEFAULT 'Completed',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Enquiries Table
CREATE TABLE IF NOT EXISTS public.enquiries (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT,
    service TEXT,
    message TEXT,
    date TEXT,
    status TEXT DEFAULT 'New',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Instant Quotes Table
CREATE TABLE IF NOT EXISTS public.quotes (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT,
    area NUMERIC,
    floors TEXT,
    ctype TEXT,
    interior TEXT,
    extras TEXT,
    estimated_cost TEXT,
    date TEXT,
    status TEXT DEFAULT 'New',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Site Settings Table
CREATE TABLE IF NOT EXISTS public.settings (
    id TEXT PRIMARY KEY DEFAULT 'site_settings',
    hero_title TEXT,
    hero_subtitle TEXT,
    hero_banner_image TEXT,
    address TEXT,
    phone TEXT,
    email TEXT,
    hours TEXT,
    whatsapp_number TEXT,
    facebook_url TEXT,
    instagram_url TEXT,
    pinterest_url TEXT,
    linkedin_url TEXT,
    seo_title TEXT,
    seo_description TEXT,
    seo_keywords TEXT,
    stats JSONB DEFAULT '{"projectsDone":"120+","experienceYears":"7+","clientSatisfaction":"99%","hiddenCharges":"₹0"}'::jsonb,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Testimonials Table
CREATE TABLE IF NOT EXISTS public.testimonials (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    text TEXT,
    rating NUMERIC DEFAULT 5,
    avatar TEXT,
    date TEXT,
    location TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security (RLS) & Public Read/Write Access Policies
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;

-- Drop old policies if they exist to prevent duplicates
DROP POLICY IF EXISTS "Allow public all access on services" ON public.services;
DROP POLICY IF EXISTS "Allow public all access on projects" ON public.projects;
DROP POLICY IF EXISTS "Allow public all access on enquiries" ON public.enquiries;
DROP POLICY IF EXISTS "Allow public all access on quotes" ON public.quotes;
DROP POLICY IF EXISTS "Allow public all access on settings" ON public.settings;
DROP POLICY IF EXISTS "Allow public all access on testimonials" ON public.testimonials;

-- Create Permissive RLS policies with both USING (true) and WITH CHECK (true)
CREATE POLICY "Allow public all access on services" ON public.services FOR ALL TO anon, authenticated, service_role USING (true) WITH CHECK (true);
CREATE POLICY "Allow public all access on projects" ON public.projects FOR ALL TO anon, authenticated, service_role USING (true) WITH CHECK (true);
CREATE POLICY "Allow public all access on enquiries" ON public.enquiries FOR ALL TO anon, authenticated, service_role USING (true) WITH CHECK (true);
CREATE POLICY "Allow public all access on quotes" ON public.quotes FOR ALL TO anon, authenticated, service_role USING (true) WITH CHECK (true);
CREATE POLICY "Allow public all access on settings" ON public.settings FOR ALL TO anon, authenticated, service_role USING (true) WITH CHECK (true);
CREATE POLICY "Allow public all access on testimonials" ON public.testimonials FOR ALL TO anon, authenticated, service_role USING (true) WITH CHECK (true);

-- Grant full table permissions to anon and authenticated roles
GRANT ALL ON TABLE public.services TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.projects TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.enquiries TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.quotes TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.settings TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.testimonials TO anon, authenticated, service_role;

-- Storage Bucket Setup for Project & Service Images (Run in Supabase Storage)
INSERT INTO storage.buckets (id, name, public) 
VALUES ('cms-uploads', 'cms-uploads', true) 
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Public Read Access for cms-uploads" ON storage.objects 
FOR SELECT USING (bucket_id = 'cms-uploads');

CREATE POLICY "Public Upload Access for cms-uploads" ON storage.objects 
FOR INSERT WITH CHECK (bucket_id = 'cms-uploads');

CREATE POLICY "Public Update/Delete Access for cms-uploads" ON storage.objects 
FOR ALL USING (bucket_id = 'cms-uploads');
