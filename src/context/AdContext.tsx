'use client';
import axios from 'axios';
import React, { createContext, useContext, useEffect, useState } from 'react';

export interface AdType {
  _id?: string;
  addType: 'image' | 'video';
  category: string;
  service: string;
  startDate: string;
  endDate: string;
  title: string;
  description: string;
  fileUrl: string;
}

interface AdContextType {
  ads: AdType[];
  fetchAds: () => void;
  createAd: (data: FormData) => Promise<void>;
  deleteAd: (id: string) => Promise<void>;
  updateAd: (id: string, body: Partial<AdType>) => Promise<void>;
}

const AdContext = createContext<AdContextType | null>(null);

export const AdProvider = ({ children }: { children: React.ReactNode }) => {
  const [ads, setAds] = useState<AdType[]>([]);

  const fetchAds = async () => {
    const res = await axios.get('/ads');
    setAds(res.data.data);
  };

  const createAd = async (formData: FormData) => {
    const res = await axios.post('/ads', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    fetchAds();
  };

  const deleteAd = async (id: string) => {
    await axios.delete(`/ads/${id}`);
    setAds(prev => prev.filter(ad => ad._id !== id));
  };

  const updateAd = async (id: string, data: Partial<AdType>) => {
    const res = await axios.put(`/ads/${id}`, data);
    fetchAds();
  };

  useEffect(() => {
    fetchAds();
  }, []);

  return (
    <AdContext.Provider value={{ ads, fetchAds, createAd, deleteAd, updateAd }}>
      {children}
    </AdContext.Provider>
  );
};

export const useAdContext = () => {
  const context = useContext(AdContext);
  if (!context) throw new Error('useAdContext must be used within AdProvider');
  return context;
};
