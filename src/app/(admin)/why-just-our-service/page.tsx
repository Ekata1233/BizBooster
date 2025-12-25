"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";

import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import ComponentCard from "@/components/common/ComponentCard";
import BasicTableOne from "@/components/tables/BasicTableOne";
import Pagination from "@/components/tables/Pagination";
import StatCard from "@/components/common/StatCard";

import { Modal } from "@/components/ui/modal";
import Label from "@/components/form/Label";
import Select from "@/components/form/Select";
import Input from "@/components/form/input/InputField";
import FileInput from "@/components/form/input/FileInput";

import {
  TrashBinIcon,
  PencilIcon,
  ArrowUpIcon,
  UserIcon,
  PlusIcon,
} from "@/icons";

import { useWhyJustOurService } from "@/context/WhyJustOurServiceContext";
import { useModule } from "@/context/ModuleContext";

import AddWhyJustOurService from "./add/page";

/* ───────── TYPES ───────── */

interface ServiceItem {
  title: string;
  description: string;
  icon: string;
  list?: string; 

}

interface ServiceType {
  _id: string;
  module?: { _id: string; name: string } | string;
  items: ServiceItem[];
  createdAt?: string;
}

/* ───────── CONSTANTS ───────── */

const sortOptions = [
  { value: "latest", label: "Latest" },
  { value: "oldest", label: "Oldest" },
];

/* ───────── COMPONENT ───────── */

