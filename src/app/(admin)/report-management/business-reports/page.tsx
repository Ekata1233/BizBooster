// 'use client';

// import React, { useEffect, useMemo } from 'react';
// import { useAdminEarnings } from '@/context/AdminEarningsContext';
// import ColorStatCard from '@/components/common/ColorStatCard';
// import {
//   FaUsers,
//   FaChartLine,
//   FaMoneyBill,
//   FaClipboardList,
//   FaStore,
//   FaTools,
// } from 'react-icons/fa';
// import { useProvider } from '@/context/ProviderContext';

// const Page = () => {
//   const { summary, loading, fetchSummary } = useAdminEarnings();

//   useEffect(() => {
//     fetchSummary();
//   }, []);
//   const {
//     allWallet: allProviderWallets,
//     fetchAllWallet,
//     loading: providerLoading,
//     error: providerError,
//   } = useProvider();

//   // console.log("summary : ", summary);

//   // ✅ Always call hooks before any conditional return
//   const { providerTotal } = useMemo(() => {
//     const providerTotal = allProviderWallets?.reduce(
//       (sum, wallet) => sum + (wallet?.pendingWithdraw || 0),
//       0
//     );
//     return { providerTotal };
//   }, [allProviderWallets]);

//   useEffect(() => {
//     fetchAllWallet();
//   }, []);
//   // console.log("allProviderWallets : ", providerTotal)

//   useEffect(() => {
//     if (allProviderWallets?.length)
//       console.log("🏪 All Provider Wallets:", allProviderWallets);
//   }, [allProviderWallets]);

//   // ✅ Now safe to conditionally return
//   if (providerLoading) return <p>Loading wallets...</p>;
//   if (providerError) return <p>Error: {providerError}</p>;

//   if (loading) return <p className="p-6 text-lg">Loading earnings summary...</p>;
//   if (!summary) return <p className="p-6 text-red-600">No summary data available.</p>;

//   const formatAmount = (amount: number | undefined | null) => {
//     if (typeof amount !== 'number' || isNaN(amount)) return '₹0.00';
//     return `₹${amount.toLocaleString('en-IN', {
//       minimumFractionDigits: 2,
//       maximumFractionDigits: 2,
//     })}`;
//   };


//   const cards = [
//     {
//       title: 'Total Revenue',
//       value: formatAmount(summary.totalRevenue),
//       icon: <FaUsers size={48} />,
//       gradient: 'from-red-100 to-red-200',
//       textColor: 'text-red-800',
//     },
//     {
//       title: 'Admin Commission',
//       value: formatAmount(summary.adminCommission),
//       icon: <FaClipboardList size={48} />,
//       gradient: 'from-blue-100 to-blue-200',
//       textColor: 'text-blue-800',
//     },
//     {
//       title: 'Extra Fee',
//       value: formatAmount(summary.extraFees),
//       icon: <FaMoneyBill size={48} />,
//       gradient: 'from-green-100 to-green-200',
//       textColor: 'text-green-800',
//     },
//     {
//       title: 'GST',
//       value: formatAmount(summary.GST),
//       icon: <FaMoneyBill size={48} />,
//       gradient: 'from-green-100 to-green-200',
//       textColor: 'text-green-800',
//     },
//     {
//       title: "Provider Earnings",
//       value: formatAmount(providerTotal),
//       icon: <FaTools size={48} />,
//       gradient: "from-yellow-100 to-yellow-200",
//       textColor: "text-yellow-800",
//     },
//     {
//       title: "Franchise Earnings",
//       value: formatAmount(summary.franchiseEarnings),
//       icon: <FaStore size={48} />,
//       gradient: "from-purple-100 to-purple-200",
//       textColor: "text-purple-800",
//     },
//     {
//       title: 'Franchise Pending Payout',
//       value: formatAmount(summary.franchiseBalance),
//       icon: <FaStore size={48} />,
//       gradient: 'from-purple-100 to-purple-200',
//       textColor: 'text-purple-800',
//     },
//     {
//       title: 'Provider Pending Payout',
//       value: formatAmount(summary.providerBalance),
//       icon: <FaChartLine size={48} />,
//       gradient: 'from-teal-100 to-teal-200',
//       textColor: 'text-teal-800',
//     },
//   ];

