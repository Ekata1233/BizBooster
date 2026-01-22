"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import ComponentCard from "@/components/common/ComponentCard";
import BasicTableOne from "@/components/tables/BasicTableOne";
import Pagination from "@/components/tables/Pagination";
import Label from "@/components/form/Label";
import FileInput from "@/components/form/input/FileInput";
import Select from "@/components/form/Select";
import Button from "@/components/ui/button/Button";
import { ChevronDownIcon, TrashBinIcon, PencilIcon } from "@/icons";

import { useCategoryBanner } from "@/context/CategoryBannerContext";
import { useModule } from "@/context/ModuleContext";

/* ================= TYPES ================= */

interface TableData {
  id: string;
  image: string;
  module: string;
}

/* ================= PAGE ================= */

const CategoryBannerPage = () => {
  const {
    banners,
    fetchBanners,
    createBanner,
    deleteBanner,
    loading: contextLoading,
  } = useCategoryBanner();

  const { modules } = useModule();

  /* ---------- ADD FORM STATE ---------- */
  const [selectedModule, setSelectedModule] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [fileKey, setFileKey] = useState(Date.now());

  /* ---------- PAGINATION ---------- */
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10;

  /* ================= EFFECT ================= */
  useEffect(() => {
    fetchBanners();
  }, []);

  /* ================= HANDLERS ================= */

  const handleAddBanner = async () => {
    if (!selectedModule || !imageFile) {
      alert("Please select module and banner image");
      return;
    }

    const formData = new FormData();
    formData.append("module", selectedModule);
    formData.append("image", imageFile);

    try {
      await createBanner(formData);
      alert("Category banner added successfully");

      // reset form
      setSelectedModule("");
      setImageFile(null);
      setFileKey(Date.now());
      setCurrentPage(1);
    } catch (err) {
      alert("Failed to add category banner");
      console.error(err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this banner?")) return;
    try {
      await deleteBanner(id);
      alert("Banner deleted successfully");
      setCurrentPage(1);
    } catch (err) {
      alert("Failed to delete banner");
      console.error(err);
    }
  };

  /* ================= TABLE DATA ================= */

  const tableData: TableData[] = banners.map((item) => ({
    id: item._id,
    image: item.image || "",
    module:
      typeof item.module === "object" ? item.module.name : "-",
  }));

  const totalPages = Math.ceil(tableData.length / rowsPerPage);
  const indexOfLastRow = currentPage * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;
  const currentRows = tableData.slice(indexOfFirstRow, indexOfLastRow);

  /* ================= TABLE COLUMNS ================= */

  const columns = [
    {
      header: "Sr. No",
      accessor: "sr",
      render: (_row: TableData) => {
        const idx = currentRows.findIndex((r) => r.id === _row.id);
        return <span>{(currentPage - 1) * rowsPerPage + idx + 1}</span>;
      },
    },
    {
      header: "Banner Image",
      accessor: "image",
      render: (row: TableData) => (
        <div className="w-40 h-20 relative border rounded overflow-hidden">
          <Image
            src={row.image}
            alt="Category Banner"
            fill
            className="object-cover"
            sizes="100vw"
          />
        </div>
      ),
    },
    {
      header: "Module",
      accessor: "module",
      render: (row: TableData) => (
        <span className="font-medium">{row.module}</span>
      ),
    },
    {
      header: "Action",
      accessor: "action",
      render: (row: TableData) => (
        <div className="flex gap-2">
          <Link
            href={`/category-management/category/category-banner/${row.id}`}
            className="text-yellow-500 border border-yellow-500 rounded-md p-2 hover:bg-yellow-500 hover:text-white"
          >
            <PencilIcon />
          </Link>

          <button
            onClick={() => handleDelete(row.id)}
            className="text-red-500 border border-red-500 rounded-md p-2 hover:bg-red-500 hover:text-white"
          >
            <TrashBinIcon />
          </button>
        </div>
      ),
    },
  ];

  /* ================= UI ================= */

  return (
    <div>
      <PageBreadcrumb pageTitle="Category Banner" />

      {/* ================= ADD FORM ================= */}
      <div className="my-6">
        <ComponentCard title="Add Category Banner">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 md:gap-6">
            <div>
              <Label>Select Module</Label>
              <div className="relative">
                <Select
                  options={modules.map((mod) => ({
                    value: mod._id,
                    label: mod.name,
                  }))}
                  placeholder="Select Module"
                  value={selectedModule}
                  onChange={setSelectedModule}
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                  <ChevronDownIcon />
                </span>
              </div>
            </div>

            <div>
              <Label>Banner Image</Label>
              <FileInput
                key={fileKey}
                onChange={(e) =>
                  setImageFile(e.target.files?.[0] || null)
                }
              />
            </div>

            <div className="mt-6">
              <Button size="sm" variant="primary" onClick={handleAddBanner}>
                Add Banner
              </Button>
            </div>
          </div>
        </ComponentCard>
      </div>

      {/* ================= TABLE ================= */}
      <div className="my-6">
        <ComponentCard title="All Category Banners">
          {contextLoading ? (
            <p className="text-center py-6">Loading...</p>
          ) : tableData.length === 0 ? (
            <div className="border border-dashed border-gray-300 rounded-lg p-6 text-center text-gray-500">
              📦 No category banners found
            </div>
          ) : (
            <>
              <BasicTableOne columns={columns} data={currentRows} />

              <div className="flex justify-center mt-4">
                <Pagination
                  currentPage={currentPage}
                  totalItems={tableData.length}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                />
              </div>
            </>
          )}
        </ComponentCard>
      </div>
    </div>
  );
};

export default CategoryBannerPage;
