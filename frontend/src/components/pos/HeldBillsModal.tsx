import React from 'react';
import { Modal } from '../common/Modal';
import { useCart } from '../../context/CartContext';
import { formatCurrency, formatDateTime } from '../../utils/formatters';
import { Play, Trash2, Clock, ShoppingCart } from 'lucide-react';

interface HeldBillsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HeldBillsModal: React.FC<HeldBillsModalProps> = ({ isOpen, onClose }) => {
  const { heldOrders, resumeHeldBill, deleteHeldBill } = useCart();

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Held & Parked Bills" subtitle="Temporarily parked transactions ready to resume checkout" maxWidth="md">
      {heldOrders.length === 0 ? (
        <div className="py-12 text-center space-y-2">
          <Clock className="w-10 h-10 text-slate-400 mx-auto stroke-1" />
          <p className="text-sm font-bold text-slate-700 dark:text-slate-300">No Bills on Hold</p>
          <p className="text-xs text-slate-400 max-w-xs mx-auto">
            When a customer steps aside to pay or pick items, click 'Hold Bill' in the cart to park their order.
          </p>
        </div>
      ) : (
        <div className="space-y-3 max-h-96 overflow-y-auto custom-scrollbar">
          {heldOrders.map((held, idx) => {
            const itemCount = held.items.reduce((sum, i) => sum + i.quantity, 0);
            const total = held.items.reduce((sum, i) => sum + i.product.selling_price * i.quantity, 0);

            return (
              <div
                key={held.id || idx}
                className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 hover:border-amber-500/50 transition-all flex items-center justify-between gap-4"
              >
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs text-slate-900 dark:text-white truncate">
                      {held.customer_name || 'Walk-in Customer'}
                    </span>
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                      {itemCount} items
                    </span>
                  </div>

                  <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                    Total: <span className="text-slate-900 dark:text-white font-bold">{formatCurrency(total)}</span>
                  </p>

                  <p className="text-[10px] text-slate-400 flex items-center gap-1">
                    <Clock className="w-3 h-3" /> {formatDateTime(held.created_at)}
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => {
                      resumeHeldBill(held);
                      onClose();
                    }}
                    className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold flex items-center gap-1.5 shadow-sm transition-colors"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" /> Resume
                  </button>

                  <button
                    onClick={() => deleteHeldBill(held.id)}
                    title="Discard Held Bill"
                    className="p-1.5 rounded-xl text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </Modal>
  );
};
