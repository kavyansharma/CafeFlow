import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcryptjs';

const salt = bcrypt.genSaltSync(10);
export const hashPassword = (password: string) => bcrypt.hashSync(password, salt);

export interface User {
  id: string;
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
  name: string;
  slug: string;
  description: string;
  icon: string;
  sort_order: number;
  is_active: boolean;
}

export interface Product {
  id: string;
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
  name: string;
  sku: string;
  category: string;
  current_quantity: number;
  unit: string; // 'kg', 'g', 'L', 'ml', 'pcs', 'pack'
  min_quantity: number;
  cost_per_unit: number;
  supplier: string;
  last_updated: string;
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
  loyalty_spend_per_point: number; // e.g. ₹100
  loyalty_point_value: number; // e.g. ₹1.00
  max_discount_percent: number;
  enable_ai_insights: boolean;
}

export interface AuditLog {
  id: string;
  user_name: string;
  role: string;
  action: string;
  details: string;
  created_at: string;
}

// Initial Data Seed Generation
export const initialUsers: User[] = [
  {
    id: 'usr-owner-001',
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
    name: 'Rahul Sen',
    email: 'cashier@cafeflow.com',
    phone: '+91 98765 43212',
    password_hash: hashPassword('cashier123'),
    role: 'CASHIER',
    is_active: true,
    created_at: '2026-02-01T10:00:00.000Z',
  },
];

export const initialCategories: Category[] = [
  { id: 'cat-coffee', name: 'Coffee', slug: 'coffee', description: 'Artisan Espresso, Brews & Iced Coffees', icon: 'Coffee', sort_order: 1, is_active: true },
  { id: 'cat-tea', name: 'Tea', slug: 'tea', description: 'Handcrafted Chais & Herbal Infusions', icon: 'CupSoda', sort_order: 2, is_active: true },
  { id: 'cat-beverages', name: 'Beverages', slug: 'beverages', description: 'Smoothies, Coolers & Shakes', icon: 'GlassWater', sort_order: 3, is_active: true },
  { id: 'cat-snacks', name: 'Snacks', slug: 'snacks', description: 'Crispy finger foods & Fries', icon: 'Utensils', sort_order: 4, is_active: true },
  { id: 'cat-sandwiches', name: 'Sandwiches', slug: 'sandwiches', description: 'Grilled Gourmet Paninis & Sourdough', icon: 'Sandwich', sort_order: 5, is_active: true },
  { id: 'cat-desserts', name: 'Desserts', slug: 'desserts', description: 'Fresh Bakes, Cheesecakes & Brownies', icon: 'Cake', sort_order: 6, is_active: true },
  { id: 'cat-meals', name: 'Meals', slug: 'meals', description: 'Pastas, Bowls & Quick Bites', icon: 'Soup', sort_order: 7, is_active: true },
  { id: 'cat-addons', name: 'Add-ons', slug: 'add-ons', description: 'Syrups, Extra Shots & Plant Milks', icon: 'PlusCircle', sort_order: 8, is_active: true },
];

