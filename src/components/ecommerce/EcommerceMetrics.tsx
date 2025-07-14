"use client";
import React, { useEffect } from "react";
import Badge from "../ui/badge/Badge";
import {
  ArrowDownIcon,
  ArrowUpIcon,
  BoxIconLine,
  GroupIcon,
} from "@/icons";
import { useUserContext } from "@/context/UserContext";
import { useProvider } from "@/context/ProviderContext";
import { useCheckout } from "@/context/CheckoutContext";
import { useAdminEarnings } from "@/context/AdminEarningsContext";

export const EcommerceMetrics = () => {
  const { users, loading: userLoading } = useUserContext();
  const { providerDetails, loading: providerLoading } = useProvider();
  const { checkouts, loading: checkoutLoading } = useCheckout();
  const { summary, loading: summaryLoading, fetchSummary } = useAdminEarnings();

  useEffect(() => {
    if (!summary) fetchSummary();
  }, [summary, fetchSummary]);

  const isLoading =
    userLoading || providerLoading || checkoutLoading || summaryLoading;

  if (isLoading) return <p>Loading Data...</p>;
  if (!summary) return <p>No earnings summary available.</p>;

  // ✅ Filter logic
  const activeUsers = users?.filter(user => user.isDeleted === false) || [];
  // Cast providerDetails to an array of any (or better: unknown/Provider if available)
  const activeProviders = Array.isArray(providerDetails)
    ? providerDetails.filter((p: any) => p.isDeleted === false)
    : [];
  const completedCheckouts = checkouts?.filter(
    c => c.isDeleted === false && c.isCompleted === true
  ) || [];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 md:gap-6">
      <MetricCard
        title="Users"
        value={activeUsers.length}
        trend="up"
        percentChange="2.15%"
        icon={<GroupIcon className="text-gray-800 size-6 dark:text-white/90" />}
      />
      <MetricCard
        title="Providers"
        value={activeProviders.length}
        trend="up"
        percentChange="1.90%"
        icon={<BoxIconLine className="text-gray-800 dark:text-white/90" />}
      />
      <MetricCard
        title="Total Bookings"
        value={completedCheckouts.length}
        trend="up"
        percentChange="3.27%"
        icon={<GroupIcon className="text-gray-800 size-6 dark:text-white/90" />}
      />
      <MetricCard
        title="Total Revenue"
        value={`₹${summary.totalRevenue.toLocaleString("en-IN")}`}
        trend="up"
        percentChange="6.88%"
        icon={<BoxIconLine className="text-gray-800 dark:text-white/90" />}
      />
    </div>
  );
};

const MetricCard = ({ title, value, trend, percentChange, icon }: {
  title: string;
  value: number | string;
  trend: "up" | "down";
  percentChange: string;
  icon: React.ReactNode;
}) => {
  const TrendIcon = trend === "up" ? ArrowUpIcon : ArrowDownIcon;
  const badgeColor = trend === "up" ? "success" : "error";

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
      <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800">
        {icon}
      </div>
      <div className="flex items-end justify-between mt-5">
        <div>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {title}
          </span>
          <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90">
            {value}
          </h4>
        </div>
        <Badge color={badgeColor}>
          <TrendIcon className={trend === "down" ? "text-error-500" : ""} />
          {percentChange}
        </Badge>
      </div>
    </div>
  );
};
