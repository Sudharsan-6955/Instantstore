import React from 'react';
import { AlertCircle, ArrowRight, Store, Globe, Sparkles, ShieldAlert, Rocket } from 'lucide-react';

export const StoreNotFound = ({ subdomain }) => {
  const currentHost = typeof window !== 'undefined' ? window.location.host : `${subdomain}.devtackle.in`;
  const basePlatformUrl = 'https://app.devtackle.in';

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between selection:bg-indigo-500 selection:text-white font-sans">
      {/* Top Ambient Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-gradient-to-b from-indigo-600/15 via-rose-500/10 to-transparent blur-3xl pointer-events-none" />

      {/* Mini Brand Header */}
      <header className="relative z-10 border-b border-slate-800/60 bg-slate-950/80 backdrop-blur-md px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between w-full max-w-full overflow-hidden">
        <a 
          href={basePlatformUrl}
          className="flex items-center space-x-2 sm:space-x-2.5 text-white font-extrabold tracking-tight hover:opacity-90 transition-opacity min-w-0"
        >
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20 shrink-0">
            <Store className="w-4 h-4" />
          </div>
          <span className="text-sm sm:text-base font-bold bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-200 to-slate-400 truncate">
            InstantStore
          </span>
        </a>

        <div className="flex items-center space-x-2">
          <span className="hidden sm:inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-mono bg-slate-900 border border-slate-800 text-slate-400">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mr-2 animate-pulse" />
            HTTP 404 &bull; Storefront Unresolved
          </span>
        </div>
      </header>

      {/* Main 404 Hero Container */}
      <main className="relative z-10 max-w-2xl mx-auto px-6 py-16 text-center my-auto">
        {/* Glowing Badge */}
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-semibold bg-rose-950/60 border border-rose-800/60 text-rose-300 mb-6 shadow-lg shadow-rose-950/40">
          <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
          <span>Storefront Not Found</span>
        </div>

        {/* Big Code */}
        <h1 className="text-7xl sm:text-8xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-b from-white via-slate-300 to-slate-600 mb-4 select-none">
          404
        </h1>

        <h2 className="text-xl sm:text-2xl font-bold text-slate-100 mb-3 tracking-tight">
          This store is not published yet
        </h2>

        <p className="text-sm text-slate-400 leading-relaxed max-w-lg mx-auto mb-8">
          The requested merchant subdomain has not been registered or published to the global edge network.
        </p>

        {/* Subdomain Card */}
        <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-2xl max-w-md mx-auto text-left space-y-2 mb-8 shadow-xl">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="flex items-center space-x-1.5">
              <Globe className="w-3.5 h-3.5 text-indigo-400" />
              <span>Target Host</span>
            </span>
            <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-950/60 border border-emerald-800/60 text-emerald-400 font-mono">
              Domain Available
            </span>
          </div>
          <div className="font-mono text-sm font-semibold text-white truncate bg-slate-950/80 p-2.5 rounded-xl border border-slate-800">
            https://{currentHost}
          </div>
          <p className="text-[11px] text-slate-500 pt-1">
            If you own this store name, log in to InstantStore Studio and click <strong>Publish Store</strong> to go live instantly.
          </p>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <a
            href={basePlatformUrl}
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-semibold text-sm shadow-xl shadow-indigo-600/30 transition-all flex items-center justify-center space-x-2 group"
          >
            <Rocket className="w-4 h-4 group-hover:-translate-y-0.5 transition-transform" />
            <span>Launch Store on InstantStore</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </a>

          <a
            href={basePlatformUrl}
            className="w-full sm:w-auto px-5 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 font-medium text-sm transition-colors flex items-center justify-center space-x-1.5"
          >
            <span>Platform Portal</span>
          </a>
        </div>
      </main>

      {/* Footer Info */}
      <footer className="relative z-10 border-t border-slate-900 px-6 py-6 text-center text-xs text-slate-500">
        <p>InstantStore &bull; Zero-Build Multi-Tenant Web Platform with Wildcard Edge Routing</p>
      </footer>
    </div>
  );
};
