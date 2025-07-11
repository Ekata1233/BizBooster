import { Location } from '@/app/(admin)/provider-management/provider-details/[id]/page';
import { Provider } from '@/context/ProviderContext';
import Image from 'next/image'; // optional: move shared utils here
import ComponentCard from '../common/ComponentCard';

interface Props {
    provider: Provider;
}

const ProviderInfoSection: React.FC<Props> = ({ provider }) => {
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
                            <p className="text-sm text-gray-500 whitespace-nowrap">Referral Code:</p>
                            <p className="font-medium">{provider.referralCode || '-'}</p>
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