'use client';

import React, { useEffect, useState } from 'react';
import ComponentCard from '@/components/common/ComponentCard';
import PageBreadcrumb from '@/components/common/PageBreadCrumb';
import Input from '@/components/form/input/InputField';
import Label from '@/components/form/Label';
import { useService } from '@/context/ServiceContext';
import { useParams, useRouter } from 'next/navigation';
import { useSubscribe } from '@/context/SubscribeContext';

const Page = () => {
    const params = useParams();
    const id = params?.id as string;
    const providerId = params?.providerId as string;


    console.log("praramdfd : ", params)

    const {
        fetchSingleService,
        singleService,
        singleServiceLoading,
        singleServiceError,
    } = useService();
    const { approveService, deleteService } = useSubscribe();

    const [newCommissionValue, setNewCommissionValue] = useState('');
    const [newCommissionType, setNewCommissionType] = useState<'percentage' | 'amount'>('percentage');
    const [isApproved, setIsApproved] = useState(false);
    const [isApproving, setIsApproving] = useState(false);
    const router = useRouter();
    console.log(isApproving);

    console.log("service single : ", singleService)

    useEffect(() => {
        if (id) {
            fetchSingleService(id);
        }
    }, [id]);

    const handleNewTypeChange = (newType: 'percentage' | 'amount') => {
        setNewCommissionType(newType);
        const formatted =
            newType === 'percentage' ? `${newCommissionValue}%` : `₹${newCommissionType}`;
    };

    const handleNewCommissionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        // Allow only numbers
        if (/^\d*$/.test(value)) {
            setNewCommissionValue(value); // ✅ string
            const formatted =
                newCommissionType === "percentage" ? `${value}%` : `₹${value}`;
        }
    };

    const handleApprove = async () => {
        if (!singleService || !providerId || !newCommissionValue) {
            alert('Missing data. Cannot approve.');
            return;
        }

        setIsApproving(true);
        try {
            const providerCommission =
                newCommissionType === 'percentage'
                    ? `${newCommissionValue}%`
                    : `₹${newCommissionValue}`;

            await approveService(singleService._id, providerId, providerCommission);

            alert('Service approved successfully!');
            setIsApproved(true);

            // Optional: update table or navigate back
            router.push('/subscribe-management/subscribe-request')
        } catch (err) {
            console.error('Approval failed:', err);
            alert('Something went wrong while approving.');
        } finally {
            setIsApproving(false);
        }
    };

    const matchedProviderPrice = singleService?.providerPrices?.find(
        (item) => item.provider === providerId
    );
    console.log("updtaed price 11 :", matchedProviderPrice);

    if (singleServiceLoading) return <div>Loading...</div>;
    if (singleServiceError) return <div>Error: {singleServiceError}</div>;
    if (!singleService) return <div>No service found</div>;

    return (
        <div>
            <PageBreadcrumb pageTitle="Service Details" />

            <div className="my-5">
                <ComponentCard title="Service Details">
                    <div className="text-xl font-semibold mb-4">{singleService.serviceName}</div>
                    <div>
                        <img
                            src={singleService.thumbnailImage}
                            alt="Thumbnail"
                            className="w-60 h-40 object-cover rounded-lg"
                        />
                    </div>
                </ComponentCard>
            </div>



            <ComponentCard title="Payment Details">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="flex flex-col">
                        <Label>Previous Price</Label>
                        <Input
                            type="text"
                            placeholder="Previous Price"
                            value={`₹${singleService?.price ?? ''}`}
                        />
                    </div>

                    <div className="flex flex-col">
                        <Label>Previous After Discount Price</Label>
                        <Input
                            type="text"
                            placeholder="After Discount Price"
                            value={`₹${singleService?.discountedPrice ?? ''}`}
                        />
                    </div>

                    <div className="flex flex-col">
                        <Label>Previous Commission</Label>
                        <Input
                            type="text"
                            placeholder="Previous Commission"
                            value={singleService?.franchiseDetails?.commission ?? ''}
                        />
                    </div>

                    <div className="flex flex-col">
                        <Label>Updated Price</Label>
                        <Input
                            type="text"
                            placeholder="Updated Price"
                            value={`₹${matchedProviderPrice?.providerMRP ?? ''}`} />
                    </div>
                    <div className="flex flex-col">
                        <Label>Updated Price</Label>
                        <Input
                            type="text"
                            placeholder="Updated Price"
                            value={`₹${matchedProviderPrice?.providerDiscount ?? ''}`} />
                    </div> <div className="flex flex-col">
                        <Label>Updated Price</Label>
                        <Input
                            type="text"
                            placeholder="Updated Price"
                            value={`₹${matchedProviderPrice?.providerPrice ?? ''}`} />
                    </div>
                    {/* <div className="flex flex-col">
            <Label>Updated After Discount Price</Label>
            <Input
              type="text"
              placeholder="After Discount Price"
              value={`₹${lead?.afterDicountAmount ?? ''}`}
            />
          </div> */}
                </div>

                <div className="flex items-center gap-4 mt-6">
                    {/* Input with currency/symbol */}
                    <div className="relative w-40">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm select-none">
                            {newCommissionType === 'percentage' ? '%' : '₹'}
                        </span>
                        <Input
                            type="text"
                            value={newCommissionValue}
                            onChange={handleNewCommissionChange}
                            placeholder={singleService?.franchiseDetails?.commission}
                            className="pl-8 pr-3 py-2 text-sm w-full"
                        />
                    </div>

                    {/* Commission type selector */}
                    <div className="flex gap-2">
                        <button
                            type="button"
                            onClick={() => handleNewTypeChange('percentage')}
                            className={`px-3 py-2 rounded-md border text-sm transition ${newCommissionType === 'percentage'
                                ? 'bg-blue-600 text-white border-blue-600'
                                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100'
                                }`}
                        >
                            %
                        </button>
                        <button
                            type="button"
                            onClick={() => handleNewTypeChange('amount')}
                            className={`px-3 py-2 rounded-md border text-sm transition ${newCommissionType === 'amount'
                                ? 'bg-blue-600 text-white border-blue-600'
                                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100'
                                }`}
                        >
                            ₹
                        </button>
                    </div>
                </div>
            </ComponentCard>

            <div className="flex justify-end mt-8">
                {!isApproved && (
                    <button
                        onClick={handleApprove}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg shadow font-medium"
                    >
                        Approve
                    </button>
                )}
            </div>
        </div>
    );
};


export default Page;
