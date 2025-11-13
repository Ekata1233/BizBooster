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
    'all' | 'requested' | 'approved' | 'accepted' | 'settled'
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
    if (claim.isClaimRequest) return 'Requested';
    return 'Pending';
  };

  /* ─── Filter & search ─────────────────────────────────────────── */
  const filteredClaims = claims.filter((claim) => {
    const status = getStatus(claim).toLowerCase();
    if (activeTab !== 'all' && status !== activeTab) return false;
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
        <span className="text-sm font-medium">
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
          {/* ✏️ Edit */}
          <button className="text-yellow-600 p-2 border rounded hover:bg-yellow-50">
            <PencilIcon />
          </button>

          {/* 🗑️ Delete */}
          <button
            onClick={() => deleteClaim(row._id!)}
            className="text-red-600 p-2 border rounded hover:bg-red-50"
          >
            <TrashBinIcon />
          </button>

          {/* 👁️ View */}
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
  return (
    <div>
      <PageBreadcrumb pageTitle="Claim Requests" />

      <ComponentCard title="All Reward Claims">
        {/* 🔍 Search */}
        <Input
          placeholder="Search by user name"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />

        {/* 📊 Tabs */}
        <div className="border-b border-gray-200 mt-3 mb-3">
          <ul className="flex space-x-6 text-sm font-medium text-gray-500">
            {['all', 'requested', 'approved', 'accepted', 'settled'].map(
              (tab) => (
                <li
                  key={tab}
                  onClick={() => setActiveTab(tab as any)}
                  className={`cursor-pointer px-4 py-2 ${
                    activeTab === tab
                      ? 'border-b-2 border-blue-600 text-blue-600'
                      : ''
                  }`}
                >
                  {tab.toUpperCase()}
                </li>
              )
            )}
          </ul>
        </div>

        {/* 🧾 Table */}
        <BasicTableOne columns={columns} data={currentRows} />
      </ComponentCard>
    </div>
  );
};

export default ClaimNowPage;
