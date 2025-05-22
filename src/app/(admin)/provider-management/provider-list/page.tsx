'use client';

import React, { useEffect, useState } from 'react';
import PageBreadcrumb from '@/components/common/PageBreadCrumb';
import ComponentCard from '@/components/common/ComponentCard';
import BasicTableOne from '@/components/tables/BasicTableOne';
import { PencilIcon, TrashBinIcon, EyeIcon } from '@/icons';
import Input from '@/components/form/input/InputField';
import Label from '@/components/form/Label';
import Select from '@/components/form/Select';
import { useProvider } from '@/context/ProviderContext';
import Link from 'next/link';

interface Provider {
  _id: string;
  name: string;
  email: string;
  phoneNo: string;
  address: string;
  setBusinessPlan: string;
  isDeleted?: boolean;
}

interface ProviderTableData {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  businessPlan: string;
  status: string;
}

const sortOptions = [
  { value: 'latest', label: 'Latest' },
  { value: 'oldest', label: 'Oldest' },
  { value: 'ascending', label: 'Ascending A-Z' },
  { value: 'descending', label: 'Descending Z-A' },
];

const ProviderList = () => {
  const { providers } = useProvider();
  const [filteredProviders, setFilteredProviders] = useState<ProviderTableData[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [sort, setSort] = useState('latest');
  const [activeTab, setActiveTab] = useState<'all' | 'active' | 'inactive'>('all');
  const [selectedPlan, setSelectedPlan] = useState('');
console.log(providers);

  useEffect(() => {
    if (!Array.isArray(providers)) return;

    let filtered = providers
      .filter((provider: Provider) => {
        if (activeTab === 'active') return !provider.isDeleted;
        if (activeTab === 'inactive') return provider.isDeleted;
        return true;
      })
      .filter((provider: Provider) =>
        provider.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
      .filter((provider: Provider) =>
        selectedPlan ? provider.setBusinessPlan === selectedPlan : true
      )
      .map((provider: Provider) => ({
        id: provider._id,
        name: provider.name,
        email: provider.email,
        phone: provider.phoneNo,
        address: provider.address,
        businessPlan: provider.setBusinessPlan || 'N/A',
        status: provider.isDeleted ? 'Inactive' : 'Active',
      }));

    if (sort === 'ascending') {
      filtered = filtered.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sort === 'descending') {
      filtered = filtered.sort((a, b) => b.name.localeCompare(a.name));
    }

    setFilteredProviders(filtered);
  }, [providers, searchQuery, activeTab, sort, selectedPlan]);

  const businessPlanOptions = Array.from(
    new Set(providers.map((p: Provider) => p.setBusinessPlan))
  ).map((plan) => ({ value: plan, label: plan }));

  const columns = [
    { header: 'Name', accessor: 'name' },
    { header: 'Email', accessor: 'email' },
    { header: 'Phone', accessor: 'phone' },
    { header: 'Address', accessor: 'address' },
    { header: 'Business Plan', accessor: 'businessPlan' },
    {
      header: 'Status',
      accessor: 'status',
      render: (row: ProviderTableData) => {
        const color =
          row.status === 'Active'
            ? 'text-green-600 bg-green-100 border border-green-300'
            : 'text-red-500 bg-red-100 border border-red-300';
        return (
          <span className={`px-3 py-1 rounded-full text-sm font-semibold ${color}`}>
            {row.status}
          </span>
        );
      },
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
              <Label>Search by Name</Label>
              <Input
                type="text"
                placeholder="Enter name"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div>
              <Label>Sort</Label>
              <Select
                options={sortOptions}
                placeholder="Select Sort"
                onChange={(val) => setSort(val)}
              />
            </div>
            <div>
              <Label>Business Plan</Label>
              <Select
                options={businessPlanOptions}
                placeholder="Select Plan"
                onChange={(val) => setSelectedPlan(val)}
              />
            </div>
            <div className="flex items-end gap-3">
              <button
                onClick={() => setActiveTab('all')}
                className={`px-4 py-2 rounded ${activeTab === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-100'}`}
              >
                All
              </button>
              <button
                onClick={() => setActiveTab('active')}
                className={`px-4 py-2 rounded ${activeTab === 'active' ? 'bg-green-600 text-white' : 'bg-gray-100'}`}
              >
                Active
              </button>
              <button
                onClick={() => setActiveTab('inactive')}
                className={`px-4 py-2 rounded ${activeTab === 'inactive' ? 'bg-red-600 text-white' : 'bg-gray-100'}`}
              >
                Inactive
              </button>
            </div>
          </div>
        </ComponentCard>
      </div>

      <ComponentCard title="Provider List Table">
        <BasicTableOne columns={columns} data={filteredProviders} />
      </ComponentCard>
    </div>
  );
};

export default ProviderList;
