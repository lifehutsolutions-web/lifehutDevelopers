import React, { useState } from 'react';
import { Mail, Phone, MapPin, Clock, MessageCircle, Send, CheckCircle, AlertCircle } from 'lucide-react';

interface ContactProps {
  address: string;
  phone: string;
  email: string;
}

export const Contact: React.FC<ContactProps> = ({ address, phone, email }) => {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    location: '',
    area: '',
    type: 'Luxury Villa',
    message: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const validateForm = () => {
    let tempErrors: Record<string, string> = {};
    if (!formData.name.trim()) tempErrors.name = "Name is required";
    if (!formData.phone.trim()) {
      tempErrors.phone = "Phone is required";
    } else if (!/^\+?[0-9\s-]{10,14}$/.test(formData.phone)) {
      tempErrors.phone = "Provide a valid 10-digit mobile number";
    }
    if (!formData.email.trim()) {
      tempErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      tempErrors.email = "Provide a valid email address";
    }
    if (!formData.location.trim()) tempErrors.location = "Site Location/Suburbs is required";
    if (!formData.area.trim()) tempErrors.area = "Approximate Built-up area in sq.ft is required";
    
    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    setSubmitError('');

    try {
      const res = await fetch('/api/enquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          phone: formData.phone,
          email: formData.email,
          message: `Site Location: ${formData.location} | Area: ${formData.area} sq.ft | Type: ${formData.type} | Message: ${formData.message}`
        })
      });

      if (res.ok) {
        setSubmitSuccess(true);
        setFormData({
          name: '',
          phone: '',
          email: '',
          location: '',
          area: '',
          type: 'Luxury Villa',
          message: ''
        });
      } else {
        throw new Error('Failed to submit enquiry');
      }
    } catch (err) {
      console.warn('Backend unavailable, saving enquiry to local storage', err);
      try {
        const localEnquiries = JSON.parse(localStorage.getItem('lifehut_local_enquiries') || '[]');
        const newEnq = {
          id: 'enq-' + Date.now(),
          name: formData.name,
          phone: formData.phone,
          email: formData.email,
          message: `Site Location: ${formData.location} | Area: ${formData.area} sq.ft | Type: ${formData.type} | Message: ${formData.message}`,
          date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
        };
        localEnquiries.unshift(newEnq);
        localStorage.setItem('lifehut_local_enquiries', JSON.stringify(localEnquiries));
        setSubmitSuccess(true);
        setFormData({
          name: '',
          phone: '',
          email: '',
          location: '',
          area: '',
          type: 'Luxury Villa',
          message: ''
        });
      } catch (innerErr) {
        setSubmitError('System is currently busy. Please try again or click the WhatsApp button directly.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  return (
    <div className="bg-slate-50 min-h-screen pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 text-left">
        
        {/* Header Intro */}
        <div className="text-center mb-12">
          <span className="inline-block bg-orange-500/10 text-[#F47B20] text-xs font-bold uppercase tracking-wider px-4 py-1.5 rounded-full mb-3">
            Get In Touch
          </span>
          <h1 className="font-display text-3xl sm:text-4xl font-extrabold text-[#1A2332]">
            Let's Engineer Your Masterpiece
          </h1>
          <p className="text-slate-500 text-sm sm:text-base max-w-xl mx-auto mt-3">
            Schedule a physical structural site consultation, soil review, or blueprint analysis at your convenience.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          
          {/* Left: Contact Form Column */}
          <div className="lg:col-span-7 bg-white p-6 sm:p-10 rounded-3xl border border-slate-100 shadow-premium">
            {submitSuccess ? (
              <div className="py-12 text-center flex flex-col items-center gap-4 animate-in fade-in duration-500">
                <div className="w-16 h-16 rounded-full bg-green-50 text-green-500 flex items-center justify-center border border-green-200">
                  <CheckCircle className="w-10 h-10" />
                </div>
                <h3 className="font-display text-2xl font-extrabold text-[#1A2332]">Enquiry Logged Securely</h3>
                <p className="text-slate-500 text-sm max-w-md leading-relaxed">
                  Our chief engineer will review your site parameters and call you within **3 business hours** to coordinate the blueprint audit.
                </p>
                <button
                  onClick={() => setSubmitSuccess(false)}
                  className="mt-6 px-6 py-2.5 bg-[#1A6DB5] text-white text-xs font-bold rounded-full hover:bg-[#1558a0] transition-colors"
                >
                  Submit Another Inquiry
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                <h3 className="font-display text-lg font-bold text-[#1A2332] border-l-4 border-[#1A6DB5] pl-3 mb-2">
                  Structural Audit Request Form
                </h3>

                {submitError && (
                  <div className="flex items-center gap-2.5 text-red-500 text-xs bg-red-50 p-4 rounded-xl border border-red-200">
                    <AlertCircle className="w-4 h-4" />
                    <span>{submitError}</span>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-500">Full Name</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="Enter your name..."
                      className={`border px-4 py-3 text-xs rounded-xl outline-none transition-all ${
                        errors.name ? 'border-red-500 bg-red-50/20' : 'border-slate-200 focus:border-[#1A6DB5]'
                      }`}
                    />
                    {errors.name && <span className="text-[10px] font-bold text-red-500">{errors.name}</span>}
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-500">Mobile Number</label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="e.g. +91 9876543210"
                      className={`border px-4 py-3 text-xs rounded-xl outline-none transition-all ${
                        errors.phone ? 'border-red-500 bg-red-50/20' : 'border-slate-200 focus:border-[#1A6DB5]'
                      }`}
                    />
                    {errors.phone && <span className="text-[10px] font-bold text-red-500">{errors.phone}</span>}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-500">Email Address</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="e.g. yourname@gmail.com"
                      className={`border px-4 py-3 text-xs rounded-xl outline-none transition-all ${
                        errors.email ? 'border-red-500 bg-red-50/20' : 'border-slate-200 focus:border-[#1A6DB5]'
                      }`}
                    />
                    {errors.email && <span className="text-[10px] font-bold text-red-500">{errors.email}</span>}
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-500">Construction Location (Chennai Suburbs)</label>
                    <input
                      type="text"
                      name="location"
                      value={formData.location}
                      onChange={handleInputChange}
                      placeholder="e.g. Tambaram, OMR, Velachery"
                      className={`border px-4 py-3 text-xs rounded-xl outline-none transition-all ${
                        errors.location ? 'border-red-500 bg-red-50/20' : 'border-slate-200 focus:border-[#1A6DB5]'
                      }`}
                    />
                    {errors.location && <span className="text-[10px] font-bold text-red-500">{errors.location}</span>}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-500">Proposed Built-up Area (sq.ft)</label>
                    <input
                      type="number"
                      name="area"
                      value={formData.area}
                      onChange={handleInputChange}
                      placeholder="e.g. 2400"
                      className={`border px-4 py-3 text-xs rounded-xl outline-none transition-all ${
                        errors.area ? 'border-red-500 bg-red-50/20' : 'border-slate-200 focus:border-[#1A6DB5]'
                      }`}
                    />
                    {errors.area && <span className="text-[10px] font-bold text-red-500">{errors.area}</span>}
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-500">Construction Profile</label>
                    <select
                      name="type"
                      value={formData.type}
                      onChange={handleInputChange}
                      className="border border-slate-200 focus:border-[#1A6DB5] px-4 py-3 text-xs rounded-xl bg-white text-slate-700 outline-none"
                    >
                      <option value="Luxury Villa">Luxury Villa (Standard/Premium)</option>
                      <option value="Turnkey Independent Home">Turnkey Independent Home</option>
                      <option value="Duplex Block">Duplex Residential Block</option>
                      <option value="Commercial Complex">Commercial/Consultation</option>
                    </select>
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-500">Special Requirements (Optional)</label>
                  <textarea
                    name="message"
                    rows={4}
                    value={formData.message}
                    onChange={handleInputChange}
                    placeholder="Provide any soil type hints, expected floor layouts, or design preferences..."
                    className="border border-slate-200 focus:border-[#1A6DB5] p-4 text-xs rounded-xl outline-none text-slate-700"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full sm:w-auto self-start px-8 py-3.5 bg-[#1A6DB5] hover:bg-[#1558a0] disabled:bg-slate-300 text-white font-bold rounded-xl text-xs tracking-wider uppercase transition-all shadow-md shadow-[#1A6DB5]/20 flex items-center justify-center gap-2 mt-2"
                >
                  {isSubmitting ? <span>Logging Parameters...</span> : <span>Submit Audit Request</span>}
                  <Send className="w-3.5 h-3.5" />
                </button>
              </form>
            )}
          </div>

          {/* Right: Contact details and Google Maps */}
          <div className="lg:col-span-5 flex flex-col gap-8">
            
            {/* Contact Parameters */}
            <div className="bg-white border border-slate-100 rounded-3xl p-6 sm:p-8 shadow-premium flex flex-col gap-6">
              <h3 className="font-display text-sm font-bold text-slate-400 uppercase tracking-widest">
                Lifehut Headquarters
              </h3>

              <div className="flex flex-col gap-4">
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-[#1A6DB5] flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="text-xs font-bold text-[#1A2332]">Corporate Office</div>
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                      {address}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Phone className="w-5 h-5 text-[#1A6DB5] flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="text-xs font-bold text-[#1A2332]">Site Direct Hotlines</div>
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                      <a href={`tel:${phone}`} className="hover:text-[#1A6DB5] transition-colors">{phone}</a>
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Mail className="w-5 h-5 text-[#1A6DB5] flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="text-xs font-bold text-[#1A2332]">Executive Email</div>
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                      <a href={`mailto:${email}`} className="hover:text-[#1A6DB5] transition-colors">{email}</a>
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Clock className="w-5 h-5 text-[#1A6DB5] flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="text-xs font-bold text-[#1A2332]">Office Operation Hours</div>
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                      Monday – Saturday: 9:00 AM – 7:00 PM <br />
                      Sundays: Structural Inspections only (By Appointment)
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Google Map IFrame pointed to exact address */}
            <div className="rounded-3xl overflow-hidden border border-slate-100 shadow-premium h-64 bg-slate-100 relative">
              <iframe
                title="Lifehut Developers HQ Location Map"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3888.6310237936573!2d80.18349277507567!3d12.931448687380186!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1m3!1d1135!2sLifehut%20Developers%2C%20Keelkattalai%2C%20Chennai!5e0!3m2!1sen!2sin!4v1784000000000"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen={false}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>

          </div>

        </div>
      </div>

      {/* FLOATING ACTION PANELS FOR CONVERSIONS */}
      <div className="fixed bottom-6 right-6 z-40 flex flex-col gap-3">
        {/* WhatsApp floating button */}
        <a
          href="https://api.whatsapp.com/send?phone=918072163330&text=Hi%20Lifehut%20Developers%20Team!%20I%20am%20interested%20in%20a%20luxury%20villa%20construction%20consultation."
          target="_blank"
          rel="noreferrer"
          className="bg-[#25D366] hover:bg-[#20ba5a] text-white p-4 rounded-full shadow-2xl flex items-center justify-center transform hover:scale-110 transition-all"
          title="Direct WhatsApp Site Lead"
          aria-label="Direct WhatsApp Site Lead"
        >
          <MessageCircle className="w-6 h-6" />
        </a>
      </div>

    </div>
  );
};
