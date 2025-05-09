"use client";
import React, { createContext, useContext, useState, useEffect } from "react";

// Define the shape of a subcategory
interface Subcategory {
  id: string;
  name: string;
  // Add any other fields that are part of your subcategory
}

// Define the context value type
interface SubcategoryContextType {
  subcategories: Subcategory[];
  addSubcategory: (formData: FormData) => Promise<void>;
  updateSubcategory: (id: string, formData: FormData) => Promise<void>;
  deleteSubcategory: (id: string) => Promise<void>;
}

const SubcategoryContext = createContext<SubcategoryContextType | null>(null);

export const SubcategoryProvider = ({ children }: { children: React.ReactNode }) => {
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);

  const fetchSubcategories = async () => {
    const res = await fetch("/api/subcategory");
    const data = await res.json();
    setSubcategories(data.data);
  };

  useEffect(() => {
    fetchSubcategories();
  }, []);

  const addSubcategory = async (formData: FormData) => {
    await fetch("/api/subcategory", {
      method: "POST",
      body: formData,
    });
    fetchSubcategories();
  };

  const updateSubcategory = async (id: string, formData: FormData) => {
    await fetch(`/api/subcategory/${id}`, {
      method: "PUT",
      body: formData,
    });
    fetchSubcategories();
  };

  const deleteSubcategory = async (id: string) => {
    await fetch(`/api/subcategory/${id}`, {
      method: "DELETE",
    });
    fetchSubcategories();
  };

  return (
    <SubcategoryContext.Provider value={{ subcategories, addSubcategory, updateSubcategory, deleteSubcategory }}>
      {children}
    </SubcategoryContext.Provider>
  );
};

export const useSubcategory = () => {
  const context = useContext(SubcategoryContext);
  if (!context) {
    throw new Error("useSubcategory must be used within a SubcategoryProvider");
  }
  return context;
};
