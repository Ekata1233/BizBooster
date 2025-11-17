// "use client";
// import React, { useEffect, useState, useMemo } from "react";
// import axios from "axios";
// import ColorStatCard from "@/components/common/ColorStatCard";
// import ComponentCard from "@/components/common/ComponentCard";
// import {
//   FaUsers,
//   FaChartLine,
//   FaMoneyBill,
//   FaClipboardList,
//   FaStore,
//   FaTools,
// } from "react-icons/fa";
// import { useAdminEarnings } from "@/context/AdminEarningsContext";
// import { useProvider } from "@/context/ProviderContext";
// import ResponsiveTable from "@/components/tables/ResponsiveTable";

// const Page = () => {
//   const { summary, fetchSummary } = useAdminEarnings();
//   const {
//     allWallet: allProviderWallets,
//     fetchAllWallet,
//   } = useProvider();

//   const [activeTab, setActiveTab] = useState("leadEarning");

//   // Pagination states
//   const [page, setPage] = useState(1);
//   const [limit] = useState(10);
//   const [total, setTotal] = useState(0);

//   const [leadEarnings, setLeadEarnings] = useState<any[]>([]);
//   const [leadLoading, setLeadLoading] = useState(false);
//   const [leadError, setLeadError] = useState("");

// const [packageEarnings, setPackageEarnings] = useState<any[]>([]);
//   const [packageLoading, setPackageLoading] = useState(false);
//   const [packageError, setPackageError] = useState("");
//   const [packageTotal, setPackageTotal] = useState(0);
//   const [packagePage, setPackagePage] = useState(1);

//   // Fetch summary
//   useEffect(() => {
//     fetchSummary();
//     fetchAllWallet();
//   }, []);

//   // Provider total
//   const providerTotal = useMemo(() => {
//     return (
//       allProviderWallets?.reduce(
//         (sum, wallet) => sum + (wallet?.pendingWithdraw || 0),
//         0
//       ) || 0
//     );
//   }, [allProviderWallets]);

//   const formatAmount = (amount: number) => {
//     if (!amount) return "₹0.00";
//     return `₹${amount.toLocaleString("en-IN", {
//       minimumFractionDigits: 2,
//       maximumFractionDigits: 2,
//     })}`;
//   };

//   // Fetch lead data with pagination
//   const fetchLeadEarnings = async () => {
//     try {
//       setLeadLoading(true);
//       const res = await axios.get(
//         `/api/business-report/checkout?page=${page}&limit=${limit}`
//       );

//       if (res.data.success) {
//         setLeadEarnings(res.data.data);
//         setTotal(res.data.total || 0);
//       } else {
//         setLeadEarnings([]);
//         setTotal(0);
//       }
//     } catch (err) {
//       setLeadError("Error fetching data");
//     } finally {
//       setLeadLoading(false);
//     }
//   };

//   const fetchPackageEarnings = async () => {
//     try {
//       setPackageLoading(true);
//       const res = await axios.get(
//         `/api/business-report/package?page=${packagePage}&limit=${limit}`
//       );

//       if (res.data.success) {
//         setPackageEarnings(res.data.data);
//         setPackageTotal(res.data.total || 0);
//       } else {
//         setPackageEarnings([]);
//         setPackageTotal(0);
//       }
//     } catch (err) {
//       setPackageError("Error fetching package data");
//     } finally {
//       setPackageLoading(false);
//     }
//   };

//   useEffect(() => {
//     if (activeTab === "leadEarning") fetchLeadEarnings();
//     if (activeTab === "packageEarning") fetchPackageEarnings();
//   }, [activeTab, page, packagePage]);

