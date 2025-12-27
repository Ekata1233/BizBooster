'use client';

import React, { useEffect, useState, useMemo } from "react";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import ComponentCard from "@/components/common/ComponentCard";
import BasicTableOne from "@/components/tables/BasicTableOne";
import Pagination from "@/components/tables/Pagination";
import { TrashBinIcon, EyeIcon } from "@/icons";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import { useProvider } from "@/context/ProviderContext";
import { useModule } from "@/context/ModuleContext";
import Link from "next/link";
import axios from "axios";
import { debounce } from "lodash";
import Image from "next/image";
import Switch from "@/components/form/switch/Switch";

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
  isDeleted: boolean;
  step1Completed: boolean;
  storeInfoCompleted: boolean;
  kycCompleted: boolean;
   isRecommended: boolean;
  isTrending: boolean;
}

const ProviderList = () => {
  const { modules } = useModule();
  const { deleteProvider } = useProvider();

  const [selectedModule, setSelectedModule] = useState<string>("");
  const [providers, setProviders] = useState<ProviderTableData[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [sort, setSort] = useState("latest");
  const [statusFilter, setStatusFilter] = useState("all");
  const [message, setMessage] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("all");

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
          isDeleted: provider.isDeleted || false,
          status,
          step1Completed: provider.step1Completed || false,
          storeInfoCompleted: provider.storeInfoCompleted || false,
          kycCompleted: provider.kycCompleted || false,
          isRecommended: provider.isRecommended || false,
  isTrending: provider.isTrending || false,
        };
      });
      console.log("✅ Provider List (Processed):", updatedProviders);
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

  const handleDelete = async (id: string, isDeleted: boolean) => {
    if (isDeleted) return; // Disable delete if already deleted

    if (!confirm("Are you sure you want to delete this provider?")) return;
    try {
      await deleteProvider(id);
      setProviders((prev) =>
        prev.map((p) => (p.id === id ? { ...p, isDeleted: true } : p))
      );
    } catch (error) {
      console.error("Failed to delete provider:", error);
    }
  };

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

    result = sortProviders(result, sort);
    return result;
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

const handleToggleChange = async (
  id: string,
  field: "isRecommended" | "isTrending",
  checked: boolean
) => {
  try {
    // Optimistic UI update
    setProviders((prev) =>
      prev.map((p) =>
        p.id === id ? { ...p, [field]: checked } : p
      )
    );

    const formData = new FormData();

    // 👇 IF THESE FIELDS ARE TOP-LEVEL
    formData.append(field, String(checked));

    // 👇 IF THESE FIELDS ARE INSIDE storeInfo (MOST LIKELY)
    // formData.append(`storeInfo.${field}`, String(checked));

    await axios.patch(
      `/api/provider/edit-profile/${id}`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
  } catch (error) {
    console.error("Toggle update failed:", error);
  }
};




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
   
   {
  header: "Contact",
  accessor: "contact",
  render: (row: ProviderTableData) => (
    <div className="flex flex-col text-sm">
      <span className="font-medium text-gray-800 dark:text-white/90">
        {row.email}
      </span>
      <span className="text-gray-500 dark:text-gray-400">
        {row.phone}
      </span>
    </div>
  ),
},
    { header: "City", accessor: "city" },
    
    {
      header: "Active Status",
      accessor: "activeStatus",
      render: (row: ProviderTableData) => (
        <span
          className={`px-3 py-1 rounded-full text-sm font-semibold border ${
            row.isDeleted
              ? "text-red-600 bg-red-100 border-red-300"
              : "text-green-600 bg-green-100 border-green-300"
          }`}
        >
          {row.isDeleted ? "Deleted" : "Active"}
        </span>
      ),
    },
    {
      header: "Action",
      accessor: "action",
      render: (row: ProviderTableData) => (
        <div className="flex gap-2">
          
          <Link href={`/provider-management/provider-details/${row.id}`} passHref>
            <button className="text-blue-500 border border-blue-500 rounded-md p-2 hover:bg-blue-500 hover:text-white">
              <EyeIcon />
            </button>
          </Link>
        </div>
      ),
    },
{
  header: "Recommended",
  accessor: "recommended",
  render: (row: ProviderTableData) => (
    <div className="flex justify-center">
     <Switch
  checked={row.isRecommended}
  onChange={(checked) =>
    handleToggleChange(row.id, "isRecommended", checked)
  }
  color="gray"
/>

    </div>
  ),
},
{
  header: "Top Trending",
  accessor: "trending",
  render: (row: ProviderTableData) => (
    <div className="flex justify-center">
    <Switch
  checked={row.isTrending}
  onChange={(checked) =>
    handleToggleChange(row.id, "isTrending", checked)
  }
  color="gray"
/>

    </div>
  ),
},
  ];

  return (
    <div>
      <PageBreadcrumb pageTitle="Provider List" />

      <div className="mb-6">
        <ComponentCard title="Search & Filter">
          <div className="gap-4">
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
