"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";

export interface ExtraSection {
  description: string;
}

export interface WhyChooseItem {
  _id?: string;
  title: string;
  image: string;
  description: string;
  extraSections: ExtraSection[];
  createdAt?: string;
  updatedAt?: string;
}

interface WhyChooseContextProps {
  items: WhyChooseItem[];
  loading: boolean;
  fetchItems: () => void;
  addItem: (data: FormData) => Promise<void>;
  updateItem: (id: string, data: FormData) => Promise<void>;
  deleteItem: (id: string) => Promise<void>;
}

const WhyChooseContext = createContext<WhyChooseContextProps | undefined>(undefined);

export const WhyChooseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<WhyChooseItem[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const fetchItems = async () => {
    setLoading(true);
    try {
      const res = await axios.get("/api/whychoose");
      setItems(res.data);
    } catch (err) {
      console.error("Fetch Error:", err);
    } finally {
      setLoading(false);
    }
  };

  const addItem = async (formData: FormData) => {
    setLoading(true);
    try {
      const res = await axios.post("/api/whychoose", formData);
      setItems(prev => [res.data, ...prev]);
    } catch (err) {
      console.error("Add Error:", err);
    } finally {
      setLoading(false);
    }
  };

  const updateItem = async (id: string, formData: FormData) => {
    setLoading(true);
    try {
      const res = await axios.put(`/api/whychoose/${id}`, formData);
      setItems(prev => prev.map(item => (item._id === id ? res.data : item)));
    } catch (err) {
      console.error("Update Error:", err);
    } finally {
      setLoading(false);
    }
  };

  const deleteItem = async (id: string) => {
    setLoading(true);
    try {
      await axios.delete(`/api/whychoose/${id}`);
      setItems(prev => prev.filter(item => item._id !== id));
    } catch (err) {
      console.error("Delete Error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  return (
    <WhyChooseContext.Provider
      value={{ items, loading, fetchItems, addItem, updateItem, deleteItem }}
    >
      {children}
    </WhyChooseContext.Provider>
  );
};

export const useWhyChoose = () => {
  const context = useContext(WhyChooseContext);
  if (!context) {
    throw new Error("useWhyChoose must be used within a WhyChooseProvider");
  }
  return context;
};
