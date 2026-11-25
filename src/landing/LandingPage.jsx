import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTenant } from '../context/TenantContext';
import { api } from '../services/api';
import { getStorefrontUrl } from '../utils/domain';
import { 
  Zap, 
  Globe2, 
  ArrowRight, 
  Sparkles, 
  Clock, 
  Database,
  Store,
  Cpu,
  Loader2,
  Users,
  Lock,
  ExternalLink,
  Palette
} from 'lucide-react';

export const LandingPage = ({ onNavigateToStudio, onNavigateToStorefront, onNavigateToDevops, onOpenProfile }) => {
  const { requireAuth, isAuthenticated, user } = useAuth();
  const { loadStore } = useTenant();
  const baseDomain = import.meta.env.VITE_BASE_DOMAIN || 'devtackle.in';
  
  const [storeNameInput, setStoreNameInput] = useState('');
  const [subdomainInput, setSubdomainInput] = useState('');
  const [isSubdomainEdited, setIsSubdomainEdited] = useState(false);
  const [checkResult, setCheckResult] = useState(null);
  const [isChecking, setIsChecking] = useState(false);
  const [liveStores, setLiveStores] = useState([]);
  const [loadingStores, setLoadingStores] = useState(true);
  const [platformStats, setPlatformStats] = useState({ domainCount: 0, websiteCount: 0, userCount: 0 });

  // Helper to slugify store name into valid subdomain
  const slugify = (text) => {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')
      .slice(0, 30);
  };

  const handleStoreNameChange = (e) => {
    const val = e.target.value;
    setStoreNameInput(val);
    if (!isSubdomainEdited) {
      setSubdomainInput(slugify(val));
      setCheckResult(null);
    }
  };

  const handleSubdomainChange = (e) => {
    setIsSubdomainEdited(true);
    setSubdomainInput(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''));
    setCheckResult(null);
  };

  // Fetch all active stores dynamically from MongoDB Atlas
  useEffect(() => {
    const fetchStores = async () => {
      try {
        setLoadingStores(true);
        const res = await api.getTenants();
        if (res.tenants) {
          setLiveStores(res.tenants);
          if (res.stats) {
            setPlatformStats(res.stats);
          } else {
            const uniqueUsers = new Set(res.tenants.map(s => s.ownerEmail || s.ownerClerkId).filter(Boolean)).size;
            setPlatformStats({
              domainCount: res.tenants.length,
              websiteCount: res.tenants.filter(s => s.isPublished !== false).length,
              userCount: Math.max(uniqueUsers, 1)
            });
          }
        }
      } catch (err) {
        console.error('Failed to load stores from Atlas:', err);
      } finally {
        setLoadingStores(false);
      }
    };

    fetchStores();
  }, []);

  const handleCheckSlug = async (e) => {
    e.preventDefault();
    const clean = subdomainInput.trim();
    if (!clean) return;
    setIsChecking(true);
    try {
      const res = await api.checkSubdomain(clean);
      setCheckResult(res);
    } catch (err) {
      setCheckResult({ available: false, message: 'Could not verify subdomain in database' });
    } finally {
      setIsChecking(false);
    }
  };

  const handleEnterStudioWithSlug = (slug, storeName) => {
    const targetSlug = slug || subdomainInput || 'techgear';
    const targetName = storeName || storeNameInput || '';

    // If attempting to enter Studio for an existing registered store, strictly verify ownership
    const existing = liveStores.find(s => s.subdomain === targetSlug.toLowerCase().trim());
    if (existing) {
      const userEmail = (user?.email || '').toLowerCase().trim();
      const userClerkId = (user?.clerkId || '').trim();

      const isStoreOwner = Boolean(
        (existing.ownerClerkId && userClerkId && existing.ownerClerkId === userClerkId) ||
        (existing.ownerEmail && userEmail && existing.ownerEmail.toLowerCase().trim() === userEmail)
      );

      if (!isStoreOwner) {
        alert(`Domain '${targetSlug}' is already claimed by another user. You cannot customize other users' websites. Please enter a unique subdomain.`);
        return;
      }
    }

    requireAuth(() => {
      onNavigateToStudio(targetSlug, targetName);
    });
  };

  const handleStoreLaunch = (sub) => {
    loadStore(sub);
    onNavigateToStorefront();
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-indigo-500 selection:text-white">
      {/* Hero Section */}
      <section className="relative pt-16 pb-24 px-4 overflow-hidden border-b border-slate-900">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-gradient-to-tr from-indigo-600/20 via-purple-600/15 to-emerald-500/10 blur-[120px] pointer-events-none" />

        <div className="max-w-5xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center space-x-2 px-3 py-1.5 bg-indigo-500/10 border border-indigo-500/30 rounded-full text-indigo-400 text-xs font-medium mb-6">
            <Zap className="w-3.5 h-3.5 fill-indigo-400" />
            <span>Final Year Academic Project • Cloud & Distributed Systems</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white max-w-4xl mx-auto leading-tight sm:leading-tight">
            InstantStore: <span className="bg-gradient-to-r from-indigo-400 via-purple-300 to-emerald-400 bg-clip-text text-transparent">Zero-Build Multi-Tenant</span> Web Platform
          </h1>

          <p className="mt-6 text-base sm:text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed">
            Eliminates traditional CI/CD build bottlenecks. Provision custom-branded, multi-page business storefronts in <strong className="text-indigo-300">&lt; 50 milliseconds</strong> via Wildcard Edge Routing and Database Virtualization.
          </p>

          {/* Store Name & Domain Subdomain Inputs */}
          <div className="mt-10 max-w-2xl mx-auto">
            <form onSubmit={handleCheckSlug} className="p-3 bg-slate-900/95 border border-slate-800 rounded-3xl shadow-2xl space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-left">
                {/* Store Display Name Input */}
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center space-x-1.5 pl-1">
                    <Store className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Store Display Name</span>
                  </label>
                  <div className="flex items-center px-3 py-2 bg-slate-950/80 rounded-xl border border-slate-800 focus-within:border-indigo-500/80 transition-all">
                    <input
                      type="text"
                      placeholder="e.g. Ram Super Store"
                      value={storeNameInput}
                      onChange={handleStoreNameChange}
                      className="bg-transparent text-sm text-white focus:outline-none w-full placeholder:text-slate-600"
                    />
                  </div>
                </div>

                {/* Subdomain Input with Dynamic Parent Domain */}
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center space-x-1.5 pl-1">
                    <Globe2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Domain Subdomain</span>
                  </label>
                  <div className="flex items-center px-3 py-2 bg-slate-950/80 rounded-xl border border-slate-800 focus-within:border-emerald-500/80 transition-all">
                    <input
                      type="text"
                      placeholder="e.g. ramshop"
                      value={subdomainInput}
                      onChange={handleSubdomainChange}
                      className="bg-transparent text-sm text-white focus:outline-none w-full font-mono placeholder:text-slate-600"
                    />
                    <span className="text-xs text-indigo-300 font-mono font-medium shrink-0 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
                      .{baseDomain}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Bar */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-2 pt-2 border-t border-slate-800/60">
                <p className="text-[11px] text-slate-500 text-left px-1">
                  Custom store name can be edited anytime. Subdomain routes via wildcard edge DNS.
                </p>
                <button
                  type="submit"
                  disabled={isChecking || !subdomainInput.trim()}
                  className="w-full sm:w-auto px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 disabled:text-slate-500 text-white font-medium text-xs rounded-xl transition-all shadow-lg shadow-indigo-600/25 shrink-0 flex items-center justify-center space-x-1.5 cursor-pointer disabled:cursor-not-allowed"
                >
                  {isChecking ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Checking Availability...</span>
                    </>
                  ) : (
                    <span>Check Availability</span>
                  )}
                </button>
              </div>
            </form>

            {checkResult && (
              <div className={`mt-3 p-3.5 rounded-2xl border text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 animate-fadeIn ${
                checkResult.available
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                  : 'bg-amber-500/10 border-amber-500/30 text-amber-300'
              }`}>
                <div className="flex items-center space-x-2">
                  <Globe2 className="w-4 h-4 shrink-0" />
                  <span>
                    {checkResult.available ? (
                      <>
                        <strong className="font-mono text-white">{checkResult.subdomain}.{baseDomain}</strong> is available for instant zero-build provisioning!
                      </>
                    ) : (
                      <>
                        <strong className="font-mono text-white">{subdomainInput}.{baseDomain}</strong> is already registered. Choose another domain prefix.
                      </>
                    )}
                  </span>
                </div>
                {checkResult.available && (
                  <button
                    onClick={() => handleEnterStudioWithSlug(checkResult.subdomain, storeNameInput.trim())}
                    className="w-full sm:w-auto px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold transition-all shadow-md shadow-emerald-600/20 shrink-0 text-center"
                  >
                    Launch in Studio &rarr;
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Action CTAs */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={() => handleEnterStudioWithSlug(subdomainInput || 'techgear', storeNameInput.trim())}
              className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold text-sm rounded-xl transition-all shadow-xl shadow-indigo-600/30 flex items-center space-x-2"
            >
              <Sparkles className="w-4 h-4" />
              <span>{isAuthenticated ? 'Enter Merchant Studio' : 'Sign In with Google to Build Store'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={onNavigateToDevops}
              className="px-5 py-3 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 font-medium text-sm rounded-xl transition-all flex items-center space-x-2"
            >
              <Cpu className="w-4 h-4 text-emerald-400" />
              <span>Inspect Viva Telemetry & Benchmarks</span>
            </button>

            {isAuthenticated && onOpenProfile && (
              <button
                onClick={onOpenProfile}
                className="px-5 py-3 bg-slate-900 hover:bg-slate-800 border border-indigo-500/40 text-indigo-300 font-medium text-sm rounded-xl transition-all flex items-center space-x-2 shadow-lg cursor-pointer"
              >
                <Store className="w-4 h-4 text-indigo-400" />
                <span>My Websites & Profile</span>
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Industrial Problem vs InstantStore Benchmark Matrix */}
      <section className="py-20 px-4 max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-xs uppercase tracking-wider text-indigo-400 font-semibold mb-2">Industrial Problem Formulation</h2>
          <h3 className="text-2xl sm:text-3xl font-bold text-white">Why Traditional SaaS Provisioning Fails at Scale</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 bg-slate-900/60 border border-slate-800/80 rounded-2xl">
            <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center mb-4">
              <Clock className="w-5 h-5" />
            </div>
            <h4 className="text-base font-semibold text-slate-100 mb-2">High Provisioning Latency</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Traditional CI/CD triggers container compilation, Docker builds, and cluster restarts—taking <strong>3 to 5 minutes</strong> per merchant store.
            </p>
            <div className="mt-4 pt-4 border-t border-slate-800 flex items-center justify-between text-xs">
              <span className="text-slate-500">InstantStore:</span>
              <span className="text-emerald-400 font-semibold">&lt; 50 ms Atomic Write</span>
            </div>
          </div>

          <div className="p-6 bg-slate-900/60 border border-slate-800/80 rounded-2xl">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mb-4">
              <Database className="w-5 h-5" />
            </div>
            <h4 className="text-base font-semibold text-slate-100 mb-2">Resource Sprawl & Idle Costs</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              1,000 independent customer instances consume ~500 GB RAM and cost $4,500+/mo in cloud container sprawl while sitting 99% idle.
            </p>
            <div className="mt-4 pt-4 border-t border-slate-800 flex items-center justify-between text-xs">
              <span className="text-slate-500">InstantStore:</span>
              <span className="text-emerald-400 font-semibold">99.7% Memory Reduction</span>
            </div>
          </div>

          <div className="p-6 bg-slate-900/60 border border-slate-800/80 rounded-2xl">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center mb-4">
              <Globe2 className="w-5 h-5" />
            </div>
            <h4 className="text-base font-semibold text-slate-100 mb-2">DNS Sprawl & Propagation</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Registering individual CNAME/A records for every customer introduces DNS delay and fragile API lifecycle management.
            </p>
            <div className="mt-4 pt-4 border-t border-slate-800 flex items-center justify-between text-xs">
              <span className="text-slate-500">InstantStore:</span>
              <span className="text-emerald-400 font-semibold">1 Wildcard DNS (*.domain)</span>
            </div>
          </div>
        </div>
      </section>

      {/* Live Storefronts Fetched from MongoDB Atlas */}
      <section className="py-16 px-4 bg-slate-900/40 border-y border-slate-900">
        <div className="max-w-6xl mx-auto">
          {/* Platform Metrics Summary: Domains, Websites, Users */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
            <div className="p-5 bg-slate-900/90 border border-slate-800 rounded-2xl flex items-center space-x-4">
              <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shrink-0">
                <Globe2 className="w-6 h-6" />
              </div>
              <div>
                <div className="text-2xl font-black text-white font-mono">
                  {platformStats.domainCount || liveStores.length}
                </div>
                <div className="text-xs font-semibold text-slate-300">Registered Domains</div>
                <div className="text-[10px] text-slate-500 font-mono">*.{baseDomain} Subdomains</div>
              </div>
            </div>

            <div className="p-5 bg-slate-900/90 border border-slate-800 rounded-2xl flex items-center space-x-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
                <Store className="w-6 h-6" />
              </div>
              <div>
                <div className="text-2xl font-black text-white font-mono">
                  {platformStats.websiteCount || liveStores.length}
                </div>
                <div className="text-xs font-semibold text-slate-300">Published Websites</div>
                <div className="text-[10px] text-slate-500 font-mono">Zero-Build Multi-Page Platforms</div>
              </div>
            </div>

            <div className="p-5 bg-slate-900/90 border border-slate-800 rounded-2xl flex items-center space-x-4">
              <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400 shrink-0">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <div className="text-2xl font-black text-white font-mono">
                  {platformStats.userCount || 1}
                </div>
                <div className="text-xs font-semibold text-slate-300">Platform Users</div>
                <div className="text-[10px] text-slate-500 font-mono">Verified Google/Atlas Merchants</div>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
            <div>
              <h2 className="text-xs uppercase tracking-wider text-emerald-400 font-semibold mb-1">Live Database Tenants</h2>
              <h3 className="text-2xl font-bold text-white">Active Stores in MongoDB Atlas</h3>
              <p className="text-xs text-slate-400 mt-1">
                Public storefront directory. Each store runs dynamically from MongoDB Atlas in milliseconds.
              </p>
            </div>
            <span className="px-3 py-1 bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 rounded-full text-xs font-mono">
              {liveStores.length} Published Domains
            </span>
          </div>

          {loadingStores ? (
            <div className="py-16 text-center text-slate-400 flex flex-col items-center justify-center space-y-2">
              <Loader2 className="w-6 h-6 animate-spin text-indigo-400" />
              <span className="text-xs font-mono">Fetching active tenants from MongoDB Atlas...</span>
            </div>
          ) : liveStores.length === 0 ? (
            <div className="p-12 text-center border border-dashed border-slate-800 rounded-2xl">
              <p className="text-sm text-slate-400">No stores found in MongoDB Atlas.</p>
              <button
                onClick={() => handleEnterStudioWithSlug('mybrand')}
                className="mt-3 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-medium"
              >
                Create the First Store Now
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {liveStores.map((store) => {
                const userEmail = (user?.email || '').toLowerCase().trim();
                const userClerkId = (user?.clerkId || '').trim();
                const isStoreOwner = Boolean(
                  isAuthenticated && user && (
                    (userClerkId && store.ownerClerkId && store.ownerClerkId === userClerkId) ||
                    (userEmail && store.ownerEmail && store.ownerEmail.toLowerCase().trim() === userEmail)
                  )
                );

                return (
                  <div 
                    key={store._id}
                    className="bg-slate-900 border border-slate-800 hover:border-indigo-500/60 rounded-2xl overflow-hidden transition-all group flex flex-col justify-between"
                  >
                    <div>
                      <div 
                        className="h-40 bg-cover bg-center relative" 
                        style={{ backgroundImage: `url('${store.brand?.heroImage || 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=800&q=80'}')` }}
                      >
                        <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-[2px]" />
                        <div 
                          style={{ backgroundColor: store.theme?.primaryColor || '#3B82F6' }}
                          className="absolute top-3 left-3 px-2 py-0.5 text-white rounded text-[10px] font-mono shadow truncate max-w-[200px]"
                        >
                          {getStorefrontUrl(store.subdomain).replace(/^https?:\/\//, '')}
                        </div>
                        <div className="absolute bottom-3 left-3 text-white font-bold text-lg">
                          {store.name}
                        </div>
                      </div>
                      <div className="p-4">
                        <p className="text-xs text-slate-400 mb-3 line-clamp-2">
                          {store.tagline || 'Instant storefront powered by zero-build cloud architecture.'}
                        </p>
                        <div className="flex items-center justify-between text-[11px] text-slate-500">
                          <div className="flex items-center space-x-1.5">
                            <span 
                              className="w-2 h-2 rounded-full" 
                              style={{ backgroundColor: store.theme?.primaryColor || '#3B82F6' }}
                            />
                            <span>{store.theme?.fontHeading || 'Inter'}</span>
                          </div>
                          <span className="font-mono text-[10px] text-slate-400">
                            {store.isPublished !== false ? '● Live' : '○ Draft'}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 pt-0 flex items-center gap-2">
                      <button
                        onClick={() => handleStoreLaunch(store.subdomain)}
                        style={{ backgroundColor: store.theme?.primaryColor || '#3B82F6' }}
                        className="flex-1 py-2 text-white rounded-xl text-xs font-medium hover:opacity-90 transition-all flex items-center justify-center space-x-1"
                      >
                        <Store className="w-3.5 h-3.5" />
                        <span>View Live</span>
                        <ExternalLink className="w-3 h-3 ml-1 opacity-70" />
                      </button>

                      {/* ONLY show Edit button if current user OWNS this store */}
                      {isStoreOwner ? (
                        <button
                          onClick={() => handleEnterStudioWithSlug(store.subdomain)}
                          className="px-3 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold transition-colors flex items-center space-x-1 shrink-0"
                          title="Customize in Studio (Owner)"
                        >
                          <Palette className="w-3 h-3" />
                          <span>Edit</span>
                        </button>
                      ) : (
                        <span 
                          className="px-2.5 py-1.5 text-[10px] font-mono text-slate-400 bg-slate-950/80 border border-slate-800 rounded-xl flex items-center space-x-1 shrink-0" 
                          title="Published storefront - Only owner can customize"
                        >
                          <Lock className="w-3 h-3 text-slate-500" />
                          <span>Protected</span>
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-slate-900 text-center text-xs text-slate-500">
        <p>InstantStore &bull; Zero-Build Cloud Architecture &bull; MongoDB Atlas Live</p>
        <p className="mt-1 text-[11px] text-slate-600">Dual-Store: Clerk Google OAuth &bull; MongoDB Atlas Virtualization</p>
      </footer>
    </div>
  );
};
