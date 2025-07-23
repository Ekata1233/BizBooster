"use client";
import React, { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";

export interface CommissionType {
  _id: string;
  assurityfee: number; 
    platformFee: number;
}

interface CommissionContextType {
  commissions: CommissionType[];
  fetchCommissions: () => void;
  createCommission: (assurityfee: number, platformFee: number) => void;
  updateCommission: (id: string, assurityfee: number, platformFee: number) => void;
  deleteCommission: (id: string) => void;
}

const CommissionContext = createContext<CommissionContextType | null>(null);

export const CommissionProvider = ({ children }: { children: React.ReactNode }) => {
  const [commissions, setCommissions] = useState<CommissionType[]>([]);

  const fetchCommissions = async () => {
    const res = await axios.get("/api/commission");
    setCommissions(res.data);
  };

  useEffect(() => {
    fetchCommissions();
  }, []);

  const createCommission = async (assurityfee: number, platformFee: number) => {
  await axios.post("/api/commission", { assurityfee, platformFee });
  fetchCommissions();
};

const updateCommission = async (
  id: string,
  assurityfee: number,
  platformFee: number
) => {
  await axios.put(`/api/commission/${id}`, { assurityfee, platformFee });
  fetchCommissions();
};


  const deleteCommission = async (id: string) => {
    await axios.delete(`/api/commission/${id}`);
    fetchCommissions();
  };

  return (
    <CommissionContext.Provider
      value={{
        commissions,
        fetchCommissions,
        createCommission,
        updateCommission,
        deleteCommission,
      }}
    >
      {children}
    </CommissionContext.Provider>
  );
};

export const useCommission = () => {
  const context = useContext(CommissionContext);
  if (!context) throw new Error("useCommission must be used within CommissionProvider");
  return context;
};
