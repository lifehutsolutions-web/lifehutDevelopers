import React, { useState } from 'react';
import { Logo } from './Logo';
import { Mail, Phone, MapPin, Instagram, Pin, MessageSquare, Send, CheckCircle } from 'lucide-react';

interface FooterProps {
  setActiveTab: (tab: string) => void;
  address: string;
  phone: string;
  email: string;
  instagramUrl: string;
  pinterestUrl: string;
}

export const Footer: React.FC<FooterProps> = ({
  setActiveTab,
  address,
  phone,
  email,
  instagramUrl,
  pinterestUrl
}) => {
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (newsletterEmail.trim()) {
      setIsSubscribed(true);
      setNewsletterEmail('');
      setTimeout(() => setIsSubscribed(false), 5000);
    }
  };

  return (
    <footer className="bg-slate-50 text-slate-800 pt-16 pb-8 px-4 sm:px-6 lg:px-8 border-t border-slate-200">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 xl:gap-12 mb-16">
        
        {/* Brand Column */}
        <div className="flex flex-col gap-6">
          <button onClick={() => setActiveTab('home')} className="self-start text-left focus:outline-none">
            <Logo className="h-10" light={false} />
          </button>
          <p className="text-slate-600 text-sm leading-relaxed max-w-sm">
            Building luxurious, premium-grade dream homes in Chennai since 2019. Focused on rigorous structural testing, material integrity, and complete financial transparency.
          </p>
          <div className="flex items-center gap-3">
            <a
              href={instagramUrl}
              target="_blank"
              rel="noreferrer"
              className="p-2 bg-slate-200 hover:bg-[#1A6DB5] text-slate-700 hover:text-white rounded-full transition-all duration-300"
              title="Follow on Instagram"
              aria-label="Instagram"
            >
              <Instagram className="w-4 h-4" />
            </a>
            <a
              href={pinterestUrl}
              target="_blank"
              rel="noreferrer"
              className="p-2 bg-slate-200 hover:bg-[#1A6DB5] text-slate-700 hover:text-white rounded-full transition-all duration-300"
              title="Pin on Pinterest"
              aria-label="Pinterest"
            >
              <Pin className="w-4 h-4" />
            </a>
            <a
              href="https://api.whatsapp.com/send?phone=918072163330"
              target="_blank"
              rel="noreferrer"
              className="p-2 bg-slate-200 hover:bg-[#25D366] text-slate-700 hover:text-white rounded-full transition-all duration-300"
              title="Chat on WhatsApp"
              aria-label="WhatsApp"
            >
              <MessageSquare className="w-4 h-4" />
            </a>
          </div>
        </div>

        {/* Quick Links */}
        <div className="flex flex-col gap-5">
          <h4 className="text-slate-900 font-bold text-sm tracking-widest uppercase">Quick Links</h4>
          <ul className="flex flex-col gap-3 list-none p-0 m-0 text-sm">
            <li>
              <button onClick={() => setActiveTab('home')} className="text-slate-600 hover:text-[#1A6DB5] transition-colors focus:outline-none">
                Home / About
              </button>
            </li>
            <li>
              <button onClick={() => setActiveTab('services')} className="text-slate-600 hover:text-[#1A6DB5] transition-colors focus:outline-none">
                Our Services
              </button>
            </li>
            <li>
              <button onClick={() => setActiveTab('projects')} className="text-slate-600 hover:text-[#1A6DB5] transition-colors focus:outline-none">
                Featured Projects
              </button>
            </li>
            <li>
              <button onClick={() => setActiveTab('pricing')} className="text-slate-600 hover:text-[#1A6DB5] transition-colors focus:outline-none">
                Redesigned Pricing
              </button>
            </li>
            <li>
              <button onClick={() => setActiveTab('blogs')} className="text-slate-600 hover:text-[#1A6DB5] transition-colors focus:outline-none">
                Expert Blogs
              </button>
            </li>
          </ul>
        </div>

        {/* Specializations */}
        <div className="flex flex-col gap-5">
          <h4 className="text-slate-900 font-bold text-sm tracking-widest uppercase">Specializations</h4>
          <ul className="flex flex-col gap-3 list-none p-0 m-0 text-sm text-slate-600">
            <li className="hover:text-[#1A6DB5] transition-colors cursor-pointer">Luxury Villa Construction</li>
            <li className="hover:text-[#1A6DB5] transition-colors cursor-pointer">Turnkey House Construction</li>
            <li className="hover:text-[#1A6DB5] transition-colors cursor-pointer">RCC Framed Structures</li>
            <li className="hover:text-[#1A6DB5] transition-colors cursor-pointer">SBC Soil Investigation</li>
            <li className="hover:text-[#1A6DB5] transition-colors cursor-pointer">Structural Wind-Load Analysis</li>
          </ul>
        </div>

        {/* Newsletter Column */}
        <div className="flex flex-col gap-5">
          <h4 className="text-slate-900 font-bold text-sm tracking-widest uppercase">Newsletter</h4>
          <p className="text-slate-600 text-sm leading-relaxed">
            Subscribe to our newsletter to receive architectural trends, guidebooks, and structural checklists.
          </p>

          {isSubscribed ? (
            <div className="flex items-center gap-2 text-green-600 text-sm bg-green-50 p-3 rounded-xl border border-green-200">
              <CheckCircle className="w-5 h-5 flex-shrink-0" />
              <span>Thank you! Subscribed successfully.</span>
            </div>
          ) : (
            <form onSubmit={handleSubscribe} className="flex gap-2">
              <input
                type="email"
                required
                value={newsletterEmail}
                onChange={(e) => setNewsletterEmail(e.target.value)}
                placeholder="Your email address..."
                className="bg-white border border-slate-300 text-slate-950 placeholder-slate-400 text-sm px-4 py-2.5 rounded-xl outline-none focus:border-[#1A6DB5] flex-1"
                aria-label="Newsletter email input"
              />
              <button
                type="submit"
                className="bg-[#1A6DB5] hover:bg-[#1558a0] text-white p-2.5 rounded-xl transition-all shadow-md shadow-[#1A6DB5]/10"
                aria-label="Subscribe to newsletter"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          )}
        </div>

      </div>

      {/* Footer Bottom */}
      <div className="max-w-7xl mx-auto pt-8 border-t border-slate-200 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-slate-500">
        <div className="flex flex-col md:flex-row items-center gap-2 md:gap-6 text-center md:text-left">
          <span>© 2026 Lifehut Developers. All rights reserved.</span>
          <span className="flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5 text-orange-500" />
            <span>Chennai, Tamil Nadu, India</span>
          </span>
        </div>
        <div className="flex items-center gap-4">
          <button onClick={() => setActiveTab('contact')} className="hover:text-[#1A6DB5] transition-colors">
            Support
          </button>
          <span>•</span>
          <button onClick={() => setActiveTab('home')} className="hover:text-[#1A6DB5] transition-colors">
            Privacy Policy
          </button>
          <span>•</span>
          <button onClick={() => setActiveTab('contact')} className="hover:text-[#1A6DB5] transition-colors">
            Site Map
          </button>
        </div>
      </div>
    </footer>
  );
};
