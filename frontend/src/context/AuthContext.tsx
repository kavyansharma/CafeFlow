import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Role, Cafe } from '../types';
import { api } from '../services/api';

interface AuthContextType {
  user: User | null;
  currentCafe: Cafe | null;
  token: string | null;
  isLoading: boolean;
  login: (credentials: { email: string; password: string }) => Promise<void>;
  registerCafe: (data: any) => Promise<any>;
  logout: () => void;
  switchDemoRole: (role: Role, cafeSlug?: string) => Promise<void>;
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
  const [currentCafe, setCurrentCafe] = useState<Cafe | null>(() => {
    const cached = localStorage.getItem('cafeflow_cafe');
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
            if (res.cafe) {
              setCurrentCafe(res.cafe);
              localStorage.setItem('cafeflow_cafe', JSON.stringify(res.cafe));
            }
            localStorage.setItem('cafeflow_user', JSON.stringify(res.user));
          }
        } catch (err: any) {
          if (err?.status === 401) {
            setUser(null);
            setCurrentCafe(null);
            setToken(null);
            localStorage.removeItem('cafeflow_token');
            localStorage.removeItem('cafeflow_user');
            localStorage.removeItem('cafeflow_cafe');
          } else {
            console.warn('Session check network issue:', err?.message || err);
          }
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
        if (res.cafe) {
          setCurrentCafe(res.cafe);
          localStorage.setItem('cafeflow_cafe', JSON.stringify(res.cafe));
        }
        setToken(res.token);
        localStorage.setItem('cafeflow_token', res.token);
        localStorage.setItem('cafeflow_user', JSON.stringify(res.user));
      }
    } finally {
      setIsLoading(false);
    }
  };

  const registerCafe = async (data: any) => {
    setIsLoading(true);
    try {
      const res = await api.registerCafe(data);
      if (res.success) {
        setUser(res.user);
        setCurrentCafe(res.cafe);
        setToken(res.token);
        localStorage.setItem('cafeflow_token', res.token);
        localStorage.setItem('cafeflow_user', JSON.stringify(res.user));
        localStorage.setItem('cafeflow_cafe', JSON.stringify(res.cafe));
      }
      return res;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setCurrentCafe(null);
    setToken(null);
    localStorage.removeItem('cafeflow_token');
    localStorage.removeItem('cafeflow_user');
    localStorage.removeItem('cafeflow_cafe');
  };

  const switchDemoRole = async (role: Role, cafeSlug?: string) => {
    setIsLoading(true);
    try {
      const res = await api.switchDemoUser(role, cafeSlug);
      if (res.success) {
        setUser(res.user);
        if (res.cafe) {
          setCurrentCafe(res.cafe);
          localStorage.setItem('cafeflow_cafe', JSON.stringify(res.cafe));
        }
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
        currentCafe,
        token,
        isLoading,
        login,
        registerCafe,
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

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
