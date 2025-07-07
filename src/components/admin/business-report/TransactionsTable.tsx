'use client';

import React, { useState, useMemo } from 'react';
import ComponentCard from '@/components/common/ComponentCard';
import BasicTableOne from '@/components/tables/BasicTableOne';
import Pagination from '@/components/tables/Pagination';

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

  const columns = [
    {
      header: 'Date',
      accessor: 'date',
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
    { header: 'Transaction ID', accessor: 'transactionId' },
    { header: 'To', accessor: 'to' },
    { header: 'Wallet', accessor: 'walletType' },
    { header: 'Source', accessor: 'source' },
    { header: 'Method', accessor: 'method' },
    {
      header: 'Type',
      accessor: 'type',
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
      render: (row: Transaction) => `₹${row.credit || '-'}`
    },
    {
      header: 'Debit',
      accessor: 'debit',
      render: (row: Transaction) => `₹${row.debit || '-'}`
    },
    {
      header: 'Balance',
      accessor: 'balance',
      render: (row: Transaction) =>
        row.balance === '-' ? '-' : `₹${Number(row.balance).toLocaleString()}`
    },
    {
      header: 'Status',
      accessor: 'status',
      render: (row: Transaction) => (
        <span
          className={`px-2 py-1 rounded-full text-xs font-semibold 
            ${row.status === 'success' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}
        >
          {row.status}
        </span>
      ),
    },
  ];

  return (
    <div className="my-5">
      <ComponentCard title="Transactions">
        {/* Tabs */}
        <div className="grid grid-cols-8 gap-2 pt-2 px-4">
          {tabButtons.map((tab) => (
            <button
              key={tab.key}
              onClick={() => {
                setCurrentPage(1); // reset to first page on tab switch
                setActiveTab(tab.key);
              }}
              className={`w-full px-4 py-2 text-sm font-medium rounded-md border ${
                activeTab === tab.key
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-blue-50'
              }`}
            >
              {tab.label}
            </button>
          ))}
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
