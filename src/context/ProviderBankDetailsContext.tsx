"use client";
import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import axios from "axios";

// ----------------- Types -----------------
export interface ProviderBankDetails {
  _id: string;
  userId: string;
  accountNumber: string;
  bankName: string;
  branchName: string;
  ifsc: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  [key: string]: unknown;
}

// Context shape
interface ProviderBankDetailsContextType {
  allBankDetails: ProviderBankDetails[];
  singleBankDetails: ProviderBankDetails | null;
  loadingBankDetails: boolean;
  errorBankDetails: string | null;
  fetchAllBankDetails: () => Promise<void>;
  fetchBankDetailsById: (providerId: string) => Promise<void>;
}

// ----------------- Context -----------------
const ProviderBankDetailsContext = createContext<
  ProviderBankDetailsContextType | undefined
>(undefined);

// ----------------- Provider -----------------
interface ProviderBankDetailsProviderProps {
  children: ReactNode;
}

export const ProviderBankDetailsProvider: React.FC<
  ProviderBankDetailsProviderProps
> = ({ children }) => {
  const [allBankDetails, setAllBankDetails] = useState<ProviderBankDetails[]>(
    []
  );
  const [singleBankDetails, setSingleBankDetails] =
    useState<ProviderBankDetails | null>(null);
  const [loadingBankDetails, setLoadingBankDetails] = useState(false);
  const [errorBankDetails, setErrorBankDetails] = useState<string | null>(null);

  // Fetch all provider bank details
  const fetchAllBankDetails = async () => {
    setLoadingBankDetails(true);
    try {
      const res = await axios.get(
        "https://api.fetchtrue.com/api/provider/bank-details"
      );
      setAllBankDetails(res.data?.data || []);
      setErrorBankDetails(null);
    } catch (err) {
      console.error("Failed to fetch all bank details:", err);
      setErrorBankDetails("Something went wrong while fetching bank details.");
    } finally {
      setLoadingBankDetails(false);
    }
  };

  // Fetch single provider's bank details
  const fetchBankDetailsById = async (providerId: string) => {
    if (!providerId) return;
    setLoadingBankDetails(true);
    try {
      const res = await axios.get(
        `https://api.fetchtrue.com/api/provider/bank-details/${providerId}`
      );
      setSingleBankDetails(res.data?.data || null);
      setErrorBankDetails(null);
    } catch (err) {
      console.error(`Failed to fetch bank details for ${providerId}:`, err);
      setErrorBankDetails("Something went wrong while fetching bank details.");
    } finally {
      setLoadingBankDetails(false);
    }
  };

  // (Optional) auto-fetch all on mount
  useEffect(() => {
    fetchAllBankDetails();
  }, []);

  return (
    <ProviderBankDetailsContext.Provider
      value={{
        allBankDetails,
        singleBankDetails,
        loadingBankDetails,
        errorBankDetails,
        fetchAllBankDetails,
        fetchBankDetailsById,
      }}
    >
      {children}
    </ProviderBankDetailsContext.Provider>
  );
};

// ----------------- Custom Hook -----------------
export const useProviderBankDetails = (): ProviderBankDetailsContextType => {
  const context = useContext(ProviderBankDetailsContext);
  if (!context) {
    throw new Error(
      "useProviderBankDetails must be used within a ProviderBankDetailsProvider"
    );
  }
  return context;
};
