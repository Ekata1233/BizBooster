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
    ChevronDownIcon,
} from "../../../../../icons/index";
import DatePicker from '@/components/form/date-picker';
import Label from "@/components/form/Label";
import Input from "@/components/form/input/InputField";
import Select from "@/components/form/Select";
import { useUserContext } from "@/context/UserContext";
// import { useCertificate } from "@/context/CertificationContext";
import Link from "next/link";
import axios from "axios";
import UserStatCard from "@/components/user-component/UserStatCard";

// Define the type for the table data
interface User {
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
    otp: {
        code: string;
        expiresAt: Date;
        verified: boolean;
    };
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
  header: "Contact Info",
  accessor: "contactInfo", // dummy accessor, not used
  render: (row: TableData) => {
    // console.log("dfdffd",row); 
    return (
      <div className="text-sm text-gray-700">
        <div>{row?.email || 'N/A'}</div>
        <div>{row?.mobileNumber || 'N/A'}</div>
      </div>
    );
  },
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
                case "Verified":
                    colorClass = "text-green-600 bg-green-100 border border-green-300";
                    break;
                case "Not Verified":
                    colorClass = "text-yellow-600 bg-yellow-100 border border-yellow-300";
                    break;
                default:
                    colorClass = "text-gray-600 bg-gray-100 border border-gray-300";
            }

            return (
                <span className={`px-2 py-1 rounded-full text-xs  ${colorClass}`}>
                    {status}
                </span>
            );
        },
    },
    {
        header: "Action",
        accessor: "action",
        render: (row: TableData) => {
            // console.log("row id ", row.id)
            return (<div className="flex gap-2">
                {/* <button className="text-yellow-500 border border-yellow-500 rounded-md p-2 hover:bg-yellow-500 hover:text-white hover:border-yellow-500">
                    <PencilIcon />
                </button>
                <button className="text-red-500 border border-red-500 rounded-md p-2 hover:bg-red-500 hover:text-white hover:border-red-500">
                    <TrashBinIcon />
                </button> */}
                <Link href={`/customer-management/user/user-list/${row.id}`} passHref>
                    <button className="text-blue-500 border border-blue-500 rounded-md p-2 hover:bg-blue-500 hover:text-white hover:border-blue-500">
                        <EyeIcon />
                    </button>
                </Link>
            </div>)
        },
    },
];

const UserList = () => {
    const { users } = useUserContext();
    const [startDate, setStartDate] = useState<string | null>(null);
    const [endDate, setEndDate] = useState<string | null>(null);
    const [sort, setSort] = useState<string>('oldest');
    const [filteredUsers, setFilteredUsers] = useState<TableData[]>([]);
    const [message, setMessage] = useState<string>('');
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [activeTab, setActiveTab] = useState('all');

    console.log("user list : ", users)

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

    // Fetch lead count for this user
    let totalLeads = 0;
    try {
      const res = await axios.get(`/api/checkout/lead-by-user/${user._id}`);
      if (res.data.success && Array.isArray(res.data.data)) {
        totalLeads = res.data.data.length;
      }
    } catch (err) {
      console.error(`Error fetching leads for user ${user._id}:`, err);
    }

    // ✅ Fetch wallet balance for this user
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
        image: user.image || "/images/logo/user1.webp",
        fullName: user.fullName,
      },
      email: user.email,
      mobileNumber: user.mobileNumber,
      referredBy: referrer?.fullName || "N/A",
      totalBookings: totalLeads.toString(),
      totalEarnings: walletBalance.toString(), // ✅ now actual wallet balance
      status: user.isDeleted
        ? "Deleted"
        : user.otp?.verified
        ? "Verified"
        : "Not Verified",
    };
  })
);



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
    }, [startDate, endDate, sort, searchQuery]);

    const getFilteredByStatus = () => {
        if (activeTab === 'verified') {
            return filteredUsers.filter(user => user.status === 'Verified');
        } else if (activeTab === 'notVerified') {
            return filteredUsers.filter(user => user.status === 'Not Verified');
        }
        return filteredUsers;
    };

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
                    <div className="border-b border-gray-200">
                        <ul className="flex space-x-6 text-sm font-medium text-center text-gray-500">
                            <li
                                className={`cursor-pointer px-4 py-2 ${activeTab === 'all' ? 'border-b-2 border-blue-600 text-blue-600' : ''}`}
                                onClick={() => setActiveTab('all')}
                            >
                                All
                            </li>
                            <li
                                className={`cursor-pointer px-4 py-2 ${activeTab === 'verified' ? 'border-b-2 border-blue-600 text-blue-600' : ''}`}
                                onClick={() => setActiveTab('verified')}
                            >
                                Verified
                            </li>
                            <li
                                className={`cursor-pointer px-4 py-2 ${activeTab === 'notVerified' ? 'border-b-2 border-blue-600 text-blue-600' : ''}`}
                                onClick={() => setActiveTab('notVerified')}
                            >
                                Not Verified
                            </li>
                        </ul>
                    </div>
                    {message ? (
                        <p className="text-red-500 text-center my-4">{message}</p>
                    ) : (
                        <BasicTableOne columns={columns} data={getFilteredByStatus()} />
                    )}

                </ComponentCard>
            </div>
        </div>
    );
};

export default UserList;