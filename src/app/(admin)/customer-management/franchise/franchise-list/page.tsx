import React from "react";
import Image from "next/image";
import Badge from "@/components/ui/badge/Badge";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import ComponentCard from "@/components/common/ComponentCard";
import BasicTableOne from "@/components/tables/BasicTableOne";
import {
    BoxCubeIcon,
    EyeIcon
  } from "../../../../../icons/index";

const tableData = [
    {
        id: 1,
        franchise: {
            image: "/images/franchise/franchise-1.jpg",
            name: "Burger King",
            type: "Fast Food",
        },
        location: "New York",
        manager: {
            name: "John Doe",
            image: "/images/user/user-10.jpg",
        },
        revenue: "1.2M",
        status: "Open",
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
        status: "Closed",
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
        status: "Open",
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
        status: "Pending",
    },
];

const columns = [
    {
        header: "Franchise",
        accessor: "franchise",
        render: (row: any) => (
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
        render: (row: any) => (
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
        render: (row: any) => (
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
            <button className="text-blue-500 hover:text-blue-700"><EyeIcon /></button>
        ),
    },
];


const FranchiseList = () => {
    return (
        <div>
        <PageBreadcrumb pageTitle="Franchise List" />
        <div className="space-y-6">
            <ComponentCard title="Franchise List">
                <BasicTableOne columns={columns} data={tableData} />;
            </ComponentCard>
        </div>
    </div>
    )
}

export default FranchiseList

