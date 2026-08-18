import React, { useState, useEffect } from 'react';
import { ArrowRight, CheckCircle, Sparkles, MapPin, Award, Sliders, Shield } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface HeroProps {
  setActiveTab: (tab: string) => void;
  heroTitle: string;
  heroSubtitle: string;
  heroImage: string;
  stats: {
    projectsDone: string;
    experienceYears: string;
    clientSatisfaction: string;
    hiddenCharges: string;
  };
}

export const Hero: React.FC<HeroProps> = ({
  setActiveTab,
  heroTitle,
  heroSubtitle,
  heroImage,
  stats
}) => {
  // Switchable Villa Previews
  const previewVillas = [
    {
      id: 'villa-1',
      title: 'Contemporary Luxury Villa',
      location: 'Ambattur, Chennai',
      image: heroImage || 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=1200&auto=format&fit=crop',
      tag: 'Turnkey Villa Handover',
      area: '3,800 sq.ft'
    },
    {
      id: 'villa-2',
      title: 'Keelkattalai Duplex Block',
      location: 'Keelkattalai, Chennai',
      image: '/src/assets/images/coastal_business_park_1784191501375.jpg',
      tag: 'G+2 Architectural Duplex',
      area: '3,200 sq.ft'
    },
    {
      id: 'villa-3',
      title: 'OMR Smart Residential Home',
      location: 'OMR, Chennai',
      image: '/src/assets/images/anchor_logistics_hub_1784191519342.jpg',
      tag: 'Bespoke Modern Estate',
      area: '4,500 sq.ft'
    }
  ];

  const [activeVillaIdx, setActiveVillaIdx] = useState(0);
  const [activeHotspot, setActiveHotspot] = useState<string | null>(null);

  // Numeric values for the counting animation
  const [projCount, setProjCount] = useState(0);
  const [expCount, setExpCount] = useState(0);
  const [satCount, setSatCount] = useState(0);

  useEffect(() => {
    const projTarget = parseInt(stats.projectsDone) || 120;
    const expTarget = parseInt(stats.experienceYears) || 7;
    const satTarget = parseInt(stats.clientSatisfaction) || 99;

    let projTimer = setInterval(() => {
      setProjCount((prev) => {
        if (prev >= projTarget) {
          clearInterval(projTimer);
          return projTarget;
        }
        return prev + Math.ceil(projTarget / 15);
      });
    }, 45);

    let expTimer = setInterval(() => {
      setExpCount((prev) => {
        if (prev >= expTarget) {
          clearInterval(expTimer);
          return expTarget;
        }
        return prev + 1;
      });
    }, 100);

    let satTimer = setInterval(() => {
      setSatCount((prev) => {
        if (prev >= satTarget) {
          clearInterval(satTimer);
          return satTarget;
        }
        return prev + Math.ceil(satTarget / 20);
      });
    }, 35);

    return () => {
      clearInterval(projTimer);
      clearInterval(expTimer);
      clearInterval(satTimer);
    };
  }, [stats]);

  const currentVilla = previewVillas[activeVillaIdx];

  const hotspots = [
    {
      id: 'hs1',
      x: '35%',
      y: '28%',
      title: 'Fe 550D RCC Cantilever',
      desc: 'High-ductility steel rebar engineered for 180 km/h wind resistance.'
    },
    {
      id: 'hs2',
      x: '70%',
      y: '55%',
      title: 'Acoustic Double-Glazing',
      desc: 'UPVC multi-track sliding system with rain baffles and insect mesh.'
    },
    {
      id: 'hs3',
      x: '45%',
      y: '80%',
      title: 'Reinforced RCC Foundation',
      desc: 'Engineered isolated footings with plinth beam grid and anti-termite shield.'
    }
  ];

  return (
    <section className="relative min-h-[90vh] flex items-center pt-28 pb-16 bg-white bg-grid-blueprint overflow-hidden border-b border-slate-200">
      
      {/* Decorative Brand Light Glows */}
      <div className="absolute right-0 top-0 w-[550px] h-[550px] bg-sky-100/60 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute left-10 bottom-10 w-[450px] h-[450px] bg-blue-50/70 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* Text and Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="lg:col-span-7 flex flex-col gap-5 text-left"
          >
            
            {/* Live Status Badge */}
            <div className="self-start inline-flex items-center gap-2 px-3.5 py-1.5 bg-sky-50 border border-sky-100 rounded-full shadow-sm text-xs font-bold text-slate-800 tracking-wide">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#1A6DB5] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#1A6DB5]"></span>
              </span>
              <span className="text-[#1A6DB5] font-extrabold uppercase font-mono text-[11px]">Chennai's Structural Master</span>
              <span className="text-slate-300">•</span>
              <span className="text-slate-600 font-medium">14 Active Sites Underway</span>
            </div>

            {/* Headline */}
            <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 leading-[1.12] tracking-tight">
              Build Your <span className="text-[#1A6DB5]">Turnkey Villa</span> with Engineering Precision
            </h1>

            {/* Concise Subtitle */}
            <p className="text-slate-600 font-sans text-sm sm:text-base max-w-xl leading-relaxed">
              Chennai's premier residential civil construction company. Zero hidden fees, lab-tested Fe 550D rebar, and guaranteed 10-year structural warranty.
            </p>

            {/* Interactive CTA Buttons */}
            <div className="flex flex-wrap items-center gap-3.5 mt-2">
              <button
                onClick={() => setActiveTab('pricing')}
                className="px-7 py-3.5 bg-[#1A6DB5] hover:bg-[#1558a0] text-white font-bold rounded-xl transition-all duration-200 shadow-md shadow-[#1A6DB5]/20 flex items-center gap-2 group cursor-pointer text-xs uppercase tracking-wider"
              >
                <span>View Packages (From ₹1,949/sft)</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </button>
              <button
                onClick={() => setActiveTab('quote')}
                className="px-7 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200 font-bold rounded-xl transition-all duration-200 shadow-sm flex items-center gap-2 cursor-pointer text-xs uppercase tracking-wider"
              >
                <Sliders className="w-4 h-4 text-[#1A6DB5]" />
                <span>Instant Cost Estimator</span>
              </button>
            </div>

            {/* Dynamic Numeric Counters (Animated) */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6 mt-2 border-t border-slate-200">
              
              <div className="flex flex-col group cursor-default">
                <div className="font-display text-2xl sm:text-3xl font-extrabold text-[#1A6DB5] flex items-center">
                  <span>{projCount}</span>
                  <span className="text-sky-500 text-xl font-bold ml-0.5">+</span>
                </div>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mt-0.5">Completed Projects</span>
              </div>

              <div className="flex flex-col group cursor-default">
                <div className="font-display text-2xl sm:text-3xl font-extrabold text-[#1A6DB5] flex items-center">
                  <span>{expCount}</span>
                  <span className="text-sky-500 text-xl font-bold ml-0.5">+</span>
                </div>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mt-0.5">Years Experience</span>
              </div>

              <div className="flex flex-col group cursor-default">
                <div className="font-display text-2xl sm:text-3xl font-extrabold text-[#1A6DB5] flex items-center">
                  <span>{satCount}</span>
                  <span className="text-sky-500 text-xl font-bold ml-0.5">%</span>
                </div>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mt-0.5">Satisfaction</span>
              </div>

              <div className="flex flex-col group cursor-default">
                <div className="font-display text-2xl sm:text-3xl font-extrabold text-[#1A6DB5] flex items-center">
                  <span className="text-lg font-bold mr-0.5">₹</span>
                  <span>0</span>
                </div>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mt-0.5">Hidden Charges</span>
              </div>

            </div>

          </motion.div>

          {/* Interactive Villa Visual Presentation Area */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.1, ease: 'easeOut' }}
            className="lg:col-span-5 relative"
          >
            {/* Master Card with Switchable Preview */}
            <div className="relative rounded-3xl overflow-hidden shadow-xl border border-slate-200 bg-slate-900 group">
              
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentVilla.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="relative w-full h-[420px] overflow-hidden"
                >
                  <img
                    src={currentVilla.image}
                    alt={currentVilla.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent pointer-events-none" />

                  {/* Interactive Hotspot Pins */}
                  {hotspots.map((hs) => (
                    <div
                      key={hs.id}
                      style={{ left: hs.x, top: hs.y }}
                      className="absolute z-20"
                      onMouseEnter={() => setActiveHotspot(hs.id)}
                      onMouseLeave={() => setActiveHotspot(null)}
                      onClick={() => setActiveHotspot(activeHotspot === hs.id ? null : hs.id)}
                    >
                      <button
                        className="relative flex items-center justify-center w-7 h-7 rounded-full bg-[#1A6DB5] text-white shadow-lg border-2 border-white cursor-pointer transform hover:scale-125 transition-transform"
                        aria-label={`Inspect ${hs.title}`}
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping absolute" />
                        <Sparkles className="w-3 h-3" />
                      </button>

                      {/* Hotspot Tooltip */}
                      {activeHotspot === hs.id && (
                        <motion.div
                          initial={{ opacity: 0, y: 6, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 6, scale: 0.95 }}
                          className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-52 p-3 bg-white/95 backdrop-blur-md rounded-xl border border-slate-200 shadow-xl text-left z-30 pointer-events-none"
                        >
                          <span className="text-[9px] font-mono font-bold text-[#1A6DB5] uppercase tracking-wider block">Civil Detail</span>
                          <h6 className="text-xs font-bold text-slate-900 mt-0.5">{hs.title}</h6>
                          <p className="text-[11px] text-slate-600 mt-0.5 leading-snug">{hs.desc}</p>
                        </motion.div>
                      )}
                    </div>
                  ))}

                  {/* Top Floating Badge */}
                  <div className="absolute top-4 left-4 z-10 bg-white/95 backdrop-blur-md border border-slate-200 px-3 py-1 rounded-full flex items-center gap-1.5 shadow-sm">
                    <Award className="w-3.5 h-3.5 text-[#1A6DB5]" />
                    <span className="text-[10px] font-mono font-bold text-slate-800 uppercase tracking-wider">{currentVilla.tag}</span>
                  </div>

                  {/* Bottom Information Glass Overlay */}
                  <div className="absolute bottom-3 left-3 right-3 p-3.5 bg-white/95 backdrop-blur-md rounded-2xl border border-slate-200 shadow-lg flex items-center justify-between text-left">
                    <div>
                      <div className="flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-widest text-[#1A6DB5]">
                        <MapPin className="w-3 h-3" />
                        <span>{currentVilla.location}</span>
                        <span>•</span>
                        <span className="text-slate-500 font-mono">{currentVilla.area}</span>
                      </div>
                      <h4 className="text-xs sm:text-sm font-bold text-slate-900 font-display mt-0.5">{currentVilla.title}</h4>
                    </div>
                    <div className="flex items-center gap-1 px-2.5 py-1 bg-sky-50 rounded-full text-[#1A6DB5] text-[11px] font-bold flex-shrink-0 border border-sky-100">
                      <CheckCircle className="w-3.5 h-3.5" />
                      <span>Verified</span>
                    </div>
                  </div>

                </motion.div>
              </AnimatePresence>

              {/* Villa Selector Strip */}
              <div className="bg-slate-900 p-2 border-t border-slate-800 flex items-center justify-between gap-2">
                <div className="text-[10px] font-mono text-slate-400 pl-2 font-bold uppercase hidden sm:block">
                  Models:
                </div>
                <div className="flex items-center gap-1.5 flex-1 justify-end">
                  {previewVillas.map((v, idx) => (
                    <button
                      key={v.id}
                      onClick={() => setActiveVillaIdx(idx)}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                        activeVillaIdx === idx
                          ? 'bg-[#1A6DB5] text-white shadow-sm'
                          : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                      }`}
                    >
                      <span className="font-mono text-[10px]">0{idx + 1}</span>
                      <span className="truncate max-w-[80px]">{v.location.split(',')[0]}</span>
                    </button>
                  ))}
                </div>
              </div>

            </div>

          </motion.div>

        </div>
      </div>

    </section>
  );
};
