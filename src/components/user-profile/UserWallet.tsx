'use client';

import React, { useEffect, useState } from 'react';
import ComponentCard from '@/components/common/ComponentCard';
import BasicTableOne from '@/components/tables/BasicTableOne';
import { Search } from 'lucide-react';
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
    render: (row: IWalletTransaction) => (
      <span
        className={`px-2 py-1 rounded-full text-xs border ${row.type === 'credit'
            ? 'bg-green-50 text-green-600 border-green-100'
            : 'bg-red-50 text-red-600 border-red-100'
          }`}
      >
        {row.type.charAt(0).toUpperCase() + row.type.slice(1)}
      </span>
    ),
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
    render: (row: IWalletTransaction) => <span>{row.referenceId || '-'}</span>,
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
    render: (_row: IWalletTransaction, index: number, allRows: IWalletTransaction[]) => {
      let runningBalance = 0;
      for (let i = 0; i <= index; i++) {
        const txn = allRows[i];
        runningBalance += txn.type === 'credit' ? txn.amount : -txn.amount;
      }
      return <span>₹{runningBalance}</span>;
    },
  },
];

const UserWallet = ({ userId }: UserWalletProps) => {
  const { wallet, loading, error, fetchWalletByUser } = useUserWallet();

  useEffect(() => {
    if (userId) {
      fetchWalletByUser(userId);
    }
  }, [userId]);

  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'credit' | 'debit'>('all');

  if (loading) return <p>Loading wallet...</p>;
  if (error) return <p className="text-red-500">Error: {error}</p>;
  if (!wallet) return <p>No wallet found</p>;

  const transactions = wallet.transactions || [];

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

  const totalCredits = transactions
    .filter((t) => t.type === 'credit')
    .reduce((sum, t) => sum + t.amount, 0);
  const totalDebits = transactions
    .filter((t) => t.type === 'debit')
    .reduce((sum, t) => sum + t.amount, 0);

  const summaryCards = [
    {
      title: 'Credit',
      amount: `₹${totalCredits.toLocaleString()}`,
      icon: <FaMoneyBillWave />,
      gradient: 'from-green-50 to-green-100',
      textColor: 'text-green-800',
    },
    {
      title: 'Debit',
      amount: `₹${totalDebits.toLocaleString()}`,
      icon: <FaMoneyCheckAlt />,
      gradient: 'from-red-50 to-red-100',
      textColor: 'text-red-800',
    },
    {
      title: 'Balance',
      amount: `₹${wallet.balance.toLocaleString()}`,
      icon: <FaWallet />,
      gradient: 'from-blue-50 to-blue-100',
      textColor: 'text-blue-800',
    },
  ];

  return (
    <ComponentCard title="Wallet">
      {/* Search */}
      <div className="flex justify-end mb-4">
        <div className="relative w-full max-w-sm">
          <input
            type="text"
            placeholder="Search transactions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 pr-10 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <Search className="absolute right-3 top-2.5 text-gray-400" size={18} />
        </div>
      </div>

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

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-4">
        {['all', 'credit', 'debit'].map((tab) => (
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
      <BasicTableOne
        columns={columnsWallet}
        data={filteredTransactions as IWalletTransaction[]}
      />
    </ComponentCard>
  );
};


export default UserWallet;
