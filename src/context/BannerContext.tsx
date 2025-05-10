"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

interface Banner {
  _id: string;
  image: string;
  isDeleted: boolean;
}

interface BannerContextType {
  banners: Banner[];
  addBanner: (image: string) => Promise<void>;
  deleteBanner: (id: string) => Promise<void>;
}

const BannerContext = createContext<BannerContextType | undefined>(undefined);

export const BannerProvider = ({ children }: { children: React.ReactNode }) => {
  const [banners, setBanners] = useState<Banner[]>([]);

  useEffect(() => {
    const fetchBanners = async () => {
      const res = await fetch("/api/banner");
      const data = await res.json();
      setBanners(data);
    };
    fetchBanners();
  }, []);

  const addBanner = async (image: string) => {
    const res = await fetch("/api/banner", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ image }),
    });
    const data = await res.json();
    setBanners((prev) => [...prev, data]);
  };

  const deleteBanner = async (id: string) => {
    await fetch(`/api/banner/${id}`, { method: "DELETE" });
    setBanners((prev) => prev.filter((b) => b._id !== id));
  };

  return (
    <BannerContext.Provider value={{ banners, addBanner, deleteBanner }}>
      {children}
    </BannerContext.Provider>
  );
};

export const useBannerContext = () => {
  const context = useContext(BannerContext);
  if (!context) throw new Error("useBannerContext must be used within BannerProvider");
  return context;
};
