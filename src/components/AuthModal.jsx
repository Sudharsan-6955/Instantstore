import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Shield, X, Database, Sparkles, CheckCircle2 } from 'lucide-react';

export const AuthModal = () => {
  const { isAuthModalOpen, setIsAuthModalOpen, loginWithGoogle, isSyncing } = useAuth();

  if (!isAuthModalOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-md p-6 bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden">
        {/* Glow ambient background */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 bg-indigo-500/10 border border-indigo-500/30 rounded-xl text-indigo-400">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-100 text-sm">Merchant Authentication</h3>
              <p className="text-[11px] text-slate-400">Google OAuth &bull; Clerk &bull; MongoDB Atlas</p>
            </div>
          </div>
          <button
            onClick={() => setIsAuthModalOpen(false)}
            className="p-1 text-slate-400 hover:text-slate-200 transition-colors rounded-lg hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Dual-Store Banner */}
        <div className="mt-4 p-3 bg-indigo-950/40 border border-indigo-800/40 rounded-2xl text-xs text-indigo-200 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Database className="w-4 h-4 text-emerald-400" />
            <span>Dual-Store Sync: Google &rarr; Atlas</span>
          </div>
          <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 rounded-full text-[10px] font-mono">
            LIVE_OAUTH
          </span>
        </div>

        {/* Prompt */}
        <div className="my-6 text-center space-y-2">
          <h4 className="text-lg font-bold text-white">Sign In to Unlock Merchant Studio</h4>
          <p className="text-xs text-slate-400 max-w-xs mx-auto leading-relaxed">
            InstantStore requires verified identity to create, customize, and manage multi-tenant storefronts.
          </p>
        </div>

        {/* Primary Action: Continue with Google (Gmail) */}
        <div className="space-y-3">
          <button
            onClick={loginWithGoogle}
            disabled={isSyncing}
            className="w-full py-3 px-4 bg-white hover:bg-slate-100 text-slate-900 font-semibold text-sm rounded-xl transition-all shadow-lg shadow-white/10 flex items-center justify-center space-x-3 group"
          >
            {/* Google SVG Icon */}
            <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>{isSyncing ? 'Syncing with MongoDB Atlas...' : 'Continue with Google (Gmail)'}</span>
          </button>
        </div>

        {/* Security & Academic Defense Note */}
        <div className="mt-6 pt-4 border-t border-slate-800 text-[11px] text-slate-500 text-center space-y-1">
          <div className="flex items-center justify-center space-x-1 text-slate-400">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>Dual-Store: Google OAuth via Clerk &bull; Stored in MongoDB Atlas</span>
          </div>
          <p className="text-[10px]">
            Unauthenticated visitors can view the landing page; authenticated merchants are granted Studio access.
          </p>
        </div>
      </div>
    </div>
  );
};
