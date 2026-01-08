'use client';

import React, { useEffect, useState } from 'react';
import PageBreadcrumb from '@/components/common/PageBreadCrumb';
import ComponentCard from '@/components/common/ComponentCard';
import { useAdContext } from '@/context/AdContext';
import Image from 'next/image';
import Link from 'next/link';
import { EyeIcon, TrashBinIcon } from '@/icons';
import Input from '@/components/form/input/InputField';
import BasicTableOne from '@/components/tables/BasicTableOne';

interface AdTableData {
  id: string;
  title: string;
  fileUrl: string;
  categoryName: string;
  serviceName: string;
  approveStatus: string;
  expireStatus: string;
  deleteStatus: string;
  isUpcoming: boolean; 
}

const AdListPage = () => {
  const { ads, fetchAds, deleteAd } = useAdContext();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [filteredAds, setFilteredAds] = useState<AdTableData[]>([]);

const isUpcomingAd = (startDate: string) => {
  return new Date(startDate) > new Date();
};


  useEffect(() => {
    fetchAds();
  }, []);

  // Format ads for table
useEffect(() => {
  const formatted: AdTableData[] = ads
  .slice() // 🔥 prevent mutating context data
  .sort(
    (a, b) =>
      new Date(b.createdAt).getTime() -
      new Date(a.createdAt).getTime()
  )
  .map(ad => {
    const upcoming = isUpcomingAd(ad.startDate);

    return {
      id: ad._id,
      title: ad.title,
      fileUrl: ad.fileUrl,
      categoryName: ad.category?.name || 'N/A',
      serviceName: ad.service?.serviceName || 'N/A',
      approveStatus: ad.isApproved ? 'Approved' : 'Pending',
      expireStatus: upcoming
        ? 'Upcoming'
        : ad.isExpired
        ? 'Expired'
        : 'Active',
      deleteStatus: ad.isDeleted ? 'Deleted' : 'Active',
      isUpcoming: upcoming,
    };
  });


  const filtered = formatted.filter(ad =>
    ad.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  setFilteredAds(filtered);
}, [ads, searchQuery]);


  // Filter ads by tab
  const getFilteredByStatus = () => {
  switch (activeTab) {
    case 'approved':
      return filteredAds.filter(
        ad => ad.approveStatus === 'Approved' && !ad.isUpcoming
      );

    case 'upcoming':
      return filteredAds.filter(ad => ad.isUpcoming);

    case 'pending':
      return filteredAds.filter(ad => ad.approveStatus === 'Pending');

    case 'expired':
      return filteredAds.filter(ad => ad.expireStatus === 'Expired');

    case 'deleted':
      return filteredAds.filter(ad => ad.deleteStatus === 'Deleted');

    default:
      return filteredAds;
  }
};


  // Count tabs
  const counts = {
    all: filteredAds.length,
    approved: filteredAds.filter(ad => ad.approveStatus === 'Approved').length,
      upcoming: filteredAds.filter(ad => ad.isUpcoming).length, // ✅
    pending: filteredAds.filter(ad => ad.approveStatus === 'Pending').length,
    expired: filteredAds.filter(ad => ad.expireStatus === 'Expired').length,
    deleted: filteredAds.filter(ad => ad.deleteStatus === 'Deleted').length,
  };

  // Soft-delete handler
  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this ad?")) {
      const success = await deleteAd(id);
      if (success) alert("Ad deleted.");
    }
  };

  const columns = [
    {
    header: 'Sr No',
    accessor: 'srNo',
    render: (_: any, index: number) => index + 1,
  },
    { header: 'Title', accessor: 'title' },
    {
      header: 'Preview',
      accessor: 'fileUrl',
      render: (row: AdTableData) => (
        <Image
          src={row.fileUrl}
          alt="Ad Image"
          width={100}
          height={100}
          className="rounded object-cover"
        />
      ),
    },
    { header: 'Category', accessor: 'categoryName' },
    { header: 'Service', accessor: 'serviceName' },

    // ✅ Approve Status
    {
      header: 'Approve Status',
      accessor: 'approveStatus',
      render: (row: AdTableData) => (
        <span className={`px-3 py-1 rounded-full text-sm font-semibold
          ${row.approveStatus === 'Approved' 
            ? 'text-green-600 bg-green-100 border border-green-300'
            : 'text-yellow-600 bg-yellow-100 border border-yellow-300'}
        `}>
          {row.approveStatus}
        </span>
      ),
    },

    // ✅ Expired
   {
  header: 'Expire Status',
  accessor: 'expireStatus',
  render: (row: AdTableData) => (
    <span className={`px-3 py-1 rounded-full text-sm font-semibold
      ${
        row.expireStatus === 'Upcoming'
          ? 'text-blue-600 bg-blue-100 border border-blue-300'
          : row.expireStatus === 'Expired'
          ? 'text-red-600 bg-red-100 border border-red-300'
          : 'text-green-600 bg-green-100 border border-green-300'
      }
    `}>
      {row.expireStatus}
    </span>
  ),
},


    // ✅ Deleted
    {
      header: 'Delete Status',
      accessor: 'deleteStatus',
      render: (row: AdTableData) => (
        <span className={`px-3 py-1 rounded-full text-sm font-semibold
          ${row.deleteStatus === 'Deleted' 
            ? 'text-gray-600 bg-gray-100 border border-gray-300'
            : 'text-green-600 bg-green-100 border border-green-300'}
        `}>
          {row.deleteStatus}
        </span>
      ),
    },

    // ✅ Actions
    {
      header: 'Action',
      accessor: 'action',
      render: (row: any) => (
        <div className="flex gap-2">
          <button
            onClick={() => handleDelete(row.id)}
            disabled={row.deleteStatus === 'Deleted'}
            className={`rounded-md p-2 border 
              ${row.deleteStatus === 'Deleted'
                ? 'text-gray-400 border-gray-300 cursor-not-allowed opacity-60'
                : 'text-red-500 border-red-500 hover:bg-red-500 hover:text-white'}
            `}
          >
            <TrashBinIcon size={16} />
          </button>

          <Link href={`/adds-management/adds-list/${row.id}`} passHref>
            <button className="text-blue-500 border border-blue-500 rounded-md p-2 hover:bg-blue-500 hover:text-white">
              <EyeIcon size={16} />
            </button>
          </Link>
        </div>
      ),
    },
  ];

  return (
    <div>
      <PageBreadcrumb pageTitle="Ads List" />
      <div className="my-5">
        <ComponentCard title="Ads List">

          {/* Search */}
          <div className="flex justify-between mb-4">
            <Input
              type="text"
              placeholder="Search by ad title"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Tabs */}
          <div className="border-b border-gray-200 mb-4">
            <ul className="flex space-x-6 text-sm font-medium text-center text-gray-500">
              {[
                { key: 'all', label: 'All', count: counts.all },
                  { key: 'upcoming', label: 'Upcoming', count: counts.upcoming },
                { key: 'approved', label: 'Approved', count: counts.approved },
                { key: 'pending', label: 'Pending', count: counts.pending },
                { key: 'expired', label: 'Expired', count: counts.expired },
                { key: 'deleted', label: 'Deleted', count: counts.deleted },
              ].map(tab => (
                <li
                  key={tab.key}
                  className={`cursor-pointer px-4 py-2 ${
                    activeTab === tab.key ? 'border-b-2 border-blue-600 text-blue-600' : ''
                  }`}
                  onClick={() => setActiveTab(tab.key)}
                >
                  {tab.label}
                  <span className="ml-2 bg-red-600 text-white text-xs font-semibold px-2 py-0.5 rounded-full">
                    {tab.count}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* Table */}
          {getFilteredByStatus().length > 0 ? (
            <BasicTableOne columns={columns} data={getFilteredByStatus()} />
          ) : (
            <div className="text-center py-10 text-gray-500">
              No advertisements in list.
            </div>
          )}
        </ComponentCard>
      </div>
    </div>
  );
};

export default AdListPage;
