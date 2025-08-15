"use client";
import React from "react";
import {
  FaUsers,
  FaChartLine,
  FaMoneyBill,
  FaClipboardList,
  FaStore,
  FaTools,
} from 'react-icons/fa';
import ColorStatCard from "../common/ColorStatCard";

interface WalletStatsProps {
  wallet: {
    receivableBalance: number;
    cashInHand: number;
    withdrawableBalance: number;
    pendingWithdraw: number;
    alreadyWithdrawn: number;
    totalEarning: number;
  };
}

const WalletStats: React.FC<WalletStatsProps> = ({ wallet }) => {
  const stats = [
    {
      title: "Receivable Balance",
      value: wallet.receivableBalance.toFixed(2),
      icon: <FaUsers size={48} />,
      gradient: 'from-pink-50 to-pink-100',
      textColor: 'text-pink-600',
    },
    {
      title: "Cash in Hand",
      value: wallet.cashInHand.toFixed(2),
      icon: <FaClipboardList size={48} />,
      gradient: 'from-blue-50 to-blue-100',
      textColor: 'text-blue-600',
    },
    {
      title: "Withdrawable Balance",
      value: wallet.withdrawableBalance.toFixed(2),
      icon: <FaMoneyBill size={48} />,
      gradient: 'from-green-50 to-green-100',
      textColor: 'text-green-600',
    },
    {
      title: "Pending Withdraw",
      value: wallet.pendingWithdraw.toFixed(2),
      icon: <FaTools size={48} />,
      gradient: 'from-yellow-50 to-yellow-100',
      textColor: 'text-yellow-600',
    },
    {
      title: "Already Withdrawn",
      value: wallet.alreadyWithdrawn.toFixed(2),
      icon: <FaStore size={48} />,
      gradient: 'from-purple-50 to-purple-100',
      textColor: 'text-purple-600',
    },
    {
      title: "Total Earning",
      value: wallet.totalEarning.toFixed(2),
      icon: <FaChartLine size={48} />,
      gradient: 'from-teal-50 to-teal-100',
      textColor: 'text-teal-600',
    },
  ];

  return (
    <>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-3 my-5">
        {stats.slice(0, 3).map((stat, index) => (
          <ColorStatCard
            key={index}
            title={stat.title}
            value={stat.value}
            icon={stat.icon}
            gradient={stat.gradient}
            textColor={stat.textColor}
          />
        ))}
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-3 my-5">
        {stats.slice(3).map((stat, index) => (
          <ColorStatCard
            key={index + 3}
            title={stat.title}
            value={stat.value}
            icon={stat.icon}
            gradient={stat.gradient}
            textColor={stat.textColor}
          />
        ))}
      </div>
    </>
  );
};

export default WalletStats;
