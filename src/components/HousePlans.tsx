import React, { useState, useEffect, useMemo } from 'react';
import { 
  Compass, 
  Layers, 
  Maximize2, 
  Bed, 
  Bath, 
  Car, 
  CheckCircle2, 
  Share2, 
  Phone, 
  MessageCircle, 
  Download, 
  ArrowRight, 
  ArrowLeft,
  ChevronLeft,
  ChevronRight, 
  Filter, 
  Sparkles, 
  ShieldCheck, 
  Home, 
  Ruler, 
  Calendar, 
  X, 
  ZoomIn, 
  Info, 
  RotateCcw,
  Check,
  Send,
  Building2,
  FileText,
  FileArchive,
  Archive,
  CreditCard,
  Lock,
  FileCode,
  Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Breadcrumbs } from './Breadcrumbs';
import { HousePlan } from '../types';
import { defaultHousePlans } from '../data/defaultHousePlans';

interface HousePlansProps {
  housePlans?: HousePlan[];
  selectedSlug?: string | null;
  onSelectPlan?: (slug: string | null) => void;
  setActiveTab: (tab: string) => void;
  phone?: string;
  email?: string;
}

export const getBuildingDimension = (plan: HousePlan): string => {
  if (plan.buildingDimensions && plan.buildingDimensions.trim()) {
    return plan.buildingDimensions;
  }
  const match = plan.plotDimensions?.match(/(\d+)'?\s*[xX*×]\s*(\d+)'?/);
  if (match) {
    const plotW = parseInt(match[1], 10);
    const plotL = parseInt(match[2], 10);
    if (!isNaN(plotW) && !isNaN(plotL)) {
      const bW = Math.max(15, plotW - 6);
      const bL = Math.max(20, plotL - 8);
      return `${bW}'0" x ${bL}'0"`;
    }
  }
  return "24'0\" x 42'0\"";
};

