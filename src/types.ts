export interface Service {
  id: string;
  title: string;
  banner: string;
  description: string;
  features: string[];
  gallery: string[];
  faqs: { question: string; answer: string }[];
}

export interface Project {
  id: string;
  name: string;
  heroImage: string;
  gallery: string[];
  completionDate: string;
  plotSize?: string;
  builtUpArea: string;
  floors: number;
  bedrooms: number;
  budget: string;
  location: string;
  clientTestimonial?: string;
  clientName?: string;
  clientAvatar?: string;
  status: 'Completed' | 'Ongoing';
  isRecent?: boolean;
}

export interface Blog {
  id: string;
  title: string;
  slug?: string;
  featuredImage?: string;
  author?: string;
  category: string;
  tags?: string[];
  seoMeta?: {
    title: string;
    description: string;
    keywords: string;
  };
  content: string;
  readingTime?: string;
  readTime?: string;
  date: string;
  comments?: Comment[];
}

export interface Comment {
  id: string;
  name: string;
  date: string;
  text: string;
}

export interface Testimonial {
  id: string;
  name: string;
  text: string;
  rating: number;
  avatar: string;
  date: string;
  location: string;
}

export interface Stats {
  projectsDone: string;
  experienceYears: string;
  clientSatisfaction: string;
  hiddenCharges: string;
}

export interface Enquiry {
  id: string;
  name: string;
  phone: string;
  email: string;
  service: string;
  message: string;
  date: string;
  status: 'New' | 'Contacted' | 'Archived';
}

export interface QuoteRequest {
  id: string;
  name: string;
  phone: string;
  email: string;
  area: number;
  floors: string;
  ctype: string;
  interior: string;
  extras: string;
  estimatedCost: string;
  date: string;
  status: 'New' | 'Processed' | 'Archived';
}

export interface SiteSettings {
  heroTitle: string;
  heroSubtitle: string;
  heroBannerImage: string;
  address: string;
  phone: string;
  email: string;
  hours: string;
  whatsappNumber: string;
  facebookUrl?: string;
  instagramUrl?: string;
  pinterestUrl?: string;
  linkedinUrl?: string;
  seoTitle: string;
  seoDescription: string;
  seoKeywords: string;
  stats?: Stats;
}

export interface CMSData {
  services: Service[];
  projects: Project[];
  blogs: Blog[];
  testimonials: Testimonial[];
  stats: Stats;
  enquiries: Enquiry[];
  quotes: QuoteRequest[];
  settings: SiteSettings;
}

export type Settings = SiteSettings;
