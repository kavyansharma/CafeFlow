import { Request, Response } from 'express';
import { db } from '../database/db';
import { AuthRequest } from '../middleware/auth';
import { CAFE_SUNRISE_ID } from '../database/seedData';

export const getInvoices = (req: Request, res: Response) => {
  const authReq = req as AuthRequest;
  const cafeId = authReq.user?.cafe_id || CAFE_SUNRISE_ID;
  const { search, payment_method, date_from, date_to } = req.query;
  let invoices = db.invoices.filter(i => i.cafe_id === cafeId);

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

  const cafeSettings = db.getCafeSettings(cafeId);

  return res.json({
    success: true,
    count: invoices.length,
    data: invoices,
    settings: {
      cafe_name: cafeSettings.cafe_name,
      tagline: cafeSettings.tagline,
      address: cafeSettings.address,
      phone: cafeSettings.phone,
      gstin: cafeSettings.gstin,
      currency: cafeSettings.currency,
    },
  });
};

export const getInvoiceById = (req: Request, res: Response) => {
  const authReq = req as AuthRequest;
  const cafeId = authReq.user?.cafe_id || CAFE_SUNRISE_ID;
  const { id } = req.params;
  const invoice = db.invoices.find(i => i.cafe_id === cafeId && (i.id === id || i.invoice_number === id));

  if (!invoice) {
    return res.status(404).json({ success: false, message: 'Invoice not found in this cafe' });
  }

  const cafeSettings = db.getCafeSettings(cafeId);

  return res.json({
    success: true,
    data: invoice,
    cafe_settings: cafeSettings,
  });
};
