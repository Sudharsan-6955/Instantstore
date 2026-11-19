import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { api } from '../services/api';
import { extractSubdomain } from '../utils/domain';

const TenantContext = createContext(null);

export const TenantProvider = ({ initialSubdomain = 'techgear', children }) => {
  const [subdomain, setSubdomain] = useState(() => {
    const detected = extractSubdomain();
    return detected || initialSubdomain;
  });
  const [tenant, setTenant] = useState(null);
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);
  const [hydrationLatencyMs, setHydrationLatencyMs] = useState(0);

  const loadSeqRef = useRef(0);

  // Helper to create a new draft template if a requested subdomain does not yet exist in Atlas
  const createDraftTemplate = (cleanSub, customName) => {
    const displayName = customName?.trim() || `${cleanSub.charAt(0).toUpperCase() + cleanSub.slice(1)} Store`;
    const formattedName = displayName;
    return {
      subdomain: cleanSub,
      name: displayName,
      tagline: 'Instant storefront powered by zero-build cloud architecture.',
      isNewStore: true,
      theme: {
        primaryColor: '#6366F1',
        secondaryColor: '#0F172A',
        accentColor: '#10B981',
        fontHeading: 'Space Grotesk',
        fontBody: 'Inter',
        borderRadius: '0.75rem',
        mode: 'dark',
      },
      brand: {
        logoUrl: '',
        heroImage: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=1600&q=80',
        bannerText: 'Welcome to our official brand storefront!',
        announcement: 'Flash Sale: Free Shipping on Orders Over $50',
      },
      contact: {
        email: `contact@${cleanSub}.com`,
        phone: '+1 (555) 019-2834',
        address: '100 Innovation Boulevard, Silicon Valley, CA',
      },
      navigation: [
        { id: '1', label: 'Home', path: '/', isVisible: true },
        { id: '2', label: 'Catalog', path: '/catalog', isVisible: true },
        { id: '3', label: 'About', path: '/about', isVisible: true },
        { id: '4', label: 'Contact', path: '/contact', isVisible: true },
      ],
      pages: [
        {
          slug: 'home',
          title: 'Home',
          sections: [
            {
              id: 'sec-1',
              type: 'hero',
              title: `Welcome to ${formattedName}`,
              subtitle: 'Precision tools and curated items delivered with zero build latency.',
              ctaText: 'Explore Catalog',
              ctaLink: '/catalog',
              imageUrl: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=1600&q=80',
            },
            {
              id: 'sec-2',
              type: 'featured_products',
              title: 'Featured Collection',
              subtitle: 'Handpicked items just for you',
            }
          ]
        },
        {
          slug: 'about',
          title: 'About Us',
          sections: [
            {
              id: 'sec-about-1',
              type: 'story',
              title: `The Story of ${formattedName}`,
              subtitle: 'Born from innovation, driven by community',
              content: `We create exceptional quality products without the middleman markups. Our architecture enables instant updates and true customer direct pricing.`,
              imageUrl: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1200&q=80',
            }
          ]
        },
        {
          slug: 'contact',
          title: 'Contact Us',
          sections: [
            {
              id: 'sec-contact-1',
              type: 'contact_form',
              title: 'Get In Touch',
              subtitle: "Have questions about our products or custom orders? We'd love to hear from you.",
            }
          ]
        }
      ],
    };
  };

  // Load Storefront from MongoDB Atlas
  const loadStore = async (targetSub, customName) => {
    const detected = extractSubdomain();
    const cleanSub = (targetSub || detected || 'techgear').toLowerCase().trim();
    const currentSeq = ++loadSeqRef.current;
    setIsLoading(true);
    setError(null);
    setSubdomain(cleanSub);
    // Instantly reset products to prevent stale products from another store lingering
    setProducts([]);
    try {
      const data = await api.getStorefront(cleanSub);
      if (currentSeq !== loadSeqRef.current) return;
      if (data && data.tenant) {
        setTenant(data.tenant);
        setProducts(data.products || []);
        setHydrationLatencyMs(data.hydrationLatencyMs || 0);
      } else {
        const isPublicSubdomain = Boolean(detected);
        if (isPublicSubdomain) {
          setError('STORE_NOT_FOUND');
          setTenant({ subdomain: cleanSub, notFound: true, isPublished: false });
        } else {
          setTenant(createDraftTemplate(cleanSub, customName));
        }
        setProducts([]);
      }
    } catch (err) {
      if (currentSeq !== loadSeqRef.current) return;
      console.warn(`[Tenant Load] '${cleanSub}' not found in Atlas.`);
      const isPublicSubdomain = Boolean(detected);
      if (isPublicSubdomain) {
        setError('STORE_NOT_FOUND');
        setTenant({ subdomain: cleanSub, notFound: true, isPublished: false });
      } else {
        // New store creation mode inside Studio on app.devtackle.in: provide template
        setTenant(createDraftTemplate(cleanSub, customName));
      }
      setProducts([]);
    } finally {
      if (currentSeq === loadSeqRef.current) {
        setIsLoading(false);
      }
    }
  };

  useEffect(() => {
    loadStore(subdomain);
  }, [subdomain]);

  // Real-time Draft Theme Update (Split-Screen 0ms sync)
  const updateDraftTheme = (themeUpdates) => {
    setTenant((prev) => prev ? ({
      ...prev,
      theme: { ...prev.theme, ...themeUpdates }
    }) : prev);
  };

  // Real-time Draft General/Identity Update (name, tagline)
  const updateDraftIdentity = (identityUpdates) => {
    setTenant((prev) => prev ? ({
      ...prev,
      ...identityUpdates
    }) : prev);
  };

  // Real-time Draft Brand Update
  const updateDraftBrand = (brandUpdates) => {
    setTenant((prev) => prev ? ({
      ...prev,
      brand: { ...prev.brand, ...brandUpdates }
    }) : prev);
  };

  // Real-time Draft Page Update
  const updateDraftPages = (pages) => {
    setTenant((prev) => prev ? ({
      ...prev,
      pages
    }) : prev);
  };

  // Real-time Draft Navigation Update
  const updateDraftNavigation = (navigation) => {
    setTenant((prev) => prev ? ({
      ...prev,
      navigation
    }) : prev);
  };

  // Real-time Draft Contact Details Update (Email, Phone, Address)
  const updateDraftContact = (contactUpdates) => {
    setTenant((prev) => prev ? ({
      ...prev,
      contact: { ...prev.contact, ...contactUpdates }
    }) : prev);
  };

  // Atomic MongoDB Atlas Commit (Launches or Saves Drafts)
  const saveDraftToCloud = async () => {
    if (!tenant) return;
    setIsSaving(true);
    try {
      let res;
      const storedUser = localStorage.getItem('instantstore_user');
      const currentUser = storedUser ? JSON.parse(storedUser) : null;
      const ownerEmail = currentUser?.email || tenant.contact?.email || `merchant@${tenant.subdomain}.com`;
      const ownerClerkId = currentUser?.clerkId || '';

      if (tenant.isNewStore) {
        // Provision new store atomically in MongoDB Atlas (< 50ms)
        res = await api.provisionStore({
          subdomain: tenant.subdomain,
          name: tenant.name,
          tagline: tenant.tagline,
          ownerEmail: ownerEmail,
          ownerClerkId: ownerClerkId,
          theme: tenant.theme,
          brand: tenant.brand,
          contact: tenant.contact,
          navigation: tenant.navigation,
          pages: tenant.pages,
          products: products.map(p => ({
            title: p.title,
            price: p.price,
            compareAtPrice: p.compareAtPrice,
            category: p.category,
            images: p.images,
            description: p.description,
            inventory: p.inventory,
            badge: p.badge,
            isFeatured: p.isFeatured
          }))
        });
        setTenant((prev) => ({ ...prev, isNewStore: false }));
      } else {
        // Update existing store in MongoDB Atlas
        res = await api.updateStoreConfig(tenant.subdomain, {
          theme: tenant.theme,
          brand: tenant.brand,
          name: tenant.name,
          tagline: tenant.tagline,
          navigation: tenant.navigation,
          pages: tenant.pages,
          contact: tenant.contact,
          ownerEmail: ownerEmail,
          ownerClerkId: ownerClerkId,
        });

        // Also ensure any newly added draft products are committed to Atlas
        const draftProducts = products.filter(p => p._id && (String(p._id).startsWith('draft_') || String(p._id).startsWith('prod_')));
        for (const draftProd of draftProducts) {
          try {
            await api.createProduct(tenant.subdomain, {
              title: draftProd.title,
              price: draftProd.price,
              compareAtPrice: draftProd.compareAtPrice,
              category: draftProd.category,
              images: draftProd.images,
              description: draftProd.description,
              inventory: draftProd.inventory,
              badge: draftProd.badge,
              isFeatured: draftProd.isFeatured
            });
          } catch (pErr) {
            console.warn('Draft product sync warning:', pErr);
          }
        }
      }
      return res;
    } catch (err) {
      console.error('Failed to save to Atlas:', err);
      throw err;
    } finally {
      setIsSaving(false);
    }
  };

  // Add Product to State & MongoDB Atlas
  const addProduct = async (productData) => {
    if (!tenant) return;
    try {
      const draftProduct = {
        _id: `draft_${Date.now()}`,
        tenantId: tenant.subdomain,
        title: productData.title,
        slug: productData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Math.random().toString(36).substring(2, 6),
        description: productData.description || '',
        price: Number(productData.price),
        compareAtPrice: Number(productData.compareAtPrice) || 0,
        category: productData.category || 'General',
        images: productData.images && productData.images.length ? productData.images : ['https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=600&q=80'],
        inventory: Number(productData.inventory) || 50,
        badge: productData.badge || '',
        isFeatured: Boolean(productData.isFeatured !== undefined ? productData.isFeatured : true),
        createdAt: new Date().toISOString()
      };

      // Always update local products state immediately for instant feedback
      setProducts((prev) => [draftProduct, ...prev]);

      // If store is already in MongoDB Atlas, also persist directly
      if (!tenant.isNewStore) {
        try {
          const res = await api.createProduct(tenant.subdomain, productData);
          if (res.product) {
            // Replace draft with DB persisted version
            setProducts((prev) => prev.map(p => p._id === draftProduct._id ? res.product : p));
            return res;
          }
        } catch (apiErr) {
          console.warn('Direct product API call failed, kept in draft store to persist on Launch:', apiErr);
        }
      }

      return { success: true, product: draftProduct };
    } catch (err) {
      console.error('Add product error:', err);
      throw err;
    }
  };

  // Delete Individual Product
  const deleteProduct = async (productId) => {
    try {
      setProducts((prev) => prev.filter((p) => p._id !== productId));
      if (!tenant?.isNewStore && tenant?.subdomain) {
        try {
          await api.deleteProduct(tenant.subdomain, productId);
        } catch (apiErr) {
          console.warn('API deleteProduct failed, kept in local state:', apiErr);
        }
      }
      return { success: true };
    } catch (err) {
      console.error('Delete product error:', err);
      throw err;
    }
  };

  // Clear All Products (e.g. wipe default starter catalog)
  const clearAllProducts = async () => {
    try {
      const toDelete = [...products];
      setProducts([]);
      if (!tenant?.isNewStore && tenant?.subdomain) {
        for (const p of toDelete) {
          try {
            await api.deleteProduct(tenant.subdomain, p._id);
          } catch (e) {
            // ignore individual failures during bulk delete
          }
        }
      }
      return { success: true };
    } catch (err) {
      console.error('Clear products error:', err);
      throw err;
    }
  };

  return (
    <TenantContext.Provider
      value={{
        subdomain,
        tenant,
        products,
        isLoading,
        isSaving,
        error,
        hydrationLatencyMs,
        loadStore,
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
        setTenant,
      }}
    >
      {children}
    </TenantContext.Provider>
  );
};

export const useTenant = () => {
  const context = useContext(TenantContext);
  if (!context) throw new Error('useTenant must be used within TenantProvider');
  return context;
};
