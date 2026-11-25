import React, { createContext, useContext, useState, useEffect } from 'react';
import { useUser, useClerk, useSignIn } from '@clerk/react';
import { api } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const { user: clerkUser, isLoaded, isSignedIn } = useUser();
  const { signOut, openSignIn } = useClerk();
  const { signIn, isLoaded: isSignInLoaded } = useSignIn();

  const [dbUser, setDbUser] = useState(() => {
    const saved = localStorage.getItem('instantstore_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('instantstore_token') || null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [intendedAction, setIntendedAction] = useState(null);
  const [isSyncing, setIsSyncing] = useState(false);

  // Automatic Dual-Store Synchronization:
  // Whenever Clerk Google OAuth succeeds, sync the user into MongoDB Atlas
  useEffect(() => {
    if (isSignedIn && clerkUser && !isSyncing) {
      const syncToAtlas = async () => {
        setIsSyncing(true);
        try {
          const primaryEmail = clerkUser.primaryEmailAddress?.emailAddress || clerkUser.emailAddresses?.[0]?.emailAddress;
          const fullName = clerkUser.fullName || `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim() || primaryEmail?.split('@')[0];
          const avatarUrl = clerkUser.imageUrl || '';

          const res = await api.syncClerkUser({
            clerkId: clerkUser.id,
            email: primaryEmail,
            name: fullName,
            avatar: avatarUrl,
          });

          if (res.user) {
            setDbUser(res.user);
            if (res.token) {
              setToken(res.token);
              localStorage.setItem('instantstore_token', res.token);
            }
            localStorage.setItem('instantstore_user', JSON.stringify(res.user));
          }

          setIsAuthModalOpen(false);

          if (intendedAction) {
            intendedAction();
            setIntendedAction(null);
          }
        } catch (err) {
          console.error('[Atlas Sync Error] Failed to persist Clerk Google user to MongoDB Atlas:', err);
        } finally {
          setIsSyncing(false);
        }
      };

      syncToAtlas();
    }
  }, [isSignedIn, clerkUser]);

  // Method to enforce auth before protected actions (e.g. entering Merchant Studio)
  const requireAuth = (callback) => {
    if (isSignedIn) {
      if (callback) callback();
      return true;
    } else {
      setIntendedAction(() => callback);
      setIsAuthModalOpen(true);
      return false;
    }
  };

  // Google OAuth Login Trigger
  const loginWithGoogle = async () => {
    try {
      const redirectTarget = typeof window !== 'undefined' ? window.location.origin : 'https://app.devtackle.in';
      if (isSignInLoaded && signIn) {
        await signIn.authenticateWithRedirect({
          strategy: 'oauth_google',
          redirectUrl: redirectTarget,
          redirectUrlComplete: redirectTarget,
          continueSignUp: true,
        });
      } else if (openSignIn) {
        openSignIn({
          fallbackRedirectUrl: redirectTarget,
          forceRedirectUrl: redirectTarget,
          signUpFallbackRedirectUrl: redirectTarget,
          signUpForceRedirectUrl: redirectTarget,
        });
      }
    } catch (err) {
      console.error('[Google OAuth Error]:', err);
      // Fallback: open Clerk modal
      if (openSignIn) {
        const redirectTarget = typeof window !== 'undefined' ? window.location.origin : 'https://app.devtackle.in';
        openSignIn({
          fallbackRedirectUrl: redirectTarget,
          forceRedirectUrl: redirectTarget,
          signUpFallbackRedirectUrl: redirectTarget,
          signUpForceRedirectUrl: redirectTarget,
        });
      }
    }
  };

  const logout = async () => {
    setDbUser(null);
    setToken(null);
    localStorage.removeItem('instantstore_user');
    localStorage.removeItem('instantstore_token');
    if (signOut) {
      await signOut();
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user: dbUser,
        clerkUser,
        token,
        isAuthenticated: !!(isSignedIn && dbUser),
        isLoaded,
        requireAuth,
        loginWithGoogle,
        logout,
        isAuthModalOpen,
        setIsAuthModalOpen,
        isSyncing,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
