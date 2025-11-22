

"use client";
import React, { useEffect, useState } from "react";
import ComponentCard from "@/components/common/ComponentCard";
import { useAdminEarnings } from "@/context/AdminEarningsContext";
import { useProvider } from "@/context/ProviderContext";
import LeadEarningsSection from "@/components/business-report/LeadEarningsSection";
import PackageEarningsSection from "@/components/business-report/PackageEarningsSection";

const BusinessReportPage = () => {
  const { fetchSummary } = useAdminEarnings();
  const { fetchAllWallet } = useProvider();

  const [activeTab, setActiveTab] = useState("leadEarning");

  useEffect(() => {
    fetchSummary();
    fetchAllWallet();
  }, []);

  return (
    <div className="mb-16">
    <div className="w-full px-4 md:px-6 lg:px-8">
  <div className="w-full max-w-6xl mx-auto">

    <ComponentCard title="Earnings Reports">

      {/* Tabs */}
      <div className="flex w-full border-b pb-2 mb-4 text-sm font-medium text-gray-500 overflow-x-auto">
        {["leadEarning", "packageEarning"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 whitespace-nowrap capitalize ${
              activeTab === tab
                ? "border-b-2 border-blue-600 text-blue-600"
                : "hover:text-blue-500"
            }`}
          >
            {tab.replace(/([A-Z])/g, " $1")}
          </button>
        ))}
      </div>

      {/* Child Components */}
      {activeTab === "leadEarning" && <LeadEarningsSection />}
      {activeTab === "packageEarning" && <PackageEarningsSection />}

    </ComponentCard>

  </div>
</div>

    </div>
  );
};

export default BusinessReportPage;
