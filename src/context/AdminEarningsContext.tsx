'use client';

import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
} from 'react';
import axios from 'axios';

export interface AdminEarningsType {
  date?: string;
  totalRevenue: number;
  adminCommission: number;
  providerEarnings: number;
  franchiseEarnings: number;
  refundsToUsers: number;
  extraFees: number;
  pendingPayouts: number;
  createdAt?: string;
  updatedAt?: string;
}

interface AdminEarningsContextType {
  summary: AdminEarningsType | null;
  loading: boolean;
  fetchSummary: () => Promise<void>;
  createOrUpdateEarnings: (data: Partial<AdminEarningsType>) => Promise<void>;
}

const AdminEarningsContext = createContext<AdminEarningsContextType | undefined>(undefined);

export const AdminEarningsProvider = ({ children }: { children: ReactNode }) => {
  const [summary, setSummary] = useState<AdminEarningsType | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchSummary = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/admin/admin-earnings', {
        params: { summary: true },
      });

      if (res.data?.success) {
        setSummary(res.data.data);
      }
    } catch (error) {
      console.error('❌ Failed to fetch admin earnings summary:', error);
    } finally {
      setLoading(false);
    }
  };

  const createOrUpdateEarnings = async (data: Partial<AdminEarningsType>) => {
    try {
      const res = await axios.post('/api/admin-earnings', data);
      if (res.data?.success) {
        await fetchSummary();
      } else {
        console.error(res.data.message || 'Unknown error');
      }
    } catch (error) {
      console.error('❌ Failed to create or update admin earnings:', error);
    }
  };

  return (
    <AdminEarningsContext.Provider
      value={{
        summary,
        loading,
        fetchSummary,
        createOrUpdateEarnings,
      }}
    >
      {children}
    </AdminEarningsContext.Provider>
  );
};

export const useAdminEarnings = () => {
  const context = useContext(AdminEarningsContext);
  if (!context) {
    throw new Error('useAdminEarnings must be used within an AdminEarningsProvider');
  }
  return context;
};
