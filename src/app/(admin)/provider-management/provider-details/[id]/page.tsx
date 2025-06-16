'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import { useProvider } from '@/context/ProviderContext';
import PageBreadcrumb from '@/components/common/PageBreadCrumb';
import UserMetaCard from '@/components/user-profile/UserMetaCard';
import StatCard from '@/components/common/StatCard';
import { ArrowUpIcon, BoxCubeIcon, CalenderIcon, DollarLineIcon, UserIcon } from '@/icons';

interface KycDocs {
  GST?: string[];
  aadhaarCard?: string[];
  other?: string[];
  panCard?: string[];
  storeDocument?: string[];
}

interface Location {
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
  subscribedServices?: string[];
  createdAt: string;
  updatedAt: string;
  isDeleted?: boolean;
  isVerified?: boolean;
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

  const renderImageArray = (images?: string[]) => {
    if (!images || images.length === 0) return <p className="text-gray-400 italic">No images</p>;
    return (
      <div className="flex flex-wrap gap-4 mt-2">
        {images.map((src, i) => (
          <Image
            key={i}
            src={src}
            alt={`Document ${i + 1}`}
            width={120}
            height={80}
            className="rounded border border-gray-200 object-cover"
          />
        ))}
      </div>
    );
  };

  const renderLocation = (location?: Location) => {
    if (!location) return '-';

    return (
      <div className="space-y-1">
        {location.name && <p>Name: {location.name}</p>}
        <p>Coordinates: [{location.coordinates[0]?.toFixed(4)}, {location.coordinates[1]?.toFixed(4)}]</p>
        {location.type && <p>Type: {location.type}</p>}
      </div>
    );
  };

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

        <div className="space-y-6 pt-4">
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
                {/* Store Information Section - Full Width with 3 columns */}
                <div className="border rounded-lg p-6 shadow-sm bg-gradient-to-br to-white">
                  <h2 className="text-xl font-semibold mb-4 pb-2 border-b ">
                    Store Information
                  </h2>
                  {!provider.storeInfo ? (
                    <p className="text-red-400 italic">Store information is pending</p>
                  ) : (
                    <>
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
                    </>
                  )}
                </div>

                {/* KYC Documents Section - Full Width */}
                <div className="border rounded-lg p-6 shadow-sm bg-gradient-to-brto-white">
                  <h2 className="text-xl font-semibold mb-4 pb-2 border-b">
                    KYC Documents
                  </h2>
                  {!provider.kyc ? (
                    <p className="text-red-400 italic">KYC information is pending</p>
                  ) : (
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
                  )}
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
              {provider.subscribedServices && provider.subscribedServices.length > 0 ? (
                <ul className="list-disc pl-5 space-y-1">
                  {provider.subscribedServices.map((serviceId, index) => (
                    <li key={index} className="text-gray-700">
                      {serviceId}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-400 italic">No subscribed services.</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProviderDetailsPage;