'use client';

import React, { useEffect, useState } from 'react';
import PageBreadcrumb from '@/components/common/PageBreadCrumb';
import ComponentCard from '@/components/common/ComponentCard';
import BasicTableOne from '@/components/tables/BasicTableOne';
import { EyeIcon } from '@/icons';
import { useProvider } from '@/context/ProviderContext';
import axios from 'axios';
import Link from 'next/link';

interface ProviderTableData {
    id: string;
    fullName: string;
    email: string;
    storeName: string;
    storePhone: string;
    city: string;
    isAdminApproved: boolean;
    step1Completed: boolean;
    storeInfoCompleted: boolean;
    kycCompleted: boolean;
}

const ProviderRequest = () => {
    const { providerDetails } = useProvider();
    const [providers, setProviders] = useState<ProviderTableData[]>([]);
    const [message, setMessage] = useState('');
    const [activeTab, setActiveTab] = useState<'all' | 'approved' | 'not-approved'>('all');

    const fetchProviders = async () => {
        try {
            const response = await axios.get('/api/provider');
            const data = response.data;

            if (!Array.isArray(data) || data.length === 0) {
                setProviders([]);
                setMessage('No providers found');
                return;
            }

            const completed = data
                .filter(
                    (p: any) => p.step1Completed && p.storeInfoCompleted && p.kycCompleted
                )
                .map((p: any) => ({
                    id: p._id,
                    fullName: p.fullName,
                    email: p.email,
                    storeName: p.storeInfo?.storeName || '-',
                    storePhone: p.storeInfo?.storePhone || '-',
                    city: p.storeInfo?.city || '-',
                    isAdminApproved: p.isAdminApproved || false,
                    step1Completed: p.step1Completed,
                    storeInfoCompleted: p.storeInfoCompleted,
                    kycCompleted: p.kycCompleted,
                }));

            setProviders(completed);
            setMessage('');
        } catch (error) {
            console.error('Error fetching providers:', error);
            setProviders([]);
            setMessage('Something went wrong while fetching providers');
        }
    };

    const handleApproval = async (id: string, approve: boolean) => {
        try {
            await axios.put(`/api/provider/approve/${id}`, {
                isAdminApproved: approve,
            });
            fetchProviders(); // refresh data
        } catch (err) {
            console.error('Approval error:', err);
        }
    };

    useEffect(() => {
        fetchProviders();
    }, []);

    const getFilteredProviders = () => {
        if (activeTab === 'approved') {
            return providers.filter((p) => p.isAdminApproved);
        }
        if (activeTab === 'not-approved') {
            return providers.filter((p) => !p.isAdminApproved);
        }
        return providers;
    };

    const columns = [
        { header: 'Name', accessor: 'fullName' },
        { header: 'Email', accessor: 'email' },
        { header: 'Store Name', accessor: 'storeName' },
        { header: 'Store Phone', accessor: 'storePhone' },
        { header: 'City', accessor: 'city' },
        {
            header: 'Approve / Reject',
            accessor: 'approval',
            render: (row: ProviderTableData) => (
                <div className="flex gap-2">
                    <button
                        onClick={() => handleApproval(row.id, true)}
                        disabled={row.isAdminApproved}
                        className={`px-3 py-1 rounded text-sm font-medium border ${row.isAdminApproved
                                ? 'bg-green-200 text-green-800 cursor-not-allowed'
                                : 'bg-green-500 text-white hover:bg-green-600'
                            }`}
                    >
                        Approve
                    </button>
                    <button
                        onClick={() => handleApproval(row.id, false)}
                        disabled={!row.isAdminApproved}
                        className={`px-3 py-1 rounded text-sm font-medium border ${!row.isAdminApproved
                                ? 'bg-red-200 text-red-800 cursor-not-allowed'
                                : 'bg-red-500 text-white hover:bg-red-600'
                            }`}
                    >
                        Reject
                    </button>
                </div>
            ),
        },
        {
            header: 'Action',
            accessor: 'action',
            render: (row: ProviderTableData) => (
                <Link href={`/provider-management/provider-details/${row.id}`} passHref>
                    <button className="text-blue-500 border border-blue-500 rounded-md p-2 hover:bg-blue-500 hover:text-white">
                        <EyeIcon />
                    </button>
                </Link>
            ),
        },
    ];

    return (
        <div>
            <PageBreadcrumb pageTitle="Approved Providers" />
            <ComponentCard title="Provider List Table">
                <div className="flex gap-4 mb-4">
                    {['all', 'approved', 'not-approved'].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab as any)}
                            className={`px-4 py-2 rounded-lg border ${activeTab === tab
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-gray-100 text-gray-700 hover:bg-blue-100'
                                }`}
                        >
                            {tab.replace('-', ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
                        </button>
                    ))}
                </div>

                {message ? (
                    <p className="text-red-500 text-center my-4">{message}</p>
                ) : (
                    <BasicTableOne columns={columns} data={getFilteredProviders()} />
                )}
            </ComponentCard>
        </div>
    );
};

export default ProviderRequest;
