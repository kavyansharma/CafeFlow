import {
  Cafe,
  User,
  Category,
  Product,
  InventoryItem,
  InventoryMovement,
  Recipe,
  Customer,
  Order,
  Invoice,
  Shift,
  Notification,
  AuditLog,
  CAFE_SUNRISE_ID,
  CAFE_BEAN_ID,
  initialCafes,
  initialUsers,
  initialCategories,
  initialProducts,
  initialInventory,
  initialRecipes,
  initialCustomers,
  initialNotifications,
  initialShifts,
  initialAuditLogs,
} from './seedData';
import { v4 as uuidv4 } from 'uuid';

class DatabaseStore {
  public cafes: Cafe[] = [...initialCafes];
  public users: User[] = [...initialUsers];
  public categories: Category[] = [...initialCategories];
  public products: Product[] = [...initialProducts];
  public inventory: InventoryItem[] = [...initialInventory];
  public inventoryMovements: InventoryMovement[] = [];
  public recipes: Recipe[] = [...initialRecipes];
  public customers: Customer[] = [...initialCustomers];
  public orders: Order[] = [];
  public heldOrders: Array<Order & { cafe_id: string }> = [];
  public invoices: Invoice[] = [];
  public shifts: Shift[] = [...initialShifts];
  public notifications: Notification[] = [...initialNotifications];
  public auditLogs: AuditLog[] = [...initialAuditLogs];
  public invoiceSequences: Map<string, number> = new Map();

  constructor() {
    this.seedHistoricalOrdersForCafe(CAFE_SUNRISE_ID, 'SC-2026-', 1001);
    this.seedHistoricalOrdersForCafe(CAFE_BEAN_ID, 'BT-2026-', 2001);
    this.invoiceSequences.set(CAFE_SUNRISE_ID, 1050);
    this.invoiceSequences.set(CAFE_BEAN_ID, 2050);
  }

  private seedHistoricalOrdersForCafe(cafeId: string, prefix: string, startSeq: number) {
    const cafeProducts = this.products.filter(p => p.cafe_id === cafeId);
    const cafeCustomers = this.customers.filter(c => c.cafe_id === cafeId);
    const cafeCashier = this.users.find(u => u.cafe_id === cafeId && u.role === 'CASHIER') || this.users[0];
    const cafeShift = this.shifts.find(s => s.cafe_id === cafeId);

    const paymentMethods: Array<'CASH' | 'UPI' | 'CARD'> = ['UPI', 'CASH', 'CARD', 'UPI', 'UPI'];
    let orderCounter = startSeq;
    const now = Date.now();

    for (let day = 12; day >= 0; day--) {
      const ordersCount = day === 0 ? 5 : Math.floor(Math.random() * 4) + 4;
      for (let i = 0; i < ordersCount; i++) {
        const orderTime = new Date(now - day * 86400000 + i * 3600000 + 36000000).toISOString();
        const customer = Math.random() > 0.35 && cafeCustomers.length > 0
          ? cafeCustomers[Math.floor(Math.random() * cafeCustomers.length)]
          : null;

        const numItems = Math.min(cafeProducts.length, Math.floor(Math.random() * 2) + 1);
        const selected = [...cafeProducts].sort(() => 0.5 - Math.random()).slice(0, numItems);

        let subtotal = 0;
        let gstTotal = 0;
        const items = selected.map(p => {
          const qty = Math.floor(Math.random() * 2) + 1;
          const itemSubtotal = p.selling_price * qty;
          const itemGst = Number(((itemSubtotal * p.gst_rate) / 100).toFixed(2));
          subtotal += itemSubtotal;
          gstTotal += itemGst;
          return {
            product_id: p.id,
            product_name: p.name,
            category_name: this.categories.find(c => c.id === p.category_id)?.name || 'General',
            quantity: qty,
            unit_price: p.selling_price,
            cost_price: p.cost_price,
            gst_rate: p.gst_rate,
            gst_amount: itemGst,
            subtotal: itemSubtotal,
            total: itemSubtotal + itemGst,
          };
        });

        const discount = Math.random() > 0.7 ? 20 : 0;
        const finalTotal = subtotal + gstTotal - discount;
        const payMethod = paymentMethods[Math.floor(Math.random() * paymentMethods.length)];
        const invoiceNum = `${prefix}${orderCounter++}`;

        const order: Order = {
          id: uuidv4(),
          cafe_id: cafeId,
          invoice_number: invoiceNum,
          shift_id: day === 0 ? cafeShift?.id : undefined,
          customer_id: customer?.id,
          customer_name: customer ? customer.name : 'Walk-in Customer',
          customer_phone: customer?.phone,
          cashier_id: cafeCashier.id,
          cashier_name: cafeCashier.name,
          items,
          subtotal,
          discount_amount: discount,
          discount_type: discount > 0 ? 'FIXED' : 'NONE',
          gst_amount: gstTotal,
          total_amount: finalTotal,
          points_earned: Math.floor(finalTotal / 100),
          points_redeemed: 0,
          loyalty_discount: 0,
          payment_method: payMethod,
          amount_received: payMethod === 'CASH' ? Math.ceil(finalTotal / 100) * 100 : finalTotal,
          change_returned: payMethod === 'CASH' ? Math.ceil(finalTotal / 100) * 100 - finalTotal : 0,
          status: 'COMPLETED',
          created_at: orderTime,
        };

        this.orders.push(order);

        const invoice: Invoice = {
          id: uuidv4(),
          cafe_id: cafeId,
          order_id: order.id,
          invoice_number: invoiceNum,
          invoice_date: orderTime,
          customer_name: order.customer_name,
          customer_phone: order.customer_phone,
          customer_email: customer?.email,
          cashier_name: cafeCashier.name,
          items: order.items,
          subtotal: order.subtotal,
          discount: order.discount_amount,
          tax_amount: order.gst_amount,
          grand_total: order.total_amount,
          payment_method: order.payment_method,
          amount_received: order.amount_received,
          change_returned: order.change_returned,
          payment_status: 'PAID',
          created_at: orderTime,
        };

        this.invoices.push(invoice);
      }
    }
  }

