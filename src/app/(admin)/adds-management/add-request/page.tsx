'use client';

import React, { useEffect, useState } from 'react';
import PageBreadcrumb from '@/components/common/PageBreadCrumb';
import ComponentCard from '@/components/common/ComponentCard';
import { useAdContext } from '@/context/AdContext';
import Image from 'next/image';
import Link from 'next/link';
import { Check} from 'lucide-react';
import { EyeIcon, TrashBinIcon } from '@/icons';
import Input from '@/components/form/input/InputField';
import BasicTableOne from '@/components/tables/BasicTableOne';

interface AdTableData {
    id: string;
    title: string;
    fileUrl: string;
    categoryName: string;
    serviceName: string;
    status: string;
    isApproved?: boolean;
}

const page = () => {
    const { ads, fetchAds, approveAd } = useAdContext();
    const [searchQuery, setSearchQuery] = useState('');
    const [activeTab] = useState('all');
    const [filteredAds, setFilteredAds] = useState<AdTableData[]>([]);

    useEffect(() => {
        fetchAds();
    }, []);

    console.log("ads  : ", ads);

  useEffect(() => {
    const formatted: AdTableData[] = ads
        .filter(ad => ad.isApproved === false) // 👈 Only include unapproved ads
        .map(ad => ({
            id: ad._id!, // ✅ non-null assertion
            title: ad.title,
            fileUrl: ad.fileUrl,
            categoryName: ad.category?.name || 'N/A',
            serviceName: ad.service?.serviceName || 'N/A',
            status: 'Pending',
        }))
        .filter(ad =>
            ad.title.toLowerCase().includes(searchQuery.toLowerCase())
        );

    setFilteredAds(formatted);
}, [ads, searchQuery]);



    const getFilteredByStatus = () => {
        if (activeTab === 'approved') return filteredAds.filter(ad => ad.status === 'Approved');
        if (activeTab === 'pending') return filteredAds.filter(ad => ad.status === 'Pending');
        return filteredAds;
    };

    const columns = [
        {
            header: 'Title',
            accessor: 'title',
        },
        {
            header: 'Preview',
            accessor: 'fileUrl',
            render: (row: AdTableData) => (
                <Image
                    src={row.fileUrl}
                    alt="Ad Image"
                    width={100}
                    height={100}
                    className="rounded object-cover"
                />
            ),
        },
        {
            header: 'Category',
            accessor: 'categoryName',
        },
        {
            header: 'Service',
            accessor: 'serviceName',
        },
        {
            header: 'Status',
            accessor: 'status',
            render: (row: AdTableData) => {
                const isApproved = row.status === 'Approved';
                const color = isApproved ? 'green' : 'yellow';
                return (
                    <span
                        className={`px-3 py-1 rounded-full text-sm font-semibold text-${color}-600 bg-${color}-100 border border-${color}-300`}
                    >
                        {row.status}
                    </span>
                );
            },
        },
        {
            header: 'Action',
            accessor: 'action',
            render: (row: AdTableData) => (
                <div className="flex gap-2">
                    <button
                        onClick={() => handleApprove(row.id)}
                        className="text-yellow-500 border border-yellow-500 rounded-md p-2 hover:bg-yellow-500 hover:text-white"
                    >
                        <Check size={18} />
                    </button>
                    <button
                        onClick={() => alert(`Delete Ad ID: ${row.id}`)}
                        className="text-red-500 border border-red-500 rounded-md p-2 hover:bg-red-500 hover:text-white"
                    >
                        <TrashBinIcon size={16} />
                    </button>
                    <Link href={`/ad-management/ad-detail/${row.id}`} passHref>
                        <button className="text-blue-500 border border-blue-500 rounded-md p-2 hover:bg-blue-500 hover:text-white">
                            <EyeIcon size={16} />
                        </button>
                    </Link>
                </div>
            ),
        },
    ];

    const handleApprove = async (id: string) => {
        try {
            await approveAd(id); // from context
            alert('Ad approved successfully!');
            fetchAds(); // Optional, but ensures UI updates
        } catch (error) {
            console.error('Error approving ad:', error);
            alert('Failed to approve ad.');
        }
    };


    console.log("fetch adds : ", ads)
    return (
        <div>
            <PageBreadcrumb pageTitle="Add Request" />
            <ComponentCard title="Add Request">
                <div className="mb-4">
                    <Input
                        type="text"
                        placeholder="Search by ad title"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>

                {getFilteredByStatus().length > 0 ? (
                    <BasicTableOne columns={columns} data={getFilteredByStatus()} />
                ) : (
                    <div className="text-center py-10 text-gray-500">
                        No advertisements request.
                    </div>
                )}

            </ComponentCard>
        </div>
    )
}

export default page