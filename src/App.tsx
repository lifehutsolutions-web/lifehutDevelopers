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
import { LegalPage, LegalTabType } from './components/LegalPage';
import { FloatingQuickActions } from './components/FloatingQuickActions';
import { Service, Project, Blog, Enquiry, Settings, HousePlan } from './types';
import { defaultServices, defaultProjects, defaultBlogs, defaultSettings } from './data/defaults';
import { defaultHousePlans } from './data/defaultHousePlans';
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
import { parseCurrentRoute, findPlan, findProject, findService, findBlog } from './lib/routing';

export default function App() {
  // Navigation State
  const [activeTab, setActiveTab] = useState<string>('home');
  const [activePolicy, setActivePolicy] = useState<LegalTabType>('refund-policy');
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState<boolean>(() => {
    return localStorage.getItem('lifehut_admin_auth') === 'true';
  });

  // CMS Database States
  const [services, setServices] = useState<Service[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [housePlans, setHousePlans] = useState<HousePlan[]>([]);
  const [selectedPlanSlug, setSelectedPlanSlug] = useState<string | null>(null);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(null);
  const [selectedBlogSlug, setSelectedBlogSlug] = useState<string | null>(null);
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [settings, setSettings] = useState<Settings | null>(null);
  const [loading, setLoading] = useState(true);
  const [isStaticMode, setIsStaticMode] = useState<boolean>(false);

  // Synchronize state from Supabase or Express CMS REST APIs
  const refreshAllData = async () => {
    try {
      if (isSupabaseConfigured()) {
        const [sbServices, sbProjects, sbEnquiries, sbSettings, sbHousePlans] = await Promise.all([
          fetchSupabaseServices(),
          fetchSupabaseProjects(),
          fetchSupabaseEnquiries(),
          fetchSupabaseSettings(),
          fetchSupabaseHousePlans()
        ]);

        let blogData: Blog[] = [];
        try {
          const blogRes = await fetch('/api/blogs');
          if (blogRes.ok) blogData = await blogRes.json();
        } catch {
          const localBlogs = localStorage.getItem('lifehut_local_blogs');
          blogData = localBlogs ? JSON.parse(localBlogs) : defaultBlogs;
        }

        setServices(sbServices && sbServices.length > 0 ? sbServices : defaultServices);
        const resolvedProjects = (sbProjects && sbProjects.length > 0) ? sbProjects : (() => {
          try {
            const local = localStorage.getItem('lifehut_local_projects');
            if (local) {
              const parsed = JSON.parse(local);
              if (Array.isArray(parsed) && parsed.length > 0) return parsed;
            }
          } catch {}
          return defaultProjects;
        })();
        setProjects(resolvedProjects);
        setBlogs(blogData && blogData.length > 0 ? blogData : defaultBlogs);
        setHousePlans(sbHousePlans && sbHousePlans.length > 0 ? sbHousePlans : defaultHousePlans);
        setEnquiries(sbEnquiries || []);
        if (sbSettings && (sbSettings.heroTitle || sbSettings.address || sbSettings.stats)) {
          const merged = {
            ...defaultSettings,
            ...sbSettings,
            stats: {
              ...defaultSettings.stats,
              ...(sbSettings.stats || {})
            }
          };
          setSettings(merged);
          try {
            localStorage.setItem('lifehut_local_settings', JSON.stringify(merged));
          } catch {}
        } else {
          const local = localStorage.getItem('lifehut_local_settings');
          setSettings(local ? JSON.parse(local) : defaultSettings);
        }
        setLoading(false);

        // Run silent code-driven migration and synchronization in background without any UI disruption
        setTimeout(() => {
          autoMigrateAndSyncSupabase().catch(() => {});
        }, 800);
        return;
      }

      const [servicesRes, projectsRes, blogsRes, enquiriesRes, settingsRes, housePlansRes] = await Promise.all([
        fetch('/api/services').catch(() => null),
        fetch('/api/projects').catch(() => null),
        fetch('/api/blogs').catch(() => null),
        fetch('/api/enquiries').catch(() => null),
        fetch('/api/settings').catch(() => null),
        fetch('/api/house-plans').catch(() => null),
      ]);

      if (servicesRes && servicesRes.ok) {
        const sData = await servicesRes.json();
        setServices(sData.length > 0 ? sData : defaultServices);
      } else {
        const local = localStorage.getItem('lifehut_local_services');
        setServices(local ? JSON.parse(local) : defaultServices);
      }

      if (projectsRes && projectsRes.ok) {
        const pData = await projectsRes.json();
        setProjects(pData.length > 0 ? pData : defaultProjects);
      } else {
        const local = localStorage.getItem('lifehut_local_projects');
        setProjects(local ? JSON.parse(local) : defaultProjects);
      }

      if (blogsRes && blogsRes.ok) {
        const bData = await blogsRes.json();
        setBlogs(bData.length > 0 ? bData : defaultBlogs);
      } else {
        const local = localStorage.getItem('lifehut_local_blogs');
        setBlogs(local ? JSON.parse(local) : defaultBlogs);
      }

      if (housePlansRes && housePlansRes.ok) {
        const hpData = await housePlansRes.json();
        setHousePlans(hpData.length > 0 ? hpData : defaultHousePlans);
      } else {
        const local = localStorage.getItem('lifehut_local_house_plans');
        setHousePlans(local ? JSON.parse(local) : defaultHousePlans);
      }

      if (enquiriesRes && enquiriesRes.ok) {
        const eData = await enquiriesRes.json();
        setEnquiries(eData || []);
      } else {
        const local = localStorage.getItem('lifehut_local_enquiries');
        setEnquiries(local ? JSON.parse(local) : []);
      }

      if (settingsRes && settingsRes.ok) {
        const stData = await settingsRes.json();
        if (stData && (stData.heroTitle || stData.address || stData.stats)) {
          const merged = {
            ...defaultSettings,
            ...stData,
            stats: {
              ...defaultSettings.stats,
              ...(stData.stats || {})
            }
          };
          setSettings(merged);
          try {
            localStorage.setItem('lifehut_local_settings', JSON.stringify(merged));
          } catch {}
        } else {
          const local = localStorage.getItem('lifehut_local_settings');
          setSettings(local ? JSON.parse(local) : defaultSettings);
        }
      } else {
        const local = localStorage.getItem('lifehut_local_settings');
        setSettings(local ? JSON.parse(local) : defaultSettings);
      }

      setLoading(false);
    } catch (err) {
      console.warn("Activating local state fallback:", err);
      setIsStaticMode(true);
      const localServices = localStorage.getItem('lifehut_local_services');
      const localProjects = localStorage.getItem('lifehut_local_projects');
      const localBlogs = localStorage.getItem('lifehut_local_blogs');
      const localHousePlans = localStorage.getItem('lifehut_local_house_plans');
      const localSettings = localStorage.getItem('lifehut_local_settings');
      const localEnquiries = localStorage.getItem('lifehut_local_enquiries');

      setServices(localServices ? JSON.parse(localServices) : defaultServices);
      setProjects(localProjects ? JSON.parse(localProjects) : defaultProjects);
      setBlogs(localBlogs ? JSON.parse(localBlogs) : defaultBlogs);
      setHousePlans(localHousePlans ? JSON.parse(localHousePlans) : defaultHousePlans);
      setSettings(localSettings ? JSON.parse(localSettings) : defaultSettings);
      setEnquiries(localEnquiries ? JSON.parse(localEnquiries) : []);
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshAllData();
  }, []);

  useEffect(() => {
    const handleUrlRoute = () => {
      const route = parseCurrentRoute();

      if (route.type === 'admin') {
        setActiveTab('admin');
      } else if (route.type === 'privacy-policy') {
        setActiveTab('privacy-policy');
        setActivePolicy('privacy-policy');
      } else if (route.type === 'terms-and-conditions') {
        setActiveTab('terms-and-conditions');
        setActivePolicy('terms-and-conditions');
      } else if (route.type === 'refund-policy') {
        setActiveTab('refund-policy');
        setActivePolicy('refund-policy');
      } else if (route.type === 'legal') {
        const policy = route.policy || 'refund-policy';
        setActiveTab(policy);
        setActivePolicy(policy as LegalTabType);
      } else if (route.type === 'house-plans') {
        setActiveTab('house-plans');
        setSelectedPlanSlug(route.slug || null);
      } else if (route.type === 'projects') {
        setActiveTab('projects');
        setSelectedProjectId(route.id || null);
      } else if (route.type === 'services') {
        setActiveTab('services');
        setSelectedServiceId(route.id || null);
      } else if (route.type === 'blogs') {
        setActiveTab('blogs');
        setSelectedBlogSlug(route.slug || null);
      } else if (['pricing', 'quote', 'contact'].includes(route.type)) {
        setActiveTab(route.type);
      } else {
        setActiveTab('home');
      }
    };

    handleUrlRoute();
    window.addEventListener('popstate', handleUrlRoute);
    window.addEventListener('hashchange', handleUrlRoute);

    const handleCustomNavPlan = (e: any) => {
      setActiveTab('house-plans');
      if (e.detail) {
        setSelectedPlanSlug(e.detail);
        window.history.pushState({}, '', `/house-plans/${encodeURIComponent(e.detail)}`);
      } else {
        setSelectedPlanSlug(null);
        window.history.pushState({}, '', '/house-plans');
      }
      window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleCustomNavProject = (e: any) => {
      setActiveTab('projects');
      if (e.detail) {
        setSelectedProjectId(e.detail);
        window.history.pushState({}, '', `/projects/${encodeURIComponent(e.detail)}`);
      } else {
        setSelectedProjectId(null);
        window.history.pushState({}, '', '/projects');
      }
      window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleCustomNavService = (e: any) => {
      setActiveTab('services');
      if (e.detail) {
        setSelectedServiceId(e.detail);
        window.history.pushState({}, '', `/services/${encodeURIComponent(e.detail)}`);
      } else {
        setSelectedServiceId(null);
        window.history.pushState({}, '', '/services');
      }
      window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleCustomNavBlog = (e: any) => {
      setActiveTab('blogs');
      if (e.detail) {
        setSelectedBlogSlug(e.detail);
        window.history.pushState({}, '', `/blogs/${encodeURIComponent(e.detail)}`);
      } else {
        setSelectedBlogSlug(null);
        window.history.pushState({}, '', '/blogs');
      }
      window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    window.addEventListener('nav-house-plan', handleCustomNavPlan);
    window.addEventListener('nav-project', handleCustomNavProject);
    window.addEventListener('nav-service', handleCustomNavService);
    window.addEventListener('nav-blog', handleCustomNavBlog);

    return () => {
      window.removeEventListener('popstate', handleUrlRoute);
      window.removeEventListener('hashchange', handleUrlRoute);
      window.removeEventListener('nav-house-plan', handleCustomNavPlan);
      window.removeEventListener('nav-project', handleCustomNavProject);
      window.removeEventListener('nav-service', handleCustomNavService);
      window.removeEventListener('nav-blog', handleCustomNavBlog);
    };
  }, []);

  const handleSetActiveTab = (tab: string) => {
    setActiveTab(tab);
    if (tab === 'home') {
      window.history.pushState({}, '', '/');
    } else if (tab === 'house-plans') {
      setSelectedPlanSlug(null);
      window.history.pushState({}, '', '/house-plans');
    } else if (tab === 'projects') {
      setSelectedProjectId(null);
      window.history.pushState({}, '', '/projects');
    } else if (tab === 'services') {
      setSelectedServiceId(null);
      window.history.pushState({}, '', '/services');
    } else if (tab === 'pricing') {
      window.history.pushState({}, '', '/pricing');
    } else if (tab === 'blogs') {
      setSelectedBlogSlug(null);
      window.history.pushState({}, '', '/blogs');
    } else if (tab === 'quote') {
      window.history.pushState({}, '', '/quote');
    } else if (tab === 'contact') {
      window.history.pushState({}, '', '/contact');
    } else if (tab === 'privacy-policy') {
      setActivePolicy('privacy-policy');
      window.history.pushState({}, '', '/privacy-policy');
    } else if (tab === 'terms-and-conditions') {
      setActivePolicy('terms-and-conditions');
      window.history.pushState({}, '', '/terms-and-conditions');
    } else if (tab === 'refund-policy') {
      setActivePolicy('refund-policy');
      window.history.pushState({}, '', '/refund-policy');
    } else if (tab === 'admin') {
      window.location.hash = '#admin';
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectPlan = (slug: string | null) => {
    setSelectedPlanSlug(slug);
    if (slug) {
      const plan = findPlan(housePlans, slug);
      const chosenSlug = plan ? plan.slug : slug;
      window.history.pushState({}, '', `/house-plans/${encodeURIComponent(chosenSlug)}`);
    } else {
      window.history.pushState({}, '', '/house-plans');
    }
  };

  const handleSelectProject = (id: string | null) => {
    setSelectedProjectId(id);
    if (id) {
      const proj = findProject(projects, id);
      const chosenId = proj ? proj.id : id;
      window.history.pushState({}, '', `/projects/${encodeURIComponent(chosenId)}`);
    } else {
      window.history.pushState({}, '', '/projects');
    }
  };

  const handleSelectService = (id: string | null) => {
    setSelectedServiceId(id);
    if (id) {
      const svc = findService(services, id);
      const chosenId = svc ? svc.id : id;
      window.history.pushState({}, '', `/services/${encodeURIComponent(chosenId)}`);
    } else {
      window.history.pushState({}, '', '/services');
    }
  };

  const handleSelectBlog = (slugOrId: string | null) => {
    setSelectedBlogSlug(slugOrId);
    if (slugOrId) {
      const b = findBlog(blogs, slugOrId);
      const chosen = b ? (b.slug || b.id) : slugOrId;
      window.history.pushState({}, '', `/blogs/${encodeURIComponent(chosen)}`);
    } else {
      window.history.pushState({}, '', '/blogs');
    }
  };

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

  const heroTitle = settings?.heroTitle || defaultSettings.heroTitle;
  const heroSubtitle = settings?.heroSubtitle || defaultSettings.heroSubtitle;
  const address = settings?.address || defaultSettings.address;
  const phone = settings?.phone || defaultSettings.phone;
  const email = settings?.email || defaultSettings.email;
  const instagramUrl = settings?.instagramUrl || defaultSettings.instagramUrl;
  const pinterestUrl = settings?.pinterestUrl || defaultSettings.pinterestUrl;
  const youtubeUrl = settings?.youtubeUrl || defaultSettings.youtubeUrl;
  const facebookUrl = settings?.facebookUrl || defaultSettings.facebookUrl;

  const stats = {
    projectsDone: settings?.stats?.projectsDone || defaultSettings.stats?.projectsDone || "120+",
    experienceYears: settings?.stats?.experienceYears || defaultSettings.stats?.experienceYears || "7+",
    clientSatisfaction: settings?.stats?.clientSatisfaction || defaultSettings.stats?.clientSatisfaction || "99%",
    hiddenCharges: settings?.stats?.hiddenCharges || defaultSettings.stats?.hiddenCharges || "₹0"
  };

  const heroImage = settings?.heroBannerImage || defaultSettings.heroBannerImage || "/src/assets/images/hero_villa_1784191464588.jpg";

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center text-slate-800 gap-3 font-display">
        <div className="w-10 h-10 border-3 border-t-[#1A6DB5] border-slate-200 rounded-full animate-spin" />
        <p className="text-xs font-bold uppercase tracking-widest text-[#1A6DB5] font-mono">Loading Lifehut...</p>
      </div>
    );
  }

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
      {activeTab === 'house-plans' && (
        <SEO
          title={
            selectedPlanSlug && housePlans.find(p => p.slug === selectedPlanSlug)
              ? `${housePlans.find(p => p.slug === selectedPlanSlug)?.title} | Turnkey House Plans`
              : "House Plans in Chennai | 100% Vastu Architectural Floor Designs"
          }
          description={
            selectedPlanSlug && housePlans.find(p => p.slug === selectedPlanSlug)
              ? `${housePlans.find(p => p.slug === selectedPlanSlug)?.description}`
              : "Explore architect-drafted house plans in Chennai. 1500 sq.ft, 1800 sq.ft, duplex villa floor plans, 100% Vastu compliant with estimated turnkey construction budgets."
          }
          keywords={
            selectedPlanSlug && housePlans.find(p => p.slug === selectedPlanSlug)
              ? `${housePlans.find(p => p.slug === selectedPlanSlug)?.seoMeta?.keywords || "house plans chennai"}`
              : "house plans chennai, 1500 sqft house plan, 1 storey house design, duplex floor plan chennai, vastu house plans"
          }
          canonicalPath={selectedPlanSlug ? `/house-plans/${selectedPlanSlug}` : "/house-plans"}
        />
      )}
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
      {['privacy-policy', 'terms-and-conditions', 'refund-policy', 'legal'].includes(activeTab) && (
        <SEO
          title={
            (activeTab === 'privacy-policy' || (activeTab === 'legal' && activePolicy === 'privacy-policy'))
              ? "Privacy Policy | Lifehut Developers"
              : (activeTab === 'terms-and-conditions' || (activeTab === 'legal' && activePolicy === 'terms-and-conditions'))
              ? "Terms and Conditions | Lifehut Developers"
              : "Cancellation and Refund Policy | Lifehut Developers"
          }
          description={
            (activeTab === 'privacy-policy' || (activeTab === 'legal' && activePolicy === 'privacy-policy'))
              ? "Official Privacy Policy for Lifehut Developers. Learn how we securely protect customer data and PhonePe payments under RBI regulations."
              : (activeTab === 'terms-and-conditions' || (activeTab === 'legal' && activePolicy === 'terms-and-conditions'))
              ? "Terms and Conditions for Lifehut Developers turnkey residential construction services, CAD blueprint downloads, and PhonePe payment terms."
              : "Cancellation and Refund Policy for Lifehut Developers architectural CAD floor plans and turnkey construction services in Chennai."
          }
          keywords="privacy policy, terms and conditions, refund policy, cancellation policy, Lifehut Developers, PhonePe payments Chennai"
          canonicalPath={
            (activeTab === 'privacy-policy' || (activeTab === 'legal' && activePolicy === 'privacy-policy'))
              ? "/privacy-policy"
              : (activeTab === 'terms-and-conditions' || (activeTab === 'legal' && activePolicy === 'terms-and-conditions'))
              ? "/terms-and-conditions"
              : "/refund-policy"
          }
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
                initialSelectedSlug={selectedPlanSlug}
                phone={phone}
                settings={settings}
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

          {['privacy-policy', 'terms-and-conditions', 'refund-policy', 'legal'].includes(activeTab) && (
            <motion.div
              key="legal-policies"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              <LegalPage
                activePolicy={
                  (['privacy-policy', 'terms-and-conditions', 'refund-policy'].includes(activeTab)
                    ? (activeTab as LegalTabType)
                    : activePolicy)
                }
                setActivePolicy={(p) => {
                  setActivePolicy(p);
                  setActiveTab(p);
                }}
                setActiveTab={setActiveTab}
                phone={phone}
                email={email}
                address={address}
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
