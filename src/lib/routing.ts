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
export function parseCurrentRoute(pathname: string, hash: string): AppRoute {
  const cleanPath = (pathname || '').trim().replace(/\/+$/, '') || '/';
  const cleanHash = (hash || '').trim().toLowerCase();

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
 * Robust matcher for house plans by slug, id, planCode, or title.
 */
export function findPlan(plans: HousePlan[], identifier: string | null | undefined): HousePlan | null {
  if (!identifier || !plans || plans.length === 0) return null;

  const rawDecoded = decodeURIComponent(identifier).trim();
  const lowerRaw = rawDecoded.toLowerCase();
  const normalized = normalizeSlug(rawDecoded);

  // 1. Exact matches on slug, id, planCode, title
  for (const plan of plans) {
    if (plan.slug && plan.slug.toLowerCase() === lowerRaw) return plan;
    if (plan.id && plan.id.toLowerCase() === lowerRaw) return plan;
    if (plan.planCode && plan.planCode.toLowerCase() === lowerRaw) return plan;
    if (plan.title && plan.title.toLowerCase() === lowerRaw) return plan;
  }

  // 2. Normalized slug comparisons
  for (const plan of plans) {
    if (plan.slug && normalizeSlug(plan.slug) === normalized) return plan;
    if (plan.title && normalizeSlug(plan.title) === normalized) return plan;
    if (plan.id && normalizeSlug(plan.id) === normalized) return plan;
  }

  // 3. Normalized substring inclusion (e.g. "28x41" and "5bhk")
  for (const plan of plans) {
    const planTitleNorm = normalizeSlug(plan.title);
    if (planTitleNorm.includes(normalized) || (normalized.length > 5 && normalized.includes(planTitleNorm))) {
      return plan;
    }
  }

  return null;
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
