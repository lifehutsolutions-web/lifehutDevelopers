import React, { useState, useEffect } from 'react';
import { Star, Quote, ChevronLeft, ChevronRight, CheckCircle, MapPin, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const InteractiveTestimonialsCarousel: React.FC = () => {
  const testimonials = [
    {
      id: '1',
      name: 'Mr. Mohanraj & Family',
      location: 'Ambattur, Chennai',
      projectType: '4BHK Custom Luxury Villa (3,800 sq.ft)',
      rating: 5,
      avatar: 'MR',
      quote: 'Lifehut Developers is without doubt the most transparent residential building construction company in Chennai. They completed our 4BHK luxury duplex villa on schedule. Every cement and steel bill was shared with us, and there were zero cost escalations!',
      highlight: 'Delivered On Schedule • 100% Invoice Transparency'
    },
    {
      id: '2',
      name: 'Mr. Gani Iqbal',
      location: 'Keelkattalai, Chennai',
      projectType: 'Contemporary Duplex Residence (3,200 sq.ft)',
      rating: 5,
      avatar: 'GI',
      quote: 'As an NRI working in Dubai, building our family home in Keelkattalai was a major concern. Lifehut provided weekly video walkthroughs, material invoice audits, and engineering logs. The finished elevation looks even better than the 3D render.',
      highlight: 'Seamless Remote NRI Construction Management'
    },
    {
      id: '3',
      name: 'Dr. Navin Kumar & Priya',
      location: 'OMR, Chennai',
      projectType: '3-Floor Smart Residential Home (4,500 sq.ft)',
      rating: 5,
      avatar: 'NK',
      quote: 'Their rigorous structural engineering and foundation planning gave us total confidence. The structural rebar detailing (Tata Fe 550D) and concrete cube crush test reports ensured our 3-floor residence is built for generations.',
      highlight: 'Engineered Foundation & Structural Frame Integrity'
    }
  ];

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  useEffect(() => {
    if (!isAutoPlaying) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % testimonials.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [isAutoPlaying, testimonials.length]);

  const current = testimonials[currentIndex];

  const handlePrev = () => {
    setIsAutoPlaying(false);
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  const handleNext = () => {
    setIsAutoPlaying(false);
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  };

  return (
    <section className="py-20 bg-slate-50 relative overflow-hidden bg-grid-blueprint text-left border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-3xl mx-auto mb-12"
        >
          <span className="inline-block bg-sky-50 text-[#1A6DB5] border border-sky-100 text-xs font-extrabold uppercase tracking-wider px-4 py-1.5 rounded-full mb-3 font-mono">
            Verified Homeowner Testimonials
          </span>
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight">
            Trusted by Chennai <span className="text-[#1A6DB5]">Homeowners</span>
          </h2>
          <p className="text-slate-600 text-sm sm:text-base mt-2.5">
            Read firsthand experiences on our structural integrity and fixed-price transparency.
          </p>
        </motion.div>

        {/* Carousel Card */}
        <div className="max-w-4xl mx-auto relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={current.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.35 }}
              className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200 shadow-sm relative overflow-hidden text-left"
            >
              <Quote className="absolute top-6 right-8 w-20 h-20 text-[#1A6DB5]/5 pointer-events-none" />

              <div className="flex flex-col gap-5">
                
                {/* Rating & Highlight */}
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-1 text-amber-500">
                    {[...Array(current.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-amber-500" />
                    ))}
                    <span className="text-xs font-bold font-mono text-slate-700 ml-1">5.0 / 5.0</span>
                  </div>

                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold font-mono">
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span>{current.highlight}</span>
                  </div>
                </div>

                {/* Quote Text */}
                <p className="text-slate-700 text-sm sm:text-base leading-relaxed italic">
                  "{current.quote}"
                </p>

                {/* Author Info */}
                <div className="flex items-center justify-between pt-5 border-t border-slate-100 flex-wrap gap-4">
                  <div className="flex items-center gap-3.5">
                    <div className="w-10 h-10 rounded-2xl bg-[#1A6DB5] text-white font-extrabold text-xs flex items-center justify-center shadow-sm">
                      {current.avatar}
                    </div>
                    <div>
                      <h4 className="font-display font-bold text-slate-900 text-sm">{current.name}</h4>
                      <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-[#1A6DB5]" />
                          {current.location}
                        </span>
                        <span>•</span>
                        <span className="text-[#1A6DB5] font-semibold">{current.projectType}</span>
                      </div>
                    </div>
                  </div>

                  {/* Navigation Arrows */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handlePrev}
                      className="p-2 rounded-xl bg-slate-100 hover:bg-[#1A6DB5] text-slate-700 hover:text-white transition-colors cursor-pointer border border-slate-200"
                      aria-label="Previous Testimonial"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                      onClick={handleNext}
                      className="p-2 rounded-xl bg-slate-100 hover:bg-[#1A6DB5] text-slate-700 hover:text-white transition-colors cursor-pointer border border-slate-200"
                      aria-label="Next Testimonial"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>

              </div>
            </motion.div>
          </AnimatePresence>

          {/* Dots Indicator */}
          <div className="flex items-center justify-center gap-1.5 mt-6">
            {testimonials.map((_, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setIsAutoPlaying(false);
                  setCurrentIndex(idx);
                }}
                className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                  currentIndex === idx ? 'w-6 bg-[#1A6DB5]' : 'w-2 bg-slate-300 hover:bg-slate-400'
                }`}
                aria-label={`Go to testimonial ${idx + 1}`}
              />
            ))}
          </div>
        </div>

      </div>
    </section>
  );
};
