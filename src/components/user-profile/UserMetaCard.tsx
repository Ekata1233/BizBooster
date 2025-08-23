"use client";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import { Modal } from "../ui/modal";

interface UserMetaCardProps {
  userId: string;
  imageSrc: string;
  name: string;
  role: string;
  location: string;
  isCommissionDistribute: boolean;
  isToggleButton: boolean;
}

export default function UserMetaCard({
  userId,
  imageSrc,
  name,
  role,
  location,
  isCommissionDistribute,
  isToggleButton
}: UserMetaCardProps) {
  const [isActive, setIsActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
const [showPassword, setShowPassword] = useState(false);

  // set your secure password here
  const SECURE_PASSWORD = "activate@2025";

  useEffect(() => {
    if (isCommissionDistribute) {
      setIsActive(true); // lock it to active if already distributed
    }
  }, [isCommissionDistribute]);

  const handleToggle = () => {
    if (isCommissionDistribute || loading) return;

    const newStatus = !isActive;
    if (newStatus) {
      // open modal for password instead of immediate confirm
      setShowPasswordModal(true);
    }
  };

  const handleConfirmPassword = async () => {
    if (password !== SECURE_PASSWORD) {
      setError("Password is incorrect");
      return;
    }

    setError("");
    setShowPasswordModal(false);
    setLoading(true);

    try {
      const res = await fetch("https://biz-booster.vercel.app/api/distributePackageCommission", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setIsActive(true);
        alert("Package activated successfully!");
      } else {
        alert("Failed to activate package: " + (data.message || "Unknown error"));
      }
    } catch (err) {
      console.error(err);
      alert("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
      setPassword("");
    }
  };

  return (
    <div className="p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6">
      <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
        {/* Left: User Info */}
        <div className="flex flex-col items-center w-full gap-6 xl:flex-row xl:w-auto">
          <div className="w-20 h-20 overflow-hidden border border-gray-200 rounded-full dark:border-gray-800">
            <Image width={80} height={80} src={imageSrc} alt={name} />
          </div>
          <div className="order-3 xl:order-2">
            <h4 className="mb-2 text-lg font-semibold text-center text-gray-800 dark:text-white/90 xl:text-left">
              {name}
            </h4>
            <div className="flex flex-col items-center gap-1 text-center xl:flex-row xl:gap-3 xl:text-left">
              <p className="text-sm text-gray-500 dark:text-gray-400">{role}</p>
              <div className="hidden h-3.5 w-px bg-gray-300 dark:bg-gray-700 xl:block"></div>
              <p className="text-sm text-gray-500 dark:text-gray-400">{location}</p>
            </div>
          </div>
        </div>

        {/* Right: Package Toggle */}
     {isToggleButton && (
  <div className="flex flex-col items-end gap-1 relative">
    <label className="text-sm font-semibold text-blue-600 dark:text-blue-600 tracking-wide uppercase">
      Package Active
    </label>
    <div className="relative flex items-center gap-2">
      <button
        disabled={isCommissionDistribute || loading}
        onClick={handleToggle}
        className={`relative w-16 h-8 rounded-full p-1 transition-colors duration-300 border-2 ${
          isActive
            ? "bg-gradient-to-r from-green-400 to-green-600 border-green-500 shadow-[0_0_10px_rgba(34,197,94,0.6)]"
            : "bg-gray-300 border-gray-400"
        } ${isCommissionDistribute || loading ? "opacity-50 cursor-not-allowed" : ""}`}
      >
        <span
          className={`absolute left-0 top-0 w-7 h-7 bg-white rounded-full shadow-md transform transition-transform duration-300 ${
            isActive ? "translate-x-8" : ""
          }`}
        ></span>
      </button>
      {loading && (
        <span className="text-sm text-gray-600 dark:text-gray-400 animate-pulse">
          Activating...
        </span>
      )}
    </div>

    {/* Password Modal using <Modal /> */}
   <Modal
  isOpen={showPasswordModal}
  onClose={() => {
    setShowPasswordModal(false);
    setPassword("");
    setError("");
  }}
  className="max-w-sm "
>
  <div className="p-4">
    <h2 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white text-center">
      Enter Password
    </h2>

    {/* Password Input with Show/Hide */}
    <div className="relative mb-3 pt-4">
      <input
        type={showPassword ? "text" : "password"}
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:text-white pr-10 "
        placeholder="Enter activation password"
      />
      <button
        type="button"
        onClick={() => setShowPassword(!showPassword)}
        className="absolute inset-y-2 right-3 flex items-center text-gray-500 hover:text-gray-700 dark:text-gray-300 mt-4"
      >
        {showPassword ? (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 " fill="none"
            viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none"
            viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M13.875 18.825A10.05 10.05 0 0112 19c-4.477 0-8.268-2.943-9.542-7a9.956 9.956 0 012.47-4.09M9.88 9.88a3 3 0 104.24 4.24M6.1 6.1l11.8 11.8" />
          </svg>
        )}
      </button>
    </div>

    {error && <p className="text-red-500 text-sm mb-2">{error}</p>}

    <div className="flex justify-end gap-3">
      <button
        onClick={() => {
          setShowPasswordModal(false);
          setPassword("");
          setError("");
        }}
        className="px-4 py-2 text-sm bg-gray-300 rounded-lg hover:bg-gray-400 dark:bg-gray-600 dark:hover:bg-gray-500"
      >
        Cancel
      </button>
      <button
        onClick={handleConfirmPassword}
        className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700"
      >
        Confirm
      </button>
    </div>
  </div>
</Modal>

  </div>
)}

      </div>
    </div>
  );
}
