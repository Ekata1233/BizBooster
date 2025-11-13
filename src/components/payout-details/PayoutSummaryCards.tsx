"use client";

import { useProvider } from "@/context/ProviderContext";
import { useUserWallet } from "@/context/WalletContext";
import React, { useEffect, useMemo } from "react";
import { FaWallet, FaMoneyBillWave, FaCashRegister } from "react-icons/fa";

const PayoutSummaryCards: React.FC = () => {
  const {
    allWallets: allUserWallets,
    fetchAllWallets,
    loading: userLoading,
    error: userError,
  } = useUserWallet();

  const {
    allWallet: allProviderWallets,
    fetchAllWallet,
    loading: providerLoading,
    error: providerError,
  } = useProvider();

  // Fetch all wallet data
  useEffect(() => {
    fetchAllWallets();
    fetchAllWallet();
  }, []);

  // Calculate totals safely using useMemo
  const { userTotal, providerTotal, totalPayout } = useMemo(() => {
    const ignoredUserId = "null";

    // ✅ Convert _id to string before comparing
    const validUserWallets = allUserWallets?.filter(
      (wallet) => wallet?.userId?._id != null
    );

    console.log("✅ Valid user wallets:", validUserWallets);

    const userTotal = validUserWallets?.reduce(
      (sum, wallet) => sum + (wallet?.pendingWithdraw || 0),
      0
    );

    console.log("userTotal : ", userTotal)


    const providerTotal = allProviderWallets?.reduce(
      (sum, wallet) => sum + (wallet?.pendingWithdraw || 0),
      0
    );

    const totalPayout = userTotal + providerTotal;

    return { userTotal, providerTotal, totalPayout };
  }, [allUserWallets, allProviderWallets]);

  if (userLoading || providerLoading) return <p>Loading wallets...</p>;
  if (userError || providerError)
    return <p>Error: {userError || providerError}</p>;

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
