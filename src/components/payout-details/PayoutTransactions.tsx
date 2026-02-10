// "use client";

// import React from "react";
// import BasicTableOne from "@/components/tables/BasicTableOne";
// import Pagination from "@/components/tables/Pagination";
// import { FaFileDownload, FaFilter } from "react-icons/fa";
// import * as XLSX from "xlsx";

// interface PayoutTransactionsProps {
//   payoutData: any[];
//   activeTab: "total" | "user" | "provider";
//   setActiveTab: React.Dispatch<React.SetStateAction<"total" | "user" | "provider">>;
//   currentPage: number;
//   setCurrentPage: React.Dispatch<React.SetStateAction<number>>;
//   totalPages: number;
//   totalRecords: number;
//   startDate: string;
//   endDate: string;
//   setStartDate: React.Dispatch<React.SetStateAction<string>>;
//   setEndDate: React.Dispatch<React.SetStateAction<string>>;
//   setFilterTrigger: React.Dispatch<React.SetStateAction<number>>; 
// }

// const PayoutTransactions: React.FC<PayoutTransactionsProps> = ({
//   payoutData,
//   activeTab,
//   setActiveTab,
//   currentPage,
//   setCurrentPage,
//   totalPages,
//   totalRecords,
//   startDate,
//   endDate,
//   setStartDate,
//   setEndDate,
//   setFilterTrigger
// }) => {
//   const rowsPerPage = 10;


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
//     pendingPayout: item.wallet?.pendingWithdraw?.toFixed(2) || "0.00",
//     bankName: item.bankDetails?.bankName || "-",
//   }));

//   // ✅ Excel Download
//   const handleDownload = () => {
//     if (!payoutData.length) return;

//     const exportData = payoutData.map((item, index) => ({
//       "S.No": index + 1,
//       Type: item.type,
//       Name: item.type === "user" ? item.fullName || "-" : item.storeName || "-",
//       Email: item.email || "-",
//       Phone: item.type === "user" ? item.mobileNumber || "-" : item.phoneNo || "-",
//       Balance: item.wallet?.balance?.toFixed(2) || "0.00",
//       "Pending Payout": item.wallet?.pendingWithdraw?.toFixed(2) || "0.00",
//       "Bank Name": item.bankDetails?.bankName || "-",
//       "Account Number": item.bankDetails?.accountNumber || "-",
//       IFSC: item.bankDetails?.ifsc || "-",
//       Branch: item.bankDetails?.branchName || "-",
//     }));

//     const worksheet = XLSX.utils.json_to_sheet(exportData);
//     const workbook = XLSX.utils.book_new();
//     XLSX.utils.book_append_sheet(workbook, worksheet, `${activeTab}-payouts`);
//     XLSX.writeFile(workbook, `${activeTab}-payouts.xlsx`);
//   };
//   const [tempStartDate, setTempStartDate] = React.useState(startDate);
//   const [tempEndDate, setTempEndDate] = React.useState(endDate);

//   const handleFilter = () => {
//     setStartDate(tempStartDate);
//     setEndDate(tempEndDate);
//     setCurrentPage(1);
//     setFilterTrigger(prev => prev + 1);
//   };

//   return (
//     <>
//       {/* ✅ Filters & Export Section */}
//       <div className="flex flex-wrap justify-between items-center bg-white p-4 border border-gray-200 rounded-xl shadow-sm mb-6">
//         {/* 📅 Date Filters */}
//         <div className="flex flex-wrap items-center gap-3">
//           <div className="flex items-center gap-2">
//             <label className="text-sm font-medium text-gray-600">Start Date:</label>
//             <input
//               type="date"
//               value={tempStartDate}
//               onChange={(e) => setTempStartDate(e.target.value)}
//               className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
//             />
//           </div>

//           <div className="flex items-center gap-2">
//             <label className="text-sm font-medium text-gray-600">End Date:</label>
//             <input
//               type="date"
//               value={tempEndDate}
//               onChange={(e) => setTempEndDate(e.target.value)}
//               className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
//             />
//           </div>

//           <button
//             onClick={handleFilter}
//             className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 transition-all"
//           >
//             <FaFilter /> Filter
//           </button>
//         </div>

//         {/* 📤 Export Excel */}
//         <button
//           onClick={handleDownload}
//           className="flex items-center gap-2 text-blue-600 border border-blue-600 px-4 py-2 rounded-lg text-sm hover:bg-blue-50 transition-all"
//         >
//           <FaFileDownload className="w-5 h-5" />
//           Export Excel
//         </button>
//       </div>

//       {/* 📤 Export Excel */}
//       {/* <button
//           onClick={handleDownload}
//           className="flex items-center gap-2 text-blue-600 border border-blue-600 px-4 py-2 rounded-lg text-sm hover:bg-blue-50 transition-all"
//         >
//           <FaFileDownload className="w-5 h-5" />
//           Export Excel
//         </button>
//       </div> */}

