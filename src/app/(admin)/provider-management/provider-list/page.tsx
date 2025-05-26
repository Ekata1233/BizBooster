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

const options = [
  { value: "latest", label: "Latest" },
  { value: "oldest", label: "Oldest" },
  { value: "ascending", label: "Ascending" },
  { value: "descending", label: "Descending" },
];

interface Provider {
  _id: string;
  name: string;
  email: string;
  phoneNo: string;
  address: string;
  module?: {
    name: string;
  };
  setBusinessPlan: string;
  isDeleted?: boolean;
}

interface ProviderTableData {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  module: string;
  status: string;
}


const ProviderList = () => {
  const { providers } = useProvider();
  const { modules } = useModule();
  const [selectedModule, setSelectedModule] = useState<string>('');
  const [filteredProviders, setFilteredProviders] = useState<ProviderTableData[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [sort, setSort] = useState('latest');
  const [message, setMessage] = useState<string>('');
  // const [activeTab, setActiveTab] = useState<'all' | 'active' | 'inactive'>('all');
  // const [selectedPlan, setSelectedPlan] = useState('');
  console.log(providers);

  console.log("provider list : ", providers);

  const fetchFilteredProviders = async () => {
    try {
      
      const params = {
        ...(selectedModule && {selectedModule: selectedModule}),
        ...(sort && { sort }),
        ...(searchQuery && { search: searchQuery }),
      };

      const response = await axios.get('/api/provider', { params });
      // console.log("response of the providers : ", response)
      const data = response.data.data;

      console.log("response of the providers : ", data)

      if (!Array.isArray(data) || data.length === 0) {
        setFilteredProviders([]);
        setMessage(data.message || 'No providers found');
      } else {
        const updatedProviders = data.map((provider: Provider): ProviderTableData => ({
          id: provider._id,
          name: provider.name,
          email: provider.email,
          phone: provider.phoneNo,
          address: provider.address,
          module: provider.module?.name || "N/A",
          status: provider.isDeleted ? 'Inactive' : 'Active',
        }));

        setFilteredProviders(updatedProviders);
        setMessage('');
      }
    } catch (error) {
      console.error('Error fetching providers:', error);
      setFilteredProviders([]);
      setMessage('Something went wrong while fetching providers');
    }
  };

  useEffect(() => {
    fetchFilteredProviders();
  }, [sort, searchQuery,selectedModule]);


  const moduleOptions = modules.map((module) => ({
    value: module._id, // or value: module if you want full object
    label: module.name,
    image: module.image,
  }));

  const columns = [
    { header: 'Name', accessor: 'name' },
    { header: 'Email', accessor: 'email' },
    { header: 'Phone', accessor: 'phone' },
    { header: 'Address', accessor: 'address' },
    { header: 'Module', accessor: 'module' },
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

  console.log("selected module : ", selectedModule)

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
                <span className="absolute text-gray-500 -translate-y-1/2 pointer-events-none right-3 top-1/2 dark:text-gray-400">
                  <ChevronDownIcon />
                </span>
              </div>
            </div>

            <div>
              <Label>Select Input</Label>
              <div className="relative">
                <Select
                  options={options}
                  placeholder="Sort By"
                  onChange={(value: string) => setSort(value)}
                  className="dark:bg-dark-900"
                />
                <span className="absolute text-gray-500 -translate-y-1/2 pointer-events-none right-3 top-1/2 dark:text-gray-400">
                  <ChevronDownIcon />
                </span>
              </div>
            </div>

            <div>
              <Label>Search by Provider Name & Email</Label>
              <Input
                type="text"
                placeholder="Enter Provider Name & Email"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

          </div>
        </ComponentCard>
      </div>

      <ComponentCard title="Provider List Table">
        {message ? (
          <p className="text-red-500 text-center my-4">{message}</p>
        ) : (
          <BasicTableOne columns={columns} data={filteredProviders} />
        )}
      </ComponentCard>
    </div>
  );
};

export default ProviderList;
