import React, { createContext, useContext, useState, useEffect } from 'react';
import { Shift } from '../types';
import { api } from '../services/api';

interface ShiftContextType {
  currentShift: Shift | null;
  hasActiveShift: boolean;
  isLoading: boolean;
  openShift: (openingCash: number, notes?: string) => Promise<Shift>;
  closeShift: (actualCash?: number, notes?: string) => Promise<Shift>;
  refreshShift: () => Promise<void>;
}

const ShiftContext = createContext<ShiftContextType | undefined>(undefined);

export const ShiftProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentShift, setCurrentShift] = useState<Shift | null>(null);
  const [hasActiveShift, setHasActiveShift] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchCurrentShift = async () => {
    try {
      const res = await api.getCurrentShift();
      if (res.success) {
        setCurrentShift(res.data);
        setHasActiveShift(res.has_active_shift);
      }
    } catch (err) {
      console.warn('Failed to load current shift:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCurrentShift();
  }, []);

  const openShift = async (openingCash: number, notes?: string) => {
    const res = await api.openShift({ opening_cash: openingCash, notes });
    if (res.success) {
      setCurrentShift(res.data);
      setHasActiveShift(true);
      return res.data;
    }
    throw new Error(res.message || 'Failed to open shift');
  };

  const closeShift = async (actualCash?: number, notes?: string) => {
    const res = await api.closeShift({ actual_cash: actualCash, notes });
    if (res.success) {
      setCurrentShift(null);
      setHasActiveShift(false);
      return res.data;
    }
    throw new Error(res.message || 'Failed to close shift');
  };

  return (
    <ShiftContext.Provider
      value={{
        currentShift,
        hasActiveShift,
        isLoading,
        openShift,
        closeShift,
        refreshShift: fetchCurrentShift,
      }}
    >
      {children}
    </ShiftContext.Provider>
  );
};

export const useShift = () => {
  const context = useContext(ShiftContext);
  if (!context) throw new Error('useShift must be used within a ShiftProvider');
  return context;
};
