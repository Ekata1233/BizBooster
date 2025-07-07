"use client";
import { useCommission } from "@/context/CommissionContext";
import React, { useEffect, useState } from "react";
import PackagesCommissionPage from "../../packages-commission/page";

const tabs = [
  "Business Info",
  "Package Commision",
  "Promotions",
  "Bookings",
  "Customers",
  "Providers",
  "Servicemen",
];

function VendorDashboardPage() {
  const [activeTab, setActiveTab] = useState("Business Info");
  const [adminCommission, setAdminCommission] = useState("");
  const [platformFee, setPlatformFee] = useState("");
  const [commissionId, setCommissionId] = useState<string | null>(null);

  const {
    commissions,
    createCommission,
    updateCommission,
    fetchCommissions,
  } = useCommission();

  console.log("assurity:",commissions);
  
  useEffect(() => {
    fetchCommissions();
  }, []);

  useEffect(() => {
    if (commissions.length > 0) {
      const current = commissions[0];
      setAdminCommission(current.adminCommission.toString());
      setPlatformFee(current.platformFee.toString());
      setCommissionId(current._id);
    }
  }, [commissions]);

  const handleSave = async () => {
    const admin = parseFloat(adminCommission);
    const platform = parseFloat(platformFee);

    if (isNaN(admin) || isNaN(platform)) {
      alert("Please enter valid numbers for both fields.");
      return;
    }

    try {
      if (commissionId) {
        await updateCommission(commissionId, admin, platform);
        alert("Commission updated successfully!");
      } else {
        await createCommission(admin, platform);
        alert("Commission created successfully!");
      }
    } catch (error) {
      console.error("Error saving commission:", error);
      alert("Failed to save commission.");
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-semibold mb-4">Business Setup</h1>

      {/* Tab Navigation */}
      <div className="flex space-x-4 border-b mb-4">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`pb-2 px-4 font-medium ${
              activeTab === tab
                ? "border-b-2 border-blue-500 text-blue-600"
                : "text-gray-600"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="mt-4">
        
        {activeTab === "Business Info" && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold mb-6"> Commission Setup</h2>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
              Assurity Fee (%)
              </label>
              <input
                type="number"
                value={adminCommission}
                onChange={(e) => setAdminCommission(e.target.value)}
                placeholder="Enter default admin commission"
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Platform Fee (%)
              </label>
              <input
                type="number"
                value={platformFee}
                onChange={(e) => setPlatformFee(e.target.value)}
                placeholder="Enter platform fee"
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>

            <button
              onClick={handleSave}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
            >
              Save
            </button>
          </div>
        )}

        {activeTab === "Package Commision" && (
  <div className="space-y-4">
    <PackagesCommissionPage />
  </div>
)}

        {activeTab === "Promotions" && <div>Promotions Content</div>}
        {activeTab === "Bookings" && <div>Bookings Content</div>}
        {activeTab === "Customers" && <div>Customers Content</div>}
        {activeTab === "Providers" && <div>Providers Content</div>}
        {activeTab === "Servicemen" && <div>Servicemen Content</div>}
      </div>
    </div>
  );
}

export default VendorDashboardPage;
