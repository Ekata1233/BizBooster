// "use client";

// import ComponentCard from "@/components/common/ComponentCard";
// import PageBreadcrumb from "@/components/common/PageBreadCrumb";
// import { useProvider } from "@/context/ProviderContext";
// import { useUserWallet } from "@/context/WalletContext";
// import React, { useEffect, useMemo, useState } from "react";
// import { FaCashRegister, FaMoneyBillWave, FaWallet, FaFileDownload } from "react-icons/fa";
// import BasicTableOne from "@/components/tables/BasicTableOne";
// import Pagination from "@/components/tables/Pagination";
// import * as XLSX from "xlsx";

// interface WalletTransactionRow {
//     serial: number;
//     type: "franchise" | "provider";
//     amount: string;
//     description: string;
//     method: string;
//     status: string;
//     createdAt: string;
// }

// const Page = () => {
//     const { allWallets, fetchAllWallets, loading, error } = useUserWallet();
//     const { allWallet, fetchAllWallet } = useProvider();

//     useEffect(() => {
//         fetchAllWallets();
//     }, []);

//     useEffect(() => {
//         fetchAllWallet();
//     }, []);

//     const [activeTab, setActiveTab] = useState<"total" | "franchise" | "provider">("total");
//     const [currentPage, setCurrentPage] = useState(1);
//     const rowsPerPage = 10;

//     // ✅ Franchise total
//     const franchiseTotal = useMemo(() => {
//         if (!allWallets) return 0;
//         return allWallets.reduce((sum: number, w: any) => sum + (w.balance || 0), 0);
//     }, [allWallets]);

//     // ✅ Provider total
//     const providerTotal = useMemo(() => {
//         if (!allWallet) return 0;
//         return allWallet.reduce((sum: number, w: any) => sum + (w.balance || 0), 0);
//     }, [allWallet]);

//     const totalPayout = franchiseTotal + providerTotal;

//     // ✅ Collect only "Weekly auto-withdrawal" transactions
//     const transactions = useMemo(() => {
//         const franchiseTxns =
//             allWallets?.flatMap((w: any) =>
//                 w.transactions
//                     ?.filter((t: any) =>
//                         t.description?.includes("Weekly auto-withdrawal") ||
//                         t.description?.includes("The transfer has failed")
//                     )
//                     .map((t: any) => ({
//                         type: "franchise",
//                         amount: t.amount,
//                         description: t.description,
//                         method: t.method,
//                         status: t.status,
//                         createdAt: t.createdAt,
//                     }))
//             ) || [];

//         const providerTxns =
//             allWallet?.flatMap((w: any) =>
//                 w.transactions
//                     ?.filter((t: any) =>
//                         t.description?.includes("Weekly auto-withdrawal") ||
//                         t.description?.includes("The transfer has failed")
//                     )
//                     .map((t: any) => ({
//                         type: "provider",
//                         amount: t.amount,
//                         description: t.description,
//                         method: t.method,
//                         status: t.status,
//                         createdAt: t.createdAt,
//                     }))
//             ) || [];

//         return [...franchiseTxns, ...providerTxns];
//     }, [allWallets, allWallet]);

//     // ✅ Filter transactions by active tab
//     const filteredTransactions = useMemo(() => {
//         if (activeTab === "total") return transactions;
//         return transactions.filter((txn) => txn.type === activeTab);
//     }, [activeTab, transactions]);

//     // ✅ Pagination
//     const totalPages = Math.ceil(filteredTransactions.length / rowsPerPage);
//     const indexOfLastRow = currentPage * rowsPerPage;
//     const indexOfFirstRow = indexOfLastRow - rowsPerPage;
//     const currentRows = filteredTransactions.slice(indexOfFirstRow, indexOfLastRow);

