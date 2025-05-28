
"use client";
import React, { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";

export interface Category {
  _id?: string;
  id:string;
  name: string;
  module: {_id: string, name: string };
  image?: string;
  isDeleted?: boolean;
}

interface CategoryContextType {
  categories: Category[];
  fetchCategories: () => void;
  addCategory: (data: FormData) => void;
  updateCategory: (id: string, data: FormData) => void;
  deleteCategory: (id: string) => void;
  loading: boolean;
}

const CategoryContext = createContext<CategoryContextType | undefined>(undefined);

export const useCategory = () => {
  const context = useContext(CategoryContext);
  if (!context) throw new Error("useCategory must be used within CategoryProvider");
  return context;
};

export const CategoryProvider = ({ children }: { children: React.ReactNode }) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchCategories = async () => {
    try {
      const res = await axios.get("/api/category", {
        headers: { "Cache-Control": "no-store" },
      });
      if (res.data.success) setCategories(res.data.data);
    } catch (error) {
      console.error("Fetch categories error:", error);
    }
  };

  const addCategory = async (formData: FormData) => {
    setLoading(true);
    try {
       await axios.post("/api/category", formData);
       fetchCategories();
    } catch (error) {
      console.error("Add category error:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateCategory = async (id: string, formData: FormData) => {
    setLoading(true);
    try {
       await axios.put(`/api/category/${id}`, formData);
      fetchCategories();
    } catch (error) {
      console.error("Update category error:", error);
    } finally {
      setLoading(false);
    }
  };

  const deleteCategory = async (id: string) => {
    setLoading(true);
    try {
      const res = await axios.delete(`/api/category/${id}`);
      if (res.data.success) fetchCategories();
    } catch (error) {
      console.error("Delete category error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  return (
    <CategoryContext.Provider
      value={{ categories, fetchCategories, addCategory, updateCategory, deleteCategory, loading }}
    >
      {children}
    </CategoryContext.Provider>
  );
};

