'use client';
import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";
import axios from "axios";

type Service = {
  // Define the properties of a Service object according to your API response
  _id: string;
  name: string;
  // add other fields if necessary
};

type ServiceContextType = {
  services: Service[];
  createService: (formData: FormData) => Promise<Service | undefined>;
  updateService: (id: string, data: any) => Promise<Service | undefined>;
  deleteService: (id: string) => Promise<void>;
};

const ServiceContext = createContext<ServiceContextType | undefined>(undefined);

export const ServiceProvider = ({ children }: { children: ReactNode }) => {
  const [services, setServices] = useState<Service[]>([]);

  const fetchServices = useCallback(async () => {
    try {
      const res = await axios.get<Service[]>("/api/service");
      setServices(res.data);
    } catch (error) {
      console.error("Failed to fetch services:", error);
    }
  }, []);

  useEffect(() => {
    fetchServices();
  }, [fetchServices]);

  const createService = async (formData: FormData) => {
    try {
      const res = await axios.post<Service>("/api/service", formData);
      await fetchServices();
      return res.data;
    } catch (error) {
      console.error("Failed to create service:", error);
    }
  };

  const updateService = async (id: string, data: any) => {
    try {
      const res = await axios.put<Service>(`/api/service/${id}`, data);
      await fetchServices();
      return res.data;
    } catch (error) {
      console.error("Failed to update service:", error);
    }
  };

  const deleteService = async (id: string) => {
    try {
      await axios.delete(`/api/service/${id}`);
      await fetchServices();
    } catch (error) {
      console.error("Failed to delete service:", error);
    }
  };

  return (
    <ServiceContext.Provider value={{ services, createService, updateService, deleteService }}>
      {children}
    </ServiceContext.Provider>
  );
};

export const useService = (): ServiceContextType => {
  const context = useContext(ServiceContext);
  if (!context) {
    throw new Error("useService must be used within a ServiceProvider");
  }
  return context;
};
