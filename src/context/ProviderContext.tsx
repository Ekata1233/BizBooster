'use client';

import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import axios from 'axios';

export interface ContactPerson {
  name: string;
  phoneNo: string;
  email: string;
}

export interface AccountInformation {
  email: string;
  phoneNo: string;
}

export interface Provider {
  _id: string;
  name: string;
  phoneNo: string;
  email: string;
  address: string;
  zone: 'east' | 'west' | 'south' | 'north' | 'central'; // ✅ added zone
  module: string;
  companyLogo?: string;
  identityType: 'passport' | 'driving license' | 'other';
  identityNumber: string;
  identificationImage: string;
  contactPerson: ContactPerson;
  accountInformation: AccountInformation;
  addressLatitude: number;
  addressLongitude: number;
  setBusinessPlan: 'commission base' | 'other';
  isDeleted: boolean;
}

interface ProviderContextType {
  providers: Provider[];
  loading: boolean;
  error: string | null;
  fetchProviders: () => void;
  createProvider: (data: FormData) => Promise<void>;
  updateProvider: (id: string, data: FormData) => Promise<void>;
  deleteProvider: (id: string) => Promise<void>;

  // *** ADDED login related types ***
  loginProvider: (email: string, password: string) => Promise<void>;
  token: string | null;
  loggedInProvider: Provider | null;
}

const ProviderContext = createContext<ProviderContextType | undefined>(undefined);

export function ProviderProvider({ children }: { children: ReactNode }) {
  const [providers, setProviders] = useState<Provider[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // *** ADDED login related states ***
  const [token, setToken] = useState<string | null>(null);
  const [loggedInProvider, setLoggedInProvider] = useState<Provider | null>(null);

  const fetchProviders = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/provider');
      setProviders(res.data.data);
      setError(null);
    } catch (err: unknown) {
  if (err instanceof Error) {
    setError(err.message || 'Failed to delete provider');
  } else {
    setError('Failed to delete provider');
  }
} finally {
      setLoading(false);
    }
  };

  const createProvider = async (formData: FormData) => {
    setLoading(true);
    try {
      const res = await axios.post('/api/provider', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setProviders((prev) => [...prev, res.data.data]);
      setError(null);
    } catch (err: unknown) {
  if (err instanceof Error) {
    setError(err.message || 'Failed to delete provider');
  } else {
    setError('Failed to delete provider');
  }
} finally {
      setLoading(false);
    }
  };

  const updateProvider = async (id: string, formData: FormData) => {
    setLoading(true);
    try {
      const res = await axios.put(`/api/provider/${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setProviders((prev) =>
        prev.map((p) => (p._id === id ? res.data.data : p))
      );
      setError(null);
    } catch (err: unknown) {
  if (err instanceof Error) {
    setError(err.message || 'Failed to delete provider');
  } else {
    setError('Failed to delete provider');
  }
} finally {
      setLoading(false);
    }
  };

  const deleteProvider = async (id: string) => {
    setLoading(true);
    try {
      await axios.delete(`/api/provider/${id}`);
      setProviders((prev) => prev.filter((p) => p._id !== id));
      setError(null);
    } catch (err: unknown) {
  if (err instanceof Error) {
    setError(err.message || 'Failed to delete provider');
  } else {
    setError('Failed to delete provider');
  }
}finally {
      setLoading(false);
    }
  };

  // *** ADDED loginProvider function ***
  const loginProvider = async (email: string, password: string) => {
    setLoading(true);
    try {
      const res = await axios.post('/api/provider/login', { email, password });
      if (res.data.success) {
        setToken(res.data.data.token);
        setLoggedInProvider(res.data.data.provider);
        setError(null);

        // Save token and provider info to localStorage for persistence
        localStorage.setItem('providerToken', res.data.data.token);
        localStorage.setItem('loggedInProvider', JSON.stringify(res.data.data.provider));
      } else {
        setError(res.data.message || 'Login failed');
      }
    } catch (err: unknown) {
  if (err instanceof Error) {
    setError(err.message || 'Failed to delete provider');
  } else {
    setError('Failed to delete provider');
  }
}finally {
      setLoading(false);
    }
  };

  // *** Auto-login on mount from localStorage ***
  useEffect(() => {
    const savedToken = localStorage.getItem('providerToken');
    const savedProvider = localStorage.getItem('loggedInProvider');
    if (savedToken && savedProvider) {
      setToken(savedToken);
      setLoggedInProvider(JSON.parse(savedProvider));
    }
  }, []);

  useEffect(() => {
    fetchProviders();
  }, []);

  return (
    <ProviderContext.Provider
      value={{
        providers,
        loading,
        error,
        fetchProviders,
        createProvider,
        updateProvider,
        deleteProvider,
        loginProvider,
        token,
        loggedInProvider,
      }}
    >
      {children}
    </ProviderContext.Provider>
  );
}

export function useProvider() {
  const context = useContext(ProviderContext);
  if (!context) {
    throw new Error('useProvider must be used within a ProviderProvider');
  }
  return context;
}
