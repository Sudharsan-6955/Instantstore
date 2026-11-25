import React, { useState } from 'react';
import { useTenant } from '../context/TenantContext';
import { useCart } from '../context/CartContext';
import { HomePage } from './HomePage';
import { CatalogPage } from './CatalogPage';
import { AboutPage } from './AboutPage';
import { ContactPage } from './ContactPage';
import { CustomPage } from './CustomPage';
import { StoreNotFound } from './StoreNotFound';
import { CartDrawer } from './CartDrawer';
import { CheckoutModal } from './CheckoutModal';
import { 
  Menu, 
  X, 
  ArrowRight, 
  Sparkles, 
  Phone, 
  Mail, 
  MapPin, 
  Loader2,
  ShoppingBag,
  Globe
} from 'lucide-react';
import { 
  GitHubIcon, 
  LinkedInIcon, 
  TwitterIcon, 
  InstagramIcon 
} from '../components/SocialIcons';
import { getStorefrontUrl } from '../utils/domain';

export const StorefrontLayout = ({ previewMode = false, previewPage = null, viewport = 'desktop' }) => {
  const { tenant, products, hydrationLatencyMs, isLoading, error } = useTenant();
  const { cartCount, setIsCartOpen } = useCart();
  const [activeTab, setActiveTab] = useState(previewPage || 'home');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isMobile = viewport === 'mobile';
  const isTablet = viewport === 'tablet';

  const isPortfolio = tenant?.archetype === 'portfolio' || 
    tenant?.theme?.archetype === 'portfolio' ||
    Boolean(tenant?.pages?.some(p => p.slug === 'portfolio') && tenant?.navigation?.find(n => n.path === '/portfolio')?.isVisible !== false);

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

          {/* Right Actions: Cart, Telemetry badge & Mobile menu trigger */}
          <div className="flex items-center space-x-2 shrink-0">
            {/* Shopping Cart Button (Storefront / E-commerce mode) */}
            {!isPortfolio && (
              <button
                type="button"
                onClick={() => setIsCartOpen(true)}
                className={`relative p-2 rounded-lg transition-colors flex items-center space-x-1.5 cursor-pointer ${
                  isDark ? 'bg-slate-800 text-slate-200 hover:bg-slate-700' : 'bg-slate-100 text-slate-800 hover:bg-slate-200'
                }`}
                title="View Shopping Cart"
              >
                <ShoppingBag className="w-4 h-4" />
                {cartCount > 0 && (
                  <span
                    style={{ backgroundColor: tenant.theme?.primaryColor || '#3B82F6' }}
                    className="px-1.5 py-0.2 rounded-full text-[10px] font-bold text-white leading-tight animate-pulse"
                  >
                    {cartCount}
                  </span>
                )}
              </button>
            )}

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
          <HomePage 
            onNavigateCatalog={() => setActiveTab('catalog')} 
            onNavigatePortfolio={() => setActiveTab('portfolio')}
            onNavigateTab={(tab) => setActiveTab(tab)} 
            viewport={viewport} 
          />
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

      {/* Store Footer - Fully Customizable */}
      <footer className={`py-12 border-t mt-16 transition-colors ${
        isDark ? 'bg-slate-900/60 border-slate-800 text-slate-400' : 'bg-slate-50 border-slate-200 text-slate-600'
      }`}>
        <div className={`max-w-6xl mx-auto px-4 grid gap-8 text-xs ${
          isMobile ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-4'
        }`}>
          {/* Brand & Bio column */}
          <div className={isMobile ? '' : 'md:col-span-2'}>
            <h4 className="font-bold text-base mb-2 text-white">{tenant.name}</h4>
            <p className="max-w-sm leading-relaxed mb-4 opacity-80 whitespace-pre-line">
              {tenant.footer?.description || tenant.tagline || 'Crafted with precision via zero-build cloud architecture.'}
            </p>

            {/* Social Icons */}
            {tenant.footer?.socials && Object.values(tenant.footer.socials).some(Boolean) && (
              <div className="flex items-center space-x-2.5 mb-4">
                {tenant.footer.socials.github && (
                  <a href={tenant.footer.socials.github} target="_blank" rel="noopener noreferrer" className="p-2 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors" title="GitHub">
                    <GitHubIcon className="w-3.5 h-3.5" />
                  </a>
                )}
                {tenant.footer.socials.linkedin && (
                  <a href={tenant.footer.socials.linkedin} target="_blank" rel="noopener noreferrer" className="p-2 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors" title="LinkedIn">
                    <LinkedInIcon className="w-3.5 h-3.5" />
                  </a>
                )}
                {tenant.footer.socials.twitter && (
                  <a href={tenant.footer.socials.twitter} target="_blank" rel="noopener noreferrer" className="p-2 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors" title="Twitter / X">
                    <TwitterIcon className="w-3.5 h-3.5" />
                  </a>
                )}
                {tenant.footer.socials.instagram && (
                  <a href={tenant.footer.socials.instagram} target="_blank" rel="noopener noreferrer" className="p-2 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors" title="Instagram">
                    <InstagramIcon className="w-3.5 h-3.5" />
                  </a>
                )}
                {tenant.footer.socials.website && (
                  <a href={tenant.footer.socials.website} target="_blank" rel="noopener noreferrer" className="p-2 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors" title="Website / Portfolio">
                    <Globe className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>
            )}

            <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-500">
              <span>{tenant.footer?.copyrightText || `© ${new Date().getFullYear()} ${tenant.name}. All rights reserved.`}</span>
              <span>•</span>
              <span className="font-mono">{liveDomainDisplay}</span>
            </div>
          </div>

          {/* Explore Links */}
          <div>
            <h5 className="font-semibold text-white mb-2 uppercase tracking-wider text-[11px]">Explore</h5>
            <ul className="space-y-1.5">
              {(
                tenant.navigation?.filter(nav => nav.isVisible !== false)?.length
                  ? tenant.navigation.filter(nav => nav.isVisible !== false)
                  : [
                      { id: 'nav-home', label: 'Home', path: '/' },
                      { id: isPortfolio ? 'nav-portfolio' : 'nav-catalog', label: isPortfolio ? 'Projects' : 'Catalog', path: isPortfolio ? '/portfolio' : '/catalog' },
                      { id: 'nav-about', label: 'About', path: '/about' },
                      { id: 'nav-contact', label: 'Contact', path: '/contact' }
                    ]
              ).map((nav) => {
                const slug = nav.path === '/' ? 'home' : nav.path.replace('/', '');
                return (
                  <li key={nav.id}>
                    <button onClick={() => setActiveTab(slug)} className="hover:underline capitalize text-slate-400 hover:text-white">
                      {nav.label}
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Direct Contact column */}
          <div>
            <h5 className="font-semibold text-white mb-2 uppercase tracking-wider text-[11px]">Direct Contact</h5>
            <ul className="space-y-2">
              {(tenant.footer?.contactEmail || tenant.contact?.email) && (
                <li className="flex items-center space-x-2 truncate">
                  <Mail className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                  <a href={`mailto:${tenant.footer?.contactEmail || tenant.contact?.email}`} className="truncate hover:underline text-slate-300 hover:text-white">
                    {tenant.footer?.contactEmail || tenant.contact?.email}
                  </a>
                </li>
              )}
              {(tenant.footer?.contactPhone || tenant.contact?.phone) && (
                <li className="flex items-center space-x-2">
                  <Phone className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                  <a href={`tel:${tenant.footer?.contactPhone || tenant.contact?.phone}`} className="hover:underline text-slate-300 hover:text-white">
                    {tenant.footer?.contactPhone || tenant.contact?.phone}
                  </a>
                </li>
              )}
              {(tenant.footer?.contactAddress || tenant.contact?.address) && (
                <li className="flex items-start space-x-2">
                  <MapPin className="w-3.5 h-3.5 text-indigo-400 shrink-0 mt-0.5" />
                  <a 
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(tenant.footer?.contactAddress || tenant.contact?.address)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:underline text-slate-300 hover:text-white leading-snug"
                  >
                    {tenant.footer?.contactAddress || tenant.contact?.address}
                  </a>
                </li>
              )}
            </ul>
          </div>
        </div>
      </footer>

      {/* Cart Drawer & Checkout Modal */}
      <CartDrawer />
      <CheckoutModal />
    </div>
  );
};