export const initialInventory: InventoryItem[] = [
  { id: 'inv-beans', name: 'Arabica Espresso Roast Beans', sku: 'RAW-BEAN-01', category: 'Coffee', current_quantity: 4.8, unit: 'kg', min_quantity: 2.0, cost_per_unit: 1200, supplier: 'Blue Mountain Estate Roasters', last_updated: '2026-09-07T10:00:00.000Z' },
  { id: 'inv-milk', name: 'Whole Cream Dairy Milk', sku: 'RAW-MILK-01', category: 'Dairy', current_quantity: 8.5, unit: 'L', min_quantity: 12.0, cost_per_unit: 65, supplier: 'Amul Fresh Hub', last_updated: '2026-09-07T18:30:00.000Z' },
  { id: 'inv-oatmilk', name: 'Oatly Barista Edition Oat Milk', sku: 'RAW-OAT-01', category: 'Dairy Alternatives', current_quantity: 6.0, unit: 'L', min_quantity: 3.0, cost_per_unit: 290, supplier: 'Green Planet Foods', last_updated: '2026-09-06T14:00:00.000Z' },
  { id: 'inv-sugar', name: 'Organic Brown Sugar', sku: 'RAW-SUG-01', category: 'Dry Goods', current_quantity: 7.2, unit: 'kg', min_quantity: 3.0, cost_per_unit: 75, supplier: 'Nature Basket Organics', last_updated: '2026-09-05T09:00:00.000Z' },
  { id: 'inv-caramel', name: 'Monin Salted Caramel Syrup', sku: 'RAW-SYR-01', category: 'Syrups', current_quantity: 1400, unit: 'ml', min_quantity: 500, cost_per_unit: 1.2, supplier: 'Monin India Direct', last_updated: '2026-09-06T11:00:00.000Z' },
  { id: 'inv-vanilla', name: 'Monin Madagascar Vanilla Syrup', sku: 'RAW-SYR-02', category: 'Syrups', current_quantity: 1100, unit: 'ml', min_quantity: 500, cost_per_unit: 1.1, supplier: 'Monin India Direct', last_updated: '2026-09-06T11:00:00.000Z' },
  { id: 'inv-tea-leaves', name: 'Assam Royal CTC Tea Leaves', sku: 'RAW-TEA-01', category: 'Tea', current_quantity: 3.5, unit: 'kg', min_quantity: 1.5, cost_per_unit: 450, supplier: 'Assam Tea Exporters', last_updated: '2026-09-05T12:00:00.000Z' },
  { id: 'inv-chai-masala', name: 'Signature Secret Chai Masala', sku: 'RAW-SPICE-01', category: 'Spices', current_quantity: 850, unit: 'g', min_quantity: 300, cost_per_unit: 1.8, supplier: 'Heritage Spices', last_updated: '2026-09-04T15:00:00.000Z' },
  { id: 'inv-bread', name: 'Artisan Sourdough Loaves', sku: 'RAW-BRD-01', category: 'Bakery', current_quantity: 14, unit: 'pcs', min_quantity: 6, cost_per_unit: 80, supplier: 'Craft Bakers Guild', last_updated: '2026-09-07T07:00:00.000Z' },
  { id: 'inv-paneer', name: 'Fresh Malai Paneer', sku: 'RAW-PAN-01', category: 'Dairy', current_quantity: 3.2, unit: 'kg', min_quantity: 1.5, cost_per_unit: 380, supplier: 'Amul Fresh Hub', last_updated: '2026-09-07T08:00:00.000Z' },
  { id: 'inv-cheese', name: 'Aged Cheddar & Mozzarella Blend', sku: 'RAW-CHS-01', category: 'Dairy', current_quantity: 1.8, unit: 'kg', min_quantity: 2.5, cost_per_unit: 620, supplier: 'Dlecta Fine Foods', last_updated: '2026-09-07T08:00:00.000Z' },
  { id: 'inv-fries', name: 'McCain Premium Coated Fries', sku: 'RAW-SNK-01', category: 'Frozen', current_quantity: 6.5, unit: 'kg', min_quantity: 4.0, cost_per_unit: 190, supplier: 'McCain Commercial', last_updated: '2026-09-05T16:00:00.000Z' },
  { id: 'inv-pasta', name: 'Barilla Penne Rigate', sku: 'RAW-PST-01', category: 'Dry Goods', current_quantity: 5.0, unit: 'kg', min_quantity: 2.0, cost_per_unit: 260, supplier: 'Universal Imports', last_updated: '2026-09-04T10:00:00.000Z' },
  { id: 'inv-cups', name: 'Eco 80mm Takeaway Hot Cups', sku: 'PKG-CUP-01', category: 'Packaging', current_quantity: 350, unit: 'pcs', min_quantity: 100, cost_per_unit: 4.5, supplier: 'EcoPack India', last_updated: '2026-09-06T17:00:00.000Z' },
];

