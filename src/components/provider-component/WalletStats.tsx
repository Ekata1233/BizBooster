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
      gradient: 'from-red-100 to-red-200',
      textColor: 'text-red-800',
    },
    {
      title: "Cash in Hand",
      value: wallet.cashInHand.toFixed(2),
      icon: <FaClipboardList size={48} />,
      gradient: 'from-blue-100 to-blue-200',
      textColor: 'text-blue-800',
    },
    {
      title: "Withdrawable Balance",
      value: wallet.withdrawableBalance.toFixed(2),
      icon: <FaMoneyBill size={48} />,
      gradient: 'from-green-100 to-green-200',
      textColor: 'text-green-800',
    },
    {
      title: "Pending Withdraw",
      value: wallet.pendingWithdraw.toFixed(2),
      icon: <FaTools size={48} />,
      gradient: 'from-yellow-100 to-yellow-200',
      textColor: 'text-yellow-800',
    },
    {
      title: "Already Withdrawn",
      value: wallet.alreadyWithdrawn.toFixed(2),
      icon: <FaStore size={48} />,
      gradient: 'from-purple-100 to-purple-200',
      textColor: 'text-purple-800',
    },
    {
      title: "Total Earning",
      value: wallet.totalEarning.toFixed(2),
      icon: <FaChartLine size={48} />,
      gradient: 'from-teal-100 to-teal-200',
      textColor: 'text-teal-800',
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
