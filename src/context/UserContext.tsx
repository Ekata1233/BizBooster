'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import axios, { AxiosError } from 'axios';

interface Address {
  houseNumber?: string;
  landmark?: string;
  state?: string;
  city?: string;
  pinCode?: string;
  country?: string;
  fullAddress?: string;
}



export interface User {
  _id: string;
  fullName: string;
  email: string;
  mobileNumber: string;
  password: string;
  referralCode?: string;
  referredBy?: string | null;
  isAgree: boolean;
  otp?: {
    code: string;
    expiresAt: string;
    verified: boolean;
  };
  isEmailVerified: boolean;
  isMobileVerified: boolean;
  isCommissionDistribute: boolean;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
  packageActive: boolean;
  packageActivateDate:Date;
   homeAddress?: Address;
  workAddress?: Address;
  otherAddress?: Address;
  addressCompleted?: boolean;
  userId: string;
}

interface UserContextType {
  users: User[] | null;
  loading: boolean;
  error: string | null;
  singleUser: User | null;
  singleUserLoading: boolean;
  singleUserError: string | null;
  refreshUsers: () => void;
  setUsers: (users: User[]) => void;
  fetchSingleUser: (id: string) => void;

  referredUsers: User[] | null;
  referredUsersLoading: boolean;
  referredUsersError: string | null;
  fetchUsersByReferral: (id: string) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const useUserContext = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUserContext must be used within a UserProvider');
  }
  return context;
};

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [users, setUsers] = useState<User[] | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);


  const [singleUser, setSingleUser] = useState<User | null>(null);
  const [singleUserLoading, setSingleUserLoading] = useState<boolean>(false);
  const [singleUserError, setSingleUserError] = useState<string | null>(null);

  const [referredUsers, setReferredUsers] = useState<User[] | null>(null);
  const [referredUsersLoading, setReferredUsersLoading] = useState<boolean>(false);
  const [referredUsersError, setReferredUsersError] = useState<string | null>(null);



  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/users');
      setUsers(res.data.users);
      setError(null);
    } catch (err: unknown) {
      const axiosError = err as AxiosError<{ error: string }>;
      setError(axiosError.response?.data?.error || 'Failed to fetch users');
      setUsers(null);
    } finally {
      setLoading(false);
    }
  };

  const fetchSingleUser = async (id: string) => {
    setSingleUserLoading(true);
    try {
      const res = await axios.get(`/api/users/${id}`); // Single user
      setSingleUser(res.data?.data || null);
      setSingleUserError(null);
    } catch (err: unknown) {
      const axiosError = err as AxiosError<{ message: string }>;
      setSingleUserError(
        axiosError.response?.data?.message || 'Failed to fetch user'
      );
      setSingleUser(null);
    } finally {
      setSingleUserLoading(false);
    }
  };

  const fetchUsersByReferral = async (id: string) => {
    setReferredUsersLoading(true);
    try {
      const res = await axios.get(`/api/users/findByReferral/${id}`);
      setReferredUsers(res.data?.data || []);
      setReferredUsersError(null);
    } catch (err: unknown) {
      const axiosError = err as AxiosError<{ message: string }>;
      setReferredUsersError(
        axiosError.response?.data?.message || 'Failed to fetch referred users'
      );
      setReferredUsers(null);
    } finally {
      setReferredUsersLoading(false);
    }
  };


  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <UserContext.Provider value={{
      users, loading, error, singleUser,
      singleUserLoading,
      singleUserError,
      refreshUsers: fetchUsers,
      setUsers,
      fetchSingleUser,

      referredUsers,
      referredUsersLoading,
      referredUsersError,
      fetchUsersByReferral,
    }}>
      {children}
    </UserContext.Provider>
  );
};
