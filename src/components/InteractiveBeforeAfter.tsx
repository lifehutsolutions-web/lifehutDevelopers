import React, { useState, useRef, useCallback } from 'react';
import { Layers, CheckCircle2, Sparkles, SlidersHorizontal, ArrowLeftRight, Shield } from 'lucide-react';
import { motion } from 'motion/react';

export const InteractiveBeforeAfter: React.FC = () => {
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMove = useCallback((clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setSliderPosition(percentage);
  }, []);

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length > 0) {
      handleMove(e.touches[0].clientX);
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      handleMove(e.clientX);
    }
  };

  return (
    <section className="py-20 bg-slate-50 relative overflow-hidden bg-grid-blueprint text-left border-y border-slate-200/80">
      
      {/* Decorative Brand Light Glows */}
      <div className="absolute -top-24 -left-24 w-96 h-96 bg-[#1A6DB5]/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-sky-400/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-3xl mx-auto mb-10"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#1A6DB5]/10 border border-[#1A6DB5]/20 text-[#1A6DB5] text-xs font-bold font-mono uppercase tracking-widest mb-3">
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Interactive Engineering Comparison</span>
          </div>
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight">
            Raw RCC Structure to <span className="text-[#1A6DB5]">Luxury Villa</span>
          </h2>
          <p className="text-slate-600 text-sm sm:text-base mt-3 leading-relaxed max-w-xl mx-auto">
            Slide left and right to inspect the transition from reinforced concrete frame to finished turnkey handover.
          </p>
        </motion.div>

        {/* Interactive Comparison Slider Box */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
          ref={containerRef}
          onMouseDown={() => setIsDragging(true)}
          onMouseUp={() => setIsDragging(false)}
          onMouseLeave={() => setIsDragging(false)}
          onMouseMove={handleMouseMove}
          onTouchMove={handleTouchMove}
          className="relative w-full max-w-5xl mx-auto h-[380px] sm:h-[480px] rounded-3xl overflow-hidden shadow-lg border border-slate-300 select-none cursor-ew-resize group bg-slate-900"
        >
          {/* AFTER: Turnkey Finished Luxury Villa */}
          <div className="absolute inset-0 w-full h-full">
            <img
              src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=1600&auto=format&fit=crop"
              alt="Turnkey Luxury Finished Villa"
              className="w-full h-full object-cover"
              draggable={false}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-black/20 pointer-events-none" />
            
            {/* Finished Badge Right */}
            <div className="absolute top-5 right-5 z-10 bg-white/95 backdrop-blur-md border border-slate-200 px-3.5 py-1.5 rounded-2xl flex items-center gap-2 shadow-md">
              <Sparkles className="w-4 h-4 text-emerald-600" />
              <div className="text-left">
                <span className="text-[9px] font-mono font-bold text-emerald-600 uppercase tracking-widest block">Phase 04</span>
                <span className="text-xs font-bold text-slate-900">Finished Luxury Villa</span>
              </div>
            </div>

            {/* Bottom Specs List for Finished */}
            <div className="absolute bottom-5 right-5 z-10 hidden sm:flex flex-col gap-1.5 max-w-xs text-right bg-white/90 backdrop-blur-md p-3.5 rounded-2xl border border-slate-200 shadow-md">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider font-mono">Luxury Handover</span>
              <div className="text-xs text-slate-800 flex items-center justify-end gap-1.5 font-semibold">
                <span>Vitrified Glazed Tiles & Teak Doors</span>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
              </div>
              <div className="text-xs text-slate-800 flex items-center justify-end gap-1.5 font-semibold">
                <span>Deceuninck UPVC & Weatherproof Emulsion</span>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
              </div>
            </div>
          </div>

          {/* BEFORE: Structural Concrete Framework (Clipped Layer) */}
          <div
            className="absolute inset-y-0 left-0 overflow-hidden"
            style={{ width: `${sliderPosition}%` }}
          >
            <div className="relative w-full h-full" style={{ width: containerRef.current ? `${containerRef.current.clientWidth}px` : '100%' }}>
              <img
                src="https://images.unsplash.com/photo-1541888946425-d81bb19240f5?q=80&w=1600&auto=format&fit=crop"
                alt="Raw Structural Concrete Stage"
                className="w-full h-full object-cover filter saturate-75 brightness-95"
                draggable={false}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-black/20 pointer-events-none" />

              {/* Structural Badge Left */}
              <div className="absolute top-5 left-5 z-10 bg-white/95 backdrop-blur-md border border-slate-200 px-3.5 py-1.5 rounded-2xl flex items-center gap-2 shadow-md">
                <Layers className="w-4 h-4 text-[#1A6DB5]" />
                <div className="text-left">
                  <span className="text-[9px] font-mono font-bold text-[#1A6DB5] uppercase tracking-widest block">Phase 02</span>
                  <span className="text-xs font-bold text-slate-900">RCC Structural Shell</span>
                </div>
              </div>

              {/* Bottom Specs List for Structural */}
              <div className="absolute bottom-5 left-5 z-10 hidden sm:flex flex-col gap-1.5 max-w-xs text-left bg-white/90 backdrop-blur-md p-3.5 rounded-2xl border border-slate-200 shadow-md">
                <span className="text-[10px] font-bold text-[#1A6DB5] uppercase tracking-wider font-mono">Structural Integrity</span>
                <div className="text-xs text-slate-800 flex items-center gap-1.5 font-semibold">
                  <Shield className="w-3.5 h-3.5 text-[#1A6DB5] flex-shrink-0" />
                  <span>Tata Fe 550D Rebar & IS-Standard Footings</span>
                </div>
                <div className="text-xs text-slate-800 flex items-center gap-1.5 font-semibold">
                  <Shield className="w-3.5 h-3.5 text-[#1A6DB5] flex-shrink-0" />
                  <span>Concrete Lab Cube Crush Compression Tests</span>
                </div>
              </div>
            </div>
          </div>

          {/* Interactive Divider Line with Draggable Handle */}
          <div
            className="absolute top-0 bottom-0 w-1 bg-white shadow-[0_0_12px_rgba(0,0,0,0.4)] z-30 pointer-events-none"
            style={{ left: `${sliderPosition}%` }}
          >
            {/* Center Thumb */}
            <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-11 h-11 bg-white rounded-full shadow-xl flex items-center justify-center border-3 border-[#1A6DB5] text-slate-800 transition-transform group-hover:scale-110">
              <ArrowLeftRight className="w-4 h-4 text-[#1A6DB5]" />
            </div>
          </div>

          {/* Hint Overlay */}
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-slate-900/80 backdrop-blur-md px-3.5 py-1 rounded-full border border-white/20 text-[11px] text-white pointer-events-none flex items-center gap-1.5 shadow-md">
            <ArrowLeftRight className="w-3 h-3 text-sky-400" />
            <span>Drag slider to compare</span>
          </div>
        </motion.div>

        {/* 3 Micro Feature Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-5xl mx-auto mt-8">
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="bg-white p-5 rounded-2xl border border-slate-200 text-left flex items-start gap-3.5 shadow-sm"
          >
            <div className="w-10 h-10 rounded-xl bg-sky-50 text-[#1A6DB5] flex items-center justify-center flex-shrink-0 border border-sky-100">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900">Engineered Foundation</h4>
              <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">Reinforced concrete footings designed for lifetime stability.</p>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="bg-white p-5 rounded-2xl border border-slate-200 text-left flex items-start gap-3.5 shadow-sm"
          >
            <div className="w-10 h-10 rounded-xl bg-sky-50 text-[#1A6DB5] flex items-center justify-center flex-shrink-0 border border-sky-100">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900">Branded Primary Materials</h4>
              <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">UltraTech cement and Tata Tiscon Fe 550D steel.</p>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.3 }}
            className="bg-white p-5 rounded-2xl border border-slate-200 text-left flex items-start gap-3.5 shadow-sm"
          >
            <div className="w-10 h-10 rounded-xl bg-sky-50 text-[#1A6DB5] flex items-center justify-center flex-shrink-0 border border-sky-100">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900">10-Year Warranty Handover</h4>
              <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">Pristine key handover with full engineering drawings.</p>
            </div>
          </motion.div>
        </div>

      </div>
    </section>
  );
};
