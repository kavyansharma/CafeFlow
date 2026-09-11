-- ==========================================================
-- CAFEFLOW — AI-Powered Multi-Tenant Cafe POS & Billing System
-- Normalized PostgreSQL Database Schema with Tenant Isolation
-- ==========================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. CAFES (PRIMARY TENANT ENTITY)
CREATE TABLE IF NOT EXISTS cafes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(150) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    logo_url TEXT,
    address TEXT NOT NULL,
    phone VARCHAR(20) NOT NULL,
    email VARCHAR(255) NOT NULL,
    gstin VARCHAR(50),
    currency VARCHAR(10) NOT NULL DEFAULT '₹',
    timezone VARCHAR(50) NOT NULL DEFAULT 'Asia/Kolkata',
    invoice_prefix VARCHAR(20) NOT NULL DEFAULT 'CF-',
    default_gst_rate NUMERIC(5, 2) NOT NULL DEFAULT 5.00,
    loyalty_spend_per_point NUMERIC(10, 2) NOT NULL DEFAULT 100.00,
    loyalty_point_value NUMERIC(10, 2) NOT NULL DEFAULT 1.00,
    max_discount_percent NUMERIC(5, 2) NOT NULL DEFAULT 30.00,
    enable_ai_insights BOOLEAN NOT NULL DEFAULT TRUE,
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE', -- 'ACTIVE', 'SUSPENDED', 'ONBOARDING'
    business_type VARCHAR(50) NOT NULL DEFAULT 'restaurant', -- 'restaurant', 'qsr', 'cloud_kitchen', 'roastery', 'bakery', 'bistro', 'tea'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Idempotent Migration: Add business_type column if table already exists in production
ALTER TABLE cafes ADD COLUMN IF NOT EXISTS business_type VARCHAR(50) DEFAULT 'restaurant';

-- 2. ROLES & USERS (TENANT-SCOPED)
CREATE TYPE user_role AS ENUM ('OWNER', 'MANAGER', 'CASHIER');

CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    cafe_id UUID NOT NULL REFERENCES cafes(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    password_hash VARCHAR(255) NOT NULL,
    role user_role NOT NULL DEFAULT 'CASHIER',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_cafe_user_email UNIQUE (cafe_id, email)
);

-- 3. CATEGORIES (TENANT-SCOPED)
CREATE TABLE IF NOT EXISTS categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    cafe_id UUID NOT NULL REFERENCES cafes(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) NOT NULL,
    description TEXT,
    icon VARCHAR(50),
    sort_order INT DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_cafe_category_slug UNIQUE (cafe_id, slug)
);

-- 4. PRODUCTS (TENANT-SCOPED)
CREATE TABLE IF NOT EXISTS products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    cafe_id UUID NOT NULL REFERENCES cafes(id) ON DELETE CASCADE,
    category_id UUID NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
    name VARCHAR(150) NOT NULL,
    sku VARCHAR(50) NOT NULL,
    description TEXT,
    selling_price NUMERIC(10, 2) NOT NULL,
    cost_price NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    gst_rate NUMERIC(5, 2) NOT NULL DEFAULT 5.00,
    image_url TEXT,
    is_available BOOLEAN NOT NULL DEFAULT TRUE,
    track_stock BOOLEAN NOT NULL DEFAULT FALSE,
    stock_quantity NUMERIC(10, 2) DEFAULT 0,
    min_stock_level NUMERIC(10, 2) DEFAULT 0,
    has_recipe BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_cafe_product_sku UNIQUE (cafe_id, sku)
);

-- 5. INVENTORY / RAW MATERIALS (TENANT-SCOPED)
CREATE TABLE IF NOT EXISTS inventory (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    cafe_id UUID NOT NULL REFERENCES cafes(id) ON DELETE CASCADE,
    name VARCHAR(150) NOT NULL,
    sku VARCHAR(50) NOT NULL,
    category VARCHAR(50) NOT NULL,
    current_quantity NUMERIC(12, 3) NOT NULL DEFAULT 0.000,
    unit VARCHAR(20) NOT NULL, -- 'kg', 'g', 'L', 'ml', 'pcs', 'pack'
    min_quantity NUMERIC(12, 3) NOT NULL DEFAULT 0.000,
    cost_per_unit NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    supplier VARCHAR(150),
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_cafe_inventory_sku UNIQUE (cafe_id, sku)
);

