'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import axios from 'axios';

export type Service = {
    _id: string;
    serviceName: string;
    status: string;
    providerPrices: Array<{
        provider: { _id: string; fullName: string };
        providerPrice: number;
        status: string;
    }>;
};

interface SubscribeContextType {
    services: Service[];
    fetchServices: () => Promise<void>;
    approveService: (serviceId: string, providerId: string) => Promise<void>;
    deleteService: (serviceId: string) => Promise<void>;
}

const SubscribeContext = createContext<SubscribeContextType | null>(null);

export const SubscribeProvider = ({ children }: { children: React.ReactNode }) => {
    const [services, setServices] = useState<Service[]>([]);

    const fetchServices = async () => {
        try {
            const res = await axios.get('/api/service');
            setServices(res.data.data); // ⟵ adjust if your JSON shape differs
        } catch (err) {
            console.error('Error fetching services:', err);
        }
    };

    useEffect(() => { fetchServices(); }, []);

    const approveService = async (id: string, providerId: string) => {
        try {
            await axios.put(`/api/service/${id}/approve`, { providerId });
            await fetchServices(); // keep UI fresh
        } catch (err) {
            console.error('Error approving service:', err);
        }
    };

    const deleteService = async (id: string) => {
        try {
            await axios.delete(`/api/service/${id}`);
            await fetchServices();
        } catch (err) {
            console.error('Error deleting service:', err);
        }
    };

    return (
        <SubscribeContext.Provider
            value={{ services, fetchServices, approveService, deleteService }}
        >
            {children}
        </SubscribeContext.Provider>
    );
};

export const useSubscribe = () => {
    const ctx = useContext(SubscribeContext);
    if (!ctx) {
        throw new Error('useSubscribe must be used within a SubscribeProvider');
    }
    return ctx;
};