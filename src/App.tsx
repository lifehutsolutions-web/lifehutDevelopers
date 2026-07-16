import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { SEO } from './components/SEO';
import { Hero } from './components/Hero';
import { Services } from './components/Services';
import { Projects } from './components/Projects';
import { Pricing } from './components/Pricing';
import { Blogs } from './components/Blogs';
import { QuoteForm } from './components/QuoteForm';
import { Contact } from './components/Contact';
import { AdminPanel } from './components/AdminPanel';
import { Service, Project, Blog, Enquiry, Settings } from './types';
import { defaultServices, defaultProjects, defaultBlogs, defaultSettings } from './data/defaults';
import { ShieldCheck, HardHat, Award, HelpCircle, Check, ChevronRight } from 'lucide-react';

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
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [settings, setSettings] = useState<Settings | null>(null);
  const [loading, setLoading] = useState(true);
  const [isStaticMode, setIsStaticMode] = useState<boolean>(false);

  // Synchronize state from Express CMS REST APIs
  const refreshAllData = async () => {
    try {
      const [svcRes, projRes, blogRes, enqRes, setRes] = await Promise.all([
        fetch('/api/services'),
        fetch('/api/projects'),
        fetch('/api/blogs'),
        fetch('/api/enquiries'),
        fetch('/api/settings')
      ]);

      if (!svcRes.ok || !projRes.ok || !blogRes.ok || !enqRes.ok || !setRes.ok) {
        throw new Error('API request failed');
      }

      const [svcData, projData, blogData, enqData, setData] = await Promise.all([
        svcRes.json(),
        projRes.json(),
        blogRes.json(),
        enqRes.json(),
        setRes.json()
      ]);

      if (!Array.isArray(svcData) || !Array.isArray(projData) || !Array.isArray(blogData)) {
        throw new Error('Invalid response type');
      }

      setServices(svcData);
      setProjects(projData);
      setBlogs(blogData);
      setEnquiries(enqData);
      setSettings(setData);
      setIsStaticMode(false);
    } catch (err) {
      console.warn('Backend unavailable (running on static host like GitHub Pages). Falling back to LocalStorage CMS mode.', err);
      setIsStaticMode(true);

      let localSvc = localStorage.getItem('lifehut_local_services');
      let localProj = localStorage.getItem('lifehut_local_projects');
      let localBlogs = localStorage.getItem('lifehut_local_blogs');
      let localEnq = localStorage.getItem('lifehut_local_enquiries');
      let localSet = localStorage.getItem('lifehut_local_settings');

      if (!localSvc) {
        localStorage.setItem('lifehut_local_services', JSON.stringify(defaultServices));
        localSvc = JSON.stringify(defaultServices);
      }
      if (!localProj) {
        localStorage.setItem('lifehut_local_projects', JSON.stringify(defaultProjects));
        localProj = JSON.stringify(defaultProjects);
      }
      if (!localBlogs) {
        localStorage.setItem('lifehut_local_blogs', JSON.stringify(defaultBlogs));
        localBlogs = JSON.stringify(defaultBlogs);
      }
      if (!localEnq) {
        localStorage.setItem('lifehut_local_enquiries', JSON.stringify([]));
        localEnq = JSON.stringify([]);
      }
      if (!localSet) {
        localStorage.setItem('lifehut_local_settings', JSON.stringify(defaultSettings));
        localSet = JSON.stringify(defaultSettings);
      }

      setServices(JSON.parse(localSvc));
      setProjects(JSON.parse(localProj));
      setBlogs(JSON.parse(localBlogs));
      setEnquiries(JSON.parse(localEnq));
      setSettings(JSON.parse(localSet));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshAllData();
  }, []);

  useEffect(() => {
    const handleHashChange = () => {
      if (window.location.hash === '#admin') {
        setActiveTab('admin');
      }
    };
    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
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

  // Default parameters if settings is loading
  const heroTitle = settings?.heroTitle || "We Build Your Dream Home";
  const heroSubtitle = settings?.heroSubtitle || "Luxury Villa Construction & Turnkey Residential Execution with Rigorous Engineering Integrity.";
  const address = settings?.address || "Lifehut Developers, Ground Floor, No. 4, Thirualluvar Nagar 1st Street, Keelkattalai, Chennai, Tamil Nadu 600117";
  const phone = settings?.phone || "+91 80721 63330";
  const email = settings?.email || "lifehutdevelopers@gmail.com";
  const instagramUrl = settings?.instagramUrl || "https://www.instagram.com/lifehut_developers/";
  const pinterestUrl = settings?.pinterestUrl || "https://in.pinterest.com/lifehutdevelopers/";

  const stats = {
    projectsDone: settings?.stats?.projectsDone || "120",
    experienceYears: settings?.stats?.experienceYears || "7",
    clientSatisfaction: settings?.stats?.clientSatisfaction || "99",
    hiddenCharges: settings?.stats?.hiddenCharges || "0"
  };

  // Set default images if assets list empty
  const heroImage = "/src/assets/images/hero_villa_1784191464588.jpg";

  if (loading) {
    return (
      <div className="min-h-screen bg-[#1A2332] flex flex-col items-center justify-center text-white gap-4 font-display">
        <div className="w-12 h-12 border-4 border-t-[#F47B20] border-[#1A6DB5] rounded-full animate-spin" />
        <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Loading Lifehut Parameters...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col justify-between">
      
      {/* Dynamic Search & SEO Meta Updates */}
      {activeTab === 'home' && (
        <SEO
          title="Home | Luxury Villa Builders in Chennai"
          description="Lifehut Developers: Award-winning turnkey residential builder in Chennai. Experience high-end engineering, transparent quotes, and absolute safety guarantee."
          keywords="villas Chennai, turnkey construction, custom home building Chennai, Lifehut Developers"
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
          description="Review expert articles detailing soil borehole testing, steel reinforcement ratios, block comparisons, and financial invoice tracking."
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
          description="Reach our Keelkattalai headquarters. Schedule an on-site structural boring evaluation, or speak directly to our Principal structural engineer."
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
      />

      {/* Main Content Render */}
      <main className="flex-grow">
        
        {activeTab === 'home' && (
          <div>
            {/* 1. Hero Layout banner */}
            <Hero
              setActiveTab={setActiveTab}
              heroTitle={heroTitle}
              heroSubtitle={heroSubtitle}
              heroImage={heroImage}
              stats={stats}
            />

            {/* 2. Brand Value Proposition Section (About Us summary) */}
            <section className="py-20 bg-white bg-grid-blueprint relative overflow-hidden">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-left">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
                  
                  {/* Text presentation */}
                  <div className="lg:col-span-7 flex flex-col gap-6">
                    <span className="self-start text-[#F47B20] text-xs font-extrabold uppercase tracking-widest bg-orange-500/10 px-4 py-1.5 rounded-full">
                      Our Structural Credo
                    </span>
                    <h2 className="font-display text-3xl sm:text-4xl font-extrabold text-[#1A2332] leading-tight">
                      Why Elite Chennai Homeowners Trust Lifehut
                    </h2>
                    <p className="text-slate-500 text-sm sm:text-base leading-relaxed">
                      Established in 2019, Lifehut Developers was founded with a singular purpose: to eliminate the opaqueness and poor material standards plaguing standard residential contracts in Tamil Nadu. We treat custom home building as a high-precision aerospace challenge.
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-4">
                      
                      <div className="flex gap-4">
                        <div className="w-10 h-10 rounded-xl bg-sky-50 text-[#1A6DB5] flex items-center justify-center flex-shrink-0">
                          <ShieldCheck className="w-5.5 h-5.5" />
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-slate-800">100% Invoice Auditing</h4>
                          <p className="text-xs text-slate-500 mt-1">Every cement, steel, and electrical material invoice is logged and visible. No hidden contractor margins.</p>
                        </div>
                      </div>

                      <div className="flex gap-4">
                        <div className="w-10 h-10 rounded-xl bg-sky-50 text-[#1A6DB5] flex items-center justify-center flex-shrink-0">
                          <HardHat className="w-5.5 h-5.5" />
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-slate-800">Borehole Soil Surveys</h4>
                          <p className="text-xs text-slate-500 mt-1">We never estimate foundation parameters blindly. Compulsory physical boring tests precede every project design.</p>
                        </div>
                      </div>

                    </div>
                  </div>

                  {/* Visual grid credentials */}
                  <div className="lg:col-span-5 bg-slate-50 rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-sm flex flex-col gap-4">
                    <div className="flex items-center gap-3">
                      <Award className="text-[#F47B20] w-6 h-6" />
                      <h3 className="font-display text-sm font-bold uppercase tracking-wider text-slate-800">Engineering Benchmarks</h3>
                    </div>
                    
                    <ul className="flex flex-col gap-3.5 text-xs text-slate-600 list-none p-0 m-0">
                      <li className="flex items-start gap-2.5">
                        <Check className="w-4.5 h-4.5 text-green-500 flex-shrink-0 mt-0.5" />
                        <span>Designed specifically for extreme SBC (Soil Bearing Capacity) fluctuations in OMR/ECR.</span>
                      </li>
                      <li className="flex items-start gap-2.5">
                        <Check className="w-4.5 h-4.5 text-green-500 flex-shrink-0 mt-0.5" />
                        <span>Wind-load thresholds modeled up to 180 km/h structural resistance.</span>
                      </li>
                      <li className="flex items-start gap-2.5">
                        <Check className="w-4.5 h-4.5 text-green-500 flex-shrink-0 mt-0.5" />
                        <span>Compulsory cube-testing of RCC structures completed at certified independent laboratories.</span>
                      </li>
                    </ul>

                    <button
                      onClick={() => setActiveTab('quote')}
                      className="w-full mt-4 py-3 bg-[#1A6DB5] hover:bg-[#1558a0] text-white font-bold rounded-xl text-xs tracking-wider uppercase transition-colors"
                    >
                      Audit My Proposed Plan
                    </button>
                  </div>

                </div>
              </div>
            </section>

            {/* 3. Featured Specializations Showcase */}
            <section className="py-20 bg-slate-50 relative border-y border-slate-100">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                
                <span className="inline-block bg-orange-500/10 text-[#F47B20] text-xs font-extrabold uppercase tracking-wider px-4 py-1.5 rounded-full mb-3">
                  Our Expertise
                </span>
                <h2 className="font-display text-3xl font-extrabold text-[#1A2332]">
                  Premium Construction Focus
                </h2>
                <p className="text-slate-500 text-sm max-w-lg mx-auto mt-2 mb-12">
                  Inspect our specialized civil engineering profiles, customized to lock structural integrity.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
                  {services.slice(0, 3).map((svc) => (
                    <div
                      key={svc.id}
                      onClick={() => setActiveTab('services')}
                      className="bg-white p-6 rounded-3xl border border-slate-100 text-left shadow-sm hover:shadow-premium-hover cursor-pointer transition-all duration-300 flex flex-col justify-between group h-64"
                    >
                      <div className="flex flex-col gap-4">
                        <div className="w-10 h-10 rounded-xl bg-sky-50 text-[#1A6DB5] flex items-center justify-center">
                          <ShieldCheck className="w-5.5 h-5.5" />
                        </div>
                        <h3 className="font-display text-base font-extrabold text-[#1A2332] group-hover:text-[#1A6DB5] transition-colors">
                          {svc.title}
                        </h3>
                        <p className="text-slate-500 text-xs leading-relaxed line-clamp-3">
                          {svc.description}
                        </p>
                      </div>

                      <span className="text-[10px] font-bold text-[#1A6DB5] tracking-widest uppercase flex items-center gap-1 mt-4">
                        <span>Explore details</span>
                        <ChevronRight className="w-3.5 h-3.5 transform group-hover:translate-x-1 transition-transform" />
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* 4. Interactive Call-to-action */}
            <section className="py-20 bg-[#1A2332] text-white bg-grid-white relative">
              <div className="max-w-4xl mx-auto px-4 text-center flex flex-col gap-6">
                <span className="text-[#F47B20] text-xs font-extrabold uppercase tracking-widest">Instant Action</span>
                <h2 className="font-display text-3xl sm:text-4xl font-extrabold">Ready to Lock Your Material Price Quote?</h2>
                <p className="text-slate-400 text-sm leading-relaxed max-w-xl mx-auto">
                  Protect your construction capital from fluctuating steel and cement price spikes. Configure your proposed area and lock your price with our dynamic algorithm.
                </p>
                <div className="flex justify-center mt-4">
                  <button
                    onClick={() => setActiveTab('quote')}
                    className="px-8 py-4 bg-[#1A6DB5] hover:bg-[#1558a0] text-white font-bold rounded-full transition-transform transform hover:scale-105 shadow-xl shadow-[#1A6DB5]/25"
                  >
                    Go To Interactive Calculator
                  </button>
                </div>
              </div>
            </section>
          </div>
        )}

        {/* Dynamic Views */}
        {activeTab === 'services' && (
          <Services
            services={services}
            setActiveTab={setActiveTab}
          />
        )}

        {activeTab === 'projects' && (
          <Projects
            projects={projects}
            setActiveTab={setActiveTab}
          />
        )}

        {activeTab === 'pricing' && (
          <Pricing
            setActiveTab={setActiveTab}
          />
        )}

        {activeTab === 'blogs' && (
          <Blogs
            blogs={blogs}
            setActiveTab={setActiveTab}
          />
        )}

        {activeTab === 'quote' && (
          <QuoteForm
            setActiveTab={setActiveTab}
          />
        )}

        {activeTab === 'contact' && (
          <Contact
            address={address}
            phone={phone}
            email={email}
          />
        )}

        {activeTab === 'admin' && (
          <AdminPanel
            isAdminLoggedIn={isAdminLoggedIn}
            onLogin={handleAdminLogin}
            services={services}
            projects={projects}
            blogs={blogs}
            enquiries={enquiries}
            settings={settings}
            refreshAllData={refreshAllData}
            isStaticMode={isStaticMode}
          />
        )}

      </main>

      {/* Persistent Footer */}
      <Footer
        setActiveTab={setActiveTab}
        address={address}
        phone={phone}
        email={email}
        instagramUrl={instagramUrl}
        pinterestUrl={pinterestUrl}
      />

    </div>
  );
}
