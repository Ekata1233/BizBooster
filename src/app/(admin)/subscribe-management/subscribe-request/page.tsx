'use client';

import React, { useEffect, useState } from 'react';
import ComponentCard from '@/components/common/ComponentCard';
import PageBreadcrumb from '@/components/common/PageBreadCrumb';
import BasicTableOne from '@/components/tables/BasicTableOne';
import { useService } from '@/context/ServiceContext';
import { useSubscribe } from '@/context/SubscribeContext';
import { EyeIcon, PencilIcon, TrashBinIcon } from '@/icons';
import Button from '@/components/ui/button/Button';
import { Modal } from '@/components/ui/modal';
import { useModal } from '@/hooks/useModal';
import Label from '@/components/form/Label';
import Input from '@/components/form/input/InputField';
import { useRouter } from 'next/navigation';

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
    const router = useRouter();

    const handleNavigate = (row: any) => {
        console.log("row data : ", row)
        router.push(`/subscribe-management/subscribe-request/${row.id}/${row.providerId}`);
    };

    // console.log("service in subsribe request : ", services)
    /* build (or rebuild) the list any time `services` changes */
    useEffect(() => {
        const pending = services
            .filter((service: any) => {
    const rawStatus =
        service.status ??
        (service.providerPrices || []).some(
            (p: any) => (p.status ?? '').toLowerCase() === 'pending'
        )
            ? 'pending'
            : '';
    return rawStatus.toLowerCase() === 'pending';
})

            .map((service: any) => ({
                name: service.serviceName,
                providerId: service.providerPrices?.[0]?.provider?._id || 'N/A',
                providerName: service.providerPrices?.[0]?.provider?.fullName || 'N/A',
                price: service.price || "N/A",
                discountedPrice: service.discountedPrice || "N/A",
                providerPrice: service.providerPrices?.[0]?.providerPrice || "N/A",
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
                        onClick={() => handleAccept(row.id, row.providerId)}
                        className="text-green-600 border border-green-600 rounded-md px-3 py-2 hover:bg-green-600 hover:text-white"
                    >
                        Approve
                    </button>
                    <button
                        onClick={() => handleNavigate(row)}
                        className="text-blue-500 border border-blue-500 rounded-md px-3 py-2 hover:bg-blue-500 hover:text-white"
                    >
                        <EyeIcon />
                    </button>
                    <button
                        onClick={() => handleDelete(row.id)}
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
