'use client';
import React, { createContext, useContext, useEffect, useState } from 'react';
import axios from 'axios';

export interface ServiceType {
  _id?: string;
  serviceName: string;
  category: string;
  subcategory: string;
  price: number;
  thumbnailImage: string;
  bannerImages: string[];
  serviceDetails: any;
  franchiseDetails: any;
  isDeleted?: boolean;
}

interface ServiceContextType {
  services: ServiceType[];
  fetchServices: () => void;
  createService: (formData: FormData) => void;
  loading: boolean;
}

const ServiceContext = createContext<ServiceContextType | undefined>(undefined);

export const ServiceProvider = ({ children }: { children: React.ReactNode }) => {
  const [services, setServices] = useState<ServiceType[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchServices = async () => {
    setLoading(true);
    const res = await axios.get('/api/service');
    setServices(res.data.data);
    setLoading(false);
  };

  const createService = async (formData: FormData) => {
    setLoading(true);
    await axios.post('/api/service', formData);
    await fetchServices();
    setLoading(false);
  };

  useEffect(() => {
    fetchServices();
  }, []);

  return (
    <ServiceContext.Provider value={{ services, fetchServices, createService, loading }}>
      {children}
    </ServiceContext.Provider>
  );
};

export const useServiceContext = () => {
  const context = useContext(ServiceContext);
  if (!context) {
    throw new Error('useServiceContext must be used within a ServiceProvider');
  }
  return context;
};