//     // ✅ Table columns
//     const columnsWallet = [
//         { header: "S.No", accessor: "serial" },
//         { header: "Type", accessor: "type" },
//         { header: "Amount", accessor: "amount" },
//         {
//             header: "Description",
//             accessor: "description",
//             render: (row: WalletTransactionRow) => {
//                 if (!row.description) return "-";
//                 const maxLength = 25;
//                 return row.description.length <= maxLength
//                     ? row.description
//                     : row.description.slice(0, maxLength) + " ...";
//             }
//         },
//         { header: "Method", accessor: "method" },
//         {
//             header: 'Status',
//             accessor: 'status',
//             className: "w-28",
//             render: (row: WalletTransactionRow) => {
//                 let statusClass = "bg-gray-100 text-gray-700"; // default

//                 if (row.status === "success") {
//                     statusClass = "bg-green-100 text-green-700";
//                 } else if (row.status === "pending") {
//                     statusClass = "bg-blue-100 text-blue-700";
//                 } else if (row.status === "failed") {
//                     statusClass = "bg-red-100 text-red-700";
//                 }

//                 return (
//                     <span className={`px-2 py-1 rounded-full text-xs font-semibold ${statusClass}`}>
//                         {row.status}
//                     </span>
//                 );
//             },
//         }, { header: "Date", accessor: "createdAt" },
//     ];

//     // ✅ Table data with serial number
//     const transactionData = currentRows.map((txn, index) => {
//         const globalIndex = (currentPage - 1) * rowsPerPage + index;
//         const serial = filteredTransactions.length - globalIndex;
//         return {
//             serial,
//             type: txn.type || "-",
//             amount: `₹${txn.amount?.toLocaleString() || 0}`,
//             description: txn.description || "-",
//             method: txn.method || "-",
//             status: txn.status || "-",
//             createdAt: txn.createdAt ? new Date(txn.createdAt).toLocaleString() : "-",
//         };
//     });

//     // ✅ Excel Download
//     const handleDownload = () => {
//         if (!filteredTransactions.length) return;

//         const exportData = filteredTransactions.map((txn, index) => ({
//             "S.No": index + 1,
//             Type: txn.type,
//             Amount: txn.amount,
//             Description: txn.description,
//             Method: txn.method,
//             Status: txn.status,
//             Date: new Date(txn.createdAt).toLocaleString(),
//         }));

//         const worksheet = XLSX.utils.json_to_sheet(exportData);
//         const workbook = XLSX.utils.book_new();
//         XLSX.utils.book_append_sheet(workbook, worksheet, `${activeTab}-payouts`);
//         XLSX.writeFile(workbook, `${activeTab}-payouts.xlsx`);
//     };

//     // ✅ Summary cards
//     const summaryCards = [
//         {
//             title: "Franchise Payout",
//             amount: `₹${franchiseTotal.toFixed(2)}`,
//             icon: <FaWallet />,
//             gradient: "from-green-100 to-green-200",
//             textColor: "text-green-800",
//         },
//         {
//             title: "Provider Payout",
//             amount: `₹${providerTotal.toFixed(2)}`,
//             icon: <FaMoneyBillWave />,
//             gradient: "from-blue-100 to-blue-200",
//             textColor: "text-blue-800",
//         },
//         {
//             title: "Total Payout",
//             amount: `₹${totalPayout.toFixed(2)}`,
//             icon: <FaCashRegister />,
//             gradient: "from-red-100 to-red-200",
//             textColor: "text-red-800",
//         },
//     ];

//     if (loading) return <p>Loading wallets...</p>;
//     if (error) return <p>Error: {error}</p>;

//     return (
//         <div>
//             <PageBreadcrumb pageTitle="Payout Details" />
//             <div className="my-5">
//                 <ComponentCard title="Payout Details">
//                     <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
//                         {summaryCards.map((card) => (
//                             <div
//                                 key={card.title}
//                                 className={`bg-gradient-to-r ${card.gradient} ${card.textColor} p-6 rounded-xl shadow flex justify-between items-center`}
//                             >
//                                 <div className="text-3xl bg-white/40 p-3 rounded-full">
//                                     {card.icon}
//                                 </div>
//                                 <div className="text-right">
//                                     <div className="text-sm font-medium">{card.title}</div>
//                                     <div className="text-lg font-bold">{card.amount}</div>
//                                 </div>
//                             </div>
//                         ))}
//                     </div>
//                 </ComponentCard>

