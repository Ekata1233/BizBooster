"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import axios from "axios";
import { IServiceCustomer } from "@/models/ServiceCustomer";

/*───────────────────────────────────────────────────────────────────────────*
 * 1️⃣  Types
 *───────────────────────────────────────────────────────────────────────────*/


interface ServiceCustomerContextType {
  customers: IServiceCustomer | null;
  serviceCustomer: IServiceCustomer | null;
  refreshCustomers: (search?: string) => Promise<void>;
  addCustomer: (formData: FormData) => Promise<void>;
  updateCustomer: (id: string, formData: FormData) => Promise<void>;
  deleteCustomer: (id: string) => Promise<void>;
  loading: boolean;
  error: string | null;
  fetchServiceCustomer: (id: string) => void;
}

/*───────────────────────────────────────────────────────────────────────────*
 * 2️⃣  Context
 *───────────────────────────────────────────────────────────────────────────*/
const ServiceCustomerContext =
  createContext<ServiceCustomerContextType | null>(null);

/*───────────────────────────────────────────────────────────────────────────*
 * 3️⃣  Provider
 *───────────────────────────────────────────────────────────────────────────*/
export const ServiceCustomerProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const [customers, setCustomers] = useState<IServiceCustomer | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
    const [serviceCustomer, setServiceCustomer] = useState<IServiceCustomer | null>(null);

  /* Fetch (and optionally search) customers */
  const refreshCustomers = async (search?: string) => {
    try {
       const response = await axios.get("/api/service-customer");
      setCustomers(response.data.data);
    } catch (err) {
      console.error("Error fetching service customers:", err);
    }
  };

  useEffect(() => {
    refreshCustomers(); // initial load
  }, []);

  /* Create */
  const addCustomer = async (formData: FormData) => {
    try {
      await axios.post("/api/service-customer", formData);
      await refreshCustomers();
    } catch (err) {
      console.error("Error adding service customer:", err);
    }
  };

  /* Update */
  const updateCustomer = async (id: string, formData: FormData) => {
    try {
      await axios.put(`/api/service-customer/${id}`, formData);
      await refreshCustomers();
    } catch (err) {
      console.error("Error updating service customer:", err);
    }
  };

  /* Delete */
  const deleteCustomer = async (id: string) => {
    try {
      await axios.delete(`/api/service-customer/${id}`);
      await refreshCustomers();
    } catch (err) {
      console.error("Error deleting service customer:", err);
    }
  };

    const fetchServiceCustomer = async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`/api/service-customer/${id}`);
      setServiceCustomer(response.data.data);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error?.response?.data?.message || "Something went wrong");
    }
    finally {
      setLoading(false);
    }
  };

  return (
    <ServiceCustomerContext.Provider
      value={{
        customers,
        serviceCustomer,
        refreshCustomers,
        addCustomer,
        updateCustomer,
        deleteCustomer, loading, error, fetchServiceCustomer
      }}
    >
      {children}
    </ServiceCustomerContext.Provider>
  );
};

/*───────────────────────────────────────────────────────────────────────────*
 * 4️⃣  Hook
 *───────────────────────────────────────────────────────────────────────────*/
export const useServiceCustomer = () => {
  const ctx = useContext(ServiceCustomerContext);
  if (!ctx) {
    throw new Error(
      "useServiceCustomer must be used within a ServiceCustomerProvider"
    );
  }
  return ctx;
};
