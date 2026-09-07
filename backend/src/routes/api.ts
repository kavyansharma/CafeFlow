import { Router } from 'express';
import { login, getCurrentUser, switchDemoUser, registerCafe } from '../controllers/authController';
import {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getCategories,
  createCategory,
} from '../controllers/productController';
import {
  getInventory,
  createInventoryItem,
  updateInventoryItem,
  adjustStock,
  getMovements,
} from '../controllers/inventoryController';
import {
  getRecipes,
  getRecipeByProductId,
  saveRecipe,
  deleteRecipe,
} from '../controllers/recipeController';
import {
  getCustomers,
  getCustomerById,
  createCustomer,
  updateCustomer,
} from '../controllers/customerController';
import {
  createOrder,
  holdOrder,
  getHeldOrders,
  removeHeldOrder,
  getOrders,
  getOrderById,
} from '../controllers/orderController';
import {
  getInvoices,
  getInvoiceById,
} from '../controllers/invoiceController';
import {
  getCurrentShift,
  openShift,
  closeShift,
  getShiftHistory,
} from '../controllers/shiftController';
import {
  getStaff,
  createStaff,
  updateStaff,
  getAuditLogs,
} from '../controllers/staffController';
import {
  getSalesSummary,
  exportSalesCSV,
} from '../controllers/salesController';
import {
  getDashboardAnalytics,
  getDeepAnalytics,
} from '../controllers/analyticsController';
import {
  getAIBusinessInsights,
} from '../controllers/aiController';
import {
  getSettings,
  updateSettings,
} from '../controllers/settingsController';
import {
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead,
} from '../controllers/notificationController';
import { authenticateToken, requireRoles } from '../middleware/auth';

const router = Router();

// --- AUTH (Public & Authenticated) ---
router.post('/auth/register-cafe', registerCafe);
router.post('/auth/login', login);
router.get('/auth/me', authenticateToken, getCurrentUser);
router.post('/auth/demo-switch', switchDemoUser);

// --- PRODUCTS & CATEGORIES ---
router.get('/products', authenticateToken, getProducts);
router.get('/products/:id', authenticateToken, getProductById);
router.post('/products', authenticateToken, requireRoles(['OWNER', 'MANAGER']), createProduct);
router.put('/products/:id', authenticateToken, requireRoles(['OWNER', 'MANAGER']), updateProduct);
router.delete('/products/:id', authenticateToken, requireRoles(['OWNER', 'MANAGER']), deleteProduct);

router.get('/categories', authenticateToken, getCategories);
router.post('/categories', authenticateToken, requireRoles(['OWNER', 'MANAGER']), createCategory);

// --- INVENTORY & STOCK ---
router.get('/inventory', authenticateToken, getInventory);
router.post('/inventory', authenticateToken, requireRoles(['OWNER', 'MANAGER']), createInventoryItem);
router.put('/inventory/:id', authenticateToken, requireRoles(['OWNER', 'MANAGER']), updateInventoryItem);
router.post('/inventory/adjust', authenticateToken, requireRoles(['OWNER', 'MANAGER']), adjustStock);
router.get('/inventory/movements', authenticateToken, getMovements);

// --- RECIPES (BOM & COGS) ---
router.get('/recipes', authenticateToken, getRecipes);
router.get('/recipes/:productId', authenticateToken, getRecipeByProductId);
router.post('/recipes', authenticateToken, requireRoles(['OWNER', 'MANAGER']), saveRecipe);
router.delete('/recipes/:productId', authenticateToken, requireRoles(['OWNER', 'MANAGER']), deleteRecipe);

// --- CUSTOMERS & LOYALTY ---
router.get('/customers', authenticateToken, getCustomers);
router.get('/customers/:id', authenticateToken, getCustomerById);
router.post('/customers', authenticateToken, createCustomer);
router.put('/customers/:id', authenticateToken, updateCustomer);

// --- POS ORDERS & HOLD SYSTEM ---
router.post('/orders', authenticateToken, createOrder);
router.post('/orders/hold', authenticateToken, holdOrder);
router.get('/orders/held', authenticateToken, getHeldOrders);
router.delete('/orders/held/:id', authenticateToken, removeHeldOrder);
router.get('/orders', authenticateToken, getOrders);
router.get('/orders/:id', authenticateToken, getOrderById);

// --- INVOICES ---
router.get('/invoices', authenticateToken, getInvoices);
router.get('/invoices/:id', authenticateToken, getInvoiceById);

// --- SHIFTS ---
router.get('/shifts/current', authenticateToken, getCurrentShift);
router.post('/shifts/open', authenticateToken, openShift);
router.post('/shifts/close', authenticateToken, closeShift);
router.get('/shifts/history', authenticateToken, getShiftHistory);

// --- STAFF & RBAC ---
router.get('/staff', authenticateToken, requireRoles(['OWNER']), getStaff);
router.post('/staff', authenticateToken, requireRoles(['OWNER']), createStaff);
router.put('/staff/:id', authenticateToken, requireRoles(['OWNER']), updateStaff);
router.get('/staff/audit-logs', authenticateToken, requireRoles(['OWNER', 'MANAGER']), getAuditLogs);

// --- SALES & REPORTING ---
router.get('/sales/summary', authenticateToken, getSalesSummary);
router.get('/sales/export', authenticateToken, exportSalesCSV);

// --- ANALYTICS ---
router.get('/analytics/dashboard', authenticateToken, getDashboardAnalytics);
router.get('/analytics/deep', authenticateToken, getDeepAnalytics);

// --- AI BUSINESS INSIGHTS ---
router.get('/ai/insights', authenticateToken, getAIBusinessInsights);

// --- SETTINGS ---
router.get('/settings', authenticateToken, getSettings);
router.put('/settings', authenticateToken, requireRoles(['OWNER']), updateSettings);

// --- NOTIFICATIONS ---
router.get('/notifications', authenticateToken, getNotifications);
router.put('/notifications/:id/read', authenticateToken, markNotificationRead);
router.post('/notifications/read-all', authenticateToken, markAllNotificationsRead);

export default router;