//                 <ComponentCard title="Payout Transactions" className="mt-8">
//                     {/* Tabs + Download */}
//                     <div className="flex justify-between items-center border-b border-gray-200 pb-2 mb-4">
//                         <ul className="flex space-x-6 text-sm font-medium text-center text-gray-500">
//                             {["total", "franchise", "provider"].map((tab) => (
//                                 <li
//                                     key={tab}
//                                     onClick={() => {
//                                         setActiveTab(tab as typeof activeTab);
//                                         setCurrentPage(1);
//                                     }}
//                                     className={`cursor-pointer px-4 py-2 ${activeTab === tab ? "border-b-2 border-blue-600 text-blue-600" : ""
//                                         }`}
//                                 >
//                                     {tab === "franchise"
//                                         ? "Franchise Payout"
//                                         : tab === "provider"
//                                             ? "Provider Payout"
//                                             : "Total Payout"}
//                                     <span className="ml-2 bg-red-500 text-white text-xs font-semibold px-2 py-0.5 rounded-full">
//                                         {tab === "total"
//                                             ? transactions.length
//                                             : transactions.filter((txn) => txn.type === tab).length}
//                                     </span>
//                                 </li>
//                             ))}
//                         </ul>

//                         <button
//                             onClick={handleDownload}
//                             className="flex items-center gap-2 px-4 py-2 text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 transition"
//                         >
//                             <FaFileDownload className="w-5 h-5" />
//                             <span>Download Excel</span>
//                         </button>
//                     </div>

//                     {/* Table + Pagination */}
//                     {filteredTransactions.length === 0 ? (
//                         <div className="text-gray-500 text-center py-10">No transactions found.</div>
//                     ) : (
//                         <>
//                             <BasicTableOne columns={columnsWallet} data={transactionData} />
//                             <div className="flex justify-center mt-4">
//                                 <Pagination
//                                     currentPage={currentPage}
//                                     totalItems={filteredTransactions.length}
//                                     totalPages={totalPages}
//                                     onPageChange={setCurrentPage}
//                                 />
//                             </div>
//                         </>
//                     )}
//                 </ComponentCard>
//             </div>
//         </div>
//     );
// };

// export default Page;


// "use client";

// import React, { useEffect, useState } from "react";
// import ComponentCard from "@/components/common/ComponentCard";
// import PageBreadcrumb from "@/components/common/PageBreadCrumb";
// import BasicTableOne from "@/components/tables/BasicTableOne";
// import Pagination from "@/components/tables/Pagination";
// import { FaFileDownload } from "react-icons/fa";
// import * as XLSX from "xlsx";

// interface PayoutRecord {
//   type: "provider" | "user";
//   providerId?: string;
//   userId?: string;
//   storeName?: string;
//   fullName?: string;
//   email: string;
//   phoneNo?: string;
//   mobileNumber?: string;
//   wallet: {
//     balance: number;
//     totalEarning?: number;
//     totalCredits?: number;
//     totalDebits?: number;
//     selfEarnings?: number;
//     referralEarnings?: number;
//   };
//   bankDetails?: {
//     accountNumber?: string;
//     ifsc?: string;
//     bankName?: string;
//     branchName?: string;
//   } | null;
// }

// const PayoutDetailsPage = () => {
//   const [payoutData, setPayoutData] = useState<PayoutRecord[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState("");
//   const [currentPage, setCurrentPage] = useState(1);
//   const rowsPerPage = 10;

