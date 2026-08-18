import React, { useState, useEffect } from 'react';
import { Project } from '../types';
import { Calendar, Ruler, Home, BedDouble, Layers, MapPin, DollarSign, Quote, ArrowLeft, Eye, ZoomIn, Sparkles } from 'lucide-react';
import { Breadcrumbs } from './Breadcrumbs';
import { InteractiveLightbox } from './InteractiveLightbox';
import { motion, AnimatePresence } from 'motion/react';

interface ProjectsProps {
  projects: Project[];
  setActiveTab: (tab: string) => void;
}

export const Projects: React.FC<ProjectsProps> = ({ projects, setActiveTab }) => {
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>('All');
  
  // Lightbox State
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxImages, setLightboxImages] = useState<string[]>([]);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [lightboxTitle, setLightboxTitle] = useState('');
  const [lightboxLocation, setLightboxLocation] = useState('');

  // Scroll handler for detail navigation
  useEffect(() => {
    const handleNavProject = (e: Event) => {
      const id = (e as CustomEvent).detail;
      if (id) {
        setSelectedProjectId(id);
        window.scrollTo({ top: 300, behavior: 'smooth' });
      }
    };
    window.addEventListener('nav-project', handleNavProject);
    return () => window.removeEventListener('nav-project', handleNavProject);
  }, []);

  const selectedProject = projects.find(p => p.id === selectedProjectId);

  const openLightbox = (imgs: string[], index = 0, title = '', loc = '') => {
    setLightboxImages(imgs);
    setLightboxIndex(index);
    setLightboxTitle(title);
    setLightboxLocation(loc);
    setLightboxOpen(true);
  };

  const categories = ['All', 'Luxury Villas', 'Duplex Residences', 'Modern Homes'];

  const filteredProjects = projects.filter(p => {
    if (activeCategory === 'All') return true;
    if (activeCategory === 'Luxury Villas') return p.name.toLowerCase().includes('villa') || (p.budget && p.budget.includes('Crore'));
    if (activeCategory === 'Duplex Residences') return p.floors >= 2 || p.name.toLowerCase().includes('duplex');
    if (activeCategory === 'Modern Homes') return p.bedrooms >= 4 || p.name.toLowerCase().includes('smart') || p.name.toLowerCase().includes('contemporary');
    return true;
  });

  if (selectedProject) {
    const allProjectImages = [
      selectedProject.heroImage,
      ...(selectedProject.gallery?.filter(g => g !== selectedProject.heroImage) || [])
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
          location={lightboxLocation}
        />

        {/* Breadcrumbs */}
        <Breadcrumbs
          items={[
            { label: 'Projects', onClick: () => setSelectedProjectId(null) },
            { label: selectedProject.name, active: true }
          ]}
          onHomeClick={() => {
            setSelectedProjectId(null);
            setActiveTab('home');
          }}
        />

        {/* Project Detail Header */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="max-w-7xl mx-auto px-6 lg:px-8 mt-6 text-left"
        >
          <button
            onClick={() => setSelectedProjectId(null)}
            className="inline-flex items-center gap-2 text-grey-600 hover:text-blue-700 text-xs font-display font-bold uppercase tracking-wider mb-6 transition-colors group cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
            <span>Back to All Projects</span>
          </button>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Left side Large Hero and Gallery */}
            <div className="lg:col-span-8 flex flex-col gap-6">
              <div
                onClick={() => openLightbox(allProjectImages, 0, selectedProject.name, selectedProject.location)}
                className="rounded-3xl overflow-hidden aspect-[16/9] shadow-card border border-grey-200 relative bg-ink group cursor-zoom-in"
              >
                <img
                  src={selectedProject.heroImage}
                  alt={selectedProject.name}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-ink/90 via-ink/20 to-transparent pointer-events-none" />
                
                <div className="absolute top-5 right-5 bg-white/90 backdrop-blur-md px-3.5 py-1.5 rounded-full text-ink text-xs font-display font-bold flex items-center gap-1.5 border border-grey-200 opacity-0 group-hover:opacity-100 transition-opacity shadow-card">
                  <ZoomIn className="w-3.5 h-3.5 text-blue-700" />
                  <span>Click for Full View</span>
                </div>

                <div className="absolute bottom-6 left-6 right-6 text-white z-10 flex items-end justify-between">
                  <div>
                    <span className="text-xs font-display font-bold tracking-wide text-blue-700 uppercase bg-white/95 backdrop-blur-md px-3 py-1 rounded-full border border-grey-200 shadow-soft">
                      Verified Completed Turnkey
                    </span>
                    <h1 className="font-display text-2xl sm:text-3xl lg:text-4xl font-extrabold mt-3 text-white tracking-tight">{selectedProject.name}</h1>
                    <div className="flex items-center gap-1.5 text-xs text-grey-200 mt-1">
                      <MapPin className="w-3.5 h-3.5 text-blue-300" />
                      <span>{selectedProject.location}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Multi-Photo Gallery Reel */}
              {allProjectImages.length > 1 && (
                <div className="bg-white p-6 sm:p-7 rounded-3xl border border-grey-200 shadow-soft">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-display font-bold text-sm tracking-wide text-ink uppercase">
                      Site &amp; Execution Gallery ({allProjectImages.length} Photos)
                    </h3>
                    <span className="text-xs text-blue-700 font-display font-semibold">Click photo to zoom</span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
                    {allProjectImages.map((img, idx) => (
                      <div
                        key={idx}
                        onClick={() => openLightbox(allProjectImages, idx, selectedProject.name, selectedProject.location)}
                        className="rounded-2xl overflow-hidden aspect-square bg-grey-100 shadow-soft border border-grey-200 cursor-zoom-in group relative lift-hover"
                      >
                        <img
                          src={img}
                          alt={`Gallery photo ${idx + 1}`}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute inset-0 bg-ink/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                          <ZoomIn className="w-4 h-4 text-white" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Right side specifications sheet */}
            <div className="lg:col-span-4 flex flex-col gap-6">
              
              <div className="bg-white border border-grey-200 p-6 sm:p-7 rounded-3xl shadow-soft">
                <div className="flex items-center justify-between mb-5">
                  <h3 className="font-display font-extrabold text-base text-ink">
                    Project Specifications
                  </h3>
                  <span className="px-3 py-1 rounded-full text-xs font-display font-bold bg-blue-50 text-blue-700 border border-blue-100">
                    Delivered
                  </span>
                </div>
                
                <div className="flex flex-col gap-3.5 text-sm">
                  <div className="flex items-center justify-between py-2 border-b border-grey-200">
                    <span className="text-grey-600 text-xs flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-blue-700" />
                      <span>Location</span>
                    </span>
                    <span className="text-ink font-bold text-xs">{selectedProject.location}</span>
                  </div>

                  <div className="flex items-center justify-between py-2 border-b border-grey-200">
                    <span className="text-grey-600 text-xs flex items-center gap-2">
                      <Ruler className="w-4 h-4 text-blue-700" />
                      <span>Plot Area</span>
                    </span>
                    <span className="text-ink font-bold text-xs">{selectedProject.plotSize}</span>
                  </div>

                  <div className="flex items-center justify-between py-2 border-b border-grey-200">
                    <span className="text-grey-600 text-xs flex items-center gap-2">
                      <Home className="w-4 h-4 text-blue-700" />
                      <span>Built-up Area</span>
                    </span>
                    <span className="text-ink font-bold text-xs">{selectedProject.builtUpArea}</span>
                  </div>

                  {selectedProject.bedrooms > 0 && (
                    <div className="flex items-center justify-between py-2 border-b border-grey-200">
                      <span className="text-grey-600 text-xs flex items-center gap-2">
                        <BedDouble className="w-4 h-4 text-blue-700" />
                        <span>Bedrooms</span>
                      </span>
                      <span className="text-ink font-bold text-xs">{selectedProject.bedrooms} BHK</span>
                    </div>
                  )}

                  <div className="flex items-center justify-between py-2 border-b border-grey-200">
                    <span className="text-grey-600 text-xs flex items-center gap-2">
                      <Layers className="w-4 h-4 text-blue-700" />
                      <span>Floors</span>
                    </span>
                    <span className="text-ink font-bold text-xs">G + {selectedProject.floors - 1} Floors</span>
                  </div>

                  <div className="flex items-center justify-between py-2 border-b border-grey-200">
                    <span className="text-grey-600 text-xs flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-blue-700" />
                      <span>Handover</span>
                    </span>
                    <span className="text-ink font-bold text-xs">{selectedProject.completionDate}</span>
                  </div>

                  {selectedProject.budget && selectedProject.budget !== "0" && (
                    <div className="flex items-center justify-between py-2">
                      <span className="text-grey-600 text-xs flex items-center gap-2">
                        <DollarSign className="w-4 h-4 text-blue-700" />
                        <span>Turnkey Budget</span>
                      </span>
                      <span className="text-blue-700 text-xs font-display font-extrabold">{selectedProject.budget}</span>
                    </div>
                  )}
                </div>

                <button
                  onClick={() => setActiveTab('pricing')}
                  className="w-full mt-6 py-3 bg-blue-700 hover:bg-blue-900 text-white font-display font-bold rounded-xl text-xs uppercase tracking-wider transition-all shadow-soft hover:shadow-card cursor-pointer"
                >
                  View Turnkey Packages
                </button>
              </div>

              {/* Client Testimonial card */}
              {selectedProject.clientTestimonial && (
                <div className="bg-white p-6 rounded-3xl border border-grey-200 shadow-soft flex flex-col gap-3 relative">
                  <Quote className="absolute top-5 right-5 w-8 h-8 text-blue-700/10" />
                  <div className="text-blue-700 font-display font-bold text-xs uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-blue-700" />
                    <span>Client Review</span>
                  </div>
                  <p className="text-grey-600 text-xs leading-relaxed italic">
                    "{selectedProject.clientTestimonial}"
                  </p>
                  <div className="flex items-center gap-3 pt-3 border-t border-grey-200">
                    <div className="w-9 h-9 rounded-full bg-blue-700 text-white font-display font-bold text-xs flex items-center justify-center shadow-soft">
                      {selectedProject.clientAvatar || 'C'}
                    </div>
                    <div>
                      <div className="text-xs font-display font-bold text-ink">{selectedProject.clientName}</div>
                      <div className="text-[11px] text-grey-500">{selectedProject.location}</div>
                    </div>
                  </div>
                </div>
              )}

            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <section className="bg-grey-50 min-h-screen pt-6 sm:pt-8 pb-12 sm:pb-16 px-6 lg:px-8 relative text-left">
      <InteractiveLightbox
        isOpen={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
        images={lightboxImages}
        currentIndex={lightboxIndex}
        onIndexChange={setLightboxIndex}
        title={lightboxTitle}
        location={lightboxLocation}
      />

      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-6 sm:mb-8 max-w-3xl mx-auto"
        >
          <p className="font-display font-bold text-blue-700 text-sm tracking-wide uppercase">
            Our Work
          </p>
          <h1 className="mt-3 font-display font-extrabold text-3xl sm:text-4xl lg:text-5xl text-ink tracking-tight text-balance">
            Completed Projects <span className="text-blue-700">&amp; Masterpieces</span>
          </h1>
          <p className="mt-4 text-grey-600 text-base sm:text-lg leading-relaxed">
            Explore our delivered custom villas, duplex homes, and residential projects with complete structural transparency.
          </p>
        </motion.div>

        {/* Category Filters */}
        <div className="flex flex-wrap items-center justify-center gap-2.5 mb-8">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-5 py-2 rounded-full text-xs font-display font-semibold transition-all cursor-pointer ${
                activeCategory === cat
                  ? 'bg-blue-700 text-white shadow-soft shadow-blue-700/20'
                  : 'bg-white text-grey-600 hover:text-blue-700 hover:bg-grey-50 border border-grey-200 shadow-soft'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Projects Grid */}
        <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <AnimatePresence>
            {filteredProjects.map((p, idx) => {
              const galleryImgs = [p.heroImage, ...(p.gallery?.filter(g => g !== p.heroImage) || [])];
              return (
                <motion.div
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.35, delay: idx * 0.08 }}
                  key={p.id}
                  className="bg-white rounded-3xl border border-grey-200 overflow-hidden shadow-soft hover:shadow-card lift-hover transition-all duration-300 group text-left relative flex flex-col h-[390px]"
                >
                  <div className="w-full h-full relative overflow-hidden bg-ink">
                    <img
                      src={p.heroImage}
                      alt={p.name}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
                    />
                    
                    <div className="absolute inset-0 bg-gradient-to-t from-ink/90 via-ink/20 to-transparent pointer-events-none" />

                    {/* Quick Lightbox Action Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        openLightbox(galleryImgs, 0, p.name, p.location);
                      }}
                      className="absolute top-4 right-4 z-20 w-9 h-9 rounded-full bg-white/90 hover:bg-blue-700 text-ink hover:text-white backdrop-blur-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all shadow-card border border-grey-200 cursor-pointer"
                      title="Open 4K Lightbox"
                    >
                      <ZoomIn className="w-4 h-4" />
                    </button>

                    {/* Always-visible Title Banner */}
                    <div className="absolute bottom-5 left-5 right-5 text-white group-hover:opacity-0 transition-opacity duration-200 z-10">
                      <span className="text-xs font-display font-semibold tracking-wide text-blue-300 uppercase bg-black/60 border border-white/10 px-2.5 py-0.5 rounded-full">
                        Completed Handover
                      </span>
                      <h3 className="font-display text-lg font-extrabold mt-2 text-white">{p.name}</h3>
                      <div className="text-xs text-grey-300 mt-1 flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-blue-300" />
                        <span>{p.location}</span>
                      </div>
                    </div>

                    {/* Hover Reveal Card */}
                    <div className="absolute inset-x-0 bottom-0 p-6 bg-white/98 backdrop-blur-md border-t border-grey-200 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out z-25 flex flex-col justify-between h-[240px] text-ink">
                      
                      <div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-display font-bold tracking-wide text-blue-700 uppercase bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-100">
                            Key Metrics
                          </span>
                          <span className="text-xs font-display font-medium text-grey-500">{p.completionDate}</span>
                        </div>
                        <h4 className="font-display text-base font-extrabold mt-2 text-ink truncate">{p.name}</h4>
                      </div>

                      {/* Grid Specs */}
                      <div className="grid grid-cols-2 gap-2.5 text-xs">
                        <div className="flex items-center gap-2">
                          <Ruler className="w-4 h-4 text-blue-700 flex-shrink-0" />
                          <div>
                            <div className="text-[10px] text-grey-500 uppercase font-semibold">Plot Area</div>
                            <div className="font-bold text-ink text-xs">{p.plotSize}</div>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Home className="w-4 h-4 text-blue-700 flex-shrink-0" />
                          <div>
                            <div className="text-[10px] text-grey-500 uppercase font-semibold">Built Area</div>
                            <div className="font-bold text-ink text-xs">{p.builtUpArea}</div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <Layers className="w-4 h-4 text-blue-700 flex-shrink-0" />
                          <div>
                            <div className="text-[10px] text-grey-500 uppercase font-semibold">Config</div>
                            <div className="font-bold text-ink text-xs">G+{p.floors - 1} ({p.bedrooms} BHK)</div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-blue-700 flex-shrink-0" />
                          <div>
                            <div className="text-[10px] text-grey-500 uppercase font-semibold">Location</div>
                            <div className="font-bold text-ink text-xs truncate">{p.location.split(',')[0]}</div>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2.5 pt-3 border-t border-grey-200">
                        <button
                          onClick={() => setSelectedProjectId(p.id)}
                          className="flex-1 py-2 bg-blue-700 hover:bg-blue-900 text-white rounded-xl text-xs font-display font-bold transition-all flex items-center justify-center gap-1.5 shadow-soft cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Full Specs</span>
                        </button>
                        <button
                          onClick={() => openLightbox(galleryImgs, 0, p.name, p.location)}
                          className="p-2 bg-grey-50 hover:bg-grey-100 text-grey-700 rounded-xl transition-colors cursor-pointer border border-grey-200"
                          title="View High-Res Lightbox"
                        >
                          <ZoomIn className="w-4 h-4 text-blue-700" />
                        </button>
                      </div>

                    </div>

                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </motion.div>

      </div>
    </section>
  );
};
