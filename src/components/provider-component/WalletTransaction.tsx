'use client';

import React, { useState, useMemo } from 'react';
import { FaMoneyBillWave } from 'react-icons/fa';
import BasicTableOne from '@/components/tables/BasicTableOne';
import { IProviderWallet } from '@/models/ProviderWallet';

interface WalletTransactionProps {
  wallet: IProviderWallet | null;
  loading: boolean;
  error: string | null;
}

const WalletTransaction: React.FC<WalletTransactionProps> = ({
  wallet,
  loading,
  error
}) => {
  const [activeTab, setActiveTab] = useState<'all' | 'credit' | 'debit'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  if (loading) return <p>Loading transactions...</p>;
  if (error) return <p style={{ color: 'red' }}>{error}</p>;
  if (!wallet) return <p>No wallet data found.</p>;

  const columns = [
    {
      header: 'Transaction ID',
      accessor: 'referenceId',
      render: (row: any) => <span>{row.referenceId || '-'}</span>,
    },
    {
      header: 'Description',
      accessor: 'description',
      render: (row: any) => <span>{row.description}</span>,
    },
    {
      header: 'Date',
      accessor: 'createdAt',
      render: (row: any) => <span>{new Date(row.createdAt).toLocaleString()}</span>,
    },
    {
      header: 'Lead ID',
      accessor: 'leadId',
      render: (row: any) => <span>{row.leadId || '-'}</span>,
    },
    {
      header: 'Method',
      accessor: 'method',
      render: (row: any) => <span>{row.method || '-'}</span>,
    },
    {
      header: 'Status',
      accessor: 'status',
      render: (row: any) => <span>{row.status || '-'}</span>,
    },
    {
      header: 'Debit',
      accessor: 'debit',
      render: (row: any) => (row.type === 'debit' ? `₹${row.amount}` : '-'),
    },
    {
      header: 'Credit',
      accessor: 'credit',
      render: (row: any) => (row.type === 'credit' ? `₹${row.amount}` : '-'),
    },
    {
      header: 'Balance',
      accessor: 'balance',
      render: (row: any) => <span>₹{row.balanceAfterTransaction ?? '-'}</span>,
    },
  ];

  // ✅ Filter transactions based on tab, searchTerm (including leadId)
  const filteredTransactions = useMemo(() => {
    return wallet.transactions
      .filter((txn) => {
        const search = searchTerm.toLowerCase();
        const matchSearch =
          txn.referenceId?.toLowerCase().includes(search) ||
          txn.description?.toLowerCase().includes(search) ||
          txn.leadId?.toLowerCase().includes(search); // ✅ include leadId
        const matchTab = activeTab === 'all' || txn.type === activeTab;
        return matchSearch && matchTab;
      })
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [wallet.transactions, activeTab, searchTerm]);

  // Running balance calculation
  const enrichedTransactions = useMemo(() => {
    const sortedAsc = [...filteredTransactions].sort(
      (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );
    let runningBalance = 0;
    return sortedAsc.map((txn) => {
      runningBalance += txn.type === 'credit' ? txn.amount : -txn.amount;
      return { ...txn, runningBalance };
    });
  }, [filteredTransactions]);

  return (
    <div>
      {/* Tabs */}
      <div className="flex gap-2 mb-4">
        {['all', 'credit', 'debit'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab as 'all' | 'credit' | 'debit')}
            className={`min-w-[120px] px-4 py-2 rounded-md text-sm font-medium border ${
              activeTab === tab
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-white text-gray-700 border-gray-100 hover:bg-blue-50'
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Search */}
      <input
        type="text"
        placeholder="Search By LeadID..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="w-full mb-4 p-2 border rounded"
      />

      {/* Table */}
      {enrichedTransactions.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center text-gray-500">
          <FaMoneyBillWave className="text-5xl mb-4 text-blue-400" />
          <h2 className="text-xl font-semibold mb-2">No Transactions Found</h2>
          <p className="text-sm max-w-md">
            This wallet doesn't have any transactions yet. Once transactions are made, they will appear here.
          </p>
        </div>
      ) : (
        <BasicTableOne columns={columns} data={filteredTransactions} />
      )}
    </div>
  );
};

export default WalletTransaction;
