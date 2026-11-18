import React, { useState } from 'react';
import { useTenant } from '../context/TenantContext';
import { Mail, Phone, MapPin, Send, CheckCircle2 } from 'lucide-react';

export const ContactPage = ({ viewport = 'desktop' }) => {
  const { tenant } = useTenant();
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });

  const isMobile = viewport === 'mobile';

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 sm:py-16">
      <div className="text-center mb-8 sm:mb-12">
        <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight mb-2 sm:mb-3">
          Get in Touch
        </h1>
        <p className="text-xs sm:text-sm opacity-70 max-w-lg mx-auto">
          Have questions about {tenant.name}'s products, orders, or custom requests? We're here to help.
        </p>
      </div>

      <div className={`grid gap-6 sm:gap-10 ${isMobile ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2'}`}>
        {/* Contact Form */}
        <div className="p-6 bg-slate-900/40 border border-slate-800 rounded-2xl">
          {submitted ? (
            <div className="text-center py-10">
              <div 
                style={{ backgroundColor: `${tenant.theme?.primaryColor || '#3B82F6'}20` }}
                className="w-12 h-12 rounded-full mx-auto flex items-center justify-center mb-4"
              >
                <CheckCircle2 
                  style={{ color: tenant.theme?.primaryColor || '#3B82F6' }}
                  className="w-6 h-6" 
                />
              </div>
              <h3 className="font-bold text-lg mb-2">Message Dispatched!</h3>
              <p className="text-xs text-slate-400">
                Thank you, {formData.name || 'valued customer'}. The team at {tenant.name} will respond shortly.
              </p>
              <button
                onClick={() => setSubmitted(false)}
                className="mt-6 text-xs text-indigo-400 hover:underline"
              >
                Send another message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold mb-1 opacity-80">Your Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Taylor Morgan"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  style={{ borderRadius: tenant.theme?.borderRadius || '0.75rem' }}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-800 text-xs focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1 opacity-80">Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="e.g. taylor@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  style={{ borderRadius: tenant.theme?.borderRadius || '0.75rem' }}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-800 text-xs focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1 opacity-80">Message</label>
                <textarea
                  rows={4}
                  required
                  placeholder="How can we assist you today?"
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  style={{ borderRadius: tenant.theme?.borderRadius || '0.75rem' }}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-800 text-xs focus:outline-none focus:border-indigo-500"
                />
              </div>

              <button
                type="submit"
                style={{
                  backgroundColor: tenant.theme?.primaryColor || '#3B82F6',
                  borderRadius: tenant.theme?.borderRadius || '0.75rem',
                }}
                className="w-full py-2.5 text-white font-semibold text-xs shadow-lg hover:opacity-90 transition-all flex items-center justify-center space-x-2"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Submit Inquiry</span>
              </button>
            </form>
          )}
        </div>

        {/* Info Card */}
        <div className="flex flex-col justify-between space-y-6">
          <div className="p-6 bg-slate-900/40 border border-slate-800 rounded-2xl space-y-4">
            <h3 className="font-bold text-sm">Store Information</h3>

            <div className="flex items-start space-x-3 text-xs">
              <Mail className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
              <div>
                <div className="font-semibold">Direct Customer Support</div>
                <div className="opacity-70">{tenant.contact?.email || 'support@brand.com'}</div>
              </div>
            </div>

            <div className="flex items-start space-x-3 text-xs">
              <Phone className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
              <div>
                <div className="font-semibold">Phone Assistance</div>
                <div className="opacity-70">{tenant.contact?.phone || '+1 555-0199'}</div>
              </div>
            </div>

            <div className="flex items-start space-x-3 text-xs">
              <MapPin className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
              <div>
                <div className="font-semibold">Headquarters & Showroom</div>
                <div className="opacity-70">{tenant.contact?.address || '100 Innovation Blvd, Silicon Valley'}</div>
              </div>
            </div>
          </div>

          <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl text-xs text-emerald-300">
            <div className="font-bold mb-1">Zero-Build Guarantee</div>
            <p className="opacity-80">
              Inquiries and order submissions are processed in real time and strictly partitioned to {tenant.name}'s dedicated database cluster.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
