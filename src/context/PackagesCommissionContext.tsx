'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import axios from 'axios';

export interface CommissionType {
  _id?: string;
  level1Commission: number;
  level2Commission: number;
  createdAt?: string;
  updatedAt?: string;
}

interface PackagesCommissionContextProps {
  commission: CommissionType | null;
  loading: boolean;
  fetchCommission: () => Promise<void>;
  saveCommission: (data: CommissionType) => Promise<void>;
}

const PackagesCommissionContext = createContext<PackagesCommissionContextProps | undefined>(undefined);

export const PackagesCommissionProvider = ({ children }: { children: ReactNode }) => {
  const [commission, setCommission] = useState<CommissionType | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const fetchCommission = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/api/packages-commissions');
      setCommission(res.data);
    } catch (error) {
      console.error('Failed to fetch commission:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveCommission = async (data: CommissionType) => {
    try {
      setLoading(true);
      const res = await axios.post('/api/packages-commissions', data);
      setCommission(res.data);
    } catch (error) {
      console.error('Failed to save commission:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCommission();
  }, []);

  return (
    <PackagesCommissionContext.Provider
      value={{ commission, loading, fetchCommission, saveCommission }}
    >
      {children}
    </PackagesCommissionContext.Provider>
  );
};

export const usePackagesCommission = () => {
  const context = useContext(PackagesCommissionContext);
  if (!context) {
    throw new Error('usePackagesCommission must be used within a PackagesCommissionProvider');
  }
  return context;
};
