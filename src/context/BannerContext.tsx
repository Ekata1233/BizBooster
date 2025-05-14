"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

interface Banner {
  _id: string;
  images: string[];
  page: "homepage" | "categorypage";
  isDeleted: boolean;
}

interface BannerContextType {
  banners: Banner[];
  addBanner: (image: File, page: "homepage" | "categorypage") => Promise<void>;
  deleteBanner: (id: string) => Promise<void>;
  updateBanner: (formData: FormData) => Promise<void>;
}

const BannerContext = createContext<BannerContextType | undefined>(undefined);

export const BannerProvider = ({ children }: { children: React.ReactNode }) => {
  const [banners, setBanners] = useState<Banner[]>([]);


  const fetchBanners = async () => {
    const res = await fetch("/api/banner");
    const json = await res.json();
    setBanners(json.data);
  };
  useEffect(() => {
    fetchBanners();
  }, []);

  const addBanner = async (image: File, page: "homepage" | "categorypage") => {
    const formData = new FormData();
    formData.append("image", image);
    formData.append("page", page);

    const res = await fetch("/api/banner", {
      method: "POST",
      body: formData,
    });

    const json = await res.json();
    setBanners((prev) => [...prev, json.data]);
  };

  const deleteBanner = async (id: string) => {
    await fetch(`/api/banner/${id}`, { method: "DELETE" });
    setBanners((prev) => prev.filter((b) => b._id !== id));
  };
  const updateBanner = async (formData: FormData) => {
    const id = formData.get("id") as string;
    const res = await fetch(`/api/banner/${id}`, {
      method: "PUT",
      body: formData,
    });

    const json = await res.json();

    setBanners((prev) =>
      prev.map((banner) => (banner._id === id ? json.data : banner))
    );
    fetchBanners();
  };
  return (
    <BannerContext.Provider value={{ banners, addBanner, deleteBanner, updateBanner }}>
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
