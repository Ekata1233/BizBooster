"use client";

import ComponentCard from "@/components/common/ComponentCard";
import BasicTableOne from "@/components/tables/BasicTableOne";
import Pagination from "@/components/tables/Pagination";
import { useUserWallet } from "@/context/WalletContext";
import React, { useEffect, useMemo, useState } from "react";
import { FaMoneyBillWave, FaWallet } from "react-icons/fa";

const Page = () => {
    const userId = "444c44d4444be444d4444444";
    const { wallet, loading, error, fetchWalletByUser } = useUserWallet();

    const [activeTab, setActiveTab] = useState<"all" | "credit" | "debit">("all");
    const [currentPage, setCurrentPage] = useState(1);

    const rowsPerPage = 10;

    useEffect(() => {
        if (userId) {
            fetchWalletByUser(userId);
        }
    }, [userId]);

    const isWalletAvailable = !!wallet && Array.isArray(wallet.transactions) && wallet.transactions.length > 0;

    // Summary Cards
    const summaryCards = useMemo(() => [
        {
            title: "Balance",
            amount: `₹${wallet?.balance?.toLocaleString() || 0}`,
            icon: <FaWallet />,
            gradient: "from-green-100 to-green-200",
            textColor: "text-green-800",
        },
        {
            title: "Total Credits",
            amount: `₹${wallet?.totalCredits?.toLocaleString() || 0}`,
            icon: <FaMoneyBillWave />,
            gradient: "from-blue-100 to-blue-200",
            textColor: "text-blue-800",
        },
        {
            title: "Total Debits",
            amount: `₹${wallet?.totalDebits?.toLocaleString() || 0}`,
            icon: <FaMoneyBillWave />,
            gradient: "from-red-100 to-red-200",
            textColor: "text-red-800",
        },
    ], [wallet]);

    // Filter transactions by tab
    const filteredTransactions = useMemo(() => {
        if (!wallet?.transactions) return [];
        let txns =
        activeTab === "all"
            ? wallet.transactions
            : wallet.transactions.filter((txn) => txn.type === activeTab);

    // ✅ Reverse to show latest first
    return [...txns].reverse();
    }, [wallet, activeTab]);

    // Pagination
    const totalPages = Math.ceil(filteredTransactions.length / rowsPerPage);
    const indexOfLastRow = currentPage * rowsPerPage;
    const indexOfFirstRow = indexOfLastRow - rowsPerPage;
    const currentRows = filteredTransactions.slice(indexOfFirstRow, indexOfLastRow);

    // Table columns
    const columnsWallet = [
        { header: "Type", accessor: "type" },
        { header: "Amount", accessor: "amount" },
        { header: "Description", accessor: "description" },
        { header: "Lead ID", accessor: "leadId" },
        { header: "Commission From", accessor: "commissionFrom" },
        { header: "Method", accessor: "method" },
        { header: "Status", accessor: "status" },
        { header: "Date", accessor: "createdAt" },
    ];

    // Table data
    const transactionData = currentRows.map((txn) => ({
        type: txn.type || "-",
        amount: `₹${txn.amount?.toLocaleString() || 0}`,
        description: txn.description || "-",
        leadId: txn.leadId || "-",
        commissionFrom: txn.commissionFrom || "-",
        method: txn.method || "-",
        status: txn.status || "-",
        createdAt: txn.createdAt ? new Date(txn.createdAt).toLocaleString() : "-",
    }));

    return (
        <div>
            <ComponentCard title="Wallet">
                {/* Summary Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                    {summaryCards.map((card) => (
                        <div
                            key={card.title}
                            className={`bg-gradient-to-r ${card.gradient} ${card.textColor} p-6 rounded-xl shadow flex justify-between items-center`}
                        >
                            <div className="text-3xl bg-white/40 p-3 rounded-full">
                                {card.icon}
                            </div>
                            <div className="text-right">
                                <div className="text-sm font-medium">{card.title}</div>
                                <div className="text-lg font-bold">{card.amount}</div>
                            </div>
                        </div>
                    ))}
                </div>

                {!isWalletAvailable ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center text-gray-500">
                        <FaWallet className="text-5xl mb-4 text-blue-400" />
                        <h2 className="text-xl font-semibold mb-2">No Wallet Found</h2>
                        <p className="text-sm max-w-md">
                            This wallet doesn't have any transactions yet. Once transactions
                            are made, they will appear here.
                        </p>
                    </div>
                ) : (
                    <>
                        {/* Tabs */}
                        <div className="flex gap-2 mb-4">
                            {["all", "credit", "debit"].map((tab) => (
                                <button
                                    key={tab}
                                    onClick={() => {
                                        setActiveTab(tab as "all" | "credit" | "debit");
                                        setCurrentPage(1); // Reset to first page
                                    }}
                                    className={`min-w-[120px] px-4 py-2 rounded-md text-sm font-medium border ${activeTab === tab
                                            ? "bg-blue-600 text-white border-blue-600"
                                            : "bg-white text-gray-700 border-gray-100 hover:bg-blue-50"
                                        }`}
                                >
                                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                                </button>
                            ))}
                        </div>

                        {/* Transactions Table */}
                        {filteredTransactions.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-20 text-center text-gray-500">
                                <FaMoneyBillWave className="text-5xl mb-4 text-blue-400" />
                                <h2 className="text-xl font-semibold mb-2">
                                    No Transactions Found
                                </h2>
                                <p className="text-sm max-w-md">
                                    This wallet doesn't have any transactions yet. Once
                                    transactions are made, they will appear here.
                                </p>
                            </div>
                        ) : (
                            <>
                                <BasicTableOne columns={columnsWallet} data={transactionData} />
                                <div className="flex justify-center mt-4">
                                    <Pagination
                                        currentPage={currentPage}
                                        totalItems={filteredTransactions.length}
                                        totalPages={totalPages}
                                        onPageChange={setCurrentPage}
                                    />
                                </div>
                            </>
                        )}
                    </>
                )}
            </ComponentCard>
        </div>
    );
};

export default Page;
