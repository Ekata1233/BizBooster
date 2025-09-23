// "use client";
// import React, { useEffect, useState } from "react";
// import PageBreadcrumb from "@/components/common/PageBreadCrumb";
// import ComponentCard from "@/components/common/ComponentCard";
// import BasicTableOne from "@/components/tables/BasicTableOne";
// import { TrashBinIcon, EyeIcon, ChevronDownIcon } from "@/icons";
// import Input from "@/components/form/input/InputField";
// import Label from "@/components/form/Label";
// import Select from "@/components/form/Select";
// import { useProvider } from "@/context/ProviderContext";
// import Pagination from "@/components/tables/Pagination";
// import { useModule } from "@/context/ModuleContext";
// import Link from "next/link";
// import axios from "axios";
// import { debounce } from "lodash";
// import Image from "next/image";

// interface ProviderTableData {
//   id: string;
//   fullName: string;
//   email: string;
//   phone: string;
//   storeName: string;
//   storePhone: string;
//   logo?: string;
//   city: string;
//   status: "Completed" | "Pending" | "Approved" | "Rejected";
//   isApproved: boolean;
//   isRejected: boolean;
//   step1Completed: boolean;
//   storeInfoCompleted: boolean;
//   kycCompleted: boolean;
// }

// const sortOptions = [
//   { value: "latest", label: "Latest" },
//   { value: "oldest", label: "Oldest" },
//   { value: "ascending", label: "A-Z (Name)" },
//   { value: "descending", label: "Z-A (Name)" },
// ];

// const statusOptions = [
//   { value: "all", label: "All Status" },
//   { value: "approved", label: "Approved" },
//   { value: "rejected", label: "Rejected" },
// ];

// const ProviderList = () => {
//   const { modules } = useModule();

//   const [selectedModule, setSelectedModule] = useState<string>("");
//   const [providers, setProviders] = useState<ProviderTableData[]>([]);
//   const [filteredProviders, setFilteredProviders] = useState<ProviderTableData[]>([]);
//   const [searchQuery, setSearchQuery] = useState("");
//   const [sort, setSort] = useState("latest");
//   const [statusFilter, setStatusFilter] = useState("all");
//   const [message, setMessage] = useState<string>("");
//   const [loading, setLoading] = useState(false);
//   const [activeTab, setActiveTab] = useState("all");
//   console.log("providerlist", providers);

//   const [currentPage, setCurrentPage] = useState(1);
//   const [rowsPerPage] = useState(10);

//   const fetchProviders = async () => {
//     setLoading(true);
//     try {
//       const response = await axios.get("/api/provider");
//       const data = response.data;

//       if (!Array.isArray(data) || data.length === 0) {
//         setProviders([]);
//         setFilteredProviders([]);
//         setMessage("No providers found");
//         setLoading(false);
//         return;
//       }

//       const updatedProviders = data.map((provider: any): ProviderTableData => {
//         const storeInfo = provider.storeInfo || {};
//         const isComplete =
//           provider.step1Completed && provider.storeInfoCompleted && provider.kycCompleted;

//         let status: "Completed" | "Pending" | "Approved" | "Rejected" = "Pending";
//         if (provider.isApproved) status = "Approved";
//         else if (provider.isRejected) status = "Rejected";
//         else if (isComplete) status = "Completed";

//         return {
//           id: provider._id,
//           fullName: provider.fullName,
//           email: provider.email,
//           phone: provider.phoneNo,
//           storeName: storeInfo.storeName || "-",
//           storePhone: storeInfo.storePhone || "-",
//           city: storeInfo.city || "-",
//           logo: storeInfo.logo || "",
//           isRejected: provider.isRejected || false,
//           isApproved: provider.isApproved || false,
//           status,
//           step1Completed: provider.step1Completed || false,
//           storeInfoCompleted: provider.storeInfoCompleted || false,
//           kycCompleted: provider.kycCompleted || false,
//         };
//       });