//   // ✅ Fetch data from API
//   useEffect(() => {
//     const fetchPayouts = async () => {
//       try {
//         const res = await fetch(`/api/provider/payout/details?page=${currentPage}&limit=${rowsPerPage}`);
//         const data = await res.json();
//         if (data.success) {
//           setPayoutData(data.data);
//         } else {
//           setError("Failed to load payout details");
//         }
//       } catch (err: any) {
//         console.error(err);
//         setError("Error fetching payout data");
//       } finally {
//         setLoading(false);
//       }
//     };
//     fetchPayouts();
//   }, [currentPage]);

//   // ✅ Table Columns
//   const columns = [
//     { header: "S.No", accessor: "serial" },
//     { header: "Type", accessor: "type" },
//     { header: "Name", accessor: "name" },
//     { header: "Email", accessor: "email" },
//     { header: "Phone", accessor: "phone" },
//     { header: "Balance (₹)", accessor: "balance" },
//     { header: "Pending Payout (₹)", accessor: "pendingPayout" },
//     { header: "Bank Name", accessor: "bankName" },
//   ];

//   // ✅ Table Data
//   const tableData = payoutData.map((item, index) => ({
//     serial: (currentPage - 1) * rowsPerPage + index + 1,
//     type: item.type,
//     name: item.type === "user" ? item.fullName || "-" : item.storeName || "-",
//     email: item.email || "-",
//     phone: item.type === "user" ? item.mobileNumber || "-" : item.phoneNo || "-",
//     balance: item.wallet?.balance?.toFixed(2) || "0.00",
//     pendingPayout: (item.wallet?.balance || 0).toFixed(2),
//     bankName: item.bankDetails?.bankName || "-",
//   }));

//   // ✅ Excel Export
//   const handleDownload = () => {
//     if (!payoutData.length) return;
//     const exportData = payoutData.map((item, index) => ({
//       "S.No": index + 1,
//       Type: item.type,
//       Name: item.type === "user" ? item.fullName || "-" : item.storeName || "-",
//       Email: item.email || "-",
//       Phone: item.type === "user" ? item.mobileNumber || "-" : item.phoneNo || "-",
//       Balance: item.wallet?.balance?.toFixed(2) || "0.00",
//       "Pending Payout": item.wallet?.balance?.toFixed(2) || "0.00",
//       "Bank Name": item.bankDetails?.bankName || "-",
//       "Account Number": item.bankDetails?.accountNumber || "-",
//       IFSC: item.bankDetails?.ifsc || "-",
//       Branch: item.bankDetails?.branchName || "-",
//     }));

//     const worksheet = XLSX.utils.json_to_sheet(exportData);
//     const workbook = XLSX.utils.book_new();
//     XLSX.utils.book_append_sheet(workbook, worksheet, "Payout Details");
//     XLSX.writeFile(workbook, "payout-details.xlsx");
//   };

//   if (loading) return <p className="text-center py-10">Loading payout details...</p>;
//   if (error) return <p className="text-center text-red-600 py-10">{error}</p>;

//   return (
//     <div>
//       <PageBreadcrumb pageTitle="Payout Details" />
//       <div className="my-5">
//         <ComponentCard title="Payout Details">
//           {/* Download Button */}
//           <div className="flex justify-end mb-4">
//             <button
//               onClick={handleDownload}
//               className="flex items-center gap-2 px-4 py-2 text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 transition"
//             >
//               <FaFileDownload className="w-5 h-5" />
//               <span>Export Excel</span>
//             </button>
//           </div>

//           {/* Table */}
//           {payoutData.length === 0 ? (
//             <div className="text-gray-500 text-center py-10">No payout data found.</div>
//           ) : (
//             <>
//               <BasicTableOne columns={columns} data={tableData} />
//               <div className="flex justify-center mt-4">
//                 <Pagination
//                   currentPage={currentPage}
//                   totalItems={80} // if you know totalRecords from API, replace this with it
//                   totalPages={8} // or use data.totalPages if API returns it
//                   onPageChange={setCurrentPage}
//                 />
//               </div>
//             </>
//           )}
//         </ComponentCard>
//       </div>
//     </div>
//   );
// };

