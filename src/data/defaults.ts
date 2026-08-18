import { Service, Project, Blog, Testimonial, SiteSettings } from '../types';

export const defaultSettings: SiteSettings = {
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
  seoTitle: "Top Residential Building Construction Company in Chennai | Lifehut Developers",
  seoDescription: "Leading residential building construction company in Chennai specializing in luxury villas, turnkey house building, structural engineering, and transparent locked pricing.",
  seoKeywords: "residential building construction company, turnkey house builders chennai, luxury villa contractors, independent home construction, house construction cost per sqft chennai, civil engineers chennai",
  stats: {
    projectsDone: "120+",
    experienceYears: "7+",
    clientSatisfaction: "99%",
    hiddenCharges: "₹0"
  }
};

export const defaultServices: Service[] = [
  {
    id: "new-home-construction",
    title: "New Home Construction",
    banner: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=1200&auto=format&fit=crop",
    description: "We build your house from the ground up - Foundation, structure and finishing - to a design you approve at every step. From soil testing and architectural floor plans to turnkey key handover with zero surprise costs.",
    features: [
      "Custom 2D floor plans & photorealistic 3D front elevations",
      "Precision soil investigation (SBC) & engineered foundation design",
      "High-grade Fe 550 TMT steel & ISI-certified UltraTech cement",
      "Dedicated site supervision by qualified civil engineers",
      "Transparent milestone-based stages with live progress photo updates",
      "10-Year structural frame warranty & 1-Year maintenance guarantee"
    ],
    gallery: [
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?q=80&w=800&auto=format&fit=crop"
    ],
    faqs: [
      { question: "What is included in New Home Construction?", answer: "Our complete turnkey package includes soil investigation, architectural floor plans, structural RCC framing, brickwork, plastering, CPVC plumbing, electrical wiring, vitrified tiles, painting, and pre-handover cleaning." },
      { question: "How are design approvals handled during construction?", answer: "We follow a step-by-step approval workflow: 2D layouts and 3D elevations are reviewed and finalized with you before breaking ground, and interior finishes/tile selections are approved by you prior to installation." }
    ]
  },
  {
    id: "renovation-remodeling",
    title: "Renovation & Remodeling",
    banner: "https://images.unsplash.com/photo-1513694203232-719a280e022f?q=80&w=1200&auto=format&fit=crop",
    description: "Give an older home a fresh layout, better light and modern finishes, without disturbing the parts you love. We upgrade electrical, plumbing, walls, and aesthetics while preserving structural stability.",
    features: [
      "Structural health audit & load-bearing wall assessment",
      "Modern layout reconfiguration for enhanced natural light & air circulation",
      "Complete electrical re-wiring & concealed CPVC plumbing replacement",
      "Modular kitchen redesign & luxury bathroom upgrades",
      "Waterproofing, crack treatment & exterior facade rejuvenation",
      "Non-invasive phased execution to minimize daily disruptions"
    ],
    gallery: [
      "https://images.unsplash.com/photo-1513694203232-719a280e022f?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1581858726788-75bc0f6a952d?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1503387762-592deb58ef4e?q=80&w=800&auto=format&fit=crop"
    ],
    faqs: [
      { question: "Can we live in the house while renovation is underway?", answer: "Yes, for partial remodeling projects we can phase the work room-by-room to minimize inconvenience. For full gut renovations, we establish clear timelines to ensure quick turnaround." },
      { question: "How do you ensure structural safety during wall demolition?", answer: "Our structural civil engineers inspect existing beams and columns to verify which walls are non-load-bearing partitions before making any layout adjustments." }
    ]
  },
  {
    id: "commercial-spaces",
    title: "Commercial Spaces",
    banner: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=1200&auto=format&fit=crop",
    description: "Shops, offices, warehouses and factory buildings, built to be practical, durable and ready on schedule. Robust engineering, efficient floorplates, and fast-track execution.",
    features: [
      "Heavy-duty industrial flooring & high-load structural slabs",
      "Pre-engineered building (PEB) & long-span warehouse structures",
      "Compliant fire-safety, HVAC, MEP & commercial power grids",
      "Optimized retail shopfronts & modern corporate office layouts",
      "Fast-track project scheduling to avoid business downtime",
      "Full local body compliance, plan sanctions & NOC documentation"
    ],
    gallery: [
      "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?q=80&w=800&auto=format&fit=crop"
    ],
    faqs: [
      { question: "What commercial building formats do you undertake?", answer: "We construct retail stores, multi-storey corporate office blocks, light manufacturing factory buildings, logistics warehouses, and commercial rental complexes." },
      { question: "How do you manage strict commercial handover deadlines?", answer: "We deploy dedicated site supervisors, synchronized trade schedules (civil, electrical, HVAC), and advance material procurement to ensure on-time delivery." }
    ]
  },
  {
    id: "pre-contract-services",
    title: "Pre-Contract Services",
    banner: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?q=80&w=1200&auto=format&fit=crop",
    description: "Build a strong project foundation - Estimation, BOQ, tender documents and technical support - before the contract begins. Eliminate budget ambiguities and ensure contractual clarity.",
    features: [
      "Comprehensive project cost estimation & budget feasibility reports",
      "Itemized Bill of Quantities (BOQ) with accurate rate analysis",
      "Tender document formulation & technical specification drafting",
      "Contract conditions, milestone schedules & payment terms advisory",
      "Site survey vetting & statutory approval documentation support",
      "Value engineering to optimize material and structural costs"
    ],
    gallery: [
      "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1581094288338-2314dddb7ecc?q=80&w=800&auto=format&fit=crop"
    ],
    faqs: [
      { question: "Why are Pre-Contract Services critical for a project?", answer: "Pre-contract preparation ensures accurate cost estimates, watertight tender documentation, and an itemized BOQ, eliminating scope creep and financial disputes later in the build." },
      { question: "Who benefits from Pre-Contract Services?", answer: "Individual land owners, property developers, government contractors, and commercial investors looking for verified BOQs and tender estimation." }
    ]
  },
  {
    id: "post-contract-services",
    title: "Post-Contract Services",
    banner: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?q=80&w=1200&auto=format&fit=crop",
    description: "Keep the project moving smoothly - Billing, documentation, quantity verification and technical support - throughout execution. Protect your project timeline and financial transparency.",
    features: [
      "Running Account (RA) bill scrutiny, measurement & certification",
      "On-site quantity takeoff & material reconciliation verification",
      "Variation & change order validation against original contract BOQ",
      "Quality compliance audits against technical specifications",
      "Milestone documentation, snag lists & handover sign-off",
      "Final bill settlement & contract closeout support"
    ],
    gallery: [
      "https://images.unsplash.com/photo-1504307651254-35680f356dfd?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1581092335397-9583fe92d232?q=80&w=800&auto=format&fit=crop"
    ],
    faqs: [
      { question: "How does Post-Contract quantity verification protect the client?", answer: "We cross-verify actual site measurements against billed quantities, preventing over-billing, validating rate variations, and ensuring you only pay for verified work." },
      { question: "What technical support is provided during execution?", answer: "We handle change order assessments, contractor query clarifications, milestone tracking, and quality assurance audits at critical concrete and structural stages." }
    ]
  },
  {
    id: "e-tender-services",
    title: "E-Tender Services",
    banner: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=1200&auto=format&fit=crop",
    description: "Pursue the right tenders with confidence - From tender identification and documentation to online submission and technical support. Win competitive bids with expert engineering backing.",
    features: [
      "Government & private e-tender identification (GeM, CPWD, PWD, NHAI)",
      "Tender document review, eligibility criteria & PQ analysis",
      "Technical bid compilation, compliance sheets & capability dossiers",
      "Financial bid estimation, rate analysis & BOQ quote preparation",
      "Digital signature certificate (DSC) encryption & error-free online submission",
      "Post-bid technical query resolution & reverse auction support"
    ],
    gallery: [
      "https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1551836022-d5d88e9218df?q=80&w=800&auto=format&fit=crop"
    ],
    faqs: [
      { question: "Which e-tender portals do you support?", answer: "We assist with state and central e-procurement portals, Central Public Procurement Portal (CPPP), GeM (Government e-Marketplace), PWD, MES, Railways, and private commercial tenders." },
      { question: "How do you help contractors qualify technically?", answer: "We evaluate the technical qualification criteria, draft method statements, compile machinery/manpower certificates, and structure the bid documentation to ensure zero disqualifications." }
    ]
  }
];

