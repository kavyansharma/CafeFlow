import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Invoice } from '../types';
import { InvoiceModal } from '../components/invoices/InvoiceModal';
import { Badge } from '../components/common/Badge';
import { formatCurrency, formatDateTime } from '../utils/formatters';
import {
  Receipt,
  Search,
  Printer,
  Download,
  Filter,
  CreditCard,
  QrCode,
  Banknote,
  FileText,
  Eye,
} from 'lucide-react';

export const Invoices: React.FC = () => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [paymentFilter, setPaymentFilter] = useState('all');
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchInvoices = async () => {
    setIsLoading(true);
    try {
      const res = await api.getInvoices({
        search: searchQuery || undefined,
        payment_method: paymentFilter !== 'all' ? paymentFilter : undefined,
      });
      if (res.success) setInvoices(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, [paymentFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchInvoices();
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Tax Invoices & Receipts Archive
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Search, view, reprint 80mm thermal receipts, or download official GST tax invoices as PDF.
          </p>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white dark:bg-[#181b24] p-3 rounded-2xl border border-slate-200 dark:border-slate-800">
        <form onSubmit={handleSearchSubmit} className="relative flex-1 w-full sm:w-auto">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by invoice number (e.g. CF-2026-1042) or customer name..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
        </form>

        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto">
          {['all', 'CASH', 'UPI', 'CARD'].map(mode => (
            <button
              key={mode}
              onClick={() => setPaymentFilter(mode)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                paymentFilter === mode
                  ? 'bg-amber-500 text-slate-950 shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800'
              }`}
            >
              {mode === 'all' ? 'All Payment Modes' : mode}
            </button>
          ))}
        </div>
      </div>

      {/* Invoices Table */}
      <div className="bg-white dark:bg-[#181b24] border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 text-slate-400 uppercase font-bold text-[10px]">
                <th className="py-3.5 px-4">Invoice #</th>
                <th className="py-3.5 px-4">Date & Time</th>
                <th className="py-3.5 px-4">Billed To</th>
                <th className="py-3.5 px-4">Billed Items</th>
                <th className="py-3.5 px-4 text-right">Subtotal</th>
                <th className="py-3.5 px-4 text-right">Discount</th>
                <th className="py-3.5 px-4 text-right">GST</th>
                <th className="py-3.5 px-4 text-right">Grand Total</th>
                <th className="py-3.5 px-4 text-center">Payment Mode</th>
                <th className="py-3.5 px-4 text-center">Status</th>
                <th className="py-3.5 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
              {isLoading ? (
                <tr>
                  <td colSpan={11} className="py-12 text-center text-slate-400">Loading invoices...</td>
                </tr>
              ) : invoices.length === 0 ? (
                <tr>
                  <td colSpan={11} className="py-12 text-center text-slate-400">No invoices match your search.</td>
                </tr>
              ) : (
                invoices.map(inv => (
                  <tr key={inv.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-amber-500">{inv.invoice_number}</td>
                    <td className="py-3.5 px-4 text-slate-500">{formatDateTime(inv.invoice_date)}</td>
                    <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">{inv.customer_name}</td>
                    <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300 max-w-[200px] truncate">
                      {inv.items.map(i => `${i.quantity}x ${i.product_name}`).join(', ')}
                    </td>
                    <td className="py-3.5 px-4 text-right text-slate-500">{formatCurrency(inv.subtotal)}</td>
                    <td className="py-3.5 px-4 text-right text-emerald-500">
                      {inv.discount > 0 ? `-${formatCurrency(inv.discount)}` : '—'}
                    </td>
                    <td className="py-3.5 px-4 text-right text-slate-500">{formatCurrency(inv.tax_amount)}</td>
                    <td className="py-3.5 px-4 text-right font-black text-slate-900 dark:text-white text-sm">
                      {formatCurrency(inv.grand_total)}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span className="inline-flex items-center gap-1 font-bold text-slate-700 dark:text-slate-300">
                        {inv.payment_method === 'UPI' && <QrCode className="w-3.5 h-3.5 text-sky-400" />}
                        {inv.payment_method === 'CASH' && <Banknote className="w-3.5 h-3.5 text-emerald-400" />}
                        {inv.payment_method === 'CARD' && <CreditCard className="w-3.5 h-3.5 text-amber-400" />}
                        {inv.payment_method}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <Badge variant="success">PAID</Badge>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => setSelectedInvoice(inv)}
                        className="px-3 py-1 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 hover:bg-amber-500/20 font-bold text-[11px] border border-amber-500/20 flex items-center gap-1 ml-auto transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" /> View / Print
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Invoice Modal */}
      <InvoiceModal
        isOpen={Boolean(selectedInvoice)}
        onClose={() => setSelectedInvoice(null)}
        invoice={selectedInvoice}
      />
    </div>
  );
};
