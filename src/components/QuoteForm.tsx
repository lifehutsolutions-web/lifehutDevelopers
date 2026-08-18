import React, { useState, useEffect } from 'react';
import { Ruler, Layers, Shield, FileText, CheckCircle, Calculator, Printer, ArrowRight, Sparkles, Sliders } from 'lucide-react';
import { isSupabaseConfigured, insertSupabaseQuote, insertSupabaseEnquiry } from '../lib/supabase';
import { motion } from 'motion/react';

interface QuoteFormProps {
  setActiveTab: (tab: string) => void;
}

export const QuoteForm: React.FC<QuoteFormProps> = ({ setActiveTab }) => {
  // Calculator Form State
  const [area, setArea] = useState<number>(2000);
  const [floors, setFloors] = useState<number>(2); // 1 = G, 2 = G+1, 3 = G+2
  const [planType, setPlanType] = useState<'Basic' | 'Standard' | 'Premium'>('Standard');
  const [elevationStyle, setElevationStyle] = useState<'Classic' | 'Contemporary' | 'Ultra-Luxury'>('Contemporary');
  const [interiorFinishes, setInteriorFinishes] = useState<boolean>(true);

  // Client Details Form State
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [location, setLocation] = useState('');

  // Results State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [quoteLogged, setQuoteLogged] = useState(false);
  const [calculatedQuote, setCalculatedQuote] = useState<{
    baseCost: number;
    elevationCost: number;
    interiorCost: number;
    totalCost: number;
    savings: number;
  }>({ baseCost: 0, elevationCost: 0, interiorCost: 0, totalCost: 0, savings: 0 });

  // Real-time Calculation Logic
  useEffect(() => {
    let ratePerSqFt = 2200; // default standard
    if (planType === 'Basic') ratePerSqFt = 1949;
    if (planType === 'Premium') ratePerSqFt = 2499;

    // Base cost
    const base = area * ratePerSqFt;

    // Floor factor
    const floorCompoundingFactor = floors === 1 ? 1 : floors === 2 ? 1.05 : 1.1;
    const baseCostWithFloors = base * floorCompoundingFactor;

    // Elevation costs based on size and style
    let elevationMultiplier = 40000;
    if (elevationStyle === 'Classic') elevationMultiplier = 25000;
    if (elevationStyle === 'Ultra-Luxury') elevationMultiplier = 90000;
    const elevationTotal = elevationMultiplier * floors;

    // Interior finishes cost additions
    const interiorTotal = interiorFinishes ? (area * 350) : 0;

    const grandTotal = baseCostWithFloors + elevationTotal + interiorTotal;
    const competitorTotal = grandTotal * 1.15;
    const savingsAmount = competitorTotal - grandTotal;

    setCalculatedQuote({
      baseCost: Math.round(baseCostWithFloors),
      elevationCost: Math.round(elevationTotal),
      interiorCost: Math.round(interiorTotal),
      totalCost: Math.round(grandTotal),
      savings: Math.round(savingsAmount)
    });
  }, [area, floors, planType, elevationStyle, interiorFinishes]);

  const handleSubmitQuote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim() || !email.trim() || !location.trim()) {
      alert("Please fill in your details to lock this price estimate.");
      return;
    }

    setIsSubmitting(true);

    const messageText = `INSTANT QUOTE ESTIMATE:
- Target Area: ${area} sq.ft
- Floors: G+${floors - 1}
- Tier: ${planType} Plan
- Elevation: ${elevationStyle}
- Modular Interiors: ${interiorFinishes ? 'Included' : 'None'}
- Base Cost: ₹${(calculatedQuote.baseCost / 100000).toFixed(2)} Lakhs
- Total Estimate: ₹${(calculatedQuote.totalCost / 100000).toFixed(2)} Lakhs
- Location: ${location}, Chennai`;

    try {
      if (isSupabaseConfigured()) {
        const quoteObj = {
          id: 'qte_' + Date.now(),
          name,
          phone,
          email,
          area,
          floors: `G+${floors - 1}`,
          ctype: planType,
          interior: interiorFinishes ? 'Included' : 'None',
          extras: elevationStyle,
          estimatedCost: formatLakhs(calculatedQuote.totalCost),
          date: new Date().toISOString().split('T')[0],
          status: 'New' as const
        };
        
        await insertSupabaseQuote(quoteObj);
        await insertSupabaseEnquiry({
          id: 'enq_' + Date.now(),
          name,
          phone,
          email,
          service: 'Instant Quote',
          message: messageText,
          date: new Date().toISOString().split('T')[0],
          status: 'New'
        });

        setQuoteLogged(true);
        return;
      }

      const res = await fetch('/api/enquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          phone,
          email,
          message: messageText
        })
      });

      if (res.ok) {
        setQuoteLogged(true);
      } else {
        throw new Error('Server submission failed');
      }
    } catch (err) {
      console.warn('Saving quote locally fallback', err);
      try {
        const localEnquiries = JSON.parse(localStorage.getItem('lifehut_local_enquiries') || '[]');
        const newEnq = {
          id: 'enq-' + Date.now(),
          name,
          phone,
          email,
          message: messageText,
          date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
        };
        localEnquiries.unshift(newEnq);
        localStorage.setItem('lifehut_local_enquiries', JSON.stringify(localEnquiries));
      } catch (innerErr) {
        console.error('Local backup failed', innerErr);
      }
      setQuoteLogged(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const formatLakhs = (amt: number) => {
    return `₹${(amt / 100000).toFixed(2)} L`;
  };

  return (
    <div className="bg-grey-50 min-h-screen pt-6 sm:pt-8 pb-12 sm:pb-16 px-6 lg:px-8 text-left">
      <div className="max-w-7xl mx-auto">
        
        {/* Header Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-6 sm:mb-8 max-w-3xl mx-auto"
        >
          <p className="font-display font-bold text-blue-700 text-sm tracking-wide uppercase">
            Cost Estimator
          </p>
          <h1 className="mt-3 font-display font-extrabold text-3xl sm:text-4xl lg:text-5xl text-ink tracking-tight text-balance">
            Calculate Your <span className="text-blue-700">Turnkey Cost</span>
          </h1>
          <p className="mt-4 text-grey-600 text-base sm:text-lg leading-relaxed">
            Configure your plot area, floor levels, and specifications to generate an accurate, itemized estimate.
          </p>
        </motion.div>

        {quoteLogged ? (
          /* Official printable blueprint quote receipt */
          <motion.div 
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-3xl mx-auto bg-white p-8 sm:p-10 rounded-3xl border border-grey-200 shadow-soft text-left print:shadow-none print:border-none print:p-0"
          >
            {/* Header Stamp */}
            <div className="flex justify-between items-start border-b border-grey-200 pb-5 mb-6">
              <div>
                <h2 className="font-display text-2xl font-extrabold text-ink">Lifehut Developers</h2>
                <div className="text-xs text-grey-500 font-display mt-0.5">Keelkattalai, Chennai • Reg #LH-63330</div>
              </div>
              <div className="bg-blue-50 border border-blue-100 text-blue-700 text-xs font-display font-bold px-3.5 py-1.5 rounded-xl uppercase tracking-wider">
                Official Estimate
              </div>
            </div>

            {/* Summary */}
            <div className="grid grid-cols-2 gap-4 text-xs mb-6">
              <div>
                <div className="text-grey-400 font-display font-bold uppercase tracking-wider text-[11px]">Prepared For:</div>
                <div className="font-display font-bold text-ink text-sm mt-0.5">{name}</div>
                <div className="text-grey-500 mt-0.5">{phone} • {email}</div>
                <div className="text-grey-500">Site: {location}, Chennai</div>
              </div>
              <div className="text-right">
                <div className="text-grey-400 font-display font-bold uppercase tracking-wider text-[11px]">Reference:</div>
                <div className="font-display font-bold text-blue-700 text-sm mt-0.5">LH-QT-{Math.floor(10000 + Math.random() * 90000)}</div>
                <div className="text-grey-500 mt-0.5">Date: {new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</div>
              </div>
            </div>

            {/* Calculations Breakdown Table */}
            <div className="border border-grey-200 rounded-2xl overflow-hidden mb-6">
              <table className="w-full text-xs sm:text-sm text-grey-700 table-fixed">
                <thead>
                  <tr className="bg-grey-50 border-b border-grey-200 font-display font-bold text-ink">
                    <th className="w-1/2 text-left py-3 px-4">Specification Parameter</th>
                    <th className="w-1/4 text-center py-3 px-4">Scale</th>
                    <th className="w-1/4 text-right py-3 px-4">Estimated Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-grey-100">
                  <tr>
                    <td className="py-3 px-4 font-semibold text-ink">
                      Base Structure ({planType} Plan)
                    </td>
                    <td className="py-3 px-4 text-center text-grey-500">
                      {area} sq.ft @ G+{floors - 1}
                    </td>
                    <td className="py-3 px-4 text-right text-ink font-display font-bold">
                      {formatLakhs(calculatedQuote.baseCost)}
                    </td>
                  </tr>
                  
                  <tr>
                    <td className="py-3 px-4 font-semibold text-ink">
                      Exterior Elevation ({elevationStyle})
                    </td>
                    <td className="py-3 px-4 text-center text-grey-500">
                      {floors} Floors Layout
                    </td>
                    <td className="py-3 px-4 text-right text-ink font-display font-bold">
                      {formatLakhs(calculatedQuote.elevationCost)}
                    </td>
                  </tr>

                  {interiorFinishes && (
                    <tr>
                      <td className="py-3 px-4 font-semibold text-ink">
                        Modular Interior Work
                      </td>
                      <td className="py-3 px-4 text-center text-grey-500">
                        Modular Kitchen/Closets
                      </td>
                      <td className="py-3 px-4 text-right text-ink font-display font-bold">
                        {formatLakhs(calculatedQuote.interiorCost)}
                      </td>
                    </tr>
                  )}

                  <tr className="bg-grey-50 font-display font-bold text-ink border-t border-grey-200">
                    <td className="py-3.5 px-4 text-sm">Grand Total Estimate</td>
                    <td className="py-3.5 px-4 text-center text-grey-500 font-normal">Locked Rate</td>
                    <td className="py-3.5 px-4 text-right text-base text-blue-700 font-display font-extrabold">
                      {formatLakhs(calculatedQuote.totalCost)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Savings Callout */}
            <div className="bg-emerald-50 text-emerald-900 p-4 rounded-2xl border border-emerald-200 text-xs mb-6 flex items-center justify-between">
              <span className="font-semibold">Lifehut Direct Contract Savings:</span>
              <span className="font-display font-extrabold text-sm text-emerald-800">~ Save {formatLakhs(calculatedQuote.savings)}</span>
            </div>

            {/* Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 print:hidden">
              <button
                onClick={handlePrint}
                className="flex-1 py-3 bg-blue-700 hover:bg-blue-900 text-white font-display font-bold rounded-xl text-xs uppercase tracking-wider transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-soft"
              >
                <Printer className="w-4 h-4" />
                <span>Print Official Quote</span>
              </button>
              <button
                onClick={() => setQuoteLogged(false)}
                className="flex-1 py-3 bg-grey-50 hover:bg-grey-100 text-ink font-display font-bold rounded-xl text-xs uppercase tracking-wider transition-colors cursor-pointer border border-grey-200 shadow-soft"
              >
                Configure Another Estimate
              </button>
            </div>

          </motion.div>
        ) : (
          /* Form View */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Left Inputs */}
            <div className="lg:col-span-7 bg-white p-7 sm:p-9 rounded-3xl border border-grey-200 shadow-soft flex flex-col gap-6">
              
              <div className="flex items-center gap-2.5 text-ink font-display font-extrabold text-lg pb-4 border-b border-grey-200">
                <Sliders className="w-5 h-5 text-blue-700" />
                <span>Construction Parameters</span>
              </div>

              <div className="flex flex-col gap-6">
                
                {/* 1. Built-up Area */}
                <div className="flex flex-col gap-2.5">
                  <div className="flex justify-between items-center text-xs sm:text-sm">
                    <span className="font-display font-bold text-ink flex items-center gap-2">
                      <Ruler className="w-4 h-4 text-blue-700" />
                      <span>Built-up Area (Sq.Ft)</span>
                    </span>
                    <span className="font-display font-bold text-blue-700 text-xs bg-blue-50 px-3.5 py-1 rounded-full border border-blue-100">
                      {area} sq.ft
                    </span>
                  </div>
                  <input
                    type="range"
                    min="800"
                    max="8000"
                    step="50"
                    value={area}
                    onChange={(e) => setArea(parseInt(e.target.value))}
                    className="w-full accent-blue-700 h-2 bg-grey-100 rounded-lg cursor-pointer"
                  />
                  <div className="flex justify-between text-xs text-grey-400 font-medium">
                    <span>Min: 800 sq.ft</span>
                    <span>Max: 8,000 sq.ft</span>
                  </div>
                </div>

                {/* 2. Floors */}
                <div className="flex flex-col gap-2.5">
                  <span className="text-xs sm:text-sm font-display font-bold text-ink flex items-center gap-2">
                    <Layers className="w-4 h-4 text-blue-700" />
                    <span>Number of Floors</span>
                  </span>
                  <div className="grid grid-cols-3 gap-3">
                    {[1, 2, 3].map((f) => (
                      <button
                        key={f}
                        type="button"
                        onClick={() => setFloors(f)}
                        className={`py-3 text-xs font-display font-bold rounded-xl border transition-all cursor-pointer ${
                          floors === f
                            ? 'bg-blue-700 border-blue-700 text-white shadow-soft'
                            : 'bg-grey-50 border-grey-200 text-grey-700 hover:bg-grey-100'
                        }`}
                      >
                        G + {f - 1} {f === 1 ? 'Floor' : 'Floors'}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 3. Tier */}
                <div className="flex flex-col gap-2.5">
                  <span className="text-xs sm:text-sm font-display font-bold text-ink flex items-center gap-2">
                    <Shield className="w-4 h-4 text-blue-700" />
                    <span>Specification Tier</span>
                  </span>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { type: 'Basic', label: 'Basic', rate: '₹1,949/sq.ft' },
                      { type: 'Standard', label: 'Standard', rate: '₹2,200/sq.ft' },
                      { type: 'Premium', label: 'Premium', rate: '₹2,499/sq.ft' }
                    ].map((p) => (
                      <button
                        key={p.type}
                        type="button"
                        onClick={() => setPlanType(p.type as 'Basic' | 'Standard' | 'Premium')}
                        className={`py-3 px-2 text-center rounded-xl border transition-all flex flex-col gap-0.5 cursor-pointer ${
                          planType === p.type
                            ? 'bg-blue-700 border-blue-700 text-white shadow-soft'
                            : 'bg-grey-50 border-grey-200 text-grey-700 hover:bg-grey-100'
                        }`}
                      >
                        <span className="text-xs font-display font-extrabold">{p.label}</span>
                        <span className={`text-[11px] ${planType === p.type ? 'text-blue-100' : 'text-grey-500'}`}>{p.rate}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* 4. Elevation */}
                <div className="flex flex-col gap-2.5">
                  <span className="text-xs sm:text-sm font-display font-bold text-ink flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-blue-700" />
                    <span>Exterior Elevation</span>
                  </span>
                  <div className="grid grid-cols-3 gap-3">
                    {['Classic', 'Contemporary', 'Ultra-Luxury'].map((style) => (
                      <button
                        key={style}
                        type="button"
                        onClick={() => setElevationStyle(style as 'Classic' | 'Contemporary' | 'Ultra-Luxury')}
                        className={`py-3 text-xs font-display font-bold rounded-xl border transition-all cursor-pointer ${
                          elevationStyle === style
                            ? 'bg-blue-700 border-blue-700 text-white shadow-soft'
                            : 'bg-grey-50 border-grey-200 text-grey-700 hover:bg-grey-100'
                        }`}
                      >
                        {style}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 5. Modular Interior Finishes */}
                <div className="flex items-center justify-between p-4 bg-grey-50 border border-grey-200 rounded-2xl">
                  <div>
                    <div className="text-xs sm:text-sm font-display font-bold text-ink">Include Modular Interiors?</div>
                    <div className="text-xs text-grey-500 mt-0.5">Modular kitchen counters &amp; custom wardrobes (+₹350/sq.ft)</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={interiorFinishes}
                    onChange={(e) => setInteriorFinishes(e.target.checked)}
                    className="w-5 h-5 accent-blue-700 rounded cursor-pointer"
                    aria-label="Toggle modular interior finishes"
                  />
                </div>

              </div>

              {/* Owner Details */}
              <div className="border-t border-grey-200 pt-6">
                <h4 className="text-xs font-display font-bold text-grey-500 uppercase tracking-wider mb-4">Homeowner Information</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Full Name..."
                    className="border border-grey-200 rounded-xl px-4 py-2.5 text-xs sm:text-sm outline-none focus:border-blue-700 bg-white text-ink"
                  />
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="Phone Number..."
                    className="border border-grey-200 rounded-xl px-4 py-2.5 text-xs sm:text-sm outline-none focus:border-blue-700 bg-white text-ink"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Email Address..."
                    className="border border-grey-200 rounded-xl px-4 py-2.5 text-xs sm:text-sm outline-none focus:border-blue-700 bg-white text-ink"
                  />
                  <input
                    type="text"
                    required
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="Location in Chennai..."
                    className="border border-grey-200 rounded-xl px-4 py-2.5 text-xs sm:text-sm outline-none focus:border-blue-700 bg-white text-ink"
                  />
                </div>
              </div>

            </div>

            {/* Right Summary Card */}
            <div className="lg:col-span-5 sticky top-28 flex flex-col gap-6">
              
              <div className="bg-white p-7 sm:p-8 rounded-3xl border border-grey-200 shadow-soft text-left">
                
                <h3 className="font-display text-sm font-extrabold uppercase tracking-wider text-ink mb-4 pb-3 border-b border-grey-200">
                  Cost Breakdown Statement
                </h3>

                <div className="flex flex-col gap-3.5 border-b border-grey-200 pb-4 mb-4 text-xs sm:text-sm text-grey-600">
                  <div className="flex justify-between items-center">
                    <span>Base Construction:</span>
                    <span className="font-display text-ink font-bold">{formatLakhs(calculatedQuote.baseCost)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Exterior Elevation:</span>
                    <span className="font-display text-ink font-bold">{formatLakhs(calculatedQuote.elevationCost)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Modular Interiors:</span>
                    <span className="font-display text-ink font-bold">{formatLakhs(calculatedQuote.interiorCost)}</span>
                  </div>
                </div>

                <div className="flex justify-between items-end mb-6">
                  <div>
                    <div className="text-xs font-display font-bold text-grey-500 uppercase tracking-wider">Estimated Turnkey Cost</div>
                    <div className="text-xs text-grey-400">Locked rate per sq.ft</div>
                  </div>
                  <div className="font-display text-3xl sm:text-4xl font-extrabold text-blue-700">
                    {formatLakhs(calculatedQuote.totalCost)}
                  </div>
                </div>

                <div className="bg-blue-50/70 p-4 rounded-2xl border border-blue-100 text-xs text-ink mb-6">
                  <div className="font-display font-bold text-blue-700 flex items-center gap-1.5 mb-1">
                    <CheckCircle className="w-4 h-4" />
                    <span>Contractor Markup Savings</span>
                  </div>
                  <p className="text-xs leading-relaxed text-grey-600">
                    Save approximately <span className="text-blue-700 font-bold">{formatLakhs(calculatedQuote.savings)}</span> compared to standard unverified contractor margins in Chennai.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleSubmitQuote}
                  disabled={isSubmitting}
                  className="w-full py-3.5 bg-blue-700 hover:bg-blue-900 disabled:bg-grey-400 text-white font-display font-bold rounded-xl text-xs uppercase tracking-wider transition-all shadow-soft flex items-center justify-center gap-2 cursor-pointer"
                >
                  {isSubmitting ? <span>Calculating...</span> : <span>Lock This Price Quote</span>}
                  <ArrowRight className="w-4 h-4" />
                </button>

              </div>

              <div className="bg-white border border-grey-200 p-6 rounded-3xl shadow-soft text-left">
                <h4 className="text-xs font-display font-bold text-grey-500 uppercase tracking-wider mb-3">Our Guarantee</h4>
                <ul className="flex flex-col gap-2.5 text-xs text-grey-600 list-none p-0 m-0">
                  <li className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-blue-700" />
                    <span>Fixed-Price Lock contract with no unexpected cost escalations</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-blue-700" />
                    <span>Complete invoice transparency for steel and cement</span>
                  </li>
                </ul>
              </div>

            </div>

          </div>
        )}

      </div>
    </div>
  );
};
