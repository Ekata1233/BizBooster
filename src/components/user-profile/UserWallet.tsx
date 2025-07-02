'use client';

import React, { useState } from 'react';
import ComponentCard from '@/components/common/ComponentCard';
import BasicTableOne from '@/components/tables/BasicTableOne';
import { Search } from 'lucide-react';
import { FaMoneyBillWave, FaMoneyCheckAlt, FaWallet } from 'react-icons/fa';

interface WalletTransaction {
  id: string;
  transactionId: string;
  type: 'Credit' | 'Debit';
  date: string;
  leadId: string;
  debit: string;
  credit: string;
  withdraw: string;
  balance: string;
}

const columnsWallet = [
  {
  header: 'Sr',
  render: (_: WalletTransaction, index: number) => <div>{index + 1}</div>,
},
  {
    header: 'Transaction ID',
    accessor: 'transactionId',
  },
  {
    header: 'Transaction Type',
    accessor: 'type',
    render: (row: WalletTransaction) => (
      <span
        className={`px-2 py-1 rounded-full text-xs border ${
          row.type === 'Credit'
            ? 'bg-green-50 text-green-600 border-green-100'
            : 'bg-red-50 text-red-600 border-red-100'
        }`}
      >
        {row.type}
      </span>
    ),
  },
  {
    header: 'Transaction Date',
    accessor: 'date',
  },
  {
    header: 'Lead ID',
    accessor: 'leadId',
  },
  {
    header: 'Debit',
    accessor: 'debit',
    render: (row: WalletTransaction) => <span>{row.debit || '-'}</span>,
  },
  {
    header: 'Credit',
    accessor: 'credit',
    render: (row: WalletTransaction) => <span>{row.credit || '-'}</span>,
  },
  {
    header: 'Withdraw',
    accessor: 'withdraw',
    render: (row: WalletTransaction) => <span>{row.withdraw || '-'}</span>,
  },
  {
    header: 'Balance',
    accessor: 'balance',
  },
];

const dummyData: WalletTransaction[] = [
  {
    id: '1',
    transactionId: 'TXN123456',
    type: 'Credit',
    date: '2025-07-01',
    leadId: 'LEAD001',
    debit: '',
    credit: '₹500',
    withdraw: '',
    balance: '₹5000',
  },
  {
    id: '2',
    transactionId: 'TXN123457',
    type: 'Debit',
    date: '2025-07-02',
    leadId: 'LEAD002',
    debit: '₹500',
    credit: '',
    withdraw: '',
    balance: '₹4500',
  },
];

const UserWallet = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'credit' | 'debit'>('all');

  const filteredTransactions = dummyData.filter((txn) => {
    const matchSearch =
      txn.transactionId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      txn.leadId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchTab =
      activeTab === 'all' || txn.type.toLowerCase() === activeTab;
    return matchSearch && matchTab;
  });

  const summaryCards = [
    {
      title: 'Credit',
      amount: '₹200000.00',
      icon: <FaMoneyBillWave />,
      gradient: 'from-green-50 to-green-100',
      textColor: 'text-green-800',
    },
    {
      title: 'Debit',
      amount: '₹500000.00',
      icon: <FaMoneyCheckAlt />,
      gradient: 'from-red-50 to-red-100',
      textColor: 'text-red-800',
    },
    {
      title: 'Balance',
      amount: '₹1500000.00',
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

      {/* Transaction Table */}
      <BasicTableOne columns={columnsWallet} data={filteredTransactions} />
    </ComponentCard>
  );
};

export default UserWallet;
