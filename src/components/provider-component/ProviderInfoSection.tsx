import { Location } from '@/app/(admin)/provider-management/provider-details/[id]/page';
import { Provider } from '@/context/ProviderContext';
import Image from 'next/image'; // optional: move shared utils here
import ComponentCard from '../common/ComponentCard';
import { useEffect, useState } from 'react';

interface Props {
    provider: Provider;
}

interface Module {
    _id: string;
    name: string;
}
const ProviderInfoSection: React.FC<Props> = ({ provider }) => {
    const [moduleName, setModuleName] = useState<string>('Loading...');
    const [zoneName, setZoneName] = useState<string>('Loading...');


    useEffect(() => {
        const fetchModule = async () => {
            if (!provider.storeInfo?.module) {
                setModuleName('No Module Registered');
                return;
            }

            try {
                const res = await fetch(`https://api.fetchtrue.com/api/modules/${provider.storeInfo.module}`);
                const data = await res.json();
                if (data.success && data.data?.name) {
                    setModuleName(data.data.name);
                } else {
                    setModuleName('Module Not Found');
                }
            } catch (error) {
                console.error('Error fetching module:', error);
                setModuleName('Error fetching module');
            }
        };

        const fetchZone = async () => {
            if (!provider?.storeInfo?.zone) {
                setZoneName("No Zone Registered");
                return;
            }

            try {
                const res = await fetch(
                    `https://api.fetchtrue.com/api/zone/${provider.storeInfo.zone}`
                );
                const data = await res.json();

                console.log("data of the zone : ", data);

                if (data.success && data.data?.name) {
                    setZoneName(data.data.name);
                } else {
                    setZoneName("Zone Not Found");
                }
            } catch (error) {
                console.error("Error fetching zone:", error);
                setZoneName("Error fetching zone"); // ✅ fixed
            }
        };

        fetchModule();
        fetchZone();
    }, [provider.storeInfo?.module, provider?.storeInfo?.zone]);

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

    const hasStoreInfo = provider.storeInfo && Object.values(provider.storeInfo).some(val => val !== undefined && val !== null);
    const hasKYC = provider.kyc && Object.values(provider.kyc).some(val => val !== undefined && val !== null);

    return (
        <>
            <div className="">
                <ComponentCard title="Basic Information">
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
                            <p className="text-sm text-gray-500 whitespace-nowrap">Module Name :</p>
                            <p className="font-medium">{moduleName || 'No Any Moduel Registered'}</p>
                        </div>

                        <div className="flex items-center gap-2">
                            <p className="text-sm text-gray-500 whitespace-nowrap">Zone Name :</p>
                            <p className="font-medium">{zoneName || 'No Any Zone Registered'}</p>
                        </div>
                    </div>
                </ComponentCard>
            </div>

            <div className="grid grid-cols-1 gap-6">
                <div className="">
                    <ComponentCard title="Store Information">
                        {!hasStoreInfo ? (
                            <p className="text-red-500 italic">Store info pending</p>
                        ) : (
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
                                    <p className="text-sm text-gray-500 whitespace-nowrap">Store Email:</p>
                                    <p className="font-medium">{provider.storeInfo?.storeEmail || '-'}</p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <p className="text-sm text-gray-500 whitespace-nowrap">Store Phone:</p>
                                    <p className="font-medium">{provider.storeInfo?.storePhone || '-'}</p>
                                </div>

                                {/* <div className="flex items-center gap-2">
                                    <p className="text-sm text-gray-500 whitespace-nowrap">Zone:</p>
                                    <p className="font-medium">{provider.storeInfo?.zone || '-'}</p>
                                </div> */}

                            </div>

                        )}
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
                    </ComponentCard>

                </div>

                <div className="">
                    <ComponentCard title="KYC Documents">
                        {!hasKYC ? (
                            <p className="text-red-500 italic">KYC details pending</p>
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
                    </ComponentCard>
                </div>
            </div>
        </>
    );
};

export default ProviderInfoSection;