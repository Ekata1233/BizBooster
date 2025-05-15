'use client';
import PageBreadcrumb from '@/components/common/PageBreadCrumb'
import UserStatCard from '@/components/user-profile/UserAddressCard'
import UserInfoCard from '@/components/user-profile/UserInfoCard'
import UserMetaCard from '@/components/user-profile/UserMetaCard'
import React, { useEffect, useState } from 'react'
import { useUserContext } from '@/context/UserContext';
import { useParams } from 'next/navigation';
import ComponentCard from '@/components/common/ComponentCard';
import BasicTableOne from '@/components/tables/BasicTableOne';
import { EyeIcon, PencilIcon, TrashBinIcon } from '@/icons';
import Link from 'next/link';

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
        header: "Booking Id",
        accessor: "bookingId",
    },
   {
        header: "Provider Info",
        accessor: "providerInfo",
    },
    {
        header: "Total Amount",
        accessor: "totalAmount",
    },
    {
        header: "Booking Status",
        accessor: "bookingStatus",
    },
    {
        header: "Payment Status",
        accessor: "paymentStatus",
        render: (row: TableData) => {
            const status = row.status;
            let colorClass = "";


            switch (status) {
                case "Deleted":
                    colorClass = "text-red-500 bg-red-100 border border-red-300";
                    break;
                case "Active":
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
        header: "Booking Date",
        accessor: "bookingDate",
    },
    {
        header: "Action",
        accessor: "action",
        render: (row: TableData) => {
            console.log("row id ", row.id)
            return (<div className="flex gap-2">
                <button className="text-yellow-500 border border-yellow-500 rounded-md p-2 hover:bg-yellow-500 hover:text-white hover:border-yellow-500">
                    <PencilIcon />
                </button>
                <button className="text-red-500 border border-red-500 rounded-md p-2 hover:bg-red-500 hover:text-white hover:border-red-500">
                    <TrashBinIcon />
                </button>
                <Link href={`/customer-management/user/user-list/${row.id}`} passHref>
                    <button className="text-blue-500 border border-blue-500 rounded-md p-2 hover:bg-blue-500 hover:text-white hover:border-blue-500">
                        <EyeIcon />
                    </button>
                </Link>
            </div>)
        },
    },
];

const data = [
  {
    id: 1,
    bookingId: 'BK001',
    providerInfo: 'Travela Tours',
    totalAmount: '$1200',
    bookingStatus: 'Confirmed',
    paymentStatus: 'Active',
    bookingDate: '2025-04-01',
    user: {
      _id: '1',
      id: '1',
      image: '/images/user1.png',
      fullName: 'Aniket Patil',
      email: 'aniket@example.com',
      mobileNumber: '9876543210',
      password: '',
      referralCode: 'REF123',
      referredBy: null,
      isAgree: true,
      otp: {
        code: '1234',
        expiresAt: new Date(),
        verified: true,
      },
      isEmailVerified: true,
      isMobileVerified: true,
      isDeleted: false,
    },
    email: 'aniket@example.com',
    mobileNumber: '9876543210',
    referredBy: 'None',
    totalBookings: '3',
    status: 'Active',
  },
  {
    id: 2,
    bookingId: 'BK002',
    providerInfo: 'GoWild Adventures',
    totalAmount: '$890',
    bookingStatus: 'Pending',
    paymentStatus: 'Not Verified',
    bookingDate: '2025-04-10',
    user: {
      _id: '2',
      id: '2',
      image: '/images/user2.png',
      fullName: 'Riya Mehta',
      email: 'riya@example.com',
      mobileNumber: '9123456789',
      password: '',
      referralCode: 'REF456',
      referredBy: null,
      isAgree: true,
      otp: {
        code: '5678',
        expiresAt: new Date(),
        verified: false,
      },
      isEmailVerified: true,
      isMobileVerified: false,
      isDeleted: false,
    },
    email: 'riya@example.com',
    mobileNumber: '9123456789',
    referredBy: 'None',
    totalBookings: '5',
    status: 'Not Verified',
  },
  {
    id: 3,
    bookingId: 'BK003',
    providerInfo: 'ExploreNow',
    totalAmount: '$1500',
    bookingStatus: 'Cancelled',
    paymentStatus: 'Deleted',
    bookingDate: '2025-05-01',
    user: {
      _id: '3',
      id: '3',
      image: '/images/user3.png',
      fullName: 'Rahul Sharma',
      email: 'rahul@example.com',
      mobileNumber: '9012345678',
      password: '',
      referralCode: '',
      referredBy: null,
      isAgree: true,
      otp: {
        code: '0000',
        expiresAt: new Date(),
        verified: false,
      },
      isEmailVerified: false,
      isMobileVerified: true,
      isDeleted: true,
    },
    email: 'rahul@example.com',
    mobileNumber: '9012345678',
    referredBy: 'None',
    totalBookings: '1',
    status: 'Deleted',
  },
];


const UserDetails = () => {
    const {
        fetchSingleUser,
        singleUser,
        singleUserLoading,
        singleUserError,
    } = useUserContext();

    const params = useParams();
    const userId = params?.id as string;

    const [activeTab, setActiveTab] = useState('info');

    useEffect(() => {
        if (userId) {
            fetchSingleUser(userId);
        }
    }, [userId]);

    if (singleUserLoading) return <div className="text-center text-gray-500">Loading user...</div>;
    if (singleUserError) return <div className="text-center text-red-500">Error: {singleUserError}</div>;
    if (!singleUser) return <div className="text-center text-gray-500">No user found.</div>;

    return (
        <div>
            <PageBreadcrumb pageTitle="User Details" />
            <div className="space-y-6">
                <UserMetaCard
                    imageSrc="/images/logo/user1.webp"
                    name={singleUser.fullName}
                    role={singleUser.email}
                    location="Amanora Chember, Hadapsar, Pune"
                />

                {/* Tabs Navigation */}
                <div className="border-b border-gray-200">
                    <ul className="flex space-x-6 text-sm font-medium text-center text-gray-500">
                        <li
                            className={`cursor-pointer px-4 py-2 ${activeTab === 'info' ? 'border-b-2 border-blue-600 text-blue-600' : ''}`}
                            onClick={() => setActiveTab('info')}
                        >
                            User Info
                        </li>
                        <li
                            className={`cursor-pointer px-4 py-2 ${activeTab === 'stats' ? 'border-b-2 border-blue-600 text-blue-600' : ''}`}
                            onClick={() => setActiveTab('stats')}
                        >
                            Stats
                        </li>
                        <li
                            className={`cursor-pointer px-4 py-2 ${activeTab === 'bookings' ? 'border-b-2 border-blue-600 text-blue-600' : ''}`}
                            onClick={() => setActiveTab('bookings')}
                        >
                            Bookings
                        </li>
                    </ul>
                </div>

                {/* Tab Content */}
                <div className="space-y-6 pt-4">
                    {activeTab === 'info' && (
                        <UserInfoCard
                            fullName={singleUser.fullName}
                            email={singleUser.email}
                            phone={singleUser.mobileNumber}
                            referralCode={singleUser.referralCode || " "}
                            address="Amanora Chember, Hadapsar, Pune"
                        />
                    )}

                    {activeTab === 'stats' && (
                        <UserStatCard
                            stat1={{
                                title: "Total Booking",
                                value: "20",
                            }}
                            stat2={{
                                title: "Total Revenue",
                                value: "$8420",
                            }}
                            stat3={{
                                title: "Other",
                                value: "420",
                            }}
                            stat4={{
                                title: "Next Other",
                                value: "320",
                            }}
                        />
                    )}

                    {activeTab === 'bookings' && (
                        <ComponentCard title="User Booking Details" className="">
                            <BasicTableOne columns={columns} data={data} />
                        </ComponentCard>
                    )}
                </div>
            </div>
        </div>
    )
}

export default UserDetails;
