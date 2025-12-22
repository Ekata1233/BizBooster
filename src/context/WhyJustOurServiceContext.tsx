"use client";

import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
} from "react";
import axios from "axios";

/* ───────── TYPES ───────── */

export interface IService {
  _id: string;
  title: string;
  description: string;
  icon: string;
  module: {
    _id: string;
    name: string;
  };
  createdAt: string;
  updatedAt: string;
}

interface IServiceContext {
  services: IService[];
  loading: boolean;
  error: string | null;
  fetchServices: () => Promise<void>;
  createService: (data: FormData) => Promise<IService | null>;
  updateService: (id: string, data: FormData) => Promise<IService | null>;
  deleteService: (id: string) => Promise<boolean>;
}

/* ───────── CONTEXT ───────── */

const WhyJustOurServiceContext = createContext<IServiceContext | undefined>(
  undefined
);

export const useWhyJustOurService = () => {
  const context = useContext(WhyJustOurServiceContext);
  if (!context) {
    throw new Error(
      "useWhyJustOurService must be used inside WhyJustOurServiceProvider"
    );
  }
  return context;
};

/* ───────── PROVIDER ───────── */

const API_URL = "/api/category/whyjustourservice";

export const WhyJustOurServiceProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const [services, setServices] = useState<IService[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /* ───── GET ALL ───── */
  const fetchServices = async () => {
    setLoading(true);
    try {
      const res = await axios.get(API_URL);
      setServices(res.data.data);
      setError(null);
    } catch (err: any) {
      setError(err.message || "Failed to fetch services");
    } finally {
      setLoading(false);
    }
  };

  /* ───── CREATE ───── */
  const createService = async (
    data: FormData
  ): Promise<IService | null> => {
    setLoading(true);
    try {
      const res = await axios.post(API_URL, data, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setServices((prev) => [res.data.data, ...prev]);
      return res.data.data;
    } catch (err: any) {
      setError(err.message || "Failed to create service");
      return null;
    } finally {
      setLoading(false);
    }
  };

  /* ───── UPDATE ───── */
  const updateService = async (
    id: string,
    data: FormData
  ): Promise<IService | null> => {
    setLoading(true);
    try {
      const res = await axios.put(`${API_URL}/${id}`, data, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setServices((prev) =>
        prev.map((s) => (s._id === id ? res.data.data : s))
      );
      return res.data.data;
    } catch (err: any) {
      setError(err.message || "Failed to update service");
      return null;
    } finally {
      setLoading(false);
    }
  };

  /* ───── DELETE ───── */
  const deleteService = async (id: string): Promise<boolean> => {
    setLoading(true);
    try {
      await axios.delete(`${API_URL}/${id}`);
      setServices((prev) => prev.filter((s) => s._id !== id));
      return true;
    } catch (err: any) {
      setError(err.message || "Failed to delete service");
      return false;
    } finally {
      setLoading(false);
    }
  };

  return (
    <WhyJustOurServiceContext.Provider
      value={{
        services,
        loading,
        error,
        fetchServices,
        createService,
        updateService,
        deleteService,
      }}
    >
      {children}
    </WhyJustOurServiceContext.Provider>
  );
};
