import React, { useState, useMemo } from 'react';
import { useTenant } from '../context/TenantContext';
import { useCart } from '../context/CartContext';
import { Search, Star, SlidersHorizontal, Sparkles, ExternalLink, ShoppingBag, Briefcase } from 'lucide-react';

export const CatalogPage = ({ viewport = 'desktop' }) => {
  const { tenant, products } = useTenant();
  const { addToCart } = useCart();
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const isMobile = viewport === 'mobile';
  const isTablet = viewport === 'tablet';

  const isPortfolio = tenant.archetype === 'portfolio' || 
    tenant.theme?.archetype === 'portfolio' ||
    Boolean(tenant.pages?.some(p => p.slug === 'portfolio') && tenant.navigation?.find(n => n.path === '/portfolio')?.isVisible !== false);

  const portfolioPage = tenant.pages?.find(p => p.slug === 'portfolio' || p.slug === 'projects');
  const portfolioProjects = portfolioPage?.sections?.[0]?.items || [];

  const productGrid = isMobile
    ? 'grid-cols-1 gap-4'
    : isTablet
    ? 'grid-cols-2 gap-4'
    : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6';

  // Extract unique categories
  const categories = useMemo(() => {
    const set = new Set(['All']);
    products?.forEach((p) => {
      if (p.category) set.add(p.category);
    });
    return Array.from(set);
  }, [products]);

  // Filter products by category and search
  const filteredProducts = useMemo(() => {
    return (products || []).filter((product) => {
      const matchesCategory =
        selectedCategory === 'All' || product.category === selectedCategory;
      const matchesSearch =
        !searchQuery ||
        product.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description?.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [products, selectedCategory, searchQuery]);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 sm:py-12">
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-1 sm:mb-2">
          {isPortfolio ? 'Projects & Showcase' : 'Explore Catalog'}
        </h1>
        <p className="text-xs text-slate-400">
          {isPortfolio 
            ? `Showing ${filteredProducts.length > 0 ? filteredProducts.length : portfolioProjects.length} featured works & projects from ${tenant.name}`
            : `Showing ${filteredProducts.length} items from ${tenant.name}'s verified inventory`
          }
        </p>
      </div>

      {/* Filter and Search Bar (Only when products exist) */}
      {filteredProducts.length > 0 && (
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4 mb-6 sm:mb-8">
          {/* Categories */}
          <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 sm:pb-0">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                style={
                  selectedCategory === cat
                    ? {
                        backgroundColor: tenant.theme?.primaryColor || '#3B82F6',
                        color: '#FFFFFF',
                        borderRadius: tenant.theme?.borderRadius || '0.75rem',
                      }
                    : { borderRadius: tenant.theme?.borderRadius || '0.75rem' }
                }
                className={`px-3 py-1.5 text-xs font-medium transition-all shrink-0 cursor-pointer ${
                  selectedCategory === cat
                    ? 'shadow-md'
                    : 'bg-slate-800/40 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-700/50'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
            <input
              type="text"
              placeholder="Search items..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ borderRadius: tenant.theme?.borderRadius || '0.75rem' }}
              className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>
      )}

      {/* Grid Display: Either Products or Portfolio Projects */}
      {filteredProducts.length > 0 ? (
        <div className={`grid ${productGrid}`}>
          {filteredProducts.map((product) => (
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
                      className="p-1.5 rounded-lg border border-slate-700 bg-slate-800 text-slate-300 hover:text-white transition-colors cursor-pointer"
                      title="View Live Link"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}
                  {!isPortfolio && (
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
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : isPortfolio && portfolioProjects.length > 0 ? (
        <div className={`grid ${productGrid}`}>
          {portfolioProjects.map((project, idx) => (
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
        <div className="p-10 sm:p-14 text-center border border-dashed border-slate-800 rounded-2xl bg-slate-900/20 max-w-lg mx-auto">
          {isPortfolio ? (
            <>
              <Briefcase className="w-8 h-8 text-pink-400 mx-auto mb-3" />
              <h3 className="text-base font-bold text-white mb-1">No Projects Added Yet</h3>
              <p className="text-xs text-slate-400 mb-4">
                Add your projects, case studies, and live links in InstantStore Studio under the "Projects" tab.
              </p>
            </>
          ) : (
            <>
              <ShoppingBag className="w-8 h-8 text-indigo-400 mx-auto mb-3" />
              <h3 className="text-base font-bold text-white mb-1">No Products Found</h3>
              <p className="text-xs text-slate-400 mb-4">
                {searchQuery || selectedCategory !== 'All' 
                  ? 'No items match your filter. Try clearing your search.'
                  : 'Add catalog items in InstantStore Studio under the "Catalog" tab.'}
              </p>
              {(searchQuery || selectedCategory !== 'All') && (
                <button
                  type="button"
                  onClick={() => {
                    setSelectedCategory('All');
                    setSearchQuery('');
                  }}
                  className="px-3 py-1.5 text-xs text-indigo-400 border border-indigo-500/30 rounded-lg hover:bg-indigo-500/10 cursor-pointer"
                >
                  Clear all filters
                </button>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};