export const initialProducts: Product[] = [
  {
    id: 'prod-cappuccino',
    category_id: 'cat-coffee',
    name: 'Classic Cappuccino',
    sku: 'CF-CAP-01',
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
    id: 'prod-latte',
    category_id: 'cat-coffee',
    name: 'Vanilla Bean Cafe Latte',
    sku: 'CF-LAT-02',
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
    id: 'prod-espresso',
    category_id: 'cat-coffee',
    name: 'Doppio Espresso',
    sku: 'CF-ESP-03',
    description: 'Intense double extraction of 100% single-origin Arabica beans',
    selling_price: 130,
    cost_price: 22,
    gst_rate: 5,
    image_url: 'https://images.unsplash.com/photo-1510591509098-f4fdc6d0ff04?w=500&auto=format&fit=crop&q=80',
    is_available: true,
    track_stock: true,
    stock_quantity: 200,
    min_stock_level: 25,
    has_recipe: true,
    created_at: '2026-01-10T00:00:00.000Z',
    updated_at: '2026-09-01T00:00:00.000Z',
  },
  {
    id: 'prod-coldcoffee',
    category_id: 'cat-coffee',
    name: 'Signature Cold Coffee Deluxe',
    sku: 'CF-CLD-04',
    description: 'Thick blended creamy cold coffee served with chocolate drizzle & vanilla scoop',
    selling_price: 220,
    cost_price: 48,
    gst_rate: 5,
    image_url: 'https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?w=500&auto=format&fit=crop&q=80',
    is_available: true,
    track_stock: true,
    stock_quantity: 95,
    min_stock_level: 15,
    has_recipe: true,
    created_at: '2026-01-10T00:00:00.000Z',
    updated_at: '2026-09-01T00:00:00.000Z',
  },
  {
    id: 'prod-caramel-macchiato',
    category_id: 'cat-coffee',
    name: 'Iced Caramel Macchiato',
    sku: 'CF-ICM-05',
    description: 'Layered espresso, cold fresh milk, vanilla syrup, and golden butterscotch crosshatch',
    selling_price: 240,
    cost_price: 52,
    gst_rate: 5,
    image_url: 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=500&auto=format&fit=crop&q=80',
    is_available: true,
    track_stock: true,
    stock_quantity: 80,
    min_stock_level: 15,
    has_recipe: true,
    created_at: '2026-01-12T00:00:00.000Z',
    updated_at: '2026-09-01T00:00:00.000Z',
  },
  {
    id: 'prod-masala-tea',
    category_id: 'cat-tea',
    name: 'Royal Masala Chai Kulhad',
    sku: 'CF-TEA-01',
    description: 'Brewed Assam CTC infused with ginger, cardamom, clove, and fresh milk',
    selling_price: 90,
    cost_price: 18,
    gst_rate: 5,
    image_url: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=500&auto=format&fit=crop&q=80',
    is_available: true,
    track_stock: true,
    stock_quantity: 250,
    min_stock_level: 30,
    has_recipe: true,
    created_at: '2026-01-10T00:00:00.000Z',
    updated_at: '2026-09-01T00:00:00.000Z',
  },
  {
    id: 'prod-matcha',
    category_id: 'cat-tea',
    name: 'Japanese Uji Matcha Latte',
    sku: 'CF-MAT-02',
    description: 'Ceremonial grade pure matcha green tea whisked with silky warm milk',
    selling_price: 260,
    cost_price: 65,
    gst_rate: 5,
    image_url: 'https://images.unsplash.com/photo-1536256263959-770b48d82b0a?w=500&auto=format&fit=crop&q=80',
    is_available: true,
    track_stock: true,
    stock_quantity: 60,
    min_stock_level: 10,
    has_recipe: false,
    created_at: '2026-01-15T00:00:00.000Z',
    updated_at: '2026-09-01T00:00:00.000Z',
  },
  {
    id: 'prod-berry-cooler',
    category_id: 'cat-beverages',
    name: 'Wild Berry Mint Fizz',
    sku: 'CF-BEV-01',
    description: 'Sparkling cooler with muddled berries, mint leaves, and lime soda',
    selling_price: 170,
    cost_price: 32,
    gst_rate: 5,
    image_url: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=500&auto=format&fit=crop&q=80',
    is_available: true,
    track_stock: true,
    stock_quantity: 90,
    min_stock_level: 15,
    has_recipe: false,
    created_at: '2026-01-15T00:00:00.000Z',
    updated_at: '2026-09-01T00:00:00.000Z',
  },
  {
    id: 'prod-paneer-sandwich',
    category_id: 'cat-sandwiches',
    name: 'Paneer Tikka Panini Grill',
    sku: 'CF-SND-01',
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
    id: 'prod-cheese-toast',
    category_id: 'cat-sandwiches',
    name: 'Three Cheese Sourdough Melt',
    sku: 'CF-SND-02',
    description: 'Cheddar, Mozzarella, and herb cream cheese toasted on artisanal sourdough',
    selling_price: 240,
    cost_price: 68,
    gst_rate: 5,
    image_url: 'https://images.unsplash.com/photo-1550547660-d9450f859349?w=500&auto=format&fit=crop&q=80',
    is_available: true,
    track_stock: true,
    stock_quantity: 35,
    min_stock_level: 10,
    has_recipe: true,
    created_at: '2026-01-10T00:00:00.000Z',
    updated_at: '2026-09-01T00:00:00.000Z',
  },
  {
    id: 'prod-peri-fries',
    category_id: 'cat-snacks',
    name: 'Peri-Peri Crinkle Fries',
    sku: 'CF-SNK-01',
    description: 'Golden crispy crinkle cut fries tossed in spicy African peri-peri with cheesy dip',
    selling_price: 150,
    cost_price: 34,
    gst_rate: 5,
    image_url: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=500&auto=format&fit=crop&q=80',
    is_available: true,
    track_stock: true,
    stock_quantity: 80,
    min_stock_level: 15,
    has_recipe: true,
    created_at: '2026-01-10T00:00:00.000Z',
    updated_at: '2026-09-01T00:00:00.000Z',
  },
  {
    id: 'prod-pasta-arrabbiata',
    category_id: 'cat-meals',
    name: 'Penne Arrabbiata Rustic Bowl',
    sku: 'CF-MEL-01',
    description: 'Al dente penne pasta in rich San Marzano spicy tomato garlic sauce with fresh basil',
    selling_price: 280,
    cost_price: 72,
    gst_rate: 5,
    image_url: 'https://images.unsplash.com/photo-1621996346565-e3d5d6281014?w=500&auto=format&fit=crop&q=80',
    is_available: true,
    track_stock: true,
    stock_quantity: 40,
    min_stock_level: 8,
    has_recipe: true,
    created_at: '2026-01-10T00:00:00.000Z',
    updated_at: '2026-09-01T00:00:00.000Z',
  },
  {
    id: 'prod-brownie',
    category_id: 'cat-desserts',
    name: 'Warm Fudge Walnut Brownie',
    sku: 'CF-DES-01',
    description: 'Gooey 70% dark Belgian chocolate brownie loaded with toasted California walnuts',
    selling_price: 160,
    cost_price: 40,
    gst_rate: 5,
    image_url: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=500&auto=format&fit=crop&q=80',
    is_available: true,
    track_stock: true,
    stock_quantity: 50,
    min_stock_level: 10,
    has_recipe: false,
    created_at: '2026-01-10T00:00:00.000Z',
    updated_at: '2026-09-01T00:00:00.000Z',
  },
  {
    id: 'prod-cheesecake',
    category_id: 'cat-desserts',
    name: 'New York Blueberry Cheesecake',
    sku: 'CF-DES-02',
    description: 'Creamy baked Philadelphia style cheesecake topped with wild blueberry compote',
    selling_price: 240,
    cost_price: 68,
    gst_rate: 5,
    image_url: 'https://images.unsplash.com/photo-1533134242443-d4fd215305ad?w=500&auto=format&fit=crop&q=80',
    is_available: true,
    track_stock: true,
    stock_quantity: 30,
    min_stock_level: 8,
    has_recipe: false,
    created_at: '2026-01-10T00:00:00.000Z',
    updated_at: '2026-09-01T00:00:00.000Z',
  },
  {
    id: 'prod-extra-oatmilk',
    category_id: 'cat-addons',
    name: 'Upgrade to Oat Milk',
    sku: 'CF-ADD-01',
    description: 'Substitute dairy with creamy Barista Oat Milk',
    selling_price: 45,
    cost_price: 22,
    gst_rate: 5,
    image_url: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=500&auto=format&fit=crop&q=80',
    is_available: true,
    track_stock: false,
    stock_quantity: 999,
    min_stock_level: 0,
    has_recipe: false,
    created_at: '2026-01-10T00:00:00.000Z',
    updated_at: '2026-09-01T00:00:00.000Z',
  },
  {
    id: 'prod-extra-shot',
    category_id: 'cat-addons',
    name: 'Extra Espresso Shot',
    sku: 'CF-ADD-02',
    description: 'Add an extra rich shot of Arabica espresso',
    selling_price: 40,
    cost_price: 11,
    gst_rate: 5,
    image_url: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=500&auto=format&fit=crop&q=80',
    is_available: true,
    track_stock: false,
    stock_quantity: 999,
    min_stock_level: 0,
    has_recipe: false,
    created_at: '2026-01-10T00:00:00.000Z',
    updated_at: '2026-09-01T00:00:00.000Z',
  },
];

