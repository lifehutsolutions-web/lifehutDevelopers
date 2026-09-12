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
  const [services, setServices] = useState<Service[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [housePlans, setHousePlans] = useState<HousePlan[]>([]);
  const [selectedPlanSlug, setSelectedPlanSlug] = useState<string | null>(null);
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
        setProjects(sbProjects && sbProjects.length > 0 ? sbProjects : defaultProjects);
        setBlogs(blogData && blogData.length > 0 ? blogData : defaultBlogs);
        setHousePlans(sbHousePlans && sbHousePlans.length > 0 ? sbHousePlans : defaultHousePlans);
        setEnquiries(sbEnquiries || []);
        setSettings(sbSettings || defaultSettings);
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
        setSettings(stData || defaultSettings);
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
