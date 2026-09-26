import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { SEO } from './components/SEO';
import { HomePage } from './components/HomePage';
import { Services } from './components/Services';
import { Projects } from './components/Projects';
import { Pricing } from './components/Pricing';
import { Blogs } from './components/Blogs';
import { QuoteForm } from './components/QuoteForm';
import { Contact } from './components/Contact';
import { HousePlans } from './components/HousePlans';
import { AdminPanel } from './components/AdminPanel';
import { FloatingQuickActions } from './components/FloatingQuickActions';
import { Service, Project, Blog, Enquiry, Settings, HousePlan } from './types';
import { defaultServices, defaultProjects, defaultBlogs, defaultSettings } from './data/defaults';
import { defaultHousePlans } from './data/defaultHousePlans';
import { findPlan, isDemoHousePlan } from './lib/routing';
import { 
  isSupabaseConfigured, 
  fetchSupabaseServices, 
  fetchSupabaseProjects, 
  fetchSupabaseEnquiries, 
  fetchSupabaseSettings,
  fetchSupabaseHousePlans,
  autoMigrateAndSyncSupabase
} from './lib/supabase';
import { ShieldCheck, HardHat, Award, Check, ChevronRight, Sliders, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function App() {
  // Navigation State
  const [activeTab, setActiveTab] = useState<string>('home');
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState<boolean>(() => {
    return localStorage.getItem('lifehut_admin_auth') === 'true';
  });

  // CMS Database States
  const [services, setServices] = useState<Service[]>(() => {
    try {
      const local = localStorage.getItem('lifehut_local_services');
      if (local) return JSON.parse(local);
    } catch {}
    return defaultServices;
  });
  const [projects, setProjects] = useState<Project[]>(() => {
    try {
      const local = localStorage.getItem('lifehut_local_projects');
      if (local) return JSON.parse(local);
    } catch {}
    return defaultProjects;
  });
  const [blogs, setBlogs] = useState<Blog[]>(() => {
    try {
      const local = localStorage.getItem('lifehut_local_blogs');
      if (local) return JSON.parse(local);
    } catch {}
    return defaultBlogs;
  });
  const [housePlans, setHousePlans] = useState<HousePlan[]>(() => {
    try {
      const local = localStorage.getItem('lifehut_local_house_plans');
      if (local) {
        const parsed = JSON.parse(local);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const nonDemo = parsed.filter(p => !isDemoHousePlan(p));
          if (nonDemo.length > 0) return nonDemo;
        }
      }
    } catch {}
    return [];
  });
  const [selectedPlanSlug, setSelectedPlanSlug] = useState<string | null>(null);
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [settings, setSettings] = useState<Settings | null>(() => {
    try {
      const local = localStorage.getItem('lifehut_local_settings');
      if (local) return JSON.parse(local);
    } catch {}
    return defaultSettings;
  });
  const [loading, setLoading] = useState(false);
  const [isHousePlansLoading, setIsHousePlansLoading] = useState(false);
  const [isStaticMode, setIsStaticMode] = useState<boolean>(false);

  // Synchronize state from Supabase or Express CMS REST APIs progressively
  const refreshAllData = async () => {
    try {
      if (isSupabaseConfigured()) {
        // Fetch services in background
        fetchSupabaseServices()
          .then(sbServices => {
            if (sbServices && sbServices.length > 0) {
              setServices(sbServices);
              try { localStorage.setItem('lifehut_local_services', JSON.stringify(sbServices)); } catch {}
            }
          })
          .catch(() => {});

        // Fetch projects in background
        fetchSupabaseProjects()
          .then(sbProjects => {
            if (sbProjects && sbProjects.length > 0) {
              setProjects(sbProjects);
              try { localStorage.setItem('lifehut_local_projects', JSON.stringify(sbProjects)); } catch {}
            }
          })
          .catch(() => {});

        // Fetch settings in background
        fetchSupabaseSettings()
          .then(sbSettings => {
            if (sbSettings) {
              setSettings(sbSettings);
              try { localStorage.setItem('lifehut_local_settings', JSON.stringify(sbSettings)); } catch {}
            }
          })
          .catch(() => {});

        // Fetch enquiries in background
        fetchSupabaseEnquiries()
          .then(sbEnquiries => {
            if (sbEnquiries) setEnquiries(sbEnquiries);
          })
          .catch(() => {});

        // Fetch blogs
        fetch('/api/blogs')
          .then(r => r.json())
          .then(bData => {
            if (Array.isArray(bData) && bData.length > 0) {
              setBlogs(bData);
              try { localStorage.setItem('lifehut_local_blogs', JSON.stringify(bData)); } catch {}
            }
          })
          .catch(() => {});

        // Fetch house plans strictly from Supabase / server storage
        setIsHousePlansLoading(true);
        fetch('/api/house-plans')
          .then(r => r.json())
          .then(plans => {
            if (Array.isArray(plans)) {
              const clean = plans.filter((p: any) => !isDemoHousePlan(p));
              if (clean.length > 0) {
                setHousePlans(clean);
                setIsHousePlansLoading(false);
              }
            }
          })
          .catch(() => {});

        fetchSupabaseHousePlans()
          .then((sbHousePlans) => {
            const valid = (sbHousePlans || []).filter(p => !isDemoHousePlan(p));
            if (valid.length > 0) {
              setHousePlans(valid);
            }
            setIsHousePlansLoading(false);
          })
          .catch(() => {
            setIsHousePlansLoading(false);
          });

        // Run silent background sync after 2 seconds
        setTimeout(() => {
          autoMigrateAndSyncSupabase().catch(() => {});
        }, 2000);
        return;
      }

      // Non-Supabase API fallback
      fetch('/api/services').then(r => r.json()).then(d => { if (d.length > 0) setServices(d); }).catch(() => {});
      fetch('/api/projects').then(r => r.json()).then(d => { if (d.length > 0) setProjects(d); }).catch(() => {});
      fetch('/api/blogs').then(r => r.json()).then(d => { if (d.length > 0) setBlogs(d); }).catch(() => {});
      fetch('/api/enquiries').then(r => r.json()).then(d => { if (d) setEnquiries(d); }).catch(() => {});
      fetch('/api/settings').then(r => r.json()).then(d => { if (d) setSettings(d); }).catch(() => {});
      fetch('/api/house-plans').then(r => r.json()).then(d => {
        if (Array.isArray(d)) {
          setHousePlans(d.filter((p: any) => !isDemoHousePlan(p)));
        }
      }).catch(() => {});
    } catch (err) {
      console.warn("Activating local state fallback:", err);
      setIsStaticMode(true);
    }
  };

  useEffect(() => {
    refreshAllData();
  }, []);

  useEffect(() => {
    const handleUrlRoute = () => {
      const pathname = window.location.pathname;
      const hash = window.location.hash;

      if (hash === '#admin') {
        setActiveTab('admin');
      } else if (pathname === '/house-plans' || pathname.startsWith('/house-plans/')) {
        setActiveTab('house-plans');
        const parts = pathname.split('/').filter(Boolean);
        if (parts.length > 1 && parts[1]) {
          setSelectedPlanSlug(parts[1]);
        } else {
          setSelectedPlanSlug(null);
        }
      }
    };

    handleUrlRoute();
    window.addEventListener('popstate', handleUrlRoute);
    window.addEventListener('hashchange', handleUrlRoute);

    const handleCustomNavPlan = (e: any) => {
      setActiveTab('house-plans');
      if (e.detail) {
        setSelectedPlanSlug(e.detail);
        window.history.pushState({}, '', `/house-plans/${e.detail}`);
      } else {
        setSelectedPlanSlug(null);
        window.history.pushState({}, '', '/house-plans');
      }
      window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    window.addEventListener('nav-house-plan', handleCustomNavPlan);

    return () => {
      window.removeEventListener('popstate', handleUrlRoute);
      window.removeEventListener('hashchange', handleUrlRoute);
      window.removeEventListener('nav-house-plan', handleCustomNavPlan);
    };
  }, []);

  const handleAdminLogin = () => {
    setIsAdminLoggedIn(true);
    localStorage.setItem('lifehut_admin_auth', 'true');
    setActiveTab('admin');
  };

  const handleAdminLogout = () => {
    setIsAdminLoggedIn(false);
    localStorage.removeItem('lifehut_admin_auth');
    setActiveTab('home');
  };

  const heroTitle = settings?.heroTitle || "We Build Your Dream Home";
  const heroSubtitle = settings?.heroSubtitle || "Luxury Villa Construction & Turnkey Residential Execution with Rigorous Engineering Integrity.";
  const address = settings?.address || "Lifehut Developers, Ground Floor, No. 4, Thirualluvar Nagar 1st Street, Keelkattalai, Chennai, Tamil Nadu 600117";
  const phone = settings?.phone || "+91 80721 63330";
  const email = settings?.email || "lifehutdevelopers@gmail.com";
  const instagramUrl = settings?.instagramUrl || "https://www.instagram.com/lifehut_developers/";
  const pinterestUrl = settings?.pinterestUrl || "https://in.pinterest.com/lifehutdevelopers/";
  const youtubeUrl = settings?.youtubeUrl || "https://www.youtube.com/@lifehutdevelopers";
  const facebookUrl = settings?.facebookUrl || "https://facebook.com/lifehutdevelopers";

  const stats = {
    projectsDone: settings?.stats?.projectsDone || "120",
    experienceYears: settings?.stats?.experienceYears || "7",
    clientSatisfaction: settings?.stats?.clientSatisfaction || "99",
    hiddenCharges: settings?.stats?.hiddenCharges || "0"
  };

  const heroImage = "/src/assets/images/hero_villa_1784191464588.jpg";

  return (
    <div className="min-h-screen flex flex-col justify-between bg-white">
      
      {/* Dynamic SEO Meta */}
      {activeTab === 'home' && (
        <SEO
          title={settings?.seoTitle || "Top Residential Building Construction Company in Chennai | Lifehut Developers"}
          description={settings?.seoDescription || "Leading residential building construction company in Chennai offering turnkey villa construction, transparent packages, and on-time handover."}
          keywords={settings?.seoKeywords || "residential building construction company, turnkey house builders chennai, villa contractors"}
        />
      )}
      {activeTab === 'house-plans' && (() => {
        const activePlanObj = selectedPlanSlug ? findPlan(housePlans, selectedPlanSlug) : null;
        if (activePlanObj) {
          const canonicalSlug = activePlanObj.slug || activePlanObj.planCode;
          const canonicalUrl = `https://lifehutdevelopers.com/house-plans/${encodeURIComponent(canonicalSlug)}`;
          const richDescription = activePlanObj.description || `${activePlanObj.title} - ${activePlanObj.builtUpArea} sq.ft, ${activePlanObj.bedrooms} BHK, ${activePlanObj.facing}-facing 100% Vastu compliant floor plan in Chennai with turnkey execution costs.`;
          return (
            <SEO
              title={`${activePlanObj.title} (${activePlanObj.planCode}) | Lifehut Developers`}
              description={richDescription}
              keywords={`${activePlanObj.planCode}, ${activePlanObj.title}, house plans chennai, ${activePlanObj.builtUpArea} sqft house plan, ${activePlanObj.bedrooms} bhk floor plan, ${activePlanObj.facing} facing, vastu floor plans`}
              canonicalPath={`/house-plans/${encodeURIComponent(canonicalSlug)}`}
              url={canonicalUrl}
              image={activePlanObj.elevationImage}
              type="product"
              schema={{
                "@context": "https://schema.org",
                "@type": "Product",
                "name": activePlanObj.title,
                "sku": activePlanObj.planCode,
                "mpn": activePlanObj.planCode,
                "image": [activePlanObj.elevationImage, activePlanObj.floorPlanImage].filter(Boolean),
                "description": richDescription,
                "brand": {
                  "@type": "Brand",
                  "name": "Lifehut Developers"
                },
                "offers": {
                  "@type": "Offer",
                  "price": activePlanObj.cadPackagePrice || 999,
                  "priceCurrency": "INR",
                  "availability": "https://schema.org/InStock",
                  "url": canonicalUrl,
                  "seller": {
                    "@type": "Organization",
                    "name": "Lifehut Developers",
                    "telephone": phone,
                    "address": address
                  }
                }
              }}
            />
          );
        }
        return (
          <SEO
            title="House Plans in Chennai | 100% Vastu Architectural Floor Designs"
            description="Explore architect-drafted house plans in Chennai. 1000 to 3200 sq.ft single-storey, duplex & triplex villa floor plans, 100% Vastu compliant with estimated turnkey construction budgets."
            keywords="house plans chennai, 1500 sqft house plan, 1 storey house design, duplex floor plan chennai, vastu house plans"
            canonicalPath="/house-plans"
            url="https://lifehutdevelopers.com/house-plans"
            schema={{
              "@context": "https://schema.org",
              "@type": "CollectionPage",
              "name": "Architectural House Plans Collection | Lifehut Developers",
              "description": "Browse vastu-compliant architectural house plans and villa designs in Chennai.",
              "url": "https://lifehutdevelopers.com/house-plans"
            }}
          />
        );
      })()}
      {activeTab === 'services' && (
        <SEO
          title="Services | High-End Residential Construction"
          description="Explore our specialized construction services: Custom Luxury Villas, turnkey home construction, structural stress analyses, and blueprint consultations."
          keywords="luxury villas, civil consulting, turnkey contracts Chennai"
        />
      )}
      {activeTab === 'projects' && (
        <SEO
          title="Portfolio | Elite Architectural Masterpieces"
          description="Browse completed projects and explore structural metrics, plot dimensions, building configurations, and testimonials from verified Chennai homeowners."
          keywords="villa construction portfolio, custom homes Chennai"
        />
      )}
      {activeTab === 'pricing' && (
        <SEO
          title="Pricing Plans | Locked Specification Budgets"
          description="Explore Basic, Standard, and Premium construction contracts. Direct material specifications, steel ratios, and flooring choices compared transparently."
          keywords="construction price per sqft Chennai, builder cost estimate"
        />
      )}
      {activeTab === 'blogs' && (
        <SEO
          title="Construction Manuals | Civil Engineering Insights"
          description="Review expert articles detailing structural footing design, steel reinforcement ratios, block comparisons, and financial invoice tracking."
          keywords="construction manual, builder tips, structural guides"
        />
      )}
      {activeTab === 'quote' && (
        <SEO
          title="Interactive Budget Calculator | Instant Turnkey Quotes"
          description="Input your area and proposed floors to generate a customized budget estimation based on current Chennai brick and steel market pricing."
          keywords="home construction calculator Chennai, live quote generator"
        />
      )}
      {activeTab === 'contact' && (
        <SEO
          title="Contact Headquarters | Schedule Blueprint Consultation"
          description="Reach our Keelkattalai headquarters. Schedule an on-site structural engineering review, or speak directly to our Principal civil engineer."
          keywords="builder contact Chennai, Keelkattalai office"
        />
      )}

      {/* Persistent Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isAdminLoggedIn={isAdminLoggedIn}
        onAdminClick={() => setActiveTab('admin')}
        onLogout={handleAdminLogout}
        phone={phone}
      />

      {/* Main Content Render */}
      <main className="flex-grow">
        <AnimatePresence mode="wait">
          
          {activeTab === 'home' && (
            <motion.div
              key="home"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              <HomePage
                setActiveTab={setActiveTab}
                phone={phone}
                email={email}
                address={address}
                projects={projects}
                services={services}
                stats={stats}
                heroTitle={heroTitle}
                heroSubtitle={heroSubtitle}
                heroImage={heroImage}
              />
            </motion.div>
          )}

          {/* Dynamic Views */}
          {activeTab === 'house-plans' && (
            <motion.div
              key="house-plans"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              <HousePlans
                housePlans={housePlans}
                setActiveTab={setActiveTab}
                selectedSlug={selectedPlanSlug}
                initialSelectedSlug={selectedPlanSlug}
                onSelectPlan={(slug) => {
                  setSelectedPlanSlug(slug);
                  if (slug) {
                    window.history.pushState({}, '', `/house-plans/${encodeURIComponent(slug)}`);
                  } else {
                    window.history.pushState({}, '', '/house-plans');
                  }
                }}
                phone={phone}
                settings={settings}
                loading={isHousePlansLoading}
              />
            </motion.div>
          )}

          {activeTab === 'services' && (
            <motion.div
              key="services"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              <Services
                services={services}
                setActiveTab={setActiveTab}
              />
            </motion.div>
          )}

          {activeTab === 'projects' && (
            <motion.div
              key="projects"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              <Projects
                projects={projects}
                setActiveTab={setActiveTab}
              />
            </motion.div>
          )}

          {activeTab === 'pricing' && (
            <motion.div
              key="pricing"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              <Pricing
                setActiveTab={setActiveTab}
              />
            </motion.div>
          )}

          {activeTab === 'blogs' && (
            <motion.div
              key="blogs"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              <Blogs
                blogs={blogs}
                setActiveTab={setActiveTab}
              />
            </motion.div>
          )}

          {activeTab === 'quote' && (
            <motion.div
              key="quote"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              <QuoteForm
                setActiveTab={setActiveTab}
              />
            </motion.div>
          )}

          {activeTab === 'contact' && (
            <motion.div
              key="contact"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              <Contact
                address={address}
                phone={phone}
                email={email}
              />
            </motion.div>
          )}

          {activeTab === 'admin' && (
            <motion.div
              key="admin"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              <AdminPanel
                isAdminLoggedIn={isAdminLoggedIn}
                onLogin={handleAdminLogin}
                services={services}
                projects={projects}
                blogs={blogs}
                housePlans={housePlans}
                enquiries={enquiries}
                settings={settings}
                refreshAllData={refreshAllData}
                isStaticMode={isStaticMode}
              />
            </motion.div>
          )}

        </AnimatePresence>
      </main>

      {/* Persistent Footer */}
      <Footer
        setActiveTab={setActiveTab}
        address={address}
        phone={phone}
        email={email}
        instagramUrl={instagramUrl}
        pinterestUrl={pinterestUrl}
        youtubeUrl={youtubeUrl}
        facebookUrl={facebookUrl}
      />

      {/* Floating Quick Actions (WhatsApp, Phone Call, Instant Quote & Scroll-to-top) */}
      <FloatingQuickActions
        setActiveTab={setActiveTab}
        phone={phone}
      />

    </div>
  );
}
