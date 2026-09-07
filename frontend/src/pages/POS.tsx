import React, { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import { api } from '../services/api';
import { Product, Category, Invoice } from '../types';
import { formatCurrency } from '../utils/formatters';
import { CustomerSelectModal } from '../components/pos/CustomerSelectModal';
import { HeldBillsModal } from '../components/pos/HeldBillsModal';
import { PaymentModal } from '../components/pos/PaymentModal';
import { InvoiceModal } from '../components/invoices/InvoiceModal';
import {
  Search,
  Plus,
  Minus,
  Trash2,
  User,
  PauseCircle,
  PlayCircle,
  CreditCard,
  Percent,
  Award,
  Sparkles,
  ShoppingBag,
  Coffee,
  Check,
  RefreshCw,
  Tag,
} from 'lucide-react';

export const POS: React.FC = () => {
  const {
    cart,
    customer,
    heldOrders,
    discountType,
    discountValue,
    pointsToRedeem,
    orderNotes,
    subtotal,
    discountAmount,
    loyaltyDiscount,
    taxAmount,
    grandTotal,
    totalItemsCount,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    setCustomer,
    setDiscount,
    setPointsToRedeem,
    setOrderNotes,
    holdCurrentBill,
  } = useCart();

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Modals
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
  const [isHeldBillsOpen, setIsHeldBillsOpen] = useState(false);
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [completedInvoice, setCompletedInvoice] = useState<Invoice | null>(null);

  // Discount inline edit popover
  const [isDiscountOpen, setIsDiscountOpen] = useState(false);
  const [tempDiscType, setTempDiscType] = useState<'NONE' | 'PERCENTAGE' | 'FIXED'>('NONE');
  const [tempDiscVal, setTempDiscVal] = useState<number>(0);

  // Keyboard shortcut listener (F4 for hold, F2 for quick focus)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'F4') {
        e.preventDefault();
        holdCurrentBill();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [holdCurrentBill]);

  const loadCatalog = async () => {
    try {
      const [pRes, cRes] = await Promise.all([
        api.getProducts({ available_only: true }),
        api.getCategories(),
      ]);
      if (pRes.success) setProducts(pRes.data);
      if (cRes.success) setCategories(cRes.data);
    } catch (err) {
      console.error('Failed to load POS catalog', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCatalog();
  }, []);

  const filteredProducts = products.filter(p => {
    const matchesCategory = selectedCategory === 'all' || p.category_id === selectedCategory;
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleApplyDiscount = () => {
    setDiscount(tempDiscType, tempDiscVal);
    setIsDiscountOpen(false);
  };

  return (
    <div className="h-[calc(100vh-6rem)] flex flex-col lg:flex-row gap-4 select-none">
      {/* ================= LEFT: PRODUCT CATALOG ================= */}
      <div className="flex-1 flex flex-col min-w-0 bg-white dark:bg-[#181b24] border border-slate-200 dark:border-slate-800 rounded-3xl p-4 shadow-sm overflow-hidden">
        {/* Search & Top Bar */}
        <div className="flex items-center gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search cafe menu by item name, SKU, or tag..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="text-xs text-slate-400 hover:text-slate-600 absolute right-3 top-1/2 -translate-y-1/2"
              >
                Clear
              </button>
            )}
          </div>

          <button
            onClick={loadCatalog}
            title="Refresh menu catalog"
            className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        {/* Category Filter Chips */}
        <div className="flex items-center gap-2 py-3 overflow-x-auto custom-scrollbar shrink-0">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-all ${
              selectedCategory === 'all'
                ? 'bg-amber-500 text-slate-950 shadow-sm'
                : 'bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800'
            }`}
          >
            All Items ({products.length})
          </button>

          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-all flex items-center gap-1.5 ${
                selectedCategory === cat.id
                  ? 'bg-amber-500 text-slate-950 shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800'
              }`}
            >
              <span>{cat.name}</span>
            </button>
          ))}
        </div>

        {/* Product Cards Grid */}
        <div className="flex-1 overflow-y-auto custom-scrollbar pr-1 pt-1">
          {isLoading ? (
            <div className="flex items-center justify-center h-64 text-xs text-slate-400">
              Loading menu catalog...
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-center space-y-2">
              <Coffee className="w-8 h-8 text-slate-400 stroke-1" />
              <p className="text-xs font-bold text-slate-600 dark:text-slate-300">No products match this filter</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3">
              {filteredProducts.map(product => {
                const inCart = cart.find(item => item.product.id === product.id);

                return (
                  <div
                    key={product.id}
                    onClick={() => addToCart(product)}
                    className={`group relative overflow-hidden bg-slate-50 dark:bg-[#1f2430] border rounded-2xl p-3 flex flex-col justify-between hover:shadow-lg transition-all cursor-pointer ${
                      inCart
                        ? 'border-amber-500 ring-1 ring-amber-500/50 bg-amber-500/5 dark:bg-amber-500/10'
                        : 'border-slate-200 dark:border-slate-800 hover:border-amber-500/40'
                    }`}
                  >
                    {/* Item Image */}
                    <div className="relative w-full h-28 rounded-xl overflow-hidden mb-2 bg-slate-200 dark:bg-slate-800">
                      <img
                        src={product.image_url}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                      />
                      {inCart && (
                        <div className="absolute top-1.5 right-1.5 bg-amber-500 text-slate-950 text-xs font-black px-2 py-0.5 rounded-full shadow-md">
                          {inCart.quantity} in cart
                        </div>
                      )}
                      {product.has_recipe && (
                        <div className="absolute bottom-1.5 left-1.5 bg-black/60 backdrop-blur-md text-[9px] font-bold text-amber-400 px-1.5 py-0.5 rounded">
                          Recipe BOM
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="space-y-1">
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white line-clamp-1 group-hover:text-amber-500 transition-colors">
                        {product.name}
                      </h4>
                      <p className="text-[10px] text-slate-400 line-clamp-1">
                        {product.description || product.category_name}
                      </p>
                    </div>

                    {/* Price & Add Button */}
                    <div className="flex items-center justify-between pt-2 mt-2 border-t border-slate-200/60 dark:border-slate-700/60">
                      <span className="text-sm font-black text-slate-900 dark:text-white">
                        {formatCurrency(product.selling_price)}
                      </span>
                      <span className="p-1 rounded-lg bg-amber-500 text-slate-950 font-bold hover:bg-amber-400 shadow-sm transition-transform active:scale-95">
                        <Plus className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* ================= RIGHT: CURRENT CART & BILLING ================= */}
      <div className="w-full lg:w-96 shrink-0 bg-white dark:bg-[#181b24] border border-slate-200 dark:border-slate-800 rounded-3xl p-4 shadow-sm flex flex-col justify-between overflow-hidden">
        {/* Cart Header & Customer Bar */}
        <div className="space-y-3 pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-4 h-4 text-amber-500" />
              <h3 className="text-sm font-extrabold text-slate-900 dark:text-white tracking-tight">Current Cart</h3>
              {totalItemsCount > 0 && (
                <span className="px-1.5 py-0.5 rounded-full text-[10px] font-black bg-amber-500 text-slate-950">
                  {totalItemsCount}
                </span>
              )}
            </div>

            {/* Held Bills Counter / Drawer trigger */}
            {heldOrders.length > 0 && (
              <button
                onClick={() => setIsHeldBillsOpen(true)}
                className="flex items-center gap-1 text-[11px] font-bold px-2 py-1 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 hover:bg-amber-500/20 transition-all animate-pulse"
              >
                <PlayCircle className="w-3.5 h-3.5" />
                <span>Held ({heldOrders.length})</span>
              </button>
            )}
          </div>

          {/* Customer Attachment Bar */}
          <button
            onClick={() => setIsCustomerModalOpen(true)}
            className="w-full p-2 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 flex items-center justify-between hover:border-amber-500/40 transition-all text-left"
          >
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-7 h-7 rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0">
                <User className="w-3.5 h-3.5" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                  {customer ? customer.name : 'Walk-in Customer'}
                </p>
                <p className="text-[10px] text-slate-400">
                  {customer ? `${customer.phone} • ${customer.loyalty_points} Points` : 'Click to attach loyalty profile'}
                </p>
              </div>
            </div>
            <span className="text-[10px] font-bold text-amber-500 shrink-0">Change</span>
          </button>
        </div>

        {/* Cart Item Rows */}
        <div className="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/60 custom-scrollbar pr-1 py-2">
          {cart.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 text-center space-y-2">
              <ShoppingBag className="w-8 h-8 text-slate-400 stroke-1" />
              <p className="text-xs font-bold text-slate-600 dark:text-slate-300">Your cart is empty</p>
              <p className="text-[11px] text-slate-400 max-w-[200px]">
                Click any product on the left menu to start billing.
              </p>
            </div>
          ) : (
            cart.map(item => (
              <div key={item.product.id} className="py-2.5 flex items-center justify-between gap-2 group">
                <div className="min-w-0 flex-1 space-y-0.5">
                  <p className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">{item.product.name}</p>
                  <p className="text-[10px] text-slate-400">{formatCurrency(item.product.selling_price)} each</p>
                </div>

                {/* Quantity Controls */}
                <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-900 p-1 rounded-xl shrink-0">
                  <button
                    onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                    className="p-1 rounded-lg hover:bg-white dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors"
                  >
                    <Minus className="w-3 h-3" />
                  </button>
                  <span className="w-5 text-center text-xs font-black text-slate-900 dark:text-white">
                    {item.quantity}
                  </span>
                  <button
                    onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                    className="p-1 rounded-lg hover:bg-white dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>

                {/* Line Total & Remove */}
                <div className="text-right shrink-0 min-w-16">
                  <p className="text-xs font-black text-slate-900 dark:text-white">
                    {formatCurrency(item.product.selling_price * item.quantity)}
                  </p>
                  <button
                    onClick={() => removeFromCart(item.product.id)}
                    className="text-[10px] text-slate-400 hover:text-rose-500 transition-colors opacity-0 group-hover:opacity-100"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Billing Calculations & Discounts */}
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2">
          {/* Discount and Points Bar */}
          <div className="flex items-center justify-between text-xs pb-1">
            <button
              onClick={() => setIsDiscountOpen(prev => !prev)}
              className="flex items-center gap-1 text-[11px] font-bold text-amber-500 hover:underline"
            >
              <Tag className="w-3.5 h-3.5" />
              {discountAmount > 0 ? `Discount Applied (${formatCurrency(discountAmount)})` : 'Apply Discount / Promo'}
            </button>

            {customer && customer.loyalty_points > 0 && (
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] text-slate-400">Redeem Pts:</span>
                <input
                  type="number"
                  min={0}
                  max={customer.loyalty_points}
                  value={pointsToRedeem}
                  onChange={e => setPointsToRedeem(Number(e.target.value))}
                  className="w-14 px-1.5 py-0.5 text-center text-xs font-bold bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg"
                />
              </div>
            )}
          </div>

          {/* Discount Inline Editor */}
          {isDiscountOpen && (
            <div className="p-3 bg-slate-50 dark:bg-slate-900/80 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2 text-xs">
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setTempDiscType('PERCENTAGE')}
                  className={`flex-1 py-1 rounded-lg font-bold text-[11px] ${
                    tempDiscType === 'PERCENTAGE' ? 'bg-amber-500 text-slate-950' : 'bg-slate-200 dark:bg-slate-800'
                  }`}
                >
                  Percentage (%)
                </button>
                <button
                  type="button"
                  onClick={() => setTempDiscType('FIXED')}
                  className={`flex-1 py-1 rounded-lg font-bold text-[11px] ${
                    tempDiscType === 'FIXED' ? 'bg-amber-500 text-slate-950' : 'bg-slate-200 dark:bg-slate-800'
                  }`}
                >
                  Fixed (₹)
                </button>
              </div>

              <div className="flex gap-2">
                <input
                  type="number"
                  placeholder={tempDiscType === 'PERCENTAGE' ? 'e.g. 10%' : 'e.g. 50'}
                  value={tempDiscVal || ''}
                  onChange={e => setTempDiscVal(Number(e.target.value))}
                  className="flex-1 px-2.5 py-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs"
                />
                <button
                  onClick={handleApplyDiscount}
                  className="px-3 py-1 bg-amber-500 text-slate-950 font-bold rounded-lg text-xs"
                >
                  Apply
                </button>
              </div>
            </div>
          )}

          {/* Totals Breakdown */}
          <div className="space-y-1 text-xs text-slate-600 dark:text-slate-400">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span className="font-semibold text-slate-900 dark:text-white">{formatCurrency(subtotal)}</span>
            </div>
            {discountAmount > 0 && (
              <div className="flex justify-between text-emerald-500 font-semibold">
                <span>Custom Discount:</span>
                <span>-{formatCurrency(discountAmount)}</span>
              </div>
            )}
            {loyaltyDiscount > 0 && (
              <div className="flex justify-between text-amber-500 font-semibold">
                <span>Loyalty Points Discount:</span>
                <span>-{formatCurrency(loyaltyDiscount)}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span>GST / Tax (5%):</span>
              <span className="font-semibold text-slate-900 dark:text-white">{formatCurrency(taxAmount)}</span>
            </div>
            <div className="flex justify-between text-base font-black pt-1.5 border-t border-slate-200 dark:border-slate-800 text-slate-950 dark:text-white">
              <span>FINAL TOTAL:</span>
              <span className="text-amber-500 text-lg">{formatCurrency(grandTotal)}</span>
            </div>
          </div>

          {/* Action Buttons: Hold, Clear, Pay */}
          <div className="pt-2 space-y-2">
            <div className="flex gap-2">
              <button
                type="button"
                onClick={holdCurrentBill}
                disabled={cart.length === 0}
                title="Hold Bill (F4)"
                className="flex-1 py-2 px-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 text-slate-700 dark:text-slate-300 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
              >
                <PauseCircle className="w-3.5 h-3.5" /> Hold Bill (F4)
              </button>

              <button
                type="button"
                onClick={clearCart}
                disabled={cart.length === 0}
                className="py-2 px-3 rounded-xl border border-rose-500/20 text-rose-500 hover:bg-rose-500/10 disabled:opacity-40 text-xs font-bold transition-colors"
              >
                Clear
              </button>
            </div>

            <button
              type="button"
              disabled={cart.length === 0}
              onClick={() => setIsPaymentOpen(true)}
              className="w-full py-3.5 px-4 rounded-2xl bg-amber-500 hover:bg-amber-400 disabled:opacity-40 text-slate-950 font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 transition-all cursor-pointer"
            >
              <CreditCard className="w-5 h-5" />
              <span>PAY & GENERATE INVOICE ({formatCurrency(grandTotal)})</span>
            </button>
          </div>
        </div>
      </div>

      {/* Modals */}
      <CustomerSelectModal
        isOpen={isCustomerModalOpen}
        onClose={() => setIsCustomerModalOpen(false)}
        onSelectCustomer={setCustomer}
        currentCustomer={customer}
      />

      <HeldBillsModal
        isOpen={isHeldBillsOpen}
        onClose={() => setIsHeldBillsOpen(false)}
      />

      <PaymentModal
        isOpen={isPaymentOpen}
        onClose={() => setIsPaymentOpen(false)}
        onPaymentSuccess={invoice => setCompletedInvoice(invoice)}
      />

      <InvoiceModal
        isOpen={Boolean(completedInvoice)}
        onClose={() => setCompletedInvoice(null)}
        invoice={completedInvoice}
      />
    </div>
  );
};
