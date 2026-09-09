import { Request, Response } from 'express';
import { db } from '../database/db';
import { AuthRequest } from '../middleware/auth';

export const getSalesSummary = (req: Request, res: Response) => {
  const authReq = req as AuthRequest;
  const cafeId = authReq.user?.cafe_id;
  if (!cafeId) {
    return res.status(401).json({ success: false, message: 'Authentication required' });
  }

  const { range = '7d', date_from, date_to } = req.query;

  const now = new Date();
  let startDate = new Date();

  if (range === 'today') {
    startDate.setHours(0, 0, 0, 0);
  } else if (range === 'yesterday') {
    startDate.setDate(now.getDate() - 1);
    startDate.setHours(0, 0, 0, 0);
  } else if (range === '7d') {
    startDate.setDate(now.getDate() - 7);
  } else if (range === '30d') {
    startDate.setDate(now.getDate() - 30);
  } else if (range === 'custom' && date_from) {
    startDate = new Date(String(date_from));
  }

  let filteredOrders = db.orders.filter(o => o.cafe_id === cafeId && o.status === 'COMPLETED' && new Date(o.created_at) >= startDate);

  if (range === 'yesterday') {
    const endYesterday = new Date(startDate);
    endYesterday.setHours(23, 59, 59, 999);
    filteredOrders = filteredOrders.filter(o => new Date(o.created_at) <= endYesterday);
  } else if (range === 'custom' && date_to) {
    const endDate = new Date(String(date_to));
    filteredOrders = filteredOrders.filter(o => new Date(o.created_at) <= endDate);
  }

  const grossSales = filteredOrders.reduce((acc, o) => acc + o.subtotal, 0);
  const totalTax = filteredOrders.reduce((acc, o) => acc + o.gst_amount, 0);
  const totalDiscounts = filteredOrders.reduce((acc, o) => acc + o.discount_amount + o.loyalty_discount, 0);
  const netSales = filteredOrders.reduce((acc, o) => acc + o.total_amount, 0);
  const totalOrders = filteredOrders.length;
  const aov = totalOrders > 0 ? Number((netSales / totalOrders).toFixed(2)) : 0;

  // Revenue trend by date
  const trendMap: Record<string, { date: string; revenue: number; orders: number; taxes: number }> = {};
  filteredOrders.forEach(o => {
    const dateKey = o.created_at.split('T')[0];
    if (!trendMap[dateKey]) {
      trendMap[dateKey] = { date: dateKey, revenue: 0, orders: 0, taxes: 0 };
    }
    trendMap[dateKey].revenue += o.total_amount;
    trendMap[dateKey].orders += 1;
    trendMap[dateKey].taxes += o.gst_amount;
  });

  const trendData = Object.values(trendMap).sort((a, b) => a.date.localeCompare(b.date));

  // Payment method breakdown
  const paymentBreakdown: Record<string, { count: number; total: number }> = {
    CASH: { count: 0, total: 0 },
    UPI: { count: 0, total: 0 },
    CARD: { count: 0, total: 0 },
  };

  filteredOrders.forEach(o => {
    const pm = o.payment_method || 'CASH';
    if (!paymentBreakdown[pm]) paymentBreakdown[pm] = { count: 0, total: 0 };
    paymentBreakdown[pm].count += 1;
    paymentBreakdown[pm].total += o.total_amount;
  });

  // Category performance
  const categoryBreakdown: Record<string, { name: string; revenue: number; quantity: number }> = {};
  filteredOrders.forEach(o => {
    o.items.forEach(item => {
      const cat = item.category_name || 'General';
      if (!categoryBreakdown[cat]) {
        categoryBreakdown[cat] = { name: cat, revenue: 0, quantity: 0 };
      }
      categoryBreakdown[cat].revenue += item.total;
      categoryBreakdown[cat].quantity += item.quantity;
    });
  });

  return res.json({
    success: true,
    range,
    summary: {
      gross_sales: Number(grossSales.toFixed(2)),
      total_tax: Number(totalTax.toFixed(2)),
      total_discounts: Number(totalDiscounts.toFixed(2)),
      net_sales: Number(netSales.toFixed(2)),
      total_orders: totalOrders,
      average_order_value: aov,
    },
    trends: trendData,
    payment_methods: Object.entries(paymentBreakdown).map(([method, data]) => ({
      method,
      orders: data.count,
      amount: Number(data.total.toFixed(2)),
    })),
    category_performance: Object.values(categoryBreakdown).sort((a, b) => b.revenue - a.revenue),
  });
};

export const exportSalesCSV = (req: Request, res: Response) => {
  const authReq = req as AuthRequest;
  const cafeId = authReq.user?.cafe_id;
  if (!cafeId) {
    return res.status(401).json({ success: false, message: 'Authentication required' });
  }

  const orders = db.orders.filter(o => o.cafe_id === cafeId && o.status === 'COMPLETED');
  
  const headers = ['Invoice Number', 'Date', 'Customer Name', 'Phone', 'Cashier', 'Subtotal', 'Tax', 'Discount', 'Total Amount', 'Payment Method'];
  const rows = orders.map(o => [
    o.invoice_number,
    o.created_at,
    `"${o.customer_name}"`,
    o.customer_phone || '',
    `"${o.cashier_name}"`,
    o.subtotal,
    o.gst_amount,
    o.discount_amount + o.loyalty_discount,
    o.total_amount,
    o.payment_method,
  ]);

  const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename="cafeflow_sales_export.csv"');
  return res.send(csvContent);
};