export const initialRecipes: Recipe[] = [
  {
    id: 'rec-cap-01',
    product_id: 'prod-cappuccino',
    product_name: 'Classic Cappuccino',
    instructions: '1. Grind 18g beans. 2. Pull 36g espresso. 3. Steam 150ml whole milk to 65C. 4. Pour with microfoam art.',
    prep_time_mins: 3,
    calculated_cogs: 36.35,
    items: [
      { inventory_id: 'inv-beans', inventory_name: 'Arabica Espresso Roast Beans', quantity_required: 0.018, unit: 'kg', cost_contribution: 21.60 },
      { inventory_id: 'inv-milk', inventory_name: 'Whole Cream Dairy Milk', quantity_required: 0.150, unit: 'L', cost_contribution: 9.75 },
      { inventory_id: 'inv-cups', inventory_name: 'Eco 80mm Takeaway Hot Cups', quantity_required: 1, unit: 'pcs', cost_contribution: 4.50 },
      { inventory_id: 'inv-sugar', inventory_name: 'Organic Brown Sugar', quantity_required: 0.006, unit: 'kg', cost_contribution: 0.45 },
    ],
  },
  {
    id: 'rec-lat-02',
    product_id: 'prod-latte',
    product_name: 'Vanilla Bean Cafe Latte',
    instructions: '1. Add 20ml vanilla syrup in cup. 2. Pull double espresso shot. 3. Pour 200ml velvety steamed milk.',
    prep_time_mins: 3,
    calculated_cogs: 44.10,
    items: [
      { inventory_id: 'inv-beans', inventory_name: 'Arabica Espresso Roast Beans', quantity_required: 0.018, unit: 'kg', cost_contribution: 21.60 },
      { inventory_id: 'inv-milk', inventory_name: 'Whole Cream Dairy Milk', quantity_required: 0.200, unit: 'L', cost_contribution: 13.00 },
      { inventory_id: 'inv-vanilla', inventory_name: 'Monin Madagascar Vanilla Syrup', quantity_required: 20, unit: 'ml', cost_contribution: 22.00 },
      { inventory_id: 'inv-cups', inventory_name: 'Eco 80mm Takeaway Hot Cups', quantity_required: 1, unit: 'pcs', cost_contribution: 4.50 },
    ],
  },
  {
    id: 'rec-tea-01',
    product_id: 'prod-masala-tea',
    product_name: 'Royal Masala Chai Kulhad',
    instructions: '1. Boil 60ml water with 5g tea & 2g chai masala. 2. Add 120ml whole milk & 6g sugar. 3. Double strain into hot cup.',
    prep_time_mins: 4,
    calculated_cogs: 18.20,
    items: [
      { inventory_id: 'inv-tea-leaves', inventory_name: 'Assam Royal CTC Tea Leaves', quantity_required: 0.005, unit: 'kg', cost_contribution: 2.25 },
      { inventory_id: 'inv-chai-masala', inventory_name: 'Signature Secret Chai Masala', quantity_required: 2, unit: 'g', cost_contribution: 3.60 },
      { inventory_id: 'inv-milk', inventory_name: 'Whole Cream Dairy Milk', quantity_required: 0.120, unit: 'L', cost_contribution: 7.80 },
      { inventory_id: 'inv-sugar', inventory_name: 'Organic Brown Sugar', quantity_required: 0.006, unit: 'kg', cost_contribution: 0.45 },
      { inventory_id: 'inv-cups', inventory_name: 'Eco 80mm Takeaway Hot Cups', quantity_required: 1, unit: 'pcs', cost_contribution: 4.50 },
    ],
  },
  {
    id: 'rec-snd-01',
    product_id: 'prod-paneer-sandwich',
    product_name: 'Paneer Tikka Panini Grill',
    instructions: '1. Slice sourdough loaf. 2. Layer 80g paneer with mint chutney & 30g cheese blend. 3. Grill for 4 mins until crispy golden.',
    prep_time_mins: 6,
    calculated_cogs: 58.60,
    items: [
      { inventory_id: 'inv-bread', inventory_name: 'Artisan Sourdough Loaves', quantity_required: 0.20, unit: 'pcs', cost_contribution: 16.00 },
      { inventory_id: 'inv-paneer', inventory_name: 'Fresh Malai Paneer', quantity_required: 0.080, unit: 'kg', cost_contribution: 30.40 },
      { inventory_id: 'inv-cheese', inventory_name: 'Aged Cheddar & Mozzarella Blend', quantity_required: 0.030, unit: 'kg', cost_contribution: 18.60 },
    ],
  },
];

