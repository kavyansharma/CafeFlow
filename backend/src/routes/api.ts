import { Router } from 'express';
import { login, getCurrentUser, switchDemoUser } from '../controllers/authController';
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

// --- AUTH ---
router.post('/auth/login', login);
router.get('/auth/me', authenticateToken, getCurrentUser);
router.post('/auth/demo-switch', switchDemoUser);

// --- PRODUCTS & CATEGORIES ---
router.get('/products', getProducts);
router.get('/products/:id', getProductById);
router.post('/products', authenticateToken, requireRoles(['OWNER', 'MANAGER']), createProduct);
router.put('/products/:id', authenticateToken, requireRoles(['OWNER', 'MANAGER']), updateProduct);
router.delete('/products/:id', authenticateToken, requireRoles(['OWNER', 'MANAGER']), deleteProduct);

router.get('/categories', getCategories);
router.post('/categories', authenticateToken, requireRoles(['OWNER', 'MANAGER']), createCategory);

// --- INVENTORY & STOCK ---
router.get('/inventory', getInventory);
router.post('/inventory', authenticateToken, requireRoles(['OWNER', 'MANAGER']), createInventoryItem);
router.put('/inventory/:id', authenticateToken, requireRoles(['OWNER', 'MANAGER']), updateInventoryItem);
router.post('/inventory/adjust', authenticateToken, requireRoles(['OWNER', 'MANAGER']), adjustStock);
router.get('/inventory/movements', getMovements);

// --- RECIPES (BOM & COGS) ---
router.get('/recipes', getRecipes);
router.get('/recipes/:productId', getRecipeByProductId);
router.post('/recipes', authenticateToken, requireRoles(['OWNER', 'MANAGER']), saveRecipe);
router.delete('/recipes/:productId', authenticateToken, requireRoles(['OWNER', 'MANAGER']), deleteRecipe);

// --- CUSTOMERS & LOYALTY ---
router.get('/customers', getCustomers);
router.get('/customers/:id', getCustomerById);
router.post('/customers', authenticateToken, createCustomer);
router.put('/customers/:id', authenticateToken, updateCustomer);

// --- POS ORDERS & HOLD SYSTEM ---
router.post('/orders', authenticateToken, createOrder);
router.post('/orders/hold', authenticateToken, holdOrder);
router.get('/orders/held', getHeldOrders);
router.delete('/orders/held/:id', removeHeldOrder);
router.get('/orders', getOrders);
router.get('/orders/:id', getOrderById);

// --- INVOICES ---
router.get('/invoices', getInvoices);
router.get('/invoices/:id', getInvoiceById);

// --- SHIFTS ---
router.get('/shifts/current', getCurrentShift);
router.post('/shifts/open', authenticateToken, openShift);
router.post('/shifts/close', authenticateToken, closeShift);
router.get('/shifts/history', getShiftHistory);

// --- STAFF & RBAC ---
router.get('/staff', authenticateToken, requireRoles(['OWNER']), getStaff);
router.post('/staff', authenticateToken, requireRoles(['OWNER']), createStaff);
router.put('/staff/:id', authenticateToken, requireRoles(['OWNER']), updateStaff);
router.get('/staff/audit-logs', authenticateToken, requireRoles(['OWNER', 'MANAGER']), getAuditLogs);

// --- SALES & REPORTING ---
router.get('/sales/summary', getSalesSummary);
router.get('/sales/export', exportSalesCSV);

// --- ANALYTICS ---
router.get('/analytics/dashboard', getDashboardAnalytics);
router.get('/analytics/deep', getDeepAnalytics);

// --- AI BUSINESS INSIGHTS ---
router.get('/ai/insights', getAIBusinessInsights);

// --- SETTINGS ---
router.get('/settings', getSettings);
router.put('/settings', authenticateToken, requireRoles(['OWNER']), updateSettings);

// --- NOTIFICATIONS ---
router.get('/notifications', getNotifications);
router.put('/notifications/:id/read', markNotificationRead);
router.post('/notifications/read-all', markAllNotificationsRead);

export default router;
