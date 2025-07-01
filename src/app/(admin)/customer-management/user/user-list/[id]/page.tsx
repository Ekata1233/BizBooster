'use client';
import PageBreadcrumb from '@/components/common/PageBreadCrumb';
import UserStatCard from '@/components/user-profile/UserAddressCard';
import UserInfoCard from '@/components/user-profile/UserInfoCard';
import UserMetaCard from '@/components/user-profile/UserMetaCard';
import React, { useEffect, useState } from 'react';
import { useUserContext } from '@/context/UserContext';
import { useParams } from 'next/navigation';
import ComponentCard from '@/components/common/ComponentCard';
import BasicTableOne from '@/components/tables/BasicTableOne';
import { EyeIcon, PencilIcon, TrashBinIcon } from '@/icons';
import Link from 'next/link';
import SelfLeadTable from '@/components/user-profile/SelfLeadTable';

const columnsTeamLead = [
  { header: 'Booking Id', accessor: 'bookingId' },
  { header: 'Provider Info', accessor: 'providerInfo' },
  { header: 'Total Amount', accessor: 'totalAmount' },
  { header: 'Booking Status', accessor: 'bookingStatus' },
  {
    header: 'Payment Status',
    accessor: 'paymentStatus',
    render: (row: any) => {
      const status = row.status;
      let colorClass = '';
      switch (status) {
        case 'Deleted':
          colorClass = 'text-red-500 bg-red-100 border border-red-300';
          break;
        case 'Active':
          colorClass = 'text-green-600 bg-green-100 border-green-300 border';
          break;
        case 'Not Verified':
          colorClass = 'text-yellow-600 bg-yellow-100 border-yellow-300 border';
          break;
        default:
          colorClass = 'text-gray-600 bg-gray-100 border-gray-300 border';
      }

      return (
        <span className={`px-2 py-1 rounded-full text-xs ${colorClass}`}>
          {status}
        </span>
      );
    },
  },
  { header: 'Booking Date', accessor: 'bookingDate' },
  {
    header: 'Action',
    accessor: 'action',
    render: (row: any) => (
      <div className="flex gap-2">
        <button className="text-yellow-500 border border-yellow-500 rounded-md p-2 hover:bg-yellow-500 hover:text-white">
          <PencilIcon />
        </button>
        <button className="text-red-500 border border-red-500 rounded-md p-2 hover:bg-red-500 hover:text-white">
          <TrashBinIcon />
        </button>
        <Link href={`/customer-management/user/user-list/${row.id}`} passHref>
          <button className="text-blue-500 border border-blue-500 rounded-md p-2 hover:bg-blue-500 hover:text-white">
            <EyeIcon />
          </button>
        </Link>
      </div>
    ),
  },
];

const dataTeamLead = [
  {
    id: 1,
    bookingId: 'BK001',
    providerInfo: 'Travela Tours',
    totalAmount: '$1200',
    bookingStatus: 'Confirmed',
    paymentStatus: 'Active',
    bookingDate: '2025-04-01',
    status: 'Active',
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

  if (singleUserLoading)
    return <div className="text-center text-gray-500">Loading user...</div>;
  if (singleUserError)
    return <div className="text-center text-red-500">Error: {singleUserError}</div>;
  if (!singleUser)
    return <div className="text-center text-gray-500">No user found.</div>;

  const tabButtons = [
    { key: 'info', label: 'User Info' },
    { key: 'stats', label: 'Stats' },
    { key: 'teamLead', label: 'Team Lead' },
    { key: 'selfLead', label: 'Self Lead' },
    { key: 'wallet', label: 'Wallet' },
    { key: 'guarantee', label: '5x Guarantee' },
    { key: 'settings', label: 'Settings' },
  ];

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

        {/* Tabs */}
        <div className="grid grid-cols-7 gap-2 pt-2">
          {tabButtons.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`w-full px-4 py-2 text-sm font-medium rounded-md border ${
                activeTab === tab.key
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-blue-50'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div className="space-y-6 pt-4">
          {activeTab === 'info' && (
            <UserInfoCard
              fullName={singleUser.fullName}
              email={singleUser.email}
              phone={singleUser.mobileNumber}
              referralCode={singleUser.referralCode || ' '}
              address="Amanora Chember, Hadapsar, Pune"
            />
          )}

          {activeTab === 'stats' && (
            <UserStatCard
              stat1={{ title: 'Total Booking', value: '20' }}
              stat2={{ title: 'Total Revenue', value: '$8420' }}
              stat3={{ title: 'Other', value: '420' }}
              stat4={{ title: 'Next Other', value: '320' }}
            />
          )}

          {activeTab === 'teamLead' && (
            <ComponentCard title="Team Lead Bookings">
              <BasicTableOne columns={columnsTeamLead} data={dataTeamLead} />
            </ComponentCard>
          )}

          {activeTab === 'selfLead' && <SelfLeadTable />}

          {activeTab === 'wallet' && (
            <ComponentCard title="Wallet">
              <div className="text-gray-600">Wallet info goes here.</div>
            </ComponentCard>
          )}

          {activeTab === 'guarantee' && (
            <ComponentCard title="5x Guarantee">
              <div className="text-gray-600">5x Guarantee info goes here.</div>
            </ComponentCard>
          )}

          {activeTab === 'settings' && (
            <ComponentCard title="Settings">
              <div className="text-gray-600">Settings and preferences go here.</div>
            </ComponentCard>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserDetails;