export const initialCustomers: Customer[] = [
  { id: 'cust-001', name: 'Rohan Deshmukh', phone: '9820011223', email: 'rohan.d@gmail.com', loyalty_points: 145, total_orders: 14, total_spent: 4250, last_visit: '2026-09-07T14:20:00.000Z', notes: 'Prefers oat milk in cappuccino', created_at: '2026-02-10T00:00:00.000Z' },
  { id: 'cust-002', name: 'Ananya Iyer', phone: '9820044556', email: 'ananya.iyer@outlook.com', loyalty_points: 210, total_orders: 18, total_spent: 6890, last_visit: '2026-09-07T16:45:00.000Z', notes: 'Regular work-from-cafe customer', created_at: '2026-01-20T00:00:00.000Z' },
  { id: 'cust-003', name: 'Vikram Mehta', phone: '9820077889', email: 'vikram.mehta@techcorp.in', loyalty_points: 75, total_orders: 7, total_spent: 2450, last_visit: '2026-09-06T19:10:00.000Z', notes: 'Enjoys iced caramel macchiato', created_at: '2026-03-05T00:00:00.000Z' },
  { id: 'cust-004', name: 'Sneha Kapoor', phone: '9820099001', email: 'sneha.k@gmail.com', loyalty_points: 320, total_orders: 25, total_spent: 9800, last_visit: '2026-09-07T12:30:00.000Z', notes: 'VIP Gold tier customer', created_at: '2026-01-05T00:00:00.000Z' },
  { id: 'cust-005', name: 'Arjun Nair', phone: '9820033112', email: 'arjun.nair@live.com', loyalty_points: 40, total_orders: 4, total_spent: 1280, last_visit: '2026-09-05T17:15:00.000Z', notes: '', created_at: '2026-04-12T00:00:00.000Z' },
];

