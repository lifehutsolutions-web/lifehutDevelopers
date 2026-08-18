import React, { useEffect } from 'react';
import { X, ChevronLeft, ChevronRight, ZoomIn, MapPin } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface LightboxProps {
  isOpen: boolean;
  onClose: () => void;
  images: string[];
  currentIndex: number;
  onIndexChange: (index: number) => void;
  title?: string;
  location?: string;
}

export const InteractiveLightbox: React.FC<LightboxProps> = ({
  isOpen,
  onClose,
  images,
  currentIndex,
  onIndexChange,
  title,
  location
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') onIndexChange((currentIndex - 1 + images.length) % images.length);
      if (e.key === 'ArrowRight') onIndexChange((currentIndex + 1) % images.length);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, currentIndex, images.length, onClose, onIndexChange]);

  if (!isOpen || images.length === 0) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/95 backdrop-blur-xl flex flex-col justify-between p-4 sm:p-6"
      >
        {/* Top bar with details & close */}
        <div className="flex items-center justify-between text-white border-b border-white/10 pb-4 max-w-7xl mx-auto w-full">
          <div className="flex flex-col text-left">
            <span className="text-[10px] font-mono font-bold text-[#F47B20] uppercase tracking-widest">
              High-Resolution Architectural View ({currentIndex + 1} of {images.length})
            </span>
            {title && (
              <h3 className="font-display text-lg sm:text-xl font-bold text-white mt-0.5 flex items-center gap-2">
                <span>{title}</span>
                {location && (
                  <span className="text-xs font-normal text-slate-400 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-[#1A6DB5]" />
                    {location}
                  </span>
                )}
              </h3>
            )}
          </div>
          
          <button
            onClick={onClose}
            className="p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all transform hover:scale-110 focus:outline-none"
            aria-label="Close Lightbox"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Central Zoomable Viewport */}
        <div className="relative flex-1 flex items-center justify-center my-4 overflow-hidden">
          {images.length > 1 && (
            <button
              onClick={() => onIndexChange((currentIndex - 1 + images.length) % images.length)}
              className="absolute left-2 sm:left-6 z-10 p-3 rounded-full bg-black/60 hover:bg-[#1A6DB5] text-white backdrop-blur-md transition-all transform hover:scale-110 shadow-xl border border-white/10"
              aria-label="Previous Image"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
          )}

          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="max-w-5xl max-h-[70vh] rounded-2xl overflow-hidden shadow-2xl border border-white/10 relative group"
          >
            <img
              src={images[currentIndex]}
              alt={title || `Photo ${currentIndex + 1}`}
              referrerPolicy="no-referrer"
              className="w-full h-full object-contain max-h-[70vh] transition-transform duration-500 hover:scale-105"
            />
            <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-full text-white/90 text-xs flex items-center gap-1.5 border border-white/10 pointer-events-none">
              <ZoomIn className="w-3.5 h-3.5 text-[#F47B20]" />
              <span>Hover to Zoom</span>
            </div>
          </motion.div>

          {images.length > 1 && (
            <button
              onClick={() => onIndexChange((currentIndex + 1) % images.length)}
              className="absolute right-2 sm:right-6 z-10 p-3 rounded-full bg-black/60 hover:bg-[#1A6DB5] text-white backdrop-blur-md transition-all transform hover:scale-110 shadow-xl border border-white/10"
              aria-label="Next Image"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          )}
        </div>

        {/* Bottom Thumbnail Strip */}
        {images.length > 1 && (
          <div className="flex items-center justify-center gap-3 overflow-x-auto py-2 max-w-2xl mx-auto">
            {images.map((img, idx) => (
              <button
                key={idx}
                onClick={() => onIndexChange(idx)}
                className={`relative rounded-xl overflow-hidden w-16 h-12 flex-shrink-0 transition-all border-2 ${
                  currentIndex === idx
                    ? 'border-[#F47B20] scale-110 shadow-lg'
                    : 'border-white/20 opacity-50 hover:opacity-100'
                }`}
              >
                <img src={img} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
};
