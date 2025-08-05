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
    const { providerDetails } = useProvider();
    const [providers, setProviders] = useState<ProviderTableData[]>([]);
    const [message, setMessage] = useState('');
    const [activeTab, setActiveTab] = useState<'all' | 'approved' | 'not-approved'>('all');
    const { getAllProviders, updateProvider } = useProvider();

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

    const handleReject = async (id: string) => {
        const confirmation = window.confirm('Are you sure you want to reject this provider?');
        if (!confirmation) return;

        try {
            await updateProvider(id, { isRejected: true, isApproved: false });
            alert('Provider rejected successfully');
            fetchProviders();
        } catch (error) {
            console.log('Failed to reject provider');
            alert('Failed to reject provider');
        }
    };

    useEffect(() => {
        fetchProviders();
    }, []);

    const getFilteredProviders = () => {
        if (activeTab === 'approved') {
            return providers.filter((p) => p.isApproved);
        }
        if (activeTab === 'not-approved') {
            return providers.filter((p) => !p.isApproved);
        }
        // For "all" tab – show only unapproved ones (pending)
        return providers.filter((p) => !p.isApproved && !p.isRejected);
    };

    const columns = [
        { header: 'Name', accessor: 'fullName' },
        { header: 'Email', accessor: 'email' },
        { header: 'Store Name', accessor: 'storeName' },
        { header: 'Store Phone', accessor: 'storePhone' },
        { header: 'City', accessor: 'city' },
        {
            header: 'Status',
            accessor: 'status',
            render: (row: ProviderTableData) => {
                if (activeTab === 'all') {
                    return (
                        <div className="flex gap-2">
                            <button
                                onClick={() => handleApproval(row.id, true)}
                                disabled={row.isApproved}
                                className={`px-3 py-1 rounded text-sm font-medium border ${row.isApproved
                                    ? 'bg-green-200 text-green-800'
                                    : 'bg-green-500 text-white hover:bg-green-600'
                                    }`}
                            >
                                Approve
                            </button>
                            <button
                                onClick={() => handleReject(row.id)}
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
                }

                if (activeTab === 'approved') {
                    return (
                        <span className="px-3 py-1 text-sm rounded bg-green-200 text-green-800 font-semibold">
                            Approved
                        </span>
                    );
                }

                if (activeTab === 'not-approved') {
                    return (
                        <span className="px-3 py-1 text-sm rounded bg-red-200 text-red-800 font-semibold">
                            Rejected
                        </span>
                    );
                }

                return null;
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
                            {tab === 'all' ? 'Pending' : tab.replace('-', ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
                        </button>
                    ))}
                </div>

                {message ? (
                    <p className="text-red-500 text-center my-4 p-5">{message}</p>
                ) : getFilteredProviders().length === 0 ? (
                    <p className="text-gray-500 text-center my-4 p-5 border rounded-lg">No providers available</p>
                ) : (
                    <BasicTableOne columns={columns} data={getFilteredProviders()} />
                )}

            </ComponentCard>
        </div>
    );
};

export default ProviderRequest;