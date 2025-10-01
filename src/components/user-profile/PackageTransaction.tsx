'use client';
import React, { useEffect, useState } from 'react';
import ComponentCard from '../common/ComponentCard';
import { usePackageTransaction } from '@/context/PackageTransactionContext';
import { useParams } from 'next/navigation';
import BasicTableOne from '@/components/tables/BasicTableOne';
import Pagination from '@/components/tables/Pagination';
import StatCard from '../common/StatCard'; // ✅ Use your custom StatCard
import * as XLSX from 'xlsx';
import { FaFileDownload } from 'react-icons/fa';
import { BoxCubeIcon, DollarLineIcon } from '@/icons';

interface Payment {
    _id: string;
    amount: number;
    createdAt: string;
    currency: string;
    customerId: string;
    email: string;
    name: string;
    order_id: string;
    slug: string;
    status: string;
    updatedAt: string;
}

interface PackageDetails {
    packageActivateDate: string | null;
    packageActive: boolean;
    packageAmountPaid: number;
    packagePrice: number;
    remainingAmount: number;
}

interface PackageTransactionData {
    payments: Payment[];
    packageDetails: PackageDetails;
}

const PackageTransaction = () => {
    const params = useParams();
    const customerId = params?.id;

    const { data, loading, error, fetchPackageTransaction } = usePackageTransaction();
    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage] = useState(5);

    useEffect(() => {
        if (customerId) fetchPackageTransaction(customerId);
    }, [customerId]);

    if (loading) return <p>Loading...</p>;
    if (error) return <p className="text-red-500">{error}</p>;
    if (!data || (!data.payments.length && !data.packageDetails)) return <p>No data found</p>;

    const { packageDetails, payments } = data as PackageTransactionData;

    // Pagination
    const totalPages = Math.ceil(payments.length / rowsPerPage);
    const indexOfLastRow = currentPage * rowsPerPage;
    const indexOfFirstRow = indexOfLastRow - rowsPerPage;
    const currentRows = payments.slice(indexOfFirstRow, indexOfLastRow);

    // Table Columns
    const columns = [
        {
            header: 'S.No',
            accessor: 'serial',
            render: (_row: Payment, index: number) => <span>{(index + 1).toString()}</span>, // ✅ cast to string
        },
        { header: 'Amount', accessor: 'amount' },
        {
            header: 'Status', accessor: 'status', render: (row: Payment) => (
                <span className={`px-2 py-1 rounded-full text-xs ${row.status === 'paid' ? 'text-green-600 bg-green-100' : 'text-yellow-600 bg-yellow-100'}`}>
                    {row.status}
                </span>
            )
        },
        { header: 'Order ID', accessor: 'order_id' },
        { header: 'Created At', accessor: 'createdAt', render: (row: Payment) => new Date(row.createdAt).toLocaleString() },
    ];

    const handleDownload = () => {
        if (payments.length === 0) return alert('No payment data available');

        const dataToExport = payments.map(p => ({
            Amount: p.amount,
            Status: p.status,
            'Created At': new Date(p.createdAt).toLocaleString(),
            'Order ID': p.order_id,
            Name: p.name,
            Email: p.email,
        }));

        const worksheet = XLSX.utils.json_to_sheet(dataToExport);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Payments');
        XLSX.writeFile(workbook, `PackageTransactions_${customerId}.xlsx`);
    };

    return (
        <div>
            {/* Stat Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">
                <StatCard icon={BoxCubeIcon} title="Package Price" value={`₹${packageDetails.packagePrice}`} gradient="from-blue-100 to-blue-200" textColor="text-blue-800" />

                <StatCard icon={DollarLineIcon} title="Package Amount Paid" value={`₹${packageDetails.packageAmountPaid}`} gradient="from-green-100 to-green-200" textColor="text-green-800" />

                <StatCard icon={BoxCubeIcon} title="Remaining Amount" value={`₹${packageDetails.remainingAmount}`} gradient="from-yellow-100 to-yellow-200" textColor="text-yellow-800" />
            </div>

            {/* Payment Table */}
            <ComponentCard title="Package Payments">
                <div className="flex justify-end mb-2">
                    <button
                        onClick={handleDownload}
                        className="flex items-center gap-2 px-4 py-2 text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 transition"
                    >
                        <FaFileDownload className="w-5 h-5" />
                        <span>Download Excel</span>
                    </button>
                </div>
                <BasicTableOne columns={columns} data={currentRows} />
                <div className="flex justify-center mt-4">
                    <Pagination
                        currentPage={currentPage}
                        totalItems={payments.length}
                        totalPages={totalPages}
                        onPageChange={setCurrentPage}
                    />
                </div>
            </ComponentCard>
        </div>
    );
};

export default PackageTransaction;
