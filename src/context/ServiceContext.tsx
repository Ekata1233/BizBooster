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

// ==============================================================
// TYPES
// ==============================================================

// -------- PROVIDER PRICE ----------
export type ProviderPrice = {
  provider: string;
  providerMRP: number;
  providerDiscount: number;
  providerPrice: number;
  providerCommission: number;
  status?: string;
};

// -------- SERVICE DETAILS ----------
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

// -------- FRANCHISE DETAILS ----------
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

// -------- MAIN SERVICE MODEL ----------
export interface Service {
  _id: string;
  serviceName: string | null;

  category: { _id: string; name: string } | null;
  subcategory: { _id: string; name: string } | null;

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

  averageRating: number;
  totalReviews: number;
  sortOrder: number;

  isDeleted: boolean;
  recommendedServices: boolean;

  createdAt?: string;
  updatedAt?: string;
}

// -------- UPDATE RESPONSE ----------
export type UpdateServiceResponse = {
  success: boolean;
  data: Service;
  message?: string;
};

// ==============================================================
// CONTEXT TYPE
// ==============================================================

type ServiceContextType = {
  services: Service[];
  fetchServices: () => Promise<void>;

  createService: (formData: FormData) => Promise<Service | undefined>;
  updateService: (
    id: string,
    data: Partial<Service> | FormData
  ) => Promise<UpdateServiceResponse | undefined>;
  deleteService: (id: string) => Promise<void>;
  reorderServices: (items: { _id: string; sortOrder: number }[]) => Promise<void>;

  fetchSingleService: (id: string) => Promise<void>;
  singleService: Service | null;
  singleServiceLoading: boolean;
  singleServiceError: string | null;
};

// ==============================================================
// CONTEXT INITIALIZATION
// ==============================================================

const ServiceContext = createContext<ServiceContextType | undefined>(undefined);

export const useService = () => {
  const context = useContext(ServiceContext);
  if (!context) {
    throw new Error("useService must be used inside ServiceProvider");
  }
  return context;
};

// ==============================================================
// PROVIDER
// ==============================================================

export const ServiceProvider = ({ children }: { children: ReactNode }) => {
  const [services, setServices] = useState<Service[]>([]);

  const [singleService, setSingleService] = useState<Service | null>(null);
  const [singleServiceLoading, setSingleServiceLoading] = useState(false);
  const [singleServiceError, setSingleServiceError] = useState<string | null>(null);

  const BASE_URL = "/api/service";

  // ---------------------------------------------
  // FETCH ALL SERVICES
  // ---------------------------------------------
  const fetchServices = useCallback(async () => {
    try {
      const res = await axios.get(`${BASE_URL}`);
      if (res.data.success) {
        setServices(res.data.data);
      }
    } catch (err) {
      console.error("Fetch services error:", err);
    }
  }, []);

  // Auto load
  useEffect(() => {
    fetchServices();
  }, [fetchServices]);

  // ---------------------------------------------
  // FETCH SINGLE SERVICE
  // ---------------------------------------------
  const fetchSingleService = async (id: string) => {
    try {
      setSingleServiceLoading(true);
      const res = await axios.get(`${BASE_URL}/${id}`);

      if (res.data.success) {
        setSingleService(res.data.data);
      } else {
        setSingleServiceError("Failed to load service");
      }
    } catch (err) {
      setSingleServiceError("Error fetching service");
    } finally {
      setSingleServiceLoading(false);
    }
  };

  // ---------------------------------------------
  // CREATE SERVICE
  // ---------------------------------------------
const createService = async (formData: FormData) => {
  try {
    const res = await axios.post(`${BASE_URL}`, formData);

    // Return the whole backend response (success or error)
    return res.data; 
  } catch (err: any) {
    console.error("Create service error:", err);

    // If backend returned a response with error message
    if (err.response && err.response.data) {
      return err.response.data; // e.g., { success: false, message: "Service name is required" }
    }

    // Fallback generic error
    return { success: false, message: "Unknown error occurred" };
  }
};


  // ---------------------------------------------
  // UPDATE SERVICE
  // ---------------------------------------------
 const updateService = async (
  id: string,
  data: Partial<Service> | FormData
): Promise<UpdateServiceResponse | undefined> => {
  try {
    const res = await axios.put(`${BASE_URL}/${id}`, data);

    if (res.data.success) {
      const updated = res.data.data;

      setServices((prev) =>
        prev.map((item) => (item._id === id ? updated : item))
      );

      return {
        success: res.data.success,
        data: updated,
        message: res.data.message,
      };
    }

    return {
      success: false,
      data: res.data.data,
      message: res.data.message || "Update failed",
    };
  } catch (err) {
    console.error("Update service error:", err);
    return undefined; // ← ensures type safety
  }
};


  // ---------------------------------------------
  // DELETE SERVICE (SOFT DELETE)
  // ---------------------------------------------
  const deleteService = async (id: string) => {
    try {
      const res = await axios.delete(`${BASE_URL}/${id}`);

      if (res.data.success) {
        setServices((prev) => prev.filter((item) => item._id !== id));
      }
    } catch (err) {
      console.error("Delete service error:", err);
    }
  };

  // ---------------------------------------------
  // REORDER SERVICES
  // ---------------------------------------------
  const reorderServices = async (items: { _id: string; sortOrder: number }[]) => {
    try {
      const res = await axios.put(`${BASE_URL}/reorder`, { items });

      if (res.data.success) {
        fetchServices();
      }
    } catch (err) {
      console.error("Reorder error:", err);
    }
  };

  // ==============================================================

  return (
    <ServiceContext.Provider
      value={{
        services,
        fetchServices,
        createService,
        updateService,
        deleteService,
        reorderServices,

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
