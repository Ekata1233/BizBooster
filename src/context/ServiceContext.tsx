'use client';
import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";
import axios from "axios";

interface ExtraSection {
  title: string;
  description: string;
}

interface WhyChooseItem {
  title: string;
  description: string;
  image: string;
}

interface FaqItem {
  question: string;
  answer: string;
}

interface ServiceDetails {
  overview: string;
  highlight: string;
  benefits: string;
  howItWorks: string;
  termsAndConditions: string;
  document: string;
  extraSections?: ExtraSection[]; // <-- add this
  whyChoose?: WhyChooseItem[];    // <-- and this
  faq?: FaqItem[];                // <-- and this
}

type Service = {
  _id: string;
  serviceName: string;
  thumbnailImage: string;
  price: number;
  category: { name: string };
  subcategory: { name: string };
  serviceDetails: ServiceDetails;
  franchiseDetails: {
    overview: string;
    commission: string;
    howItWorks: string;
    termsAndConditions: string;
  };
};

type ServiceContextType = {
  services: Service[];
  createService: (formData: FormData) => Promise<Service | undefined>;
  updateService: (id: string, data: any) => Promise<Service | undefined>;
  deleteService: (id: string) => Promise<void>;
    fetchSingleService: (id: string) => Promise<void>;           // ✅ new
  singleService: Service | null;                               // ✅ new
  singleServiceLoading: boolean;                               // ✅ new
  singleServiceError: string | null;      
};

const ServiceContext = createContext<ServiceContextType | undefined>(undefined);

export const ServiceProvider = ({ children }: { children: ReactNode }) => {
  const [services, setServices] = useState<Service[]>([]);
const [singleService, setSingleService] = useState<Service | null>(null);
const [singleServiceLoading, setSingleServiceLoading] = useState<boolean>(false);
const [singleServiceError, setSingleServiceError] = useState<string | null>(null);

const fetchSingleService = async (id: string) => {
  setSingleServiceLoading(true);
  try {
    const res = await axios.get(`/api/service/${id}`);
    setSingleService(res.data?.data || null);
    setSingleServiceError(null);
  } catch (err: unknown) {
    console.log(err)
  } finally {
    setSingleServiceLoading(false);
  }
};
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
// console.log("services",services);

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
    <ServiceContext.Provider
  value={{
    services,
    createService,
    updateService,
    deleteService,
    
    fetchSingleService,         // ✅ new
    singleService,              // ✅ new
    singleServiceLoading,       // ✅ new
    singleServiceError,         // ✅ new
  }}
>
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
