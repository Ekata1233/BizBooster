'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

interface Checkout {
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


interface CheckoutContextType {
  checkouts: Checkout[];
  fetchCheckouts: (user?: string, status?: string) => Promise<void>;
  loading: boolean;
  error: string | null;
}

const CheckoutContext = createContext<CheckoutContextType | undefined>(undefined);

export const useCheckout = () => {
  const context = useContext(CheckoutContext);
  if (!context) {
    throw new Error('useCheckout must be used within a CheckoutProvider');
  }
  return context;
};

export const CheckoutProvider = ({ children }: { children: React.ReactNode }) => {
  const [checkouts, setCheckouts] = useState<Checkout[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

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

  useEffect(() => {
    fetchCheckouts(); // Initial load
  }, []);

  return (
    <CheckoutContext.Provider value={{ checkouts, fetchCheckouts, loading, error }}>
      {children}
    </CheckoutContext.Provider>
  );
};
