import { Service, Project, Blog, Testimonial, SiteSettings } from '../types';

export const defaultSettings: SiteSettings = {
  heroTitle: "We Build Your Dream",
  heroSubtitle: "Luxury Villa Construction with Engineering Precision.",
  heroBannerImage: "/src/assets/images/hero_villa_1784191464588.jpg",
  address: "No.16, 1st Street, Nehru Nagar, Ambattur, Chennai – 600053",
  phone: "+91 80721 63330",
  email: "lifehutdevelopers@gmail.com",
  hours: "Mon – Sat: 9:00 AM – 6:00 PM",
  whatsappNumber: "918072163330",
  instagramUrl: "https://www.instagram.com/lifehutdevelopers/",
  pinterestUrl: "https://in.pinterest.com/lifehutdevelopers",
  seoTitle: "Lifehut Developers | Luxury Residential Construction in Chennai",
  seoDescription: "Award-winning luxury residential builder in Chennai. Turnkey home construction, luxury villa execution, and premium engineering consultations since 2019.",
  seoKeywords: "luxury construction, villa builders chennai, turnkey residential construction, custom home building, Lifehut developers chennai",
  stats: {
    projectsDone: "120",
    experienceYears: "7",
    clientSatisfaction: "99",
    hiddenCharges: "0"
  }
};

export const defaultServices: Service[] = [
  {
    id: "turnkey-construction",
    title: "Turnkey House Construction",
    banner: "https://images.unsplash.com/photo-1541976590-713951a5a29d?q=80&w=1200&auto=format&fit=crop",
    description: "End-to-end luxury home building from structural layouts to interior styling. We handle all approvals, soil investigation, architectural blueprints, structural engineering, and master craftsmanship.",
    features: [
      "Soil investigation and structural stability certificate",
      "Architectural 2D blueprints & photorealistic 3D visualization",
      "Professional site supervision by certified civil engineers",
      "Premium materials from accredited brands with ISI markings",
      "Real-time progress reporting via dedicated mobile/Web updates",
      "10-Year structural warranty & 1-Year maintenance guarantee"
    ],
    gallery: [
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?q=80&w=800&auto=format&fit=crop"
    ],
    faqs: [
      { question: "What does Turnkey Construction include?", answer: "It includes every aspect of homebuilding: soil tests, architecture plans, structural drawings, government permits, civil works, electrical, plumbing, tiles, paint, doors, and hand-over." },
      { question: "How do you ensure material quality?", answer: "We follow a strictly documented quality assurance protocol. All materials are brand-audited (e.g. Ultratech, JSW, Finolex, Kajaria) and checked at every milestone." }
    ]
  },
  {
    id: "luxury-villa",
    title: "Luxury Villa Construction",
    banner: "https://images.unsplash.com/photo-1600585154526-990dced4db0d?q=80&w=1200&auto=format&fit=crop",
    description: "Tailored to NRI home builders and elite professionals. Immersive high-contrast modern facades, glass balustrades, double-height ceilings, and custom-designed open layouts.",
    features: [
      "Bespoke Italian marble / high-grade vitrified flooring",
      "Architectural blueprint with structural wind-load simulations",
      "Double-height living spaces & automated smart electrical options",
      "Premium bath fittings (Jaquar, Kohler or equivalent)",
      "Exquisite modern front-facade elevations in G+1 to G+3 formats",
      "Detailed landscape designing for lush green outdoor elements"
    ],
    gallery: [
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=800&auto=format&fit=crop"
    ],
    faqs: [
      { question: "Can we incorporate high-end customizations?", answer: "Yes, our luxury villa plan is highly customizable. You can request customized spatial layouts, home theater setups, smart automation, solar power grids, and high-end exterior panels." },
      { question: "Are NRIs able to track progress remotely?", answer: "Absolutely. We set up high-definition remote tracking and deliver weekly detailed photographic and video progress reports with structural checklist logs." }
    ]
  },
  {
    id: "engineering-consulting",
    title: "Engineering Consultation",
    banner: "https://images.unsplash.com/photo-1581094288338-2314dddb7ecc?q=80&w=1200&auto=format&fit=crop",
    description: "Expert analysis by registered structural engineers to evaluate foundations, concrete strengths, steel ratios, and soil bearing capacity to maximize stability.",
    features: [
      "Precision structural calculations & steel reinforcement schedules",
      "Government-registered engineers to stamp and validate structural blueprints",
      "Soil bearing capacity (SBC) analysis & core-cutting testing",
      "Cost optimization audits to reduce steel and cement waste safely",
      "Retaining wall and deep basement structural detailing"
    ],
    gallery: [
      "https://images.unsplash.com/photo-1504307651254-35680f356dfd?q=80&w=800&auto=format&fit=crop"
    ],
    faqs: [
      { question: "Why is soil investigation necessary?", answer: "The soil test determines the ultimate bearing strength of the earth beneath your structure, which guides the depth, size, and steel ratio of your concrete footings to prevent settling and structural cracks." }
    ]
  }
];

