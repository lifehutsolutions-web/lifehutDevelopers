import React, { useState } from 'react';
import { Mail, Phone, MapPin, Instagram, Facebook, MessageSquare, ArrowUp, Youtube } from 'lucide-react';
import faviconImg from '../assets/images/favicon.png';

interface FooterProps {
  setActiveTab: (tab: string) => void;
  address?: string;
  phone?: string;
  email?: string;
  instagramUrl?: string;
  pinterestUrl?: string;
  youtubeUrl?: string;
  facebookUrl?: string;
}

export const Footer: React.FC<FooterProps> = ({
  setActiveTab,
  address = "No.24, 2nd Main Road, Nehru Nagar, Ambattur, Chennai, Tamil Nadu 600053",
  phone = "+91 98765 43210",
  email = "hello@lifehutdevelopers.com",
  instagramUrl = "https://www.instagram.com/lifehut_developers/",
  pinterestUrl = "https://in.pinterest.com/lifehutdevelopers/",
  youtubeUrl = "https://www.youtube.com/@lifehutdevelopers",
  facebookUrl = "https://facebook.com"
}) => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

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
    tryScroll();
  };

  const handleNav = (target: string) => {
    if (['about', 'process', 'faq', 'contact', 'services-preview', 'projects-preview'].includes(target)) {
      setActiveTab('home');
      setTimeout(() => {
        scrollToAnchor(target);
      }, 50);
    } else {
      setActiveTab(target);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <footer className="bg-white border-t border-grey-200 text-ink pt-16 pb-12">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 lg:gap-8 pb-14 border-b border-grey-200">
          
          {/* Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <button 
              onClick={() => { setActiveTab('home'); scrollToTop(); }}
              className="flex items-center gap-3 focus:outline-none cursor-pointer group"
            >
              <div className="relative w-15 h-15 rounded-xl overflow-hidden flex items-center justify-center text-white shadow-soft transition-colors flex-shrink-0">
                <img
                  src={faviconImg}
                  alt="Lifehut Developers"
                  className="w-full h-full object-contain p-0.5 z-10 bg-transparent"
                  onError={(e) => {
                    const target = e.currentTarget;
                    if (target.src !== '/favicon.png') {
                      target.src = '/favicon.png';
                    }
                  }}        
                />
              </div>
              
              <span style={{ fontFamily: "'Audiowide', cursive" }} className="text-2xl font-bold">
                Lifehut <span className="text-blue-700">Developers</span>
              </span>
            </button>
            <p className="text-grey-600 text-sm leading-relaxed max-w-sm">
              We plan, build, and hand over premium residential homes and renovations across Chennai and Tamil Nadu with guaranteed on-time delivery and zero hidden charges.
            </p>
            <div className="flex items-center flex-wrap gap-2.5 pt-2">
              {instagramUrl && (
                <a
                  href={instagramUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="w-9 h-9 rounded-full bg-grey-50 border border-grey-200 flex items-center justify-center text-grey-600 hover:text-[#E4405F] hover:border-pink-300 hover:bg-pink-50/50 transition-colors"
                  aria-label="Instagram"
                  title="Instagram"
                >
                  <Instagram className="w-4 h-4" />
                </a>
              )}
              {youtubeUrl && (
                <a
                  href={youtubeUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="w-9 h-9 rounded-full bg-grey-50 border border-grey-200 flex items-center justify-center text-grey-600 hover:text-[#FF0000] hover:border-red-300 hover:bg-red-50/50 transition-colors"
                  aria-label="YouTube"
                  title="YouTube"
                >
                  <Youtube className="w-4 h-4" />
                </a>
              )}
              {pinterestUrl && (
                <a
                  href={pinterestUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="w-9 h-9 rounded-full bg-grey-50 border border-grey-200 flex items-center justify-center text-grey-600 hover:text-[#E60023] hover:border-red-300 hover:bg-red-50/50 transition-colors"
                  aria-label="Pinterest"
                  title="Pinterest"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <path d="M12 0C5.373 0 0 5.373 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738.098.119.112.224.083.345-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.401.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.354-.629-2.758-1.379l-.749 2.848c-.269 1.045-1.004 2.352-1.498 3.146 1.123.345 2.306.535 3.55.535 6.627 0 12-5.373 12-12C24 5.373 18.627 0 12 0z" />
                  </svg>
                </a>
              )}
              {facebookUrl && (
                <a
                  href={facebookUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="w-9 h-9 rounded-full bg-grey-50 border border-grey-200 flex items-center justify-center text-grey-600 hover:text-blue-600 hover:border-blue-300 hover:bg-blue-50/50 transition-colors"
                  aria-label="Facebook"
                  title="Facebook"
                >
                  <Facebook className="w-4 h-4" />
                </a>
              )}
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="font-display font-bold text-sm tracking-wider uppercase text-ink">Quick Links</h4>
            <ul className="space-y-2.5 list-none p-0 m-0 text-sm text-grey-600">
              <li>
                <button onClick={() => handleNav('about')} className="hover:text-blue-700 transition-colors cursor-pointer">
                  About Us
                </button>
              </li>
              <li>
                <button onClick={() => handleNav('services')} className="hover:text-blue-700 transition-colors cursor-pointer">
                  Our Services
                </button>
              </li>
              <li>
                <button onClick={() => handleNav('projects')} className="hover:text-blue-700 transition-colors cursor-pointer">
                  Recent Projects
                </button>
              </li>
              <li>
                <button onClick={() => handleNav('process')} className="hover:text-blue-700 transition-colors cursor-pointer">
                  How We Work
                </button>
              </li>
              <li>
                <button onClick={() => handleNav('pricing')} className="hover:text-blue-700 transition-colors cursor-pointer">
                  Pricing Packages
                </button>
              </li>
              <li>
                <button onClick={() => handleNav('faq')} className="hover:text-blue-700 transition-colors cursor-pointer">
                  FAQ
                </button>
              </li>
            </ul>
          </div>

          {/* Services */}
          <div className="space-y-4">
            <h4 className="font-display font-bold text-sm tracking-wider uppercase text-ink">Services</h4>
            <ul className="space-y-2.5 list-none p-0 m-0 text-sm text-grey-600">
              <li onClick={() => handleNav('services')} className="hover:text-blue-700 transition-colors cursor-pointer">
                New Home Construction
              </li>
              <li onClick={() => handleNav('services')} className="hover:text-blue-700 transition-colors cursor-pointer">
                Renovation &amp; Remodeling
              </li>
              <li onClick={() => handleNav('services')} className="hover:text-blue-700 transition-colors cursor-pointer">
                Interior Finishing
              </li>
              <li onClick={() => handleNav('services')} className="hover:text-blue-700 transition-colors cursor-pointer">
                Project Management
              </li>
              <li onClick={() => handleNav('services')} className="hover:text-blue-700 transition-colors cursor-pointer">
                Approvals &amp; Documentation
              </li>
            </ul>
          </div>

          {/* Contact Details */}
          <div className="space-y-4">
            <h4 className="font-display font-bold text-sm tracking-wider uppercase text-ink">Contact</h4>
            <div className="space-y-3 text-sm text-grey-600">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-blue-700 shrink-0 mt-1" />
                <p className="leading-snug">{address}</p>
              </div>
              <div className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-blue-700 shrink-0" />
                <a href={`tel:${phone.replace(/[^0-9+]/g, '')}`} className="hover:text-blue-700 font-semibold">{phone}</a>
              </div>
              <div className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-blue-700 shrink-0" />
                <a href={`mailto:${email}`} className="hover:text-blue-700">{email}</a>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-grey-500">
          <p>© {new Date().getFullYear()} Lifehut Developers. All rights reserved. Registered Civil Construction Firm.</p>
          <div className="flex items-center gap-6">
            <button onClick={() => handleNav('contact')} className="hover:text-blue-700 transition-colors">
              Privacy Policy
            </button>
            <span>•</span>
            <button onClick={() => handleNav('contact')} className="hover:text-blue-700 transition-colors">
              Terms of Service
            </button>
            <span>•</span>
            <button 
              onClick={scrollToTop}
              className="inline-flex items-center gap-1 text-blue-700 font-semibold hover:underline"
            >
              <span>Back to Top</span>
              <ArrowUp className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
