import React from 'react';
import { Mail, Phone, MapPin, Instagram, Facebook, MessageSquare, ArrowUp } from 'lucide-react';

interface FooterProps {
  setActiveTab: (tab: string) => void;
  address?: string;
  phone?: string;
  email?: string;
  instagramUrl?: string;
}

export const Footer: React.FC<FooterProps> = ({
  setActiveTab,
  address = "No.24, 2nd Main Road, Nehru Nagar, Ambattur, Chennai, Tamil Nadu 600053",
  phone = "+91 98765 43210",
  email = "hello@lifehutdevelopers.com",
  instagramUrl = "https://instagram.com"
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
              <span className="grid place-items-center w-10 h-10 rounded-xl bg-blue-700 text-white shadow-soft group-hover:bg-blue-900 transition-colors" aria-hidden="true">
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none">
                  <path d="M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1v-9.5Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
                </svg>
              </span>
              <span className="font-display font-extrabold text-2xl tracking-tight text-ink">
                Lifehut<span className="text-blue-700"> Developers</span>
              </span>
            </button>
            <p className="text-grey-600 text-sm leading-relaxed max-w-sm">
              We plan, build, and hand over premium residential homes and renovations across Chennai and Tamil Nadu with guaranteed on-time delivery and zero hidden charges.
            </p>
            <div className="flex items-center gap-3 pt-2">
              <a
                href={instagramUrl}
                target="_blank"
                rel="noreferrer"
                className="w-9 h-9 rounded-full bg-grey-50 border border-grey-200 flex items-center justify-center text-grey-600 hover:text-blue-700 hover:border-blue-300 transition-colors"
                aria-label="Instagram"
              >
                <Instagram className="w-4 h-4" />
              </a>
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noreferrer"
                className="w-9 h-9 rounded-full bg-grey-50 border border-grey-200 flex items-center justify-center text-grey-600 hover:text-blue-700 hover:border-blue-300 transition-colors"
                aria-label="Facebook"
              >
                <Facebook className="w-4 h-4" />
              </a>
              <a
                href={`https://wa.me/${phone.replace(/[^0-9]/g, '')}`}
                target="_blank"
                rel="noreferrer"
                className="w-9 h-9 rounded-full bg-grey-50 border border-grey-200 flex items-center justify-center text-grey-600 hover:text-[#25D366] hover:border-emerald-300 transition-colors"
                aria-label="WhatsApp"
              >
                <MessageSquare className="w-4 h-4" />
              </a>
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
