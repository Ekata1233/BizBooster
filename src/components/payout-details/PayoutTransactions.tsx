"use client";

import React from "react";
import BasicTableOne from "@/components/tables/BasicTableOne";
import Pagination from "@/components/tables/Pagination";
import { FaFileDownload, FaFilter } from "react-icons/fa";
import * as XLSX from "xlsx";

interface PayoutTransactionsProps {
  payoutData: any[];
  activeTab: "total" | "user" | "provider";
  setActiveTab: React.Dispatch<React.SetStateAction<"total" | "user" | "provider">>;
  currentPage: number;
  setCurrentPage: React.Dispatch<React.SetStateAction<number>>;
  totalPages: number;
  totalRecords: number;
  startDate: string;
  endDate: string;
  setStartDate: React.Dispatch<React.SetStateAction<string>>;
  setEndDate: React.Dispatch<React.SetStateAction<string>>;
  setFilterTrigger: React.Dispatch<React.SetStateAction<number>>; 
}

const PayoutTransactions: React.FC<PayoutTransactionsProps> = ({
  payoutData,
  activeTab,
  setActiveTab,
  currentPage,
  setCurrentPage,
  totalPages,
  totalRecords,
  startDate,
  endDate,
  setStartDate,
  setEndDate,
  setFilterTrigger
}) => {
  const rowsPerPage = 10;


  // ✅ Table Columns
  const columns = [
    { header: "S.No", accessor: "serial" },
    { header: "Type", accessor: "type" },
    { header: "Name", accessor: "name" },
    { header: "Email", accessor: "email" },
    { header: "Phone", accessor: "phone" },
    { header: "Balance (₹)", accessor: "balance" },
    { header: "Pending Payout (₹)", accessor: "pendingPayout" },
    { header: "Bank Name", accessor: "bankName" },
  ];

  // ✅ Table Data
  const tableData = payoutData.map((item, index) => ({
    serial: (currentPage - 1) * rowsPerPage + index + 1,
    type: item.type,
    name: item.type === "user" ? item.fullName || "-" : item.storeName || "-",
    email: item.email || "-",
    phone: item.type === "user" ? item.mobileNumber || "-" : item.phoneNo || "-",
    balance: item.wallet?.balance?.toFixed(2) || "0.00",
    pendingPayout: item.wallet?.pendingWithdraw?.toFixed(2) || "0.00",
    bankName: item.bankDetails?.bankName || "-",
  }));

  // ✅ Excel Download
  const handleDownload = () => {
    if (!payoutData.length) return;

    const exportData = payoutData.map((item, index) => ({
      "S.No": index + 1,
      Type: item.type,
      Name: item.type === "user" ? item.fullName || "-" : item.storeName || "-",
      Email: item.email || "-",
      Phone: item.type === "user" ? item.mobileNumber || "-" : item.phoneNo || "-",
      Balance: item.wallet?.balance?.toFixed(2) || "0.00",
      "Pending Payout": item.wallet?.pendingWithdraw?.toFixed(2) || "0.00",
      "Bank Name": item.bankDetails?.bankName || "-",
      "Account Number": item.bankDetails?.accountNumber || "-",
      IFSC: item.bankDetails?.ifsc || "-",
      Branch: item.bankDetails?.branchName || "-",
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, `${activeTab}-payouts`);
    XLSX.writeFile(workbook, `${activeTab}-payouts.xlsx`);
  };
  const [tempStartDate, setTempStartDate] = React.useState(startDate);
  const [tempEndDate, setTempEndDate] = React.useState(endDate);

  const handleFilter = () => {
    setStartDate(tempStartDate);
    setEndDate(tempEndDate);
    setCurrentPage(1);
    setFilterTrigger(prev => prev + 1);
  };

  return (
    <>
      {/* ✅ Filters & Export Section */}
      <div className="flex flex-wrap justify-between items-center bg-white p-4 border border-gray-200 rounded-xl shadow-sm mb-6">
        {/* 📅 Date Filters */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-600">Start Date:</label>
            <input
              type="date"
              value={tempStartDate}
              onChange={(e) => setTempStartDate(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-600">End Date:</label>
            <input
              type="date"
              value={tempEndDate}
              onChange={(e) => setTempEndDate(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <button
            onClick={handleFilter}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 transition-all"
          >
            <FaFilter /> Filter
          </button>
        </div>

        {/* 📤 Export Excel */}
        <button
          onClick={handleDownload}
          className="flex items-center gap-2 text-blue-600 border border-blue-600 px-4 py-2 rounded-lg text-sm hover:bg-blue-50 transition-all"
        >
          <FaFileDownload className="w-5 h-5" />
          Export Excel
        </button>
      </div>

      {/* 📤 Export Excel */}
      {/* <button
          onClick={handleDownload}
          className="flex items-center gap-2 text-blue-600 border border-blue-600 px-4 py-2 rounded-lg text-sm hover:bg-blue-50 transition-all"
        >
          <FaFileDownload className="w-5 h-5" />
          Export Excel
        </button>
      </div> */}

      {/* ✅ Tabs Section */}
      <div className="flex mb-6 border-b border-gray-200">
        <ul className="flex space-x-6 text-sm font-medium text-gray-600">
          {["total", "user", "provider"].map((tab) => (
            <li
              key={tab}
              onClick={() => {
                setActiveTab(tab as typeof activeTab);
                setCurrentPage(1);
              }}
              className={`cursor-pointer px-4 py-2 transition-all ${activeTab === tab
                ? "border-b-2 border-blue-600 text-blue-600 font-semibold"
                : "hover:text-blue-600"
                }`}
            >
              {tab === "user"
                ? "User Payout"
                : tab === "provider"
                  ? "Provider Payout"
                  : "Total Payout"}
            </li>
          ))}
        </ul>
      </div>


      {/* Table + Pagination */}
      {payoutData.length === 0 ? (
        <div className="text-gray-500 text-center py-10">No payout data found.</div>
      ) : (
        <>
          <BasicTableOne columns={columns} data={tableData} />
          <div className="flex justify-center mt-4">
            <Pagination
              currentPage={currentPage}
              totalItems={totalRecords}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </div>
        </>
      )}
    </>
  );
};

export default PayoutTransactions;
