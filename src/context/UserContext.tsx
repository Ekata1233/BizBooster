'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import axios from 'axios';

export interface User {
    _id: string;
    fullName: string;
    email: string;
    mobileNumber: string;
    password: string;
    referralCode?: string;
    referredBy?: string | null; // it's a reference to another user
    isAgree: boolean;
    otp?: {
      code: string;
      expiresAt: string; // Date in string format when fetched from backend
      verified: boolean;
    };
    isEmailVerified: boolean;
    isMobileVerified: boolean;
    isDeleted: boolean;
    createdAt: string;
    updatedAt: string;
  }
  

interface UserContextType {
  users: User[] | null;
  loading: boolean;
  error: string | null;
  refreshUsers: () => void;
  setUsers: (users: User[]) => void;
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

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/users');
      setUsers(res.data.users);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to fetch users');
      setUsers(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <UserContext.Provider value={{ users, loading, error, refreshUsers: fetchUsers,setUsers }}>
      {children}
    </UserContext.Provider>
  );
};