//       setProviders(updatedProviders);
//       setFilteredProviders(updatedProviders);
//       setMessage("");
//     } catch (error) {
//       console.error("Error fetching providers:", error);
//       setProviders([]);
//       setFilteredProviders([]);
//       setMessage("Something went wrong while fetching providers");
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchProviders();
//   }, []);

//   const sortProviders = (data: ProviderTableData[], sortOption: string) => {
//     const sorted = [...data];
//     switch (sortOption) {
//       case "oldest":
//         return sorted.reverse();
//       case "ascending":
//         return sorted.sort((a, b) => a.fullName.localeCompare(b.fullName));
//       case "descending":
//         return sorted.sort((a, b) => b.fullName.localeCompare(a.fullName));
//       default:
//         return sorted;
//     }
//   };

//   const getFilteredByTab = () => {
//     let result = [...providers];

//     if (activeTab !== "all") {
//       result = result.filter((p) => p.status.toLowerCase() === activeTab.toLowerCase());
//     }

//     if (searchQuery) {
//       const query = searchQuery.toLowerCase();
//       result = result.filter(
//         (p) =>
//           p.fullName.toLowerCase().includes(query) ||
//           p.email.toLowerCase().includes(query) ||
//           p.phone.toLowerCase().includes(query) ||
//           p.storeName.toLowerCase().includes(query) ||
//           p.city.toLowerCase().includes(query)
//       );
//     }

//     result = sortProviders(result, sort);
//     return result;
//   };

//   const handleSearchChange = debounce((value: string) => {
//     setSearchQuery(value);
//   }, 300);

//   const moduleOptions = [
//     { value: "", label: "All Modules" },
//     ...modules.map((module) => ({
//       value: module._id,
//       label: module.name,
//       image: module.image,
//     })),
//   ];

//   const columns = [
//     {
//       header: "S.No",
//       accessor: "serial",
//       render: (row: ProviderTableData) => {
//         const serial = filteredProviders.findIndex((u) => u.id === row.id) + 1;
//         return <span>{serial}</span>;
//       },
//     },
//     {
//       header: "Store Info",
//       accessor: "store",
//       render: (row: ProviderTableData) => (
//         <div className="flex items-center gap-3">
//           <div className="w-10 h-10 overflow-hidden rounded-full">
//             <Image
//               width={40}
//               height={40}
//               src={row.logo || "/default-logo.png"} // 👈 fallback if no logo
//               alt={row.storeName || "Store logo"}
//             />
//           </div>
//           <div>
//             <span className="block font-medium text-gray-800 text-theme-sm dark:text-white/90">
//               {row.storeName || "N/A"}
//             </span>
//             <span className="block text-xs text-gray-500 dark:text-gray-400">
//               {row.city || ""}
//             </span>
//             <span className="block text-xs text-gray-500 dark:text-gray-400">
//               {row.storePhone || ""}
//             </span>
//           </div>
//         </div>
//       ),
//     },

//     { header: "Name", accessor: "fullName" },
//     { header: "Email", accessor: "email" },
//     { header: "Phone", accessor: "phone" },

//     // { header: "Store Phone", accessor: "storePhone" },
//     { header: "City", accessor: "city" },
//     {
//       header: "Status",
//       accessor: "status",
//       render: (row: ProviderTableData) => {
//         const statusMap: any = {
//           Completed: "text-green-600 bg-green-100 border-green-300",
//           Pending: "text-yellow-500 bg-yellow-100 border-yellow-300",
//           Approved: "text-blue-600 bg-blue-100 border-blue-300",
//           Rejected: "text-red-600 bg-red-100 border-red-300",
//         };

//         return (
//           <span
//             className={`px-3 py-1 rounded-full text-sm font-semibold ${statusMap[row.status]} border`}
//           >
//             {row.status}
//           </span>
//         );
//       },
//     },
//     {
//       header: "Action",
//       accessor: "action",
//       render: (row: ProviderTableData) => (
//         <div className="flex gap-2">
//           <button
//             className="text-red-500 border border-red-500 rounded-md p-2 hover:bg-red-500 hover:text-white"
//             onClick={() => console.log("Delete provider", row.id)}
//           >
//             <TrashBinIcon />
//           </button>
//           <Link href={`/provider-management/provider-details/${row.id}`} passHref>
//             <button className="text-blue-500 border border-blue-500 rounded-md p-2 hover:bg-blue-500 hover:text-white">
//               <EyeIcon />
//             </button>
//           </Link>
//         </div>
//       ),
//     },
//   ];

