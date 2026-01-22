'use client';

import { IProviderWallet } from '@/models/ProviderWallet';
import axios from 'axios';
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface SubscribedService {
  _id: string;
  serviceName: string;
  price: number;
  discountedPrice: number;
  isDeleted: boolean;
}
export interface Provider {
  _id: string;
  fullName: string;
  email: string;
  phoneNo?: string;
  password?: string;
  referralCode?: string | null;
  subscribedServices?: SubscribedService[];

  storeInfo?: Record<string, any>;
  kyc?: Record<string, any>;
  galleryImages?: string[];
  step1Completed?: boolean;
  storeInfoCompleted?: boolean;
  kycCompleted?: boolean;
  registrationStatus?: 'basic' | 'store' | 'done';
}

type ProviderContextType = {
  wallet: IProviderWallet | null;
  allWallet: IProviderWallet[];
  provider: Provider | null;
  providerDetails: Provider | null;
  loading: boolean;
  error: string | null;
  registerProvider: (data: FormData) => Promise<void>;
  updateStoreInfo: (data: FormData) => Promise<void>;
  updateKycInfo: (data: FormData) => Promise<void>;
  getProviderById: (id: string) => Promise<Provider>;
  updateProvider: (id: string, updates: any) => Promise<void>;
  deleteProvider: (id: string) => Promise<void>;
  getAllProviders: () => Promise<Provider[]>;
  getProvidersByServiceId: (serviceId: string) => Promise<Provider[]>;
  fetchWalletByProvider: (providerId: string) => Promise<void>;
   fetchAllWallet: () => Promise<void>; 
  getGalleryImages: (providerId: string) => Promise<string[]>;
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
  const [providersByService, setProvidersByService] = useState<Provider[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [wallet, setWallet] = useState<IProviderWallet | null>(null);
  const [allWallet, setAllWallet] = useState<IProviderWallet[]>([]);

 
const registerProvider = async (formData: FormData) => {
  setLoading(true);
  try {
    const res = await fetch(`/api/provider/register`, {
      method: 'POST',
      body: formData,
      credentials: 'include',
    });

    const data = await res.json();
    console.log("data at the time of registration : ", data);
    
    if (!res.ok) {
      throw new Error(data.message || 'Registration failed');
    }
    
    if (data.token) {
      localStorage.setItem('token', data.token);
    }
    setProvider(data.provider);
    setError(null);
  } catch (err: unknown) {
    const error = err as Error;
    setError(error.message);
    throw error; // Re-throw the error
  } finally {
    setLoading(false);
  }
};

// Apply the same pattern to updateStoreInfo and updateKycInfo
const updateStoreInfo = async (formData: FormData) => {
  setLoading(true);
  try {
    const token = localStorage.getItem('token');
    const res = await fetch(`/api/provider/store-info`, {
      method: 'PUT',
      body: formData,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Store info update failed');
    setProvider(data.provider);
    setError(null);
  } catch (err: unknown) {
    const error = err as Error;
    setError(error.message);
    throw error; // Re-throw the error
  } finally {
    setLoading(false);
  }
};

const updateKycInfo = async (formData: FormData) => {
  setLoading(true);
  try {
    const token = localStorage.getItem('token');
    const res = await fetch(`/api/provider/kyc`, {
      method: 'PUT',
      body: formData,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'KYC update failed');
    setProvider(data.provider);
    setError(null);
  } catch (err: unknown) {
    const error = err as Error;
    setError(error.message);
    throw error; // Re-throw the error
  } finally {
    setLoading(false);
  }
};

  const getProviderById = async (id: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/provider/${id}`);
      const data = await res.json();

      console.log("res : ", res);

      if (!res.ok) throw new Error(data.message || 'Failed to fetch provider');
      setProvider(data);
      return data;
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

  const getProvidersByServiceId = async (serviceId: string): Promise<Provider[]> => {
    setLoading(true);
    try {
      const res = await fetch(`/api/provider/findByService/${serviceId}`);
      const data = await res.json();

      if (!res.ok) throw new Error(data.message || 'Failed to fetch providers by serviceId');

      setProvidersByService(data.data || []);
      setError(null);
      return data.data || [];
    } catch (err: any) {
      setError(err.message);
      return [];
    } finally {
      setLoading(false);
    }
  };

  const fetchWalletByProvider = async (providerId: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`/api/provider/wallet/${providerId}`);
      setWallet(response.data.data); // assuming { success: true, data: {...wallet} }
    } catch (err: any) {
      const message =
        err?.response?.data?.message || err?.message || "Error fetching wallet";
      setError(message);
    } finally {
      setLoading(false);
    }
  };
  const getGalleryImages = async (providerId: string): Promise<string[]> => {
    try {
      const response = await axios.get(`/api/provider/${providerId}/gallery`);
      return response.data.galleryImages || [];
    } catch (err: any) {
      const message =
        err?.response?.data?.message || err?.message || "Failed to fetch gallery images";
      setError(message);
      return [];
    }
  };

  const fetchAllWallet = async () => {
  setLoading(true);
  setError(null);
  try {
    const response = await axios.get("/api/provider/wallet/all");
    setAllWallet(response.data.data || []); // assuming { success: true, data: [...] }
  } catch (err: any) {
    const message =
      err?.response?.data?.message || err?.message || "Error fetching all wallets";
    setError(message);
  } finally {
    setLoading(false);
  }
};


  useEffect(() => {
    const fetchProviders = async () => {
      const allProviders = await getAllProviders();
    };

    fetchProviders();
  }, []);
  return (
    <ProviderContext.Provider
      value={{
        wallet,
         allWallet,
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
        getProvidersByServiceId,
        fetchWalletByProvider,
         fetchAllWallet, 
        getGalleryImages,
      }}
    >
      {children}
    </ProviderContext.Provider>
  );
};
