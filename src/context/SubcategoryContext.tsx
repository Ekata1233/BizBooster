


"use client";
import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

// Define the shape of a subcategory
interface Subcategory {
  _id: string;
  id: string;
  name: string;
  category: { _id: string, name: string };
  image?: string;
  isDeleted?: boolean;
  // Add any other fields that are part of your subcategory
}

// Define the context value type
interface SubcategoryContextType {
  fetchSubcategories: () => Promise<void>;
  subcategories: Subcategory[];
  addSubcategory: (formData: FormData) => Promise<void>;
  updateSubcategory: (id: string, formData: FormData) => Promise<void>;
  deleteSubcategory: (id: string) => Promise<void>;
  updateSubcategoryOrder: (subcategories: { _id: string; sortOrder: number }[]) => Promise<void>;
}


const SubcategoryContext = createContext<SubcategoryContextType | null>(null);

export const SubcategoryProvider = ({ children }: { children: React.ReactNode }) => {
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);

  const fetchSubcategories = async () => {
    try {
      const res = await axios.get("/api/subcategory");
      setSubcategories(res.data.data);
    } catch (error) {
      console.error("Fetch subcategories error:", error);
    }
  };

  useEffect(() => {
    fetchSubcategories();
  }, []);

  const addSubcategory = async (formData: FormData) => {
    try {
      await axios.post("/api/subcategory", formData);
      fetchSubcategories();
    }
    catch (error: unknown) {
      console.error("Add subcategory error:", error);

      if (
        typeof error === "object" &&
        error !== null &&
        "response" in error &&
        typeof (error as { response?: { data?: { message?: string } } }).response?.data?.message === "string"
      ) {
        throw new Error(
          (error as { response: { data: { message: string } } }).response.data.message
        );
      }

      throw new Error("Something went wrong while adding subcategory.");
    }

  };

  const updateSubcategory = async (id: string, formData: FormData) => {
    try {
      await axios.put(`/api/subcategory/${id}`, formData);
      fetchSubcategories();
    } catch (error) {
      console.error("Update subcategory error:", error);
    }
  };

  const updateSubcategoryOrder = async (reordered: any[]) => {
  try {
    await axios.post("/api/subcategory/reorder", { subcategories: reordered });
    setSubcategories(reordered);
  } catch (err) {
    console.error("Order update failed", err);
  }
};

  const deleteSubcategory = async (id: string) => {
    try {
      await axios.delete(`/api/subcategory/${id}`);
      fetchSubcategories();
    } catch (error) {
      console.error("Delete subcategory error:", error);
    }
  };

  return (
    <SubcategoryContext.Provider
      value={{ subcategories, addSubcategory, updateSubcategory, deleteSubcategory,fetchSubcategories, updateSubcategoryOrder, 
  }}
    >
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
