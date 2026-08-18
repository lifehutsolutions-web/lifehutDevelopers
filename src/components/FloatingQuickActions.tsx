import React, { useState, useEffect } from 'react';
import { MessageSquare, Phone, ChevronUp } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface FloatingProps {
  setActiveTab: (tab: string) => void;
  phone?: string;
}

export const FloatingQuickActions: React.FC<FloatingProps> = ({ 
  setActiveTab, 
  phone = "+91 98765 43210" 
}) => {
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 350) {
        setShowScrollTop(true);
      } else {
        setShowScrollTop(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cleanPhone = phone.replace(/[^0-9]/g, '');

  return (
    <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end gap-3 pointer-events-auto">
      {/* Back to Top */}
      <AnimatePresence>
        {showScrollTop && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            onClick={scrollToTop}
            className="w-11 h-11 bg-white hover:bg-grey-50 text-ink rounded-full shadow-card border border-grey-200 flex items-center justify-center transition-transform hover:-translate-y-0.5 focus:outline-none cursor-pointer"
            title="Back to Top"
            aria-label="Scroll to top"
          >
            <ChevronUp className="w-5 h-5 text-blue-700" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Floating WhatsApp Action */}
      <a
        href={`https://wa.me/${cleanPhone}`}
        target="_blank"
        rel="noreferrer"
        className="inline-flex items-center gap-2.5 bg-blue-700 hover:bg-blue-900 text-white font-display font-semibold text-sm px-5 py-3 rounded-full shadow-lift hover:-translate-y-0.5 transition-all duration-300 group"
        aria-label="Chat on WhatsApp"
      >
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
        <MessageSquare className="w-4 h-4" />
        <span className="hidden sm:inline">Chat on WhatsApp</span>
        <span className="sm:hidden">Chat</span>
      </a>
    </div>
  );
};
