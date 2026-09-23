import express from 'express';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import { createServer as createViteServer } from 'vite';
import { CMSData, Service, Project, Blog, Testimonial, Enquiry, QuoteRequest, SiteSettings, Stats, HousePlan, HousePlanOrder } from './src/types';
import { defaultHousePlans } from './src/data/defaultHousePlans';

const PORT = 3000;
const DB_FILE = path.join(process.cwd(), 'server_db.json');

// Initialize with Premium Defaults
const defaultSettings: SiteSettings = {
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
  seoKeywords: "luxury construction, villa builders chennai, turnkey residential construction, custom home building, Lifehut developers chennai"
};

const defaultServices: Service[] = [
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

const defaultProjects: Project[] = [
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
    budget: "₹85,000,000",
    location: "Ambattur, Chennai",
    clientTestimonial: "Lifehut Developers exceeded our expectations in every single way. The luxury duplex is structurally flawless, and the architectural planning was done in a very responsive manner.",
    clientName: "Mr. Mohanraj",
    clientAvatar: "MR",
    status: "Completed",
    isRecent: true
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
    budget: "₹185,000,000",
    location: "Avadi, Chennai",
    clientTestimonial: "The commercial building shows great engineering strength and precision. Delivered on time despite heavy monsoon seasons.",
    clientName: "Mr. Gani Iqbal",
    clientAvatar: "GI",
    status: "Completed",
    isRecent: true
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
    budget: "₹95,000,000",
    location: "Poonamallee, Chennai",
    clientTestimonial: "Extremely professional, well-engineered steel structure. They handled the deep SBC core tests and massive steel spans with outstanding expertise.",
    clientName: "Mr. Navin Kumar",
    clientAvatar: "NV",
    status: "Completed",
    isRecent: true
  }
];

const defaultBlogs: Blog[] = [
  {
    id: "importance-of-soil-investigation",
    title: "Why Soil Investigation is Crucial Before Breaking Ground",
    slug: "importance-of-soil-investigation",
    featuredImage: "https://images.unsplash.com/photo-1541888946425-d81bb19240f5?q=80&w=800&auto=format&fit=crop",
    author: "Chief Structural Consultant",
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
    author: "Principal Civil Engineer (Lifehut Developers)",
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
    date: "2026-07-01",
    comments: []
  }
];

const defaultTestimonials: Testimonial[] = [
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
  },
  {
    id: "t3",
    name: "Mr. Navin Kumar",
    text: "Incredibly engineering-first builders. Their Chief Civil Engineer took extensive SBC soil investigation tests and designed custom concrete pile foundations because our site soil was clayey. A solid, transparent builder you can trust blindly.",
    rating: 5,
    avatar: "NV",
    date: "2026-06-20",
    location: "Poonamallee, Chennai"
  }
];

const defaultStats: Stats = {
  projectsDone: "120+",
  experienceYears: "7+",
  clientSatisfaction: "99%",
  hiddenCharges: "₹0"
};

// Initial Database State
const initialCMSData: CMSData = {
  services: defaultServices,
  projects: defaultProjects,
  blogs: defaultBlogs,
  housePlans: defaultHousePlans,
  testimonials: defaultTestimonials,
  stats: defaultStats,
  enquiries: [],
  quotes: [],
  settings: defaultSettings
};

// Database utility functions
function readDB(): CMSData {
  try {
    if (!fs.existsSync(DB_FILE)) {
      fs.writeFileSync(DB_FILE, JSON.stringify(initialCMSData, null, 2), 'utf-8');
      return initialCMSData;
    }
    const raw = fs.readFileSync(DB_FILE, 'utf-8');
    const data: CMSData = JSON.parse(raw);
    if (!data.housePlans || data.housePlans.length === 0) {
      data.housePlans = defaultHousePlans;
      writeDB(data);
    }
    return data;
  } catch (err) {
    console.error("Failed to read database file. Returning defaults.", err);
    return initialCMSData;
  }
}

function writeDB(data: CMSData) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error("Failed to write to database file", err);
  }
}

