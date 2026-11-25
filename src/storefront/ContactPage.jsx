import React from 'react';
import { useTenant } from '../context/TenantContext';
import { 
  Mail, 
  Phone, 
  MapPin, 
  ExternalLink, 
  Sparkles, 
  Clock, 
  Globe,
  CheckCircle2
} from 'lucide-react';
import { GitHubIcon, LinkedInIcon, TwitterIcon, InstagramIcon } from '../components/SocialIcons';

export const ContactPage = ({ viewport = 'desktop' }) => {
  const { tenant } = useTenant();
  const isMobile = viewport === 'mobile';

  const contactPage = tenant?.pages?.find((p) => p.slug === 'contact');
  const contactSection = contactPage?.sections?.[0];
  const pageTitle = contactSection?.title || contactPage?.title || 'Get in Touch';
  const pageSubtitle = contactSection?.subtitle || `Have questions about ${tenant?.name || 'our'} projects, services, or collaboration opportunities? Connect directly with us.`;

  const primaryEmail = tenant?.footer?.contactEmail || tenant?.contact?.email || 'contact@brand.com';
  const primaryPhone = tenant?.footer?.contactPhone || tenant?.contact?.phone || '+1 (555) 019-2834';
  const primaryAddress = tenant?.footer?.contactAddress || tenant?.contact?.address || '100 Innovation Boulevard, Silicon Valley, CA';
  const socials = tenant?.footer?.socials || tenant?.contact?.socials || {};

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 sm:py-16 animate-fadeIn">
      {/* Page Header */}
      <div className="text-center mb-10 sm:mb-14">
        <span 
          style={{ color: tenant.theme?.primaryColor || '#3B82F6' }}
          className="text-xs font-bold uppercase tracking-wider mb-2 block"
        >
          Direct Communication &bull; Zero Delay
        </span>
        <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight mb-3">
          {pageTitle}
        </h1>
        <p className="text-xs sm:text-sm opacity-70 max-w-xl mx-auto leading-relaxed">
          {pageSubtitle}
        </p>
      </div>

      {/* Main Direct Contact Cards Grid */}
      <div className={`grid gap-4 sm:gap-6 ${isMobile ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-3'} mb-8`}>
        {/* 1. Direct Email */}
        <div className="p-6 bg-slate-900/40 border border-slate-800 rounded-2xl flex flex-col justify-between hover:border-slate-700 transition-all">
          <div>
            <div 
              style={{ backgroundColor: `${tenant.theme?.primaryColor || '#3B82F6'}20`, color: tenant.theme?.primaryColor || '#3B82F6' }}
              className="w-10 h-10 rounded-xl flex items-center justify-center mb-4"
            >
              <Mail className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-sm text-white mb-1">Direct Email</h3>
            <p className="text-xs text-slate-400 mb-4">
              Send an email directly for quotes, inquiries, and proposals.
            </p>
            <div className="font-mono text-xs text-slate-200 truncate mb-4 select-all">
              {primaryEmail}
            </div>
          </div>
          <a
            href={`mailto:${primaryEmail}?subject=Inquiry%20via%20${encodeURIComponent(tenant.name)}`}
            style={{
              backgroundColor: tenant.theme?.primaryColor || '#3B82F6',
              borderRadius: tenant.theme?.borderRadius || '0.75rem',
            }}
            className="w-full py-2.5 px-3 text-white text-xs font-semibold flex items-center justify-center space-x-1.5 hover:opacity-90 transition-opacity shadow text-center cursor-pointer"
          >
            <span>Send Email Directly</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>

        {/* 2. Direct Phone / Call */}
        <div className="p-6 bg-slate-900/40 border border-slate-800 rounded-2xl flex flex-col justify-between hover:border-slate-700 transition-all">
          <div>
            <div 
              style={{ backgroundColor: `${tenant.theme?.primaryColor || '#3B82F6'}20`, color: tenant.theme?.primaryColor || '#3B82F6' }}
              className="w-10 h-10 rounded-xl flex items-center justify-center mb-4"
            >
              <Phone className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-sm text-white mb-1">Call / WhatsApp</h3>
            <p className="text-xs text-slate-400 mb-4">
              Instant voice communication for immediate consultations.
            </p>
            <div className="font-mono text-xs text-slate-200 truncate mb-4 select-all">
              {primaryPhone}
            </div>
          </div>
          <a
            href={`tel:${primaryPhone.replace(/[^0-9+]/g, '')}`}
            style={{
              borderColor: `${tenant.theme?.primaryColor || '#3B82F6'}80`,
              color: tenant.theme?.primaryColor || '#3B82F6',
              borderRadius: tenant.theme?.borderRadius || '0.75rem',
            }}
            className="w-full py-2.5 px-3 bg-slate-900 border text-xs font-semibold flex items-center justify-center space-x-1.5 hover:bg-slate-800 transition-colors shadow text-center cursor-pointer"
          >
            <span>Call Directly</span>
            <Phone className="w-3.5 h-3.5" />
          </a>
        </div>

        {/* 3. Location / Office */}
        <div className="p-6 bg-slate-900/40 border border-slate-800 rounded-2xl flex flex-col justify-between hover:border-slate-700 transition-all">
          <div>
            <div 
              style={{ backgroundColor: `${tenant.theme?.primaryColor || '#3B82F6'}20`, color: tenant.theme?.primaryColor || '#3B82F6' }}
              className="w-10 h-10 rounded-xl flex items-center justify-center mb-4"
            >
              <MapPin className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-sm text-white mb-1">Headquarters / Studio</h3>
            <p className="text-xs text-slate-400 mb-4">
              Physical office, showroom, or studio location.
            </p>
            <div className="text-xs text-slate-200 line-clamp-2 mb-4 leading-relaxed">
              {primaryAddress}
            </div>
          </div>
          <a
            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(primaryAddress)}`}
            target="_blank"
            rel="noopener noreferrer"
            style={{ borderRadius: tenant.theme?.borderRadius || '0.75rem' }}
            className="w-full py-2.5 px-3 bg-slate-800 border border-slate-700 text-slate-200 hover:text-white text-xs font-semibold flex items-center justify-center space-x-1.5 hover:bg-slate-700 transition-colors shadow text-center cursor-pointer"
          >
            <span>View on Google Maps</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>

      {/* Social Profiles & Availability Banner */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        {/* Availability & Response Time */}
        <div className="p-5 bg-slate-900/30 border border-slate-800 rounded-2xl flex items-start space-x-3.5">
          <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400 shrink-0 mt-0.5">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2 mb-1">
              <h4 className="font-bold text-sm text-white">Availability & Status</h4>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-emerald-500/20 text-emerald-400">
                ACTIVE
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Currently accepting new client projects, commissions, and partnership opportunities. All inquiries answered directly within 24 business hours.
            </p>
          </div>
        </div>

        {/* Connect on Social Networks */}
        <div className="p-5 bg-slate-900/30 border border-slate-800 rounded-2xl flex flex-col justify-between">
          <div>
            <h4 className="font-bold text-sm text-white mb-1">Social Profiles & Portfolios</h4>
            <p className="text-xs text-slate-400 mb-3">
              Follow our latest work, open-source repositories, and visual updates.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2 pt-1">
            {socials.github && (
              <a
                href={socials.github}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded-xl text-xs font-medium flex items-center space-x-1.5 transition-colors border border-slate-700/60"
              >
                <GitHubIcon className="w-3.5 h-3.5" />
                <span>GitHub</span>
              </a>
            )}
            {socials.linkedin && (
              <a
                href={socials.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded-xl text-xs font-medium flex items-center space-x-1.5 transition-colors border border-slate-700/60"
              >
                <LinkedInIcon className="w-3.5 h-3.5" />
                <span>LinkedIn</span>
              </a>
            )}
            {socials.twitter && (
              <a
                href={socials.twitter}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded-xl text-xs font-medium flex items-center space-x-1.5 transition-colors border border-slate-700/60"
              >
                <TwitterIcon className="w-3.5 h-3.5" />
                <span>Twitter / X</span>
              </a>
            )}
            {socials.instagram && (
              <a
                href={socials.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded-xl text-xs font-medium flex items-center space-x-1.5 transition-colors border border-slate-700/60"
              >
                <InstagramIcon className="w-3.5 h-3.5" />
                <span>Instagram</span>
              </a>
            )}
            {socials.website && (
              <a
                href={socials.website}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded-xl text-xs font-medium flex items-center space-x-1.5 transition-colors border border-slate-700/60"
              >
                <Globe className="w-3.5 h-3.5" />
                <span>Website</span>
              </a>
            )}
            {!Object.values(socials).some(Boolean) && (
              <span className="text-[11px] text-slate-500 italic">
                Add your social profile links in the Studio Footer settings to display them here.
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
