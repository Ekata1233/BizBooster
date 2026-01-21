'use client';

import React, { useEffect, useState, useMemo } from "react";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import ComponentCard from "@/components/common/ComponentCard";
import BasicTableOne from "@/components/tables/BasicTableOne";
import Pagination from "@/components/tables/Pagination";
import { TrashBinIcon, EyeIcon, CheckLineIcon } from "@/icons";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import { useProvider } from "@/context/ProviderContext";
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
  isDeleted: boolean;
  step1Completed: boolean;
  storeInfoCompleted: boolean;
  kycCompleted: boolean;
  isRecommended: boolean;
  isTrending: boolean;
}

const PromotionRequest = () => {
  const { getAllProviders, deleteProvider } = useProvider();

  const [providers, setProviders] = useState<ProviderTableData[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10;

  /* ================= FETCH USING CONTEXT ================= */
  const fetchProviders = async () => {
    setLoading(true);
    try {
      const data = await getAllProviders();

      console.log("data : ", data)

      if (!Array.isArray(data) || data.length === 0) {
        setProviders([]);
        setMessage("No providers found");
        return;
      }

      const mappedProviders = data.map((provider: any): ProviderTableData => {
        const storeInfo = provider.storeInfo || {};

        const isComplete =
          provider.step1Completed &&
          provider.storeInfoCompleted &&
          provider.kycCompleted;

        let status: ProviderTableData["status"] = "Pending";
        if (provider.isApproved) status = "Approved";
        else if (provider.isRejected) status = "Rejected";
        else if (isComplete) status = "Completed";

        return {
          id: provider._id,
          fullName: provider.fullName,
          email: provider.email,
          phone: provider.phoneNo || "-",
          storeName: storeInfo.storeName || "-",
          storePhone: storeInfo.storePhone || "-",
          city: storeInfo.city || "-",
          logo: storeInfo.logo || "",
          isApproved: provider.isApproved || false,
          isRejected: provider.isRejected || false,
          isDeleted: provider.isDeleted || false,
          step1Completed: provider.step1Completed || false,
          storeInfoCompleted: provider.storeInfoCompleted || false,
          kycCompleted: provider.kycCompleted || false,
          isRecommended: provider.isRecommended || false,
          isTrending: provider.isTrending || false,
          status,
        };
      });

      setProviders(mappedProviders);
      setMessage("");
    } catch (error) {
      console.error(error);
      setMessage("Failed to fetch providers");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProviders();
  }, []);

  /* ================= ACTIONS ================= */
  const handleDelete = async (id: string, isDeleted: boolean) => {
    if (isDeleted) return;
    if (!confirm("Are you sure you want to delete this provider?")) return;

    try {
      await deleteProvider(id);
      fetchProviders();
    } catch (error) {
      console.error("Delete failed:", error);
    }
  };

  const handleApprove = async (id: string) => {
    try {
      await axios.patch(`/api/provider/${id}`, { isPromoted: true });
      fetchProviders();
    } catch (error) {
      console.error("Promotion approve failed:", error);
    }
  };

  /* ================= FILTER & SEARCH ================= */
  const filteredProviders = useMemo(() => {
    let result = [...providers];

    if (activeTab !== "all") {
      result = result.filter(
        (p) => p.status.toLowerCase() === activeTab
      );
    }

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p.fullName.toLowerCase().includes(q) ||
          p.email.toLowerCase().includes(q) ||
          p.phone.toLowerCase().includes(q) ||
          p.storeName.toLowerCase().includes(q) ||
          p.city.toLowerCase().includes(q)
      );
    }

    return result;
  }, [providers, activeTab, searchQuery]);

  const totalPages = Math.ceil(filteredProviders.length / rowsPerPage);
  const indexOfLastRow = currentPage * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;
  const currentRows = filteredProviders.slice(indexOfFirstRow, indexOfLastRow);

  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, searchQuery]);

  const handleSearchChange = debounce((value: string) => {
    setSearchQuery(value);
  }, 300);

  /* ================= TABLE COLUMNS ================= */
  const columns = [
    {
      header: "S.No",
      accessor: "serial",
      render: (row: ProviderTableData) =>
        filteredProviders.findIndex((p) => p.id === row.id) + 1,
    },
    {
      header: "Store Info",
      accessor: "store",
      render: (row: ProviderTableData) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 overflow-hidden rounded-full">
            <Image
              src={row.logo || "/default-logo.png"}
              width={40}
              height={40}
              alt="logo"
            />
          </div>
          <div>
            <p className="font-medium">{row.storeName}</p>
            <p className="text-xs text-gray-500">{row.city}</p>
            <p className="text-xs text-gray-500">{row.storePhone}</p>
          </div>
        </div>
      ),
    },
    { header: "Email", accessor: "email" },
    { header: "Phone", accessor: "phone" },
    { header: "City", accessor: "city" },
    {
      header: "Approved Status",
      accessor: "approved",
      render: (row: ProviderTableData) => (
        <span
          className={`px-3 py-1 rounded-full text-sm font-semibold border ${
            row.isApproved
              ? "text-green-600 bg-green-100 border-green-300"
              : row.isRejected
              ? "text-red-600 bg-red-100 border-red-300"
              : "text-yellow-600 bg-yellow-100 border-yellow-300"
          }`}
        >
          {row.isApproved ? "Approved" : row.isRejected ? "Rejected" : "Pending"}
        </span>
      ),
    },
    {
      header: "Action",
      accessor: "action",
      render: (row: ProviderTableData) => (
        <div className="flex gap-2">
          <button
            onClick={() => handleDelete(row.id, row.isDeleted)}
            disabled={row.isDeleted}
            className="border border-red-500 p-2 rounded-md text-red-500 hover:bg-red-500 hover:text-white"
          >
            <TrashBinIcon />
          </button>

          <Link href={`/provider-management/provider-details/${row.id}`}>
            <button className="border border-blue-500 p-2 rounded-md text-blue-500 hover:bg-blue-500 hover:text-white">
              <EyeIcon />
            </button>
          </Link>
        </div>
      ),
    },
    {
      header: "Promotion Request",
      accessor: "promotion",
      render: (row: ProviderTableData) => (
        <button
          onClick={() => handleApprove(row.id)}
          className="border border-green-500 p-2 rounded-md text-green-500 hover:bg-green-500 hover:text-white"
        >
          <CheckLineIcon />
        </button>
      ),
    },
  ];

  return (
    <div>
      <PageBreadcrumb pageTitle="Provider List" />

      <ComponentCard title="Search & Filter">
        <Label>Search Providers</Label>
        <Input
          placeholder="Search..."
          onChange={(e) => handleSearchChange(e.target.value)}
        />
      </ComponentCard>

      <ComponentCard title="Promotion Request Table">
        <BasicTableOne columns={columns} data={currentRows} />
        <Pagination
          currentPage={currentPage}
          totalItems={filteredProviders.length}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      </ComponentCard>
    </div>
  );
};

export default PromotionRequest;
