import React, { useState, useEffect } from 'react';
import { useShift } from '../context/ShiftContext';
import { api } from '../services/api';
import { Shift } from '../types';
import { Modal } from '../components/common/Modal';
import { Badge } from '../components/common/Badge';
import { useNotifications } from '../context/NotificationContext';
import { formatCurrency, formatDateTime } from '../utils/formatters';
import {
  Clock,
  Banknote,
  QrCode,
  CreditCard,
  DollarSign,
  CheckCircle2,
  AlertTriangle,
  PlayCircle,
  StopCircle,
  History,
  Calculator,
} from 'lucide-react';

export const Shifts: React.FC = () => {
  const { currentShift, hasActiveShift, openShift, closeShift } = useShift();
  const [shiftHistory, setShiftHistory] = useState<Shift[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState<boolean>(true);

  // Open Shift Modal
  const [isOpenModalOpen, setIsOpenModalOpen] = useState<boolean>(false);
  const [openingFloat, setOpeningFloat] = useState<number | ''>(5000);
  const [openNotes, setOpenNotes] = useState<string>('');

  // Close Shift Modal
  const [isCloseModalOpen, setIsCloseModalOpen] = useState<boolean>(false);
  const [countedCash, setCountedCash] = useState<number | ''>('');
  const [closeNotes, setCloseNotes] = useState<string>('');

  const { showToast } = useNotifications();

  const fetchHistory = async () => {
    setIsLoadingHistory(true);
    try {
      const res = await api.getShiftHistory();
      if (res.success) setShiftHistory(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [hasActiveShift]);

  const handleOpenShift = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await openShift(Number(openingFloat || 0), openNotes);
      showToast('success', 'Shift Started', `Registered opening cash float: ${formatCurrency(Number(openingFloat || 0))}`);
      setIsOpenModalOpen(false);
      fetchHistory();
    } catch (err: any) {
      showToast('error', 'Failed', err.message);
    }
  };

  const handleCloseShift = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const shift = await closeShift(Number(countedCash || currentShift?.expected_cash || 0), closeNotes);
      const diff = shift.cash_difference || 0;
      const statusText = diff === 0 ? 'Balanced' : diff > 0 ? `+${formatCurrency(diff)} Over` : `-${formatCurrency(Math.abs(diff))} Short`;

      showToast(
        diff === 0 ? 'success' : 'warning',
        'Shift Closed & Reconciled',
        `Cash drawer variance: ${statusText}`
      );

      setIsCloseModalOpen(false);
      fetchHistory();
    } catch (err: any) {
      showToast('error', 'Failed', err.message);
    }
  };

  const cashDiscrepancy =
    countedCash !== '' && currentShift
      ? Number((Number(countedCash) - currentShift.expected_cash).toFixed(2))
      : 0;

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Register & Shift Management
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Control opening cash float, live multi-mode sales tracking, and end-of-shift cash drawer reconciliation.
          </p>
        </div>

        <div>
          {!hasActiveShift ? (
            <button
              onClick={() => {
                setOpeningFloat(5000);
                setOpenNotes('');
                setIsOpenModalOpen(true);
              }}
              className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black flex items-center gap-1.5 shadow-md shadow-amber-500/20 transition-all cursor-pointer"
            >
              <PlayCircle className="w-4 h-4" /> Start New Shift (Open Register)
            </button>
          ) : (
            <button
              onClick={() => {
                setCountedCash(currentShift?.expected_cash || 0);
                setCloseNotes('');
                setIsCloseModalOpen(true);
              }}
              className="px-4 py-2 rounded-xl bg-rose-500 hover:bg-rose-400 text-white text-xs font-black flex items-center gap-1.5 shadow-md shadow-rose-500/20 transition-all cursor-pointer"
            >
              <StopCircle className="w-4 h-4" /> Close Shift & Reconcile
            </button>
          )}
        </div>
      </div>

      {/* Active Shift Card */}
      {hasActiveShift && currentShift ? (
        <div className="bg-gradient-to-tr from-[#181b24] to-[#1f2430] border border-amber-500/30 rounded-3xl p-6 shadow-xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-800">
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
                <h3 className="text-base font-black text-white">Active Shift Session</h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  OPEN
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Cashier: <span className="font-bold text-white">{currentShift.user_name}</span> • Started at {formatDateTime(currentShift.start_time)}
              </p>
            </div>

            <div className="text-right">
              <p className="text-[10px] font-bold text-slate-400 uppercase">Total Shift Revenue</p>
              <p className="text-2xl font-black text-amber-500">{formatCurrency(currentShift.total_sales)}</p>
              <p className="text-[11px] text-slate-400">{currentShift.total_orders} Completed Bills</p>
            </div>
          </div>

          {/* Breakdown Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-1">
              <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-400">
                <DollarSign className="w-3.5 h-3.5 text-slate-400" /> Opening Float
              </div>
              <p className="text-lg font-black text-white">{formatCurrency(currentShift.opening_cash)}</p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-1">
              <div className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-400">
                <Banknote className="w-3.5 h-3.5 text-emerald-400" /> Cash Sales
              </div>
              <p className="text-lg font-black text-white">{formatCurrency(currentShift.cash_sales)}</p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-1">
              <div className="flex items-center gap-1.5 text-[11px] font-bold text-sky-400">
                <QrCode className="w-3.5 h-3.5 text-sky-400" /> UPI / QR Sales
              </div>
              <p className="text-lg font-black text-white">{formatCurrency(currentShift.upi_sales)}</p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-1">
              <div className="flex items-center gap-1.5 text-[11px] font-bold text-amber-400">
                <CreditCard className="w-3.5 h-3.5 text-amber-400" /> Card Sales
              </div>
              <p className="text-lg font-black text-white">{formatCurrency(currentShift.card_sales)}</p>
            </div>
          </div>

          {/* Expected Cash Drawer Callout */}
          <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-amber-500 text-slate-950 font-black">
                <Calculator className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-white">Expected Physical Cash in Drawer</p>
                <p className="text-[11px] text-slate-400">
                  Opening Float ({formatCurrency(currentShift.opening_cash)}) + Cash Sales ({formatCurrency(currentShift.cash_sales)})
                </p>
              </div>
            </div>

            <p className="text-xl font-black text-amber-500">{formatCurrency(currentShift.expected_cash)}</p>
          </div>
        </div>
      ) : (
        <div className="p-8 rounded-3xl bg-white dark:bg-[#181b24] border border-dashed border-slate-300 dark:border-slate-800 text-center space-y-3">
          <Clock className="w-10 h-10 text-slate-400 mx-auto stroke-1" />
          <h3 className="text-base font-bold text-slate-900 dark:text-white">No Register Shift Currently Open</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Start a shift by inputting the opening drawer float. All POS sales will be tied to this shift session.
          </p>
          <button
            onClick={() => {
              setOpeningFloat(5000);
              setOpenNotes('');
              setIsOpenModalOpen(true);
            }}
            className="px-4 py-2 rounded-xl bg-amber-500 text-slate-950 text-xs font-black"
          >
            Start Register Shift
          </button>
        </div>
      )}

      {/* Shift History Table */}
      <div className="bg-white dark:bg-[#181b24] border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm overflow-hidden space-y-3 p-5">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
            <History className="w-4 h-4 text-amber-500" /> Shift History & Discrepancy Log
          </h3>
          <span className="text-xs text-slate-400">{shiftHistory.length} Recorded Shifts</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 text-slate-400 uppercase font-bold text-[10px]">
                <th className="py-3 px-3">Start / End Time</th>
                <th className="py-3 px-3">Cashier</th>
                <th className="py-3 px-3 text-right">Opening Float</th>
                <th className="py-3 px-3 text-right">Cash Sales</th>
                <th className="py-3 px-3 text-right">UPI Sales</th>
                <th className="py-3 px-3 text-right">Card Sales</th>
                <th className="py-3 px-3 text-right">Total Revenue</th>
                <th className="py-3 px-3 text-right">Expected Cash</th>
                <th className="py-3 px-3 text-right">Actual Counted</th>
                <th className="py-3 px-3 text-center">Variance</th>
                <th className="py-3 px-3 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
              {shiftHistory.map(s => {
                const diff = s.cash_difference || 0;
                return (
                  <tr key={s.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-3">
                      <p className="font-bold text-slate-900 dark:text-white">{formatDateTime(s.start_time)}</p>
                      <p className="text-[10px] text-slate-400">{s.end_time ? formatDateTime(s.end_time) : 'Active now'}</p>
                    </td>
                    <td className="py-3 px-3 font-semibold text-slate-700 dark:text-slate-300">{s.user_name}</td>
                    <td className="py-3 px-3 text-right text-slate-500">{formatCurrency(s.opening_cash)}</td>
                    <td className="py-3 px-3 text-right font-bold text-slate-900 dark:text-white">{formatCurrency(s.cash_sales)}</td>
                    <td className="py-3 px-3 text-right text-slate-500">{formatCurrency(s.upi_sales)}</td>
                    <td className="py-3 px-3 text-right text-slate-500">{formatCurrency(s.card_sales)}</td>
                    <td className="py-3 px-3 text-right font-black text-amber-500">{formatCurrency(s.total_sales)}</td>
                    <td className="py-3 px-3 text-right font-bold text-slate-900 dark:text-white">{formatCurrency(s.expected_cash)}</td>
                    <td className="py-3 px-3 text-right font-bold text-slate-900 dark:text-white">
                      {s.actual_cash !== undefined ? formatCurrency(s.actual_cash) : '—'}
                    </td>
                    <td className="py-3 px-3 text-center">
                      {s.status === 'CLOSED' ? (
                        diff === 0 ? (
                          <span className="font-bold text-emerald-500 text-[10px] bg-emerald-500/10 px-2 py-0.5 rounded-full">
                            Balanced
                          </span>
                        ) : diff > 0 ? (
                          <span className="font-bold text-sky-400 text-[10px] bg-sky-500/10 px-2 py-0.5 rounded-full">
                            +{formatCurrency(diff)} (Over)
                          </span>
                        ) : (
                          <span className="font-bold text-rose-500 text-[10px] bg-rose-500/10 px-2 py-0.5 rounded-full">
                            -{formatCurrency(Math.abs(diff))} (Short)
                          </span>
                        )
                      ) : (
                        <span className="text-slate-400 text-[10px]">In Progress</span>
                      )}
                    </td>
                    <td className="py-3 px-3 text-center">
                      <Badge variant={s.status === 'OPEN' ? 'warning' : 'neutral'}>
                        {s.status}
                      </Badge>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Start Shift Modal */}
      <Modal
        isOpen={isOpenModalOpen}
        onClose={() => setIsOpenModalOpen(false)}
        title="Start Register Shift"
        subtitle="Register starting drawer float for cash change"
        maxWidth="sm"
      >
        <form onSubmit={handleOpenShift} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Opening Cash Float (₹) *</label>
            <input
              type="number"
              min={0}
              required
              value={openingFloat}
              onChange={e => setOpeningFloat(Number(e.target.value))}
              placeholder="e.g. 5000"
              className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 font-bold text-sm"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Shift Notes (Optional)</label>
            <textarea
              rows={2}
              value={openNotes}
              onChange={e => setOpenNotes(e.target.value)}
              placeholder="e.g. Morning counter shift #1..."
              className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsOpenModalOpen(false)}
              className="flex-1 py-2 rounded-xl border border-slate-200 dark:border-slate-800 font-bold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-2 rounded-xl bg-amber-500 text-slate-950 font-black hover:bg-amber-400 transition-colors"
            >
              Start Shift
            </button>
          </div>
        </form>
      </Modal>

      {/* Close Shift Modal */}
      <Modal
        isOpen={isCloseModalOpen}
        onClose={() => setIsCloseModalOpen(false)}
        title="End Shift & Cash Drawer Reconciliation"
        subtitle="Count physical cash in the drawer and reconcile with POS logs"
        maxWidth="md"
      >
        <form onSubmit={handleCloseShift} className="space-y-4 text-xs">
          {/* Comparison summary */}
          <div className="grid grid-cols-2 gap-3 p-4 bg-slate-50 dark:bg-slate-900/60 rounded-2xl border border-slate-200 dark:border-slate-800">
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase">Expected Cash Drawer</p>
              <p className="text-xl font-black text-white">{formatCurrency(currentShift?.expected_cash)}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase">Variance (Discrepancy)</p>
              <p
                className={`text-xl font-black ${
                  cashDiscrepancy === 0
                    ? 'text-emerald-500'
                    : cashDiscrepancy > 0
                    ? 'text-sky-400'
                    : 'text-rose-500'
                }`}
              >
                {cashDiscrepancy === 0
                  ? 'Balanced (₹0)'
                  : cashDiscrepancy > 0
                  ? `+${formatCurrency(cashDiscrepancy)} Over`
                  : `-${formatCurrency(Math.abs(cashDiscrepancy))} Short`}
              </p>
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
              Actual Physical Cash Counted in Drawer (₹) *
            </label>
            <input
              type="number"
              min={0}
              required
              value={countedCash}
              onChange={e => setCountedCash(Number(e.target.value))}
              placeholder="e.g. 12400"
              className="w-full px-3 py-2.5 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 font-black text-base"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Closing Notes / Discrepancy Reason</label>
            <textarea
              rows={2}
              value={closeNotes}
              onChange={e => setCloseNotes(e.target.value)}
              placeholder="e.g. Exact match, or minor ₹20 shortage due to customer coin change..."
              className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsCloseModalOpen(false)}
              className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 font-bold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 rounded-xl bg-rose-500 text-white font-black hover:bg-rose-400 transition-colors"
            >
              Close & Lock Shift
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
