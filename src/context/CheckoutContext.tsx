'use client';

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
  garrentyFee?: number;
  isAccepted: boolean;
  isCanceled: boolean;
  isCompleted: boolean;
  isDeleted: boolean;
  isVerified: boolean;
  notes?: string;
  paidByOtherMethodAmount?: number;
  partialPaymentLater?: number;
  partialPaymentNow?: number;
  platformFee?: number;
  remainingPaymentStatus?: string;
  subtotal?: number;
  tax?: number;
  termsCondition?: boolean;
  totalAmount: number;
  vat?: number;
  walletAmount?: number;

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
  };

  serviceMan?: string;

  provider: {
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
  loading: boolean;
  error: string | null;
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

  useEffect(() => {
    fetchCheckouts(); // Fetch all on mount
  }, []);

  return (
    <CheckoutContext.Provider value={{ checkouts, fetchCheckouts, fetchCheckoutById, loading, error }}>
      {children}
    </CheckoutContext.Provider>
  );
};