export const defaultProjects: Project[] = [
  {
    id: "meridian-residency",
    name: "The Meridian Luxury Villa",
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
    budget: "₹85 Lakhs",
    location: "Ambattur, Chennai",
    clientTestimonial: "Lifehut Developers is the best residential building construction company in Chennai. They completed our 4BHK luxury duplex villa on schedule with zero cost overruns.",
    clientName: "Mr. Mohanraj",
    clientAvatar: "MR",
    status: "Completed"
  },
  {
    id: "keelkattalai-duplex-residence",
    name: "Keelkattalai Contemporary Duplex",
    heroImage: "/src/assets/images/coastal_business_park_1784191501375.jpg",
    gallery: [
      "/src/assets/images/coastal_business_park_1784191501375.jpg",
      "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=800&auto=format&fit=crop"
    ],
    completionDate: "2024-03",
    plotSize: "1,800 sq.ft",
    builtUpArea: "3,200 sq.ft",
    floors: 2,
    bedrooms: 4,
    budget: "₹72 Lakhs",
    location: "Keelkattalai, Chennai",
    clientTestimonial: "Outstanding structural workmanship and complete material transparency. The 3D elevation looks even better in real life than the digital mockup!",
    clientName: "Mr. Gani Iqbal",
    clientAvatar: "GI",
    status: "Completed"
  },
  {
    id: "omr-independent-house",
    name: "OMR Smart Residential Home",
    heroImage: "/src/assets/images/anchor_logistics_hub_1784191519342.jpg",
    gallery: [
      "/src/assets/images/anchor_logistics_hub_1784191519342.jpg"
    ],
    completionDate: "2025-02",
    plotSize: "3,000 sq.ft",
    builtUpArea: "4,500 sq.ft",
    floors: 3,
    bedrooms: 5,
    budget: "₹1.15 Crores",
    location: "OMR, Chennai",
    clientTestimonial: "Extremely professional civil engineering team. Their meticulous structural engineering and foundation planning ensured complete stability for our multi-floor residence.",
    clientName: "Mr. Navin Kumar",
    clientAvatar: "NV",
    status: "Completed"
  }
];

