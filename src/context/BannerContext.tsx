"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

interface ImageInfo {
  url: string;
  category: string;
  module: string;
}

interface Banner {
  _id: string;
  images: ImageInfo[];
  page: "homepage" | "categorypage";
  isDeleted: boolean;
}

interface BannerContextType {
  banners: Banner[];
  addBanner: (formData: FormData) => Promise<void>;
  deleteBanner: (id: string) => Promise<void>;
  updateBanner: (formData: FormData) => Promise<void>;
}

const BannerContext = createContext<BannerContextType | undefined>(undefined);

export const BannerProvider = ({ children }: { children: React.ReactNode }) => {
  const [banners, setBanners] = useState<Banner[]>([]);

  // Fetch all banners
  const fetchBanners = async () => {
    try {
      const res = await fetch("/api/banner");
      if (!res.ok) throw new Error("Failed to fetch banners");
      const json = await res.json();
      setBanners(json.data);
    } catch (error) {
      console.error("Error fetching banners:", error);
    }
  };
console.log(banners);

  useEffect(() => {
    fetchBanners();
  }, []);

  // Add a new banner
  const addBanner = async (formData: FormData) => {
    try {
      const res = await fetch("/api/banner", {
        method: "POST",
        body: formData,
      });
      if (!res.ok) throw new Error("Failed to add banner");
      const json = await res.json();
      setBanners((prev) => [...prev, json.data]);
    } catch (error) {
      console.error("Error adding banner:", error);
    }
  };

  // Delete a banner by ID (soft delete)
  const deleteBanner = async (id: string) => {
    try {
      const res = await fetch(`/api/banner/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete banner");
      setBanners((prev) => prev.filter((b) => b._id !== id));
    } catch (error) {
      console.error("Error deleting banner:", error);
    }
  };

  // Update banner by ID
  const updateBanner = async (formData: FormData) => {
    try {
      const id = formData.get("id") as string;
      if (!id) throw new Error("Missing banner ID in form data");

      const res = await fetch(`/api/banner/${id}`, {
        method: "PUT",
        body: formData,
      });
      if (!res.ok) throw new Error("Failed to update banner");
      const json = await res.json();

      setBanners((prev) =>
        prev.map((banner) => (banner._id === id ? json.data : banner))
      );
    } catch (error) {
      console.error("Error updating banner:", error);
    }
  };

  return (
    <BannerContext.Provider
      value={{ banners, addBanner, deleteBanner, updateBanner }}
    >
      {children}
    </BannerContext.Provider>
  );
};

export const useBannerContext = () => {
  const context = useContext(BannerContext);
  if (!context)
    throw new Error("useBannerContext must be used within BannerProvider");
  return context;
};
