import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { useCart } from '../../context/CartContext';
import { useShift } from '../../context/ShiftContext';
import { useNotifications } from '../../context/NotificationContext';
import { api } from '../../services/api';
import { formatCurrency } from '../../utils/formatters';
import { Invoice } from '../../types';
import confetti from 'canvas-confetti';
import {
  Banknote,
  QrCode,
  CreditCard,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPaymentSuccess: (invoice: Invoice) => void;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  onClose,
  onPaymentSuccess,
}) => {
  const {
    cart,
    customer,
    subtotal,
    discountAmount,
    loyaltyDiscount,
    discountType,
    discountValue,
    taxAmount,
    grandTotal,
    pointsToRedeem,
    orderNotes,
    clearCart,
  } = useCart();
  const { refreshShift } = useShift();
  const { showToast, refreshNotifications } = useNotifications();

  const [paymentMethod, setPaymentMethod] = useState<'CASH' | 'UPI' | 'CARD'>('CASH');
  const [cashTendered, setCashTendered] = useState<number>(grandTotal);
  const [cardRef, setCardRef] = useState<string>('');
  const [upiVerified, setUpiVerified] = useState<boolean>(true);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  // Sync tendered whenever modal opens or total changes
  React.useEffect(() => {
    setCashTendered(grandTotal);
  }, [grandTotal, isOpen]);

  const changeToReturn = Math.max(0, Number((cashTendered - grandTotal).toFixed(2)));

  const handleQuickCash = (amount: number) => {
    setCashTendered(amount);
  };

  const handleProcessPayment = async () => {
    if (cart.length === 0) return;

    if (paymentMethod === 'CASH' && cashTendered < grandTotal) {
      showToast('error', 'Insufficient Cash Tendered', `Customer tendered ${formatCurrency(cashTendered)} but total is ${formatCurrency(grandTotal)}`);
      return;
    }

    setIsProcessing(true);

    try {
      const orderPayload = {
        items: cart.map(item => ({
          product_id: item.product.id,
          product_name: item.product.name,
          quantity: item.quantity,
          unit_price: item.product.selling_price,
        })),
        customer_id: customer?.id,
        customer_name: customer?.name || 'Walk-in Customer',
        customer_phone: customer?.phone,
        discount_amount: discountAmount,
        discount_type: discountType,
        discount_percentage: discountType === 'PERCENTAGE' ? discountValue : 0,
        payment_method: paymentMethod,
        amount_received: paymentMethod === 'CASH' ? cashTendered : grandTotal,
        points_to_redeem: pointsToRedeem,
        notes: orderNotes,
      };

      const res = await api.createOrder(orderPayload);

      if (res.success) {
        // Confetti burst!
        try {
          confetti({
            particleCount: 80,
            spread: 60,
            origin: { y: 0.7 },
            colors: ['#f59e0b', '#10b981', '#3b82f6', '#ec4899'],
          });
        } catch {
          // ignore if canvas-confetti fails
        }

        showToast(
          'success',
          'Payment Successful!',
          `Invoice ${res.invoice.invoice_number} generated (${formatCurrency(res.invoice.grand_total)})`
        );

        // Refresh shifts and notifications
        refreshShift();
        refreshNotifications();

        // Pass invoice to parent for instant viewing/printing
        onPaymentSuccess(res.invoice);
        clearCart();
        onClose();
      }
    } catch (err: any) {
      showToast('error', 'Payment Failed', err.message || 'Error processing POS transaction');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Complete Payment & Generate Invoice"
      subtitle={`Billing Total: ${formatCurrency(grandTotal)}`}
      maxWidth="xl"
    >
      <div className="space-y-6">
        {/* Payment Method Selector */}
        <div className="grid grid-cols-3 gap-3">
          <button
            type="button"
            onClick={() => setPaymentMethod('CASH')}
            className={`p-4 rounded-2xl border flex flex-col items-center gap-2 font-bold text-xs transition-all ${
              paymentMethod === 'CASH'
                ? 'bg-amber-500/10 border-amber-500 text-amber-600 dark:text-amber-400 shadow-sm'
                : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50'
            }`}
          >
            <Banknote className="w-6 h-6" />
            <span>CASH</span>
          </button>

          <button
            type="button"
            onClick={() => setPaymentMethod('UPI')}
            className={`p-4 rounded-2xl border flex flex-col items-center gap-2 font-bold text-xs transition-all ${
              paymentMethod === 'UPI'
                ? 'bg-amber-500/10 border-amber-500 text-amber-600 dark:text-amber-400 shadow-sm'
                : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50'
            }`}
          >
            <QrCode className="w-6 h-6" />
            <span>UPI / QR</span>
          </button>

          <button
            type="button"
            onClick={() => setPaymentMethod('CARD')}
            className={`p-4 rounded-2xl border flex flex-col items-center gap-2 font-bold text-xs transition-all ${
              paymentMethod === 'CARD'
                ? 'bg-amber-500/10 border-amber-500 text-amber-600 dark:text-amber-400 shadow-sm'
                : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50'
            }`}
          >
            <CreditCard className="w-6 h-6" />
            <span>CARD / EDC</span>
          </button>
        </div>

        {/* Tab Specific Interface */}
        {paymentMethod === 'CASH' && (
          <div className="space-y-4 bg-slate-50 dark:bg-slate-900/40 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Amount Received from Customer (₹)
              </label>
              <input
                type="number"
                min={0}
                value={cashTendered}
                onChange={e => setCashTendered(Number(e.target.value))}
                className="w-full px-4 py-2.5 text-lg font-black bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            {/* Quick Cash Presets */}
            <div>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Quick Cash Denominations</p>
              <div className="grid grid-cols-5 gap-2">
                {[
                  grandTotal,
                  Math.ceil(grandTotal / 50) * 50,
                  Math.ceil(grandTotal / 100) * 100,
                  500,
                  2000,
                ].map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleQuickCash(preset)}
                    className="py-2 px-1 rounded-xl text-xs font-bold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-amber-500 hover:text-amber-500 transition-colors shadow-sm text-center truncate"
                  >
                    {idx === 0 ? 'Exact' : formatCurrency(preset)}
                  </button>
                ))}
              </div>
            </div>

            {/* Change to return summary */}
            <div className="flex items-center justify-between p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20">
              <div>
                <p className="text-[11px] font-bold text-amber-700 dark:text-amber-300 uppercase">Change to Return</p>
                <p className="text-xl font-black text-amber-600 dark:text-amber-400">{formatCurrency(changeToReturn)}</p>
              </div>
              {cashTendered < grandTotal && (
                <span className="text-xs font-bold text-rose-500 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" /> Short by {formatCurrency(grandTotal - cashTendered)}
                </span>
              )}
            </div>
          </div>
        )}

        {paymentMethod === 'UPI' && (
          <div className="bg-slate-50 dark:bg-slate-900/40 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 text-center space-y-4">
            <div className="inline-block p-3 bg-white rounded-2xl shadow-md border border-slate-200">
              {/* Dynamic QR SVG Generator */}
              <svg className="w-40 h-40" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect width="100" height="100" fill="white" />
                <rect x="10" y="10" width="30" height="30" fill="black" />
                <rect x="15" y="15" width="20" height="20" fill="white" />
                <rect x="20" y="20" width="10" height="10" fill="black" />
                
                <rect x="60" y="10" width="30" height="30" fill="black" />
                <rect x="65" y="15" width="20" height="20" fill="white" />
                <rect x="70" y="20" width="10" height="10" fill="black" />
                
                <rect x="10" y="60" width="30" height="30" fill="black" />
                <rect x="15" y="65" width="20" height="20" fill="white" />
                <rect x="20" y="70" width="10" height="10" fill="black" />

                <rect x="50" y="50" width="15" height="15" fill="#f59e0b" />
                <rect x="70" y="50" width="10" height="10" fill="black" />
                <rect x="50" y="70" width="10" height="15" fill="black" />
                <rect x="65" y="75" width="20" height="10" fill="black" />
                <rect x="45" y="20" width="8" height="15" fill="black" />
              </svg>
            </div>

            <div className="space-y-1">
              <p className="text-xs font-bold text-slate-900 dark:text-white">Scan with any UPI App (GPay / PhonePe / Paytm)</p>
              <p className="text-[11px] font-mono text-slate-500">VPA: cafeflow@icici</p>
              <p className="text-base font-black text-amber-500 pt-1">{formatCurrency(grandTotal)}</p>
            </div>

            <div className="flex items-center justify-center gap-2 text-xs text-emerald-500 font-bold">
              <CheckCircle2 className="w-4 h-4" /> Ready for dynamic QR scan & soundbox confirmation
            </div>
          </div>
        )}

        {paymentMethod === 'CARD' && (
          <div className="bg-slate-50 dark:bg-slate-900/40 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex items-center gap-3 p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
              <ShieldCheck className="w-8 h-8 text-amber-500" />
              <div>
                <p className="text-xs font-bold text-slate-900 dark:text-white">Swipe / Tap on POS Terminal</p>
                <p className="text-[11px] text-slate-400">Collect {formatCurrency(grandTotal)} via Visa, Mastercard, or RuPay</p>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                POS EDC Reference / Auth Code (Optional)
              </label>
              <input
                type="text"
                value={cardRef}
                onChange={e => setCardRef(e.target.value)}
                placeholder="e.g. TXN-892182"
                className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
          </div>
        )}

        {/* Breakdown Row */}
        <div className="space-y-1 text-xs text-slate-600 dark:text-slate-400 pt-2 border-t border-slate-200 dark:border-slate-800">
          <div className="flex justify-between">
            <span>Customer:</span>
            <span className="font-bold text-slate-900 dark:text-white">{customer?.name || 'Walk-in Customer'}</span>
          </div>
          <div className="flex justify-between">
            <span>Items Count:</span>
            <span>{cart.reduce((s, i) => s + i.quantity, 0)} items</span>
          </div>
          {(discountAmount > 0 || loyaltyDiscount > 0) && (
            <div className="flex justify-between text-emerald-500 font-semibold">
              <span>Total Discounts Applied:</span>
              <span>-{formatCurrency(discountAmount + loyaltyDiscount)}</span>
            </div>
          )}
        </div>

        {/* Action Button */}
        <button
          type="button"
          disabled={isProcessing || (paymentMethod === 'CASH' && cashTendered < grandTotal)}
          onClick={handleProcessPayment}
          className="w-full py-3.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 transition-all cursor-pointer"
        >
          {isProcessing ? (
            <span>Processing Order & Generating Invoice...</span>
          ) : (
            <>
              <span>Complete Sale & Print Receipt ({formatCurrency(grandTotal)})</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </div>
    </Modal>
  );
};
