import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { getStorefrontUrl } from '../utils/domain';
import { 
  User, 
  Globe2, 
  ExternalLink, 
  Palette, 
  Trash2, 
  X, 
  Plus, 
  LogOut, 
  CheckCircle2, 
  Loader2, 
  Store,
  Layers,
  Sparkles
} from 'lucide-react';

export const UserProfileModal = ({ isOpen, onClose, onEditStore, onLaunchNewStore }) => {
  const { user, clerkUser, logout } = useAuth();
  const [stores, setStores] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deletingSub, setDeletingSub] = useState(null);
  const [message, setMessage] = useState('');

  const userEmail = user?.email || clerkUser?.primaryEmailAddress?.emailAddress || '';
  const userClerkId = user?.clerkId || clerkUser?.id || '';
  const userName = user?.name || clerkUser?.fullName || userEmail.split('@')[0] || 'Merchant';
  const userAvatar = user?.avatar || clerkUser?.imageUrl || '';

  const fetchUserStores = async () => {
    if (!userEmail && !userClerkId) return;
    setIsLoading(true);
    try {
      const res = await api.getUserStores(userClerkId || userEmail);
      if (res.tenants) {
        setStores(res.tenants);
      }
    } catch (err) {
      console.error('[Fetch User Stores Error]:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchUserStores();
    }
  }, [isOpen, userEmail, userClerkId]);

  if (!isOpen) return null;

  const handleDeleteStore = async (subdomain) => {
    if (!confirm(`Are you sure you want to delete '${subdomain}'? All pages, products, and configurations will be permanently removed from MongoDB Atlas.`)) {
      return;
    }
    setDeletingSub(subdomain);
    try {
      await api.deleteStore(subdomain);
      setStores(prev => prev.filter(s => s.subdomain !== subdomain));
      setMessage(`Store '${subdomain}' deleted successfully.`);
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      alert('Delete failed: ' + (err.message || 'Please verify connection.'));
    } finally {
      setDeletingSub(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header Ribbon */}
        <div className="p-4 sm:p-5 border-b border-slate-800 bg-slate-950/60 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <Store className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-white text-sm">Merchant Profile & Websites</h3>
              <p className="text-[10px] text-slate-400">Manage all your deployed zero-build cloud storefronts</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* User Identity Card */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-indigo-950/30 via-slate-900 to-purple-950/30 border-b border-slate-800 shrink-0">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center space-x-3.5">
              {userAvatar ? (
                <img src={userAvatar} alt={userName} className="w-12 h-12 rounded-2xl object-cover border border-slate-700 shadow-md" />
              ) : (
                <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center text-white font-black text-lg shadow-md">
                  {userName[0]?.toUpperCase() || 'U'}
                </div>
              )}
              <div>
                <div className="flex items-center space-x-2">
                  <h4 className="font-bold text-white text-base">{userName}</h4>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-mono">
                    Google Verified
                  </span>
                </div>
                <div className="text-xs text-slate-400 font-mono mt-0.5">{userEmail}</div>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => {
                  onClose();
                  logout();
                }}
                className="px-3 py-1.5 bg-slate-800 hover:bg-rose-500/20 hover:text-rose-300 text-slate-300 rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition-colors cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </div>

        {/* Action message */}
        {message && (
          <div className="mx-4 mt-3 p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center space-x-2 animate-fadeIn">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{message}</span>
          </div>
        )}

        {/* User Websites Section (Scrollable) */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3">
          <div className="flex items-center justify-between pb-1">
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center space-x-1.5">
              <Layers className="w-3.5 h-3.5 text-indigo-400" />
              <span>Your Websites ({stores.length})</span>
            </span>

            <button
              onClick={() => {
                onClose();
                onLaunchNewStore();
              }}
              className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold flex items-center space-x-1 shadow-md shadow-indigo-600/20 transition-all cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Launch New Website</span>
            </button>
          </div>

          {isLoading ? (
            <div className="py-12 text-center space-y-2">
              <Loader2 className="w-6 h-6 animate-spin text-indigo-400 mx-auto" />
              <p className="text-xs text-slate-500 font-mono">Fetching your storefront records from MongoDB Atlas...</p>
            </div>
          ) : stores.length === 0 ? (
            <div className="py-12 px-4 text-center border border-dashed border-slate-800 rounded-2xl space-y-3 bg-slate-950/40">
              <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center mx-auto">
                <Sparkles className="w-5 h-5" />
              </div>
              <h5 className="font-bold text-white text-sm">No Live Websites Yet</h5>
              <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
                You haven't launched any websites under this Google account yet. Create your first branded storefront in under 50 milliseconds!
              </p>
              <button
                onClick={() => {
                  onClose();
                  onLaunchNewStore();
                }}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold inline-flex items-center space-x-1.5 transition-all"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Launch Your First Website</span>
              </button>
            </div>
          ) : (
            <div className="space-y-2.5">
              {stores.map((st) => {
                const liveUrl = getStorefrontUrl(st.subdomain);

                return (
                  <div
                    key={st.subdomain}
                    className="p-3.5 bg-slate-950/70 border border-slate-800 hover:border-slate-700/80 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-all"
                  >
                    <div className="flex items-center space-x-3 min-w-0">
                      <div 
                        style={{ backgroundColor: st.theme?.primaryColor || '#6366F1' }}
                        className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-base shadow shrink-0"
                      >
                        {st.name?.[0] || 'S'}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center space-x-2">
                          <h5 className="font-bold text-white text-sm truncate">{st.name}</h5>
                          <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[9px] font-mono">
                            PUBLISHED
                          </span>
                        </div>
                        <div className="flex items-center space-x-1.5 text-xs text-indigo-300 font-mono mt-0.5 truncate">
                          <Globe2 className="w-3 h-3 text-slate-500 shrink-0" />
                          <span className="truncate">{liveUrl}</span>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center space-x-2 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-800">
                      <button
                        onClick={() => {
                          onClose();
                          onEditStore(st.subdomain);
                        }}
                        className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition-colors cursor-pointer"
                        title="Edit theme, pages & products in Studio"
                      >
                        <Palette className="w-3.5 h-3.5 text-indigo-400" />
                        <span>Customize</span>
                      </button>

                      <a
                        href={liveUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs transition-colors"
                        title="Open live storefront"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>

                      <button
                        onClick={() => handleDeleteStore(st.subdomain)}
                        disabled={deletingSub === st.subdomain}
                        className="p-1.5 bg-slate-800 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 rounded-xl text-xs transition-colors cursor-pointer disabled:opacity-50"
                        title="Delete website from Atlas"
                      >
                        {deletingSub === st.subdomain ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Trash2 className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