export const defaultProjects: Project[] = [
  {
    id: "meridian-residency",
    name: "Meridian Residency",
    heroImage: "/src/assets/images/meridian_residency_1784191484091.jpg",
    gallery: [
      "/src/assets/images/meridian_residency_1784191484091.jpg",
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=800&auto=format&fit=crop"
    ],
    completionDate: "2024-11",
    plotSize: "2,400 sq.ft",
    builtUpArea: "3,800 sq.ft",
    floors: 2,
    bedrooms: 4,
    budget: "90 Lakhs",
    location: "Ambattur, Chennai",
    clientTestimonial: "Lifehut Developers exceeded our expectations in every single way. The luxury duplex is structurally flawless, and the architectural planning was done in a very responsive manner.",
    clientName: "Mr. Mohanraj",
    clientAvatar: "MR",
    status: "Completed"
  },
  {
    id: "coastal-business-park",
    name: "Coastal Business Park",
    heroImage: "/src/assets/images/coastal_business_park_1784191501375.jpg",
    gallery: [
      "/src/assets/images/coastal_business_park_1784191501375.jpg",
      "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=800&auto=format&fit=crop"
    ],
    completionDate: "2023-08",
    plotSize: "18,400 sq.ft",
    builtUpArea: "42,000 sq.ft",
    floors: 5,
    bedrooms: 0,
    budget: "3.5 Crores",
    location: "Avadi, Chennai",
    clientTestimonial: "The commercial building shows great engineering strength and precision. Delivered on time despite heavy monsoon seasons.",
    clientName: "Mr. Gani Iqbal",
    clientAvatar: "GI",
    status: "Completed"
  },
  {
    id: "anchor-logistics-hub",
    name: "Anchor Logistics Hub",
    heroImage: "/src/assets/images/anchor_logistics_hub_1784191519342.jpg",
    gallery: [
      "/src/assets/images/anchor_logistics_hub_1784191519342.jpg"
    ],
    completionDate: "2025-02",
    plotSize: "40,000 sq.ft",
    builtUpArea: "35,000 sq.ft",
    floors: 1,
    bedrooms: 0,
    budget: "2.1 Crores",
    location: "Poonamallee, Chennai",
    clientTestimonial: "Extremely professional, well-engineered steel structure. They handled the deep SBC core tests and massive steel spans with outstanding expertise.",
    clientName: "Mr. Navin Kumar",
    clientAvatar: "NV",
    status: "Completed"
  }
];

