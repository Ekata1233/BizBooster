"use client";
import React, { useState } from "react";
import Image from "next/image";

interface UserMetaCardProps {
  imageSrc: string;
  name: string;
  role: string;
  location: string;
}

export default function UserMetaCard({ imageSrc, name, role, location }: UserMetaCardProps) {
  const [isActive, setIsActive] = useState(false);

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

        {/* Right: Creative Toggle */}
        <div className="flex flex-col items-end gap-1">
          <label className="text-sm font-semibold text-blue-600 dark:text-blue-600 tracking-wide uppercase">
            Package Active
          </label>
          <button
            onClick={() => setIsActive(!isActive)}
            className={`relative w-16 h-8 rounded-full p-1 transition-colors duration-300 border-2 ${
              isActive
                ? "bg-gradient-to-r from-green-400 to-green-600 border-green-500 shadow-[0_0_10px_rgba(34,197,94,0.6)]"
                : "bg-gray-300 border-gray-400"
            }`}
          >
            <span
              className={`absolute left-1 top-1 w-6 h-6 bg-white rounded-full shadow-md transform transition-transform duration-300 ${
                isActive ? "translate-x-8" : ""
              }`}
            ></span>
          </button>
        </div>
      </div>
    </div>
  );
}
