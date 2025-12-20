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
import Link from 'next/link';

interface KeyValue {
  key: string;
  value: string;
  _id?: string;
}

type RowData = { title: string; description: string[] };
type InvestmentRangeItem = {
  minRange: number | string;
  maxRange: number | string;
};
type MonthlyEarnItem = {
  minEarn: string | number;
  maxEarn: string | number;
};
interface ConnectWithItem {
  name: string;
  email: string;
  mobileNo: string;
  _id?: string;
}

interface TitleDescItem {
  title: string;
  description: string;
  icon?: string;
  image?: string | File | null;
  _id?: string;
}

interface FaqItem {
  question: string;
  answer: string;
  _id?: string;
}

interface PackageItem {
  name: string;
  price: number;
  discount: number;
  discountedPrice: number;
  whatYouGet: string[];
  _id?: string;
}

interface TimeRequiredItem {
  minDays: number;
  maxDays: number;
  _id?: string;
}

interface ExtraSection {
  title: string;
  subtitle?: string[];
  description?: string[];
  subDescription?: string[];
  lists?: string[];
  tags?: string[];
  image?: string[]; 
  _id?: string;
}

interface FranchiseModelItem {
  title: string;
  agreement: string;
  price: number;
  discount: number;
  gst: number;
  _id?: string;
}

interface ServiceDetails {
  aboutUs: string[];
  assuredByFetchTrue: TitleDescItem[];
  benefits: string[];
  highlight: string[];
  howItWorks: TitleDescItem[];
  whyChooseUs: TitleDescItem[];
  faq: FaqItem[];
  document: string[];
  weRequired: TitleDescItem[];
  weDeliver: TitleDescItem[];
  moreInfo: TitleDescItem[];
  packages: PackageItem[];
  extraSections: ExtraSection[];
  extraImages: string[];
  connectWith: ConnectWithItem[];
  timeRequired: TimeRequiredItem[];
  termsAndConditions: string[];
}

interface FranchiseDetails {
  commission?: string;
  commissionType?: 'percentage' | 'amount';
  howItWorks?: string;
  termsAndConditions?: string;
  rows?: RowData[];
  investmentRange?: InvestmentRangeItem[];
  monthlyEarnPotential?: MonthlyEarnItem[];
  franchiseModel?: FranchiseModelItem[];
  extraSections?: ExtraSection[];
  extraImages?: string[];
}

export interface ServiceData {
  _id: string;
  serviceName: string;
  category: { _id: string; name: string; image?: string };
  subcategory: { _id: string; name: string; image?: string };
  thumbnailImage: string;
  bannerImages: string[];
  price: number;
  discount: number;
  gst: number;
  includeGst: boolean;
  gstInRupees?: number;
  discountedPrice?: number;
  totalWithGst?: number;
  averageRating: number;
  totalReviews: number;
  
  keyValues: KeyValue[];
  tags: string[];
  recommendedServices?: boolean;

  serviceDetails: ServiceDetails;
  franchiseDetails: FranchiseDetails;

  sortOrder?: number;
  isDeleted: boolean;
  createdAt?: string;
  updatedAt?: string;
}

