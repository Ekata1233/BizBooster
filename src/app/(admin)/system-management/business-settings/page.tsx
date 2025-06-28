"use client";
import React, { useState } from "react";

const tabs = [
  "Business Info",
  "General Setup",
  "Promotions",
  "Bookings",
  "Customers",
  "Providers",
  "Servicemen",
];

function VendorDashboardPage() {
  const [activeTab, setActiveTab] = useState("Business Info");

  // States for input fields
  const [adminCommission, setAdminCommission] = useState("");
  const [platformFee, setPlatformFee] = useState("");

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
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Default Commission for Admin (%)
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
          </div>
        )}

        {activeTab === "General Setup" && <div>General Setup Content</div>}
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
