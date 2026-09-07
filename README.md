# CAFEFLOW — AI-Powered Cafe POS & Billing System
> *"Smart Billing. Smarter Cafe."*

**CAFEFLOW** is a high-performance, commercial-grade Cafe Point of Sale (POS), billing, inventory COGS costing, customer loyalty, and AI-driven business intelligence management system.

---

## 🌟 Key Features

### 1. ⚡ High-Speed POS Billing System
- **Product Catalog Grid**: High-resolution imagery, category quick-filters (Coffee, Tea, Beverages, Snacks, Sandwiches, Desserts, Meals, Add-ons), instant search, and stock badges.
- **Dynamic Cart**: Instant item adjustments, custom item discounts (Percentage % or Fixed ₹), notes, and real-time CGST + SGST tax calculation.
- **Hold & Park Bills**: Park multiple simultaneous customer orders (`F4`) and resume them anytime with one click.
- **Multi-Payment Modes**:
  - **Cash**: Preset fast tender buttons (₹100, ₹200, ₹500, ₹2000, Exact), tender input, and automatic change return calculator.
  - **UPI / QR**: Live dynamic UPI QR code generator with cafe VPA (`cafeflow@icici`).
  - **Card / EDC**: POS terminal transaction code reference and authorization confirmation.
- **Instant Thermal / A4 Invoices**: Auto-generated 80mm thermal receipt and standard A4 tax invoice with instant print stylesheet and PDF download.

### 2. 🍲 Recipe Bill of Materials (BOM) & Food Costing
- Map raw inventory items directly to dishes (e.g. *Classic Cappuccino*: 18g Espresso Beans + 150ml Milk + 6g Sugar + 1 Takeaway Cup).
- Live COGS (Cost of Goods Sold) calculation and gross margin meters.
- Automatic multi-ingredient raw material deduction on POS checkout.

### 3. 📦 Real-Time Inventory & Stock Movement
- Track ingredients and raw materials with units (`kg`, `g`, `L`, `ml`, `pcs`, `pack`).
- Automated low stock alerts (Warning & Critical thresholds).
- Stock movement logs tracking every change (`PURCHASE`, `SALE`, `ADJUSTMENT`, `WASTAGE`) with user attribution.

### 4. 👥 Customer Relationship & Loyalty Program
- Customer directory with lifetime spend, visit count, and average order value.
- Configurable loyalty program (e.g. ₹100 spent = 1 pt earned; 1 pt = ₹1 discount on checkout).
- Redeem points directly at the POS billing screen.

### 5. 🕒 Cash Drawer & Shift Management
- Shift opening with initial cash float registration.
- Real-time shift telemetry: Cash sales, UPI sales, Card sales, and total bills.
- End-of-shift closing with physical drawer cash count and variance discrepancy tracking (Over/Short/Balanced).

### 6. 📊 Sales Reporting & Analytics
- Multi-horizon filters: Today, Yesterday, Last 7 Days, Last 30 Days, Custom Range.
- Financial KPIs: Gross Sales, Net Revenue, Taxes, Discounts, Total Orders, Average Order Value.
- Visualizations: Hourly rush curves, revenue by category, payment method distribution, top selling products.
- One-click CSV export for accounting.

### 7. 🤖 AI Business Insights & Forecasting
- **Next-Day Sales Forecast**: Weighted confidence intervals predicting revenue and order volume based on historical day-of-week velocity.
- **Demand Spike Prediction**: Item-level surges with rush time windows.
- **Inventory Depletion Risk**: Predicts exact days remaining before raw materials hit critical safety levels.
- **Business Recommendations**: Actionable suggestions with impact tiers (Pricing, Inventory, Staffing, Promotions).

### 8. 🏢 Multi-Tenant SaaS Architecture
- **Tenant Isolation**: Every cafe operates in a completely isolated tenant partition. Products, inventory, recipes, customers, shifts, orders, and invoices never bleed across cafes.
- **Pre-Configured Demo Cafes**:
  - **Sunrise Cafe & Roastery** (`cafe-sunrise-001`, Bengaluru): Traditional artisanal cafe & bakery.
  - **Bean Theory Specialty Coffee** (`cafe-bean-002`, Mumbai): Specialty pour-over bar & French viennoiserie.
- **5-Step Cafe Self-Registration**: Self-service onboarding wizard at `/register-cafe` with starter menu packs, custom invoice prefixes, tax setup, and instant tenant provisioning.
- **Context-Aware JWTs**: Every API request extracts tenant context from verified JWT claims (`req.user.cafe_id`) preventing tenant spoofing.

### 9. 🛡️ Role-Based Access Control (RBAC)
- `OWNER`: Full unrestricted access to cafe settings, staff management, financial telemetry, and AI forecasting.
- `MANAGER`: POS billing, menu catalog, inventory BOM, customer CRM, sales reporting, and analytics.
- `CASHIER`: High-speed POS billing, bill parking, customer lookups, shift opening/closing, and invoice reprints.

---

## 🔑 Demo Access Credentials

All demo accounts use password: `demo123`

### ☕ Sunrise Cafe & Roastery (Bengaluru)
| Role | Email | Password | Scope |
| :--- | :--- | :--- | :--- |
| **Owner** | `owner@sunrise.demo` | `demo123` | Full Admin & Settings |
| **Manager** | `manager@sunrise.demo` | `demo123` | Operations & Sales |
| **Cashier** | `cashier@sunrise.demo` | `demo123` | POS Billing & Shifts |

### 🌿 Bean Theory Specialty Coffee (Mumbai)
| Role | Email | Password | Scope |
| :--- | :--- | :--- | :--- |
| **Owner** | `owner@bean.demo` | `demo123` | Full Admin & Settings |
| **Manager** | `manager@bean.demo` | `demo123` | Operations & Sales |
| **Cashier** | `cashier@bean.demo` | `demo123` | POS Billing & Shifts |

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- npm (v9+)

### Installation & Running Locally

1. **Clone the repository**:
   ```bash
   git clone https://github.com/kavyansharma/CafeFlow.git
   cd CafeFlow
   ```

2. **Backend Setup**:
   ```bash
   cd backend
   npm install
   npm run dev
   ```
   *Backend runs on `http://localhost:5000`*

3. **Frontend Setup**:
   ```bash
   cd ../frontend
   npm install
   npm run dev
   ```
   *Frontend runs on `http://localhost:5173`*

4. **Run Automated Multi-Tenant Tests**:
   ```bash
   cd backend
   npm run build
   node dist/tests/tenant_isolation_test.js
   ```

---

## 📄 License
Commercial SaaS Edition — Designed & Developed for Modern Cafes.

## 🗄️ Database Architecture
The database schema is fully defined in `backend/src/database/schema.sql` for PostgreSQL with normalized relationships, UUID primary keys, and foreign key constraints across `users`, `categories`, `products`, `inventory`, `inventory_movements`, `recipes`, `recipe_items`, `customers`, `orders`, `order_items`, `invoices`, `shifts`, `notifications`, `settings`, and `audit_logs`.
