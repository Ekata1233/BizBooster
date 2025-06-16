'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
export interface Provider {
  _id: string;
  fullName: string;
  email: string;
  phoneNo?: string;
  password?: string;
referralCode?: string | null;

  storeInfo?: Record<string, any>;
  kyc?: Record<string, any>;
  step1Completed?: boolean;
  storeInfoCompleted?: boolean;
  kycCompleted?: boolean;
  registrationStatus?: 'basic' | 'store' | 'done';
}

type ProviderContextType = {
  provider: Provider | null;
  providerDetails: Provider | null;
  loading: boolean;
  error: string | null;
  registerProvider: (data: FormData) => Promise<void>;
  updateStoreInfo: (data: FormData) => Promise<void>;
  updateKycInfo: (data: FormData) => Promise<void>;
  getProviderById: (id: string) => Promise<void>;
  updateProvider: (id: string, updates: any) => Promise<void>;
  deleteProvider: (id: string) => Promise<void>;
  getAllProviders: () => Promise<Provider[]>;
};

const ProviderContext = createContext<ProviderContextType | undefined>(undefined);

export const useProvider = () => {
  const context = useContext(ProviderContext);
  if (!context) throw new Error('useProvider must be used within ProviderContextProvider');
  return context;
};

export const ProviderContextProvider = ({ children }: { children: ReactNode }) => {
  const [provider, setProvider] = useState<Provider | null>(null);
  const [providerDetails, setProviderDetails] = useState<Provider | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const registerProvider = async (formData: FormData) => {
    setLoading(true);
    try {
      const res = await fetch('/api/provider/register', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Registration failed');

      setProvider(data.provider);

      setError(null);
      // return true; 
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const updateStoreInfo = async (formData: FormData) => {
    setLoading(true);
    try {
      const res = await fetch('/api/provider/store-info', {
        method: 'PUT',
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Store info update failed');

      setProvider(data.provider);
      setError(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const updateKycInfo = async (formData: FormData) => {
    setLoading(true);
    try {
      const res = await fetch('/api/provider/kyc', {
        method: 'PUT',
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'KYC update failed');

      setProvider(data.provider);
      setError(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getProviderById = async (id: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/provider/${id}`);
      const data = await res.json();

      if (!res.ok) throw new Error(data.message || 'Failed to fetch provider');
      setProvider(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const updateProvider = async (id: string, updates: any) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/provider/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to update provider');
      setProvider(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const deleteProvider = async (id: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/provider/${id}`, {
        method: 'DELETE',
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to delete provider');

      setProvider(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  const getAllProviders = async (): Promise<Provider[]> => {
    setLoading(true);
    try {
      const res = await fetch('/api/provider');
      const data = await res.json();

      if (!res.ok) throw new Error(data.message || 'Failed to fetch providers');
      setProviderDetails(data);
      setError(null);

      return data;
    } catch (err: any) {
      setError(err.message);
      return [];
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    const fetchProviders = async () => {
      const allProviders = await getAllProviders();
      console.log("All Providers:", allProviders);
    };

    fetchProviders();
  }, []);
  return (
    <ProviderContext.Provider
      value={{
        provider,
        providerDetails,
        loading,
        error,
        registerProvider,
        updateStoreInfo,
        updateKycInfo,
        getProviderById,
        updateProvider,
        deleteProvider,
        getAllProviders,
      }}
    >
      {children}
    </ProviderContext.Provider>
  );
};
