"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

// Define a type for the module
type Module = {
  id: string;
  name: string;
  description: string;
  // Add other properties as needed
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
    const response = await fetch("/api/modules");
    const data = await response.json();
    setModules(data);
  };

  useEffect(() => {
    fetchModules();
  }, []);

  const addModule = async (formData: FormData) => {
    await fetch("/api/module", {
      method: "POST",
      body: formData,
    });
    fetchModules();
  };

  const updateModule = async (id: string, formData: FormData) => {
    await fetch(`/api/module/${id}`, {
      method: "PUT",
      body: formData,
    });
    fetchModules();
  };

  const deleteModule = async (id: string) => {
    await fetch(`/api/module/${id}`, {
      method: "DELETE",
    });
    fetchModules();
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
