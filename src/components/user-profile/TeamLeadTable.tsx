'use client';

import React, { useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import ComponentCard from '@/components/common/ComponentCard';
import BasicTableOne from '@/components/tables/BasicTableOne';
import { EyeIcon } from '@/icons';
import img from '../../../public/images/logo/user1.webp';
import { useUserContext } from '@/context/UserContext';

interface TeamLeadData {
  id: string;
  userPhoto: string;
  userName: string;
  userEmail: string;
  userPhone: string;
  joinDate: string;
  status: string;
  teamCount: number;
  myEarnings: string;
  kycStatus: 'completed' | 'pending' | 'not started';
  leadCount: number;
}

interface TeamLeadProps {
  userId: string;
  isAction: boolean;
}


const TeamLeadTable = ({ userId, isAction }: TeamLeadProps) => {
  const { referredUsers, referredUsersLoading, fetchUsersByReferral } = useUserContext();

  useEffect(() => {
    if (userId) {
      fetchUsersByReferral(userId);
    }
  }, [userId]);

  if (referredUsersLoading) {
    return <div className="p-4 text-center text-gray-500">Loading...</div>;
  }

  const dataTeamLead: TeamLeadData[] =
    referredUsers?.map((user) => ({
      id: user._id,
      userPhoto: img.src,
      userName: user.fullName,
      userEmail: user.email,
      userPhone: user.mobileNumber,
      joinDate: new Date(user.createdAt).toLocaleDateString('en-IN'),
      status: 'GP',
      teamCount: Math.floor(Math.random() * 10 + 1),
      myEarnings: '',
      kycStatus: 'pending',
      leadCount: Math.floor(Math.random() * 30 + 1),
    })) || [];

  // ✅ Define columns inside component so userId is accessible
  const columnsTeamLead = [
    {
      header: 'User Details',
      accessor: 'userDetails',
      render: (row: TeamLeadData) => (
        <div className="flex items-center gap-3">
          <Image
            src={row.userPhoto}
            alt="user"
            width={40}
            height={40}
            className="rounded-full"
          />
          <div className="text-sm text-gray-700">
            <div className="font-semibold">{row.userName}</div>
            <div>{row.userEmail}</div>
            <div>{row.userPhone}</div>
            <div className="text-xs text-gray-500">Joined {row.joinDate}</div>
          </div>
        </div>
      ),
    },
    {
      header: 'Status',
      accessor: 'status',
      render: () => (
        <div>
          <div className="bg-green-100 border border-green-300 text-green-600 px-3 py-1 text-xs rounded-full text-center leading-tight">
            GP
          </div>
          <div className="text-[11px] font-medium">ID:23489</div>
        </div>
      ),
    },
    {
      header: 'Team Count',
      accessor: 'teamCount',
      render: (row: any) => (
        <div className="text-center border border-yellow-300 bg-yellow-100 text-yellow-600 px-3 py-1 text-xs rounded-full text-center leading-tight">
          {row.teamCount}
        </div>
      ),
    },
    {
      header: 'My Earnings',
      accessor: 'myEarnings',
      render: () => (
        <div className="text-sm">
          <div>Direct: ₹30,000</div>
          <div>Network: ₹30,000</div>
        </div>
      ),
    },
    {
      header: 'KYC',
      accessor: 'kycStatus',
      render: (row: TeamLeadData) => {
        const status = row.kycStatus;
        const color =
          status === 'completed'
            ? 'green'
            : status === 'pending'
              ? 'yellow'
              : 'gray';

        return (
          <span
            className={`text-${color}-600 bg-${color}-100 px-2 py-1 text-xs rounded-full border border-${color}-300`}
          >
            {status}
          </span>
        );
      },
    },
    {
      header: 'Lead',
      accessor: 'leadCount',
    },
    ...(isAction
      ? [
        {
          header: 'Action',
          accessor: 'action',
          render: (row: TeamLeadData) => (
            <Link href={`/customer-management/user/user-list/${userId}/leads/${row.id}`} passHref>
              <button className="text-blue-500 border border-blue-500 rounded-md p-2 hover:bg-blue-500 hover:text-white">
                <EyeIcon />
              </button>
            </Link>
          ),
        },
      ]
      : []),
  ];

  return (
    <ComponentCard title="Team Lead Table">
      <BasicTableOne columns={columnsTeamLead} data={dataTeamLead} />
    </ComponentCard>
  );
};


export default TeamLeadTable;
