import React from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  Building2, 
  Palette, 
  Cpu, 
  LogOut, 
  Zap,
  User
} from 'lucide-react';

export const TopSwitcher = ({ currentView, onViewChange, onOpenProfile }) => {
  const { user, isAuthenticated, logout, setIsAuthModalOpen } = useAuth();

  return (
    <header className="sticky top-0 z-40 w-full max-w-full bg-slate-950/90 backdrop-blur-md border-b border-slate-800 text-xs overflow-hidden">
      <div className="max-w-7xl mx-auto px-2 sm:px-4 h-12 flex items-center justify-between gap-1 sm:gap-3 w-full">
        {/* Brand Logo & Tag */}
        <div className="flex items-center space-x-1.5 sm:space-x-2 shrink-0 min-w-0">
          <button 
            onClick={() => onViewChange('landing')}
            className="flex items-center space-x-1 sm:space-x-1.5 px-2 sm:px-2.5 py-1 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 rounded-lg text-indigo-300 font-semibold hover:border-indigo-500/50 transition-colors shrink-0"
            title="InstantStore Platform"
          >
            <Zap className="w-3.5 h-3.5 text-indigo-400 fill-indigo-400 shrink-0" />
            <span className="tracking-tight text-white font-bold hidden sm:inline">InstantStore</span>
            <span className="tracking-tight text-white font-bold sm:hidden">IS</span>
          </button>
          <span className="hidden lg:inline-flex px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-full text-[10px] font-mono">
            Zero-Build Edge
          </span>
        </div>

        {/* Clean Primary Navigation (Platform, Merchant Studio, DevOps Benchmarks) */}
        <div className="flex items-center space-x-0.5 sm:space-x-1 bg-slate-900/90 p-0.5 sm:p-1 border border-slate-800 rounded-xl shrink-0">
          <button
            onClick={() => onViewChange('landing')}
            className={`px-2 sm:px-3.5 py-1 rounded-lg flex items-center space-x-1 sm:space-x-1.5 transition-all text-[11px] sm:text-xs ${
              currentView === 'landing'
                ? 'bg-indigo-600 text-white font-medium shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
            title="Platform"
          >
            <Building2 className="w-3.5 h-3.5 shrink-0" />
            <span className="hidden sm:inline">Platform</span>
          </button>

          <button
            onClick={() => onViewChange('studio')}
            className={`px-2 sm:px-3.5 py-1 rounded-lg flex items-center space-x-1 sm:space-x-1.5 transition-all text-[11px] sm:text-xs ${
              currentView === 'studio'
                ? 'bg-indigo-600 text-white font-medium shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
            title="Merchant Studio"
          >
            <Palette className="w-3.5 h-3.5 shrink-0" />
            <span className="hidden md:inline">Merchant </span>
            <span>Studio</span>
          </button>

          <div className="h-4 w-px bg-slate-800 mx-0.5 sm:mx-1" />

          <button
            onClick={() => onViewChange('devops')}
            className={`px-2 sm:px-3.5 py-1 rounded-lg flex items-center space-x-1 sm:space-x-1.5 transition-all text-[11px] sm:text-xs ${
              currentView === 'devops'
                ? 'bg-emerald-600 text-white font-medium shadow'
                : 'text-emerald-400/80 hover:text-emerald-300'
            }`}
            title="DevOps Benchmarks"
          >
            <Cpu className="w-3.5 h-3.5 shrink-0" />
            <span>DevOps</span>
            <span className="hidden md:inline"> Benchmarks</span>
          </button>
        </div>

        {/* Right Section: User Auth Profile (Google OAuth via Clerk & Atlas) */}
        <div className="flex items-center space-x-1 sm:space-x-2 shrink-0">
          {isAuthenticated ? (
            <div className="flex items-center space-x-1 sm:space-x-2">
              <button
                onClick={onOpenProfile}
                className="flex items-center space-x-1 sm:space-x-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-indigo-500/50 px-2 sm:px-2.5 py-1 rounded-xl transition-all cursor-pointer group"
                title="Manage My Websites"
              >
                {user?.avatar ? (
                  <img src={user.avatar} alt="Google avatar" className="w-5 h-5 rounded-full object-cover shrink-0" />
                ) : (
                  <div className="w-5 h-5 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold text-[10px] shrink-0">
                    {user?.name?.[0]?.toUpperCase() || 'G'}
                  </div>
                )}
                <span className="text-slate-200 font-medium hidden sm:inline truncate max-w-[80px] md:max-w-[120px] group-hover:text-white">
                  {user?.name || user?.email}
                </span>
                <span className="px-1.5 py-0.2 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded text-[9px] font-mono hidden lg:inline">
                  My Websites
                </span>
              </button>

              <button
                onClick={logout}
                className="text-slate-400 hover:text-rose-400 transition-colors p-1.5 bg-slate-900 border border-slate-800 rounded-xl cursor-pointer shrink-0"
                title="Sign Out"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => setIsAuthModalOpen(true)}
              className="px-2 sm:px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-900 font-semibold rounded-lg transition-all shadow-sm flex items-center space-x-1 sm:space-x-1.5 text-xs shrink-0 cursor-pointer"
            >
              <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
              <span className="hidden sm:inline">Sign In with Google</span>
              <span className="sm:hidden">Sign In</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