// export default PayoutDetailsPage;


"use client";

import React, { useEffect, useMemo, useState } from "react";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import ComponentCard from "@/components/common/ComponentCard";
import PayoutTransactions from "@/components/payout-details/PayoutTransactions";
import PayoutSummaryCards from "@/components/payout-details/PayoutSummaryCards";

interface PayoutRecord {
  type: "provider" | "user";
  providerId?: string;
  userId?: string;
  storeName?: string;
  fullName?: string;
  email: string;
  phoneNo?: string;
  mobileNumber?: string;
  wallet: {
    balance: number;
    totalEarning?: number;
    totalCredits?: number;
    totalDebits?: number;
    selfEarnings?: number;
    referralEarnings?: number;
  };
  bankDetails?: {
    accountNumber?: string;
    ifsc?: string;
    bankName?: string;
    branchName?: string;
  } | null;
}

const PayoutDetailsPage = () => {
  const [payoutData, setPayoutData] = useState<PayoutRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState<"total" | "user" | "provider">("total");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [filterTrigger, setFilterTrigger] = useState(0);
  const rowsPerPage = 10;

  // ✅ Fetch payout data
  useEffect(() => {
    const fetchPayouts = async () => {
      setLoading(true);
      try {
        let url =
          activeTab === "total"
            ? `/api/provider/payout/details?page=${currentPage}&limit=${rowsPerPage}`
            : `/api/provider/payout/details?type=${activeTab}&page=${currentPage}&limit=${rowsPerPage}`;

        if (startDate) url += `&startDate=${startDate}`;
        if (endDate) url += `&endDate=${endDate}`;

        const res = await fetch(url);
        const data = await res.json();
        if (data.success) {
          setPayoutData(data.data);
          setTotalPages(data.totalPages || 1);
          setTotalRecords(data.totalRecords || data.data.length);
        } else {
          setError("Failed to load payout details");
        }
      } catch (err: any) {
        console.error(err);
        setError("Error fetching payout data");
      } finally {
        setLoading(false);
      }
    };
    fetchPayouts();
  }, [activeTab, currentPage, filterTrigger]);

  console.log("payout data : ", payoutData)

  // ✅ Totals
  const userTotal = useMemo(
    () =>
      payoutData
        .filter((p) => p.type === "user")
        .reduce((sum, item) => sum + (item.wallet?.balance || 0), 0),
    [payoutData]
  );

  const providerTotal = useMemo(
    () =>
      payoutData
        .filter((p) => p.type === "provider")
        .reduce((sum, item) => sum + (item.wallet?.balance || 0), 0),
    [payoutData]
  );

  const totalPayout = userTotal + providerTotal;

  if (loading) return <p className="text-center py-10">Loading payout details...</p>;
  if (error) return <p className="text-center text-red-600 py-10">{error}</p>;

  return (
    <div>
      <PageBreadcrumb pageTitle="Payout Details" />

      <div className="my-5">
        {/* ✅ Child 1: Summary Cards */}
        <ComponentCard title="Payout Summary">
          <PayoutSummaryCards
          // userTotal={userTotal}
          // providerTotal={providerTotal}
          // totalPayout={totalPayout}
          />
        </ComponentCard>

        {/* ✅ Child 2: Transactions Table */}
        <ComponentCard title="Payout Transactions" className="mt-8">
          <PayoutTransactions
            payoutData={payoutData}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
            totalPages={totalPages}
            totalRecords={totalRecords}
            startDate={startDate}
            endDate={endDate}
            setStartDate={setStartDate}
            setEndDate={setEndDate}
            setFilterTrigger={setFilterTrigger}
          />
        </ComponentCard>
      </div>
    </div>
  );
};

export default PayoutDetailsPage;
