/**
 * Universal Subdomain and Domain Utility for Development and Production
 * Supports:
 * - Localhost edge emulation: sub.localhost:5173
 * - Custom parent domain: sub.devtackle.in
 * - Vercel main platform: instantstore.vercel.app
 */

const RESERVED_SUBDOMAINS = new Set([
  'app',
  'admin',
  'api',
  'www',
  'static',
  'cdn',
  'mail',
  'dashboard',
  'localhost',
]);

export const extractSubdomain = () => {
  if (typeof window === 'undefined') return null;

  // 1. Check query parameter override: ?store=xyz or ?tenant=xyz
  const params = new URLSearchParams(window.location.search);
  const paramStore = params.get('store') || params.get('tenant');
  if (paramStore) return paramStore.trim().toLowerCase();

  const hostname = window.location.hostname.toLowerCase();

  // If naked IP or standard localhost without subdomain -> Platform Root
  if (hostname === 'localhost' || hostname === '127.0.0.1' || /^(\d{1,3}\.){3}\d{1,3}$/.test(hostname)) {
    return null;
  }

  // 2. Check *.localhost in development (e.g. ramshop.localhost)
  if (hostname.endsWith('.localhost')) {
    const sub = hostname.replace('.localhost', '');
    if (!RESERVED_SUBDOMAINS.has(sub)) return sub;
    return null;
  }

  // 3. Check Vercel main platform domain (*.vercel.app)
  // instantstore.vercel.app -> Platform root landing page (return null)
  // ramshop.instantstore.vercel.app -> Subdomain 'ramshop'
  if (hostname.endsWith('.vercel.app')) {
    const parts = hostname.split('.');
    if (parts.length > 3) {
      const sub = parts[0];
      if (!RESERVED_SUBDOMAINS.has(sub)) return sub;
    }
    return null;
  }

  // 4. Check custom parent domain configured in environment (e.g. devtackle.in)
  const baseDomain = (import.meta.env.VITE_BASE_DOMAIN || '').toLowerCase().trim();
  if (baseDomain) {
    if (hostname === baseDomain || hostname === `www.${baseDomain}`) {
      return null; // Platform Landing Page
    }
    if (hostname.endsWith(`.${baseDomain}`)) {
      const sub = hostname.slice(0, -(baseDomain.length + 1));
      if (!RESERVED_SUBDOMAINS.has(sub) && sub !== 'www') return sub;
      return null;
    }
  }

  // 5. General custom domain wildcard check (e.g. ramshop.domain.in)
  const parts = hostname.split('.');
  if (parts.length >= 3) {
    const sub = parts[0];
    if (!RESERVED_SUBDOMAINS.has(sub) && sub !== 'www') {
      return sub;
    }
  }

  return null;
};

export const getStorefrontUrl = (subdomain) => {
  if (typeof window === 'undefined') return `http://${subdomain}.localhost:5173`;

  const cleanSub = (subdomain || 'techgear').toLowerCase().trim();
  const hostname = window.location.hostname.toLowerCase();
  const protocol = window.location.protocol;
  const port = window.location.port ? `:${window.location.port}` : '';

  // Local development
  if (hostname.includes('localhost') || hostname === '127.0.0.1') {
    return `${protocol}//${cleanSub}.localhost${port}`;
  }

  // Production with custom parent domain (e.g. devtackle.in)
  const baseDomain = import.meta.env.VITE_BASE_DOMAIN;
  if (baseDomain) {
    return `https://${cleanSub}.${baseDomain}`;
  }

  // Fallback for custom domains
  const parts = hostname.split('.');
  if (parts.length >= 2 && !hostname.endsWith('.vercel.app')) {
    const rootDomain = parts.slice(-2).join('.');
    return `https://${cleanSub}.${rootDomain}`;
  }

  return `https://${cleanSub}.${hostname}`;
};
