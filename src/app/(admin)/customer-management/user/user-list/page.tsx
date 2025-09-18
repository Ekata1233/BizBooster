"use client";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import ComponentCard from "@/components/common/ComponentCard";
import BasicTableOne from "@/components/tables/BasicTableOne";
import {
    EyeIcon,
    ChevronDownIcon,
} from "../../../../../icons/index";
import DatePicker from '@/components/form/date-picker';
import Label from "@/components/form/Label";
import Input from "@/components/form/input/InputField";
import Select from "@/components/form/Select";
import { useUserContext } from "@/context/UserContext";
import Link from "next/link";
import axios from "axios";
import UserStatCard from "@/components/user-component/UserStatCard";
import * as XLSX from "xlsx";   // ✅ for Excel download
import { FaFileDownload } from "react-icons/fa";
import Pagination from "@/components/tables/Pagination";

export interface User {
    _id: string;
    id: string;
    image: string;
    fullName: string;
    email: string;
    mobileNumber: string;
    password: string;
    referralCode?: string;
    referredBy: string | null;
    isAgree: boolean;
    profilePhoto: string;
    otp: {
        code: string;
        expiresAt: Date;
        verified: boolean;
    };
    isEmailVerified: boolean;
    isMobileVerified: boolean;
    isDeleted: boolean;
    packageActive?: boolean;
    createdAt?: Date;
    updatedAt?: Date;
    packageStatus?: string;
}

interface TableData {
    id: number | string;
    user: User | { image: string; fullName: string };
    email: string;
    mobileNumber: string;
    referredBy: string;
    totalBookings: string;
    totalEarnings?: string;
    status: string;
}

