"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import BasicTableOne from "@/components/tables/BasicTableOne";
import {
  FaCalendarAlt,
  FaLock,
  FaMoneyBillWave,
  FaPiggyBank,
} from "react-icons/fa";
import { useUserWallet } from "@/context/WalletContext";

interface Deposite {
  _id: string;
  user: string;
  packagePrice: number;
  monthlyEarnings: number;
  lockInPeriod: number;
  deposite: number;
  packageActivateDate: string | null;
  createdAt: string;
  updatedAt: string;
}

interface Transaction {
  _id: string;
  user: string;
  type: "credit" | "debit";
  amount: number;
  createdAt: string;
}

const columnsTransactions = [
  { header: "Sr", accessor: "sr" },
  {
    header: "Transaction Date",
    accessor: "createdAt",
    render: (row: any) =>
      new Date(row.createdAt).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }),
  },
  { header: "Transaction ID", accessor: "referenceId" },
  {
    header: "Transaction Type",
    accessor: "type",
    render: (row: any) => {
      const color =
        row.type === "credit"
          ? "bg-green-100 text-green-600 border-green-300"
          : "bg-red-100 text-red-600 border-red-300";
      return (
        <span className={`px-2 py-1 rounded-full text-xs border ${color}`}>
          {row.type}
        </span>
      );
    },
  },
  {
    header: "Amount",
    accessor: "amount",
    render: (row: any) => `₹${Number(row.amount).toLocaleString()}`,
  },
];