//   return (
//     <div>
//       <PageBreadcrumb pageTitle="Provider List" />

//       <div className="my-5">
//         <ComponentCard title="Search Filter">
//           <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
//             <div>
//               <Label>Select Module</Label>
//               <div className="relative">
//                 <Select
//                   options={moduleOptions}
//                   value={selectedModule}
//                   placeholder="Select Module"
//                   onChange={(value: string) => setSelectedModule(value)}
//                   className="dark:bg-dark-900"
//                 />
//                 <span className="absolute text-gray-500 right-3 top-1/2 -translate-y-1/2">
//                   <ChevronDownIcon />
//                 </span>
//               </div>
//             </div>
//             <div>
//               <Label>Status</Label>
//               <div className="relative">
//                 <Select
//                   options={statusOptions}
//                   value={statusFilter}
//                   placeholder="Filter by Status"
//                   onChange={(value: string) => setStatusFilter(value)}
//                   className="dark:bg-dark-900"
//                 />
//                 <span className="absolute text-gray-500 right-3 top-1/2 -translate-y-1/2">
//                   <ChevronDownIcon />
//                 </span>
//               </div>
//             </div>
//             <div>
//               <Label>Sort By</Label>
//               <div className="relative">
//                 <Select
//                   options={sortOptions}
//                   value={sort}
//                   placeholder="Sort By"
//                   onChange={(value: string) => setSort(value)}
//                   className="dark:bg-dark-900"
//                 />
//                 <span className="absolute text-gray-500 right-3 top-1/2 -translate-y-1/2">
//                   <ChevronDownIcon />
//                 </span>
//               </div>
//             </div>
//             <div>
//               <Label>Search</Label>
//               <Input
//                 type="text"
//                 placeholder="Search by name, email, phone, etc."
//                 defaultValue={searchQuery}
//                 onChange={(e) => handleSearchChange(e.target.value)}
//               />
//             </div>
//           </div>
//         </ComponentCard>
//       </div>

//       <ComponentCard title="Provider List Table">
//         <div className="flex justify-between items-center border-b border-gray-200 pb-2">
//           <ul className="flex space-x-6 text-sm font-medium text-center text-gray-500">
//             {["all", "pending", "approved", "completed", "rejected"].map((tab) => (
//               <li
//                 key={tab}
//                 className={`cursor-pointer px-4 py-2 ${activeTab === tab ? "border-b-2 border-blue-600 text-blue-600" : ""
//                   }`}
//                 onClick={() => setActiveTab(tab)}
//               >
//                 {tab.charAt(0).toUpperCase() + tab.slice(1)}
//                 <span className="ml-2 bg-red-500 text-white text-xs font-semibold px-2 py-0.5 rounded-full">
//                   {providers.filter(
//                     (p) => tab === "all" || p.status.toLowerCase() === tab
//                   ).length}
//                 </span>
//               </li>
//             ))}
//           </ul>


//         </div>

//         {loading ? (
//           <div className="text-center py-8">Loading providers...</div>
//         ) : message ? (
//           <p className="text-red-500 text-center my-4">{message}</p>
//         ) : (
//           <BasicTableOne columns={columns} data={[...getFilteredByTab()].reverse()} />
//         )}
//       </ComponentCard>
//     </div>
//   );
// };

// export default ProviderList;



"use client";
import React, { useEffect, useState, useMemo } from "react";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import ComponentCard from "@/components/common/ComponentCard";
import BasicTableOne from "@/components/tables/BasicTableOne";
import Pagination from "@/components/tables/Pagination"; // 👈 same pagination
import { TrashBinIcon, EyeIcon, ChevronDownIcon } from "@/icons";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import Select from "@/components/form/Select";
import { useProvider } from "@/context/ProviderContext";
import { useModule } from "@/context/ModuleContext";
import Link from "next/link";
import axios from "axios";
import { debounce } from "lodash";
import Image from "next/image";

