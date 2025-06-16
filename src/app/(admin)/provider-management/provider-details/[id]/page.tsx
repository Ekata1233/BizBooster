'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import { useProvider } from '@/context/ProviderContext';
import PageBreadcrumb from '@/components/common/PageBreadCrumb';
import UserMetaCard from '@/components/user-profile/UserMetaCard';
import StatCard from '@/components/common/StatCard';
import { ArrowUpIcon, BoxCubeIcon, CalenderIcon, DollarLineIcon, EyeIcon, UserIcon } from '@/icons';
import BasicTableOne from '@/components/tables/BasicTableOne';
import Link from 'next/link';
import ProviderInfoSection from '@/components/provider-component/ProviderInfoSection';
import ProviderStatsSection from '@/components/provider-component/ProviderStatsSection';
import ProviderSubscribedServices from '@/components/provider-component/ProviderSubscribedServices';

interface KycDocs {
  GST?: string[];
  aadhaarCard?: string[];
  other?: string[];
  panCard?: string[];
  storeDocument?: string[];
}

export interface Location {
  _id?: string;
  name?: string;
  coordinates: [number, number];
  isDeleted?: boolean;
  createdAt?: string;
  updatedAt?: string;
  __v?: number;
  type?: string;
}

interface StoreInfo {
  address?: string;
  city?: string;
  country?: string;
  cover?: string;
  location?: Location;
  logo?: string;
  officeNo?: string;
  state?: string;
  storeEmail?: string;
  storeName?: string;
  storePhone?: string;
  tax?: string;
  zone?: string;
}

interface Module {
  _id: string;
  name: string;
  image?: string;
  isDeleted: boolean;
  createdAt: string;
  updatedAt?: string;
  __v?: number;
}

interface SubscribedService {
  _id: string;
  serviceName: string;
  price: number;
  discountedPrice: number;
  isDeleted: boolean;
}

interface Provider {
  _id: string;
  fullName: string;
  email: string;
  phoneNo?: string;
  kyc?: KycDocs;
  password?: string;
  referralCode?: string | null;
  storeInfo?: StoreInfo;
  logo?: string;
  module?: Module;
  subscribedServices?: SubscribedService[];
  createdAt: string;
  updatedAt: string;
  isDeleted?: boolean;
  isVerified?: boolean;
}

export interface TableData {
  id: string;
  serviceName: string;
  price: number;
  discountedPrice: number;
  isDeleted: boolean;
}

const ProviderDetailsPage = () => {
  const { id } = useParams();
  const { providerDetails } = useProvider();
  console.log("provider details : ", providerDetails)

  const [provider, setProvider] = useState<Provider | null>(null);
  const [activeTab, setActiveTab] = useState('info');

  useEffect(() => {
    if (providerDetails && ((providerDetails as unknown) as Provider[]).length > 0) {
      const selected = ((providerDetails as unknown) as Provider[]).find(
        (p: Provider) => p._id === id
      ) || null;

      setProvider(selected);
    }
  }, [providerDetails, id]);

  if (!provider) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center text-gray-500 text-lg">Loading provider details...</div>
      </div>
    );
  }



  const data = provider?.subscribedServices?.map((service) => ({
    id: service._id,
    serviceName: service.serviceName,
    price: service.price,
    discountedPrice: service.discountedPrice,
    isDeleted: service.isDeleted,
  }));


  const columns = [
    {
      header: 'Service Name',
      accessor: 'serviceName',
    },
    {
      header: 'Price',
      accessor: 'price',
    },
    {
      header: 'Discount Price',
      accessor: 'discountedPrice',
    },
    {
      header: 'Status',
      accessor: 'status',
      render: (row: TableData) => {
        const status = row.isDeleted;
        let colorClass = '';

        switch (status) {
          case true:
            colorClass = 'text-red-500 bg-red-100 border border-red-300';
            break;
          case false:
            colorClass = 'text-green-600 bg-green-100 border border-green-300';
            break;
          default:
            colorClass = 'text-gray-600 bg-gray-100 border border-gray-300';
        }

        return (
          <span className={`px-3 py-1 rounded-full text-sm font-semibold ${colorClass}`}>
            {status ? 'Inactive' : 'Active'}
          </span>
        );
      },
    },

    {
      header: 'Action',
      accessor: 'action',
      render: (row: TableData) => (
        <div className="flex gap-2">
          <Link href={`/service-management/service-details/${row.id}`} passHref>
            <button className="text-blue-500 border border-blue-500 rounded-md p-2 hover:bg-blue-500 hover:text-white hover:border-blue-500">
              <EyeIcon />
            </button>
          </Link>
        </div>
      ),
    }

  ];

  return (
    <div className="container mx-auto p-4">
      <PageBreadcrumb pageTitle="Provider Details" />

      <div className="space-y-6">
        <div className="border rounded-lg p-6 shadow-sm bg-gradient-to-br from-blue-50 to-white">
          <UserMetaCard
            imageSrc={provider.storeInfo?.logo || "/images/logo/default-provider.webp"}
            name={provider.fullName || provider.storeInfo?.storeName || "No Name"}
            role={provider.email}
            location={provider.storeInfo?.address || "No address provided"}
          />
        </div>

        <div className="border-b border-gray-200">
          <ul className="flex space-x-6 text-sm font-medium text-center text-gray-500">
            <li
              className={`cursor-pointer px-4 py-2 ${activeTab === 'info' ? 'border-b-2 border-blue-600 text-blue-600' : ''}`}
              onClick={() => setActiveTab('info')}
            >
              Provider Info
            </li>
            <li
              className={`cursor-pointer px-4 py-2 ${activeTab === 'stats' ? 'border-b-2 border-blue-600 text-blue-600' : ''}`}
              onClick={() => setActiveTab('stats')}
            >
              Statestics
            </li>
            <li
              className={`cursor-pointer px-4 py-2 ${activeTab === 'subscribe' ? 'border-b-2 border-blue-600 text-blue-600' : ''}`}
              onClick={() => setActiveTab('subscribe')}
            >
              Subscribe Services
            </li>
          </ul>
        </div>

        <div className='space-y-6 pt-4'>
          {activeTab === 'info' && <ProviderInfoSection provider={provider} />}
          {activeTab === 'stats' && <ProviderStatsSection provider={provider} />}
          {activeTab === 'subscribe' && <ProviderSubscribedServices data={data || []} />}
        </div>
      </div>
    </div>
  );
};

export default ProviderDetailsPage;