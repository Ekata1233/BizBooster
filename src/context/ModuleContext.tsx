"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";

// Define the Module type with additional fields
type Module = {
  id: string;
  name: string;
  description: string;
  image?: string;  // Optional, in case you deal with image files
  isDeleted: boolean;
};

interface ModuleContextType {
  modules: Module[];
  addModule: (formData: FormData) => Promise<void>;
  updateModule: (id: string, formData: FormData) => Promise<void>;
  deleteModule: (id: string) => Promise<void>;
}

const ModuleContext = createContext<ModuleContextType | null>(null);

export const ModuleProvider = ({ children }: { children: React.ReactNode }) => {
  const [modules, setModules] = useState<Module[]>([]);

  // Fetch modules from the API
  const fetchModules = async () => {
    try {
      const response = await axios.get("/api/modules");
      setModules(response.data);  // Ensure your API returns an array of `Module`
    } catch (error) {
      console.error("Error fetching modules:", error);
    }
  };

  // Fetch modules when the component mounts
  useEffect(() => {
    fetchModules();
  }, []);

  // Add new module to the system
  const addModule = async (formData: FormData) => {
    try {
      await axios.post("/api/modules", formData);
      fetchModules();  // Re-fetch modules after adding a new one
    } catch (error) {
      console.error("Error adding module:", error);
    }
  };

  // Update existing module
  const updateModule = async (id: string, formData: FormData) => {
    try {
      await axios.put(`/api/modules/${id}`, formData);
      fetchModules();  // Re-fetch modules after updating one
    } catch (error) {
      console.error("Error updating module:", error);
    }
  };

  // Delete a module by ID
  const deleteModule = async (id: string) => {
    try {
      await axios.delete(`/api/modules/${id}`);
      fetchModules();  // Re-fetch modules after deleting one
    } catch (error) {
      console.error("Error deleting module:", error);
    }
  };

  return (
    <ModuleContext.Provider value={{ modules, addModule, updateModule, deleteModule }}>
      {children}
    </ModuleContext.Provider>
  );
};

// Custom hook to use module context
export const useModule = () => {
  const context = useContext(ModuleContext);
  if (!context) {
    throw new Error("useModule must be used within a ModuleProvider");
  }
  return context;
};
