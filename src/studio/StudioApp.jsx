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
    updateDraftContact,
    saveDraftToCloud, 
    addProduct, 
    deleteProduct,
    clearAllProducts,
    loadStore,
    isSaving,
    isLoading 
  } = useTenant();

  const { user } = useAuth();
  const [copiedDomain, setCopiedDomain] = useState(false);

  // Focus purely on frontend showcase pages: Brand & Theme, Multi-Pages, and Catalog
  const [activeTab, setActiveTab] = useState('brand'); // 'brand' | 'pages' | 'catalog'
  const [catalogMode, setCatalogMode] = useState(() => {
    return (tenant?.archetype === 'portfolio' || tenant?.pages?.some(p => p.slug === 'portfolio')) ? 'portfolio' : 'ecommerce';
  });
  const [viewport, setViewport] = useState('desktop'); // 'desktop' | 'tablet' | 'mobile'
  const [previewPage, setPreviewPage] = useState('home');
  const [editingPageSlug, setEditingPageSlug] = useState('home');
  const [isAddPageOpen, setIsAddPageOpen] = useState(false);
  const [newPageTitle, setNewPageTitle] = useState('');
  const [newPageSlug, setNewPageSlug] = useState('');
  const [isLaunchModalOpen, setIsLaunchModalOpen] = useState(false);
  const [saveSuccessMessage, setSaveSuccessMessage] = useState('');
  const [availableStores, setAvailableStores] = useState([]);

  // Portfolio projects state & helpers
  const [isAddProjectOpen, setIsAddProjectOpen] = useState(false);
  const [newProject, setNewProject] = useState({
    title: '',
    category: '',
    description: '',
    imageUrl: '',
  });

  const portfolioPage = tenant?.pages?.find(p => p.slug === 'portfolio');
  const portfolioItems = portfolioPage?.sections?.[0]?.items || [];
  const homePage = tenant?.pages?.find(p => p.slug === 'home');
  const homeHero = homePage?.sections?.find(s => s.type === 'hero');
  const homeValueProps = homePage?.sections?.find(s => s.type === 'value_props');
  const isPortfolio = catalogMode === 'portfolio' || tenant?.archetype === 'portfolio' || tenant?.theme?.archetype === 'portfolio';

  const handleCreateProject = (e) => {
    e.preventDefault();
    if (!newProject.title.trim()) return;
    const pages = [...(tenant.pages || [])];
    let p = pages.find(pg => pg.slug === 'portfolio');
    if (!p) {
      p = {
        slug: 'portfolio',
        title: 'Portfolio',
        sections: [{
          type: 'story',
          title: 'Selected Creative Works',
          subtitle: 'Excellence in visual craft, brand design, and modern digital experiences.',
          items: []
        }]
      };
      pages.push(p);
    }
    if (!p.sections || p.sections.length === 0) {
      p.sections = [{ type: 'story', title: 'Selected Creative Works', items: [] }];
    }
    if (!p.sections[0].items) {
      p.sections[0].items = [];
    }
    p.sections[0].items.unshift({
      title: newProject.title.trim(),
      category: newProject.category.trim() || 'Creative Work',
      description: newProject.description.trim(),
      imageUrl: newProject.imageUrl.trim() || 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=800&q=80',
    });
    updateDraftPages(pages);
    setNewProject({ title: '', category: '', description: '', imageUrl: '' });
    setIsAddProjectOpen(false);
  };

  const handleDeleteProject = (indexToDelete) => {
    const pages = [...(tenant.pages || [])];
    let p = pages.find(pg => pg.slug === 'portfolio');
    if (p?.sections?.[0]?.items) {
      p.sections[0].items.splice(indexToDelete, 1);
      updateDraftPages(pages);
    }
  };

  const handleClearAllProjects = () => {
    const pages = [...(tenant.pages || [])];
    let p = pages.find(pg => pg.slug === 'portfolio');
    if (p?.sections?.[0]?.items) {
      p.sections[0].items = [];
      updateDraftPages(pages);
    }
  };

  const updateHomeHero = (updates) => {
    const pages = [...(tenant.pages || [])];
    let home = pages.find(p => p.slug === 'home');
    if (!home) {
      home = { slug: 'home', title: 'Home', sections: [{ type: 'hero', ...updates }] };
      pages.push(home);
    } else {
      if (!home.sections || home.sections.length === 0) {
        home.sections = [{ type: 'hero', ...updates }];
      } else {
        home.sections[0] = { ...home.sections[0], ...updates };
      }
    }
    updateDraftPages(pages);
  };

  const updateHomeValuePropsVisible = (isVisible) => {
    const pages = [...(tenant.pages || [])];
    let home = pages.find(p => p.slug === 'home');
    if (!home) {
      home = { slug: 'home', title: 'Home', sections: [] };
      pages.push(home);
    }
    if (!home.sections) home.sections = [];
    let vp = home.sections.find(s => s.type === 'value_props');
    if (!vp) {
      vp = {
        type: 'value_props',
        title: 'Highlights',
        isVisible,
        items: [
          { title: 'Express Global Delivery', description: 'Tracked carbon-neutral shipping' },
          { title: 'Direct Brand Warranty', description: '100% authentic merchant guarantee' },
          { title: 'Hassle-Free Returns', description: '30-day money-back guarantee' }
        ]
      };
      home.sections.push(vp);
    } else {
      vp.isVisible = isVisible;
    }
    updateDraftPages(pages);
  };

  const updateHomeValuePropCard = (cardIdx, updates) => {
    const pages = [...(tenant.pages || [])];
    let home = pages.find(p => p.slug === 'home');
    if (!home) {
      home = { slug: 'home', title: 'Home', sections: [] };
      pages.push(home);
    }
    if (!home.sections) home.sections = [];
    let vp = home.sections.find(s => s.type === 'value_props');
    if (!vp) {
      vp = {
        type: 'value_props',
        title: 'Highlights',
        isVisible: true,
        items: [
          { title: 'Express Global Delivery', description: 'Tracked carbon-neutral shipping' },
          { title: 'Direct Brand Warranty', description: '100% authentic merchant guarantee' },
          { title: 'Hassle-Free Returns', description: '30-day money-back guarantee' }
        ]
      };
      home.sections.push(vp);
    }
    if (!vp.items) vp.items = [];
    while (vp.items.length <= cardIdx) {
      vp.items.push({ title: '', description: '' });
    }
    vp.items[cardIdx] = { ...vp.items[cardIdx], ...updates };
    updateDraftPages(pages);
  };

  // Preset Industry Archetype Switcher
  const handleApplyTemplate = (templateKey) => {
    if (!tenant) return;
    if (templateKey === 'ecommerce') {
      setCatalogMode('ecommerce');
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
        archetype: 'ecommerce',
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
      setCatalogMode('portfolio');
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
        archetype: 'portfolio',
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
      setCatalogMode('portfolio');
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
        archetype: 'business',
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
      <div className="h-14 bg-slate-900 border-b border-slate-800 px-2 sm:px-4 flex items-center justify-between shrink-0 w-full max-w-full gap-1 sm:gap-2">
        <div className="flex items-center space-x-1.5 sm:space-x-3 min-w-0">
          {/* Store Switcher Dropdown */}
          <div className="flex items-center space-x-1.5 sm:space-x-2 min-w-0">
            <div 
              style={{ backgroundColor: tenant.theme?.primaryColor || '#3B82F6' }}
              className="w-7 h-7 rounded-lg flex items-center justify-center text-white font-bold text-xs shadow shrink-0"
            >
              {tenant.name?.[0] || 'S'}
            </div>
            
            <div className="relative group min-w-0">
              <button className="flex items-center space-x-1 sm:space-x-1.5 hover:text-white transition-colors min-w-0">
                <span className="font-bold text-white text-xs sm:text-sm truncate max-w-[90px] sm:max-w-[180px] block">{tenant.name}</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
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

          <span className="hidden sm:inline-flex px-2 py-0.5 bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 rounded-full text-[10px] font-mono shrink-0">
            {tenant.isNewStore ? 'NEW_DRAFT_READY' : 'ATLAS_SYNCED'}
          </span>
        </div>

        {/* Viewport & Preview Page Selectors */}
        <div className="hidden md:flex items-center space-x-2 shrink-0">
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
        <div className="flex items-center space-x-1 sm:space-x-2 shrink-0">
          {saveSuccessMessage && (
            <span className="text-emerald-400 font-medium text-[10px] sm:text-xs hidden sm:flex items-center space-x-1 animate-fadeIn">
              <Check className="w-3.5 h-3.5 shrink-0" />
              <span>{saveSuccessMessage}</span>
            </span>
          )}

          {onOpenProfile && (
            <button
              onClick={onOpenProfile}
              className="px-2.5 sm:px-3.5 py-1.5 sm:py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl font-medium transition-colors flex items-center space-x-1 sm:space-x-1.5 cursor-pointer shrink-0"
              title="View all your launched stores & profile"
            >
              <Store className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
              <span className="hidden sm:inline">My Websites</span>
            </button>
          )}

          <button
            onClick={handleSaveToAtlas}
            disabled={isSaving}
            className="px-2.5 sm:px-3.5 py-1.5 sm:py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl font-medium transition-colors flex items-center space-x-1 sm:space-x-1.5 shrink-0"
            title="Save Draft"
          >
            <Save className="w-3.5 h-3.5 shrink-0" />
            <span className="hidden sm:inline">{isSaving ? 'Saving...' : 'Save Draft'}</span>
          </button>

          <button
            onClick={handleLaunchStore}
            className="px-3 sm:px-4 py-1.5 sm:py-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white font-bold rounded-xl transition-all shadow-lg shadow-emerald-500/20 flex items-center space-x-1 sm:space-x-1.5 shrink-0"
            title="Launch Store (<50ms)"
          >
            <Rocket className="w-3.5 h-3.5 shrink-0" />
            <span>Launch<span className="hidden sm:inline"> Store (&lt;50ms)</span></span>
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
              {catalogMode === 'portfolio' ? (
                <>
                  <Briefcase className="w-3.5 h-3.5" />
                  <span>Projects ({portfolioItems.length})</span>
                </>
              ) : (
                <>
                  <Package className="w-3.5 h-3.5" />
                  <span>Catalog ({products?.length || 0})</span>
                </>
              )}
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
                    <div className="p-3.5 bg-slate-800/40 border border-slate-800 rounded-2xl space-y-3.5">
                      <div>
                        <label className="block text-slate-400 text-xs mb-1">Top Badge Text</label>
                        <input
                          type="text"
                          placeholder="e.g. Official Portfolio / Brand Showcase"
                          value={homeHero?.badgeText ?? (isPortfolio ? 'Creative Portfolio & Showcase' : 'Official Brand Storefront')}
                          onChange={(e) => updateHomeHero({ badgeText: e.target.value })}
                          className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white text-xs"
                        />
                      </div>

                      <div>
                        <label className="block text-slate-400 text-xs mb-1">Main Headline</label>
                        <input
                          type="text"
                          value={homeHero?.title ?? tenant.name}
                          onChange={(e) => updateHomeHero({ title: e.target.value })}
                          className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white text-xs font-semibold"
                        />
                      </div>

                      <div>
                        <label className="block text-slate-400 text-xs mb-1">Hero Subtitle</label>
                        <textarea
                          rows={2}
                          value={homeHero?.subtitle ?? tenant.tagline}
                          onChange={(e) => updateHomeHero({ subtitle: e.target.value })}
                          className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white text-xs leading-relaxed"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-slate-400 text-xs mb-1">CTA Button Text</label>
                          <input
                            type="text"
                            placeholder="e.g. View Selected Works"
                            value={homeHero?.ctaText ?? (isPortfolio ? 'View Selected Works' : 'Shop Collection')}
                            onChange={(e) => updateHomeHero({ ctaText: e.target.value })}
                            className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-xl text-white text-xs"
                          />
                        </div>
                        <div>
                          <label className="block text-slate-400 text-xs mb-1">Button Link Target</label>
                          <select
                            value={homeHero?.ctaLink ?? (isPortfolio ? '/portfolio' : '/catalog')}
                            onChange={(e) => updateHomeHero({ ctaLink: e.target.value })}
                            className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-xl text-white text-xs"
                          >
                            <option value="/portfolio">/portfolio (Portfolio)</option>
                            <option value="/catalog">/catalog (Catalog)</option>
                            <option value="/about">/about (About)</option>
                            <option value="/contact">/contact (Contact)</option>
                          </select>
                        </div>
                      </div>

                      {/* Cloudinary Hero Banner Background Uploader */}
                      <CloudinaryUploader
                        label="Hero Banner Background"
                        currentValue={tenant.brand?.heroImage || ''}
                        onUploadSuccess={(url) => {
                          updateDraftBrand({ heroImage: url });
                          updateHomeHero({ imageUrl: url });
                        }}
                        recommendedSize="1600x800px landscape"
                        aspectRatio="banner"
                      />

                      {/* Feature Highlights & Value Propositions Section (Screenshot 4) */}
                      <div className="p-3 bg-slate-950/70 border border-slate-700/80 rounded-xl space-y-2.5 pt-2.5">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-white text-[11px] uppercase tracking-wider">
                            Feature Highlights Bar
                          </span>
                          <label className="flex items-center space-x-1.5 cursor-pointer text-[11px] text-slate-300">
                            <input
                              type="checkbox"
                              checked={homeValueProps ? homeValueProps.isVisible !== false : !isPortfolio}
                              onChange={(e) => updateHomeValuePropsVisible(e.target.checked)}
                              className="rounded border-slate-700 bg-slate-900 text-indigo-600 focus:ring-0"
                            />
                            <span>Show on Storefront</span>
                          </label>
                        </div>
                        <p className="text-[10px] text-slate-400">
                          Customize the 3 highlight boxes beneath the hero banner (or uncheck to hide):
                        </p>

                        {(homeValueProps ? homeValueProps.isVisible !== false : !isPortfolio) && (
                          <div className="space-y-2 pt-1">
                            {[0, 1, 2].map((idx) => {
                              const defaultCards = [
                                { title: 'Express Global Delivery', description: 'Tracked carbon-neutral shipping' },
                                { title: 'Direct Brand Warranty', description: '100% authentic merchant guarantee' },
                                { title: 'Hassle-Free Returns', description: '30-day money-back guarantee' }
                              ];
                              const card = homeValueProps?.items?.[idx] || defaultCards[idx];
                              return (
                                <div key={idx} className="p-2 bg-slate-900 border border-slate-800 rounded-lg space-y-1">
                                  <div className="text-[9px] font-bold text-slate-400">Box #{idx + 1}</div>
                                  <input
                                    type="text"
                                    placeholder="Title"
                                    value={card?.title || ''}
                                    onChange={(e) => updateHomeValuePropCard(idx, { title: e.target.value })}
                                    className="w-full px-2 py-1 bg-slate-950 border border-slate-700 rounded text-white text-xs"
                                  />
                                  <input
                                    type="text"
                                    placeholder="Subtitle / Description"
                                    value={card?.description || ''}
                                    onChange={(e) => updateHomeValuePropCard(idx, { description: e.target.value })}
                                    className="w-full px-2 py-1 bg-slate-950 border border-slate-700 rounded text-white text-xs"
                                  />
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* 2. ABOUT PAGE CONTENT EDITOR */}
                  {editingPageSlug === 'about' && (
                    <div className="p-3.5 bg-slate-800/40 border border-slate-800 rounded-2xl space-y-3">
                      <div>
                        <label className="block text-slate-400 mb-1">Brand Story Headline</label>
                        <input
                          type="text"
                          value={tenant.pages?.find(p => p.slug === 'about')?.sections?.[0]?.title ?? `The Story of ${tenant.name}`}
                          onChange={(e) => {
                            const pages = [...(tenant.pages || [])];
                            let about = pages.find(p => p.slug === 'about');
                            if (!about) {
                              about = { slug: 'about', title: 'About Us', sections: [{ type: 'story', title: e.target.value }] };
                              pages.push(about);
                            } else {
                              if (!about.sections || about.sections.length === 0) {
                                about.sections = [{ type: 'story', title: e.target.value }];
                              } else {
                                about.sections[0].title = e.target.value;
                              }
                            }
                            updateDraftPages(pages);
                          }}
                          className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white"
                        />
                      </div>

                      <div>
                        <label className="block text-slate-400 mb-1">Brand Story Paragraph</label>
                        <textarea
                          rows={4}
                          value={tenant.pages?.find(p => p.slug === 'about')?.sections?.[0]?.content ?? 'Our mission is to create exceptional goods...'}
                          onChange={(e) => {
                            const pages = [...(tenant.pages || [])];
                            let about = pages.find(p => p.slug === 'about');
                            if (!about) {
                              about = { slug: 'about', title: 'About Us', sections: [{ type: 'story', title: `The Story of ${tenant.name}`, content: e.target.value }] };
                              pages.push(about);
                            } else {
                              if (!about.sections || about.sections.length === 0) {
                                about.sections = [{ type: 'story', title: `The Story of ${tenant.name}`, content: e.target.value }];
                              } else {
                                about.sections[0].content = e.target.value;
                              }
                            }
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
                          let about = pages.find(p => p.slug === 'about');
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
                      <div>
                        <label className="block text-slate-400 mb-1">Contact Page Headline</label>
                        <input
                          type="text"
                          value={tenant.pages?.find(p => p.slug === 'contact')?.sections?.[0]?.title ?? 'Get in Touch'}
                          onChange={(e) => {
                            const pages = [...(tenant.pages || [])];
                            let contactPage = pages.find(p => p.slug === 'contact');
                            if (!contactPage) {
                              contactPage = { 
                                slug: 'contact', 
                                title: 'Contact Us', 
                                sections: [{ type: 'contact_form', title: e.target.value, subtitle: "Have questions about our products or custom requests? We'd love to help." }] 
                              };
                              pages.push(contactPage);
                            } else {
                              if (!contactPage.sections || contactPage.sections.length === 0) {
                                contactPage.sections = [{ type: 'contact_form', title: e.target.value, subtitle: "Have questions about our products or custom requests? We'd love to help." }];
                              } else {
                                contactPage.sections[0].title = e.target.value;
                              }
                            }
                            updateDraftPages(pages);
                          }}
                          className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white text-xs"
                          placeholder="e.g. Get in Touch"
                        />
                      </div>

                      <div>
                        <label className="block text-slate-400 mb-1">Subtitle / Help Text</label>
                        <textarea
                          rows={2}
                          value={tenant.pages?.find(p => p.slug === 'contact')?.sections?.[0]?.subtitle ?? `Have questions about ${tenant.name}'s products, orders, or custom requests? We're here to help.`}
                          onChange={(e) => {
                            const pages = [...(tenant.pages || [])];
                            let contactPage = pages.find(p => p.slug === 'contact');
                            if (!contactPage) {
                              contactPage = { 
                                slug: 'contact', 
                                title: 'Contact Us', 
                                sections: [{ type: 'contact_form', title: 'Get in Touch', subtitle: e.target.value }] 
                              };
                              pages.push(contactPage);
                            } else {
                              if (!contactPage.sections || contactPage.sections.length === 0) {
                                contactPage.sections = [{ type: 'contact_form', title: 'Get in Touch', subtitle: e.target.value }];
                              } else {
                                contactPage.sections[0].subtitle = e.target.value;
                              }
                            }
                            updateDraftPages(pages);
                          }}
                          className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white text-xs"
                          placeholder="e.g. Have questions? We're here to help."
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-slate-400 mb-1">Support Email</label>
                          <input
                            type="text"
                            value={tenant.contact?.email ?? ''}
                            onChange={(e) => updateDraftContact({ email: e.target.value })}
                            className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white text-[11px]"
                            placeholder="support@brand.com"
                          />
                        </div>
                        <div>
                          <label className="block text-slate-400 mb-1">Phone</label>
                          <input
                            type="text"
                            value={tenant.contact?.phone ?? ''}
                            onChange={(e) => updateDraftContact({ phone: e.target.value })}
                            className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white text-[11px]"
                            placeholder="+1 (555) 019-2834"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-slate-400 mb-1">Office / Store Address</label>
                        <input
                          type="text"
                          value={tenant.contact?.address ?? ''}
                          onChange={(e) => updateDraftContact({ address: e.target.value })}
                          className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white text-[11px]"
                          placeholder="100 Innovation Blvd, Silicon Valley, CA"
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
                          value={tenant.pages?.find(p => p.slug === editingPageSlug)?.sections?.[0]?.title ?? ''}
                          onChange={(e) => {
                            const pages = [...(tenant.pages || [])];
                            let curPage = pages.find(p => p.slug === editingPageSlug);
                            if (curPage) {
                              if (!curPage.sections || curPage.sections.length === 0) {
                                curPage.sections = [{ type: 'text_block', title: e.target.value }];
                              } else {
                                curPage.sections[0].title = e.target.value;
                              }
                            }
                            updateDraftPages(pages);
                          }}
                          className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white"
                        />
                      </div>

                      <div>
                        <label className="block text-slate-400 mb-1">Subtitle / Tagline</label>
                        <input
                          type="text"
                          value={tenant.pages?.find(p => p.slug === editingPageSlug)?.sections?.[0]?.subtitle ?? ''}
                          onChange={(e) => {
                            const pages = [...(tenant.pages || [])];
                            let curPage = pages.find(p => p.slug === editingPageSlug);
                            if (curPage) {
                              if (!curPage.sections || curPage.sections.length === 0) {
                                curPage.sections = [{ type: 'text_block', title: '', subtitle: e.target.value }];
                              } else {
                                curPage.sections[0].subtitle = e.target.value;
                              }
                            }
                            updateDraftPages(pages);
                          }}
                          className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white"
                        />
                      </div>

                      <div>
                        <label className="block text-slate-400 mb-1">Detailed Content Paragraph</label>
                        <textarea
                          rows={4}
                          value={tenant.pages?.find(p => p.slug === editingPageSlug)?.sections?.[0]?.content ?? ''}
                          onChange={(e) => {
                            const pages = [...(tenant.pages || [])];
                            let curPage = pages.find(p => p.slug === editingPageSlug);
                            if (curPage) {
                              if (!curPage.sections || curPage.sections.length === 0) {
                                curPage.sections = [{ type: 'text_block', title: '', content: e.target.value }];
                              } else {
                                curPage.sections[0].content = e.target.value;
                              }
                            }
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

                      {/* Showcase Projects / Items Editor */}
                      <div className="pt-3 border-t border-slate-700/60 space-y-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <h5 className="font-bold text-white text-xs">Featured Projects & Showcase Items</h5>
                            <p className="text-[10px] text-slate-400">Add, edit, or delete custom works & projects</p>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              const pages = [...(tenant.pages || [])];
                              let curPage = pages.find(p => p.slug === editingPageSlug);
                              if (curPage) {
                                if (!curPage.sections || curPage.sections.length === 0) {
                                  curPage.sections = [{ type: 'story', title: '', items: [] }];
                                }
                                if (!curPage.sections[0].items) {
                                  curPage.sections[0].items = [];
                                }
                                curPage.sections[0].items.push({
                                  title: 'New Creative Project',
                                  description: 'Description of this project, creative direction, and deliverables.',
                                  imageUrl: ''
                                });
                                updateDraftPages(pages);
                              }
                            }}
                            className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-500 text-white text-[11px] font-semibold rounded-lg flex items-center space-x-1 cursor-pointer transition-colors"
                          >
                            <Plus className="w-3 h-3" />
                            <span>Add Project</span>
                          </button>
                        </div>

                        {/* Projects list */}
                        <div className="space-y-2.5">
                          {(() => {
                            const curPage = tenant.pages?.find(p => p.slug === editingPageSlug);
                            const items = curPage?.sections?.[0]?.items || [];
                            if (items.length === 0) {
                              return (
                                <div className="p-3.5 text-center border border-dashed border-slate-800 rounded-xl text-slate-500 text-xs">
                                  No projects in this showcase yet. Click "+ Add Project" above!
                                </div>
                              );
                            }
                            return items.map((item, itemIdx) => (
                              <div key={itemIdx} className="p-3 bg-slate-900/90 border border-slate-700/70 rounded-xl space-y-2">
                                <div className="flex items-center justify-between gap-2">
                                  <span className="text-[11px] font-bold text-slate-300">Project #{itemIdx + 1}</span>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const pages = [...(tenant.pages || [])];
                                      let p = pages.find(pg => pg.slug === editingPageSlug);
                                      if (p?.sections?.[0]?.items) {
                                        p.sections[0].items.splice(itemIdx, 1);
                                        updateDraftPages(pages);
                                      }
                                    }}
                                    className="p-1 text-slate-500 hover:text-red-400 hover:bg-red-950/40 rounded transition-colors cursor-pointer"
                                    title="Delete Project"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                                <div>
                                  <label className="block text-[10px] text-slate-400 mb-0.5">Project Title</label>
                                  <input
                                    type="text"
                                    value={item.title || ''}
                                    placeholder="e.g. Minimalist Identity System"
                                    onChange={(e) => {
                                      const pages = [...(tenant.pages || [])];
                                      let p = pages.find(pg => pg.slug === editingPageSlug);
                                      if (p?.sections?.[0]?.items?.[itemIdx]) {
                                        p.sections[0].items[itemIdx].title = e.target.value;
                                        updateDraftPages(pages);
                                      }
                                    }}
                                    className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-white text-xs"
                                  />
                                </div>
                                <div>
                                  <label className="block text-[10px] text-slate-400 mb-0.5">Description</label>
                                  <textarea
                                    rows={2}
                                    value={item.description || ''}
                                    placeholder="Brief impact, materials, client, or specs..."
                                    onChange={(e) => {
                                      const pages = [...(tenant.pages || [])];
                                      let p = pages.find(pg => pg.slug === editingPageSlug);
                                      if (p?.sections?.[0]?.items?.[itemIdx]) {
                                        p.sections[0].items[itemIdx].description = e.target.value;
                                        updateDraftPages(pages);
                                      }
                                    }}
                                    className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-white text-xs"
                                  />
                                </div>
                                <CloudinaryUploader
                                  label="Project Image"
                                  currentValue={item.imageUrl || ''}
                                  onUploadSuccess={(url) => {
                                    const pages = [...(tenant.pages || [])];
                                    let p = pages.find(pg => pg.slug === editingPageSlug);
                                    if (p?.sections?.[0]?.items?.[itemIdx]) {
                                      p.sections[0].items[itemIdx].imageUrl = url;
                                      updateDraftPages(pages);
                                    }
                                  }}
                                  recommendedSize="800x600px preview"
                                  aspectRatio="banner"
                                />
                              </div>
                            ));
                          })()}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB 3: DUAL-MODE SHOWCASE MANAGER (Projects vs Products) */}
            {activeTab === 'catalog' && (
              <div className="space-y-4 animate-fadeIn">
                {/* Archetype Mode Switcher */}
                <div className="flex items-center p-1 bg-slate-950 border border-slate-800 rounded-xl">
                  <button
                    type="button"
                    onClick={() => {
                      setCatalogMode('portfolio');
                      updateDraftIdentity({ archetype: 'portfolio' });
                    }}
                    className={`flex-1 py-1.5 text-xs font-semibold rounded-lg flex items-center justify-center space-x-1.5 transition-all ${
                      catalogMode === 'portfolio'
                        ? 'bg-gradient-to-r from-pink-600 to-purple-600 text-white shadow'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <Briefcase className="w-3.5 h-3.5" />
                    <span>Portfolio Projects</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setCatalogMode('ecommerce');
                      updateDraftIdentity({ archetype: 'ecommerce' });
                    }}
                    className={`flex-1 py-1.5 text-xs font-semibold rounded-lg flex items-center justify-center space-x-1.5 transition-all ${
                      catalogMode === 'ecommerce'
                        ? 'bg-gradient-to-r from-indigo-600 to-blue-600 text-white shadow'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <Package className="w-3.5 h-3.5" />
                    <span>Store Catalog</span>
                  </button>
                </div>

                {/* 1. PORTFOLIO PROJECTS MANAGER */}
                {catalogMode === 'portfolio' && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-bold text-slate-100 uppercase tracking-wider text-[11px]">Projects & Showcase</h4>
                        <p className="text-[10px] text-slate-400">Scoped strictly to {tenant.subdomain}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        {portfolioItems.length > 0 && (
                          <button
                            type="button"
                            onClick={() => {
                              if (window.confirm('Delete all projects from this portfolio?')) {
                                handleClearAllProjects();
                              }
                            }}
                            className="px-2.5 py-1.5 text-xs text-red-400 bg-red-950/40 border border-red-800/60 hover:bg-red-900/50 rounded-xl font-medium flex items-center space-x-1 transition-colors cursor-pointer"
                            title="Delete all projects"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Clear All</span>
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => setIsAddProjectOpen(!isAddProjectOpen)}
                          style={{ backgroundColor: tenant.theme?.primaryColor || '#EC4899' }}
                          className="px-3 py-1.5 text-white rounded-xl font-medium flex items-center space-x-1 shadow text-xs cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>{isAddProjectOpen ? 'Close Form' : 'Add Project'}</span>
                        </button>
                      </div>
                    </div>

                    {/* Add Project Inline Form */}
                    {isAddProjectOpen && (
                      <form onSubmit={handleCreateProject} className="p-4 bg-slate-800/80 border border-slate-700 rounded-2xl space-y-3 animate-fadeIn">
                        <h5 className="font-bold text-white text-xs">New Project / Case Study</h5>
                        
                        <div>
                          <label className="block text-slate-400 mb-1 text-xs">Project Title</label>
                          <input
                            type="text"
                            required
                            placeholder="e.g. Minimalist Identity System"
                            value={newProject.title}
                            onChange={(e) => setNewProject({ ...newProject, title: e.target.value })}
                            className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-xl text-white text-xs"
                          />
                        </div>

                        <div>
                          <label className="block text-slate-400 mb-1 text-xs">Category / Medium</label>
                          <input
                            type="text"
                            placeholder="e.g. Brand Identity, Architecture, Photography"
                            value={newProject.category}
                            onChange={(e) => setNewProject({ ...newProject, category: e.target.value })}
                            className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-xl text-white text-xs"
                          />
                        </div>

                        {/* Project Photo via Cloudinary */}
                        <div className="pt-1">
                          <CloudinaryUploader
                            label="Project Preview Image"
                            currentValue={newProject.imageUrl}
                            onUploadSuccess={(url) => setNewProject({ ...newProject, imageUrl: url })}
                            recommendedSize="800x600px preview photo"
                            aspectRatio="banner"
                          />
                        </div>

                        <div>
                          <label className="block text-slate-400 mb-1 text-xs">Description</label>
                          <textarea
                            rows={2}
                            placeholder="Brief synopsis, client, or deliverables..."
                            value={newProject.description}
                            onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                            className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-xl text-white text-xs"
                          />
                        </div>

                        <button
                          type="submit"
                          style={{ backgroundColor: tenant.theme?.primaryColor || '#EC4899' }}
                          className="w-full py-2 text-white font-semibold rounded-xl shadow mt-2 text-xs"
                        >
                          Commit Project to Portfolio
                        </button>
                      </form>
                    )}

                    {/* Projects List */}
                    <div className="space-y-2">
                      {portfolioItems.length === 0 ? (
                        <div className="p-6 text-center border border-dashed border-slate-800 rounded-xl text-slate-500 text-xs">
                          No projects in this portfolio yet. Click "+ Add Project" above to showcase your creative work!
                        </div>
                      ) : (
                        portfolioItems.map((item, idx) => (
                          <div
                            key={idx}
                            className="p-2.5 bg-slate-800/40 border border-slate-800 rounded-xl flex items-center justify-between gap-3 group hover:border-slate-700 transition-colors"
                          >
                            <img
                              src={item.imageUrl || 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=800&q=80'}
                              alt={item.title}
                              className="w-10 h-10 rounded-lg object-cover bg-slate-950 shrink-0 border border-slate-700/60"
                            />
                            <div className="flex-1 min-w-0">
                              <div className="font-semibold text-slate-200 truncate text-xs">{item.title}</div>
                              <div className="text-[10px] text-slate-400 truncate">
                                {item.category || 'Creative Work'} &bull; {item.description || 'No description'}
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                if (window.confirm(`Delete project "${item.title}"?`)) {
                                  handleDeleteProject(idx);
                                }
                              }}
                              className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-red-950/40 rounded-lg transition-colors cursor-pointer shrink-0"
                              title="Delete Project"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}

                {/* 2. E-COMMERCE PRODUCTS MANAGER */}
                {catalogMode === 'ecommerce' && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-bold text-slate-100 uppercase tracking-wider text-[11px]">Product Catalog</h4>
                        <p className="text-[10px] text-slate-400">Scoped strictly to {tenant.subdomain}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        {products?.length > 0 && (
                          <button
                            type="button"
                            onClick={() => {
                              if (window.confirm('Delete all products from this catalog? (You can add custom ones anytime)')) {
                                clearAllProducts();
                              }
                            }}
                            className="px-2.5 py-1.5 text-xs text-red-400 bg-red-950/40 border border-red-800/60 hover:bg-red-900/50 rounded-xl font-medium flex items-center space-x-1 transition-colors cursor-pointer"
                            title="Delete all products"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Clear All</span>
                          </button>
                        )}
                        <button
                          onClick={() => setIsAddProductOpen(!isAddProductOpen)}
                          style={{ backgroundColor: tenant.theme?.primaryColor || '#3B82F6' }}
                          className="px-3 py-1.5 text-white rounded-xl font-medium flex items-center space-x-1 shadow text-xs cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>{isAddProductOpen ? 'Close Form' : 'Add Item'}</span>
                        </button>
                      </div>
                    </div>

                    {/* Add Product Inline Form with Cloudinary */}
                    {isAddProductOpen && (
                      <form onSubmit={handleCreateProduct} className="p-4 bg-slate-800/80 border border-slate-700 rounded-2xl space-y-3 animate-fadeIn">
                        <h5 className="font-bold text-white text-xs">New Product Details</h5>
                        
                        <div>
                          <label className="block text-slate-400 mb-1 text-xs">Title</label>
                          <input
                            type="text"
                            required
                            placeholder="e.g. Ergonomic Desk Mat"
                            value={newProduct.title}
                            onChange={(e) => setNewProduct({ ...newProduct, title: e.target.value })}
                            className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-xl text-white text-xs"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="block text-slate-400 mb-1 text-xs">Price ($)</label>
                            <input
                              type="number"
                              required
                              value={newProduct.price}
                              onChange={(e) => setNewProduct({ ...newProduct, price: Number(e.target.value) })}
                              className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-xl text-white text-xs"
                            />
                          </div>
                          <div>
                            <label className="block text-slate-400 mb-1 text-xs">Category</label>
                            <input
                              type="text"
                              value={newProduct.category}
                              onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                              className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-xl text-white text-xs"
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
                            <label className="block text-slate-400 mb-1 text-xs">Inventory Count</label>
                            <input
                              type="number"
                              value={newProduct.inventory}
                              onChange={(e) => setNewProduct({ ...newProduct, inventory: Number(e.target.value) })}
                              className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-xl text-white text-xs"
                            />
                          </div>
                          <div>
                            <label className="block text-slate-400 mb-1 text-xs">Badge (Optional)</label>
                            <input
                              type="text"
                              placeholder="e.g. Bestseller, New"
                              value={newProduct.badge}
                              onChange={(e) => setNewProduct({ ...newProduct, badge: e.target.value })}
                              className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-xl text-white text-xs"
                            />
                          </div>
                        </div>

                        <button
                          type="submit"
                          style={{ backgroundColor: tenant.theme?.primaryColor || '#3B82F6' }}
                          className="w-full py-2 text-white font-semibold rounded-xl shadow mt-2 text-xs"
                        >
                          Commit Product to Catalog
                        </button>
                      </form>
                    )}

                    {/* Product List */}
                    <div className="space-y-2">
                      {products?.length === 0 ? (
                        <div className="p-6 text-center border border-dashed border-slate-800 rounded-xl text-slate-500 text-xs">
                          No products in this store catalog yet. Click "+ Add Item" above to add products with Cloudinary photos!
                        </div>
                      ) : (
                        products?.map((prod) => (
                          <div
                            key={prod._id}
                            className="p-2.5 bg-slate-800/40 border border-slate-800 rounded-xl flex items-center justify-between gap-3 group hover:border-slate-700 transition-colors"
                          >
                            <img
                              src={prod.images?.[0] || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=600&q=80'}
                              alt={prod.title}
                              className="w-10 h-10 rounded-lg object-cover bg-slate-950 shrink-0 border border-slate-700/60"
                            />
                            <div className="flex-1 min-w-0">
                              <div className="font-semibold text-slate-200 truncate text-xs">{prod.title}</div>
                              <div className="text-[10px] text-slate-400 flex items-center space-x-2">
                                <span className="text-white font-bold">${prod.price}</span>
                                <span>•</span>
                                <span>{prod.category}</span>
                                {prod.badge && <span className="text-amber-400">({prod.badge})</span>}
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                if (window.confirm(`Delete "${prod.title}"?`)) {
                                  deleteProduct(prod._id);
                                }
                              }}
                              className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-red-950/40 rounded-lg transition-colors cursor-pointer shrink-0"
                              title="Delete Product"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
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
