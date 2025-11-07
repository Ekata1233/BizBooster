"use client";

import React, { useEffect, useMemo } from "react";
import {
  FaUsers,
  FaClipboardList,
  FaMoneyBill,
  FaTools,
  FaStore,
  FaChartLine,
} from "react-icons/fa";
import ColorStatCard from "@/components/common/ColorStatCard";
import { AdminEarningsType } from "@/context/AdminEarningsContext";
import { useProvider } from "@/context/ProviderContext";

interface Transaction {
  transactionId: string;
  walletType: "Provider" | "User";
  to: string;
  date: string;
  type: string;
  balance: number | string;
  credit?: number;
  debit?: number;
  method?: string;
  source?: string;
  status?: string;
  pendingWithdraw?: number;
}

interface Props {
  summary: AdminEarningsType;
  transactionDetails?: Transaction[];
}

const SummaryCards: React.FC<Props> = ({ summary, transactionDetails = [] }) => {
  const formatAmount = (amount?: number) => {
    const num = Number(amount) || 0;
    return `₹${num.toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

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
  // console.log("allProviderWallets : ", providerTotal);

  const { providerPending, franchisePending, providerWalletTotal } = useMemo(() => {
    let providerTotal = 0;
    let franchiseTotal = 0;
    let providerWalletTotal = 0;

    transactionDetails.forEach((t) => {
      if (t.walletType === "Provider") {
        providerTotal += Number(t.pendingWithdraw) || 0;
      } else if (t.walletType === "User") {
        franchiseTotal += Number(t.pendingWithdraw) || 0;
      }
    });

    return { providerPending: providerTotal, franchisePending: franchiseTotal, providerWalletTotal };
  }, [transactionDetails]);

  useEffect(() => {
    if (allProviderWallets?.length)
      console.log("🏪 All Provider Wallets:", allProviderWallets);
  }, [allProviderWallets]);

  // ✅ Now safe to conditionally return
  if (providerLoading) return <p>Loading wallets...</p>;
  if (providerError) return <p>Error: {providerError}</p>;

  const cards = [
    {
      title: "Total Revenue",
      value: formatAmount(summary.totalRevenue),
      icon: <FaUsers size={48} />,
      gradient: "from-red-100 to-red-200",
      textColor: "text-red-800",
    },
    {
      title: "Admin Commission",
      value: formatAmount(summary.adminCommission),
      icon: <FaClipboardList size={48} />,
      gradient: "from-blue-100 to-blue-200",
      textColor: "text-blue-800",
    },
    {
      title: "Extra Fee",
      value: formatAmount(summary.extraFees),
      icon: <FaMoneyBill size={48} />,
      gradient: "from-green-100 to-green-200",
      textColor: "text-green-800",
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
      title: "Franchise Pending Payout",
      value: formatAmount(summary.franchiseBalance),
      icon: <FaChartLine size={48} />,
      gradient: "from-pink-100 to-pink-200",
      textColor: "text-pink-800",
    },
    {
      title: "Provider Pending Payout",
      value: formatAmount(summary.providerBalance),
      icon: <FaChartLine size={48} />,
      gradient: "from-indigo-100 to-indigo-200",
      textColor: "text-indigo-800",
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
