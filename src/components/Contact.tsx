import React from 'react';
import { Mail, Phone, MapPin, Clock, MessageCircle } from 'lucide-react';
import { motion } from 'motion/react';
import { GetInTouchForm } from './GetInTouchForm';

interface ContactProps {
  address: string;
  phone: string;
  email: string;
}

export const Contact: React.FC<ContactProps> = ({ address, phone, email }) => {
  return (
    <div className="bg-grey-50 min-h-screen pt-6 sm:pt-8 pb-12 sm:pb-16 px-6 lg:px-8 text-left">
      <div className="max-w-7xl mx-auto">
        
        {/* Header Intro */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-8 sm:mb-12 max-w-3xl mx-auto"
        >
          <p className="font-display font-bold text-blue-700 text-sm tracking-wide uppercase">
            Get In Touch
          </p>
          <h1 className="mt-3 font-display font-extrabold text-3xl sm:text-4xl lg:text-5xl text-ink tracking-tight text-balance">
            Let's Talk About Your <span className="text-blue-700">Requirement</span>
          </h1>
          <p className="mt-4 text-grey-600 text-base sm:text-lg leading-relaxed">
            Submit your project details for an on-site review, BOQ estimation, turnkey construction consultation, or tender documentation.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left: Contact Form Column */}
          <div className="lg:col-span-7">
            <GetInTouchForm />
          </div>

          {/* Right: Contact details and Google Maps */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            
            <div className="bg-white border border-grey-200 rounded-3xl p-7 sm:p-8 shadow-card flex flex-col gap-6">
              <h3 className="font-display text-xs font-bold text-grey-500 uppercase tracking-widest">
                Lifehut Office &amp; Contact Info
              </h3>

              <div className="flex flex-col gap-4">
                <div className="flex items-start gap-3.5">
                  <MapPin className="w-5 h-5 text-blue-700 flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="text-sm font-display font-bold text-ink">Corporate Office</div>
                    <p className="text-xs sm:text-sm text-grey-600 mt-1 leading-relaxed">
                      {address}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3.5">
                  <Phone className="w-5 h-5 text-blue-700 flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="text-sm font-display font-bold text-ink">Phone / WhatsApp</div>
                    <p className="text-xs sm:text-sm text-grey-600 mt-1">
                      <a href={`tel:${phone.replace(/[^0-9+]/g, '')}`} className="hover:text-blue-700 transition-colors font-medium">{phone}</a>
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3.5">
                  <Mail className="w-5 h-5 text-blue-700 flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="text-sm font-display font-bold text-ink">Email</div>
                    <p className="text-xs sm:text-sm text-grey-600 mt-1">
                      <a href={`mailto:${email}`} className="hover:text-blue-700 transition-colors font-medium">{email}</a>
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3.5">
                  <Clock className="w-5 h-5 text-blue-700 flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="text-sm font-display font-bold text-ink">Working Hours</div>
                    <p className="text-xs sm:text-sm text-grey-600 mt-1">
                      Monday – Saturday: 9:00 AM – 6:30 PM
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-grey-100 flex flex-wrap gap-3">
                <a
                  href={`https://wa.me/918072163330?text=${encodeURIComponent('Hello Lifehut Developers, I would like to inquire about your services.')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-display font-bold px-4 py-2.5 rounded-xl transition-colors shadow-soft"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Chat on WhatsApp</span>
                </a>

                <a
                  href="https://www.google.com/maps/place/Lifehut+Developers/@13.1168564,80.1439659,17z/data=!3m1!4b1!4m6!3m5!1s0x3a5263bc0dd15075:0x9acca41c382bd7f0!8m2!3d13.1168564!4d80.1439659!16s%2Fg%2F11l33l__bz?hl=en-GB&entry=ttu"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-grey-100 hover:bg-grey-200 text-ink text-xs font-display font-semibold px-4 py-2.5 rounded-xl transition-colors border border-grey-200"
                >
                  <MapPin className="w-4 h-4 text-blue-700" />
                  <span>View on Google Maps</span>
                </a>
              </div>
            </div>

            {/* Google Map */}
            <div className="rounded-3xl overflow-hidden border border-grey-200 shadow-card h-72 bg-grey-100 relative">
              <iframe
                title="Lifehut Developers Google Maps Location"
                src="https://maps.google.com/maps?q=13.1168564,80.1439659&hl=en&z=16&output=embed"
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
    </div>
  );
};
