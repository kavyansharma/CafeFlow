const API_BASE = '/api';

export class ApiError extends Error {
  status: number;
  data: any;

  constructor(message: string, status: number, data?: any) {
    super(message);
    this.status = status;
    this.data = data;
    this.name = 'ApiError';
  }
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem('cafeflow_token');
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const url = `${API_BASE}${endpoint}`;
  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      const errorMessage = data?.message || `Request failed with status ${response.status}`;
      throw new ApiError(errorMessage, response.status, data);
    }

    return data as T;
  } catch (error: any) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(error.message || 'Network error occurred', 500);
  }
}

export const api = {
  // Auth
  login: (credentials: { email: string; password: string }) =>
    request<any>('/auth/login', { method: 'POST', body: JSON.stringify(credentials) }),
  getCurrentUser: () => request<any>('/auth/me'),
  switchDemoUser: (role: 'OWNER' | 'MANAGER' | 'CASHIER') =>
    request<any>('/auth/demo-switch', { method: 'POST', body: JSON.stringify({ role }) }),

  // Products & Categories
  getProducts: (params?: { category_id?: string; search?: string; available_only?: boolean }) => {
    const query = new URLSearchParams(params as any).toString();
    return request<any>(`/products${query ? `?${query}` : ''}`);
  },
  getProductById: (id: string) => request<any>(`/products/${id}`),
  createProduct: (data: any) => request<any>('/products', { method: 'POST', body: JSON.stringify(data) }),
  updateProduct: (id: string, data: any) => request<any>(`/products/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteProduct: (id: string) => request<any>(`/products/${id}`, { method: 'DELETE' }),

  getCategories: () => request<any>('/categories'),
  createCategory: (data: any) => request<any>('/categories', { method: 'POST', body: JSON.stringify(data) }),

  // Inventory & Stock
  getInventory: (params?: { category?: string; search?: string; low_stock_only?: boolean }) => {
    const query = new URLSearchParams(params as any).toString();
    return request<any>(`/inventory${query ? `?${query}` : ''}`);
  },
  createInventoryItem: (data: any) => request<any>('/inventory', { method: 'POST', body: JSON.stringify(data) }),
  updateInventoryItem: (id: string, data: any) => request<any>(`/inventory/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  adjustStock: (data: { inventory_id: string; quantity_change: number; movement_type: string; reason: string }) =>
    request<any>('/inventory/adjust', { method: 'POST', body: JSON.stringify(data) }),
  getMovements: (params?: { inventory_id?: string; type?: string }) => {
    const query = new URLSearchParams(params as any).toString();
    return request<any>(`/inventory/movements${query ? `?${query}` : ''}`);
  },

  // Recipes BOM
  getRecipes: () => request<any>('/recipes'),
  getRecipeByProductId: (productId: string) => request<any>(`/recipes/${productId}`),
  saveRecipe: (data: any) => request<any>('/recipes', { method: 'POST', body: JSON.stringify(data) }),
  deleteRecipe: (productId: string) => request<any>(`/recipes/${productId}`, { method: 'DELETE' }),

  // Customers & Loyalty
  getCustomers: (search?: string) => request<any>(`/customers${search ? `?search=${encodeURIComponent(search)}` : ''}`),
  getCustomerById: (id: string) => request<any>(`/customers/${id}`),
  createCustomer: (data: any) => request<any>('/customers', { method: 'POST', body: JSON.stringify(data) }),
  updateCustomer: (id: string, data: any) => request<any>(`/customers/${id}`, { method: 'PUT', body: JSON.stringify(data) }),

  // Orders & POS
  createOrder: (data: any) => request<any>('/orders', { method: 'POST', body: JSON.stringify(data) }),
  holdOrder: (data: any) => request<any>('/orders/hold', { method: 'POST', body: JSON.stringify(data) }),
  getHeldOrders: () => request<any>('/orders/held'),
  removeHeldOrder: (id: string) => request<any>(`/orders/held/${id}`, { method: 'DELETE' }),
  getOrders: (params?: any) => {
    const query = new URLSearchParams(params).toString();
    return request<any>(`/orders${query ? `?${query}` : ''}`);
  },
  getOrderById: (id: string) => request<any>(`/orders/${id}`),

  // Invoices
  getInvoices: (params?: any) => {
    const query = new URLSearchParams(params).toString();
    return request<any>(`/invoices${query ? `?${query}` : ''}`);
  },
  getInvoiceById: (id: string) => request<any>(`/invoices/${id}`),

  // Shifts
  getCurrentShift: () => request<any>('/shifts/current'),
  openShift: (data: { opening_cash: number; notes?: string }) =>
    request<any>('/shifts/open', { method: 'POST', body: JSON.stringify(data) }),
  closeShift: (data: { actual_cash?: number; notes?: string }) =>
    request<any>('/shifts/close', { method: 'POST', body: JSON.stringify(data) }),
  getShiftHistory: () => request<any>('/shifts/history'),

  // Staff & RBAC
  getStaff: () => request<any>('/staff'),
  createStaff: (data: any) => request<any>('/staff', { method: 'POST', body: JSON.stringify(data) }),
  updateStaff: (id: string, data: any) => request<any>(`/staff/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  getAuditLogs: () => request<any>('/staff/audit-logs'),

  // Sales & Reports
  getSalesSummary: (params?: any) => {
    const query = new URLSearchParams(params).toString();
    return request<any>(`/sales/summary${query ? `?${query}` : ''}`);
  },

  // Analytics
  getDashboardAnalytics: () => request<any>('/analytics/dashboard'),
  getDeepAnalytics: () => request<any>('/analytics/deep'),

  // AI Insights
  getAIInsights: () => request<any>('/ai/insights'),

  // Settings
  getSettings: () => request<any>('/settings'),
  updateSettings: (data: any) => request<any>('/settings', { method: 'PUT', body: JSON.stringify(data) }),

  // Notifications
  getNotifications: () => request<any>('/notifications'),
  markNotificationRead: (id: string) => request<any>(`/notifications/${id}/read`, { method: 'PUT' }),
  markAllNotificationsRead: () => request<any>('/notifications/read-all', { method: 'POST' }),
};