//   // Table Columns
//   const leadColumns = [
//     { header: "Booking ID", accessor: "bookingId" },
//     {
//       header: "Lead Price",
//       accessor: "priceAfterDiscount",
//       render: (r: any) => formatAmount(r.priceAfterDiscount),
//     },
//     {
//       header: "Coupon Discount",
//       accessor: "couponDiscountPrice",
//       render: (r: any) => formatAmount(r.couponDiscountPrice),
//     },
//     {
//       header: "Service GST",
//       accessor: "serviceGSTPrice",
//       render: (r: any) => formatAmount(r.serviceGSTPrice),
//     },
//     {
//       header: "Platform Fee",
//       accessor: "platformFeePrice",
//       render: (r: any) => formatAmount(r.platformFeePrice),
//     },
//     {
//       header: "Assurity Charges",
//       accessor: "assurityChargesPrice",
//       render: (r: any) => formatAmount(r.assurityChargesPrice),
//     },
//     {
//       header: "Total Amount",
//       accessor: "totalAmount",
//       render: (r: any) => formatAmount(r.totalAmount),
//     },
//     {
//       header: "Share 1",
//       accessor: "share_1",
//       render: (r: any) => (
//         <div>
//           <div>{formatAmount(r.share_1)}</div>
//           <div className="text-xs text-gray-500">{formatAmount(r.extra_share_1)}</div>
//         </div>
//       ),
//     },
//     {
//       header: "Share 2",
//       accessor: "share_2",
//       render: (r: any) => (
//         <div>
//           <div>{formatAmount(r.share_2)}</div>
//           <div className="text-xs text-gray-500">{formatAmount(r.extra_share_2)}</div>
//         </div>
//       ),
//     },
//     {
//       header: "Share 3",
//       accessor: "share_3",
//       render: (r: any) => (
//         <div>
//           <div>{formatAmount(r.share_3)}</div>
//           <div className="text-xs text-gray-500">{formatAmount(r.extra_share_3)}</div>
//         </div>
//       ),
//     },
//     {
//       header: "Provider",
//       accessor: "provider_share",
//       render: (r: any) => (
//         <div>
//           <div>{formatAmount(r.provider_share)}</div>
//           <div className="text-xs text-gray-500">
//             {formatAmount(r.extra_provider_share)}
//           </div>
//         </div>
//       ),
//     },
//     {
//       header: "Admin",
//       accessor: "admin_commission",
//       render: (r: any) => (
//         <div>
//           <div>{formatAmount(r.admin_commission)}</div>
//           <div className="text-xs text-gray-500">
//             {formatAmount(r.extra_admin_commission)}
//           </div>
//         </div>
//       ),
//     },
//   ];

//   const packageColumns = [
//     {
//       header: "Commission From",
//       accessor: "commissionFrom",
//       render: (r: any) => (
//         <div className="flex flex-col">
//           <span className="font-medium">{r?.commissionFrom?.fullName || "-"}</span>
//           <span className="text-xs text-gray-500">{r?.commissionFrom?.userId || "-"}</span>
//         </div>
//       ),
//     },
//     {
//       header: "Share 1",
//       accessor: "share_1",
//       render: (r: any) => `₹${r.share_1}`,
//     },
//     {
//       header: "Share 2",
//       accessor: "share_2",
//       render: (r: any) => `₹${r.share_2}`,
//     },
//     {
//       header: "Admin Commission",
//       accessor: "admin_commission",
//       render: (r: any) => `₹${r.admin_commission}`,
//     },
//     {
//       header: "Status",
//       accessor: "status",
//     },
//     // {
//     //   header: "Created At",
//     //   accessor: "createdAt",
//     //   render: (r: any) => new Date(r.createdAt).toLocaleString(),
//     // },
//   ];

//  return (
//   <div className="mb-16">

//     <div className="w-full max-w-4xl mx-auto">   {/* ⭐ FIXED WIDTH WRAPPER */}

//       <ComponentCard title="Earnings Reports">
//         <div className="flex w-full border-b pb-2 mb-4 text-sm font-medium text-gray-500">
//           {["leadEarning", "packageEarning", "other"].map((tab) => (
//             <button
//               key={tab}
//               onClick={() => setActiveTab(tab)}
//               className={`px-4 py-2 capitalize ${
//                 activeTab === tab
//                   ? "border-b-2 border-blue-600 text-blue-600"
//                   : "hover:text-blue-500"
//               }`}
//             >
//               {tab.replace(/([A-Z])/g, " $1")}
//             </button>
//           ))}
//         </div>

//         {activeTab === "leadEarning" && (
//           <>
//             {leadLoading ? (
//               <p>Loading...</p>
//             ) : (
//               <div className="">
//                 <div className="">
//                   <ResponsiveTable
//                     columns={leadColumns}
//                     data={leadEarnings}
//                     page={page}
//                     limit={limit}
//                     total={total}
//                     onPageChange={(p) => setPage(p)}
//                   />
//                 </div>
//               </div>
//             )}
//           </>
//         )}

//         {activeTab === "packageEarning" && (
//           <>
//             {packageLoading ? (
//               <p>Loading...</p>
//             ) : (
//               <div className="">
//                 <div className="">
//                   <ResponsiveTable
//                     columns={packageColumns}
//                     data={packageEarnings}
//                     page={packagePage}
//                     limit={limit}
//                     total={packageTotal}
//                     onPageChange={(p) => setPackagePage(p)}
//                   />
//                 </div>
//               </div>
//             )}
//           </>
//         )}

//       </ComponentCard>
//     </div>

//   </div>
// );

// };

// export default Page;


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
      <div className="w-full max-w-4xl mx-auto">
        <ComponentCard title="Earnings Reports">
          
          {/* Tabs */}
          <div className="flex w-full border-b pb-2 mb-4 text-sm font-medium text-gray-500">
            {["leadEarning", "packageEarning"].map((tab) => (
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

          {/* Child Components */}
          {activeTab === "leadEarning" && <LeadEarningsSection />}
          {activeTab === "packageEarning" && <PackageEarningsSection />}

        </ComponentCard>
      </div>
    </div>
  );
};

export default BusinessReportPage;
