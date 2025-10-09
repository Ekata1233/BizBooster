// 'use client';

// import React, { useEffect, useState, useMemo } from "react";
// import { useProvider } from "@/context/ProviderContext";
// import PageBreadcrumb from "@/components/common/PageBreadCrumb";
// import ComponentCard from "@/components/common/ComponentCard";
// import BasicTableOne from "@/components/tables/BasicTableOne";
// import Pagination from "@/components/tables/Pagination";
// import { TrashBinIcon, EyeIcon } from "@/icons";
// import Input from "@/components/form/input/InputField";
// import Label from "@/components/form/Label";
// import Link from "next/link";
// import { debounce } from "lodash";
// import Image from "next/image";

// interface ProviderTableData {
//     id: string;
//     fullName: string;
//     email: string;
//     phone: string;
//     storeName: string;
//     storePhone: string;
//     logo?: string;
//     city: string;
//     status: "Completed" | "Pending" | "Approved" | "Rejected";
//     isApproved: boolean;
//     isRejected: boolean;
//     step1Completed: boolean;
//     storeInfoCompleted: boolean;
//     kycCompleted: boolean;
// }

// export default function PaymentAdjustment() {
//     const { getAllProviders, deleteProvider, loading } = useProvider(); // 👈 use context
//     const [providers, setProviders] = useState<ProviderTableData[]>([]);
//     const [message, setMessage] = useState("");
//     const [searchQuery, setSearchQuery] = useState("");
//     const [sort, setSort] = useState("latest");
//     const [activeTab, setActiveTab] = useState("all");
//     const [currentPage, setCurrentPage] = useState(1);
//     const [rowsPerPage] = useState(10);

//     // 🧭 Replaces fetchProviders
//     const loadProviders = async () => {
//         const data = await getAllProviders();
//         if (!Array.isArray(data) || data.length === 0) {
//             setProviders([]);
//             setMessage("No providers found");
//             return;
//         }

//         const updatedProviders = data.map((provider: any): ProviderTableData => {
//             const storeInfo = provider.storeInfo || {};
//             const isComplete =
//                 provider.step1Completed &&
//                 provider.storeInfoCompleted &&
//                 provider.kycCompleted;

//             let status: "Completed" | "Pending" | "Approved" | "Rejected" = "Pending";
//             if (provider.isApproved) status = "Approved";
//             else if (provider.isRejected) status = "Rejected";
//             else if (isComplete) status = "Completed";

//             return {
//                 id: provider._id,
//                 fullName: provider.fullName,
//                 email: provider.email,
//                 phone: provider.phoneNo,
//                 storeName: storeInfo.storeName || "-",
//                 storePhone: storeInfo.storePhone || "-",
//                 city: storeInfo.city || "-",
//                 logo: storeInfo.logo || "",
//                 isRejected: provider.isRejected || false,
//                 isApproved: provider.isApproved || false,
//                 status,
//                 step1Completed: provider.step1Completed || false,
//                 storeInfoCompleted: provider.storeInfoCompleted || false,
//                 kycCompleted: provider.kycCompleted || false,
//             };
//         });

//         setProviders(updatedProviders);
//         setMessage("");
//     };

//     useEffect(() => {
//         loadProviders();
//     }, []);

//     const sortProviders = (data: ProviderTableData[], sortOption: string) => {
//         const sorted = [...data];
//         switch (sortOption) {
//             case "oldest":
//                 return sorted.reverse();
//             case "ascending":
//                 return sorted.sort((a, b) => a.fullName.localeCompare(b.fullName));
//             case "descending":
//                 return sorted.sort((a, b) => b.fullName.localeCompare(a.fullName));
//             default:
//                 return sorted;
//         }
//     };

//     const filteredProviders = useMemo(() => {
//         let result = [...providers];

//         if (activeTab !== "all") {
//             result = result.filter(
//                 (p) => p.status.toLowerCase() === activeTab.toLowerCase()
//             );
//         }

//         if (searchQuery) {
//             const query = searchQuery.toLowerCase();
//             result = result.filter(
//                 (p) =>
//                     p.fullName.toLowerCase().includes(query) ||
//                     p.email.toLowerCase().includes(query) ||
//                     p.phone.toLowerCase().includes(query) ||
//                     p.storeName.toLowerCase().includes(query) ||
//                     p.city.toLowerCase().includes(query)
//             );
//         }

//         result = sortProviders(result, sort);
//         return result;
//     }, [providers, activeTab, searchQuery, sort]);

//     const totalPages = Math.ceil(filteredProviders.length / rowsPerPage);
//     const indexOfLastRow = currentPage * rowsPerPage;
//     const indexOfFirstRow = indexOfLastRow - rowsPerPage;
//     const currentRows = filteredProviders.slice(indexOfFirstRow, indexOfLastRow);

