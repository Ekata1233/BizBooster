'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import { useService } from '@/context/ServiceContext';
import PageBreadcrumb from '@/components/common/PageBreadCrumb';
import ComponentCard from '@/components/common/ComponentCard';
import {
    ChevronDownIcon,
} from "../../../../../icons/index";

interface ExtraSection {
    title: string;
    description: string;
}

interface WhyChooseItem {
    title: string;
    description: string;
    image: string;
}

interface FaqItem {
    question: string;
    answer: string;
}

interface ServiceDetails {
    overview: string;
    highlight: string;
    benefits: string;
    howItWorks: string;
    termsAndConditions: string;
    document: string;
    extraSections?: ExtraSection[]; // <-- add this
    whyChoose?: WhyChooseItem[];    // <-- and this
    faq?: FaqItem[];                // <-- and this
}

interface Service {
    _id: string;
    serviceName: string;
    thumbnailImage: string;
    category: { name: string };
    subcategory: { name: string };
    price: number;
    serviceDetails: ServiceDetails;
    franchiseDetails: {
        overview: string;
        commission: string;
        howItWorks: string;
        termsAndConditions: string;
    };
}


const ServiceDetailsPage = () => {
    const params = useParams();
    const id = params?.id as string;
    const [activeTab, setActiveTab] = useState<'service' | 'franchise'>('service');
    const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

    const {
        fetchSingleService,
        singleService,
        singleServiceLoading,
        singleServiceError,
    } = useService();

    console.log("service details : ", singleService)

    useEffect(() => {
        if (id) {
            fetchSingleService(id);
        }
    }, [id]);

    if (singleServiceLoading) {
        return <div className="text-center text-gray-500">Loading service...</div>;
    }

    if (singleServiceError) {
        return <div className="text-center text-red-500">Error: {singleServiceError}</div>;
    }

    if (!singleService) {
        return <div className="text-center text-gray-500">No service found.</div>;
    }

    const service = singleService;

    return (
        <div className="p-4 space-y-6">
            <PageBreadcrumb pageTitle={`${service.serviceName}`} />

            {/* Meta Card */}
            <div className="flex items-center gap-6">
                <Image
                    src={service.thumbnailImage}
                    alt={service.serviceName}
                    width={150}
                    height={100}
                    className="rounded shadow"
                />
                <div>
                    <h2 className="text-2xl font-semibold">{service.serviceName}</h2>
                    <p className="text-gray-600">{service.category.name} / {service.subcategory.name}</p>
                    <p className="text-lg font-medium mt-2">₹{service.price}</p>
                </div>
            </div>

            {/* Tabs */}
            <div className="border-b border-gray-300 mb-4">
                <button
                    className={`px-4 py-2 mr-2 text-sm font-medium ${activeTab === 'service' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500'
                        }`}
                    onClick={() => setActiveTab('service')}
                >
                    Service Details
                </button>
                <button
                    className={`px-4 py-2 text-sm font-medium ${activeTab === 'franchise' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500'
                        }`}
                    onClick={() => setActiveTab('franchise')}
                >
                    Franchise Details
                </button>
            </div>

            {/* Service Tab Content */}
            {activeTab === 'service' && (
                <ComponentCard title="Service Details">
                    <div className="space-y-4">
                        <SectionCard title="Overview" content={service.serviceDetails.overview} />
                        <SectionCard title="Highlight" content={service.serviceDetails.highlight} />
                        <SectionCard title="Benefits" isHtml content={service.serviceDetails.benefits} />
                        <SectionCard title="How It Works" content={service.serviceDetails.howItWorks} />
                        <SectionCard title="Terms & Conditions" content={service.serviceDetails.termsAndConditions} />
                        <SectionCard title="Document" content={service.serviceDetails.document} />

                        {/* Extra Sections */}
                        {service.serviceDetails.extraSections && service.serviceDetails.extraSections.length > 0 && (
                            <ComponentCard title="Extra Sections">
                                {service.serviceDetails.extraSections.map((item: any, i: number) => (
                                    <div key={i} className="mb-4">
                                        <p className="font-medium">{item.title}</p>
                                        <p className="text-sm text-gray-700">{item.description}</p>
                                    </div>
                                ))}
                            </ComponentCard>
                        )}


                        {/* Why Choose */}
                        {service.serviceDetails.whyChoose && service.serviceDetails.whyChoose.length > 0 && (
                            <ComponentCard title="Why Choose Us">
                                <div className="grid sm:grid-cols-2 gap-4">
                                    {service.serviceDetails.whyChoose.map((item: any, i: number) => (
                                        <div key={i} className="flex gap-4 items-start p-3 border rounded">
                                            <img src={item.image} alt="Why Choose" className="w-12 h-12 rounded object-cover" />
                                            <div>
                                                <p className="font-semibold">{item.title}</p>
                                                <p className="text-sm text-gray-600">{item.description}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </ComponentCard>
                        )}

                        {/* FAQs */}
                        {service.serviceDetails.faq && service.serviceDetails.faq.length > 0 && (
                            <ComponentCard title="FAQs">
                                <div className="space-y-2">
                                    {service.serviceDetails.faq.map((item: any, i: number) => (
                                        <div key={i} className="border rounded-md p-3 shadow-sm bg-white">
                                            <button
                                                onClick={() =>
                                                    setOpenFaqIndex(openFaqIndex === i ? null : i)
                                                }
                                                className="flex items-center justify-between w-full text-left"
                                            >
                                                <span className="flex items-center font-medium text-primary">
                                                    <ChevronDownIcon className="mr-2" />
                                                    Q: {item.question}
                                                </span>
                                                {openFaqIndex === i ? (
                                                    <ChevronDownIcon className="text-xl" />
                                                ) : (
                                                    <ChevronDownIcon className="text-xl" />
                                                )}
                                            </button>
                                            {openFaqIndex === i && (
                                                <div className="mt-2 ml-6 text-gray-700 text-sm">
                                                    <strong>A:</strong> {item.answer}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </ComponentCard>
                        )}

                    </div>
                </ComponentCard>
            )}

            {/* Franchise Tab Content */}
            {activeTab === 'franchise' && (
                <ComponentCard title="Franchise Details">
                    <div className="space-y-4">
                        <SectionCard title="Overview" content={service.franchiseDetails.overview} />
                        <SectionCard title="Commission" content={service.franchiseDetails.commission} />
                        <SectionCard title="How It Works" content={service.franchiseDetails.howItWorks} />
                        <SectionCard title="Terms & Conditions" content={service.franchiseDetails.termsAndConditions} />
                    </div>
                </ComponentCard>
            )}
        </div>
    );
};

// Section Card Component
const SectionCard = ({
    title,
    content,
    icon,
    isHtml = false,
}: {
    title: string;
    content: string;
    icon?: React.ReactNode;
    isHtml?: boolean;
}) => (
    <div className="bg-white shadow-sm border rounded p-4">
        <h4 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
            {icon}
            {title}
        </h4>
        {isHtml ? (
            <div className="text-sm text-gray-700" dangerouslySetInnerHTML={{ __html: content }} />
        ) : (
            <p className="text-sm text-gray-700">{content}</p>
        )}
    </div>
);

export default ServiceDetailsPage;