const UserList = () => {
    const { users } = useUserContext();
    const [startDate, setStartDate] = useState<string | null>(null);
    const [endDate, setEndDate] = useState<string | null>(null);
    const [sort, setSort] = useState<string>('oldest');
    const [filteredUsers, setFilteredUsers] = useState<TableData[]>([]);
    const [message, setMessage] = useState<string>('');
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [activeTab, setActiveTab] = useState('all');
    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    const options = [
        { value: "latest", label: "Latest" },
        { value: "oldest", label: "Oldest" },
        { value: "ascending", label: "Ascending" },
        { value: "descending", label: "Descending" },
    ];

    const columns = [
        {
            header: "S.No",
            accessor: "serial",
            render: (row: TableData) => {
                const serial =
                    filteredUsers.findIndex((u) => u.id === row.id) + 1;
                return <span>{serial}</span>;
            },
        },
        {
            header: "User",
            accessor: "user",
            render: (row: TableData) => (
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 overflow-hidden rounded-full">
                        <Image
                            width={40}
                            height={40}
                            src={(row.user as any).image}
                            alt={(row.user as any).fullName || "User image"}
                        />
                    </div>
                    <div>
                        <span className="block font-medium text-gray-800 text-theme-sm dark:text-white/90">
                            {(row.user as any).fullName}
                        </span>
                    </div>
                </div>
            ),
        },
        {
            header: "Contact Info",
            accessor: "contactInfo",
            render: (row: TableData) => (
                <div className="text-sm text-gray-700">
                    <div>{row?.email || 'N/A'}</div>
                    <div>{row?.mobileNumber || 'N/A'}</div>
                </div>
            ),
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
            header: "Total Earnings",
            accessor: "totalEarnings",
        },
        {
            header: "Status",
            accessor: "status",
            render: (row: TableData) => {
                const status = row.status;
                let colorClass = "";

                switch (status) {
                    case "Deleted":
                        colorClass = "text-red-500 bg-red-100 border border-red-300";
                        break;
                    case "GP":
                        colorClass = "text-green-600 bg-green-100 border border-green-300";
                        break;
                    case "SGP":
                        colorClass = "text-blue-600 bg-blue-100 border border-blue-300";
                        break;
                    case "PGP":
                        colorClass = "text-purple-600 bg-purple-100 border border-purple-300";
                        break;
                    case "NonGP":
                        colorClass = "text-yellow-600 bg-yellow-100 border border-yellow-300";
                        break;
                    default:
                        colorClass = "text-gray-600 bg-gray-100 border border-gray-300";
                }

                return (
                    <span className={`px-2 py-1 rounded-full text-xs ${colorClass}`}>
                        {status}
                    </span>
                );
            },
        },
        {
            header: "Action",
            accessor: "action",
            render: (row: TableData) => (
                <div className="flex gap-2">
                    <Link href={`/customer-management/user/user-list/${row.id}`} passHref>
                        <button className="text-blue-500 border border-blue-500 rounded-md p-2 hover:bg-blue-500 hover:text-white hover:border-blue-500">
                            <EyeIcon />
                        </button>
                    </Link>
                </div>
            ),
        },
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
                ...(searchQuery && { search: searchQuery }),
            };

            const response = await axios.get('/api/users', { params });
            const data = response.data;

            if (data.users.length === 0) {
                setFilteredUsers([]);
                setMessage(data.message || 'No users found');
            } else {
                const mapped = await Promise.all(
                    data.users.map(async (user: User) => {
                        const referrer = data.users.find((u: User) => u._id === user.referredBy);

                        let totalLeads = 0;
                        try {
                            const res = await axios.get(`/api/checkout/lead-by-user/${user._id}`);
                            if (res.data.success && Array.isArray(res.data.data)) {
                                totalLeads = res.data.data.length;
                            }
                        } catch (err) {
                            console.error(`Error fetching leads for user ${user._id}:`, err);
                        }

                        let walletBalance = 0;
                        try {
                            const walletRes = await axios.get(`/api/wallet/fetch-by-user/${user._id}`);
                            if (walletRes.data.success && walletRes.data.data?.balance != null) {
                                walletBalance = walletRes.data.data.balance;
                            }
                        } catch (err) {
                            console.error(`Error fetching wallet for user ${user._id}:`, err);
                        }

                        return {
                            id: user._id,
                            user: {
                                image: user.profilePhoto || "/images/logo/user1.png",
                                fullName: user.fullName,
                            },
                            email: user.email,
                            mobileNumber: user.mobileNumber,
                            referredBy: referrer?.fullName || "N/A",
                            totalBookings: totalLeads.toString(),
                            totalEarnings: walletBalance.toString(),
                            status: user.isDeleted
                                ? "Deleted"
                                : user.packageStatus === "GP"
                                    ? "GP"
                                    : user.packageStatus === "SGP"
                                        ? "SGP"
                                        : user.packageStatus === "PGP"
                                            ? "PGP"
                                            : "NonGP",
                        };
                    })
                );

                setFilteredUsers(mapped.reverse());
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
    }, [startDate, endDate, sort, searchQuery]);

    const getFilteredByStatus = () => {
        if (activeTab === 'gp') {
            return filteredUsers.filter(user => user.status === 'GP');
        } else if (activeTab === 'sgp') {
            return filteredUsers.filter(user => user.status === 'SGP');
        } else if (activeTab === 'pgp') {
            return filteredUsers.filter(user => user.status === 'PGP');
        } else if (activeTab === 'nonGP') {
            return filteredUsers.filter(user => user.status === 'NonGP');
        }
        return filteredUsers;
    };

    const handleDownload = () => {
        const dataToExport = getFilteredByStatus().map((u) => ({
            Name: (u.user as any).fullName,
            Email: u.email,
            Mobile: u.mobileNumber,
            "Referred By": u.referredBy,
            "Total Bookings": u.totalBookings,
            "Total Earnings": u.totalEarnings,
            Status: u.status,
        }));

        if (dataToExport.length === 0) {
            alert("No data available for download");
            return;
        }

        const worksheet = XLSX.utils.json_to_sheet(dataToExport);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Users");

        const fileName = `UserList_${activeTab}_${startDate || "all"}_to_${endDate || "all"}.xlsx`;
        XLSX.writeFile(workbook, fileName);
    };

    const paginatedData = getFilteredByStatus();
    const totalPages = Math.ceil(paginatedData.length / rowsPerPage);
    const indexOfLastRow = currentPage * rowsPerPage;
    const indexOfFirstRow = indexOfLastRow - rowsPerPage;
    const currentRows = paginatedData.slice(indexOfFirstRow, indexOfLastRow);

    // ✅ Reset to first page when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [startDate, endDate, sort, searchQuery, activeTab]);

    if (!users) {
        return <div>Loading...</div>;
    }

    return (
        <div>
            <PageBreadcrumb pageTitle="User List" />

            <div>
                <UserStatCard />
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
                                    setStartDate(currentDateString);
                                }}
                            />
                        </div>
                        <div>
                            <DatePicker
                                id="end-date-picker"
                                label="End Date"
                                placeholder="Select a date"
                                onChange={(dates, currentDateString) => {
                                    setEndDate(currentDateString);
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
                            <Input
                                type="text"
                                placeholder="Search by name, email, or phone"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </div>
                </ComponentCard>
            </div>

            <div>
                <ComponentCard title="User List" className="">
                    <div className="flex justify-between items-center border-b border-gray-200 pb-2">
                        <ul className="flex space-x-6 text-sm font-medium text-center text-gray-500">
                            <li
                                className={`cursor-pointer px-4 py-2 ${activeTab === 'all' ? 'border-b-2 border-blue-600 text-blue-600' : ''}`}
                                onClick={() => setActiveTab('all')}
                            >
                                All
                                <span className="ml-2 bg-red-500 text-white text-xs font-semibold px-2 py-0.5 rounded-full">
                                    {filteredUsers.length}
                                </span>
                            </li>
                            <li
                                className={`cursor-pointer px-4 py-2 ${activeTab === 'gp' ? 'border-b-2 border-blue-600 text-blue-600' : ''}`}
                                onClick={() => setActiveTab('gp')}
                            >
                                GP
                                <span className="ml-2 bg-red-500 text-white text-xs font-semibold px-2 py-0.5 rounded-full">
                                    {filteredUsers.filter((user) => user.status === 'GP').length}
                                </span>
                            </li>
                            <li
                                className={`cursor-pointer px-4 py-2 ${activeTab === 'sgp' ? 'border-b-2 border-blue-600 text-blue-600' : ''}`}
                                onClick={() => setActiveTab('sgp')}
                            >
                                SGP
                                <span className="ml-2 bg-red-500 text-white text-xs font-semibold px-2 py-0.5 rounded-full">
                                    {filteredUsers.filter((user) => user.status === 'SGP').length}
                                </span>
                            </li>
                            <li
                                className={`cursor-pointer px-4 py-2 ${activeTab === 'pgp' ? 'border-b-2 border-blue-600 text-blue-600' : ''}`}
                                onClick={() => setActiveTab('pgp')}
                            >
                                PGP
                                <span className="ml-2 bg-red-500 text-white text-xs font-semibold px-2 py-0.5 rounded-full">
                                    {filteredUsers.filter((user) => user.status === 'PGP').length}
                                </span>
                            </li>
                            <li
                                className={`cursor-pointer px-4 py-2 ${activeTab === 'nonGP' ? 'border-b-2 border-blue-600 text-blue-600' : ''}`}
                                onClick={() => setActiveTab('nonGP')}
                            >
                                NonGP
                                <span className="ml-2 bg-red-500 text-white text-xs font-semibold px-2 py-0.5 rounded-full">
                                    {filteredUsers.filter((user) => user.status === 'NonGP').length}
                                </span>
                            </li>
                        </ul>

                        {/* ✅ Download Button */}
                        <button
                            onClick={handleDownload}
                            className="flex items-center gap-2 px-4 py-2 text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 transition"
                        >
                            <FaFileDownload className="w-5 h-5" />
                            <span>Download Excel</span>
                        </button>
                    </div>
                    {message ? (
                        <p className="text-red-500 text-center my-4">{message}</p>
                    ) : (
                        <div>
                            <BasicTableOne columns={columns} data={currentRows} />

                            {/* ✅ Pagination */}
                            <div className="flex justify-center mt-4">
                                <Pagination
                                    currentPage={currentPage}
                                    totalItems={paginatedData.length}
                                    totalPages={totalPages}
                                    onPageChange={setCurrentPage}
                                />
                            </div>
                        </div>)}
                </ComponentCard>
            </div>
        </div>
    );
};

export default UserList;
