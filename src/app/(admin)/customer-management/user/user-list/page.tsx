import React from "react";
import Image from "next/image";
import Badge from "@/components/ui/badge/Badge";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import ComponentCard from "@/components/common/ComponentCard";
import BasicTableOne from "@/components/tables/BasicTableOne";
import {
    EyeIcon,
    TrashBinIcon,
    PencilIcon
} from "../../../../../icons/index";

const tableData = [
    {
        id: 1,
        user: {
            image: "/images/user/user-17.jpg",
            name: "Lindsey Curtis",
            role: "Web Designer",
        },
        projectName: "Agency Website",
        team: {
            images: [
                "/images/user/user-22.jpg",
                "/images/user/user-23.jpg",
                "/images/user/user-24.jpg",
            ],
        },
        budget: "3.9K",
        status: "Active",
    },
    {
        id: 1,
        user: {
            image: "/images/user/user-17.jpg",
            name: "Lindsey Curtis",
            role: "Web Designer",
        },
        projectName: "Agency Website",
        team: {
            images: [
                "/images/user/user-22.jpg",
                "/images/user/user-23.jpg",
                "/images/user/user-24.jpg",
            ],
        },
        budget: "3.9K",
        status: "Active",
    },
    {
        id: 1,
        user: {
            image: "/images/user/user-17.jpg",
            name: "Lindsey Curtis",
            role: "Web Designer",
        },
        projectName: "Agency Website",
        team: {
            images: [
                "/images/user/user-22.jpg",
                "/images/user/user-23.jpg",
                "/images/user/user-24.jpg",
            ],
        },
        budget: "3.9K",
        status: "Active",
    },
    {
        id: 1,
        user: {
            image: "/images/user/user-17.jpg",
            name: "Lindsey Curtis",
            role: "Web Designer",
        },
        projectName: "Agency Website",
        team: {
            images: [
                "/images/user/user-22.jpg",
                "/images/user/user-23.jpg",
                "/images/user/user-24.jpg",
            ],
        },
        budget: "3.9K",
        status: "Active",
    },
];

const columns = [
    {
        header: "User",
        accessor: "user",
        render: (row: any) => (
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 overflow-hidden rounded-full">
                    <Image
                        width={40}
                        height={40}
                        src={row.user.image}
                        alt={row.user.name}
                    />
                </div>
                <div>
                    <span className="block font-medium text-gray-800 text-theme-sm dark:text-white/90">
                        {row.user.name}
                    </span>
                    <span className="block text-gray-500 text-theme-xs dark:text-gray-400">
                        {row.user.role}
                    </span>
                </div>
            </div>
        ),
    },
    {
        header: "Project Name",
        accessor: "projectName",
    },
    {
        header: "Team",
        accessor: "team",
        render: (row: any) => (
            <div className="flex -space-x-2">
                {row.team.images.map((img: string, i: number) => (
                    <div
                        key={i}
                        className="w-6 h-6 overflow-hidden border-2 border-white rounded-full dark:border-gray-900"
                    >
                        <Image
                            width={24}
                            height={24}
                            src={img}
                            alt={`Team member ${i + 1}`}
                            className="w-full"
                        />
                    </div>
                ))}
            </div>
        ),
    },
    {
        header: "Status",
        accessor: "status",
        render: (row: any) => (
            <Badge
                size="sm"
                color={
                    row.status === "Active"
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
        header: "Budget",
        accessor: "budget",
    },
    {
        header: "Action",
        accessor: "action",
        render: () => (
            <div className="flex gap-2">
                <button className="text-yellow-500 border border-yellow-500 rounded-md p-2 hover:bg-yellow-500 hover:text-white hover:border-yellow-500">
                    <PencilIcon/>
                </button>
                <button className="text-red-500 border border-red-500 rounded-md p-2 hover:bg-red-500 hover:text-white hover:border-red-500">
                    <TrashBinIcon />
                </button>
                <button className="text-blue-500 border border-blue-500 rounded-md p-2 hover:bg-blue-500 hover:text-white hover:border-blue-500">
                    <EyeIcon />
                </button>
            </div>

        ),
    },
];

const UserList = () => {
    return (
        <div>
            <PageBreadcrumb pageTitle="User List" />
            <div className="space-y-6">
                <ComponentCard title="User List">
                    <BasicTableOne columns={columns} data={tableData} />;
                </ComponentCard>
            </div>
        </div>
    )
}

export default UserList

