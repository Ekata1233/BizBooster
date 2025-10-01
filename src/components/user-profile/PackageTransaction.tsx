'use client';
import React, { useEffect, useState } from 'react';
import ComponentCard from '../common/ComponentCard';
import { usePackageTransaction } from '@/context/PackageTransactionContext';
import { useParams } from 'next/navigation';
import BasicTableOne from '@/components/tables/BasicTableOne';
import Pagination from '@/components/tables/Pagination';
import StatCard from '../common/StatCard'; // ✅ Use your custom StatCard
import * as XLSX from 'xlsx';
import { FaBoxOpen, FaFileDownload } from 'react-icons/fa';
import { BoxCubeIcon, DollarLineIcon } from '@/icons';
import { Modal } from '../ui/modal';
import Input from '../form/input/InputField';

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
    // Add new state for password
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [password, setPassword] = useState("");
    const { data, loading, error, fetchPackageTransaction } = usePackageTransaction();
    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage] = useState(5);
    const [showModal, setShowModal] = useState(false);
    const [manualUpdateData, setManualUpdateData] = useState({
        amount: '',
        transactionId: '',
        description: '',
        updaterName: ''
    });

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
        { header: 'Transaction ID', accessor: 'order_id' },
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

    const handleManualUpdateSubmit = async () => {
        if (!manualUpdateData.amount || !manualUpdateData.transactionId) {
            alert("Amount and Transaction ID are required!");
            return;
        }

        try {
            const payload = {
                order_id: manualUpdateData.transactionId, // Or you can use manualUpdateData.transactionId as order_id if you want
                payment_id: manualUpdateData.transactionId,
                amount: Number(manualUpdateData.amount),
                currency: "INR",
                status: "PENDING", // default, or make selectable in UI
                description: manualUpdateData.description,
                updaterName: manualUpdateData.updaterName,
                customerId: customerId, // ✅ from URL params
            };

            const res = await axios.post("http://localhost:3000/api/payments", payload);

            if (res.status === 200 || res.status === 201) {
                alert("Payment manually updated successfully!");
                fetchPackageTransaction(customerId); // ✅ refresh data
                setShowModal(false);
                setManualUpdateData({
                    amount: "",
                    transactionId: "",
                    description: "",
                    updaterName: ""
                });
            }
        } catch (err: any) {
            console.error("Manual update failed:", err);
            alert("Failed to update package. Please try again.");
        }
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
                <div className="flex justify-between mb-2">
                    <button
                        onClick={() => setShowModal(true)}
                        className="flex items-center gap-2 px-4 py-2 text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 transition"
                    >
                        <FaBoxOpen className="w-5 h-5" />
                        <span>Manually Update Package</span>
                    </button>
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

            <Modal isOpen={showModal} onClose={() => setShowModal(false)} className="max-w-md">
                <div className="p-4">
                    <h2 className="text-lg font-semibold mb-8 text-gray-800 text-center">Manually Update Package</h2>

                    <div className=''>
                        <Input
                            placeholder="Amount"
                            value={manualUpdateData.amount}
                            onChange={(e) => setManualUpdateData({ ...manualUpdateData, amount: e.target.value })}
                            className="mb-4"
                        />
                        <Input
                            placeholder="Transaction ID"
                            value={manualUpdateData.transactionId}
                            onChange={(e) => setManualUpdateData({ ...manualUpdateData, transactionId: e.target.value })}
                            className="mb-4"
                        />
                        <Input
                            placeholder="Description"
                            value={manualUpdateData.description}
                            onChange={(e) => setManualUpdateData({ ...manualUpdateData, description: e.target.value })}
                            className="mb-4"
                        />
                        <Input
                            placeholder="Name of Updater"
                            value={manualUpdateData.updaterName}
                            onChange={(e) => setManualUpdateData({ ...manualUpdateData, updaterName: e.target.value })}
                            className="mb-4"
                        />
                    </div>

                    <div className="flex justify-end gap-3">
                        <button
                            onClick={() => setShowModal(false)}
                            className="px-4 py-2 text-sm bg-gray-300 rounded-lg hover:bg-gray-400"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={() => setShowPasswordModal(true)}
                            className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                        >
                            Confirm
                        </button>
                    </div>
                </div>
            </Modal>

            <Modal isOpen={showPasswordModal} onClose={() => setShowPasswordModal(false)} className="max-w-sm">
                <div className="p-4">
                    <h2 className="text-lg font-semibold mb-4 text-gray-800 text-center">
                        Enter Password to Confirm
                    </h2>

                    <Input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="mb-4"
                    />

                    <div className="flex justify-end gap-3">
                        <button
                            onClick={() => setShowPasswordModal(false)}
                            className="px-4 py-2 text-sm bg-gray-300 rounded-lg hover:bg-gray-400"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={async () => {
                                if (password !== "activate@2025") {
                                    alert("Invalid password!");
                                    return;
                                }

                                // ✅ Call your existing function
                                await handleManualUpdateSubmit();

                                // ✅ Close password modal + reset
                                setShowPasswordModal(false);
                                setPassword("");
                            }}
                            className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                        >
                            Confirm
                        </button>
                    </div>
                </div>
            </Modal>

        </div>
    );
};

export default PackageTransaction;