//     useEffect(() => {
//         setCurrentPage(1);
//     }, [activeTab, searchQuery, sort]);

//     const handleSearchChange = debounce((value: string) => {
//         setSearchQuery(value);
//     }, 300);

//     const columns = [
//         {
//             header: "S.No",
//             accessor: "serial",
//             render: (row: ProviderTableData) => {
//                 const serial =
//                     filteredProviders.findIndex((u) => u.id === row.id) + 1;
//                 return <span>{serial}</span>;
//             },
//         },
//         {
//             header: "Store Info",
//             accessor: "store",
//             render: (row: ProviderTableData) => (
//                 <div className="flex items-center gap-3">
//                     <div className="w-10 h-10 overflow-hidden rounded-full">
//                         <Image
//                             width={40}
//                             height={40}
//                             src={row.logo || "/default-logo.png"}
//                             alt={row.storeName || "Store logo"}
//                         />
//                     </div>
//                     <div>
//                         <span className="block font-medium text-gray-800 text-theme-sm dark:text-white/90">
//                             {row.storeName || "N/A"}
//                         </span>
//                         <span className="block text-xs text-gray-500 dark:text-gray-400">
//                             {row.city || ""}
//                         </span>
//                         <span className="block text-xs text-gray-500 dark:text-gray-400">
//                             {row.storePhone || ""}
//                         </span>
//                     </div>
//                 </div>
//             ),
//         },
//         { header: "Email", accessor: "email" },
//         { header: "Phone", accessor: "phone" },
//         { header: "Balance", accessor: "balance" },
//         { header: "Pay to Fetch True", accessor: "adjustmentCash" },
//         {
//             header: "Action",
//             accessor: "action",
//             render: (row: ProviderTableData) => (
//                 <div className="flex gap-2">

//                     <Link href={`/provider-management/provider-details/${row.id}`} passHref>
//                         <button className="text-blue-500 border border-blue-500 rounded-md p-2 hover:bg-blue-500 hover:text-white">
//                             <EyeIcon />
//                         </button>
//                     </Link>
//                 </div>
//             ),
//         },
//     ];
//     return (
//         <div>
//             <PageBreadcrumb pageTitle="Payment Adjustment" />
//             <div className="space-y-5 sm:space-y-6">

//                 <div className="mb-6">
//                     <ComponentCard title="Search & Filter">
//                         <div className=" gap-4">
//                             <div>
//                                 <Label htmlFor="search">Search Providers</Label>
//                                 <Input
//                                     id="search"
//                                     type="text"
//                                     placeholder="Search by name, email, phone, store, city..."
//                                     onChange={(e) => handleSearchChange(e.target.value)}
//                                     className="w-full"
//                                 />
//                             </div>
//                         </div>
//                     </ComponentCard>
//                 </div>
//                 <ComponentCard title="Payment Adjustment">
//                     <div>
//                         <div className="flex justify-between items-center border-b border-gray-200 pb-2">
//                             <ul className="flex space-x-6 text-sm font-medium text-center text-gray-500">
//                                 {["all", "pending", "approved", "completed", "rejected"].map((tab) => (
//                                     <li
//                                         key={tab}
//                                         className={`cursor-pointer px-4 py-2 ${activeTab === tab ? "border-b-2 border-blue-600 text-blue-600" : ""
//                                             }`}
//                                         onClick={() => setActiveTab(tab)}
//                                     >
//                                         {tab.charAt(0).toUpperCase() + tab.slice(1)}
//                                         <span className="ml-2 bg-red-500 text-white text-xs font-semibold px-2 py-0.5 rounded-full">
//                                             {providers.filter(
//                                                 (p) => tab === "all" || p.status.toLowerCase() === tab
//                                             ).length}
//                                         </span>
//                                     </li>
//                                 ))}
//                             </ul>
//                         </div>

//                         {loading ? (
//                             <div className="text-center py-8">Loading providers...</div>
//                         ) : message ? (
//                             <p className="text-red-500 text-center my-4">{message}</p>
//                         ) : (
//                             <>
//                                 <BasicTableOne columns={columns} data={currentRows} />
//                                 <div className="flex justify-center mt-4">
//                                     <Pagination
//                                         currentPage={currentPage}
//                                         totalItems={filteredProviders.length}
//                                         totalPages={totalPages}
//                                         onPageChange={setCurrentPage}
//                                     />
//                                 </div>
//                             </>
//                         )}
//                     </div>
//                 </ComponentCard>

//             </div>
//         </div>
//     );
// }


'use client';

