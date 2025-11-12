"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";

// Reward Interface
export interface Reward {
  _id?: string;
  name: string;
  photo?: string;
  description?: string;
  packageType?: "SGP" | "PGP" | null;
}

// Context Interface
interface RewardContextProps {
  rewards: Reward[];
  loading: boolean;
  fetchRewards: () => Promise<void>;
  saveReward: (data: FormData) => Promise<void>; // Handles add or update (POST)
  deleteReward: (id: string) => Promise<void>;
  selectedReward: Reward | null;
  setSelectedReward: React.Dispatch<React.SetStateAction<Reward | null>>;
}

// Create Context
const RewardContext = createContext<RewardContextProps | undefined>(undefined);

// ✅ Provider
export const RewardProvider = ({ children }: { children: React.ReactNode }) => {
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedReward, setSelectedReward] = useState<Reward | null>(null);

  // 🟢 Fetch all rewards
  const fetchRewards = async () => {
    try {
      setLoading(true);
      const res = await axios.get("/api/reward-management/reward");
      setRewards(res.data?.data || []);
    } catch (error) {
      console.error("Error fetching rewards:", error);
    } finally {
      setLoading(false);
    }
  };

  // 🟠 Add or Update Reward (your route handles both)
  const saveReward = async (data: FormData) => {
    try {
      setLoading(true);
      await axios.post("/api/reward-management/reward", data);
      await fetchRewards();
    } catch (error) {
      console.error("Error saving reward:", error);
    } finally {
      setLoading(false);
    }
  };

  // 🔴 Delete Reward
  const deleteReward = async (id: string) => {
    try {
      setLoading(true);
      await axios.delete(`/api/reward-management/reward/${id}`);
      await fetchRewards();
    } catch (error) {
      console.error("Error deleting reward:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRewards();
  }, []);

  return (
    <RewardContext.Provider
      value={{
        rewards,
        loading,
        fetchRewards,
        saveReward,
        deleteReward,
        selectedReward,
        setSelectedReward,
      }}
    >
      {children}
    </RewardContext.Provider>
  );
};

// ✅ Custom Hook
export const useReward = () => {
  const context = useContext(RewardContext);
  if (!context)
    throw new Error("useReward must be used within RewardProvider");
  return context;
};
