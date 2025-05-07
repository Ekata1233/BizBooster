import ComponentCard from "@/components/common/ComponentCard";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import BasicTableOne from "@/components/tables/BasicTableOne";
import Badge from "@/components/ui/badge/Badge";
import { Metadata } from "next";
import Image from "next/image";
import React from "react";

// Metadata for the page
export const metadata: Metadata = {
  title: "Next.js Basic Table | BizBooster Dashboard",
  description:
    "This is Next.js Basic Table page for BizBooster Tailwind CSS Admin Dashboard Template",
  // other metadata
};

// Data for the table, ensure `status` is one of "Open" | "Closed" | "Pending"
const tableData: TableRow[] = [
  {
      id: 1,
      franchise: {
          image: "/images/franchise/franchise-1.jpg",
          name: " King",
          type: "Fast Food",
      },
      location: "New York",
      manager: {
          name: "John Doe",
          image: "/images/user/user-10.jpg",
      },
      revenue: "1.2M",
      status: "Open", // status must be one of "Open", "Closed", or "Pending"
  },
  {
      id: 2,
      franchise: {
          image: "/images/franchise/franchise-2.jpg",
          name: "Starbucks",
          type: "Coffee Shop",
      },
      location: "Los Angeles",
      manager: {
          name: "Jane Smith",
          image: "/images/user/user-11.jpg",
      },
      revenue: "900K",
      status: "Closed", // status must be one of "Open", "Closed", or "Pending"
  },
  {
      id: 3,
      franchise: {
          image: "/images/franchise/franchise-3.jpg",
          name: "McDonald's",
          type: "Fast Food",
      },
      location: "Chicago",
      manager: {
          name: "Michael Johnson",
          image: "/images/user/user-12.jpg",
      },
      revenue: "1.5M",
      status: "Open", // status must be one of "Open", "Closed", or "Pending"
  },
  {
      id: 4,
      franchise: {
          image: "/images/franchise/franchise-4.jpg",
          name: "Domino's Pizza",
          type: "Pizza",
      },
      location: "Houston",
      manager: {
          name: "Emily Davis",
          image: "/images/user/user-13.jpg",
      },
      revenue: "800K",
      status: "Pending", // status must be one of "Open", "Closed", or "Pending"
  },
];

// Define types for the row data structure
interface Franchise {
  image: string;
  name: string;
  type: string;
}

interface Manager {
  name: string;
  image: string;
}

interface TableRow {
  id: number;
  franchise: Franchise;
  location: string;
  manager: Manager;
  revenue: string;
  status: "Open" | "Closed" | "Pending"; // status is explicitly typed as "Open" | "Closed" | "Pending"
}

const columns = [
  {
      header: "Franchise",
      accessor: "franchise",
      render: (row: TableRow) => (
          <div className="flex items-center gap-3">
              <div className="w-10 h-10 overflow-hidden rounded-full">
                  <Image
                      width={40}
                      height={40}
                      src={row.franchise.image}
                      alt={row.franchise.name}
                  />
              </div>
              <div>
                  <span className="block font-medium text-gray-800 text-theme-sm dark:text-white/90">
                      {row.franchise.name}
                  </span>
                  <span className="block text-gray-500 text-theme-xs dark:text-gray-400">
                      {row.franchise.type}
                  </span>
              </div>
          </div>
      ),
  },
  {
      header: "Location",
      accessor: "location",
  },
  {
      header: "Manager",
      accessor: "manager",
      render: (row: TableRow) => (
          <div className="flex items-center gap-3">
              <div className="w-8 h-8 overflow-hidden rounded-full">
                  <Image
                      width={32}
                      height={32}
                      src={row.manager.image}
                      alt={row.manager.name}
                  />
              </div>
              <span className="block text-gray-800 dark:text-white">{row.manager.name}</span>
          </div>
      ),
  },
  {
      header: "Revenue",
      accessor: "revenue",
  },
  {
      header: "Status",
      accessor: "status",
      render: (row: TableRow) => (
          <Badge
              size="sm"
              color={
                  row.status === "Open"
                      ? "success"
                      : row.status === "Pending"
                      ? "warning"
                      : "error"
              }
          >
              {row.status}
          </Badge>
      ),
  },
  {
      header: "Action",
      accessor: "action",
      render: () => (
          <button className="text-blue-500 hover:text-blue-700">View</button>
      ),
  },
];

export default function BasicTables() {
  return (
    <div>
      <PageBreadcrumb pageTitle="Basic Table" />
      <div className="space-y-6">
        <ComponentCard title="Basic Table 1">
          <BasicTableOne columns={columns} data={tableData} />
        </ComponentCard>
      </div>
    </div>
  );
}
