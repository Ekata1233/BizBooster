'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import PageBreadcrumb from '@/components/common/PageBreadCrumb';
import ComponentCard from '@/components/common/ComponentCard';
import BasicTableOne from '@/components/tables/BasicTableOne';
import Input from '@/components/form/input/InputField';
import RouteLoader from '@/components/RouteLoader';
import { EyeIcon } from '@/icons';
import { useClaimNow } from '@/context/ClaimContext';
import { InboxIcon } from 'lucide-react';

const ClaimNowPage = () => {
  const { claims, fetchClaims, loading } = useClaimNow();

  const [activeTab, setActiveTab] =
    useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10;

  useEffect(() => {
    fetchClaims();
  }, []);

  /* ───────────────────── Status Helper ───────────────────── */
  const getStatus = (claim: any) => {
    if (claim.isClaimSettled) return 'Settled';
    if (claim.isClaimAccepted) return 'Accepted';
    if (claim.isAdminApproved) return 'Approved';
    if (claim.isClaimRequest || claim.isExtraMonthlyEarnRequest)
      return 'Requested';
    return 'Pending';
  };

  /* ─────────────────── Dynamic Tabs from Status ───────────── */
  const uniqueStatuses = Array.from(
    new Set(claims.map((c) => getStatus(c)))
  );

  const dynamicStatusTabs = uniqueStatuses.map((status) => ({
    key: status.toLowerCase(),
    label: `${status} (${claims.filter((c) => getStatus(c) === status).length})`,
  }));

  /* ─────────────── Special Tabs (Reward + Monthly Earn) ───────── */
  const specialTabs = [
    {
      key: 'reward',
      label: `Reward (${claims.filter((c) => c.isClaimRequest).length})`,
    },
    {
      key: 'monthlyearn',
      label: `Monthly Earn (${claims.filter((c) => c.isExtraMonthlyEarnRequest).length})`,
    },
  ];

  /* ───────────────────── Final Tabs List ───────────────────── */
  const tabs = [
    { key: 'all', label: `All (${claims.length})` },
    ...dynamicStatusTabs,
    ...specialTabs,
  ];

  /* ───────────────── Filter Logic ─────────────────── */
  const filteredClaims = claims.filter((claim) => {
    const status = getStatus(claim).toLowerCase();

    if (
      activeTab !== 'all' &&
      activeTab !== 'reward' &&
      activeTab !== 'monthlyearn'
    ) {
      if (status !== activeTab) return false;
    }

    if (activeTab === 'reward' && !claim.isClaimRequest) return false;

    if (
      activeTab === 'monthlyearn' &&
      !claim.isExtraMonthlyEarnRequest
    )
      return false;

    if (
      searchQuery &&
      !claim?.user?.fullName
        ?.toLowerCase()
        .includes(searchQuery.toLowerCase())
    )
      return false;

    return true;
  });

  /* ───────────────── Pagination ───────────────── */
  const startIndex = (currentPage - 1) * rowsPerPage;
  const currentRows = filteredClaims.slice(startIndex, startIndex + rowsPerPage);

  if (loading) return <RouteLoader />;

  /* ───────────────── Table Columns ───────────────── */
  const columns = [
    {
      header: 'Sr. No',
      accessor: 'srNo',
      render: (_row: any) => {
        const idx = currentRows.findIndex((row) => row._id === _row._id);
        return <span>{(currentPage - 1) * rowsPerPage + idx + 1}</span>;
      },
    },
    {
      header: 'User Info',
      accessor: 'user',
      render: (row: any) => (
        <div>
          <p className="font-semibold text-gray-800">{row?.user?.userId}</p>
          <p className="text-gray-600">{row?.user?.fullName}</p>
        </div>
      ),
    },
    {
      header: 'Package Status',
      accessor: 'packageStatus',
      render: (row: any) => (
        <span className="text-sm font-semibold">
          {row?.user?.packageStatus || 'N/A'}
        </span>
      ),
    },
    {
      header: 'Reward Info',
      accessor: 'reward',
      render: (row: any) => (
        <div className="flex items-center gap-3">
          {row?.reward?.photo ? (
            <Image
              src={row.reward.photo}
              alt={row.reward.name}
              width={50}
              height={50}
              className="rounded object-cover"
            />
          ) : (
            <div className="h-[50px] w-[50px] bg-gray-200 rounded" />
          )}

          <div>
            <p className="font-medium">{row.reward.name}</p>
            <p className="text-xs text-gray-500 truncate w-[160px]">
              {row.reward.description}
            </p>
          </div>
        </div>
      ),
    },
    {
      header: 'Type',
      accessor: 'type',
      render: (row: any) => {
        if (row.isExtraMonthlyEarnRequest) return 'Monthly Earn';
        if (row.isClaimRequest) return 'Reward';
        return '-';
      },
    },
    {
      header: 'Status',
      accessor: 'status',
      render: (row: any) => {
        const status = getStatus(row);
        const statusColor =
          status === 'Requested'
            ? 'bg-yellow-100 text-yellow-700'
            : status === 'Approved'
            ? 'bg-blue-100 text-blue-700'
            : status === 'Accepted'
            ? 'bg-purple-100 text-purple-700'
            : status === 'Settled'
            ? 'bg-green-100 text-green-700'
            : 'bg-gray-100 text-gray-700';

        return (
          <span className={`px-2 py-1 text-xs rounded-full font-semibold ${statusColor}`}>
            {status}
          </span>
        );
      },
    },
    {
      header: 'Action',
      accessor: 'action',
      render: (row: any) => (
        <div className="flex gap-2">
          <Link href={`/reward-management/claim/${row._id}`} passHref>
            <button className="text-blue-600 p-2 border rounded hover:bg-blue-50">
              <EyeIcon />
            </button>
          </Link>
        </div>
      ),
    },
  ];

  /* ───────────────── UI ───────────────── */
  return (
    <div>
      <PageBreadcrumb pageTitle="Claim Requests" />
      <ComponentCard title="All Reward Claims">
        <Input
          placeholder="Search by user name"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />

        <div className="border-b border-gray-200 mt-3 mb-3">
          <ul className="flex flex-wrap space-x-6 text-sm font-medium text-gray-500">
            {tabs.map((tab) => (
              <li
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`cursor-pointer px-4 py-2 ${
                  activeTab === tab.key
                    ? 'border-b-2 border-blue-600 text-blue-600'
                    : ''
                }`}
              >
                {tab.label}
              </li>
            ))}
          </ul>
        </div>

{currentRows.length === 0 ? (
  <div className="flex flex-col items-center justify-center py-10 px-6 border border-gray-200 rounded-lg bg-gray-50">
  <InboxIcon className="w-12 h-12 text-gray-400 mb-3" />
  <p className="text-gray-700 font-semibold text-base">
    No records available
  </p>
  <p className="text-sm text-gray-500 mt-1">
    There is no data to display for the selected criteria.
  </p>
</div>

) : (
        <BasicTableOne columns={columns} data={currentRows} />
        )}
      </ComponentCard>
    </div>
  );
};

export default ClaimNowPage;
