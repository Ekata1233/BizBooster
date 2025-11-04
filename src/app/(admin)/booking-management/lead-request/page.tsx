'use client';

import React, { useEffect, useState } from 'react';
import ComponentCard from '@/components/common/ComponentCard';
import PageBreadcrumb from '@/components/common/PageBreadCrumb';
import BasicTableOne from '@/components/tables/BasicTableOne';
import Input from '@/components/form/input/InputField';
import { EyeIcon, TrashBinIcon } from '@/icons';
import Link from 'next/link';
import { useLead } from '@/context/LeadContext';
import { Modal } from '@/components/ui/modal';
import Button from '@/components/ui/button/Button';
import { useModal } from '@/hooks/useModal';
import { useCheckout } from '@/context/CheckoutContext';
import axios from 'axios';

interface IExtraService {
    serviceName: string;
    price: number;
    discount: number;
    total: number;
    isLeadApproved?: boolean;
    commission: string;
}

interface LeadRow {
    _id: string;
    checkoutId: string;
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
    const { isOpen, openModal, closeModal } = useModal();
    const [commission, setCommissioin] = useState('');
    const [selectedRow, setSelectedRow] = useState<LeadRow | null>(null);
    const { updateCheckout } = useCheckout();
    const [serviceCustomers, setServiceCustomers] = useState<{ [key: string]: any }>({});

    useEffect(() => {
        const fetchServiceCustomers = async () => {
            if (!leads?.length) return;

            const customerIds = leads
                .map((lead) => lead.checkout?.serviceCustomer)
                .filter(Boolean);

            const uniqueIds = Array.from(new Set(customerIds));

            const results: { [key: string]: any } = {};

            await Promise.all(
                uniqueIds.map(async (id) => {
                    try {
                        const res = await axios.get(`/api/service-customer/${id}`);

                        console.log("response of the service-customer : ", res)
                        results[id] = res.data; // save by ID
                    } catch (err) {
                        console.error('Error fetching serviceCustomer', id, err);
                    }
                })
            );

            setServiceCustomers(results);
        };

        fetchServiceCustomers();
    }, [leads]);

    console.log("leads data checkout id : ", leads)
    const columns = [
        {
            header: 'Sr No',
            accessor: 'srNo',
            render: (_row: LeadRow, index: number) => (
                <div className="text-center text-gray-700">{index + 1}</div>
            ),
        },
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
        // {
        //     header: 'Payment Request',
        //     accessor: 'isAdminApproved',
        //     render: (row: LeadRow) => {
        //         const colorClass =
        //             row.isAdminApproved === 'Approved'
        //                 ? 'bg-green-100 text-green-700 border-green-300'
        //                 : row.isAdminApproved === 'Pending'
        //                     ? 'bg-yellow-100 text-yellow-700 border-yellow-300'
        //                     : 'bg-gray-100 text-gray-700 border-gray-300';

        //         return (
        //             <span className={`px-3 py-1 rounded-full text-sm border ${colorClass}`}>
        //                 {row.isAdminApproved}
        //             </span>
        //         );
        //     },
        // },
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
            render: (row: LeadRow) => {
                console.log('Row data:', row); // 👈 This logs the row
                return (
                    <div className="flex gap-2">
                        <Link href={`/booking-management/lead-request/${row._id}`} passHref>
                            <button className="text-blue-500 border border-blue-500 rounded-md p-2 hover:bg-blue-500 hover:text-white">
                                <EyeIcon />
                            </button>
                        </Link>
                        {/* <button
                            onClick={() => {
                                setSelectedRow(row); // new state to track selected row
                                openModal();
                            }}
                            className="text-yellow-500 border border-yellow-500 rounded-md p-2 hover:bg-yellow-500 hover:text-white"
                        >
                            <CheckLineIcon />
                        </button> */}
                        {/* <button
                            onClick={() => alert(`Deleting lead ID: ${row.bookingId}`)}
                            className="text-red-500 border border-red-500 rounded-md p-2 hover:bg-red-500 hover:text-white"
                        >
                            <TrashBinIcon />
                        </button> */}
                    </div>
                );
            },
        }

    ];

    const filteredData = leads
        ?.filter((lead) => lead.isAdminApproved === false && lead.checkout?.bookingId?.toLowerCase().includes(search.toLowerCase()))
        .map((lead) => {
            const customerId = lead.checkout?.serviceCustomer;
            console.log("customer id : ", customerId)
            const customerResponse = serviceCustomers[customerId];

            // Extract the actual data from API response
            const customerData = customerResponse?.data;
            console.log("customer customer : ", customerData)

            return {
                _id: lead._id,
                checkoutId: lead.checkout?._id || "N/A",
                bookingId: lead.checkout?.bookingId || '-',
                fullName: customerData?.fullName || 'N/A',
                email: customerData?.email || '',
                totalAmount: lead.checkout?.totalAmount || 0,
                paymentStatus: lead.checkout?.paymentStatus || 'pending',
                orderStatus: lead.checkout?.orderStatus || 'processing',
                isAdminApproved:
                    lead.isAdminApproved === true
                        ? 'Approved'
                        : lead.isAdminApproved === false
                            ? 'Pending'
                            : 'Not Set',
            };
        });


    const handleApprove = async () => {
        if (!selectedRow || !commission) return alert("Missing data");

        try {
            // 1. Update checkout commission
            await updateCheckout(selectedRow.checkoutId, {
                commission: Number(commission),
            });

            // 2. Approve lead via FormData
            const formData = new FormData();
            formData.append("updateType", "adminApproval");
            formData.append("isAdminApproved", "true");

            const response = await axios.put(
                `/api/leads/${selectedRow._id}`,
                formData,
                {
                    headers: {
                        "Content-Type": "multipart/form-data",
                    },
                }
            );

            if (response.data.success) {
                alert("Commission and Lead approval updated successfully");
                fetchLeads();
                closeModal();
            } else {
                throw new Error(response.data.message || "Approval failed");
            }

        } catch (error) {
            console.error(error);
            alert("Error updating commission");
        }
    };

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

            <div>
                <Modal isOpen={isOpen} onClose={closeModal} className="max-w-[500px] m-4">
                    <div className="rounded-xl bg-white p-6 dark:bg-gray-900">
                        <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
                            Commission
                        </h2>
                        <Input
                            placeholder="Enter Commission"
                            value={commission}
                            onChange={(e) => setCommissioin(e.target.value)}
                            className='mt-3'
                        />

                        <div className="mt-6 flex justify-end gap-3">
                            <Button size="sm" variant="outline" onClick={closeModal}>
                                Cancel
                            </Button>
                            <Button size="sm" onClick={handleApprove}>
                                Approve
                            </Button>
                        </div>
                    </div>
                </Modal>
            </div>
        </div>
    );
};

export default LeadRequests;