//       {/* ✅ Tabs Section */}
//       <div className="flex mb-6 border-b border-gray-200">
//         <ul className="flex space-x-6 text-sm font-medium text-gray-600">
//           {["total", "user", "provider"].map((tab) => (
//             <li
//               key={tab}
//               onClick={() => {
//                 setActiveTab(tab as typeof activeTab);
//                 setCurrentPage(1);
//               }}
//               className={`cursor-pointer px-4 py-2 transition-all ${activeTab === tab
//                 ? "border-b-2 border-blue-600 text-blue-600 font-semibold"
//                 : "hover:text-blue-600"
//                 }`}
//             >
//               {tab === "user"
//                 ? "User Payout"
//                 : tab === "provider"
//                   ? "Provider Payout"
//                   : "Total Payout"}
//             </li>
//           ))}
//         </ul>
//       </div>


//       {/* Table + Pagination */}
//       {payoutData.length === 0 ? (
//         <div className="text-gray-500 text-center py-10">No payout data found.</div>
//       ) : (
//         <>
//           <BasicTableOne columns={columns} data={tableData} />
//           <div className="flex justify-center mt-4">
//             <Pagination
//               currentPage={currentPage}
//               totalItems={totalRecords}
//               totalPages={totalPages}
//               onPageChange={setCurrentPage}
//             />
//           </div>
//         </>
//       )}
//     </>
//   );
// };

// export default PayoutTransactions;


"use client";

import React, { useState, useEffect } from "react";
import BasicTableOne from "@/components/tables/BasicTableOne";
import Pagination from "@/components/tables/Pagination";
import { FaFileDownload, FaFilter, FaCheckCircle } from "react-icons/fa";
import * as XLSX from "xlsx";

interface PayoutTransactionsProps {
  payoutData: any[];
  activeTab: "total" | "user" | "provider";
  setActiveTab: React.Dispatch<React.SetStateAction<"total" | "user" | "provider">>;
  currentPage: number;
  setCurrentPage: React.Dispatch<React.SetStateAction<number>>;
  totalPages: number;
  totalRecords: number;
  startDate: string;
  endDate: string;
  setStartDate: React.Dispatch<React.SetStateAction<string>>;
  setEndDate: React.Dispatch<React.SetStateAction<string>>;
  setFilterTrigger: React.Dispatch<React.SetStateAction<number>>;
}

