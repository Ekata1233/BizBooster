"use client";
import React, { createContext, useContext, useEffect, useState } from "react";

export interface Category {
  _id?: string;
  name: string;
  module: string;
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
      const res = await fetch("/api/category", { cache: "no-store" });
      const json = await res.json();
      if (json.success) setCategories(json.data);
    } catch (error) {
      console.error("Fetch categories error:", error);
    }
  };

  const addCategory = async (formData: FormData) => {
    setLoading(true);
    try {
      const res = await fetch("/api/category", {
        method: "POST",
        body: formData,
      });
      const json = await res.json();
      if (json.success) fetchCategories();
    } catch (error) {
      console.error("Add category error:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateCategory = async (id: string, formData: FormData) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/category/${id}`, {
        method: "PUT",
        body: formData,
      });
      const json = await res.json();
      if (json.success) fetchCategories();
    } catch (error) {
      console.error("Update category error:", error);
    } finally {
      setLoading(false);
    }
  };

  const deleteCategory = async (id: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/category/${id}`, {
        method: "DELETE",
      });
      const json = await res.json();
      if (json.success) fetchCategories();
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
