import React from 'react';
import { useTenant } from '../context/TenantContext';
import { Award, Users, Globe, Shield } from 'lucide-react';

export const AboutPage = ({ viewport = 'desktop' }) => {
  const { tenant } = useTenant();

  const isMobile = viewport === 'mobile';

  const aboutConfig = tenant.pages?.find((p) => p.slug === 'about');
  const storySection = aboutConfig?.sections?.find((s) => s.type === 'story') || {
    title: `About ${tenant.name}`,
    subtitle: 'Crafted with integrity, delivered with speed.',
    content: `${tenant.name} was established with a clear goal: to eliminate middlemen and deliver premium quality directly to our customers. Leveraging zero-build multi-tenant cloud architecture, our storefront updates in single-digit milliseconds without heavy infrastructure overhead.`,
    imageUrl: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1200&q=80',
  };

  const statsSection = aboutConfig?.sections?.find((s) => s.type === 'stats')?.data || {
    stat1: { number: '15,000+', label: 'Orders Fulfilled' },
    stat2: { number: '99.8%', label: 'Customer Satisfaction' },
    stat3: { number: '< 50ms', label: 'Edge Catalog Latency' },
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 sm:py-16">
      {/* Hero / Story */}
      <div className={`grid items-center mb-12 sm:mb-16 ${
        isMobile ? 'grid-cols-1 gap-6' : 'grid-cols-1 md:grid-cols-2 gap-12'
      }`}>
        <div>
          <span 
            style={{ color: tenant.theme?.primaryColor || '#3B82F6' }}
            className="text-xs font-bold uppercase tracking-wider mb-2 block"
          >
            Our Mission & Roots
          </span>
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight mb-3 sm:mb-4">
            {storySection.title}
          </h1>
          <h2 className="text-sm sm:text-base font-medium opacity-80 mb-4 sm:mb-6">
            {storySection.subtitle}
          </h2>
          <p className="text-xs sm:text-sm opacity-70 leading-relaxed mb-6 whitespace-pre-line">
            {storySection.content}
          </p>

          <div className="flex items-center space-x-4 pt-4 border-t border-slate-800/40 text-xs">
            <div className="flex items-center space-x-1.5">
              <Shield className="w-4 h-4 text-emerald-400" />
              <span>Direct Verification</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <Globe className="w-4 h-4 text-indigo-400" />
              <span>Global Dispatch</span>
            </div>
          </div>
        </div>

        <div className="relative">
          <div 
            style={{ borderRadius: tenant.theme?.borderRadius || '0.75rem' }}
            className="overflow-hidden shadow-2xl border border-slate-800"
          >
            <img
              src={storySection.imageUrl}
              alt={storySection.title}
              className="w-full h-64 sm:h-96 object-cover"
            />
          </div>
          <div 
            style={{ 
              backgroundColor: tenant.theme?.primaryColor || '#3B82F6',
              borderRadius: tenant.theme?.borderRadius || '0.75rem'
            }}
            className="absolute -bottom-4 -right-4 p-3 sm:p-4 text-white shadow-xl hidden sm:block text-xs font-bold"
          >
            <span>Verified Merchant</span>
          </div>
        </div>
      </div>

      {/* Stats Counter */}
      <div className={`grid gap-4 sm:gap-6 p-6 sm:p-8 bg-slate-900/40 border border-slate-800/80 rounded-2xl text-center ${
        isMobile ? 'grid-cols-1' : 'grid-cols-1 sm:grid-cols-3'
      }`}>
        {Object.entries(statsSection).map(([key, item]) => (
          <div key={key} className="p-3 sm:p-4">
            <div 
              style={{ color: tenant.theme?.primaryColor || '#3B82F6' }}
              className="text-2xl sm:text-4xl font-black mb-1 font-mono"
            >
              {item.number}
            </div>
            <div className="text-xs text-slate-400 font-medium">
              {item.label}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
