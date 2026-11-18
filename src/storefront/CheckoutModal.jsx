import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { useTenant } from '../context/TenantContext';
import { api } from '../services/api';
import confetti from 'canvas-confetti';
import { 
  X, 
  CreditCard, 
  Lock, 
  CheckCircle2, 
  Package, 
  Truck, 
  Sparkles,
  ArrowRight
} from 'lucide-react';

export const CheckoutModal = () => {
  const { 
    isCheckoutModalOpen, 
    setIsCheckoutModalOpen, 
    items, 
    cartSubtotal, 
    cartTax, 
    cartTotal, 
    clearCart 
  } = useCart();
  const { tenant } = useTenant();

  const [loading, setLoading] = useState(false);
  const [completedOrder, setCompletedOrder] = useState(null);
  const [formData, setFormData] = useState({
    name: 'Jordan Miller',
    email: 'jordan@developer.io',
    phone: '+1 (555) 019-2834',
    address: '404 Innovation Way',
    city: 'Austin, TX',
    postalCode: '78701',
  });

  if (!isCheckoutModalOpen) return null;

  const handleCheckoutSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const payload = {
      tenantId: tenant.subdomain,
      customer: formData,
      items: items.map((i) => ({
        productId: i.productId,
        title: i.title,
        price: i.price,
        quantity: i.quantity,
        image: i.image,
      })),
      subtotal: cartSubtotal,
      shipping: 0,
      tax: cartTax,
      total: cartTotal,
      paymentMethod: 'Instant Simulated Gateway',
    };

    try {
      const res = await api.createOrder(tenant.subdomain, payload);
      setLoading(false);
      if (res.success) {
        setCompletedOrder(res.order || {
          orderNumber: res.orderNumber || 'ORD-TECH-1002',
          total: cartTotal,
          customer: formData,
          createdAt: new Date().toISOString()
        });

        // Trigger celebratory confetti
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        });

        clearCart();
      }
    } catch (err) {
      setLoading(false);
      console.error('Checkout error:', err);
    }
  };

  const handleClose = () => {
    setCompletedOrder(null);
    setIsCheckoutModalOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden p-6">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center space-x-2">
            <CreditCard className="w-5 h-5 text-indigo-400" />
            <h3 className="font-bold text-sm text-slate-100">
              {completedOrder ? 'Order Confirmed!' : `Checkout • ${tenant.name}`}
            </h3>
          </div>
          <button
            onClick={handleClose}
            className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {completedOrder ? (
          <div className="py-8 text-center space-y-4 animate-scaleIn">
            <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-full mx-auto flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div className="space-y-1">
              <span className="px-3 py-1 bg-emerald-500/20 text-emerald-300 font-mono text-xs rounded-full">
                {completedOrder.orderNumber}
              </span>
              <h4 className="text-xl font-bold text-white mt-2">Payment Authorized</h4>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Thank you, {completedOrder.customer?.name}. Your order has been atomically committed to MongoDB Atlas under tenant identifier: <strong className="text-indigo-400">{tenant.subdomain}</strong>.
              </p>
            </div>

            <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-xl text-left text-xs space-y-2">
              <div className="flex justify-between text-slate-400">
                <span>Total Amount Paid:</span>
                <span className="font-bold text-white">${completedOrder.total || cartTotal}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Shipping Address:</span>
                <span className="text-white">{completedOrder.customer?.address}, {completedOrder.customer?.city}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Delivery Status:</span>
                <span className="text-emerald-400 font-semibold flex items-center space-x-1">
                  <Truck className="w-3.5 h-3.5" />
                  <span>Processing</span>
                </span>
              </div>
            </div>

            <button
              onClick={handleClose}
              style={{
                backgroundColor: tenant.theme?.primaryColor || '#3B82F6',
                borderRadius: tenant.theme?.borderRadius || '0.75rem',
              }}
              className="w-full py-2.5 text-white font-semibold text-xs shadow-lg hover:opacity-90 transition-all"
            >
              Back to Storefront
            </button>
          </div>
        ) : (
          <form onSubmit={handleCheckoutSubmit} className="mt-4 space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Email</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Shipping Address</label>
              <input
                type="text"
                required
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">City & State</label>
                <input
                  type="text"
                  required
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Phone</label>
                <input
                  type="text"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            {/* Payment Method Badge */}
            <div className="p-3 bg-slate-950/50 border border-slate-800 rounded-xl flex items-center justify-between text-xs">
              <div className="flex items-center space-x-2">
                <Lock className="w-4 h-4 text-emerald-400" />
                <span className="text-slate-300 font-medium">Instant Card Auth (Sandbox Simulation)</span>
              </div>
              <span className="text-emerald-400 font-mono text-[10px] bg-emerald-500/10 px-2 py-0.5 rounded">
                SECURE
              </span>
            </div>

            {/* Order total */}
            <div className="p-3 bg-indigo-950/30 border border-indigo-800/40 rounded-xl flex items-center justify-between text-xs">
              <span className="text-indigo-200">Amount Charged to Merchant Scope:</span>
              <span className="text-white font-bold text-sm">${cartTotal.toFixed(2)}</span>
            </div>

            <button
              type="submit"
              disabled={loading || items.length === 0}
              style={{
                backgroundColor: tenant.theme?.primaryColor || '#3B82F6',
                borderRadius: tenant.theme?.borderRadius || '0.75rem',
              }}
              className="w-full py-3 text-white font-semibold text-xs shadow-xl hover:opacity-90 transition-all flex items-center justify-center space-x-2"
            >
              {loading ? (
                <span>Authorizing Order on Atlas...</span>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Authorize & Pay ${cartTotal.toFixed(2)}</span>
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
