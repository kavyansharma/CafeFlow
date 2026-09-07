import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../database/db';
import { AuthRequest } from '../middleware/auth';
import { CAFE_SUNRISE_ID } from '../database/seedData';

export const getCustomers = (req: Request, res: Response) => {
  const authReq = req as AuthRequest;
  const cafeId = authReq.user?.cafe_id || CAFE_SUNRISE_ID;
  const { search } = req.query;
  let customers = db.customers.filter(c => c.cafe_id === cafeId);

  if (search) {
    const s = String(search).toLowerCase();
    customers = customers.filter(
      c => c.name.toLowerCase().includes(s) || c.phone.includes(s) || c.email?.toLowerCase().includes(s)
    );
  }

  // Calculate AOV for each customer
  const enriched = customers.map(c => ({
    ...c,
    average_order_value: c.total_orders > 0 ? Number((c.total_spent / c.total_orders).toFixed(2)) : 0,
  }));

  return res.json({ success: true, count: enriched.length, data: enriched });
};

export const getCustomerById = (req: Request, res: Response) => {
  const authReq = req as AuthRequest;
  const cafeId = authReq.user?.cafe_id || CAFE_SUNRISE_ID;
  const { id } = req.params;
  const customer = db.customers.find(c => c.cafe_id === cafeId && (c.id === id || c.phone === id));

  if (!customer) {
    return res.status(404).json({ success: false, message: 'Customer not found in this cafe' });
  }

  // Get customer orders & invoices within this cafe
  const customerOrders = db.orders.filter(o => o.cafe_id === cafeId && (o.customer_id === customer.id || o.customer_phone === customer.phone));
  const aov = customer.total_orders > 0 ? Number((customer.total_spent / customer.total_orders).toFixed(2)) : 0;

  // Find favorite products
  const productFrequency: Record<string, { count: number; name: string }> = {};
  customerOrders.forEach(o => {
    o.items.forEach(item => {
      if (!productFrequency[item.product_id]) {
        productFrequency[item.product_id] = { count: 0, name: item.product_name };
      }
      productFrequency[item.product_id].count += item.quantity;
    });
  });

  const favorites = Object.values(productFrequency)
    .sort((a, b) => b.count - a.count)
    .slice(0, 3)
    .map(f => `${f.name} (${f.count}x)`);

  return res.json({
    success: true,
    data: {
      ...customer,
      average_order_value: aov,
      favorite_products: favorites,
      order_history: customerOrders.slice(0, 20),
    },
  });
};

export const createCustomer = (req: AuthRequest, res: Response) => {
  const cafeId = req.user?.cafe_id || CAFE_SUNRISE_ID;
  const { name, phone, email, notes } = req.body;

  if (!name || !phone) {
    return res.status(400).json({ success: false, message: 'Customer name and phone number are required' });
  }

  const existing = db.customers.find(c => c.cafe_id === cafeId && c.phone === phone);
  if (existing) {
    return res.status(409).json({ success: false, message: 'A customer with this phone number already exists in this cafe', data: existing });
  }

  const newCustomer = {
    id: `cust-${uuidv4().substring(0, 8)}`,
    cafe_id: cafeId,
    name,
    phone,
    email: email || undefined,
    loyalty_points: 0,
    total_orders: 0,
    total_spent: 0,
    last_visit: undefined,
    notes: notes || undefined,
    created_at: new Date().toISOString(),
  };

  db.customers.unshift(newCustomer);
  db.logAudit(cafeId, req.user?.name || 'Staff', req.user?.role || 'STAFF', 'Create Customer', `Added customer ${newCustomer.name} (${newCustomer.phone})`);

  return res.status(201).json({ success: true, message: 'Customer created successfully', data: newCustomer });
};

export const updateCustomer = (req: AuthRequest, res: Response) => {
  const cafeId = req.user?.cafe_id || CAFE_SUNRISE_ID;
  const { id } = req.params;
  const index = db.customers.findIndex(c => c.cafe_id === cafeId && c.id === id);

  if (index === -1) {
    return res.status(404).json({ success: false, message: 'Customer not found in this cafe' });
  }

  const existing = db.customers[index];
  const updated = {
    ...existing,
    ...req.body,
    cafe_id: cafeId,
    loyalty_points: req.body.loyalty_points !== undefined ? Number(req.body.loyalty_points) : existing.loyalty_points,
  };

  db.customers[index] = updated;
  return res.json({ success: true, message: 'Customer updated', data: updated });
};