interface ProviderTableData {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  storeName: string;
  storePhone: string;
  logo?: string;
  city: string;
  status: "Completed" | "Pending" | "Approved" | "Rejected";
  isApproved: boolean;
  isRejected: boolean;
  step1Completed: boolean;
  storeInfoCompleted: boolean;
  kycCompleted: boolean;
}

const sortOptions = [
  { value: "latest", label: "Latest" },
  { value: "oldest", label: "Oldest" },
  { value: "ascending", label: "A-Z (Name)" },
  { value: "descending", label: "Z-A (Name)" },
];

const statusOptions = [
  { value: "all", label: "All Status" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
];

const ProviderList = () => {
  const { modules } = useModule();

  const [selectedModule, setSelectedModule] = useState<string>("");
  const [providers, setProviders] = useState<ProviderTableData[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [sort, setSort] = useState("latest");
  const [statusFilter, setStatusFilter] = useState("all");
  const [message, setMessage] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("all");

  // ✅ Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage] = useState(10);

  const fetchProviders = async () => {
    setLoading(true);
    try {
      const response = await axios.get("/api/provider");
      const data = response.data;

      if (!Array.isArray(data) || data.length === 0) {
        setProviders([]);
        setMessage("No providers found");
        setLoading(false);
        return;
      }

      const updatedProviders = data.map((provider: any): ProviderTableData => {
        const storeInfo = provider.storeInfo || {};
        const isComplete =
          provider.step1Completed &&
          provider.storeInfoCompleted &&
          provider.kycCompleted;

        let status: "Completed" | "Pending" | "Approved" | "Rejected" = "Pending";
        if (provider.isApproved) status = "Approved";
        else if (provider.isRejected) status = "Rejected";
        else if (isComplete) status = "Completed";

        return {
          id: provider._id,
          fullName: provider.fullName,
          email: provider.email,
          phone: provider.phoneNo,
          storeName: storeInfo.storeName || "-",
          storePhone: storeInfo.storePhone || "-",
          city: storeInfo.city || "-",
          logo: storeInfo.logo || "",
          isRejected: provider.isRejected || false,
          isApproved: provider.isApproved || false,
          status,
          step1Completed: provider.step1Completed || false,
          storeInfoCompleted: provider.storeInfoCompleted || false,
          kycCompleted: provider.kycCompleted || false,
        };
      });

      setProviders(updatedProviders);
      setMessage("");
    } catch (error) {
      console.error("Error fetching providers:", error);
      setProviders([]);
      setMessage("Something went wrong while fetching providers");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProviders();
  }, []);

  const sortProviders = (data: ProviderTableData[], sortOption: string) => {
    const sorted = [...data];
    switch (sortOption) {
      case "oldest":
        return sorted.reverse();
      case "ascending":
        return sorted.sort((a, b) => a.fullName.localeCompare(b.fullName));
      case "descending":
        return sorted.sort((a, b) => b.fullName.localeCompare(a.fullName));
      default:
        return sorted;
    }
  };

  // ✅ Memoized filtered + sorted data
  const filteredProviders = useMemo(() => {
    let result = [...providers];

    if (activeTab !== "all") {
      result = result.filter(
        (p) => p.status.toLowerCase() === activeTab.toLowerCase()
      );
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p.fullName.toLowerCase().includes(query) ||
          p.email.toLowerCase().includes(query) ||
          p.phone.toLowerCase().includes(query) ||
          p.storeName.toLowerCase().includes(query) ||
          p.city.toLowerCase().includes(query)
      );
    }

    result = sortProviders(result, sort);
    return result;
  }, [providers, activeTab, searchQuery, sort]);

  // ✅ Pagination logic
  const totalPages = Math.ceil(filteredProviders.length / rowsPerPage);
  const indexOfLastRow = currentPage * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;
  const currentRows = filteredProviders.slice(indexOfFirstRow, indexOfLastRow);

  // Reset page on filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, searchQuery, sort]);

  const handleSearchChange = debounce((value: string) => {
    setSearchQuery(value);
  }, 300);

  const moduleOptions = [
    { value: "", label: "All Modules" },
    ...modules.map((module) => ({
      value: module._id,
      label: module.name,
      image: module.image,
    })),
  ];

  const columns = [
    {
      header: "S.No",
      accessor: "serial",
      render: (row: ProviderTableData) => {
        const serial =
          filteredProviders.findIndex((u) => u.id === row.id) + 1;
        return <span>{serial}</span>;
      },
    },
    {
      header: "Store Info",
      accessor: "store",
      render: (row: ProviderTableData) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 overflow-hidden rounded-full">
            <Image
              width={40}
              height={40}
              src={row.logo || "/default-logo.png"}
              alt={row.storeName || "Store logo"}
            />
          </div>
          <div>
            <span className="block font-medium text-gray-800 text-theme-sm dark:text-white/90">
              {row.storeName || "N/A"}
            </span>
            <span className="block text-xs text-gray-500 dark:text-gray-400">
              {row.city || ""}
            </span>
            <span className="block text-xs text-gray-500 dark:text-gray-400">
              {row.storePhone || ""}
            </span>
          </div>
        </div>
      ),
    },
    { header: "Name", accessor: "fullName" },
    { header: "Email", accessor: "email" },
    { header: "Phone", accessor: "phone" },
    { header: "City", accessor: "city" },
    {
      header: "Status",
      accessor: "status",
      render: (row: ProviderTableData) => {
        const statusMap: any = {
          Completed: "text-green-600 bg-green-100 border-green-300",
          Pending: "text-yellow-500 bg-yellow-100 border-yellow-300",
          Approved: "text-blue-600 bg-blue-100 border-blue-300",
          Rejected: "text-red-600 bg-red-100 border-red-300",
        };
        return (
          <span
            className={`px-3 py-1 rounded-full text-sm font-semibold ${statusMap[row.status]} border`}
          >
            {row.status}
          </span>
        );
      },
    },
    {
      header: "Action",
      accessor: "action",
      render: (row: ProviderTableData) => (
        <div className="flex gap-2">
          <button
            className="text-red-500 border border-red-500 rounded-md p-2 hover:bg-red-500 hover:text-white"
            onClick={() => console.log("Delete provider", row.id)}
          >
            <TrashBinIcon />
          </button>
          <Link href={`/provider-management/provider-details/${row.id}`} passHref>
            <button className="text-blue-500 border border-blue-500 rounded-md p-2 hover:bg-blue-500 hover:text-white">
              <EyeIcon />
            </button>
          </Link>
        </div>
      ),
    },
  ];

  return (
    <div>
      <PageBreadcrumb pageTitle="Provider List" />

      {/* Search Filters ... */}

      <ComponentCard title="Provider List Table">
        <div className="flex justify-between items-center border-b border-gray-200 pb-2">
          <ul className="flex space-x-6 text-sm font-medium text-center text-gray-500">
            {["all", "pending", "approved", "completed", "rejected"].map((tab) => (
              <li
                key={tab}
                className={`cursor-pointer px-4 py-2 ${
                  activeTab === tab ? "border-b-2 border-blue-600 text-blue-600" : ""
                }`}
                onClick={() => setActiveTab(tab)}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
                <span className="ml-2 bg-red-500 text-white text-xs font-semibold px-2 py-0.5 rounded-full">
                  {providers.filter(
                    (p) => tab === "all" || p.status.toLowerCase() === tab
                  ).length}
                </span>
              </li>
            ))}
          </ul>
        </div>

        {loading ? (
          <div className="text-center py-8">Loading providers...</div>
        ) : message ? (
          <p className="text-red-500 text-center my-4">{message}</p>
        ) : (
          <>
            <BasicTableOne columns={columns} data={currentRows} />
            <div className="flex justify-center mt-4">
              <Pagination
                currentPage={currentPage}
                totalItems={filteredProviders.length}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
              />
            </div>
          </>
        )}
      </ComponentCard>
    </div>
  );
};

export default ProviderList;
