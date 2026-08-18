import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Send, RotateCcw, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import {
  ContactFormData,
  NEED_OPTIONS,
  COUNTRIES,
  INDIAN_STATES,
  INTERNATIONAL_REGIONS,
  sendEnquiryToGoogleSheets
} from '../utils/googleSheets';

const initialFormState: ContactFormData = {
  fullName: '',
  phone: '',
  email: '',
  whatDoYouNeed: '',
  country: 'India',
  state: 'Tamil Nadu',
  requirement: ''
};

interface GetInTouchFormProps {
  className?: string;
  onSuccess?: () => void;
}

export const GetInTouchForm: React.FC<GetInTouchFormProps> = ({ className = '', onSuccess }) => {
  const [formData, setFormData] = useState<ContactFormData>(initialFormState);
  const [errors, setErrors] = useState<Partial<Record<keyof ContactFormData, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState('');

  // Dynamically get state/region list based on selected country
  const stateOptions = formData.country === 'India'
    ? INDIAN_STATES
    : (INTERNATIONAL_REGIONS[formData.country] || ['General Region', 'Other Region']);

  const handleCountryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedCountry = e.target.value;
    const defaultState = selectedCountry === 'India'
      ? 'Tamil Nadu'
      : (INTERNATIONAL_REGIONS[selectedCountry]?.[0] || 'Other Region');

    setFormData(prev => ({
      ...prev,
      country: selectedCountry,
      state: defaultState
    }));

    if (errors.country) {
      setErrors(prev => ({ ...prev, country: undefined }));
    }
  };

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof ContactFormData, string>> = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full Name is required';
    } else if (formData.fullName.trim().length < 2) {
      newErrors.fullName = 'Please enter a valid full name';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Mobile Number is required';
    } else if (formData.phone.replace(/[^0-9]/g, '').length < 7) {
      newErrors.phone = 'Please enter a valid mobile / phone number (min 7 digits)';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email Address is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.whatDoYouNeed) {
      newErrors.whatDoYouNeed = 'Please select what service you need';
    }

    if (!formData.country) {
      newErrors.country = 'Country is required';
    }

    if (!formData.state) {
      newErrors.state = 'State / Region is required';
    }

    if (!formData.requirement.trim()) {
      newErrors.requirement = 'Please tell us about your requirement';
    } else if (formData.requirement.trim().length < 5) {
      newErrors.requirement = 'Please provide a brief description of your requirement';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    setSubmitError('');

    try {
      await sendEnquiryToGoogleSheets(formData);
      setSubmitSuccess(true);
      if (onSuccess) onSuccess();
    } catch (err) {
      console.error('Submission error:', err);
      setSubmitError('Unable to send at the moment. Please reach us via WhatsApp or Phone.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setFormData(initialFormState);
    setErrors({});
    setSubmitError('');
  };

  const handleInputChange = (field: keyof ContactFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  return (
    <div className={`bg-white rounded-3xl border border-grey-200 shadow-card p-6 sm:p-9 ${className}`}>
      {submitSuccess ? (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="py-10 text-center flex flex-col items-center gap-4"
        >
          <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-200 shadow-sm">
            <CheckCircle2 className="w-9 h-9" />
          </div>
          <h3 className="font-display text-2xl sm:text-3xl font-extrabold text-ink">
            Requirement Submitted!
          </h3>
          <p className="text-grey-600 text-sm sm:text-base max-w-md leading-relaxed">
            Thank you <span className="font-semibold text-ink">{formData.fullName}</span>. Your requirement has been forwarded to our engineering team. We will call you at <span className="font-semibold text-ink">{formData.phone}</span> or email at <span className="font-semibold text-ink">{formData.email}</span> shortly.
          </p>
          <div className="flex flex-wrap gap-3 mt-4">
            <button
              type="button"
              onClick={() => {
                setSubmitSuccess(false);
                handleReset();
              }}
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-700 hover:bg-blue-900 text-white font-display font-semibold text-sm rounded-full shadow-soft hover:shadow-lift transition-all cursor-pointer"
            >
              <span>Submit Another Requirement</span>
            </button>
          </div>
        </motion.div>
      ) : (
        <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
          <div className="flex items-center justify-between border-b border-grey-100 pb-3">
            <h3 className="font-display text-lg sm:text-xl font-bold text-ink">
              Send Your Requirement
            </h3>
            <span className="text-xs text-grey-600">
              <span className="text-rose-600 font-bold">*</span> Required fields
            </span>
          </div>

          {submitError && (
            <div className="flex items-center gap-2.5 text-rose-700 text-xs sm:text-sm bg-rose-50 p-4 rounded-xl border border-rose-200">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{submitError}</span>
            </div>
          )}

          {/* Row 1: Full Name */}
          <div>
            <label htmlFor="contact-fullName" className="block text-xs sm:text-sm font-display font-semibold text-ink mb-1.5">
              Full Name <span className="text-rose-600 font-bold">*</span>
            </label>
            <input
              id="contact-fullName"
              name="fullName"
              type="text"
              required
              autoComplete="name"
              value={formData.fullName}
              onChange={(e) => handleInputChange('fullName', e.target.value)}
              placeholder="Enter your full name"
              className={`w-full rounded-xl border px-4 py-3 text-ink placeholder:text-grey-400 outline-none transition-colors text-sm ${
                errors.fullName
                  ? 'border-rose-500 bg-rose-50/40 focus:border-rose-600 focus:ring-2 focus:ring-rose-100'
                  : 'border-grey-200 bg-grey-50 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100'
              }`}
            />
            {errors.fullName && (
              <p className="mt-1 text-xs font-medium text-rose-600">{errors.fullName}</p>
            )}
          </div>

          {/* Row 2: Mobile Number & Email Address */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label htmlFor="contact-phone" className="block text-xs sm:text-sm font-display font-semibold text-ink mb-1.5">
                Mobile Number <span className="text-rose-600 font-bold">*</span>
              </label>
              <input
                id="contact-phone"
                name="phone"
                type="tel"
                required
                autoComplete="tel"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                placeholder="+91 98765 43210"
                className={`w-full rounded-xl border px-4 py-3 text-ink placeholder:text-grey-400 outline-none transition-colors text-sm ${
                  errors.phone
                    ? 'border-rose-500 bg-rose-50/40 focus:border-rose-600 focus:ring-2 focus:ring-rose-100'
                    : 'border-grey-200 bg-grey-50 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100'
                }`}
              />
              {errors.phone && (
                <p className="mt-1 text-xs font-medium text-rose-600">{errors.phone}</p>
              )}
            </div>

            <div>
              <label htmlFor="contact-email" className="block text-xs sm:text-sm font-display font-semibold text-ink mb-1.5">
                Email Address <span className="text-rose-600 font-bold">*</span>
              </label>
              <input
                id="contact-email"
                name="email"
                type="email"
                required
                autoComplete="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                placeholder="you@example.com"
                className={`w-full rounded-xl border px-4 py-3 text-ink placeholder:text-grey-400 outline-none transition-colors text-sm ${
                  errors.email
                    ? 'border-rose-500 bg-rose-50/40 focus:border-rose-600 focus:ring-2 focus:ring-rose-100'
                    : 'border-grey-200 bg-grey-50 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100'
                }`}
              />
              {errors.email && (
                <p className="mt-1 text-xs font-medium text-rose-600">{errors.email}</p>
              )}
            </div>
          </div>

          {/* Row 2: What do you need? Dropdown */}
          <div>
            <label htmlFor="contact-whatDoYouNeed" className="block text-xs sm:text-sm font-display font-semibold text-ink mb-1.5">
              What do you need? <span className="text-rose-600 font-bold">*</span>
            </label>
            <div className="relative">
              <select
                id="contact-whatDoYouNeed"
                name="whatDoYouNeed"
                required
                value={formData.whatDoYouNeed}
                onChange={(e) => handleInputChange('whatDoYouNeed', e.target.value)}
                className={`w-full rounded-xl border px-4 py-3 text-ink appearance-none outline-none transition-colors text-sm cursor-pointer ${
                  errors.whatDoYouNeed
                    ? 'border-rose-500 bg-rose-50/40 focus:border-rose-600 focus:ring-2 focus:ring-rose-100'
                    : 'border-grey-200 bg-grey-50 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100'
                }`}
              >
                <option value="" disabled>-- Select what service you need --</option>
                {NEED_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-grey-500">
                <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
            {errors.whatDoYouNeed && (
              <p className="mt-1 text-xs font-medium text-rose-600">{errors.whatDoYouNeed}</p>
            )}
          </div>

          {/* Row 3: Country Dropdown & Your State Dropdown */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label htmlFor="contact-country" className="block text-xs sm:text-sm font-display font-semibold text-ink mb-1.5">
                Country <span className="text-rose-600 font-bold">*</span>
              </label>
              <div className="relative">
                <select
                  id="contact-country"
                  name="country"
                  required
                  value={formData.country}
                  onChange={handleCountryChange}
                  className={`w-full rounded-xl border px-4 py-3 text-ink appearance-none outline-none transition-colors text-sm cursor-pointer ${
                    errors.country
                      ? 'border-rose-500 bg-rose-50/40 focus:border-rose-600 focus:ring-2 focus:ring-rose-100'
                      : 'border-grey-200 bg-grey-50 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100'
                  }`}
                >
                  {COUNTRIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-grey-500">
                  <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
              {errors.country && (
                <p className="mt-1 text-xs font-medium text-rose-600">{errors.country}</p>
              )}
            </div>

            <div>
              <label htmlFor="contact-state" className="block text-xs sm:text-sm font-display font-semibold text-ink mb-1.5">
                Your State <span className="text-rose-600 font-bold">*</span>
              </label>
              <div className="relative">
                <select
                  id="contact-state"
                  name="state"
                  required
                  value={formData.state}
                  onChange={(e) => handleInputChange('state', e.target.value)}
                  className={`w-full rounded-xl border px-4 py-3 text-ink appearance-none outline-none transition-colors text-sm cursor-pointer ${
                    errors.state
                      ? 'border-rose-500 bg-rose-50/40 focus:border-rose-600 focus:ring-2 focus:ring-rose-100'
                      : 'border-grey-200 bg-grey-50 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100'
                  }`}
                >
                  {stateOptions.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-grey-500">
                  <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
              {errors.state && (
                <p className="mt-1 text-xs font-medium text-rose-600">{errors.state}</p>
              )}
            </div>
          </div>

          {/* Row 4: Tell us about your requirement */}
          <div>
            <label htmlFor="contact-requirement" className="block text-xs sm:text-sm font-display font-semibold text-ink mb-1.5">
              Tell us about your requirement <span className="text-rose-600 font-bold">*</span>
            </label>
            <textarea
              id="contact-requirement"
              name="requirement"
              required
              rows={4}
              value={formData.requirement}
              onChange={(e) => handleInputChange('requirement', e.target.value)}
              placeholder="Plot size, site location, timeline, budget, or specific engineering requirements..."
              className={`w-full rounded-xl border px-4 py-3 text-ink placeholder:text-grey-400 outline-none transition-colors resize-y text-sm ${
                errors.requirement
                  ? 'border-rose-500 bg-rose-50/40 focus:border-rose-600 focus:ring-2 focus:ring-rose-100'
                  : 'border-grey-200 bg-grey-50 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100'
              }`}
            />
            {errors.requirement && (
              <p className="mt-1 text-xs font-medium text-rose-600">{errors.requirement}</p>
            )}
          </div>

          {/* Actions: Submit & Reset */}
          <div className="pt-2 flex flex-wrap items-center gap-4">
            <button
              id="contact-submit-btn"
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center justify-center gap-2 bg-blue-700 hover:bg-blue-900 active:bg-blue-950 text-white font-display font-semibold px-8 py-3.5 rounded-full shadow-lift hover:-translate-y-0.5 transition-all duration-200 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed text-sm sm:text-base"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Submitting...</span>
                </>
              ) : (
                <>
                  <span>Submit</span>
                  <Send className="w-4 h-4" />
                </>
              )}
            </button>

            <button
              id="contact-reset-btn"
              type="button"
              disabled={isSubmitting}
              onClick={handleReset}
              className="inline-flex items-center justify-center gap-2 bg-grey-100 hover:bg-grey-200 active:bg-grey-300 text-grey-700 font-display font-semibold px-6 py-3.5 rounded-full border border-grey-300 transition-colors cursor-pointer text-sm sm:text-base"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Reset</span>
            </button>
          </div>
        </form>
      )}
    </div>
  );
};
