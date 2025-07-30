'use client';

import React, { useEffect, useState } from 'react';
import ComponentCard from '@/components/common/ComponentCard';
import BasicTableOne from '@/components/tables/BasicTableOne';
import { FaMoneyBillWave, FaMoneyCheckAlt, FaWallet } from 'react-icons/fa';
import { IWalletTransaction, useUserWallet } from '@/context/WalletContext';

interface UserWalletProps {
  userId: string;
}

const columnsWallet = [
  {
    header: 'Transaction ID',
    accessor: 'transactionId',
    render: (row: IWalletTransaction) => <span>{row.referenceId || '-'}</span>,
  },
  {
    header: 'Transaction Type',
    accessor: 'type',
    render: (row: IWalletTransaction) => <span>{row.description}</span>,
  },
  {
    header: 'Transaction Date',
    accessor: 'date',
    render: (row: IWalletTransaction) => (
      <span>{new Date(row.createdAt).toLocaleString()}</span>
    ),
  },
  {
    header: 'Lead ID',
    accessor: 'leadId',
    render: (row: IWalletTransaction) => {
      console.log('Row:', row); // ✅ Console log here

      return (
        <div className="flex flex-col">
          <span className="text-xs text-muted-foreground">Lead Id : {row.leadId || '-'}</span>
          <span className="text-xs text-muted-foreground">From : {row.commissionFrom || 'N/A'}</span>
        </div>
      );
    },
  },
  {
    header: 'Debit',
    accessor: 'debit',
    render: (row: IWalletTransaction) =>
      row.type === 'debit' ? `₹${row.amount}` : '-',
  },
  {
    header: 'Credit',
    accessor: 'credit',
    render: (row: IWalletTransaction) =>
      row.type === 'credit' ? `₹${row.amount}` : '-',
  },
  {
    header: 'Withdraw',
    accessor: 'withdraw',
    render: (row: IWalletTransaction) =>
      row.source === 'withdraw' ? `₹${row.amount}` : '-',
  },
  {
    header: 'Balance',
    accessor: 'balance',
    render: (row: IWalletTransaction & { runningBalance?: number }) => (
      <span>₹{row.runningBalance ?? '-'}</span>
    ),
  },
];

const UserWallet = ({ userId }: UserWalletProps) => {
  const { wallet, loading, error, fetchWalletByUser } = useUserWallet();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'credit' | 'debit' | 'withdraw'>('all');

  useEffect(() => {
    if (userId) {
      fetchWalletByUser(userId);
    }
  }, [userId]);

  if (loading) return <p>Loading wallet...</p>;

  const isNotFound = error?.toLowerCase().includes('wallet not found');
  const isWalletAvailable = wallet && wallet._id && !isNotFound;

  const summaryWallet = isWalletAvailable
    ? wallet
    : {
      balance: 0,
      totalCredits: 0,
      totalDebits: 0,
      transactions: [],
    };

  const transactions = summaryWallet.transactions || [];

  const filteredTransactions = transactions
    .filter((txn) => {
      const matchSearch =
        txn.referenceId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        txn.description?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchTab = activeTab === 'all' || txn.type === activeTab;
      return matchSearch && matchTab;
    })
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

  const sortedByDateAsc = [...filteredTransactions].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  );

  let runningBalance = 0;
  const enrichedAscending = sortedByDateAsc.map((txn) => {
    runningBalance += txn.type === 'credit' ? txn.amount : -txn.amount;
    return { ...txn, runningBalance };
  });

  // Now reverse it back to show newest first
  const enrichedTransactions = enrichedAscending;


  const summaryCards = [
    {
      title: 'Balance',
      amount: `₹${summaryWallet.balance.toLocaleString()}`,
      icon: <FaWallet />,
      gradient: 'from-blue-50 to-blue-100',
      textColor: 'text-blue-800',
    },
    {
      title: 'Credit',
      amount: `₹${summaryWallet.totalCredits.toLocaleString()}`,
      icon: <FaMoneyBillWave />,
      gradient: 'from-green-50 to-green-100',
      textColor: 'text-green-800',
    },
    {
      title: 'Debit',
      amount: `₹${summaryWallet.totalDebits.toLocaleString()}`,
      icon: <FaMoneyCheckAlt />,
      gradient: 'from-red-50 to-red-100',
      textColor: 'text-red-800',
    },
  ];

  return (
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

      {/* If wallet not found */}
      {!isWalletAvailable ? (
        <div className="flex flex-col items-center justify-center py-20 text-center text-gray-500">
          <FaWallet className="text-5xl mb-4 text-blue-400" />
          <h2 className="text-xl font-semibold mb-2">No Wallet Found</h2>
          <p className="text-sm max-w-md">
            This wallet doesn't have any transactions yet. Once transactions are made, they will appear here.
          </p>
        </div>
      ) : (
        <>
          {/* Filter Tabs */}
          <div className="flex gap-2 mb-4">
            {['all', 'credit', 'debit', 'withdraw'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab as 'all' | 'credit' | 'debit')}
                className={`min-w-[120px] px-4 py-2 rounded-md text-sm font-medium border ${activeTab === tab
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-gray-700 border-gray-100 hover:bg-blue-50'
                  }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>

          {/* Transaction Table */}
          {filteredTransactions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center text-gray-500">
              <FaMoneyBillWave className="text-5xl mb-4 text-blue-400" />
              <h2 className="text-xl font-semibold mb-2">No Transactions Found</h2>
              <p className="text-sm max-w-md">
                This wallet doesn't have any transactions yet. Once transactions are made, they will appear here.
              </p>
            </div>
          ) : (
            <BasicTableOne
              columns={columnsWallet}
              data={enrichedTransactions as IWalletTransaction[]}
            />
          )}
        </>
      )}
    </ComponentCard>
  );
};

export default UserWallet;
