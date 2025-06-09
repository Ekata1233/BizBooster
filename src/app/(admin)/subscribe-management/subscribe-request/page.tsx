'use client';

import React, { useEffect, useState } from 'react';
import ComponentCard from '@/components/common/ComponentCard';
import PageBreadcrumb from '@/components/common/PageBreadCrumb';
import BasicTableOne from '@/components/tables/BasicTableOne';
import { useService } from '@/context/ServiceContext';
import { useSubscribe } from '@/context/SubscribeContext';
import { TrashBinIcon } from '@/icons';

/* -------------------- types -------------------- */
interface TableData {
    name: string;
    providerId: string;
    providerName: string;
    categoryName: string;
    subCategoryName: string;
    status: string;
    id: string;
}

/* -------------------- component -------------------- */
const SubscribeRequestPage = () => {
    const { services } = useService();
    const { approveService, deleteService } = useSubscribe();
    const [tableData, setTableData] = useState<TableData[]>([]);

    console.log("service in subsribe request : ", services)
    /* build (or rebuild) the list any time `services` changes */
    useEffect(() => {
        const pending = services
            .filter((service: any) => {
                const rawStatus =
                    service.status ?? service.providerPrices?.[0]?.status ?? '';
                return rawStatus.toLowerCase() === 'pending';
            })
            .map((service: any) => ({
                name: service.serviceName,
                providerId: service.providerPrices?.[0]?.provider?._id || 'N/A',
                providerName: service.providerPrices?.[0]?.provider?.fullName || 'N/A',
                price : service.price || "N/A",
                providerPrice : service.providerPrices?.[0]?.providerPrice ||"N/A",
                categoryName: service.category?.name || 'N/A',
                subCategoryName: service.subcategory?.name || 'N/A',
                status: service.status ?? service.providerPrices?.[0]?.status ?? 'Accept',
                id: service._id,
            }));

        setTableData(pending);
    }, [services]);

    /* ------------ handlers ------------- */
    const handleAccept = async (serviceId: string, providerId: string) => {
        try {
            await approveService(serviceId, providerId);
            /* remove the row right away */
            setTableData(prev => prev.filter(row => row.id !== serviceId));
        } catch (err) {
            console.error(err);
        }
    };

    const handleDelete = async (serviceId: string) => {
        try {
            await deleteService(serviceId);
            /* remove the row right away */
            setTableData(prev => prev.filter(row => row.id !== serviceId));
        } catch (err) {
            console.error(err);
        }
    };

    /* ------------- columns -------------- */
    const columns = [
        { header: 'Provider Name', accessor: 'providerName' },
        { header: 'Service Name', accessor: 'name' },
        { header: 'Price', accessor: 'price' },
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
                        onClick={() => handleAccept(row.id, row.providerId)}
                        className="text-green-600 border border-green-600 rounded-md px-3 py-1 hover:bg-green-600 hover:text-white"
                    >
                        Accept
                    </button>
                    <button
                        onClick={() => handleDelete(row.id)}
                        className="text-red-500 border border-red-500 rounded-md px-3 py-1 hover:bg-red-500 hover:text-white"
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
                    <BasicTableOne columns={columns} data={tableData} />
                </ComponentCard>
            </div>
        </div>
    );
};

export default SubscribeRequestPage;
