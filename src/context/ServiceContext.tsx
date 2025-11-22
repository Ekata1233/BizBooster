"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useCallback,
} from "react";
import axios from "axios";

// ----------------------------------------------
// PROVIDER PRICES (Matched to your backend route)
// ----------------------------------------------
type ProviderPrice = {
  provider: string;
  providerMRP: number;
  providerDiscount: number;
  providerPrice: number;
  providerCommission: number;
  status?: string;
};

// ----------------------------------------------
// SERVICE DETAILS FULL STRUCTURE (Matches schema)
// ----------------------------------------------
export interface FAQ {
  question: string;
  answer: string;
}

export interface ExtraSection {
  title: string;
  subtitle: string[];
  description: string[];
  subDescription: string[];
  lists: string[];
  tags: string[];
  image: string[];
}

export interface AssuredByFetchTrueItem {
  title: string;
  icon: string;
  description: string;
}

export interface HowItWorksItem {
  title: string;
  icon: string;
  description: string;
}

export interface PackageItem {
  name: string;
  price: number | null;
  discount: number | null;
  discountedPrice: number | null;
  whatYouGet: string[];
}

export interface ServiceDetails {
  benefits: string[];
  aboutUs: string[];
  highlight: string[];
  document: string[];
  assuredByFetchTrue: AssuredByFetchTrueItem[];
  howItWorks: HowItWorksItem[];
  termsAndConditions: string[];
  faq: FAQ[];
  extraSections: ExtraSection[];
  whyChooseUs: AssuredByFetchTrueItem[];
  packages: PackageItem[];
  weRequired: { title: string; description: string }[];
  weDeliver: { title: string; description: string }[];
  moreInfo: { title: string; image: string; description: string }[];
  connectWith: { name: string; mobileNo: string; email: string }[];
  timeRequired: { minDays: number | null; maxDays: number | null }[];
  extraImages: string[];
}

export interface FranchiseDetails {
  commission: string | null;
  termsAndConditions: string | null;
  investmentRange: { minRange: number | null; maxRange: number | null }[];
  monthlyEarnPotential: { minEarn: number | null; maxEarn: number | null }[];
  franchiseModel: {
    title: string;
    agreement: string;
    price: number | null;
    discount: number | null;
    gst: number | null;
    fees: number | null;
  }[];
  extraSections: ExtraSection[];
  extraImages: string[];
}


// ----------------------------------------------
// MAIN SERVICE TYPE (Full schema)
// ----------------------------------------------
export interface Service {
  _id: string;
  serviceName: string;

  category: { _id: string; name: string };
  subcategory: { _id: string; name: string };

  price: number;
  discount: number;
  discountedPrice: number;
  gst: number;
  includeGst: boolean;
  gstInRupees: number;
  totalWithGst: number;

  thumbnailImage: string;
  bannerImages: string[];

  tags: string[];
  keyValues: { key: string; value: string }[];

  providerPrices: ProviderPrice[];

  serviceDetails: ServiceDetails;
  franchiseDetails: FranchiseDetails;

  isDeleted: boolean;
  recommendedServices: boolean;

  createdAt?: string;
  updatedAt?: string;
}

// ----------------------------------------------
// UPDATE RESPONSE TYPE
// ----------------------------------------------
type UpdateServiceResponse = {
  success: boolean;
  data: Service;
  message?: string;
};

// ----------------------------------------------
// CONTEXT TYPE
// ----------------------------------------------
type ServiceContextType = {
  services: Service[];
  fetchServices: () => Promise<void>;
  createService: (formData: FormData) => Promise<Service | undefined>;
  updateService: (
    id: string,
    data: Partial<Service> | FormData
  ) => Promise<UpdateServiceResponse | undefined>;
  deleteService: (id: string) => Promise<void>;
  fetchSingleService: (id: string) => Promise<void>;
  reorderServices: (items: { _id: string; sortOrder: number }[]) => Promise<void>;
  singleService: Service | null;
  singleServiceLoading: boolean;
  singleServiceError: string | null;
};

// ----------------------------------------------
const ServiceContext = createContext<ServiceContextType | undefined>(undefined);

// ----------------------------------------------
export const ServiceProvider = ({ children }: { children: ReactNode }) => {
  const [services, setServices] = useState<Service[]>([]);
  const [singleService, setSingleService] = useState<Service | null>(null);
  const [singleServiceLoading, setSingleServiceLoading] = useState(false);
  const [singleServiceError, setSingleServiceError] = useState<string | null>(null);

  // ----------------------------------------------
  // FETCH ALL SERVICES
  // ----------------------------------------------
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

  // ----------------------------------------------
  // CREATE SERVICE
  // ----------------------------------------------
  const createService = async (formData: FormData) => {
    try {
      const res = await axios.post<{ data: Service }>("/api/service", formData);
      await fetchServices();
      return res.data.data;
    } catch (error: any) {
      const message = error?.response?.data?.message || "Unknown error";
      console.error("Failed to create service:", message);
      throw new Error(message);
    }
  };


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
  // const updateService = async (id: string, data: Partial<Service> | FormData) => {
  //   try {
  //     const res = await axios.put<Service>(
  //       `/api/service/${id}`,
  //       data instanceof FormData ? data : data,
  //       {
  //         headers: data instanceof FormData
  //           ? undefined
  //           : { "Content-Type": "application/json" },
  //       }
  //     );
  //     fetchServices();
  //     return res.data;
  //   } catch (error) {
  //     console.error("Failed to update service:", error);
  //   }
  // };

  const updateService = async (
    id: string,
    data: Partial<Service> | FormData
  ): Promise<UpdateServiceResponse | undefined> => {
    try {
      const res = await axios.put<UpdateServiceResponse>(
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


const reorderServices = async (items: { _id: string; sortOrder: number }[]) => {
  try {
    await axios.post("/api/service/reorder", { services: items });
    await fetchServices(); // refresh list
  } catch (err) {
    console.error("Service reorder failed:", err);
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
        fetchServices,
        createService,
        updateService,
        deleteService,
        fetchSingleService,
        singleService,
        singleServiceLoading,
        singleServiceError,
        reorderServices,
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
