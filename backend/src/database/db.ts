import {
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
  CafeSettings,
  AuditLog,
  initialUsers,
  initialCategories,
  initialProducts,
  initialInventory,
  initialRecipes,
  initialCustomers,
  initialSettings,
  initialNotifications,
  initialShifts,
  initialAuditLogs,
} from './seedData';
import { v4 as uuidv4 } from 'uuid';

class DatabaseStore {
  public users: User[] = [...initialUsers];
  public categories: Category[] = [...initialCategories];
  public products: Product[] = [...initialProducts];
  public inventory: InventoryItem[] = [...initialInventory];
  public inventoryMovements: InventoryMovement[] = [];
  public recipes: Recipe[] = [...initialRecipes];
  public customers: Customer[] = [...initialCustomers];
  public orders: Order[] = [];
  public heldOrders: Order[] = [];
  public invoices: Invoice[] = [];
  public shifts: Shift[] = [...initialShifts];
  public notifications: Notification[] = [...initialNotifications];
  public settings: CafeSettings = { ...initialSettings };
  public auditLogs: AuditLog[] = [...initialAuditLogs];

  constructor() {
    this.seedHistoricalOrdersAndInvoices();
  }

  private seedHistoricalOrdersAndInvoices() {
    // Generate realistic historical orders over the last 14 days
    const paymentMethods: Array<'CASH' | 'UPI' | 'CARD'> = ['UPI', 'CASH', 'CARD', 'UPI', 'UPI'];
    const cashier = this.users.find(u => u.role === 'CASHIER') || this.users[0];
    const pastCustomers = [...this.customers];

    let orderCounter = 1001;
    const now = Date.now();

    for (let day = 14; day >= 0; day--) {
      // 4 to 10 orders per day
      const ordersCount = day === 0 ? 6 : Math.floor(Math.random() * 6) + 5;
      for (let i = 0; i < ordersCount; i++) {
        const orderTime = new Date(now - day * 86400000 + i * 3600000 + 36000000).toISOString();
        const customer = Math.random() > 0.35 ? pastCustomers[Math.floor(Math.random() * pastCustomers.length)] : null;
        
        // Pick 1 to 3 random products
        const sampleProducts = [
          this.products[0], // Cappuccino
          this.products[1], // Vanilla Latte
          this.products[3], // Cold Coffee
          this.products[8], // Paneer Sandwich
          this.products[10], // Peri-Peri Fries
          this.products[12], // Brownie
        ];
        
        const numItems = Math.floor(Math.random() * 2) + 1;
        const selected = sampleProducts.sort(() => 0.5 - Math.random()).slice(0, numItems);
        
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
        const invoiceNum = `CF-2026-${orderCounter++}`;

        const order: Order = {
          id: uuidv4(),
          invoice_number: invoiceNum,
          shift_id: day === 0 ? this.shifts[0]?.id : undefined,
          customer_id: customer?.id,
          customer_name: customer ? customer.name : 'Walk-in Customer',
          customer_phone: customer?.phone,
          cashier_id: cashier.id,
          cashier_name: cashier.name,
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
          order_id: order.id,
          invoice_number: invoiceNum,
          invoice_date: orderTime,
          customer_name: order.customer_name,
          customer_phone: order.customer_phone,
          customer_email: customer?.email,
          cashier_name: cashier.name,
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

  public logAudit(user_name: string, role: string, action: string, details: string) {
    this.auditLogs.unshift({
      id: uuidv4(),
      user_name,
      role,
      action,
      details,
      created_at: new Date().toISOString(),
    });
    if (this.auditLogs.length > 200) {
      this.auditLogs.pop();
    }
  }

  public addNotification(type: Notification['type'], title: string, message: string, severity: Notification['severity'] = 'INFO', link?: string) {
    const notif: Notification = {
      id: uuidv4(),
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
