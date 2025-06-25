'use client';

import React, { useEffect, useState } from 'react';
import ComponentCard from '@/components/common/ComponentCard';
import PageBreadcrumb from '@/components/common/PageBreadCrumb';
import BasicTableOne from '@/components/tables/BasicTableOne';
import Input from '@/components/form/input/InputField';
import { CheckLineIcon, EyeIcon, PencilIcon, TrashBinIcon } from '@/icons';
import Link from 'next/link';
import { useLead } from '@/context/LeadContext';
import axios from 'axios';

interface IExtraService {
    serviceName: string;
    price: number;
    discount: number;
    total: number;
    isLeadApproved?: boolean;
}

interface LeadRow {
    _id: string;
    bookingId: string;
    fullName: string;
    email: string;
    totalAmount: number;
    paymentStatus: string;
    orderStatus: string;
    extraService?: IExtraService[] | undefined;
    isAdminApproved: string;
}

const LeadRequests = () => {
    const { leads, loading, error, fetchLeads } = useLead();
    const [search, setSearch] = useState('');

    const columns = [
        {
            header: 'Booking ID',
            accessor: 'bookingId',
        },
        {
            header: 'Customer Info',
            accessor: 'customerInfo',
            render: (row: LeadRow) => (
                <div className="text-sm">
                    <p className="font-medium text-gray-900">{row.fullName || 'N/A'}</p>
                    <p className="text-gray-500">{row.email || ''}</p>
                </div>
            ),
        },
        {
            header: 'Total Amount',
            accessor: 'totalAmount',
            render: (row: LeadRow) => (
                <span className="text-gray-800 font-semibold">₹ {row.totalAmount}</span>
            ),
        },
        {
            header: 'Payment Status',
            accessor: 'paymentStatus',
            render: (row: LeadRow) => {
                const statusColor =
                    row.paymentStatus === 'paid'
                        ? 'bg-green-100 text-green-700 border-green-300'
                        : 'bg-yellow-100 text-yellow-700 border-yellow-300';

                return (
                    <span className={`px-3 py-1 rounded-full text-sm border ${statusColor}`}>
                        {row.paymentStatus}
                    </span>
                );
            },
        },
        {
            header: 'Admin Approved',
            accessor: 'isAdminApproved',
            render: (row: LeadRow) => {
                const colorClass =
                    row.isAdminApproved === 'Approved'
                        ? 'bg-green-100 text-green-700 border-green-300'
                        : row.isAdminApproved === 'Pending'
                            ? 'bg-yellow-100 text-yellow-700 border-yellow-300'
                            : 'bg-gray-100 text-gray-700 border-gray-300';

                return (
                    <span className={`px-3 py-1 rounded-full text-sm border ${colorClass}`}>
                        {row.isAdminApproved}
                    </span>
                );
            },
        },
        {
            header: 'Status',
            accessor: 'orderStatus',
            render: (row: LeadRow) => {
                let colorClass = '';
                switch (row.orderStatus) {
                    case 'processing':
                        colorClass = 'bg-blue-100 text-blue-700 border-blue-300';
                        break;
                    case 'completed':
                        colorClass = 'bg-green-100 text-green-700 border-green-300';
                        break;
                    case 'canceled':
                        colorClass = 'bg-red-100 text-red-700 border-red-300';
                        break;
                    default:
                        colorClass = 'bg-gray-100 text-gray-700 border-gray-300';
                }

                return (
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${colorClass}`}>
                        {row.orderStatus}
                    </span>
                );
            },
        },
        {
            header: 'Action',
            accessor: 'action',
            render: (row: LeadRow) => (
                <div className="flex gap-2">
                    <Link href={`/lead-management/view/${row._id}`} passHref>
                        <button className="text-blue-500 border border-blue-500 rounded-md p-2 hover:bg-blue-500 hover:text-white">
                            <EyeIcon />
                        </button>
                    </Link>
                    <button
                        onClick={async () => {
                            try {
                                const formData = new FormData();
                                formData.append("updateType", "adminApproval"); // custom flag
                                formData.append("isAdminApproved", "true");

                                const response = await axios.put(
                                    `/api/leads/${row._id}`,
                                    formData,
                                    {
                                        headers: {
                                            "Content-Type": "multipart/form-data",
                                        },
                                    }
                                );

                                if (response.data.success) {
                                    alert("Lead approved successfully");
                                    fetchLeads();
                                } else {
                                    alert("Failed to approve lead");
                                }
                            } catch (error: any) {
                                console.error(error);
                                alert("Error approving lead");
                            }
                        }}
                        className="text-yellow-500 border border-yellow-500 rounded-md p-2 hover:bg-yellow-500 hover:text-white"
                    >
                        <CheckLineIcon />
                    </button>
                    <button
                        onClick={() => alert(`Deleting lead ID: ${row.bookingId}`)}
                        className="text-red-500 border border-red-500 rounded-md p-2 hover:bg-red-500 hover:text-white"
                    >
                        <TrashBinIcon />
                    </button>
                </div>
            ),
        },
    ];

    const filteredData = leads
        ?.filter((lead) =>
            lead.isAdminApproved === false || (Array.isArray(lead.extraService) &&
                lead.extraService.some((service) => service.isLeadApproved === false)) &&
            lead.checkout?.bookingId?.toLowerCase().includes(search.toLowerCase())
        )
        .map((lead) => ({
            _id: lead._id,
            bookingId: lead.checkout?.bookingId || '-',
            fullName: lead.serviceCustomer?.fullName || 'N/A',
            email: lead.serviceCustomer?.email || '',
            totalAmount: lead.checkout?.totalAmount || 0,
            paymentStatus: lead.checkout?.paymentStatus || 'pending',
            orderStatus: lead.checkout?.orderStatus || 'processing',
            isAdminApproved:
                lead.isAdminApproved === true
                    ? 'Approved'
                    : lead.isAdminApproved === false
                        ? 'Pending'
                        : 'Not Set',
        }));

    return (
        <div>
            <PageBreadcrumb pageTitle="Lead Requests" />
            <div className="space-y-6">
                <ComponentCard title="All Lead Requests">
                    <div className="mb-4">
                        <Input
                            type="text"
                            placeholder="Search by Booking ID…"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition duration-200"
                        />
                    </div>

                    {loading ? (
                        <p>Loading...</p>
                    ) : error ? (
                        <p className="text-red-500">{error}</p>
                    ) : filteredData.length > 0 ? (
                        <BasicTableOne columns={columns} data={filteredData} />
                    ) : (
                        <p className="text-sm text-gray-500">No lead requests to display.</p>
                    )}
                </ComponentCard>
            </div>
        </div>
    );
};

export default LeadRequests;
