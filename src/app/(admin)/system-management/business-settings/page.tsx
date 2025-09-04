"use client";
import { useCommission } from "@/context/CommissionContext";
import React, { useEffect, useState } from "react";
import PackagesCommissionPage from "../../packages-commission/page";
import AddPackage from "@/components/system-management/AddPackage";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import ComponentCard from "@/components/common/ComponentCard";
import FiveXGurrentee from "@/components/system-management/FiveXGurrentee";

const tabs = [
  "Business Info",
  "Add Package",
  "Package Commision",
  "5XGurrentee",
  // "Bookings",
  // "Customers",
  // "Providers",
  // "Servicemen",
];

function VendorDashboardPage() {
  const [activeTab, setActiveTab] = useState("Business Info");
  const [assurityfee, setAssurityFee] = useState("");
  const [platformFee, setPlatformFee] = useState("");
  const [commissionId, setCommissionId] = useState<string | null>(null);

  const {
    commissions,
    createCommission,
    updateCommission,
    fetchCommissions,
  } = useCommission();

  console.log("assurity:", commissions);

  useEffect(() => {
    fetchCommissions();
  }, []);

  useEffect(() => {
    if (commissions.length > 0) {
      const current = commissions[0];
      setAssurityFee(current.assurityfee?.toString() || ""); // ✅ safe access
      setPlatformFee(current.platformFee?.toString() || "");
      setCommissionId(current._id);
    }
  }, [commissions]);


  const handleSave = async () => {
    const assurity = parseFloat(assurityfee);
    const platform = parseFloat(platformFee);

    if (isNaN(assurity) || isNaN(platform)) {
      alert("Please enter valid numbers for both fields.");
      return;
    }

    try {
      if (commissionId) {
        await updateCommission(commissionId, assurity, platform);
        alert("Commission updated successfully!");
      } else {
        await createCommission(assurity, platform);
        alert("Commission created successfully!");
      }
    } catch (error) {
      console.error("Error saving commission:", error);
      alert("Failed to save commission.");
    }
  };


  return (
    <div className="p-4">
      <PageBreadcrumb pageTitle="Business Setup" />

      {/* Tab Navigation */}
      <ComponentCard title="Business Setup">

        <div className="flex space-x-4 border-b mb-4">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-2 px-4 font-medium ${activeTab === tab
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
                  value={assurityfee}
                  onChange={(e) => setAssurityFee(e.target.value)}
                  placeholder="Enter assurity fee"
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


          {activeTab === "Add Package" && (
            <div className="space-y-4">
              <AddPackage />
            </div>
          )}

          {activeTab === "Package Commision" && (
            <div className="space-y-4">
              <PackagesCommissionPage />
            </div>
          )}

          {activeTab === "5XGurrentee" && (
            <div className="space-y-4">
              <FiveXGurrentee />
            </div>
          )}
          {/* {activeTab === "Bookings" && <div>Bookings Content</div>}
          {activeTab === "Customers" && <div>Customers Content</div>}
          {activeTab === "Providers" && <div>Providers Content</div>}
          {activeTab === "Servicemen" && <div>Servicemen Content</div>} */}
        </div>
      </ComponentCard>
    </div>
  );
}

export default VendorDashboardPage;
