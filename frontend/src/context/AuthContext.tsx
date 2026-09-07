import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Role } from '../types';
import { api } from '../services/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (credentials: { email: string; password: string }) => Promise<void>;
  logout: () => void;
  switchDemoRole: (role: Role) => Promise<void>;
  hasRole: (allowedRoles: Role[]) => boolean;
  isOwner: boolean;
  isManager: boolean;
  isCashier: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const cached = localStorage.getItem('cafeflow_user');
    return cached ? JSON.parse(cached) : null;
  });
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('cafeflow_token'));
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const checkAuth = async () => {
      if (token) {
        try {
          const res = await api.getCurrentUser();
          if (res.success && res.user) {
            setUser(res.user);
            localStorage.setItem('cafeflow_user', JSON.stringify(res.user));
          }
        } catch (err) {
          console.warn('Session check failed, reverting to cached/demo fallback if available', err);
        }
      }
      setIsLoading(false);
    };

    checkAuth();
  }, [token]);

  const login = async (credentials: { email: string; password: string }) => {
    setIsLoading(true);
    try {
      const res = await api.login(credentials);
      if (res.success) {
        setUser(res.user);
        setToken(res.token);
        localStorage.setItem('cafeflow_token', res.token);
        localStorage.setItem('cafeflow_user', JSON.stringify(res.user));
      }
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('cafeflow_token');
    localStorage.removeItem('cafeflow_user');
  };

  const switchDemoRole = async (role: Role) => {
    setIsLoading(true);
    try {
      const res = await api.switchDemoUser(role);
      if (res.success) {
        setUser(res.user);
        setToken(res.token);
        localStorage.setItem('cafeflow_token', res.token);
        localStorage.setItem('cafeflow_user', JSON.stringify(res.user));
      }
    } catch (err) {
      console.error('Demo switch failed:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const hasRole = (allowedRoles: Role[]) => {
    if (!user) return false;
    return allowedRoles.includes(user.role);
  };

  const isOwner = user?.role === 'OWNER';
  const isManager = user?.role === 'MANAGER' || user?.role === 'OWNER';
  const isCashier = Boolean(user);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        login,
        logout,
        switchDemoRole,
        hasRole,
        isOwner,
        isManager,
        isCashier,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
