'use client';

import React from 'react';
import { FaUsers, FaClipboardList, FaMoneyBill, FaTools, FaStore, FaChartLine } from 'react-icons/fa';
import ColorStatCard from '@/components/common/ColorStatCard';
import { AdminEarningsType } from '@/context/AdminEarningsContext';

interface Props {
  summary: AdminEarningsType;
}

const SummaryCards: React.FC<Props> = ({ summary }) => {
  const formatAmount = (amount: number) =>
    `₹${amount.toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;

    console.log("summary : ", summary)

  const cards = [
    {
      title: 'Total Revenue',
      value: formatAmount(summary.totalRevenue),
      icon: <FaUsers size={48} />,
      gradient: 'from-red-100 to-red-200',
      textColor: 'text-red-800',
    },
    {
      title: 'Admin Commission',
      value: formatAmount(summary.adminCommission),
      icon: <FaClipboardList size={48} />,
      gradient: 'from-blue-100 to-blue-200',
      textColor: 'text-blue-800',
    },
    {
      title: 'Extra Fee',
      value: formatAmount(summary.extraFees),
      icon: <FaMoneyBill size={48} />,
      gradient: 'from-green-100 to-green-200',
      textColor: 'text-green-800',
    },
    {
      title: 'Provider Earnings',
      value: formatAmount(summary.providerEarnings),
      icon: <FaTools size={48} />,
      gradient: 'from-yellow-100 to-yellow-200',
      textColor: 'text-yellow-800',
    },
    {
      title: 'Franchise Earnings',
      value: formatAmount(summary.franchiseEarnings),
      icon: <FaStore size={48} />,
      gradient: 'from-purple-100 to-purple-200',
      textColor: 'text-purple-800',
    },
    {
      title: 'Pending Payout',
      value: formatAmount(summary.pendingPayouts),
      icon: <FaChartLine size={48} />,
      gradient: 'from-teal-100 to-teal-200',
      textColor: 'text-teal-800',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 p-6">
      {cards.map((card, index) => (
        <ColorStatCard
          key={index}
          title={card.title}
          value={card.value}
          icon={card.icon}
          gradient={card.gradient}
          textColor={card.textColor}
        />
      ))}
    </div>
  );
};

export default SummaryCards;
