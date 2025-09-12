"use client";

import ComponentCard from "@/components/common/ComponentCard";
import BasicTableOne from "@/components/tables/BasicTableOne";
import Pagination from "@/components/tables/Pagination";
import { useCheckout } from "@/context/CheckoutContext";
import { useUserWallet } from "@/context/WalletContext";
import React, { useEffect, useMemo, useState } from "react";
import { FaMoneyBillWave, FaWallet } from "react-icons/fa";
import { FaFileDownload } from "react-icons/fa";
import * as XLSX from "xlsx";

const Page = () => {
    const userId = "444c44d4444be444d4444444";
    const { wallet, loading, error, fetchWalletByUser } = useUserWallet();
    const { checkouts } = useCheckout();

    const [activeTab, setActiveTab] = useState<
        "all" | "credit" | "debit" | "package" | "lead" | "deposit"
    >("all");
    const [currentPage, setCurrentPage] = useState(1);

    const rowsPerPage = 10;

    console.log("All Checkouts : ", checkouts);

    const leadEarningsTransactions =
        wallet?.transactions?.filter(
            (txn) => txn.description?.trim() === "Team Revenue - Admin"
        ) || [];

    console.log("Lead Earnings Transactions:", leadEarningsTransactions);

    useEffect(() => {
        if (userId) {
            fetchWalletByUser(userId);
        }
    }, [userId]);
    useEffect(() => {
  if (checkouts && wallet?.transactions) {
    // ✅ Match wallet.leadId ↔ checkout.bookingId
    const matchedCheckouts = checkouts.filter((checkout) =>
      wallet.transactions.some(
        (txn) =>
          txn.leadId &&
          txn.leadId.trim() === checkout.bookingId.trim() &&
          txn.description?.trim() === "Team Revenue - Admin"
      )
    );

    // ✅ Map to only required fields
    const checkoutDetails = matchedCheckouts.map((c) => ({
      bookingId: c.bookingId,
      platformFeePrice: c.platformFeePrice,
      assurityChargesPrice: c.assurityChargesPrice,
      totalExtraFee: (c.platformFeePrice || 0) + (c.assurityChargesPrice || 0),
      user: c.user?.fullName || "N/A",
      service: c.service?.serviceName || "N/A",
      createdAt: c.createdAt,
    }));

    console.log("✅ Matched Checkouts Data:", checkoutDetails);
  }
}, [checkouts, wallet]);

    const isWalletAvailable =
        !!wallet && Array.isArray(wallet.transactions) && wallet.transactions.length > 0;

    // ✅ Summary Cards
    const summaryCards = useMemo(() => {
        const packageEarningsTotal =
            wallet?.transactions
                ?.filter(
                    (txn) => txn.description?.trim() === "Team Build Commission - Admin"
                )
                .reduce((acc, txn) => acc + (txn.amount || 0), 0) || 0;

        const leadEarningsTotal =
            wallet?.transactions
                ?.filter((txn) => txn.description?.trim() === "Team Revenue - Admin")
                .reduce((acc, txn) => acc + (txn.amount || 0), 0) || 0;

        const depositTotal =
            wallet?.transactions
                ?.filter((txn) => txn.description?.trim() === "Deposit")
                .reduce((acc, txn) => acc + (txn.amount || 0), 0) || 0;

        // ✅ NEW: Calculate Extra Fee only for matching Lead ↔ Checkout
        const matchingExtraFee =
            wallet?.transactions
                ?.filter(
                    (txn) =>
                        txn.leadId && txn.description?.trim() === "Team Revenue - Admin"
                )
                ?.reduce((acc, txn) => {
                    const relatedCheckout = checkouts?.find(
                        (c) => c.bookingId === txn.leadId
                    );
                    if (relatedCheckout) {
                        return (
                            acc +
                            (relatedCheckout.platformFeePrice || 0) +
                            (relatedCheckout.assurityChargesPrice || 0)
                        );
                    }
                    return acc;
                }, 0) || 0;

        return [
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
                title: "Extra Fee",
                amount: `₹${matchingExtraFee.toLocaleString()}`,
                icon: <FaMoneyBillWave />,
                gradient: "from-red-100 to-red-200",
                textColor: "text-red-800",
            },
            {
                title: "Lead Earnings",
                amount: `₹${leadEarningsTotal.toLocaleString()}`,
                icon: <FaWallet />,
                gradient: "from-yellow-100 to-yellow-200",
                textColor: "text-yellow-800",
            },
            {
                title: "Package Earnings",
                amount: `₹${packageEarningsTotal.toLocaleString()}`,
                icon: <FaMoneyBillWave />,
                gradient: "from-purple-100 to-purple-200",
                textColor: "text-purple-800",
            },
            {
                title: "Deposite Collections",
                amount: `₹${depositTotal.toLocaleString()}`,
                icon: <FaMoneyBillWave />,
                gradient: "from-teal-100 to-teal-200",
                textColor: "text-teal-800",
            },
        ];
    }, [wallet, checkouts]);

    // ✅ Filter + reverse transactions
    const filteredTransactions = useMemo(() => {
        if (!wallet?.transactions) return [];

        let txns: typeof wallet.transactions = [];

        if (activeTab === "all") {
            txns = wallet.transactions;
        } else if (activeTab === "credit" || activeTab === "debit") {
            txns = wallet.transactions.filter((txn) => txn.type === activeTab);
        } else if (activeTab === "package") {
            txns = wallet.transactions.filter(
                (txn) => txn.description?.trim() === "Team Build Commission - Admin"
            );
        } else if (activeTab === "lead") {
            txns = wallet.transactions.filter(
                (txn) => txn.description?.trim() === "Team Revenue - Admin"
            );
        } else if (activeTab === "deposit") {
            txns = wallet.transactions.filter(
                (txn) => txn.description?.trim() === "Deposit"
            );
        }

        // ✅ Reverse order so newest is first
        return [...txns].reverse();
    }, [wallet, activeTab]);

    // Pagination
    const totalPages = Math.ceil(filteredTransactions.length / rowsPerPage);
    const indexOfLastRow = currentPage * rowsPerPage;
    const indexOfFirstRow = indexOfLastRow - rowsPerPage;
    const currentRows = filteredTransactions.slice(indexOfFirstRow, indexOfLastRow);

    // ✅ Table columns (with Serial No)
    const columnsWallet = [
        { header: "S.No", accessor: "serial" },
        { header: "Type", accessor: "type" },
        { header: "Amount", accessor: "amount" },
        { header: "Description", accessor: "description" },
        { header: "Lead ID", accessor: "leadId" },
        { header: "Commission From", accessor: "commissionFrom" },
        { header: "Method", accessor: "method" },
        { header: "Status", accessor: "status" },
        { header: "Date", accessor: "createdAt" },
    ];

    // ✅ Table data with serial numbers in reverse
    const transactionData = currentRows.map((txn, index) => {
        // Calculate global index
        const globalIndex = (currentPage - 1) * rowsPerPage + index;

        // ✅ Serial number reversed
        const serial = filteredTransactions.length - globalIndex;

        return {
            serial,
            type: txn.type || "-",
            amount: `₹${txn.amount?.toLocaleString() || 0}`,
            description: txn.description || "-",
            leadId: txn.leadId || "-",
            commissionFrom: txn.commissionFrom || "-",
            method: txn.method || "-",
            status: txn.status || "-",
            createdAt: txn.createdAt
                ? new Date(txn.createdAt).toLocaleString()
                : "-",
        };
    });

    // ✅ Excel download
    const handleDownload = () => {
        if (!wallet?.transactions) return;

        const exportData = filteredTransactions.map((txn, index) => ({
            "S.No": index + 1,
            Type: txn.type,
            Amount: txn.amount,
            Description: txn.description,
            LeadID: txn.leadId,
            CommissionFrom: txn.commissionFrom,
            Method: txn.method,
            Status: txn.status,
            Date: new Date(txn.createdAt).toLocaleString(),
        }));

        const worksheet = XLSX.utils.json_to_sheet(exportData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, `${activeTab}-wallet`);
        XLSX.writeFile(workbook, `${activeTab}-wallet.xlsx`);
    };

    return (
        <div>
            <ComponentCard title="Admin Earnings">
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
                        {/* Tabs + Download */}
                        <div className="flex justify-between items-center border-b border-gray-200 pb-2 mb-4">
                            <ul className="flex space-x-6 text-sm font-medium text-center text-gray-500">
                                {["all", "lead", "package", "deposit"].map((tab) => (
                                    <li
                                        key={tab}
                                        onClick={() => {
                                            setActiveTab(
                                                tab as
                                                    | "all"
                                                    | "credit"
                                                    | "debit"
                                                    | "package"
                                                    | "lead"
                                                    | "deposit"
                                            );
                                            setCurrentPage(1);
                                        }}
                                        className={`cursor-pointer px-4 py-2 ${
                                            activeTab === tab
                                                ? "border-b-2 border-blue-600 text-blue-600"
                                                : ""
                                        }`}
                                    >
                                        {tab === "package"
                                            ? "Package Earnings"
                                            : tab === "lead"
                                            ? "Lead Earnings"
                                            : tab === "deposit"
                                            ? "Deposit Collections"
                                            : tab.charAt(0).toUpperCase() + tab.slice(1)}
                                        <span className="ml-2 bg-red-500 text-white text-xs font-semibold px-2 py-0.5 rounded-full">
                                            {tab === "all"
                                                ? wallet.transactions.length
                                                : tab === "package"
                                                ? wallet.transactions.filter(
                                                      (txn) =>
                                                          txn.description ===
                                                          "Team Build Commission - Admin"
                                                  ).length
                                                : tab === "lead"
                                                ? wallet.transactions.filter(
                                                      (txn) =>
                                                          txn.description ===
                                                          "Team Revenue - Admin"
                                                  ).length
                                                : tab === "deposit"
                                                ? wallet.transactions.filter(
                                                      (txn) =>
                                                          txn.description === "Deposit"
                                                  ).length
                                                : wallet.transactions.filter(
                                                      (txn) => txn.type === tab
                                                  ).length}
                                        </span>
                                    </li>
                                ))}
                            </ul>

                            <button
                                onClick={handleDownload}
                                className="flex items-center gap-2 px-4 py-2 text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 transition"
                            >
                                <FaFileDownload className="w-5 h-5" />
                                <span>Download Excel</span>
                            </button>
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
                                <BasicTableOne
                                    columns={columnsWallet}
                                    data={transactionData}
                                />
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