export default function UserDepositePage() {
  const params = useParams();
  const id = params?.id as string;

  const [deposite, setDeposite] = useState<Deposite | null>(null);
  const [loading, setLoading] = useState(true);

  // ─────────────── Progress State ───────────────
  const [leadPercent, setLeadPercent] = useState(0);
  const [completedMonths, setCompletedMonths] = useState(0);
  const [totalEarnings, setTotalEarnings] = useState(0);
  const [currentLevel, setCurrentLevel] = useState(1);
  const { wallet, error, fetchWalletByUser } = useUserWallet();

  // Fetch wallet when component mounts (or when userId changes)
  useEffect(() => {
    if (id) {
      fetchWalletByUser(id);
    }
  }, [id]);

  console.log("wallet : ", wallet)

  // Filtered transactions from wallet
  const depositTransactions =
    wallet?.transactions?.filter(
      (txn: any) => txn.description === "Monthly package earning"
    ) || [];


  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch("/api/deposite");
        const data = await res.json();
        if (data.success) {
          const userDeposite = data.data.find((d: Deposite) => d.user === id);
          setDeposite(userDeposite || null);
        }
      } catch (error) {
        console.error("Error fetching deposites:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [id]);

  // ─────────────── Calculate Progress ───────────────
  useEffect(() => {
    if (!deposite) return;

    const startDate = deposite.packageActivateDate
      ? new Date(deposite.packageActivateDate)
      : null;

    if (startDate) {
      const now = new Date();
      const monthsPassed =
        (now.getFullYear() - startDate.getFullYear()) * 12 +
        (now.getMonth() - startDate.getMonth());

      const safeMonths = Math.max(0, Math.min(36, monthsPassed)); // clamp 0–36
      setCompletedMonths(safeMonths);

      const progress = (safeMonths / 36) * 100;
      setLeadPercent(progress);

      setCurrentLevel(Math.min(5, Math.floor((progress / 100) * 5)));
    }


  }, [deposite]);

  if (loading) return <p className="p-6 text-gray-600">Loading...</p>;

  return (
    <div className="space-y-8 p-6">
      {/* ─────────────── Deposit Progress Graph ─────────────── */}
      <div className="w-full">
        <h2 className="text-lg font-semibold mb-4">Deposit Return Progress</h2>
        {deposite ? (
          <div className="w-full bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
            {/* Top Info Row */}
            <div className="flex justify-between items-center text-sm text-gray-700 mb-6">
              <p className="flex items-center gap-2">
                <FaCalendarAlt className="text-green-600" />
                <span className="font-medium">Package Activated:</span>{" "}
                {deposite?.packageActivateDate
                  ? new Date(deposite.packageActivateDate).toLocaleDateString(
                    "en-GB",
                    { day: "2-digit", month: "short", year: "numeric" }
                  )
                  : "N/A"}
              </p>
              <p className="flex items-center gap-2 text-red-600">
                <FaLock className="text-red-600" />
                <span className="font-medium text-red-600">Lock-in Period:</span>{" "}
                {deposite?.lockInPeriod ?? 0} months
              </p>
            </div>

            <div className="relative w-full flex justify-center my-6">
              <div className="w-[320px] h-[170px]">
                <svg width="320" height="170" viewBox="0 0 300 160">
                  {/* background arc */}
                  <path
                    d="M40,140 A110,110 0 0,1 260,140"
                    fill="none"
                    stroke="#e5e7eb"
                    strokeWidth="18"
                  />
                  {/* progress arc */}
                  <path
                    d="M40,140 A110,110 0 0,1 260,140"
                    fill="none"
                    stroke="#10b981"
                    strokeWidth="18"
                    strokeLinecap="round"
                    strokeDasharray="345"
                    strokeDashoffset={345 - (leadPercent * 345) / 100}
                  />
                  {/* completed months text */}
                  <text
                    x="150"
                    y="100"
                    textAnchor="middle"
                    fontSize="22"
                    fontWeight="bold"
                    fill="#10b981"
                  >
                    {completedMonths} Months
                  </text>
                </svg>
              </div>
            </div>

            {/* Progress info */}
            <div className="text-center mb-6">
              <div className="text-base text-gray-700 font-medium">
                Progress: {leadPercent.toFixed(1)}%
              </div>
              <div className="text-xs text-gray-500">
                🎯 Target: 36 Months (Deposit Return)
              </div>
              <div className="text-xs text-gray-500 mt-1">
                ⏳ Remaining: {36 - completedMonths} Months
              </div>
            </div>

            {/* Bottom Info Cards */}
            <div className="grid grid-cols-2 gap-4">
              {/* Deposited Amount */}
              <div className="bg-green-50 border border-green-200 rounded-xl py-4 px-3 shadow-sm">
                <p className="text-sm text-gray-500 flex items-center gap-2">
                  <FaPiggyBank className="text-green-500" /> Deposited Amount
                </p>
                <p className="text-lg font-semibold text-green-600 mt-1">
                  ₹{(deposite?.deposite ?? 0).toLocaleString()}
                </p>
              </div>

              {/* Monthly Earnings */}
              <div className="bg-yellow-50 border border-yellow-200 rounded-xl py-4 px-3 shadow-sm">
                <p className="text-sm text-gray-500 flex items-center gap-2">
                  <FaMoneyBillWave className="text-yellow-500" /> Monthly
                  Earnings
                </p>
                <p className="text-lg font-semibold text-yellow-600 mt-1">
                  ₹{(deposite?.monthlyEarnings ?? 0).toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        ) : (
          <p>No deposit found for this user.</p>
        )}
      </div>

      {/* ─────────────── Transactions Table ─────────────── */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Deposit Transactions</h2>
        {depositTransactions.length > 0 ? (
          <BasicTableOne
            columns={columnsTransactions}
            data={depositTransactions.map((txn: any, index: number) => ({
              ...txn,
              sr: index + 1,
            }))}
          />
        ) : (
          <div className="flex flex-col items-center justify-center gap-3 p-8 bg-white border border-gray-200 rounded-2xl shadow-sm">
            <FaPiggyBank className="text-gray-400 text-4xl" />
            <h3 className="text-lg font-semibold text-gray-700">
              No Deposit Transactions
            </h3>
            <p className="text-sm text-gray-500 text-center">
              This user does not have any deposit transactions yet.
            </p>
          </div>
        )}
      </div>

    </div>
  );
}
