import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

import { AuthProvider } from './context/AuthContext';
import { TenantProvider } from './context/TenantContext';
import { CartProvider } from './context/CartContext';
import { ClerkProvider } from '@clerk/react';

const CLERK_PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

function Root() {
  const isClerkConfigured = CLERK_PUBLISHABLE_KEY && CLERK_PUBLISHABLE_KEY.startsWith('pk_');

  const content = (
    <AuthProvider>
      <TenantProvider initialSubdomain="techgear">
        <CartProvider>
          <App />
        </CartProvider>
      </TenantProvider>
    </AuthProvider>
  );

  if (isClerkConfigured) {
    return (
      <ClerkProvider publishableKey={CLERK_PUBLISHABLE_KEY} afterSignOutUrl="/">
        {content}
      </ClerkProvider>
    );
  }

  return content;
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Root />
  </React.StrictMode>
);
