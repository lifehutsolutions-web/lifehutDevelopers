import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Leaf, Eye, Compass, Hammer, Check, ArrowRight, Activity, Sparkles, Layers, RotateCw, Info } from 'lucide-react';

const heroVilla = "/src/assets/images/hero_villa_1784191464588.jpg";
const meridianResidency = "/src/assets/images/meridian_residency_1784191484091.jpg";

export const DraftsmanDrawing: React.FC = () => {
  const [activeStep, setActiveStep] = useState<number>(0);
  const [isAutoPlay, setIsAutoPlay] = useState<boolean>(true);

  // States for realistic 3D visual home (Step 4)
  const [sliderVal, setSliderVal] = useState<number>(50);
  const [selectedAngle, setSelectedAngle] = useState<'front' | 'meridian'>('front');
  const [activeHotspot, setActiveHotspot] = useState<number | null>(null);
  const [mouseTilt, setMouseTilt] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Define steps
  const steps = [
    {
      id: 0,
      title: "1. Empty Plot",
      desc: "Soil testing",
      icon: Compass,
      color: "#F47B20" // Orange Accent
    },
    {
      id: 1,
      title: "2. Blueprint",
      desc: "CAD Drawing",
      icon: Eye,
      color: "#1A6DB5" // Premium Blue
    },
    {
      id: 2,
      title: "3. Construction",
      desc: "RCC Framing",
      icon: Hammer,
      color: "#4A5568" // Dark Slate
    },
    {
      id: 3,
      title: "4. Final Output",
      desc: "3D Render",
      icon: Leaf,
      color: "#10B981" // Emerald Green
    }
  ];

  // Auto-play cycle
  useEffect(() => {
    if (!isAutoPlay) return;
    const interval = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % steps.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [isAutoPlay, steps.length]);

  // Pen coordinates for blueprint tracing (kept from original for realism)
  const penKeyframesX = [
    50,  450, 80,  80,  220, 220, 80, 180, 440, 440, 200, 200, 240, 240, 400, 400
  ];
  const penKeyframesY = [
    320, 320, 320, 160, 160, 320, 320, 120, 120, 240, 240, 120, 320, 240, 240, 320
  ];

  // Mouse handlers for Step 4 3D Tilt Effect
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5; // -0.5 to 0.5
    const y = (e.clientY - rect.top) / rect.height - 0.5; // -0.5 to 0.5
    setMouseTilt({ x: x * 12, y: -y * 12 }); // 12-degree tilt maximum
  };

  const handleMouseLeave = () => {
    setMouseTilt({ x: 0, y: 0 });
    setActiveHotspot(null);
  };

  // Hotspots definitions
  const hotspots = selectedAngle === 'front' ? [
    {
      id: 1,
      x: '28%',
      y: '45%',
      title: 'Atrium Facade',
      desc: 'Double-glazed solar heat reflective facade.'
    },
    {
      id: 2,
      x: '75%',
      y: '32%',
      title: 'Cantilever Canopy',
      desc: 'Modern floating structure with cedar planks.'
    },
    {
      id: 3,
      x: '62%',
      y: '65%',
      title: 'Glass Balustrade',
      desc: '12mm safety glass with high-tensile cedar rail.'
    },
    {
      id: 4,
      x: '48%',
      y: '82%',
      title: 'LED Uplighting',
      desc: 'Smart ambient exterior LED illumination.'
    }
  ] : [
    {
      id: 1,
      x: '35%',
      y: '35%',
      title: 'Dual Volume Facade',
      desc: 'Sleek juxtaposition of slate and white stucco.'
    },
    {
      id: 2,
      x: '82%',
      y: '45%',
      title: 'Smart Carport',
      desc: 'Equipped with a concealed 11kW EV fast charger.'
    },
    {
      id: 3,
      x: '55%',
      y: '72%',
      title: 'Teak Door',
      desc: 'Burma teak with integrated biometric lock.'
    }
  ];

  return (
    <div className="relative w-full bg-white p-6 rounded-3xl shadow-premium border border-slate-100 flex flex-col gap-6 select-none overflow-hidden">
      
      {/* Title / Header of the process board */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2">
          <Activity className="w-5 h-5 text-[#1A6DB5] animate-pulse" />
          <span className="text-xs font-bold tracking-widest text-[#1A2332] uppercase">
            BUILD PROCESS
          </span>
        </div>
        <button
          onClick={() => setIsAutoPlay(!isAutoPlay)}
          className={`text-[10px] font-bold px-2.5 py-1 rounded-full transition-colors ${
            isAutoPlay 
              ? 'bg-slate-100 text-slate-600 hover:bg-slate-200' 
              : 'bg-[#1A6DB5]/10 text-[#1A6DB5] hover:bg-[#1A6DB5]/20'
          }`}
        >
          {isAutoPlay ? "⏸ PAUSE" : "▶ PLAY"}
        </button>
      </div>

      {/* Main Interactive Stage Container */}
      <div className="relative w-full aspect-[4/3] bg-slate-50 rounded-2xl overflow-hidden border border-slate-200/60 shadow-inner">
        {/* Engineering Blueprint Grid Background */}
        <div className="absolute inset-0 bg-grid-white opacity-40 pointer-events-none" />

        {/* CAD Corner Ticks */}
        <div className="absolute top-3 left-3 w-3 h-3 border-t border-l border-slate-300 pointer-events-none" />
        <div className="absolute top-3 right-3 w-3 h-3 border-t border-r border-slate-300 pointer-events-none" />
        <div className="absolute bottom-3 left-3 w-3 h-3 border-b border-l border-slate-300 pointer-events-none" />
        <div className="absolute bottom-3 right-3 w-3 h-3 border-b border-r border-slate-300 pointer-events-none" />

        {/* Phase Renderers */}
        <AnimatePresence mode="wait">
          {activeStep === 0 && (
            <motion.div
              key="empty-plot"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.02 }}
              transition={{ duration: 0.6 }}
              className="absolute inset-0 p-4 flex flex-col justify-between"
            >
              {/* Plot Coordinates & Info */}
              <div className="flex justify-between items-start">
                <div className="font-mono text-[9px] text-[#F47B20] bg-[#F47B20]/10 px-2 py-1 rounded border border-[#F47B20]/20">
                  <div>LOCATION: CHENNAI</div>
                </div>
                <div className="font-mono text-[9px] text-right text-slate-400">
                  <div>SBC: 180 kN/m²</div>
                </div>
              </div>

              {/* Vector representation of empty plot */}
              <svg viewBox="0 0 500 300" className="w-full h-full text-slate-800">
                {/* Geological Soil Layers */}
                <rect x="30" y="220" width="440" height="40" fill="#E2E8F0" opacity="0.5" rx="4" />
                <rect x="30" y="260" width="440" height="20" fill="#CBD5E1" opacity="0.7" rx="4" />
                <line x1="30" y1="220" x2="470" y2="220" stroke="#94A3B8" strokeWidth="1" strokeDasharray="4 4" />
                <line x1="30" y1="260" x2="470" y2="260" stroke="#64748B" strokeWidth="1" strokeDasharray="4 4" />

                <text x="40" y="245" fill="#475569" fontSize="8" fontFamily="monospace">Clayey Sand Layer</text>
                <text x="40" y="275" fill="#334155" fontSize="8" fontFamily="monospace">Hard Rock Layer</text>

                {/* Ground line */}
                <line x1="20" y1="180" x2="480" y2="180" stroke="#475569" strokeWidth="2.5" />

                {/* Boundary Stone peg 1 */}
                <path d="M 80 180 L 80 155 L 90 160 L 90 180 Z" fill="#94A3B8" stroke="#475569" strokeWidth="1" />
                <circle cx="85" cy="155" r="2.5" fill="#F47B20" />
                <text x="85" y="145" textAnchor="middle" fill="#F47B20" fontSize="8" fontWeight="bold" fontFamily="monospace">A</text>

                {/* Boundary Stone peg 2 */}
                <path d="M 420 180 L 420 155 L 430 160 L 430 180 Z" fill="#94A3B8" stroke="#475569" strokeWidth="1" />
                <circle cx="425" cy="155" r="2.5" fill="#F47B20" />
                <text x="425" y="145" textAnchor="middle" fill="#F47B20" fontSize="8" fontWeight="bold" fontFamily="monospace">B</text>

                {/* Site Board */}
                <g transform="translate(140, 70)">
                  <rect x="0" y="0" width="220" height="75" fill="#FFFFFF" stroke="#F47B20" strokeWidth="1.5" rx="8" className="shadow" />
                  <rect x="0" y="0" width="220" height="25" fill="#F47B20" rx="6" />
                  <text x="110" y="17" textAnchor="middle" fill="#FFFFFF" fontSize="10" fontWeight="bold" letterSpacing="1">SITE: LH-4B</text>
                  <text x="15" y="44" fill="#1A2332" fontSize="9" fontWeight="bold">Premium Villa Plot</text>
                  <text x="15" y="58" fill="#475569" fontSize="8" fontFamily="monospace">Area: 3,400 sq.ft. | ✔ Surveyed</text>
                  
                  {/* Post */}
                  <line x1="50" y1="75" x2="50" y2="110" stroke="#475569" strokeWidth="3" />
                  <line x1="170" y1="75" x2="170" y2="110" stroke="#475569" strokeWidth="3" />
                </g>

                {/* Soil Boring Drill Rig representation (SBC Testing) */}
                <g transform="translate(30, 60)">
                  {/* Tripod */}
                  <line x1="40" y1="120" x2="20" y2="20" stroke="#475569" strokeWidth="1.5" />
                  <line x1="40" y1="120" x2="60" y2="20" stroke="#475569" strokeWidth="1.5" />
                  <line x1="40" y1="120" x2="40" y2="160" stroke="#F47B20" strokeWidth="2.5" strokeDasharray="3 3" />
                  <rect x="36" y="130" width="8" height="15" fill="#1A6DB5" rx="1" />
                  <circle cx="40" cy="120" r="3" fill="#334155" />
                  <text x="40" y="10" textAnchor="middle" fill="#475569" fontSize="8" fontFamily="monospace">Rig</text>
                </g>
              </svg>

              <div className="flex justify-between items-end bg-white/80 p-2.5 rounded-xl border border-slate-100">
                <div>
                  <h5 className="text-xs font-bold text-slate-800">Soil Assessment</h5>
                  <p className="text-[10px] text-slate-500">Core boring analysis to define load capacity.</p>
                </div>
                <span className="text-[10px] bg-[#F47B20]/15 text-[#F47B20] font-bold px-2 py-0.5 rounded-full">PHASE 1/4</span>
              </div>
            </motion.div>
          )}

          {activeStep === 1 && (
            <motion.div
              key="blueprint-drawing"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.02 }}
              transition={{ duration: 0.6 }}
              className="absolute inset-0 p-4 flex flex-col justify-between"
            >
              {/* Draft Sheet Info */}
              <div className="flex justify-between items-start">
                <div className="font-mono text-[9px] text-[#1A6DB5] bg-[#1A6DB5]/10 px-2 py-1 rounded border border-[#1A6DB5]/20">
                  <div>DESIGN: LUXURY VILLA</div>
                </div>
                <div className="font-mono text-[9px] text-right text-[#1A6DB5]/80">
                  <div>DWG: LH-CH-2026</div>
                </div>
              </div>

              {/* Vector Blueprint Tracing */}
              <svg viewBox="0 0 500 300" className="w-full h-full text-[#1A6DB5]">
                {/* Structural Grid lines */}
                <line x1="30" y1="240" x2="470" y2="240" stroke="rgba(26, 109, 181, 0.15)" strokeDasharray="3 3" />
                <line x1="30" y1="120" x2="470" y2="120" stroke="rgba(26, 109, 181, 0.15)" strokeDasharray="3 3" />
                <line x1="80" y1="30" x2="80" y2="260" stroke="rgba(26, 109, 181, 0.15)" strokeDasharray="3 3" />
                <line x1="220" y1="30" x2="220" y2="260" stroke="rgba(26, 109, 181, 0.15)" strokeDasharray="3 3" />
                <line x1="420" y1="30" x2="420" y2="260" stroke="rgba(26, 109, 181, 0.15)" strokeDasharray="3 3" />

                {/* Main Ground Line */}
                <motion.line
                  x1="30" y1="240" x2="470" y2="240"
                  stroke="#1A6DB5" strokeWidth="2"
                  initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1 }}
                />

                {/* Left block frame */}
                <motion.path
                  d="M 80 240 V 120 H 220 V 240 Z"
                  stroke="#1A6DB5" strokeWidth="2.2" fill="none"
                  initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 2, delay: 0.2 }}
                />

                {/* Left window frame */}
                <motion.path
                  d="M 110 180 H 190 V 140 H 110 Z M 150 180 V 140"
                  stroke="#1A6DB5" strokeWidth="1.5" fill="none"
                  initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.5, delay: 1 }}
                />

                {/* Cantilever block frame */}
                <motion.path
                  d="M 220 240 V 80 H 420 V 240 Z"
                  stroke="#1A6DB5" strokeWidth="2.2" fill="none"
                  initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 2.2, delay: 0.5 }}
                />

                {/* Cantilever balcony slider window */}
                <motion.path
                  d="M 240 180 H 400 V 100 H 240 Z"
                  stroke="rgba(26, 109, 181, 0.8)" strokeWidth="1.5" fill="none"
                  initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.8, delay: 1.5 }}
                />
                
                {/* Horizontal slats details */}
                <motion.path
                  d="M 210 80 H 430"
                  stroke="#F47B20" strokeWidth="3" strokeLinecap="round"
                  initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1 }}
                />

                {/* Dimension measurement line */}
                <motion.path
                  d="M 80 265 H 420"
                  stroke="#F47B20" strokeWidth="1"
                  initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.5 }}
                />
                <motion.path
                  d="M 80 260 V 270 M 420 260 V 270"
                  stroke="#F47B20" strokeWidth="1"
                  initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.5, delay: 1.5 }}
                />
                <motion.text
                  x="250" y="278" fill="#F47B20" fontSize="8" fontFamily="monospace" fontWeight="bold" textAnchor="middle"
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.8 }}
                >
                  Span: 17m
                </motion.text>

                {/* Tracing Pencil tip */}
                <motion.g
                  animate={{
                    x: penKeyframesX,
                    y: penKeyframesY,
                  }}
                  transition={{
                    duration: 10,
                    ease: "easeInOut",
                    repeat: Infinity,
                  }}
                >
                  <circle cx="0" cy="0" r="5" fill="rgba(26,109,181,0.2)" className="animate-ping" />
                  <path d="M 0 0 L -8 -20 L -4 -22 L 0 0" fill="#F47B20" stroke="#1A2332" strokeWidth="0.8" />
                </motion.g>
              </svg>

              <div className="flex justify-between items-end bg-white/80 p-2.5 rounded-xl border border-slate-100">
                <div>
                  <h5 className="text-xs font-bold text-slate-800">Architectural Drawing</h5>
                  <p className="text-[10px] text-slate-500">Structural drafting on transparent CAD grid.</p>
                </div>
                <span className="text-[10px] bg-[#1A6DB5]/15 text-[#1A6DB5] font-bold px-2 py-0.5 rounded-full">PHASE 2/4</span>
              </div>
            </motion.div>
          )}

          {activeStep === 2 && (
            <motion.div
              key="structural-construct"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.02 }}
              transition={{ duration: 0.6 }}
              className="absolute inset-0 p-4 flex flex-col justify-between"
            >
              {/* Construction Metrics */}
              <div className="flex justify-between items-start">
                <div className="font-mono text-[9px] text-[#4A5568] bg-[#4A5568]/10 px-2 py-1 rounded border border-[#4A5568]/20">
                  <div>MATERIALS: M25 & FE550D</div>
                </div>
                <div className="font-mono text-[9px] text-right text-slate-400">
                  <div>REINFORCEMENT: 16MM</div>
                </div>
              </div>

              {/* Vector representation of structural construction */}
              <svg viewBox="0 0 500 300" className="w-full h-full text-slate-800">
                {/* Ground */}
                <line x1="20" y1="240" x2="480" y2="240" stroke="#334155" strokeWidth="2" />

                {/* Concrete Footing & Base Columns (Foundation) */}
                <rect x="75" y="240" width="10" height="20" fill="#94A3B8" stroke="#475569" strokeWidth="1" />
                <rect x="215" y="240" width="10" height="20" fill="#94A3B8" stroke="#475569" strokeWidth="1" />
                <rect x="415" y="240" width="10" height="20" fill="#94A3B8" stroke="#475569" strokeWidth="1" />

                {/* Left Structural Frame Under Construction */}
                {/* Column 1 */}
                <rect x="78" y="120" width="8" height="120" fill="#CBD5E1" stroke="#475569" strokeWidth="1" />
                {/* Column 2 */}
                <rect x="214" y="120" width="8" height="120" fill="#CBD5E1" stroke="#475569" strokeWidth="1" />
                {/* Beam */}
                <rect x="78" y="120" width="144" height="12" fill="#94A3B8" stroke="#475569" strokeWidth="1" />

                {/* Rising Brick Wall Block Fill-Ins */}
                <g fill="#F0F4F8" stroke="#94A3B8" strokeWidth="0.5">
                  <rect x="86" y="228" width="24" height="12" fill="#E2E8F0" />
                  <rect x="110" y="228" width="24" height="12" fill="#CBD5E1" />
                  <rect x="134" y="228" width="24" height="12" fill="#E2E8F0" />
                  <rect x="158" y="228" width="24" height="12" fill="#CBD5E1" />
                  <rect x="182" y="228" width="32" height="12" fill="#E2E8F0" />

                  <rect x="86" y="216" width="30" height="12" fill="#CBD5E1" />
                  <rect x="116" y="216" width="24" height="12" fill="#E2E8F0" />
                  <rect x="140" y="216" width="24" height="12" fill="#CBD5E1" />
                  <rect x="164" y="216" width="24" height="12" fill="#E2E8F0" />
                  <rect x="188" y="216" width="26" height="12" fill="#CBD5E1" />
                  
                  <rect x="86" y="204" width="24" height="12" fill="#E2E8F0" />
                  <rect x="110" y="204" width="24" height="12" fill="#CBD5E1" />
                  <rect x="150" y="204" width="24" height="12" fill="#E2E8F0" />
                  <rect x="174" y="204" width="40" height="12" fill="#CBD5E1" />
                </g>

                {/* Steel Rebar/Reinforcement Sprouting from columns */}
                {/* Left Sprout */}
                <line x1="80" y1="120" x2="80" y2="105" stroke="#F47B20" strokeWidth="1.2" />
                <line x1="84" y1="120" x2="84" y2="102" stroke="#F47B20" strokeWidth="1.2" />
                <line x1="82" y1="120" x2="82" y2="108" stroke="#F47B20" strokeWidth="1.2" />

                {/* Balcony slab framework (Cantilever) */}
                <rect x="214" y="80" width="206" height="12" fill="#94A3B8" stroke="#475569" strokeWidth="1" />
                <rect x="414" y="80" width="8" height="160" fill="#CBD5E1" stroke="#475569" strokeWidth="1" />

                {/* Steel Sprout right */}
                <line x1="416" y1="80" x2="416" y2="65" stroke="#F47B20" strokeWidth="1.2" />
                <line x1="420" y1="80" x2="420" y2="62" stroke="#F47B20" strokeWidth="1.2" />

                {/* Scaffolding tubes bracing */}
                <g stroke="#94A3B8" strokeWidth="1" strokeDasharray="3 3">
                  <line x1="50" y1="240" x2="50" y2="100" />
                  <line x1="50" y1="100" x2="100" y2="100" />
                  <line x1="50" y1="170" x2="100" y2="170" />
                  <line x1="50" y1="240" x2="100" y2="170" />
                  <line x1="50" y1="170" x2="100" y2="100" />
                  <line x1="100" y1="240" x2="100" y2="100" />
                </g>

                {/* Concrete Mixer Icon block */}
                <g transform="translate(300, 180)">
                  <circle cx="20" cy="40" r="12" fill="#475569" />
                  <line x1="20" y1="40" x2="10" y2="10" stroke="#334155" strokeWidth="3" />
                  <rect x="5" y="8" width="10" height="8" fill="#F47B20" rx="1" />
                  <circle cx="20" cy="40" r="4" fill="#E2E8F0" />
                  <text x="20" y="58" textAnchor="middle" fill="#64748B" fontSize="7" fontFamily="monospace">Mixer</text>
                </g>
              </svg>

              <div className="flex justify-between items-end bg-white/80 p-2.5 rounded-xl border border-slate-100">
                <div>
                  <h5 className="text-xs font-bold text-slate-800">RCC Casting & Framing</h5>
                  <p className="text-[10px] text-slate-500">Reinforced structure with certified materials.</p>
                </div>
                <span className="text-[10px] bg-[#4A5568]/15 text-[#4A5568] font-bold px-2 py-0.5 rounded-full">PHASE 3/4</span>
              </div>
            </motion.div>
          )}

          {activeStep === 3 && (
            <motion.div
              key="final-masterpiece"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.02 }}
              transition={{ duration: 0.6 }}
              className="absolute inset-0 p-4 flex flex-col justify-between overflow-hidden"
            >
              {/* Handover Badge & View Toggles */}
              <div className="flex justify-between items-center z-20">
                <div className="font-mono text-[9px] text-[#10B981] bg-[#10B981]/10 px-2 py-1 rounded border border-[#10B981]/20 flex items-center gap-1">
                  <Check className="w-3 h-3" />
                  <div>100% REALISTIC 3D STUDIO</div>
                </div>
                
                <div className="flex gap-1 bg-slate-100 p-0.5 rounded-lg border border-slate-200">
                  <button
                    onClick={() => { setSelectedAngle('front'); setIsAutoPlay(false); }}
                    className={`text-[9px] font-bold px-2.5 py-1 rounded-md transition-all ${
                      selectedAngle === 'front'
                        ? 'bg-white text-[#10B981] shadow-sm'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    Atrium Villa
                  </button>
                  <button
                    onClick={() => { setSelectedAngle('meridian'); setIsAutoPlay(false); }}
                    className={`text-[9px] font-bold px-2.5 py-1 rounded-md transition-all ${
                      selectedAngle === 'meridian'
                        ? 'bg-white text-[#10B981] shadow-sm'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    Meridian Residence
                  </button>
                </div>
              </div>

              {/* Realistic 3D Interactive Container */}
              <div 
                className="relative flex-1 w-full my-3 rounded-xl overflow-hidden border border-slate-300 shadow-lg cursor-crosshair bg-slate-950 select-none"
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
                style={{
                  transform: `perspective(1000px) rotateX(${mouseTilt.y}deg) rotateY(${mouseTilt.x}deg) scale3d(1.01, 1.01, 1.01)`,
                  transition: 'transform 0.15s ease-out',
                }}
              >
                {/* 1. Base Layer: The Photorealistic 3D render */}
                <img
                  src={selectedAngle === 'front' ? heroVilla : meridianResidency}
                  alt="Luxurious 3D Architectural Visualization"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover absolute inset-0 pointer-events-none"
                />

                {/* 2. Overlapping clipped layer: CAD Blueprint Wireframe */}
                <div 
                  className="absolute inset-0 overflow-hidden pointer-events-none transition-all duration-75"
                  style={{ 
                    width: `${sliderVal}%`,
                    borderRight: '2px solid #10B981',
                    boxShadow: '0 0 10px rgba(16, 185, 129, 0.4)'
                  }}
                >
                  <div className="absolute top-0 left-0 w-full h-full bg-[#1A2332]/95" style={{ width: '100%' }}>
                    {/* Grid pattern */}
                    <div className="absolute inset-0 bg-grid-white opacity-20 pointer-events-none" />
                    
                    {/* Vector Blueprint Lines */}
                    <svg viewBox="0 0 500 300" className="w-full h-full text-[#10B981] p-4 absolute inset-0 select-none opacity-85">
                      <line x1="30" y1="240" x2="470" y2="240" stroke="rgba(16, 185, 129, 0.15)" strokeDasharray="3 3" />
                      <line x1="30" y1="120" x2="470" y2="120" stroke="rgba(16, 185, 129, 0.15)" strokeDasharray="3 3" />
                      <line x1="80" y1="30" x2="80" y2="260" stroke="rgba(16, 185, 129, 0.15)" strokeDasharray="3 3" />
                      <line x1="220" y1="30" x2="220" y2="260" stroke="rgba(16, 185, 129, 0.15)" strokeDasharray="3 3" />
                      <line x1="420" y1="30" x2="420" y2="260" stroke="rgba(16, 185, 129, 0.15)" strokeDasharray="3 3" />
                      <line x1="30" y1="240" x2="470" y2="240" stroke="#10B981" strokeWidth="2" />
                      <path d="M 80 240 V 120 H 220 V 240 Z" stroke="#10B981" strokeWidth="2.2" fill="none" />
                      <path d="M 110 180 H 190 V 140 H 110 Z M 150 180 V 140" stroke="#10B981" strokeWidth="1.5" fill="none" />
                      <path d="M 220 240 V 80 H 420 V 240 Z" stroke="#10B981" strokeWidth="2.2" fill="none" />
                      <path d="M 240 180 H 400 V 100 H 240 Z" stroke="rgba(16, 185, 129, 0.8)" strokeWidth="1.5" fill="none" />
                      <path d="M 210 80 H 430" stroke="#F47B20" strokeWidth="3" strokeLinecap="round" />
                    </svg>
                  </div>
                </div>

                {/* 3. Interactive Hotspots */}
                {hotspots.map((hs) => (
                  <div
                    key={hs.id}
                    className="absolute z-20 group"
                    style={{ left: hs.x, top: hs.y }}
                    onMouseEnter={() => { setActiveHotspot(hs.id); setIsAutoPlay(false); }}
                    onMouseLeave={() => setActiveHotspot(null)}
                  >
                    <span className="absolute -inset-2.5 rounded-full bg-[#10B981]/30 animate-ping" />
                    <button
                      className={`relative w-4 h-4 rounded-full flex items-center justify-center shadow-lg transition-transform hover:scale-125 ${
                        activeHotspot === hs.id ? 'bg-white text-[#10B981]' : 'bg-[#10B981] text-white'
                      }`}
                    >
                      <Sparkles className="w-2 h-2" />
                    </button>

                    {/* Tooltip Card */}
                    <AnimatePresence>
                      {activeHotspot === hs.id && (
                        <motion.div
                          initial={{ opacity: 0, y: 8, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 8, scale: 0.95 }}
                          className="absolute bottom-6 left-1/2 -translate-x-1/2 w-44 bg-slate-900/90 backdrop-blur text-white p-2.5 rounded-xl shadow-xl border border-white/10 text-[9px] pointer-events-none z-40"
                        >
                          <div className="font-bold text-[#10B981] mb-1 flex items-center gap-1 leading-tight">
                            <Info className="w-3 h-3 text-[#10B981]" />
                            <span>{hs.title}</span>
                          </div>
                          <div className="text-slate-200 leading-relaxed font-medium text-[8px]">
                            {hs.desc}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ))}

                {/* 4. Blueprint vs 3D slider Control Overlay */}
                <div className="absolute bottom-3 left-3 right-3 bg-slate-950/75 backdrop-blur border border-white/10 rounded-lg px-3 py-1.5 flex items-center gap-2 z-30 pointer-events-auto">
                  <Layers className="w-3.5 h-3.5 text-[#10B981] flex-shrink-0" />
                  <span className="text-[8px] text-white font-mono tracking-widest uppercase flex-shrink-0">
                    SLIDE TO REVEAL
                  </span>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={sliderVal}
                    onChange={(e) => {
                      setSliderVal(Number(e.target.value));
                      setIsAutoPlay(false);
                    }}
                    className="flex-1 accent-[#10B981] h-1 bg-white/20 rounded-lg cursor-ew-resize"
                  />
                  <span className="text-[8px] font-mono text-[#10B981] font-bold">
                    {sliderVal === 100 ? "BLUEPRINT" : sliderVal === 0 ? "REAL 3D" : `${sliderVal}%`}
                  </span>
                </div>
              </div>

              {/* Delivery info footer */}
              <div className="flex justify-between items-end bg-white/80 p-2.5 rounded-xl border border-slate-100 z-10">
                <div>
                  <h5 className="text-xs font-bold text-slate-800">Completed 3D Render</h5>
                  <p className="text-[10px] text-slate-500">Hover on hotspots to inspect. Use the slider to compare with the blueprint.</p>
                </div>
                <span className="text-[10px] bg-[#10B981]/15 text-[#10B981] font-bold px-2 py-0.5 rounded-full">PHASE 4/4</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Floating process indicator bar */}
        <div className="absolute top-4 right-4 bg-[#1A2332]/90 backdrop-blur text-white text-[9px] font-mono px-2.5 py-1.5 rounded-lg flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#F47B20] animate-ping" />
          <span>3D PREVIEW</span>
        </div>
      </div>

      {/* Step Buttons at the Bottom */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {steps.map((step) => {
          const IconComponent = step.icon;
          const isSelected = activeStep === step.id;
          return (
            <button
              key={step.id}
              onClick={() => {
                setActiveStep(step.id);
                setIsAutoPlay(false); // Stop autoplay when user manually interacts
              }}
              className={`flex items-start gap-2.5 text-left p-3 rounded-xl border transition-all duration-300 ${
                isSelected 
                  ? 'bg-slate-50 shadow-md scale-[1.02]' 
                  : 'bg-white hover:bg-slate-50/50 border-slate-100 hover:border-slate-200'
              }`}
              style={{
                borderColor: isSelected ? step.color : undefined
              }}
            >
              <div 
                className="p-1.5 rounded-lg flex-shrink-0"
                style={{
                  backgroundColor: `${step.color}15`,
                  color: step.color
                }}
              >
                <IconComponent className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <div className="text-[11px] font-bold text-slate-800 leading-tight truncate">
                  {step.title}
                </div>
                <div className="text-[9px] text-slate-400 font-medium leading-normal truncate">
                  {step.desc}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Connection Indicator Bar */}
      <div className="flex items-center justify-between text-[10px] text-slate-400 border-t border-slate-100 pt-3">
        <span className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
          <span>Active: Chennai</span>
        </span>
        <button 
          onClick={() => {
            setActiveStep((prev) => (prev + 1) % steps.length);
            setIsAutoPlay(false);
          }}
          className="flex items-center gap-1 font-bold text-[#1A6DB5] hover:underline hover:text-[#1A6DB5]/80"
        >
          <span>Next</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

    </div>
  );
};
