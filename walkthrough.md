# CAFEFLOW — AI-Powered Cafe POS & Billing System
> *"Smart Billing. Smarter Cafe."*

---

## Executive Summary

**CAFEFLOW** has been built as a complete, commercial-grade Cafe POS and Business Management web application. The application delivers ultra-fast POS billing, item & recipe Bill of Materials (BOM) costing, real-time raw material inventory management, CRM customer loyalty rewards, shift and cash drawer reconciliation, financial reporting, and AI-driven business intelligence.

---

## 🛠️ Implemented Architecture & Modules

| Module | Description |
| :--- | :--- |
| **Authentication & RBAC** | JWT session authentication with role permissions (`OWNER`, `MANAGER`, `CASHIER`) and quick demo switcher. |
| **POS Billing System** | Category quick filters, instant search, quantity steppers, item discounts, loyalty redemption, and Hold/Resume bills drawer (`F4`). |
| **Payment Workflows** | **Cash** (with fast denomination presets and change calculation), **UPI** (with live dynamic QR code and VPA), **Card** (with terminal ref code). |
| **Recipe Management & BOM** | Maps raw inventory items (beans, milk, sugar, cups) to dishes, calculates food costs (COGS), and displays gross profit margins. |
| **Inventory & Stock Logs** | Tracks ingredient units (`kg`, `g`, `L`, `ml`, `pcs`), generates critical/warning low stock alerts, and logs movement types (`PURCHASE`, `SALE`, `ADJUSTMENT`, `WASTAGE`). |
| **Customer CRM & Loyalty** | Tracks customer spend, visit frequency, favorite items, and rewards (₹100 = 1 point; 1 point = ₹1 checkout discount). |
| **Cash Drawer & Shifts** | Shift opening float registration, live sales tally (Cash, UPI, Card), and end-of-shift cash drawer reconciliation with variance logging. |
| **Sales Reports & CSV** | Time range filters (Today, Yesterday, 7D, 30D, Custom), Net/Gross revenue, tax breakdown, and 1-click CSV spreadsheet export. |
| **AI Business Insights** | Next-day sales revenue forecasting ranges, item demand velocity spikes, raw material exhaustion timelines, and high-impact business recommendations. |
| **Settings & Branding** | Full customization of cafe profile, address, GSTIN, invoice prefixes, and loyalty exchange rules. |

---

## 🚀 Running the Project

```bash
# Terminal 1 - Backend API Server (Port 5000)
cd backend
npm run dev

# Terminal 2 - Frontend Web Application (Port 5173)
cd frontend
npm run dev
```
