import React, { useState, useEffect } from 'react';
import { useAuth } from './context/AuthContext';
import { useTenant } from './context/TenantContext';
import { TopSwitcher } from './components/TopSwitcher';
import { AuthModal } from './components/AuthModal';
import { UserProfileModal } from './components/UserProfileModal';
import { ErrorBoundary } from './components/ErrorBoundary';
import { LandingPage } from './landing/LandingPage';
import { StudioApp } from './studio/StudioApp';
import { StorefrontLayout } from './storefront/StorefrontLayout';
import { ArchitectureDashboard } from './devops/ArchitectureDashboard';
import { extractSubdomain } from './utils/domain';

export function App() {
  const { isAuthenticated, requireAuth } = useAuth();
  const { tenant, loadStore } = useTenant();
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  // Determine initial view based on hostname or query params
  const [currentView, setCurrentView] = useState(() => {
    const detectedSubdomain = extractSubdomain();
    if (detectedSubdomain) return 'storefront';
    return 'landing';
  });

  // Handle universal subdomain detection on initial load (localhost or production domain)
  useEffect(() => {
    const detectedSubdomain = extractSubdomain();
    if (detectedSubdomain) {
      setCurrentView('storefront');
    }
  }, []);

  // Safe navigation to Studio (Enforces Authentication Requirement)
  const handleNavigateToStudio = (targetSub, targetName) => {
    if (targetSub) loadStore(targetSub, targetName);
    const authorized = requireAuth(() => {
      setCurrentView('studio');
    });
    if (authorized) {
      setCurrentView('studio');
    }
  };

  const handleViewChange = (view) => {
    if (view === 'studio') {
      handleNavigateToStudio();
    } else {
      setCurrentView(view);
    }
  };

  const detectedSubdomain = extractSubdomain();

  return (
    <div className="min-h-screen w-full max-w-full overflow-x-hidden bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Top Persistent Switcher Bar (Hidden on launched storefronts for a 100% pure merchant experience) */}
      {!detectedSubdomain && currentView !== 'storefront' && (
        <TopSwitcher
          currentView={currentView}
          onViewChange={handleViewChange}
          onOpenProfile={() => setIsProfileOpen(true)}
        />
      )}

      {/* Main View Area */}
      <div className="flex-1">
        <ErrorBoundary>
          {currentView === 'landing' && (
            <LandingPage
              onNavigateToStudio={handleNavigateToStudio}
              onNavigateToStorefront={() => setCurrentView('storefront')}
              onNavigateToDevops={() => setCurrentView('devops')}
              onOpenProfile={() => setIsProfileOpen(true)}
            />
          )}

          {currentView === 'studio' && (
            <StudioApp
              onNavigateToStorefront={() => setCurrentView('storefront')}
              onOpenProfile={() => setIsProfileOpen(true)}
            />
          )}

          {currentView === 'storefront' && (
            <StorefrontLayout />
          )}

          {currentView === 'devops' && (
            <ArchitectureDashboard />
          )}
        </ErrorBoundary>
      </div>

      {/* Dual-Store Auth Modal (Clerk + MongoDB Atlas) */}
      <AuthModal />

      {/* Merchant Profile & Multi-Store Dashboard */}
      <UserProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        onEditStore={(sub) => {
          loadStore(sub);
          setCurrentView('studio');
        }}
        onLaunchNewStore={() => {
          setCurrentView('landing');
        }}
      />
    </div>
  );
}

export default App;
