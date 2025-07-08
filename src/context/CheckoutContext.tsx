'use client';

import axios from 'axios';
import React, { createContext, useContext, useEffect, useState } from 'react';

// ✅ Define your Checkout interface
export interface Checkout {
  _id: string;
  bookingId: string;
  paymentStatus: string;
  orderStatus: string;
  createdAt: string;
  updatedAt: string;
  acceptedDate?: string;
  assurityfee?: number;
  isAccepted: boolean;
  isCanceled: boolean;
  isCompleted: boolean;
  isDeleted: boolean;
  isVerified: boolean;
  notes?: string;
  paymentMethod: ('credit_card' | 'upi' | 'pac' | 'net_banking' | 'wallet')[];
  paidByOtherMethodAmount?: number;
  partialPaymentLater?: number;
  partialPaymentNow?: number;
  platformFee?: number;

  remainingPaymentStatus?: string;
  commission?: number;
  subtotal?: number;
  tax?: number;
  termsCondition?: boolean;
  totalAmount: number;
  vat?: number;
  walletAmount?: number;
  serviceDate?: Date;
  user: {
    fullName: string;
    email: string;
    mobileNumber: string;
  } | null;

  service: {
    _id: string;
    serviceName: string;
    price: number;
    discount: number;
    discountedPrice: number;
  };

  serviceCustomer: {
    _id: string;
    fullName: string;
    email: string;
    city: string;
    phone: string;
    address: string;
  };

  serviceMan?: string;

  provider:  string | {
    _id: string;
    fullName: string;
    email: string;
    phoneNo: string;
    isApproved: boolean;
    isVerified: boolean;
    isRejected: boolean;
    isDeleted: boolean;
    kycCompleted: boolean;
    registrationStatus: string;
    step1Completed: boolean;
    subscribedServices: string[];
    storeInfoCompleted: boolean;
    storeInfo: {
      storeName: string;
      storePhone: string;
      storeEmail: string;
      logo: string;
      cover: string;
    };
    kyc: {
      aadhaarCard: string[];
      panCard: string[];
      storeDocument: string[];
      GST: string[];
      other: string[];
    };
    createdAt: string;
    updatedAt: string;
  };

  coupon: {
    _id: string;
    couponCode: string;
    couponType: string;
    couponAppliesTo: string;
    category: string;
    zone: string;
    amount: number;
    discountAmountType: string;
    discountCostBearer: string;
    discountTitle: string;
    discountType: string;
    isActive: boolean;
    isDeleted: boolean;
    minPurchase: number;
    maxDiscount: number;
    limitPerUser: number;
    startDate: string;
    endDate: string;
    createdAt: string;
    updatedAt: string;
  };

  champaignDiscount?: number;
  couponDiscount?: number;
}


// ✅ Define Context Type
interface CheckoutContextType {
  checkouts: Checkout[];
  fetchCheckouts: (user?: string, status?: string) => Promise<void>;
  fetchCheckoutById: (id: string) => Promise<Checkout | null>;
  updateCheckout: (id: string, updateData: Partial<Checkout>) => Promise<void>;
  loading: boolean;
  error: string | null;
  fetchCheckoutByUser: (userId: string) => Promise<void>;
  fetchCheckoutsByProviderId: (providerId: string) => Promise<void>;

}

// ✅ Create Context
const CheckoutContext = createContext<CheckoutContextType | undefined>(undefined);

// ✅ Custom Hook
export const useCheckout = () => {
  const context = useContext(CheckoutContext);
  if (!context) {
    throw new Error('useCheckout must be used within a CheckoutProvider');
  }
  return context;
};

// ✅ Provider Component
export const CheckoutProvider = ({ children }: { children: React.ReactNode }) => {
  const [checkouts, setCheckouts] = useState<Checkout[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // 🔹 Fetch All Checkouts
  const fetchCheckouts = async (user?: string, status?: string) => {
    setLoading(true);
    setError(null);

    try {
      let url = '/api/checkout';
      const params = new URLSearchParams();

      if (user) params.append('user', user);
      if (status) params.append('status', status);

      if (params.toString()) {
        url += `?${params.toString()}`;
      }

      const res = await fetch(url);
      const data = await res.json();
      if (data.success) {
        setCheckouts(data.data);
      } else {
        setError(data.message || 'Failed to fetch checkouts');
      }
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Fetch Checkout By ID
  const fetchCheckoutById = async (id: string): Promise<Checkout | null> => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/checkout/details/${id}`);
      const data = await res.json();

      if (data.success) {
        return data.data as Checkout;
      } else {
        setError(data.message || 'Failed to fetch checkout');
        return null;
      }
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const updateCheckout = async (id: string, updateData: Partial<Checkout>) => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/checkout/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updateData),
      });

      const data = await res.json();

      if (!data.success) {
        throw new Error(data.message || "Failed to update checkout"); // 🔥 throw on failure
      }

      if (data.success) {
        setCheckouts((prev) =>
          prev.map((checkout) =>
            checkout._id === id ? { ...checkout, ...data.data } : checkout
          )
        );
      } else {
        setError(data.message || "Failed to update checkout");
      }
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Fetch Checkouts By User (from /api/checkout/user/[id])
  const fetchCheckoutByUser = async (userId: string) => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/checkout/lead-by-user/${userId}`);
      const data = await res.json();

      if (data.success) {
        setCheckouts(data.data);
      } else {
        setError(data.message || 'Failed to fetch checkouts by user');
      }
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };


  const fetchCheckoutsByProviderId = async (providerId: string) => {
    setLoading(true);
    try {
      const res = await axios.get(
        `/api/checkout/${providerId}`
      );
      setCheckouts(res.data?.data || []);
      setError(null);
    } catch (err) {
      console.error("Error fetching checkouts:", err);
      setError("Failed to fetch checkouts.");
    } finally {
      setError("Failed to fetch checkouts.");
    }
  };


  useEffect(() => {
    fetchCheckouts(); // Fetch all on mount
  }, []);

  return (
    <CheckoutContext.Provider value={{ checkouts, fetchCheckoutByUser, fetchCheckouts, fetchCheckoutById, updateCheckout, fetchCheckoutsByProviderId, loading, error }}>
      {children}
    </CheckoutContext.Provider>
  );
};