export const initialSettings: CafeSettings = {
  cafe_name: 'CAFEFLOW Coffee & Roastery',
  tagline: 'Smart Billing. Smarter Cafe.',
  address: 'Shop 4-5, Ground Floor, Indiranagar 100ft Road, Bengaluru, Karnataka 560038',
  phone: '+91 80 4123 9876',
  email: 'hello@cafeflow.com',
  gstin: '29ABCDE1234F1Z5',
  currency: '₹',
  invoice_prefix: 'CF-2026-',
  default_gst_rate: 5,
  loyalty_spend_per_point: 100,
  loyalty_point_value: 1.0,
  max_discount_percent: 30,
  enable_ai_insights: true,
};

export const initialNotifications: Notification[] = [
  {
    id: 'notif-001',
    type: 'LOW_STOCK',
    title: 'Low Stock Alert: Whole Cream Dairy Milk',
    message: 'Milk stock is at 8.5 L (Threshold: 12.0 L). AI forecasts exhaustion in ~1.8 days.',
    severity: 'WARNING',
    link: '/inventory',
    is_read: false,
    created_at: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: 'notif-002',
    type: 'AI_INSIGHT',
    title: 'AI Revenue Spike Forecast',
    message: 'Tomorrow evening is projected to generate ₹32,500 (+14% vs avg). Recommended: prep extra cold brew batches.',
    severity: 'INFO',
    link: '/ai-insights',
    is_read: false,
    created_at: new Date(Date.now() - 7200000).toISOString(),
  },
  {
    id: 'notif-003',
    type: 'PAYMENT',
    title: 'Shift Reconciliation Pending',
    message: 'Morning shift closing balance matched expected cash within ₹50.',
    severity: 'SUCCESS',
    link: '/shifts',
    is_read: true,
    created_at: new Date(Date.now() - 18000000).toISOString(),
  },
];

