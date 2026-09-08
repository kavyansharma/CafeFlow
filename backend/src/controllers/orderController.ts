import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../database/db';
import { AuthRequest } from '../middleware/auth';
import { InventoryService } from '../services/inventoryService';
import { Order, Invoice, OrderItem, CAFE_SUNRISE_ID } from '../database/seedData';

let invoiceSequence = 1050;

export const createOrder = (req: AuthRequest, res: Response) => {
  const cafeId = req.user?.cafe_id || CAFE_SUNRISE_ID;
  const {
    items,
    customer_id,
    customer_name,
    customer_phone,
    discount_amount = 0,
    discount_type = 'NONE',
    discount_percentage = 0,
    payment_method = 'CASH',
    amount_received = 0,
    points_to_redeem = 0,
    notes,
  } = req.body;

  if (!items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ success: false, message: 'Cart items cannot be empty' });
  }

  // Validate quantities and item presence
  for (const item of items) {
    if (!item.product_id) {
      return res.status(400).json({ success: false, message: 'Every cart item must have a valid product_id' });
    }
    const qty = Number(item.quantity);
    if (!qty || isNaN(qty) || qty <= 0 || !Number.isInteger(qty)) {
      return res.status(400).json({ success: false, message: `Invalid item quantity (${item.quantity}). Quantity must be a positive integer.` });
    }
    const product = db.products.find(p => p.cafe_id === cafeId && p.id === item.product_id);
    if (!product) {
      return res.status(400).json({ success: false, message: `Product ${item.product_id} not found in this cafe` });
    }
  }

  const cashierId = req.user?.id || 'usr-cashier-003';
  const cashierName = req.user?.name || 'Rahul Sen';
  const cafeSettings = db.getCafeSettings(cafeId);

  // 1. Calculate items subtotal and GST
  let subtotal = 0;
  let totalGst = 0;

  const processedItems: OrderItem[] = items.map((item: any) => {
    const product = db.products.find(p => p.cafe_id === cafeId && p.id === item.product_id)!;
    const unitPrice = product.selling_price;
    const costPrice = product.cost_price;
    const gstRate = product.gst_rate;
    const qty = Number(item.quantity);

    const itemSubtotal = unitPrice * qty;
    const itemGst = Number(((itemSubtotal * gstRate) / 100).toFixed(2));

    subtotal += itemSubtotal;
    totalGst += itemGst;

    return {
      product_id: item.product_id,
      product_name: product.name,
      category_name: db.categories.find(c => c.cafe_id === cafeId && c.id === product.category_id)?.name || 'General',
      quantity: qty,
      unit_price: unitPrice,
      cost_price: costPrice,
      gst_rate: gstRate,
      gst_amount: itemGst,
      subtotal: itemSubtotal,
      total: itemSubtotal + itemGst,
    };
  });

  // 2. Pre-validate stock availability before modifying database
  const stockCheck = InventoryService.validateOrderStockAvailability(cafeId, processedItems);
  if (!stockCheck.available) {
    return res.status(400).json({ success: false, message: stockCheck.error || 'Insufficient stock for this order.' });
  }

  // 3. Handle discounts & loyalty redemption with strict bounds
  let calculatedDiscount = 0;
  if (discount_type === 'PERCENTAGE') {
    const pct = Number(discount_percentage);
    if (isNaN(pct) || pct < 0 || pct > cafeSettings.max_discount_percent) {
      return res.status(400).json({
        success: false,
        message: `Discount percentage must be between 0% and ${cafeSettings.max_discount_percent}%.`,
      });
    }
    calculatedDiscount = Number(((subtotal * pct) / 100).toFixed(2));
  } else if (discount_type === 'FIXED') {
    const fixedAmt = Number(discount_amount);
    if (isNaN(fixedAmt) || fixedAmt < 0 || fixedAmt > subtotal) {
      return res.status(400).json({
        success: false,
        message: 'Fixed discount amount cannot be negative or exceed the cart subtotal.',
      });
    }
    calculatedDiscount = fixedAmt;
  }

  let loyaltyDiscount = 0;
  let pointsRedeemed = Number(points_to_redeem || 0);
  if (pointsRedeemed < 0) {
    return res.status(400).json({ success: false, message: 'Loyalty points to redeem cannot be negative.' });
  }

  if (pointsRedeemed > 0) {
    if (customer_id) {
      const customer = db.customers.find(c => c.cafe_id === cafeId && c.id === customer_id);
      if (!customer || customer.loyalty_points < pointsRedeemed) {
        return res.status(400).json({
          success: false,
          message: `Customer only has ${customer?.loyalty_points || 0} loyalty points available.`,
        });
      }
    }
    loyaltyDiscount = Number((pointsRedeemed * cafeSettings.loyalty_point_value).toFixed(2));
  }

  const totalDiscount = Number(Math.min(subtotal + totalGst, calculatedDiscount + loyaltyDiscount).toFixed(2));
  const totalAmount = Math.max(0, Number((subtotal + totalGst - totalDiscount).toFixed(2)));

  // Validate Tender
  const tendered = amount_received !== undefined && amount_received !== null && Number(amount_received) > 0
    ? Number(amount_received)
    : totalAmount;

  if (isNaN(tendered) || tendered < 0) {
    return res.status(400).json({ success: false, message: 'Amount received cannot be negative.' });
  }
  if (payment_method === 'CASH' && tendered < totalAmount) {
    return res.status(400).json({ success: false, message: `Cash tendered (₹${tendered}) is less than total bill amount (₹${totalAmount}).` });
  }

  const changeReturned = payment_method === 'CASH' ? Math.max(0, Number((tendered - totalAmount).toFixed(2))) : 0;

  // Tenant-specific invoice number
  const invoiceNumber = db.getNextInvoiceNumber(cafeId);

  // Points earned calculation (e.g. ₹100 = 1 point)
  const pointsEarned = Math.floor(totalAmount / (cafeSettings.loyalty_spend_per_point || 100));

  // Find active shift for this specific cafe
  const activeShift = db.shifts.find(s => s.cafe_id === cafeId && s.status === 'OPEN');

  const orderId = uuidv4();
  const now = new Date().toISOString();

  const newOrder: Order = {
    id: orderId,
    cafe_id: cafeId,
    invoice_number: invoiceNumber,
    shift_id: activeShift?.id,
    customer_id: customer_id || undefined,
    customer_name: customer_name || 'Walk-in Customer',
    customer_phone: customer_phone || undefined,
    cashier_id: cashierId,
    cashier_name: cashierName,
    items: processedItems,
    subtotal: Number(subtotal.toFixed(2)),
    discount_amount: calculatedDiscount,
    discount_type,
    discount_percentage,
    gst_amount: Number(totalGst.toFixed(2)),
    total_amount: totalAmount,
    points_earned: pointsEarned,
    points_redeemed: pointsRedeemed,
    loyalty_discount: loyaltyDiscount,
    payment_method,
    amount_received: tendered,
    change_returned: changeReturned,
    status: 'COMPLETED',
    notes: notes || undefined,
    created_at: now,
  };

  db.orders.unshift(newOrder);

  // 3. Create official Invoice
  const newInvoice: Invoice = {
    id: uuidv4(),
    cafe_id: cafeId,
    order_id: orderId,
    invoice_number: invoiceNumber,
    invoice_date: now,
    customer_name: newOrder.customer_name,
    customer_phone: newOrder.customer_phone,
    cashier_name: cashierName,
    items: processedItems,
    subtotal: newOrder.subtotal,
    discount: totalDiscount,
    tax_amount: newOrder.gst_amount,
    grand_total: newOrder.total_amount,
    payment_method,
    amount_received: tendered,
    change_returned: changeReturned,
    payment_status: 'PAID',
    created_at: now,
  };

  db.invoices.unshift(newInvoice);

  // 4. Update Inventory & Recipe BOM scoped to cafe
  InventoryService.processOrderStockDeduction(cafeId, processedItems, orderId, cashierName);

  // 5. Update Customer history & Loyalty points within cafe
  if (customer_id) {
    const customer = db.customers.find(c => c.cafe_id === cafeId && c.id === customer_id);
    if (customer) {
      customer.total_orders += 1;
      customer.total_spent = Number((customer.total_spent + totalAmount).toFixed(2));
      customer.loyalty_points = Math.max(0, customer.loyalty_points - pointsRedeemed + pointsEarned);
      customer.last_visit = now;
    }
  }

  // 6. Update Shift sales totals
  if (activeShift) {
    activeShift.total_orders += 1;
    activeShift.total_sales = Number((activeShift.total_sales + totalAmount).toFixed(2));
    if (payment_method === 'CASH') {
      activeShift.cash_sales = Number((activeShift.cash_sales + totalAmount).toFixed(2));
      activeShift.expected_cash = Number((activeShift.opening_cash + activeShift.cash_sales).toFixed(2));
    } else if (payment_method === 'UPI') {
      activeShift.upi_sales = Number((activeShift.upi_sales + totalAmount).toFixed(2));
    } else if (payment_method === 'CARD') {
      activeShift.card_sales = Number((activeShift.card_sales + totalAmount).toFixed(2));
    }
  }

  // Audit log
  db.logAudit(
    cafeId,
    cashierName,
    req.user?.role || 'CASHIER',
    'Generate Invoice',
    `Invoice ${invoiceNumber} created for ${newOrder.customer_name} (₹${totalAmount} via ${payment_method})`
  );

  return res.status(201).json({
    success: true,
    message: 'Order completed and invoice generated successfully',
    order: newOrder,
    invoice: newInvoice,
  });
};

