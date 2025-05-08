"use client";
import React, { useEffect, useState } from "react";
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
    UserIcon,
    CalenderIcon,
    DollarLineIcon,
} from "../../../../../icons/index";
import StatCard from "@/components/common/StatCard";
import DatePicker from '@/components/form/date-picker';
import Label from "@/components/form/Label";
import Input from "@/components/form/input/InputField";
import Select from "@/components/form/Select";
import { useUserContext } from "@/context/UserContext";
import Link from "next/link";
import axios from "axios";

// Define the type for the table data
interface User {
    _id:string;
    image: string;
    fullName: string;
    email: string;
    mobileNumber: string;
    password: string;
    referralCode?: string;
    referredBy: string | null;
    isAgree: boolean;
    // otp: OTP;
    isEmailVerified: boolean;
    isMobileVerified: boolean;
    isDeleted: boolean;
    createdAt?: Date;
    updatedAt?: Date;
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
                        alt={row.user.fullName || "User image"}
                    />
                </div>
                <div>
                    <span className="block font-medium text-gray-800 text-theme-sm dark:text-white/90">
                        {row.user.fullName}
                    </span>
                    
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
    const [startDate, setStartDate] = useState<string | null>(null);
    const [endDate, setEndDate] = useState<string | null>(null);
    const [sort, setSort] = useState<string>('oldest');
    const [filteredUsers, setFilteredUsers] = useState<TableData[]>([]);
    const [message, setMessage] = useState<string>('');

    const options = [
        { value: "latest", label: "Latest" },
        { value: "oldest", label: "Oldest" },
        { value: "ascending", label: "Ascending" },
        { value: "descending", label: "Descending" },
    ];

    const fetchFilteredUsers = async () => {
        try {
            const isValidDate = (date: string | null) => {
                return date && !isNaN(Date.parse(date));
            };


            const params = {
                ...(isValidDate(startDate) && { startDate }),
                ...(isValidDate(endDate) && { endDate }),
                ...(sort && { sort }),
            };

            const response = await axios.get('/api/users', { params });

            const data = response.data;

            if (data.users.length === 0) {
                setFilteredUsers([]);
                setMessage(data.message || 'No users found');
            } else {

                const mapped = data.users.map((user: User) => ({
                    id: user._id,
                    user: {
                        image: user.image || "/images/logo/user1.webp",
                        fullName: user.fullName,
                    },
                    email: user.email,
                    mobileNumber: user.mobileNumber,
                    referredBy: user.referredBy || "N/A",
                    totalBookings: "0",
                    status: user.isDeleted ? "Inactive" : "Active",
                }));
                setFilteredUsers(mapped);
                setMessage('');
            }
        } catch (error) {
            console.error('Error fetching users:', error);
            setFilteredUsers([]);
            setMessage('Something went wrong while fetching users');
        }
    };
    useEffect(() => {
        fetchFilteredUsers();
    }, [startDate, endDate, sort]);
    if (!users) {
        return <div>Loading...</div>;
        return <div>Loading...</div>;
    }




    return (
        <div>
            <PageBreadcrumb pageTitle="User List" />
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 md:gap-6 my-5">
                <StatCard
                    title="Total Users"
                    value={users.length}
                    icon={UserIcon}
                    badgeColor="success"
                    badgeValue="6.88%"
                    badgeIcon={ArrowUpIcon}
                />
                <StatCard
                    title="Total Booking"
                    value="20"
                    icon={CalenderIcon}
                    badgeColor="success"
                    badgeValue="6.88%"
                    badgeIcon={ArrowUpIcon}
                />
                <StatCard
                    title="Total Revenue"
                    value="$8420"
                    icon={DollarLineIcon}
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
                                id="start-date-picker"
                                label="Start Date"
                                placeholder="Select a date"
                                onChange={(dates, currentDateString) => {
                                    setStartDate(currentDateString); // Ensure proper format if needed
                                }}
                            />
                        </div>
                        <div>
                            <DatePicker
                                id="end-date-picker"
                                label="End Date"
                                placeholder="Select a date"
                                onChange={(dates, currentDateString) => {
                                    setEndDate(currentDateString); // Ensure proper format if needed
                                    setEndDate(currentDateString); // Ensure proper format if needed
                                }}
                            />
                        </div>


                        <div>
                            <Label>Select Input</Label>
                            <div className="relative">
                                <Select
                                    options={options}
                                    placeholder="Sort By"
                                    onChange={(value: string) => setSort(value)}
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
                    {message ? (
                        <p className="text-red-500 text-center my-4">{message}</p>
                    ) : (
                        <BasicTableOne columns={columns} data={filteredUsers} />
                    )}

                </ComponentCard>
            </div>
        </div>
    );
};

export default UserList;