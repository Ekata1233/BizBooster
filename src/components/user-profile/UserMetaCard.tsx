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
  franchiseId: string;
}

export default function UserMetaCard({
  userId,
  imageSrc,
  name,
  role,
  location,
  isCommissionDistribute,
  isToggleButton,
  franchiseId
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
      const res = await fetch("https://api.fetchtrue.com/api/distributePackageCommission", {
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
            <Image width={80} height={80} src={imageSrc} alt={name} className="w-full h-full object-cover" />
          </div>
          <div className="order-3 xl:order-2">
            <h4 className="mb-2 text-lg font-semibold text-center text-gray-800 dark:text-white/90 xl:text-left">
              {name} | {franchiseId}
            </h4>
            <div className="flex flex-col items-center gap-1 text-center xl:flex-row xl:gap-3 xl:text-left">
              <p className="text-sm text-gray-500 dark:text-gray-400">{role}</p>
              <div className="hidden h-3.5 w-px bg-gray-300 dark:bg-gray-700 xl:block"></div>
              <p className="text-sm text-gray-500 dark:text-gray-400">{location}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
