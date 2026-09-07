import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcryptjs';

const salt = bcrypt.genSaltSync(10);
export const hashPassword = (password: string) => bcrypt.hashSync(password, salt);

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
  updated_at: string;
}

export interface User {
  id: string;
  cafe_id: string;
  name: string;
  email: string;
  phone: string;
  password_hash: string;
  role: 'OWNER' | 'MANAGER' | 'CASHIER';
  is_active: boolean;
  created_at: string;
}

export interface Category {
  id: string;
  cafe_id: string;
  name: string;
  slug: string;
  description: string;
  icon: string;
  sort_order: number;
  is_active: boolean;
}

export interface Product {
  id: string;
  cafe_id: string;
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
  created_at: string;
  updated_at: string;
}

export interface InventoryItem {
  id: string;
  cafe_id: string;
  name: string;
  sku: string;
  category: string;
  current_quantity: number;
  unit: string;
  min_quantity: number;
  cost_per_unit: number;
  supplier: string;
  last_updated: string;
}

export interface InventoryMovement {
  id: string;
  cafe_id: string;
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
  cafe_id: string;
  product_id: string;
  product_name: string;
  instructions: string;
  prep_time_mins: number;
  calculated_cogs: number;
  items: RecipeItem[];
}

export interface Customer {
  id: string;
  cafe_id: string;
  name: string;
  phone: string;
  email?: string;
  loyalty_points: number;
  total_orders: number;
  total_spent: number;
  last_visit?: string;
  notes?: string;
  created_at: string;
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
  cafe_id: string;
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

export interface Invoice {
  id: string;
  cafe_id: string;
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
  cafe_id: string;
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
  cafe_id: string;
  type: 'LOW_STOCK' | 'PAYMENT' | 'SHIFT' | 'CUSTOMER' | 'SYSTEM' | 'AI_INSIGHT';
  title: string;
  message: string;
  severity: 'INFO' | 'WARNING' | 'CRITICAL' | 'SUCCESS';
  link?: string;
  is_read: boolean;
  created_at: string;
}

export interface AuditLog {
  id: string;
  cafe_id: string;
  user_name: string;
  role: string;
  action: string;
  details: string;
  created_at: string;
}

// ==========================================================
// SEED CAFES (TENANTS)
// ==========================================================
export const CAFE_SUNRISE_ID = 'cafe-sunrise-001';
export const CAFE_BEAN_ID = 'cafe-bean-002';

export const initialCafes: Cafe[] = [
  {
    id: CAFE_SUNRISE_ID,
    name: 'Sunrise Cafe & Roastery',
    slug: 'sunrise-cafe',
    logo_url: '',
    address: 'Shop 4-5, Ground Floor, Indiranagar 100ft Road, Bengaluru, Karnataka 560038',
    phone: '+91 80 4123 9876',
    email: 'hello@sunrisecafe.com',
    gstin: '29ABCDE1234F1Z5',
    currency: '₹',
    timezone: 'Asia/Kolkata',
    invoice_prefix: 'SC-2026-',
    default_gst_rate: 5,
    loyalty_spend_per_point: 100,
    loyalty_point_value: 1.0,
    max_discount_percent: 30,
    enable_ai_insights: true,
    status: 'ACTIVE',
    created_at: '2026-01-01T08:00:00.000Z',
    updated_at: '2026-01-01T08:00:00.000Z',
  },
  {
    id: CAFE_BEAN_ID,
    name: 'Bean Theory Specialty Coffee',
    slug: 'bean-theory',
    logo_url: '',
    address: 'Plot 18, Pali Hill Road, Bandra West, Mumbai, Maharashtra 400050',
    phone: '+91 22 6789 1234',
    email: 'contact@beantheory.com',
    gstin: '27AABCB9876E1Z2',
    currency: '₹',
    timezone: 'Asia/Kolkata',
    invoice_prefix: 'BT-2026-',
    default_gst_rate: 5,
    loyalty_spend_per_point: 150,
    loyalty_point_value: 2.0,
    max_discount_percent: 25,
    enable_ai_insights: true,
    status: 'ACTIVE',
    created_at: '2026-02-01T08:00:00.000Z',
    updated_at: '2026-02-01T08:00:00.000Z',
  },
];

// ==========================================================
// SEED USERS (TENANT-SCOPED)
// ==========================================================
export const initialUsers: User[] = [
  // --- Sunrise Cafe Users ---
  {
    id: 'usr-sunrise-owner',
    cafe_id: CAFE_SUNRISE_ID,
    name: 'Aarav Sharma',
    email: 'owner@sunrise.demo',
    phone: '+91 98765 43210',
    password_hash: hashPassword('demo123'),
    role: 'OWNER',
    is_active: true,
    created_at: '2026-01-01T08:00:00.000Z',
  },
  {
    id: 'usr-sunrise-mgr',
    cafe_id: CAFE_SUNRISE_ID,
    name: 'Pooja Verma',
    email: 'manager@sunrise.demo',
    phone: '+91 98765 43211',
    password_hash: hashPassword('demo123'),
    role: 'MANAGER',
    is_active: true,
    created_at: '2026-01-15T09:00:00.000Z',
  },
  {
    id: 'usr-sunrise-cashier',
    cafe_id: CAFE_SUNRISE_ID,
    name: 'Rahul Sen',
    email: 'cashier@sunrise.demo',
    phone: '+91 98765 43212',
    password_hash: hashPassword('demo123'),
    role: 'CASHIER',
    is_active: true,
    created_at: '2026-02-01T10:00:00.000Z',
  },

  // Legacy fallback logins mapped to Sunrise Cafe
  {
    id: 'usr-owner-001',
    cafe_id: CAFE_SUNRISE_ID,
    name: 'Aarav Sharma',
    email: 'owner@cafeflow.com',
    phone: '+91 98765 43210',
    password_hash: hashPassword('owner123'),
    role: 'OWNER',
    is_active: true,
    created_at: '2026-01-01T08:00:00.000Z',
  },
  {
    id: 'usr-mgr-002',
    cafe_id: CAFE_SUNRISE_ID,
    name: 'Pooja Verma',
    email: 'manager@cafeflow.com',
    phone: '+91 98765 43211',
    password_hash: hashPassword('manager123'),
    role: 'MANAGER',
    is_active: true,
    created_at: '2026-01-15T09:00:00.000Z',
  },
  {
    id: 'usr-cashier-003',
    cafe_id: CAFE_SUNRISE_ID,
    name: 'Rahul Sen',
    email: 'cashier@cafeflow.com',
    phone: '+91 98765 43212',
    password_hash: hashPassword('cashier123'),
    role: 'CASHIER',
    is_active: true,
    created_at: '2026-02-01T10:00:00.000Z',
  },

  // --- Bean Theory Users (Isolated Tenant) ---
  {
    id: 'usr-bean-owner',
    cafe_id: CAFE_BEAN_ID,
    name: 'Devika Singhania',
    email: 'owner@bean.demo',
    phone: '+91 98201 11223',
    password_hash: hashPassword('demo123'),
    role: 'OWNER',
    is_active: true,
    created_at: '2026-02-01T08:00:00.000Z',
  },
  {
    id: 'usr-bean-mgr',
    cafe_id: CAFE_BEAN_ID,
    name: 'Rhea Fernandes',
    email: 'manager@bean.demo',
    phone: '+91 98201 11224',
    password_hash: hashPassword('demo123'),
    role: 'MANAGER',
    is_active: true,
    created_at: '2026-02-05T09:00:00.000Z',
  },
  {
    id: 'usr-bean-cashier',
    cafe_id: CAFE_BEAN_ID,
    name: 'Kabir Merchant',
    email: 'cashier@bean.demo',
    phone: '+91 98201 11225',
    password_hash: hashPassword('demo123'),
    role: 'CASHIER',
    is_active: true,
    created_at: '2026-02-10T10:00:00.000Z',
  },
];

// ==========================================================
// SEED CATEGORIES (TENANT-SCOPED)
// ==========================================================
export const initialCategories: Category[] = [
  // Sunrise Cafe Categories
  { id: 'cat-sc-coffee', cafe_id: CAFE_SUNRISE_ID, name: 'Coffee', slug: 'coffee', description: 'Artisan Espresso, Brews & Iced Coffees', icon: 'Coffee', sort_order: 1, is_active: true },
  { id: 'cat-sc-tea', cafe_id: CAFE_SUNRISE_ID, name: 'Tea', slug: 'tea', description: 'Handcrafted Chais & Herbal Infusions', icon: 'CupSoda', sort_order: 2, is_active: true },
  { id: 'cat-sc-beverages', cafe_id: CAFE_SUNRISE_ID, name: 'Beverages', slug: 'beverages', description: 'Smoothies, Coolers & Shakes', icon: 'GlassWater', sort_order: 3, is_active: true },
  { id: 'cat-sc-snacks', cafe_id: CAFE_SUNRISE_ID, name: 'Snacks', slug: 'snacks', description: 'Crispy finger foods & Fries', icon: 'Utensils', sort_order: 4, is_active: true },
  { id: 'cat-sc-sandwiches', cafe_id: CAFE_SUNRISE_ID, name: 'Sandwiches', slug: 'sandwiches', description: 'Grilled Gourmet Paninis & Sourdough', icon: 'Sandwich', sort_order: 5, is_active: true },
  { id: 'cat-sc-desserts', cafe_id: CAFE_SUNRISE_ID, name: 'Desserts', slug: 'desserts', description: 'Fresh Bakes, Cheesecakes & Brownies', icon: 'Cake', sort_order: 6, is_active: true },
  { id: 'cat-sc-meals', cafe_id: CAFE_SUNRISE_ID, name: 'Meals', slug: 'meals', description: 'Pastas, Bowls & Quick Bites', icon: 'Soup', sort_order: 7, is_active: true },
  { id: 'cat-sc-addons', cafe_id: CAFE_SUNRISE_ID, name: 'Add-ons', slug: 'add-ons', description: 'Syrups, Extra Shots & Plant Milks', icon: 'PlusCircle', sort_order: 8, is_active: true },

  // Bean Theory Categories (Distinct)
  { id: 'cat-bt-pour-over', cafe_id: CAFE_BEAN_ID, name: 'Manual Brews', slug: 'manual-brews', description: 'Single-origin V60, Aeropress & Chemex', icon: 'Coffee', sort_order: 1, is_active: true },
  { id: 'cat-bt-espresso', cafe_id: CAFE_BEAN_ID, name: 'Espresso Bar', slug: 'espresso-bar', description: 'Micro-lot espresso extractions & Flat Whites', icon: 'Coffee', sort_order: 2, is_active: true },
  { id: 'cat-bt-cold-brew', cafe_id: CAFE_BEAN_ID, name: 'Cold Brews & Tonics', slug: 'cold-brews', description: '18-hour steep nitro & citrus infusions', icon: 'GlassWater', sort_order: 3, is_active: true },
  { id: 'cat-bt-bakery', cafe_id: CAFE_BEAN_ID, name: 'French Viennoiserie', slug: 'viennoiserie', description: 'Butter croissants, cruffins & tarts', icon: 'Cake', sort_order: 4, is_active: true },
  { id: 'cat-bt-brunch', cafe_id: CAFE_BEAN_ID, name: 'Artisan Brunch', slug: 'artisan-brunch', description: 'Avocado toasts, tartines & shakshuka', icon: 'Sandwich', sort_order: 5, is_active: true },
];

// ==========================================================
// SEED INVENTORY (TENANT-SCOPED)
// ==========================================================
export const initialInventory: InventoryItem[] = [
  // --- Sunrise Cafe Inventory ---
  { id: 'inv-sc-beans', cafe_id: CAFE_SUNRISE_ID, name: 'Arabica Espresso Roast Beans', sku: 'SC-RAW-BEAN-01', category: 'Coffee', current_quantity: 4.8, unit: 'kg', min_quantity: 2.0, cost_per_unit: 1200, supplier: 'Blue Mountain Roasters', last_updated: '2026-09-07T10:00:00.000Z' },
  { id: 'inv-sc-milk', cafe_id: CAFE_SUNRISE_ID, name: 'Whole Cream Dairy Milk', sku: 'SC-RAW-MILK-01', category: 'Dairy', current_quantity: 8.5, unit: 'L', min_quantity: 12.0, cost_per_unit: 65, supplier: 'Amul Fresh Hub', last_updated: '2026-09-07T18:30:00.000Z' },
  { id: 'inv-sc-oatmilk', cafe_id: CAFE_SUNRISE_ID, name: 'Oatly Barista Edition Oat Milk', sku: 'SC-RAW-OAT-01', category: 'Dairy Alternatives', current_quantity: 6.0, unit: 'L', min_quantity: 3.0, cost_per_unit: 290, supplier: 'Green Planet Foods', last_updated: '2026-09-06T14:00:00.000Z' },
  { id: 'inv-sc-sugar', cafe_id: CAFE_SUNRISE_ID, name: 'Organic Brown Sugar', sku: 'SC-RAW-SUG-01', category: 'Dry Goods', current_quantity: 7.2, unit: 'kg', min_quantity: 3.0, cost_per_unit: 75, supplier: 'Nature Basket Organics', last_updated: '2026-09-05T09:00:00.000Z' },
  { id: 'inv-sc-paneer', cafe_id: CAFE_SUNRISE_ID, name: 'Fresh Malai Paneer', sku: 'SC-RAW-PAN-01', category: 'Dairy', current_quantity: 3.2, unit: 'kg', min_quantity: 1.5, cost_per_unit: 380, supplier: 'Amul Fresh Hub', last_updated: '2026-09-07T08:00:00.000Z' },
  { id: 'inv-sc-bread', cafe_id: CAFE_SUNRISE_ID, name: 'Artisan Sourdough Loaves', sku: 'SC-RAW-BRD-01', category: 'Bakery', current_quantity: 14, unit: 'pcs', min_quantity: 6, cost_per_unit: 80, supplier: 'Craft Bakers Guild', last_updated: '2026-09-07T07:00:00.000Z' },
  { id: 'inv-sc-cups', cafe_id: CAFE_SUNRISE_ID, name: 'Eco 80mm Takeaway Hot Cups', sku: 'SC-PKG-CUP-01', category: 'Packaging', current_quantity: 350, unit: 'pcs', min_quantity: 100, cost_per_unit: 4.5, supplier: 'EcoPack India', last_updated: '2026-09-06T17:00:00.000Z' },

  // --- Bean Theory Inventory (Isolated) ---
  { id: 'inv-bt-yirgacheffe', cafe_id: CAFE_BEAN_ID, name: 'Ethiopian Yirgacheffe Washed Beans', sku: 'BT-RAW-ETH-01', category: 'Specialty Coffee', current_quantity: 6.5, unit: 'kg', min_quantity: 2.5, cost_per_unit: 2400, supplier: 'Direct Origin Imports', last_updated: '2026-09-07T12:00:00.000Z' },
  { id: 'inv-bt-almond-milk', cafe_id: CAFE_BEAN_ID, name: 'Califia Farms Almond Barista Milk', sku: 'BT-RAW-ALM-01', category: 'Dairy Alternatives', current_quantity: 12.0, unit: 'L', min_quantity: 5.0, cost_per_unit: 340, supplier: 'Gourmet World Foods', last_updated: '2026-09-07T14:00:00.000Z' },
  { id: 'inv-bt-avocados', cafe_id: CAFE_BEAN_ID, name: 'Hass Avocados Grade A', sku: 'BT-RAW-AVO-01', category: 'Produce', current_quantity: 22, unit: 'pcs', min_quantity: 8, cost_per_unit: 110, supplier: 'Organic Farm Gate', last_updated: '2026-09-07T09:00:00.000Z' },
  { id: 'inv-bt-croissants', cafe_id: CAFE_BEAN_ID, name: 'French Pure Butter Croissant Dough', sku: 'BT-RAW-CRS-01', category: 'Frozen Bakery', current_quantity: 40, unit: 'pcs', min_quantity: 15, cost_per_unit: 95, supplier: 'Bridor Gourmet', last_updated: '2026-09-06T10:00:00.000Z' },
  { id: 'inv-bt-matcha', cafe_id: CAFE_BEAN_ID, name: 'Ceremonial Uji Matcha Pure Grade', sku: 'BT-RAW-MAT-01', category: 'Tea', current_quantity: 750, unit: 'g', min_quantity: 200, cost_per_unit: 8.5, supplier: 'Kyoto Tea Direct', last_updated: '2026-09-05T15:00:00.000Z' },
  { id: 'inv-bt-truffle-oil', cafe_id: CAFE_BEAN_ID, name: 'White Truffle Infused Olive Oil', sku: 'BT-RAW-TRF-01', category: 'Oils', current_quantity: 800, unit: 'ml', min_quantity: 250, cost_per_unit: 4.8, supplier: 'Urbani Truffles', last_updated: '2026-09-05T11:00:00.000Z' },
];

// ==========================================================
// SEED PRODUCTS (TENANT-SCOPED)
// ==========================================================
export const initialProducts: Product[] = [
  // --- Sunrise Cafe Products ---
  {
    id: 'prod-sc-cappuccino',
    cafe_id: CAFE_SUNRISE_ID,
    category_id: 'cat-sc-coffee',
    name: 'Classic Cappuccino',
    sku: 'SC-CAP-01',
    description: 'Double shot rich espresso with velvety steamed micro-foam and cocoa dust',
    selling_price: 180,
    cost_price: 36,
    gst_rate: 5,
    image_url: 'https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=500&auto=format&fit=crop&q=80',
    is_available: true,
    track_stock: true,
    stock_quantity: 150,
    min_stock_level: 20,
    has_recipe: true,
    created_at: '2026-01-10T00:00:00.000Z',
    updated_at: '2026-09-01T00:00:00.000Z',
  },
  {
    id: 'prod-sc-latte',
    cafe_id: CAFE_SUNRISE_ID,
    category_id: 'cat-sc-coffee',
    name: 'Vanilla Bean Cafe Latte',
    sku: 'SC-LAT-02',
    description: 'Smooth espresso balanced with steamed milk and premium Madagascar vanilla',
    selling_price: 210,
    cost_price: 44,
    gst_rate: 5,
    image_url: 'https://images.unsplash.com/photo-1593443320739-77f74939d0da?w=500&auto=format&fit=crop&q=80',
    is_available: true,
    track_stock: true,
    stock_quantity: 120,
    min_stock_level: 20,
    has_recipe: true,
    created_at: '2026-01-10T00:00:00.000Z',
    updated_at: '2026-09-01T00:00:00.000Z',
  },
  {
    id: 'prod-sc-paneer-sandwich',
    cafe_id: CAFE_SUNRISE_ID,
    category_id: 'cat-sc-sandwiches',
    name: 'Paneer Tikka Panini Grill',
    sku: 'SC-SND-01',
    description: 'Tandoori spiced cottage cheese, peppers, mint chutney & melted cheddar in artisan bread',
    selling_price: 220,
    cost_price: 58,
    gst_rate: 5,
    image_url: 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=500&auto=format&fit=crop&q=80',
    is_available: true,
    track_stock: true,
    stock_quantity: 45,
    min_stock_level: 10,
    has_recipe: true,
    created_at: '2026-01-10T00:00:00.000Z',
    updated_at: '2026-09-01T00:00:00.000Z',
  },
  {
    id: 'prod-sc-coldcoffee',
    cafe_id: CAFE_SUNRISE_ID,
    category_id: 'cat-sc-coffee',
    name: 'Signature Cold Coffee Deluxe',
    sku: 'SC-CLD-04',
    description: 'Thick blended creamy cold coffee served with chocolate drizzle & vanilla scoop',
    selling_price: 220,
    cost_price: 48,
    gst_rate: 5,
    image_url: 'https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?w=500&auto=format&fit=crop&q=80',
    is_available: true,
    track_stock: true,
    stock_quantity: 95,
    min_stock_level: 15,
    has_recipe: false,
    created_at: '2026-01-10T00:00:00.000Z',
    updated_at: '2026-09-01T00:00:00.000Z',
  },
  {
    id: 'prod-sc-peri-fries',
    cafe_id: CAFE_SUNRISE_ID,
    category_id: 'cat-sc-snacks',
    name: 'Peri-Peri Crinkle Fries',
    sku: 'SC-SNK-01',
    description: 'Golden crispy crinkle cut fries tossed in spicy African peri-peri with cheesy dip',
    selling_price: 150,
    cost_price: 34,
    gst_rate: 5,
    image_url: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=500&auto=format&fit=crop&q=80',
    is_available: true,
    track_stock: true,
    stock_quantity: 80,
    min_stock_level: 15,
    has_recipe: false,
    created_at: '2026-01-10T00:00:00.000Z',
    updated_at: '2026-09-01T00:00:00.000Z',
  },

  // --- Bean Theory Products (Distinct Menu) ---
  {
    id: 'prod-bt-ethiopian-pourover',
    cafe_id: CAFE_BEAN_ID,
    category_id: 'cat-bt-pour-over',
    name: 'Ethiopian Yirgacheffe V60',
    sku: 'BT-V60-01',
    description: 'Light roast single-origin with floral jasmine aromatics, bergamot, and peach acidity',
    selling_price: 290,
    cost_price: 62,
    gst_rate: 5,
    image_url: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=500&auto=format&fit=crop&q=80',
    is_available: true,
    track_stock: true,
    stock_quantity: 110,
    min_stock_level: 15,
    has_recipe: true,
    created_at: '2026-02-05T00:00:00.000Z',
    updated_at: '2026-09-01T00:00:00.000Z',
  },
  {
    id: 'prod-bt-coldbrew-tonic',
    cafe_id: CAFE_BEAN_ID,
    category_id: 'cat-bt-cold-brew',
    name: 'Cold Brew Citrus Tonic',
    sku: 'BT-CBT-02',
    description: '18-hour steeped single-origin cold brew topped with premium Indian tonic & charred orange',
    selling_price: 260,
    cost_price: 52,
    gst_rate: 5,
    image_url: 'https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?w=500&auto=format&fit=crop&q=80',
    is_available: true,
    track_stock: true,
    stock_quantity: 75,
    min_stock_level: 12,
    has_recipe: false,
    created_at: '2026-02-05T00:00:00.000Z',
    updated_at: '2026-09-01T00:00:00.000Z',
  },
  {
    id: 'prod-bt-avocado-toast',
    cafe_id: CAFE_BEAN_ID,
    category_id: 'cat-bt-brunch',
    name: 'Sourdough Avocado Tartine',
    sku: 'BT-AVO-03',
    description: 'Crushed Hass avocado, pomegranate arils, Danish feta, chili flakes & micro-herbs on sourdough',
    selling_price: 340,
    cost_price: 88,
    gst_rate: 5,
    image_url: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?w=500&auto=format&fit=crop&q=80',
    is_available: true,
    track_stock: true,
    stock_quantity: 40,
    min_stock_level: 8,
    has_recipe: true,
    created_at: '2026-02-05T00:00:00.000Z',
    updated_at: '2026-09-01T00:00:00.000Z',
  },
  {
    id: 'prod-bt-croissant',
    cafe_id: CAFE_BEAN_ID,
    category_id: 'cat-bt-bakery',
    name: 'Almond Frangipane Croissant',
    sku: 'BT-CRS-04',
    description: 'Twice-baked butter croissant filled with velvety almond cream and toasted sliced almonds',
    selling_price: 220,
    cost_price: 70,
    gst_rate: 5,
    image_url: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=500&auto=format&fit=crop&q=80',
    is_available: true,
    track_stock: true,
    stock_quantity: 30,
    min_stock_level: 10,
    has_recipe: false,
    created_at: '2026-02-05T00:00:00.000Z',
    updated_at: '2026-09-01T00:00:00.000Z',
  },
  {
    id: 'prod-bt-matcha-latte',
    cafe_id: CAFE_BEAN_ID,
    category_id: 'cat-bt-pour-over',
    name: 'Ceremonial Uji Matcha Latte',
    sku: 'BT-MAT-05',
    description: 'First-harvest Kyoto ceremonial matcha whisked with warm almond milk',
    selling_price: 280,
    cost_price: 68,
    gst_rate: 5,
    image_url: 'https://images.unsplash.com/photo-1536256263959-770b48d82b0a?w=500&auto=format&fit=crop&q=80',
    is_available: true,
    track_stock: true,
    stock_quantity: 60,
    min_stock_level: 10,
    has_recipe: false,
    created_at: '2026-02-05T00:00:00.000Z',
    updated_at: '2026-09-01T00:00:00.000Z',
  },
];

// ==========================================================
// SEED RECIPES (TENANT-SCOPED)
// ==========================================================
export const initialRecipes: Recipe[] = [
  // Sunrise Cafe Recipe
  {
    id: 'rec-sc-cap-01',
    cafe_id: CAFE_SUNRISE_ID,
    product_id: 'prod-sc-cappuccino',
    product_name: 'Classic Cappuccino',
    instructions: '1. Grind 18g beans. 2. Pull 36g espresso. 3. Steam 150ml whole milk to 65C. 4. Pour with microfoam art.',
    prep_time_mins: 3,
    calculated_cogs: 36.35,
    items: [
      { inventory_id: 'inv-sc-beans', inventory_name: 'Arabica Espresso Roast Beans', quantity_required: 0.018, unit: 'kg', cost_contribution: 21.60 },
      { inventory_id: 'inv-sc-milk', inventory_name: 'Whole Cream Dairy Milk', quantity_required: 0.150, unit: 'L', cost_contribution: 9.75 },
      { inventory_id: 'inv-sc-cups', inventory_name: 'Eco 80mm Takeaway Hot Cups', quantity_required: 1, unit: 'pcs', cost_contribution: 4.50 },
      { inventory_id: 'inv-sc-sugar', inventory_name: 'Organic Brown Sugar', quantity_required: 0.006, unit: 'kg', cost_contribution: 0.45 },
    ],
  },
  {
    id: 'rec-sc-snd-01',
    cafe_id: CAFE_SUNRISE_ID,
    product_id: 'prod-sc-paneer-sandwich',
    product_name: 'Paneer Tikka Panini Grill',
    instructions: '1. Slice sourdough loaf. 2. Layer 80g paneer with mint chutney. 3. Grill for 4 mins.',
    prep_time_mins: 6,
    calculated_cogs: 58.60,
    items: [
      { inventory_id: 'inv-sc-bread', inventory_name: 'Artisan Sourdough Loaves', quantity_required: 0.20, unit: 'pcs', cost_contribution: 16.00 },
      { inventory_id: 'inv-sc-paneer', inventory_name: 'Fresh Malai Paneer', quantity_required: 0.080, unit: 'kg', cost_contribution: 30.40 },
    ],
  },

  // Bean Theory Recipe (Isolated)
  {
    id: 'rec-bt-v60-01',
    cafe_id: CAFE_BEAN_ID,
    product_id: 'prod-bt-ethiopian-pourover',
    product_name: 'Ethiopian Yirgacheffe V60',
    instructions: '1. Dose 15g medium-coarse beans. 2. Bloom with 45g water for 45s. 3. Three pulse pours to 250g final weight.',
    prep_time_mins: 4,
    calculated_cogs: 62.00,
    items: [
      { inventory_id: 'inv-bt-yirgacheffe', inventory_name: 'Ethiopian Yirgacheffe Washed Beans', quantity_required: 0.015, unit: 'kg', cost_contribution: 36.00 },
    ],
  },
  {
    id: 'rec-bt-avo-03',
    cafe_id: CAFE_BEAN_ID,
    product_id: 'prod-bt-avocado-toast',
    product_name: 'Sourdough Avocado Tartine',
    instructions: '1. Toast sourdough slice. 2. Mash 1 whole Hass avocado with sea salt & lemon. 3. Top with feta and chili flakes.',
    prep_time_mins: 5,
    calculated_cogs: 88.00,
    items: [
      { inventory_id: 'inv-bt-avocados', inventory_name: 'Hass Avocados Grade A', quantity_required: 1, unit: 'pcs', cost_contribution: 110.00 },
    ],
  },
];

// ==========================================================
// SEED CUSTOMERS (TENANT-SCOPED)
// ==========================================================
export const initialCustomers: Customer[] = [
  // Sunrise Cafe Customers (Bengaluru)
  { id: 'cust-sc-001', cafe_id: CAFE_SUNRISE_ID, name: 'Rohan Deshmukh', phone: '9820011223', email: 'rohan.d@gmail.com', loyalty_points: 145, total_orders: 14, total_spent: 4250, last_visit: '2026-09-07T14:20:00.000Z', notes: 'Prefers oat milk in cappuccino', created_at: '2026-02-10T00:00:00.000Z' },
  { id: 'cust-sc-002', cafe_id: CAFE_SUNRISE_ID, name: 'Ananya Iyer', phone: '9820044556', email: 'ananya.iyer@outlook.com', loyalty_points: 210, total_orders: 18, total_spent: 6890, last_visit: '2026-09-07T16:45:00.000Z', notes: 'Regular work-from-cafe customer', created_at: '2026-01-20T00:00:00.000Z' },
  { id: 'cust-sc-003', cafe_id: CAFE_SUNRISE_ID, name: 'Vikram Mehta', phone: '9820077889', email: 'vikram.mehta@techcorp.in', loyalty_points: 75, total_orders: 7, total_spent: 2450, last_visit: '2026-09-06T19:10:00.000Z', notes: 'Enjoys iced drinks', created_at: '2026-03-05T00:00:00.000Z' },

  // Bean Theory Customers (Mumbai Bandra - Completely Isolated)
  { id: 'cust-bt-001', cafe_id: CAFE_BEAN_ID, name: 'Tara Sutaria', phone: '9820199887', email: 'tara.s@filmcity.in', loyalty_points: 340, total_orders: 22, total_spent: 9600, last_visit: '2026-09-07T11:30:00.000Z', notes: 'V60 Pour Over connoisseur', created_at: '2026-02-15T00:00:00.000Z' },
  { id: 'cust-bt-002', cafe_id: CAFE_BEAN_ID, name: 'Armaan Malik', phone: '9820155443', email: 'armaan.m@soundhub.com', loyalty_points: 180, total_orders: 12, total_spent: 5400, last_visit: '2026-09-07T15:10:00.000Z', notes: 'Loves Cold Brew Tonic & Tartine', created_at: '2026-02-20T00:00:00.000Z' },
];

// ==========================================================
// SEED SHIFTS (TENANT-SCOPED)
// ==========================================================
export const initialShifts: Shift[] = [
  // Sunrise Cafe Shift
  {
    id: 'shift-sc-live',
    cafe_id: CAFE_SUNRISE_ID,
    user_id: 'usr-sunrise-cashier',
    user_name: 'Rahul Sen',
    start_time: new Date(Date.now() - 14400000).toISOString(),
    opening_cash: 5000,
    cash_sales: 8450,
    upi_sales: 14200,
    card_sales: 5800,
    total_sales: 28450,
    total_orders: 42,
    expected_cash: 13450,
    status: 'OPEN',
    notes: 'Afternoon prime shift active',
  },
  // Bean Theory Shift
  {
    id: 'shift-bt-live',
    cafe_id: CAFE_BEAN_ID,
    user_id: 'usr-bean-cashier',
    user_name: 'Kabir Merchant',
    start_time: new Date(Date.now() - 10800000).toISOString(),
    opening_cash: 7000,
    cash_sales: 4200,
    upi_sales: 18600,
    card_sales: 11400,
    total_sales: 34200,
    total_orders: 38,
    expected_cash: 11200,
    status: 'OPEN',
    notes: 'Bandra specialty coffee session',
  },
];

// ==========================================================
// SEED NOTIFICATIONS & AUDIT (TENANT-SCOPED)
// ==========================================================
export const initialNotifications: Notification[] = [
  {
    id: 'notif-sc-01',
    cafe_id: CAFE_SUNRISE_ID,
    type: 'LOW_STOCK',
    title: 'Low Stock Alert: Whole Cream Dairy Milk',
    message: 'Milk stock is at 8.5 L (Threshold: 12.0 L). AI forecasts exhaustion in ~1.8 days.',
    severity: 'WARNING',
    link: '/inventory',
    is_read: false,
    created_at: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: 'notif-bt-01',
    cafe_id: CAFE_BEAN_ID,
    type: 'AI_INSIGHT',
    title: 'Bean Theory Single-Origin Spike',
    message: 'Ethiopian V60 pour over velocity is up +24% this morning.',
    severity: 'INFO',
    link: '/ai-insights',
    is_read: false,
    created_at: new Date(Date.now() - 1800000).toISOString(),
  },
];

export const initialAuditLogs: AuditLog[] = [
  { id: 'log-sc-01', cafe_id: CAFE_SUNRISE_ID, user_name: 'Aarav Sharma', role: 'OWNER', action: 'System Initialization', details: 'Configured Sunrise Cafe tenant environment', created_at: new Date(Date.now() - 86400000).toISOString() },
  { id: 'log-bt-01', cafe_id: CAFE_BEAN_ID, user_name: 'Devika Singhania', role: 'OWNER', action: 'System Initialization', details: 'Configured Bean Theory tenant environment', created_at: new Date(Date.now() - 86400000).toISOString() },
];
