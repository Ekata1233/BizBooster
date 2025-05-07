"use client";
import React, { useState } from "react";
import Image from "next/image";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import ComponentCard from "@/components/common/ComponentCard";
import BasicTableOne from "@/components/tables/BasicTableOne";
import {
    EyeIcon,
    TrashBinIcon,
    PencilIcon,
    BoxCubeIcon,
    ArrowUpIcon,
    ChevronDownIcon,
} from "../../../../../icons/index";
import StatCard from "@/components/common/StatCard";
import DatePicker from '@/components/form/date-picker';
import Label from "@/components/form/Label";
import Input from "@/components/form/input/InputField";
import Select from "@/components/form/Select";
import { useUserContext } from "@/context/UserContext";
import userProfile from "../../../../../../public/images/logo/user1.webp"
import Link from "next/link";

// Define the type for the table data
interface User {
    image: string;
    firstName: string;
    lastName: string;
    role: string;
}

interface Team {
    images: string[];
}

interface TableData {
    id: number;
    user: User;
    email: string;
    mobileNumber: string;
    referredBy: string;
    totalBookings: string;
    status: string;
}


// const tableData: TableData[] = [
//     {
//         id: 1,
//         user: {
//             image: "/images/user/user-17.jpg",
//             name: "Lindsey Curtis",
//             role: "Web Designer",
//         },
//         email: "lindsey.curtis@example.com",
//         mobileNumber: "+1 234 567 8901",
//         referredBy: "David Smith",
//         totalBookings: "3.9K",
//         status: "Active",
//     },
//     {
//         id: 2,
//         user: {
//             image: "/images/user/user-18.jpg",
//             name: "Michael Scott",
//             role: "Marketing Manager",
//         },
//         email: "michael.scott@example.com",
//         mobileNumber: "+1 987 654 3210",
//         referredBy: "Pam Beesly",
//         totalBookings: "5.2K",
//         status: "Active",
//     },
//     {
//         id: 3,
//         user: {
//             image: "/images/user/user-19.jpg",
//             name: "Angela Martin",
//             role: "Accountant",
//         },
//         email: "angela.martin@example.com",
//         mobileNumber: "+1 555 123 4567",
//         referredBy: "Oscar Martinez",
//         totalBookings: "4.1K",
//         status: "Active",
//     },
//     {
//         id: 4,
//         user: {
//             image: "/images/user/user-20.jpg",
//             name: "Jim Halpert",
//             role: "Sales Executive",
//         },
//         email: "jim.halpert@example.com",
//         mobileNumber: "+1 321 654 0987",
//         referredBy: "Dwight Schrute",
//         totalBookings: "6.3K",
//         status: "Active",
//     },
// ];


const columns = [
    {
        header: "User",
        accessor: "user",
        render: (row: TableData) => (
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 overflow-hidden rounded-full">
                    <Image
                        width={40}
                        height={40}
                        src={row.user.image}
                        alt={row.user.firstName}
                    />
                </div>
                <div>
                    <span className="block font-medium text-gray-800 text-theme-sm dark:text-white/90">
                        {row.user.firstName}{" "}{row.user.lastName}
                    </span>
                    {/* <span className="block text-gray-500 text-theme-xs dark:text-gray-400">
                    {row.user.lastName}
                    </span> */}
                </div>
            </div>
        ),
    },
    {
        header: "Email",
        accessor: "email",
    },
    {
        header: "Mobile Number",
        accessor: "mobileNumber",
    },
    {
        header: "Referred By",
        accessor: "referredBy",
    },
    {
        header: "Total Bookings",
        accessor: "totalBookings",
    },

    {
        header: "Action",
        accessor: "action",
        render: () => (
            <div className="flex gap-2">
                <button className="text-yellow-500 border border-yellow-500 rounded-md p-2 hover:bg-yellow-500 hover:text-white hover:border-yellow-500">
                    <PencilIcon />
                </button>
                <button className="text-red-500 border border-red-500 rounded-md p-2 hover:bg-red-500 hover:text-white hover:border-red-500">
                    <TrashBinIcon />
                </button>
                <Link href="/profile" passHref>
                    <button className="text-blue-500 border border-blue-500 rounded-md p-2 hover:bg-blue-500 hover:text-white hover:border-blue-500">
                        <EyeIcon />
                    </button>
                </Link>
            </div>
        ),
    },
];

