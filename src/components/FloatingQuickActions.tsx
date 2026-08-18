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
        href={`https://wa.me/${cleanPhone}?text=${encodeURIComponent('Hello Lifehut Developers, I would like to inquire about your services.')}`}
        target="_blank"
        rel="noopener noreferrer"
        className="w-12 h-12 sm:w-13 sm:h-13 bg-[#25D366] hover:bg-[#20bd5a] text-white rounded-full shadow-lg shadow-[#25D366]/30 flex items-center justify-center hover:scale-110 active:scale-95 transition-all duration-300 group cursor-pointer"
        aria-label="Chat on WhatsApp"
        title="Chat on WhatsApp"
      >
        <svg className="w-6 h-6 text-white fill-current" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91C2.13 13.66 2.59 15.36 3.45 16.86L2.05 22L7.3 20.62C8.75 21.41 10.38 21.83 12.04 21.83C17.5 21.83 21.95 17.38 21.95 11.92C21.95 9.27 20.92 6.78 19.05 4.91C17.18 3.03 14.69 2 12.04 2ZM12.05 3.67C14.25 3.67 16.31 4.53 17.87 6.09C19.42 7.65 20.28 9.72 20.28 11.92C20.28 16.46 16.59 20.15 12.04 20.15C10.56 20.15 9.11 19.76 7.85 19.01L7.55 18.83L4.43 19.65L5.26 16.61L5.06 16.29C4.24 14.99 3.8 13.47 3.8 11.91C3.81 7.37 7.5 3.67 12.05 3.67ZM8.53 7.33C8.37 7.33 8.1 7.39 7.87 7.64C7.65 7.89 7.02 8.48 7.02 9.68C7.02 10.88 7.89 12.04 8.01 12.2C8.13 12.37 9.72 14.82 12.16 15.87C12.74 16.12 13.19 16.27 13.54 16.38C14.12 16.57 14.66 16.54 15.08 16.48C15.54 16.41 16.51 15.89 16.71 15.32C16.92 14.76 16.92 14.28 16.86 14.18C16.8 14.07 16.63 14.01 16.38 13.88C16.13 13.76 14.89 13.15 14.66 13.07C14.43 12.98 14.27 12.94 14.1 13.19C13.94 13.43 13.47 13.99 13.33 14.15C13.19 14.32 13.04 14.34 12.79 14.21C12.54 14.09 11.75 13.83 10.8 12.99C10.07 12.33 9.57 11.52 9.42 11.27C9.28 11.02 9.4 10.89 9.53 10.76C9.64 10.65 9.78 10.47 9.9 10.32C10.02 10.18 10.07 10.07 10.15 9.91C10.23 9.74 10.19 9.6 10.13 9.47C10.07 9.35 9.6 8.21 9.4 7.74C9.21 7.27 9.01 7.34 8.87 7.33C8.73 7.33 8.57 7.33 8.53 7.33Z" />
        </svg>
      </a>
    </div>
  );
};
