'use client';
import axios from 'axios';
import React, { createContext, useContext, useEffect, useState } from 'react';

export interface AdType {
  _id: string;
  addType: 'image' | 'video';
  startDate: string;
  endDate: string;
  title: string;
  description: string;
  fileUrl: string;
  isApproved: boolean; 
  isExpired: boolean;
  category: {
    name: string;
  };
  service: {
    serviceName: string;
  };
}

interface AdContextType {
  ads: AdType[];
  fetchAds: () => void;
  createAd: (data: FormData) => Promise<void>;
  deleteAd: (id: string) => Promise<void>;
  updateAd: (id: string, body: Partial<AdType>) => Promise<void>;
  approveAd: (id: string) => Promise<void>;
}

const AdContext = createContext<AdContextType | null>(null);

export const AdProvider = ({ children }: { children: React.ReactNode }) => {
  const [ads, setAds] = useState<AdType[]>([]);

  const fetchAds = async () => {
    try {
      const res = await axios.get<{ data: AdType[] }>('/api/ads/all');
      setAds(res.data.data);
    } catch (err) {
      console.error('Failed to fetch ads:', err);
    }
  };

  const createAd = async (formData: FormData) => {
    try {
      await axios.post('/api/ads', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      fetchAds();
    } catch (err) {
      console.error('Failed to create ad:', err);
    }
  };

    const deleteAd = async (id: string): Promise<boolean> => {
    try {
      const res = await axios.delete(`/api/ads/${id}`);
      if (res.data.success) {
        setAds((prev) => prev.filter((ad) => ad._id !== id));
        return true;
      }
      return false;
    } catch (error) {
      console.error("Error deleting ad:", error);
      return false;
    }
  };

  const updateAd = async (id: string, data: Partial<AdType>) => {
    try {
      await axios.put(`/api/ads/${id}`, data);
      fetchAds();
    } catch (err) {
      console.error('Failed to update ad:', err);
    }
  };

  const approveAd = async (id: string) => {
    try {
      await axios.put(`/api/ads/approve/${id}`);
      fetchAds();
    } catch (err) {
      console.error('Error approving ad:', err);
    }
  };

  useEffect(() => {
    fetchAds();
  }, []);

  return (
    <AdContext.Provider value={{ ads, fetchAds, createAd, deleteAd, updateAd, approveAd }}>
      {children}
    </AdContext.Provider>
  );
};

export const useAdContext = () => {
  const context = useContext(AdContext);
  if (!context) throw new Error('useAdContext must be used within AdProvider');
  return context;
};
