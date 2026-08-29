import React, { useState, useEffect, useRef } from 'react';
import { Search, Menu, X, ArrowRight, UserCheck, ShieldAlert, Phone, Clock, MapPin } from 'lucide-react';
import logoImg from '../assets/images/logo.png';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isAdminLoggedIn: boolean;
  onAdminClick: () => void;
  onLogout: () => void;
  phone?: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  isAdminLoggedIn,
  onAdminClick,
  onLogout,
  phone = "+91 98765 43210"
}) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchSuggestions, setSearchSuggestions] = useState<{
    services: { id: string; title: string; desc: string }[];
    projects: { id: string; title: string; desc: string }[];
    blogs: { id: string; title: string; desc: string }[];
  } | null>(null);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const delayDebounce = setTimeout(async () => {
      if (searchQuery.trim().length > 1) {
        try {
          const res = await fetch(`/api/search?q=${encodeURIComponent(searchQuery)}`);
          const data = await res.json();
          setSearchSuggestions(data);
        } catch {
          // safe fallback
        }
      } else {
        setSearchSuggestions(null);
      }
    }, 200);

    return () => clearTimeout(delayDebounce);
  }, [searchQuery]);

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setIsSearchFocused(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const scrollToAnchor = (targetId: string) => {
    let attempts = 0;
    const tryScroll = () => {
      const el = document.getElementById(targetId);
      if (el) {
        const headerOffset = 84;
        const elementPosition = el.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
        window.scrollTo({
          top: Math.max(0, offsetPosition),
          behavior: 'smooth'
        });
      } else if (attempts < 30) {
        attempts++;
        setTimeout(tryScroll, 40);
      }
    };
    // Initial attempt plus scheduled retry after DOM transitions
    tryScroll();
  };

  const handleNavClick = (sectionOrTab: string) => {
    setIsMobileMenuOpen(false);
    
    // In-page section anchors that belong specifically on the Home page
    const homeAnchorSections = ['faq', 'contact', 'about', 'services-preview', 'process', 'projects-preview'];
    
    if (homeAnchorSections.includes(sectionOrTab)) {
      if (activeTab !== 'home') {
        setActiveTab('home');
      }
      setTimeout(() => {
        scrollToAnchor(sectionOrTab);
      }, 50);
      return;
    }

    // Direct tab navigation to actual pages: 'home', 'services', 'projects', 'pricing', 'blogs', 'quote', 'admin'
    setActiveTab(sectionOrTab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSuggestionClick = (type: string, id: string) => {
    setSearchQuery('');
    setSearchSuggestions(null);
    setIsSearchFocused(false);
    setActiveTab(type);

    if (type === 'blogs') {
      window.dispatchEvent(new CustomEvent('nav-blog', { detail: id }));
    } else if (type === 'services') {
      window.dispatchEvent(new CustomEvent('nav-service', { detail: id }));
    } else if (type === 'projects') {
      window.dispatchEvent(new CustomEvent('nav-project', { detail: id }));
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-grey-200 shadow-soft">
      {/* Top Utility Bar */}
      <div className="bg-grey-50 border-b border-grey-200 py-1.5 text-xs text-grey-600">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <span className="flex items-center gap-1.5 font-medium">
              <Phone className="w-3.5 h-3.5 text-blue-700" />
              <a href={`tel:${phone.replace(/[^0-9+]/g, '')}`} className="hover:text-blue-700 transition-colors font-semibold">
                {phone}
              </a>
            </span>
            <span className="hidden sm:flex items-center gap-1.5 font-medium">
              <MapPin className="w-3.5 h-3.5 text-blue-700" />
              <span>Serving all of Tamil Nadu</span>
            </span>
          </div>
          <div className="hidden md:flex items-center gap-4 text-grey-500">
            <span className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-grey-400" />
              <span>Mon–Sat, 9:00 AM – 7:00 PM</span>
            </span>
            {isAdminLoggedIn ? (
              <div className="flex items-center gap-2 border-l border-grey-200 pl-3">
                <button
                  onClick={onAdminClick}
                  className="text-blue-700 font-bold hover:underline flex items-center gap-1"
                >
                  <UserCheck className="w-3 h-3" />
                  <span>Admin</span>
                </button>
                <button onClick={onLogout} className="text-red-500 hover:underline">Logout</button>
              </div>
            ) : (
              <button
                onClick={onAdminClick}
                className="text-grey-400 hover:text-blue-700 transition-colors"
                title="Admin Portal"
              >
                <ShieldAlert className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Header / Navigation */}
      <div className="max-w-7xl mx-auto px-6 lg:px-8 flex items-center justify-between h-20">
        {/* Brand Logo */}
        <button
          onClick={() => { setActiveTab('home'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
          className="flex items-center gap-3 focus:outline-none cursor-pointer group"
          aria-label="Lifehut Developers Home"
        >
          <div className="relative w-50 h-50 rounded-xl overflow-hidden flex items-center justify-center text-white shadow-soft transition-colors flex-shrink-0">
            <img
              src={logoImg}
              alt="Lifehut Developers"
              className="w-full h-full object-contain p-0.5 z-10 bg-transparent"
              onError={(e) => {
                const target = e.currentTarget;
                if (target.src !== '/logo.png') {
                  target.src = '/logo.png';
                }
              }}
            />
            
          </div>
         
        </button>

        {/* Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center gap-7">
          <button
            onClick={() => handleNavClick('home')}
            className={`text-sm font-display font-semibold transition-colors cursor-pointer ${
              activeTab === 'home' ? 'text-blue-700 font-bold' : 'text-grey-600 hover:text-blue-700'
            }`}
          >
            Home
          </button>
          <button
            onClick={() => handleNavClick('services')}
            className={`text-sm font-display font-semibold transition-colors cursor-pointer ${
              activeTab === 'services' ? 'text-blue-700 font-bold' : 'text-grey-600 hover:text-blue-700'
            }`}
          >
            Service
          </button>
          <button
            onClick={() => handleNavClick('projects')}
            className={`text-sm font-display font-semibold transition-colors cursor-pointer ${
              activeTab === 'projects' ? 'text-blue-700 font-bold' : 'text-grey-600 hover:text-blue-700'
            }`}
          >
            Projects
          </button>
          <button
            onClick={() => handleNavClick('pricing')}
            className={`text-sm font-display font-semibold transition-colors cursor-pointer ${
              activeTab === 'pricing' ? 'text-blue-700 font-bold' : 'text-grey-600 hover:text-blue-700'
            }`}
          >
            Pricing
          </button>
          <button
            onClick={() => handleNavClick('faq')}
            className="text-sm font-display font-semibold text-grey-600 hover:text-blue-700 transition-colors cursor-pointer"
          >
            FAQ
          </button>
          <button
            onClick={() => handleNavClick('blogs')}
            className={`text-sm font-display font-semibold transition-colors cursor-pointer ${
              activeTab === 'blogs' ? 'text-blue-700 font-bold' : 'text-grey-600 hover:text-blue-700'
            }`}
          >
            Blogs
          </button>
          <button
            onClick={() => handleNavClick('contact')}
            className="text-sm font-display font-semibold text-grey-600 hover:text-blue-700 transition-colors cursor-pointer"
          >
            Contact
          </button>
        </nav>

        {/* Header Right Actions */}
        <div className="hidden sm:flex items-center gap-4">
          {/* Quick Search */}
          <div ref={searchContainerRef} className="relative w-44 xl:w-52">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-grey-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setIsSearchFocused(true)}
                placeholder="Search projects, services..."
                className="w-full text-xs font-medium pl-9 pr-3 py-2 border border-grey-200 rounded-full bg-grey-50 text-ink placeholder:text-grey-400 focus:bg-white focus:border-blue-500 outline-none transition-all"
                aria-label="Search site"
              />
            </div>

            {/* Suggestions Dropdown */}
            {isSearchFocused && (searchQuery.trim().length > 1 || (searchSuggestions && (searchSuggestions.services.length > 0 || searchSuggestions.projects.length > 0 || searchSuggestions.blogs.length > 0))) && (
              <div className="absolute right-0 top-full mt-2 w-80 bg-white border border-grey-200 rounded-2xl shadow-card overflow-hidden z-50 text-left">
                <div className="max-h-96 overflow-y-auto p-3 flex flex-col gap-3">
                  {searchSuggestions?.services && searchSuggestions.services.length > 0 && (
                    <div>
                      <div className="text-[10px] font-bold tracking-wider text-grey-400 uppercase mb-1 px-2">Services</div>
                      {searchSuggestions.services.map((s) => (
                        <button
                          key={s.id}
                          onClick={() => handleSuggestionClick('services', s.id)}
                          className="w-full text-left p-2 rounded-lg hover:bg-grey-50 transition-colors"
                        >
                          <div className="text-xs font-bold text-ink">{s.title}</div>
                          <div className="text-[10px] text-grey-500 truncate">{s.desc}</div>
                        </button>
                      ))}
                    </div>
                  )}

                  {searchSuggestions?.projects && searchSuggestions.projects.length > 0 && (
                    <div>
                      <div className="text-[10px] font-bold tracking-wider text-grey-400 uppercase mb-1 px-2">Projects</div>
                      {searchSuggestions.projects.map((p) => (
                        <button
                          key={p.id}
                          onClick={() => handleSuggestionClick('projects', p.id)}
                          className="w-full text-left p-2 rounded-lg hover:bg-grey-50 transition-colors"
                        >
                          <div className="text-xs font-bold text-ink">{p.title}</div>
                          <div className="text-[10px] text-grey-500 truncate">📍 {p.desc}</div>
                        </button>
                      ))}
                    </div>
                  )}

                  {searchSuggestions && searchSuggestions.services.length === 0 && searchSuggestions.projects.length === 0 && (
                    <div className="text-center py-6 text-grey-400 text-xs">
                      No matches found for "{searchQuery}"
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          <button
            onClick={() => handleNavClick('quote')}
            className="inline-flex items-center gap-2 bg-blue-700 hover:bg-blue-900 text-white font-display font-semibold text-sm px-5 py-2.5 rounded-full shadow-soft hover:shadow-lift transition-all duration-300 cursor-pointer"
          >
            <span>Get Free Quote</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Mobile Hamburger Button */}
        <div className="flex items-center gap-3 lg:hidden">
          <button
            onClick={() => handleNavClick('quote')}
            className="text-xs font-semibold px-3.5 py-1.5 rounded-full bg-blue-700 text-white"
          >
            Quote
          </button>
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 rounded-xl text-ink hover:bg-grey-100 transition-colors"
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden border-t border-grey-200 bg-white px-6 py-6 shadow-card animate-in fade-in slide-in-from-top-2">
          <nav className="flex flex-col gap-4">
            <button
              onClick={() => handleNavClick('home')}
              className={`text-left font-display font-bold text-lg py-1 ${
                activeTab === 'home' ? 'text-blue-700 font-extrabold' : 'text-ink'
              }`}
            >
              Home
            </button>
            <button
              onClick={() => handleNavClick('services')}
              className={`text-left font-display font-bold text-lg py-1 ${
                activeTab === 'services' ? 'text-blue-700 font-extrabold' : 'text-ink'
              }`}
            >
              Service
            </button>
            <button
              onClick={() => handleNavClick('projects')}
              className={`text-left font-display font-bold text-lg py-1 ${
                activeTab === 'projects' ? 'text-blue-700 font-extrabold' : 'text-ink'
              }`}
            >
              Projects
            </button>
            <button
              onClick={() => handleNavClick('pricing')}
              className={`text-left font-display font-bold text-lg py-1 ${
                activeTab === 'pricing' ? 'text-blue-700 font-extrabold' : 'text-ink'
              }`}
            >
              Pricing
            </button>
            <button
              onClick={() => handleNavClick('faq')}
              className="text-left font-display font-bold text-lg text-ink py-1"
            >
              FAQ
            </button>
            <button
              onClick={() => handleNavClick('blogs')}
              className={`text-left font-display font-bold text-lg py-1 ${
                activeTab === 'blogs' ? 'text-blue-700 font-extrabold' : 'text-ink'
              }`}
            >
              Blogs
            </button>
            <button
              onClick={() => handleNavClick('contact')}
              className="text-left font-display font-bold text-lg text-ink py-1"
            >
              Contact
            </button>
          </nav>
        </div>
      )}
    </header>
  );
};
