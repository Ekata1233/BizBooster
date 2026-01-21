'use client';

import React, { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";

// Define the AdvisorData type
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
  addAdvisor: (formData: FormData) => Promise<any>;
  updateAdvisor: (id: string, formData: FormData) => Promise<void>;
  fetchAdvisorById: (id: string) => Promise<AdvisorData | null>;
  deleteAdvisor: (id: string) => Promise<void>;
}

const AdvisorContext = createContext<AdvisorContextType | null>(null);

export const AdvisorProvider = ({ children }: { children: React.ReactNode }) => {
  const [advisors, setAdvisors] = useState<AdvisorData[]>([]);

  // Fetch advisors from the API
  const fetchAdvisors = async () => {
    try {
      const response = await axios.get<{ data: AdvisorData[] }>("/api/advisor");
      setAdvisors(response.data.data); // ✅ typed properly
    } catch (error) {
      console.error("Error fetching advisors:", error);
    }
  };

  useEffect(() => {
    fetchAdvisors();
  }, []);

const addAdvisor = async (formData: FormData) => {
  try {
    const res = await axios.post("/api/advisor", formData);
    console.log("res of advisor context : ", res);

    fetchAdvisors();
    return res.data;
  } catch (error: any) {
    console.error(
      "Error adding advisor:",
      error.response?.data || error.message
    );
    throw error; // 🔥 VERY IMPORTANT
  }
};


  const updateAdvisor = async (id: string, formData: FormData) => {
    try {
      await axios.put(`/api/advisor/${id}`, formData);
      fetchAdvisors();
    } catch (error) {
      console.error("Error updating advisors:", error);
    }
  };

  const fetchAdvisorById = async (id: string): Promise<AdvisorData | null> => {
    try {
      const res = await axios.get<{ data: AdvisorData }>(`/api/advisor/${id}`);
      console.log("Fetched advisor data:", res.data.data);
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
    <AdvisorContext.Provider
      value={{ advisors, addAdvisor, updateAdvisor, fetchAdvisorById, deleteAdvisor }}
    >
      {children}
    </AdvisorContext.Provider>
  );
};

export const useAdvisor = () => {
  const context = useContext(AdvisorContext);
  if (!context) {
    throw new Error("useAdvisor must be used within a AdvisorProvider");
  }
  return context;
};
