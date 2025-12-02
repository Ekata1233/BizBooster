'use client';
import React, { createContext, useContext, useState, ReactNode, useEffect } from "react";
import axios from "axios";

// ---------------- Types ----------------
interface FranchiseInvestmentRange {
  franchiseSize: 'Small' | 'Medium' | 'Large';
  franchiseType: string;
  city: string;
  franchiseFee: number;
  businessLicenses: number;
  insurance: number;
  legalAndAccountingFee: number;
  inventoryFee: number;
  officeSetup: number;
  initialStartupEquipmentAndMarketing: number;
  staffAndManagementTrainingExpense: number;
  otherExpense: number;
  totalInvestment: number;
  gstIncluded?: boolean;
  gst: number;
  tokenAmount?: number;
}

interface FranchiseModelDetails {
  franchiseSize: 'Small' | 'Medium' | 'Large';
  areaRequired: string;
  marketing?: string;
  returnOfInvestment?: string;
  royaltyPercent: string;
  grossMargin: string;
  radiusArea: string;
}

export interface FranchiseDetails {
  _id?: string;
  serviceId: string;
  investment: FranchiseInvestmentRange;
  model: FranchiseModelDetails;
}

interface FranchiseContextProps {
  franchises: FranchiseDetails[];
  fetchFranchises: (filters?: any) => Promise<void>;
  addFranchise: (data: FranchiseDetails) => Promise<void>;
}

// ---------------- Context ----------------
const FranchiseContext = createContext<FranchiseContextProps | undefined>(undefined);

export const FranchiseProvider = ({ children }: { children: ReactNode }) => {
  const [franchises, setFranchises] = useState<FranchiseDetails[]>([]);

  // Fetch all franchises
  const fetchFranchises = async (filters?: { serviceId?: string; franchiseSize?: string; sort?: string }) => {
    try {
      let query = '';
      if (filters) {
        const params = new URLSearchParams();
        if (filters.serviceId) params.append('serviceId', filters.serviceId);
        if (filters.franchiseSize) params.append('franchiseSize', filters.franchiseSize);
        if (filters.sort) params.append('sort', filters.sort);
        query = `?${params.toString()}`;
      }

      const res = await axios.get(`/api/franchise/route${query}`);
      if (res.data.success) {
        setFranchises(res.data.data);
      } else {
        console.error(res.data.error);
      }
    } catch (err) {
      console.error('Error fetching franchises:', err);
    }
  };

  // Add a new franchise
  const addFranchise = async (data: FranchiseDetails) => {
    try {
      const res = await axios.post('/api/franchise/route', data);
      if (res.data.success) {
        setFranchises(prev => [...prev, res.data.data]);
      } else {
        console.error(res.data.error);
      }
    } catch (err) {
      console.error('Error adding franchise:', err);
    }
  };

  return (
    <FranchiseContext.Provider value={{ franchises, fetchFranchises, addFranchise }}>
      {children}
    </FranchiseContext.Provider>
  );
};

// Hook for using the context
export const useFranchise = () => {
  const context = useContext(FranchiseContext);
  if (!context) throw new Error("useFranchise must be used within FranchiseProvider");
  return context;
};
 