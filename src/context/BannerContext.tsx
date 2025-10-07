'use client';

import axios from 'axios';
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface Banner {
  _id: string;
  page: string;
  selectionType: string;
  category?: string;
  subcategory?: string;
  service?: string;
  referralUrl?: string;
  file: string;
  isDeleted: boolean;
}

interface BannerContextType {
  banners: Banner[];
  fetchBanners: () => void;
  createBanner: (data: FormData) => void;
  updateBanner: (id: string, data: FormData) => void;
  deleteBanner: (id: string) => void;
}

const BannerContext = createContext<BannerContextType | undefined>(undefined);

export const useBanner = () => useContext(BannerContext)!;

export const BannerProvider = ({ children }: { children: ReactNode }) => {
  const [banners, setBanners] = useState<Banner[]>([]);

 const fetchBanners = async () => {
  try {
    // Type the response so TypeScript knows the structure
    const res = await axios.get<{ data: Banner[] }>('/api/banner');

    setBanners(res.data); // ✅ now TypeScript knows it's Banner[]
  } catch (error) {
    console.error('Error fetching banners:', error);
  }
};


  const createBanner = async (formData: FormData) => {
    await axios.post('/api/banner', formData);
    fetchBanners();
  };

  const updateBanner = async (id: string, formData: FormData) => {
    await axios.put(`/api/banner/${id}`, formData);
    fetchBanners();
  };
  // console.log("Banners ", banners);

  const deleteBanner = async (id: string) => {
    await axios.delete(`/api/banner/${id}`);
    fetchBanners();
  };

  useEffect(() => {
    fetchBanners();
  }, []);

  return (
    <BannerContext.Provider value={{ banners, fetchBanners, createBanner, updateBanner, deleteBanner }}>
      {children}
    </BannerContext.Provider>
  );
};
