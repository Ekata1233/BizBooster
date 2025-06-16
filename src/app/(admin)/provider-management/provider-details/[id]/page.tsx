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

        {/* <div className='space-y-6 pt-4'>
          {activeTab === 'info' && <ProviderInfoSection provider={provider} />}
          {activeTab === 'stats' && <ProviderStatsSection provider={provider} />}
          {activeTab === 'subscribe' && <ProviderSubscribedServices data={data || []} />}
        </div> */}

        {/* <div className="space-y-6 pt-4">
          {activeTab === 'info' && (
            <>
              <div className="border rounded-lg p-6 shadow-sm bg-gradient-to-br  to-white">
                <h2 className="text-xl font-semibold mb-4 pb-2 border-b">
                  Basic Information
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-2">
                    <p className="text-sm text-gray-500 whitespace-nowrap">Full Name:</p>
                    <p className="font-medium">{provider.fullName}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm text-gray-500 whitespace-nowrap">Email:</p>
                    <p className="font-medium">{provider.email}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm text-gray-500 whitespace-nowrap">Phone:</p>
                    <p className="font-medium">{provider.phoneNo || provider.storeInfo?.storePhone || '-'}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm text-gray-500 whitespace-nowrap">Referral Code:</p>
                    <p className="font-medium">{provider.referralCode || '-'}</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-6">
                <div className="border rounded-lg p-6 shadow-sm bg-gradient-to-br to-white">
                  <h2 className="text-xl font-semibold mb-4 pb-2 border-b ">
                    Store Information
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="flex items-center gap-2">
                      <p className="text-sm text-gray-500 whitespace-nowrap">Store Name:</p>
                      <p className="font-medium">{provider.storeInfo?.storeName || '-'}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm text-gray-500 whitespace-nowrap">Address:</p>
                      <p className="font-medium">{provider.storeInfo?.address || '-'}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm text-gray-500 whitespace-nowrap">City:</p>
                      <p className="font-medium">{provider.storeInfo?.city || '-'}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm text-gray-500 whitespace-nowrap">State:</p>
                      <p className="font-medium">{provider.storeInfo?.state || '-'}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm text-gray-500 whitespace-nowrap">Country:</p>
                      <p className="font-medium">{provider.storeInfo?.country || '-'}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm text-gray-500 whitespace-nowrap">Office Number:</p>
                      <p className="font-medium">{provider.storeInfo?.officeNo || '-'}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm text-gray-500 whitespace-nowrap">Store Email:</p>
                      <p className="font-medium">{provider.storeInfo?.storeEmail || '-'}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm text-gray-500 whitespace-nowrap">Store Phone:</p>
                      <p className="font-medium">{provider.storeInfo?.storePhone || '-'}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm text-gray-500 whitespace-nowrap">Tax:</p>
                      <p className="font-medium">{provider.storeInfo?.tax || '-'}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm text-gray-500 whitespace-nowrap">Zone:</p>
                      <p className="font-medium">{provider.storeInfo?.zone || '-'}</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <p className="text-sm text-gray-500 whitespace-nowrap">Location:</p>
                      <div className="font-medium">
                        {renderLocation(provider.storeInfo?.location)}
                      </div>
                    </div>
                  </div>
                  {provider.storeInfo?.cover && (
                    <div className="mt-4">
                      <p className="text-sm text-gray-500">Store Cover Image</p>
                      <Image
                        src={provider.storeInfo.cover}
                        alt="Store Cover"
                        width={250}
                        height={140}
                        className="rounded border border-gray-200"
                      />
                    </div>
                  )}
                </div>

                <div className="border rounded-lg p-6 shadow-sm bg-gradient-to-brto-white">
                  <h2 className="text-xl font-semibold mb-4 pb-2 border-b">
                    KYC Documents
                  </h2>
                  <div className="space-y-4">
                    {[
                      { label: "GST Documents", data: provider.kyc?.GST },
                      { label: "Aadhaar Card", data: provider.kyc?.aadhaarCard },
                      { label: "PAN Card", data: provider.kyc?.panCard },
                      { label: "Other Documents", data: provider.kyc?.other },
                      { label: "Store Documents", data: provider.kyc?.storeDocument },
                    ].map((item, index) => (
                      <div key={index} className="flex items-center space-x-4">
                        <p className="text-sm text-gray-500 font-semibold w-40">{item.label}</p>
                        <div className="flex-1 flex flex-wrap items-center gap-2">
                          {renderImageArray(item.data)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}

          {activeTab === 'stats' && (
            <div className="border rounded-lg p-6 shadow-sm bg-gradient-to-br  to-white">
              <h2 className="text-xl font-semibold mb-4 pb-2 border-b">
                Statestics
              </h2>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 md:gap-6 my-5">
                <StatCard
                  title="Total Customer"
                  value="150"
                  icon={UserIcon}
                  badgeColor="success"
                  badgeValue="0.00%"
                  badgeIcon={ArrowUpIcon}
                />
                <StatCard
                  title="Total Subscribe Services"
                  value="150"
                  icon={CalenderIcon}
                  badgeColor="success"
                  badgeValue="0.00%"
                  badgeIcon={ArrowUpIcon}
                />
                <StatCard
                  title="Total Subcategories"
                  value="150"
                  icon={DollarLineIcon}
                  badgeColor="success"
                  badgeValue="0.00%"
                  badgeIcon={ArrowUpIcon}
                />
                <StatCard
                  title="Total Services"
                  value="150"
                  icon={BoxCubeIcon}
                  badgeColor="success"
                  badgeValue="0.00%"
                  badgeIcon={ArrowUpIcon}
                />
              </div>

            </div>
          )}

          {activeTab === 'subscribe' && (
            <div className="border rounded-lg p-6 shadow-sm bg-gradient-to-br  to-white">
              <h2 className="text-xl font-semibold mb-4 pb-2 border-b">
                Subscribe Services
              </h2>
              <div>
                <BasicTableOne columns={columns} data={data || []} />
              </div>
            </div>
          )}
        </div> */}
      </div>
    </div>
  );
};

export default ProviderDetailsPage;

