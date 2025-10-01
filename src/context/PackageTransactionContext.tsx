'use client';

import React, { createContext, useContext, useState } from 'react';
import axios from 'axios';

type Payment = {
  _id: string;
  order_id: string;
  amount: number;
  currency: string;
  customerId: string;
  email: string;
  name: string;
  slug: string;
  status: string;
  createdAt: string;
  updatedAt: string;
};

type PackageDetails = {
  packageAmountPaid: number;
  remainingAmount: number;
  packagePrice: number;
  packageActive: boolean;
  packageActivateDate: string | null;
};

interface PackageTransactionState {
  payments: Payment[];
  packageDetails: PackageDetails | null;
}

interface PackageTransactionContextType {
  data: PackageTransactionState;
  loading: boolean;
  error: string | null;
  fetchPackageTransaction: (customerId: string) => Promise<void>;
}

const PackageTransactionContext = createContext<PackageTransactionContextType | null>(null);

export const PackageTransactionProvider = ({ children }: { children: React.ReactNode }) => {
  const [data, setData] = useState<PackageTransactionState>({
    payments: [],
    packageDetails: null,
  });
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPackageTransaction = async (customerId: string) => {
    setLoading(true);
    setError(null);

    try {
      const res = await axios.get(`/api/payments/package-transaction/${customerId}`);
      if (res.data.success) {
        setData({
          payments: res.data.data.payments || [],
          packageDetails: res.data.data.packageDetails || null,
        });
      } else {
        setError(res.data.message || 'Failed to fetch package transaction');
        setData({ payments: [], packageDetails: null });
      }
    } catch (err: any) {
      console.error('Error fetching package transaction:', err);
      setError(err?.response?.data?.message || 'Failed to fetch package transaction');
      setData({ payments: [], packageDetails: null });
    } finally {
      setLoading(false);
    }
  };

  return (
    <PackageTransactionContext.Provider
      value={{ data, loading, error, fetchPackageTransaction }}
    >
      {children}
    </PackageTransactionContext.Provider>
  );
};

export const usePackageTransaction = () => {
  const context = useContext(PackageTransactionContext);
  if (!context) {
    throw new Error('usePackageTransaction must be used within a PackageTransactionProvider');
  }
  return context;
};
