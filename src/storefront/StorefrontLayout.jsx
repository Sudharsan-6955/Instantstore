import React, { useState } from 'react';
import { useTenant } from '../context/TenantContext';
import { HomePage } from './HomePage';
import { CatalogPage } from './CatalogPage';
import { AboutPage } from './AboutPage';
import { ContactPage } from './ContactPage';
import { CustomPage } from './CustomPage';
import { StoreNotFound } from './StoreNotFound';
import { 
  Menu, 
  X, 
  ArrowRight, 
  Sparkles, 
  Phone, 
  Mail, 
  MapPin, 
  Loader2 
} from 'lucide-react';
import { getStorefrontUrl } from '../utils/domain';

export const StorefrontLayout = ({ previewMode = false, previewPage = null, viewport = 'desktop' }) => {
  const { tenant, products, hydrationLatencyMs, isLoading, error } = useTenant();
  const [activeTab, setActiveTab] = useState(previewPage || 'home');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isMobile = viewport === 'mobile';
  const isTablet = viewport === 'tablet';

  if (isLoading) {
    return (
      <div className="min-h-[70vh] bg-slate-950 text-slate-400 flex flex-col items-center justify-center p-6 text-center space-y-3">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-400" />
        <h3 className="text-base font-bold text-white">Hydrating Storefront from MongoDB Atlas...</h3>
        <p className="text-xs text-slate-500 font-mono">Edge Host-Header &bull; Compound Discriminator Scoped</p>
      </div>
    );
  }

  // If store was not found in Atlas or is an unpublished draft being accessed from a public URL
  if (tenant?.notFound || error === 'STORE_NOT_FOUND' || (!tenant && !isLoading) || (!previewMode && tenant?.isNewStore)) {
    return <StoreNotFound subdomain={tenant?.subdomain} />;
  }

  const liveDomainDisplay = tenant?.subdomain ? getStorefrontUrl(tenant.subdomain).replace(/^https?:\/\//, '') : '';

  // Sync previewPage if passed from Studio
  const currentPage = previewPage || activeTab;

  // Compute CSS custom properties from tenant theme
  const themeStyles = {
    '--tenant-primary': tenant.theme?.primaryColor || '#3B82F6',
    '--tenant-secondary': tenant.theme?.secondaryColor || '#1E293B',
    '--tenant-accent': tenant.theme?.accentColor || '#F59E0B',
    '--tenant-radius': tenant.theme?.borderRadius || '0.75rem',
    fontFamily: tenant.theme?.fontBody || 'Inter, sans-serif',
  };

  const isDark = tenant.theme?.mode === 'dark';

  return (
    <div
      style={themeStyles}
      className={`min-h-screen w-full max-w-full overflow-x-hidden transition-colors duration-200 ${
        isDark ? 'bg-slate-950 text-slate-100' : 'bg-white text-slate-900'
      }`}
    >
      {/* Announcement Bar */}
      {tenant.brand?.announcement && (
        <div 
          style={{ backgroundColor: tenant.theme?.primaryColor || '#3B82F6' }}
          className="py-1.5 px-4 text-center text-xs font-medium text-white tracking-wide truncate w-full max-w-full overflow-hidden"
        >
          {tenant.brand.announcement}
        </div>
      )}

      {/* Store Navigation Bar */}
      <nav className={`sticky top-0 z-30 w-full max-w-full border-b backdrop-blur-md transition-colors ${
        isDark ? 'bg-slate-950/80 border-slate-800' : 'bg-white/80 border-slate-200'
      }`}>
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between gap-2 w-full max-w-full">
          {/* Logo / Store Name */}
          <div 
            onClick={() => setActiveTab('home')}
            className="flex items-center space-x-2 cursor-pointer select-none min-w-0 max-w-[calc(100%-56px)] sm:max-w-md"
          >
            {tenant.brand?.logoUrl ? (
              <img src={tenant.brand.logoUrl} alt={tenant.name} className="h-8 w-auto object-contain max-w-[80px] sm:max-w-[100px] shrink-0" />
            ) : (
              <div 
                style={{ backgroundColor: tenant.theme?.primaryColor || '#3B82F6' }}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-sm shadow-md shrink-0"
              >
                {tenant.name?.[0] || 'S'}
              </div>
            )}
            <div className="min-w-0 flex-1 overflow-hidden">
              <span className={`font-extrabold tracking-tight truncate block ${
                isMobile ? 'text-xs max-w-[140px]' : 'text-sm sm:text-base max-w-full'
              }`}>
                {tenant.name}
              </span>
              <span className="block text-[9px] sm:text-[10px] text-slate-400 font-mono -mt-0.5 truncate max-w-full">
                {liveDomainDisplay}
              </span>
            </div>
          </div>

          {/* Desktop Nav Links (Hidden in mobile mode) */}
          {!isMobile && (
            <div className="hidden md:flex items-center space-x-1 shrink-0">
              {tenant.navigation?.filter(nav => nav.isVisible).map((nav) => {
                const slug = nav.path === '/' ? 'home' : nav.path.replace('/', '');
                const isActive = currentPage === slug;
                return (
                  <button
                    key={nav.id}
                    onClick={() => setActiveTab(slug)}
                    className={`px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all ${
                      isActive
                        ? isDark ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-900 font-semibold'
                        : isDark ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {nav.label}
                  </button>
                );
              })}
            </div>
          )}

          {/* Right Actions: Telemetry badge & Mobile menu trigger */}
          <div className="flex items-center space-x-2 shrink-0">
            {!isMobile && (
              <span className={`hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-mono ${
                isDark ? 'bg-slate-800 text-slate-400' : 'bg-slate-100 text-slate-600'
              }`}>
                ⚡ Hydrated in {hydrationLatencyMs}ms
              </span>
            )}

            {/* Mobile menu trigger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className={`${isMobile ? 'block' : 'md:hidden'} p-2 rounded-lg text-slate-400 hover:text-white shrink-0`}
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Nav */}
        {mobileMenuOpen && (
          <div className={`px-4 py-2 border-t space-y-1 animate-fadeIn w-full max-w-full ${
            isDark ? 'bg-slate-900 border-slate-800' : 'bg-slate-50 border-slate-200'
          }`}>
            {tenant.navigation?.filter(nav => nav.isVisible).map((nav) => {
              const slug = nav.path === '/' ? 'home' : nav.path.replace('/', '');
              const isActive = currentPage === slug;
              return (
                <button
                  key={nav.id}
                  onClick={() => {
                    setActiveTab(slug);
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 rounded-lg text-xs sm:text-sm font-medium ${
                    isActive ? 'bg-indigo-600 text-white font-semibold' : 'hover:bg-slate-800/40'
                  }`}
                >
                  {nav.label}
                </button>
              );
            })}
          </div>
        )}
      </nav>

      {/* Dynamic Page Views */}
      <main className="min-h-[70vh]">
        {currentPage === 'home' && (
          <HomePage onNavigateCatalog={() => setActiveTab('catalog')} viewport={viewport} />
        )}
        {currentPage === 'catalog' && (
          <CatalogPage viewport={viewport} />
        )}
        {currentPage === 'about' && (
          <AboutPage viewport={viewport} />
        )}
        {currentPage === 'contact' && (
          <ContactPage viewport={viewport} />
        )}
        {!['home', 'catalog', 'about', 'contact'].includes(currentPage) && (
          <CustomPage pageSlug={currentPage} viewport={viewport} />
        )}
      </main>

      {/* Store Footer */}
      <footer className={`py-10 border-t mt-16 transition-colors ${
        isDark ? 'bg-slate-900/60 border-slate-800 text-slate-400' : 'bg-slate-50 border-slate-200 text-slate-600'
      }`}>
        <div className={`max-w-6xl mx-auto px-4 grid gap-8 text-xs ${
          isMobile ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-4'
        }`}>
          <div className={isMobile ? '' : 'md:col-span-2'}>
            <h4 className="font-bold text-sm mb-2 text-white">{tenant.name}</h4>
            <p className="max-w-sm leading-relaxed mb-4 opacity-80">{tenant.tagline}</p>
            <div className="flex items-center space-x-2 text-[11px] text-slate-500">
              <span>© {new Date().getFullYear()} {tenant.name}. All rights reserved.</span>
              <span>•</span>
              <span className="font-mono">{liveDomainDisplay}</span>
            </div>
          </div>

          <div>
            <h5 className="font-semibold text-white mb-2">Explore</h5>
            <ul className="space-y-1.5">
              {tenant.navigation?.filter(nav => nav.isVisible).map((nav) => {
                const slug = nav.path === '/' ? 'home' : nav.path.replace('/', '');
                return (
                  <li key={nav.id}>
                    <button onClick={() => setActiveTab(slug)} className="hover:underline capitalize">
                      {nav.label}
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>

          <div>
            <h5 className="font-semibold text-white mb-2">Contact</h5>
            <ul className="space-y-1.5">
              <li className="flex items-center space-x-1.5 truncate">
                <Mail className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                <span className="truncate">{tenant.contact?.email || 'support@brand.com'}</span>
              </li>
              <li className="flex items-center space-x-1.5">
                <Phone className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                <span>{tenant.contact?.phone || '+1 555-0199'}</span>
              </li>
              <li className="flex items-center space-x-1.5 truncate">
                <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                <span className="truncate">{tenant.contact?.address || 'Silicon Valley, CA'}</span>
              </li>
            </ul>
          </div>
        </div>
      </footer>
    </div>
  );
};
