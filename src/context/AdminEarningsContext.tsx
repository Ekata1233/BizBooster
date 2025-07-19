'use client';

import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
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

export interface TransactionType {
  transactionId: string;
  walletType: 'User' | 'Provider';
  to: string;
  date: string; // use string to simplify JSON parsing
  type: 'credit' | 'debit';
  source: string;
  method: string;
  status: 'success' | 'pending' | 'failed';
  credit: number;
  debit: number;
  balance: number | string;
}

interface AdminEarningsContextType {
  summary: AdminEarningsType | null;
  loading: boolean;
  fetchSummary: () => Promise<void>;
  createOrUpdateEarnings: (data: Partial<AdminEarningsType>) => Promise<void>;
  transactions: TransactionType[];
  fetchTransactions: () => Promise<void>;
  fetchEarningsByDates: () => Promise<void>;
  earningsByDate: AdminEarningsType[];
}

const AdminEarningsContext = createContext<AdminEarningsContextType | undefined>(undefined);

export const AdminEarningsProvider = ({ children }: { children: ReactNode }) => {
  const [summary, setSummary] = useState<AdminEarningsType | null>(null);
  const [transactions, setTransactions] = useState<TransactionType[]>([]);
  const [earningsByDate, setEarningsByDate] = useState<AdminEarningsType[]>([]);
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
      console.error('Failed to fetch admin earnings summary:', error);
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
      console.error('Failed to create or update admin earnings:', error);
    }
  };

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/admin/all-transactions');
      if (res.status === 200) {
        setTransactions(res.data);
      }
    } catch (error) {
      console.error('Failed to fetch transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchEarningsByDates = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/admin/earnings-by-date');
      if (res.data?.success && Array.isArray(res.data.data)) {
        setEarningsByDate(res.data.data);
      } else {
        console.error(res.data.message || 'Invalid earnings data format');
      }
    } catch (error) {
      console.error('Failed to fetch earnings by dates:', error);
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    fetchTransactions();
    fetchEarningsByDates();
  }, []);

  return (
    <AdminEarningsContext.Provider
      value={{
        summary,
        loading,
        fetchSummary,
        createOrUpdateEarnings,
        transactions,
        fetchTransactions,
        fetchEarningsByDates,    // ✅
        earningsByDate,
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
