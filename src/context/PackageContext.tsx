'use client';

import axios from 'axios';
import React, { createContext, useContext, useState, useEffect } from 'react';

// /types/package.ts
export interface PackageType {
  _id?: string;
  description: {
    gp: string;
    sgp: string;
    pgp: string;
  };
  price: number;
  discount: number;
  discountedPrice: number;
  deposit: number;
  createdAt?: string;
  updatedAt?: string;
}


interface PackageContextProps {
  packages: PackageType[];
  loading: boolean;
  getPackages: () => void;
  addPackage: (pkg: PackageType) => void;
  updatePackage: (id: string, pkg: Partial<PackageType>) => void;
  deletePackage: (id: string) => void;
}

const PackageContext = createContext<PackageContextProps | undefined>(undefined);

export const PackageProvider = ({ children }: { children: React.ReactNode }) => {
  const [packages, setPackages] = useState<PackageType[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const getPackages = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/api/packages');
      // If your API always returns one package object, wrap it in an array
      const data = Array.isArray(res.data) ? res.data : res.data ? [res.data] : [];
      setPackages(data);
    } catch (err) {
      console.error('Error fetching packages:', err);
    } finally {
      setLoading(false);
    }
  };

  const addPackage = async (pkg: PackageType) => {
    try {
      const res = await axios.post('/api/packages', pkg);
      // Replace the package instead of adding new (since only one is allowed)
      setPackages([res.data]);
    } catch (err) {
      console.error('Error adding package:', err);
    }
  };

 const updatePackage = async (id: string, pkg: Partial<PackageType>) => {
  try {
    const res = await axios.put(`/api/packages/${id}`, pkg);
    setPackages([res.data]); // Only 1 package exists
  } catch (err) {
    console.error('Error updating package:', err);
  }
};




  const deletePackage = async (id: string) => {
    try {
      await axios.delete(`/api/packages/${id}`);
      setPackages(prev => prev.filter(p => p._id !== id));
    } catch (err) {
      console.error('Error deleting package:', err);
    }
  };

  useEffect(() => {
    getPackages();
  }, []);

  return (
    <PackageContext.Provider
      value={{ packages, loading, getPackages, addPackage, updatePackage, deletePackage }}
    >
      {children}
    </PackageContext.Provider>
  );
};

export const usePackage = () => {
  const context = useContext(PackageContext);
  if (!context) throw new Error('usePackage must be used within a PackageProvider');
  return context;
};
