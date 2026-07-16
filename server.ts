import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import { CMSData, Service, Project, Blog, Testimonial, Enquiry, QuoteRequest, SiteSettings, Stats } from './src/types';

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
    budget: "₹185,000,000",
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
    budget: "₹95,000,000",
    location: "Poonamallee, Chennai",
    clientTestimonial: "Extremely professional, well-engineered steel structure. They handled the deep SBC core tests and massive steel spans with outstanding expertise.",
    clientName: "Mr. Navin Kumar",
    clientAvatar: "NV",
    status: "Completed"
  }
];

const defaultBlogs: Blog[] = [
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
    text: "Incredibly engineering-first builders. Their Chief Engineer Vignesh took extensive SBC soil investigation tests and designed custom concrete pile foundations because our site soil was clayey. A solid, transparent builder you can trust blindly.",
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
    return JSON.parse(raw);
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

  // Middleware
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

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
        user: { name: 'Vignesh K', role: 'Chief Engineer & Admin' }
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

  app.get('/api/enquiries', (req, res) => {
    const db = readDB();
    res.json(db.enquiries || []);
  });

  app.get('/api/settings', (req, res) => {
    const db = readDB();
    res.json(db.settings || {});
  });

  // Submit Contact Enquiry
  app.post('/api/enquiries', (req, res) => {
    const { name, phone, email, service, message } = req.body;
    if (!name || !phone) {
      return res.status(400).json({ success: false, message: 'Name and Phone number are required.' });
    }

    const db = readDB();
    const newEnquiry: Enquiry = {
      id: 'enq_' + Date.now(),
      name,
      phone,
      email: email || '',
      service: service || 'Turnkey Construction',
      message: message || '',
      date: new Date().toISOString().split('T')[0],
      status: 'New'
    };

    db.enquiries.unshift(newEnquiry);
    writeDB(db);

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

    res.json({
      services: matchedServices.map(s => ({ id: s.id, title: s.title, desc: s.description })),
      projects: matchedProjects.map(p => ({ id: p.id, title: p.name, desc: p.location })),
      blogs: matchedBlogs.map(b => ({ id: b.id, title: b.title, desc: b.content.substring(0, 100) + '...' }))
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
      { loc: '/pricing', changefreq: 'monthly', priority: '0.7' },
      { loc: '/blogs', changefreq: 'daily', priority: '0.8' },
      { loc: '/quote', changefreq: 'monthly', priority: '0.9' },
      { loc: '/contact', changefreq: 'monthly', priority: '0.8' },
    ];

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
