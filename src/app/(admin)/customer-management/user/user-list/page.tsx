"use client";
import React, { useState } from "react";
import Image from "next/image";
import Badge from "@/components/ui/badge/Badge";
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
    EyeCloseIcon,
    TimeIcon
} from "../../../../../icons/index";
import StatCard from "@/components/common/StatCard";
import DatePicker from '@/components/form/date-picker';
import Label from "@/components/form/Label";
import Input from "@/components/form/input/InputField";
import Select from "@/components/form/Select";

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
                    <PencilIcon />
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
    const [showPassword, setShowPassword] = useState(false);
    const options = [
        { value: "marketing", label: "Marketing" },
        { value: "template", label: "Template" },
        { value: "development", label: "Development" },
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

            <div><ComponentCard title="Default Inputs">
                <div className="space-y-6">
                    <div>
                        <Label>Input</Label>
                        <Input type="text" />
                    </div>
                    <div>
                        <Label>Input with Placeholder</Label>
                        <Input type="text" placeholder="info@gmail.com" />
                    </div>
                    <div>
                        <Label>Select Input</Label>
                        <div className="relative">
                            <Select
                                options={options}
                                placeholder="Select an option"
                                onChange={handleSelectChange}
                                className="dark:bg-dark-900"
                            />
                            <span className="absolute text-gray-500 -translate-y-1/2 pointer-events-none right-3 top-1/2 dark:text-gray-400">
                                <ChevronDownIcon />
                            </span>
                        </div>
                    </div>
                    <div>
                        <Label>Password Input</Label>
                        <div className="relative">
                            <Input
                                type={showPassword ? "text" : "password"}
                                placeholder="Enter your password"
                            />
                            <button
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute z-30 -translate-y-1/2 cursor-pointer right-4 top-1/2"
                            >
                                {showPassword ? (
                                    <EyeIcon className="fill-gray-500 dark:fill-gray-400" />
                                ) : (
                                    <EyeCloseIcon className="fill-gray-500 dark:fill-gray-400" />
                                )}
                            </button>
                        </div>
                    </div>

                    <div>
                        <DatePicker
                            id="date-picker"
                            label="Date Picker Input"
                            placeholder="Select a date"
                            onChange={(dates, currentDateString) => {
                                // Handle your logic
                                console.log({ dates, currentDateString });
                            }}
                        />
                    </div>

                    <div>
                        <Label htmlFor="tm">Time Picker Input</Label>
                        <div className="relative">
                            <Input
                                type="time"
                                id="tm"
                                name="tm"
                                onChange={(e) => console.log(e.target.value)}
                            />
                            <span className="absolute text-gray-500 -translate-y-1/2 pointer-events-none right-3 top-1/2 dark:text-gray-400">
                                <TimeIcon />
                            </span>
                        </div>
                    </div>
                    <div>
                        <Label htmlFor="tm">Input with Payment</Label>
                        <div className="relative">
                            <Input
                                type="text"
                                placeholder="Card number"
                                className="pl-[62px]"
                            />
                            <span className="absolute left-0 top-1/2 flex h-11 w-[46px] -translate-y-1/2 items-center justify-center border-r border-gray-200 dark:border-gray-800">
                                <svg
                                    width="20"
                                    height="20"
                                    viewBox="0 0 20 20"
                                    fill="none"
                                    xmlns="http://www.w3.org/2000/svg"
                                >
                                    <circle cx="6.25" cy="10" r="5.625" fill="#E80B26" />
                                    <circle cx="13.75" cy="10" r="5.625" fill="#F59D31" />
                                    <path
                                        d="M10 14.1924C11.1508 13.1625 11.875 11.6657 11.875 9.99979C11.875 8.33383 11.1508 6.8371 10 5.80713C8.84918 6.8371 8.125 8.33383 8.125 9.99979C8.125 11.6657 8.84918 13.1625 10 14.1924Z"
                                        fill="#FC6020"
                                    />
                                </svg>
                            </span>
                        </div>
                    </div>
                </div>
            </ComponentCard></div>

            <div className="space-y-6">
                <ComponentCard title="User List">
                    <BasicTableOne columns={columns} data={tableData} />;
                </ComponentCard>
            </div>
        </div>
    )
}

export default UserList

