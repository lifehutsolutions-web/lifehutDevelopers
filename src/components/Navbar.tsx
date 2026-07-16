import React, { useState, useEffect, useRef } from 'react';
import { Logo } from './Logo';
import { Search, Menu, X, ArrowRight, UserCheck, ShieldAlert } from 'lucide-react';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isAdminLoggedIn: boolean;
  onAdminClick: () => void;
  onLogout: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  isAdminLoggedIn,
  onAdminClick,
  onLogout
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

  // Monitor Scroll for Transparent -> Solid transition
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Fetch search suggestions in real-time
  useEffect(() => {
    const delayDebounce = setTimeout(async () => {
      if (searchQuery.trim().length > 1) {
        try {
          const res = await fetch(`/api/search?q=${encodeURIComponent(searchQuery)}`);
          const data = await res.json();
          setSearchSuggestions(data);
        } catch (err) {
          console.error('Search error', err);
        }
      } else {
        setSearchSuggestions(null);
      }
    }, 200);

    return () => clearTimeout(delayDebounce);
  }, [searchQuery]);

  // Handle outside clicks to close search suggestions
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setIsSearchFocused(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const menuItems = [
    { id: 'home', label: 'Home' },
    { id: 'services', label: 'Services' },
    { id: 'projects', label: 'Projects' },
    { id: 'pricing', label: 'Pricing' },
    { id: 'blogs', label: 'Blogs' },
    { id: 'contact', label: 'Contact' }
  ];

  const handleSuggestionClick = (type: string, id: string) => {
    setSearchQuery('');
    setSearchSuggestions(null);
    setIsSearchFocused(false);
    setActiveTab(type);

    // If detail navigation is required, we can store selection in window state
    if (type === 'blogs') {
      window.dispatchEvent(new CustomEvent('nav-blog', { detail: id }));
    } else if (type === 'services') {
      window.dispatchEvent(new CustomEvent('nav-service', { detail: id }));
    } else if (type === 'projects') {
      // Find and scroll to projects element or navigate
      window.dispatchEvent(new CustomEvent('nav-project', { detail: id }));
    }
  };

  return (
    <nav
      id="main-navbar"
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled || activeTab !== 'home'
          ? 'bg-white/95 backdrop-blur-md border-b border-slate-100 shadow-sm py-3'
          : 'bg-transparent py-5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="flex items-center justify-between h-14">
          
          {/* Logo & Navigation Links (Left Aligned with Large Gap) */}
          <div className="flex items-center gap-10 xl:gap-14">
            <button
              onClick={() => setActiveTab('home')}
              className="flex items-center focus:outline-none focus:ring-2 focus:ring-[#1A6DB5] rounded-lg p-1 flex-shrink-0"
              aria-label="Lifehut Developers Home"
            >
              <Logo className="h-10 sm:h-12" light={activeTab === 'home' && !isScrolled} />
            </button>

            {/* Desktop Navigation Links */}
            <div className="hidden lg:flex items-center">
              <ul className="flex items-center gap-6 xl:gap-8 list-none m-0 p-0">
                {menuItems.map((item) => (
                  <li key={item.id}>
                    <button
                      onClick={() => {
                        setActiveTab(item.id);
                        setIsMobileMenuOpen(false);
                      }}
                      className={`text-sm font-semibold tracking-wide transition-colors relative py-1 focus:outline-none focus:ring-2 focus:ring-[#1A6DB5] rounded-md px-2 ${
                        activeTab === item.id
                          ? 'text-[#1A6DB5]'
                          : activeTab === 'home' && !isScrolled
                          ? 'text-white/85 hover:text-white'
                          : 'text-slate-600 hover:text-[#1A6DB5]'
                      }`}
                    >
                      {item.label}
                      {activeTab === item.id && (
                        <span className="absolute bottom-0 left-2 right-2 h-0.5 bg-[#1A6DB5] rounded-full" />
                      )}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Search Bar + Admin Actions */}
          <div className="hidden md:flex items-center gap-4">
            
            {/* Global Search Bar */}
            <div ref={searchContainerRef} className="relative w-48 xl:w-60">
              <div className="relative">
                <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${
                  activeTab === 'home' && !isScrolled ? 'text-white/60' : 'text-slate-400'
                }`} />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setIsSearchFocused(true)}
                  placeholder="Global Search..."
                  className={`w-full text-xs font-medium pl-9 pr-4 py-2 border rounded-full outline-none transition-all ${
                    activeTab === 'home' && !isScrolled
                      ? 'bg-white/10 border-white/20 text-white placeholder-white/50 focus:bg-white focus:text-slate-950 focus:placeholder-slate-400 focus:border-[#1A6DB5]'
                      : 'bg-slate-50 border-slate-200 text-slate-800 placeholder-slate-400 focus:bg-white focus:border-[#1A6DB5] focus:ring-2 focus:ring-[#1A6DB5]/10'
                  }`}
                  aria-label="Search site contents"
                />
              </div>

              {/* Suggestions Dropdown */}
              {isSearchFocused && (searchQuery.trim().length > 1 || (searchSuggestions && (searchSuggestions.services.length > 0 || searchSuggestions.projects.length > 0 || searchSuggestions.blogs.length > 0))) && (
                <div className="absolute right-0 top-full mt-2 w-80 bg-white border border-slate-100 rounded-xl shadow-xl overflow-hidden z-50 text-left animate-in fade-in slide-in-from-top-1">
                  <div className="max-h-96 overflow-y-auto p-3 flex flex-col gap-3">
                    
                    {/* Services Results */}
                    {searchSuggestions?.services && searchSuggestions.services.length > 0 && (
                      <div>
                        <div className="text-[10px] font-bold tracking-wider text-slate-400 uppercase mb-1 px-2">Services</div>
                        <div className="flex flex-col">
                          {searchSuggestions.services.map((s) => (
                            <button
                              key={s.id}
                              onClick={() => handleSuggestionClick('services', s.id)}
                              className="text-xs text-slate-700 hover:bg-slate-50 hover:text-[#1A6DB5] text-left p-2 rounded-lg transition-colors focus:outline-none"
                            >
                              <div className="font-semibold">{s.title}</div>
                              <div className="text-[10px] text-slate-400 truncate">{s.desc}</div>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Projects Results */}
                    {searchSuggestions?.projects && searchSuggestions.projects.length > 0 && (
                      <div>
                        <div className="text-[10px] font-bold tracking-wider text-slate-400 uppercase mb-1 px-2">Projects</div>
                        <div className="flex flex-col">
                          {searchSuggestions.projects.map((p) => (
                            <button
                              key={p.id}
                              onClick={() => handleSuggestionClick('projects', p.id)}
                              className="text-xs text-slate-700 hover:bg-slate-50 hover:text-[#1A6DB5] text-left p-2 rounded-lg transition-colors focus:outline-none"
                            >
                              <div className="font-semibold">{p.title}</div>
                              <div className="text-[10px] text-slate-400 truncate">📍 {p.desc}</div>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Blogs Results */}
                    {searchSuggestions?.blogs && searchSuggestions.blogs.length > 0 && (
                      <div>
                        <div className="text-[10px] font-bold tracking-wider text-slate-400 uppercase mb-1 px-2">Blogs</div>
                        <div className="flex flex-col">
                          {searchSuggestions.blogs.map((b) => (
                            <button
                              key={b.id}
                              onClick={() => handleSuggestionClick('blogs', b.id)}
                              className="text-xs text-slate-700 hover:bg-slate-50 hover:text-[#1A6DB5] text-left p-2 rounded-lg transition-colors focus:outline-none"
                            >
                              <div className="font-semibold">{b.title}</div>
                              <div className="text-[10px] text-slate-400 truncate">{b.desc}</div>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* No results state */}
                    {searchSuggestions && searchSuggestions.services.length === 0 && searchSuggestions.projects.length === 0 && searchSuggestions.blogs.length === 0 && (
                      <div className="text-center py-6 text-slate-400 text-xs">
                        No matches found for "{searchQuery}"
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Admin Management Button */}
            {isAdminLoggedIn ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={onAdminClick}
                  className="bg-[#E8F2FB] hover:bg-[#D5E8F7] text-[#1A6DB5] px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1 border border-[#1A6DB5]/10"
                  aria-label="Open Admin Dashboard"
                >
                  <UserCheck className="w-3.5 h-3.5" />
                  <span>Admin</span>
                </button>
                <button
                  onClick={onLogout}
                  className="text-slate-400 hover:text-red-500 text-xs font-bold px-2 py-1"
                >
                  Logout
                </button>
              </div>
            ) : (
              <button
                onClick={onAdminClick}
                className="text-slate-400 hover:text-[#1A6DB5] p-2 focus:outline-none"
                title="Admin Login Portal"
                aria-label="Admin Login Portal"
              >
                <ShieldAlert className="w-4 h-4" />
              </button>
            )}

            {/* Premium CTA Button */}
            <button
              onClick={() => setActiveTab('quote')}
              className={`text-xs font-bold px-5 py-2.5 rounded-full transition-all duration-300 transform hover:scale-105 flex items-center gap-1.5 shadow-md ${
                activeTab === 'home' && !isScrolled
                  ? 'bg-white text-[#1A6DB5] hover:bg-slate-100 shadow-white/10'
                  : 'bg-[#1A6DB5] text-white hover:bg-[#1558a0] shadow-[#1A6DB5]/20'
              }`}
            >
              <span>Instant Quote</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Mobile Menu Trigger & Right Aligned Toggle */}
          <div className="flex items-center gap-2 lg:hidden">
            {/* Mobile Admin Icon */}
            <button
              onClick={onAdminClick}
              className={`p-2 rounded-full ${
                isAdminLoggedIn ? 'text-[#1A6DB5] bg-sky-50' : 'text-slate-400'
              }`}
              aria-label="Admin Panel"
            >
              <ShieldAlert className="w-5 h-5" />
            </button>

            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className={`p-2 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-[#1A6DB5] ${
                activeTab === 'home' && !isScrolled ? 'text-white hover:bg-white/10' : 'text-slate-700 hover:bg-slate-100'
              }`}
              aria-label="Toggle Navigation Menu"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer Overlay */}
      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 top-[60px] bg-white z-50 flex flex-col px-6 py-8 shadow-2xl overflow-y-auto animate-in slide-in-from-right-1 duration-200">
          
          {/* Mobile Search Box */}
          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search services, projects, blogs..."
              className="w-full text-sm pl-9 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-full outline-none focus:border-[#1A6DB5] focus:bg-white"
            />
            {/* suggestions */}
            {searchQuery.trim().length > 1 && searchSuggestions && (
              <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-slate-100 rounded-xl shadow-lg max-h-60 overflow-y-auto z-50 p-2">
                {searchSuggestions.services.length === 0 && searchSuggestions.projects.length === 0 && searchSuggestions.blogs.length === 0 ? (
                  <div className="text-center py-4 text-slate-400 text-xs">No results</div>
                ) : (
                  <div className="flex flex-col gap-2">
                    {searchSuggestions.services.slice(0, 2).map(s => (
                      <button key={s.id} onClick={() => { handleSuggestionClick('services', s.id); setIsMobileMenuOpen(false); }} className="text-left p-2 text-xs hover:bg-slate-50 rounded">
                        <span className="font-bold text-[#1A6DB5]">[Svc]</span> {s.title}
                      </button>
                    ))}
                    {searchSuggestions.projects.slice(0, 2).map(p => (
                      <button key={p.id} onClick={() => { handleSuggestionClick('projects', p.id); setIsMobileMenuOpen(false); }} className="text-left p-2 text-xs hover:bg-slate-50 rounded">
                        <span className="font-bold text-orange-500">[Proj]</span> {p.title}
                      </button>
                    ))}
                    {searchSuggestions.blogs.slice(0, 2).map(b => (
                      <button key={b.id} onClick={() => { handleSuggestionClick('blogs', b.id); setIsMobileMenuOpen(false); }} className="text-left p-2 text-xs hover:bg-slate-50 rounded">
                        <span className="font-bold text-slate-500">[Blog]</span> {b.title}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          <ul className="flex flex-col gap-4 list-none p-0 m-0">
            {menuItems.map((item) => (
              <li key={item.id} className="border-b border-slate-100 pb-2">
                <button
                  onClick={() => {
                    setActiveTab(item.id);
                    setIsMobileMenuOpen(false);
                  }}
                  className={`text-lg font-bold w-full text-left py-1 ${
                    activeTab === item.id ? 'text-[#1A6DB5]' : 'text-slate-800'
                  }`}
                >
                  {item.label}
                </button>
              </li>
            ))}
          </ul>

          <div className="mt-8 flex flex-col gap-4">
            <button
              onClick={() => {
                setActiveTab('quote');
                setIsMobileMenuOpen(false);
              }}
              className="w-full bg-[#1A6DB5] text-white text-center py-3.5 rounded-full font-bold shadow-md shadow-[#1A6DB5]/20 flex items-center justify-center gap-2 hover:bg-[#1558a0]"
            >
              <span>Get Instant Quote</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <a
              href="tel:+918072163330"
              className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-center py-3.5 rounded-full font-bold flex items-center justify-center gap-2"
            >
              <span>Call +91 80721 63330</span>
            </a>
          </div>
        </div>
      )}
    </nav>
  );
};
