'use client';

import React, { useEffect, useState } from 'react';
import ComponentCard from '@/components/common/ComponentCard';
import { useCheckout } from '@/context/CheckoutContext';
import { useParams } from 'next/navigation';
import { useUserWallet } from '@/context/WalletContext';
import { motion } from 'framer-motion';
import { BadgeCheck, CheckCircle2 } from 'lucide-react'; 
import { useAuthContext } from '@/context/AuthContext';
import { useUserContext } from '@/context/UserContext';

const FiveXGuarantee = () => {
  const { checkouts, fetchCheckoutByUser } = useCheckout();
  const { wallet, fetchWalletByUser } = useUserWallet();
  const { fetchSingleUser, singleUser, singleUserLoading, singleUserError } = useUserContext();
  const params = useParams();
  const id = params?.id as string;

  const [userCheckouts, setUserCheckouts] = useState<any[]>([]);
  const [targetLeads, setTargetLeads] = useState<number>(0); 
  const [fixEarning, setFixEarning] = useState<number>(0); 


//   useEffect(() => {
//     if (id) {
//       fetchSingleUser(id);
//     }
//   }, [id]);
// console.log("userlist",singleUser);


  console.log("fiveX -> singleUser", singleUser);

  console.log("user fetch", singleUser);
  // ✅ Fetch user checkouts
  useEffect(() => {
    if (!id) return;
    fetchCheckoutByUser(id);
  }, [id]);

  // ✅ Sync context checkouts into local state
  useEffect(() => {
    setUserCheckouts(checkouts);
  }, [checkouts]);

  // ✅ Fetch FiveXGuarantee data (target leads + earnings)
  useEffect(() => {
    const fetchFiveX = async () => {
      try {
        const res = await fetch('/api/fivex');
        const data = await res.json();
        console.log("fivex data:", data);

        if (Array.isArray(data) && data.length > 0) {
          setTargetLeads(data[0].leadcount || 0);
          setFixEarning(data[0].fixearning || 0);
        }
      } catch (err) {
        console.error('Error fetching FiveX data:', err);
      }
    };
    fetchFiveX();
  }, []);



  useEffect(() => {
    if (id) {
      fetchWalletByUser(id).then(() => {
      });
    }
  }, [id]);

  // 👇 always logs when wallet updates
  useEffect(() => {
    if (wallet) {
    }
  }, [wallet]);




  // ✅ Dynamic values
  const totalLeads = userCheckouts.length; // user's total leads
  const totalEarnings = wallet?.totalCredits || 0; // ✅ use wallet earnings instead of checkout sum

  const targetEarning = fixEarning; // fallback if API not ready
  const levelStep = targetLeads / 5 || 1; // avoid division by zero

  const leadPercent = Math.min((totalLeads / targetLeads) * 100, 100);
  const currentLevel = Math.min(Math.floor(totalLeads / levelStep) + 1, 5);
  const earningPercent = Math.min((totalEarnings / targetEarning) * 100, 100);

  // ✅ If eligible, show congratulations screen
  if (totalLeads >= targetLeads && targetLeads > 0) {
    return (
      <ComponentCard title="5x Guarantee">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-600 text-white p-10 shadow-lg">
          {/* Glow effect background */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent opacity-40"></div>

          {/* Icon + Heading */}
          <div className="flex flex-col items-center text-center relative z-10">
            <BadgeCheck className="w-16 h-16 text-white drop-shadow-md mb-4" />

            <h2 className="text-3xl font-extrabold tracking-tight mb-2">
              🎉 You’re Eligible!
            </h2>

            <p className="text-lg font-medium max-w-md">
              Unlock the <span className="font-bold text-yellow-300">5X Guarantee</span> 🚀
              and maximize your <span className="underline">earnings potential</span>.
            </p>

            {/* Call to Action */}
            <button className="mt-6 px-6 py-3 rounded-full bg-white text-indigo-600 font-semibold shadow hover:scale-105 transition">
              View Benefits
            </button>
          </div>
        </div>
      </ComponentCard>
    );
  }

  // ✅ Default UI (progress + summary)
  return (
    <ComponentCard title="5x Guarantee">
      {/* Semicircle Progress Graphs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
        {/* Level Progress Card - Green */}
        <div className="bg-white rounded-2xl shadow-md p-6 flex flex-col items-center text-center border-t-4 border-green-600">
          <div className="mb-4 text-green-600 text-xl font-semibold">
            Level Progress
          </div>
          <div className="relative w-[300px] h-[160px]">
            <svg width="300" height="160" viewBox="0 0 300 160">
              <path
                d="M40,140 A110,110 0 0,1 260,140"
                fill="none"
                stroke="#e5e7eb"
                strokeWidth="18"
              />
              <path
                d="M40,140 A110,110 0 0,1 260,140"
                fill="none"
                stroke="#10b981"
                strokeWidth="18"
                strokeLinecap="round"
                strokeDasharray="345"
                strokeDashoffset={345 - (leadPercent * 345) / 100}
              />
              <text
                x="150"
                y="100"
                textAnchor="middle"
                fontSize="24"
                fontWeight="bold"
                fill="#10b981"
              >
                {leadPercent === 100 ? '5X' : `${currentLevel}X`}
              </text>
            </svg>
          </div>
          <div className="text-base mt-2 text-gray-600">
            Progress: {leadPercent.toFixed(1)}%
          </div>
        </div>

        {/* Earnings Progress Card - Blue */}
        <div className="bg-white rounded-2xl shadow-md p-6 flex flex-col items-center text-center border-t-4 border-blue-600">
          <div className="mb-4 text-blue-600 text-xl font-semibold">
            Earning Progress
          </div>
          <div className="relative w-[300px] h-[160px]">
            <svg width="300" height="160" viewBox="0 0 300 160">
              <path
                d="M40,140 A110,110 0 0,1 260,140"
                fill="none"
                stroke="#e5e7eb"
                strokeWidth="18"
              />
              <path
                d="M40,140 A110,110 0 0,1 260,140"
                fill="none"
                stroke="#3b82f6"
                strokeWidth="18"
                strokeLinecap="round"
                strokeDasharray="345"
                strokeDashoffset={345 - (earningPercent * 345) / 100}
              />
              <text
                x="150"
                y="100"
                textAnchor="middle"
                fontSize="22"
                fontWeight="bold"
                fill="#3b82f6"
              >
                ₹{totalEarnings}
              </text>
            </svg>
          </div>
          <div className="text-base mt-2 text-gray-600">
            Progress: {earningPercent.toFixed(1)}%
          </div>
        </div>
      </div>

      {/* Summary Info */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
        <div className="bg-blue-50 border border-blue-200 rounded-xl py-4 shadow-sm">
          <p className="text-sm text-gray-500">Current Level</p>
          <p className="text-lg font-semibold text-blue-600">{currentLevel}X</p>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-xl py-4 shadow-sm">
          <p className="text-sm text-gray-500">Total Earnings</p>
          <p className="text-lg font-semibold text-green-600">
            ₹{totalEarnings}
            <span className="text-gray-500">/{targetEarning}</span>
          </p>
        </div>
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl py-4 shadow-sm">
          <p className="text-sm text-gray-500">Total Leads</p>
          <p className="text-lg font-semibold text-yellow-600">
            {totalLeads}
            <span className="text-gray-500">/{targetLeads}</span>
          </p>
        </div>
      </div>
    </ComponentCard>
  );
};

export default FiveXGuarantee;
