import React from 'react';
import { Check, X, Shield, ArrowRight, PhoneCall, HelpCircle } from 'lucide-react';

interface PricingProps {
  setActiveTab: (tab: string) => void;
}

export const Pricing: React.FC<PricingProps> = ({ setActiveTab }) => {
  const plans = [
    {
      name: "Basic Plan",
      price: "1,750",
      tagline: "Best for compact structural homes",
      badge: null,
      highlight: false,
      structural: [
        "RCC Framed Structure with standard steel ratios",
        "ISI Certified cement brands (Coromandel / Zuari)",
        "TMT Steel rods (Fe 500 grade standard)",
        "Brickwork: Solid fly ash bricks / red clay bricks"
      ],
      finishes: [
        "Vitrified floor tiles (₹50/sq.ft budget option)",
        "Plumbing: PVC pipes with standard brass fixtures",
        "Electrical: Finolex cables & anchor modular switches",
        "Standard teakwood frames with flush doors",
        "UPVC 2-track sliding window systems"
      ],
      no: [
        "3D front elevation visualization views",
        "Italian marble flooring additions",
        "Landscaping designer service",
        "Smart home automation integrations"
      ]
    },
    {
      name: "Standard Plan",
      price: "2,200",
      tagline: "Ideal for premium multi-floor family homes",
      badge: "Most Popular",
      highlight: true,
      structural: [
        "RCC Framed Structure designed for wind load",
        "JSW / Ultratech ISI Certified premium cement",
        "TMT Steel rods (Tata Tiscon / JSW Fe 550)",
        "Borehole SBC soil testing report included"
      ],
      finishes: [
        "Premium Vitrified floor tiles (Kajaria ₹80/sq.ft)",
        "UPVC sliding windows with bug mesh panels",
        "Bath fittings (Jaquar / Hindware range)",
        "Internal Painting: 2 coats putty, primer + Apex coat",
        "Solid Teakwood main door and frame (₹30,000 budget)",
        "Premium car porch structure included"
      ],
      no: [
        "Italian marble flooring additions",
        "Landscaping designer service"
      ]
    },
    {
      name: "Premium Plan",
      price: "2,800",
      tagline: "Ultimate luxury and custom elevations",
      badge: "Bespoke Design",
      highlight: false,
      structural: [
        "RCC Framed Structure with custom SBC pile foundation",
        "Ultratech Super premium/Penna concrete options",
        "Fe 550D Super-ductile TMT steel (Tata Tiscon)",
        "SBC report + structural analysis stamped by lead consultant"
      ],
      finishes: [
        "Italian Marble / High-end granite (₹200/sq.ft budget)",
        "UPVC French sliding balcony doors & designer grills",
        "Premium bath fittings (Kohler / Grohe range)",
        "Modular kitchen layout and kitchen platform granite",
        "Smart home automation ready wiring",
        "Complete 3D landscape & custom front exterior elevation"
      ],
      no: []
    }
  ];

  // Comparison columns
  const comparisonSections = [
    {
      title: "Structural Specifications",
      specs: [
        { label: "Steel Quality", basic: "Fe 500 Standard Grade", standard: "JSW / Vizag Fe 550", premium: "Tata Tiscon Fe 550D" },
        { label: "Cement Brands", basic: "Coromandel / Zuari", standard: "Ultratech / JSW Cement", premium: "Ultratech Super / Penna Premium" },
        { label: "Foundation SBC Test", basic: "No", standard: "Yes (Borehole Soil Test)", premium: "Yes (Borehole + Structural Stamp)" },
        { label: "Aggregate Sizes", basic: "20mm & 40mm standard", standard: "Machine Crushed 20mm blue metal", premium: "Graded machine-crushed 20mm metal" }
      ]
    },
    {
      title: "Finishes & Materials",
      specs: [
        { label: "Flooring Selection", basic: "Vitrified (₹50/sq.ft budget)", standard: "Kajaria Vitrified (₹80/sq.ft)", premium: "Italian Marble / Premium Granite (₹200/sq.ft)" },
        { label: "Main Door", basic: "Teakwood frame + Flush door", standard: "Teakwood frame + solid teak door (₹30k)", premium: "Premium Ghana Teak door + custom carve (₹60k)" },
        { label: "Windows", basic: "UPVC 2-track sliding", standard: "UPVC with mosquito mesh (3-track)", premium: "Deceuninck / LG UPVC customized acoustic" },
        { label: "Interior Painting", basic: "1 coat putty, standard emulsion", standard: "2 coats putty, Asian Paints Premium", premium: "2 coats putty, Asian Royale / Jotun Silk" }
      ]
    },
    {
      title: "Electrical & Plumbing",
      specs: [
        { label: "Conduits & Wiring", basic: "Anchor wires & switches", standard: "Finolex / Havells FR wires, Roma switches", premium: "Finolex fire-retardant wires, Legrand Arteor" },
        { label: "Plumbing pipes", basic: "Supreme PVC pipes", standard: "Ashirvad CPVC & Supreme PVC", premium: "Astral Silencio acoustic drainage + Ashirvad CPVC" },
        { label: "Sanitary Fittings", basic: "Parryware standard", standard: "Jaquar / Hindware", premium: "Kohler / Grohe premium wall mount" }
      ]
    }
  ];

  return (
    <div className="bg-slate-50 min-h-screen pt-24 pb-20">
      
      {/* Redesigned Pricing Intro */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 text-center">
        <span className="inline-block bg-orange-500/10 text-[#F47B20] text-xs font-bold uppercase tracking-wider px-4 py-1.5 rounded-full mb-3">
          Structural Pricing Matrix
        </span>
        <h1 className="font-display text-3xl sm:text-4xl font-extrabold text-[#1A2332]">
          Transparent, Material-Locked Budgets
        </h1>
        <p className="text-slate-500 text-sm sm:text-base max-w-xl mx-auto mt-3">
          Our prices are strictly linked to high-quality material bills. No hidden fees. Lock your price before breaking ground.
        </p>

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12 items-stretch">
          {plans.map((p, idx) => (
            <div
              key={idx}
              className={`bg-white rounded-3xl border p-8 flex flex-col justify-between shadow-premium transition-all duration-300 text-left relative ${
                p.highlight
                  ? 'border-[#1A6DB5] border-2 scale-100 md:scale-[1.04] z-10'
                  : 'border-slate-100 hover:border-slate-300'
              }`}
            >
              {p.badge && (
                <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-[#1A6DB5] text-white text-[10px] font-extrabold tracking-widest uppercase px-4 py-1.5 rounded-full">
                  {p.badge}
                </span>
              )}

              <div className="flex flex-col gap-6">
                <div>
                  <div className="text-slate-400 text-xs font-bold uppercase tracking-wider">{p.name}</div>
                  <div className="flex items-baseline gap-1 mt-3 text-[#1A2332]">
                    <span className="font-display text-4xl font-extrabold">₹{p.price}</span>
                    <span className="text-slate-400 text-sm font-semibold">/sq.ft</span>
                  </div>
                  <p className="text-slate-500 text-xs mt-2 leading-relaxed">{p.tagline}</p>
                </div>

                <div className="border-t border-slate-100 pt-6">
                  <div className="text-[10px] font-extrabold tracking-wider text-slate-400 uppercase mb-4">Structural Base</div>
                  <ul className="flex flex-col gap-3 list-none p-0 m-0">
                    {p.structural.map((item, i) => (
                      <li key={i} className="flex items-start gap-2.5 text-xs text-slate-600">
                        <Check className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="border-t border-slate-100 pt-6">
                  <div className="text-[10px] font-extrabold tracking-wider text-slate-400 uppercase mb-4">Finishes & Systems</div>
                  <ul className="flex flex-col gap-3 list-none p-0 m-0">
                    {p.finishes.map((item, i) => (
                      <li key={i} className="flex items-start gap-2.5 text-xs text-slate-600">
                        <Check className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                        <span>{item}</span>
                      </li>
                    ))}
                    {p.no.map((item, i) => (
                      <li key={i} className="flex items-start gap-2.5 text-xs text-slate-400 line-through">
                        <X className="w-4 h-4 text-slate-300 flex-shrink-0 mt-0.5" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="mt-8">
                <button
                  onClick={() => setActiveTab('quote')}
                  className={`w-full py-3.5 rounded-xl font-bold text-xs tracking-wider uppercase transition-all shadow-md ${
                    p.highlight
                      ? 'bg-[#1A6DB5] hover:bg-[#1558a0] text-white shadow-[#1A6DB5]/20'
                      : 'bg-slate-50 hover:bg-slate-100 text-slate-800'
                  }`}
                >
                  Configure My Area Cost
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Detailed Comparison Table */}
        <div className="mt-16 bg-white border border-slate-100 rounded-3xl p-6 sm:p-8 shadow-premium text-left overflow-x-auto">
          <div className="min-w-[600px]">
            <h3 className="font-display text-xl font-extrabold text-[#1A2332] mb-6 flex items-center gap-2">
              <Shield className="w-5.5 h-5.5 text-[#1A6DB5]" />
              <span>Full Specifications Comparison Matrix</span>
            </h3>

            {comparisonSections.map((section, idx) => (
              <div key={idx} className="mb-8 last:mb-0">
                <div className="bg-slate-50 text-[#1A6DB5] text-xs font-bold tracking-wider uppercase px-4 py-2.5 rounded-lg mb-3">
                  {section.title}
                </div>
                
                <table className="w-full text-xs text-slate-700 table-fixed">
                  <thead>
                    <tr className="border-b border-slate-100 font-bold text-slate-400">
                      <th className="w-1/4 text-left pb-2 px-4">Parameter</th>
                      <th className="w-1/4 text-left pb-2 px-4">Basic Plan</th>
                      <th className="w-1/4 text-left pb-2 px-4">Standard Plan</th>
                      <th className="w-1/4 text-left pb-2 px-4">Premium Plan</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {section.specs.map((spec, i) => (
                      <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                        <td className="py-3 px-4 font-semibold text-slate-800">{spec.label}</td>
                        <td className="py-3 px-4 text-slate-500">{spec.basic}</td>
                        <td className="py-3 px-4 text-slate-600 font-medium">{spec.standard}</td>
                        <td className="py-3 px-4 text-[#1A6DB5] font-semibold">{spec.premium}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ))}
          </div>
        </div>

        {/* Dynamic Warranty note */}
        <div className="mt-12 bg-[#F47B20]/5 p-6 rounded-3xl border border-[#F47B20]/10 text-left flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#F47B20]/10 flex items-center justify-center text-[#F47B20] flex-shrink-0">
              <Shield className="w-5.5 h-5.5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-800">10-Year Structural Defect Guarantee</h4>
              <p className="text-xs text-slate-500 mt-1 max-w-xl">
                Every project we construct carries a comprehensive 10-year structural warranty, backed by civil load reports and independent architectural testing validations.
              </p>
            </div>
          </div>
          <button
            onClick={() => setActiveTab('contact')}
            className="px-6 py-3 bg-[#1A2332] hover:bg-slate-800 text-white font-bold rounded-full text-xs transition-colors flex items-center gap-1.5 whitespace-nowrap"
          >
            <PhoneCall className="w-4 h-4" />
            <span>Consult Our Engineer</span>
          </button>
        </div>

      </div>

      {/* Sticky Bottom CTA for budget configurations */}
      <div className="fixed bottom-4 inset-x-4 z-40 max-w-md mx-auto pointer-events-auto block md:hidden">
        <div className="glass-panel border-slate-100/50 rounded-2xl p-3 shadow-2xl flex items-center justify-between gap-4">
          <div className="text-left pl-2">
            <div className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest">Pricing Question?</div>
            <div className="text-xs font-bold text-[#1A6DB5]">Configure with Calculator</div>
          </div>
          <button
            onClick={() => setActiveTab('quote')}
            className="bg-[#1A6DB5] hover:bg-[#1558a0] text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-md flex items-center gap-1 focus:outline-none"
          >
            <span>Lock Price</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

    </div>
  );
};
