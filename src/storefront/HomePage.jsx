import React from 'react';
import { useTenant } from '../context/TenantContext';
import { useCart } from '../context/CartContext';
import { ArrowRight, Star, Sparkles, Truck, ShieldCheck, RefreshCw, ExternalLink, ShoppingBag } from 'lucide-react';

export const HomePage = ({ onNavigateCatalog, onNavigatePortfolio, onNavigateTab, viewport = 'desktop' }) => {
  const { tenant, products } = useTenant();
  const { addToCart } = useCart();

  const isMobile = viewport === 'mobile';
  const isTablet = viewport === 'tablet';

  const valuePropsGrid = isMobile 
    ? 'grid-cols-1 gap-3' 
    : isTablet 
    ? 'grid-cols-1 sm:grid-cols-3 gap-4' 
    : 'grid-cols-1 sm:grid-cols-3 gap-6';

  const productGrid = isMobile
    ? 'grid-cols-1 gap-4'
    : isTablet
    ? 'grid-cols-2 gap-4'
    : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6';

  const homeConfig = tenant.pages?.find((p) => p.slug === 'home');
  const portfolioPage = tenant.pages?.find(
    (p) =>
      p.slug === 'portfolio' ||
      p.slug === 'projects' ||
      p.title?.toLowerCase().includes('portfolio') ||
      p.title?.toLowerCase().includes('project')
  );
  const projects = portfolioPage?.sections?.[0]?.items || [];

  const isPortfolio = tenant.archetype === 'portfolio' || 
    tenant.theme?.archetype === 'portfolio' ||
    Boolean(portfolioPage && tenant.navigation?.find(n => n.path === '/portfolio')?.isVisible !== false);

  const heroSection = homeConfig?.sections?.find((s) => s.type === 'hero') || {
    badgeText: isPortfolio ? 'Creative Portfolio & Showcase' : 'Official Brand Storefront',
    title: tenant.name || 'Welcome to Our Store',
    subtitle: tenant.tagline || 'Explore handcrafted goods with zero build latency.',
    ctaText: products?.length > 0 ? 'Explore Catalog' : (portfolioPage ? 'View Projects' : 'Explore Showcase'),
    ctaLink: products?.length > 0 ? '/catalog' : '/portfolio',
    imageUrl: tenant.brand?.heroImage || 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1600&q=80',
  };

  const badgeDisplay = heroSection.badgeText || (isPortfolio ? 'Creative Portfolio & Showcase' : 'Official Brand Storefront');

  // Value Propositions / Highlights section (fully customizable)
  const valuePropsSection = homeConfig?.sections?.find((s) => s.type === 'value_props');
  const showValueProps = valuePropsSection ? valuePropsSection.isVisible !== false : !isPortfolio;
  const valuePropsItems = valuePropsSection?.items?.length > 0 ? valuePropsSection.items : [
    { title: 'Express Global Delivery', description: 'Tracked carbon-neutral shipping' },
    { title: 'Direct Brand Warranty', description: '100% authentic merchant guarantee' },
    { title: 'Hassle-Free Returns', description: '30-day money-back guarantee' },
  ];

  const featuredProducts = products?.filter((p) => p.isFeatured) || products?.slice(0, 4) || [];

  return (
    <div>
      {/* Hero Banner */}
      <section className={`relative overflow-hidden ${isMobile ? 'px-4 py-12' : 'px-4 py-20 md:py-28'}`}>
        <div 
          className="absolute inset-0 bg-cover bg-center z-0 scale-105 transition-transform duration-700"
          style={{ backgroundImage: `url('${heroSection.imageUrl || tenant.brand?.heroImage}')` }}
        >
          <div className={`absolute inset-0 ${
            tenant.theme?.mode === 'dark'
              ? 'bg-gradient-to-r from-slate-950 via-slate-950/90 to-slate-950/40'
              : 'bg-gradient-to-r from-white via-white/90 to-white/40'
          }`} />
        </div>

        <div className="max-w-6xl mx-auto relative z-10">
          <div className="max-w-2xl">
            <span 
              style={{ color: tenant.theme?.primaryColor || '#3B82F6' }}
              className="text-xs font-bold uppercase tracking-wider mb-2 sm:mb-3 block"
            >
              {badgeDisplay}
            </span>

            <h1 className={`font-black tracking-tight leading-tight mb-3 sm:mb-4 ${
              isMobile ? 'text-2xl sm:text-3xl' : 'text-3xl sm:text-5xl'
            }`}>
              {heroSection.title}
            </h1>

            <p className={`opacity-80 leading-relaxed mb-6 sm:mb-8 ${
              isMobile ? 'text-xs' : 'text-sm sm:text-base'
            }`}>
              {heroSection.subtitle}
            </p>

            {heroSection.showCta !== false && !heroSection.hideCta && (
              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    const target = heroSection.ctaLink || (isPortfolio ? '/portfolio' : '/catalog');
                    if (target.startsWith('http')) {
                      window.open(target, '_blank', 'noopener,noreferrer');
                      return;
                    }
                    const cleanSlug = target.replace(/^\//, '');
                    if (onNavigateTab) {
                      onNavigateTab(cleanSlug);
                    } else if (cleanSlug === 'portfolio' && onNavigatePortfolio) {
                      onNavigatePortfolio();
                    } else if (onNavigateCatalog) {
                      onNavigateCatalog();
                    }
                  }}
                  style={{
                    backgroundColor: tenant.theme?.primaryColor || '#3B82F6',
                    borderRadius: tenant.theme?.borderRadius || '0.75rem',
                  }}
                  className="px-5 sm:px-6 py-2.5 sm:py-3 text-white font-semibold text-xs sm:text-sm shadow-xl hover:opacity-90 transition-all flex items-center space-x-2 cursor-pointer"
                >
                  <span>{heroSection.ctaText || (isPortfolio ? 'View Selected Works' : 'Shop Collection')}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Value Propositions / Highlights Bar (Fully Customizable & Toggleable) */}
      {showValueProps && (
        <section className="border-y border-slate-800/40 py-6 px-4">
          <div className={`max-w-6xl mx-auto grid ${valuePropsGrid} text-xs`}>
            {valuePropsItems.slice(0, 3).map((item, idx) => (
              <div key={idx} className="flex items-center space-x-3 p-2.5 sm:p-3 bg-slate-900/30 rounded-xl border border-slate-800/40">
                <div 
                  style={{ color: tenant.theme?.primaryColor || '#3B82F6' }}
                  className="p-2 sm:p-2.5 rounded-xl bg-slate-800/40 border border-slate-700/50 shrink-0"
                >
                  {idx === 0 ? <Truck className="w-4 h-4 sm:w-5 sm:h-5" /> : idx === 1 ? <ShieldCheck className="w-4 h-4 sm:w-5 sm:h-5" /> : <RefreshCw className="w-4 h-4 sm:w-5 sm:h-5" />}
                </div>
                <div className="min-w-0">
                  <div className="font-semibold text-xs sm:text-sm truncate">{item.title}</div>
                  <div className="opacity-70 text-[11px] truncate">{item.description}</div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Featured Products or Portfolio Projects Section */}
      {isPortfolio ? (
        <section className="max-w-6xl mx-auto px-4 py-12 sm:py-16">
          <div className="flex items-end justify-between mb-6 sm:mb-8">
            <div>
              <h2 className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                Showcase & Works
              </h2>
              <h3 className="text-xl sm:text-2xl font-bold">Featured Projects & Selected Works</h3>
            </div>
            {projects.length > 0 && (
              <button
                type="button"
                onClick={() => onNavigateTab ? onNavigateTab('portfolio') : (onNavigatePortfolio ? onNavigatePortfolio() : onNavigateCatalog())}
                className="text-xs font-semibold hover:underline flex items-center space-x-1"
                style={{ color: tenant.theme?.primaryColor || '#EC4899' }}
              >
                <span>View All ({projects.length})</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {projects.length > 0 ? (
            <div className={`grid ${productGrid}`}>
              {projects.map((project, idx) => (
                <div
                  key={idx}
                  style={{ borderRadius: tenant.theme?.borderRadius || '0.75rem' }}
                  className="group border border-slate-800/60 hover:border-slate-700 overflow-hidden bg-slate-900/30 flex flex-col justify-between transition-all"
                >
                  <div>
                    <div className="h-48 sm:h-56 overflow-hidden relative bg-slate-950">
                      <img
                        src={project.imageUrl || 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=800&q=80'}
                        alt={project.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <span 
                        style={{ backgroundColor: tenant.theme?.primaryColor || '#EC4899' }}
                        className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded text-[10px] font-bold text-white uppercase tracking-wider shadow"
                      >
                        {project.category || `Project #${idx + 1}`}
                      </span>
                    </div>

                    <div className="p-3.5 sm:p-4">
                      <h4 className="font-semibold text-sm mb-1.5 line-clamp-1">
                        {project.title}
                      </h4>
                      <p className="text-xs opacity-70 line-clamp-3 leading-relaxed">
                        {project.description}
                      </p>
                    </div>
                  </div>

                  <div className="p-3.5 sm:p-4 pt-0 flex items-center justify-between border-t border-slate-800/40 mt-2 gap-2">
                    {project.linkUrl ? (
                      <a
                        href={project.linkUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          backgroundColor: tenant.theme?.primaryColor || '#EC4899',
                          borderRadius: tenant.theme?.borderRadius || '0.75rem',
                        }}
                        className="w-full py-2 px-3 text-white text-xs font-semibold flex items-center justify-center space-x-1.5 hover:opacity-90 transition-opacity shadow cursor-pointer"
                      >
                        <span>Visit Project</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    ) : (
                      <span
                        style={{
                          color: tenant.theme?.primaryColor || '#EC4899',
                          borderColor: `${tenant.theme?.primaryColor || '#EC4899'}40`,
                          borderRadius: tenant.theme?.borderRadius || '0.75rem',
                        }}
                        className="px-2.5 py-1 bg-slate-900/60 border text-[11px] font-semibold flex items-center space-x-1 select-none"
                      >
                        <Sparkles className="w-3 h-3 shrink-0" />
                        <span>Showcase Work</span>
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-12 text-center border border-dashed border-slate-800 rounded-2xl bg-slate-900/20 max-w-lg mx-auto">
              <Sparkles className="w-6 h-6 text-pink-400 mx-auto mb-2" />
              <h4 className="text-sm font-semibold text-slate-300">No Showcase Projects Added Yet</h4>
              <p className="text-xs text-slate-500 mt-1">
                Add your projects, designs, and case studies in the Studio "Projects" tab to showcase them here.
              </p>
            </div>
          )}
        </section>
      ) : featuredProducts.length > 0 ? (
        <section className="max-w-6xl mx-auto px-4 py-12 sm:py-16">
          <div className="flex items-end justify-between mb-6 sm:mb-8">
            <div>
              <h2 className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                Curated Selection
              </h2>
              <h3 className="text-xl sm:text-2xl font-bold">Featured Products</h3>
            </div>
            <button
              type="button"
              onClick={onNavigateCatalog}
              className="text-xs font-semibold hover:underline flex items-center space-x-1 cursor-pointer"
              style={{ color: tenant.theme?.primaryColor || '#3B82F6' }}
            >
              <span>View All ({products?.length || 0})</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className={`grid ${productGrid}`}>
            {featuredProducts.map((product) => (
              <div
                key={product._id}
                style={{ borderRadius: tenant.theme?.borderRadius || '0.75rem' }}
                className="group border border-slate-800/60 hover:border-slate-700 overflow-hidden bg-slate-900/30 flex flex-col justify-between transition-all"
              >
                <div>
                  <div className="h-48 sm:h-56 overflow-hidden relative bg-slate-950">
                    <img
                      src={product.images?.[0] || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=600&q=80'}
                      alt={product.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    {product.badge && (
                      <span 
                        style={{ backgroundColor: tenant.theme?.primaryColor || '#3B82F6' }}
                        className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded text-[10px] font-bold text-white uppercase tracking-wider shadow"
                      >
                        {product.badge}
                      </span>
                    )}
                  </div>

                  <div className="p-3.5 sm:p-4">
                    <div className="text-[10px] sm:text-[11px] text-slate-400 uppercase tracking-wider mb-1">
                      {product.category}
                    </div>
                    <h4 className="font-semibold text-sm line-clamp-1 mb-1">
                      {product.title}
                    </h4>
                    <p className="text-xs opacity-70 line-clamp-2 mb-3">
                      {product.description}
                    </p>

                    <div className="flex items-center space-x-1 text-xs text-amber-400 mb-2">
                      <Star className="w-3.5 h-3.5 fill-amber-400" />
                      <span className="font-semibold">{product.rating || 4.9}</span>
                      <span className="opacity-50">({product.reviewCount || 24})</span>
                    </div>
                  </div>
                </div>

                <div className="p-3.5 sm:p-4 pt-0 flex items-center justify-between border-t border-slate-800/40 mt-2 gap-2">
                  <div>
                    <div className="text-base font-bold">
                      ${product.price}
                    </div>
                    {product.compareAtPrice > product.price && (
                      <div className="text-xs text-slate-500 line-through">
                        ${product.compareAtPrice}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center space-x-1.5">
                    {product.linkUrl && (
                      <a
                        href={product.linkUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 rounded-lg border border-slate-700 bg-slate-800 text-slate-300 hover:text-white transition-colors"
                        title="View Live Link"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}
                    <button
                      type="button"
                      onClick={() => addToCart(product)}
                      style={{
                        backgroundColor: tenant.theme?.primaryColor || '#3B82F6',
                        borderRadius: tenant.theme?.borderRadius || '0.75rem',
                      }}
                      className="px-3 py-1.5 text-white text-xs font-semibold flex items-center space-x-1 shadow hover:opacity-90 transition-all cursor-pointer"
                    >
                      <ShoppingBag className="w-3.5 h-3.5" />
                      <span>Add</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      ) : (
        <section className="max-w-6xl mx-auto px-4 py-12 sm:py-16 text-center">
          <div className="p-12 border border-dashed border-slate-800 rounded-2xl bg-slate-900/20 max-w-lg mx-auto">
            <ShoppingBag className="w-6 h-6 text-indigo-400 mx-auto mb-2" />
            <h4 className="text-sm font-semibold text-slate-300">Catalog Empty</h4>
            <p className="text-xs text-slate-500 mt-1">
              Add products in InstantStore Studio to display your live store catalog.
            </p>
          </div>
        </section>
      )}
    </div>
  );
};
