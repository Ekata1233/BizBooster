'use client';
import { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

const ServiceContext = createContext<any>(null);

export const ServiceProvider = ({ children }: { children: React.ReactNode }) => {
  const [services, setServices] = useState([]);

  const fetchServices = async () => {
    const res = await axios.get("/api/service");
    setServices(res.data);
  };

  useEffect(() => {
    fetchServices();
  }, []);

  const createService = async (formData: FormData) => {
    const res = await axios.post("/api/service", formData);
    fetchServices();
    return res.data;
  };

  const updateService = async (id: string, data: any) => {
    const res = await axios.put(`/api/service/${id}`, data);
    fetchServices();
    return res.data;
  };

  const deleteService = async (id: string) => {
    await axios.delete(`/api/service/${id}`);
    fetchServices();
  };

  return (
    <ServiceContext.Provider value={{ services, createService, updateService, deleteService }}>
      {children}
    </ServiceContext.Provider>
  );
};

export const useService = () => useContext(ServiceContext);