export const holdOrder = (req: AuthRequest, res: Response) => {
  const cafeId = req.user?.cafe_id || CAFE_SUNRISE_ID;
  const { items, customer_name, customer_phone, notes } = req.body;

  if (!items || items.length === 0) {
    return res.status(400).json({ success: false, message: 'No items in cart to hold' });
  }

  const heldOrder: any = {
    id: `held-${uuidv4().substring(0, 8)}`,
    cafe_id: cafeId,
    customer_name: customer_name || 'Walk-in Customer',
    customer_phone,
    items,
    notes: notes || 'Parked Bill',
    created_at: new Date().toISOString(),
  };

  db.heldOrders.unshift(heldOrder);
  return res.json({ success: true, message: 'Bill placed on hold', data: heldOrder });
};

export const getHeldOrders = (req: Request, res: Response) => {
  const authReq = req as AuthRequest;
  const cafeId = authReq.user?.cafe_id || CAFE_SUNRISE_ID;
  const held = db.heldOrders.filter(h => h.cafe_id === cafeId);
  return res.json({ success: true, count: held.length, data: held });
};

export const removeHeldOrder = (req: Request, res: Response) => {
  const authReq = req as AuthRequest;
  const cafeId = authReq.user?.cafe_id || CAFE_SUNRISE_ID;
  const { id } = req.params;
  const index = db.heldOrders.findIndex(h => h.cafe_id === cafeId && h.id === id);
  if (index >= 0) {
    const resumed = db.heldOrders.splice(index, 1)[0];
    return res.json({ success: true, message: 'Held bill resumed', data: resumed });
  }
  return res.status(404).json({ success: false, message: 'Held bill not found' });
};

