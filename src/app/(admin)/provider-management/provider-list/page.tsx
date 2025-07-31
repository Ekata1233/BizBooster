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
import { debounce } from 'lodash';

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
  { value: 'ascending', label: 'A-Z (Name)' },
  { value: 'descending', label: 'Z-A (Name)' },
];

const statusOptions = [
  { value: 'all', label: 'All Status' },
  { value: 'completed', label: 'Completed' },
  { value: 'pending', label: 'Pending' },
  { value: 'approved', label: 'Approved' },
  { value: 'rejected', label: 'Rejected' },
];

const ProviderList = () => {
  const { providerDetails } = useProvider();
  const { modules } = useModule();

  const [selectedModule, setSelectedModule] = useState<string>('');
  const [providers, setProviders] = useState<ProviderTableData[]>([]);
  const [filteredProviders, setFilteredProviders] = useState<ProviderTableData[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [sort, setSort] = useState('latest');
  const [statusFilter, setStatusFilter] = useState('all');
  const [message, setMessage] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const fetchProviders = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/api/provider');
      const data = response.data;

      if (!Array.isArray(data) || data.length === 0) {
        setProviders([]);
        setFilteredProviders([]);
        setMessage('No providers found');
        setLoading(false);
        return;
      }

      const updatedProviders = data.map((provider: any): ProviderTableData => {
        const storeInfo = provider.storeInfo || {};
        const isComplete =
          provider.step1Completed && provider.storeInfoCompleted && provider.kycCompleted;

        let status: 'Completed' | 'Pending' | 'Approved' | 'Rejected' = 'Pending';
        if (provider.isApproved) {
          status = 'Approved';
        } else if (provider.isRejected) {
          status = 'Rejected';
        } else if (isComplete) {
          status = 'Completed';
        }

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
          status,
          step1Completed: provider.step1Completed || false,
          storeInfoCompleted: provider.storeInfoCompleted || false,
          kycCompleted: provider.kycCompleted || false,
        };
      });

      setProviders(updatedProviders);
      setFilteredProviders(updatedProviders);
      setMessage('');
    } catch (error) {
      console.error('Error fetching providers:', error);
      setProviders([]);
      setFilteredProviders([]);
      setMessage('Something went wrong while fetching providers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProviders();
  }, []);

  // Apply filters whenever any filter criteria changes
  useEffect(() => {
    let result = [...providers];

    // Apply module filter
    if (selectedModule) {
      // Note: You'll need to adjust this if your provider objects have a module reference
      // Currently, the interface doesn't include module information
      // result = result.filter(provider => provider.moduleId === selectedModule);
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      result = result.filter(provider => {
        if (statusFilter === 'completed') return provider.status === 'Completed';
        if (statusFilter === 'pending') return provider.status === 'Pending';
        if (statusFilter === 'approved') return provider.status === 'Approved';
        if (statusFilter === 'rejected') return provider.status === 'Rejected';
        return true;
      });
    }

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(provider =>
        provider.fullName.toLowerCase().includes(query) ||
        provider.email.toLowerCase().includes(query) ||
        provider.phone.toLowerCase().includes(query) ||
        provider.storeName.toLowerCase().includes(query) ||
        provider.city.toLowerCase().includes(query)
      );
    }

    // Apply sorting
    result = sortProviders(result, sort);

    setFilteredProviders(result);

    if (result.length === 0) {
      setMessage('No providers match your filter criteria');
    } else {
      setMessage('');
    }
  }, [providers, selectedModule, statusFilter, searchQuery, sort]);

  const sortProviders = (data: ProviderTableData[], sortOption: string) => {
    const sorted = [...data];
    switch (sortOption) {
      case 'latest':
        return sorted; // Assuming the API returns latest first
      case 'oldest':
        return sorted.reverse();
      case 'ascending':
        return sorted.sort((a, b) => a.fullName.localeCompare(b.fullName));
      case 'descending':
        return sorted.sort((a, b) => b.fullName.localeCompare(a.fullName));
      default:
        return sorted;
    }
  };

  const moduleOptions = [
    { value: '', label: 'All Modules' },
    ...modules.map((module) => ({
      value: module._id,
      label: module.name,
      image: module.image,
    })),
  ];

  const handleSearchChange = debounce((value: string) => {
    setSearchQuery(value);
  }, 300);

  const columns = [
    { header: 'Name', accessor: 'fullName' },
    { header: 'Email', accessor: 'email' },
    { header: 'Phone', accessor: 'phone' },
    { header: 'Store Name', accessor: 'storeName' },
    { header: 'Store Phone', accessor: 'storePhone' },
    { header: 'City', accessor: 'city' },
    {
      header: 'Status',
      accessor: 'status',
      render: (row: ProviderTableData) => {
        const statusMap = {
          Completed: {
            className: 'text-green-600 bg-green-100 border-green-300',
            text: 'Completed'
          },
          Pending: {
            className: 'text-yellow-500 bg-yellow-100 border-yellow-300',
            text: 'Pending'
          },
          Approved: {
            className: 'text-blue-600 bg-blue-100 border-blue-300',
            text: 'Approved'
          },
          Rejected: {
            className: 'text-red-600 bg-red-100 border-red-300',
            text: 'Rejected'
          }
        };

        const statusInfo = statusMap[row.status];

        return (
          <Link
            href={{
              pathname: `/provider-management/add-provider`,
              query: { id: row.id },
            }}
            passHref
          >
            <span className={`px-3 py-1 rounded-full text-sm font-semibold ${statusInfo.className} border hover:opacity-80`}>
              {statusInfo.text}
            </span>
          </Link>
        );
      }
    },
    {
      header: 'Action',
      accessor: 'action',
      render: (row: ProviderTableData) => (
        <div className="flex gap-2">
          <button 
            className="text-red-500 border border-red-500 rounded-md p-2 hover:bg-red-500 hover:text-white"
            onClick={() => {
              // Add delete functionality here
              console.log('Delete provider', row.id);
            }}
          >
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
                  value={selectedModule}
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
              <Label>Status</Label>
              <div className="relative">
                <Select
                  options={statusOptions}
                  value={statusFilter}
                  placeholder="Filter by Status"
                  onChange={(value: string) => setStatusFilter(value)}
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
                  value={sort}
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
              <Label>Search</Label>
              <Input
                type="text"
                placeholder="Search by name, email, phone, etc."
                defaultValue={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
              />
            </div>
          </div>
        </ComponentCard>
      </div>

      <ComponentCard title="Provider List Table">
        {loading ? (
          <div className="text-center py-8">Loading providers...</div>
        ) : message ? (
          <p className="text-red-500 text-center my-4">{message}</p>
        ) : (
          <>
            <div className="mb-4 flex justify-between items-center">
              <div>
                <span className="text-sm text-gray-500">
                  Showing {filteredProviders.length} of {providers.length} providers
                </span>
              </div>
            </div>
            <BasicTableOne columns={columns} data={filteredProviders} />
          </>
        )}
      </ComponentCard>
    </div>
  );
};

export default ProviderList;