//   return (
//     <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 p-6">
//       {cards.map((card, index) => (
//         <ColorStatCard
//           key={index}
//           title={card.title}
//           value={card.value}
//           icon={card.icon}
//           gradient={card.gradient}
//           textColor={card.textColor}
//         />
//       ))}
//     </div>
//   );
// };

// export default Page;


"use client";
import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import ColorStatCard from "@/components/common/ColorStatCard";
import ComponentCard from "@/components/common/ComponentCard";
import BasicTableOne from "@/components/tables/BasicTableOne";
import {
  FaUsers,
  FaChartLine,
  FaMoneyBill,
  FaClipboardList,
  FaStore,
  FaTools,
} from "react-icons/fa";
import { useAdminEarnings } from "@/context/AdminEarningsContext";
import { useProvider } from "@/context/ProviderContext";

const Page = () => {
  const { summary, loading, fetchSummary } = useAdminEarnings();
  const {
    allWallet: allProviderWallets,
    fetchAllWallet,
    loading: providerLoading,
  } = useProvider();

  const [activeTab, setActiveTab] = useState("leadEarning");
  const [leadEarnings, setLeadEarnings] = useState<any[]>([]);
  const [leadLoading, setLeadLoading] = useState(false);
  const [leadError, setLeadError] = useState("");

  // ✅ Fetch summary
  useEffect(() => {
    fetchSummary();
    fetchAllWallet();
  }, []);

  // ✅ Provider total calculation
  const { providerTotal } = useMemo(() => {
    const providerTotal = allProviderWallets?.reduce(
      (sum, wallet) => sum + (wallet?.pendingWithdraw || 0),
      0
    );
    return { providerTotal };
  }, [allProviderWallets]);

  // ✅ Format currency
  const formatAmount = (amount: number | undefined | null) => {
    if (typeof amount !== "number" || isNaN(amount)) return "₹0.00";
    return `₹${amount.toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  // ✅ Cards (Summary)
  const cards = [
    {
      title: "Total Revenue",
      value: formatAmount(summary?.totalRevenue),
      icon: <FaUsers size={48} />,
      gradient: "from-red-100 to-red-200",
      textColor: "text-red-800",
    },
    {
      title: "Admin Commission",
      value: formatAmount(summary?.adminCommission),
      icon: <FaClipboardList size={48} />,
      gradient: "from-blue-100 to-blue-200",
      textColor: "text-blue-800",
    },
    {
      title: "Extra Fee",
      value: formatAmount(summary?.extraFees),
      icon: <FaMoneyBill size={48} />,
      gradient: "from-green-100 to-green-200",
      textColor: "text-green-800",
    },
    {
      title: "GST",
      value: formatAmount(summary?.GST),
      icon: <FaMoneyBill size={48} />,
      gradient: "from-green-100 to-green-200",
      textColor: "text-green-800",
    },
    {
      title: "Provider Earnings",
      value: formatAmount(providerTotal),
      icon: <FaTools size={48} />,
      gradient: "from-yellow-100 to-yellow-200",
      textColor: "text-yellow-800",
    },
    {
      title: "Franchise Earnings",
      value: formatAmount(summary?.franchiseEarnings),
      icon: <FaStore size={48} />,
      gradient: "from-purple-100 to-purple-200",
      textColor: "text-purple-800",
    },
    {
      title: "Franchise Pending Payout",
      value: formatAmount(summary?.franchiseBalance),
      icon: <FaStore size={48} />,
      gradient: "from-purple-100 to-purple-200",
      textColor: "text-purple-800",
    },
    {
      title: "Provider Pending Payout",
      value: formatAmount(summary?.providerBalance),
      icon: <FaChartLine size={48} />,
      gradient: "from-teal-100 to-teal-200",
      textColor: "text-teal-800",
    },
  ];

  // ✅ Fetch Lead Earnings Data
  const fetchLeadEarnings = async () => {
    try {
      setLeadLoading(true);
      setLeadError("");
      const response = await axios.get(
        "/api/business-report/checkout?page=1&limit=5"
      );
      if (response.data.success) {
        setLeadEarnings(response.data.data);
      } else {
        setLeadEarnings([]);
        setLeadError("No data found");
      }
    } catch (err) {
      console.error("Error fetching lead earnings:", err);
      setLeadError("Error fetching lead earnings");
    } finally {
      setLeadLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === "leadEarning") fetchLeadEarnings();
  }, [activeTab]);

  // ✅ Lead Table Columns
  const leadColumns = [
    // { header: "Checkout ID", accessor: "bookingId" },
    { header: "Booking ID", accessor: "bookingId" },
    {
      header: "Lead Price",
      accessor: "priceAfterDiscount",
      render: (row: any) => formatAmount(row.priceAfterDiscount),
    },
    {
      header: "Coupon Discount",
      accessor: "couponDiscountPrice",
      render: (row: any) => formatAmount(row.couponDiscountPrice),
    },
    {
      header: "Service GST",
      accessor: "serviceGSTPrice",
      render: (row: any) => formatAmount(row.serviceGSTPrice),
    },
    {
      header: "Platform Fee",
      accessor: "platformFeePrice",
      render: (row: any) => formatAmount(row.platformFeePrice),
    },
    {
      header: "Assurity Charges",
      accessor: "assurityChargesPrice",
      render: (row: any) => formatAmount(row.assurityChargesPrice),
    },
    {
      header: "Total Amount",
      accessor: "totalAmount",
      render: (row: any) => formatAmount(row.totalAmount),
    },
    {
      header: "Share 1",
      accessor: "share_1",
      render: (row: any) => (
        <div className="text-sm">
          <div>{formatAmount(row.share_1)}</div>
          <div className="text-gray-500 text-xs">
            Extra: {formatAmount(row.extra_share_1)}
          </div>
        </div>
      ),
    },
    {
      header: "Share 2",
      accessor: "share_2",
      render: (row: any) => (
        <div className="text-sm">
          <div>{formatAmount(row.share_2)}</div>
          <div className="text-gray-500 text-xs">
            Extra: {formatAmount(row.extra_share_2)}
          </div>
        </div>
      ),
    },
    {
      header: "Share 3",
      accessor: "share_3",
      render: (row: any) => (
        <div className="text-sm">
          <div>{formatAmount(row.share_3)}</div>
          <div className="text-gray-500 text-xs">
            Extra: {formatAmount(row.extra_share_3)}
          </div>
        </div>
      ),
    },
    {
      header: "Provider",
      accessor: "provider_share",
      render: (row: any) => (
        <div className="text-sm">
          <div>{formatAmount(row.provider_share)}</div>
          <div className="text-gray-500 text-xs">
            Extra: {formatAmount(row.extra_provider_share)}
          </div>
        </div>
      ),
    },
    {
      header: "Admin",
      accessor: "admin_commission",
      render: (row: any) => (
        <div className="text-sm">
          <div>{formatAmount(row.admin_commission)}</div>
          <div className="text-gray-500 text-xs">
            Extra: {formatAmount(row.extra_admin_commission)}
          </div>
        </div>
      ),
    },
  ];

  return (
    <div className="p-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mb-8">
        {cards.map((card, index) => (
          <ColorStatCard
            key={index}
            title={card.title}
            value={card.value}
            icon={card.icon}
            gradient={card.gradient}
            textColor={card.textColor}
          />
        ))}
      </div>

      {/* Tabs Section */}
      <ComponentCard title="Earnings Reports">
        <div className="flex space-x-6 border-b pb-2 mb-4 text-sm font-medium text-gray-500">
          {["leadEarning", "packageEarning", "other"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 capitalize ${
                activeTab === tab
                  ? "border-b-2 border-blue-600 text-blue-600"
                  : "hover:text-blue-500"
              }`}
            >
              {tab.replace(/([A-Z])/g, " $1")}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === "leadEarning" && (
          <>
            {leadLoading ? (
              <p>Loading Lead Earnings...</p>
            ) : leadError ? (
              <p className="text-red-600">{leadError}</p>
            ) : (
              <BasicTableOne columns={leadColumns} data={leadEarnings}  />
            )}
          </>
        )}

        {activeTab === "packageEarning" && (
          <div className="text-gray-500 py-6 text-center">
            Package Earnings data coming soon...
          </div>
        )}

        {activeTab === "other" && (
          <div className="text-gray-500 py-6 text-center">
            Other Earnings data coming soon...
          </div>
        )}
      </ComponentCard>
    </div>
  );
};

export default Page;
