import React, { useState, useEffect } from 'react';
import { ArrowRight, Hammer, CheckCircle, Percent, DollarSign } from 'lucide-react';
import { DraftsmanDrawing } from './DraftsmanDrawing';

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
  // Numeric values for the counting animation
  const [projCount, setProjCount] = useState(0);
  const [expCount, setExpCount] = useState(0);
  const [satCount, setSatCount] = useState(0);

  useEffect(() => {
    // Staggered counting up animation
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

  return (
    <section className="relative min-h-screen flex items-center pt-24 pb-16 bg-[#F8FAFD] bg-grid-blueprint bg-blueprint-lines overflow-hidden">
      
      {/* Decorative Radial Backdrop Gradients */}
      <div className="absolute right-0 top-0 w-[500px] h-[500px] bg-gradient-to-bl from-[#1A6DB5]/5 to-transparent rounded-full blur-3xl pointer-events-none" />
      <div className="absolute left-10 bottom-10 w-[300px] h-[300px] bg-gradient-to-tr from-[#F47B20]/5 to-transparent rounded-full blur-2xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* Text and Actions */}
          <div className="lg:col-span-7 flex flex-col gap-6 text-left">
            
            {/* Tag Badge */}
            <div className="self-start inline-flex items-center gap-2 px-4 py-1.5 bg-white border border-slate-100 rounded-full shadow-sm text-xs font-bold text-[#1A6DB5] tracking-wide animate-pulse">
              <span className="w-2 h-2 rounded-full bg-[#F47B20]" />
              <span>Chennai's Elite Structural Builder</span>
            </div>

            {/* Main Premium Typography Headline */}
            <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-extrabold text-[#1A2332] leading-[1.1] tracking-tight">
              {heroTitle.split(' ').map((word, i) => (
                <span key={i}>
                  {word === 'Dream' || word === 'Build' ? (
                    <span className="text-[#1A6DB5]">{word} </span>
                  ) : (
                    <span>{word} </span>
                  )}
                </span>
              ))}
            </h1>

            {/* Subheading */}
            <p className="text-slate-500 font-sans text-base sm:text-lg max-w-xl leading-relaxed">
              {heroSubtitle} Engineered from foundation boring tests up to custom modular structural detailing. Delivered completely transparently.
            </p>

            {/* Interactive CTA Panel */}
            <div className="flex flex-wrap items-center gap-4 mt-2">
              <button
                onClick={() => setActiveTab('quote')}
                className="px-8 py-4 bg-[#1A6DB5] hover:bg-[#1558a0] text-white font-bold rounded-full transition-all duration-300 transform hover:scale-105 shadow-lg shadow-[#1A6DB5]/20 flex items-center gap-2 group"
              >
                <span>Get Instant Quote</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </button>
              <button
                onClick={() => setActiveTab('projects')}
                className="px-8 py-4 bg-white hover:bg-slate-50 text-[#1A2332] border border-slate-200 font-bold rounded-full transition-all duration-300 transform hover:scale-105 shadow-sm flex items-center gap-2"
              >
                <span>View Projects</span>
              </button>
            </div>

            {/* Dynamic Numeric Counters (Animated) */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 pt-8 mt-4 border-t border-slate-100">
              
              <div className="flex flex-col">
                <div className="font-display text-3xl font-extrabold text-[#1A6DB5] flex items-center">
                  <span>{projCount}</span>
                  <span className="text-[#F47B20] text-xl font-bold ml-0.5">+</span>
                </div>
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mt-1">Completed Projects</span>
              </div>

              <div className="flex flex-col">
                <div className="font-display text-3xl font-extrabold text-[#1A6DB5] flex items-center">
                  <span>{expCount}</span>
                  <span className="text-[#F47B20] text-xl font-bold ml-0.5">+</span>
                </div>
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mt-1">Years Experience</span>
              </div>

              <div className="flex flex-col">
                <div className="font-display text-3xl font-extrabold text-[#1A6DB5] flex items-center">
                  <span>{satCount}</span>
                  <span className="text-[#F47B20] text-xl font-bold ml-0.5">%</span>
                </div>
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mt-1">Client Satisfaction</span>
              </div>

              <div className="flex flex-col">
                <div className="font-display text-3xl font-extrabold text-[#1A6DB5] flex items-center">
                  <span className="text-xl font-bold mr-0.5">₹</span>
                  <span>0</span>
                </div>
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mt-1">Hidden Charges</span>
              </div>

            </div>

          </div>

          {/* Visual Presentation Area */}
          <div className="lg:col-span-5 relative">
            
            {/* Background geometric design patterns */}
            <div className="absolute -top-6 -left-6 w-16 h-16 border-t-2 border-l-2 border-[#1A6DB5]/20 pointer-events-none" />
            <div className="absolute -bottom-6 -right-6 w-16 h-16 border-b-2 border-r-2 border-[#1A6DB5]/20 pointer-events-none" />

            <DraftsmanDrawing />

          </div>

        </div>
      </div>

    </section>
  );
};
