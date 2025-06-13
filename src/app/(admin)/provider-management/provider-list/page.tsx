'use client';

import React, { useEffect, useState } from 'react';
import PageBreadcrumb from '@/components/common/PageBreadCrumb';
import ComponentCard from '@/components/common/ComponentCard';
import BasicTableOne from '@/components/tables/BasicTableOne';
import { TrashBinIcon, EyeIcon, ChevronDownIcon } from '@/icons';
import Input from '@/components/form/input/InputField';
import Label from '@/components/form/Label';
import Select from '@/components/form/Select';
import { useProvider } from '@/context/ProviderContext';
import Link from 'next/link';
import { useModule } from '@/context/ModuleContext';
import axios from 'axios';

interface ProviderTableData {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  storeName: string;
  storePhone: string;
  city: string;
  status: 'Completed' | 'Pending' | 'Approved' | 'Rejected';
  isApproved: boolean;
  isRejected: boolean;
  step1Completed: boolean;
  storeInfoCompleted: boolean;
  kycCompleted: boolean;
}

const sortOptions = [
  { value: 'latest', label: 'Latest' },
  { value: 'oldest', label: 'Oldest' },
  { value: 'ascending', label: 'Ascending' },
  { value: 'descending', label: 'Descending' },
];

const ProviderList = () => {
  const { providerDetails } = useProvider();
  const { modules } = useModule();

  const [selectedModule, setSelectedModule] = useState<string>('');
  const [filteredProviders, setFilteredProviders] = useState<ProviderTableData[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [sort, setSort] = useState('latest');
  const [message, setMessage] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'all' | 'completed' | 'pending'>('all');

  const fetchFilteredProviders = async () => {
    try {
      const params = {
        ...(selectedModule && { selectedModule }),
        ...(sort && { sort }),
        ...(searchQuery && { search: searchQuery }),
      };

      const response = await axios.get('/api/provider', { params });
      const data = response.data;

      if (!Array.isArray(data) || data.length === 0) {
        setFilteredProviders([]);
        setMessage('No providers found');
        return;
      }

      const updatedProviders = data.map((provider: any): ProviderTableData => {
        const storeInfo = provider.storeInfo || {};
        const isComplete =
          provider.step1Completed && provider.storeInfoCompleted && provider.kycCompleted;

        return {
          id: provider._id,
          fullName: provider.fullName,
          email: provider.email,
          phone: provider.phoneNo,
          storeName: storeInfo.storeName || '-',
          storePhone: storeInfo.storePhone || '-',
          city: storeInfo.city || '-',
          isRejected: provider.isRejected || false,
          isApproved: provider.isApproved || false,
          status: isComplete ? 'Completed' : 'Pending',
          step1Completed: provider.step1Completed || false,
          storeInfoCompleted: provider.storeInfoCompleted || false,
          kycCompleted: provider.kycCompleted || false,
        };
      });

      setFilteredProviders(updatedProviders);
      setMessage('');
    } catch (error) {
      console.error('Error fetching providers:', error);
      setFilteredProviders([]);
      setMessage('Something went wrong while fetching providers');
    }
  };

  useEffect(() => {
    fetchFilteredProviders();
  }, [sort, searchQuery, selectedModule]);

  const moduleOptions = modules.map((module) => ({
    value: module._id,
    label: module.name,
    image: module.image,
  }));

  const getTabFilteredData = () => {
    if (activeTab === 'completed') {
      return filteredProviders.filter((p) => p.status === 'Completed');
    }
    if (activeTab === 'pending') {
      return filteredProviders.filter((p) => p.status === 'Pending');
    }
    return filteredProviders;
  };

  const columns = [
    { header: 'Name', accessor: 'fullName' },
    { header: 'Email', accessor: 'email' },
    { header: 'Phone', accessor: 'phone' },
    { header: 'Store Name', accessor: 'storeName' },
    { header: 'Store Phone', accessor: 'storePhone' },
    { header: 'Address', accessor: 'address' },
    {
      header: 'Status',
      accessor: 'status',
      render: (row: ProviderTableData) => {
        const isApproved =
          row.step1Completed &&
          row.storeInfoCompleted &&
          row.kycCompleted &&
          row.isApproved;

        const isRejected =
          row.step1Completed &&
          row.storeInfoCompleted &&
          row.kycCompleted &&
          row.isRejected;

        const isComplete =
          row.step1Completed && row.storeInfoCompleted && row.kycCompleted;

        if (isApproved) {
          return (
            <span className="px-3 py-1 rounded-full text-sm font-semibold text-blue-600 bg-blue-100 border border-blue-300">
              Approved
            </span>
          );
        }

        if (isRejected) {
          return (
            <span className="px-3 py-1 rounded-full text-sm font-semibold text-red-600 bg-red-100 border border-red-300">
              Rejected
            </span>
          );
        }

        if (isComplete) {
          return (
            <span className="px-3 py-1 rounded-full text-sm font-semibold text-green-600 bg-green-100 border border-green-300">
              Completed
            </span>
          );
        }

        return (
          <Link
            href={{
              pathname: `/provider-management/add-provider`,
              query: { id: row.id },
            }}
            passHref
          >
            <button className="px-3 py-1 rounded-full text-sm font-semibold text-yellow-500 bg-yellow-100 border border-yellow-300 hover:bg-yellow-500 hover:text-white">
              Pending
            </button>
          </Link>
        );
      }

    },
    {
      header: 'Action',
      accessor: 'action',
      render: (row: ProviderTableData) => (
        <div className="flex gap-2">
          <button className="text-red-500 border border-red-500 rounded-md p-2 hover:bg-red-500 hover:text-white">
            <TrashBinIcon />
          </button>
          <Link href={`/provider-management/provider-details/${row.id}`} passHref>
            <button className="text-blue-500 border border-blue-500 rounded-md p-2 hover:bg-blue-500 hover:text-white">
              <EyeIcon />
            </button>
          </Link>
        </div>
      ),
    },
  ];

  return (
    <div>
      <PageBreadcrumb pageTitle="Provider List" />
      <div className="my-5">
        <ComponentCard title="Search Filter">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
            <div>
              <Label>Select Module</Label>
              <div className="relative">
                <Select
                  options={moduleOptions}
                  placeholder="Select Module"
                  onChange={(value: string) => setSelectedModule(value)}
                  className="dark:bg-dark-900"
                />
                <span className="absolute text-gray-500 right-3 top-1/2 transform -translate-y-1/2">
                  <ChevronDownIcon />
                </span>
              </div>
            </div>
            <div>
              <Label>Sort By</Label>
              <div className="relative">
                <Select
                  options={sortOptions}
                  placeholder="Sort By"
                  onChange={(value: string) => setSort(value)}
                  className="dark:bg-dark-900"
                />
                <span className="absolute text-gray-500 right-3 top-1/2 transform -translate-y-1/2">
                  <ChevronDownIcon />
                </span>
              </div>
            </div>
            <div>
              <Label>Search by Name or Email</Label>
              <Input
                type="text"
                placeholder="Enter Name or Email"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </ComponentCard>
      </div>

      <ComponentCard title="Provider List Table">
        <div className="flex gap-4 mb-4">
          {['all', 'completed', 'pending'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as 'all' | 'completed' | 'pending')}
              className={`px-4 py-2 rounded-lg border ${activeTab === tab
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-blue-100'
                }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {message ? (
          <p className="text-red-500 text-center my-4">{message}</p>
        ) : (
          <BasicTableOne columns={columns} data={getTabFilteredData()} />
        )}
      </ComponentCard>
    </div>
  );
};

export default ProviderList;
