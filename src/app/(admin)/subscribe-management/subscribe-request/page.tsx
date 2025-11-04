'use client';

import React, { useEffect, useState } from 'react';
import ComponentCard from '@/components/common/ComponentCard';
import PageBreadcrumb from '@/components/common/PageBreadCrumb';
import BasicTableOne from '@/components/tables/BasicTableOne';
import { useService } from '@/context/ServiceContext';
import { useSubscribe } from '@/context/SubscribeContext';
import { EyeIcon, TrashBinIcon } from '@/icons';
import { useRouter } from 'next/navigation';

/* -------------------- types -------------------- */
interface TableData {
    name: string;
    providerId: string;
    providerName: string;
    categoryName: string;
    subCategoryName: string;
    status: string;
    price: string | number;
    discountedPrice: string | number;
    providerPrice: string | number;
    id: string;
}

/* -------------------- component -------------------- */
const SubscribeRequestPage = () => {
    const { services, fetchServices } = useService();
    const { approveService, deleteService } = useSubscribe();
    const [tableData, setTableData] = useState<TableData[]>([]);
    const router = useRouter();

    const handleNavigate = (row: any) => {
        console.log("row data : ", row)
        router.push(`/subscribe-management/subscribe-request/${row.id}/${row.providerId}`);
    };

    useEffect(() => {
        fetchServices();   // 👈 refresh on mount
    }, []);

    useEffect(() => {
        const pending: TableData[] = [];

        services.forEach((service: any) => {
            (service.providerPrices || []).forEach((p: any) => {
                const rawStatus = service.status ?? p.status ?? '';
                if (rawStatus.toLowerCase() === 'pending') {
                    pending.push({
                        name: service.serviceName,
                        providerId: p?.provider?._id || 'N/A',
                        providerName: p?.provider?.fullName || 'N/A',
                        price: service.price || "N/A",
                        discountedPrice: service.discountedPrice || "N/A",
                        providerPrice: p?.providerPrice || "N/A",
                        categoryName: service.category?.name || 'N/A',
                        subCategoryName: service.subcategory?.name || 'N/A',
                        status: service.status ?? p.status ?? 'Accept',
                        id: service._id,
                    });
                }
            });
        });

        // ✅ Reverse the array before setting it
        setTableData(pending.reverse());
    }, [services]);



    /* ------------ handlers ------------- */
    const handleAccept = async (serviceId: string, providerId: string) => {
        try {
            await approveService(serviceId, providerId);
            /* remove the row right away */
            setTableData(prev => prev.filter(row => row.id !== serviceId));
            alert('Service approved successfully!');
        } catch (err) {
            console.error(err);
        }
    };


    const handleDelete = async (serviceId: string) => {
        try {
            await deleteService(serviceId);
            /* remove the row right away */
            setTableData(prev => prev.filter(row => row.id !== serviceId));
            alert('Service rejected successfully!');
        } catch (err) {
            console.error(err);
        }
    };

    /* ------------- columns -------------- */
    const columns = [
        {
            header: 'Sr No',
            accessor: 'srNo',
            render: (_row: TableData, index: number) => (
                <span className="text-gray-700 text-sm font-medium">{index + 1}</span>
            ),
        },
        { header: 'Provider Name', accessor: 'providerName' },
        { header: 'Service Name', accessor: 'name' },
        { header: 'Price', accessor: 'price' },
        { header: 'Discounted Price', accessor: 'discountedPrice' },
        { header: 'Provider price', accessor: 'providerPrice' },
        {
            header: 'Status',
            accessor: 'status',
            render: (row: TableData) => {
                const status = row.status;
                const colorClass =
                    status.toLowerCase() === 'rejected'
                        ? 'text-red-500 bg-red-100 border border-red-300'
                        : status.toLowerCase() === 'approved' || status.toLowerCase() === 'accept'
                            ? 'text-green-600 bg-green-100 border border-green-300'
                            : 'text-yellow-600 bg-yellow-100 border border-yellow-300';

                return (
                    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${colorClass}`}>
                        {status}
                    </span>
                );
            },
        },
        {
            header: 'Action',
            accessor: 'action',
            render: (row: TableData) => (
                <div className="flex gap-2">
                    <button
                        onClick={() => handleNavigate(row)}
                        className="text-blue-500 border border-blue-500 rounded-md px-3 py-2 hover:bg-blue-500 hover:text-white"
                    >
                        <EyeIcon />
                    </button>
                    <button
                        // onClick={() => handleDelete(row.id)}
                        onClick={() => {
                            const confirmDelete = window.confirm(
                                "Are you sure you want to reject this service?"
                            );
                            if (confirmDelete) {
                                handleDelete(row.id);
                            }
                        }}
                        className="text-red-500 border border-red-500 rounded-md px-3 py-2 hover:bg-red-500 hover:text-white"
                    >
                        <TrashBinIcon />
                    </button>
                </div>
            ),
        },
    ];



    /* ------------- render -------------- */
    return (
        <div>
            <PageBreadcrumb pageTitle="Subscribe Request" />
            <div className="my-5">
                <ComponentCard title="Subscribe Request">
                    {tableData.length > 0 ? (
                        <BasicTableOne columns={columns} data={tableData} />
                    ) : (
                        /* fallback when nothing to review */
                        <p className="text-center py-8 text-gray-500">
                            No pending subscribe requests.
                        </p>
                    )}
                </ComponentCard>
            </div>


        </div>
    );
};

export default SubscribeRequestPage;