const UserList = () => {
    const { users } = useUserContext();

    console.log("All Users : ", users)

    if (!users) {
        return <div>Loading...</div>;  // Or any other fallback UI
    }

    const tableData = users.map((user: any) => ({
        id: user._id,
        user: {
            image: "/images/logo/user1.webp",  // Replace with the user’s image URL if available
            firstName: user.firstName,
            lastName: user.lastName,
            role: user.role || "User",  // Assume you will assign a role in the context
        },
        email: user.email,
        mobileNumber: user.mobileNumber,
        referredBy: user.referredBy || "N/A",  // You can modify if you have referredBy data
        totalBookings: "0",  // Placeholder if you don't have this data, you can adjust it
        status: user.isDeleted ? "Inactive" : "Active",  // Assuming isDeleted is the status field
    }));

    const options = [
        { value: "latest", label: "Latest" },
        { value: "oldest", label: "Oldest" },
        { value: "ascending", label: "Ascending" },
        { value: "descending", label: "Descending" },
    ];

    const handleSelectChange = (value: string) => {
        console.log("Selected value:", value);
    };

    return (
        <div>
            <PageBreadcrumb pageTitle="User List" />
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 md:gap-6 my-5">
                <StatCard
                    title="Revenue"
                    value="$8490"
                    icon={BoxCubeIcon}
                    badgeColor="success"
                    badgeValue="6.88%"
                    badgeIcon={ArrowUpIcon}
                />
                <StatCard
                    title="Revenue"
                    value="$8420"
                    icon={BoxCubeIcon}
                    badgeColor="success"
                    badgeValue="6.88%"
                    badgeIcon={ArrowUpIcon}
                />
                <StatCard
                    title="Revenue"
                    value="$8420"
                    icon={BoxCubeIcon}
                    badgeColor="success"
                    badgeValue="6.88%"
                    badgeIcon={ArrowUpIcon}
                />
                <StatCard
                    title="Revenue"
                    value="$8420"
                    icon={BoxCubeIcon}
                    badgeColor="success"
                    badgeValue="6.88%"
                    badgeIcon={ArrowUpIcon}
                />
            </div>

            <div className="my-5">
                <ComponentCard title="Search Filter">
                    <div className="space-y-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 md:gap-6">

                        <div>
                            <DatePicker
                                id="date-picker"
                                label="Start Date"
                                placeholder="Select a date"
                                onChange={(dates, currentDateString) => {
                                    // Handle your logic
                                    console.log({ dates, currentDateString });
                                }}
                            />
                        </div>
                        <div>
                            <DatePicker
                                id="date-picker"
                                label="End Date"
                                placeholder="Select a date"
                                onChange={(dates, currentDateString) => {
                                    // Handle your logic
                                    console.log({ dates, currentDateString });
                                }}
                            />
                        </div>
                        <div>
                            <Label>Select Input</Label>
                            <div className="relative">
                                <Select
                                    options={options}
                                    placeholder="Sort By"
                                    onChange={handleSelectChange}
                                    className="dark:bg-dark-900"
                                />
                                <span className="absolute text-gray-500 -translate-y-1/2 pointer-events-none right-3 top-1/2 dark:text-gray-400">
                                    <ChevronDownIcon />
                                </span>
                            </div>
                        </div>
                        <div>
                            <Label>Other Filter</Label>
                            <Input type="text" />
                        </div>
                    </div>
                </ComponentCard>
            </div>

            <div>
                <ComponentCard title="Table">
                    <BasicTableOne columns={columns} data={tableData} />
                </ComponentCard>
            </div>
        </div>
    );
};

export default UserList;