const PayoutTransactions: React.FC<PayoutTransactionsProps> = ({
  payoutData,
  activeTab,
  setActiveTab,
  currentPage,
  setCurrentPage,
  totalPages,
  totalRecords,
  startDate,
  endDate,
  setStartDate,
  setEndDate,
  setFilterTrigger,
}) => {
  const rowsPerPage = 10;

  // state
  const [selectedIds, setSelectedIds] = useState<string[]>([]); // will store weeklyPayout._id
  const [weeks, setWeeks] = useState<{ weekStart: string; weekEnd: string }[]>([]);
  const [selectedWeek, setSelectedWeek] = useState<string>("");

  console.log("seelected week L : ", selectedWeek)

  // Build unique weeks from payoutData -> item.weeklyPayout.weekStart/weekEnd
  useEffect(() => {
    const map = new Map<string, { weekStart: string; weekEnd: string }>();
    for (const item of payoutData) {
      if (Array.isArray(item.weeklyPayouts)) {
        for (const wp of item.weeklyPayouts) {
          if (wp?.weekStart && wp?.weekEnd && !map.has(wp.weekStart)) {
            map.set(wp.weekStart, { weekStart: wp.weekStart, weekEnd: wp.weekEnd });
          }
        }
      }
    }
    // Sort by weekStart descending (latest first)
    const sortedWeeks = Array.from(map.values()).sort(
      (a, b) => new Date(b.weekStart).getTime() - new Date(a.weekStart).getTime()
    );
    setWeeks(sortedWeeks);
  }, []);

  // set start/end when user selects week
  useEffect(() => {
    const wk = weeks.find((w) => w.weekStart === selectedWeek);
    if (wk) {
      setStartDate(wk.weekStart);
      setEndDate(wk.weekEnd);
    } else {
      setStartDate("");
      setEndDate("");
    }
    setSelectedIds([]);
    // no filterTrigger here to avoid infinite loop
  }, [selectedWeek]);


  // Table columns (checkbox column first)
  const columns = [
    { header: "", accessor: "select" }, // checkbox
    { header: "S.No", accessor: "serial" },
    { header: "Type", accessor: "type" },
    // { header: "Name", accessor: "name" },
    // { header: "Email", accessor: "email" },
    // { header: "Phone", accessor: "phone" },
    {
      header: "User Info",
      accessor: "userInfo",
      render: (row: any) => (
        <div className="flex flex-col">
          <span className="font-medium text-gray-800 dark:text-white/90">
            {row.name || "-"}
          </span>
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {row.email || "-"}
          </span>
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {row.phone || "-"}
          </span>
        </div>
      ),
    },
    { header: "Balance (₹)", accessor: "balance" },
    { header: "Pending Payout (₹)", accessor: "pendingPayout" },
    { header: "Bank Name", accessor: "bankName" },
  ];

  // Helper to safely format date string
  const formatDate = (iso?: string) => {
    if (!iso) return "-";
    const d = new Date(iso);
    if (isNaN(d.getTime())) return "-";
    return d.toLocaleDateString();
  };

  // Table data: checkbox enabled only if weeklyPayout exists and its weekStart === selectedWeek (or if no week selected allow all)
  const tableData = payoutData.map((item, index) => {
    const wpArray = Array.isArray(item.weeklyPayouts) ? item.weeklyPayouts : [];
    const wp =
      selectedWeek
        ? wpArray.find(w => w.weekStart === selectedWeek)
        : wpArray.sort((a, b) => new Date(b.weekStart).getTime() - new Date(a.weekStart).getTime())[0];

    const belongsToSelectedWeek = wp && wp.weekStart && selectedWeek   ? wp.weekStart === selectedWeek : !!wp;
    const payoutId = wp?._id || ""; // weekly payout doc id

    return {
      select: (
        <input
          type="checkbox"
          disabled={!wp || (selectedWeek ? wp.weekStart !== selectedWeek : false)}
          checked={selectedIds.includes(payoutId)}
          onChange={(e) => {
            if (!payoutId) return;
            setSelectedIds((prev) =>
              e.target.checked ? [...prev, payoutId] : prev.filter((id) => id !== payoutId)
            );
          }}
        />
      ),
      serial: (currentPage - 1) * rowsPerPage + index + 1,
      type: item.type,
      name: item.type === "user" ? item.fullName || "-" : item.storeName || "-",
      email: item.type === "user" ? item.email || "-" : item.storeEmail || "-",
      phone: item.type === "user" ? item.mobileNumber || "-" : item.storePhone || "-",
      balance: item.wallet?.balance != null ? Number(item.wallet.balance).toFixed(2) : "0.00",
      pendingPayout: (() => {
        const wpArray = Array.isArray(item.weeklyPayouts) ? item.weeklyPayouts : [];

        if (!selectedWeek || selectedWeek.trim() === "") {
          return item.wallet?.pendingWithdraw != null
            ? Number(item.wallet.pendingWithdraw).toFixed(2)
            : "0.00";
        }
        // Find the payout for the selected week, or use latest if no week selected
        const wp = selectedWeek
          ? wpArray.find((w) => w.weekStart === selectedWeek)
          : wpArray.sort(
            (a, b) => new Date(b.weekStart).getTime() - new Date(a.weekStart).getTime()
          )[0];

        if (wp && wp.pendingWithdraw != null) {
          return Number(wp.pendingWithdraw).toFixed(2);
        } else if (!selectedWeek && item.wallet?.pendingWithdraw != null) {
          return Number(item.wallet.pendingWithdraw).toFixed(2);
        } else {
          return "0.00";
        }
      })(),
      bankName: item.bankDetails?.bankName || "-",
      weekRange: wp ? `${formatDate(wp.weekStart)} - ${formatDate(wp.weekEnd)}` : "-",
      // for convenience if you need the raw weekStart/ID later:
      _meta: { payoutId, weekStart: wp?.weekStart },
      belongsToSelectedWeek,
    };
  });

  // Excel export (filtered by selectedWeek)
  const handleDownload = () => {
    if (!payoutData.length) return;

    // Filter payoutData based on selectedWeek
    const filteredData = payoutData.filter((item) => {
      if (!selectedWeek) return true; // All weeks selected
      if (!Array.isArray(item.weeklyPayouts)) return false;
      return item.weeklyPayouts.some((wp) => wp.weekStart === selectedWeek);
    });

    if (filteredData.length === 0) {
      alert("No payout data found for the selected week.");
      return;
    }

    // Build export data based on week filter
    const exportData = filteredData.map((item, index) => {
      const wpArray = Array.isArray(item.weeklyPayouts) ? item.weeklyPayouts : [];
      const wp = selectedWeek
        ? wpArray.find((w) => w.weekStart === selectedWeek)
        : wpArray.sort(
          (a, b) => new Date(b.weekStart).getTime() - new Date(a.weekStart).getTime()
        )[0];

      return {
        "S.No": index + 1,
        Type: item.type,
        Name: item.type === "user" ? item.fullName || "-" : item.storeName || "-",
        Email: item.type === "user" ? item.email || "-" : item.storeEmail || "-",
        Phone: item.type === "user" ? item.mobileNumber || "-" : item.storePhone || "-",
        Balance:
          item.wallet?.balance != null
            ? Number(item.wallet.balance).toFixed(2)
            : "0.00",
        "Pending Payout":
          wp?.pendingWithdraw != null
            ? Number(wp.pendingWithdraw).toFixed(2)
            : item.wallet?.pendingWithdraw != null
              ? Number(item.wallet.pendingWithdraw).toFixed(2)
              : "0.00",
        "Bank Name": item.bankDetails?.bankName || "-",
        "Account Number": item.bankDetails?.accountNumber || "-",
        IFSC: item.bankDetails?.ifsc || "-",
        Branch: item.bankDetails?.branchName || "-",
        Week: wp
          ? `${formatDate(wp.weekStart)} - ${formatDate(wp.weekEnd)}`
          : "-",
      };
    });

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(
      workbook,
      worksheet,
      `${activeTab}-payouts${selectedWeek ? "-filtered" : ""}`
    );
    XLSX.writeFile(
      workbook,
      `${activeTab}-payouts${selectedWeek ? "-filtered" : ""}.xlsx`
    );
  };


  // Submit payout update: send selected weeklyPayout IDs and selectedWeek (optional)
  const handleSubmitPayout = async () => {
    if (selectedIds.length === 0) return alert("Please select at least one record.");
    if (!selectedWeek) return alert("Please select a week.");

    if (!confirm("Are you sure you want to mark selected payouts as withdrawn?")) return;

    try {
      const res = await fetch("/api/payout/mannual-payout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ selectedIds, weekStart: selectedWeek }),
      });

      console.log("res of the mannual payout : ", res)

      const data = await res.json();
      console.log("data of the mannual payout : ", data)

      if (data.success) {
        alert(`✅ ${data.count} payout(s) marked as withdrawn.`);
        setSelectedIds([]);
        setFilterTrigger((p) => p + 1);
      } else {
        alert(`❌ ${data.message || "Failed to update payouts."}`);
      }
    } catch (err) {
      console.error(err);
      alert("Error updating payouts");
    }
  };

  return (
    <>
      {/* Filters & Export Section: only week filter + actions */}
      <div className="flex flex-wrap justify-between items-center bg-white p-4 border border-gray-200 rounded-xl shadow-sm mb-6">
        <div className="flex items-center gap-3">
          <select
            value={selectedWeek}
            onChange={(e) => setSelectedWeek(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
          >
            <option value="">All weeks</option>
            {weeks.map((week, i) => (
              <option key={i} value={week.weekStart}>
                {formatDate(week.weekStart)} - {formatDate(week.weekEnd)}
              </option>
            ))}
          </select>

          {/* <button
            onClick={() => {
              setFilterTrigger((p) => p + 1);
            }}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700"
          >
            <FaFilter /> Apply
          </button> */}

        </div>

        <div className="flex gap-3">
          <button
            onClick={handleDownload}
            className="flex items-center gap-2 text-blue-600 border border-blue-600 px-4 py-2 rounded-lg text-sm hover:bg-blue-50"
          >
            <FaFileDownload className="w-5 h-5" />
            Export Excel
          </button>

          <button
            onClick={handleSubmitPayout}
            className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-green-700"
          >
            <FaCheckCircle /> Submit Payout
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex mb-6 border-b border-gray-200">
        <ul className="flex space-x-6 text-sm font-medium text-gray-600">
          {["total", "user", "provider"].map((tab) => (
            <li
              key={tab}
              onClick={() => {
                setActiveTab(tab as typeof activeTab);
                setCurrentPage(1);
              }}
              className={`cursor-pointer px-4 py-2 transition-all ${activeTab === tab
                ? "border-b-2 border-blue-600 text-blue-600 font-semibold"
                : "hover:text-blue-600"
                }`}
            >
              {tab === "user" ? "User Payout" : tab === "provider" ? "Provider Payout" : "Total Payout"}
            </li>
          ))}
        </ul>
      </div>

      {/* Table + Pagination */}
      {payoutData.length === 0 ? (
        <div className="text-gray-500 text-center py-10">No payout data found.</div>
      ) : (
        <>
          <BasicTableOne columns={columns} data={tableData} />
          <div className="flex justify-center mt-4">
            <Pagination
              currentPage={currentPage}
               totalItems={totalPages * rowsPerPage}
              // totalPages={totalPages}
               onPageChange={(page) => setCurrentPage(page)}
            />
          </div>
        </>
      )}
    </>
  );
};

export default PayoutTransactions;

