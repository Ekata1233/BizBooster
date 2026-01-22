"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";
import axios from "axios";

// Types
export interface CategoryBannerType {
  _id: string;
  module: {
    _id: string;
    name: string;
    image: string;
  };
  image: string;
  createdAt: string;
  updatedAt: string;
}

interface CategoryBannerContextType {
  banners: CategoryBannerType[];
  fetchBanners: (moduleId?: string) => Promise<void>;
  createBanner: (formData: FormData) => Promise<void>;
  updateBanner: (id: string, formData: FormData) => Promise<void>;
  deleteBanner: (id: string) => Promise<void>;
}

const CategoryBannerContext = createContext<CategoryBannerContextType | null>(
  null
);

// Provider
export const CategoryBannerProvider = ({ children }: { children: ReactNode }) => {
  const [banners, setBanners] = useState<CategoryBannerType[]>([]);

  // ✅ Fetch all or by module
  const fetchBanners = async (moduleId?: string) => {
    try {
      const url = moduleId
        ? `/api/categorybanner?moduleId=${moduleId}`
        : "/api/categorybanner";

      const res = await axios.get(url);
      setBanners(res.data.data);
    } catch (error: any) {
      console.error("Fetch banners error:", error.response?.data?.message || error.message);
    }
  };

  // ✅ Create banner
  const createBanner = async (formData: FormData) => {
    try {
      await axios.post("/api/categorybanner", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      await fetchBanners(); // refresh list
    } catch (error: any) {
      console.error("Create banner error:", error.response?.data?.message || error.message);
    }
  };

  // ✅ Update banner
  const updateBanner = async (id: string, formData: FormData) => {
    try {
      await axios.put(`/api/categorybanner/${id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      await fetchBanners(); // refresh list
    } catch (error: any) {
      console.error("Update banner error:", error.response?.data?.message || error.message);
    }
  };

  // ✅ Delete banner
  const deleteBanner = async (id: string) => {
    try {
      await axios.delete(`/api/categorybanner/${id}`);
      setBanners(prev => prev.filter(b => b._id !== id));
    } catch (error: any) {
      console.error("Delete banner error:", error.response?.data?.message || error.message);
    }
  };

  return (
    <CategoryBannerContext.Provider
      value={{ banners, fetchBanners, createBanner, updateBanner, deleteBanner }}
    >
      {children}
    </CategoryBannerContext.Provider>
  );
};

// Hook
export const useCategoryBanner = () => {
  const context = useContext(CategoryBannerContext);
  if (!context) {
    throw new Error("useCategoryBanner must be used within CategoryBannerProvider");
  }
  return context;
};