import React, { useEffect, useState, useMemo } from "react";
import { useProvider } from "@/context/ProviderContext";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import ComponentCard from "@/components/common/ComponentCard";
import BasicTableOne from "@/components/tables/BasicTableOne";
import Pagination from "@/components/tables/Pagination";
import { EyeIcon } from "@/icons";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import Link from "next/link";
import { debounce } from "lodash";
import Image from "next/image";
import { IProviderWallet } from "@/models/ProviderWallet";

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
    balance: number;
    adjustmentCash: number;
}

export default function PaymentAdjustment() {
    const { getAllProviders, allWallet, fetchAllWallet, loading } = useProvider(); // context unchanged
    const [providers, setProviders] = useState<ProviderTableData[]>([]);
    const [message, setMessage] = useState("");
    const [searchQuery, setSearchQuery] = useState("");
    const [sort, setSort] = useState("latest");
    const [activeTab, setActiveTab] = useState("all");
    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage] = useState(10);

    console.log("wallet : ", allWallet)

    useEffect(() => {
        fetchAllWallet();
    }, [])

    // Load providers and merge wallet info
    const loadProviders = async () => {
        const data = await getAllProviders();
        if (!Array.isArray(data) || data.length === 0) {
            setProviders([]);
            setMessage("No providers found");
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

            const wallet = allWallet.find(w => w.providerId === provider._id);

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
                balance: wallet?.balance || 0,
                adjustmentCash: wallet?.adjustmentCash || 0,
            };
        });

        setProviders(updatedProviders);
        setMessage("");
    };

    useEffect(() => {
        loadProviders();
    }, [allWallet]); // re-run when wallets change

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
        result = result.filter(p => p.adjustmentCash > 0);
        return sortProviders(result, sort);
    }, [providers, activeTab, searchQuery, sort]);

    const totalPages = Math.ceil(filteredProviders.length / rowsPerPage);
    const indexOfLastRow = currentPage * rowsPerPage;
    const indexOfFirstRow = indexOfLastRow - rowsPerPage;
    const currentRows = filteredProviders.slice(indexOfFirstRow, indexOfLastRow);

    useEffect(() => {
        setCurrentPage(1);
    }, [activeTab, searchQuery, sort]);

    const handleSearchChange = debounce((value: string) => {
        setSearchQuery(value);
    }, 300);

    const columns = [
        {
            header: "S.No",
            accessor: "serial",
            render: (row: ProviderTableData) => {
                const serial = filteredProviders.findIndex((u) => u.id === row.id) + 1;
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
        { header: "Email", accessor: "email" },
        { header: "Phone", accessor: "phone" },
        {
            header: "Balance",
            accessor: "balance",
            render: (row: ProviderTableData) => <span>₹{row.balance.toFixed(2)}</span>
        },
        {
            header: "Adjustment Cash",
            accessor: "adjustmentCash",
            render: (row: ProviderTableData) => <span>₹{row.adjustmentCash.toFixed(2)}</span>
        },
        {
            header: "Action",
            accessor: "action",
            render: (row: ProviderTableData) => (
                <div className="flex gap-2">
                    <Link href={`/provider-management/payment-adjustment/${row.id}`} passHref>
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
            <PageBreadcrumb pageTitle="Payment Adjustment" />
            <div className="space-y-5 sm:space-y-6">
                <div className="mb-6">
                    <ComponentCard title="Search & Filter">
                        <div className=" gap-4">
                            <div>
                                <Label htmlFor="search">Search Providers</Label>
                                <Input
                                    id="search"
                                    type="text"
                                    placeholder="Search by name, email, phone, store, city..."
                                    onChange={(e) => handleSearchChange(e.target.value)}
                                    className="w-full"
                                />
                            </div>
                        </div>
                    </ComponentCard>
                </div>

                <ComponentCard title="Payment Adjustment">
                    <div>

                        {loading ? (
                            <div className="text-center py-8 text-gray-500">Loading providers...</div>
                        ) : filteredProviders.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-6">
                                <div className="w-24 h-24 mb-4 flex items-center justify-center rounded-full bg-gray-100">
                                    <svg
                                        className="w-12 h-12 text-gray-400"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                        xmlns="http://www.w3.org/2000/svg"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth="2"
                                            d="M9 17v-6m4 6v-4m4 4v-2m-8 2h8a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2h4z"
                                        ></path>
                                    </svg>
                                </div>
                                <h3 className="text-xl font-semibold text-gray-700">No Providers Found</h3>
                                <p className="text-gray-500 mt-2 text-center max-w-xs">
                                    There are no providers available at the moment. Please check back later .
                                </p>
                            </div>
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

                    </div>
                </ComponentCard>
            </div>
        </div>
    );
}
