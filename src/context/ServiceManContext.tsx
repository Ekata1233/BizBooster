"use client";
import { createContext, useContext, useEffect, useState } from "react";

export interface BusinessInformation {
  identityType: string;
  identityNumber: string;
  identityImage?: string;
}

export interface ServiceMan {
  _id?: string;
  name: string;
  lastName: string;
  phoneNo: string;
  email: string;
  password?: string;
  confirmPassword?: string;
  generalImage?: string;
  businessInformation: BusinessInformation;
  createdAt?: string;
  updatedAt?: string;
}

interface ServiceManContextType {
  serviceMen: ServiceMan[];
  fetchServiceMen: () => void;
  addServiceMan: (formData: FormData) => Promise<void>;
  updateServiceMan: (id: string, formData: FormData) => Promise<void>;
  deleteServiceMan: (id: string) => Promise<void>;
  fetchServiceManById: (id: string) => Promise<ServiceMan | null>;
  loading: boolean;
  error: string | null;
  fetchServiceMenByProvider: (providerId: string) => void;
  serviceMenByProvider: ServiceMan[];

}

const ServiceManContext = createContext<ServiceManContextType | undefined>(undefined);

export const ServiceManProvider = ({ children }: { children: React.ReactNode }) => {
  const [serviceMen, setServiceMen] = useState<ServiceMan[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [serviceMenByProvider, setServiceMenByProvider] = useState<ServiceMan[]>([]);

  // Fetch all servicemen
  const fetchServiceMen = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/serviceman");
      const data = await res.json();
      setServiceMen(data);
    } catch (err: any) {
      setError(err.message || "Failed to fetch servicemen");
    } finally {
      setLoading(false);
    }
  };

  const fetchServiceManById = async (id: string): Promise<ServiceMan | null> => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/serviceman/${id}`);
      const result = await res.json();

      if (!res.ok || !result.success) {
        throw new Error(result.message || "Failed to fetch serviceman");
      }

      return result.data;
    } catch (err: any) {
      setError(err.message || "Error fetching serviceman");
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Add a new serviceman
  const addServiceMan = async (formData: FormData) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/serviceman", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to create serviceman");

      fetchServiceMen();
    } catch (err: any) {
      setError(err.message || "Add failed");
    } finally {
      setLoading(false);
    }
  };

  // Update serviceman
  const updateServiceMan = async (id: string, formData: FormData) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/serviceman/${id}`, {
        method: "PUT",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Update failed");

      fetchServiceMen();
    } catch (err: any) {
      setError(err.message || "Update failed");
    } finally {
      setLoading(false);
    }
  };

  // Delete serviceman
  const deleteServiceMan = async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/serviceman/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Delete failed");

      fetchServiceMen();
    } catch (err: any) {
      setError(err.message || "Delete failed");
    } finally {
      setLoading(false);
    }
  };

  const fetchServiceMenByProvider = async (providerId: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/serviceman/filterByProvider/${providerId}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to fetch by provider");
      setServiceMenByProvider(data.data || []);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error?.response?.data?.message || "Something went wrong");
    }
    finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServiceMen();
  }, []);

  return (
    <ServiceManContext.Provider
      value={{
        serviceMen,
        serviceMenByProvider,
        fetchServiceMen,
        addServiceMan,
        updateServiceMan,
        deleteServiceMan,
        fetchServiceManById,
        fetchServiceMenByProvider,
        loading,
        error,
      }}
    >
      {children}
    </ServiceManContext.Provider>
  );
};

export const useServiceMan = () => {
  const context = useContext(ServiceManContext);
  if (!context) {
    throw new Error("useServiceMan must be used within a ServiceManProvider");
  }
  return context;
};
