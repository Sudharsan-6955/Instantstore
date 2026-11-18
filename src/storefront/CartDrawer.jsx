import React from 'react';
import { useCart } from '../context/CartContext';
import { useTenant } from '../context/TenantContext';
import { X, Plus, Minus, Trash2, ArrowRight, ShoppingBag } from 'lucide-react';

export const CartDrawer = () => {
  const { 
    items, 
    isCartOpen, 
    setIsCartOpen, 
    removeFromCart, 
    updateQuantity, 
    cartSubtotal, 
    cartTax, 
    cartTotal,
    setIsCheckoutModalOpen 
  } = useCart();
  const { tenant } = useTenant();

  if (!isCartOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/70 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-md h-full bg-slate-900 border-l border-slate-800 shadow-2xl flex flex-col justify-between">
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <ShoppingBag className="w-5 h-5" style={{ color: tenant.theme?.primaryColor || '#3B82F6' }} />
            <h3 className="font-bold text-sm text-slate-100">Your Shopping Cart ({items.length})</h3>
          </div>
          <button
            onClick={() => setIsCartOpen(false)}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Cart Item List */}
        <div className="p-4 flex-1 overflow-y-auto space-y-3">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-500">
              <ShoppingBag className="w-12 h-12 stroke-1 mb-2 opacity-40" />
              <p className="text-sm font-medium">Your cart is empty</p>
              <p className="text-xs text-slate-500 mt-1">Browse the catalog to add items</p>
            </div>
          ) : (
            items.map((item) => (
              <div
                key={item.productId}
                className="p-3 bg-slate-800/40 border border-slate-800 rounded-xl flex items-center space-x-3"
              >
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-14 h-14 object-cover rounded-lg bg-slate-950 shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <h4 className="text-xs font-semibold text-slate-100 truncate">{item.title}</h4>
                  <div className="text-xs font-bold text-slate-300 mt-0.5">${item.price}</div>

                  <div className="flex items-center space-x-2 mt-2">
                    <button
                      onClick={() => updateQuantity(item.productId, -1)}
                      className="p-1 bg-slate-800 hover:bg-slate-700 rounded text-slate-300"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="text-xs font-semibold text-white px-1.5">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.productId, 1)}
                      className="p-1 bg-slate-800 hover:bg-slate-700 rounded text-slate-300"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                <button
                  onClick={() => removeFromCart(item.productId)}
                  className="text-slate-500 hover:text-rose-400 p-1.5 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))
          )}
        </div>

        {/* Footer Summary */}
        {items.length > 0 && (
          <div className="p-4 border-t border-slate-800 bg-slate-950/40 space-y-3">
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between text-slate-400">
                <span>Subtotal</span>
                <span>${cartSubtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Estimated Tax (8%)</span>
                <span>${cartTax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Shipping</span>
                <span className="text-emerald-400 font-semibold">FREE</span>
              </div>
              <div className="flex justify-between text-sm font-bold text-white pt-2 border-t border-slate-800">
                <span>Total</span>
                <span>${cartTotal.toFixed(2)}</span>
              </div>
            </div>

            <button
              onClick={() => {
                setIsCartOpen(false);
                setIsCheckoutModalOpen(true);
              }}
              style={{
                backgroundColor: tenant.theme?.primaryColor || '#3B82F6',
                borderRadius: tenant.theme?.borderRadius || '0.75rem',
              }}
              className="w-full py-3 text-white font-semibold text-xs shadow-xl hover:opacity-90 transition-all flex items-center justify-center space-x-2"
            >
              <span>Proceed to Checkout (${cartTotal.toFixed(2)})</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
