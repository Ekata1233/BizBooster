'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useProvider } from '@/context/ProviderContext';
import PageBreadcrumb from '@/components/common/PageBreadCrumb';
import UserMetaCard from '@/components/user-profile/UserMetaCard';
import {  EyeIcon } from '@/icons';
import Link from 'next/link';
import ProviderInfoSection from '@/components/provider-component/ProviderInfoSection';
import ProviderStatsSection from '@/components/provider-component/ProviderStatsSection';
import ProviderSubscribedServices from '@/components/provider-component/ProviderSubscribedServices';
import ProviderBookings from '@/components/provider-component/ProviderBookings';
import ProviderServiceMan from '@/components/provider-component/ProviderServiceMan';
import ProviderBankInfo from '@/components/provider-component/ProviderBankInfo';
import ProviderWallet from '@/components/provider-component/ProviderWallet';

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

export interface SubscribedService {
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
  providerId: string;
  
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
  // console.log("particular provider details : ", providerDetails)

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

  return (
    <div className="container mx-auto p-4">
      <PageBreadcrumb pageTitle="Provider Details" />

      <div className="space-y-6">
        <div className="">
          <UserMetaCard
            userId={provider._id}
            imageSrc={provider.storeInfo?.logo || "/images/logo/default-provider.webp"}
            name={provider.fullName || provider.storeInfo?.storeName || "No Name"}
            role={provider.email}
            location={provider.storeInfo?.address || "No address provided"}
            isCommissionDistribute={false}
            isToggleButton={true}
            franchiseId={provider.providerId}

          />
        </div>

        <div className="">
          <ul className="flex space-x-6 text-sm font-medium text-center text-gray-500">
            <li
              className={`cursor-pointer px-4 py-2 text-sm font-medium rounded-md border ${activeTab === 'info'
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-white text-gray-700 border-gray-300 hover:bg-blue-50'
                }`}
              onClick={() => setActiveTab('info')}
            >
              Provider Info
            </li>
            <li
              className={`cursor-pointer px-4 py-2 text-sm font-medium rounded-md border ${activeTab === 'stats'
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-white text-gray-700 border-gray-300 hover:bg-blue-50'
                }`}
              onClick={() => setActiveTab('stats')}
            >
              Statestics
            </li>
            {/* <li
              className={`cursor-pointer px-4 py-2 text-sm font-medium rounded-md border ${activeTab === 'subscribe'
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-white text-gray-700 border-gray-300 hover:bg-blue-50'
                }`}
              onClick={() => setActiveTab('subscribe')}
            >
              Subscribed Services
            </li> */}
            <li
              className={`cursor-pointer px-4 py-2 text-sm font-medium rounded-md border ${activeTab === 'bookings'
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-white text-gray-700 border-gray-300 hover:bg-blue-50'
                }`}
              onClick={() => setActiveTab('bookings')}
            >
              Bookings
            </li>
            <li
              className={`cursor-pointer px-4 py-2 text-sm font-medium rounded-md border ${activeTab === 'serviceMan'
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-white text-gray-700 border-gray-300 hover:bg-blue-50'
                }`}
              onClick={() => setActiveTab('serviceMan')}
            >
              Service Man List
            </li>
            <li
              className={`cursor-pointer px-4 py-2 text-sm font-medium rounded-md border ${activeTab === 'bank'
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-white text-gray-700 border-gray-300 hover:bg-blue-50'
                }`}
              onClick={() => setActiveTab('bank')}
            >
              Bank Information
            </li>
            <li
              className={`cursor-pointer px-4 py-2 text-sm font-medium rounded-md border ${activeTab === 'wallet'
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-white text-gray-700 border-gray-300 hover:bg-blue-50'
                }`}
              onClick={() => setActiveTab('wallet')}
            >
              Wallet
            </li>
          </ul>
        </div>


        <div className='space-y-6 pt-4'>
          {activeTab === 'info' && <ProviderInfoSection provider={provider} />}
          {activeTab === 'stats' && provider && <ProviderStatsSection provider={provider} />}
          {activeTab === 'subscribe' && <ProviderSubscribedServices data={data || []} />}
          {activeTab === 'bookings' && <ProviderBookings provider={provider} />}
          {activeTab === 'serviceMan' && <ProviderServiceMan provider={provider} />}
          {activeTab === 'bank' && <ProviderBankInfo  />}
          {activeTab === 'wallet' && <ProviderWallet provider={provider} />}
        </div>
      </div>
    </div>
  );
};

export default ProviderDetailsPage;