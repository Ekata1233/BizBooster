"use client";

import React from "react";
import { FaWallet, FaMoneyBillWave, FaCashRegister } from "react-icons/fa";

interface PayoutSummaryCardsProps {
  userTotal: number;
  providerTotal: number;
  totalPayout: number;
}

const PayoutSummaryCards: React.FC<PayoutSummaryCardsProps> = ({
  userTotal,
  providerTotal,
  totalPayout,
}) => {
  const summaryCards = [
    {
      title: "User Payout",
      amount: `₹${userTotal.toFixed(2)}`,
      icon: <FaWallet />,
      gradient: "from-green-100 to-green-200",
      textColor: "text-green-800",
    },
    {
      title: "Provider Payout",
      amount: `₹${providerTotal.toFixed(2)}`,
      icon: <FaMoneyBillWave />,
      gradient: "from-blue-100 to-blue-200",
      textColor: "text-blue-800",
    },
    {
      title: "Total Payout",
      amount: `₹${totalPayout.toFixed(2)}`,
      icon: <FaCashRegister />,
      gradient: "from-red-100 to-red-200",
      textColor: "text-red-800",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
      {summaryCards.map((card) => (
        <div
          key={card.title}
          className={`bg-gradient-to-r ${card.gradient} ${card.textColor} p-6 rounded-xl shadow flex justify-between items-center`}
        >
          <div className="text-3xl bg-white/40 p-3 rounded-full">{card.icon}</div>
          <div className="text-right">
            <div className="text-sm font-medium">{card.title}</div>
            <div className="text-lg font-bold">{card.amount}</div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default PayoutSummaryCards;