export const defaultBlogs: Blog[] = [
  {
    id: "structural-foundation-guidelines",
    title: "Essential Structural & Foundation Guidelines for Residential House Construction in Chennai",
    slug: "structural-foundation-guidelines",
    featuredImage: "https://images.unsplash.com/photo-1541888946425-d81bb19240f5?q=80&w=800&auto=format&fit=crop",
    author: "Er. Vignesh K (Chief Structural Engineer)",
    category: "Engineering first",
    tags: ["Foundation Design", "Structural Engineering", "Chennai House Construction", "RCC Framing"],
    seoMeta: {
      title: "Structural & Foundation Design in Residential Construction | Lifehut Developers",
      description: "Learn key structural engineering and foundation design standards for building durable, crack-free residential homes in Chennai.",
      keywords: "residential foundation design, house construction company chennai, RCC structural frame, concrete footing chennai"
    },
    content: `Building a home is a lifetime investment, and its long-term structural stability rests entirely on engineering precision and high-grade materials. Across Chennai's residential corridors, implementing standardized structural practices is essential for lasting durability.

### Core Elements of Foundation Stability:
A solid foundation distributes structural loads evenly across the building footprint. Key parameters include:
- **Footing Depth & Sizing**: Sizing isolated or combined footings according to structural load schedules and number of floors.
- **High-Yield Reinforcement Steel**: Utilizing primary Fe 550D TMT rebars for column cages, plinth beams, and lintels.
- **Engineered Concrete Mixes**: Controlled M20/M25 grade ready-mix or on-site machine-batched concrete with optimal water-cement ratio.

### Lifehut Developers' 3-Step Construction Protocol:
1. **Site Leveling & Layout Marking**: Precision optical marking of column grid coordinates before excavation.
2. **Reinforced Steel Cage Binding & Shuttering**: Waterproof shuttering plywood with clear cover block spacers.
3. **Monolithic Concrete Pour & Rigorous Curing**: Machine vibration for zero honeycombing and minimum 14-day water curing.

Always insist on certified structural drawings and brand-verified materials before commencing your residential construction project!`,
    readingTime: "5 min read",
    readTime: "5 min read",
    date: "2026-06-15",
    comments: [
      { id: "c1", name: "Ramesh Sundar", date: "2026-06-16", text: "Crucial guide! Quality materials and proper curing are vital. Impressed by Lifehut's engineering-first methodology." }
    ]
  },
  {
    id: "turnkey-vs-individual-contractors",
    title: "Turnkey House Construction vs. Hiring Subcontractors in Chennai: Cost Breakdown",
    slug: "turnkey-vs-individual-contractors",
    featuredImage: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?q=80&w=800&auto=format&fit=crop",
    author: "Er. Vignesh K (MD, Lifehut Developers)",
    category: "Homeowner Guide",
    tags: ["Turnkey Construction", "House Construction Cost", "Chennai Builders", "Budgeting"],
    seoMeta: {
      title: "Turnkey House Construction vs Subcontractors in Chennai | Cost Comparison",
      description: "Comparing turnkey residential building construction vs hiring individual masons in Chennai. Learn key cost differences, quality checks, and timeline guarantees.",
      keywords: "turnkey house construction chennai, house construction cost per sqft, residential builder chennai"
    },
    content: `When planning residential building construction, homeowners face a major choice: manage individual contractors (masons, plumbers, electricians) or hire a reputable turnkey residential construction company.

### The Hidden Costs of Self-Managing House Construction
While hiring local masons appears cheaper initially, self-coordination requires over 800 hours of site supervision and technical expertise. Common risks include:
- **Material Theft & Wastage**: Excess ordering or improper concrete mixing ratios.
- **Project Delays**: Uncoordinated scheduling leading to wall damage when installing electrical pipes late.
- **Price Inflation**: Raw material price surges passed directly to the owner.

### Advantages of a Turnkey Construction Agreement
Partnering with **Lifehut Developers** guarantees absolute clarity:
- **Single Point of Responsibility**: Dedicated civil engineers manage every phase.
- **Locked Per-Sqft Cost**: Fixed contract pricing protects you against cement and steel price spikes.
- **Transparent Material Specifications**: Clear documentation detailing brands (UltraTech, JSW, Finolex, Kajaria).
- **On-Time Milestone Delivery**: Bound by schedule commitments and formal handovers.

Build your dream home with peace of mind by choosing a certified residential building construction company!`,
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
    text: "Lifehut Developers is hands-down the top residential building construction company in Chennai. Delivered our 4BHK duplex villa in Ambattur on schedule with zero hidden charges and top-quality structural execution.",
    rating: 5,
    avatar: "MR",
    date: "2026-04-12",
    location: "Ambattur, Chennai"
  },
  {
    id: "t2",
    name: "Mr. Gani Iqbal",
    text: "As an NRI, building our villa in Keelkattalai felt effortless with Lifehut. Their weekly HD video progress reports, material invoice audits, and engineering transparency gave us 100% peace of mind.",
    rating: 5,
    avatar: "GI",
    date: "2026-05-30",
    location: "Keelkattalai, Chennai"
  }
];