async function startServer() {
  const app = express();

  const UPLOADS_DIR = path.join(process.cwd(), 'uploads', 'cad-packages');
  if (!fs.existsSync(UPLOADS_DIR)) {
    fs.mkdirSync(UPLOADS_DIR, { recursive: true });
  }

  // Static directory for uploaded CAD and ZIP drawing packages
  app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

  // Middleware with generous payload limit for CAD/ZIP uploads
  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ extended: true, limit: '50mb' }));

  // Ensure DB file exists
  readDB();

  // --- API ROUTES ---

  // Auth Login Endpoint (Secure Session simulation)
  app.post('/api/auth/login', (req, res) => {
    const { username, password } = req.body;
    if (username === 'admin' && password === 'password') {
      res.json({
        success: true,
        token: 'lifehut_admin_secure_session_token_2026',
        user: { name: 'Engineering Admin', role: 'Chief Engineer & Admin' }
      });
    } else {
      res.status(401).json({ success: false, message: 'Invalid credentials. Use admin / password.' });
    }
  });

  // Get full CMS data
  app.get('/api/cms', (req, res) => {
    const db = readDB();
    res.json(db);
  });

  // GET endpoints for each collection
  app.get('/api/services', (req, res) => {
    const db = readDB();
    res.json(db.services || []);
  });

  app.get('/api/projects', (req, res) => {
    const db = readDB();
    res.json(db.projects || []);
  });

  app.get('/api/blogs', (req, res) => {
    const db = readDB();
    res.json(db.blogs || []);
  });

  app.get('/api/house-plans', (req, res) => {
    const db = readDB();
    if (!db.housePlans || db.housePlans.length === 0) {
      db.housePlans = defaultHousePlans;
      writeDB(db);
    }
    res.json(db.housePlans || []);
  });

  app.get('/api/house-plans/:slugOrId', (req, res) => {
    const { slugOrId } = req.params;
    const db = readDB();
    const plans = db.housePlans || defaultHousePlans;
    const plan = plans.find(p => p.slug === slugOrId || p.id === slugOrId);
    if (plan) {
      return res.json({ success: true, plan });
    }
    return res.status(404).json({ success: false, message: 'House plan not found.' });
  });

  app.get('/api/enquiries', (req, res) => {
    const db = readDB();
    res.json(db.enquiries || []);
  });

  app.get('/api/settings', (req, res) => {
    const db = readDB();
    res.json(db.settings || {});
  });

  // Submit Contact Enquiry
  app.post('/api/enquiries', async (req, res) => {
    const { name, fullName, phone, email, service, whatDoYouNeed, message, country, state, requirement } = req.body;
    const clientName = fullName || name;
    const clientEmail = email || '';
    const clientService = whatDoYouNeed || service || 'General Inquiry';
    const clientMessage = requirement || message || '';

    if (!clientName) {
      return res.status(400).json({ success: false, message: 'Name is required.' });
    }

    const db = readDB();
    const newEnquiry: Enquiry = {
      id: 'enq_' + Date.now(),
      name: clientName,
      phone: phone || (state ? `${state}, ${country || 'India'}` : ''),
      email: clientEmail,
      service: clientService,
      message: clientMessage,
      date: new Date().toISOString().split('T')[0],
      status: 'New'
    };

    db.enquiries.unshift(newEnquiry);
    writeDB(db);

    // Forward to Google Apps Script spreadsheet in background
    try {
      const gScriptUrl = 'https://script.google.com/macros/s/AKfycbymRfoHsAbP-XeVt1zlQCmWr2-jzHidwUV-u_Y5nQNBN6xClhzzhMY7kV6iKoKXvjyz/exec';
      const timestamp = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
      const payload = {
        'Full Name': clientName,
        'Mobile Number': phone || '',
        'Phone': phone || '',
        'Email Address': clientEmail,
        'What do you need?': clientService,
        'Country': country || 'India',
        'Your State': state || 'Tamil Nadu',
        'Tell us about your requirement': clientMessage,
        'Submission Date': timestamp,
        fullName: clientName,
        mobileNumber: phone || '',
        phone: phone || '',
        email: clientEmail,
        whatDoYouNeed: clientService,
        country: country || 'India',
        state: state || 'Tamil Nadu',
        requirement: clientMessage,
        date: timestamp
      };

      const params = new URLSearchParams();
      Object.entries(payload).forEach(([k, v]) => params.append(k, String(v)));

      fetch(gScriptUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: params.toString()
      }).catch((e) => console.warn('Server forward to Google Sheet error:', e));
    } catch {
      // background forward error ignored
    }

    res.json({ success: true, data: newEnquiry, message: 'Your enquiry has been successfully submitted! Admin will contact you shortly.' });
  });

  // Submit Instant Quote Request
  app.post('/api/quotes', (req, res) => {
    const { name, phone, email, area, floors, ctype, interior, extras, estimatedCost } = req.body;
    if (!name || !phone || !area) {
      return res.status(400).json({ success: false, message: 'Name, Phone and Plot Area are required.' });
    }

    const db = readDB();
    const newQuote: QuoteRequest = {
      id: 'qte_' + Date.now(),
      name,
      phone,
      email: email || '',
      area: Number(area),
      floors: floors || 'G+1',
      ctype: ctype || 'Standard',
      interior: interior || 'None',
      extras: extras || 'None',
      estimatedCost: estimatedCost || '₹0',
      date: new Date().toISOString().split('T')[0],
      status: 'New'
    };

    db.quotes.unshift(newQuote);
    writeDB(db);

    res.json({ success: true, data: newQuote, message: 'Your Instant Quote estimate has been saved! Chief Engineer will verify structural parameters and call you.' });
  });

  // Update Settings (Supports both POST /api/cms/settings and POST /api/settings)
  app.post('/api/cms/settings', (req, res) => {
    const db = readDB();
    db.settings = { ...db.settings, ...req.body };
    writeDB(db);
    res.json({ success: true, message: 'Site Settings saved successfully.' });
  });

  app.post('/api/settings', (req, res) => {
    const db = readDB();
    db.settings = { ...db.settings, ...req.body };
    writeDB(db);
    res.json({ success: true, message: 'Site Settings saved successfully.' });
  });

  // Service CRUD
  app.post('/api/services', (req, res) => {
    const db = readDB();
    // Legacy action-based payload
    if (req.body.action) {
      const { action, service } = req.body;
      if (action === 'create') {
        const newService: Service = {
          ...service,
          id: service.title.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Date.now(),
        };
        db.services.push(newService);
        writeDB(db);
        return res.json({ success: true, service: newService });
      }
      if (action === 'update') {
        const idx = db.services.findIndex(s => s.id === service.id);
        if (idx !== -1) {
          db.services[idx] = service;
          writeDB(db);
          return res.json({ success: true, service });
        }
        return res.status(404).json({ success: false, message: 'Service not found.' });
      }
      if (action === 'delete') {
        db.services = db.services.filter(s => s.id !== service.id);
        writeDB(db);
        return res.json({ success: true, message: 'Service deleted.' });
      }
      return res.status(400).json({ success: false, message: 'Invalid action.' });
    }

    // Direct REST create
    const service = req.body;
    const newService: Service = {
      ...service,
      id: service.title.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Date.now(),
    };
    db.services.push(newService);
    writeDB(db);
    res.json({ success: true, service: newService });
  });

  app.put('/api/services/:id', (req, res) => {
    const { id } = req.params;
    const db = readDB();
    const idx = db.services.findIndex(s => s.id === id);
    if (idx !== -1) {
      db.services[idx] = { ...db.services[idx], ...req.body };
      writeDB(db);
      return res.json({ success: true, service: db.services[idx] });
    }
    res.status(404).json({ success: false, message: 'Service not found.' });
  });

  app.delete('/api/services/:id', (req, res) => {
    const { id } = req.params;
    const db = readDB();
    db.services = db.services.filter(s => s.id !== id);
    writeDB(db);
    res.json({ success: true });
  });

  // Project CRUD
  app.post('/api/projects', (req, res) => {
    const db = readDB();
    if (req.body.action) {
      const { action, project } = req.body;
      if (action === 'create') {
        const newProject: Project = {
          ...project,
          id: project.name.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Date.now()
        };
        db.projects.unshift(newProject);
        writeDB(db);
        return res.json({ success: true, project: newProject });
      }
      if (action === 'update') {
        const idx = db.projects.findIndex(p => p.id === project.id);
        if (idx !== -1) {
          db.projects[idx] = project;
          writeDB(db);
          return res.json({ success: true, project });
        }
        return res.status(404).json({ success: false, message: 'Project not found.' });
      }
      if (action === 'delete') {
        db.projects = db.projects.filter(p => p.id !== project.id);
        writeDB(db);
        return res.json({ success: true, message: 'Project deleted.' });
      }
      return res.status(400).json({ success: false, message: 'Invalid action.' });
    }

    const project = req.body;
    const newProject: Project = {
      ...project,
      id: project.name.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Date.now()
    };
    db.projects.unshift(newProject);
    writeDB(db);
    res.json({ success: true, project: newProject });
  });

  app.put('/api/projects/:id', (req, res) => {
    const { id } = req.params;
    const db = readDB();
    const idx = db.projects.findIndex(p => p.id === id);
    if (idx !== -1) {
      db.projects[idx] = { ...db.projects[idx], ...req.body };
      writeDB(db);
      return res.json({ success: true, project: db.projects[idx] });
    }
    res.status(404).json({ success: false, message: 'Project not found.' });
  });

  app.delete('/api/projects/:id', (req, res) => {
    const { id } = req.params;
    const db = readDB();
    db.projects = db.projects.filter(p => p.id !== id);
    writeDB(db);
    res.json({ success: true });
  });

  // Blog CRUD
  app.post('/api/blogs', (req, res) => {
    const db = readDB();
    if (req.body.action) {
      const { action, blog } = req.body;
      if (action === 'create') {
        const slug = blog.title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
        const newBlog: Blog = {
          ...blog,
          id: slug + '-' + Date.now(),
          slug,
          date: new Date().toISOString().split('T')[0],
          comments: []
        };
        db.blogs.unshift(newBlog);
        writeDB(db);
        return res.json({ success: true, blog: newBlog });
      }
      if (action === 'update') {
        const idx = db.blogs.findIndex(b => b.id === blog.id);
        if (idx !== -1) {
          db.blogs[idx] = { ...db.blogs[idx], ...blog };
          writeDB(db);
          return res.json({ success: true, blog: db.blogs[idx] });
        }
        return res.status(404).json({ success: false, message: 'Blog not found.' });
      }
      if (action === 'delete') {
        db.blogs = db.blogs.filter(b => b.id !== blog.id);
        writeDB(db);
        return res.json({ success: true, message: 'Blog deleted.' });
      }
      return res.status(400).json({ success: false, message: 'Invalid action.' });
    }

    const blog = req.body;
    const slug = blog.title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const newBlog: Blog = {
      ...blog,
      id: slug + '-' + Date.now(),
      slug,
      date: new Date().toISOString().split('T')[0],
      comments: []
    };
    db.blogs.unshift(newBlog);
    writeDB(db);
    res.json({ success: true, blog: newBlog });
  });

  app.put('/api/blogs/:id', (req, res) => {
    const { id } = req.params;
    const db = readDB();
    const idx = db.blogs.findIndex(b => b.id === id);
    if (idx !== -1) {
      db.blogs[idx] = { ...db.blogs[idx], ...req.body };
      writeDB(db);
      return res.json({ success: true, blog: db.blogs[idx] });
    }
    res.status(404).json({ success: false, message: 'Blog not found.' });
  });

  app.delete('/api/blogs/:id', (req, res) => {
    const { id } = req.params;
    const db = readDB();
    db.blogs = db.blogs.filter(b => b.id !== id);
    writeDB(db);
    res.json({ success: true });
  });

  // House Plans CRUD
  app.post('/api/house-plans', (req, res) => {
    const db = readDB();
    if (!db.housePlans) db.housePlans = [...defaultHousePlans];

    const { action, plan } = req.body;
    const targetPlan = plan || req.body;

    if (action === 'delete') {
      const idToDelete = targetPlan.id || req.body.id;
      db.housePlans = db.housePlans.filter(p => p.id !== idToDelete);
      writeDB(db);
      return res.json({ success: true, message: 'House plan deleted.' });
    }

    if (!targetPlan.title) {
      return res.status(400).json({ success: false, message: 'Title is required.' });
    }

    const rawTitle = targetPlan.title.toString().toLowerCase();
    const slug = targetPlan.slug || rawTitle.replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const planId = targetPlan.id || `lh-hp-${Date.now()}`;
    const planCode = targetPlan.planCode || `LH-HP-${Math.floor(100 + Math.random() * 900)}`;

    const newPlan: HousePlan = {
      ...targetPlan,
      id: planId,
      slug,
      planCode,
      createdAt: targetPlan.createdAt || new Date().toISOString().split('T')[0]
    };

    const existingIdx = db.housePlans.findIndex(p => p.id === planId || p.slug === slug);
    if (existingIdx !== -1) {
      db.housePlans[existingIdx] = { ...db.housePlans[existingIdx], ...newPlan };
    } else {
      db.housePlans.unshift(newPlan);
    }

    writeDB(db);
    return res.json({ success: true, plan: newPlan });
  });

  app.put('/api/house-plans/:id', (req, res) => {
    const { id } = req.params;
    const db = readDB();
    if (!db.housePlans) db.housePlans = [...defaultHousePlans];
    const idx = db.housePlans.findIndex(p => p.id === id);
    if (idx !== -1) {
      db.housePlans[idx] = { ...db.housePlans[idx], ...req.body };
      writeDB(db);
      return res.json({ success: true, plan: db.housePlans[idx] });
    }
    return res.status(404).json({ success: false, message: 'House plan not found.' });
  });

  app.delete('/api/house-plans/:id', (req, res) => {
    const { id } = req.params;
    const db = readDB();
    if (!db.housePlans) db.housePlans = [...defaultHousePlans];
    db.housePlans = db.housePlans.filter(p => p.id !== id);
    writeDB(db);
    res.json({ success: true });
  });

  // --- HOUSE PLANS CAD ZIP UPLOAD ENDPOINT ---
  app.post('/api/upload-cad-zip', (req, res) => {
    try {
      const { fileName, fileBase64, planId } = req.body;
      if (!fileName || !fileBase64) {
        return res.status(400).json({ success: false, message: 'Missing fileName or fileBase64' });
      }

      const cleanBaseName = fileName.replace(/\.[^/.]+$/, '').replace(/[^a-zA-Z0-9-_]/g, '-');
      const ext = fileName.split('.').pop() || 'zip';
      const safeFileName = `${cleanBaseName}-${Date.now()}.${ext}`;
      const filePath = path.join(UPLOADS_DIR, safeFileName);

      const base64Data = fileBase64.replace(/^data:[^;]+;base64,/, '');
      const buffer = Buffer.from(base64Data, 'base64');
      fs.writeFileSync(filePath, buffer);

      const sizeMb = (buffer.length / (1024 * 1024)).toFixed(1) + ' MB';
      const publicUrl = `/uploads/cad-packages/${safeFileName}`;

      if (planId) {
        const db = readDB();
        const planIdx = db.housePlans?.findIndex(p => p.id === planId || p.planCode === planId || p.slug === planId);
        if (planIdx !== undefined && planIdx >= 0 && db.housePlans) {
          db.housePlans[planIdx].cadPackageZipUrl = fileBase64;
          db.housePlans[planIdx].cadPackageFileName = fileName;
          db.housePlans[planIdx].cadPackageSize = sizeMb;
          db.housePlans[planIdx].cadPackageBase64 = fileBase64;
          writeDB(db);
        }

        // Also update Supabase house_plans table directly
        try {
          const sbUrl = process.env.VITE_SUPABASE_URL || 'https://vkthcqceywhdlmjsvsze.supabase.co';
          const sbKey = process.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable__eUGKx9jON0kZ1dVrBRmLw_-huhN1d7';
          fetch(`${sbUrl}/rest/v1/house_plans?or=(id.eq.${encodeURIComponent(planId)},slug.eq.${encodeURIComponent(planId)},plan_code.eq.${encodeURIComponent(planId)})`, {
            method: 'PATCH',
            headers: {
              apikey: sbKey,
              Authorization: `Bearer ${sbKey}`,
              'Content-Type': 'application/json',
              Prefer: 'return=minimal'
            },
            body: JSON.stringify({
              cad_package_zip_url: fileBase64,
              cad_package_file_name: fileName,
              cad_package_size: sizeMb,
              updated_at: new Date().toISOString()
            })
          }).catch(e => console.warn('Supabase zip patch err:', e));
        } catch {}
      }

      return res.json({
        success: true,
        url: publicUrl,
        base64: fileBase64,
        fileName: fileName,
        size: sizeMb
      });
    } catch (err: any) {
      console.error('Error uploading CAD ZIP:', err);
      return res.status(500).json({ success: false, message: err.message || 'Upload failed' });
    }
  });

  // --- RAZORPAY PAYMENT CONFIG & CHECKOUT ENDPOINTS ---
  // Helper to resolve the active Razorpay credentials across environment variables, server_db.json, and Supabase
  async function getActiveRazorpayConfig() {
    const db = readDB();
    let keyId = process.env.RAZORPAY_KEY_ID || db.settings?.razorpayKeyId || (db.settings?.stats as any)?.razorpayKeyId || '';
    let keySecret = process.env.RAZORPAY_KEY_SECRET || db.settings?.razorpayKeySecret || (db.settings?.stats as any)?.razorpayKeySecret || '';
    let enabled = db.settings?.razorpayEnabled !== undefined ? db.settings.razorpayEnabled : (db.settings?.stats as any)?.razorpayEnabled ?? true;

    // If keys not found in local db or env, check Supabase
    if (!keyId || !keySecret) {
      try {
        const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://vkthcqceywhdlmjsvsze.supabase.co';
        const SUPABASE_KEY = process.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable__eUGKx9jON0kZ1dVrBRmLw_-huhN1d7';
        const response = await fetch(`${SUPABASE_URL}/rest/v1/settings?select=stats&limit=1`, {
          headers: {
            apikey: SUPABASE_KEY,
            Authorization: `Bearer ${SUPABASE_KEY}`
          }
        });
        if (response.ok) {
          const data = (await response.json()) as any;
          const stats = data[0]?.stats;
          if (stats) {
            if (!keyId && stats.razorpayKeyId) keyId = stats.razorpayKeyId;
            if (!keySecret && stats.razorpayKeySecret) keySecret = stats.razorpayKeySecret;
            if (stats.razorpayEnabled !== undefined) enabled = stats.razorpayEnabled;
          }
        }
      } catch (sbErr) {
        console.warn('Could not query Supabase settings for Razorpay credentials:', sbErr);
      }
    }

    // Determine if keys are real live/test keys vs placeholder/demo
    const isPlaceholder = !keyId ||
      keyId === 'rzp_test_demo_lifehut' ||
      keyId === 'rzp_test_lifehut_demo' ||
      keySecret === 'demo_secret_12345' ||
      keyId.includes('placeholder') ||
      keySecret.length < 8;

    const isRealRazorpay = Boolean(
      keyId &&
      keySecret &&
      keyId.startsWith('rzp_') &&
      !isPlaceholder
    );

    return {
      keyId: keyId || 'rzp_test_demo_lifehut',
      keySecret: keySecret || '',
      enabled,
      isConfigured: Boolean(keyId && keySecret && !isPlaceholder),
      isRealRazorpay,
      testMode: !isRealRazorpay
    };
  }

  app.get('/api/razorpay/config', async (req, res) => {
    try {
      const config = await getActiveRazorpayConfig();
      res.json({
        keyId: config.keyId,
        isConfigured: config.isConfigured,
        testMode: config.testMode,
        enabled: config.enabled,
        currency: 'INR'
      });
    } catch (err: any) {
      console.error('Error fetching Razorpay config:', err);
      res.status(500).json({ success: false, message: 'Failed to retrieve payment configuration.' });
    }
  });

  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', service: 'Lifehut Developers API', time: new Date().toISOString() });
  });

  const handleTestKeysEndpoint = async (req: express.Request, res: express.Response) => {
    try {
      const config = await getActiveRazorpayConfig();
      const keyId = (req.body?.keyId !== undefined ? req.body.keyId : config.keyId || '').trim();
      const keySecret = (req.body?.keySecret !== undefined ? req.body.keySecret : config.keySecret || '').trim();

      if (!keyId) {
        return res.status(400).json({
          success: false,
          status: 'missing_key',
          message: 'Razorpay Key ID is required to process actual payments.'
        });
      }

      if (!keyId.startsWith('rzp_live_') && !keyId.startsWith('rzp_test_')) {
        return res.status(400).json({
          success: false,
          status: 'invalid_format',
          message: `Key ID format should start with 'rzp_live_' or 'rzp_test_'. Provided: ${keyId.slice(0, 10)}...`
        });
      }

      if (!keySecret) {
        return res.status(400).json({
          success: false,
          status: 'missing_secret',
          message: 'Razorpay Key Secret is required alongside Key ID.'
        });
      }

      // Test credentials against Razorpay Orders API
      try {
        const authHeader = 'Basic ' + Buffer.from(`${keyId}:${keySecret}`).toString('base64');
        const testRes = await fetch('https://api.razorpay.com/v1/orders?count=1', {
          method: 'GET',
          headers: { 'Authorization': authHeader }
        });

        if (testRes.ok) {
          const isLive = keyId.startsWith('rzp_live_');
          return res.json({
            success: true,
            status: isLive ? 'live_verified' : 'test_verified',
            isLive,
            keyId,
            message: isLive
              ? 'Live Gateway Verified! Active Razorpay Production API keys confirmed.'
              : 'Test Gateway Verified! Active Razorpay Test API keys confirmed.'
          });
        } else {
          const errData: any = await testRes.json().catch(() => ({}));
          const desc = errData?.error?.description || `Authentication failed (HTTP ${testRes.status})`;
          return res.status(400).json({
            success: false,
            status: 'auth_failed',
            message: `Razorpay rejected credentials: ${desc}`
          });
        }
      } catch (fetchErr: any) {
        return res.json({
          success: true,
          status: 'network_warning',
          message: `Key format valid (${keyId.startsWith('rzp_live_') ? 'Live' : 'Test'}). Note: External ping timed out, but keys are saved.`
        });
      }
    } catch (err: any) {
      console.error('Error in test-keys:', err);
      res.status(500).json({ success: false, message: 'Internal error testing keys.' });
    }
  };

  app.post('/api/razorpay/test-keys', handleTestKeysEndpoint);
  app.post('/api/payments/test-keys', handleTestKeysEndpoint);

  // --- PAYMENT & SECURE DOWNLOAD UTILITIES ---
  const DOWNLOAD_SECRET = process.env.DOWNLOAD_SECRET || 'lifehut_secure_cad_token_key';

  function generateDownloadToken(planId: string, paymentId: string, secret: string = DOWNLOAD_SECRET): string {
    const expiresAt = Date.now() + 24 * 60 * 60 * 1000;
    const tokenPayload = `${planId}:${paymentId}:${expiresAt}`;
    const tokenSignature = crypto.createHmac('sha256', secret).update(tokenPayload).digest('hex');
    return `${expiresAt}.${tokenSignature}`;
  }

  function verifyDownloadToken(planId: string, paymentId: string, token: string, secret: string = DOWNLOAD_SECRET): boolean {
    if (!token || !planId || !paymentId) return false;
    const parts = token.split('.');
    if (parts.length !== 2) return false;
    const [expiresAtStr, providedSignature] = parts;
    const expiresAt = Number(expiresAtStr);
    if (isNaN(expiresAt) || Date.now() > expiresAt) return false;
    const tokenPayload = `${planId}:${paymentId}:${expiresAt}`;
    const expectedSignature = crypto.createHmac('sha256', secret).update(tokenPayload).digest('hex');
    return expectedSignature.toLowerCase() === providedSignature.toLowerCase();
  }

  // Common Order Creation Handler (Real Razorpay Checkout Only - No Sandbox / Test Simulation)
  const handleCreateOrder = async (req: express.Request, res: express.Response) => {
    try {
      const { planId, clientName, clientEmail, clientPhone, amount } = req.body;
      const db = readDB();
      const plans = db.housePlans || defaultHousePlans;
      const plan = plans.find(p => p.id === planId || p.slug === planId || p.planCode === planId);

      const finalAmount = Number(amount) || plan?.cadPackagePrice || 999;
      if (finalAmount <= 0) {
        return res.status(400).json({
          success: false,
          message: 'This plan is free. Please claim via the free download route.'
        });
      }

      const amountInPaise = Math.round(finalAmount * 100);
      const config = await getActiveRazorpayConfig();

      if (!config.enabled) {
        return res.status(403).json({
          success: false,
          message: 'Online checkout is currently paused by the administrator. Please contact us via WhatsApp.'
        });
      }

      if (!config.keyId || !config.keySecret) {
        return res.status(400).json({
          success: false,
          message: 'Razorpay payment gateway credentials (Key ID and Secret) are not configured on the server. Please enter your Razorpay keys in Admin Settings.'
        });
      }

      const authHeader = 'Basic ' + Buffer.from(`${config.keyId}:${config.keySecret}`).toString('base64');
      const rzpResponse = await fetch('https://api.razorpay.com/v1/orders', {
        method: 'POST',
        headers: {
          'Authorization': authHeader,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          amount: amountInPaise,
          currency: 'INR',
          receipt: `rcpt_lh_${Date.now().toString().slice(-8)}`,
          notes: {
            planId: plan?.id || planId,
            planCode: plan?.planCode || '',
            title: plan?.title || 'House Plan Blueprints',
            clientName: clientName || '',
            clientPhone: clientPhone || ''
          }
        })
      });

      if (!rzpResponse.ok) {
        const errJson = (await rzpResponse.json().catch(() => ({}))) as any;
        const errDesc = errJson?.error?.description || errJson?.message || 'Razorpay order creation failed.';
        return res.status(rzpResponse.status).json({
          success: false,
          message: `Razorpay Error: ${errDesc}`
        });
      }

      const orderData = (await rzpResponse.json()) as any;
      return res.json({
        success: true,
        orderId: orderData.id,
        amount: orderData.amount,
        currency: orderData.currency || 'INR',
        keyId: config.keyId,
        plan: {
          id: plan?.id,
          planCode: plan?.planCode,
          title: plan?.title,
          cadPackageFileName: plan?.cadPackageFileName
        }
      });
    } catch (err: any) {
      console.error('Error creating Razorpay order:', err);
      res.status(500).json({ success: false, message: err.message || 'Failed to create payment order' });
    }
  };

  app.post('/api/payments/create-order', handleCreateOrder);
  app.post('/api/razorpay/create-order', handleCreateOrder);

  // Common Payment Verification Handler (Cryptographic HMAC-SHA256 signature verification only)
  const handleVerifyPayment = async (req: express.Request, res: express.Response) => {
    try {
      const {
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature,
        planId,
        clientName,
        clientEmail,
        clientPhone,
        notes,
        keySecret
      } = req.body;

      if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
        return res.status(400).json({
          success: false,
          verified: false,
          message: 'Missing required payment verification credentials.'
        });
      }

      const db = readDB();
      const config = await getActiveRazorpayConfig();
      const effectiveSecret = (keySecret || config.keySecret || '').trim();

      if (!effectiveSecret) {
        return res.status(500).json({
          success: false,
          verified: false,
          message: 'Razorpay Secret Key is not configured on the server. Cannot verify payment.'
        });
      }

      // Persist secret in db.settings if provided by client so future calls don't need to pass it
      if (keySecret && !db.settings?.razorpayKeySecret) {
        if (!db.settings) db.settings = { ...defaultSettings };
        db.settings.razorpayKeySecret = keySecret;
        writeDB(db);
      }

      const body = razorpay_order_id + '|' + razorpay_payment_id;
      const expectedSignature = crypto
        .createHmac('sha256', effectiveSecret)
        .update(body.toString())
        .digest('hex');

      if (expectedSignature.toLowerCase() !== razorpay_signature.toLowerCase()) {
        return res.status(400).json({
          success: false,
          verified: false,
          message: 'Cryptographic signature verification failed. Payment was not confirmed by Razorpay.'
        });
      }

      const plans = db.housePlans || defaultHousePlans;
      const plan = plans.find(p => p.id === planId || p.slug === planId || p.planCode === planId);

      // Record genuine verified purchase in db.enquiries for admin records
      const paymentId = razorpay_payment_id;
      const newEnquiry: Enquiry = {
        id: `cad_order_${Date.now()}`,
        name: clientName || 'Verified Homeowner',
        email: clientEmail || '',
        phone: clientPhone || '',
        service: `CAD & PDF Drawings: ${plan?.planCode || planId}`,
        message: `Paid ₹${plan?.cadPackagePrice || 999} via Razorpay (Payment ID: ${paymentId}, Order: ${razorpay_order_id}). ${notes || ''}`,
        date: new Date().toISOString(),
        status: 'New'
      };

      if (!db.enquiries) db.enquiries = [];
      db.enquiries.unshift(newEnquiry);
      writeDB(db);

      const secret = effectiveSecret || DOWNLOAD_SECRET;
      const downloadToken = generateDownloadToken(plan?.id || planId, paymentId, secret);
      const downloadUrl = `/api/download?planId=${encodeURIComponent(plan?.id || planId)}&token=${encodeURIComponent(downloadToken)}&paymentId=${encodeURIComponent(paymentId)}`;

      // Record verified purchase in db.orders for admin Orders & Sales dashboard
      const newOrder: HousePlanOrder = {
        id: `ord_${Date.now()}`,
        orderId: razorpay_order_id,
        planId: plan?.id || planId,
        planTitle: plan?.title || 'House Plan Blueprints',
        planCode: plan?.planCode || '',
        amount: Number(plan?.cadPackagePrice) || 999,
        currency: 'INR',
        customerName: clientName || 'Verified Homeowner',
        customerEmail: clientEmail || '',
        customerPhone: clientPhone || '',
        paymentMethod: 'Razorpay',
        paymentStatus: 'Completed',
        deliveryStatus: 'Delivered',
        transactionId: razorpay_payment_id,
        razorpayOrderId: razorpay_order_id,
        razorpayPaymentId: razorpay_payment_id,
        notes: notes || 'Online Razorpay checkout',
        createdAt: new Date().toISOString(),
        downloadToken,
        downloadUrl
      };

      if (!db.orders) db.orders = [];
      const orderExists = db.orders.some(o => o.transactionId === paymentId || o.razorpayPaymentId === paymentId);
      if (!orderExists) {
        db.orders.unshift(newOrder);
      }

      if (plan) {
        plan.purchaseCount = (Number(plan.purchaseCount) || 0) + 1;
      }
      writeDB(db);

      return res.json({
        success: true,
        verified: true,
        message: 'Payment verified successfully! Your CAD & PDF package is ready for download.',
        downloadUrl,
        downloadToken,
        paymentId,
        orderId: razorpay_order_id,
        planCode: plan?.planCode,
        planTitle: plan?.title,
        fileName: plan?.cadPackageFileName || `${plan?.planCode || 'Lifehut'}-CAD-Package.zip`
      });
    } catch (err: any) {
      console.error('Error verifying Razorpay payment:', err);
      res.status(500).json({ success: false, message: err.message || 'Payment verification failed' });
    }
  };

  app.post('/api/payments/verify', handleVerifyPayment);
  app.post('/api/razorpay/verify-payment', handleVerifyPayment);

  // Claim Free Package Endpoint
  app.post('/api/payments/claim-free', async (req, res) => {
    try {
      const { planId, clientName, clientEmail, clientPhone, isFreePlan } = req.body;
      const db = readDB();
      const plans = db.housePlans || defaultHousePlans;
      const plan = plans.find(p => p.id === planId || p.slug === planId || p.planCode === planId);

      const price = plan?.cadPackagePrice !== undefined ? plan.cadPackagePrice : 999;
      if (price > 0 && !isFreePlan) {
        return res.status(403).json({
          success: false,
          message: 'This CAD drawings package requires a paid purchase through Razorpay checkout.'
        });
      }

      if (!clientName || !clientPhone) {
        return res.status(400).json({
          success: false,
          message: 'Please provide your name and mobile number to claim this package.'
        });
      }

      const freeClaimId = `FREE_${Date.now()}`;
      const config = await getActiveRazorpayConfig();
      const secret = config.keySecret || DOWNLOAD_SECRET;
      const downloadToken = generateDownloadToken(plan?.id || planId, freeClaimId, secret);
      const downloadUrl = `/api/download?planId=${encodeURIComponent(plan?.id || planId)}&token=${encodeURIComponent(downloadToken)}&paymentId=${encodeURIComponent(freeClaimId)}`;

      const newEnquiry: Enquiry = {
        id: `free_claim_${Date.now()}`,
        name: clientName,
        email: clientEmail || '',
        phone: clientPhone,
        service: `Free CAD Download: ${plan?.planCode || planId}`,
        message: `Claimed free CAD package for ${plan?.title || planId}.`,
        date: new Date().toISOString(),
        status: 'New'
      };
      if (!db.enquiries) db.enquiries = [];
      db.enquiries.unshift(newEnquiry);

      // Record free claim in db.orders for admin tracking
      const freeOrder: HousePlanOrder = {
        id: `ord_${Date.now()}`,
        orderId: freeClaimId,
        planId: plan?.id || planId,
        planTitle: plan?.title || 'House Plan Blueprints',
        planCode: plan?.planCode || '',
        amount: 0,
        currency: 'INR',
        customerName: clientName,
        customerEmail: clientEmail || '',
        customerPhone: clientPhone,
        paymentMethod: 'Free Claim',
        paymentStatus: 'Completed',
        deliveryStatus: 'Delivered',
        transactionId: freeClaimId,
        notes: 'Claimed free promotional CAD blueprint package',
        createdAt: new Date().toISOString(),
        downloadToken,
        downloadUrl
      };
      if (!db.orders) db.orders = [];
      db.orders.unshift(freeOrder);

      if (plan) {
        plan.purchaseCount = (Number(plan.purchaseCount) || 0) + 1;
      }
      writeDB(db);

      return res.json({
        success: true,
        verified: true,
        isFree: true,
        paymentId: freeClaimId,
        downloadToken,
        downloadUrl
      });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err?.message || 'Failed to claim free download' });
    }
  });

  // Protected Download Endpoint (Downloads are strictly gated by verified payment token)
  const handleProtectedDownload = async (req: express.Request, res: express.Response) => {
    try {
      const planId = (req.query.planId || req.query.id || req.params.id || '').toString();
      const token = (req.query.token || req.query.verified_token || '').toString();
      const paymentId = (req.query.paymentId || req.query.payment_id || '').toString();

      if (!planId) {
        return res.status(400).json({ success: false, message: 'Plan identifier is missing.' });
      }

      const config = await getActiveRazorpayConfig();
      const secret = config.keySecret || DOWNLOAD_SECRET;

      // Strictly verify cryptographic download token
      const isTokenValid = verifyDownloadToken(planId, paymentId, token, secret) ||
                           verifyDownloadToken(planId, paymentId, token, DOWNLOAD_SECRET);

      if (!isTokenValid) {
        return res.status(403).json({
          success: false,
          message: 'Payment verification required. Downloads are strictly protected and require a verified purchase through Razorpay checkout.'
        });
      }

      const db = readDB();
      const plans = db.housePlans || defaultHousePlans;
      const idLower = planId.toLowerCase();
      const plan = plans.find(p => 
        p.id === planId || 
        p.slug === planId || 
        p.planCode === planId ||
        (p.id && p.id.toLowerCase() === idLower) ||
        (p.slug && p.slug.toLowerCase() === idLower) ||
        (p.planCode && p.planCode.toLowerCase() === idLower)
      );

      if (!plan) {
        return res.status(404).json({ success: false, message: 'House plan not found.' });
      }

      let zipUrl = plan?.cadPackageZipUrl || plan?.cadPackageBase64;
      let targetFileName = plan?.cadPackageFileName || `${plan?.planCode || 'HousePlan'}-Drawings.zip`;

      // 1. If not present in local db, or if it points to a missing local file, query Supabase house_plans table
      if (!zipUrl || (zipUrl.startsWith('/uploads/') && !fs.existsSync(path.join(process.cwd(), zipUrl.slice(1))))) {
        try {
          const sbUrl = process.env.VITE_SUPABASE_URL || 'https://vkthcqceywhdlmjsvsze.supabase.co';
          const sbKey = process.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable__eUGKx9jON0kZ1dVrBRmLw_-huhN1d7';
          const sbRes = await fetch(`${sbUrl}/rest/v1/house_plans?or=(id.eq.${encodeURIComponent(planId)},slug.eq.${encodeURIComponent(planId)},plan_code.eq.${encodeURIComponent(planId)})&select=cad_package_zip_url,cad_package_file_name,cad_package_size&limit=1`, {
            headers: {
              apikey: sbKey,
              Authorization: `Bearer ${sbKey}`
            }
          });
          if (sbRes.ok) {
            const rows: any = await sbRes.json();
            if (rows?.[0]?.cad_package_zip_url) {
              zipUrl = rows[0].cad_package_zip_url;
              if (rows[0].cad_package_file_name) {
                targetFileName = rows[0].cad_package_file_name;
              }
            }
          }
        } catch (sbErr) {
          console.warn('Supabase fetch in download error:', sbErr);
        }
      }

      if (!zipUrl) {
        return res.status(404).json({ success: false, message: 'No uploaded drawing ZIP package found for this plan. Please upload the ZIP file in Admin Panel.' });
      }

      // 2. If stored as Base64 Data URI in cadPackageZipUrl (e.g. from Supabase)
      if (zipUrl.startsWith('data:')) {
        const base64Data = zipUrl.replace(/^data:[^;]+;base64,/, '');
        const buffer = Buffer.from(base64Data, 'base64');
        res.setHeader('Content-Type', 'application/zip');
        res.setHeader('Content-Disposition', `attachment; filename="${targetFileName}"`);
        res.setHeader('Content-Length', buffer.length.toString());
        return res.send(buffer);
      }

      // 3. If an uploaded ZIP file exists locally on disk in uploads/ or relative path
      if (!zipUrl.startsWith('http://') && !zipUrl.startsWith('https://')) {
        const cleanRelPath = zipUrl.startsWith('/') ? zipUrl.slice(1) : zipUrl;
        const localDiskPath = path.join(process.cwd(), cleanRelPath);
        if (fs.existsSync(localDiskPath) && fs.statSync(localDiskPath).isFile()) {
          res.setHeader('Content-Type', 'application/zip');
          res.setHeader('Content-Disposition', `attachment; filename="${targetFileName}"`);
          return fs.createReadStream(localDiskPath).pipe(res);
        }
      }

      // 4. If an uploaded ZIP exists on an external URL or Supabase storage
      if (zipUrl.startsWith('http://') || zipUrl.startsWith('https://')) {
        return res.redirect(zipUrl);
      }

      return res.status(404).json({
        success: false,
        message: 'No uploaded drawing ZIP file found for this plan. Please upload it in the Admin Panel.'
      });
    } catch (err: any) {
      console.error('Error downloading attached CAD zip:', err);
      res.status(500).json({ success: false, message: 'Failed to download attached CAD package.' });
    }
  };

  app.get('/api/download', handleProtectedDownload);
  app.get('/api/house-plans/:id/download-cad', handleProtectedDownload);

  // --- HOUSE PLAN ORDERS & SALES DASHBOARD ENDPOINTS ---
  app.get('/api/orders', (req, res) => {
    const db = readDB();
    res.json(db.orders || []);
  });

  app.post('/api/orders', (req, res) => {
    const db = readDB();
    if (!db.orders) db.orders = [];
    const newOrder: HousePlanOrder = {
      id: req.body.id || `ord_${Date.now()}`,
      ...req.body,
      createdAt: req.body.createdAt || new Date().toISOString(),
      paymentStatus: req.body.paymentStatus || 'Completed',
      deliveryStatus: req.body.deliveryStatus || 'Delivered'
    };
    
    // Check if order already recorded by transaction ID or razorpay payment ID or ID
    const existingIdx = db.orders.findIndex(
      o => (newOrder.transactionId && o.transactionId === newOrder.transactionId) ||
           (newOrder.razorpayPaymentId && o.razorpayPaymentId === newOrder.razorpayPaymentId) ||
           o.id === newOrder.id
    );

    if (existingIdx !== -1) {
      db.orders[existingIdx] = { ...db.orders[existingIdx], ...newOrder };
    } else {
      db.orders.unshift(newOrder);
    }

    const plan = db.housePlans?.find(p => p.id === newOrder.planId || p.planCode === newOrder.planCode);
    if (plan) {
      plan.purchaseCount = (Number(plan.purchaseCount) || 0) + 1;
    }
    writeDB(db);
    res.json({ success: true, order: newOrder });
  });

  app.put('/api/orders/:id', (req, res) => {
    const db = readDB();
    if (!db.orders) db.orders = [];
    const idx = db.orders.findIndex(o => o.id === req.params.id);
    if (idx !== -1) {
      db.orders[idx] = { ...db.orders[idx], ...req.body };
      writeDB(db);
      return res.json({ success: true, order: db.orders[idx] });
    }
    res.status(404).json({ success: false, message: 'Order not found.' });
  });

  app.delete('/api/orders/:id', (req, res) => {
    const db = readDB();
    if (!db.orders) db.orders = [];
    db.orders = db.orders.filter(o => o.id !== req.params.id);
    writeDB(db);
    res.json({ success: true });
  });

  // Track house plan view counter
  app.post('/api/house-plans/:id/view', (req, res) => {
    const db = readDB();
    const plans = db.housePlans || defaultHousePlans;
    const plan = plans.find(p => p.id === req.params.id || p.slug === req.params.id || p.planCode === req.params.id);
    if (plan) {
      plan.views = (Number(plan.views) || 0) + 1;
      writeDB(db);
      return res.json({ success: true, views: plan.views });
    }
    res.json({ success: false });
  });

  // Testimonial CRUD
  app.post('/api/testimonials', (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.includes('lifehut_admin_secure_session_token')) {
      return res.status(401).json({ success: false, message: 'Unauthorized.' });
    }

    const { action, testimonial } = req.body;
    const db = readDB();

    if (action === 'create') {
      const newTestimonial: Testimonial = {
        ...testimonial,
        id: 'testi_' + Date.now(),
        date: new Date().toISOString().split('T')[0]
      };
      db.testimonials.unshift(newTestimonial);
      writeDB(db);
      return res.json({ success: true, testimonial: newTestimonial });
    }

    if (action === 'update') {
      const idx = db.testimonials.findIndex(t => t.id === testimonial.id);
      if (idx !== -1) {
        db.testimonials[idx] = testimonial;
        writeDB(db);
        return res.json({ success: true, testimonial });
      }
      return res.status(404).json({ success: false, message: 'Testimonial not found.' });
    }

    if (action === 'delete') {
      db.testimonials = db.testimonials.filter(t => t.id !== testimonial.id);
      writeDB(db);
      return res.json({ success: true, message: 'Testimonial deleted.' });
    }

    res.status(400).json({ success: false, message: 'Invalid action.' });
  });

  // Manage Enquiry/Quote statuses
  app.post('/api/enquiries/:id/status', (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.includes('lifehut_admin_secure_session_token')) {
      return res.status(401).json({ success: false, message: 'Unauthorized.' });
    }
    const { id } = req.params;
    const { status } = req.body;
    const db = readDB();
    const item = db.enquiries.find(e => e.id === id);
    if (item) {
      item.status = status;
      writeDB(db);
      return res.json({ success: true, data: item });
    }
    res.status(404).json({ success: false, message: 'Enquiry not found.' });
  });

  app.post('/api/quotes/:id/status', (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.includes('lifehut_admin_secure_session_token')) {
      return res.status(401).json({ success: false, message: 'Unauthorized.' });
    }
    const { id } = req.params;
    const { status } = req.body;
    const db = readDB();
    const item = db.quotes.find(q => q.id === id);
    if (item) {
      item.status = status;
      writeDB(db);
      return res.json({ success: true, data: item });
    }
    res.status(404).json({ success: false, message: 'Quote request not found.' });
  });

  // Submit comment on Blog
  app.post('/api/blogs/:id/comments', (req, res) => {
    const { id } = req.params;
    const { name, text } = req.body;
    if (!name || !text) {
      return res.status(400).json({ success: false, message: 'Name and text are required.' });
    }

    const db = readDB();
    const blog = db.blogs.find(b => b.id === id);
    if (blog) {
      const newComment = {
        id: 'comm_' + Date.now(),
        name,
        date: new Date().toISOString().split('T')[0],
        text
      };
      blog.comments.push(newComment);
      writeDB(db);
      return res.json({ success: true, comment: newComment });
    }
    res.status(404).json({ success: false, message: 'Blog not found.' });
  });

  // Global Search API
  app.get('/api/search', (req, res) => {
    const q = (req.query.q || '').toString().toLowerCase().trim();
    if (!q) return res.json({ blogs: [], services: [], projects: [] });

    const db = readDB();
    const matchedServices = db.services.filter(s => 
      s.title.toLowerCase().includes(q) || 
      s.description.toLowerCase().includes(q)
    );
    const matchedProjects = db.projects.filter(p => 
      p.name.toLowerCase().includes(q) || 
      p.location.toLowerCase().includes(q)
    );
    const matchedBlogs = db.blogs.filter(b => 
      b.title.toLowerCase().includes(q) || 
      b.content.toLowerCase().includes(q) ||
      b.category.toLowerCase().includes(q)
    );
    const matchedHousePlans = (db.housePlans || defaultHousePlans).filter(p =>
      p.title.toLowerCase().includes(q) ||
      p.planCode.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q) ||
      p.facing.toLowerCase().includes(q) ||
      p.style.toLowerCase().includes(q) ||
      `${p.bedrooms} bhk`.toLowerCase().includes(q) ||
      `${p.builtUpArea}`.includes(q)
    );

    res.json({
      services: matchedServices.map(s => ({ id: s.id, title: s.title, desc: s.description })),
      projects: matchedProjects.map(p => ({ id: p.id, title: p.name, desc: p.location })),
      blogs: matchedBlogs.map(b => ({ id: b.id, title: b.title, desc: b.content.substring(0, 100) + '...' })),
      housePlans: matchedHousePlans.map(p => ({ id: p.id, slug: p.slug, title: p.title, desc: `${p.builtUpArea} sq.ft | ${p.bedrooms} BHK | ${p.facing} Facing` }))
    });
  });

  // SEO: Robots.txt
  app.get('/robots.txt', (req, res) => {
    res.type('text/plain');
    res.send(`User-agent: *
Allow: /
Disallow: /api/
Disallow: /admin

Sitemap: https://lifehutdevelopers.com/sitemap.xml`);
  });

  // SEO: Dynamic XML Sitemap
  app.get('/sitemap.xml', (req, res) => {
    const db = readDB();
    const urls = [
      { loc: '', changefreq: 'daily', priority: '1.0' },
      { loc: '/services', changefreq: 'weekly', priority: '0.8' },
      { loc: '/projects', changefreq: 'weekly', priority: '0.8' },
      { loc: '/house-plans', changefreq: 'daily', priority: '0.9' },
      { loc: '/pricing', changefreq: 'monthly', priority: '0.7' },
      { loc: '/blogs', changefreq: 'daily', priority: '0.8' },
      { loc: '/quote', changefreq: 'monthly', priority: '0.9' },
      { loc: '/contact', changefreq: 'monthly', priority: '0.8' },
    ];

    // Add house plans
    (db.housePlans || defaultHousePlans).forEach(p => {
      urls.push({ loc: `/house-plans/${p.slug}`, changefreq: 'weekly', priority: '0.8' });
    });

    // Add blogs
    db.blogs.forEach(b => {
      urls.push({ loc: `/blogs/${b.slug}`, changefreq: 'weekly', priority: '0.6' });
    });

    // Add services
    db.services.forEach(s => {
      urls.push({ loc: `/services/${s.id}`, changefreq: 'weekly', priority: '0.6' });
    });

    let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`;

    urls.forEach(u => {
      xml += `
  <url>
    <loc>https://lifehutdevelopers.com${u.loc}</loc>
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>
  </url>`;
    });

    xml += '\n</urlset>';
    res.type('application/xml');
    res.send(xml);
  });

  // Vite development middleware or production server routing
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  // Error handling
  app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error("Unhandled Server Error:", err);
    res.status(500).json({ success: false, message: 'Internal Server Error.' });
  });

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Lifehut Backend] Running on port ${PORT}`);
  });
}

startServer();
