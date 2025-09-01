'use client';

import React, { useEffect, useMemo, useState } from 'react';
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
  status: string; // 'GP' | 'Non-GP'
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
  packageActive?: boolean;
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

  /** Build team list from context as a fallback (match referredBy === current userId) */
  const buildFromContext = React.useCallback(
    (rootUserId: string): TeamLeadData[] => {
      if (!rootUserId) return [];

      // Direct referrals: users whose referredBy equals the current user's _id (param id)
      const directTeam = users.filter(u => (u?.referredBy ?? null) === rootUserId);

      // For each member, compute how many people THEY referred (1-level deep)
      const asTableRows: TeamLeadData[] = directTeam.map(member => {
        const memberDirects = users.filter(u => (u?.referredBy ?? null) === member._id);
        return {
          id: member._id,
          userPhoto: member.profilePhoto || img.src,
          userName: member.fullName,
          userEmail: member.email,
          userPhone: member.mobileNumber,
          joinDate: new Date(member.createdAt).toLocaleDateString('en-IN'),
          status: member.packageActive ? 'GP' : 'Non-GP',
          teamCount: memberDirects.length, // 1-level sub-team count
          myEarnings: `₹${(0).toLocaleString()}`, // no earnings data in context
          leadCount: 0, // no lead data in context
        };
      });

      return asTableRows;
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
          // Map API response first (keep your original logic intact)
          const mappedFromApi: TeamLeadData[] = json.team.map((member: any) => {
            const user = member?.user ?? {};
            const base: TeamLeadData = {
              id: user._id,
              userPhoto: user.profilePhoto || img.src,
              userName: user.fullName,
              userEmail: user.email,
              userPhone: user.mobileNumber,
              joinDate: user.createdAt ? new Date(user.createdAt).toLocaleDateString('en-IN') : '',
              status: user.packageActive ? 'GP' : 'Non-GP',
              teamCount: Number(member?.team?.length || 0),
              myEarnings: `₹${Number(member?.totalEarningsFromShare_2 || 0).toLocaleString()}`,
              leadCount: Number(member?.leads?.length || 0),
            };

            // Augment counts from context if API returned zeros
            if (base.teamCount === 0 && users.length) {
              const memberDirects = users.filter((u) => (u?.referredBy ?? null) === base.id);
              base.teamCount = memberDirects.length;
            }

            return base;
          });

          setDataTeamLead(mappedFromApi);
        } else {
          // Fallback: build from UserContext if API has nothing or not successful
          const built = buildFromContext(userId);
          setDataTeamLead(built);
        }
      } catch (_err) {
        // On any fetch error, fallback to context
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
      render: (row: TeamLeadData) => <div className="text-sm">{row.myEarnings}</div>,
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
              <Link href={`/customer-management/user/user-list/${userId}/leads/${row.id}/subleads/${row.id}`} passHref>
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
