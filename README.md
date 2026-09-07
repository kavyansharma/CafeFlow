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

### 8. 🛡️ Role-Based Access Control (RBAC)
- `OWNER`: Full unrestricted access to all modules, staff accounts, settings, and AI forecasting.
- `MANAGER`: POS billing, products, inventory, recipes, customers, sales reports, and analytics.
- `CASHIER`: Fast POS billing, customer attachment, shift management, and invoice history.

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- npm

### 1. Start the Backend API Server
```bash
cd backend
npm install
npm run dev
```
*Backend runs on `http://localhost:5000` with REST API mounted at `/api`.*

### 2. Start the Frontend Application
```bash
cd frontend
npm install
npm run dev
```
*Frontend runs on `http://localhost:5173`.*

---

## 🔑 Demo Login Credentials

| Role | Email | Password | Access Scope |
| :--- | :--- | :--- | :--- |
| **Owner** | `owner@cafeflow.com` | `owner123` | Full Access (All modules & settings) |
| **Manager** | `manager@cafeflow.com` | `manager123` | POS, Inventory, Recipes, Reports |
| **Cashier** | `cashier@cafeflow.com` | `cashier123` | POS Billing, Shifts, Invoices |

*(You can also use the 1-click Quick Demo Role Switcher on the login screen or sidebar)*

---

## 🗄️ Database Architecture
The database schema is fully defined in `backend/src/database/schema.sql` for PostgreSQL with normalized relationships, UUID primary keys, and foreign key constraints across `users`, `categories`, `products`, `inventory`, `inventory_movements`, `recipes`, `recipe_items`, `customers`, `orders`, `order_items`, `invoices`, `shifts`, `notifications`, `settings`, and `audit_logs`.
