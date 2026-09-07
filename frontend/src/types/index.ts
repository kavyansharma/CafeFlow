export type Role = 'OWNER' | 'MANAGER' | 'CASHIER';

export interface Cafe {
  id: string;
  name: string;
  slug: string;
  logo_url?: string;
  address: string;
  phone: string;
  email: string;
  gstin: string;
  currency: string;
  timezone: string;
  invoice_prefix: string;
  default_gst_rate: number;
  loyalty_spend_per_point: number;
  loyalty_point_value: number;
  max_discount_percent: number;
  enable_ai_insights: boolean;
  status: 'ACTIVE' | 'SUSPENDED' | 'ONBOARDING';
  created_at: string;
  updated_at?: string;
}

export interface User {
  id: string;
  cafe_id: string;
  name: string;
  email: string;
  phone?: string;
  role: Role;
  is_active?: boolean;
  cafe?: Cafe;
  created_at?: string;
}

export interface Category {
  id: string;
  cafe_id?: string;
  name: string;
  slug: string;
  description: string;
  icon: string;
  sort_order: number;
  is_active: boolean;
  product_count?: number;
}

export interface Product {
  id: string;
  cafe_id?: string;
  category_id: string;
  category_name?: string;
  name: string;
  sku: string;
  description: string;
  selling_price: number;
  cost_price: number;
  gst_rate: number;
  image_url: string;
  is_available: boolean;
  track_stock: boolean;
  stock_quantity: number;
  min_stock_level: number;
  has_recipe: boolean;
}

export interface InventoryItem {
  id: string;
  name: string;
  sku: string;
  category: string;
  current_quantity: number;
  unit: string;
  min_quantity: number;
  cost_per_unit: number;
  supplier: string;
  last_updated: string;
  is_low_stock?: boolean;
  is_critical?: boolean;
  stock_value?: number;
}

export interface InventoryMovement {
  id: string;
  inventory_id: string;
  inventory_name: string;
  movement_type: 'PURCHASE' | 'SALE' | 'ADJUSTMENT' | 'WASTAGE';
  quantity_change: number;
  quantity_after: number;
  unit: string;
  reason: string;
  reference_id?: string;
  created_by_name: string;
  created_at: string;
}

export interface RecipeItem {
  inventory_id: string;
  inventory_name: string;
  quantity_required: number;
  unit: string;
  cost_contribution: number;
}

export interface Recipe {
  id: string;
  product_id: string;
  product_name: string;
  instructions: string;
  prep_time_mins: number;
  calculated_cogs: number;
  items: RecipeItem[];
  selling_price?: number;
  gross_margin?: number;
  margin_percent?: number;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  email?: string;
  loyalty_points: number;
  total_orders: number;
  total_spent: number;
  last_visit?: string;
  notes?: string;
  average_order_value?: number;
  favorite_products?: string[];
  order_history?: Order[];
  created_at?: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
  notes?: string;
}

export interface OrderItem {
  product_id: string;
  product_name: string;
  category_name?: string;
  quantity: number;
  unit_price: number;
  cost_price: number;
  gst_rate: number;
  gst_amount: number;
  subtotal: number;
  total: number;
}

export interface Order {
  id: string;
  invoice_number: string;
  shift_id?: string;
  customer_id?: string;
  customer_name: string;
  customer_phone?: string;
  cashier_id: string;
  cashier_name: string;
  items: OrderItem[];
  subtotal: number;
  discount_amount: number;
  discount_type: 'PERCENTAGE' | 'FIXED' | 'LOYALTY' | 'NONE';
  discount_percentage?: number;
  gst_amount: number;
  total_amount: number;
  points_earned: number;
  points_redeemed: number;
  loyalty_discount: number;
  payment_method: 'CASH' | 'UPI' | 'CARD';
  amount_received: number;
  change_returned: number;
  status: 'COMPLETED' | 'HELD' | 'CANCELLED';
  notes?: string;
  created_at: string;
}

export interface HeldOrder {
  id: string;
  customer_name: string;
  customer_phone?: string;
  items: CartItem[];
  notes?: string;
  created_at: string;
}

export interface Invoice {
  id: string;
  order_id: string;
  invoice_number: string;
  invoice_date: string;
  customer_name: string;
  customer_phone?: string;
  customer_email?: string;
  cashier_name: string;
  items: OrderItem[];
  subtotal: number;
  discount: number;
  tax_amount: number;
  grand_total: number;
  payment_method: string;
  amount_received: number;
  change_returned: number;
  payment_status: string;
  created_at: string;
}

export interface Shift {
  id: string;
  user_id: string;
  user_name: string;
  start_time: string;
  end_time?: string;
  opening_cash: number;
  cash_sales: number;
  upi_sales: number;
  card_sales: number;
  total_sales: number;
  total_orders: number;
  expected_cash: number;
  actual_cash?: number;
  cash_difference?: number;
  status: 'OPEN' | 'CLOSED';
  notes?: string;
}

export interface Notification {
  id: string;
  type: 'LOW_STOCK' | 'PAYMENT' | 'SHIFT' | 'CUSTOMER' | 'SYSTEM' | 'AI_INSIGHT';
  title: string;
  message: string;
  severity: 'INFO' | 'WARNING' | 'CRITICAL' | 'SUCCESS';
  link?: string;
  is_read: boolean;
  created_at: string;
}

export interface CafeSettings {
  cafe_name: string;
  tagline: string;
  address: string;
  phone: string;
  email: string;
  gstin: string;
  currency: string;
  invoice_prefix: string;
  default_gst_rate: number;
  loyalty_spend_per_point: number;
  loyalty_point_value: number;
  max_discount_percent: number;
  enable_ai_insights: boolean;
}

export interface DashboardKPI {
  today_revenue: number;
  revenue_growth: number;
  today_orders: number;
  orders_growth: number;
  average_order_value: number;
  aov_growth: number;
  total_customers: number;
  customer_growth: number;
}
