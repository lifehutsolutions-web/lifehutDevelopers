import React, { useState, useEffect, useMemo } from 'react';
import { Service } from '../types';
import { ChevronRight, ShieldCheck, HelpCircle, ChevronDown, Image as ImageIcon, ZoomIn, PhoneCall, Sparkles, Sliders, ArrowLeft } from 'lucide-react';
import { Breadcrumbs } from './Breadcrumbs';
import { InteractiveLightbox } from './InteractiveLightbox';
import { motion, AnimatePresence } from 'motion/react';
import { findService } from '../lib/routing';

interface ServicesProps {
  services: Service[];
  setActiveTab: (tab: string) => void;
  selectedServiceId?: string | null;
  onSelectService?: (id: string | null) => void;
}

export const Services: React.FC<ServicesProps> = ({
  services,
  setActiveTab,
  selectedServiceId: selectedServiceIdProp = null,
  onSelectService
}) => {
  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(selectedServiceIdProp);
  const [activeFaqIdx, setActiveFaqIdx] = useState<number | null>(null);

  // Lightbox State
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxImages, setLightboxImages] = useState<string[]>([]);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [lightboxTitle, setLightboxTitle] = useState('');

  // Synchronize external prop
  useEffect(() => {
    if (selectedServiceIdProp !== undefined && selectedServiceIdProp !== selectedServiceId) {
      setSelectedServiceId(selectedServiceIdProp);
    }
  }, [selectedServiceIdProp]);

  // Handle service selection with URL management
  const handleSelectService = (idOrTitle: string | null) => {
    if (!idOrTitle) {
      setSelectedServiceId(null);
      if (onSelectService) {
        onSelectService(null);
      } else {
        window.history.pushState({}, '', '/services');
      }
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    const matched = findService(services, idOrTitle);
    const chosenId = matched ? matched.id : idOrTitle;
    setSelectedServiceId(chosenId);
    if (onSelectService) {
      onSelectService(chosenId);
    } else {
      window.history.pushState({}, '', `/services/${encodeURIComponent(chosenId)}`);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Monitor custom navigation events from global search
  useEffect(() => {
    const handleNavService = (e: Event) => {
      const id = (e as CustomEvent).detail;
      if (id) {
        handleSelectService(id);
      }
    };
    window.addEventListener('nav-service', handleNavService);
    return () => window.removeEventListener('nav-service', handleNavService);
  }, [services]);

  const selectedService = useMemo(() => {
    const target = selectedServiceIdProp || selectedServiceId;
    return findService(services, target);
  }, [services, selectedServiceIdProp, selectedServiceId]);

  const toggleFaq = (idx: number) => {
    setActiveFaqIdx(prev => (prev === idx ? null : idx));
  };

  const openLightbox = (imgs: string[], index = 0, title = '') => {
    setLightboxImages(imgs);
    setLightboxIndex(index);
    setLightboxTitle(title);
    setLightboxOpen(true);
  };

  if (selectedService) {
    const allGalleryImages = [
      selectedService.banner,
      ...(selectedService.gallery?.filter(g => g !== selectedService.banner) || [])
    ];

    return (
      <div className="bg-grey-50 min-h-screen pt-4 sm:pt-6 pb-12 text-left">
        
        {/* Fullscreen Lightbox Modal */}
        <InteractiveLightbox
          isOpen={lightboxOpen}
          onClose={() => setLightboxOpen(false)}
          images={lightboxImages}
          currentIndex={lightboxIndex}
          onIndexChange={setLightboxIndex}
          title={lightboxTitle}
        />

        {/* Breadcrumb Navigation */}
        <Breadcrumbs
          items={[
            { label: 'Services', onClick: () => handleSelectService(null) },
            { label: selectedService.title, active: true }
          ]}
          onHomeClick={() => {
            handleSelectService(null);
            setActiveTab('home');
          }}
        />

        {/* Dynamic Detail Banner */}
        <div
          onClick={() => openLightbox(allGalleryImages, 0, selectedService.title)}
          className="relative h-[300px] sm:h-[420px] w-full overflow-hidden bg-ink cursor-zoom-in group border-b border-grey-200"
        >
          <img
            src={selectedService.banner}
            alt={selectedService.title}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover opacity-80 transform group-hover:scale-105 transition-transform duration-700"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-ink/90 via-ink/30 to-transparent" />
          
          <div className="absolute top-6 right-6 bg-white/90 backdrop-blur-md px-4 py-2 rounded-full text-ink text-xs font-display font-bold flex items-center gap-2 border border-grey-200 opacity-0 group-hover:opacity-100 transition-opacity shadow-card">
            <ZoomIn className="w-4 h-4 text-blue-700" />
            <span>Click to Expand Photo</span>
          </div>

          <div className="absolute bottom-8 left-0 right-0 max-w-7xl mx-auto px-6 lg:px-8 text-left">
            <span className="inline-flex items-center gap-1.5 text-xs font-display font-bold tracking-wide text-blue-700 uppercase bg-white/95 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-grey-200 shadow-soft">
              Specialized Service
            </span>
            <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white mt-3 tracking-tight text-balance">
              {selectedService.title}
            </h1>
          </div>
        </div>

        {/* Detail Content Section */}
        <div className="max-w-7xl mx-auto px-6 lg:px-8 mt-10 text-left">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Left Main Description & Features */}
            <div className="lg:col-span-8 flex flex-col gap-6">
              <div className="bg-white p-7 sm:p-9 rounded-3xl border border-grey-200 shadow-soft">
                <p className="font-display font-bold text-blue-700 text-xs tracking-wide uppercase mb-2">Scope Overview</p>
                <h2 className="text-xl sm:text-2xl font-display font-extrabold text-ink mb-4">
                  Engineering &amp; Execution Scope
                </h2>
                <p className="text-grey-600 text-sm sm:text-base leading-relaxed">
                  {selectedService.description}
                </p>
              </div>

              {/* Checklist */}
              <div className="bg-white p-7 sm:p-9 rounded-3xl border border-grey-200 shadow-soft">
                <p className="font-display font-bold text-blue-700 text-xs tracking-wide uppercase mb-2">Standards &amp; Quality</p>
                <h2 className="text-xl sm:text-2xl font-display font-extrabold text-ink mb-5">
                  Key Technical Deliverables
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {selectedService.features.map((feature, i) => (
                    <div
                      key={i}
                      className="flex items-start gap-3 bg-grey-50 p-4 rounded-2xl border border-grey-200 hover:border-blue-300 transition-all group"
                    >
                      <ShieldCheck className="w-5 h-5 text-blue-700 flex-shrink-0 mt-0.5" />
                      <span className="text-ink text-xs sm:text-sm font-semibold">
                        {feature}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Photo Gallery */}
              {allGalleryImages.length > 0 && (
                <div className="bg-white p-7 sm:p-9 rounded-3xl border border-grey-200 shadow-soft">
                  <div className="flex items-center justify-between mb-5">
                    <div>
                      <p className="font-display font-bold text-blue-700 text-xs tracking-wide uppercase">Visual Portfolio</p>
                      <h2 className="text-xl sm:text-2xl font-display font-extrabold text-ink">
                        Project Photos ({allGalleryImages.length})
                      </h2>
                    </div>
                    <span className="inline-flex items-center gap-1.5 text-xs text-grey-500">
                      <ImageIcon className="w-4 h-4 text-blue-700" />
                      High Resolution
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {allGalleryImages.map((img, i) => (
                      <div
                        key={i}
                        onClick={() => openLightbox(allGalleryImages, i, selectedService.title)}
                        className="rounded-2xl overflow-hidden aspect-[4/3] bg-grey-100 shadow-soft border border-grey-200 cursor-zoom-in group relative lift-hover"
                      >
                        <img
                          src={img}
                          alt={`Gallery photo ${i + 1}`}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-ink/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                          <ZoomIn className="w-6 h-6 text-white" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Right Interactive Sidebar */}
            <div className="lg:col-span-4 flex flex-col gap-6">
              
              {/* Call-to-action Card */}
              <div className="bg-white p-7 rounded-3xl shadow-soft border border-grey-200 relative">
                <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-700 flex items-center justify-center mb-4 border border-blue-100">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-display font-extrabold text-ink mb-2">Schedule Consultation</h3>
                <p className="text-xs text-grey-600 mb-6 leading-relaxed">
                  Connect with our team for site feasibility reviews, blueprint analysis, and transparent pricing.
                </p>
                <div className="flex flex-col gap-3">
                  <button
                    onClick={() => setActiveTab('pricing')}
                    className="w-full py-3 bg-blue-700 hover:bg-blue-900 text-white font-display font-bold rounded-xl text-xs uppercase tracking-wider transition-all shadow-soft hover:shadow-card flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>View Pricing Plans</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('quote')}
                    className="w-full py-3 bg-white hover:bg-grey-50 text-blue-700 font-display font-bold rounded-xl text-xs uppercase tracking-wider transition-all border border-grey-200 shadow-soft flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Sliders className="w-4 h-4 text-blue-700" />
                    <span>Cost Calculator</span>
                  </button>
                </div>
              </div>

              {/* FAQs Accordion */}
              {selectedService.faqs && selectedService.faqs.length > 0 && (
                <div className="bg-white p-6 sm:p-7 rounded-3xl border border-grey-200 shadow-soft flex flex-col gap-4">
                  <h3 className="text-base font-display font-extrabold text-ink flex items-center gap-2">
                    <HelpCircle className="w-4 h-4 text-blue-700" />
                    <span>Frequently Asked Questions</span>
                  </h3>
                  <div className="flex flex-col gap-2.5">
                    {selectedService.faqs.map((faq, idx) => (
                      <div
                        key={idx}
                        className="border border-grey-200 rounded-2xl overflow-hidden bg-white"
                      >
                        <button
                          onClick={() => toggleFaq(idx)}
                          className="w-full p-3.5 bg-grey-50 flex justify-between items-center text-left text-xs font-display font-bold text-ink hover:bg-blue-50/50 transition-colors focus:outline-none cursor-pointer"
                        >
                          <span className="pr-2">{faq.question}</span>
                          <ChevronDown
                            className={`w-4 h-4 text-grey-400 flex-shrink-0 transition-transform ${
                              activeFaqIdx === idx ? 'transform rotate-180 text-blue-700' : ''
                            }`}
                          />
                        </button>
                        <AnimatePresence>
                          {activeFaqIdx === idx && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.2 }}
                              className="overflow-hidden"
                            >
                              <div className="p-3.5 text-xs text-grey-600 leading-relaxed border-t border-grey-200 bg-white">
                                {faq.answer}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>
          </div>

          <div className="mt-10 text-center">
            <button
              onClick={() => handleSelectService(null)}
              className="inline-flex items-center gap-2 text-blue-700 font-display font-bold text-sm hover:text-blue-900 transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to all services</span>
            </button>
          </div>
        </div>

      </div>
    );
  }

  return (
    <section className="bg-grey-50 min-h-screen pt-6 sm:pt-8 pb-12 sm:pb-16 px-6 lg:px-8 relative text-left">
      <div className="max-w-7xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-8 sm:mb-10 max-w-3xl mx-auto"
        >
          <p className="font-display font-bold text-blue-700 text-sm tracking-wide uppercase">
            What We Do
          </p>
          <h1 className="mt-3 font-display font-extrabold text-3xl sm:text-4xl lg:text-5xl text-ink text-balance tracking-tight">
            Comprehensive Construction <span className="text-blue-700">&amp; Engineering</span>
          </h1>
          <p className="mt-4 text-grey-600 text-base sm:text-lg leading-relaxed">
            From comprehensive structural designs and 3D architectural elevations to luxury turnkey handovers with verified ISI-grade materials.
          </p>
        </motion.div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((svc, idx) => (
            <motion.div
              key={svc.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: idx * 0.08 }}
              onClick={() => handleSelectService(svc.id)}
              className="bg-white rounded-3xl border border-grey-200 p-7 sm:p-8 flex flex-col justify-between shadow-soft hover:shadow-card lift-hover transition-all duration-300 cursor-pointer group text-left relative overflow-hidden"
            >
              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-display font-bold tracking-wide text-blue-700 uppercase bg-blue-50 px-3 py-1 rounded-full border border-blue-100">
                    Phase 0{idx + 1}
                  </span>
                  <div className="w-11 h-11 rounded-2xl bg-blue-50 text-blue-700 group-hover:bg-blue-700 group-hover:text-white flex items-center justify-center transition-all duration-300 shadow-soft">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                </div>

                <h3 className="font-display text-lg font-extrabold text-ink group-hover:text-blue-700 transition-colors">
                  {svc.title}
                </h3>
                <p className="text-grey-600 text-sm leading-relaxed line-clamp-3">
                  {svc.description}
                </p>
              </div>

              <div className="mt-6 flex items-center justify-between pt-4 border-t border-grey-200">
                <span className="text-xs font-display font-bold text-blue-700 uppercase tracking-wider flex items-center gap-1">
                  <span>Inspect Deliverables</span>
                  <ChevronRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
                </span>
                <span className="text-xs font-display font-semibold text-grey-400">Turnkey</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
