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
    isRejected: boolean;
    isApproved: boolean;
    step1Completed: boolean;
    storeInfoCompleted: boolean;
    kycCompleted: boolean;
}

const ProviderRequest = () => {
    const { updateProvider } = useProvider();
    const [providers, setProviders] = useState<ProviderTableData[]>([]);
    const [message, setMessage] = useState('');
    const [filteredProviders, setFilteredProviders] = useState<ProviderTableData[]>([]);

    const [activeTab, setActiveTab] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');

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
                    (p: any) =>
                        p.step1Completed && p.storeInfoCompleted && p.kycCompleted
                )
                .map((p: any) => ({
                    id: p._id,
                    fullName: p.fullName,
                    email: p.email,
                    storeName: p.storeInfo?.storeName || '-',
                    storePhone: p.storeInfo?.storePhone || '-',
                    city: p.storeInfo?.city || '-',
                    isRejected: p.isRejected || false,
                    isApproved: p.isApproved || false,
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
        const confirmation = window.confirm(
            approve
                ? 'Are you sure you want to approve this provider?'
                : 'Are you sure you want to reject this provider?'
        );
        if (!confirmation) return;

        try {
            await updateProvider(id, { isApproved: approve, isRejected: !approve });
            alert(`Provider ${approve ? 'approved' : 'rejected'} successfully`);
            fetchProviders();
        } catch (error) {
            console.log(`Failed to ${approve ? 'approve' : 'reject'} provider`);
            alert(`Failed to ${approve ? 'approve' : 'reject'} provider`);
        }
    };

    useEffect(() => {
        fetchProviders();
    }, []);

    useEffect(() => {
        setFilteredProviders(getFilteredProviders());
    }, [providers, activeTab]);

    const getFilteredProviders = () => {
        if (activeTab === 'approved') {
            return providers.filter((p) => p.isApproved);
        }
        if (activeTab === 'rejected') {
            return providers.filter((p) => p.isRejected);
        }
        if (activeTab === 'pending') {
            return providers.filter((p) => !p.isApproved && !p.isRejected);
        }
        return providers; // all
    };

    const columns = [
        {
            header: "S.No",
            accessor: "serial",
            render: (row: ProviderTableData) => {
                const serial =
                    filteredProviders.findIndex((u) => u.id === row.id) + 1;
                return <span>{serial}</span>;
            },
        },
        { header: 'Name', accessor: 'fullName' },
        { header: 'Email', accessor: 'email' },
        { header: 'Store Name', accessor: 'storeName' },
        { header: 'Store Phone', accessor: 'storePhone' },
        { header: 'City', accessor: 'city' },
        {
            header: 'Status',
            accessor: 'status',
            render: (row: ProviderTableData) => {
                if (row.isApproved) {
                    return (
                        <span className="px-3 py-1 text-sm rounded bg-green-200 text-green-800 font-semibold">
                            Approved
                        </span>
                    );
                }
                if (row.isRejected) {
                    return (
                        <span className="px-3 py-1 text-sm rounded bg-red-200 text-red-800 font-semibold">
                            Rejected
                        </span>
                    );
                }
                return (
                    <div className="flex gap-2">
                        <button
                            onClick={() => handleApproval(row.id, true)}
                            disabled={row.isApproved}
                            className={`px-3 py-1 rounded text-sm font-medium border ${row.isApproved
                                ? 'bg-green-200 text-green-800'
                                : 'bg-green-500 text-white hover:bg-red-600'
                                }`}
                        >
                            Approve
                        </button>
                        <button
                            onClick={() => handleApproval(row.id, false)}
                            disabled={row.isRejected}
                            className={`px-3 py-1 rounded text-sm font-medium border ${row.isRejected
                                ? 'bg-red-200 text-red-800'
                                : 'bg-red-500 text-white hover:bg-red-600'
                                }`}
                        >
                            Reject
                        </button>
                    </div>
                );
            },
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
            <PageBreadcrumb pageTitle="Provider Requests" />
            <ComponentCard title="Provider List Table">
                {/* ✅ Tabs with counts */}
                <div className="flex justify-between items-center border-b border-gray-200 pb-2 mb-4">
                    <ul className="flex space-x-6 text-sm font-medium text-center text-gray-500">
                        <li
                            className={`cursor-pointer px-4 py-2 ${activeTab === 'all' ? 'border-b-2 border-blue-600 text-blue-600' : ''}`}
                            onClick={() => setActiveTab('all')}
                        >
                            All
                            <span className="ml-2 bg-red-500 text-white text-xs font-semibold px-2 py-0.5 rounded-full">
                                {providers.length}
                            </span>
                        </li>
                        <li
                            className={`cursor-pointer px-4 py-2 ${activeTab === 'pending' ? 'border-b-2 border-blue-600 text-blue-600' : ''}`}
                            onClick={() => setActiveTab('pending')}
                        >
                            Pending
                            <span className="ml-2 bg-red-500 text-white text-xs font-semibold px-2 py-0.5 rounded-full">
                                {providers.filter((p) => !p.isApproved && !p.isRejected).length}
                            </span>
                        </li>
                        <li
                            className={`cursor-pointer px-4 py-2 ${activeTab === 'approved' ? 'border-b-2 border-blue-600 text-blue-600' : ''}`}
                            onClick={() => setActiveTab('approved')}
                        >
                            Approved
                            <span className="ml-2 bg-red-500 text-white text-xs font-semibold px-2 py-0.5 rounded-full">
                                {providers.filter((p) => p.isApproved).length}
                            </span>
                        </li>
                        <li
                            className={`cursor-pointer px-4 py-2 ${activeTab === 'rejected' ? 'border-b-2 border-blue-600 text-blue-600' : ''}`}
                            onClick={() => setActiveTab('rejected')}
                        >
                            Rejected
                            <span className="ml-2 bg-red-500 text-white text-xs font-semibold px-2 py-0.5 rounded-full">
                                {providers.filter((p) => p.isRejected).length}
                            </span>
                        </li>
                    </ul>
                </div>

                {message ? (
                    <p className="text-red-500 text-center my-4 p-5">{message}</p>
                ) : filteredProviders.length === 0 ? (
                    <p className="text-gray-500 text-center my-4 p-5 border rounded-lg">No providers available</p>
                ) : (
                    <BasicTableOne columns={columns} data={[...filteredProviders].reverse()} />
                )}
            </ComponentCard>
        </div>
    );
};

export default ProviderRequest;
