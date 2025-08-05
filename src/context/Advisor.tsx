"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";

// Define the AdvisorData type (same as before)
type AdvisorData = {
  _id: string;
  name: string;
  tags: string[];
  imageUrl: string;
  phoneNumber: number;
  chat: string;
  language: string;
  rating: number;
  isDeleted: boolean;
  createdAt: string;
  updatedAt?: string;
  __v?: number;
};

interface AdvisorContextType {
  advisors: AdvisorData[];
  addAdvisor: (formData: FormData) => Promise<void>;
  updateAdvisor: (id: string, formData: FormData) => Promise<void>;
  // CORRECTED: The return type should be a Promise that resolves to
  // AdvisorData or null, not void.
  fetchAdvisorById: (id: string) => Promise<AdvisorData | null>;
  deleteAdvisor: (id: string) => Promise<void>;
}

const AdvisorContext = createContext<AdvisorContextType | null>(null);

export const AdvisorProvider = ({ children }: { children: React.ReactNode }) => {
  const [advisors, setAdvisors] = useState<AdvisorData[]>([]);

  // Fetch advisors from the API
  const fetchAdvisors = async () => {
    try {
      const response = await axios.get("/api/advisor");
      setAdvisors(response.data.data);
    } catch (error) {
      console.error("Error fetching advisors:", error);
    }
  };

  useEffect(() => {
    fetchAdvisors();
  }, []);

  const addAdvisor = async (formData: FormData) => {
    try {
      await axios.post("/api/advisor", formData);
      fetchAdvisors();
    } catch (error) {
      console.error("Error adding advisors:", error);
    }
  };

  // Update existing advisors
  const updateAdvisor = async (id: string, formData: FormData) => {
    try {
      await axios.put(`/api/advisor/${id}`, formData);
      fetchAdvisors();
    } catch (error) {
      console.error("Error updating advisors:", error);
    }
  };

  // The implementation correctly returns a value
  const fetchAdvisorById = async (id: string): Promise<AdvisorData | null> => {
    try {
      const res = await axios.get(`/api/advisor/${id}`);
      console.log("Fetched advisor data:", res.data);
      // We assume res.data.data is the single advisor object.
      return res.data.data;
    } catch (err) {
      console.error("Error fetching advisor:", err);
      return null;
    }
  };

  const deleteAdvisor = async (id: string) => {
    try {
      await axios.delete(`/api/advisor/${id}`);
      fetchAdvisors();
    } catch (error) {
      console.error("Error deleting advisors:", error);
    }
  };

  return (
    <AdvisorContext.Provider value={{ advisors, addAdvisor, updateAdvisor, fetchAdvisorById, deleteAdvisor }}>
      {children}
    </AdvisorContext.Provider>
  );
};

// Custom hook to use Advisor context
export const useAdvisor = () => {
  const context = useContext(AdvisorContext);
  if (!context) {
    throw new Error("useAdvisor must be used within a AdvisorProvider");
  }
  return context;
};