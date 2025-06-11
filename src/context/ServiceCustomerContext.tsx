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
  customers: IServiceCustomer[];
  /** Re-fetch the list (optionally with a search query) */
  refreshCustomers: (search?: string) => Promise<void>;
  /** Create a new service customer */
  addCustomer: (formData: FormData) => Promise<void>;
  /** Update an existing service customer */
  updateCustomer: (id: string, formData: FormData) => Promise<void>;
  /** Permanently delete a service customer */
  deleteCustomer: (id: string) => Promise<void>;
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
  const [customers, setCustomers] = useState<IServiceCustomer[]>([]);

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

  return (
    <ServiceCustomerContext.Provider
      value={{
        customers,
        refreshCustomers,
        addCustomer,
        updateCustomer,
        deleteCustomer,
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