-- 6. INVENTORY MOVEMENTS / LOGS (TENANT-SCOPED)
CREATE TYPE movement_type AS ENUM ('PURCHASE', 'SALE', 'ADJUSTMENT', 'WASTAGE');

CREATE TABLE IF NOT EXISTS inventory_movements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    cafe_id UUID NOT NULL REFERENCES cafes(id) ON DELETE CASCADE,
    inventory_id UUID NOT NULL REFERENCES inventory(id) ON DELETE CASCADE,
    movement_type movement_type NOT NULL,
    quantity_change NUMERIC(12, 3) NOT NULL,
    quantity_after NUMERIC(12, 3) NOT NULL,
    reason TEXT,
    reference_id VARCHAR(100),
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 7. RECIPES & RECIPE ITEMS (TENANT-SCOPED)
CREATE TABLE IF NOT EXISTS recipes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    cafe_id UUID NOT NULL REFERENCES cafes(id) ON DELETE CASCADE,
    product_id UUID NOT NULL UNIQUE REFERENCES products(id) ON DELETE CASCADE,
    instructions TEXT,
    prep_time_mins INT DEFAULT 5,
    calculated_cogs NUMERIC(10, 2) DEFAULT 0.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS recipe_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    cafe_id UUID NOT NULL REFERENCES cafes(id) ON DELETE CASCADE,
    recipe_id UUID NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
    inventory_id UUID NOT NULL REFERENCES inventory(id) ON DELETE RESTRICT,
    quantity_required NUMERIC(12, 3) NOT NULL,
    unit VARCHAR(20) NOT NULL,
    cost_contribution NUMERIC(10, 2) DEFAULT 0.00
);

-- 8. CUSTOMERS & LOYALTY (TENANT-SCOPED)
CREATE TABLE IF NOT EXISTS customers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    cafe_id UUID NOT NULL REFERENCES cafes(id) ON DELETE CASCADE,
    name VARCHAR(150) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    email VARCHAR(255),
    loyalty_points INT NOT NULL DEFAULT 0,
    total_orders INT NOT NULL DEFAULT 0,
    total_spent NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    last_visit TIMESTAMP WITH TIME ZONE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_cafe_customer_phone UNIQUE (cafe_id, phone)
);

CREATE TYPE loyalty_action AS ENUM ('EARNED', 'REDEEMED', 'EXPIRED', 'ADJUSTED');

CREATE TABLE IF NOT EXISTS loyalty_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    cafe_id UUID NOT NULL REFERENCES cafes(id) ON DELETE CASCADE,
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    order_id UUID,
    points INT NOT NULL,
    action loyalty_action NOT NULL,
    balance_after INT NOT NULL,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 9. SHIFTS (TENANT-SCOPED)
CREATE TYPE shift_status AS ENUM ('OPEN', 'CLOSED');

CREATE TABLE IF NOT EXISTS shifts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    cafe_id UUID NOT NULL REFERENCES cafes(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id),
    start_time TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    end_time TIMESTAMP WITH TIME ZONE,
    opening_cash NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    cash_sales NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    upi_sales NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    card_sales NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    total_sales NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    total_orders INT NOT NULL DEFAULT 0,
    expected_cash NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    actual_cash NUMERIC(10, 2),
    cash_difference NUMERIC(10, 2),
    status shift_status NOT NULL DEFAULT 'OPEN',
    notes TEXT
);

-- 10. ORDERS & ORDER ITEMS (TENANT-SCOPED)
CREATE TYPE order_status AS ENUM ('COMPLETED', 'HELD', 'CANCELLED');
CREATE TYPE payment_method AS ENUM ('CASH', 'UPI', 'CARD', 'SPLIT');

CREATE TABLE IF NOT EXISTS orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    cafe_id UUID NOT NULL REFERENCES cafes(id) ON DELETE CASCADE,
    invoice_number VARCHAR(50) NOT NULL,
    shift_id UUID REFERENCES shifts(id),
    customer_id UUID REFERENCES customers(id),
    customer_name VARCHAR(150),
    customer_phone VARCHAR(20),
    cashier_id UUID NOT NULL REFERENCES users(id),
    cashier_name VARCHAR(100) NOT NULL,
    subtotal NUMERIC(10, 2) NOT NULL,
    discount_amount NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    discount_type VARCHAR(20) DEFAULT 'NONE',
    gst_amount NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    total_amount NUMERIC(10, 2) NOT NULL,
    points_earned INT NOT NULL DEFAULT 0,
    points_redeemed INT NOT NULL DEFAULT 0,
    loyalty_discount NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    payment_method payment_method NOT NULL DEFAULT 'CASH',
    amount_received NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    change_returned NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    status order_status NOT NULL DEFAULT 'COMPLETED',
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_cafe_invoice_number UNIQUE (cafe_id, invoice_number)
);

