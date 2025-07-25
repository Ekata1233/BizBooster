'use client';
import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";
import axios from "axios";
import { ServiceDetails } from "@/components/service-component/ServiceDetailsForm";
type ProviderPrice = {
  provider: string; // or ObjectId if using mongoose
  price: number;
  providerPrice: number;
};
interface ExtraSection {
  title: string;
  description: string;
}


interface FranchiseDetails {
  overview: string;
  commission: string;
  howItWorks: string;
  termsAndConditions: string;
  extraSections?: ExtraSection[];
}

interface Service {
  _id: string;
  serviceName: string;
  thumbnailImage: string;
  bannerImages: string[];
  category: { name: string };
  subcategory: {_id: string, name: string };
  price: number;
  discountedPrice: number;
  gst?: number;
  tags?: string[];
  serviceDetails: ServiceDetails;
  franchiseDetails: FranchiseDetails;
  averageRating?: number;
  totalReviews?: number;
  isDeleted?: boolean;
  recommendedServices?: boolean;
  providerPrices?: ProviderPrice[];
}

type ServiceContextType = {
  services: Service[];
  createService: (formData: FormData) => Promise<Service | undefined>;
  updateService: (id: string, data: Partial<Service> | FormData) => Promise<Service | undefined>;
  deleteService: (id: string) => Promise<void>;
  fetchSingleService: (id: string) => Promise<void>;
  singleService: Service | null;
  singleServiceLoading: boolean;
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
      console.log(err);
    } finally {
      setSingleServiceLoading(false);
    }
  };

  const fetchServices = useCallback(async () => {
    try {
      const res = await axios.get<{ data: Service[] }>("/api/service");
      setServices(res.data.data);
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

  const updateService = async (id: string, data: Partial<Service> | FormData) => {
    try {
      const res = await axios.put<Service>(
        `/api/service/${id}`,
        data instanceof FormData ? data : data,
        {
          headers: data instanceof FormData
            ? undefined
            : { "Content-Type": "application/json" },
        }
      );
      fetchServices();
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
        fetchSingleService,
        singleService,
        singleServiceLoading,
        singleServiceError,
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
