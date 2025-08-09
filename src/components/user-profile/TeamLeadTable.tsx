'use client';

import React, { useEffect, useState } from 'react';
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
  leadCount: number;
}

interface TeamLeadProps {
  userId: string;
  isAction: boolean;
}

const TeamLeadTable = ({ userId, isAction }: TeamLeadProps) => {
  const [dataTeamLead, setDataTeamLead] = useState<TeamLeadData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTeam = async () => {
      try {
        const res = await fetch(`/api/team-build/my-team/${userId}`);
        const json = await res.json();

        if (json.success && Array.isArray(json.team)) {
          const formatted = json.team.map((member: any) => {
            const user = member.user;

            return {
              id: user._id,
              userPhoto: user.profilePhoto || img.src,
              userName: user.fullName,
              userEmail: user.email,
              userPhone: user.mobileNumber,
              joinDate: new Date(user.createdAt).toLocaleDateString('en-IN'),
              status: user.packageActive ? 'GP' : 'Non-GP',
              teamCount: member.team?.length || 0,
              myEarnings: `₹${(member.totalEarningsFromShare_2 || 0).toLocaleString()}`,
              leadCount: member.leads?.length || 0,
            };
          });

          setDataTeamLead(formatted);
        }
      } catch (error) {
        console.error('Failed to fetch team data', error);
      } finally {
        setLoading(false);
      }
    };

    if (userId) fetchTeam();
  }, [userId]);

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
      render: (row: TeamLeadData) => (
        <div>
          <div
            className={`${
              row.status === 'GP'
                ? 'bg-green-100 border-green-300 text-green-600'
                : 'bg-red-100 border-red-300 text-red-600'
            } border px-3 py-1 text-xs rounded-full text-center leading-tight`}
          >
            {row.status}
          </div>
        </div>
      ),
    },
    {
      header: 'Team Count',
      accessor: 'teamCount',
      render: (row: TeamLeadData) => (
        <div className="text-center border border-yellow-300 bg-yellow-100 text-yellow-600 px-3 py-1 text-xs rounded-full text-center leading-tight">
          {row.teamCount}
        </div>
      ),
    },
    {
      header: 'My Earnings',
      accessor: 'myEarnings',
      render: (row: TeamLeadData) => (
        <div className="text-sm">{row.myEarnings}</div>
      ),
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
              <Link
                href={`/customer-management/user/user-list/${userId}/leads/${row.id}`}
                passHref
              >
                <button className="text-blue-500 border border-blue-500 rounded-md p-2 hover:bg-blue-500 hover:text-white">
                  <EyeIcon />
                </button>
              </Link>
            ),
          },
        ]
      : []),
  ];

  if (loading) {
    return <div className="p-4 text-center text-gray-500">Loading...</div>;
  }

  if (!dataTeamLead.length) {
    return (
      <ComponentCard title="Team Lead Table">
        <div className="p-6 text-gray-600">
          No team leads found at the moment. Once users join through your referral, they will appear here.
        </div>
      </ComponentCard>
    );
  }

  return (
    <ComponentCard title="Team Lead Table">
      <BasicTableOne columns={columnsTeamLead} data={dataTeamLead} />
    </ComponentCard>
  );
};

export default TeamLeadTable;
