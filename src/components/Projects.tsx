import React, { useState, useEffect } from 'react';
import { Project } from '../types';
import { Calendar, Ruler, Home, BedDouble, Layers, MapPin, DollarSign, Quote, ArrowLeft, Eye } from 'lucide-react';
import { Breadcrumbs } from './Breadcrumbs';

interface ProjectsProps {
  projects: Project[];
  setActiveTab: (tab: string) => void;
}

export const Projects: React.FC<ProjectsProps> = ({ projects, setActiveTab }) => {
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);

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

  if (selectedProject) {
    return (
      <div className="bg-white min-h-screen pt-24 pb-16">
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 text-left">
          
          <button
            onClick={() => setSelectedProjectId(null)}
            className="inline-flex items-center gap-1.5 text-slate-500 hover:text-[#1A6DB5] text-xs font-bold uppercase tracking-wider mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Projects</span>
          </button>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            
            {/* Left side Large Hero and Gallery */}
            <div className="lg:col-span-8 flex flex-col gap-6">
              <div className="rounded-3xl overflow-hidden aspect-[16/9] shadow-md border border-slate-100 relative bg-slate-900">
                <img
                  src={selectedProject.heroImage}
                  alt={selectedProject.name}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none" />
                <div className="absolute bottom-6 left-6 text-white z-10">
                  <span className="text-xs font-bold tracking-widest text-[#F47B20] uppercase bg-black/40 px-3 py-1 rounded-full">
                    Completed Project
                  </span>
                  <h1 className="font-display text-2xl sm:text-3xl font-extrabold mt-2">{selectedProject.name}</h1>
                </div>
              </div>

              {/* Multi-Photo Gallery */}
              {selectedProject.gallery && selectedProject.gallery.length > 1 && (
                <div>
                  <h3 className="text-sm font-bold tracking-wider text-slate-400 uppercase mb-4">Construction Album</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {selectedProject.gallery.map((img, idx) => (
                      <div
                        key={idx}
                        className="rounded-2xl overflow-hidden aspect-square bg-slate-100 shadow-sm border border-slate-100 cursor-pointer hover:border-[#1A6DB5] transition-all"
                      >
                        <img
                          src={img}
                          alt={`Gallery photo ${idx + 1}`}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Right side specifications sheet & Testimonial */}
            <div className="lg:col-span-4 flex flex-col gap-8">
              
              {/* Glass specs panel */}
              <div className="bg-slate-50 border border-slate-100 p-6 rounded-3xl shadow-sm">
                <h3 className="text-sm font-bold font-display text-slate-400 uppercase mb-6 tracking-wider">Project Parameters</h3>
                
                <div className="flex flex-col gap-4">
                  <div className="flex items-center justify-between py-2 border-b border-slate-200/50">
                    <span className="text-slate-500 text-xs flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-[#1A6DB5]" />
                      <span>Location</span>
                    </span>
                    <span className="text-slate-800 text-xs font-bold">{selectedProject.location}</span>
                  </div>

                  <div className="flex items-center justify-between py-2 border-b border-slate-200/50">
                    <span className="text-slate-500 text-xs flex items-center gap-2">
                      <Ruler className="w-4 h-4 text-[#1A6DB5]" />
                      <span>Plot Size</span>
                    </span>
                    <span className="text-slate-800 text-xs font-bold">{selectedProject.plotSize}</span>
                  </div>

                  <div className="flex items-center justify-between py-2 border-b border-slate-200/50">
                    <span className="text-slate-500 text-xs flex items-center gap-2">
                      <Home className="w-4 h-4 text-[#1A6DB5]" />
                      <span>Built-up Area</span>
                    </span>
                    <span className="text-slate-800 text-xs font-bold">{selectedProject.builtUpArea}</span>
                  </div>

                  {selectedProject.bedrooms > 0 && (
                    <div className="flex items-center justify-between py-2 border-b border-slate-200/50">
                      <span className="text-slate-500 text-xs flex items-center gap-2">
                        <BedDouble className="w-4 h-4 text-[#1A6DB5]" />
                        <span>Bedrooms</span>
                      </span>
                      <span className="text-slate-800 text-xs font-bold">{selectedProject.bedrooms} BHK</span>
                    </div>
                  )}

                  <div className="flex items-center justify-between py-2 border-b border-slate-200/50">
                    <span className="text-slate-500 text-xs flex items-center gap-2">
                      <Layers className="w-4 h-4 text-[#1A6DB5]" />
                      <span>Floors</span>
                    </span>
                    <span className="text-slate-800 text-xs font-bold">G + {selectedProject.floors - 1}</span>
                  </div>

                  <div className="flex items-center justify-between py-2 border-b border-slate-200/50">
                    <span className="text-slate-500 text-xs flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-[#1A6DB5]" />
                      <span>Completed</span>
                    </span>
                    <span className="text-slate-800 text-xs font-bold">{selectedProject.completionDate}</span>
                  </div>

                  {selectedProject.budget && selectedProject.budget !== "0" && (
                    <div className="flex items-center justify-between py-2">
                      <span className="text-slate-500 text-xs flex items-center gap-2">
                        <DollarSign className="w-4 h-4 text-[#F47B20]" />
                        <span>Budget Invested</span>
                      </span>
                      <span className="text-[#F47B20] text-xs font-extrabold">{selectedProject.budget}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Client Testimonial card */}
              {selectedProject.clientTestimonial && (
                <div className="bg-[#1A6DB5]/5 p-6 rounded-3xl border border-[#1A6DB5]/10 flex flex-col gap-4 relative">
                  <Quote className="absolute top-4 right-4 w-10 h-10 text-[#1A6DB5]/10" />
                  <div className="text-[#1A6DB5] font-bold text-xs uppercase tracking-widest font-display">
                    Homeowner Review
                  </div>
                  <p className="text-slate-600 text-xs sm:text-sm leading-relaxed font-sans italic">
                    "{selectedProject.clientTestimonial}"
                  </p>
                  <div className="flex items-center gap-3 pt-3 border-t border-slate-100">
                    <div className="w-9 h-9 rounded-full bg-[#1A6DB5] text-white font-extrabold text-xs flex items-center justify-center">
                      {selectedProject.clientAvatar || 'C'}
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-800">{selectedProject.clientName}</div>
                      <div className="text-[10px] text-slate-400">Ambattur, Chennai</div>
                    </div>
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <section className="bg-slate-50 min-h-screen pt-28 pb-16 px-4 sm:px-6 lg:px-8 bg-grid-blueprint relative">
      <div className="max-w-7xl mx-auto">
        
        {/* Header Title */}
        <div className="text-center mb-12">
          <span className="inline-block bg-orange-500/10 text-[#F47B20] text-xs font-bold uppercase tracking-wider px-4 py-1.5 rounded-full mb-3">
            Lifehut Portfolio
          </span>
          <h1 className="font-display text-3xl sm:text-4xl font-extrabold text-[#1A2332]">
            Elite Architectural Realizations
          </h1>
          <p className="text-slate-500 text-sm sm:text-base max-w-xl mx-auto mt-3">
            Inspect our finished villas, residential duplex blocks, and structural projects across Chennai, built to last generations.
          </p>
        </div>

        {/* Projects Masonry/Standard Grid with Glass Reveal Card on Hover */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {projects.map((p) => (
            <div
              key={p.id}
              onClick={() => setSelectedProjectId(p.id)}
              className="bg-white rounded-3xl border border-slate-100 overflow-hidden shadow-premium hover:shadow-premium-hover transition-all duration-500 group cursor-pointer text-left relative flex flex-col h-[380px]"
            >
              {/* Image Holder */}
              <div className="w-full h-full relative overflow-hidden bg-slate-900">
                <img
                  src={p.heroImage}
                  alt={p.name}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700"
                />
                
                {/* Image Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent transition-opacity" />

                {/* Always-visible Title Banner on bottom of Image */}
                <div className="absolute bottom-6 left-6 right-6 text-white group-hover:opacity-0 transition-opacity duration-300 z-10">
                  <span className="text-[9px] font-extrabold tracking-widest text-[#F47B20] uppercase bg-black/40 px-2 py-0.5 rounded-full">
                    Completed
                  </span>
                  <h3 className="font-display text-lg font-extrabold mt-1.5">{p.name}</h3>
                  <div className="text-xs text-slate-300 mt-0.5 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5" />
                    <span>{p.location}</span>
                  </div>
                </div>

                {/* PREMIUM GLASSMORPHISM HOVER REVEAL EFFECT CARD */}
                <div className="absolute inset-x-0 bottom-0 p-6 bg-slate-950/85 backdrop-blur-md border-t border-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out z-25 flex flex-col justify-between h-[230px] text-white">
                  
                  <div>
                    <span className="text-[9px] font-extrabold tracking-widest text-[#F47B20] uppercase border border-[#F47B20]/30 px-2 py-0.5 rounded-full">
                      Structural Metrics
                    </span>
                    <h4 className="font-display text-base font-extrabold mt-2 text-white">{p.name}</h4>
                  </div>

                  {/* Grid Specs */}
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="flex items-center gap-2">
                      <Ruler className="w-4 h-4 text-[#1A6DB5]" />
                      <div>
                        <div className="text-[9px] text-slate-400 uppercase">Plot Size</div>
                        <div className="font-bold font-mono">{p.plotSize}</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Home className="w-4 h-4 text-[#1A6DB5]" />
                      <div>
                        <div className="text-[9px] text-slate-400 uppercase">Built Area</div>
                        <div className="font-bold font-mono">{p.builtUpArea}</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Layers className="w-4 h-4 text-[#1A6DB5]" />
                      <div>
                        <div className="text-[9px] text-slate-400 uppercase">Floors</div>
                        <div className="font-bold font-mono">G + {p.floors - 1}</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-[#1A6DB5]" />
                      <div>
                        <div className="text-[9px] text-slate-400 uppercase">Location</div>
                        <div className="font-bold">{p.location.split(',')[0]}</div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-white/5 text-[11px] font-bold text-sky-400">
                    <span className="flex items-center gap-1.5">
                      <Eye className="w-3.5 h-3.5" />
                      <span>Explore Project Specs</span>
                    </span>
                    <span className="font-mono text-slate-400">{p.completionDate.split('-')[0]}</span>
                  </div>

                </div>

              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};
