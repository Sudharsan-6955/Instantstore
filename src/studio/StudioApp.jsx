import React, { useState, useEffect } from 'react';
import { useTenant } from '../context/TenantContext';
import { useAuth } from '../context/AuthContext';
import { StorefrontLayout } from '../storefront/StorefrontLayout';
import { ErrorBoundary } from '../components/ErrorBoundary';
import { LaunchModal } from './LaunchModal';
import { CloudinaryUploader } from '../components/CloudinaryUploader';
import { getStorefrontUrl } from '../utils/domain';
import { api } from '../services/api';
import confetti from 'canvas-confetti';
import { 
  Palette, 
  Layers, 
  Package, 
  Laptop, 
  Tablet, 
  Smartphone, 
  Save, 
  Rocket, 
  Sparkles, 
  Plus, 
  Check, 
  ExternalLink,
  Sun,
  Moon,
  Trash2,
  FileText,
  DollarSign,
  Loader2,
  Store,
  ChevronDown,
  Globe,
  Globe2,
  Copy,
  Eye,
  EyeOff,
  Briefcase,
  Layout,
  X
} from 'lucide-react';

const PRESET_COLORS = [
  { name: 'Indigo Modern', hex: '#6366F1' },
  { name: 'Amber Artisan', hex: '#D97706' },
  { name: 'Emerald Clean', hex: '#10B981' },
  { name: 'Rose Luxury', hex: '#F43F5E' },
  { name: 'Violet Studio', hex: '#8B5CF6' },
  { name: 'Zinc Brutalist', hex: '#09090B' },
];

const FONTS = ['Inter', 'Space Grotesk', 'Playfair Display', 'Plus Jakarta Sans'];

