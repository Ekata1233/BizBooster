"use client";
import React, { createContext, useContext, useState, useEffect } from "react";

const SubcategoryContext = createContext<any>(null);

export const SubcategoryProvider = ({ children }: { children: React.ReactNode }) => {
  const [subcategories, setSubcategories] = useState([]);

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

export const useSubcategory = () => useContext(SubcategoryContext);
