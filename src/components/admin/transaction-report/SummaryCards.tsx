"use client";

import React, { useMemo } from "react";
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
}

interface Props {
  summary: AdminEarningsType;
  transactionDetails?: Transaction[]; // ✅ optional now
}

const SummaryCards: React.FC<Props> = ({ summary, transactionDetails = [] }) => {
  const formatAmount = (amount?: number) => {
    const num = Number(amount) || 0; // converts undefined/null/"string" → 0
    return `₹${num.toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };


  console.log("summary : ", summary);
  console.log("transactions : ", transactionDetails);

  // ✅ Calculate Provider & Franchise pending payouts in frontend
  const { providerPending, franchisePending } = useMemo(() => {
    let providerTotal = 0;
    let franchiseTotal = 0;

    transactionDetails.forEach((t) => {
      const balance = Number(t.balance);
      if (isNaN(balance)) return; // ignore "-" or invalid balances

      if (t.walletType === "Provider") {
        providerTotal += balance;
      } else if (t.walletType === "User") {
        franchiseTotal += balance;
      }
    });

    return { providerPending: providerTotal, franchisePending: franchiseTotal };
  }, [transactionDetails]);

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
      title: "GST",
      value: formatAmount(summary.GST),
      icon: <FaMoneyBill size={48} />,
      gradient: "from-green-100 to-green-200",
      textColor: "text-green-800",
    },
    {
      title: "Provider Earnings",
      value: formatAmount(summary.providerEarnings),
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
