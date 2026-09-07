import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { NotificationProvider } from './context/NotificationContext';
import { ShiftProvider } from './context/ShiftContext';
import { CartProvider } from './context/CartContext';

import { AppLayout } from './components/layout/AppLayout';
import { Login } from './pages/Login';
import { RegisterCafe } from './pages/RegisterCafe';
import { Dashboard } from './pages/Dashboard';
import { POS } from './pages/POS';
import { Products } from './pages/Products';
import { Inventory } from './pages/Inventory';
import { Recipes } from './pages/Recipes';
import { Customers } from './pages/Customers';
import { Staff } from './pages/Staff';
import { Shifts } from './pages/Shifts';
import { Sales } from './pages/Sales';
import { Analytics } from './pages/Analytics';
import { AIInsights } from './pages/AIInsights';
import { Invoices } from './pages/Invoices';
import { Settings } from './pages/Settings';
import { Role } from './types';

// Protected Route Component with Role Checking
const ProtectedRoute: React.FC<{
  children: React.ReactNode;
  allowedRoles?: Role[];
}> = ({ children, allowedRoles }) => {
  const { user, token, isLoading, hasRole } = useAuth();

  if (isLoading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-[#0f1117]">
        <div className="w-8 h-8 border-3 border-amber-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!token && !user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !hasRole(allowedRoles)) {
    // If cashier tries to access dashboard or staff, route to POS
    return <Navigate to="/pos" replace />;
  }

  return <>{children}</>;
};

// Root index redirect based on user role
const RootRedirect: React.FC = () => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (user.role === 'CASHIER') return <Navigate to="/pos" replace />;
  return <Navigate to="/dashboard" replace />;
};

export const App: React.FC = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <NotificationProvider>
          <ShiftProvider>
            <CartProvider>
              <BrowserRouter>
                <Routes>
                  {/* Public Authentication */}
                  <Route path="/login" element={<Login />} />
                  <Route path="/register-cafe" element={<RegisterCafe />} />

                  {/* Main POS Shell Layout */}
                  <Route
                    path="/"
                    element={
                      <ProtectedRoute>
                        <AppLayout />
                      </ProtectedRoute>
                    }
                  >
                    <Route index element={<RootRedirect />} />

                    {/* Dashboard */}
                    <Route
                      path="dashboard"
                      element={
                        <ProtectedRoute allowedRoles={['OWNER', 'MANAGER']}>
                          <Dashboard />
                        </ProtectedRoute>
                      }
                    />

                    {/* POS Billing (Open to Cashier, Manager, Owner) */}
                    <Route path="pos" element={<POS />} />

                    {/* Products */}
                    <Route
                      path="products"
                      element={
                        <ProtectedRoute allowedRoles={['OWNER', 'MANAGER']}>
                          <Products />
                        </ProtectedRoute>
                      }
                    />

                    {/* Inventory */}
                    <Route
                      path="inventory"
                      element={
                        <ProtectedRoute allowedRoles={['OWNER', 'MANAGER']}>
                          <Inventory />
                        </ProtectedRoute>
                      }
                    />

                    {/* Recipes / BOM */}
                    <Route
                      path="recipes"
                      element={
                        <ProtectedRoute allowedRoles={['OWNER', 'MANAGER']}>
                          <Recipes />
                        </ProtectedRoute>
                      }
                    />

                    {/* Customers CRM */}
                    <Route path="customers" element={<Customers />} />

                    {/* Staff & Roles (Owner only) */}
                    <Route
                      path="staff"
                      element={
                        <ProtectedRoute allowedRoles={['OWNER']}>
                          <Staff />
                        </ProtectedRoute>
                      }
                    />

                    {/* Shifts */}
                    <Route path="shifts" element={<Shifts />} />

                    {/* Sales Reporting */}
                    <Route
                      path="sales"
                      element={
                        <ProtectedRoute allowedRoles={['OWNER', 'MANAGER']}>
                          <Sales />
                        </ProtectedRoute>
                      }
                    />

                    {/* Advanced Analytics */}
                    <Route
                      path="analytics"
                      element={
                        <ProtectedRoute allowedRoles={['OWNER', 'MANAGER']}>
                          <Analytics />
                        </ProtectedRoute>
                      }
                    />

                    {/* AI Business Insights */}
                    <Route
                      path="ai-insights"
                      element={
                        <ProtectedRoute allowedRoles={['OWNER', 'MANAGER']}>
                          <AIInsights />
                        </ProtectedRoute>
                      }
                    />

                    {/* Invoices Archive */}
                    <Route path="invoices" element={<Invoices />} />

                    {/* Settings (Owner only) */}
                    <Route
                      path="settings"
                      element={
                        <ProtectedRoute allowedRoles={['OWNER']}>
                          <Settings />
                        </ProtectedRoute>
                      }
                    />
                  </Route>

                  {/* Fallback */}
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </BrowserRouter>
            </CartProvider>
          </ShiftProvider>
        </NotificationProvider>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;
