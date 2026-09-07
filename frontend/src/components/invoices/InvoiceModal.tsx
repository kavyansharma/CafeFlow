import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { Invoice } from '../../types';
import { formatCurrency, formatDateTime, printElement } from '../../utils/formatters';
import { Printer, Download, Receipt, FileText, CheckCircle2, Coffee } from 'lucide-react';
import jsPDF from 'jspdf';

interface InvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoice: Invoice | null;
}

export const InvoiceModal: React.FC<InvoiceModalProps> = ({ isOpen, onClose, invoice }) => {
  const [viewMode, setViewMode] = useState<'thermal' | 'a4'>('thermal');

  if (!invoice) return null;

  const handlePrint = () => {
    printElement('printable-invoice-content');
  };

  const handleDownloadPDF = () => {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: [80, 200],
    });

    doc.setFont('courier', 'bold');
    doc.setFontSize(14);
    doc.text('CAFEFLOW', 40, 10, { align: 'center' });
    doc.setFontSize(9);
    doc.setFont('courier', 'normal');
    doc.text('Smart Billing. Smarter Cafe.', 40, 15, { align: 'center' });
    doc.text('Indiranagar, Bengaluru | GST: 29ABCDE1234F1Z5', 40, 20, { align: 'center' });
    doc.text('------------------------------------------', 40, 24, { align: 'center' });

    doc.text(`Invoice: ${invoice.invoice_number}`, 5, 29);
    doc.text(`Date: ${formatDateTime(invoice.invoice_date)}`, 5, 34);
    doc.text(`Customer: ${invoice.customer_name}`, 5, 39);
    doc.text(`Cashier: ${invoice.cashier_name}`, 5, 44);
    doc.text('------------------------------------------', 40, 48, { align: 'center' });

    let y = 54;
    invoice.items.forEach(item => {
      doc.text(`${item.quantity}x ${item.product_name.substring(0, 18)}`, 5, y);
      doc.text(formatCurrency(item.total), 75, y, { align: 'right' });
      y += 5;
    });

    doc.text('------------------------------------------', 40, y, { align: 'center' });
    y += 5;
    doc.text(`Subtotal:`, 5, y);
    doc.text(formatCurrency(invoice.subtotal), 75, y, { align: 'right' });
    y += 5;
    if (invoice.discount > 0) {
      doc.text(`Discount:`, 5, y);
      doc.text(`-${formatCurrency(invoice.discount)}`, 75, y, { align: 'right' });
      y += 5;
    }
    doc.text(`Tax / GST:`, 5, y);
    doc.text(formatCurrency(invoice.tax_amount), 75, y, { align: 'right' });
    y += 6;
    doc.setFont('courier', 'bold');
    doc.setFontSize(11);
    doc.text(`GRAND TOTAL:`, 5, y);
    doc.text(formatCurrency(invoice.grand_total), 75, y, { align: 'right' });

    y += 8;
    doc.setFontSize(8);
    doc.setFont('courier', 'normal');
    doc.text(`Paid via: ${invoice.payment_method}`, 5, y);
    y += 7;
    doc.text('Thank you for visiting CAFEflow!', 40, y, { align: 'center' });

    doc.save(`${invoice.invoice_number}.pdf`);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Tax Invoice & Receipt" subtitle={invoice.invoice_number} maxWidth="lg">
      <div className="space-y-4">
        {/* Controls Bar */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-900 p-1 rounded-xl">
            <button
              onClick={() => setViewMode('thermal')}
              className={`flex items-center gap-1.5 px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                viewMode === 'thermal'
                  ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <Receipt className="w-3.5 h-3.5" /> 80mm Thermal Receipt
            </button>
            <button
              onClick={() => setViewMode('a4')}
              className={`flex items-center gap-1.5 px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                viewMode === 'a4'
                  ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <FileText className="w-3.5 h-3.5" /> Standard Tax Invoice
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-sm transition-colors"
            >
              <Printer className="w-3.5 h-3.5" /> Print
            </button>
            <button
              onClick={handleDownloadPDF}
              className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <Download className="w-3.5 h-3.5" /> PDF
            </button>
          </div>
        </div>

        {/* Invoice Printable View */}
        <div className="bg-slate-50 dark:bg-slate-900/60 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 flex justify-center overflow-x-auto">
          {viewMode === 'thermal' ? (
            <div
              id="printable-invoice-content"
              className="w-72 bg-white text-slate-950 font-mono text-xs p-5 rounded-xl shadow-lg border border-slate-200 space-y-3"
            >
              {/* Thermal Header */}
              <div className="text-center space-y-0.5 border-b border-dashed border-slate-300 pb-3">
                <div className="flex items-center justify-center gap-1.5">
                  <Coffee className="w-4 h-4 text-amber-600" />
                  <span className="font-extrabold text-sm tracking-widest uppercase">CAFEFLOW</span>
                </div>
                <p className="text-[10px] text-slate-600">Smart Billing. Smarter Cafe.</p>
                <p className="text-[9px] text-slate-500 leading-tight">
                  Shop 4-5, Indiranagar 100ft Road, Bengaluru
                </p>
                <p className="text-[9px] text-slate-500">GSTIN: 29ABCDE1234F1Z5</p>
              </div>

              {/* Meta */}
              <div className="text-[11px] space-y-0.5 border-b border-dashed border-slate-300 pb-2">
                <div className="flex justify-between">
                  <span className="text-slate-500">Invoice:</span>
                  <span className="font-bold">{invoice.invoice_number}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Date/Time:</span>
                  <span>{formatDateTime(invoice.invoice_date)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Customer:</span>
                  <span className="font-semibold">{invoice.customer_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Cashier:</span>
                  <span>{invoice.cashier_name}</span>
                </div>
              </div>

              {/* Items */}
              <div className="space-y-1.5 border-b border-dashed border-slate-300 pb-2">
                <div className="flex justify-between font-bold text-[10px] text-slate-400 uppercase">
                  <span>Item & Qty</span>
                  <span>Amount</span>
                </div>
                {invoice.items.map((item, i) => (
                  <div key={i} className="flex justify-between text-xs">
                    <div className="truncate max-w-[160px]">
                      <span>{item.quantity}x </span>
                      <span>{item.product_name}</span>
                    </div>
                    <span className="font-semibold shrink-0">{formatCurrency(item.total)}</span>
                  </div>
                ))}
              </div>

              {/* Totals */}
              <div className="space-y-1 text-xs border-b border-dashed border-slate-300 pb-2">
                <div className="flex justify-between text-slate-600">
                  <span>Subtotal:</span>
                  <span>{formatCurrency(invoice.subtotal)}</span>
                </div>
                {invoice.discount > 0 && (
                  <div className="flex justify-between text-emerald-600 font-semibold">
                    <span>Discount:</span>
                    <span>-{formatCurrency(invoice.discount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-slate-600">
                  <span>GST / Tax (5%):</span>
                  <span>{formatCurrency(invoice.tax_amount)}</span>
                </div>
                <div className="flex justify-between text-sm font-black pt-1 border-t border-slate-200">
                  <span>TOTAL:</span>
                  <span>{formatCurrency(invoice.grand_total)}</span>
                </div>
              </div>

              {/* Payment Details */}
              <div className="text-[10px] space-y-0.5 text-slate-600">
                <div className="flex justify-between">
                  <span>Payment Mode:</span>
                  <span className="font-bold text-slate-900">{invoice.payment_method}</span>
                </div>
                {invoice.payment_method === 'CASH' && (
                  <>
                    <div className="flex justify-between">
                      <span>Tendered:</span>
                      <span>{formatCurrency(invoice.amount_received)}</span>
                    </div>
                    <div className="flex justify-between font-bold">
                      <span>Change:</span>
                      <span>{formatCurrency(invoice.change_returned)}</span>
                    </div>
                  </>
                )}
              </div>

              {/* Footer */}
              <div className="text-center pt-2 text-[10px] text-slate-500">
                <p className="font-bold text-slate-700">Thank you for visiting CAFEflow!</p>
                <p>Have a wonderful brewed day ahead ☕</p>
              </div>
            </div>
          ) : (
            <div
              id="printable-invoice-content"
              className="w-full max-w-xl bg-white text-slate-900 p-8 rounded-xl shadow-lg border border-slate-200 font-sans space-y-6"
            >
              {/* Standard A4 Header */}
              <div className="flex justify-between items-start border-b pb-4">
                <div>
                  <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                    <Coffee className="w-6 h-6 text-amber-600" /> CAFEFLOW
                  </h2>
                  <p className="text-xs text-slate-500">Smart Billing. Smarter Cafe.</p>
                  <p className="text-xs text-slate-600 mt-1 max-w-xs">
                    Shop 4-5, Ground Floor, Indiranagar 100ft Road, Bengaluru, 560038
                  </p>
                  <p className="text-xs font-semibold text-slate-700">GSTIN: 29ABCDE1234F1Z5</p>
                </div>
                <div className="text-right">
                  <span className="inline-block px-2.5 py-1 rounded bg-emerald-100 text-emerald-800 text-xs font-bold uppercase tracking-wider mb-2">
                    TAX INVOICE
                  </span>
                  <p className="text-sm font-bold text-slate-900">{invoice.invoice_number}</p>
                  <p className="text-xs text-slate-500">{formatDateTime(invoice.invoice_date)}</p>
                </div>
              </div>

              {/* Customer Info */}
              <div className="grid grid-cols-2 gap-4 text-xs bg-slate-50 p-4 rounded-xl">
                <div>
                  <p className="text-slate-400 uppercase font-bold text-[10px]">Billed To</p>
                  <p className="text-sm font-bold text-slate-900">{invoice.customer_name}</p>
                  {invoice.customer_phone && <p className="text-slate-600">{invoice.customer_phone}</p>}
                </div>
                <div className="text-right">
                  <p className="text-slate-400 uppercase font-bold text-[10px]">Cashier / Counter</p>
                  <p className="text-sm font-bold text-slate-900">{invoice.cashier_name}</p>
                  <p className="text-slate-600">Payment: {invoice.payment_method}</p>
                </div>
              </div>

              {/* Items Table */}
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b text-left text-slate-400 font-bold uppercase text-[10px]">
                    <th className="py-2">Item Description</th>
                    <th className="py-2 text-center">Qty</th>
                    <th className="py-2 text-right">Price</th>
                    <th className="py-2 text-right">GST</th>
                    <th className="py-2 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {invoice.items.map((item, i) => (
                    <tr key={i} className="py-2">
                      <td className="py-2.5 font-medium">{item.product_name}</td>
                      <td className="py-2.5 text-center">{item.quantity}</td>
                      <td className="py-2.5 text-right">{formatCurrency(item.unit_price)}</td>
                      <td className="py-2.5 text-right">{formatCurrency(item.gst_amount)}</td>
                      <td className="py-2.5 text-right font-bold">{formatCurrency(item.total)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Summary */}
              <div className="flex justify-end pt-4 border-t">
                <div className="w-64 space-y-1.5 text-xs">
                  <div className="flex justify-between text-slate-600">
                    <span>Subtotal:</span>
                    <span>{formatCurrency(invoice.subtotal)}</span>
                  </div>
                  {invoice.discount > 0 && (
                    <div className="flex justify-between text-emerald-600 font-bold">
                      <span>Discount:</span>
                      <span>-{formatCurrency(invoice.discount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-slate-600">
                    <span>GST (CGST 2.5% + SGST 2.5%):</span>
                    <span>{formatCurrency(invoice.tax_amount)}</span>
                  </div>
                  <div className="flex justify-between text-base font-black border-t pt-2 text-slate-950">
                    <span>Grand Total:</span>
                    <span>{formatCurrency(invoice.grand_total)}</span>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="text-center pt-4 border-t text-xs text-slate-400">
                <p className="font-semibold text-slate-700">Thank you for visiting CAFEflow!</p>
                <p className="text-[11px]">This is a computer-generated invoice and requires no physical signature.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
};
