const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const getAuthHeaders = () => {
  const token = localStorage.getItem('instantstore_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  };
};

export const api = {
  // Synchronize Clerk Google OAuth User with MongoDB Atlas
  syncClerkUser: async ({ clerkId, email, name, avatar, subdomain }) => {
    const res = await fetch(`${API_BASE}/api/auth/clerk-sync`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ clerkId, email, name, avatar, subdomain })
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message || 'Failed to sync Google user with MongoDB Atlas');
    }
    const data = await res.json();
    if (data.token) {
      localStorage.setItem('instantstore_token', data.token);
    }
    return data;
  },

  // Get All Active Stores from MongoDB Atlas
  getTenants: async () => {
    const res = await fetch(`${API_BASE}/api/tenants`);
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message || 'Failed to fetch tenants from MongoDB Atlas');
    }
    return await res.json();
  },

  // Get Storefront Data (Dynamic Hydration from Atlas)
  getStorefront: async (subdomain) => {
    const res = await fetch(`${API_BASE}/api/tenants/${subdomain}/storefront`);
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message || `Storefront '${subdomain}' not found in MongoDB Atlas`);
    }
    const data = await res.json();
    return {
      tenant: data.tenant,
      products: data.products || [],
      hydrationLatencyMs: data.hydrationLatencyMs || 8.4,
    };
  },

  // Check Subdomain Availability in MongoDB Atlas
  checkSubdomain: async (subdomain) => {
    const res = await fetch(`${API_BASE}/api/tenants/check-slug/${subdomain}`);
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message || 'Subdomain check failed');
    }
    return await res.json();
  },

  // Zero-Build Instant Provisioning (Atomic Insert in Atlas)
  provisionStore: async (payload) => {
    const res = await fetch(`${API_BASE}/api/tenants/provision`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload)
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message || 'Provisioning failed');
    }
    const data = await res.json();
    if (data.token) {
      localStorage.setItem('instantstore_token', data.token);
    }
    return data;
  },

  // Get all stores created/owned by a user
  getUserStores: async (identifier) => {
    const res = await fetch(`${API_BASE}/api/tenants/user/${encodeURIComponent(identifier)}`);
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message || 'Failed to fetch user stores');
    }
    return await res.json();
  },

  // Delete a store from Atlas
  deleteStore: async (subdomain) => {
    const res = await fetch(`${API_BASE}/api/tenants/${subdomain}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message || 'Failed to delete store');
    }
    return await res.json();
  },

  // Save / Update Store Configuration in MongoDB Atlas
  updateStoreConfig: async (subdomain, payload) => {
    const res = await fetch(`${API_BASE}/api/tenants/${subdomain}/theme`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload)
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message || 'Failed to update store configuration in Atlas');
    }
    return await res.json();
  },

  // Add Product to Storefront in MongoDB Atlas
  createProduct: async (subdomain, productData) => {
    const res = await fetch(`${API_BASE}/api/products/${subdomain}`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(productData)
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message || 'Failed to create product in Atlas');
    }
    return await res.json();
  },

  // Get Products from MongoDB Atlas
  getProducts: async (subdomain) => {
    const res = await fetch(`${API_BASE}/api/products/${subdomain}`);
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message || 'Failed to fetch products');
    }
    return await res.json();
  },

  // Delete Product from MongoDB Atlas
  deleteProduct: async (subdomain, productId) => {
    const res = await fetch(`${API_BASE}/api/products/${subdomain}/${productId}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message || 'Failed to delete product in Atlas');
    }
    return await res.json();
  },

  // Create Customer Order in MongoDB Atlas
  createOrder: async (subdomain, orderData) => {
    const res = await fetch(`${API_BASE}/api/orders/${subdomain}/checkout`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(orderData)
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message || 'Failed to commit order to Atlas');
    }
    return await res.json();
  },

  // Get Merchant Orders from MongoDB Atlas
  getOrders: async (subdomain) => {
    const res = await fetch(`${API_BASE}/api/orders/${subdomain}`, {
      headers: getAuthHeaders()
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message || 'Could not fetch orders from Atlas');
    }
    return await res.json();
  },

  // Fetch Live DevOps Benchmarks & Telemetry
  getBenchmarks: async () => {
    const res = await fetch(`${API_BASE}/api/benchmarks/telemetry`);
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message || 'Benchmark API unreachable');
    }
    return await res.json();
  },

  // Upload Image to Cloudinary (Dual Support: Direct Unsigned CDN Upload or Backend Proxy)
  uploadImage: async (file) => {
    const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
    const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

    // 1. Direct High-Speed Unsigned CDN Upload (if preset is configured)
    if (cloudName && uploadPreset) {
      try {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', uploadPreset);

        const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
          method: 'POST',
          body: formData,
        });
        const data = await res.json();
        if (res.ok && data.secure_url) {
          return data.secure_url;
        }
        console.warn('Direct Cloudinary upload warning:', data.error?.message);
      } catch (err) {
        console.warn('Direct Cloudinary upload error, attempting backend proxy:', err);
      }
    }

    // Fallback: Backend upload proxy
    try {
      const formData = new FormData();
      formData.append('image', file);
      const res = await fetch(`${API_BASE}/api/upload/cloudinary`, {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (res.ok && data.url) {
        return data.url;
      }
      if (data.message) {
        throw new Error(data.message);
      }
    } catch (err) {
      console.error('Backend upload failed:', err);
      throw new Error(err.message || 'Image upload failed.');
    }

    throw new Error('Image upload failed. Please verify configuration.');
  }
};