  public getCafe(cafeId: string): Cafe | undefined {
    return this.cafes.find(c => c.id === cafeId);
  }

  public getCafeSettings(cafeId: string) {
    const cafe = this.cafes.find(c => c.id === cafeId) || this.cafes[0];
    return {
      cafe_name: cafe?.name || 'Sunrise Cafe & Roastery',
      tagline: 'Artisanal Coffee & Fresh Bakes',
      address: cafe?.address || 'Shop 14, High Street Indiranagar, Bengaluru - 560038',
      phone: cafe?.phone || '+91 98765 43210',
      email: cafe?.email || 'contact@sunrisecafe.demo',
      gstin: cafe?.gstin || '29AAAAA0000A1Z5',
      currency: cafe?.currency || '₹',
      currency_code: 'INR',
      timezone: cafe?.timezone || 'Asia/Kolkata',
      invoice_prefix: cafe?.invoice_prefix || 'CF-2026-',
      default_gst_rate: cafe?.default_gst_rate ?? 5,
      loyalty_spend_per_point: cafe?.loyalty_spend_per_point ?? 100,
      loyalty_point_value: cafe?.loyalty_point_value ?? 1,
      max_discount_percent: cafe?.max_discount_percent ?? 30,
      enable_ai_insights: cafe?.enable_ai_insights ?? true,
      logo_url: cafe?.logo_url,
    };
  }

  public updateCafeSettings(cafeId: string, updates: any) {
    const cafe = this.cafes.find(c => c.id === cafeId);
    if (cafe) {
      if (updates.cafe_name) cafe.name = updates.cafe_name;
      if (updates.name) cafe.name = updates.name;
      if (updates.address) cafe.address = updates.address;
      if (updates.phone) cafe.phone = updates.phone;
      if (updates.email) cafe.email = updates.email;
      if (updates.gstin) cafe.gstin = updates.gstin;
      if (updates.currency) cafe.currency = updates.currency;
      if (updates.invoice_prefix) cafe.invoice_prefix = updates.invoice_prefix;
      if (updates.default_gst_rate !== undefined) cafe.default_gst_rate = Number(updates.default_gst_rate);
      if (updates.loyalty_spend_per_point !== undefined) cafe.loyalty_spend_per_point = Number(updates.loyalty_spend_per_point);
      if (updates.loyalty_point_value !== undefined) cafe.loyalty_point_value = Number(updates.loyalty_point_value);
      if (updates.max_discount_percent !== undefined) cafe.max_discount_percent = Number(updates.max_discount_percent);
      if (updates.enable_ai_insights !== undefined) cafe.enable_ai_insights = Boolean(updates.enable_ai_insights);
      if (updates.logo_url !== undefined) cafe.logo_url = updates.logo_url;
      cafe.updated_at = new Date().toISOString();
    }
    return this.getCafeSettings(cafeId);
  }

  public getNextInvoiceNumber(cafeId: string): string {
    const cafe = this.cafes.find(c => c.id === cafeId);
    const prefix = cafe?.invoice_prefix || 'CF-2026-';
    const currentSeq = this.invoiceSequences.get(cafeId) || 1001;
    this.invoiceSequences.set(cafeId, currentSeq + 1);
    return `${prefix}${currentSeq}`;
  }

  public logAudit(cafeId: string, user_name: string, role: string, action: string, details: string) {
    this.auditLogs.unshift({
      id: uuidv4(),
      cafe_id: cafeId,
      user_name,
      role,
      action,
      details,
      created_at: new Date().toISOString(),
    });
    if (this.auditLogs.length > 500) {
      this.auditLogs.pop();
    }
  }

  public addNotification(cafeId: string, type: Notification['type'], title: string, message: string, severity: Notification['severity'] = 'INFO', link?: string) {
    const notif: Notification = {
      id: uuidv4(),
      cafe_id: cafeId,
      type,
      title,
      message,
      severity,
      link,
      is_read: false,
      created_at: new Date().toISOString(),
    };
    this.notifications.unshift(notif);
    return notif;
  }
}

export const db = new DatabaseStore();
