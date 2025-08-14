"use client";
import React from "react";
import StatCard from "../common/StatCard";

import {
  BoxCubeIcon,
  CalenderIcon,
  DollarLineIcon,
} from "../..//icons/index";

interface StatItem {
  title: string;
  value: string; 
}

interface UserStatCardProps {
  heading?: string;
  stat1: StatItem;
  stat2: StatItem;
  stat3: StatItem;
  stat4: StatItem;
}

export default function UserStatCard({
  heading = "Other Information",
  stat1,
  stat2,
  stat3,
  stat4,
}: UserStatCardProps) {
  return (
    <div className="p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6">
      <div>
        <div>
          <h4 className="text-lg font-semibold text-gray-800 dark:text-white/90 lg:mb-6">
            {heading}
          </h4>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 md:gap-6 my-5">
          <StatCard
            title={stat1.title}
            value={stat1.value}
            icon={CalenderIcon}
          />
          <StatCard
            title={stat2.title}
            value={stat2.value}
            icon={DollarLineIcon}
          />
          <StatCard
            title={stat3.title}
            value={stat3.value}
            icon={BoxCubeIcon}
          />
          <StatCard
            title={stat4.title}
            value={stat4.value}
            icon={BoxCubeIcon}
          />
        </div>
      </div>
    </div>
  );
}
