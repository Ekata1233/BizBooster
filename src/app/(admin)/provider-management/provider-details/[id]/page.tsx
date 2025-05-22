'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import { useProvider } from '@/context/ProviderContext';
import PageBreadcrumb from '@/components/common/PageBreadCrumb';
import UserMetaCard from '@/components/user-profile/UserMetaCard';
import Provider from '@/models/Provider';

const ProviderDetailsPage = () => {
    const { id } = useParams();
    const { providers } = useProvider();
    const [provider, setProvider] = useState<any>(null);
    const [activeTab, setActiveTab] = useState('info');

    useEffect(() => {
        if (providers.length > 0) {
            const selected = providers.find((p) => p._id === id);
            setProvider(selected);
        }
    }, [providers, id]);

    if (!provider) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="text-center text-gray-500 text-lg">Loading provider details...</div>
            </div>
        );
    }

    return (
        <div className="container mx-auto p-4">
            <PageBreadcrumb pageTitle="Provider Details" />
            
            <div className="space-y-6">
                <div className="border rounded-lg p-6 shadow-sm bg-gradient-to-br from-blue-50 to-white">
                    <UserMetaCard
                        imageSrc={provider.companyLogo || "/images/logo/default-provider.webp"}
                        name={provider.name}
                        role={provider.email}
                        location={provider.address}
                    />
                </div>

                {/* Tabs Navigation */}
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
                            Stats
                        </li>
                    </ul>
                </div>

                {/* Tab Content */}
                <div className="space-y-6 pt-4">
                    {activeTab === 'info' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Basic Information */}
                            <div className="border rounded-lg p-6 shadow-sm bg-gradient-to-br from-purple-50 to-white">
                                <h2 className="text-xl font-semibold mb-4 pb-2 border-b border-purple-100 text-purple-700">
                                    Basic Information
                                </h2>
                                <div className="space-y-4">
                                    <div>
                                        <p className="text-sm text-gray-500">Name</p>
                                        <p className="font-medium">{provider.name}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">Email</p>
                                        <p className="font-medium">{provider.email}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">Phone</p>
                                        <p className="font-medium">{provider.phoneNo}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">Address</p>
                                        <p className="font-medium">{provider.address}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">Longitude</p>
                                        <p className="font-medium">{provider.addressLongitude}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">Latitude</p>
                                        <p className="font-medium">{provider.addressLatitude}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Business Information */}
                            <div className="border rounded-lg p-6 shadow-sm bg-gradient-to-br from-yellow-50 to-white">
                                <h2 className="text-xl font-semibold mb-4 pb-2 border-b border-yellow-100 text-yellow-700">
                                    Business Information
                                </h2>
                                <div className="space-y-4">
                                    <div>
                                        <p className="text-sm text-gray-500">Business Plan</p>
                                        <p className="font-medium">{provider.setBusinessPlan}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">Identity Type</p>
                                        <p className="font-medium">{provider.identityType}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">Identity Number</p>
                                        <p className="font-medium">{provider.identityNumber}</p>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div>
                                            <p className="text-sm text-gray-500">ID Image</p>
                                            {provider.identificationImage && (
                                                <Image
                                                    src={provider.identificationImage}
                                                    alt="ID"
                                                    width={120}
                                                    height={80}
                                                    className="mt-2 rounded border border-gray-200"
                                                />
                                            )}
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500">Company Logo</p>
                                            {provider.companyLogo && (
                                                <Image
                                                    src={provider.companyLogo}
                                                    alt="Logo"
                                                    width={120}
                                                    height={80}
                                                    className="mt-2 rounded border border-gray-200"
                                                />
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Contact Person */}
                            <div className="border rounded-lg p-6 shadow-sm bg-gradient-to-br from-green-50 to-white">
                                <h2 className="text-xl font-semibold mb-4 pb-2 border-b border-green-100 text-green-700">
                                    Contact Person
                                </h2>
                                <div className="space-y-4">
                                    <div>
                                        <p className="text-sm text-gray-500">Name</p>
                                        <p className="font-medium">{provider.contactPerson?.name || '-'}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">Email</p>
                                        <p className="font-medium">{provider.contactPerson?.email || '-'}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">Phone</p>
                                        <p className="font-medium">{provider.contactPerson?.phoneNo || '-'}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Account Information */}
                            <div className="border rounded-lg p-6 shadow-sm bg-gradient-to-br from-red-50 to-white">
                                <h2 className="text-xl font-semibold mb-4 pb-2 border-b border-red-100 text-red-700">
                                    Account Information
                                </h2>
                                <div className="space-y-4">
                                    <div>
                                        <p className="text-sm text-gray-500">Email</p>
                                        <p className="font-medium">{provider.accountInformation?.email || '-'}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">Phone</p>
                                        <p className="font-medium">{provider.accountInformation?.phoneNo || '-'}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'stats' && (
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                            <div className="border rounded-lg p-6 shadow-sm bg-gradient-to-br from-blue-50 to-white text-center">
                                <p className="text-sm text-gray-500">Total Bookings</p>
                                <p className="text-2xl font-bold">24</p>
                            </div>
                            <div className="border rounded-lg p-6 shadow-sm bg-gradient-to-br from-purple-50 to-white text-center">
                                <p className="text-sm text-gray-500">Total Revenue</p>
                                <p className="text-2xl font-bold">$12,450</p>
                            </div>
                            <div className="border rounded-lg p-6 shadow-sm bg-gradient-to-br from-yellow-50 to-white text-center">
                                <p className="text-sm text-gray-500">Active Tours</p>
                                <p className="text-2xl font-bold">8</p>
                            </div>
                            <div className="border rounded-lg p-6 shadow-sm bg-gradient-to-br from-green-50 to-white text-center">
                                <p className="text-sm text-gray-500">Rating</p>
                                <p className="text-2xl font-bold">4.8/5</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProviderDetailsPage;