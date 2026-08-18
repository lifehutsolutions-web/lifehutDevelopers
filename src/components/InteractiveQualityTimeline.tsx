import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Compass, HardHat, ShieldCheck, CheckCircle2, Ruler, Sparkles, Award } from 'lucide-react';

interface TimelineStep {
  id: string;
  stepNumber: string;
  title: string;
  shortDesc: string;
  fullDesc: string;
  icon: React.ElementType;
  image: string;
  deliverables: string[];
  metrics: { label: string; value: string }[];
}

export const InteractiveQualityTimeline: React.FC = () => {
  const [activeStepId, setActiveStepId] = useState<string>('survey');

  const steps: TimelineStep[] = [
    {
      id: 'survey',
      stepNumber: '01',
      title: 'Site Feasibility & Architectural Planning',
      shortDesc: 'Digital site boundary survey and precision layout planning.',
      fullDesc: 'Comprehensive site assessment, boundary level verification, and architectural layout planning tailored to plot dimensions and Vastu orientation.',
      icon: Compass,
      image: 'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?q=80&w=1200&auto=format&fit=crop',
      deliverables: [
        'Detailed Site Survey & Boundary Verification Report',
        'Vastu-Compliant 2D Floor Plans & Elevation Concept',
        'Engineered Footing & Column Coordinate Layout'
      ],
      metrics: [
        { label: 'Survey Accuracy', value: '100% Total Station' },
        { label: 'Settlement Risk', value: '0.00% Zero Defect' },
        { label: 'Design Turnaround', value: '3 to 5 Days' }
      ]
    },
    {
      id: 'modeling',
      stepNumber: '02',
      title: '3D BIM & Wind-Load Structural Analysis',
      shortDesc: 'Ductile frame engineering modeled for 180 km/h wind gusts.',
      fullDesc: 'Engineered beam-column schedules modeled according to IS 456 & IS 1893 seismic standards for Chennai coastal zones.',
      icon: Ruler,
      image: 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?q=80&w=1200&auto=format&fit=crop',
      deliverables: [
        'Licensed Structural Stability Certificate',
        'Photorealistic 3D Architectural Elevation',
        'Complete Bar Bending Schedule (BBS) to prevent steel waste'
      ],
      metrics: [
        { label: 'Wind Resistance', value: '180 km/h Rated' },
        { label: 'Design Mix', value: 'M25 / M30 Grade' },
        { label: 'IS Codes', value: 'IS 456 & IS 13920' }
      ]
    },
    {
      id: 'rcc',
      stepNumber: '03',
      title: 'High-Ductility RCC & Brand-Audited Pours',
      shortDesc: 'UltraTech ready-mix concrete and Tata Tiscon Fe 550D rebar.',
      fullDesc: 'Site execution directed by full-time civil site engineers with on-site slump tests and 7/28-day concrete cube crush tests.',
      icon: HardHat,
      image: 'https://images.unsplash.com/photo-1541976590-713951a5a29d?q=80&w=1200&auto=format&fit=crop',
      deliverables: [
        'Lab 28-Day Concrete Cube Compression Test Certificates',
        'Daily Live Photo & Video Logs on WhatsApp',
        'Anti-Termite Chemical Barrier Guarantee'
      ],
      metrics: [
        { label: 'Steel Grade', value: 'Tata Fe 550D Super-Ductile' },
        { label: 'Cube Strength', value: '≥ 30 N/mm² Lab Tested' },
        { label: 'Curing Cycle', value: 'Strict 21 Days' }
      ]
    },
    {
      id: 'handover',
      stepNumber: '04',
      title: '350-Point Quality Audit & Key Handover',
      shortDesc: 'Deep cleaning, CPVC pressure testing, and 10-year warranty.',
      fullDesc: 'Senior auditors execute a 350-point checklist: hydraulic pipe testing, laser level alignment, and acoustic window verification.',
      icon: ShieldCheck,
      image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=1200&auto=format&fit=crop',
      deliverables: [
        '10-Year Sealed Structural Warranty Certificate',
        'As-Built Electrical & Plumbing Blueprint Dossier',
        'Turnkey Deep Cleaned Griha Pravesham Handover'
      ],
      metrics: [
        { label: 'Quality Checkpoints', value: '350 Item Audit' },
        { label: 'Structural Warranty', value: '10 Years Sealed' },
        { label: 'Post Handover', value: '1-Yr Free Support' }
      ]
    }
  ];

  const currentStep = steps.find(s => s.id === activeStepId) || steps[0];

  return (
    <section className="py-20 bg-white bg-grid-blueprint relative overflow-hidden text-left border-b border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-3xl mx-auto mb-12"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#1A6DB5]/10 border border-[#1A6DB5]/20 text-[#1A6DB5] text-xs font-bold font-mono uppercase tracking-widest mb-3">
            <Award className="w-3.5 h-3.5 text-[#1A6DB5]" />
            <span>The Lifehut Engineering Protocol</span>
          </div>
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight">
            Interactive Construction <span className="text-[#1A6DB5]">Milestones</span>
          </h2>
          <p className="text-slate-600 text-sm sm:text-base mt-3 leading-relaxed max-w-xl mx-auto">
            Click any milestone below to inspect our scientific quality controls at every construction stage.
          </p>
        </motion.div>

        {/* 4 Interactive Milestone Tabs */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8 relative">
          {steps.map((step, idx) => {
            const Icon = step.icon;
            const isActive = activeStepId === step.id;
            return (
              <motion.button
                key={step.id}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: idx * 0.08 }}
                onClick={() => setActiveStepId(step.id)}
                className={`p-5 rounded-2xl border text-left transition-all duration-200 relative flex flex-col justify-between cursor-pointer ${
                  isActive
                    ? 'bg-sky-50/80 text-slate-900 border-[#1A6DB5] shadow-md ring-2 ring-[#1A6DB5]/10'
                    : 'bg-white hover:bg-slate-50 text-slate-800 border-slate-200'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <span className={`text-xs font-mono font-extrabold ${isActive ? 'text-[#1A6DB5]' : 'text-slate-400'}`}>
                    PHASE {step.stepNumber}
                  </span>
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all ${
                    isActive ? 'bg-[#1A6DB5] text-white shadow-sm' : 'bg-slate-100 text-slate-600'
                  }`}>
                    <Icon className="w-4 h-4" />
                  </div>
                </div>

                <div>
                  <h4 className={`text-xs sm:text-sm font-display font-extrabold line-clamp-1 ${isActive ? 'text-[#1A6DB5]' : 'text-slate-900'}`}>
                    {step.title}
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                    {step.shortDesc}
                  </p>
                </div>

                {isActive && (
                  <motion.div
                    layoutId="activeTimelineBarLight"
                    className="absolute bottom-0 left-0 right-0 h-1 bg-[#1A6DB5] rounded-b-2xl"
                  />
                )}
              </motion.button>
            );
          })}
        </div>

        {/* Detailed Stage Showcase (Light Theme) */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-md text-slate-900 relative overflow-hidden"
          >
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
              
              {/* Left Column: Technical Description & Deliverables */}
              <div className="lg:col-span-7 flex flex-col gap-4">
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 rounded-full text-xs font-mono font-bold uppercase tracking-wider bg-sky-50 text-[#1A6DB5] border border-sky-100">
                    Phase {currentStep.stepNumber} Verified Protocol
                  </span>
                  <span className="text-xs font-semibold text-slate-500">• Strict IS Standards</span>
                </div>

                <h3 className="font-display text-xl sm:text-2xl font-extrabold text-slate-900">
                  {currentStep.title}
                </h3>

                <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
                  {currentStep.fullDesc}
                </p>

                {/* Deliverables Checklist */}
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
                  <h4 className="text-xs font-mono font-bold uppercase tracking-widest text-[#1A6DB5] mb-2.5 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-[#1A6DB5]" />
                    <span>Client Deliverables & Certifications</span>
                  </h4>
                  <ul className="flex flex-col gap-2 list-none p-0 m-0 text-xs text-slate-700">
                    {currentStep.deliverables.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                        <span className="font-medium">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* 3 Metric Badges */}
                <div className="grid grid-cols-3 gap-3">
                  {currentStep.metrics.map((m, idx) => (
                    <div key={idx} className="bg-slate-50 p-3 rounded-xl border border-slate-200 flex flex-col">
                      <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">{m.label}</span>
                      <span className="text-xs font-bold text-[#1A6DB5] mt-0.5 font-mono truncate">{m.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right Column: High-Res Real Architecture Image */}
              <div className="lg:col-span-5 relative">
                <div className="rounded-2xl overflow-hidden aspect-[4/3] shadow-md border border-slate-200 bg-slate-100 relative group">
                  <img
                    src={currentStep.image}
                    alt={currentStep.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent" />
                  
                  <div className="absolute bottom-3 left-3 right-3 bg-white/95 backdrop-blur-md p-3 rounded-xl border border-slate-200 flex items-center justify-between shadow-sm">
                    <div>
                      <span className="text-[9px] font-mono font-bold text-emerald-600 uppercase tracking-widest block">Site Civil Supervisor</span>
                      <h5 className="text-xs font-bold text-slate-900">Er. Saravanan, B.E. Civil</h5>
                    </div>
                    <div className="w-6 h-6 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
                      <ShieldCheck className="w-3.5 h-3.5" />
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </motion.div>
        </AnimatePresence>

      </div>
    </section>
  );
};