export const defaultBlogs: Blog[] = [
  {
    id: "importance-of-soil-investigation",
    title: "Why Soil Investigation is Crucial Before Breaking Ground",
    slug: "importance-of-soil-investigation",
    featuredImage: "https://images.unsplash.com/photo-1541888946425-d81bb19240f5?q=80&w=800&auto=format&fit=crop",
    author: "Er. K. Vignesh (Chief Structural Consultant)",
    category: "Engineering first",
    tags: ["Foundation", "Soil Testing", "Chennai Soil", "SBC"],
    seoMeta: {
      title: "Importance of Soil investigation in Chennai Construction",
      description: "Learn why soil investigation (SBC) is vital before starting house construction to avoid structural settling and foundation cracking.",
      keywords: "soil test, SBC chennai, foundation design, home building"
    },
    content: `Building a home is a lifetime investment, and its stability rests entirely on the foundation. In Chennai's diverse terrain, from the sandy beaches of ECR to the clayey soil of Ambattur and marshy areas of Velachery, understanding the earth beneath your feet is non-negotiable.

### What is SBC?
Soil Bearing Capacity (SBC) measures the maximum pressure that the soil can support without failing or settling excessively. Without a proper SBC test, structural engineers are forced to make conservative assumptions. This can lead to either **over-engineering** (costing lakhs in unnecessary concrete and steel) or **under-engineering** (risking foundation settlement, structural cracks, and tilted floors).

### Our Scientific Approach at Lifehut Developers:
1. **Borehole Core Cutting**: Drilling to depths of up to 10 meters to extract earth profiles.
2. **Laboratory Testing**: Subjecting samples to dry density tests, direct shear tests, and moisture analysis.
3. **Foundation Customization**: Designing specific footing profiles (isolated footings, pile foundations, or raft slabs) matching the SBC report exactly.

Always insist on a soil investigation report before finalizing your construction budget!`,
    readingTime: "4 min read",
    readTime: "4 min read",
    date: "2026-06-15",
    comments: [
      { id: "c1", name: "Ramesh Sundar", date: "2026-06-16", text: "Very informative article! Most builders skip this and build generic foundations. Glad Lifehut takes this scientifically!" }
    ]
  },
  {
    id: "turnkey-vs-individual-contractors",
    title: "Turnkey Construction vs. Hiring Individual Subcontractors",
    slug: "turnkey-vs-individual-contractors",
    featuredImage: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?q=80&w=800&auto=format&fit=crop",
    author: "Er. Vignesh K (MD, Lifehut Developers)",
    category: "Homeowner Guide",
    tags: ["Turnkey", "Budgeting", "Contractors", "Chennai Homes"],
    seoMeta: {
      title: "Turnkey Construction vs Subcontractors Chennai",
      description: "Is turnkey construction better than individual contractors? Learn the pros, cons, and hidden cost differences for building in Chennai.",
      keywords: "turnkey builder chennai, house construction cost, civil contractor chennai"
    },
    content: `Many first-time home builders face the dilemma of whether to coordinate the construction themselves by hiring local masons, plumbers, and carpenters, or to hand the project over to a turnkey construction company.

### The True Cost of Self-Coordination
While individual contractors might seem cheaper on paper, managing a construction site requires extensive technical knowledge and around 1000 hours of physical oversight. Common pitfalls include:
- **Material Theft & Wastage**: Over-ordering steel or poorly mixed concrete.
- **Coordination Delays**: Plumbers arriving before electrical conduits are laid, leading to breaking newly built walls.
- **Price Escalations**: Unchecked rise in sand and steel prices that contractors pass directly to you.

### Why Turnkey Wins in Luxury Construction
With a Turnkey contract from **Lifehut Developers**, you sign a single document and receive absolute predictability:
- **Single Point of Responsibility**: No finger-pointing. We manage every engineer, mason, plumber, and decorator.
- **Detailed Specifications**: You get a legally-binding material matrix specifying brands, gauges, and dimensions.
- **On-Time Commitments**: Delays are bound by penalty clauses, ensuring we finish your home within the specified calendar days.

Save yourself from construction-induced stress and enjoy watching your dream home rise with professional project management!`,
    readingTime: "6 min read",
    readTime: "6 min read",
    date: "2026-07-01",
    comments: []
  }
];

export const defaultTestimonials: Testimonial[] = [
  {
    id: "t1",
    name: "Mr. Mohanraj",
    text: "Lifehut Developers delivered our home in Ambattur exactly as promised—on time and within budget. The quality of structural steel and concrete is top-notch, and they provided 3D views that made design selections effortless.",
    rating: 5,
    avatar: "MR",
    date: "2026-04-12",
    location: "Ambattur, Chennai"
  },
  {
    id: "t2",
    name: "Mr. Gani Iqbal",
    text: "I live abroad and built my villa in Avadi completely through Lifehut's remote project management setup. Their weekly mobile photo updates, daily construction log sheets, and complete transparency on material invoices gave me absolute peace of mind.",
    rating: 5,
    avatar: "GI",
    date: "2026-05-30",
    location: "Avadi, Chennai"
  }
];
