'use client';

import React, { useEffect, useMemo, useState } from 'react';
import PageBreadcrumb from '@/components/common/PageBreadCrumb';
import ComponentCard from '@/components/common/ComponentCard';
import BasicTableOne from '@/components/tables/BasicTableOne';
import { useProvider } from '@/context/ProviderContext';
import Input from '@/components/form/input/InputField';
import Label from '@/components/form/Label';
import Select from '@/components/form/Select';
import StatCard from '@/components/common/StatCard';
import { ChevronDownIcon, EyeIcon, ArrowUpIcon, UserIcon } from '@/icons';
import Link from 'next/link';

interface ProviderType {
  _id: string;
  fullName: string;
  email: string;
  galleryImages: string[];
}

const sortOptions = [
  { value: 'latest', label: 'Latest' },
  { value: 'oldest', label: 'Oldest' },
  { value: 'a-z', label: 'A-Z' },
  { value: 'z-a', label: 'Z-A' },
];

const ProviderGalleryPage = () => {
  const { providerDetails } = useProvider();
  const [searchQuery, setSearchQuery] = useState('');
  const [sort, setSort] = useState('latest');

  const filteredProviders: ProviderType[] = useMemo(() => {
    if (!Array.isArray(providerDetails)) return [];

    let filtered = providerDetails.filter(
      (provider) =>
        Array.isArray(provider.galleryImages) &&
        provider.galleryImages.length > 0
    );

    if (searchQuery) {
      filtered = filtered.filter((provider) =>
        provider.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        provider.email.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    switch (sort) {
      case 'a-z':
        filtered.sort((a, b) => a.fullName.localeCompare(b.fullName));
        break;
      case 'z-a':
        filtered.sort((a, b) => b.fullName.localeCompare(a.fullName));
        break;
      case 'latest':
        filtered.sort((a, b) => (b._id > a._id ? 1 : -1));
        break;
      case 'oldest':
        filtered.sort((a, b) => (a._id > b._id ? 1 : -1));
        break;
    }

    return filtered;
  }, [providerDetails, searchQuery, sort]);

  const totalImages = filteredProviders.reduce(
    (sum, provider) => sum + (provider.galleryImages?.length || 0),
    0
  );

  const columns = [
    {
      header: 'SL No',
      accessor: 'serial',
      render: (_: ProviderType, index: number) => <span>{index + 1}</span>,
    },
    {
      header: 'Name',
      accessor: 'fullName',
      render: (row: ProviderType) => <span>{row.fullName}</span>,
    },
    {
      header: 'Email',
      accessor: 'email',
      render: (row: ProviderType) => <span>{row.email}</span>,
    },
    {
      header: 'Gallery Images',
      accessor: 'galleryImages',
      render: (row: ProviderType) => <span>{row.galleryImages.length}</span>,
    },
    {
      header: 'Action',
      accessor: 'action',
      render: (row: ProviderType) => (
        <Link href={`/provider-management/provider-gallery/${row._id}`} passHref>
          <button className="text-blue-500 border border-blue-500 rounded-md p-2 hover:bg-blue-500 hover:text-white hover:border-blue-500">
            <EyeIcon />
          </button>
        </Link>
      ),
    },
  ];

  return (
    <div className="p-4">
      <PageBreadcrumb pageTitle="Provider Gallery List" />

      <div className="flex flex-col lg:flex-row gap-6">
        <div className="w-full lg:w-3/4 my-5">
          <ComponentCard title="Search Filter">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 py-3">
              
              <div className="w-full">
                <Label>Sort By</Label>
                <div className="relative">
                  <Select
                    options={sortOptions}
                    placeholder="Sort By"
                    onChange={(value) => setSort(value)}
                    className="dark:bg-dark-900 w-full"
                  />
                  <span className="absolute text-gray-500 -translate-y-1/2 pointer-events-none right-3 top-1/2">
                    <ChevronDownIcon />
                  </span>
                </div>
              </div>

              <div className="w-full">
                <Label>Search</Label>
                <Input
                  type="text"
                  placeholder="Search by name or email"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full"
                />
              </div>
            </div>
          </ComponentCard>
        </div>

        <div className="w-full lg:w-1/4 my-5">
          <StatCard
            title="Total Images"
            value={totalImages}
            icon={UserIcon}
            badgeColor="success"
            badgeValue="0.00%"
            badgeIcon={ArrowUpIcon}
          />
        </div>
      </div>

      <div className="my-5">
        <ComponentCard title="Providers With Gallery">
          {filteredProviders.length === 0 ? (
            <p className="text-center py-5 text-gray-500">No providers found.</p>
          ) : (
            <BasicTableOne columns={columns} data={filteredProviders} />
          )}
        </ComponentCard>
      </div>
    </div>
  );
};

export default ProviderGalleryPage;
