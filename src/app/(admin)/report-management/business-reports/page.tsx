'use client';

import React, { useEffect, useMemo } from 'react';
import { useAdminEarnings } from '@/context/AdminEarningsContext';
import ColorStatCard from '@/components/common/ColorStatCard';
import {
  FaUsers,
  FaChartLine,
  FaMoneyBill,
  FaClipboardList,
  FaStore,
  FaTools,
} from 'react-icons/fa';
import { useProvider } from '@/context/ProviderContext';

const Page = () => {
  const { summary, loading, fetchSummary } = useAdminEarnings();

  useEffect(() => {
    fetchSummary();
  }, []);
  const {
    allWallet: allProviderWallets,
    fetchAllWallet,
    loading: providerLoading,
    error: providerError,
  } = useProvider();

  // console.log("summary : ", summary);

  // ✅ Always call hooks before any conditional return
  const { providerTotal } = useMemo(() => {
    const providerTotal = allProviderWallets?.reduce(
      (sum, wallet) => sum + (wallet?.pendingWithdraw || 0),
      0
    );
    return { providerTotal };
  }, [allProviderWallets]);

  useEffect(() => {
    fetchAllWallet();
  }, []);
  // console.log("allProviderWallets : ", providerTotal)

  useEffect(() => {
    if (allProviderWallets?.length)
      console.log("🏪 All Provider Wallets:", allProviderWallets);
  }, [allProviderWallets]);

  // ✅ Now safe to conditionally return
  if (providerLoading) return <p>Loading wallets...</p>;
  if (providerError) return <p>Error: {providerError}</p>;

  if (loading) return <p className="p-6 text-lg">Loading earnings summary...</p>;
  if (!summary) return <p className="p-6 text-red-600">No summary data available.</p>;

  const formatAmount = (amount: number | undefined | null) => {
    if (typeof amount !== 'number' || isNaN(amount)) return '₹0.00';
    return `₹${amount.toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };


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
      title: 'GST',
      value: formatAmount(summary.GST),
      icon: <FaMoneyBill size={48} />,
      gradient: 'from-green-100 to-green-200',
      textColor: 'text-green-800',
    },
    {
      title: "Provider Earnings",
      value: formatAmount(providerTotal),
      icon: <FaTools size={48} />,
      gradient: "from-yellow-100 to-yellow-200",
      textColor: "text-yellow-800",
    },
    {
      title: "Franchise Earnings",
      value: formatAmount(summary.franchiseEarnings),
      icon: <FaStore size={48} />,
      gradient: "from-purple-100 to-purple-200",
      textColor: "text-purple-800",
    },
    {
      title: 'Franchise Pending Payout',
      value: formatAmount(summary.franchiseBalance),
      icon: <FaStore size={48} />,
      gradient: 'from-purple-100 to-purple-200',
      textColor: 'text-purple-800',
    },
    {
      title: 'Provider Pending Payout',
      value: formatAmount(summary.providerBalance),
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

export default Page;
