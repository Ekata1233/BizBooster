

// src/context/LiveWebinarContext.tsx
"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";

// This type defines the basic User document structure
export type User = {
  _id: string;
  fullName: string;
  email: string;
  mobileNumber: string;
};

// This type defines how an enrolled user appears in the 'user' array
// when populated in the LiveWebinar document.
export type EnrolledUserEntry = {
  id: string;
  user: User; // The actual populated User document
  status: boolean; // The status associated with this enrollment
};

// This type defines the full LiveWebinars document structure,
// including the populated 'user' array.
export type LiveWebinars = {
  _id: string;
  name: string;
  description: string;
  imageUrl: string;
  displayVideoUrls: string[];
  date: string;
  startTime: string;
  endTime: string;
  isDeleted: boolean;
  createdAt: string;
  updatedAt?: string;
  __v?: number;
  user?: EnrolledUserEntry[]; // This now accurately reflects the populated structure
  // users?: string[]; // Keep this if you also handle raw user IDs elsewhere, otherwise remove
};

// Interface for the context value
interface LiveWebinarsContextType {
  webinars: LiveWebinars[];
  addWebinar: (formData: FormData) => Promise<void>;
  updateWebinar: (id: string, formData: FormData) => Promise<void>;
  updateTutorial: (id: string, formData: FormData) => Promise<void>;
  deleteWebinar: (id: string) => Promise<void>;
  deleteTutorial: (id: string) => Promise<void>;
  fetchWebinarById: (id: string) => Promise<LiveWebinars | null>;
  updateEnrollment: (id: string, userId: string, status: boolean) => Promise<void>;
}

const LiveWebinarsContext = createContext<LiveWebinarsContextType | null>(null);

export const LiveWebinarsProvider = ({ children }: { children: React.ReactNode }) => {
  const [webinars, setWebinars] = useState<LiveWebinars[]>([]);

  const fetchWebinars = async () => {
    try {
      const response = await axios.get("/api/academy/livewebinars");
      setWebinars(response.data.data);
    } catch (error) {
      console.error("Error fetching webinars:", error);
    }
  };

  const fetchWebinarById = async (id: string) => {
    try {
      const res = await axios.get(`/api/academy/livewebinars/${id}`);
      console.log("Fetched webinar data:", res.data);
      // Assuming your API returns { success: true, data: LiveWebinarsObject }
      return res.data.data;
    } catch (err) {
      console.error("Error fetching webinar:", err);
      return null;
    }
  };

  useEffect(() => {
    fetchWebinars();
  }, []);

  const addWebinar = async (formData: FormData) => {
    try {
      await axios.post("/api/academy/livewebinars", formData);
      fetchWebinars();
    } catch (error) {
      console.error("Error adding webinar:", error);
    }
  };

  const updateWebinar = async (id: string, formData: FormData) => {
    try {
      await axios.put(`/api/academy/livewebinars/${id}`, formData);
      fetchWebinars();
    } catch (error) {
      console.error("Error updating webinar:", error);
    }
  };

  const updateTutorial = async (id: string, formData: FormData) => {
    try {
      await axios.put(`/api/academy/livewebinars/${id}`, formData);
      fetchWebinars();
    } catch (error) {
      console.error("Error updating tutorial:", error);
    }
  };

  const deleteTutorial = async (id: string) => {
    try {
      await axios.delete(`/api/academy/livewebinars/${id}`);
      fetchWebinars();
    } catch (error) {
      console.error("Error deleting tutorial:", error);
    }
  };

  const deleteWebinar = async (id: string) => {
    try {
      await axios.delete(`/api/academy/livewebinars/${id}`);
      fetchWebinars();
    } catch (error) {
      console.error("Error deleting webinar:", error);
    }
  };

  const updateEnrollment = async (webinarId: string, userId: string, status: boolean) => {
    try {
      // Send `users` as an array of IDs and `status` as boolean
      await axios.put(`/api/academy/livewebinars/enroll/${webinarId}`, { users: [userId], status });
      fetchWebinars(); // Re-fetch all webinars to ensure consistency across the app
    } catch (error) {
      console.error("Error updating enrollment:", error);
    }
  };

  return (
    <LiveWebinarsContext.Provider
      value={{
        webinars,
        addWebinar,
        updateWebinar,
        updateTutorial,
        deleteTutorial,
        deleteWebinar,
        fetchWebinarById,
        updateEnrollment
      }}
    >
      {children}
    </LiveWebinarsContext.Provider>
  );
};

export const useLiveWebinars = () => {
  const context = useContext(LiveWebinarsContext);
  if (!context) {
    throw new Error("useLiveWebinars must be used within a LiveWebinarsProvider");
  }
  return context;
};