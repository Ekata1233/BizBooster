"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";


type Webinars = {
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

interface WebinarsContextType {
  webinars: Webinars[];
  addWebinar: (formData: FormData) => Promise<void>;
  updateWebinar: (id: string, formData: FormData) => Promise<void>;
  updateTutorial: (id: string, formData: FormData) => Promise<void>;
  deleteWebinar: (id: string) => Promise<void>;
  deleteTutorial: (id: string, videoIndex: number) => Promise<void>;
}

const WebinarsContext = createContext<WebinarsContextType | null>(null);

export const WebinarsProvider = ({ children }: { children: React.ReactNode }) => {
  const [webinars, setWebinars] = useState<Webinars[]>([]);

  // Fetch webinars from the API
  const fetchWebinars = async () => {
    try {
      const response = await axios.get("/api/academy/webinars");
      setWebinars(response.data.data);
    } catch (error) {
      console.error("Error fetching webinars:", error);
    }
  };

  // Fetch webinars when the component mounts
  useEffect(() => {
    fetchWebinars();
  }, []);

  // Add new webinar to the system
  const addWebinar = async (formData: FormData) => {
    try {
      await axios.post("/api/academy/webinars", formData);
      fetchWebinars();  // Re-fetch webinars after adding a new one
    } catch (error) {
      console.error("Error adding webinars:", error);
    }
  };

  // Update existing webinar
  const updateWebinar = async (id: string, formData: FormData) => {
    try {
      await axios.put(`/api/academy/webinars/${id}`, formData);
      fetchWebinars();  // Re-fetch webinars after updating one
    } catch (error) {
      console.error("Error updating webinars:", error);
    }
  };

  const updateTutorial = async (id: string, formData: FormData) => {
    try {
      await axios.put(`/api/academy/webinar-tutorials/${id}`, formData);
       fetchWebinars(); // Re-fetch webinars after updating one
    } catch (error) {
      console.error("Error updating webinars:", error);
    }
  };

   const deleteTutorial = async (id: string, videoIndex: number) => {
    try {
      await axios.delete(`/api/academy/webinar-tutorials/${id}?videoIndex=${videoIndex}`);
        fetchWebinars(); // Re-fetch webinars after deleting one
    } catch (error) {
      console.error("Error deleting webinars:", error);
    }
  };

  // Delete a webinar by ID
  const deleteWebinar = async (id: string) => {
    try {
      await axios.delete(`/api/academy/webinars/${id}`);
      fetchWebinars();  // Re-fetch webinars after deleting one
    } catch (error) {
      console.error("Error deleting webinars:", error);
    }
  };

  return (
    <WebinarsContext.Provider value={{ webinars, addWebinar, updateWebinar, updateTutorial, deleteTutorial, deleteWebinar }}>
      {children}
    </WebinarsContext.Provider>
  );
};

// Custom hook to use webinars context
export const useWebinars = () => {
  const context = useContext(WebinarsContext);
  if (!context) {
    throw new Error("useWebinars must be used within a WebinarsProvider");
  }
  return context;
};
