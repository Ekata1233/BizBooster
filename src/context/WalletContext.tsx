'use client';

import axios from 'axios';
import mongoose from 'mongoose';
import React, { createContext, useContext, useState } from 'react';

// Wallet Transaction Interface
export interface IWalletTransaction {
  type: 'credit' | 'debit';
  amount: number;
  leadId: string;
  commissionFrom: string;
  description?: string;
  referenceId?: string;
  method?: string;
  source?: string;
  status?: 'success' | 'failed' | 'pending';
  createdAt: Date;
}

// Wallet Interface
export interface IWallet {
  userId: mongoose.Types.ObjectId;
  balance: number;
  transactions: IWalletTransaction[];
  totalCredits: number;
  totalDebits: number;
  lastTransactionAt?: Date;
  linkedBankAccount?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Context type
interface UserWalletContextType {
  wallet: IWallet | null;
  loading: boolean;
  error: string | null;
  fetchWalletByUser: (userId: string) => Promise<void>;
}

// Create Context
const WalletContext = createContext<UserWalletContextType | undefined>(undefined);


// Provider Component (named WalletUser)
export const WalletUser = ({ children }: { children: React.ReactNode }) => {
  const [wallet, setWallet] = useState<IWallet | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchWalletByUser = async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`/api/wallet/fetch-by-user/${id}`);
      setWallet(response.data.data); // assuming response = { success: true, data: {...wallet} }
    } catch (err: any) {
      const message =
        err?.response?.data?.message || err?.message || 'Error fetching wallet';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <WalletContext.Provider
      value={{
        wallet,
        loading,
        error,
        fetchWalletByUser,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
};

// Custom Hook
export const useUserWallet = () => {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error('useUserWallet must be used within a WalletUser');
  }
  return context;
};
