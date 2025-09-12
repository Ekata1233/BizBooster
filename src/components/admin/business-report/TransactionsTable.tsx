'use client';

import React, { useState, useMemo } from 'react';
import ComponentCard from '@/components/common/ComponentCard';
import BasicTableOne from '@/components/tables/BasicTableOne';
import Pagination from '@/components/tables/Pagination';
import { FaFileDownload } from "react-icons/fa";
import * as XLSX from "xlsx";

interface Transaction {
  transactionId: string;
  walletType: string;
  to: string;
  date: string;
  type: string;
  credit: number;
  debit: number;
  balance: string | number;
  method: string;
  status: string;
  source: string;
}

interface Props {
  transactions: Transaction[];
}

const TransactionsTable: React.FC<Props> = ({ transactions }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [activeTab, setActiveTab] = useState<'all' | 'credit' | 'debit'>('all');

  const rowsPerPage = 10;

  const tabButtons = [
    { key: 'all', label: 'All' },
    { key: 'credit', label: 'Credit' },
    { key: 'debit', label: 'Debit' },
  ] as const;

  // ✅ Precompute counts for tabs
  const tabCounts = useMemo(() => {
    return {
      all: transactions.length,
      credit: transactions.filter((t) => t.type === 'credit').length,
      debit: transactions.filter((t) => t.type === 'debit').length,
    };
  }, [transactions]);

  // Filtered Transactions
  const filteredTransactions = useMemo(() => {
    if (activeTab === 'credit') {
      return transactions.filter((t) => t.type === 'credit');
    } else if (activeTab === 'debit') {
      return transactions.filter((t) => t.type === 'debit');
    }
    return transactions;
  }, [activeTab, transactions]);

  const totalPages = Math.ceil(filteredTransactions.length / rowsPerPage);
  const indexOfLastRow = currentPage * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;
  const currentRows = filteredTransactions.slice(indexOfFirstRow, indexOfLastRow);

 // ✅ Columns definition with width control
const columns = [
  {
    header: 'Date',
    accessor: 'date',
    className: "w-32", // fixed width
    render: (row: Transaction) => {
      const dateObj = new Date(row.date);
      const date = dateObj.toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      });
      const time = dateObj.toLocaleTimeString('en-IN', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      });

      return (
        <div className="flex flex-col text-sm leading-snug">
          <span>{date}</span>
          <span className="text-gray-500">{time}</span>
        </div>
      );
    },
  },
  {
    header: 'Transaction ID',
    accessor: 'transactionId',
    className: "w-40 truncate", // reduced width + ellipsis
    render: (row: Transaction) => (
      <span className="block truncate max-w-[150px]">{row.transactionId}</span>
    ),
  },
  { header: 'To', accessor: 'to', className: "w-32 truncate" },
  { header: 'Wallet', accessor: 'walletType', className: "w-28" },
  // { header: 'Source', accessor: 'source', className: "w-28 truncate" },
  { header: 'Method', accessor: 'method', className: "w-28" },
  {
    header: 'Type',
    accessor: 'type',
    className: "w-24",
    render: (row: Transaction) => (
      <span
        className={`px-2 py-1 rounded-full text-xs font-semibold 
          ${row.type === 'credit' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}
      >
        {row.type}
      </span>
    ),
  },
  {
    header: 'Credit',
    accessor: 'credit',
    className: "w-28",
    render: (row: Transaction) => `₹${row.credit || '-'}`
  },
  {
    header: 'Debit',
    accessor: 'debit',
    className: "w-28",
    render: (row: Transaction) => `₹${row.debit || '-'}`
  },
  {
    header: 'Balance',
    accessor: 'balance',
    className: "w-32",
    render: (row: Transaction) =>
      row.balance === '-' ? '-' : `₹${Number(row.balance).toLocaleString()}`
  },
 {
  header: 'Status',
  accessor: 'status',
  className: "w-28",
  render: (row: Transaction) => {
    let statusClass = '';
    if (row.status === 'success') {
      statusClass = 'bg-green-100 text-green-700';
    } else if (row.status === 'failed') {
      statusClass = 'bg-red-100 text-red-700';
    } else {
      statusClass = 'bg-yellow-100 text-yellow-700'; // for other statuses like 'pending'
    }

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${statusClass}`}>
        {row.status}
      </span>
    );
  },
}

];


  // ✅ Excel download function
  const handleDownload = () => {
    const exportData = filteredTransactions.map((row) => ({
      Date: new Date(row.date).toLocaleString(),
      TransactionID: row.transactionId,
      To: row.to,
      Wallet: row.walletType,
      Source: row.source,
      Method: row.method,
      Type: row.type,
      Credit: row.credit || "-",
      Debit: row.debit || "-",
      Balance: row.balance,
      Status: row.status,
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, `${activeTab}-transactions`);
    XLSX.writeFile(workbook, `${activeTab}-transactions.xlsx`);
  };

  return (
    <div className="my-5">
      <ComponentCard title="Transactions">
        {/* ✅ Tabs + Download Button in same row */}
        <div className="flex justify-between items-center border-b border-gray-200 pb-2 px-4">
          {/* Tabs */}
          <ul className="flex space-x-6 text-sm font-medium text-center text-gray-500">
            {tabButtons.map((tab) => (
              <li
                key={tab.key}
                onClick={() => {
                  setCurrentPage(1); 
                  setActiveTab(tab.key);
                }}
                className={`cursor-pointer px-4 py-2 ${
                  activeTab === tab.key
                    ? 'border-b-2 border-blue-600 text-blue-600'
                    : ''
                }`}
              >
                {tab.label}
                <span className="ml-2 bg-red-500 text-white text-xs font-semibold px-2 py-0.5 rounded-full">
                  {tabCounts[tab.key]}
                </span>
              </li>
            ))}
          </ul>

          {/* ✅ Download Button */}
          <button
            onClick={handleDownload}
            className="flex items-center gap-2 px-4 py-2 text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 transition"
          >
            <FaFileDownload className="w-5 h-5" />
            <span>Download Excel</span>
          </button>
        </div>

        {/* Table */}
        <div className="mt-4">
          <BasicTableOne columns={columns} data={currentRows} />
        </div>

        {/* Pagination */}
        <div className="flex justify-center mt-4">
          <Pagination
            currentPage={currentPage}
            totalItems={filteredTransactions.length}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </div>
      </ComponentCard>
    </div>
  );
};

export default TransactionsTable;
