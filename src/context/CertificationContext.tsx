"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";

// Define the Certificate type with additional fields
type Certificate = {
  _id: string;
    name: string;
    description: string;
    imageUrl: string;
    videoName: string;
    videoDescription: string;
     video: Array<{ // Assuming 'video' is an array of objects from backend
    videoName: string;
    videoDescription: string;
    videoUrl: string; // Assuming videoUrl is what comes back from the API
  }>;
    isDeleted: boolean;
    createdAt: string;
    updatedAt?: string;
    __v?: number;
};

interface CertificationContextType {
  certificates: Certificate[];
  addCertificate: (formData: FormData) => Promise<void>;
  updateCertificate: (id: string, formData: FormData) => Promise<void>;
  updateTutorial: (id: string, formData: FormData) => Promise<void>;
  deleteCertificate: (id: string) => Promise<void>;
  deleteTutorial: (id: string, videoIndex: number) => Promise<void>;
}

const CertificationContext = createContext<CertificationContextType | null>(null);

export const CertificationProvider = ({ children }: { children: React.ReactNode }) => {
  const [certificates, setCertificates] = useState<Certificate[]>([]);

  // Fetch certificates from the API
  const fetchCertificates = async () => {
    try {
      const response = await axios.get("/api/certifications");
      setCertificates(response.data.data);
    } catch (error) {
      console.error("Error fetching certificates:", error);
    }
  };

  // Fetch certificates when the component mounts
  useEffect(() => {
    fetchCertificates();
  }, []);

  // Add new certificate to the system
  const addCertificate = async (formData: FormData) => {
    try {
      await axios.post("/api/certifications", formData);
      fetchCertificates();  // Re-fetch certificates after adding a new one
    } catch (error) {
      console.error("Error adding certificates:", error);
    }
  };

  // Update existing certificate
  const updateCertificate = async (id: string, formData: FormData) => {
    try {
      await axios.put(`/api/certifications/${id}`, formData);
      fetchCertificates();  // Re-fetch certificates after updating one
    } catch (error) {
      console.error("Error updating certificates:", error);
    }
  };

  const updateTutorial = async (id: string, formData: FormData) => {
    try {
      await axios.put(`/api/academy/tutorials/${id}`, formData);
      fetchCertificates();  // Re-fetch certificates after updating one
    } catch (error) {
      console.error("Error updating certificates:", error);
    }
  };

   const deleteTutorial = async (id: string, videoIndex: number) => {
    try {
      await axios.delete(`/api/academy/tutorials/${id}?videoIndex=${videoIndex}`);
      fetchCertificates();  // Re-fetch certificates after deleting one
    } catch (error) {
      console.error("Error deleting certificates:", error);
    }
  };

  // Delete a certificate by ID
  const deleteCertificate = async (id: string) => {
    try {
      await axios.delete(`/api/certifications/${id}`);
      fetchCertificates();  // Re-fetch certificates after deleting one
    } catch (error) {
      console.error("Error deleting certificates:", error);
    }
  };

  return (
    <CertificationContext.Provider value={{ certificates, addCertificate, updateCertificate, updateTutorial, deleteTutorial, deleteCertificate }}>
      {children}
    </CertificationContext.Provider>
  );
};

// Custom hook to use certificate context
export const useCertificate= () => {
  const context = useContext(CertificationContext);
  if (!context) {
    throw new Error("useCertificate must be used within a CertificateProvider");
  }
  return context;
};
