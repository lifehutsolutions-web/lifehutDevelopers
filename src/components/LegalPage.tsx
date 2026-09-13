import React, { useEffect, useState } from 'react';
import { 
  ShieldCheck, 
  FileText, 
  RotateCcw, 
  Clock, 
  Lock, 
  Mail, 
  Phone, 
  MapPin, 
  Building2, 
  CheckCircle2, 
  AlertCircle, 
  ArrowLeft, 
  ExternalLink,
  ChevronRight,
  Printer
} from 'lucide-react';
import { motion } from 'motion/react';

export type LegalTabType = 'privacy-policy' | 'terms-and-conditions' | 'refund-policy';

interface LegalPageProps {
  activePolicy: LegalTabType;
  setActivePolicy: (policy: LegalTabType) => void;
  setActiveTab: (tab: string) => void;
  phone?: string;
  email?: string;
  address?: string;
}

export const LegalPage: React.FC<LegalPageProps> = ({
  activePolicy,
  setActivePolicy,
  setActiveTab,
  phone = "+91 98765 43210",
  email = "hello@lifehutdevelopers.com",
  address = "No.24, 2nd Main Road, Nehru Nagar, Ambattur, Chennai, Tamil Nadu 600053"
}) => {
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [activePolicy]);

  const handleTabChange = (policy: LegalTabType) => {
    setActivePolicy(policy);
    window.history.pushState({}, '', `/${policy}`);
  };

  const copyPageUrl = () => {
    if (typeof window !== 'undefined') {
      const url = `${window.location.origin}/${activePolicy}`;
      navigator.clipboard.writeText(url).then(() => {
        setCopiedUrl(url);
        setTimeout(() => setCopiedUrl(null), 3000);
      });
    }
  };

  const policyMeta = {
    'refund-policy': {
      title: 'Cancellation and Refund Policy',
      subtitle: 'Official guidelines for order cancellations, digital product refunds, and turnkey construction contracts.',
      lastUpdated: 'September 13, 2026',
      icon: RotateCcw,
      badge: 'PhonePe PG Compliant'
    },
    'privacy-policy': {
      title: 'Privacy Policy',
      subtitle: 'How Lifehut Developers collects, protects, and handles your personal information and transaction data.',
      lastUpdated: 'September 13, 2026',
      icon: Lock,
      badge: '256-Bit SSL Encrypted'
    },
    'terms-and-conditions': {
      title: 'Terms and Conditions',
      subtitle: 'Master terms governing the use of Lifehut Developers platform, digital blueprint purchases, and civil contracting services.',
      lastUpdated: 'September 13, 2026',
      icon: FileText,
      badge: 'Legally Binding Agreement'
    }
  };

  const currentMeta = policyMeta[activePolicy] || policyMeta['refund-policy'];
  const CurrentIcon = currentMeta.icon;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pt-8 pb-20">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Navigation Breadcrumb */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <button
            onClick={() => {
              setActiveTab('home');
              window.history.pushState({}, '', '/');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-blue-700 bg-white px-3.5 py-2 rounded-xl border border-slate-200 shadow-sm transition-all cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Home</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={copyPageUrl}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200 transition-colors cursor-pointer"
              title="Copy direct link to this policy"
            >
              <ExternalLink className="w-3.5 h-3.5 text-blue-700" />
              <span>{copiedUrl ? 'Copied Link!' : 'Copy Direct URL'}</span>
            </button>
            <button
              onClick={() => window.print()}
              className="hidden sm:inline-flex items-center gap-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200 transition-colors cursor-pointer"
              title="Print Policy"
            >
              <Printer className="w-3.5 h-3.5 text-slate-600" />
              <span>Print</span>
            </button>
          </div>
        </div>

        {/* Header Hero Banner */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-700 flex items-center justify-center shrink-0 border border-blue-100">
                <CurrentIcon className="w-6 h-6" />
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2 mb-1.5">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-full font-mono border border-blue-100">
                    {currentMeta.badge}
                  </span>
                  <span className="text-[11px] text-slate-400 font-mono">
                    Last Updated: {currentMeta.lastUpdated}
                  </span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight font-display">
                  {currentMeta.title}
                </h1>
              </div>
            </div>
            <div className="sm:text-right text-xs text-slate-500 font-mono">
              <p className="font-bold text-slate-700">Lifehut Developers</p>
              <p>Chennai, Tamil Nadu, India</p>
            </div>
          </div>

          <p className="text-sm text-slate-600 mt-4 leading-relaxed max-w-3xl">
            {currentMeta.subtitle}
          </p>

          {/* Policy Switcher Tabs */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-6 mt-6 border-t border-slate-100">
            <button
              onClick={() => handleTabChange('refund-policy')}
              className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activePolicy === 'refund-policy'
                  ? 'bg-blue-700 text-white shadow-soft shadow-blue-500/20'
                  : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200'
              }`}
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Cancellation &amp; Refund Policy</span>
            </button>

            <button
              onClick={() => handleTabChange('privacy-policy')}
              className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activePolicy === 'privacy-policy'
                  ? 'bg-blue-700 text-white shadow-soft shadow-blue-500/20'
                  : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200'
              }`}
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Privacy Policy</span>
            </button>

            <button
              onClick={() => handleTabChange('terms-and-conditions')}
              className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activePolicy === 'terms-and-conditions'
                  ? 'bg-blue-700 text-white shadow-soft shadow-blue-500/20'
                  : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Terms and Conditions</span>
            </button>
          </div>
        </div>

        {/* Policy Content Body */}
        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200 shadow-sm text-slate-800 space-y-8 leading-relaxed">
          
          {/* ========================================================================= */}
          {/* POLICY 1: CANCELLATION & REFUND POLICY (PHONEPE TEMPLATE COMPLIANT) */}
          {/* ========================================================================= */}
          {activePolicy === 'refund-policy' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              className="space-y-8 text-sm"
            >
              {/* PhonePe Standard Mandatory Policy Clause */}
              <div className="bg-amber-50/70 border border-amber-200/80 rounded-2xl p-5 text-amber-950 space-y-3">
                <div className="flex items-center gap-2 text-amber-900 font-bold text-xs uppercase tracking-wider font-mono">
                  <ShieldCheck className="w-4 h-4 text-amber-700" />
                  <span>Standard Cancellation &amp; Refund Framework</span>
                </div>
                <p className="text-sm font-medium leading-relaxed">
                  This cancellation policy outlines about how you can cancel or seek a refund for a product / service that you have purchased through the Platform.
                </p>
                <div className="space-y-2 text-xs text-amber-900/90 leading-normal pl-3 border-l-2 border-amber-300">
                  <p>
                    <strong>1. Order Cancellation Window:</strong> Cancellations will only be considered if the request is made within <strong>7 days</strong> of placing the order. However, cancellation requests may not be entertained if the orders have been communicated to such sellers / merchants listed on the Platform and they have initiated the process of shipping them, or the product is out for delivery. In such an event, you may choose to reject the product at the doorstep.
                  </p>
                  <p>
                    <strong>2. Perishable / Non-Cancellable Items:</strong> <strong>Lifehut Developers</strong> does not accept cancellation requests for perishable items like flowers, eatables, etc. However, the refund / replacement can be made if the user establishes that quality of the product delivered is not good.
                  </p>
                  <p>
                    <strong>3. Damaged or Defective Items:</strong> In case of receipt of damaged or defective items, please report to our customer service team. The request would be entertained once the seller / merchant listed on the Platform has checked and determined the same at its own end. This should be reported within <strong>7 days</strong> of receipt of products.
                  </p>
                  <p>
                    <strong>4. Quality or Expectation Discrepancies:</strong> In case you feel that the product received is not as shown on the site or as per your expectations, you must bring it to the notice of our customer service within <strong>7 days</strong> of receiving the product. The customer service team after looking into your complaint will take an appropriate decision.
                  </p>
                  <p>
                    <strong>5. Manufacturer Warranties:</strong> In case of complaints regarding products that come with a warranty from the manufacturers (such as structural tiles, plumbing fixtures, electrical fittings, water-proofing chemicals), please refer the issue to them or coordinate through our client service desk.
                  </p>
                  <p>
                    <strong>6. Refund Processing Timeline:</strong> In case of any refunds approved by <strong>Lifehut Developers</strong>, it will take <strong>5 to 7 business days</strong> for the refund to be processed to you back to your original payment method (Bank Account, Credit/Debit Card, UPI) through PhonePe Payment Gateway.
                  </p>
                </div>
              </div>

              {/* Detailed Operational Policies for Lifehut Developers */}
              <div className="space-y-6 pt-2">
                <section className="space-y-3">
                  <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-mono">1</span>
                    Digital Architectural Products (AutoCAD DWG, Structural Schedules &amp; PDF House Plans)
                  </h2>
                  <p className="text-slate-600 leading-relaxed">
                    Lifehut Developers provides digital architectural deliverables including 2D architectural blueprint drawings, 3D front elevations, CAD DWG source files, and structural calculation schedules delivered electronically.
                  </p>
                  <ul className="list-disc pl-5 space-y-1.5 text-slate-600">
                    <li>
                      <strong>Pre-Download Cancellation:</strong> If you placed an order for a CAD package by mistake and have not generated or accessed the tokenized download link, you may request a 100% refund within 7 days by contacting our support team with your PhonePe Transaction ID.
                    </li>
                    <li>
                      <strong>Defective or Inaccessible Deliverables:</strong> If the ZIP archive, AutoCAD DWG file, or PDF document downloaded is corrupt, unreadable, or missing components described in the plan specifications, report it to our customer support team within 7 days of purchase. We will immediately provide verified replacement files or issue a full refund if the issue cannot be resolved.
                    </li>
                    <li>
                      <strong>Modifications &amp; Customization:</strong> If you require minor plan adaptations (e.g. door relocations, electrical modifications), our engineering team offers customization consultations.
                    </li>
                  </ul>
                </section>

                <section className="space-y-3">
                  <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-mono">2</span>
                    Turnkey Residential Construction &amp; Civil Contracts
                  </h2>
                  <p className="text-slate-600 leading-relaxed">
                    For physical turnkey house construction contracts executed in Chennai and Tamil Nadu:
                  </p>
                  <ul className="list-disc pl-5 space-y-1.5 text-slate-600">
                    <li>
                      <strong>Pre-Mobilization Cancellation:</strong> If a client terminates a turnkey construction agreement before physical site mobilization, soil excavation, or custom steel procurement, advance booking deposits are refundable minus verifiable administrative, soil test, and municipal submission expenses incurred.
                    </li>
                    <li>
                      <strong>Stage-Wise Milestone Contracts:</strong> Turnkey residential construction operates on stage-wise milestone approvals (Foundation, Plinth, Column &amp; Beam Casting, Slab Concreting, Brickwork, Plastering, Finishing). Payments made for fully cast and certified structural milestones are non-refundable as physical materials and labor have been irreversibly deployed.
                    </li>
                    <li>
                      <strong>Dispute Resolution &amp; Site Assessment:</strong> In the rare event of contractual cessation, a joint site audit by certified structural engineers will reconcile work completed against funds disbursed. Any surplus balance will be refunded within 14 business days.
                    </li>
                  </ul>
                </section>

                <section className="space-y-3">
                  <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-mono">3</span>
                    Mode of Refund &amp; Processing Workflow
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                      <p className="text-xs font-bold text-slate-500 uppercase font-mono mb-1">Source Account Credit</p>
                      <p className="text-xs text-slate-700">All refunds are routed exclusively back to the original source account (UPI, Debit Card, Credit Card, NetBanking) used during PhonePe checkout.</p>
                    </div>
                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                      <p className="text-xs font-bold text-slate-500 uppercase font-mono mb-1">Turnaround Time</p>
                      <p className="text-xs text-slate-700">Approved refunds take <strong>5 to 7 business days</strong> to reflect in the customer's bank statement as per standard banking clearing cycles.</p>
                    </div>
                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                      <p className="text-xs font-bold text-slate-500 uppercase font-mono mb-1">Zero Cash Handover</p>
                      <p className="text-xs text-slate-700">In strict accordance with RBI guidelines and PhonePe aggregator terms, refunds will not be issued in physical cash or to third-party bank accounts.</p>
                    </div>
                  </div>
                </section>

                <section className="space-y-3">
                  <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-mono">4</span>
                    How to Submit a Cancellation or Refund Request
                  </h2>
                  <p className="text-slate-600">
                    To initiate a cancellation or refund, please reach out to our dedicated support desk with the following details:
                  </p>
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs space-y-1.5 font-mono text-slate-700">
                    <p>• Your Full Name &amp; Phone Number registered during checkout</p>
                    <p>• PhonePe Merchant Transaction ID / Payment Reference Number</p>
                    <p>• Purchased House Plan Code (e.g. LH-HP-1500) or Service Invoice Number</p>
                    <p>• Reason for cancellation or specific details regarding the defective deliverable</p>
                  </div>
                  <div className="flex flex-wrap gap-4 pt-2">
                    <a
                      href={`mailto:${email}?subject=Refund%20Request%20-%20Lifehut%20Developers`}
                      className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs shadow-soft transition-all"
                    >
                      <Mail className="w-4 h-4" />
                      <span>Email: {email}</span>
                    </a>
                    <a
                      href={`tel:${phone.replace(/[^0-9+]/g, '')}`}
                      className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-900 font-bold text-xs border border-slate-200 transition-all"
                    >
                      <Phone className="w-4 h-4 text-blue-700" />
                      <span>Customer Care: {phone}</span>
                    </a>
                  </div>
                </section>
              </div>
            </motion.div>
          )}

          {/* ========================================================================= */}
          {/* POLICY 2: PRIVACY POLICY */}
          {/* ========================================================================= */}
          {activePolicy === 'privacy-policy' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              className="space-y-8 text-sm"
            >
              <div className="bg-blue-50/70 border border-blue-200/80 rounded-2xl p-5 text-blue-950 space-y-2">
                <div className="flex items-center gap-2 text-blue-900 font-bold text-xs uppercase tracking-wider font-mono">
                  <ShieldCheck className="w-4 h-4 text-blue-700" />
                  <span>Commitment to Data Privacy</span>
                </div>
                <p className="text-sm font-medium leading-relaxed">
                  Lifehut Developers ("we", "us", or "our") values your trust and is committed to protecting the privacy and personal data of every client, visitor, and platform user. This Privacy Policy explains our practices regarding data collection, storage, usage, and protection across <span className="font-mono text-xs font-semibold">lifehutdevelopers.com</span> and associated services.
                </p>
              </div>

              <section className="space-y-3">
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-mono">1</span>
                  Information We Collect
                </h2>
                <p className="text-slate-600 leading-relaxed">
                  We collect information necessary to provide civil construction estimations, architectural drawing packages, project management, and customer support:
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5">
                    <p className="text-xs font-bold text-slate-900">Personal &amp; Contact Details</p>
                    <p className="text-xs text-slate-600">Full Name, Mobile Number, Email Address, WhatsApp Contact info, and Billing/Postal Address.</p>
                  </div>
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5">
                    <p className="text-xs font-bold text-slate-900">Property &amp; Construction Data</p>
                    <p className="text-xs text-slate-600">Plot dimensions, site location in Chennai / Tamil Nadu, proposed square footage, floor requirements, and budget preferences.</p>
                  </div>
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5">
                    <p className="text-xs font-bold text-slate-900">Transaction &amp; Order Identifiers</p>
                    <p className="text-xs text-slate-600">Order ID, PhonePe Transaction ID, date/time of checkout, plan code purchased, and payment status verification.</p>
                  </div>
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5">
                    <p className="text-xs font-bold text-slate-900">Technical &amp; Usage Diagnostics</p>
                    <p className="text-xs text-slate-600">IP address, browser type, device information, and interaction metrics to protect our platform against automated abuse.</p>
                  </div>
                </div>
              </section>

              <section className="space-y-3">
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-mono">2</span>
                  Payment Security &amp; PhonePe Gateway Processing
                </h2>
                <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-3">
                  <div className="flex items-center gap-2 text-xs font-bold text-purple-800 uppercase font-mono">
                    <Lock className="w-4 h-4 text-purple-700" />
                    <span>Zero Storage of Banking / Card Credentials</span>
                  </div>
                  <p className="text-xs text-slate-700 leading-relaxed">
                    All digital monetary transactions on Lifehut Developers are processed via <strong>PhonePe Payment Gateway (PhonePe Private Limited)</strong>, an RBI-licensed, PCI-DSS Level 1 compliant payment aggregator.
                  </p>
                  <ul className="list-disc pl-5 space-y-1 text-xs text-slate-600">
                    <li>Lifehut Developers <strong>NEVER</strong> collects, stores, views, or logs your Credit/Debit Card numbers, CVV, NetBanking passwords, or UPI PINs.</li>
                    <li>Transactions are transmitted via industry-standard <strong>256-bit Secure Socket Layer (SSL) encryption</strong>.</li>
                    <li>PhonePe directly authenticates the transaction with your issuing bank via two-factor authentication (OTP / UPI PIN).</li>
                  </ul>
                </div>
              </section>

              <section className="space-y-3">
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-mono">3</span>
                  How We Use Your Data
                </h2>
                <ul className="list-disc pl-5 space-y-1.5 text-slate-600">
                  <li>To provide transparent construction cost estimates, turnkey quotation comparisons, and scheduling on-site structural engineering reviews.</li>
                  <li>To verify payment and provide cryptographic tokenized download links for purchased AutoCAD DWG and PDF house plans.</li>
                  <li>To prepare statutory documentation for CMDA / DTCP municipal building approvals when authorized by the client.</li>
                  <li>To provide project status milestones, material delivery schedules, and quality assurance inspection reports.</li>
                  <li>To prevent fraud and comply with applicable statutory Indian tax and civil engineering regulations.</li>
                </ul>
              </section>

              <section className="space-y-3">
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-mono">4</span>
                  Data Sharing &amp; Non-Disclosure
                </h2>
                <p className="text-slate-600 leading-relaxed">
                  We do not sell, rent, trade, or monetize your personal data. Your information is only shared under the following limited circumstances:
                </p>
                <ul className="list-disc pl-5 space-y-1.5 text-slate-600">
                  <li><strong>Authorized Payment Partners:</strong> With PhonePe Payment Gateway to complete authorization and status verification of your transactions.</li>
                  <li><strong>Statutory Authorities:</strong> When required by court order, law enforcement, or government building sanctioning authorities (CMDA, DTCP, Greater Chennai Corporation).</li>
                  <li><strong>Vetted Project Engineers:</strong> Licensed structural engineers, soil test laboratories, and site supervisors strictly for executing your contracted construction project.</li>
                </ul>
              </section>

              <section className="space-y-3">
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-mono">5</span>
                  Data Retention &amp; User Rights
                </h2>
                <p className="text-slate-600 leading-relaxed">
                  You have the right to request access to the personal data we hold about you, request corrections to inaccurate records, or request deletion of non-statutory records. Turnkey structural engineering warranties and tax invoices are retained for the statutory period mandated under Indian law.
                </p>
              </section>

              <section className="space-y-3">
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-mono">6</span>
                  Grievance Officer &amp; Contact Details
                </h2>
                <p className="text-slate-600 leading-relaxed">
                  In accordance with the Information Technology Act, 2000 and the Rules made thereunder, the contact details of our Grievance Officer are provided below:
                </p>
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs space-y-1 text-slate-700 font-mono">
                  <p><strong>Entity:</strong> Lifehut Developers</p>
                  <p><strong>Grievance Officer:</strong> Principal Civil Engineer / Operations Desk</p>
                  <p><strong>Address:</strong> {address}</p>
                  <p><strong>Email:</strong> {email}</p>
                  <p><strong>Direct Helpline:</strong> {phone}</p>
                </div>
              </section>
            </motion.div>
          )}

          {/* ========================================================================= */}
          {/* POLICY 3: TERMS AND CONDITIONS */}
          {/* ========================================================================= */}
          {activePolicy === 'terms-and-conditions' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              className="space-y-8 text-sm"
            >
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-2">
                <div className="flex items-center gap-2 text-slate-900 font-bold text-xs uppercase tracking-wider font-mono">
                  <FileText className="w-4 h-4 text-blue-700" />
                  <span>Agreement Between User and Lifehut Developers</span>
                </div>
                <p className="text-sm text-slate-700 leading-relaxed">
                  Welcome to Lifehut Developers (<span className="font-mono text-xs font-semibold">lifehutdevelopers.com</span>). By accessing this website, purchasing digital house plan packages, requesting construction quotes, or entering into turnkey civil agreements with Lifehut Developers, you acknowledge that you have read, understood, and agreed to be bound by these Terms and Conditions.
                </p>
              </div>

              <section className="space-y-3">
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-mono">1</span>
                  Services Offered &amp; Operational Scope
                </h2>
                <p className="text-slate-600 leading-relaxed">
                  Lifehut Developers operates as a licensed residential construction firm and architectural design studio based in Chennai, Tamil Nadu, offering:
                </p>
                <ul className="list-disc pl-5 space-y-1.5 text-slate-600">
                  <li>Turnkey residential home and luxury villa construction contracts across Chennai, Chengalpattu, Kanchipuram, and surrounding regions.</li>
                  <li>Sale and instant electronic delivery of architect-drafted CAD drawings, 2D floor plans, 3D elevations, and structural calculation schedules.</li>
                  <li>Structural stress consultation, soil test evaluations, and CMDA/DTCP municipal plan sanction assistance.</li>
                  <li>Interior architectural design, renovation, and civil remodeling services.</li>
                </ul>
              </section>

              <section className="space-y-3">
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-mono">2</span>
                  Digital House Plans License &amp; Intellectual Property
                </h2>
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                  <p className="text-xs font-bold text-slate-900 uppercase font-mono">Single-Construction Personal License</p>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Upon purchasing a CAD or PDF drawings package from Lifehut Developers, you are granted a non-exclusive, non-transferable, revocable license to construct a single residential property utilizing the purchased drawings.
                  </p>
                  <ul className="list-disc pl-5 space-y-1 text-xs text-slate-600">
                    <li>All copyright, architectural blueprints, 3D renders, and technical calculation schedules remain the exclusive intellectual property of Lifehut Developers.</li>
                    <li>You are strictly prohibited from reselling, redistributing, sublicensing, or publishing the digital CAD (DWG) or PDF files online or to third-party commercial builders.</li>
                  </ul>
                </div>
              </section>

              <section className="space-y-3">
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-mono">3</span>
                  Payment Terms via PhonePe Gateway
                </h2>
                <ul className="list-disc pl-5 space-y-1.5 text-slate-600">
                  <li>All prices listed on the platform are in Indian National Rupees (INR) and are inclusive of applicable goods and services taxes unless explicitly itemized otherwise.</li>
                  <li>Online transactions are facilitated via PhonePe Payment Gateway. You represent and warrant that you are legally authorized to use the payment instrument (UPI, Debit Card, Credit Card, NetBanking) provided during checkout.</li>
                  <li>In the event of network timeouts or payment debits where an order confirmation was not generated, our automated status reconciliation via PhonePe APIs will verify the transaction or issue an automated refund within 5 to 7 business days.</li>
                </ul>
              </section>

              <section className="space-y-3">
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-mono">4</span>
                  Turnkey Construction Contracts &amp; Material Specifications
                </h2>
                <ul className="list-disc pl-5 space-y-1.5 text-slate-600">
                  <li>Estimates provided by the interactive online quote calculator are preliminary and subject to detailed on-site soil investigation, site topography, and finalized structural drawings.</li>
                  <li>Turnkey construction projects are governed by bilateral, signed construction contracts detailing locked material specifications (e.g., Tata/JSW steel, UltraTech/Coromandel cement, premium vitrified tiles), milestone payment schedules, and handover timelines.</li>
                  <li>Stage-wise payments are due upon certified completion of respective structural milestones. Unwarranted delays in stage payments may lead to corresponding extensions in handover timelines.</li>
                </ul>
              </section>

              <section className="space-y-3">
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-mono">5</span>
                  Site Prerequisite &amp; Soil Suitability Disclaimer
                </h2>
                <p className="text-slate-600 leading-relaxed">
                  While all Lifehut standard house plans are engineered based on standard safe bearing capacity (SBC) assumptions adhering to National Building Code (NBC) guidelines, soil characteristics vary across locations. Clients are advised to conduct a local site soil investigation to verify structural foundation depth prior to casting foundations.
                </p>
              </section>

              <section className="space-y-3">
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-mono">6</span>
                  Limitation of Liability
                </h2>
                <p className="text-slate-600 leading-relaxed">
                  To the maximum extent permitted by applicable Indian laws, Lifehut Developers shall not be liable for any indirect, incidental, punitive, or consequential damages resulting from unauthorized file modifications, third-party site execution errors where Lifehut Developers was not contracted as the executing builder, or delays arising from force majeure events (e.g., severe natural calamities, governmental restrictions, civil strikes).
                </p>
              </section>

              <section className="space-y-3">
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-mono">7</span>
                  Governing Law &amp; Jurisdiction
                </h2>
                <p className="text-slate-600 leading-relaxed">
                  These Terms and Conditions and any dispute or claim arising out of or in connection with them shall be governed by and construed in accordance with the laws of India. The courts located in <strong>Chennai, Tamil Nadu, India</strong> shall have exclusive jurisdiction over any legal proceedings.
                </p>
              </section>

              <section className="space-y-3">
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-mono">8</span>
                  Contact Information &amp; Legal Notices
                </h2>
                <p className="text-slate-600">
                  For questions, formal notices, or clarifications regarding these Terms and Conditions:
                </p>
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs space-y-1 text-slate-700 font-mono">
                  <p><strong>Firm:</strong> Lifehut Developers</p>
                  <p><strong>Headquarters:</strong> {address}</p>
                  <p><strong>Email:</strong> {email}</p>
                  <p><strong>Phone:</strong> {phone}</p>
                  <p><strong>Website:</strong> https://lifehutdevelopers.com</p>
                </div>
              </section>
            </motion.div>
          )}

        </div>

        {/* Footer Support Card */}
        <div className="mt-8 bg-gradient-to-r from-blue-900 to-indigo-950 text-white rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-md">
          <div className="space-y-1.5 text-center sm:text-left">
            <h3 className="text-lg font-bold">Have questions about our policies?</h3>
            <p className="text-xs text-blue-200 max-w-md">
              Our customer service and civil engineering consultation team is available to assist you with order cancellations, downloads, and contracts.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <a
              href={`mailto:${email}`}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white text-blue-900 font-bold text-xs hover:bg-blue-50 transition-colors shadow-sm"
            >
              <Mail className="w-4 h-4" />
              <span>Email Support</span>
            </a>
            <a
              href={`tel:${phone.replace(/[^0-9+]/g, '')}`}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-800 text-white font-bold text-xs hover:bg-blue-700 transition-colors border border-blue-700"
            >
              <Phone className="w-4 h-4" />
              <span>Call {phone}</span>
            </a>
          </div>
        </div>

      </div>
    </div>
  );
};