export const StudioApp = ({ onNavigateToStorefront, onOpenProfile }) => {
  const { 
    tenant, 
    products, 
    updateDraftIdentity,
    updateDraftTheme, 
    updateDraftBrand, 
    updateDraftPages, 
    updateDraftNavigation,
    saveDraftToCloud, 
    addProduct, 
    loadStore,
    isSaving,
    isLoading 
  } = useTenant();

  const { user } = useAuth();
  const [copiedDomain, setCopiedDomain] = useState(false);

  // Focus purely on frontend showcase pages: Brand & Theme, Multi-Pages, and Catalog
  const [activeTab, setActiveTab] = useState('brand'); // 'brand' | 'pages' | 'catalog'
  const [viewport, setViewport] = useState('desktop'); // 'desktop' | 'tablet' | 'mobile'
  const [previewPage, setPreviewPage] = useState('home');
  const [editingPageSlug, setEditingPageSlug] = useState('home');
  const [isAddPageOpen, setIsAddPageOpen] = useState(false);
  const [newPageTitle, setNewPageTitle] = useState('');
  const [newPageSlug, setNewPageSlug] = useState('');
  const [isLaunchModalOpen, setIsLaunchModalOpen] = useState(false);
  const [saveSuccessMessage, setSaveSuccessMessage] = useState('');
  const [availableStores, setAvailableStores] = useState([]);

  // Preset Industry Archetype Switcher
  const handleApplyTemplate = (templateKey) => {
    if (!tenant) return;
    if (templateKey === 'ecommerce') {
      updateDraftTheme({
        primaryColor: '#6366F1',
        secondaryColor: '#0F172A',
        accentColor: '#10B981',
        fontHeading: 'Space Grotesk',
        fontBody: 'Inter',
        borderRadius: '0.75rem',
        mode: 'dark',
      });
      updateDraftIdentity({
        tagline: 'Instant handcrafted storefront with zero build latency.',
      });
      const nav = [
        { id: '1', label: 'Home', path: '/', isVisible: true },
        { id: '2', label: 'Catalog', path: '/catalog', isVisible: true },
        { id: '3', label: 'About', path: '/about', isVisible: true },
        { id: '4', label: 'Contact', path: '/contact', isVisible: true },
      ];
      updateDraftNavigation(nav);
      setPreviewPage('home');
      setEditingPageSlug('home');
      setSaveSuccessMessage('Applied E-Commerce Storefront Template!');
      setTimeout(() => setSaveSuccessMessage(''), 3000);
    } else if (templateKey === 'portfolio') {
      updateDraftTheme({
        primaryColor: '#EC4899',
        secondaryColor: '#18181B',
        accentColor: '#8B5CF6',
        fontHeading: 'Playfair Display',
        fontBody: 'Inter',
        borderRadius: '1.25rem',
        mode: 'dark',
      });
      updateDraftIdentity({
        tagline: 'Curated architectural showcases, visual design, and creative works.',
      });
      let pages = [...(tenant.pages || [])];
      let portfolioPage = pages.find(p => p.slug === 'portfolio');
      if (!portfolioPage) {
        portfolioPage = {
          slug: 'portfolio',
          title: 'Portfolio',
          sections: [{
            type: 'story',
            title: 'Selected Creative Works',
            subtitle: 'Excellence in visual craft, brand design, and modern digital experiences.',
            content: 'We partner with visionary founders and brands to craft memorable experiences that inspire and endure.',
            imageUrl: 'https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?auto=format&fit=crop&w=1600&q=80',
            items: [
              { title: 'Brand Identity Systems', description: 'Comprehensive design guidelines and bespoke aesthetic direction.' },
              { title: 'Interactive Web Artifacts', description: 'Fluid zero-latency experiences rendered via modern edge architecture.' },
              { title: 'Art Direction & Photography', description: 'Editorial storytelling with high-contrast cinematic visuals.' }
            ]
          }]
        };
        pages.push(portfolioPage);
        updateDraftPages(pages);
      }
      const nav = [
        { id: '1', label: 'Home', path: '/', isVisible: true },
        { id: 'portfolio', label: 'Portfolio', path: '/portfolio', isVisible: true },
        { id: '3', label: 'About', path: '/about', isVisible: true },
        { id: '4', label: 'Contact', path: '/contact', isVisible: true },
        { id: '2', label: 'Catalog', path: '/catalog', isVisible: false },
      ];
      updateDraftNavigation(nav);
      setPreviewPage('portfolio');
      setEditingPageSlug('portfolio');
      setSaveSuccessMessage('Applied Creative Portfolio Template!');
      setTimeout(() => setSaveSuccessMessage(''), 3000);
    } else if (templateKey === 'landing') {
      updateDraftTheme({
        primaryColor: '#10B981',
        secondaryColor: '#0F172A',
        accentColor: '#3B82F6',
        fontHeading: 'Space Grotesk',
        fontBody: 'Plus Jakarta Sans',
        borderRadius: '0.5rem',
        mode: 'dark',
      });
      updateDraftIdentity({
        tagline: 'Next-generation zero-build platform engineered for global performance.',
      });
      let pages = [...(tenant.pages || [])];
      let servicesPage = pages.find(p => p.slug === 'services');
      if (!servicesPage) {
        servicesPage = {
          slug: 'services',
          title: 'Services',
          sections: [{
            type: 'hero',
            title: 'Enterprise Scalability & Solutions',
            subtitle: 'Engineered from first principles to eradicate latency and resource sprawl.',
            content: 'Our platform virtualizes database tenancy and edge host routing, enabling instant deployment without traditional container compilation.',
            imageUrl: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1600&q=80',
            items: [
              { title: 'Wildcard Edge Routing', description: 'Zero DNS latency via single wildcard record resolution.' },
              { title: 'Database Virtualization', description: 'Sub-millisecond query hydration with compound tenant keys.' },
              { title: 'High-Availability Ingress', description: 'Continuous multi-tenant fault isolation with 99.7% lower RAM.' }
            ]
          }]
        };
        pages.push(servicesPage);
        updateDraftPages(pages);
      }
      const nav = [
        { id: '1', label: 'Home', path: '/', isVisible: true },
        { id: 'services', label: 'Services', path: '/services', isVisible: true },
        { id: '3', label: 'About', path: '/about', isVisible: true },
        { id: '4', label: 'Contact', path: '/contact', isVisible: true },
        { id: '2', label: 'Catalog', path: '/catalog', isVisible: false },
      ];
      updateDraftNavigation(nav);
      setPreviewPage('services');
      setEditingPageSlug('services');
      setSaveSuccessMessage('Applied Business Landing Page Template!');
      setTimeout(() => setSaveSuccessMessage(''), 3000);
    }
  };

  // Toggle Page Visibility in Navigation (allows launching with ONLY Home & About, etc.)
  const handleTogglePageVisibility = (slug) => {
    const currentNav = tenant.navigation ? [...tenant.navigation] : [
      { id: '1', label: 'Home', path: '/', isVisible: true },
      { id: '2', label: 'Catalog', path: '/catalog', isVisible: true },
      { id: '3', label: 'About', path: '/about', isVisible: true },
      { id: '4', label: 'Contact', path: '/contact', isVisible: true },
    ];
    const path = slug === 'home' ? '/' : `/${slug}`;
    let item = currentNav.find(n => n.path === path || (n.path.replace('/', '') === slug));
    if (item) {
      item.isVisible = !item.isVisible;
    } else {
      currentNav.push({
        id: `nav_${Date.now()}`,
        label: slug.charAt(0).toUpperCase() + slug.slice(1),
        path,
        isVisible: true,
      });
    }
    updateDraftNavigation(currentNav);
  };

  // Add Custom Page (Enforces 5-page limit)
  const handleAddCustomPage = (e) => {
    e.preventDefault();
    if (!newPageTitle.trim()) return;
    const currentPages = tenant.pages || [];
    if (currentPages.length >= 5) {
      alert('Maximum 5 pages limit reached per website.');
      return;
    }
    const cleanSlug = (newPageSlug.trim() || newPageTitle.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '')).slice(0, 20);
    if (!cleanSlug) return;
    if (currentPages.some(p => p.slug === cleanSlug)) {
      alert(`A page with route '/${cleanSlug}' already exists.`);
      return;
    }
    const newPageObj = {
      slug: cleanSlug,
      title: newPageTitle.trim(),
      sections: [{
        id: `sec-${cleanSlug}-1`,
        type: 'text_block',
        title: newPageTitle.trim(),
        subtitle: `Explore ${newPageTitle.trim()} from ${tenant.name}.`,
        content: `Welcome to our ${newPageTitle.trim()} section. You can customize this paragraph directly in Merchant Studio.`,
        imageUrl: tenant.brand?.heroImage || 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1600&q=80',
        items: [
          { title: 'Specialized Expertise', description: 'Curated specifically for our clients and community.' },
          { title: 'Instant Live Sync', description: 'Zero build deployment running on wildcard edge infrastructure.' },
          { title: 'Verified Quality', description: 'Crafted with passion and backed by our merchant guarantee.' }
        ]
      }]
    };
    const updatedPages = [...currentPages, newPageObj];
    updateDraftPages(updatedPages);

    const currentNav = tenant.navigation ? [...tenant.navigation] : [];
    currentNav.push({
      id: `nav_${cleanSlug}`,
      label: newPageTitle.trim(),
      path: `/${cleanSlug}`,
      isVisible: true,
    });
    updateDraftNavigation(currentNav);

    setIsAddPageOpen(false);
    setNewPageTitle('');
    setNewPageSlug('');
    setEditingPageSlug(cleanSlug);
    setPreviewPage(cleanSlug);
    setSaveSuccessMessage(`Page '/${cleanSlug}' created successfully!`);
    setTimeout(() => setSaveSuccessMessage(''), 3000);
  };

  // Delete Custom Page
  const handleDeleteCustomPage = (slugToDelete) => {
    if (slugToDelete === 'home') {
      alert('Home page cannot be deleted as it serves as the platform root.');
      return;
    }
    if (!confirm(`Are you sure you want to delete the '/${slugToDelete}' page?`)) return;
    const updatedPages = (tenant.pages || []).filter(p => p.slug !== slugToDelete);
    updateDraftPages(updatedPages);

    const updatedNav = (tenant.navigation || []).filter(n => {
      const slug = n.path === '/' ? 'home' : n.path.replace('/', '');
      return slug !== slugToDelete;
    });
    updateDraftNavigation(updatedNav);

    if (previewPage === slugToDelete) setPreviewPage('home');
    if (editingPageSlug === slugToDelete) setEditingPageSlug('home');
    setSaveSuccessMessage(`Page '/${slugToDelete}' removed.`);
    setTimeout(() => setSaveSuccessMessage(''), 3000);
  };

  // Fetch available stores from Atlas for quick switching
  useEffect(() => {
    const fetchStores = async () => {
      try {
        const res = await api.getTenants();
        if (res.tenants) setAvailableStores(res.tenants);
      } catch (err) {
        console.error('Failed to load stores for studio selector:', err);
      }
    };
    fetchStores();
  }, []);

  // New Product Modal state
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);
  const [newProduct, setNewProduct] = useState({
    title: '',
    price: 49,
    compareAtPrice: 65,
    category: 'Accessories',
    images: ['https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=600&q=80'],
    description: 'High-quality handcrafted item.',
    inventory: 50,
    badge: 'New',
    isFeatured: true,
  });

  if (isLoading || !tenant) {
    return (
      <div className="min-h-[calc(100vh-3rem)] bg-slate-950 flex flex-col items-center justify-center p-6 text-center space-y-3">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-400" />
        <h3 className="text-base font-bold text-white">Loading Merchant Studio from MongoDB Atlas...</h3>
        <p className="text-xs text-slate-500 font-mono">Fetching theme and layout state</p>
      </div>
    );
  }

  const handleSaveToAtlas = async () => {
    try {
      await saveDraftToCloud();
      setSaveSuccessMessage('Draft saved to MongoDB Atlas!');
      setTimeout(() => setSaveSuccessMessage(''), 3000);
    } catch (err) {
      console.error('[Save to Atlas Error]', err);
      alert('Save failed: ' + (err.message || 'Please verify connection.'));
    }
  };

  const handleLaunchStore = async () => {
    try {
      await saveDraftToCloud();
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.5 }
      });
      setIsLaunchModalOpen(true);
    } catch (err) {
      console.error('[Launch Store Error]', err);
      alert('Launch failed: ' + (err.message || 'Please verify connection.'));
    }
  };

  const handleCreateProduct = async (e) => {
    e.preventDefault();
    if (!newProduct.title || !newProduct.price) return;
    try {
      await addProduct(newProduct);
      setIsAddProductOpen(false);
      setSaveSuccessMessage('Product committed to catalog!');
      setTimeout(() => setSaveSuccessMessage(''), 3000);
      setNewProduct({
        title: '',
        price: 49,
        compareAtPrice: 65,
        category: 'Accessories',
        images: ['https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=600&q=80'],
        description: 'High-quality handcrafted item.',
        inventory: 50,
        badge: 'New',
        isFeatured: true,
      });
    } catch (err) {
      console.error('[Add Product Error]', err);
      alert('Failed to add product: ' + (err.message || 'Error occurred.'));
    }
  };

  return (
    <div className="min-h-[calc(100vh-3rem)] flex flex-col bg-slate-950 overflow-hidden text-xs text-slate-200">
      {/* Studio Top Control Ribbon */}
      <div className="h-14 bg-slate-900 border-b border-slate-800 px-4 flex items-center justify-between shrink-0">
        <div className="flex items-center space-x-3">
          {/* Store Switcher Dropdown */}
          <div className="flex items-center space-x-2">
            <div 
              style={{ backgroundColor: tenant.theme?.primaryColor || '#3B82F6' }}
              className="w-7 h-7 rounded-lg flex items-center justify-center text-white font-bold text-xs shadow"
            >
              {tenant.name?.[0] || 'S'}
            </div>
            
            <div className="relative group">
              <button className="flex items-center space-x-1.5 hover:text-white transition-colors">
                <span className="font-bold text-white text-sm">{tenant.name}</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {availableStores.length > 0 && (
                <div className="absolute left-0 top-full mt-1 w-48 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl p-1 z-50 hidden group-hover:block animate-fadeIn">
                  <div className="px-2 py-1 text-[10px] text-slate-500 uppercase font-semibold">Switch Store</div>
                  {availableStores.map((st) => (
                    <button
                      key={st.subdomain}
                      onClick={() => loadStore(st.subdomain)}
                      className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs hover:bg-slate-800 flex items-center justify-between text-slate-300 hover:text-white"
                    >
                      <span className="truncate">{st.name}</span>
                      <span className="text-[10px] font-mono text-slate-500">{st.subdomain}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <span className="hidden sm:inline-flex px-2 py-0.5 bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 rounded-full text-[10px] font-mono">
            {tenant.isNewStore ? 'NEW_DRAFT_READY' : 'ATLAS_SYNCED'}
          </span>
        </div>

        {/* Viewport & Preview Page Selectors */}
        <div className="hidden md:flex items-center space-x-2">
          {/* Page Preview Switcher */}
          <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800">
            {tenant.pages?.map((p) => {
              const navItem = tenant.navigation?.find(n => (n.path === '/' ? 'home' : n.path.replace('/', '')) === p.slug);
              const isHidden = navItem && navItem.isVisible === false;
              return (
                <button
                  key={p.slug}
                  onClick={() => {
                    setPreviewPage(p.slug);
                    setEditingPageSlug(p.slug);
                  }}
                  className={`px-2.5 py-1 rounded-lg capitalize font-medium transition-all flex items-center space-x-1 ${
                    previewPage === p.slug
                      ? 'bg-slate-800 text-white font-semibold'
                      : isHidden
                      ? 'text-slate-600 line-through'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <span>{p.title || p.slug}</span>
                  {isHidden && <span className="text-[9px] text-amber-500/80 font-mono">(off)</span>}
                </button>
              );
            })}
          </div>

          {/* Viewport Switcher */}
          <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 text-slate-400">
            <button
              onClick={() => setViewport('desktop')}
              className={`p-1.5 rounded-lg transition-colors ${
                viewport === 'desktop' ? 'bg-indigo-600 text-white' : 'hover:text-white'
              }`}
              title="Desktop View"
            >
              <Laptop className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewport('tablet')}
              className={`p-1.5 rounded-lg transition-colors ${
                viewport === 'tablet' ? 'bg-indigo-600 text-white' : 'hover:text-white'
              }`}
              title="Tablet View (768px)"
            >
              <Tablet className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewport('mobile')}
              className={`p-1.5 rounded-lg transition-colors ${
                viewport === 'mobile' ? 'bg-indigo-600 text-white' : 'hover:text-white'
              }`}
              title="Mobile View (375px)"
            >
              <Smartphone className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Action Buttons: Save & Launch */}
        <div className="flex items-center space-x-2">
          {saveSuccessMessage && (
            <span className="text-emerald-400 font-medium text-xs flex items-center space-x-1 animate-fadeIn">
              <Check className="w-3.5 h-3.5" />
              <span>{saveSuccessMessage}</span>
            </span>
          )}

          {onOpenProfile && (
            <button
              onClick={onOpenProfile}
              className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl font-medium transition-colors flex items-center space-x-1.5 cursor-pointer"
              title="View all your launched stores & profile"
            >
              <Store className="w-3.5 h-3.5 text-indigo-400" />
              <span>My Websites</span>
            </button>
          )}

          <button
            onClick={handleSaveToAtlas}
            disabled={isSaving}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl font-medium transition-colors flex items-center space-x-1.5"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{isSaving ? 'Saving...' : 'Save Draft'}</span>
          </button>

          <button
            onClick={handleLaunchStore}
            className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white font-bold rounded-xl transition-all shadow-lg shadow-emerald-500/20 flex items-center space-x-1.5"
          >
            <Rocket className="w-3.5 h-3.5" />
            <span>Launch Store (&lt;50ms)</span>
          </button>
        </div>
      </div>

      {/* Split-Screen Workspace */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Side: Merchant Studio Controls (420px wide) */}
        <div className="w-full md:w-[420px] bg-slate-900/90 border-r border-slate-800 flex flex-col shrink-0">
          {/* Navigation Tabs - Focused purely on Frontend Showcase */}
          <div className="flex border-b border-slate-800 bg-slate-900 shrink-0">
            <button
              onClick={() => setActiveTab('brand')}
              className={`flex-1 py-3 text-center font-medium border-b-2 flex items-center justify-center space-x-1.5 transition-all ${
                activeTab === 'brand'
                  ? 'border-indigo-500 text-indigo-400 bg-indigo-500/5'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Palette className="w-3.5 h-3.5" />
              <span>Theme</span>
            </button>

            <button
              onClick={() => setActiveTab('pages')}
              className={`flex-1 py-3 text-center font-medium border-b-2 flex items-center justify-center space-x-1.5 transition-all ${
                activeTab === 'pages'
                  ? 'border-indigo-500 text-indigo-400 bg-indigo-500/5'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Pages</span>
            </button>

            <button
              onClick={() => setActiveTab('catalog')}
              className={`flex-1 py-3 text-center font-medium border-b-2 flex items-center justify-center space-x-1.5 transition-all ${
                activeTab === 'catalog'
                  ? 'border-indigo-500 text-indigo-400 bg-indigo-500/5'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Package className="w-3.5 h-3.5" />
              <span>Catalog ({products?.length || 0})</span>
            </button>
          </div>

          {/* Tab Content Panels (Scrollable) */}
          <div className="flex-1 overflow-y-auto p-4 space-y-6">
            {/* TAB 1: THEME & BRAND CUSTOMIZER */}
            {activeTab === 'brand' && (
              <div className="space-y-6 animate-fadeIn">
                {/* Preset Website Archetypes */}
                <div className="p-3.5 bg-gradient-to-br from-indigo-950/40 via-slate-900/60 to-purple-950/40 border border-indigo-500/30 rounded-2xl space-y-2.5">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-white uppercase tracking-wider text-[11px] flex items-center space-x-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                      <span>Preset Website Archetypes</span>
                    </h4>
                    <span className="text-[10px] text-indigo-300 font-mono">1-Click Apply</span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Switch between pre-built zero-build architectures tailored for your use-case:
                  </p>

                  <div className="grid grid-cols-3 gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => handleApplyTemplate('ecommerce')}
                      className="p-2.5 rounded-xl border border-slate-800 bg-slate-900/80 hover:bg-indigo-600/20 hover:border-indigo-500/50 text-left transition-all group cursor-pointer"
                    >
                      <div className="text-base mb-1">🛍️</div>
                      <div className="font-bold text-slate-200 text-[11px] group-hover:text-white">Storefront</div>
                      <div className="text-[9px] text-slate-500">Catalog + Products</div>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleApplyTemplate('portfolio')}
                      className="p-2.5 rounded-xl border border-slate-800 bg-slate-900/80 hover:bg-pink-600/20 hover:border-pink-500/50 text-left transition-all group cursor-pointer"
                    >
                      <div className="text-base mb-1">🎨</div>
                      <div className="font-bold text-slate-200 text-[11px] group-hover:text-white">Portfolio</div>
                      <div className="text-[9px] text-slate-500">Works + Creative</div>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleApplyTemplate('landing')}
                      className="p-2.5 rounded-xl border border-slate-800 bg-slate-900/80 hover:bg-emerald-600/20 hover:border-emerald-500/50 text-left transition-all group cursor-pointer"
                    >
                      <div className="text-base mb-1">🚀</div>
                      <div className="font-bold text-slate-200 text-[11px] group-hover:text-white">Business</div>
                      <div className="text-[9px] text-slate-500">Services + SaaS</div>
                    </button>
                  </div>
                </div>

                {/* Store Identity */}
                <div className="space-y-3">
                  <h4 className="font-bold text-slate-100 uppercase tracking-wider text-[11px]">Store Identity</h4>
                  
                  <div>
                    <label className="block text-slate-400 mb-1">Store Name (Display Title)</label>
                    <input
                      type="text"
                      value={tenant.name || ''}
                      onChange={(e) => updateDraftIdentity({ name: e.target.value })}
                      placeholder="e.g. Ram Super Store"
                      className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-indigo-500 font-medium"
                    />
                    <p className="text-[10px] text-slate-500 mt-1">
                      Display title shown to customers across header, hero, and pages.
                    </p>
                  </div>

                  {/* Assigned Edge Domain Card */}
                  <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-xl space-y-1.5">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-400 font-semibold flex items-center space-x-1.5">
                        <Globe2 className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Assigned Domain URL</span>
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono">
                        Edge Active
                      </span>
                    </div>

                    <div className="flex items-center justify-between gap-2 pt-0.5">
                      <span className="font-mono text-xs text-indigo-300 truncate">
                        {getStorefrontUrl(tenant.subdomain)}
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard.writeText(getStorefrontUrl(tenant.subdomain));
                          setCopiedDomain(true);
                          setTimeout(() => setCopiedDomain(false), 2000);
                        }}
                        className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] rounded-lg flex items-center space-x-1 shrink-0 transition-colors cursor-pointer"
                      >
                        <Copy className="w-3 h-3" />
                        <span>{copiedDomain ? 'Copied!' : 'Copy'}</span>
                      </button>
                    </div>

                    <p className="text-[10px] text-slate-500 leading-tight">
                      Unique subdomain prefix <strong className="text-slate-400 font-mono">{tenant.subdomain}</strong> routes directly to your database records via wildcard edge DNS.
                    </p>
                  </div>

                  <div>
                    <label className="block text-slate-400 mb-1">Tagline</label>
                    <input
                      type="text"
                      value={tenant.tagline || ''}
                      onChange={(e) => updateDraftIdentity({ tagline: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  {/* Cloudinary Store Logo Uploader */}
                  <div className="pt-1">
                    <CloudinaryUploader
                      label="Store Logo"
                      currentValue={tenant.brand?.logoUrl || ''}
                      onUploadSuccess={(url) => updateDraftBrand({ logoUrl: url })}
                      recommendedSize="Square or transparent PNG (e.g. 250x250px)"
                      aspectRatio="square"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 mb-1">Top Announcement Message</label>
                    <input
                      type="text"
                      value={tenant.brand?.announcement || ''}
                      onChange={(e) => updateDraftBrand({ announcement: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                {/* Color Palette */}
                <div className="space-y-3">
                  <h4 className="font-bold text-slate-100 uppercase tracking-wider text-[11px]">Primary Brand Color</h4>
                  <div className="grid grid-cols-3 gap-2">
                    {PRESET_COLORS.map((col) => (
                      <button
                        key={col.hex}
                        onClick={() => updateDraftTheme({ primaryColor: col.hex })}
                        className={`p-2 rounded-xl border flex items-center space-x-2 transition-all ${
                          tenant.theme?.primaryColor === col.hex
                            ? 'border-white bg-slate-800'
                            : 'border-slate-800 bg-slate-900/60 hover:bg-slate-800'
                        }`}
                      >
                        <span className="w-3.5 h-3.5 rounded-full shrink-0" style={{ backgroundColor: col.hex }} />
                        <span className="text-[11px] truncate">{col.name}</span>
                      </button>
                    ))}
                  </div>

                  <div className="flex items-center space-x-2 pt-1">
                    <input
                      type="color"
                      value={tenant.theme?.primaryColor || '#3B82F6'}
                      onChange={(e) => updateDraftTheme({ primaryColor: e.target.value })}
                      className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border-0"
                    />
                    <input
                      type="text"
                      value={tenant.theme?.primaryColor || '#3B82F6'}
                      onChange={(e) => updateDraftTheme({ primaryColor: e.target.value })}
                      className="w-28 px-2 py-1 bg-slate-800 border border-slate-700 rounded-lg font-mono text-white"
                    />
                    <span className="text-slate-500 text-[11px]">Custom Hex</span>
                  </div>
                </div>

                {/* Typography Pairing */}
                <div className="space-y-3">
                  <h4 className="font-bold text-slate-100 uppercase tracking-wider text-[11px]">Typography Pairing</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {FONTS.map((font) => (
                      <button
                        key={font}
                        onClick={() => updateDraftTheme({ fontHeading: font, fontBody: font })}
                        className={`p-2.5 rounded-xl border text-left transition-all ${
                          tenant.theme?.fontHeading === font
                            ? 'border-indigo-500 bg-indigo-500/10 text-indigo-300 font-semibold'
                            : 'border-slate-800 bg-slate-900 hover:bg-slate-800 text-slate-300'
                        }`}
                      >
                        <div className="text-xs" style={{ fontFamily: font }}>{font}</div>
                        <div className="text-[10px] text-slate-500">Google Font</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Border Radius & Mode */}
                <div className="space-y-3">
                  <h4 className="font-bold text-slate-100 uppercase tracking-wider text-[11px]">Storefront Atmosphere</h4>
                  
                  <div className="flex items-center justify-between p-3 bg-slate-800/60 border border-slate-700 rounded-xl">
                    <span className="font-medium text-slate-200">Store Theme Mode</span>
                    <button
                      onClick={() => updateDraftTheme({ mode: tenant.theme?.mode === 'dark' ? 'light' : 'dark' })}
                      className="px-3 py-1 bg-slate-700 hover:bg-slate-600 rounded-lg text-white font-medium flex items-center space-x-1.5 transition-colors"
                    >
                      {tenant.theme?.mode === 'dark' ? (
                        <>
                          <Moon className="w-3.5 h-3.5 text-indigo-400" />
                          <span>Dark Mode</span>
                        </>
                      ) : (
                        <>
                          <Sun className="w-3.5 h-3.5 text-amber-400" />
                          <span>Light Mode</span>
                        </>
                      )}
                    </button>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-slate-400">Corner Radius ({tenant.theme?.borderRadius || '0.75rem'})</label>
                    <div className="grid grid-cols-4 gap-1.5 text-center">
                      {[
                        { label: 'Sharp', val: '0px' },
                        { label: 'Subtle', val: '0.375rem' },
                        { label: 'Round', val: '0.75rem' },
                        { label: 'Pill', val: '1.5rem' },
                      ].map((r) => (
                        <button
                          key={r.val}
                          onClick={() => updateDraftTheme({ borderRadius: r.val })}
                          className={`py-1.5 rounded-lg border text-[11px] ${
                            tenant.theme?.borderRadius === r.val
                              ? 'bg-indigo-600 border-indigo-500 text-white'
                              : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'
                          }`}
                        >
                          {r.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: MULTI-PAGE BUILDER & ROUTING */}
            {activeTab === 'pages' && (
              <div className="space-y-6 animate-fadeIn">
                {/* Pages Architecture & Routing Control */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-slate-100 uppercase tracking-wider text-[11px]">Store Pages & Routing</h4>
                      <p className="text-[10px] text-slate-400">Manage pages, routes, and visibility ({tenant.pages?.length || 4}/5 max)</p>
                    </div>
                    {(tenant.pages?.length || 4) < 5 && (
                      <button
                        type="button"
                        onClick={() => setIsAddPageOpen(!isAddPageOpen)}
                        className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-[11px] font-semibold flex items-center space-x-1 transition-colors cursor-pointer"
                      >
                        <Plus className="w-3 h-3" />
                        <span>Add Page</span>
                      </button>
                    )}
                  </div>

                  {/* Add Page Modal / Inline Form */}
                  {isAddPageOpen && (
                    <form onSubmit={handleAddCustomPage} className="p-3 bg-slate-900 border border-indigo-500/40 rounded-xl space-y-2.5 animate-fadeIn">
                      <div className="flex items-center justify-between font-bold text-white text-[11px]">
                        <span>Add New Page (Route)</span>
                        <button type="button" onClick={() => setIsAddPageOpen(false)} className="text-slate-400 hover:text-white">
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-slate-400 text-[10px] mb-1">Page Title</label>
                          <input
                            type="text"
                            placeholder="e.g. Services"
                            value={newPageTitle}
                            onChange={(e) => {
                              setNewPageTitle(e.target.value);
                              if (!newPageSlug) {
                                setNewPageSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]/g, '-').slice(0, 15));
                              }
                            }}
                            className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-white text-xs focus:outline-none focus:border-indigo-500"
                          />
                        </div>
                        <div>
                          <label className="block text-slate-400 text-[10px] mb-1">Route Path</label>
                          <div className="flex items-center px-2 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-xs">
                            <span className="text-slate-500 font-mono">/</span>
                            <input
                              type="text"
                              placeholder="services"
                              value={newPageSlug}
                              onChange={(e) => setNewPageSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                              className="w-full bg-transparent text-white font-mono focus:outline-none ml-1"
                            />
                          </div>
                        </div>
                      </div>

                      <button
                        type="submit"
                        disabled={!newPageTitle.trim()}
                        className="w-full py-1.5 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 text-white rounded-lg font-bold text-xs transition-colors"
                      >
                        Create Route & Page
                      </button>
                    </form>
                  )}

                  {/* Page List & Visibility Controls */}
                  <div className="space-y-1.5">
                    {tenant.pages?.map((p) => {
                      const navItem = tenant.navigation?.find(n => (n.path === '/' ? 'home' : n.path.replace('/', '')) === p.slug);
                      const isVisible = navItem ? navItem.isVisible !== false : true;
                      const isHome = p.slug === 'home';

                      return (
                        <div
                          key={p.slug}
                          className={`p-2.5 rounded-xl border flex items-center justify-between transition-all ${
                            editingPageSlug === p.slug
                              ? 'bg-slate-800/80 border-indigo-500'
                              : 'bg-slate-900/60 border-slate-800'
                          }`}
                        >
                          <div
                            onClick={() => {
                              setEditingPageSlug(p.slug);
                              setPreviewPage(p.slug);
                            }}
                            className="flex items-center space-x-2.5 min-w-0 cursor-pointer flex-1"
                          >
                            <div className="w-6 h-6 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 shrink-0">
                              <FileText className="w-3.5 h-3.5" />
                            </div>
                            <div className="min-w-0">
                              <div className="font-semibold text-slate-200 text-xs truncate flex items-center space-x-1.5">
                                <span>{p.title || p.slug}</span>
                                {isHome && (
                                  <span className="px-1.5 py-0.2 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded text-[9px] font-mono">
                                    Root
                                  </span>
                                )}
                              </div>
                              <div className="text-[10px] text-slate-500 font-mono">
                                /{p.slug === 'home' ? '' : p.slug}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center space-x-1.5 shrink-0">
                            {/* Visibility Toggle (enables launching with only Home & About, etc.) */}
                            <button
                              type="button"
                              onClick={() => handleTogglePageVisibility(p.slug)}
                              title={isVisible ? 'Hide page from store navigation' : 'Show page in store navigation'}
                              className={`p-1.5 rounded-lg border transition-colors ${
                                isVisible
                                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                                  : 'bg-slate-800 text-slate-500 border-slate-700'
                              }`}
                            >
                              {isVisible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                            </button>

                            {/* Delete custom page */}
                            {!isHome && (
                              <button
                                type="button"
                                onClick={() => handleDeleteCustomPage(p.slug)}
                                title="Delete page"
                                className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-slate-800 transition-colors"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Page Content Editor for Active Page */}
                <div className="border-t border-slate-800/80 pt-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-white uppercase tracking-wider text-[11px] flex items-center space-x-1.5">
                      <span>Editing Content:</span>
                      <span className="text-indigo-400 font-mono capitalize">/{editingPageSlug === 'home' ? '' : editingPageSlug}</span>
                    </h4>
                    <button
                      type="button"
                      onClick={() => setPreviewPage(editingPageSlug)}
                      className="text-[10px] text-indigo-400 hover:text-indigo-300 underline font-mono"
                    >
                      Focus Preview
                    </button>
                  </div>

                  {/* 1. HOME PAGE CONTENT EDITOR */}
                  {editingPageSlug === 'home' && (
                    <div className="p-3.5 bg-slate-800/40 border border-slate-800 rounded-2xl space-y-3">
                      <div>
                        <label className="block text-slate-400 mb-1">Headline</label>
                        <input
                          type="text"
                          defaultValue={tenant.pages?.find(p => p.slug === 'home')?.sections?.[0]?.title || tenant.name}
                          onChange={(e) => {
                            const pages = [...(tenant.pages || [])];
                            const home = pages.find(p => p.slug === 'home');
                            if (home && home.sections?.[0]) home.sections[0].title = e.target.value;
                            updateDraftPages(pages);
                          }}
                          className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white"
                        />
                      </div>

                      <div>
                        <label className="block text-slate-400 mb-1">Hero Subtitle</label>
                        <textarea
                          rows={2}
                          defaultValue={tenant.pages?.find(p => p.slug === 'home')?.sections?.[0]?.subtitle || tenant.tagline}
                          onChange={(e) => {
                            const pages = [...(tenant.pages || [])];
                            const home = pages.find(p => p.slug === 'home');
                            if (home && home.sections?.[0]) home.sections[0].subtitle = e.target.value;
                            updateDraftPages(pages);
                          }}
                          className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white"
                        />
                      </div>

                      {/* Cloudinary Hero Banner Background Uploader */}
                      <CloudinaryUploader
                        label="Hero Banner Background"
                        currentValue={tenant.brand?.heroImage || ''}
                        onUploadSuccess={(url) => {
                          updateDraftBrand({ heroImage: url });
                          const pages = [...(tenant.pages || [])];
                          const home = pages.find(p => p.slug === 'home');
                          if (home && home.sections?.[0]) home.sections[0].imageUrl = url;
                          updateDraftPages(pages);
                        }}
                        recommendedSize="1600x800px landscape"
                        aspectRatio="banner"
                      />
                    </div>
                  )}

                  {/* 2. ABOUT PAGE CONTENT EDITOR */}
                  {editingPageSlug === 'about' && (
                    <div className="p-3.5 bg-slate-800/40 border border-slate-800 rounded-2xl space-y-3">
                      <div>
                        <label className="block text-slate-400 mb-1">Brand Story Headline</label>
                        <input
                          type="text"
                          defaultValue={tenant.pages?.find(p => p.slug === 'about')?.sections?.[0]?.title || `The Story of ${tenant.name}`}
                          onChange={(e) => {
                            const pages = [...(tenant.pages || [])];
                            const about = pages.find(p => p.slug === 'about');
                            if (about && about.sections?.[0]) about.sections[0].title = e.target.value;
                            updateDraftPages(pages);
                          }}
                          className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white"
                        />
                      </div>

                      <div>
                        <label className="block text-slate-400 mb-1">Brand Story Paragraph</label>
                        <textarea
                          rows={4}
                          defaultValue={tenant.pages?.find(p => p.slug === 'about')?.sections?.[0]?.content || 'Our mission is to create exceptional goods...'}
                          onChange={(e) => {
                            const pages = [...(tenant.pages || [])];
                            const about = pages.find(p => p.slug === 'about');
                            if (about && about.sections?.[0]) about.sections[0].content = e.target.value;
                            updateDraftPages(pages);
                          }}
                          className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white"
                        />
                      </div>

                      {/* Cloudinary About Story Image */}
                      <CloudinaryUploader
                        label="About Story Photo"
                        currentValue={tenant.pages?.find(p => p.slug === 'about')?.sections?.[0]?.imageUrl || ''}
                        onUploadSuccess={(url) => {
                          const pages = [...(tenant.pages || [])];
                          const about = pages.find(p => p.slug === 'about');
                          if (about && about.sections?.[0]) about.sections[0].imageUrl = url;
                          updateDraftPages(pages);
                        }}
                        recommendedSize="1200x800px story photo"
                        aspectRatio="banner"
                      />
                    </div>
                  )}

                  {/* 3. CONTACT PAGE CONTENT EDITOR */}
                  {editingPageSlug === 'contact' && (
                    <div className="p-3.5 bg-slate-800/40 border border-slate-800 rounded-2xl space-y-3">
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-slate-400 mb-1">Support Email</label>
                          <input
                            type="text"
                            defaultValue={tenant.contact?.email || ''}
                            onChange={(e) => updateDraftTheme({ contact: { ...(tenant.contact || {}), email: e.target.value } })}
                            className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white text-[11px]"
                          />
                        </div>
                        <div>
                          <label className="block text-slate-400 mb-1">Phone</label>
                          <input
                            type="text"
                            defaultValue={tenant.contact?.phone || ''}
                            onChange={(e) => updateDraftTheme({ contact: { ...(tenant.contact || {}), phone: e.target.value } })}
                            className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white text-[11px]"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-slate-400 mb-1">Office / Store Address</label>
                        <input
                          type="text"
                          defaultValue={tenant.contact?.address || ''}
                          onChange={(e) => updateDraftTheme({ contact: { ...(tenant.contact || {}), address: e.target.value } })}
                          className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white text-[11px]"
                        />
                      </div>
                    </div>
                  )}

                  {/* 4. CATALOG PAGE CONTENT EDITOR */}
                  {editingPageSlug === 'catalog' && (
                    <div className="p-3.5 bg-slate-800/40 border border-slate-800 rounded-2xl space-y-3">
                      <p className="text-slate-400 text-xs">
                        The Catalog page dynamically displays your active products. You can manage individual catalog items and upload Cloudinary photos in the <strong className="text-white">Catalog</strong> tab.
                      </p>
                    </div>
                  )}

                  {/* 5. DYNAMIC CUSTOM PAGE EDITOR (Portfolio, Services, etc.) */}
                  {!['home', 'about', 'contact', 'catalog'].includes(editingPageSlug) && (
                    <div className="p-3.5 bg-slate-800/40 border border-slate-800 rounded-2xl space-y-3">
                      <div>
                        <label className="block text-slate-400 mb-1">Section Title</label>
                        <input
                          type="text"
                          defaultValue={tenant.pages?.find(p => p.slug === editingPageSlug)?.sections?.[0]?.title || ''}
                          onChange={(e) => {
                            const pages = [...(tenant.pages || [])];
                            const curPage = pages.find(p => p.slug === editingPageSlug);
                            if (curPage && curPage.sections?.[0]) curPage.sections[0].title = e.target.value;
                            updateDraftPages(pages);
                          }}
                          className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white"
                        />
                      </div>

                      <div>
                        <label className="block text-slate-400 mb-1">Subtitle / Tagline</label>
                        <input
                          type="text"
                          defaultValue={tenant.pages?.find(p => p.slug === editingPageSlug)?.sections?.[0]?.subtitle || ''}
                          onChange={(e) => {
                            const pages = [...(tenant.pages || [])];
                            const curPage = pages.find(p => p.slug === editingPageSlug);
                            if (curPage && curPage.sections?.[0]) curPage.sections[0].subtitle = e.target.value;
                            updateDraftPages(pages);
                          }}
                          className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white"
                        />
                      </div>

                      <div>
                        <label className="block text-slate-400 mb-1">Detailed Content Paragraph</label>
                        <textarea
                          rows={4}
                          defaultValue={tenant.pages?.find(p => p.slug === editingPageSlug)?.sections?.[0]?.content || ''}
                          onChange={(e) => {
                            const pages = [...(tenant.pages || [])];
                            const curPage = pages.find(p => p.slug === editingPageSlug);
                            if (curPage && curPage.sections?.[0]) curPage.sections[0].content = e.target.value;
                            updateDraftPages(pages);
                          }}
                          className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white"
                        />
                      </div>

                      <CloudinaryUploader
                        label="Hero / Showcase Banner Photo"
                        currentValue={tenant.pages?.find(p => p.slug === editingPageSlug)?.sections?.[0]?.imageUrl || ''}
                        onUploadSuccess={(url) => {
                          const pages = [...(tenant.pages || [])];
                          const curPage = pages.find(p => p.slug === editingPageSlug);
                          if (curPage && curPage.sections?.[0]) curPage.sections[0].imageUrl = url;
                          updateDraftPages(pages);
                        }}
                        recommendedSize="1600x800px landscape"
                        aspectRatio="banner"
                      />
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB 3: PRODUCT CATALOG MANAGER */}
            {activeTab === 'catalog' && (
              <div className="space-y-4 animate-fadeIn">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-slate-100 uppercase tracking-wider text-[11px]">Product Catalog</h4>
                    <p className="text-[10px] text-slate-400">Scoped strictly to {tenant.subdomain}</p>
                  </div>
                  <button
                    onClick={() => setIsAddProductOpen(!isAddProductOpen)}
                    style={{ backgroundColor: tenant.theme?.primaryColor || '#3B82F6' }}
                    className="px-3 py-1.5 text-white rounded-xl font-medium flex items-center space-x-1 shadow"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>{isAddProductOpen ? 'Close Form' : 'Add Item'}</span>
                  </button>
                </div>

                {/* Add Product Inline Form with Cloudinary */}
                {isAddProductOpen && (
                  <form onSubmit={handleCreateProduct} className="p-4 bg-slate-800/80 border border-slate-700 rounded-2xl space-y-3 animate-fadeIn">
                    <h5 className="font-bold text-white text-xs">New Product Details</h5>
                    
                    <div>
                      <label className="block text-slate-400 mb-1">Title</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Ergonomic Desk Mat"
                        value={newProduct.title}
                        onChange={(e) => setNewProduct({ ...newProduct, title: e.target.value })}
                        className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-xl text-white"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-slate-400 mb-1">Price ($)</label>
                        <input
                          type="number"
                          required
                          value={newProduct.price}
                          onChange={(e) => setNewProduct({ ...newProduct, price: Number(e.target.value) })}
                          className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-xl text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-400 mb-1">Category</label>
                        <input
                          type="text"
                          value={newProduct.category}
                          onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                          className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-xl text-white"
                        />
                      </div>
                    </div>

                    {/* Product Photo via Cloudinary */}
                    <div className="pt-1">
                      <CloudinaryUploader
                        label="Product Photo (Cloudinary)"
                        currentValue={newProduct.images?.[0] || ''}
                        onUploadSuccess={(url) => setNewProduct({ ...newProduct, images: [url] })}
                        recommendedSize="Square 800x800px product photo"
                        aspectRatio="square"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-slate-400 mb-1">Inventory Count</label>
                        <input
                          type="number"
                          value={newProduct.inventory}
                          onChange={(e) => setNewProduct({ ...newProduct, inventory: Number(e.target.value) })}
                          className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-xl text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-400 mb-1">Badge (Optional)</label>
                        <input
                          type="text"
                          placeholder="e.g. Bestseller, New"
                          value={newProduct.badge}
                          onChange={(e) => setNewProduct({ ...newProduct, badge: e.target.value })}
                          className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-xl text-white"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      style={{ backgroundColor: tenant.theme?.primaryColor || '#3B82F6' }}
                      className="w-full py-2 text-white font-semibold rounded-xl shadow mt-2"
                    >
                      Commit Product to Catalog
                    </button>
                  </form>
                )}

                {/* Product List */}
                <div className="space-y-2">
                  {products?.length === 0 ? (
                    <div className="p-6 text-center border border-dashed border-slate-800 rounded-xl text-slate-500">
                      No products in this store catalog yet. Click "+ Add Item" above to add products with Cloudinary photos!
                    </div>
                  ) : (
                    products?.map((prod) => (
                      <div
                        key={prod._id}
                        className="p-2.5 bg-slate-800/40 border border-slate-800 rounded-xl flex items-center justify-between gap-3"
                      >
                        <img
                          src={prod.images?.[0] || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=600&q=80'}
                          alt={prod.title}
                          className="w-10 h-10 rounded-lg object-cover bg-slate-950 shrink-0 border border-slate-700/60"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-slate-200 truncate">{prod.title}</div>
                          <div className="text-[10px] text-slate-400 flex items-center space-x-2">
                            <span className="text-white font-bold">${prod.price}</span>
                            <span>•</span>
                            <span>{prod.category}</span>
                            {prod.badge && <span className="text-amber-400">({prod.badge})</span>}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Responsive Live Preview Frame */}
        <div className="flex-1 bg-slate-950 p-4 sm:p-6 flex flex-col items-center justify-start overflow-y-auto">
          <div
            className={`transition-all duration-300 shadow-2xl overflow-hidden border border-slate-800 rounded-2xl ${
              viewport === 'desktop'
                ? 'w-full max-w-5xl'
                : viewport === 'tablet'
                ? 'w-[768px]'
                : 'w-[375px]'
            }`}
          >
            {/* Mock Browser Frame Header */}
            <div className="h-8 bg-slate-900 border-b border-slate-800 px-3 flex items-center justify-between select-none">
              <div className="flex items-center space-x-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80" />
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
              </div>
              <div className="px-3 py-0.5 bg-slate-950 text-slate-400 text-[10px] font-mono rounded-md border border-slate-800 flex items-center space-x-1">
                <span>{getStorefrontUrl(tenant.subdomain)}/{previewPage !== 'home' ? previewPage : ''}</span>
              </div>
              <div className="text-[10px] text-slate-500 font-mono">0ms Hydration</div>
            </div>

            {/* Embedded Live Storefront Skeleton */}
            <div className="h-[75vh] overflow-y-auto">
              <ErrorBoundary>
                <StorefrontLayout previewMode={true} previewPage={previewPage} viewport={viewport} />
              </ErrorBoundary>
            </div>
          </div>
        </div>
      </div>

      {/* Launch Confirmation Modal */}
      <LaunchModal
        isOpen={isLaunchModalOpen}
        onClose={() => setIsLaunchModalOpen(false)}
        onOpenStorefront={onNavigateToStorefront}
      />
    </div>
  );
};