const WhyJustOurServiceList = () => {
  const { services, deleteService, updateService, fetchServices } =
    useWhyJustOurService();
  const { modules } = useModule();

  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("latest");
  const [selectedModule, setSelectedModule] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const [editModalOpen, setEditModalOpen] = useState(false);
  const [currentService, setCurrentService] = useState<ServiceType | null>(
    null
  );

  const rowsPerPage = 10;

  /* ───────── FILTER + SORT ───────── */

  const filtered = services
    .filter((s) =>
      selectedModule
        ? typeof s.module === "object" && s.module?._id === selectedModule
        : true
    )
    .filter((s) =>
      search
        ? s.items.some((item) =>
            item.title.toLowerCase().includes(search.toLowerCase())
          )
        : true
    )
    .sort((a, b) =>
      sort === "latest"
        ? new Date(b.createdAt || "").getTime() -
          new Date(a.createdAt || "").getTime()
        : new Date(a.createdAt || "").getTime() -
          new Date(b.createdAt || "").getTime()
    );

  /* ───────── PAGINATION ───────── */

  const totalPages = Math.ceil(filtered.length / rowsPerPage);
  const indexOfLast = currentPage * rowsPerPage;
  const currentRows = filtered.slice(indexOfLast - rowsPerPage, indexOfLast);

  /* ───────── HANDLERS ───────── */

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this service?")) return;
    await deleteService(id);
    fetchServices();
  };

  /* ───────── EDIT MODAL ───────── */
  interface EditItem {
    title: string;
    description: string;
    iconFile: File | null;
    oldIcon: string;
    list?: string; 
    key: number;
  }

  const [editItems, setEditItems] = useState<EditItem[]>([]);

  const handleEdit = (service: ServiceType) => {
    setCurrentService(service);

    const itemsWithKeys: EditItem[] = service.items.map((item) => ({
      title: item.title,
      description: item.description,
      iconFile: null,
      oldIcon: item.icon,
      list: item.list || "",
      key: Date.now() + Math.random(),
    }));

    setEditItems(itemsWithKeys);
    setEditModalOpen(true);
  };

  const handleEditItemChange = (
    key: number,
    field: "title" | "description" | "iconFile" | "list",
    value: string | File | null
  ) => {
    setEditItems((prev) =>
      prev.map((item) => (item.key === key ? { ...item, [field]: value } : item))
    );
  };

  const handleAddEditItem = () => {
    setEditItems((prev) => [
      ...prev,
      { title: "", description: "", iconFile: null, oldIcon: "", list: "", key: Date.now() },
    ]);
  };

  const handleRemoveEditItem = (key: number) => {
    setEditItems((prev) => prev.filter((item) => item.key !== key));
  };

  const handleUpdate = async () => {
    if (!currentService) return;

    const formData = new FormData();
    formData.append("module", typeof currentService.module === "object" ? currentService.module._id : "");

    editItems.forEach((item, index) => {
      formData.append(`items[${index}][title]`, item.title);
      formData.append(`items[${index}][description]`, item.description);
      if (item.list) formData.append(`items[${index}][list]`, item.list);
      if (item.iconFile) formData.append(`items[${index}][icon]`, item.iconFile);
      else formData.append(`items[${index}][oldIcon]`, item.oldIcon);
    });

    await updateService(currentService._id, formData);
    fetchServices();
    setEditModalOpen(false);
  };

  /* ───────── TABLE ───────── */

  const DetailsColumn = ({ row }: { row: ServiceType }) => {
    const [showAll, setShowAll] = useState(false);
    const itemsToShow = showAll ? row.items : row.items.slice(0, 2);
    const remainingCount = row.items.length - 2;

    return (
      <div className="flex flex-col gap-2">
        {itemsToShow.map((item, idx) => (
          <div key={idx} className="flex gap-2 items-start">
            <div className="relative w-12 h-12 border rounded overflow-hidden">
              <Image src={item.icon} alt={item.title} fill className="object-cover" />
            </div>
            <div>
              <p className="font-semibold">{item.title}</p>
              <p className="text-gray-500 text-sm">{item.description}</p>
              {item.list && (
                <p className="text-xs text-gray-400">{item.list}</p>
              )}
            </div>
          </div>
        ))}

        {row.items.length > 2 && (
          <button
            onClick={() => setShowAll(!showAll)}
            className="text-blue-500 text-sm mt-1"
          >
            {showAll ? "Hide" : `+${remainingCount} more`}
          </button>
        )}
      </div>
    );
  };

  const columns = [
    {
      header: "Sr. No",
      accessor: "sr",
      render: (_: any, index: number) =>
        (currentPage - 1) * rowsPerPage + index + 1,
    },
    {
      header: "Module",
      accessor: "module",
      render: (row: ServiceType) =>
        typeof row.module === "object" ? row.module.name : "-",
    },
    {
      header: "Details",
      accessor: "items",
      render: (row: ServiceType) => <DetailsColumn row={row} />, // ✅ using component
    },
    {
      header: "Action",
      accessor: "action",
      render: (row: ServiceType) => (
        <div className="flex gap-2">
          <button
            onClick={() => handleEdit(row)}
            className="text-yellow-500 border border-yellow-500 p-2 rounded hover:bg-yellow-500 hover:text-white"
          >
            <PencilIcon />
          </button>
          <button
            onClick={() => handleDelete(row._id)}
            className="text-red-500 border border-red-500 p-2 rounded hover:bg-red-500 hover:text-white"
          >
            <TrashBinIcon />
          </button>
        </div>
      ),
    },
  ];

  useEffect(() => {
    fetchServices();
  }, []);

  /* ───────── RENDER ───────── */

  return (
    <div>
      <PageBreadcrumb pageTitle="Why Just Our Services" />
      <AddWhyJustOurService />

      {/* FILTERS */}
      <div className="flex flex-col lg:flex-row gap-6 my-5">
        <div className="w-full lg:w-3/4">
          <ComponentCard title="Search Filter">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <Label>Select Module</Label>
                <Select
                  options={modules.map((m) => ({
                    value: m._id,
                    label: m.name,
                  }))}
                  onChange={setSelectedModule}
                />
              </div>
              <div>
                <Label>Sort</Label>
                <Select options={sortOptions} onChange={setSort} />
              </div>
              <div>
                <Label>Search</Label>
                <Input
                  placeholder="Search by title"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>
          </ComponentCard>
        </div>
        <div className="w-full lg:w-1/4">
          <StatCard
            title="Total Services"
            value={filtered.length}
            icon={UserIcon}
            badgeIcon={ArrowUpIcon}
            badgeValue="0.00%"
            badgeColor="success"
          />
        </div>
      </div>

      {/* TABLE */}
      <ComponentCard title="All Services">
        <BasicTableOne columns={columns} data={currentRows} />

        {filtered.length > rowsPerPage && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={filtered.length}
            onPageChange={setCurrentPage}
          />
        )}
      </ComponentCard>

      {/* EDIT MODAL */}
      <Modal isOpen={editModalOpen} onClose={() => setEditModalOpen(false)}>
        <div className="p-4 space-y-4">
          <h2 className="text-lg font-semibold">Edit Service Items</h2>

          {editItems.map((item, index) => (
            <div
              key={item.key}
              className="border p-4 mb-4 rounded flex flex-col sm:flex-row gap-4 items-end relative"
            >
              {/* TITLE */}
              <div className="flex-1">
                <Label>Title</Label>
                <Input
                  type="text"
                  value={item.title}
                  onChange={(e) =>
                    handleEditItemChange(item.key, "title", e.target.value)
                  }
                />
              </div>

              {/* DESCRIPTION */}
              <div className="flex-1">
                <Label>Description</Label>
                <Input
                  type="text"
                  value={item.description}
                  onChange={(e) =>
                    handleEditItemChange(item.key, "description", e.target.value)
                  }
                />
              </div>

              {/* LIST */}
              <div className="flex-1">
                <Label>List</Label>
                <Input
                  type="text"
                  value={item.list || ""}
                  onChange={(e) =>
                    handleEditItemChange(item.key, "list", e.target.value)
                  }
                  placeholder="Optional list text"
                />
              </div>

              {/* ICON */}
              <div className="flex-1">
                <Label>Icon</Label>
                <FileInput
                  onChange={(e) =>
                    handleEditItemChange(
                      item.key,
                      "iconFile",
                      e.target.files?.[0] || null
                    )
                  }
                />
                {item.iconFile ? (
                  <div className="mt-1 text-sm text-gray-500">New file selected</div>
                ) : (
                  <div className="mt-1 text-sm text-gray-500">Current icon shown below</div>
                )}
                <div className="relative w-16 h-16 border rounded overflow-hidden mt-1">
                  <Image
                    src={item.iconFile ? URL.createObjectURL(item.iconFile) : item.oldIcon}
                    alt={item.title}
                    fill
                    className="object-cover"
                  />
                </div>
              </div>

              {/* BUTTONS */}
              <div className="flex flex-col gap-2 absolute top-2 right-2">
                {editItems.length > 1 && (
                  <button
                    onClick={() => handleRemoveEditItem(item.key)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <TrashBinIcon className="w-5 h-5" />
                  </button>
                )}
                {index === editItems.length - 1 && (
                  <button
                    onClick={handleAddEditItem}
                    className="bg-green-500 hover:bg-green-600 text-white p-1 rounded-full"
                  >
                    <PlusIcon className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ))}

          <div className="flex justify-end gap-3">
            <button
              onClick={() => setEditModalOpen(false)}
              className="border px-4 py-2 rounded"
            >
              Cancel
            </button>
            <button
              onClick={handleUpdate}
              className="bg-blue-600 text-white px-4 py-2 rounded"
            >
              Update
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default WhyJustOurServiceList;
