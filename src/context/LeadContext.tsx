// "use client";

// import axios from "axios";
// import React, { createContext, useContext, useEffect, useState } from "react";

// // Define the Lead type
// interface Lead {
//   _id: string;
//   statusType: string;
//   description?: string;
//   zoomLink?: string;
//   paymentLink?: string;
//   paymentType?: "partial" | "full";
//   document?: string;
//   checkout: any; // You can replace `any` with a more specific type if available
//   isAdminApproved: boolean;
//   serviceCustomer: any;
// }

// // Define the context type
// interface LeadContextType {
//   leads: Lead[];
//   addLead: (formData: FormData) => Promise<Lead>;
//   updateLead: (id: string, formData: FormData) => Promise<Lead>;
//   deleteLead: (id: string) => Promise<void>;
// }

// // Create the context
// const LeadContext = createContext<LeadContextType | null>(null);

// // Provider component
// export const LeadProvider = ({ children }: { children: React.ReactNode }) => {
//   const [leads, setLeads] = useState<Lead[]>([]);

//   // Fetch all leads
//   const fetchLeads = async () => {
//     try {
//       const res = await axios.get("/api/leads");
//       setLeads(res.data.data || res.data); // Adjust according to your API response
//     } catch (error) {
//       console.error("Error fetching leads:", error);
//     }
//   };

//   // Add a new lead
//   const addLead = async (formData: FormData) => {
//     try {
//       const res = await axios.post("/api/leads", formData);
//       fetchLeads();
//       return res.data;
//     } catch (error) {
//       console.error("Error adding lead:", error);
//       throw error;
//     }
//   };

//   // Update an existing lead
//   const updateLead = async (id: string, formData: FormData) => {
//     try {
//       const res = await axios.put(`/api/leads/${id}`, formData);
//       fetchLeads();
//       return res.data;
//     } catch (error) {
//       console.error("Error updating lead:", error);
//       throw error;
//     }
//   };

//   // Delete a lead
//   const deleteLead = async (id: string) => {
//     try {
//       await axios.delete(`/api/leads/${id}`);
//       fetchLeads();
//     } catch (error) {
//       console.error("Error deleting lead:", error);
//     }
//   };

//   // Initial fetch
//   useEffect(() => {
//     fetchLeads();
//   }, []);

//   return (
//     <LeadContext.Provider value={{ leads, addLead, updateLead, deleteLead }}>
//       {children}
//     </LeadContext.Provider>
//   );
// };

// // Custom hook to use the context
// export const useLead = () => {
//   const context = useContext(LeadContext);
//   if (!context) {
//     throw new Error("useLead must be used within a LeadProvider");
//   }
//   return context;
// };


'use client';

import axios from "axios";
import React, { createContext, useContext, useEffect, useState } from "react";

// Define the Lead type
interface Lead {
  _id: string;
  statusType: string;
  description?: string;
  zoomLink?: string;
  paymentLink?: string;
  paymentType?: "partial" | "full";
  document?: string;
  checkout: any;
  isAdminApproved: boolean;
  serviceCustomer: any;
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

  useEffect(() => {
    fetchLeads();
  }, []);

  return (
    <LeadContext.Provider
      value={{ leads, loading, error, fetchLeads, addLead, updateLead, deleteLead }}
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
