"use client";

import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";
import axios from "axios";

// ------------------ Interfaces ------------------
export interface ClaimNow {
  _id?: string;
  user: string;
  reward: string;
  rewardName?: string | null;
  rewardPhoto?: string | null;
  rewardDescription?: string | null;
  isAdminApproved: boolean;
  disclaimer?: string | null;
  isClaimSettled: boolean;
  isClaimRequest: boolean;
  isClaimAccepted: boolean | null;
  createdAt?: string;
  updatedAt?: string;
}

interface ClaimNowContextProps {
  claims: ClaimNow[];
  loading: boolean;
  error: string | null;
  fetchClaims: () => Promise<void>;
  getClaimById: (id: string) => Promise<ClaimNow | null>;
  addClaim: (data: { user: string; reward: string; isClaimRequest: boolean }) => Promise<ClaimNow | null>;
  updateClaim: (id: string, data: Partial<ClaimNow> | FormData) => Promise<ClaimNow | null>; // 🔧 accepts FormData
  deleteClaim: (id: string) => Promise<boolean>;
}

// ------------------ Context ------------------
const ClaimNowContext = createContext<ClaimNowContextProps | undefined>(undefined);

// ------------------ Provider ------------------
export const ClaimNowProvider = ({ children }: { children: ReactNode }) => {
  const [claims, setClaims] = useState<ClaimNow[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const API_URL = "/api/reward-management/claim-now";

  // ✅ Fetch all claims
  const fetchClaims = async () => {
    setLoading(true);
    try {
      const res = await axios.get(API_URL);
      setClaims(res.data.data || []);
      setError(null);
    } catch (err: any) {
      setError(err.message || "Failed to fetch claims");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Get claim by ID
  const getClaimById = async (id: string) => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/${id}`);
      setError(null);
      return res.data.data as ClaimNow;
    } catch (err: any) {
      setError(err.message || "Failed to fetch claim");
      return null;
    } finally {
      setLoading(false);
    }
  };

  // ✅ Add new claim
  const addClaim = async (data: { user: string; reward: string; isClaimRequest: boolean }) => {
    setLoading(true);
    try {
      const res = await axios.post(API_URL, data, {
        headers: { "Content-Type": "application/json" },
      });
      setClaims((prev) => [res.data.data, ...prev]);
      setError(null);
      return res.data.data as ClaimNow;
    } catch (err: any) {
      setError(err.message || "Failed to add claim");
      return null;
    } finally {
      setLoading(false);
    }
  };

  // ✅ Update claim (supports JSON or FormData)
  const updateClaim = async (id: string, data: Partial<ClaimNow> | FormData) => {
    setLoading(true);
    try {
      const isFormData = data instanceof FormData;
      const res = await axios.put(`${API_URL}/${id}`, data, {
        headers: {
          "Content-Type": isFormData ? "multipart/form-data" : "application/json",
        },
      });
      setClaims((prev) => prev.map((c) => (c._id === id ? res.data.data : c)));
      setError(null);
      return res.data.data as ClaimNow;
    } catch (err: any) {
      setError(err.message || "Failed to update claim");
      return null;
    } finally {
      setLoading(false);
    }
  };

  // ✅ Delete claim
  const deleteClaim = async (id: string) => {
    setLoading(true);
    try {
      await axios.delete(`${API_URL}/${id}`);
      setClaims((prev) => prev.filter((c) => c._id !== id));
      setError(null);
      return true;
    } catch (err: any) {
      setError(err.message || "Failed to delete claim");
      return false;
    } finally {
      setLoading(false);
    }
  };

  // ✅ Auto-fetch on mount (optional)
  useEffect(() => {
    fetchClaims();
  }, []);

  return (
    <ClaimNowContext.Provider
      value={{
        claims,
        loading,
        error,
        fetchClaims,
        getClaimById,
        addClaim,
        updateClaim,
        deleteClaim,
      }}
    >
      {children}
    </ClaimNowContext.Provider>
  );
};

// ------------------ Hook ------------------
export const useClaimNow = () => {
  const context = useContext(ClaimNowContext);
  if (!context) throw new Error("useClaimNow must be used within ClaimNowProvider");
  return context;
};
