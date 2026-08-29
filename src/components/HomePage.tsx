import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { TrustindexWidget } from './TrustindexWidget';
import { GetInTouchForm } from './GetInTouchForm';
import { Project, Service } from '../types';
import { defaultServices } from '../data/defaults';

interface HomePageProps {
  setActiveTab?: (tab: string) => void;
  phone?: string;
  email?: string;
  address?: string;
  projects?: Project[];
  services?: Service[];
  stats?: {
    projectsDone: string;
    experienceYears: string;
    clientSatisfaction: string;
    hiddenCharges: string;
  };
  heroTitle?: string;
  heroSubtitle?: string;
  heroImage?: string;
}

export const HomePage: React.FC<HomePageProps> = ({
  setActiveTab,
  phone = "+91 80721 63330",
  email = "lifehutdevelopers@gmail.com",
  address = "Lifehut Developers, Ground Floor, No. 4, Thirualluvar Nagar 1st Street, Keelkattalai, Chennai, Tamil Nadu 600117",
  projects = [],
  services = [],
  stats,
  heroTitle,
  heroSubtitle,
  heroImage
}) => {
  // Counters State
  const targetExp = parseInt(String(stats?.experienceYears || '12').replace(/[^0-9]/g, '')) || 12;
  const targetProj = parseInt(String(stats?.projectsDone || '150').replace(/[^0-9]/g, '')) || 150;
  const targetSat = parseInt(String(stats?.clientSatisfaction || '98').replace(/[^0-9]/g, '')) || 98;

  const [expYears, setExpYears] = useState(targetExp);
  const [projectsCount, setProjectsCount] = useState(targetProj);
  const [clientSat, setClientSat] = useState(targetSat);
  const [sqftBuilt, setSqftBuilt] = useState(500);
  const [googleRating, setGoogleRating] = useState(4.9);
  const [googleReviewsCount, setGoogleReviewsCount] = useState(112);
  const [countersStarted, setCountersStarted] = useState(false);
  const statsRef = useRef<HTMLDListElement>(null);

  // Re-sync initial values when stats prop updates from admin or database
  useEffect(() => {
    setExpYears(targetExp);
    setProjectsCount(targetProj);
    setClientSat(targetSat);
    setCountersStarted(false);
  }, [targetExp, targetProj, targetSat]);

  // FAQ Accordion State
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  // Contact Form State
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    location: '',
    projectType: 'New home construction',
    message: ''
  });

  // Animated Counter on Scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !countersStarted) {
          setCountersStarted(true);
          
          // Animate counters smoothly
          const duration = 1400;
          const start = performance.now();
          
          const tick = (now: number) => {
            const progress = Math.min((now - start) / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            
            setExpYears(Math.round(eased * targetExp));
            setProjectsCount(Math.round(eased * targetProj));
            setClientSat(Math.round(eased * targetSat));
            setSqftBuilt(Math.round(eased * 500));
            setGoogleRating(parseFloat((eased * 4.9).toFixed(1)));
            setGoogleReviewsCount(Math.round(eased * 112));
            
            if (progress < 1) {
              requestAnimationFrame(tick);
            }
          };
          
          requestAnimationFrame(tick);
        }
      },
      { threshold: 0.2 }
    );

    if (statsRef.current) {
      observer.observe(statsRef.current);
    }

    return () => observer.disconnect();
  }, [countersStarted, targetExp, targetProj, targetSat]);

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormSubmitted(true);
    // Optionally post to API / save to localStorage
    try {
      const existing = localStorage.getItem('lifehut_enquiries') || '[]';
      const parsed = JSON.parse(existing);
      parsed.unshift({ ...formData, date: new Date().toISOString() });
      localStorage.setItem('lifehut_enquiries', JSON.stringify(parsed));
    } catch {
      // safe fallback
    }
  };

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    } else if (setActiveTab) {
      if (id === 'services') setActiveTab('services');
      else if (id === 'projects') setActiveTab('projects');
      else if (id === 'contact') setActiveTab('contact');
    }
  };

  // Filter for projects selected by admin to be showcased on HomePage "Recent Projects"
  const recentProjectsList = (projects && projects.length > 0)
    ? (projects.filter(p => p.isRecent).length > 0
        ? projects.filter(p => p.isRecent)
        : projects.slice(0, 3))
    : [];

  // Dynamic services list sourced from props or defaultServices fallback
  const servicesList = (services && services.length > 0) ? services : defaultServices;

  const renderServiceIcon = (service: Service, index: number) => {
    const id = (service.id || '').toLowerCase();
    const title = (service.title || '').toLowerCase();

    if (id.includes('renovation') || title.includes('renovation') || title.includes('remodel') || (!id && index === 1)) {
      return (
        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none">
          <path d="M14 3l7 7-9 9-7 1 1-7 8-8Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
          <path d="M13 6l5 5" stroke="currentColor" strokeWidth="1.7" />
        </svg>
      );
    }
    if (id.includes('commercial') || title.includes('commercial') || (!id && index === 2)) {
      return (
        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none">
          <path d="M3 21h18M6 21V5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v16" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M9 7h2M13 7h2M9 11h2M13 11h2M9 15h2M13 15h2M10 21v-3h4v3" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
        </svg>
      );
    }
    if (id.includes('pre-contract') || title.includes('pre-contract') || title.includes('estimation') || title.includes('boq') || (!id && index === 3)) {
      return (
        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none">
          <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5.586a1 1 0 0 1 .707.293l5.414 5.414a1 1 0 0 1 .293.707V19a2 2 0 0 1-2 2Z" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    }
    if (id.includes('post-contract') || title.includes('post-contract') || title.includes('billing') || title.includes('execution') || (!id && index === 4)) {
      return (
        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none">
          <path d="M9 11l3 3L22 4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    }
    if (id.includes('tender') || title.includes('tender') || (!id && index === 5)) {
      return (
        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.7" />
          <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10Z" stroke="currentColor" strokeWidth="1.7" />
        </svg>
      );
    }
    return (
      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none">
        <path d="M3 21h18M5 21V10l7-6 7 6v11M9 21v-7h6v7" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
      </svg>
    );
  };

  const getServiceActionLabel = (service: Service, index: number) => {
    const id = (service.id || '').toLowerCase();
    const title = (service.title || '').toLowerCase();
    if (id.includes('new-home') || title.includes('home') || title.includes('house') || index === 0) {
      return 'Explore package specs';
    }
    if (id.includes('renovation') || title.includes('renovation') || title.includes('remodel') || index === 1) {
      return 'View renovation scope';
    }
    if (id.includes('commercial') || title.includes('commercial') || index === 2) {
      return 'View commercial specs';
    }
    if (id.includes('pre-contract') || title.includes('pre-contract') || title.includes('estimation') || title.includes('boq') || index === 3) {
      return 'View estimation & BOQ scope';
    }
    if (id.includes('post-contract') || title.includes('post-contract') || title.includes('execution') || title.includes('bill') || index === 4) {
      return 'View execution management';
    }
    if (id.includes('tender') || title.includes('tender') || index === 5) {
      return 'Explore tender support';
    }
    return `Explore ${service.title}`;
  };

  const handleProjectClick = (projectId: string) => {
    if (setActiveTab) {
      setActiveTab('projects');
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent('nav-project', { detail: projectId }));
      }, 50);
    }
  };

  return (
    <div className="font-body text-[#12161F] antialiased">
      
      {/* ============ HERO ============ */}
      <section className="relative overflow-hidden mesh">
        <div className="absolute inset-0 blueprint-grid [mask-image:radial-gradient(65%_65%_at_70%_30%,black,transparent)]" aria-hidden="true" />
        <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-blue-100/60 blur-3xl drift" aria-hidden="true" />
        <div className="absolute top-40 -right-16 w-80 h-80 rounded-full bg-grey-200/70 blur-3xl drift" style={{ animationDelay: '-6s' }} aria-hidden="true" />

        <div className="relative max-w-7xl mx-auto px-6 lg:px-8 pt-10 pb-12 lg:pt-14 lg:pb-16 grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-2 bg-white/80 border border-blue-100 rounded-full pl-2 pr-4 py-1.5 shadow-soft"
            >
              <span className="flex -space-x-1.5" aria-hidden="true">
                <span className="w-6 h-6 rounded-full bg-blue-200 border-2 border-white" />
                <span className="w-6 h-6 rounded-full bg-blue-400 border-2 border-white" />
                <span className="w-6 h-6 rounded-full bg-blue-700 border-2 border-white" />
              </span>
              <span className="text-sm font-semibold text-grey-800">Trusted by {stats?.projectsDone || '150'}+ families across Tamil Nadu</span>
            </motion.div>

            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="mt-6 font-display font-extrabold text-[2.6rem] leading-[1.08] sm:text-6xl sm:leading-[1.05] text-ink text-balance"
            >
              {heroTitle ? (
                <span>{heroTitle}</span>
              ) : (
                <>We build homes you'll be <span className="text-blue-700">proud</span> to call yours.</>
              )}
            </motion.h1>

            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="mt-6 text-lg text-grey-600 leading-relaxed max-w-xl"
            >
              {heroSubtitle || "From the first sketch to the final coat of paint, Lifehut Developers plans, builds and hands over your project on time — with clear pricing and no surprises."}
            </motion.p>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="mt-9 flex flex-wrap items-center gap-4"
            >
              <button 
                onClick={() => scrollToSection('contact')}
                className="inline-flex items-center gap-2 bg-blue-700 hover:bg-blue-900 text-white font-display font-semibold px-7 py-3.5 rounded-full shadow-lift hover:-translate-y-0.5 transition-all duration-300 cursor-pointer"
              >
                <span>Get a Free Quote</span>
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
              
              <a 
                href={`tel:${phone.replace(/[^0-9+]/g, '')}`} 
                className="inline-flex items-center gap-2 bg-white hover:bg-grey-50 text-ink font-display font-semibold px-7 py-3.5 rounded-full border border-grey-200 shadow-soft transition-colors"
              >
                <svg className="w-4 h-4 text-blue-700" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M6.6 10.8a15.9 15.9 0 0 0 6.6 6.6l2.2-2.2a1 1 0 0 1 1-.25 9 9 0 0 0 2.8.45 1 1 0 0 1 1 1V19.4a1 1 0 0 1-1 1A16.4 16.4 0 0 1 3 4a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1 9 9 0 0 0 .45 2.8 1 1 0 0 1-.25 1L6.6 10.8Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
                </svg>
                <span>Call Us Now</span>
              </a>
            </motion.div>

            <dl ref={statsRef} className="mt-12 grid grid-cols-3 max-w-md gap-6 border-t border-grey-200 pt-8">
              <div>
                <dt className="sr-only">Years of experience</dt>
                <dd className="font-display font-extrabold text-3xl text-ink"><span>{countersStarted ? expYears : targetExp}</span>+</dd>
                <p className="text-sm text-grey-600 mt-1">Years experience</p>
              </div>
              <div>
                <dt className="sr-only">Projects completed</dt>
                <dd className="font-display font-extrabold text-3xl text-ink"><span>{countersStarted ? projectsCount : targetProj}</span>+</dd>
                <p className="text-sm text-grey-600 mt-1">Projects done</p>
              </div>
              <div>
                <dt className="sr-only">Client satisfaction rate</dt>
                <dd className="font-display font-extrabold text-3xl text-ink"><span>{countersStarted ? clientSat : targetSat}</span>%</dd>
                <p className="text-sm text-grey-600 mt-1">Client satisfaction</p>
              </div>
            </dl>
          </div>

          {/* Signature graphic: blueprint that draws itself into a house */}
          <div className="relative">
            <div className="relative mx-auto max-w-md aspect-[4/4.2] rounded-3xl bg-white border border-grey-200 shadow-card overflow-hidden">
              <div className="absolute inset-0 blueprint-grid opacity-70" aria-hidden="true" />
              <svg viewBox="0 150 400 430" className="absolute inset-0 w-full h-full" role="img" aria-label="Line illustration of a house being built from a blueprint">
                <g fill="none" stroke="#14539B" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path className="draw-path" d="M70 320 L70 460 L330 460 L330 320" />
                  <path className="draw-path delay1" d="M50 330 L200 210 L350 330" />
                  <path className="draw-path delay1" d="M120 460 L120 380 L180 380 L180 460" />
                  <path className="draw-path delay2" d="M230 460 L230 400 L290 400 L290 460" />
                  <path className="draw-path delay2" d="M195 235 L195 300 L235 300" />
                </g>
                <g fill="#0B3B74" opacity=".9">
                  <circle className="draw-path delay2" cx="200" cy="210" r="4" />
                </g>
              </svg>

              <div className="absolute top-6 left-6 float-slow bg-white/95 backdrop-blur border border-grey-200 rounded-2xl px-4 py-3 shadow-card">
                <p className="font-display font-extrabold text-ink text-lg leading-none">On-Time</p>
                <p className="text-xs text-grey-600 mt-1">Handover, guaranteed</p>
              </div>
              <div className="absolute bottom-8 right-6 float-slower bg-blue-700 text-white rounded-2xl px-4 py-3 shadow-lift">
                <p className="font-display font-extrabold text-lg leading-none">
                  {stats?.hiddenCharges ? (stats.hiddenCharges.startsWith('₹') ? stats.hiddenCharges : `₹${stats.hiddenCharges}`) : '₹0'}
                </p>
                <p className="text-xs text-blue-100 mt-1">Hidden costs</p>
              </div>
            </div>
            <div className="absolute -z-10 -bottom-6 -right-6 w-full h-full rounded-3xl bg-blue-50 border border-blue-100" aria-hidden="true" />
          </div>
        </div>

        {/* Client logo / trust strip */}
        <div className="relative border-t border-grey-200 bg-white/70 backdrop-blur">
          <div className="max-w-7xl mx-auto px-6 lg:px-8 py-6 flex flex-wrap items-center justify-center gap-x-10 gap-y-3 text-grey-400 font-display font-semibold text-sm uppercase tracking-wide">
            <span>Certified Contractors</span>
            <span aria-hidden="true">•</span>
            <span>Government Approved</span>
            <span aria-hidden="true">•</span>
            <span>ISO Certified Materials</span>
            <span aria-hidden="true">•</span>
            <span>Structural Warranty</span>
          </div>
        </div>
      </section>

      {/* ============ ABOUT ============ */}
      <section id="about" className="py-12 lg:py-14 bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 grid lg:grid-cols-2 gap-16 items-center">
          <motion.div 
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="relative order-2 lg:order-1"
          >
            {/* decorative orbiting rings, purely ambient */}
            <svg className="orbit-ring absolute -top-10 -left-10 w-28 h-28 text-blue-200 opacity-70 pointer-events-none hidden sm:block" viewBox="0 0 100 100" aria-hidden="true">
              <circle cx="50" cy="50" r="46" fill="none" stroke="currentColor" strokeWidth="1.5" strokeDasharray="4 7" strokeLinecap="round" />
            </svg>
            <svg className="orbit-ring-rev absolute -bottom-8 -right-8 w-20 h-20 text-blue-300 opacity-60 pointer-events-none hidden sm:block" viewBox="0 0 100 100" aria-hidden="true">
              <circle cx="50" cy="50" r="46" fill="none" stroke="currentColor" strokeWidth="1.5" strokeDasharray="2 8" strokeLinecap="round" />
            </svg>

            <div className="grid grid-cols-2 gap-4">
              <div className="tilt-card sheen relative flex flex-col justify-end rounded-2xl aspect-[3/4] shadow-card overflow-hidden float-slow">
                <img 
                  src="https://images.unsplash.com/photo-1508450859948-4e04fabaa4ea?auto=format&fit=crop&w=800&q=70" 
                  alt="Residential builds" 
                  loading="lazy" 
                  className="absolute inset-0 w-full h-full object-cover" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-blue-900/85 via-blue-900/25 to-blue-900/10" />
                <p className="relative text-blue-50 font-display font-semibold text-sm p-5">Residential builds</p>
              </div>
              <div className="tilt-card relative flex flex-col justify-end rounded-2xl aspect-[3/4] mt-8 shadow-card overflow-hidden float-slower">
                <img 
                  src="https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=800&q=70" 
                  alt="Renovation projects" 
                  loading="lazy" 
                  className="absolute inset-0 w-full h-full object-cover" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-grey-800/85 via-grey-800/20 to-transparent" />
                <p className="relative text-white font-display font-semibold text-sm p-5">Renovation projects</p>
              </div>
            </div>

            <div className="absolute -bottom-6 -left-6 bg-white border border-grey-200 rounded-2xl px-5 py-4 shadow-lift flex items-center gap-3 float-slow">
              <span className="pulse-ring grid place-items-center w-11 h-11 rounded-xl bg-blue-50 text-blue-700" aria-hidden="true">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
                  <path d="M20 6 9 17l-5-5" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
              <div>
                <p className="font-display font-bold text-ink leading-none"><span>{sqftBuilt || 500}</span>,000+ sq.ft</p>
                <p className="text-xs text-grey-600 mt-1">Built across Tamil Nadu</p>
              </div>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="order-1 lg:order-2"
          >
            <p className="font-display font-bold text-blue-700 text-sm tracking-wide uppercase">About Lifehut Developers</p>
            <h2 className="mt-3 font-display font-extrabold text-3xl sm:text-4xl text-ink text-balance">A local team that treats your home like our own</h2>
            <p className="mt-5 text-grey-600 leading-relaxed">
              We're a Chennai-based construction team working across Tamil Nadu. Whether you're building a new house, renovating an old one, or planning a small commercial space, we keep things simple: honest quotes, steady progress updates, and a team that shows up when we say we will.
            </p>

            <ul className="mt-8 grid sm:grid-cols-2 gap-5 list-none p-0">
              <motion.li 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="flex gap-3"
              >
                <span className="icon-pop mt-0.5 grid place-items-center w-9 h-9 rounded-lg bg-blue-50 text-blue-700 shrink-0" aria-hidden="true">
                  <svg className="w-4.5 h-4.5" viewBox="0 0 24 24" fill="none">
                    <path d="M12 3v3M12 18v3M4.2 4.2l2.1 2.1M17.7 17.7l2.1 2.1M3 12h3M18 12h3M4.2 19.8l2.1-2.1M17.7 6.3l2.1-2.1" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                  </svg>
                </span>
                <div>
                  <p className="font-display font-bold text-ink">Quality materials</p>
                  <p className="text-sm text-grey-600 mt-0.5">Only trusted, tested brands go into your build.</p>
                </div>
              </motion.li>
              
              <motion.li 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="flex gap-3"
              >
                <span className="icon-pop mt-0.5 grid place-items-center w-9 h-9 rounded-lg bg-blue-50 text-blue-700 shrink-0" aria-hidden="true">
                  <svg className="w-4.5 h-4.5" viewBox="0 0 24 24" fill="none">
                    <path d="M12 8v5l3 3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                    <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8" />
                  </svg>
                </span>
                <div>
                  <p className="font-display font-bold text-ink">On-time delivery</p>
                  <p className="text-sm text-grey-600 mt-0.5">Clear timelines, tracked weekly, shared with you.</p>
                </div>
              </motion.li>

              <motion.li 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="flex gap-3"
              >
                <span className="icon-pop mt-0.5 grid place-items-center w-9 h-9 rounded-lg bg-blue-50 text-blue-700 shrink-0" aria-hidden="true">
                  <svg className="w-4.5 h-4.5" viewBox="0 0 24 24" fill="none">
                    <path d="M3 21h18M5 21V9l7-5 7 5v12M9 21v-6h6v6" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
                  </svg>
                </span>
                <div>
                  <p className="font-display font-bold text-ink">Transparent pricing</p>
                  <p className="text-sm text-grey-600 mt-0.5">One detailed quote — no hidden costs later.</p>
                </div>
              </motion.li>

              <motion.li 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="flex gap-3"
              >
                <span className="icon-pop mt-0.5 grid place-items-center w-9 h-9 rounded-lg bg-blue-50 text-blue-700 shrink-0" aria-hidden="true">
                  <svg className="w-4.5 h-4.5" viewBox="0 0 24 24" fill="none">
                    <circle cx="9" cy="8" r="3" stroke="currentColor" strokeWidth="1.8" />
                    <path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6M15 8a3 3 0 1 1 3 3M21 20c0-2.6-1.7-4.8-4-5.6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                  </svg>
                </span>
                <div>
                  <p className="font-display font-bold text-ink">Skilled, supervised team</p>
                  <p className="text-sm text-grey-600 mt-0.5">Every site has a dedicated supervisor on-call.</p>
                </div>
              </motion.li>
            </ul>
          </motion.div>
        </div>
      </section>

      {/* ============ SERVICES ============ */}
      <section id="services" className="py-12 lg:py-14 bg-grey-50 border-y border-grey-200 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="max-w-2xl"
            >
              <p className="font-display font-bold text-blue-700 text-sm tracking-wide uppercase">What we do</p>
              <h2 className="mt-3 font-display font-extrabold text-3xl sm:text-4xl text-ink text-balance">Services built around your project, not ours</h2>
              <p className="mt-4 text-grey-600 leading-relaxed">Pick just what you need — from a single room makeover to a full turnkey house build.</p>
            </motion.div>
            {setActiveTab && (
              <motion.button 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.1 }}
                onClick={() => { setActiveTab('services'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                className="hidden sm:inline-flex items-center gap-2 font-display font-bold text-blue-700 hover:text-blue-900 transition-colors cursor-pointer group"
              >
                <span>View all services &amp; specifications</span>
                <svg className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </motion.button>
            )}
          </div>

          <div className="mt-14 grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {servicesList.map((service, index) => (
              <motion.article 
                key={service.id || index}
                initial={{ opacity: 0, y: 45, scale: 0.95 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true, amount: 0.15 }}
                transition={{ duration: 0.6, delay: 0.05 + (index % 6) * 0.1, ease: [0.16, 1, 0.3, 1] }}
                onClick={() => { 
                  if (setActiveTab) { 
                    setActiveTab('services'); 
                    setTimeout(() => {
                      window.dispatchEvent(new CustomEvent('nav-service', { detail: service.id }));
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }, 50);
                  } 
                }}
                className="lift-hover group bg-white rounded-2xl border border-grey-200 p-7 shadow-soft hover:shadow-card hover:border-blue-300 transition-all cursor-pointer flex flex-col justify-between"
              >
                <div>
                  <span className="grid place-items-center w-12 h-12 rounded-xl bg-blue-50 text-blue-700 group-hover:bg-blue-700 group-hover:text-white transition-colors" aria-hidden="true">
                    {renderServiceIcon(service, index)}
                  </span>
                  <h3 className="mt-5 font-display font-bold text-lg text-ink group-hover:text-blue-700 transition-colors">{service.title}</h3>
                  <p className="mt-2 text-sm text-grey-600 leading-relaxed">{service.description}</p>
                </div>
                <div className="mt-6 flex items-center gap-1.5 text-xs font-bold text-blue-700 group-hover:text-blue-900">
                  <span>{getServiceActionLabel(service, index)}</span>
                  <svg className="w-3.5 h-3.5 transform group-hover:translate-x-1 transition-transform" viewBox="0 0 24 24" fill="none">
                    <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      {/* ============ PROCESS ============ */}
      <section id="process" className="py-12 lg:py-14 bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="max-w-2xl mx-auto text-center">
            <p className="font-display font-bold text-blue-700 text-sm tracking-wide uppercase">How it works</p>
            <h2 className="mt-3 font-display font-extrabold text-3xl sm:text-4xl text-ink text-balance">Four simple steps, start to finish</h2>
          </div>

          <div className="mt-16 relative grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Step 1 - Slides from right end to position */}
            <motion.div 
              initial={{ opacity: 0, x: 120 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.7, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
              className="relative"
            >
              <div className="text-center lg:text-left">
                <div className="w-14 h-14 mx-auto lg:mx-0 rounded-2xl bg-blue-700 text-white grid place-items-center font-display font-extrabold text-lg shadow-lift relative z-10 pulse-ring">01</div>
                <h3 className="mt-5 font-display font-bold text-ink">Free Consultation</h3>
                <p className="mt-2 text-sm text-grey-600 leading-relaxed">Share your plot, budget and needs. We visit the site and understand what you want.</p>
              </div>
            </motion.div>

            {/* Step 2 - Slides from right end to position */}
            <motion.div 
              initial={{ opacity: 0, x: 120 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.7, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
              className="relative"
            >
              <div className="text-center lg:text-left">
                <div className="w-14 h-14 mx-auto lg:mx-0 rounded-2xl bg-blue-700 text-white grid place-items-center font-display font-extrabold text-lg shadow-lift relative z-10 pulse-ring">02</div>
                <h3 className="mt-5 font-display font-bold text-ink">Design &amp; Estimate</h3>
                <p className="mt-2 text-sm text-grey-600 leading-relaxed">We share a design and a clear, itemised quote before any work begins.</p>
              </div>
            </motion.div>

            {/* Step 3 - Slides from right end to position */}
            <motion.div 
              initial={{ opacity: 0, x: 120 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.7, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="relative"
            >
              <div className="text-center lg:text-left">
                <div className="w-14 h-14 mx-auto lg:mx-0 rounded-2xl bg-blue-700 text-white grid place-items-center font-display font-extrabold text-lg shadow-lift relative z-10 pulse-ring">03</div>
                <h3 className="mt-5 font-display font-bold text-ink">Construction</h3>
                <p className="mt-2 text-sm text-grey-600 leading-relaxed">Our supervised team builds to plan, with weekly photo and progress updates.</p>
              </div>
            </motion.div>

            {/* Step 4 - Slides from right end to position */}
            <motion.div 
              initial={{ opacity: 0, x: 120 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.7, delay: 0.55, ease: [0.16, 1, 0.3, 1] }}
              className="relative"
            >
              <div className="text-center lg:text-left">
                <div className="w-14 h-14 mx-auto lg:mx-0 rounded-2xl bg-blue-700 text-white grid place-items-center font-display font-extrabold text-lg shadow-lift relative z-10 pulse-ring">04</div>
                <h3 className="mt-5 font-display font-bold text-ink">Handover &amp; Support</h3>
                <p className="mt-2 text-sm text-grey-600 leading-relaxed">A final walkthrough together, then ongoing support after you move in.</p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ============ PROJECTS ============ */}
      <section id="projects" className="py-12 lg:py-14 bg-grey-50 border-y border-grey-200 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="max-w-xl"
            >
              <p className="font-display font-bold text-blue-700 text-sm tracking-wide uppercase">Our work</p>
              <h2 className="mt-3 font-display font-extrabold text-3xl sm:text-4xl text-ink text-balance">Recent projects across Tamil Nadu</h2>
              <p className="mt-3 text-grey-600 text-sm">Explore real villas, independent houses and renovations built with precision.</p>
            </motion.div>
            {setActiveTab && (
              <motion.button 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.1 }}
                onClick={() => { setActiveTab('projects'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                className="hidden sm:inline-flex items-center gap-2 font-display font-bold text-blue-700 hover:text-blue-900 transition-colors cursor-pointer group"
              >
                <span>Explore full project portfolio &amp; gallery</span>
                <svg className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </motion.button>
            )}
          </div>

          <div className="mt-14 grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {recentProjectsList.map((proj, idx) => (
              <motion.figure 
                key={proj.id}
                initial={{ opacity: 0, y: 40, scale: 0.96 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true, amount: 0.15 }}
                transition={{ duration: 0.6, delay: 0.06 * (idx + 1), ease: [0.16, 1, 0.3, 1] }}
                onClick={() => handleProjectClick(proj.id)}
                className="lift-hover group relative rounded-2xl overflow-hidden shadow-soft hover:shadow-card border border-grey-200 bg-white cursor-pointer flex flex-col transition-all"
              >
                <div className="aspect-[4/3] bg-slate-100 relative overflow-hidden">
                  <img 
                    src={proj.heroImage || "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80"} 
                    alt={proj.name}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-slate-950/20 to-transparent opacity-70 group-hover:opacity-80 transition-opacity" />
                  
                  {/* Top Badges */}
                  <div className="absolute top-3 left-3 flex flex-wrap gap-1.5 z-10">
                    <span className="text-white text-[10px] font-bold uppercase tracking-wider bg-black/50 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/20">
                      {proj.bedrooms ? `${proj.bedrooms} BHK` : 'Villa'} {proj.floors ? `· ${proj.floors} Floors` : ''}
                    </span>
                    {proj.status === 'Ongoing' ? (
                      <span className="text-amber-950 text-[10px] font-extrabold uppercase tracking-wider bg-amber-400 backdrop-blur-md px-2 py-0.5 rounded-full shadow-sm flex items-center gap-1">
                        🟡 On-going
                      </span>
                    ) : (
                      <span className="text-amber-950 text-[10px] font-extrabold uppercase tracking-wider bg-amber-400 backdrop-blur-md px-2 py-0.5 rounded-full shadow-sm">
                        Recent Project
                      </span>
                    )}
                  </div>

                  {/* Bottom Overlay Location & Budget */}
                  <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white text-xs z-10">
                    <span className="font-semibold drop-shadow-sm flex items-center gap-1">
                      <span className="text-amber-400">📍</span> {proj.location}
                    </span>
                    {proj.budget && (
                      <span className="font-bold bg-blue-700/90 text-white px-2 py-0.5 rounded-md text-[11px] shadow">
                        {proj.budget}
                      </span>
                    )}
                  </div>
                </div>

                <figcaption className="p-5 bg-white flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <p className="font-display font-bold text-ink text-base group-hover:text-blue-700 transition-colors line-clamp-1">
                        {proj.name}
                      </p>
                      <span className="text-xs font-bold text-blue-700 whitespace-nowrap group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5">
                        View →
                      </span>
                    </div>
                    <p className="text-xs text-grey-600 mt-1.5 flex items-center gap-2">
                      <span>{proj.builtUpArea || 'Turnkey Villa'}</span>
                      <span>·</span>
                      <span>{proj.status === 'Ongoing' ? (proj.completionDate ? `Target ${proj.completionDate}` : 'In Progress') : (proj.completionDate ? `Completed ${proj.completionDate}` : 'Handed over')}</span>
                    </p>
                  </div>
                </figcaption>
              </motion.figure>
            ))}
          </div>

          <motion.button 
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            onClick={() => { if (setActiveTab) { setActiveTab('projects'); window.scrollTo({ top: 0, behavior: 'smooth' }); } }}
            className="sm:hidden mt-8 inline-flex items-center gap-2 font-display font-semibold text-blue-700 cursor-pointer"
          >
            <span>Explore full project portfolio &amp; gallery</span>
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </motion.button>
        </div>
      </section>

      {/* ============ TESTIMONIALS ============ */}
      <section aria-label="Client testimonials" className="py-12 lg:py-14 bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="max-w-2xl mx-auto text-center"
          >
            <p className="font-display font-bold text-blue-700 text-sm tracking-wide uppercase">Client stories</p>
            <h2 className="mt-3 font-display font-extrabold text-3xl sm:text-4xl text-ink text-balance">What families in Tamil Nadu tell us</h2>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="testimonial-marquee mt-14"
          >
            <div className="testimonial-track gap-6 pr-6">
              {/* First Track */}
              <div className="flex gap-6">
                <figure className="testimonial-card shrink-0 lift-hover bg-grey-50 border border-grey-200 rounded-2xl p-7">
                  <div className="flex gap-1 text-blue-700" aria-hidden="true">
                    {[...Array(5)].map((_, i) => (
                      <svg key={i} className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor"><path d="M10 1l2.6 5.9 6.4.6-4.8 4.3 1.4 6.2L10 14.9 4.4 18l1.4-6.2L1 7.5l6.4-.6L10 1Z" /></svg>
                    ))}
                  </div>
                  <blockquote className="mt-4 text-grey-700 leading-relaxed">"They finished our house almost on the date they promised. Every cost was explained upfront — nothing came as a surprise."</blockquote>
                  <figcaption className="mt-5 flex items-center gap-3">
                    <span className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 grid place-items-center font-display font-bold" aria-hidden="true">A</span>
                    <div>
                      <p className="font-display font-bold text-ink text-sm">Arun Kumar</p>
                      <p className="text-xs text-grey-600">Ambattur, Chennai</p>
                    </div>
                  </figcaption>
                </figure>

                <figure className="testimonial-card shrink-0 lift-hover bg-grey-50 border border-grey-200 rounded-2xl p-7">
                  <div className="flex gap-1 text-blue-700" aria-hidden="true">
                    {[...Array(5)].map((_, i) => (
                      <svg key={i} className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor"><path d="M10 1l2.6 5.9 6.4.6-4.8 4.3 1.4 6.2L10 14.9 4.4 18l1.4-6.2L1 7.5l6.4-.6L10 1Z" /></svg>
                    ))}
                  </div>
                  <blockquote className="mt-4 text-grey-700 leading-relaxed">"Our renovation could have been very stressful, but the site supervisor kept us updated every week. Genuinely good people to work with."</blockquote>
                  <figcaption className="mt-5 flex items-center gap-3">
                    <span className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 grid place-items-center font-display font-bold" aria-hidden="true">P</span>
                    <div>
                      <p className="font-display font-bold text-ink text-sm">Priya Mohan</p>
                      <p className="text-xs text-grey-600">Anna Nagar, Chennai</p>
                    </div>
                  </figcaption>
                </figure>

                <figure className="testimonial-card shrink-0 lift-hover bg-grey-50 border border-grey-200 rounded-2xl p-7">
                  <div className="flex gap-1 text-blue-700" aria-hidden="true">
                    {[...Array(5)].map((_, i) => (
                      <svg key={i} className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor"><path d="M10 1l2.6 5.9 6.4.6-4.8 4.3 1.4 6.2L10 14.9 4.4 18l1.4-6.2L1 7.5l6.4-.6L10 1Z" /></svg>
                    ))}
                  </div>
                  <blockquote className="mt-4 text-grey-700 leading-relaxed">"We compared three builders before choosing Lifehut Developers. Their quote was the clearest one — and the final bill matched it exactly."</blockquote>
                  <figcaption className="mt-5 flex items-center gap-3">
                    <span className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 grid place-items-center font-display font-bold" aria-hidden="true">S</span>
                    <div>
                      <p className="font-display font-bold text-ink text-sm">Senthil Raj</p>
                      <p className="text-xs text-grey-600">Coimbatore</p>
                    </div>
                  </figcaption>
                </figure>

                <figure className="testimonial-card shrink-0 lift-hover bg-grey-50 border border-grey-200 rounded-2xl p-7">
                  <div className="flex gap-1 text-blue-700" aria-hidden="true">
                    {[...Array(5)].map((_, i) => (
                      <svg key={i} className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor"><path d="M10 1l2.6 5.9 6.4.6-4.8 4.3 1.4 6.2L10 14.9 4.4 18l1.4-6.2L1 7.5l6.4-.6L10 1Z" /></svg>
                    ))}
                  </div>
                  <blockquote className="mt-4 text-grey-700 leading-relaxed">"Everything was explained clearly before we signed anything — no pressure, no confusing terms, just straight answers to our questions."</blockquote>
                  <figcaption className="mt-5 flex items-center gap-3">
                    <span className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 grid place-items-center font-display font-bold" aria-hidden="true">L</span>
                    <div>
                      <p className="font-display font-bold text-ink text-sm">Lakshmi Narayanan</p>
                      <p className="text-xs text-grey-600">Trichy</p>
                    </div>
                  </figcaption>
                </figure>

                <figure className="testimonial-card shrink-0 lift-hover bg-grey-50 border border-grey-200 rounded-2xl p-7">
                  <div className="flex gap-1 text-blue-700" aria-hidden="true">
                    {[...Array(5)].map((_, i) => (
                      <svg key={i} className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor"><path d="M10 1l2.6 5.9 6.4.6-4.8 4.3 1.4 6.2L10 14.9 4.4 18l1.4-6.2L1 7.5l6.4-.6L10 1Z" /></svg>
                    ))}
                  </div>
                  <blockquote className="mt-4 text-grey-700 leading-relaxed">"Our shop renovation was completed in under two months, exactly as promised. Clear communication from day one to the final handover."</blockquote>
                  <figcaption className="mt-5 flex items-center gap-3">
                    <span className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 grid place-items-center font-display font-bold" aria-hidden="true">M</span>
                    <div>
                      <p className="font-display font-bold text-ink text-sm">Meena Sundar</p>
                      <p className="text-xs text-grey-600">Madurai</p>
                    </div>
                  </figcaption>
                </figure>

                <figure className="testimonial-card shrink-0 lift-hover bg-grey-50 border border-grey-200 rounded-2xl p-7">
                  <div className="flex gap-1 text-blue-700" aria-hidden="true">
                    {[...Array(5)].map((_, i) => (
                      <svg key={i} className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor"><path d="M10 1l2.6 5.9 6.4.6-4.8 4.3 1.4 6.2L10 14.9 4.4 18l1.4-6.2L1 7.5l6.4-.6L10 1Z" /></svg>
                    ))}
                  </div>
                  <blockquote className="mt-4 text-grey-700 leading-relaxed">"Professional from the first site visit to the final handover. Easy to reach, easy to work with — I'd recommend them to any family building in Chennai."</blockquote>
                  <figcaption className="mt-5 flex items-center gap-3">
                    <span className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 grid place-items-center font-display font-bold" aria-hidden="true">K</span>
                    <div>
                      <p className="font-display font-bold text-ink text-sm">Karthik Raja</p>
                      <p className="text-xs text-grey-600">Velachery, Chennai</p>
                    </div>
                  </figcaption>
                </figure>
              </div>

              {/* Duplicate track for seamless infinite marquee */}
              <div className="flex gap-6" aria-hidden="true">
                <figure className="testimonial-card shrink-0 bg-grey-50 border border-grey-200 rounded-2xl p-7">
                  <div className="flex gap-1 text-blue-700">
                    {[...Array(5)].map((_, i) => (
                      <svg key={i} className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor"><path d="M10 1l2.6 5.9 6.4.6-4.8 4.3 1.4 6.2L10 14.9 4.4 18l1.4-6.2L1 7.5l6.4-.6L10 1Z" /></svg>
                    ))}
                  </div>
                  <blockquote className="mt-4 text-grey-700 leading-relaxed">"They finished our house almost on the date they promised. Every cost was explained upfront — nothing came as a surprise."</blockquote>
                  <figcaption className="mt-5 flex items-center gap-3">
                    <span className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 grid place-items-center font-display font-bold">A</span>
                    <div>
                      <p className="font-display font-bold text-ink text-sm">Arun Kumar</p>
                      <p className="text-xs text-grey-600">Ambattur, Chennai</p>
                    </div>
                  </figcaption>
                </figure>

                <figure className="testimonial-card shrink-0 bg-grey-50 border border-grey-200 rounded-2xl p-7">
                  <div className="flex gap-1 text-blue-700">
                    {[...Array(5)].map((_, i) => (
                      <svg key={i} className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor"><path d="M10 1l2.6 5.9 6.4.6-4.8 4.3 1.4 6.2L10 14.9 4.4 18l1.4-6.2L1 7.5l6.4-.6L10 1Z" /></svg>
                    ))}
                  </div>
                  <blockquote className="mt-4 text-grey-700 leading-relaxed">"Our renovation could have been very stressful, but the site supervisor kept us updated every week. Genuinely good people to work with."</blockquote>
                  <figcaption className="mt-5 flex items-center gap-3">
                    <span className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 grid place-items-center font-display font-bold">P</span>
                    <div>
                      <p className="font-display font-bold text-ink text-sm">Priya Mohan</p>
                      <p className="text-xs text-grey-600">Anna Nagar, Chennai</p>
                    </div>
                  </figcaption>
                </figure>

                <figure className="testimonial-card shrink-0 bg-grey-50 border border-grey-200 rounded-2xl p-7">
                  <div className="flex gap-1 text-blue-700">
                    {[...Array(5)].map((_, i) => (
                      <svg key={i} className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor"><path d="M10 1l2.6 5.9 6.4.6-4.8 4.3 1.4 6.2L10 14.9 4.4 18l1.4-6.2L1 7.5l6.4-.6L10 1Z" /></svg>
                    ))}
                  </div>
                  <blockquote className="mt-4 text-grey-700 leading-relaxed">"We compared three builders before choosing Lifehut Developers. Their quote was the clearest one — and the final bill matched it exactly."</blockquote>
                  <figcaption className="mt-5 flex items-center gap-3">
                    <span className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 grid place-items-center font-display font-bold">S</span>
                    <div>
                      <p className="font-display font-bold text-ink text-sm">Senthil Raj</p>
                      <p className="text-xs text-grey-600">Coimbatore</p>
                    </div>
                  </figcaption>
                </figure>

                <figure className="testimonial-card shrink-0 bg-grey-50 border border-grey-200 rounded-2xl p-7">
                  <div className="flex gap-1 text-blue-700">
                    {[...Array(5)].map((_, i) => (
                      <svg key={i} className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor"><path d="M10 1l2.6 5.9 6.4.6-4.8 4.3 1.4 6.2L10 14.9 4.4 18l1.4-6.2L1 7.5l6.4-.6L10 1Z" /></svg>
                    ))}
                  </div>
                  <blockquote className="mt-4 text-grey-700 leading-relaxed">"Everything was explained clearly before we signed anything — no pressure, no confusing terms, just straight answers to our questions."</blockquote>
                  <figcaption className="mt-5 flex items-center gap-3">
                    <span className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 grid place-items-center font-display font-bold">L</span>
                    <div>
                      <p className="font-display font-bold text-ink text-sm">Lakshmi Narayanan</p>
                      <p className="text-xs text-grey-600">Trichy</p>
                    </div>
                  </figcaption>
                </figure>

                <figure className="testimonial-card shrink-0 bg-grey-50 border border-grey-200 rounded-2xl p-7">
                  <div className="flex gap-1 text-blue-700">
                    {[...Array(5)].map((_, i) => (
                      <svg key={i} className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor"><path d="M10 1l2.6 5.9 6.4.6-4.8 4.3 1.4 6.2L10 14.9 4.4 18l1.4-6.2L1 7.5l6.4-.6L10 1Z" /></svg>
                    ))}
                  </div>
                  <blockquote className="mt-4 text-grey-700 leading-relaxed">"Our shop renovation was completed in under two months, exactly as promised. Clear communication from day one to the final handover."</blockquote>
                  <figcaption className="mt-5 flex items-center gap-3">
                    <span className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 grid place-items-center font-display font-bold">M</span>
                    <div>
                      <p className="font-display font-bold text-ink text-sm">Meena Sundar</p>
                      <p className="text-xs text-grey-600">Madurai</p>
                    </div>
                  </figcaption>
                </figure>

                <figure className="testimonial-card shrink-0 bg-grey-50 border border-grey-200 rounded-2xl p-7">
                  <div className="flex gap-1 text-blue-700">
                    {[...Array(5)].map((_, i) => (
                      <svg key={i} className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor"><path d="M10 1l2.6 5.9 6.4.6-4.8 4.3 1.4 6.2L10 14.9 4.4 18l1.4-6.2L1 7.5l6.4-.6L10 1Z" /></svg>
                    ))}
                  </div>
                  <blockquote className="mt-4 text-grey-700 leading-relaxed">"Professional from the first site visit to the final handover. Easy to reach, easy to work with — I'd recommend them to any family building in Chennai."</blockquote>
                  <figcaption className="mt-5 flex items-center gap-3">
                    <span className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 grid place-items-center font-display font-bold">K</span>
                    <div>
                      <p className="font-display font-bold text-ink text-sm">Karthik Raja</p>
                      <p className="text-xs text-grey-600">Velachery, Chennai</p>
                    </div>
                  </figcaption>
                </figure>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ============ GOOGLE REVIEWS ============ */}
      <section aria-label="Google reviews" className="py-12 lg:py-14 bg-grey-50 border-y border-grey-200 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="max-w-2xl mx-auto text-center"
          >
            <p className="font-display font-bold text-blue-700 text-sm tracking-wide uppercase">Verified reviews</p>
            <h2 className="mt-3 font-display font-extrabold text-3xl sm:text-4xl text-ink text-balance">What clients say about us on Google</h2>
          </motion.div>

          {/* Live Trustindex Google Reviews Embedded Widget */}
          <div className="mt-8">
            <TrustindexWidget />
          </div>

          <p className="mt-6 text-center text-xs text-grey-400">Verified Google Business Profile reviews for Lifehut Developers, Chennai.</p>
        </div>
      </section>

      {/* ============ CTA BANNER ============ */}
      <section className="relative py-12 lg:py-14 mesh border-y border-grey-200 overflow-hidden">
        <div className="absolute inset-0 blueprint-grid opacity-60" aria-hidden="true" />
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          whileInView={{ opacity: 1, scale: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="relative max-w-4xl mx-auto px-6 text-center"
        >
          <h2 className="font-display font-extrabold text-3xl sm:text-4xl text-ink text-balance">Ready to start building your dream home?</h2>
          <p className="mt-4 text-grey-600 max-w-xl mx-auto">Tell us about your plot and budget — we'll get back with a free, no-obligation quote within 24 hours.</p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <button 
              onClick={() => scrollToSection('contact')}
              className="inline-flex items-center gap-2 bg-blue-700 hover:bg-blue-900 text-white font-display font-semibold px-7 py-3.5 rounded-full shadow-lift hover:-translate-y-0.5 transition-all duration-300 cursor-pointer"
            >
              Get Your Free Quote
            </button>
            <a 
              href={`https://wa.me/${phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent('Hello Lifehut Developers, I would like to inquire about your services.')}`} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="inline-flex items-center gap-2 bg-[#25D366] hover:bg-[#20bd5a] text-white font-display font-semibold px-7 py-3.5 rounded-full shadow-soft hover:-translate-y-0.5 transition-all duration-300"
            >
              <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91C2.13 13.66 2.59 15.36 3.45 16.86L2.05 22L7.3 20.62C8.75 21.41 10.38 21.83 12.04 21.83C17.5 21.83 21.95 17.38 21.95 11.92C21.95 9.27 20.92 6.78 19.05 4.91C17.18 3.03 14.69 2 12.04 2ZM12.05 3.67C14.25 3.67 16.31 4.53 17.87 6.09C19.42 7.65 20.28 9.72 20.28 11.92C20.28 16.46 16.59 20.15 12.04 20.15C10.56 20.15 9.11 19.76 7.85 19.01L7.55 18.83L4.43 19.65L5.26 16.61L5.06 16.29C4.24 14.99 3.8 13.47 3.8 11.91C3.81 7.37 7.5 3.67 12.05 3.67ZM8.53 7.33C8.37 7.33 8.1 7.39 7.87 7.64C7.65 7.89 7.02 8.48 7.02 9.68C7.02 10.88 7.89 12.04 8.01 12.2C8.13 12.37 9.72 14.82 12.16 15.87C12.74 16.12 13.19 16.27 13.54 16.38C14.12 16.57 14.66 16.54 15.08 16.48C15.54 16.41 16.51 15.89 16.71 15.32C16.92 14.76 16.92 14.28 16.86 14.18C16.8 14.07 16.63 14.01 16.38 13.88C16.13 13.76 14.89 13.15 14.66 13.07C14.43 12.98 14.27 12.94 14.1 13.19C13.94 13.43 13.47 13.99 13.33 14.15C13.19 14.32 13.04 14.34 12.79 14.21C12.54 14.09 11.75 13.83 10.8 12.99C10.07 12.33 9.57 11.52 9.42 11.27C9.28 11.02 9.4 10.89 9.53 10.76C9.64 10.65 9.78 10.47 9.9 10.32C10.02 10.18 10.07 10.07 10.15 9.91C10.23 9.74 10.19 9.6 10.13 9.47C10.07 9.35 9.6 8.21 9.4 7.74C9.21 7.27 9.01 7.34 8.87 7.33C8.73 7.33 8.57 7.33 8.53 7.33Z" />
              </svg>
              <span>Chat on WhatsApp</span>
            </a>
          </div>
        </motion.div>
      </section>

      {/* ============ FAQ ============ */}
      <section id="faq" className="py-12 lg:py-14 bg-white overflow-hidden">
        <div className="max-w-3xl mx-auto px-6 lg:px-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center"
          >
            <p className="font-display font-bold text-blue-700 text-sm tracking-wide uppercase">Questions</p>
            <h2 className="mt-3 font-display font-extrabold text-3xl sm:text-4xl text-ink text-balance">Frequently asked questions</h2>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="mt-12 space-y-3" 
            id="faq-list"
          >
            {[
              {
                id: 1,
                q: "How long does it take to build a house?",
                a: "A typical independent house of 2,000–2,500 sq.ft takes about 5 to 7 months, from foundation to handover. We share an exact timeline with your quote."
              },
              {
                id: 2,
                q: "Do you help with government approvals?",
                a: "Yes. We assist with building plan approvals, permits and other paperwork required by your local municipality, so you don't have to run between offices."
              },
              {
                id: 3,
                q: "Which areas in Tamil Nadu do you serve?",
                a: "We're based in Chennai and take on projects across Tamil Nadu, including Coimbatore, Madurai, Trichy and surrounding towns. Get in touch to check your location."
              },
              {
                id: 4,
                q: "Can I see photos of completed projects?",
                a: "Of course. We're happy to share photos and, where possible, arrange a visit to a nearby completed or ongoing site so you can see our work firsthand."
              },
              {
                id: 5,
                q: "How do I get a price estimate?",
                a: "Fill in the contact form below or call us directly. We'll visit your site, understand your needs, and send a detailed, itemised quote — free of charge."
              }
            ].map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div 
                  key={faq.id} 
                  className={`border rounded-2xl transition-all duration-200 overflow-hidden ${
                    isOpen ? 'border-blue-300 bg-white shadow-soft' : 'border-grey-200 bg-grey-50 hover:border-grey-300 hover:bg-white/80'
                  }`}
                >
                  <h3>
                    <button
                      onClick={() => toggleFaq(idx)}
                      aria-expanded={isOpen}
                      aria-controls={`faq-answer-${faq.id}`}
                      id={`faq-question-${faq.id}`}
                      className="w-full flex items-center justify-between gap-4 text-left px-6 py-5 font-display font-bold text-ink cursor-pointer focus:outline-none transition-colors"
                    >
                      <span className="text-base sm:text-lg">{faq.q}</span>
                      <span className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-all duration-300 ${
                        isOpen ? 'bg-blue-700 text-white rotate-45 shadow-sm' : 'bg-white text-blue-700 border border-grey-200 hover:bg-blue-50'
                      }`}>
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                          <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
                        </svg>
                      </span>
                    </button>
                  </h3>
                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        id={`faq-answer-${faq.id}`}
                        role="region"
                        aria-labelledby={`faq-question-${faq.id}`}
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
                        className="overflow-hidden"
                      >
                        <div className="px-6 pb-5 pt-1 text-grey-600 leading-relaxed border-t border-grey-100 text-sm sm:text-base">
                          {faq.a}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* ============ CONTACT ============ */}
      <section id="contact" className="py-12 lg:py-14 bg-grey-50 border-t border-grey-200 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 grid lg:grid-cols-5 gap-12">
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-2"
          >
            <p className="font-display font-bold text-blue-700 text-sm tracking-wide uppercase">Get in touch</p>
            <h2 className="mt-3 font-display font-extrabold text-3xl text-ink text-balance">Let's talk about your project</h2>
            <p className="mt-4 text-grey-600 leading-relaxed">Reach out for a free site visit and quote. We usually reply within a few hours.</p>

            <ul className="mt-8 space-y-5 list-none p-0">
              <li className="flex items-start gap-4">
                <span className="grid place-items-center w-11 h-11 rounded-xl bg-white border border-grey-200 text-blue-700 shrink-0" aria-hidden="true">
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
                    <path d="M6.6 10.8a15.9 15.9 0 0 0 6.6 6.6l2.2-2.2a1 1 0 0 1 1-.25 9 9 0 0 0 2.8.45 1 1 0 0 1 1 1V19.4a1 1 0 0 1-1 1A16.4 16.4 0 0 1 3 4a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1 9 9 0 0 0 .45 2.8 1 1 0 0 1-.25 1L6.6 10.8Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
                  </svg>
                </span>
                <div>
                  <p className="font-display font-bold text-ink text-sm">Call us</p>
                  <a href={`tel:${phone.replace(/[^0-9+]/g, '')}`} className="text-grey-600 hover:text-blue-700 transition-colors">{phone}</a>
                </div>
              </li>
              <li className="flex items-start gap-4">
                <span className="grid place-items-center w-11 h-11 rounded-xl bg-white border border-grey-200 text-blue-700 shrink-0" aria-hidden="true">
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
                    <rect x="3" y="5" width="18" height="14" rx="2" stroke="currentColor" strokeWidth="1.6" />
                    <path d="m3 7 9 6 9-6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
                <div>
                  <p className="font-display font-bold text-ink text-sm">Email us</p>
                  <a href={`mailto:${email}`} className="text-grey-600 hover:text-blue-700 transition-colors">{email}</a>
                </div>
              </li>
              <li className="flex items-start gap-4">
                <span className="grid place-items-center w-11 h-11 rounded-xl bg-white border border-grey-200 text-blue-700 shrink-0" aria-hidden="true">
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
                    <path d="M12 21s-7-6.1-7-11.5A7 7 0 0 1 19 9.5C19 14.9 12 21 12 21Z" stroke="currentColor" strokeWidth="1.6" />
                    <circle cx="12" cy="9.5" r="2.4" stroke="currentColor" strokeWidth="1.6" />
                  </svg>
                </span>
                <div>
                  <p className="font-display font-bold text-ink text-sm">Visit us</p>
                  <p className="text-grey-600 text-sm leading-relaxed">{address}</p>
                </div>
              </li>
            </ul>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="lg:col-span-3"
          >
            <GetInTouchForm />
          </motion.div>
        </div>
      </section>

    </div>
  );
};
