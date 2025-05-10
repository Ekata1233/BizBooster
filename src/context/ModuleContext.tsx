"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";

// Define a type for the module
type Module = {
  _id: string;
    name: string;
    image: string;
    isDeleted: boolean;
    createdAt: string;
    updatedAt?: string;
    __v?: number;
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

  const fetchModules = async () => {
    try {
      const response = await axios.get("/api/modules");
      setModules(response.data.data);
    } catch (error) {
      console.error("Error fetching modules:", error);
    }
  };

  useEffect(() => {
    fetchModules();
  }, []);

  const addModule = async (formData: FormData) => {
    try {
      await axios.post("/api/modules", formData);
      fetchModules();
    } catch (error) {
      console.error("Error adding module:", error);
    }
  };

  const updateModule = async (id: string, formData: FormData) => {
    try {
      await axios.put(`/api/modules/${id}`, formData);
      fetchModules();
    } catch (error) {
      console.error("Error updating module:", error);
    }
  };

  const deleteModule = async (id: string) => {
    try {
      await axios.delete(`/api/modules/${id}`);
      fetchModules();
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

export const useModule = () => {
  const context = useContext(ModuleContext);
  if (!context) {
    throw new Error("useModule must be used within a ModuleProvider");
  }
  return context;
};
