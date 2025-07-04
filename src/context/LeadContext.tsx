

'use client';

import axios from "axios";
import React, { createContext, useContext, useEffect, useState } from "react";
interface IExtraService {
  serviceName: string;
  price: number;
  discount: number;
  total: number;
  isLeadApproved?: boolean;
}

export interface IStatus {
  statusType: string;
  description?: string;
  zoomLink?: string;
  paymentLink?: string;
  paymentType?: "partial" | "full";
  document?: string;
  createdAt?: string;
  updatedAt?: string;
}
// Define the Lead type
export interface Lead {
  _id: string;
  statusType: string;
  description?: string;
  zoomLink?: string;
  paymentLink?: string;
  paymentType?: "partial" | "full";
  document?: string;
  checkout: any;
  newAmount?: number;
  extraService?: IExtraService[] | undefined;
  leads: IStatus[];
  isAdminApproved: boolean;
  serviceCustomer: any;
    service?: {
    name?: string;
  };
  amount?: number;
}

// Define the context type
interface LeadContextType {
  leads: Lead[];
  loading: boolean;
  error: string | null;
  fetchLeads: () => Promise<void>;
  addLead: (formData: FormData) => Promise<Lead>;
  updateLead: (id: string, formData: FormData) => Promise<Lead>;
  deleteLead: (id: string) => Promise<void>;
  getLeadByCheckoutId: (checkoutId: string) => Promise<Lead | null>;
   getLeadById: (id: string) => Promise<Lead | null>;
}

// Create the context
const LeadContext = createContext<LeadContextType | null>(null);

// Provider component
export const LeadProvider = ({ children }: { children: React.ReactNode }) => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch all leads
  const fetchLeads = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get("/api/leads");
      setLeads(res.data.data || res.data);
    } catch (err: any) {
      console.error("Error fetching leads:", err);
      setError(err?.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  // Add a new lead
  const addLead = async (formData: FormData) => {
    try {
      const res = await axios.post("/api/leads", formData);
      await fetchLeads();
      return res.data;
    } catch (error) {
      console.error("Error adding lead:", error);
      throw error;
    }
  };

  // Update an existing lead
    const updateLead = async (id: string, formData: FormData) => {
      try {
        const res = await axios.put(`/api/leads/${id}`, formData);
        await fetchLeads();
        return res.data;
      } catch (error) {
        console.error("Error updating lead:", error);
        throw error;
      }
    };

  // Delete a lead
  const deleteLead = async (id: string) => {
    try {
      await axios.delete(`/api/leads/${id}`);
      await fetchLeads();
    } catch (error) {
      console.error("Error deleting lead:", error);
    }
  };

  const getLeadByCheckoutId = async (checkoutId: string): Promise<Lead | null> => {
    try {
      const res = await axios.get(
        `/api/leads/FindByCheckout/${checkoutId}`
      );
      return res.data?.data || null;
    } catch (error: any) {
      if (error.response?.status === 404) {
        console.warn("Lead not found for ID:");
        return null;
      }

      console.error("Unexpected error in getLeadByCheckoutId:", error.message || error);
      return null;
    }
  };

  const getLeadById = async (id: string): Promise<Lead | null> => {
  try {
    const res = await axios.get(`/api/leads/${id}`);
    return res.data?.data || null;
  } catch (error: any) {
    if (error.response?.status === 404) {
      console.warn("Lead not found for ID:", id);
      return null;
    }
    console.error("Unexpected error in getLeadById:", error.message || error);
    return null;
  }
};


  useEffect(() => {
    fetchLeads();
  }, []);

  return (
    <LeadContext.Provider
      value={{ leads, loading, error, fetchLeads, addLead, updateLead, deleteLead, getLeadByCheckoutId,  getLeadById,}}
    >
      {children}
    </LeadContext.Provider>
  );
};

// Custom hook to use the context
export const useLead = () => {
  const context = useContext(LeadContext);
  if (!context) {
    throw new Error("useLead must be used within a LeadProvider");
  }
  return context;
};
