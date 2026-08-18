import React, { useState } from 'react';
import { 
  Check, 
  ChevronDown, 
  ChevronUp, 
  Shield, 
  Sliders, 
  PhoneCall, 
  ArrowRight,
  MessageCircle,
  Sparkles,
  Layers,
  Building2,
  CheckCircle2,
  Download
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface PricingProps {
  setActiveTab: (tab: string) => void;
}

interface PackageSectionData {
  id: string;
  title: string;
  items: string[];
}

interface PackageTier {
  id: 'basic' | 'standard' | 'premium';
  name: string;
  pricePerSqFt: number;
  formattedPrice: string;
  badge?: string;
  sections: PackageSectionData[];
}

export const Pricing: React.FC<PricingProps> = ({ setActiveTab }) => {
  const [sliderArea, setSliderArea] = useState<number>(2000);
  
  // Track open accordion sections per package: object of sets { basic: Set, standard: Set, premium: Set }
  const [openSections, setOpenSections] = useState<Record<string, string[]>>({
    basic: [],
    standard: [],
    premium: []
  });

  const packagesData: PackageTier[] = [
    {
      id: 'basic',
      name: 'Basic',
      pricePerSqFt: 2099,
      formattedPrice: '2099',
      sections: [
        {
          id: 'design',
          title: 'Design',
          items: [
            '2D floor plan'
          ]
        },
        {
          id: 'structure',
          title: 'Structure',
          items: [
            'Basement height - 3 feet',
            'Steel (ARUN)',
            'Aggregates (20mm & 40mm)',
            'Exterior bricks (9 inch) & Interior bricks (4.5 inch)',
            'Cement (Maha / Priya)',
            'M Sand for brickwork and P Sand for plastering',
            'RCC Design Mix (M20)',
            'Ceiling height (10 feet)'
          ]
        },
        {
          id: 'kitchen',
          title: 'Kitchen',
          items: [
            'Ceramic wall tiles up to 2 feet above the kitchen slab (up to ₹35 per sq ft)',
            'Main sink faucet (ISI Marked) up to ₹1500',
            'Stainless steel kitchen sink up to ₹2000',
            'Kitchen granite slab (20 mm thick) up to ₹80 per sq ft'
          ]
        },
        {
          id: 'bathroom',
          title: 'Bathroom',
          items: [
            'Ceramic wall tiles up to 7 feet (up to ₹35 per sq ft)',
            'Sanitary ware & CP fittings (White colour any ISI)',
            'CPVC & PVC pipes (Any ISI brand)',
            'Bathroom door (PVC / Waterproof)'
          ]
        },
        {
          id: 'plumbing',
          title: 'Plumbing Points',
          items: [
            'Water supply CPVC lines',
            'Drainage PVC pipes',            
          ]
        },
        {
          id: 'doors_windows',
          title: 'Doors & Windows',
          items: [
            'Main door (Readymade flush door)',
            'Internal doors (Flush doors with country wood frame)',
            'Bathroom doors (PVC waterproof)',
            'Windows (UPVC 2-track sliding with MS grills)'
          ]
        },
        {
          id: 'painting',
          title: 'Painting Interior',
          items: [
            'Brand - Asian Paints',
            'Internal: 1 coat putty + 2 coats Tractor Emulsion',
            'External: 1 coat Primer + 2 coats Ace Exterior'
          ]
        },
        {
          id: 'flooring',
          title: 'Flooring',
          items: [
            'Living & Dining Area Flooring: Vitrified Tiles up to ₹40 / sq.ft',
            'Room & Kitchen Flooring: Vitrified Tiles up to ₹40 / sq.ft',
            'Balcony & Open Area Flooring: Anti-Skid Tiles up to ₹35 / sq.ft',
            'Staircase Flooring: Anti-Skid Tiles up to ₹35 / sq.ft',
            'Parking Tiles: Anti-Skid Parking Tiles up to ₹35 / sq.ft'
          ]
        },
        {
          id: 'other',
          title: 'Other Inclusive',
          items: [
            'Concealed copper wiring (Kundun / Orbit)',
            'Modular switches (Anchor Roma)',
            '1 Loft in each bedroom & Kitchen',
            'Parapet wall (3 feet)',
            'Staircase Railing - MS',
            'Anti-termite treatment'
          ]
        },
        {
          id: 'extra',
          title: 'Extra Charges',
          items: [
            'Compound wall',
            'Lift',
            'Roof weathering',
            'Carpentry & Other wooden works',
            'Eb connections & Charges',
            'Govt. approval charges',
            'Water connections & Charges',
            'underground water storage sump',
            'Overhead sintex tank Rs.15 per litre',
            'Overhead concrete tank Rs 30 per litre',
            'Elevation Work',
            'Water recycling tank based on the requirement',
            'Additional foundation height',
            'Soil testing',
            'Structural designing',
            'Rainwater harvesting',
            'Outer area development (setback)'

          ]
        }
      ]
    },
    {
      id: 'standard',
      name: 'Standard',
      pricePerSqFt: 2399,
      formattedPrice: '2399',
      badge: 'Most Popular',
      sections: [
        {
          id: 'design',
          title: 'Design',
          items: [
            '2D floor plan',
            '3D elevation',
            'Structural drawing'
          ]
        },
        {
          id: 'structure',
          title: 'Structure',
          items: [
            'Basement height: 3 feet',
            'Steel (ARS)',
            'Aggregates (20mm & 40mm)',
            'Exterior bricks (9 inch) & Interior bricks (4.5 inch)',
            'Cement (Coromandel / Ramco / Dalmia)',
            'M Sand for brickwork and P Sand for plastering',
            'RCC Design Mix (M20 / M25)',
            'Ceiling height (10 feet)'
          ]
        },
        {
          id: 'kitchen',
          title: 'Kitchen',
          items: [
            'Ceramic wall tiles up to 4 feet above the kitchen slab (up to ₹45 per sq ft)',
            'Main sink faucet (Parryware) up to ₹2500',
            'Stainless steel kitchen sink up to ₹3000',
            'Kitchen granite slab (20 mm thick) up to ₹100 per sq ft'
          ]
        },
        {
          id: 'bathroom',
          title: 'Bathroom',
          items: [
            'CP Fittings Brand: Parryware',
            'CPVC & PVC pipes: Ashirvad / Finolex',
            'Ceramic wall tiles up to 7 feet (up to ₹45 per sq ft)',
            'Sanitary ware & CP fittings: ₹15000 per Toilet',
            'Model: white color & basic model',
            'Bathroom door (WPC / Waterproof)'
          ]
        },
        {
          id: 'plumbing',
          title: 'Plumbing Points',
          items: [
            'Water supply CPVC lines (Hot & Cold)',
            'Closet: Floor mount ₹10,000/toilet',
            'Drainage PVC pipes',
            'Overhead tank (1,000 Litres)'
          ]
        },
        {
          id: 'doors_windows',
          title: 'Doors & Windows',
          items: [
            'Main door (1st quality Teakwood carved door)',
            'Internal doors (Skin molded flush doors)',
            'Bathroom doors (WPC waterproof)',
            'Windows (UPVC 3-track sliding with mosquito mesh & MS grills)'
          ]
        },
        {
          id: 'painting',
          title: 'Painting Interior',
          items: [
            'Brand: Asian Paints',
            'Wall putty: 2 coats (Birla White / JK)',
            'Internal: (1 coat primer + 2 coats Premium Emulsion)',
            'External: (1 coat primer + 2 coats Ace Emulsion)'
          ]
        },
        {
          id: 'flooring',
          title: 'Flooring',
          items: [
            'Living & Dining Area Flooring: Vitrified Tiles up to ₹45 / sq.ft',
            'Room & Kitchen Flooring: Vitrified Tiles up to ₹45 / sq.ft',
            'Balcony & Open Area Flooring: Anti-Skid Tiles up to ₹45 / sq.ft',
            'Staircase Flooring: Anti-Skid Tiles up to ₹45 / sq.ft',
            'Granite Flooring: Granite up to ₹100 / sq.ft (if headroom built)',
            'Parking Tiles: Heavy-Duty Parking Tiles up to ₹35 / sq.ft'
          ]
        },
        {
          id: 'other',
          title: 'Other Inclusive',
          items: [
            'Concealed copper wiring (Finolex / Havells)',
            'Modular switches (Legrand / Schneider)',
            'AC point in bedrooms & living',
            '1 Loft in each bedroom, kitchen',
            '1 Shelf in each bedroom, kitchen (Max width 4 feet)',
            'Parapet wall (3 feet)',
            'Staircase Railing: SS',
            'Anti-termite treatment',
            '1 MS safety grill gate for main door',
            'Roof weathering is included if the build-up area is more than 2000 sqft.',
            'Rainwater harvesting',            
            'Glass Handrail for Balcony',
            'Simple Elevation'
          ]
        },
         {
          id: 'extra',
          title: 'Extra Charges',
          items: [
            'Compound wall',
            'Lift',            
            'Carpentry & Other wooden works',
            'Eb connections & Charges',
            'Govt. approval charges',
            'Water connections & Charges',
            'underground water storage sump',            
            'Overhead concrete tank Rs 30 per litre',
            'Special type of Elevation Work',
            'Water recycling tank based on the requirement',
            'Additional foundation height',
            'Soil testing',
            'Electrical & Plumbing drawings',
            'Interior 3D view / walkthrough',
            'Outer area development (setback)'

          ]
        }
      ]
    },
    {
      id: 'premium',
      name: 'Premium',
      pricePerSqFt: 2699,
      formattedPrice: '2699',
      sections: [
        {
          id: 'design',
          title: 'Design',
          items: [
            '2D floor plan',
            '3D elevation',
            'Structural drawing',
            'Electrical & Plumbing drawings'
          ]
        },
        {
          id: 'structure',
          title: 'Structure',
          items: [
            'Basement height: 4 feet (if required)',
            'Steel (TATA Tiscon / SAIL)',
            'Aggregates (20mm & 40mm)',
            'Exterior bricks (9 inch red wire-cut) & Interior bricks (4.5 inch)',
            'Cement (UltraTech / Supergrade)',
            'M Sand for brickwork and River Sand for plastering',
            'RCC Design Mix (M25)',
            'Ceiling height (11 feet)'
          ]
        },
        {
          id: 'kitchen',
          title: 'Kitchen',
          items: [
            'Ceramic / Glazed wall tiles up to 4 feet above the kitchen slab (up to ₹50 per sq ft)',
            'Main sink faucet (Kohler / Jaquar) up to ₹4000',
            'Stainless steel kitchen sink up to ₹3000',
            'Kitchen granite slab (20 mm thick) up to ₹180 per sq ft'
          ]
        },
        {
          id: 'bathroom',
          title: 'Bathroom',
          items: [
            'Ceramic wall tiles up to 8-10 feet (up to ₹55 per sq ft)',
            'Sanitary ware & CP fittings (Kohler / Jaquar) - ₹25,000 per Toilet',
            'CPVC & PVC pipes (Astral / Ashirvad / Supreme)',
            'Bathroom door (WPC / Laminated waterproof)'
          ]
        },
        {
          id: 'plumbing',
          title: 'Plumbing Points',
          items: [
            'Water supply CPVC lines',
            'Drainage PVC pipes',
            'Overhead tank (2,000 Litres)',            
          ]
        },
        {
          id: 'doors_windows',
          title: 'Doors & Windows',
          items: [
            'Main door (Solid Teakwood door)',
            'Internal doors (Teakwood frame + flush/laminated doors)',
            'Bathroom doors (WPC waterproof)',
            'Windows (UPVC acoustic sliding windows with mesh & grills)'
          ]
        },
        {
          id: 'painting',
          title: 'Painting Interior',
          items: [
            'Brand: Asian Paints / Berger',
            'Wall putty (2 coats Acrylic/Birla)',
            'Internal: (1 coat Primer + 2 coats Royale Luxury Emulsion)',
            'External: (1 coat Primer + 2 coats Apex Ultima Protek)'
          ]
        },
        {
          id: 'flooring',
          title: 'Flooring',
          items: [
            'Living & Dining Area Flooring: Vitrified Tiles up to ₹60 / sq.ft',
            'Room & Kitchen Flooring: Vitrified Tiles up to ₹60 / sq.ft',
            'Balcony & Open Area Flooring: Anti-Skid Tiles up to ₹50 / sq.ft',
            'Staircase Flooring: Granite up to ₹120 / sq.ft',
            'Granite Flooring: Granite up to ₹120 / sq.ft (if headroom built)',
            'Parking Tiles: Heavy-Duty Parking Tiles up to ₹50 / sq.ft'
          ]
        },
        {
          id: 'other',
          title: 'Other Inclusive',
          items: [
            'Concealed copper wiring (Finolex / Havells)',
            'Modular switches (Legrand / Schneider)',
            '1 Loft in each bedroom, kitchen',
            '1 Shelf in each bedroom, kitchen (Max width 4 feet)',
            'AC point in bedrooms & living',
            'Parapet wall (3 feet) with Granite coping',
            'Staircase Railing: SS',
            'Anti-termite treatment',
            '1 MS safety grill gate for main door',
            'Roof weathering is included if the build-up area is more than 2000 sqft.',
            'Rainwater harvesting',
            'Glass Handrail for Balcony',
            'Elevation with Elevation stone tile / WPC Panel',
            'Soil testing'
          ]
        },
         {
          id: 'extra',
          title: 'Extra Charges',
          items: [
            'Compound wall',
            'Lift',            
            'Carpentry & Other wooden works',
            'Eb connections & Charges',
            'Govt. approval charges',
            'Water connections & Charges',
            'underground water storage sump',            
            'Overhead concrete tank Rs 30 per litre',
            'Special type of Elevation Work',
            'Water recycling tank based on the requirement',
            'Additional foundation height',         
            'Interior 3D view / walkthrough',
            'Outer area development (setback)'

          ]
        }
      ]
    }
  ];

  // Toggle single section inside a package card
  const toggleSection = (pkgId: string, sectionId: string) => {
    setOpenSections(prev => {
      const currentList = prev[pkgId] || [];
      const exists = currentList.includes(sectionId);
      return {
        ...prev,
        [pkgId]: exists ? currentList.filter(id => id !== sectionId) : [...currentList, sectionId]
      };
    });
  };

  // Toggle all sections across all packages
  const toggleAllSections = (expand: boolean) => {
    if (expand) {
      const allIds = ['design', 'structure', 'kitchen', 'bathroom', 'plumbing', 'doors_windows', 'painting', 'flooring', 'other'];
      setOpenSections({
        basic: allIds,
        standard: allIds,
        premium: allIds
      });
    } else {
      setOpenSections({
        basic: [],
        standard: [],
        premium: []
      });
    }
  };

  const formatIndianCurrency = (amount: number) => {
    if (amount >= 10000000) {
      return `₹${(amount / 10000000).toFixed(2)} Cr`;
    }
    return `₹${(amount / 100000).toFixed(2)} Lakhs`;
  };

  return (
    <div className="bg-[#f8f9fa] min-h-screen pt-6 sm:pt-8 pb-14 sm:pb-20 text-left">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Page Title Intro */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
          className="text-center max-w-3xl mx-auto mb-8 sm:mb-10"
        >
          <p className="font-display font-bold text-red-600 text-xs sm:text-sm tracking-widest uppercase">
            Transparent Pricing
          </p>
          <h1 className="mt-2 font-display font-extrabold text-3xl sm:text-4xl lg:text-5xl text-[#1f2937] tracking-tight">
            Turnkey Construction <span className="text-[#0288d1]">Packages</span>
          </h1>
          <p className="mt-3 text-gray-600 text-sm sm:text-base leading-relaxed max-w-2xl mx-auto">
            Fixed transparent per-sq.ft rates in Chennai with zero hidden escalations. Click any category item on the package cards below to reveal itemized specifications.
          </p>

          {/* Quick Expand All / Collapse All Controls */}
          <div className="flex items-center justify-center gap-3 mt-5">
            <button
              onClick={() => toggleAllSections(true)}
              className="px-4 py-1.5 bg-white hover:bg-gray-100 text-gray-800 text-xs font-display font-bold rounded-full border border-gray-300 shadow-sm transition-colors cursor-pointer"
            >
              Expand All Details
            </button>
            <button
              onClick={() => toggleAllSections(false)}
              className="px-4 py-1.5 bg-white hover:bg-gray-100 text-gray-600 text-xs font-display font-medium rounded-full border border-gray-200 transition-colors cursor-pointer"
            >
              Collapse All
            </button>
          </div>
        </motion.div>

        {/* 3 PACKAGE CARDS - EXACT REPLICA OF ATTACHED SCREENSHOT */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 items-start mb-12 sm:mb-16">
          {packagesData.map((pkg, idx) => {
            const currentOpenSections = openSections[pkg.id] || [];

            return (
              <motion.div
                key={pkg.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: idx * 0.1 }}
                className="bg-white rounded-2xl border border-gray-200 shadow-md p-5 sm:p-6 flex flex-col justify-between transition-shadow hover:shadow-lg"
              >
                <div>
                  {/* RED SOLID HEADER BLOCK (EXACT SCREENSHOT STYLE) */}
                  <div className="bg-[#d32f2f] text-white text-center py-2.5 px-4 rounded-xl font-display font-bold text-2xl tracking-wide shadow-sm">
                    {pkg.name}
                  </div>

                  {/* SUBTITLE (Price may vary depending on no.of floors) */}
                  <p className="text-center text-xs text-gray-500 font-medium mt-3.5">
                    Price may vary depending on no.of floors
                  </p>

                  {/* BIG BLUE PRICE TAG (₹ 1949 /sft) */}
                  <div className="text-center mt-2 mb-4 flex items-baseline justify-center gap-1.5">
                    <span className="text-2xl sm:text-3xl font-extrabold text-[#0288d1]">
                      ₹ {pkg.formattedPrice}
                    </span>
                    <span className="text-lg sm:text-xl font-bold text-[#0288d1]">
                      /sft
                    </span>
                  </div>

                  {/* CRANE / CONSTRUCTION DIVIDER (EXACT SCREENSHOT STYLE) */}
                  <div className="flex items-center my-4">
                    <div className="h-[1px] bg-gray-400 flex-1"></div>
                    <div className="px-3 text-gray-700">
                      {/* Crane / Excavator Vector Icon */}
                      <svg className="w-5 h-5 text-gray-700" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M2 21h20M7 21v-4l4-8 5 4M11 9l7-5h4v5l-7 4M14 17l-3-6M4 21l3-12" />
                      </svg>
                    </div>
                    <div className="h-[1px] bg-gray-400 flex-1"></div>
                  </div>

                  {/* TOP 3 STATIC HIGHLIGHTS WITH BLUE CHECKMARK */}
                  <div className="flex flex-col gap-2.5 mb-5 text-left">
                    <div className="flex items-center gap-2.5 text-sm text-gray-800 font-medium">
                      <Check className="w-4 h-4 text-[#0288d1] stroke-[3] flex-shrink-0" />
                      <span>RCC framed structure</span>
                    </div>
                    <div className="flex items-center gap-2.5 text-sm text-gray-800 font-medium">
                      <Check className="w-4 h-4 text-[#0288d1] stroke-[3] flex-shrink-0" />
                      <span>Branded Materials</span>
                    </div>
                    <div className="flex items-center gap-2.5 text-sm text-gray-800 font-medium">
                      <Check className="w-4 h-4 text-[#0288d1] stroke-[3] flex-shrink-0" />
                      <span>Red Brick Construction</span>
                    </div>
                  </div>

                  {/* CLICK TO REVEAL ACCORDION SECTIONS (EXACT ORDER & ITEMS FROM SCREENSHOT) */}
                  <div className="divide-y divide-gray-100 text-left border-t border-gray-100">
                    {pkg.sections.map((section) => {
                      const isOpen = currentOpenSections.includes(section.id);

                      return (
                        <div key={section.id} className="py-2.5">
                          {/* Accordion Trigger */}
                          <button
                            type="button"
                            onClick={() => toggleSection(pkg.id, section.id)}
                            className="w-full flex items-center justify-between text-left text-sm font-bold text-gray-900 hover:text-[#0288d1] transition-colors py-1 cursor-pointer select-none group"
                          >
                            <span className="group-hover:translate-x-0.5 transition-transform">
                              {section.title}
                            </span>
                            
                            {/* Chevron Down / Up */}
                            <div className="text-gray-800 group-hover:text-[#0288d1] transition-colors">
                              {isOpen ? (
                                <ChevronUp className="w-4 h-4 stroke-[2.5]" />
                              ) : (
                                <ChevronDown className="w-4 h-4 stroke-[2.5]" />
                              )}
                            </div>
                          </button>

                          {/* Accordion Content (Revealed on Click) */}
                          <AnimatePresence initial={false}>
                            {isOpen && (
                              <motion.div
                                key={`content-${pkg.id}-${section.id}`}
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                transition={{ duration: 0.25, ease: 'easeInOut' }}
                                className="overflow-hidden"
                              >
                                <div className="pt-2 pb-2 pl-2 pr-1 text-xs text-gray-700 bg-gray-50/80 rounded-xl mt-1 border border-gray-100">
                                  <ul className="space-y-1.5 list-none p-0 m-0">
                                    {section.items.map((itemText, itmIdx) => (
                                      <li key={itmIdx} className="flex items-start gap-1.5 text-xs text-gray-700 leading-snug">
                                        <span className="text-[#0288d1] font-bold mt-0.5">•</span>
                                        <span>{itemText}</span>
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Card Bottom CTA Actions */}
                <div className="mt-6 pt-4 border-t border-gray-200 flex flex-col gap-2.5">
                  <button
                    onClick={() => setActiveTab('quote')}
                    className="w-full py-3 rounded-xl font-display font-bold text-xs uppercase tracking-wider bg-[#0288d1] hover:bg-[#0277bd] text-white transition-all shadow-sm flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <span>Choose {pkg.name} Package</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>

                  <a
                    href={`https://wa.me/918072163330?text=${encodeURIComponent(`Hello Lifehut Developers, I am inquiring about the ${pkg.name} package (₹${pkg.formattedPrice}/sft) for my project.`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-2 bg-gray-50 hover:bg-gray-100 text-gray-700 border border-gray-200 rounded-xl text-xs font-display font-semibold transition-colors flex items-center justify-center gap-1.5"
                  >
                    <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                    <span>WhatsApp Inquiry</span>
                  </a>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* BUILT-UP AREA ESTIMATOR */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="max-w-4xl mx-auto mb-12 bg-white p-6 sm:p-8 rounded-3xl border border-gray-200 shadow-soft"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-[#0288d1] flex items-center justify-center flex-shrink-0 border border-blue-100 shadow-sm">
                <Sliders className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-display text-lg font-extrabold text-gray-900">Instant Built-up Area Cost Estimator</h3>
                <p className="text-xs text-gray-500">Calculate turnkey total for your plot size</p>
              </div>
            </div>

            <div className="flex items-center gap-2 bg-gray-900 text-white px-5 py-2.5 rounded-2xl self-start sm:self-auto shadow-sm">
              <span className="text-xs text-gray-300 font-display">Area:</span>
              <span className="font-display text-xl font-bold text-blue-400">{sliderArea.toLocaleString()}</span>
              <span className="text-xs text-gray-300 font-medium">sq.ft</span>
            </div>
          </div>

          <div className="relative pt-2 pb-2">
            <input
              id="pricing-area-slider"
              type="range"
              min={800}
              max={6000}
              step={100}
              value={sliderArea}
              onChange={(e) => setSliderArea(parseInt(e.target.value))}
              className="w-full h-3 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-[#0288d1] focus:outline-none"
              aria-label="Proposed built up area slider"
            />
            <div className="flex justify-between text-xs text-gray-500 font-display font-medium mt-3">
              <span>800 sq.ft</span>
              <span>2,000 sq.ft</span>
              <span>3,500 sq.ft</span>
              <span>6,000 sq.ft</span>
            </div>
          </div>

          {/* Quick Price Breakdown for Slider Area */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6 pt-5 border-t border-gray-100">
            <div className="p-3.5 bg-gray-50 rounded-xl border border-gray-200 text-center">
              <span className="text-[11px] font-bold text-gray-500 uppercase block">Basic (₹2,099/sft)</span>
              <span className="text-lg font-extrabold text-gray-900 font-display">{formatIndianCurrency(sliderArea * 2099)}</span>
            </div>
            <div className="p-3.5 bg-blue-50/60 rounded-xl border border-blue-200 text-center">
              <span className="text-[11px] font-bold text-[#0288d1] uppercase block">Standard (₹2,399/sft)</span>
              <span className="text-lg font-extrabold text-[#0288d1] font-display">{formatIndianCurrency(sliderArea * 2399)}</span>
            </div>
            <div className="p-3.5 bg-gray-50 rounded-xl border border-gray-200 text-center">
              <span className="text-[11px] font-bold text-gray-500 uppercase block">Premium (₹2,699/sft)</span>
              <span className="text-lg font-extrabold text-gray-900 font-display">{formatIndianCurrency(sliderArea * 2699)}</span>
            </div>
          </div>
        </motion.div>

        {/* 10-YEAR WARRANTY & ZERO HIDDEN CHARGES GUARANTEE BANNER */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-200 shadow-soft flex flex-col md:flex-row items-center justify-between gap-6 text-left"
        >
          <div className="flex items-start gap-4">
            <div className="w-13 h-13 rounded-2xl bg-blue-50 text-[#0288d1] flex items-center justify-center flex-shrink-0 border border-blue-100 shadow-sm">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-extrabold text-gray-900 font-display">
                10-Year Structural Stability Guarantee &amp; 100% Transparency
              </h3>
              <p className="text-xs sm:text-sm text-gray-600 mt-1 max-w-2xl leading-relaxed">
                All Lifehut construction contracts in Chennai include certified structural stability blueprints, independent concrete cube test certificates, milestone-based escrow payments, and zero hidden escalations.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto flex-shrink-0">
            <button
              onClick={() => setActiveTab('quote')}
              className="flex-1 md:flex-none px-6 py-3 bg-[#0288d1] hover:bg-[#0277bd] text-white font-display font-bold rounded-xl text-xs uppercase tracking-wider transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Get Custom Quote</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <a
              href="tel:+918072163330"
              className="flex-1 md:flex-none px-6 py-3 bg-gray-50 hover:bg-gray-100 text-gray-800 font-display font-bold rounded-xl text-xs uppercase tracking-wider transition-colors border border-gray-200 shadow-sm flex items-center justify-center gap-2 cursor-pointer text-center"
            >
              <PhoneCall className="w-3.5 h-3.5 text-[#0288d1]" />
              <span>Talk to Engineer</span>
            </a>
          </div>
        </motion.div>

      </div>
    </div>
  );
};
