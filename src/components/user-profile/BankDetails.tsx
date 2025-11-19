"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "next/navigation";
import {
  FaUniversity,
  FaRegClock,
  FaUser,
  FaCheckCircle,
  FaTimesCircle,
} from "react-icons/fa";

interface BankData {
  _id: string;
  userId: string;
  accountNumber: string;
  bankName: string;
  branchName: string;
  ifsc: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function BankDetailsPage() {
  const { id } = useParams(); // 👈 dynamic user ID from URL
  const [bankDetails, setBankDetails] = useState<BankData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) return;

    const fetchBankDetails = async () => {
      try {
        setLoading(true);
        const res = await axios.get(
          `/api/users/bank-details/${id}`
        );
        if (res.data.success) {
          setBankDetails(res.data.data);
        } else {
          setError("Failed to fetch bank details");
        }
      } catch (err) {
        console.error(err);
        setError("No Bank Details Found.");
      } finally {
        setLoading(false);
      }
    };

    fetchBankDetails();
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[70vh] text-gray-500">
        Loading bank details...
      </div>
    );
  }

  if (error || !bankDetails) {
    return (
      <div className="flex flex-col justify-center items-center h-[45vh] text-gray-600 border border-gray-400 rounded bg-white">
        <FaUniversity className="text-4xl text-gray-400 mb-3" />
        <p className="font-semibold">
          {error || "No bank details found for this user."}
        </p>
      </div>
    );
  }

  const {
    accountNumber,
    bankName,
    branchName,
    ifsc,
    isActive,
    createdAt,
    updatedAt,
    userId,
  } = bankDetails;

  return (
    <div className="p-6 space-y-8">
      <h2 className="text-xl font-semibold text-[#00509D] mb-4">
        Bank Account Details
      </h2>

      <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-all duration-300">
        {/* ─────────────── Header Info ─────────────── */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2">
            <FaUser className="text-[#00509D]" />
            <p className="text-sm text-gray-600">
              <span className="font-semibold">User ID:</span> {userId}
            </p>
          </div>

          <div>
            {isActive ? (
              <span className="flex items-center gap-1 text-green-600 text-sm font-semibold bg-green-50 px-3 py-1 rounded-full border border-green-200">
                <FaCheckCircle /> Active
              </span>
            ) : (
              <span className="flex items-center gap-1 text-red-600 text-sm font-semibold bg-red-50 px-3 py-1 rounded-full border border-red-200">
                <FaTimesCircle /> Inactive
              </span>
            )}
          </div>
        </div>

        {/* ─────────────── Grid Details ─────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-gray-800">
          <div>
            <p className="text-sm text-gray-500">Account Number</p>
            <p className="text-base font-semibold">{accountNumber}</p>
          </div>

          <div>
            <p className="text-sm text-gray-500">Bank Name</p>
            <p className="text-base font-semibold capitalize">{bankName}</p>
          </div>

          <div>
            <p className="text-sm text-gray-500">Branch Name</p>
            <p className="text-base font-semibold capitalize">{branchName}</p>
          </div>

          <div>
            <p className="text-sm text-gray-500">IFSC Code</p>
            <p className="text-base font-semibold uppercase">{ifsc}</p>
          </div>
        </div>

        {/* ─────────────── Footer Info ─────────────── */}
        <div className="flex justify-between mt-8 text-sm text-gray-600 border-t pt-4">
          <p className="flex items-center gap-2">
            <FaRegClock className="text-[#00509D]" />
            Created: {new Date(createdAt).toLocaleString()}
          </p>
          <p className="flex items-center gap-2">
            <FaRegClock className="text-[#00509D]" />
            Updated: {new Date(updatedAt).toLocaleString()}
          </p>
        </div>
      </div>
    </div>
  );
}
