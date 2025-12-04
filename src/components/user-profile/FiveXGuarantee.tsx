'use client';

import React, { useEffect, useState } from 'react';
import ComponentCard from '@/components/common/ComponentCard';
import { useCheckout } from '@/context/CheckoutContext';
import { useParams } from 'next/navigation';
import { useUserWallet } from '@/context/WalletContext';
import { BadgeCheck } from 'lucide-react';
import { useUserContext } from '@/context/UserContext';
import { startOfDay } from 'date-fns';

const FiveXGuarantee = () => {
  const { checkouts, fetchCheckoutByUser } = useCheckout();
  const { wallet, fetchWalletByUser } = useUserWallet();
  const { fetchSingleUser, singleUser } = useUserContext();
  const params = useParams();
  const id = params?.id as string;

  const [userCheckouts, setUserCheckouts] = useState<any[]>([]);
  const [targetLeads, setTargetLeads] = useState<number>(0);
  const [fixEarning, setFixEarning] = useState<number>(0);
  const [fivexMonths, setFivexMonths] = useState<number>(0);
  const [remainingMonths, setRemainingMonths] = useState<number>(0);
  const [remainingDays, setRemainingDays] = useState<number>(0);

  // ✅ Safe month add with clamp for shorter months
  const addMonthsClamped = (date: Date, months: number) => {
    const y = date.getFullYear();
    const m = date.getMonth() + months;
    const day = date.getDate();
    const candidate = new Date(y, m, 1);
    const daysInTarget = new Date(candidate.getFullYear(), candidate.getMonth() + 1, 0).getDate();
    return new Date(candidate.getFullYear(), candidate.getMonth(), Math.min(day, daysInTarget));
  };

  // fetch user
  useEffect(() => {
    if (!id) return;
    if (!singleUser || singleUser._id !== id) {
      fetchSingleUser(id);
    }
  }, [id, singleUser, fetchSingleUser]);

  // fetch checkout
  useEffect(() => {
    if (id) fetchCheckoutByUser(id);
  }, [id]);

  useEffect(() => {
    setUserCheckouts(checkouts);
  }, [checkouts]);

  // fetch FiveX data
  useEffect(() => {
    const fetchFiveX = async () => {
      try {
        const res = await fetch('/api/fivex');
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          setTargetLeads(data[0].leadcount || 0);
          setFixEarning(data[0].fixearning || 0);
          setFivexMonths(data[0].months || 0);
        }
      } catch (err) {
        console.error('Error fetching FiveX data:', err);
      }
    };
    fetchFiveX();
  }, []);

  // fetch wallet
  useEffect(() => {
    if (id) fetchWalletByUser(id);
  }, [id]);

  // ✅ calculate remaining months/days (fixed for proper month completion)
