"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

const ModuleContext = createContext<any>(null);

export const ModuleProvider = ({ children }: { children: React.ReactNode }) => {
  const [modules, setModules] = useState([]);

  const fetchModules = async () => {
    const res = await fetch("/api/module");
    const data = await res.json();
    setModules(data);
  };

  useEffect(() => {
    fetchModules();
  }, []);

  const addModule = async (formData: FormData) => {
    const res = await fetch("/api/module", {
      method: "POST",
      body: formData,
    });
    fetchModules();
  };

  const updateModule = async (id: string, formData: FormData) => {
    const res = await fetch(`/api/module/${id}`, {
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

export const useModule = () => useContext(ModuleContext);
