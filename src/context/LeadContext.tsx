"use client";

import axios from "axios";
import React, { createContext, useContext, useEffect, useState } from "react";

interface Lead {
  _id: string;
  statusType: string;
  description?: string;
  zoomLink?: string;
  paymentLink?: string;
  paymentType?: "partial" | "full";
  document?: string;
  checkout: any;
}

interface LeadContextType {
  leads: Lead[];
  addLead: (formData: FormData) => Promise<Lead>;
  updateLead: (id: string, formData: FormData) => Promise<Lead>;
  deleteLead: (id: string) => Promise<void>;
}

const LeadContext = createContext<LeadContextType | undefined>(undefined);

export const LeadProvider = ({ children }: { children: React.ReactNode }) => {
  const [leads, setLeads] = useState<Lead[]>([]);

  const fetchLeads = async () => {
    const res = await axios.get("/");
    setLeads(res.data);
  };

  const addLead = async (formData: FormData) => {
    const res = await axios.post("/", formData);
    fetchLeads();
    return res.data;
  };

  const updateLead = async (id: string, formData: FormData) => {
    const res = await axios.put(`/${id}`, formData);
    fetchLeads();
    return res.data;
  };

  const deleteLead = async (id: string) => {
    await axios.delete(`/${id}`);
    fetchLeads();
  };

  useEffect(() => {
    fetchLeads();
  }, []);

  return (
    <LeadContext.Provider value={{ leads, addLead, updateLead, deleteLead }}>
      {children}
    </LeadContext.Provider>
  );
};

export const useLead = () => {
  const context = useContext(LeadContext);
  if (!context) {
    throw new Error("useLead must be used within a LeadProvider");
  }
  return context;
};