const ServiceDetailsPage = () => {
  const params = useParams();
  const id = params?.id as string;
  const [activeTab, setActiveTab] = useState<'service' | 'franchise'>('service');
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());

  const {
    fetchSingleService,
    singleService,
    singleServiceLoading,
    singleServiceError,
  } = useService();

  useEffect(() => {
    if (singleService) {
      console.log("Fetched single service 👉", singleService);
    }
  }, [singleService]);

  const stripHtml = (html: string) => {
    if (!html) return "";
    return html.replace(/<[^>]+>/g, "").trim();
  };

  const toggleSection = (sectionId: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(sectionId)) {
      newExpanded.delete(sectionId);
    } else {
      newExpanded.add(sectionId);
    }
    setExpandedSections(newExpanded);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN').format(price);
  };

  useEffect(() => {
    if (id) {
      fetchSingleService(id);
    }
  }, [id]);

  if (singleServiceLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading service details...</p>
        </div>
      </div>
    );
  }

  if (singleServiceError) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center text-red-500 p-4 bg-red-50 rounded-lg max-w-md">
          <h3 className="text-lg font-semibold mb-2">Error Loading Service</h3>
          <p>{singleServiceError}</p>
          <button 
            onClick={() => fetchSingleService(id)}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!singleService) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h3 className="text-xl font-semibold text-gray-700 mb-2">Service Not Found</h3>
          <p className="text-gray-500">The service you're looking for doesn't exist.</p>
        </div>
      </div>
    );
  }

  const service: ServiceData = singleService;
  
  // Safe access to nested properties with fallbacks
  const serviceDetails: ServiceDetails = service?.serviceDetails || ({} as ServiceDetails);
  const franchiseDetails: FranchiseDetails = service?.franchiseDetails || ({} as FranchiseDetails);

  // Extract all data from serviceDetails
  const aboutUs = serviceDetails?.aboutUs || [];
  const benefits = serviceDetails?.benefits || [];
  const highlight = serviceDetails?.highlight || [];
  const howItWorks = serviceDetails?.howItWorks || [];
  const termsAndConditions = serviceDetails?.termsAndConditions || [];
  const document = serviceDetails?.document || [];
  const whyChooseUs = serviceDetails?.whyChooseUs || [];
  const faq = serviceDetails?.faq || [];
  const packages = serviceDetails?.packages || [];
  const weRequired = serviceDetails?.weRequired || [];
  const weDeliver = serviceDetails?.weDeliver || [];
  const moreInfo = serviceDetails?.moreInfo || [];
  const connectWith = serviceDetails?.connectWith || [];
  const timeRequired = serviceDetails?.timeRequired || [];
  const assuredByFetchTrue = serviceDetails?.assuredByFetchTrue || [];
  const extraSections = serviceDetails?.extraSections || [];
  const extraImages = serviceDetails?.extraImages || [];

  // Extract franchise data
  const franchiseCommission = franchiseDetails?.commission || '';
  const franchiseTerms = franchiseDetails?.termsAndConditions || '';
  const investmentRange = franchiseDetails?.investmentRange || [];
  const monthlyEarnPotential = franchiseDetails?.monthlyEarnPotential || [];
  const franchiseModel = franchiseDetails?.franchiseModel || [];
  const franchiseExtraSections = franchiseDetails?.extraSections || [];
  const franchiseExtraImages = franchiseDetails?.extraImages || [];

  const bannerImages = service?.bannerImages || [];
  const keyValues = service?.keyValues || [];
  const tags = service?.tags || [];

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      {/* Breadcrumb */}
      <div className="mb-6">
        <PageBreadcrumb 
          pageTitle={`${service.serviceName || 'Service Details'}`}
          items={[
            { label: 'Home', href: '/' },
            { label: 'Services', href: '/services' },
            { label: service.category?.name || 'Category', href: '#' },
            { label: service.serviceName || 'Details', href: '#' }
          ]}
        />
      </div>

      {/* Main Service Card */}
      <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Left side: Images */}
          <div className="lg:w-1/3">
            {/* Thumbnail */}
            <div className="mb-4">
              <div className="relative h-64 w-full rounded-lg overflow-hidden">
                <Image
                  src={service.thumbnailImage || '/placeholder-image.jpg'}
                  alt={service.serviceName}
                  fill
                  className="object-cover"
                  priority
                />
              </div>
              <p className="text-sm text-gray-500 mt-2 text-center">Thumbnail Image</p>
            </div>

            {/* Banner Images */}
            {bannerImages.length > 0 && (
              <div>
                <h4 className="font-medium text-gray-700 mb-2">Banner Images</h4>
                <div className="grid grid-cols-2 gap-3">
                  {bannerImages.map((bannerUrl, index) => (
                    <div key={index} className="relative h-32 rounded-lg overflow-hidden">
                      <Image
                        src={bannerUrl}
                        alt={`${service.serviceName} Banner ${index + 1}`}
                        fill
                        className="object-cover"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right side: Service Info */}
          <div className="lg:w-2/3">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{service.serviceName}</h1>
                <div className="flex items-center gap-2 mt-2">
                  <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full">
                    {service.category?.name || 'Uncategorized'}
                  </span>
                  <span className="px-3 py-1 bg-green-100 text-green-800 text-sm font-medium rounded-full">
                    {service.subcategory?.name || 'No Subcategory'}
                  </span>
                </div>
              </div>
              
              {/* Rating */}
              <Link href={`/service-management/service-details/review/${service._id}`}>
  <div className="bg-white border rounded-xl p-4 text-center shadow-sm hover:shadow-md transition-shadow cursor-pointer">
    
    {/* Rating */}
    <div className="flex items-center justify-center gap-1 mb-1">
      <span className="text-2xl font-bold text-yellow-500">⭐</span>
      <span className="text-2xl font-bold text-gray-900">
        {service.averageRating || 0}
      </span>
    </div>

    <p className="text-sm text-gray-600">
      {service.totalReviews || 0} Reviews
    </p>

    {/* Recommended Badge (below rating section) */}
    {service.recommendedServices && (
      <span className="inline-block mt-2 px-3 py-1 bg-yellow-100 text-yellow-800 text-xs font-medium rounded-full">
        ★ Recommended Service
      </span>
    )}

  </div>
</Link>

              
            </div>

            {/* Price Section */}
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-4">
                {service.discount > 0 ? (
                  <>
                    <div>
                      <span className="text-2xl font-bold text-gray-900">
                        ₹{formatPrice(service.discountedPrice || service.price)}
                      </span>
                      <span className="ml-2 text-sm text-gray-500 line-through">
                        ₹{formatPrice(service.price)}
                      </span>
                    </div>
                    <span className="px-3 py-1 bg-red-500 text-white text-sm font-bold rounded-full">
                      {service.discount}% OFF
                    </span>
                  </>
                ) : (
                  <span className="text-2xl font-bold text-gray-900">
                    ₹{formatPrice(service.price || 0)}
                  </span>
                )}
              </div>
              {service.includeGst && (
                <p className="text-sm text-gray-600 mt-2">
                  {service.gstInRupees ? `Inclusive of GST: ₹${formatPrice(service.gstInRupees)}` : 'GST Inclusive'}
                </p>
              )}
            </div>

            {/* Key Values */}
            {keyValues.length > 0 && (
              <div className="mb-6">
                <h3 className="font-semibold text-gray-700 mb-3">Key Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {keyValues.map((item, index) => (
                    <div key={item._id || index} className="bg-gray-50 p-3 rounded-lg">
                      <span className="font-medium text-gray-700">{item.key}:</span>{' '}
                      <span className="text-gray-600">{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tags */}
            {tags.length > 0 && (
              <div className="mb-6">
                <h3 className="font-semibold text-gray-700 mb-3">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag, index) => (
                    <span 
                      key={index}
                      className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full border"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Tabs - Moved outside the main service card */}
      <div className="mb-8">
        <div className="border-b border-gray-200">
          <div className="flex space-x-1">
            <button
              onClick={() => setActiveTab('service')}
              className={`px-8 py-4 text-base font-medium rounded-t-lg transition-colors ${
                activeTab === 'service'
                  ? 'bg-white border-t border-l border-r border-gray-200 text-blue-600 font-semibold'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
            >
              Service Details
            </button>
            <button
              onClick={() => setActiveTab('franchise')}
              className={`px-8 py-4 text-base font-medium rounded-t-lg transition-colors ${
                activeTab === 'franchise'
                  ? 'bg-white border-t border-l border-r border-gray-200 text-blue-600 font-semibold'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
            >
              Franchise Details
            </button>
          </div>
        </div>
      </div>

      {/* Tab Content */}
      <div className="space-y-6">
        {/* Service Details Tab */}
        {activeTab === 'service' && (
          <>
            {/* About Us */}
            {aboutUs.length > 0 && (
              <ComponentCard title="About Us">
                <div className="prose prose-blue max-w-none">
                  {aboutUs.map((item, index) => (
                    <div 
                      key={index}
                      className="text-gray-700 leading-relaxed"
                      dangerouslySetInnerHTML={{ __html: item }}
                    />
                  ))}
                </div>
              </ComponentCard>
            )}

            {/* Assured By FetchTrue */}
            {assuredByFetchTrue.length > 0 && (
              <ComponentCard title="Assured By FetchTrue">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {assuredByFetchTrue.map((item, index) => (
                    <div key={item._id || index} className="flex gap-4 p-4 bg-blue-50 rounded-lg">
                      {item.icon && (
                        <div className="flex-shrink-0">
                          <div className="w-12 h-12 relative">
                            <Image
                              src={item.icon}
                              alt={item.title}
                              fill
                              className="object-contain"
                            />
                          </div>
                        </div>
                      )}
                      <div>
                        <h4 className="font-semibold text-gray-800 mb-1">{item.title}</h4>
                        <p className="text-sm text-gray-600">{item.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </ComponentCard>
            )}

            {/* Benefits */}
            {benefits.length > 0 && (
              <ComponentCard title="Benefits">
                <div className="space-y-3">
                  {benefits.map((benefit, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <div className="w-2 h-2 mt-2 rounded-full bg-green-500 flex-shrink-0"></div>
                      <div 
                        className="text-gray-700"
                        dangerouslySetInnerHTML={{ __html: benefit }}
                      />
                    </div>
                  ))}
                </div>
              </ComponentCard>
            )}

            {/* Highlight Images */}
            {highlight.length > 0 && (
              <ComponentCard title="Highlights">
                <div className="grid grid-cols-1 gap-6">
                  {highlight.map((img, index) => (
                    <div key={index} className="relative h-64 md:h-96 rounded-xl overflow-hidden">
                      <Image
                        src={img}
                        alt={`Highlight ${index + 1}`}
                        fill
                        className="object-cover"
                      />
                    </div>
                  ))}
                </div>
              </ComponentCard>
            )}

            {/* Why Choose Us */}
            {whyChooseUs.length > 0 && (
              <ComponentCard title="Why Choose Us">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {whyChooseUs.map((item, index) => (
                    <div key={item._id || index} className="text-center p-6 bg-white border rounded-xl shadow-sm">
                      {item.icon && (
                        <div className="w-16 h-16 mx-auto mb-4 relative">
                          <Image
                            src={item.icon}
                            alt={item.title}
                            fill
                            className="object-contain"
                          />
                        </div>
                      )}
                      <h4 className="font-semibold text-gray-800 mb-2">{item.title}</h4>
                      <p className="text-sm text-gray-600">{item.description}</p>
                    </div>
                  ))}
                </div>
              </ComponentCard>
            )}

            {/* Packages - Updated to 3 columns */}
            {packages.length > 0 && (
              <ComponentCard title="Packages">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {packages.map((pkg, index) => (
                    <div key={pkg._id || index} className="border-2 border-blue-100 rounded-xl p-6 bg-white shadow-sm hover:shadow-md transition-shadow h-full flex flex-col">
                      <div className="flex justify-between items-start mb-4">
                        <h4 className="text-xl font-bold text-gray-900">{pkg.name}</h4>
                        {pkg.discount > 0 && (
                          <span className="px-3 py-1 bg-red-500 text-white text-sm font-bold rounded-full">
                            {pkg.discount}% OFF
                          </span>
                        )}
                      </div>
                      
                      <div className="space-y-3 mb-6 flex-grow">
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600">Original Price:</span>
                          <span className="text-lg font-semibold text-gray-900">
                            ₹{formatPrice(pkg.price)}
                          </span>
                        </div>
                        {pkg.discount > 0 && (
                          <div className="flex items-center justify-between">
                            <span className="text-gray-600">Discounted Price:</span>
                            <span className="text-2xl font-bold text-blue-600">
                              ₹{formatPrice(pkg.discountedPrice)}
                            </span>
                          </div>
                        )}
                      </div>

                      {pkg.whatYouGet && pkg.whatYouGet.length > 0 && (
                        <div className="mt-auto">
                          <h5 className="font-semibold text-gray-700 mb-3">What You Get:</h5>
                          <ul className="space-y-2">
                            {pkg.whatYouGet.map((item, i) => (
                              <li key={i} className="flex items-center gap-2 text-sm text-gray-600">
                                <div className="w-1.5 h-1.5 rounded-full bg-blue-500 flex-shrink-0"></div>
                                <span className="flex-grow">{item}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </ComponentCard>
            )}

            {/* We Required & We Deliver in Grid */}
            {(weRequired.length > 0 || weDeliver.length > 0) && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {weRequired.length > 0 && (
                  <ComponentCard title="We Required">
                    <div className="space-y-4">
                      {weRequired.map((item, index) => (
                        <div key={item._id || index} className="p-4 bg-gray-50 rounded-lg">
                          <h5 className="font-semibold text-gray-800 mb-2">{item.title}</h5>
                          <p className="text-sm text-gray-600">{item.description}</p>
                        </div>
                      ))}
                    </div>
                  </ComponentCard>
                )}

                {weDeliver.length > 0 && (
                  <ComponentCard title="We Deliver">
                    <div className="space-y-4">
                      {weDeliver.map((item, index) => (
                        <div key={item._id || index} className="p-4 bg-gray-50 rounded-lg">
                          <h5 className="font-semibold text-gray-800 mb-2">{item.title}</h5>
                          <p className="text-sm text-gray-600">{item.description}</p>
                        </div>
                      ))}
                    </div>
                  </ComponentCard>
                )}
              </div>
            )}

            {/* More Info */}
            {moreInfo.length > 0 && (
              <ComponentCard title="More Information">
                <div className="space-y-8">
                  {moreInfo.map((item, index) => (
                    <div key={item._id || index} className="flex flex-col md:flex-row gap-6 items-start">
                      {item.image && (
                        <div className="md:w-1/3">
                          <div className="relative h-48 md:h-64 rounded-xl overflow-hidden">
                            <Image
                              src={item.image}
                              alt={item.title}
                              fill
                              className="object-cover"
                            />
                          </div>
                        </div>
                      )}
                      <div className={item.image ? "md:w-2/3" : "w-full"}>
                        <h4 className="text-xl font-bold text-gray-900 mb-3">{item.title}</h4>
                        <p className="text-gray-700 leading-relaxed">{item.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </ComponentCard>
            )}

            {/* Connect With */}
            {connectWith.length > 0 && (
              <ComponentCard title="Connect With">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {connectWith.map((item, index) => (
                    <div key={item._id || index} className="bg-white border rounded-xl p-6 shadow-sm">
                      <h5 className="font-semibold text-gray-900 mb-4">{item.name}</h5>
                      <div className="space-y-3">
                        <div className="flex items-center gap-3">
                          <span className="text-gray-500">📱</span>
                          <span className="text-gray-700">{item.mobileNo}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-gray-500">✉️</span>
                          <span className="text-gray-700">{item.email}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ComponentCard>
            )}

            {/* Documents */}
            {document.length > 0 && (
              <ComponentCard title="Required Documents">
                <div className="space-y-3">
                  {document.map((doc, index) => (
                    <div 
                      key={index}
                      className="text-gray-700 p-3 bg-gray-50 rounded-lg"
                      dangerouslySetInnerHTML={{ __html: doc }}
                    />
                  ))}
                </div>
              </ComponentCard>
            )}

            {/* Terms and Conditions */}
            {termsAndConditions.length > 0 && (
              <ComponentCard title="Terms and Conditions">
                <div className="space-y-3">
                  {termsAndConditions.map((term, index) => (
                    <div 
                      key={index}
                      className="text-gray-700 p-3 bg-gray-50 rounded-lg"
                      dangerouslySetInnerHTML={{ __html: term }}
                    />
                  ))}
                </div>
              </ComponentCard>
            )}

            {/* FAQ Section */}
            {faq.length > 0 && (
              <ComponentCard title="Frequently Asked Questions">
                <div className="space-y-3">
                  {faq.map((item, index) => (
                    <div key={index} className="border rounded-xl overflow-hidden">
                      <button
                        onClick={() => setOpenFaqIndex(openFaqIndex === index ? null : index)}
                        className="flex items-center justify-between w-full p-4 text-left bg-white hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 flex items-center justify-center bg-blue-100 text-blue-600 rounded-full">
                            Q
                          </div>
                          <span className="font-semibold text-gray-900">{item.question}</span>
                        </div>
                        <ChevronDownIcon 
                          className={`w-5 h-5 text-gray-500 transition-transform ${
                            openFaqIndex === index ? 'transform rotate-180' : ''
                          }`}
                        />
                      </button>
                      {openFaqIndex === index && (
                        <div className="p-4 pt-0">
                          <div className="ml-11 pl-4 border-l-2 border-blue-200">
                            <div className="flex items-center gap-3 mb-2">
                              <div className="w-8 h-8 flex items-center justify-center bg-green-100 text-green-600 rounded-full">
                                A
                              </div>
                              <span className="font-medium text-gray-700">Answer:</span>
                            </div>
                            <p className="text-gray-600 ml-11">{item.answer}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </ComponentCard>
            )}

            {/* Extra Sections */}
            {extraSections.length > 0 && (
              <ComponentCard title="Additional Details">
                <div className="space-y-8">
                  {extraSections.map((item, index) => (
                    <div key={item._id || index} className="bg-white border rounded-xl p-6">
                      {item.title && (
                        <h4 className="text-xl font-bold text-gray-900 mb-4">{item.title}</h4>
                      )}
                      
                      {item.subtitle && item.subtitle.length > 0 && (
                        <div className="mb-4">
                          {item.subtitle.map((sub, subIndex) => (
                            <p key={subIndex} className="font-medium text-gray-800 mb-1">{sub}</p>
                          ))}
                        </div>
                      )}
                      
                      {item.description && item.description.length > 0 && (
                        <div className="mb-4 space-y-2">
                          {item.description.map((desc, descIndex) => (
                            <p key={descIndex} className="text-gray-700">{desc}</p>
                          ))}
                        </div>
                      )}
                      
                      {item.subDescription && item.subDescription.length > 0 && (
                        <div className="mb-4 space-y-1">
                          {item.subDescription.map((subDesc, subDescIndex) => (
                            <p key={subDescIndex} className="text-sm text-gray-600">{subDesc}</p>
                          ))}
                        </div>
                      )}
                      
                      {item.lists && item.lists.length > 0 && (
                        <ul className="mb-4 space-y-2 pl-5">
                          {item.lists.map((listItem, listIndex) => (
                            <li key={listIndex} className="text-gray-700 list-disc">
                              {listItem}
                            </li>
                          ))}
                        </ul>
                      )}
                      
                      {item.tags && item.tags.length > 0 && (
                        <div className="mb-4">
                          <span className="text-sm font-medium text-gray-600 mb-2 block">Tags:</span>
                          <div className="flex flex-wrap gap-2">
                            {item.tags.map((tag, tagIndex) => (
                              <span
                                key={tagIndex}
                                className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {item.image && item.image.length > 0 && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {item.image.map((img, imgIndex) => (
                            <div key={imgIndex} className="relative h-48 rounded-lg overflow-hidden">
                              <Image
                                src={img}
                                alt={`${item.title || 'Extra'} image ${imgIndex + 1}`}
                                fill
                                className="object-cover"
                              />
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </ComponentCard>
            )}

            {/* Extra Images */}
            {extraImages.length > 0 && (
              <ComponentCard title="Gallery">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {extraImages.map((img, index) => (
                    <div key={index} className="relative h-48 rounded-xl overflow-hidden shadow-md">
                      <Image
                        src={img}
                        alt={`Gallery image ${index + 1}`}
                        fill
                        className="object-cover hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  ))}
                </div>
              </ComponentCard>
            )}
          </>
        )}

        {/* Franchise Details Tab */}
        {activeTab === 'franchise' && (
          <>
            {/* Commission */}
            {franchiseCommission && (
              <ComponentCard title="Commission Structure">
                <div className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl">
                  <div className="text-center">
                    <span className="text-4xl font-bold text-blue-600">{franchiseCommission}</span>
                    <p className="text-gray-600 mt-2">Commission on every service</p>
                  </div>
                </div>
              </ComponentCard>
            )}

            {/* Investment Range */}
            {investmentRange.length > 0 && (
              <ComponentCard title="Investment Range">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {investmentRange.map((item, index) => (
                    <div key={index} className="text-center p-6 bg-white border rounded-xl shadow-sm">
                      <div className="text-2xl font-bold text-gray-900 mb-2">
                        ₹{formatPrice(Number(item.minRange))} - ₹{formatPrice(Number(item.maxRange))}
                      </div>
                      <p className="text-gray-600">Investment Required</p>
                    </div>
                  ))}
                </div>
              </ComponentCard>
            )}

            {/* Monthly Earning Potential */}
            {monthlyEarnPotential.length > 0 && (
              <ComponentCard title="Monthly Earning Potential">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {monthlyEarnPotential.map((item, index) => (
                    <div key={index} className="text-center p-6 bg-gradient-to-r from-green-50 to-emerald-50 border rounded-xl">
                      <div className="text-2xl font-bold text-green-600 mb-2">
                        ₹{formatPrice(Number(item.minEarn))} - ₹{formatPrice(Number(item.maxEarn))}
                      </div>
                      <p className="text-gray-600">Monthly Earnings</p>
                    </div>
                  ))}
                </div>
              </ComponentCard>
            )}

            {/* Franchise Models */}
            {franchiseModel.length > 0 && (
              <ComponentCard title="Franchise Models">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {franchiseModel.map((model, index) => (
                    <div key={index} className="bg-white border rounded-xl p-6 shadow-sm h-full">
                      <div className="flex justify-between items-start mb-4">
                        <h4 className="text-xl font-bold text-gray-900">{model.title}</h4>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-blue-600">
                            ₹{formatPrice(model.price)}
                          </div>
                          {model.discount > 0 && (
                            <span className="text-sm text-red-500">Save {model.discount}%</span>
                          )}
                        </div>
                      </div>
                      
                      <div className="space-y-3">
                        {model.agreement && (
                          <div>
                            <span className="text-sm font-medium text-gray-600">Agreement:</span>
                            <p className="text-gray-800 mt-1">{model.agreement}</p>
                          </div>
                        )}
                        {model.gst > 0 && (
                          <div>
                            <span className="text-sm font-medium text-gray-600">GST:</span>
                            <p className="text-gray-800 mt-1">{model.gst}%</p>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </ComponentCard>
            )}

            {/* Franchise Terms & Conditions */}
            {franchiseTerms && (
              <ComponentCard title="Franchise Terms & Conditions">
                <div 
                  className="prose prose-blue max-w-none p-6 bg-gray-50 rounded-lg"
                  dangerouslySetInnerHTML={{ __html: franchiseTerms }}
                />
              </ComponentCard>
            )}

            {/* Franchise Extra Sections */}
            {franchiseExtraSections.length > 0 && (
              <ComponentCard title="Additional Information">
                <div className="space-y-8">
                  {franchiseExtraSections.map((item, index) => (
                    <div key={index} className="bg-white border rounded-xl p-6">
                      {item.title && (
                        <h4 className="text-xl font-bold text-gray-900 mb-4">{item.title}</h4>
                      )}
                      
                      {item.description && item.description.length > 0 && (
                        <div className="space-y-3">
                          {item.description.map((desc, descIndex) => (
                            <p key={descIndex} className="text-gray-700">{desc}</p>
                          ))}
                        </div>
                      )}
                      
                      {item.image && item.image.length > 0 && (
                        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                          {item.image.map((img, imgIndex) => (
                            <div key={imgIndex} className="relative h-48 rounded-lg overflow-hidden">
                              <Image
                                src={img}
                                alt={`${item.title || 'Franchise'} image ${imgIndex + 1}`}
                                fill
                                className="object-cover"
                              />
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </ComponentCard>
            )}

            {/* Franchise Extra Images */}
            {franchiseExtraImages.length > 0 && (
              <ComponentCard title="Franchise Gallery">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {franchiseExtraImages.map((img, index) => (
                    <div key={index} className="relative h-48 rounded-xl overflow-hidden shadow-md">
                      <Image
                        src={img}
                        alt={`Franchise image ${index + 1}`}
                        fill
                        className="object-cover hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  ))}
                </div>
              </ComponentCard>
            )}
          </>
        )}
      </div>

      {/* Footer */}
      <div className="mt-8 pt-6 border-t border-gray-200">
        <div className="text-center text-gray-500 text-sm">
          <p>Service ID: {service._id}</p>
          <p>Created: {new Date(service.createdAt || '').toLocaleDateString()}</p>
          {service.recommendedServices && (
            <span className="inline-block mt-2 px-3 py-1 bg-yellow-100 text-yellow-800 text-sm font-medium rounded-full">
              ★ Recommended Service
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default ServiceDetailsPage;