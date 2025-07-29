// context/GalleryContext.tsx
"use client";

import React, { createContext, useContext, useState,  } from "react";
import axios from "axios";

interface GalleryContextType {
  galleryImages: string[];
  loading: boolean;
  fetchGallery: (providerId: string) => Promise<void>;
  uploadImages: (providerId: string, files: File[]) => Promise<void>;
  replaceImage: (providerId: string, index: number, file: File) => Promise<void>;
  deleteImage: (providerId: string, index: number) => Promise<void>;
}

const GalleryContext = createContext<GalleryContextType | undefined>(undefined);

export const useGallery = () => {
  const context = useContext(GalleryContext);
  if (!context) throw new Error("useGallery must be used within a GalleryProvider");
  return context;
};

export const GalleryProvider = ({ children }: { children: React.ReactNode }) => {
  const [galleryImages, setGalleryImages] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(false);


  const fetchGallery = async (providerId: string) => {
    setLoading(true);
    try {
      const res = await axios.get(`/api/provider/${providerId}/gallery`);
      setGalleryImages(res.data.galleryImages || []);
    } catch (error) {
      console.error("Fetch Gallery Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const uploadImages = async (providerId: string, files: File[]) => {
    setLoading(true);
    try {
      const formData = new FormData();
      files.forEach((file) => formData.append("galleryImages", file));

      const res = await axios.patch(`/api/provider/${providerId}/gallery`, formData);
      setGalleryImages(res.data.data || []);
    } catch (error) {
      console.error("Upload Images Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const replaceImage = async (providerId: string, index: number, file: File) => {
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("newImage", file);

      const res = await axios.patch(`/api/provider/${providerId}/gallery/${index}`, formData);
      setGalleryImages(res.data.updatedImages || []);
    } catch (error) {
      console.error("Replace Image Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const deleteImage = async (providerId: string, index: number) => {
    setLoading(true);
    try {
      const res = await axios.delete(`/api/provider/${providerId}/gallery/${index}`);
      setGalleryImages(res.data.updatedImages || []);
    } catch (error) {
      console.error("Delete Image Error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <GalleryContext.Provider
      value={{ galleryImages, loading, fetchGallery, uploadImages, replaceImage, deleteImage }}
    >
      {children}
    </GalleryContext.Provider>
  );
};