CREATE TABLE IF NOT EXISTS order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    cafe_id UUID NOT NULL REFERENCES cafes(id) ON DELETE CASCADE,
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id),
    product_name VARCHAR(150) NOT NULL,
    category_name VARCHAR(100),
    quantity INT NOT NULL,
    unit_price NUMERIC(10, 2) NOT NULL,
    cost_price NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    gst_rate NUMERIC(5, 2) NOT NULL DEFAULT 5.00,
    gst_amount NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    subtotal NUMERIC(10, 2) NOT NULL,
    total NUMERIC(10, 2) NOT NULL
);

-- 11. INVOICES (TENANT-SCOPED)
CREATE TABLE IF NOT EXISTS invoices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    cafe_id UUID NOT NULL REFERENCES cafes(id) ON DELETE CASCADE,
    order_id UUID NOT NULL UNIQUE REFERENCES orders(id) ON DELETE CASCADE,
    invoice_number VARCHAR(50) NOT NULL,
    invoice_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    customer_name VARCHAR(150),
    customer_phone VARCHAR(20),
    customer_email VARCHAR(255),
    subtotal NUMERIC(10, 2) NOT NULL,
    discount NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    tax_amount NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    grand_total NUMERIC(10, 2) NOT NULL,
    payment_method VARCHAR(50) NOT NULL,
    payment_status VARCHAR(50) NOT NULL DEFAULT 'PAID',
    pdf_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_cafe_invoice_record UNIQUE (cafe_id, invoice_number)
);

-- 12. NOTIFICATIONS (TENANT-SCOPED)
CREATE TYPE notification_type AS ENUM ('LOW_STOCK', 'PAYMENT', 'SHIFT', 'CUSTOMER', 'SYSTEM', 'AI_INSIGHT');

CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    cafe_id UUID NOT NULL REFERENCES cafes(id) ON DELETE CASCADE,
    type notification_type NOT NULL,
    title VARCHAR(150) NOT NULL,
    message TEXT NOT NULL,
    severity VARCHAR(20) DEFAULT 'INFO',
    link VARCHAR(255),
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 13. AUDIT LOGS (TENANT-SCOPED)
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    cafe_id UUID NOT NULL REFERENCES cafes(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id),
    user_name VARCHAR(100),
    action VARCHAR(100) NOT NULL,
    details TEXT,
    ip_address VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================================
-- TENANT INDEXES (Optimized for Multi-Tenant Queries)
-- ==========================================================
CREATE INDEX IF NOT EXISTS idx_users_cafe_id ON users(cafe_id);
CREATE INDEX IF NOT EXISTS idx_products_cafe_id ON products(cafe_id);
CREATE INDEX IF NOT EXISTS idx_categories_cafe_id ON categories(cafe_id);
CREATE INDEX IF NOT EXISTS idx_inventory_cafe_id ON inventory(cafe_id);
CREATE INDEX IF NOT EXISTS idx_inventory_movements_cafe_id ON inventory_movements(cafe_id);
CREATE INDEX IF NOT EXISTS idx_recipes_cafe_id ON recipes(cafe_id);
CREATE INDEX IF NOT EXISTS idx_customers_cafe_id ON customers(cafe_id);
CREATE INDEX IF NOT EXISTS idx_orders_cafe_id ON orders(cafe_id);
CREATE INDEX IF NOT EXISTS idx_orders_cafe_created_at ON orders(cafe_id, created_at);
CREATE INDEX IF NOT EXISTS idx_invoices_cafe_id ON invoices(cafe_id);
CREATE INDEX IF NOT EXISTS idx_shifts_cafe_id ON shifts(cafe_id);
CREATE INDEX IF NOT EXISTS idx_notifications_cafe_id ON notifications(cafe_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_cafe_id ON audit_logs(cafe_id);