export const initialShifts: Shift[] = [
  {
    id: 'shift-live-current',
    user_id: 'usr-cashier-003',
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
  {
    id: 'shift-yesterday-close',
    user_id: 'usr-cashier-003',
    user_name: 'Rahul Sen',
    start_time: new Date(Date.now() - 86400000 - 28800000).toISOString(),
    end_time: new Date(Date.now() - 86400000).toISOString(),
    opening_cash: 5000,
    cash_sales: 11200,
    upi_sales: 18900,
    card_sales: 6400,
    total_sales: 36500,
    total_orders: 58,
    expected_cash: 16200,
    actual_cash: 16200,
    cash_difference: 0,
    status: 'CLOSED',
    notes: 'Shift balanced cleanly. No cash variances.',
  }
];

export const initialAuditLogs: AuditLog[] = [
  { id: 'log-01', user_name: 'Aarav Sharma', role: 'OWNER', action: 'System Initialization', details: 'Database configured with seed menu and inventory catalog', created_at: new Date(Date.now() - 86400000).toISOString() },
  { id: 'log-02', user_name: 'Rahul Sen', role: 'CASHIER', action: 'Shift Opened', details: 'Registered opening cash float ₹5,000 for register #1', created_at: new Date(Date.now() - 14400000).toISOString() },
  { id: 'log-03', user_name: 'Rahul Sen', role: 'CASHIER', action: 'Invoice Generated', details: 'Created Invoice #CF-2026-1042 for Sneha Kapoor (₹720 via UPI)', created_at: new Date(Date.now() - 7200000).toISOString() },
];