useEffect(() => {
  if (!singleUser?.packageActivateDate) {
    setRemainingMonths(0);
    setRemainingDays(0);
    return;
  }

  const startDate = startOfDay(new Date(singleUser.packageActivateDate)); // e.g. 20 Aug
  const today = startOfDay(new Date());

  // ✅ Total target months (example 36)
  const totalMonths = 36;

  // ✅ How many full months completed
  let completedMonths =
    (today.getFullYear() - startDate.getFullYear()) * 12 +
    (today.getMonth() - startDate.getMonth());

  // If today's date is before the activation "day", this month not yet completed
  if (today.getDate() < startDate.getDate()) {
    completedMonths -= 1;
  }

  // Clamp (can't go negative)
  completedMonths = Math.max(0, completedMonths);

  // ✅ Remaining months
  const monthsLeft = Math.max(0, totalMonths - completedMonths);

  // ✅ Days left in current running month cycle
  const nextCycle = addMonthsClamped(startDate, completedMonths + 1);
  const msPerDay = 1000 * 60 * 60 * 24;
  const daysLeft = Math.max(
    0,
    Math.ceil((nextCycle.getTime() - today.getTime()) / msPerDay)
  );

  setRemainingMonths(monthsLeft);
  setRemainingDays(daysLeft);
}, [singleUser]);

  // stats
  const totalLeads = userCheckouts.length;
  const totalEarnings = wallet?.totalCredits || 0;

  const targetEarning = fixEarning;
  const levelStep = targetLeads / 5 || 1;

  const leadPercent = Math.min((totalLeads / targetLeads) * 100, 100);
  const currentLevel = Math.min(Math.floor(totalLeads / levelStep) + 1, 5);
  const earningPercent = Math.min((totalEarnings / targetEarning) * 100, 100);

  // ✅ Eligible only after package ends
  const isEligible =
    targetLeads > 0 &&
    totalLeads >= targetLeads &&
    singleUser?.packageActive &&
    fivexMonths > 0 &&
    remainingMonths === 0 &&
    remainingDays === 0;

  if (isEligible) {
    return (
      <ComponentCard title="5x Guarantee">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-600 text-white p-10 shadow-lg">
          <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent opacity-40"></div>

          <div className="flex flex-col items-center text-center relative z-10">
            <BadgeCheck className="w-16 h-16 text-white drop-shadow-md mb-4" />

            <h2 className="text-3xl font-extrabold tracking-tight mb-2">🎉 You're Eligible!</h2>

            <p className="text-lg font-medium max-w-md">
              Congratulations! You successfully met the <span className="font-bold text-yellow-300">5X Guarantee</span> 🚀
            </p>
          </div>
        </div>
      </ComponentCard>
    );
  }

  return (
    <ComponentCard title="5x Guarantee">
      {/* Package Activated Date */}
      {singleUser?.packageActivateDate && (
        <div className="flex justify-center mb-6">
          <div className="flex items-center gap-2 bg-blue-50 border border-blue-200 px-4 py-2 rounded-xl shadow-sm">
            <span className="text-blue-600 font-medium">📅 Package Activated:</span>
            <span className="text-gray-700 font-semibold">
              {new Date(singleUser.packageActivateDate).toLocaleDateString("en-GB", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              })}
            </span>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
        {/* Level Progress */}
        <div className="bg-white rounded-2xl shadow-md p-6 flex flex-col items-center text-center border-t-4 border-green-600">
          <div className="mb-4 text-green-600 text-xl font-semibold">Level Progress</div>
          <div className="relative w-[300px] h-[160px]">
            <svg width="300" height="160" viewBox="0 0 300 160">
              {/* Background arc - from left to right */}
              <path
                d="M50,140 A100,100 0 0,1 250,140"
                fill="none"
                stroke="#e5e7eb"
                strokeWidth="18"
                strokeLinecap="round"
              />

              {/* Progress arc - starts from left when 0% */}
              <path
                d="M50,140 A100,100 0 0,1 250,140"
                fill="none"
                stroke="#10b981"
                strokeWidth="18"
                strokeLinecap="round"
                strokeDasharray="314.159"
                strokeDashoffset={314.159 - (leadPercent / 100) * 314.159}
              />

              <text
                x="150"
                y="100"
                textAnchor="middle"
                fontSize="20"
                fontWeight="bold"
                fill="#10b981"
              >
                {leadPercent === 100 ? "5X" : `${currentLevel}X`}
              </text>
            </svg>
          </div>
          <div className="text-base mt-2 text-gray-600">Progress: {leadPercent.toFixed(1)}%</div>
        </div>

        {/* Earnings Progress */}
        <div className="bg-white rounded-2xl shadow-md p-6 flex flex-col items-center text-center border-t-4 border-blue-600">
          <div className="mb-4 text-blue-600 text-xl font-semibold">Earning Progress</div>
          <div className="relative w-[300px] h-[160px]">
            <svg width="300" height="160" viewBox="0 0 300 160">
              {/* Background arc - from left to right */}
              <path
                d="M50,140 A100,100 0 0,1 250,140"
                fill="none"
                stroke="#e5e7eb"
                strokeWidth="18"
                strokeLinecap="round"
              />

              {/* Progress arc - starts from left when 0% */}
              <path
                d="M50,140 A100,100 0 0,1 250,140"
                fill="none"
                stroke="#3b82f6"
                strokeWidth="18"
                strokeLinecap="round"
                strokeDasharray="314.159"
                strokeDashoffset={314.159 - (earningPercent / 100) * 314.159}
              />

              <text
                x="150"
                y="100"
                textAnchor="middle"
                fontSize="20"
                fontWeight="bold"
                fill="#3b82f6"
              >
                ₹{Number(totalEarnings.toFixed(2))}
              </text>
            </svg>
          </div>
          <div className="text-base mt-2 text-gray-600">Progress: {earningPercent.toFixed(1)}%</div>
        </div>
      </div>
      
      {singleUser?.packageActive && (remainingMonths > 0 || remainingDays > 0) && (
        <div className="text-center mb-4">
          {remainingMonths > 0 ? (
            <p className="text-lg font-bold text-yellow-600 bg-yellow-100 px-4 py-2 rounded-full inline-block shadow">
              ⏳ Are you eligible? — Yes, Remaining {remainingMonths} {remainingMonths === 1 ? "Month" : "Months"}
            </p>
          ) : (
            <p className="text-lg font-bold text-yellow-600 bg-yellow-100 px-4 py-2 rounded-full inline-block shadow">
              ⏳ Are you eligible? — Yes, Remaining {remainingDays} Days
            </p>
          )}
        </div>
      )}
      
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