import { HousePlan, Project, Service, Blog } from '../types';

export type AppRoute =
  | { type: 'home' }
  | { type: 'house-plans'; slug?: string | null }
  | { type: 'projects'; id?: string | null }
  | { type: 'services'; id?: string | null }
  | { type: 'pricing' }
  | { type: 'blogs'; slug?: string | null }
  | { type: 'quote' }
  | { type: 'contact' }
  | { type: 'about' }
  | { type: 'faq' }
  | { type: 'admin' }
  | { type: 'privacy-policy' }
  | { type: 'terms-and-conditions' }
  | { type: 'refund-policy' };

/**
 * Normalizes any string into a clean lowercase hyphen-separated slug.
 * Example: "28x41 North Facing 5BHK House Plan for 30x50 Plot" -> "28x41-north-facing-5bhk-house-plan-for-30x50-plot"
 */
export function normalizeSlug(text: string): string {
  if (!text) return '';
  return decodeURIComponent(text)
    .trim()
    .toLowerCase()
    .replace(/['"]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Parses the current window.location pathname and hash into an AppRoute.
 */
export function parseCurrentRoute(pathname?: string, hash?: string): AppRoute {
  const currentPathname = pathname !== undefined ? pathname : (typeof window !== 'undefined' ? window.location.pathname : '/');
  const currentHash = hash !== undefined ? hash : (typeof window !== 'undefined' ? window.location.hash : '');
  const cleanPath = (currentPathname || '').trim().replace(/\/+$/, '') || '/';
  const cleanHash = (currentHash || '').trim().toLowerCase();

  // Admin routing
  if (cleanHash === '#admin' || cleanPath === '/admin') {
    return { type: 'admin' };
  }

  // Legal Policies
  if (cleanPath === '/privacy-policy' || cleanHash === '#privacy-policy') {
    return { type: 'privacy-policy' };
  }
  if (cleanPath === '/terms-and-conditions' || cleanPath === '/terms' || cleanHash === '#terms-and-conditions' || cleanHash === '#terms') {
    return { type: 'terms-and-conditions' };
  }
  if (
    cleanPath === '/refund-policy' ||
    cleanPath === '/cancellation-policy' ||
    cleanPath === '/cancellation-and-refund-policy' ||
    cleanHash === '#refund-policy' ||
    cleanHash === '#cancellation-policy'
  ) {
    return { type: 'refund-policy' };
  }

  // House plans: /house-plans or /house-plans/:slugOrTitle
  if (cleanPath === '/house-plans' || cleanPath.startsWith('/house-plans/')) {
    const rawSlug = cleanPath.slice('/house-plans'.length).replace(/^\/+/, '');
    const decodedSlug = rawSlug ? decodeURIComponent(rawSlug).trim() : null;
    return { type: 'house-plans', slug: decodedSlug || null };
  }

  // Projects: /projects or /projects/:id
  if (cleanPath === '/projects' || cleanPath.startsWith('/projects/')) {
    const rawId = cleanPath.slice('/projects'.length).replace(/^\/+/, '');
    const decodedId = rawId ? decodeURIComponent(rawId).trim() : null;
    return { type: 'projects', id: decodedId || null };
  }

  // Services: /services or /services/:id
  if (cleanPath === '/services' || cleanPath.startsWith('/services/')) {
    const rawId = cleanPath.slice('/services'.length).replace(/^\/+/, '');
    const decodedId = rawId ? decodeURIComponent(rawId).trim() : null;
    return { type: 'services', id: decodedId || null };
  }

  // Blogs: /blogs or /blogs/:slug
  if (cleanPath === '/blogs' || cleanPath.startsWith('/blogs/')) {
    const rawSlug = cleanPath.slice('/blogs'.length).replace(/^\/+/, '');
    const decodedSlug = rawSlug ? decodeURIComponent(rawSlug).trim() : null;
    return { type: 'blogs', slug: decodedSlug || null };
  }

  // Other Top-Level Pages
  if (cleanPath === '/pricing') return { type: 'pricing' };
  if (cleanPath === '/quote' || cleanPath === '/calculator' || cleanPath === '/cost-calculator') return { type: 'quote' };
  if (cleanPath === '/contact') return { type: 'contact' };
  if (cleanPath === '/about') return { type: 'about' };
  if (cleanPath === '/faq') return { type: 'faq' };

  // In-page hash anchors on home
  if (cleanHash === '#about') return { type: 'about' };
  if (cleanHash === '#faq') return { type: 'faq' };
  if (cleanHash === '#contact') return { type: 'contact' };

  return { type: 'home' };
}

/**
 * Returns the canonical URL path for a given AppRoute.
 */
export function getRoutePath(route: AppRoute): string {
  switch (route.type) {
    case 'home':
      return '/';
    case 'house-plans':
      return route.slug ? `/house-plans/${encodeURIComponent(route.slug)}` : '/house-plans';
    case 'projects':
      return route.id ? `/projects/${encodeURIComponent(route.id)}` : '/projects';
    case 'services':
      return route.id ? `/services/${encodeURIComponent(route.id)}` : '/services';
    case 'pricing':
      return '/pricing';
    case 'blogs':
      return route.slug ? `/blogs/${encodeURIComponent(route.slug)}` : '/blogs';
    case 'quote':
      return '/quote';
    case 'contact':
      return '/contact';
    case 'about':
      return '/about';
    case 'faq':
      return '/faq';
    case 'admin':
      return '/admin';
    case 'privacy-policy':
      return '/privacy-policy';
    case 'terms-and-conditions':
      return '/terms-and-conditions';
    case 'refund-policy':
      return '/refund-policy';
    default:
      return '/';
  }
}

/**
 * Programmatically navigates to a new route, updating window.history and emitting an event.
 */
export function navigateToRoute(route: AppRoute, replace = false): void {
  if (typeof window === 'undefined') return;

  const newPath = getRoutePath(route);
  const currentPath = window.location.pathname + window.location.search + window.location.hash;

  if (newPath !== currentPath) {
    if (replace) {
      window.history.replaceState({}, '', newPath);
    } else {
      window.history.pushState({}, '', newPath);
    }
  }

  window.dispatchEvent(new CustomEvent('app-route-change', { detail: route }));
}

/**
 * Checks if a house plan object represents legacy hardcoded demo placeholder plans.
 */
export const isDemoHousePlan = (p: HousePlan | any): boolean => {
  if (!p) return true;
  const demoCodes = ['LH-HP-1500', 'LH-HP-1800', 'LH-HP-2400', 'LH-HP-1200', 'LH-HP-2100', 'LH-HP-3200', 'LH-HP-1000', 'LH-HP-2700'];
  const demoIds = ['lh-hp-1500-single-storey', 'lh-hp-1800-duplex-villa', 'lh-hp-2400-luxury-villa', 'lh-hp-1200-single-storey', 'lh-hp-2100-duplex-villa', 'lh-hp-3200-triplex-residence', 'lh-hp-1000-budget-storey', 'lh-hp-2700-duplex-house'];
  const demoSlugs = [
    'one-storey-1500-sqft-contemporary-3bhk-house-plan',
    'two-storey-1800-sqft-modern-duplex-villa-4bhk-house-plan',
    'two-storey-2400-sqft-luxury-4bhk-independent-villa-plan',
    'one-storey-1200-sqft-compact-2bhk-single-storey-house-plan',
    'two-storey-2100-sqft-premium-duplex-villa-4bhk-house-plan',
    'three-storey-3200-sqft-luxury-triplex-residence-5bhk-house-plan',
    'one-storey-1000-sqft-budget-single-storey-2bhk-house-plan',
    'two-storey-2700-sqft-executive-duplex-house-4bhk-house-plan'
  ];
  const code = (p.planCode || p.plan_code || '').trim();
  const id = (p.id || '').trim();
  const slug = (p.slug || '').trim();
  return demoCodes.includes(code) || demoIds.includes(id) || demoSlugs.includes(slug);
};

/**
 * Robust matcher for house plans by slug, id, planCode, or title.
 * Supports:
 * - SEO-friendly slug: /house-plans/duplex-house-at-1000-sqft-plot
 * - Product Code (case-insensitive): /house-plans/LH-HP-0002 or /house-plans/lh-hp-0002
 * - Normalized codes: /house-plans/lhhp0002
 * - Plan ID or title
 */
export function findPlan(plans: HousePlan[], identifier: string | null | undefined): HousePlan | null {
  if (!identifier || !plans || plans.length === 0) return null;

  const rawDecoded = decodeURIComponent(identifier).trim();
  const lowerRaw = rawDecoded.toLowerCase();
  const normalized = normalizeSlug(rawDecoded);
  const cleanCode = lowerRaw.replace(/[^a-z0-9]/g, '');

  // 1. Exact matches on slug, planCode, id, title
  for (const plan of plans) {
    if (plan.slug && plan.slug.toLowerCase() === lowerRaw) return plan;
    if (plan.planCode && plan.planCode.toLowerCase() === lowerRaw) return plan;
    if (plan.id && plan.id.toLowerCase() === lowerRaw) return plan;
    if (plan.title && plan.title.toLowerCase() === lowerRaw) return plan;
  }

  // 2. Normalized slug and planCode comparisons
  for (const plan of plans) {
    if (plan.slug && normalizeSlug(plan.slug) === normalized) return plan;
    if (plan.title && normalizeSlug(plan.title) === normalized) return plan;
    if (plan.planCode && normalizeSlug(plan.planCode) === normalized) return plan;
    if (plan.planCode && plan.planCode.toLowerCase().replace(/[^a-z0-9]/g, '') === cleanCode) return plan;
    if (plan.id && normalizeSlug(plan.id) === normalized) return plan;
  }

  // 3. Normalized substring inclusion (e.g. "28x41", "5bhk", or partial title slug)
  for (const plan of plans) {
    const cleanNorm = normalized.replace(/[^a-z0-9]/g, '');
    const titleClean = normalizeSlug(plan.title).replace(/[^a-z0-9]/g, '');
    const slugClean = normalizeSlug(plan.slug || '').replace(/[^a-z0-9]/g, '');
    if (titleClean && cleanNorm && (titleClean.includes(cleanNorm) || cleanNorm.includes(titleClean))) return plan;
    if (slugClean && cleanNorm && (slugClean.includes(cleanNorm) || cleanNorm.includes(slugClean))) return plan;
  }

  return null;
}

/**
 * Returns the shareable URL for a house plan.
 * format:
 * - 'seo': https://lifehutdevelopers.com/house-plans/<product-slug>
 * - 'code': https://lifehutdevelopers.com/house-plans/<product-code>
 * - 'current': <origin>/house-plans/<product-slug>
 */
export function getPlanShareUrl(plan: HousePlan, format: 'seo' | 'code' | 'current' = 'seo'): string {
  const slug = plan.slug || normalizeSlug(plan.title) || plan.planCode.toLowerCase();
  const baseUrl = format === 'current' && typeof window !== 'undefined'
    ? window.location.origin
    : 'https://lifehutdevelopers.com';

  if (format === 'code') {
    return `${baseUrl}/house-plans/${encodeURIComponent(plan.planCode)}`;
  }
  return `${baseUrl}/house-plans/${encodeURIComponent(slug)}`;
}

/**
 * Robust matcher for projects by id or title.
 */
export function findProject(projects: Project[], identifier: string | null | undefined): Project | null {
  if (!identifier || !projects || projects.length === 0) return null;

  const rawDecoded = decodeURIComponent(identifier).trim();
  const lowerRaw = rawDecoded.toLowerCase();
  const normalized = normalizeSlug(rawDecoded);

  for (const project of projects) {
    if (project.id && project.id.toLowerCase() === lowerRaw) return project;
    if (project.name && project.name.toLowerCase() === lowerRaw) return project;
    if (project.id && normalizeSlug(project.id) === normalized) return project;
    if (project.name && normalizeSlug(project.name) === normalized) return project;
  }

  return null;
}

/**
 * Robust matcher for services by id or title.
 */
export function findService(services: Service[], identifier: string | null | undefined): Service | null {
  if (!identifier || !services || services.length === 0) return null;

  const rawDecoded = decodeURIComponent(identifier).trim();
  const lowerRaw = rawDecoded.toLowerCase();
  const normalized = normalizeSlug(rawDecoded);

  for (const svc of services) {
    if (svc.id && svc.id.toLowerCase() === lowerRaw) return svc;
    if (svc.title && svc.title.toLowerCase() === lowerRaw) return svc;
    if (svc.id && normalizeSlug(svc.id) === normalized) return svc;
    if (svc.title && normalizeSlug(svc.title) === normalized) return svc;
  }

  return null;
}

/**
 * Robust matcher for blogs by slug, id, or title.
 */
export function findBlog(blogs: Blog[], identifier: string | null | undefined): Blog | null {
  if (!identifier || !blogs || blogs.length === 0) return null;

  const rawDecoded = decodeURIComponent(identifier).trim();
  const lowerRaw = rawDecoded.toLowerCase();
  const normalized = normalizeSlug(rawDecoded);

  for (const blog of blogs) {
    if (blog.slug && blog.slug.toLowerCase() === lowerRaw) return blog;
    if (blog.id && blog.id.toLowerCase() === lowerRaw) return blog;
    if (blog.title && blog.title.toLowerCase() === lowerRaw) return blog;
    if (blog.slug && normalizeSlug(blog.slug) === normalized) return blog;
    if (blog.id && normalizeSlug(blog.id) === normalized) return blog;
    if (blog.title && normalizeSlug(blog.title) === normalized) return blog;
  }

  return null;
}