export const getOrders = (req: Request, res: Response) => {
  const authReq = req as AuthRequest;
  const cafeId = authReq.user?.cafe_id || CAFE_SUNRISE_ID;
  const { limit = 50, status, search } = req.query;
  let orders = db.orders.filter(o => o.cafe_id === cafeId);

  if (status) {
    orders = orders.filter(o => o.status === status);
  }

  if (search) {
    const s = String(search).toLowerCase();
    orders = orders.filter(
      o =>
        o.invoice_number.toLowerCase().includes(s) ||
        o.customer_name.toLowerCase().includes(s) ||
        o.customer_phone?.includes(s)
    );
  }

  return res.json({
    success: true,
    count: orders.length,
    data: orders.slice(0, Number(limit)),
  });
};

export const getOrderById = (req: Request, res: Response) => {
  const authReq = req as AuthRequest;
  const cafeId = authReq.user?.cafe_id || CAFE_SUNRISE_ID;
  const { id } = req.params;
  const order = db.orders.find(o => o.cafe_id === cafeId && (o.id === id || o.invoice_number === id));
  if (!order) {
    return res.status(404).json({ success: false, message: 'Order not found in this cafe' });
  }
  const invoice = db.invoices.find(i => i.cafe_id === cafeId && (i.order_id === order.id || i.invoice_number === order.invoice_number));

  return res.json({ success: true, data: { ...order, invoice } });
};
