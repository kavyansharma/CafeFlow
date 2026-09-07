import { Request, Response } from 'express';
import { db } from '../database/db';

export const getInvoices = (req: Request, res: Response) => {
  const { search, payment_method, date_from, date_to } = req.query;
  let invoices = [...db.invoices];

  if (search) {
    const s = String(search).toLowerCase();
    invoices = invoices.filter(
      i =>
        i.invoice_number.toLowerCase().includes(s) ||
        i.customer_name.toLowerCase().includes(s) ||
        i.customer_phone?.includes(s)
    );
  }

  if (payment_method && payment_method !== 'all') {
    invoices = invoices.filter(i => i.payment_method.toLowerCase() === String(payment_method).toLowerCase());
  }

  if (date_from) {
    invoices = invoices.filter(i => new Date(i.invoice_date) >= new Date(String(date_from)));
  }

  if (date_to) {
    invoices = invoices.filter(i => new Date(i.invoice_date) <= new Date(String(date_to)));
  }

  return res.json({
    success: true,
    count: invoices.length,
    data: invoices,
    settings: {
      cafe_name: db.settings.cafe_name,
      tagline: db.settings.tagline,
      address: db.settings.address,
      phone: db.settings.phone,
      gstin: db.settings.gstin,
      currency: db.settings.currency,
    },
  });
};

export const getInvoiceById = (req: Request, res: Response) => {
  const { id } = req.params;
  const invoice = db.invoices.find(i => i.id === id || i.invoice_number === id);

  if (!invoice) {
    return res.status(404).json({ success: false, message: 'Invoice not found' });
  }

  return res.json({
    success: true,
    data: invoice,
    cafe_settings: db.settings,
  });
};
