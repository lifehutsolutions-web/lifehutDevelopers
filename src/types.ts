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
  tags?: string[];
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

export interface RoomDimension {
  roomName: string;
  dimension: string;
  floor: string;
  vastuZone?: string;
}

export interface HousePlan {
  id: string;
  planCode: string;
  title: string;
  slug: string;
  floors: number;
  floorsLabel: string;
  bedrooms: number;
  bathrooms: number;
  builtUpArea: number;
  plotDimensions: string;
  buildingDimensions?: string;
  facing: 'East' | 'North' | 'South' | 'West';
  vastuCompliant: boolean;
  vastuScore?: string;
  vastuNotes?: string[];
  style: string;
  carParking: number;
  estimatedCostRange: string;
  costPerSqft?: string;
  elevationImage: string;
  floorPlanImage: string;
  galleryImages?: string[];
  description: string;
  roomDimensions: RoomDimension[];
  features: string[];
  // Full CAD & PDF Blueprint Package
  cadPackageZipUrl?: string;
  cadPackageFileName?: string;
  cadPackageSize?: string;
  cadPackagePrice?: number;
  cadPackageIncludes?: string[];
  cadPackageBase64?: string;
  seoMeta?: {
    title: string;
    description: string;
    keywords: string;
  };
  views?: number;
  purchaseCount?: number;
  isFeatured?: boolean;
  isActive?: boolean;
  createdAt?: string;
}

export interface HousePlanOrder {
  id: string;
  orderId?: string;
  transactionId?: string;
  planId: string;
  planCode: string;
  planTitle: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  amount: number;
  currency?: string;
  paymentMethod: 'Razorpay' | 'PhonePe' | 'Manual' | 'Free Claim' | 'UPI / Direct' | string;
  paymentStatus: 'Completed' | 'Pending' | 'Failed';
  deliveryStatus?: 'Delivered' | 'Pending Dispatch' | 'Follow-up Needed' | string;
  downloadToken?: string;
  downloadUrl?: string;
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  createdAt: string;
  notes?: string;
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
  youtubeUrl?: string;
  linkedinUrl?: string;
  seoTitle: string;
  seoDescription: string;
  seoKeywords: string;
  stats?: Stats;
  // Razorpay Gateway Settings
  razorpayKeyId?: string;
  razorpayKeySecret?: string;
  razorpayEnabled?: boolean;
  // Backward compatibility / optional
  phonepeMerchantId?: string;
  phonepeSaltKey?: string;
  phonepeSaltIndex?: string;
  phonepeMode?: string;
  phonepeEnabled?: boolean;
}

export interface CMSData {
  services: Service[];
  projects: Project[];
  blogs: Blog[];
  housePlans?: HousePlan[];
  testimonials: Testimonial[];
  stats: Stats;
  enquiries: Enquiry[];
  quotes: QuoteRequest[];
  settings: SiteSettings;
  orders?: HousePlanOrder[];
}

export type Settings = SiteSettings;
