'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import ComponentCard from '@/components/common/ComponentCard';
import BasicTableOne from '@/components/tables/BasicTableOne';
import { EyeIcon } from '@/icons';
import img from '../../../public/images/logo/user1.png';
import { useUserContext } from '@/context/UserContext';

interface TeamLeadData {
  id: string;
  userPhoto: string;
  userName: string;
  userEmail: string;
  userPhone: string;
  joinDate: string;
  status: string; // 'Deleted' | 'GP' | 'SGP' | 'PGP' | 'NonGP'
  teamCount: number;
  myEarnings: string;
  leadCount: number;
}

interface TeamLeadProps {
  userId: string;
  isAction: boolean;
}

/** Local typing to fix "never" issues without touching your context code */
type AppUser = {
  _id: string;
  fullName: string;
  email: string;
  mobileNumber: string;
  createdAt: string;
  packageStatus?: 'GP' | 'SGP' | 'PGP' | 'NonGP';
  isDeleted?: boolean;
  profilePhoto?: string;
  referredBy?: string | null;
};

const TeamLeadTable = ({ userId, isAction }: TeamLeadProps) => {
  const { users: ctxUsers } = useUserContext() as unknown as { users: unknown };
  const [dataTeamLead, setDataTeamLead] = useState<TeamLeadData[]>([]);
  const [loading, setLoading] = useState(true);

  /** Safely coerce context users into AppUser[] */
  const users: AppUser[] = useMemo(() => {
    if (Array.isArray(ctxUsers)) {
      return (ctxUsers as any[]).filter(Boolean) as AppUser[];
    }
    return [];
  }, [ctxUsers]);

  /** Build team list from context as a fallback */
  const buildFromContext = React.useCallback(
    (rootUserId: string): TeamLeadData[] => {
      if (!rootUserId) return [];

      const directTeam = users.filter(u => (u?.referredBy ?? null) === rootUserId);

      return directTeam.map(member => {
        const memberDirects = users.filter(u => (u?.referredBy ?? null) === member._id);

        let status: string = "NonGP";
        if (member.isDeleted) {
          status = "Deleted";
        } else if (member.packageStatus === "GP") {
          status = "GP";
        } else if (member.packageStatus === "SGP") {
          status = "SGP";
        } else if (member.packageStatus === "PGP") {
          status = "PGP";
        }

        return {
          id: member._id,
          userPhoto: member.profilePhoto || img.src,
          userName: member.fullName,
          userEmail: member.email,
          userPhone: member.mobileNumber,
          joinDate: new Date(member.createdAt).toLocaleDateString('en-IN'),
          status,
          teamCount: memberDirects.length,
          myEarnings: `₹${(0).toLocaleString()}`,
          leadCount: 0,
        };
      });
    },
    [users]
  );

  useEffect(() => {
    let cancelled = false;

    const fetchTeam = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/team-build/my-team/${userId}`);
        const json = await res.json();

        if (!cancelled && json?.success && Array.isArray(json?.team) && json.team.length > 0) {
          const mappedFromApi: TeamLeadData[] = json.team.map((member: any) => {
            const user = member?.user ?? {};
            console.log("Team member from API:", member);
            let status: string = "NonGP";
            if (user.isDeleted) {
              status = "Deleted";
            } else if (user.packageStatus === "GP") {
              status = "GP";
            } else if (user.packageStatus === "SGP") {
              status = "SGP";
            } else if (user.packageStatus === "PGP") {
              status = "PGP";
            }

            const base: TeamLeadData = {
              id: user._id,
              userPhoto: user.profilePhoto || img.src,
              userName: user.fullName,
              userEmail: user.email,
              userPhone: user.mobileNumber,
              joinDate: user.createdAt ? new Date(user.createdAt).toLocaleDateString('en-IN') : '',
              status,
              teamCount: Number(member?.team?.length || 0),
              myEarnings: `₹${Number(member?.totalEarningsFromShare_2 || 0).toLocaleString()}`,
              leadCount: Number(member?.leads?.length || 0),
            };

            if (base.teamCount === 0 && users.length) {
              const memberDirects = users.filter((u) => (u?.referredBy ?? null) === base.id);
              base.teamCount = memberDirects.length;
            }

            return base;
          });

          setDataTeamLead(mappedFromApi);
        } else {
          const built = buildFromContext(userId);
          setDataTeamLead(built);
        }
      } catch (_err) {
        const built = buildFromContext(userId);
        setDataTeamLead(built);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    if (userId) fetchTeam();
    return () => {
      cancelled = true;
    };
  }, [userId, buildFromContext, users]);

  const columnsTeamLead = [
    {
      header: 'User Details',
      accessor: 'userDetails',
      render: (row: TeamLeadData) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 overflow-hidden rounded-full">
            <Image
              src={row.userPhoto}
              alt="user"
              width={40}
              height={40}
              className="rounded-full"
            />
          </div>
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
      render: (row: TeamLeadData) => {
        let colorClass = '';
        switch (row.status) {
          case 'Deleted':
            colorClass = 'text-red-600 bg-red-100 border border-red-300';
            break;
          case 'GP':
            colorClass = 'text-green-600 bg-green-100 border border-green-300';
            break;
          case 'SGP':
            colorClass = 'text-blue-600 bg-blue-100 border border-blue-300';
            break;
          case 'PGP':
            colorClass = 'text-purple-600 bg-purple-100 border border-purple-300';
            break;
          case 'NonGP':
            colorClass = 'text-yellow-600 bg-yellow-100 border border-yellow-300';
            break;
          default:
            colorClass = 'text-gray-600 bg-gray-100 border border-gray-300';
        }

        return (
          <div
            className={`${colorClass} border px-3 py-1 text-xs rounded-full text-center leading-tight`}
          >
            {row.status}
          </div>
        );
      },
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
        <div className="flex flex-col text-sm">
          <span>{row.myEarnings}</span>
          {/* Add status note below earnings */}
          {row.status === "GP" && (
            <span className="text-xs text-green-600">(completed)</span>
          )}
        </div>
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

  if (loading) {
    return <div className="p-4 text-center text-gray-500">Loading...</div>;
  }

  if (!dataTeamLead.length) {
    return (
      <ComponentCard title="Team Lead Table">
        <div className="p-6 text-gray-600">
          No team leads found at the moment. Once users join through your referral, they will appear
          here.
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