export const HousePlans: React.FC<HousePlansProps> = ({
  housePlans = defaultHousePlans,
  selectedSlug = null,
  onSelectPlan,
  setActiveTab,
  phone = "+91 80721 63330",
  email = "lifehutdevelopers@gmail.com"
}) => {
  const plans = housePlans && housePlans.length > 0 ? housePlans : defaultHousePlans;

  // Selected plan state
  const [currentSlug, setCurrentSlug] = useState<string | null>(selectedSlug);
  const [activeCarouselIndex, setActiveCarouselIndex] = useState(0);
  const [zoomModalImage, setZoomModalImage] = useState<string | null>(null);
  const [zoomModalTitle, setZoomModalTitle] = useState<string>('');
  
  // Customization & PDF download modals
  const [isCustomizeModalOpen, setIsCustomizeModalOpen] = useState(false);
  const [isPdfModalOpen, setIsPdfModalOpen] = useState(false);
  const [planForCadModal, setPlanForCadModal] = useState<HousePlan | null>(null);
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Razorpay payment flow states
  const [razorpayLoading, setRazorpayLoading] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [paymentTxnId, setPaymentTxnId] = useState<string | null>(null);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [downloadingCadFile, setDownloadingCadFile] = useState(false);

  // Form states
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [plotDimensions, setPlotDimensions] = useState('');
  const [customNotes, setCustomNotes] = useState('');

  // Filtering states
  const [searchQuery, setSearchQuery] = useState('');
  const [floorFilter, setFloorFilter] = useState<number | 'all'>('all');
  const [bedroomFilter, setBedroomFilter] = useState<number | 'all'>('all');
  const [facingFilter, setFacingFilter] = useState<string | 'all'>('all');
  const [areaRangeFilter, setAreaRangeFilter] = useState<string | 'all'>('all');
  const [vastuOnlyFilter, setVastuOnlyFilter] = useState(false);

  // Copy share feedback
  const [copiedLink, setCopiedLink] = useState(false);

  // Sync external selected slug
  useEffect(() => {
    if (selectedSlug !== currentSlug) {
      setCurrentSlug(selectedSlug);
    }
  }, [selectedSlug]);

  const activePlan = useMemo(() => {
    if (!currentSlug) return null;
    return plans.find(p => p.slug === currentSlug || p.id === currentSlug) || null;
  }, [currentSlug, plans]);

  // Media carousel list for active plan: includes 3D Front Elevation, 2D Floor Plan Blueprint, and all gallery views
  const planMediaList = useMemo(() => {
    if (!activePlan) return [];
    const items: Array<{
      id: string;
      url: string;
      title: string;
      type: 'elevation' | 'floorplan' | 'gallery';
      badge: string;
    }> = [];
    const seenUrls = new Set<string>();

    // 1. 3D Front Elevation
    if (activePlan.elevationImage) {
      items.push({
        id: 'elevation',
        url: activePlan.elevationImage,
        title: `${activePlan.title} - 3D Front Elevation`,
        type: 'elevation',
        badge: '3D Front Elevation'
      });
      seenUrls.add(activePlan.elevationImage);
    }

    // 2. 2D Architectural Blueprint & Floor Plan
    if (activePlan.floorPlanImage) {
      items.push({
        id: 'floorplan',
        url: activePlan.floorPlanImage,
        title: `${activePlan.title} - 2D Architectural Floor Plan`,
        type: 'floorplan',
        badge: '2D Architectural Floor Plan'
      });
      seenUrls.add(activePlan.floorPlanImage);
    }

    // 3. All attached gallery drawings & perspective views
    if (activePlan.galleryImages && activePlan.galleryImages.length > 0) {
      let gCount = 1;
      for (const gUrl of activePlan.galleryImages) {
        if (!seenUrls.has(gUrl)) {
          items.push({
            id: `gallery-${gCount}`,
            url: gUrl,
            title: `${activePlan.title} - Architectural View #${gCount}`,
            type: 'gallery',
            badge: `Architectural View #${gCount}`
          });
          seenUrls.add(gUrl);
          gCount++;
        }
      }
    }

    return items;
  }, [activePlan]);

  // Keep active carousel index in bounds when plan or list changes
  useEffect(() => {
    setActiveCarouselIndex(0);
  }, [currentSlug]);

  const currentMedia = planMediaList[activeCarouselIndex] || planMediaList[0];

  const handlePrevSlide = () => {
    if (planMediaList.length <= 1) return;
    setActiveCarouselIndex((prev) => (prev === 0 ? planMediaList.length - 1 : prev - 1));
  };

  const handleNextSlide = () => {
    if (planMediaList.length <= 1) return;
    setActiveCarouselIndex((prev) => (prev === planMediaList.length - 1 ? 0 : prev + 1));
  };

  // Current target plan for CAD download
  const currentCadPlan = planForCadModal || activePlan;

  const openCadDownloadModal = (plan?: HousePlan) => {
    if (plan) {
      setPlanForCadModal(plan);
    } else if (activePlan) {
      setPlanForCadModal(activePlan);
    }
    setPaymentSuccess(false);
    setPaymentTxnId(null);
    setPaymentError(null);
    setIsPdfModalOpen(true);
  };

  const triggerDownloadCadZip = (plan: HousePlan) => {
    setDownloadingCadFile(true);
    try {
      const downloadUrl = plan.cadPackageZipUrl && plan.cadPackageZipUrl.startsWith('http')
        ? plan.cadPackageZipUrl
        : `/api/house-plans/${plan.id}/download-cad`;
      
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.setAttribute('download', plan.cadPackageFileName || `${plan.planCode}-CAD-Package.zip`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error('Download error:', err);
    } finally {
      setTimeout(() => setDownloadingCadFile(false), 2000);
    }
  };

  const handleRazorpayPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentCadPlan) return;
    if (!clientName || !clientPhone) {
      setPaymentError('Please enter your Name and WhatsApp Number.');
      return;
    }

    setRazorpayLoading(true);
    setPaymentError(null);

    try {
      // 1. Create Order on server
      const orderRes = await fetch('/api/razorpay/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          planId: currentCadPlan.id,
          clientName,
          clientPhone,
          clientEmail,
          amount: currentCadPlan.cadPackagePrice || 999
        })
      });

      if (!orderRes.ok) {
        throw new Error('Could not initiate Razorpay checkout order.');
      }

      const orderData = await orderRes.json();

      // Check if official Razorpay checkout script is available on window
      const RazorpayConstructor = (window as any).Razorpay;

      if (RazorpayConstructor && orderData.keyId && !orderData.isDemo) {
        // Open live/sandbox Razorpay pop-up
        const rzpOptions = {
          key: orderData.keyId,
          amount: orderData.amount,
          currency: orderData.currency || 'INR',
          name: 'Lifehut Developers',
          description: `${currentCadPlan.planCode} Full CAD & PDF Drawings Package`,
          image: 'https://lifehutdevelopers.com/favicon.png',
          order_id: orderData.orderId,
          handler: async function (response: any) {
            try {
              const verifyRes = await fetch('/api/razorpay/verify-payment', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_signature: response.razorpay_signature,
                  planId: currentCadPlan.id,
                  clientName,
                  clientPhone,
                  clientEmail
                })
              });
              const verifyData = await verifyRes.json();
              if (verifyData.verified) {
                setPaymentTxnId(response.razorpay_payment_id || `PAY_${Date.now()}`);
                setPaymentSuccess(true);
                triggerDownloadCadZip(currentCadPlan);
              } else {
                setPaymentError('Payment verification signature check failed.');
              }
            } catch (err: any) {
              setPaymentError('Verification failed: ' + (err?.message || 'Network error'));
            }
          },
          prefill: {
            name: clientName,
            email: clientEmail || '',
            contact: clientPhone
          },
          notes: {
            planCode: currentCadPlan.planCode,
            title: currentCadPlan.title
          },
          theme: {
            color: '#1A6DB5'
          }
        };

        const rzp = new RazorpayConstructor(rzpOptions);
        rzp.on('payment.failed', function (response: any) {
          setPaymentError(response.error.description || 'Payment was cancelled or declined.');
        });
        rzp.open();
      } else {
        // Sandbox / Test / Demo fallback: verify directly with server
        const demoPaymentId = `rzp_demo_${Date.now()}`;
        const verifyRes = await fetch('/api/razorpay/verify-payment', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            razorpay_order_id: orderData.orderId || `order_${Date.now()}`,
            razorpay_payment_id: demoPaymentId,
            razorpay_signature: 'demo_authorized_signature',
            planId: currentCadPlan.id,
            clientName,
            clientPhone,
            clientEmail
          })
        });

        const verifyData = await verifyRes.json();
        if (verifyData.verified) {
          setPaymentTxnId(demoPaymentId);
          setPaymentSuccess(true);
          triggerDownloadCadZip(currentCadPlan);
        } else {
          setPaymentError('Payment failed to confirm with payment server.');
        }
      }
    } catch (err: any) {
      console.error('Razorpay process failed:', err);
      setPaymentError(err?.message || 'An error occurred while connecting to Razorpay.');
    } finally {
      setRazorpayLoading(false);
    }
  };

  // Handle selecting a plan
  const handleSelectPlan = (slug: string | null) => {
    setCurrentSlug(slug);
    setActiveCarouselIndex(0);
    if (onSelectPlan) {
      onSelectPlan(slug);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Filter plans
  const filteredPlans = useMemo(() => {
    return plans.filter(plan => {
      if (!plan.isActive) return false;

      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchTitle = plan.title.toLowerCase().includes(q);
        const matchCode = plan.planCode.toLowerCase().includes(q);
        const matchFacing = plan.facing.toLowerCase().includes(q);
        const matchStyle = plan.style.toLowerCase().includes(q);
        const matchPlot = plan.plotDimensions.toLowerCase().includes(q);
        const matchBHK = `${plan.bedrooms} bhk`.includes(q);
        const matchArea = `${plan.builtUpArea}`.includes(q);
        if (!matchTitle && !matchCode && !matchFacing && !matchStyle && !matchPlot && !matchBHK && !matchArea) {
          return false;
        }
      }

      // Floors
      if (floorFilter !== 'all' && plan.floors !== floorFilter) {
        return false;
      }

      // Bedrooms
      if (bedroomFilter !== 'all') {
        if (bedroomFilter === 5) {
          if (plan.bedrooms < 5) return false;
        } else if (plan.bedrooms !== bedroomFilter) {
          return false;
        }
      }

      // Facing
      if (facingFilter !== 'all' && plan.facing.toLowerCase() !== facingFilter.toLowerCase()) {
        return false;
      }

      // Vastu only
      if (vastuOnlyFilter && !plan.vastuCompliant) {
        return false;
      }

      // Area Range
      if (areaRangeFilter !== 'all') {
        if (areaRangeFilter === 'under1200' && plan.builtUpArea >= 1200) return false;
        if (areaRangeFilter === '1200-1800' && (plan.builtUpArea < 1200 || plan.builtUpArea > 1800)) return false;
        if (areaRangeFilter === '1800-2500' && (plan.builtUpArea < 1800 || plan.builtUpArea > 2500)) return false;
        if (areaRangeFilter === 'above2500' && plan.builtUpArea <= 2500) return false;
      }

      return true;
    });
  }, [plans, searchQuery, floorFilter, bedroomFilter, facingFilter, areaRangeFilter, vastuOnlyFilter]);

  const resetFilters = () => {
    setSearchQuery('');
    setFloorFilter('all');
    setBedroomFilter('all');
    setFacingFilter('all');
    setAreaRangeFilter('all');
    setVastuOnlyFilter(false);
  };

  const handleShare = () => {
    const url = window.location.href;
    if (navigator.share) {
      navigator.share({
        title: activePlan ? activePlan.title : "House Plans Collection | Lifehut Developers",
        url
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(url);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  const handleCustomizationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName || !clientPhone) return;

    setIsSubmitting(true);
    const planInfo = activePlan ? `${activePlan.planCode} - ${activePlan.title}` : 'House Plans Collection';
    const notes = `House Plan Customization Request for ${planInfo}. Plot Size: ${plotDimensions || 'Not specified'}. Requirements: ${customNotes || 'Plan Customization'}`;

    try {
      await fetch('/api/enquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: clientName,
          phone: clientPhone,
          email: clientEmail,
          service: 'House Plan Customization',
          requirement: notes
        })
      });
      setFormSubmitted(true);
      setTimeout(() => {
        setIsCustomizeModalOpen(false);
        setIsPdfModalOpen(false);
        setFormSubmitted(false);
        setClientName('');
        setClientPhone('');
        setClientEmail('');
        setPlotDimensions('');
        setCustomNotes('');
      }, 3000);
    } catch {
      setFormSubmitted(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const cleanPhone = phone.replace(/[^0-9]/g, '');

  return (
    <div className="bg-grey-50 min-h-screen text-ink font-sans pb-20 text-left">
      
      {/* Breadcrumb Navigation */}
      <Breadcrumbs
        items={
          activePlan
            ? [
                { label: 'House Plans', onClick: () => handleSelectPlan(null) },
                { label: `${activePlan.planCode} (${activePlan.title})`, active: true }
              ]
            : [{ label: 'House Plans', active: true }]
        }
        onHomeClick={() => {
          handleSelectPlan(null);
          setActiveTab('home');
        }}
      />

      {/* Catalog Hero Section (When on main house plans catalog) */}
      {!activePlan && (
        <section className="pt-4 sm:pt-6 pb-2 px-4 sm:px-6 lg:px-8 text-left">
          <div className="max-w-7xl mx-auto">
            {/* Header Intro Matching Other Pages */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="text-center mb-8 sm:mb-10 max-w-3xl mx-auto"
            >
              <p className="font-display font-bold text-blue-700 text-sm tracking-wide uppercase">
                Vastu-Compliant Architectural Blueprints
              </p>
              <h1 className="mt-3 font-display font-extrabold text-3xl sm:text-4xl lg:text-5xl text-ink tracking-tight text-balance">
                Architectural House Plans <span className="text-blue-700">&amp; Floor Designs</span>
              </h1>
              <p className="mt-4 text-grey-600 text-base sm:text-lg leading-relaxed">
                Explore our catalog of single-storey, duplex, and triplex house blueprints engineered specifically for standard plot dimensions in Chennai. Complete with room dimensions, 3D elevation renders, Vastu orientations, and turnkey construction cost estimates.
              </p>
            </motion.div>

            {/* 4 Feature Highlights in Clean Light Theme */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 max-w-5xl mx-auto mb-6">
              <div className="flex items-center gap-3.5 bg-white p-4 sm:p-5 rounded-2xl border border-grey-200 shadow-soft hover:shadow-card transition-all">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center flex-shrink-0 border border-blue-100">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[11px] text-grey-500 font-medium uppercase font-mono">Approval Ready</p>
                  <p className="text-xs sm:text-sm font-display font-bold text-ink">CMDA &amp; DTCP Norms</p>
                </div>
              </div>

              <div className="flex items-center gap-3.5 bg-white p-4 sm:p-5 rounded-2xl border border-grey-200 shadow-soft hover:shadow-card transition-all">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center flex-shrink-0 border border-emerald-100">
                  <Compass className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[11px] text-grey-500 font-medium uppercase font-mono">Vastu Shastra</p>
                  <p className="text-xs sm:text-sm font-display font-bold text-ink">100% Verified</p>
                </div>
              </div>

              <div className="flex items-center gap-3.5 bg-white p-4 sm:p-5 rounded-2xl border border-grey-200 shadow-soft hover:shadow-card transition-all">
                <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center flex-shrink-0 border border-amber-100">
                  <Ruler className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[11px] text-grey-500 font-medium uppercase font-mono">Dimension Metrics</p>
                  <p className="text-xs sm:text-sm font-display font-bold text-ink">Zero Dead Space</p>
                </div>
              </div>

              <div className="flex items-center gap-3.5 bg-white p-4 sm:p-5 rounded-2xl border border-grey-200 shadow-soft hover:shadow-card transition-all">
                <div className="w-10 h-10 rounded-xl bg-cyan-50 text-cyan-700 flex items-center justify-center flex-shrink-0 border border-cyan-100">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[11px] text-grey-500 font-medium uppercase font-mono">Execution Support</p>
                  <p className="text-xs sm:text-sm font-display font-bold text-ink">Turnkey In Chennai</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Main Body */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
        
        {/* ======================= SINGLE PLAN DETAIL VIEW ======================= */}
        {activePlan ? (
          <div className="space-y-8">
            
            {/* Back Button */}
            <div>
              <button
                onClick={() => handleSelectPlan(null)}
                className="inline-flex items-center gap-2 text-grey-600 hover:text-blue-700 text-xs font-display font-bold uppercase tracking-wider transition-colors group cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
                <span>Back to All House Plans</span>
              </button>
            </div>

            {/* Plan Detail Header Card in Clean Light Theme */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="bg-white rounded-3xl border border-grey-200 p-6 sm:p-8 shadow-soft text-left"
            >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div className="flex-1">
                  <div className="flex items-center flex-wrap gap-2.5 mb-3">
                    <span className="px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-bold font-mono">
                      {activePlan.planCode}
                    </span>
                    <span className="px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-1.5">
                      <Compass className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{activePlan.facing} Facing ({activePlan.vastuScore || '100% Vastu'})</span>
                    </span>
                    <span className="px-3 py-1 rounded-full bg-grey-100 border border-grey-200 text-grey-700 text-xs font-medium">
                      {activePlan.floorsLabel}
                    </span>
                  </div>

                  <h1 className="text-2xl sm:text-3xl lg:text-4xl font-display font-extrabold text-ink tracking-tight mb-2">
                    {activePlan.title}
                  </h1>

                  <p className="text-grey-600 text-sm sm:text-base max-w-3xl leading-relaxed mb-4">
                    {activePlan.description}
                  </p>

                  {/* Quick Specs Strip */}
                  <div className="flex flex-wrap items-center gap-2.5 text-xs">
                    <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-grey-50 border border-grey-200 text-grey-700">
                      <Layers className="w-4 h-4 text-blue-700" />
                      <span className="text-grey-500">Plot Dimension:</span>
                      <strong className="text-ink font-mono font-bold">{activePlan.plotDimensions.split('(')[0].trim()}</strong>
                    </div>
                    <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-cyan-50/70 border border-cyan-200 text-cyan-900">
                      <Building2 className="w-4 h-4 text-cyan-700" />
                      <span className="text-cyan-700">Building Footprint:</span>
                      <strong className="text-cyan-950 font-mono font-bold">{getBuildingDimension(activePlan)}</strong>
                    </div>
                    <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-amber-50/70 border border-amber-200 text-amber-900">
                      <Ruler className="w-4 h-4 text-amber-700" />
                      <span className="text-amber-700">Buildup Area:</span>
                      <strong className="text-amber-950 font-mono font-bold">{activePlan.builtUpArea} sq.ft</strong>
                    </div>
                  </div>
                </div>

                {/* Quick Action Buttons */}
                <div className="flex items-center gap-3 flex-shrink-0 self-start lg:self-center">
                  <button
                    onClick={handleShare}
                    className="px-4 py-2.5 rounded-xl bg-white hover:bg-grey-50 text-grey-700 text-xs font-display font-bold border border-grey-200 shadow-soft flex items-center gap-2 transition-all cursor-pointer"
                    title="Share this house plan"
                  >
                    <Share2 className="w-4 h-4 text-blue-700" />
                    <span>{copiedLink ? 'Link Copied!' : 'Share Plan'}</span>
                  </button>
                  <a
                    href={`https://wa.me/${cleanPhone}?text=${encodeURIComponent(`Hello Lifehut Developers, I am interested in House Plan ${activePlan.planCode} (${activePlan.title}). Please share floor plan details and cost breakdown for my plot.`)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="px-4 py-2.5 rounded-xl bg-[#25D366] hover:bg-[#20ba59] text-white text-xs font-display font-bold flex items-center gap-2 shadow-soft hover:shadow-card transition-all"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>Inquire on WhatsApp</span>
                  </a>
                </div>
              </div>
            </motion.div>

            {/* Architectural Dimensions Showcase Panel: Plot Dimension, Building Dimension & Buildup Area (Light Theme) */}
            <div className="bg-white rounded-3xl p-6 sm:p-7 border border-grey-200 shadow-soft text-ink">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-grey-100">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-2xl bg-blue-50 text-blue-700 flex items-center justify-center flex-shrink-0 border border-blue-100">
                    <Ruler className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[11px] font-mono font-bold tracking-wider uppercase text-blue-700">
                      Approved Architectural Specifications
                    </span>
                    <h2 className="text-lg sm:text-xl font-display font-extrabold text-ink">
                      Plan Dimensions: Plot, Building &amp; Buildup Area
                    </h2>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center gap-1.5 font-semibold">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>CMDA / DTCP Compliant Layout</span>
                  </span>
                </div>
              </div>

              {/* 3 Metric Dimension Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-5">
                {/* 1. Plot Dimension */}
                <div className="bg-blue-50/40 hover:bg-blue-50/70 transition-all rounded-2xl p-5 border border-blue-100/80 shadow-2xs relative overflow-hidden group">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-blue-900 flex items-center gap-1.5 font-mono uppercase tracking-wider">
                      <Layers className="w-4 h-4 text-blue-700" />
                      Plot Dimension
                    </span>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-blue-100 text-blue-800">
                      Site Boundary
                    </span>
                  </div>
                  <p className="text-2xl sm:text-3xl font-extrabold text-ink font-display tracking-tight">
                    {activePlan.plotDimensions}
                  </p>
                  <p className="text-xs text-grey-600 mt-2 leading-relaxed">
                    Target site parcel size required for setback clearances &amp; gate alignment
                  </p>
                </div>

                {/* 2. Building Dimension */}
                <div className="bg-cyan-50/40 hover:bg-cyan-50/70 transition-all rounded-2xl p-5 border border-cyan-100/80 shadow-2xs relative overflow-hidden group">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-cyan-950 flex items-center gap-1.5 font-mono uppercase tracking-wider">
                      <Building2 className="w-4 h-4 text-cyan-700" />
                      Building Dimension
                    </span>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-cyan-100 text-cyan-800">
                      Outer Footprint
                    </span>
                  </div>
                  <p className="text-2xl sm:text-3xl font-extrabold text-cyan-950 font-display tracking-tight font-mono">
                    {getBuildingDimension(activePlan)}
                  </p>
                  <p className="text-xs text-grey-600 mt-2 leading-relaxed">
                    Actual structural outer plinth footprint (column-to-column boundary)
                  </p>
                </div>

                {/* 3. Buildup Area */}
                <div className="bg-amber-50/40 hover:bg-amber-50/70 transition-all rounded-2xl p-5 border border-amber-100/80 shadow-2xs relative overflow-hidden group">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-amber-950 flex items-center gap-1.5 font-mono uppercase tracking-wider">
                      <Ruler className="w-4 h-4 text-amber-700" />
                      Buildup Area
                    </span>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-amber-100 text-amber-800">
                      Total Slab
                    </span>
                  </div>
                  <p className="text-2xl sm:text-3xl font-extrabold text-amber-950 font-display tracking-tight">
                    {activePlan.builtUpArea} <span className="text-base font-semibold text-grey-500">sq.ft</span>
                  </p>
                  <p className="text-xs text-grey-600 mt-2 leading-relaxed">
                    {activePlan.floorsLabel} • Estimated rate: <span className="text-amber-800 font-bold">{activePlan.costPerSqft}</span>
                  </p>
                </div>
              </div>
            </div>

            {/* Media & Key Highlights Section */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              
              {/* Left Column: Visual Showcase (3D Elevation / 2D Floor Plan) */}
              <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                
                {/* Top View Bar: Slide Information & Fullscreen (No tabs) */}
                <div className="flex items-center justify-between border-b border-slate-200 px-4 sm:px-6 py-3 bg-slate-50/80">
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-blue-50 border border-blue-200 text-xs font-bold text-blue-900 shadow-2xs">
                      {currentMedia?.type === 'floorplan' ? (
                        <FileText className="w-3.5 h-3.5 text-blue-700" />
                      ) : currentMedia?.type === 'elevation' ? (
                        <Building2 className="w-3.5 h-3.5 text-blue-700" />
                      ) : (
                        <Layers className="w-3.5 h-3.5 text-blue-700" />
                      )}
                      <span>{currentMedia?.badge || 'Architectural View'}</span>
                    </div>

                    {planMediaList.length > 1 && (
                      <span className="text-xs font-mono font-semibold text-slate-500 bg-white px-2.5 py-1 rounded-md border border-slate-200">
                        {activeCarouselIndex + 1} / {planMediaList.length}
                      </span>
                    )}
                  </div>

                  <button
                    onClick={() => {
                      if (currentMedia) {
                        setZoomModalImage(currentMedia.url);
                        setZoomModalTitle(`${activePlan.title} (${currentMedia.badge})`);
                      }
                    }}
                    className="text-xs text-slate-600 hover:text-blue-700 flex items-center gap-1.5 cursor-pointer font-semibold py-1.5 px-3 rounded-lg hover:bg-white border border-transparent hover:border-slate-200 transition-all"
                    title="Click to expand high resolution view"
                  >
                    <Maximize2 className="w-3.5 h-3.5" />
                    <span>Fullscreen</span>
                  </button>
                </div>

                {/* Media Carousel Stage */}
                <div className="relative aspect-[4/3] sm:aspect-[16/10] bg-slate-950 group overflow-hidden flex items-center justify-center select-none">
                  <img
                    key={currentMedia?.url || activeCarouselIndex}
                    src={currentMedia?.url}
                    alt={currentMedia?.title || `${activePlan.title} Architectural Visual`}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 cursor-pointer"
                    onClick={() => {
                      if (currentMedia) {
                        setZoomModalImage(currentMedia.url);
                        setZoomModalTitle(`${activePlan.title} (${currentMedia.badge})`);
                      }
                    }}
                  />

                  {/* Previous Carousel Button (<) */}
                  {planMediaList.length > 1 && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handlePrevSlide();
                      }}
                      aria-label="Previous image"
                      className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-slate-900/80 hover:bg-slate-900 text-white backdrop-blur-md border border-white/20 flex items-center justify-center shadow-xl transition-all hover:scale-110 active:scale-95 cursor-pointer z-10 opacity-90 hover:opacity-100"
                      title="Previous Image"
                    >
                      <ChevronLeft className="w-6 h-6 -ml-0.5 text-white" />
                    </button>
                  )}

                  {/* Next Carousel Button (>) */}
                  {planMediaList.length > 1 && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleNextSlide();
                      }}
                      aria-label="Next image"
                      className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-slate-900/80 hover:bg-slate-900 text-white backdrop-blur-md border border-white/20 flex items-center justify-center shadow-xl transition-all hover:scale-110 active:scale-95 cursor-pointer z-10 opacity-90 hover:opacity-100"
                      title="Next Image"
                    >
                      <ChevronRight className="w-6 h-6 -mr-0.5 text-white" />
                    </button>
                  )}
                  
                  {/* Floor Plan Blueprint Badge (if currently displaying floor plan) */}
                  {currentMedia?.type === 'floorplan' && (
                    <div className="absolute top-4 right-4 bg-cyan-950/85 backdrop-blur-md text-cyan-200 border border-cyan-400/40 px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-md">
                      <FileText className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Floor Plan Blueprint</span>
                    </div>
                  )}

                  {/* Orientation Compass Overlay */}
                  <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-md rounded-lg px-2.5 py-1 text-slate-800 text-xs font-bold flex items-center gap-1.5 shadow-sm">
                    <Compass className="w-3.5 h-3.5 text-blue-700" />
                    <span>Facing: {activePlan.facing}</span>
                  </div>

                  {/* Slide Indicator Dots (Bottom Center) */}
                  {planMediaList.length > 1 && (
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-950/70 backdrop-blur-md border border-white/15 z-10">
                      {planMediaList.map((slide, idx) => (
                        <button
                          key={slide.id || idx}
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveCarouselIndex(idx);
                          }}
                          className={`h-2 rounded-full transition-all cursor-pointer ${
                            idx === activeCarouselIndex
                              ? 'w-6 bg-blue-400 shadow-sm'
                              : 'w-2 bg-white/50 hover:bg-white/80'
                          }`}
                          aria-label={`Go to image ${idx + 1}`}
                        />
                      ))}
                    </div>
                  )}

                  {/* Subtle hover overlay badge */}
                  <div className="absolute bottom-4 right-4 bg-slate-900/80 backdrop-blur-sm text-white px-3 py-1.5 rounded-lg text-xs flex items-center gap-1.5 opacity-90 group-hover:opacity-100 transition-opacity">
                    <ZoomIn className="w-3.5 h-3.5 text-blue-400" />
                    <span>Click to Zoom HD</span>
                  </div>
                </div>

                {/* All Views Thumbnail Strip (Including Floor Plans, 3D Elevations & Gallery Images) */}
                {planMediaList.length > 0 && (
                  <div className="p-3.5 bg-slate-50 border-t border-slate-200">
                    <div className="flex items-center justify-between mb-2 px-0.5">
                      <span className="text-[11px] font-bold text-slate-700 uppercase font-mono tracking-wider flex items-center gap-1.5">
                        <Layers className="w-3.5 h-3.5 text-blue-700" />
                        All Views ({planMediaList.length}):
                      </span>
                      <span className="text-[10px] text-slate-500 font-medium hidden sm:inline">
                        Click any thumbnail or use arrows to view floor plans &amp; elevations
                      </span>
                    </div>

                    <div className="flex items-center gap-2.5 overflow-x-auto pb-1 pt-1 scrollbar-thin">
                      {planMediaList.map((media, i) => {
                        const isCurrent = i === activeCarouselIndex;
                        return (
                          <button
                            key={media.id || i}
                            type="button"
                            onClick={() => setActiveCarouselIndex(i)}
                            className={`relative rounded-xl overflow-hidden border-2 flex-shrink-0 transition-all cursor-pointer group text-left ${
                              isCurrent
                                ? 'border-[#1A6DB5] ring-2 ring-blue-500/40 scale-105 shadow-md'
                                : 'border-slate-200 opacity-75 hover:opacity-100 hover:border-blue-300'
                            }`}
                            title={`View ${media.title}`}
                          >
                            <div className="w-20 h-14 sm:w-24 sm:h-16 relative bg-slate-900">
                              <img
                                src={media.url}
                                alt={media.title}
                                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                              />
                              
                              {/* Floor plan icon badge */}
                              {media.type === 'floorplan' && (
                                <div className="absolute top-1 left-1 bg-cyan-600 text-white rounded p-0.5 shadow-sm">
                                  <FileText className="w-2.5 h-2.5" />
                                </div>
                              )}

                              {/* Label Overlay */}
                              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-950/90 via-slate-900/60 to-transparent p-1 text-center">
                                <span className={`text-[9px] font-bold font-mono tracking-tight block truncate ${
                                  media.type === 'floorplan' 
                                    ? 'text-cyan-300 font-extrabold' 
                                    : media.type === 'elevation'
                                    ? 'text-blue-300'
                                    : 'text-white'
                                }`}>
                                  {media.type === 'floorplan' ? 'Floor Plan' : media.type === 'elevation' ? '3D View' : `View #${i + 1}`}
                                </span>
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Visual Dimension Callout Strip */}
                <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-3 bg-slate-50 border-t border-slate-200 text-xs">
                  <div className="flex items-center flex-wrap gap-3.5 text-slate-700">
                    <span className="flex items-center gap-1.5">
                      <Layers className="w-3.5 h-3.5 text-blue-600" />
                      <span className="text-slate-500">Plot Dimension:</span>
                      <strong className="font-semibold text-slate-900 font-mono">{activePlan.plotDimensions.split('(')[0].trim()}</strong>
                    </span>
                    <span className="text-slate-300">•</span>
                    <span className="flex items-center gap-1.5">
                      <Building2 className="w-3.5 h-3.5 text-cyan-600" />
                      <span className="text-slate-500">Building Dimension:</span>
                      <strong className="font-semibold text-slate-900 font-mono">{getBuildingDimension(activePlan)}</strong>
                    </span>
                    <span className="text-slate-300">•</span>
                    <span className="flex items-center gap-1.5">
                      <Ruler className="w-3.5 h-3.5 text-amber-600" />
                      <span className="text-slate-500">Buildup Area:</span>
                      <strong className="font-semibold text-slate-900 font-mono">{activePlan.builtUpArea} sq.ft</strong>
                    </span>
                  </div>
                  <span className="text-[11px] font-mono font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                    {activePlan.planCode}
                  </span>
                </div>

                {/* Description & Style */}
                <div className="p-6">
                  <h3 className="text-base font-bold text-slate-900 mb-2 font-display">
                    Architectural Layout Concept
                  </h3>
                  <p className="text-slate-600 text-sm leading-relaxed mb-4">
                    {activePlan.description}
                  </p>

                  {/* Key Features Pill Tags */}
                  <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-100">
                    {activePlan.features.map((feat, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-md bg-slate-100 text-slate-700"
                      >
                        <Check className="w-3 h-3 text-emerald-600" />
                        <span>{feat}</span>
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Column: Spec Matrix & Turnkey Cost Card */}
              <div className="lg:col-span-5 space-y-6">
                
                {/* Specifications Matrix Card */}
                <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 font-mono">
                      Plan Specifications
                    </h3>
                    <span className="text-[11px] font-mono text-blue-700 bg-blue-50 px-2 py-0.5 rounded font-bold">
                      {activePlan.planCode}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3.5 pb-6 border-b border-slate-100">
                    <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                      <div className="flex items-center gap-2 text-slate-500 text-xs mb-1">
                        <Layers className="w-3.5 h-3.5 text-blue-700" />
                        <span className="font-semibold text-slate-700">Plot Dimension</span>
                      </div>
                      <p className="text-base font-bold text-slate-900 font-display">
                        {activePlan.plotDimensions}
                      </p>
                    </div>

                    <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                      <div className="flex items-center gap-2 text-slate-500 text-xs mb-1">
                        <Building2 className="w-3.5 h-3.5 text-cyan-700" />
                        <span className="font-semibold text-slate-700">Building Dimension</span>
                      </div>
                      <p className="text-base font-bold text-slate-900 font-display font-mono">
                        {getBuildingDimension(activePlan)}
                      </p>
                    </div>

                    <div className="bg-blue-50/60 p-3.5 rounded-xl border border-blue-100 col-span-2">
                      <div className="flex items-center justify-between text-xs mb-1">
                        <div className="flex items-center gap-2 text-blue-800">
                          <Ruler className="w-3.5 h-3.5 text-blue-700" />
                          <span className="font-bold">Buildup Area (Built-up Area)</span>
                        </div>
                        <span className="text-[11px] font-medium text-blue-600 bg-white px-2 py-0.5 rounded border border-blue-200">
                          {activePlan.floorsLabel}
                        </span>
                      </div>
                      <p className="text-xl font-extrabold text-blue-950 font-display">
                        {activePlan.builtUpArea} <span className="text-xs font-semibold text-blue-600">sq.ft total constructible</span>
                      </p>
                    </div>

                    <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                      <div className="flex items-center gap-2 text-slate-500 text-xs mb-1">
                        <Bed className="w-3.5 h-3.5 text-blue-700" />
                        <span>Bedrooms</span>
                      </div>
                      <p className="text-base font-bold text-slate-900 font-display">
                        {activePlan.bedrooms} <span className="text-xs font-medium text-slate-500">BHK</span>
                      </p>
                    </div>

                    <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                      <div className="flex items-center gap-2 text-slate-500 text-xs mb-1">
                        <Bath className="w-3.5 h-3.5 text-blue-700" />
                        <span>Bathrooms</span>
                      </div>
                      <p className="text-base font-bold text-slate-900 font-display">
                        {activePlan.bathrooms} <span className="text-xs font-medium text-slate-500">Attached</span>
                      </p>
                    </div>

                    <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                      <div className="flex items-center gap-2 text-slate-500 text-xs mb-1">
                        <Car className="w-3.5 h-3.5 text-blue-700" />
                        <span>Car Parking</span>
                      </div>
                      <p className="text-base font-bold text-slate-900 font-display">
                        {activePlan.carParking} <span className="text-xs font-medium text-slate-500">Vehicles</span>
                      </p>
                    </div>

                    <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                      <div className="flex items-center gap-2 text-slate-500 text-xs mb-1">
                        <Compass className="w-3.5 h-3.5 text-blue-700" />
                        <span>Orientation</span>
                      </div>
                      <p className="text-base font-bold text-slate-900 font-display">
                        {activePlan.facing} Facing
                      </p>
                    </div>
                  </div>

                  {/* Turnkey Construction Cost Breakdown */}
                  <div className="pt-6">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Estimated Turnkey Cost</span>
                      <span className="text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">Chennai Rates</span>
                    </div>
                    <p className="text-2xl font-extrabold text-blue-900 font-display mb-1">
                      {activePlan.estimatedCostRange}
                    </p>
                    <p className="text-xs text-slate-500 mb-6">
                      Estimated turnkey construction rate: <span className="font-semibold text-slate-700">{activePlan.costPerSqft}</span>. Includes soil investigation, structural RCC foundation, branded steel/cement, tiles, electrical, plumbing &amp; 10-year warranty.
                    </p>

                    {/* CTAs */}
                    <div className="space-y-3">
                      <button
                        onClick={() => setIsCustomizeModalOpen(true)}
                        className="w-full py-3.5 px-4 rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-bold text-sm shadow-soft transition-all cursor-pointer flex items-center justify-center gap-2"
                      >
                        <Sparkles className="w-4 h-4" />
                        <span>Customize This Plan for My Plot</span>
                      </button>

                      <button
                        onClick={() => openCadDownloadModal(activePlan)}
                        className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-[#1A6DB5] to-blue-800 hover:from-blue-700 hover:to-blue-900 text-white font-bold text-sm shadow-soft transition-all cursor-pointer flex items-center justify-center gap-2"
                      >
                        <Download className="w-4 h-4 text-white" />
                        <span>Download Full CAD &amp; PDF Drawings</span>
                        <span className="ml-1 text-[11px] bg-white/20 px-2 py-0.5 rounded-full font-mono">
                          ₹{activePlan.cadPackagePrice || 999}
                        </span>
                      </button>

                      <a
                        href={`https://wa.me/${cleanPhone}?text=${encodeURIComponent(`Hello Lifehut Engineering Team, I am viewing house plan ${activePlan.planCode} (${activePlan.title}). My plot size is ${activePlan.plotDimensions}. Can you please provide an architectural consultation and exact cost estimate?`)}`}
                        target="_blank"
                        rel="noreferrer"
                        className="w-full py-3 px-4 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-semibold text-sm border border-emerald-200 transition-colors flex items-center justify-center gap-2"
                      >
                        <MessageCircle className="w-4 h-4 text-emerald-600" />
                        <span>Chat on WhatsApp with Chief Engineer</span>
                      </a>
                    </div>
                  </div>
                </div>

                {/* Vastu Shastra Summary Box */}
                <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-2xl p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-7 h-7 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs">
                      <Compass className="w-4 h-4" />
                    </div>
                    <h4 className="text-sm font-bold text-emerald-950 font-display">
                      Vastu Shastra Compliance Report
                    </h4>
                  </div>
                  <ul className="space-y-2 text-xs text-emerald-900/90 leading-relaxed">
                    {(activePlan.vastuNotes || [
                      "Main entrance positioned in high-positive astrological zone",
                      "Master bedroom located in the South-West (Kubera / Niruthi) quadrant",
                      "Kitchen oriented in South-East (Agneya) fire corner",
                      "Pooja Mandir strictly in North-East (Ishanya) corner"
                    ]).map((note, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0 mt-0.5" />
                        <span>{note}</span>
                      </li>
                    ))}
                  </ul>
                </div>

              </div>
            </div>

            {/* Room-by-Room Dimensions Table */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 md:p-8 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-100">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 font-display">
                    Room-by-Room Dimension Schedule
                  </h3>
                  <div className="flex flex-wrap items-center gap-2 mt-1.5 text-xs">
                    <span className="text-slate-500">Master Dimensions:</span>
                    <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-800 font-bold font-mono text-[11px] border border-blue-200">
                      Plot: {activePlan.plotDimensions.split('(')[0].trim()}
                    </span>
                    <span className="px-2 py-0.5 rounded bg-cyan-50 text-cyan-800 font-bold font-mono text-[11px] border border-cyan-200">
                      Building: {getBuildingDimension(activePlan)}
                    </span>
                    <span className="px-2 py-0.5 rounded bg-amber-50 text-amber-900 font-bold font-mono text-[11px] border border-amber-200">
                      Buildup Area: {activePlan.builtUpArea} sq.ft
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setActiveTab('quote');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 px-3.5 py-2 rounded-lg transition-colors cursor-pointer self-start sm:self-auto"
                >
                  <Building2 className="w-3.5 h-3.5" />
                  <span>Estimate Turnkey Construction Cost</span>
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                      <th className="py-3 px-4 font-mono uppercase text-[11px]">Room / Area</th>
                      <th className="py-3 px-4 font-mono uppercase text-[11px]">Dimensions (W x L)</th>
                      <th className="py-3 px-4 font-mono uppercase text-[11px]">Floor Level</th>
                      <th className="py-3 px-4 font-mono uppercase text-[11px]">Vastu Zone</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {activePlan.roomDimensions.map((room, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/60 transition-colors">
                        <td className="py-3 px-4 font-medium text-slate-900">
                          {room.roomName}
                        </td>
                        <td className="py-3 px-4 font-bold text-blue-900 font-mono">
                          {room.dimension}
                        </td>
                        <td className="py-3 px-4 text-slate-600">
                          <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[11px] font-medium">
                            {room.floor}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-slate-600">
                          {room.vastuZone ? (
                            <span className="inline-flex items-center gap-1 text-emerald-700 font-medium">
                              <Compass className="w-3 h-3 text-emerald-600" />
                              <span>{room.vastuZone}</span>
                            </span>
                          ) : (
                            <span className="text-slate-400">—</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Turnkey Construction Scope & Engineering Checklist */}
            <div className="bg-slate-900 text-white rounded-2xl p-6 md:p-8 relative overflow-hidden">
              <div className="max-w-3xl relative z-10">
                <span className="text-xs font-bold uppercase tracking-wider text-blue-400 font-mono">
                  Lifehut Engineering Protocol
                </span>
                <h3 className="text-xl md:text-2xl font-bold mt-1 mb-3">
                  How We Construct This Plan For You in Chennai
                </h3>
                <p className="text-slate-300 text-xs md:text-sm leading-relaxed mb-6">
                  Every house plan in our collection can be custom-fitted to your plot's exact boundaries, road widths, and setback requirements. We undertake the complete turnkey execution with locked contract pricing.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-slate-200">
                  <div className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                    <span>Soil Bearing Capacity (SBC) Investigation &amp; Structural Footing Design</span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                    <span>Fe 550D TMT Reinforcement Steel &amp; Grade 53 UltraTech Cement</span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                    <span>CMDA / DTCP Sanction Plan Drawings &amp; Building Approval Clearance</span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                    <span>10-Year Structural Frame Warranty &amp; Weekly Live Video Milestone Updates</span>
                  </div>
                </div>

                <div className="mt-8 flex flex-wrap items-center gap-4">
                  <button
                    onClick={() => setIsCustomizeModalOpen(true)}
                    className="px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-soft transition-colors cursor-pointer"
                  >
                    Request Free Site Inspection &amp; Plot Layout
                  </button>
                  <a
                    href={`tel:${phone.replace(/[^0-9+]/g, '')}`}
                    className="px-5 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs border border-slate-700 transition-colors flex items-center gap-2"
                  >
                    <Phone className="w-3.5 h-3.5 text-blue-400" />
                    <span>Speak with Senior Civil Engineer</span>
                  </a>
                </div>
              </div>
            </div>

            {/* Similar / Related Plans Carousel */}
            <div>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 font-display">
                    Other Recommended House Plans
                  </h3>
                  <p className="text-xs text-slate-500">
                    Explore similar architectural layouts that match your space and budget goals
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {plans
                  .filter(p => p.slug !== activePlan.slug)
                  .slice(0, 3)
                  .map(simPlan => (
                    <div
                      key={simPlan.id}
                      onClick={() => handleSelectPlan(simPlan.slug)}
                      className="bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-card hover:border-blue-300 transition-all cursor-pointer group flex flex-col justify-between"
                    >
                      <div className="relative aspect-[16/10] overflow-hidden bg-slate-100">
                        <img
                          src={simPlan.elevationImage}
                          alt={simPlan.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute top-3 left-3 bg-slate-900/80 backdrop-blur-sm text-white px-2.5 py-1 rounded text-[11px] font-mono font-bold">
                          {simPlan.planCode}
                        </div>
                        <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm text-emerald-700 px-2 py-0.5 rounded text-[11px] font-bold">
                          {simPlan.facing} Facing
                        </div>
                      </div>

                      <div className="p-5 flex-grow flex flex-col justify-between">
                        <div>
                          <div className="flex items-center gap-2 text-xs text-slate-500 mb-1.5">
                            <span>{simPlan.floorsLabel}</span>
                            <span>•</span>
                            <span>{simPlan.builtUpArea} sq.ft</span>
                            <span>•</span>
                            <span>{simPlan.bedrooms} BHK</span>
                          </div>
                          <h4 className="text-sm font-bold text-slate-900 group-hover:text-blue-700 transition-colors line-clamp-2">
                            {simPlan.title}
                          </h4>
                        </div>

                        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                          <span className="font-bold text-blue-900">{simPlan.estimatedCostRange.split('–')[0]}</span>
                          <span className="text-blue-700 font-semibold flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                            <span>View Plan</span>
                            <ChevronRight className="w-3.5 h-3.5" />
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>

          </div>
        ) : (
          
          /* ======================= CATALOG / COLLECTION VIEW ======================= */
          <div className="space-y-10">

            {/* Filter Controls Panel */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 md:p-6 shadow-sm">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-slate-100">
                
                {/* Search box */}
                <div className="relative flex-grow max-w-md">
                  <Ruler className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    value={searchQuery ?? ''}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by area (e.g. 1500), BHK, plot size (30x40), facing..."
                    className="w-full text-xs font-medium pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder:text-slate-400 focus:bg-white focus:border-blue-600 outline-none transition-all"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Filter count & Reset */}
                <div className="flex items-center justify-between lg:justify-end gap-3 text-xs">
                  <span className="font-semibold text-slate-500">
                    Showing <span className="font-bold text-blue-700">{filteredPlans.length}</span> of {plans.length} house plans
                  </span>
                  {(searchQuery || floorFilter !== 'all' || bedroomFilter !== 'all' || facingFilter !== 'all' || areaRangeFilter !== 'all' || vastuOnlyFilter) && (
                    <button
                      onClick={resetFilters}
                      className="flex items-center gap-1 text-slate-600 hover:text-red-600 font-medium cursor-pointer transition-colors px-2 py-1 rounded bg-slate-100"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>Reset</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Filter Pills / Dropdowns */}
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-3 pt-4">
                
                {/* Floors Filter */}
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1 font-mono">
                    Floors / Storey
                  </label>
                  <select
                    value={floorFilter ?? 'all'}
                    onChange={(e) => setFloorFilter(e.target.value === 'all' ? 'all' : Number(e.target.value))}
                    className="w-full text-xs font-medium py-2 px-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 outline-none focus:border-blue-600 cursor-pointer"
                  >
                    <option value="all">All Storeys</option>
                    <option value="1">1 Storey (Ground)</option>
                    <option value="2">2 Storey (Duplex G+1)</option>
                    <option value="3">3 Storey (Triplex G+2)</option>
                  </select>
                </div>

                {/* Bedrooms Filter */}
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1 font-mono">
                    Bedrooms (BHK)
                  </label>
                  <select
                    value={bedroomFilter ?? 'all'}
                    onChange={(e) => setBedroomFilter(e.target.value === 'all' ? 'all' : Number(e.target.value))}
                    className="w-full text-xs font-medium py-2 px-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 outline-none focus:border-blue-600 cursor-pointer"
                  >
                    <option value="all">All BHKs</option>
                    <option value="2">2 BHK</option>
                    <option value="3">3 BHK</option>
                    <option value="4">4 BHK</option>
                    <option value="5">5+ BHK</option>
                  </select>
                </div>

                {/* Built-up Area Filter */}
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1 font-mono">
                    Built-up Area
                  </label>
                  <select
                    value={areaRangeFilter ?? 'all'}
                    onChange={(e) => setAreaRangeFilter(e.target.value)}
                    className="w-full text-xs font-medium py-2 px-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 outline-none focus:border-blue-600 cursor-pointer"
                  >
                    <option value="all">Any Size</option>
                    <option value="under1200">&lt; 1,200 sq.ft</option>
                    <option value="1200-1800">1,200 – 1,800 sq.ft</option>
                    <option value="1800-2500">1,800 – 2,500 sq.ft</option>
                    <option value="above2500">2,500+ sq.ft</option>
                  </select>
                </div>

                {/* Facing Orientation Filter */}
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1 font-mono">
                    Facing Direction
                  </label>
                  <select
                    value={facingFilter ?? 'all'}
                    onChange={(e) => setFacingFilter(e.target.value)}
                    className="w-full text-xs font-medium py-2 px-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 outline-none focus:border-blue-600 cursor-pointer"
                  >
                    <option value="all">All Orientations</option>
                    <option value="East">East Facing</option>
                    <option value="North">North Facing</option>
                    <option value="South">South Facing</option>
                    <option value="West">West Facing</option>
                  </select>
                </div>

                {/* Vastu Shastra Toggle */}
                <div className="flex items-end col-span-2 sm:col-span-1">
                  <button
                    onClick={() => setVastuOnlyFilter(!vastuOnlyFilter)}
                    className={`w-full py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                      vastuOnlyFilter
                        ? 'bg-emerald-600 text-white shadow-sm'
                        : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200'
                    }`}
                  >
                    <Compass className="w-3.5 h-3.5" />
                    <span>{vastuOnlyFilter ? '✓ 100% Vastu Only' : 'Filter 100% Vastu'}</span>
                  </button>
                </div>

              </div>
            </div>

            {/* Plans Grid */}
            {filteredPlans.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredPlans.map((plan) => (
                  <motion.div
                    key={plan.id}
                    layout
                    initial={{ opacity: 0, scale: 0.96 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.25 }}
                    className="bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-card hover:border-blue-300 transition-all flex flex-col justify-between group"
                  >
                    {/* Elevation Image Banner */}
                    <div className="relative aspect-[16/10] overflow-hidden bg-slate-100 cursor-pointer" onClick={() => handleSelectPlan(plan.slug)}>
                      <img
                        src={plan.elevationImage}
                        alt={plan.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                      />
                      
                      {/* Plan Code Tag */}
                      <div className="absolute top-3 left-3 bg-slate-900/85 backdrop-blur-sm text-white px-2.5 py-1 rounded-lg text-xs font-mono font-bold shadow-sm">
                        {plan.planCode}
                      </div>

                      {/* Facing & Vastu Pill */}
                      <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-sm text-emerald-800 border border-emerald-200 px-2.5 py-1 rounded-lg text-xs font-bold shadow-sm flex items-center gap-1">
                        <Compass className="w-3.5 h-3.5 text-emerald-600" />
                        <span>{plan.facing} Facing</span>
                      </div>

                      {/* Storey Badge */}
                      <div className="absolute bottom-3 left-3 bg-slate-900/80 backdrop-blur-sm text-slate-200 px-2.5 py-0.5 rounded text-[11px] font-medium">
                        {plan.floorsLabel}
                      </div>

                      {/* Plot Size Badge */}
                      <div className="absolute bottom-3 right-3 bg-blue-900/90 backdrop-blur-sm text-white px-2.5 py-0.5 rounded text-[11px] font-medium">
                        Plot: {plan.plotDimensions.split('(')[0]}
                      </div>
                    </div>

                    {/* Content Body */}
                    <div className="p-5 sm:p-6 flex-grow flex flex-col justify-between">
                      <div>
                        {/* Title */}
                        <h3 
                          onClick={() => handleSelectPlan(plan.slug)}
                          className="text-base font-bold text-slate-900 group-hover:text-blue-700 transition-colors font-display line-clamp-2 cursor-pointer mb-3"
                        >
                          {plan.title}
                        </h3>

                        {/* Specs Matrix Chips - BHK, Baths, Buildup Area, Building Dim */}
                        <div className="grid grid-cols-2 gap-2 py-2 border-y border-slate-100 text-center mb-4">
                          <div className="bg-white p-2 rounded-lg border border-slate-100">
                            <span className="text-[10px] text-slate-400 font-bold block uppercase whitespace-nowrap">BHK</span>
                            <span className="text-xs font-bold text-slate-800 whitespace-nowrap block">{plan.bedrooms} BHK</span>
                          </div>
                          <div className="bg-white p-2 rounded-lg border border-slate-100">
                            <span className="text-[10px] text-slate-400 font-bold block uppercase whitespace-nowrap">Baths</span>
                            <span className="text-xs font-bold text-slate-800 whitespace-nowrap block">{plan.bathrooms} Baths</span>
                          </div>
                          <div className="bg-white p-2 rounded-lg border border-slate-100">
                            <span className="text-[10px] text-slate-400 font-bold block uppercase whitespace-nowrap">Buildup Area</span>
                            <span className="text-xs font-bold text-slate-800 whitespace-nowrap block">{plan.builtUpArea} sq.ft</span>
                          </div>
                          <div className="bg-white p-2 rounded-lg border border-slate-100">
                            <span className="text-[10px] text-slate-400 font-bold block uppercase whitespace-nowrap">Building Dim</span>
                            <span className="text-xs font-bold text-slate-800 whitespace-nowrap block">{getBuildingDimension(plan)}</span>
                          </div>
                        </div>

                        {/* Key highlights bullet preview */}
                        <ul className="space-y-1.5 text-xs text-slate-600 mb-4">
                          {plan.features.slice(0, 2).map((feat, fidx) => (
                            <li key={fidx} className="flex items-center gap-1.5 truncate">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600 flex-shrink-0" />
                              <span className="truncate">{feat}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Bottom Pricing & Actions */}
                      <div className="pt-4 border-t border-slate-100">
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">Turnkey Estimate</span>
                            <span className="text-sm font-bold text-blue-900">{plan.estimatedCostRange}</span>
                          </div>
                          <span className="text-[11px] font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                            {plan.style.split(' ')[0]}
                          </span>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <button
                            onClick={() => handleSelectPlan(plan.slug)}
                            className="py-2.5 px-3 rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs shadow-soft transition-colors cursor-pointer flex items-center justify-center gap-1"
                          >
                            <span>View Floor Plan</span>
                            <ChevronRight className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => openCadDownloadModal(plan)}
                            className="py-2.5 px-2.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-800 font-semibold text-xs border border-blue-200 transition-colors flex items-center justify-center gap-1 cursor-pointer"
                          >
                            <Download className="w-3.5 h-3.5 text-blue-700" />
                            <span>CAD &amp; PDF (₹{plan.cadPackagePrice || 999})</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center max-w-lg mx-auto">
                <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400 mb-3">
                  <Ruler className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-slate-800 mb-1">No Matching House Plans Found</h3>
                <p className="text-xs text-slate-500 mb-6">
                  We customize residential house plans for any plot dimension or facing. Speak with our architectural team to draft a tailored blueprint.
                </p>
                <div className="flex justify-center gap-3">
                  <button
                    onClick={resetFilters}
                    className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold cursor-pointer"
                  >
                    Reset Filters
                  </button>
                  <button
                    onClick={() => setIsCustomizeModalOpen(true)}
                    className="px-4 py-2 rounded-xl bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold shadow-soft cursor-pointer"
                  >
                    Request Custom Plan
                  </button>
                </div>
              </div>
            )}

            {/* ======================= RICH SEO ARCHITECTURAL GUIDE ======================= */}
            <section className="bg-white rounded-2xl border border-slate-200 p-8 md:p-12 shadow-sm space-y-10">
              
              <div className="max-w-3xl">
                <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded bg-blue-50 text-blue-700 text-xs font-bold font-mono mb-2">
                  <Building2 className="w-3.5 h-3.5" />
                  <span>Homeowner Knowledge Base</span>
                </div>
                <h2 className="text-2xl md:text-3xl font-bold text-slate-900 font-display mb-3">
                  A Complete Guide to Selecting the Ideal House Plan in Chennai
                </h2>
                <p className="text-slate-600 text-sm leading-relaxed">
                  Building your dream home is a once-in-a-lifetime milestone. Choosing the correct architectural floor plan balances your family's daily lifestyle, plot orientation, structural safety, CMDA/DTCP municipal setbacks, and Vastu Shastra harmony.
                </p>
              </div>

              {/* 3 Pillar Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                <div className="bg-slate-50 p-6 rounded-xl border border-slate-100">
                  <div className="w-10 h-10 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold mb-4">
                    <Compass className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-bold text-slate-900 mb-2 font-display">
                    1. Vastu Shastra Alignment
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Ensure the main entrance aligns with auspicious planetary zones (East Indra or North Kubera). Master bedrooms belong in the South-West (earth stability), kitchen in South-East (fire element), and sacred pooja mandir in North-East (Ishanya water element).
                  </p>
                </div>

                <div className="bg-slate-50 p-6 rounded-xl border border-slate-100">
                  <div className="w-10 h-10 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold mb-4">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-bold text-slate-900 mb-2 font-display">
                    2. CMDA &amp; DTCP Setbacks
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Chennai building bylaws require clear front, rear, and side setback buffers for natural light, fire safety, and rainwater percolation. Our house plans are dimensioned to pass local building plan sanction approvals without friction.
                  </p>
                </div>

                <div className="bg-slate-50 p-6 rounded-xl border border-slate-100">
                  <div className="w-10 h-10 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center font-bold mb-4">
                    <Ruler className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-bold text-slate-900 mb-2 font-display">
                    3. Turnkey Budget Certainty
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Avoid uncoordinated masons and open-ended rate escalations. Partnering with Lifehut Developers guarantees locked per-sqft contract pricing, grade-certified steel and cement, and clear milestone stages.
                  </p>
                </div>

              </div>

              {/* FAQ Section */}
              <div className="pt-6 border-t border-slate-100">
                <h3 className="text-xl font-bold text-slate-900 font-display mb-6">
                  Frequently Asked Questions About House Plans in Tamil Nadu
                </h3>

                <div className="space-y-4">
                  <details className="group bg-slate-50 p-4 rounded-xl border border-slate-100 cursor-pointer">
                    <summary className="font-bold text-sm text-slate-800 flex items-center justify-between">
                      <span>Can these house plans be customized for irregular or odd-sized plots?</span>
                      <ChevronRight className="w-4 h-4 text-slate-400 group-open:rotate-90 transition-transform" />
                    </summary>
                    <p className="text-xs text-slate-600 mt-3 leading-relaxed">
                      Yes, absolutely! Every plot in Chennai (narrow widths, corner plots, triangular boundaries) is unique. Our structural civil engineers and CAD architects reconfigure any of these layouts to fit your exact plot coordinates while maintaining 100% Vastu balance and room ergonomics.
                    </p>
                  </details>

                  <details className="group bg-slate-50 p-4 rounded-xl border border-slate-100 cursor-pointer">
                    <summary className="font-bold text-sm text-slate-800 flex items-center justify-between">
                      <span>What is the average house construction cost per sq.ft in Chennai?</span>
                      <ChevronRight className="w-4 h-4 text-slate-400 group-open:rotate-90 transition-transform" />
                    </summary>
                    <p className="text-xs text-slate-600 mt-3 leading-relaxed">
                      Turnkey residential construction rates in Chennai generally range between ₹2,100 to ₹2,500 per sq.ft depending on finishing specifications (teakwood frames, UPVC windows, Kajaria vitrified tiles, Kohler sanitary fittings). Our contracts include comprehensive soil investigation and full RCC frame engineering.
                    </p>
                  </details>

                  <details className="group bg-slate-50 p-4 rounded-xl border border-slate-100 cursor-pointer">
                    <summary className="font-bold text-sm text-slate-800 flex items-center justify-between">
                      <span>Do you provide 3D elevation renders and structural column drawings?</span>
                      <ChevronRight className="w-4 h-4 text-slate-400 group-open:rotate-90 transition-transform" />
                    </summary>
                    <p className="text-xs text-slate-600 mt-3 leading-relaxed">
                      Yes. When you contract your home construction with Lifehut Developers, our pre-contract engineering deliverables include photorealistic 3D exterior elevations, 2D working floor plans, column centerline grids, plinth beam details, plumbing isometric schematics, and electrical conduit drawings.
                    </p>
                  </details>

                  <details className="group bg-slate-50 p-4 rounded-xl border border-slate-100 cursor-pointer">
                    <summary className="font-bold text-sm text-slate-800 flex items-center justify-between">
                      <span>What is the difference between Built-up Area and Carpet Area?</span>
                      <ChevronRight className="w-4 h-4 text-slate-400 group-open:rotate-90 transition-transform" />
                    </summary>
                    <p className="text-xs text-slate-600 mt-3 leading-relaxed">
                      Carpet Area represents the actual usable floor space within the interior walls of your rooms. Built-up Area includes the carpet area plus the thickness of exterior/interior brick walls, balconies, and utility ducts. Plinth area generally forms the basis of construction material estimation.
                    </p>
                  </details>
                </div>
              </div>

              {/* Subtle Callout Banner */}
              <div className="bg-gradient-to-r from-blue-700 via-blue-800 to-blue-900 rounded-3xl p-7 md:p-9 text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-card">
                <div>
                  <h4 className="text-lg font-bold mb-1 font-display">Have a plot ready in Chennai or nearby suburbs?</h4>
                  <p className="text-xs text-blue-100 max-w-xl leading-relaxed">
                    Get an engineer-led architectural feasibility review, soil guideline consultation, and custom turnkey quotation with zero obligations.
                  </p>
                </div>
                <button
                  onClick={() => setIsCustomizeModalOpen(true)}
                  className="px-6 py-3 rounded-xl bg-white hover:bg-blue-50 text-blue-700 font-display font-bold text-xs shadow-soft transition-all cursor-pointer flex-shrink-0"
                >
                  Book Free Plan Consultation
                </button>
              </div>

            </section>

          </div>
        )}

      </div>

      {/* ======================= HIGH RESOLUTION IMAGE ZOOM MODAL ======================= */}
      <AnimatePresence>
        {zoomModalImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4"
            onClick={() => setZoomModalImage(null)}
          >
            <div 
              className="relative max-w-5xl w-full max-h-[90vh] flex flex-col items-center justify-center"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="w-full flex items-center justify-between text-white pb-3 border-b border-white/10 mb-3">
                <span className="text-xs font-bold font-mono text-blue-300">{zoomModalTitle}</span>
                <button
                  onClick={() => setZoomModalImage(null)}
                  className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <img
                src={zoomModalImage}
                alt={zoomModalTitle}
                className="max-h-[80vh] w-auto max-w-full object-contain rounded-lg shadow-2xl"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ======================= CUSTOMIZE PLAN MODAL ======================= */}
      <AnimatePresence>
        {isCustomizeModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
            onClick={() => setIsCustomizeModalOpen(false)}
          >
            <div 
              className="bg-white rounded-2xl max-w-lg w-full p-6 md:p-8 shadow-2xl border border-slate-200 relative my-8"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setIsCustomizeModalOpen(false)}
                className="absolute top-5 right-5 p-1 rounded-full text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="mb-6">
                <span className="text-[11px] font-bold uppercase tracking-wider text-blue-700 font-mono">
                  Custom Architecture Design
                </span>
                <h3 className="text-xl font-bold text-slate-900 mt-1 font-display">
                  Customize Plan for Your Plot
                </h3>
                <div className="text-xs text-slate-500 mt-1">
                  {activePlan ? (
                    <div className="flex flex-wrap items-center gap-1.5 mt-0.5">
                      <span className="font-semibold text-slate-700">{activePlan.planCode}:</span>
                      <span>Plot: <strong className="font-mono text-slate-800">{activePlan.plotDimensions.split('(')[0].trim()}</strong></span>
                      <span>•</span>
                      <span>Bldg: <strong className="font-mono text-cyan-700">{getBuildingDimension(activePlan)}</strong></span>
                      <span>•</span>
                      <span>Buildup: <strong className="font-bold text-blue-900">{activePlan.builtUpArea} sq.ft</strong></span>
                    </div>
                  ) : 'Share your plot dimensions and requirements for a custom plan draft.'}
                </div>
              </div>

              {formSubmitted ? (
                <div className="py-8 text-center space-y-3">
                  <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                    <Check className="w-6 h-6" />
                  </div>
                  <h4 className="text-base font-bold text-slate-900">Customization Request Received!</h4>
                  <p className="text-xs text-slate-600 max-w-xs mx-auto">
                    Our Senior Civil Engineer will review your plot metrics and contact you within 2 hours with layout feasibility options.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleCustomizationSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Full Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={clientName ?? ''}
                      onChange={(e) => setClientName(e.target.value)}
                      placeholder="e.g. Ramesh Kumar"
                      className="w-full text-xs font-medium px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:border-blue-600 outline-none transition-all"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Mobile Number <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="tel"
                        required
                        value={clientPhone ?? ''}
                        onChange={(e) => setClientPhone(e.target.value)}
                        placeholder="+91 98765 43210"
                        className="w-full text-xs font-medium px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:border-blue-600 outline-none transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Plot Dimensions
                      </label>
                      <input
                        type="text"
                        value={plotDimensions ?? ''}
                        onChange={(e) => setPlotDimensions(e.target.value)}
                        placeholder="e.g. 30' x 45' (East)"
                        className="w-full text-xs font-medium px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:border-blue-600 outline-none transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Email Address (Optional)
                    </label>
                    <input
                      type="email"
                      value={clientEmail ?? ''}
                      onChange={(e) => setClientEmail(e.target.value)}
                      placeholder="ramesh@gmail.com"
                      className="w-full text-xs font-medium px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:border-blue-600 outline-none transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Specific Requirements / Modifications
                    </label>
                    <textarea
                      rows={3}
                      value={customNotes ?? ''}
                      onChange={(e) => setCustomNotes(e.target.value)}
                      placeholder="e.g. Need 4 BHK instead of 3 BHK, ground floor bedroom for senior citizens, covered car parking for SUV..."
                      className="w-full text-xs font-medium px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:border-blue-600 outline-none transition-all"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3.5 px-4 rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs shadow-soft transition-colors cursor-pointer flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? (
                      <span>Sending Request...</span>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        <span>Submit Customization Request</span>
                      </>
                    )}
                  </button>

                  <p className="text-[11px] text-slate-400 text-center">
                    Zero spam guarantee. Your details are kept private with our engineering team.
                  </p>
                </form>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ======================= DOWNLOAD CAD / PDF RAZORPAY MODAL ======================= */}
      <AnimatePresence>
        {isPdfModalOpen && currentCadPlan && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
            onClick={() => setIsPdfModalOpen(false)}
          >
            <div 
              className="bg-white rounded-2xl max-w-lg w-full p-6 md:p-7 shadow-2xl border border-slate-200 relative my-8 text-left"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setIsPdfModalOpen(false)}
                className="absolute top-5 right-5 p-1.5 rounded-full text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              {paymentSuccess ? (
                /* Success & Download Screen */
                <div className="py-4 text-center space-y-4">
                  <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-sm">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>

                  <div>
                    <span className="text-[10px] font-bold font-mono uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full">
                      Payment Verified &amp; Confirmed
                    </span>
                    <h3 className="text-xl font-bold text-slate-900 mt-2 font-display">
                      Your CAD &amp; PDF Drawing Package is Ready!
                    </h3>
                    <p className="text-xs text-slate-600 mt-1 max-w-sm mx-auto">
                      Full AutoCAD source drawings (.DWG), high-resolution blueprint PDFs, and structural engineering schedules for <span className="font-bold text-slate-800">{currentCadPlan.planCode}</span> have been unlocked.
                    </p>
                  </div>

                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-600 font-mono text-left max-w-sm mx-auto space-y-1">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Transaction ID:</span>
                      <span className="font-bold text-slate-800">{paymentTxnId}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Plan Code:</span>
                      <span className="font-bold text-[#1A6DB5]">{currentCadPlan.planCode}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Amount Paid:</span>
                      <span className="font-bold text-emerald-700">₹{currentCadPlan.cadPackagePrice || 999}</span>
                    </div>
                  </div>

                  <div className="pt-2 space-y-2.5 max-w-sm mx-auto">
                    <button
                      onClick={() => triggerDownloadCadZip(currentCadPlan)}
                      disabled={downloadingCadFile}
                      className="w-full py-3.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-soft transition-all cursor-pointer flex items-center justify-center gap-2"
                    >
                      {downloadingCadFile ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Downloading ZIP Archive...</span>
                        </>
                      ) : (
                        <>
                          <Download className="w-4 h-4" />
                          <span>Download CAD &amp; PDF Drawings (.ZIP)</span>
                        </>
                      )}
                    </button>

                    <a
                      href={`https://wa.me/${cleanPhone}?text=${encodeURIComponent(`Hello Lifehut Engineering Team, I just paid for CAD drawings package for house plan ${currentCadPlan.planCode} (Payment ID: ${paymentTxnId}). I would like to schedule a structural engineering consultation.`)}`}
                      target="_blank"
                      rel="noreferrer"
                      className="w-full py-2.5 px-4 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 font-semibold text-xs border border-slate-200 transition-colors flex items-center justify-center gap-2"
                    >
                      <MessageCircle className="w-4 h-4 text-emerald-600" />
                      <span>Contact Chief Engineer on WhatsApp</span>
                    </a>
                  </div>
                </div>
              ) : (
                /* Checkout Form */
                <div>
                  <div className="mb-4">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full font-mono">
                        Instant Razorpay Checkout
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {currentCadPlan.planCode}
                      </span>
                    </div>
                    <h3 className="text-lg md:text-xl font-bold text-slate-900 mt-1 font-display">
                      Download Full CAD &amp; PDF Drawings
                    </h3>
                    <div className="flex flex-wrap items-center gap-1.5 text-xs text-slate-500 mt-1">
                      <span className="font-semibold text-slate-800">{currentCadPlan.title}</span>
                      <span>•</span>
                      <span>Plot: <strong className="font-mono text-slate-700">{currentCadPlan.plotDimensions.split('(')[0].trim()}</strong></span>
                      <span>•</span>
                      <span>Bldg: <strong className="font-mono text-cyan-700">{getBuildingDimension(currentCadPlan)}</strong></span>
                      <span>•</span>
                      <span>Buildup: <strong className="font-bold text-blue-900">{currentCadPlan.builtUpArea} sq.ft</strong></span>
                    </div>
                  </div>

                  {/* Pricing Bar */}
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50/70 border border-blue-200/80 rounded-xl p-3.5 mb-4 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-blue-900 tracking-wider block">
                        Architectural License Fee
                      </span>
                      <div className="flex items-baseline gap-2 mt-0.5">
                        <span className="text-2xl font-bold font-display text-blue-950">
                          ₹{currentCadPlan.cadPackagePrice || 999}
                        </span>
                        <span className="text-xs text-slate-400 line-through">
                          ₹4,999
                        </span>
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.2 rounded">
                          80% OFF
                        </span>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] font-bold text-slate-500 block">Deliverable</span>
                      <span className="text-xs font-mono font-bold text-blue-800 bg-white px-2 py-1 rounded border border-blue-200 flex items-center gap-1 mt-0.5">
                        <Archive className="w-3.5 h-3.5 text-[#1A6DB5]" />
                        {currentCadPlan.cadPackageSize || 'AutoCAD ZIP'}
                      </span>
                    </div>
                  </div>

                  {/* What's included */}
                  <div className="bg-slate-50 rounded-xl p-3 border border-slate-200/80 mb-4">
                    <span className="text-[11px] font-bold text-slate-700 block mb-2">
                      What's Included in this Download:
                    </span>
                    <ul className="text-xs text-slate-600 space-y-1.5">
                      {(currentCadPlan.cadPackageIncludes && currentCadPlan.cadPackageIncludes.length > 0
                        ? currentCadPlan.cadPackageIncludes
                        : [
                            "AutoCAD 2018+ DWG Architectural Floor Plan",
                            "High-Resolution PDF Blueprints & Working Drawings",
                            "Structural RCC Column & Beam Reinforcement Schedule",
                            "100% Vastu Shastra Room Dimension Grid",
                            "IS 456:2000 Civil Foundation Specifications"
                          ]
                      ).map((item, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-[11px]">
                          <Check className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0 mt-0.5" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Form */}
                  <form onSubmit={handleRazorpayPayment} className="space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">
                          Full Name <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={clientName ?? ''}
                          onChange={(e) => setClientName(e.target.value)}
                          placeholder="e.g. Suresh V"
                          className="w-full text-xs font-medium px-3 py-2 bg-white border border-slate-200 rounded-xl text-slate-900 focus:border-blue-600 outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">
                          WhatsApp Mobile <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="tel"
                          required
                          value={clientPhone ?? ''}
                          onChange={(e) => setClientPhone(e.target.value)}
                          placeholder="+91 98765 43210"
                          className="w-full text-xs font-medium px-3 py-2 bg-white border border-slate-200 rounded-xl text-slate-900 focus:border-blue-600 outline-none"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        Email Address (To receive download link &amp; GST receipt)
                      </label>
                      <input
                        type="email"
                        value={clientEmail ?? ''}
                        onChange={(e) => setClientEmail(e.target.value)}
                        placeholder="suresh@gmail.com"
                        className="w-full text-xs font-medium px-3 py-2 bg-white border border-slate-200 rounded-xl text-slate-900 focus:border-blue-600 outline-none"
                      />
                    </div>

                    {paymentError && (
                      <div className="p-2.5 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2">
                        <X className="w-4 h-4 flex-shrink-0" />
                        <span>{paymentError}</span>
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={razorpayLoading}
                      className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-blue-700 to-indigo-700 hover:from-blue-800 hover:to-indigo-800 text-white font-bold text-xs shadow-soft transition-all cursor-pointer flex items-center justify-center gap-2"
                    >
                      {razorpayLoading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Connecting to Razorpay...</span>
                        </>
                      ) : (
                        <>
                          <CreditCard className="w-4 h-4" />
                          <span>Pay ₹{currentCadPlan.cadPackagePrice || 999} via Razorpay</span>
                        </>
                      )}
                    </button>

                    <div className="flex items-center justify-center gap-3 pt-1 text-[10px] text-slate-400">
                      <span className="flex items-center gap-1">
                        <Lock className="w-3 h-3 text-slate-400" />
                        256-Bit SSL Encrypted
                      </span>
                      <span>•</span>
                      <span>UPI, Cards, NetBanking</span>
                      <span>•</span>
                      <span>Instant ZIP Download</span>
                    </div>
                  </form>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};
