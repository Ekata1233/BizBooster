'use client';

import React, { useEffect, useState } from 'react';
import ComponentCard from '@/components/common/ComponentCard';
import PageBreadcrumb from '@/components/common/PageBreadCrumb';
import BasicTableOne from '@/components/tables/BasicTableOne';
import { useService } from '@/context/ServiceContext';
import { useSubscribe } from '@/context/SubscribeContext';
import { PencilIcon, TrashBinIcon } from '@/icons';
import Button from '@/components/ui/button/Button';
import { Modal } from '@/components/ui/modal';
import { useModal } from '@/hooks/useModal';
import Label from '@/components/form/Label';
import Input from '@/components/form/input/InputField';

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
    const { isOpen, openModal, closeModal } = useModal();
    const { approveService, deleteService } = useSubscribe();
    const [tableData, setTableData] = useState<TableData[]>([]);
    const [providerCommission, setProviderCommission] = useState(0);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [selectedService, setSelectedService] = useState<TableData | null>(null);

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

    const handleEdit = (service: TableData) => {
        setSelectedService(service);
        openModal();
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

    const submitEdit = async () => {
        if (!selectedService) return;
        setIsSubmitting(true);
        try {
            await approveService(selectedService.id, selectedService.providerId, providerCommission);
            setTableData(prev => prev.filter(row => row.id !== selectedService.id));
            alert('Service Edited successfully!');
            closeModal();
            // Optional: update your tableData if you want to reflect the changes in UI immediately
        } catch (err) {
            console.error(err);
        } finally {
            setIsSubmitting(false);
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
                        className="text-green-600 border border-green-600 rounded-md px-3 py-1 hover:bg-green-600 hover:text-white"
                    >
                        Approve
                    </button>
                    <button
                        onClick={() => handleEdit(row)}
                        className="text-blue-500 border border-blue-500 rounded-md px-3 py-1 hover:bg-blue-500 hover:text-white"
                    >
                        <PencilIcon />
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

            <div>
                <Modal isOpen={isOpen} onClose={closeModal} className="max-w-[700px] m-4">
                    <div className="no-scrollbar relative w-full max-w-[700px] overflow-y-auto rounded-3xl bg-white p-4 dark:bg-gray-900 lg:p-11">
                        <div className="px-2 pr-14">
                            <h4 className="mb-5 text-2xl font-semibold text-gray-800 dark:text-white/90">
                                Edit Service Price
                            </h4>
                        </div>

                        <form className="flex flex-col">
                            <div className="custom-scrollbar h-[80px] overflow-y-auto px-2 pb-3">
                                <div className="">
                                    <div className="grid grid-cols-1 gap-x-6 gap-y-5 ">
                                        <div>
                                            <Label>Enter Provider Commission</Label>
                                            <Input
                                                type="number"
                                                min="0"
                                                value={providerCommission}
                                                placeholder="Enter Provider Commission"
                                                onChange={(e) => setProviderCommission(Number(e.target.value))}
                                            />

                                        </div>


                                    </div>
                                </div>

                            </div>
                            <div className="flex items-center gap-3 px-2 mt-6 lg:justify-end">
                                <Button size="sm" variant="outline" onClick={closeModal}>
                                    Close
                                </Button>
                                <Button size="sm" onClick={submitEdit} disabled={isSubmitting}>
                                    {isSubmitting ? "Updating..." : "Update Commission & Approve"}
                                </Button>


                            </div>
                        </form>
                    </div>
                </Modal>
            </div>
        </div>
    );
};

export default SubscribeRequestPage;
