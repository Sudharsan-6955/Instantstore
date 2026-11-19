import React from 'react';
import { useTenant } from '../context/TenantContext';
import { Sparkles, ArrowRight, CheckCircle2 } from 'lucide-react';

export const CustomPage = ({ pageSlug, viewport = 'desktop' }) => {
  const { tenant } = useTenant();
  const isMobile = viewport === 'mobile';

  // Find page data from tenant configuration
  const page = tenant.pages?.find(p => p.slug === pageSlug) || {
    title: 'Custom Page',
    sections: [{
      title: 'Custom Content',
      subtitle: 'Explore our latest updates and information.',
      content: 'Welcome to this custom page. You can customize this content anytime in InstantStore Studio.',
      imageUrl: tenant.brand?.heroImage || 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1600&q=80',
      items: [
        { title: 'Precision Quality', description: 'Handcrafted with attention to every single detail.' },
        { title: 'Zero Build Latency', description: 'Updated instantaneously across global edge networks.' },
        { title: 'Direct Value', description: 'Transparent pricing with direct-to-consumer delivery.' },
      ]
    }]
  };

  const primarySection = page.sections?.[0] || {};
  const items = primarySection.items || [
    { title: 'Premium Craftsmanship', description: 'Meticulously engineered to deliver enduring quality.' },
    { title: 'Edge Performance', description: 'Hydrated in milliseconds via database virtualization.' },
    { title: 'Guaranteed Satisfaction', description: 'Backed by our brand commitment and direct support.' },
  ];

  return (
    <div className="animate-fadeIn">
      {/* Header Banner */}
      <section className={`relative overflow-hidden ${isMobile ? 'px-4 py-12' : 'px-4 py-16 md:py-20'}`}>
        <div 
          className="absolute inset-0 bg-cover bg-center z-0 scale-105"
          style={{ backgroundImage: `url('${primarySection.imageUrl || tenant.brand?.heroImage || 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1600&q=80'}')` }}
        >
          <div className={`absolute inset-0 ${
            tenant.theme?.mode === 'dark'
              ? 'bg-gradient-to-r from-slate-950 via-slate-950/90 to-slate-950/60'
              : 'bg-gradient-to-r from-white via-white/95 to-white/70'
          }`} />
        </div>

        <div className="max-w-4xl mx-auto relative z-10">
          <span 
            style={{ color: tenant.theme?.primaryColor || '#3B82F6' }}
            className="text-xs font-bold uppercase tracking-wider mb-2 block"
          >
            {tenant.name} &bull; {page.title}
          </span>

          <h1 className={`font-black tracking-tight leading-tight mb-3 ${
            isMobile ? 'text-2xl sm:text-3xl' : 'text-3xl sm:text-5xl'
          }`}>
            {primarySection.title || page.title}
          </h1>

          <p className={`opacity-80 leading-relaxed max-w-2xl ${
            isMobile ? 'text-xs' : 'text-sm sm:text-base'
          }`}>
            {primarySection.subtitle || 'Discover more about our brand offerings and custom solutions.'}
          </p>
        </div>
      </section>

      {/* Main Content & Feature Blocks */}
      <section className="max-w-4xl mx-auto px-4 py-12 space-y-10">
        {primarySection.content && (
          <div className="p-6 sm:p-8 bg-slate-900/30 border border-slate-800/60 rounded-2xl">
            <h3 className="text-lg font-bold mb-3 flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-indigo-400" />
              <span>Overview</span>
            </h3>
            <p className="text-sm leading-relaxed opacity-85 whitespace-pre-line">
              {primarySection.content}
            </p>
          </div>
        )}

        {/* Feature Cards Grid */}
        <div>
          <h3 className="text-base font-bold mb-4 uppercase tracking-wider text-xs text-slate-400">
            Key Highlights
          </h3>
          <div className={`grid ${isMobile ? 'grid-cols-1 gap-3' : 'grid-cols-1 sm:grid-cols-3 gap-4'}`}>
            {items.map((item, idx) => (
              <div 
                key={idx}
                className="bg-slate-900/40 border border-slate-800/70 rounded-2xl flex flex-col justify-between overflow-hidden group hover:border-slate-700 transition-all"
              >
                <div>
                  {item.imageUrl ? (
                    <div className="h-44 w-full overflow-hidden bg-slate-950 border-b border-slate-800/70">
                      <img
                        src={item.imageUrl}
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                  ) : null}
                  <div className="p-4 sm:p-5">
                    {!item.imageUrl && (
                      <div 
                        style={{ color: tenant.theme?.primaryColor || '#3B82F6' }}
                        className="w-8 h-8 rounded-xl bg-slate-800/60 border border-slate-700/50 flex items-center justify-center mb-3"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                      </div>
                    )}
                    <h4 className="font-bold text-sm mb-1">{item.title}</h4>
                    <p className="text-xs opacity-70 leading-relaxed">{item.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};
