import React, { useState, useEffect } from 'react';
import { Service } from '../types';
import { ChevronRight, ArrowRight, ShieldCheck, HelpCircle, ChevronDown, Image as ImageIcon } from 'lucide-react';
import { Breadcrumbs } from './Breadcrumbs';

interface ServicesProps {
  services: Service[];
  setActiveTab: (tab: string) => void;
}

export const Services: React.FC<ServicesProps> = ({ services, setActiveTab }) => {
  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(null);
  const [activeFaqIdx, setActiveFaqIdx] = useState<number | null>(null);

  // Monitor custom navigation events from the global search
  useEffect(() => {
    const handleNavService = (e: Event) => {
      const id = (e as CustomEvent).detail;
      if (id) {
        setSelectedServiceId(id);
        window.scrollTo({ top: 300, behavior: 'smooth' });
      }
    };
    window.addEventListener('nav-service', handleNavService);
    return () => window.removeEventListener('nav-service', handleNavService);
  }, []);

  const selectedService = services.find(s => s.id === selectedServiceId);

  const toggleFaq = (idx: number) => {
    setActiveFaqIdx(prev => (prev === idx ? null : idx));
  };

  if (selectedService) {
    return (
      <div className="bg-white min-h-screen pt-24 pb-16">
        
        {/* Breadcrumb Navigation */}
        <Breadcrumbs
          items={[
            { label: 'Services', onClick: () => setSelectedServiceId(null) },
            { label: selectedService.title, active: true }
          ]}
          onHomeClick={() => {
            setSelectedServiceId(null);
            setActiveTab('home');
          }}
        />

        {/* Dynamic Detail Banner */}
        <div className="relative h-[250px] sm:h-[400px] w-full overflow-hidden bg-[#1A2332]">
          <img
            src={selectedService.banner}
            alt={selectedService.title}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover opacity-60"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#1A2332] via-transparent to-transparent" />
          <div className="absolute bottom-10 left-0 right-0 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-left">
            <span className="text-xs font-bold tracking-widest text-[#F47B20] uppercase bg-orange-500/10 px-3 py-1 rounded-full">
              Construction Specialization
            </span>
            <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white mt-3">
              {selectedService.title}
            </h1>
          </div>
        </div>

        {/* Detail Content Section */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 text-left">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            
            {/* Left Main Description & Features */}
            <div className="lg:col-span-8 flex flex-col gap-8">
              <div>
                <h2 className="text-xl font-bold font-display text-[#1A2332] border-l-4 border-[#1A6DB5] pl-3 mb-4">
                  Overview
                </h2>
                <p className="text-slate-600 text-base leading-relaxed">
                  {selectedService.description}
                </p>
              </div>

              {/* Checklist */}
              <div>
                <h2 className="text-xl font-bold font-display text-[#1A2332] border-l-4 border-[#1A6DB5] pl-3 mb-6">
                  Key Technical Deliverables
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {selectedService.features.map((feature, i) => (
                    <div
                      key={i}
                      className="flex items-start gap-3 bg-slate-50 p-4 rounded-xl border border-slate-100 hover:border-[#1A6DB5]/20 transition-colors"
                    >
                      <ShieldCheck className="w-5 h-5 text-[#1A6DB5] flex-shrink-0 mt-0.5" />
                      <span className="text-slate-700 text-xs sm:text-sm font-medium">
                        {feature}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Photo Gallery */}
              {selectedService.gallery && selectedService.gallery.length > 0 && (
                <div>
                  <h2 className="text-xl font-bold font-display text-[#1A2332] border-l-4 border-[#1A6DB5] pl-3 mb-6 flex items-center gap-2">
                    <ImageIcon className="w-5 h-5 text-[#1A6DB5]" />
                    <span>Representative Gallery</span>
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {selectedService.gallery.map((img, i) => (
                      <div
                        key={i}
                        className="rounded-xl overflow-hidden aspect-[4/3] bg-slate-100 shadow-sm border border-slate-100 group"
                      >
                        <img
                          src={img}
                          alt={`Gallery photo ${i + 1}`}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Right Interactive sidebar for FAQs & Instant Action */}
            <div className="lg:col-span-4 flex flex-col gap-8">
              
              {/* Call-to-action Card */}
              <div className="bg-[#1A2332] text-white p-6 rounded-3xl shadow-lg border border-slate-800 bg-grid-white relative">
                <div className="absolute top-4 right-4 w-12 h-12 rounded-full bg-white/5 flex items-center justify-center">
                  <ShieldCheck className="text-[#F47B20] w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold font-display mb-2">Request This Service</h3>
                <p className="text-xs text-slate-400 mb-6 leading-relaxed">
                  Connect with our Chief Civil Engineer. We'll arrange a free site-inspection and detailed feasibility assessment.
                </p>
                <div className="flex flex-col gap-3">
                  <button
                    onClick={() => setActiveTab('quote')}
                    className="w-full py-3 bg-[#1A6DB5] hover:bg-[#1558a0] text-white font-bold rounded-xl text-xs tracking-wider uppercase transition-all shadow-md shadow-[#1A6DB5]/20"
                  >
                    Calculate Budget Estimate
                  </button>
                  <button
                    onClick={() => setActiveTab('contact')}
                    className="w-full py-3 bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl text-xs tracking-wider uppercase transition-all border border-white/10"
                  >
                    Schedule Consultation
                  </button>
                </div>
              </div>

              {/* FAQs Accordion */}
              {selectedService.faqs && selectedService.faqs.length > 0 && (
                <div className="flex flex-col gap-4">
                  <h3 className="text-lg font-bold font-display text-[#1A2332] flex items-center gap-2">
                    <HelpCircle className="w-5 h-5 text-[#1A6DB5]" />
                    <span>Service FAQs</span>
                  </h3>
                  <div className="flex flex-col gap-3">
                    {selectedService.faqs.map((faq, idx) => (
                      <div
                        key={idx}
                        className="border border-slate-100 rounded-xl overflow-hidden shadow-sm"
                      >
                        <button
                          onClick={() => toggleFaq(idx)}
                          className="w-full p-4 bg-slate-50 flex justify-between items-center text-left text-xs font-bold text-slate-800 hover:bg-slate-100 transition-colors focus:outline-none"
                        >
                          <span>{faq.question}</span>
                          <ChevronDown
                            className={`w-4 h-4 text-slate-400 transition-transform ${
                              activeFaqIdx === idx ? 'transform rotate-180' : ''
                            }`}
                          />
                        </button>
                        {activeFaqIdx === idx && (
                          <div className="p-4 bg-white text-xs text-slate-500 leading-relaxed border-t border-slate-100">
                            {faq.answer}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>
          </div>

          <div className="mt-12 text-center">
            <button
              onClick={() => setSelectedServiceId(null)}
              className="inline-flex items-center gap-1.5 text-[#1A6DB5] font-bold text-sm hover:underline"
            >
              <span>Back to all services</span>
            </button>
          </div>
        </div>

      </div>
    );
  }

  return (
    <section className="bg-slate-50 min-h-screen pt-28 pb-16 px-4 sm:px-6 lg:px-8 bg-grid-blueprint relative">
      
      {/* Decorative lines */}
      <div className="absolute top-0 right-0 w-48 h-48 border-b-2 border-l-2 border-[#1A6DB5]/5 pointer-events-none" />

      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <span className="inline-block bg-orange-500/10 text-[#F47B20] text-xs font-bold uppercase tracking-wider px-4 py-1.5 rounded-full mb-3">
            Lifehut Expertise
          </span>
          <h1 className="font-display text-3xl sm:text-4xl font-extrabold text-[#1A2332]">
            Fully Integrated Civil Engineering Solutions
          </h1>
          <p className="text-slate-500 text-sm sm:text-base max-w-xl mx-auto mt-3">
            From design parameters and soil stress analyses to pristine luxury handovers, we deliver outstanding residential builds.
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((svc, idx) => (
            <div
              key={svc.id}
              onClick={() => setSelectedServiceId(svc.id)}
              className="bg-white rounded-3xl border border-slate-100 p-6 flex flex-col justify-between shadow-premium hover:shadow-premium-hover transition-all duration-300 cursor-pointer group text-left relative overflow-hidden"
            >
              {/* Highlight accent bar */}
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-slate-100 group-hover:bg-[#1A6DB5] transition-colors" />

              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-extrabold tracking-widest text-[#F47B20] uppercase font-mono">
                    0{idx + 1}
                  </span>
                  <div className="w-10 h-10 rounded-xl bg-sky-50 text-[#1A6DB5] group-hover:bg-[#1A6DB5] group-hover:text-white flex items-center justify-center transition-all">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                </div>

                <h3 className="font-display text-lg font-extrabold text-[#1A2332] group-hover:text-[#1A6DB5] transition-colors">
                  {svc.title}
                </h3>
                <p className="text-slate-500 text-xs sm:text-sm leading-relaxed line-clamp-3">
                  {svc.description}
                </p>
              </div>

              <div className="mt-6 flex items-center justify-between pt-4 border-t border-slate-50">
                <span className="text-[11px] font-extrabold text-slate-400 group-hover:text-[#1A6DB5] uppercase tracking-wider flex items-center gap-1">
                  <span>Explore Detail</span>
                  <ChevronRight className="w-3 h-3 transform group-hover:translate-x-1 transition-transform" />
                </span>
                <span className="text-[10px] font-bold text-slate-300">Lifehut</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
