'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import PageBreadcrumb from '@/components/common/PageBreadCrumb';
import ComponentCard from '@/components/common/ComponentCard';
import BasicTableOne from '@/components/tables/BasicTableOne';
import Input from '@/components/form/input/InputField';
import RouteLoader from '@/components/RouteLoader';
import { PencilIcon, TrashBinIcon, EyeIcon } from '@/icons';
import { useClaimNow } from '@/context/ClaimContext';

const ClaimNowPage = () => {
  const { claims, fetchClaims, loading, deleteClaim } = useClaimNow();

  const [activeTab, setActiveTab] = useState<
    'all' | 'requested' | 'approved' | 'reward' | 'monthlyearn' | 'settled'
  >('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10;

  useEffect(() => {
    fetchClaims();
  }, []);

  /* ─── Status helper ───────────────────────────────────────────── */
  const getStatus = (claim: any) => {
    if (claim.isClaimSettled) return 'Settled';
    if (claim.isClaimAccepted) return 'Accepted';
    if (claim.isAdminApproved) return 'Approved';
    if (claim.isClaimRequest || claim.isExtraMonthlyEarnRequest) return 'Requested';
    return 'Pending';
  };

  /* ─── Tab filter logic ────────────────────────────────────────── */
  const filteredClaims = claims.filter((claim) => {
    const status = getStatus(claim).toLowerCase();

    if (activeTab === 'requested' && !claim.isClaimRequest && !claim.isExtraMonthlyEarnRequest)
      return false;
    if (activeTab === 'approved' && !claim.isAdminApproved) return false;
    if (activeTab === 'settled' && !claim.isClaimSettled) return false;
    if (activeTab === 'reward' && !claim.isClaimAccepted) return false;
    if (activeTab === 'monthlyearn' && !claim.isExtraMonthlyEarnRequest) return false;

    if (
      searchQuery &&
      !claim?.user?.fullName?.toLowerCase().includes(searchQuery.toLowerCase())
    )
      return false;
    return true;
  });

  /* ─── Pagination ──────────────────────────────────────────────── */
  const startIndex = (currentPage - 1) * rowsPerPage;
  const currentRows = filteredClaims.slice(startIndex, startIndex + rowsPerPage);

  if (loading) return <RouteLoader />;

  /* ─── Tab counts ──────────────────────────────────────────────── */
  const counts = {
    all: claims.length,
    requested: claims.filter(
      (c) => c.isClaimRequest || c.isExtraMonthlyEarnRequest
    ).length,
    approved: claims.filter((c) => c.isAdminApproved).length,
    reward: claims.filter((c) => c.isClaimAccepted).length,
    monthlyearn: claims.filter((c) => c.isExtraMonthlyEarnRequest).length,
    settled: claims.filter((c) => c.isClaimSettled).length,
  };

  /* ─── Table Columns ───────────────────────────────────────────── */
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
          <span
            className={`px-2 py-1 text-xs rounded-full font-semibold ${statusColor}`}
          >
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

  /* ─── UI ─────────────────────────────────────────────────────── */
  const tabs: { key: any; label: string }[] = [
    { key: 'all', label: `All (${counts.all})` },
    { key: 'requested', label: `Requested (${counts.requested})` },
    { key: 'approved', label: `Approved (${counts.approved})` },
    { key: 'reward', label: `Reward (${counts.reward})` },
    { key: 'monthlyearn', label: `Monthly Earn (${counts.monthlyearn})` },
    { key: 'settled', label: `Settled (${counts.settled})` },
  ];

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

        <BasicTableOne columns={columns} data={currentRows} />
      </ComponentCard>
    </div>
  );
};

export default ClaimNowPage;
