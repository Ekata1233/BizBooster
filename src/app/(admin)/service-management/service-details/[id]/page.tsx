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
  icon: string;
  _id?: string;
}

type RowData = { title: string; description: string[] };
type InvestmentRangeItem = {
  minRange: number | string;
  maxRange: number | string;
  range: string;
  parameters: string;
};
type MonthlyEarnItem = {
  minEarn: string | number;
  maxEarn: string | number;
  range: string;
  parameters: string;
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
  range: string;
  parameters: string;
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

interface CounterItem {
  number?: number;
  title?: string;
  _id?: string;
}

interface FranchiseOperatingModelItem {
  info?: string;
  title?: string;
  description?: string;
  features?: FeatureItem[];
  tags?: string[];
  example?: string;
  _id?: string;
}

interface FeatureItem {
  icon?: string;
  subtitle?: string;
  subDescription?: string;
  _id?: string;
}

interface BusinessFundamental {
  description?: string;
  points?: FundamentalPoint[];
}

interface FundamentalPoint {
  subtitle?: string;
  subDescription?: string;
  _id?: string;
}

interface KeyAdvantageItem {
  icon?: string;
  title?: string;
  description?: string;
  _id?: string;
}

interface SupportSystemItem {
  icon?: string;
  title?: string;
  lists?: string[];
  _id?: string;
}

interface CompanyDetailItem {
  name?: string;
  location?: string;
  details?: CompanyDetailPoint[];
  _id?: string;
}

interface CompanyDetailPoint {
  title?: string;
  description?: string;
  _id?: string;
}

interface DurationItem {
  weeks?: number;
  hours?: number;
}

interface CourseCurriculumItem {
  title?: string;
  lists?: string[];
  model?: string[];
  _id?: string;
}

interface WhomToSellItem {
  icon?: string;
  lists?: string;
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
  operatingCities?: string[];
  brochureImage?: string[];
  emiavalable?: string[];
  counter?: CounterItem[];
  franchiseOperatingModel?: FranchiseOperatingModelItem[];
  businessFundamental?: BusinessFundamental;
  keyAdvantages?: KeyAdvantageItem[];
  completeSupportSystem?: SupportSystemItem[];
  trainingDetails?: string[];
  agreementDetails?: string[];
  goodThings?: string[];
  compareAndChoose?: string[];
  companyDetails?: CompanyDetailItem[];
  roi?: string[];
  level?: 'beginner' | 'medium' | 'advanced';
  lessonCount?: number;
  duration?: DurationItem;
  whatYouWillLearn?: string[];
  eligibleFor?: string[];
  courseCurriculum?: CourseCurriculumItem[];
  courseIncludes?: string[];
  certificateImage?: string[];
  whomToSell?: WhomToSellItem[];
  include?: string[];
  notInclude?: string[];
  safetyAndAssurance?: string[];
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

  // Extract all data from serviceDetails with validation
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

  const operatingCities = serviceDetails?.operatingCities || [];
  const brochureImage = serviceDetails?.brochureImage || [];
  const emiavalable = serviceDetails?.emiavalable || [];
  const counter = serviceDetails?.counter || [];
  const franchiseOperatingModel = serviceDetails?.franchiseOperatingModel || [];
  const businessFundamental = serviceDetails?.businessFundamental || null;
  const keyAdvantages = serviceDetails?.keyAdvantages || [];
  const completeSupportSystem = serviceDetails?.completeSupportSystem || [];
  const trainingDetails = serviceDetails?.trainingDetails || [];
  const agreementDetails = serviceDetails?.agreementDetails || [];
  const goodThings = serviceDetails?.goodThings || [];
  const compareAndChoose = serviceDetails?.compareAndChoose || [];
  const companyDetails = serviceDetails?.companyDetails || [];
  const roi = serviceDetails?.roi || [];
  const level = serviceDetails?.level || 'beginner';
  const lessonCount = serviceDetails?.lessonCount || 0;
  const duration = serviceDetails?.duration || { weeks: 0, hours: 0 };
  const whatYouWillLearn = serviceDetails?.whatYouWillLearn || [];
  const eligibleFor = serviceDetails?.eligibleFor || [];
  const courseCurriculum = serviceDetails?.courseCurriculum || [];
  const courseIncludes = serviceDetails?.courseIncludes || [];
  const certificateImage = serviceDetails?.certificateImage || [];
  const whomToSell = serviceDetails?.whomToSell || [];
  const include = serviceDetails?.include || [];
  const notInclude = serviceDetails?.notInclude || [];
  const safetyAndAssurance = serviceDetails?.safetyAndAssurance || [];

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

  // Validation functions
  const hasValidAboutUs = aboutUs.length > 0 && aboutUs.some(item => item && item.trim() !== '');
  const hasValidBenefits = benefits.length > 0 && benefits.some(item => item && item.trim() !== '');
  const hasValidHighlight = highlight.length > 0;
  const hasValidHowItWorks = howItWorks.length > 0 && howItWorks.some(item => 
    item && (item.title || item.description || item.icon)
  );
  const hasValidWhyChooseUs = whyChooseUs.length > 0 && whyChooseUs.some(item => 
    item && (item.title || item.description || item.icon)
  );
  const hasValidFaq = faq.length > 0 && faq.some(item => 
    item && (item.question || item.answer)
  );
  const hasValidPackages = packages.length > 0 && packages.some(pkg => 
    pkg && (pkg.name || pkg.price || pkg.discountedPrice || pkg.whatYouGet?.length > 0)
  );
  const hasValidWeRequired = weRequired.length > 0 && weRequired.some(item => 
    item && (item.title || item.description)
  );
  const hasValidWeDeliver = weDeliver.length > 0 && weDeliver.some(item => 
    item && (item.title || item.description)
  );
  const hasValidMoreInfo = moreInfo.length > 0 && moreInfo.some(item => 
    item && (item.title || item.description || item.image)
  );
  const hasValidConnectWith = connectWith.length > 0 && connectWith.some(item => 
    item && (item.name || item.email || item.mobileNo)
  );
  const hasValidTimeRequired = timeRequired.length > 0 && timeRequired.some(item => 
    item && (item.range || item.parameters)
  );
  const hasValidAssuredByFetchTrue = assuredByFetchTrue.length > 0 && assuredByFetchTrue.some(item => 
    item && (item.title || item.description || item.icon)
  );
  const hasValidDocuments = document.length > 0 && document.some(doc => doc && doc.trim() !== '');
  const hasValidTerms = termsAndConditions.length > 0 && termsAndConditions.some(term => term && term.trim() !== '');
  const hasValidExtraSections = extraSections.length > 0 && extraSections.some(section => 
    section && (section.title || section.description?.length > 0 || section.subDescription?.length > 0 || 
    section.lists?.length > 0 || section.tags?.length > 0 || section.image?.length > 0)
  );
  const hasValidExtraImages = extraImages.length > 0;
  const hasValidOperatingCities = operatingCities.length > 0 && operatingCities.some(city => city && city.trim() !== '');
  const hasValidBrochureImage = brochureImage.length > 0;
  const hasValidEmiAvailable = emiavalable.length > 0 && emiavalable.some(emi => emi && emi.trim() !== '');
  const hasValidCounter = counter?.some(
    (item) =>
      (typeof item.number === "number" && item.number >= 1) ||
      (item.title && item.title.trim() !== "")
  );
  const hasValidFranchiseOperatingModel = franchiseOperatingModel.length > 0 && franchiseOperatingModel.some(model =>
    model && (model.info || model.title || model.description || model.features?.length > 0 || 
    model.tags?.length > 0 || model.example)
  );
  const hasValidBusinessFundamental = businessFundamental &&
    ((businessFundamental.description && businessFundamental.description.trim() !== "") ||
    (businessFundamental.points && businessFundamental.points.length > 0));
  const hasValidKeyAdvantages = keyAdvantages.length > 0 && keyAdvantages.some(item =>
    item && (item.title || item.description || item.icon)
  );
  const hasValidCompleteSupportSystem = completeSupportSystem.length > 0 && completeSupportSystem.some(item =>
    item && (item.title || item.lists?.length > 0 || item.icon)
  );
  const hasValidTrainingDetails = trainingDetails.length > 0 && trainingDetails.some(detail => detail && detail.trim() !== '');
  const hasValidAgreementDetails = agreementDetails.length > 0 && agreementDetails.some(detail => detail && detail.trim() !== '');
  const hasValidGoodThings = goodThings.length > 0 && goodThings.some(item => item && item.trim() !== '');
  const hasValidCompareAndChoose = compareAndChoose.length > 0 && compareAndChoose.some(item => item && item.trim() !== '');
  const hasValidCompanyDetails = companyDetails.length > 0 && companyDetails.some(company =>
    company && (company.name || company.location || company.details?.length > 0)
  );
  const hasValidRoi = roi.length > 0 && roi.some(item => item && item.trim() !== '');
  const hasValidCourseInfo = level !== 'beginner' || lessonCount > 0 || duration.weeks > 0 || duration.hours > 0;
  const hasValidWhatYouWillLearn = whatYouWillLearn.length > 0 && whatYouWillLearn.some(item => item && item.trim() !== '');
  const hasValidEligibleFor = eligibleFor.length > 0 && eligibleFor.some(item => item && item.trim() !== '');
  const hasValidCourseCurriculum = courseCurriculum.length > 0 && courseCurriculum.some(curriculum =>
    curriculum && (curriculum.title || curriculum.lists?.length > 0 || curriculum.model?.length > 0)
  );
  const hasValidCourseIncludes = courseIncludes.length > 0 && courseIncludes.some(item => item && item.trim() !== '');
  const hasValidCertificateImage = certificateImage.length > 0;
  const hasValidWhomToSell = whomToSell.length > 0 && whomToSell.some(item => item && (item.lists || item.icon));
  const hasValidInclude = include.length > 0 && include.some(item => item && item.trim() !== '');
  const hasValidNotInclude = notInclude.length > 0 && notInclude.some(item => item && item.trim() !== '');
  const hasValidSafetyAndAssurance = safetyAndAssurance.length > 0 && safetyAndAssurance.some(item => item && item.trim() !== '');

  // Franchise validations
  const hasValidFranchiseCommission = franchiseCommission && franchiseCommission.trim() !== '';
  const hasValidFranchiseTerms = franchiseTerms && franchiseTerms.trim() !== '';
  const hasValidInvestmentRange = investmentRange.length > 0 && investmentRange.some(item =>
    item && (item.range || item.parameters)
  );
  const hasValidMonthlyEarnPotential = monthlyEarnPotential.length > 0 && monthlyEarnPotential.some(item =>
    item && (item.range || item.parameters)
  );
  const hasValidFranchiseModel = franchiseModel.length > 0 && franchiseModel.some(model =>
    model && (model.title || model.agreement || model.price)
  );
  const hasValidFranchiseExtraSections = franchiseExtraSections?.some((item) =>
    item.title ||
    item.description?.length > 0 ||
    item.subDescription?.length > 0 ||
    item.lists?.length > 0 ||
    item.tags?.length > 0 ||
    item.image?.length > 0
  );
  const hasValidFranchiseExtraImages = franchiseExtraImages.length > 0;

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
              
              {/* Parent Wrapper */}
              <div className="text-center">
                {/* Rating (Clickable) */}
                <Link href={`/service-management/service-details/review/${service._id}`}>
                  <div className="bg-white border rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <span className="text-2xl font-bold text-yellow-500">⭐</span>
                      <span className="text-2xl font-bold text-gray-900">
                        {service.averageRating || 0}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">
                      {service.totalReviews || 0} Reviews
                    </p>
                  </div>
                </Link>

                {/* Recommended Service */}
                {service.recommendedServices && (
                  <div className="mt-2">
                    <span className="inline-block px-3 py-1 bg-yellow-100 text-yellow-800 text-xs font-medium rounded-full">
                      ★ Recommended Service
                    </span>
                  </div>
                )}
              </div>
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
  
  {/* GST Status - Shows for both true and false */}
  <div className="flex items-center gap-2 mt-2">
    {/* Badge for Include/Exclude */}
    <span 
      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
        service.includeGst 
          ? 'bg-green-100 text-green-800 border border-green-200' 
          : 'bg-orange-100 text-orange-800 border border-orange-200'
      }`}
    >
      {service.includeGst ? '✓ GST Inclusive' : '✗ GST Exclusive'}
    </span>
    
    {/* GST Percentage if available */}
    {service.gst > 0 && (
      <span className="text-sm text-gray-600">
        {service.includeGst ? 'Including' : 'Excluding'} {formatPrice(service.gst)}% GST
      </span>
    )}
  </div>
</div>

            {/* Key Values */}
            {keyValues.length > 0 && (
              <div className="mb-6">
                <h3 className="font-semibold text-gray-700 mb-3">Key Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {keyValues.map((item, index) => {
                    const hasIcon = !!item.icon;
                    const hasKey = !!item.key;
                    const hasValue = !!item.value;

                    return (
                      <div
                        key={item._id || index}
                        className="flex items-start gap-3 bg-gray-50 p-3 rounded-lg"
                      >
                        {hasIcon && (
                          <div className="flex-shrink-0">
                            <Image
                              src={item.icon}
                              alt={item.key || item.value || "icon"}
                              width={24}
                              height={24}
                              className="object-contain"
                            />
                          </div>
                        )}
                        <div className="flex flex-col leading-snug">
                          {hasKey && (
                            <span className="text-sm font-medium text-gray-700">
                              {item.key}
                            </span>
                          )}
                          {hasKey && hasValue && (
                            <span className="mx-1 font-medium">:</span>
                          )}
                          {hasValue && (
                            <span className="text-sm text-gray-600">
                              {item.value}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
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

      {/* Tabs */}
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
            {hasValidAboutUs && (
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
            {hasValidAssuredByFetchTrue && (
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
            {hasValidBenefits && (
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
            {hasValidHighlight && (
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

            {/* How It Works */}
            {hasValidHowItWorks && (
              <ComponentCard title="How It Works">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {howItWorks.map((item, index) => (
                    <div
                      key={item._id || index}
                      className="flex flex-col items-center text-center p-6 bg-white border rounded-xl shadow-sm hover:shadow-md transition"
                    >
                      {item.icon && (
                        <div className="w-16 h-16 mb-4 relative">
                          <Image
                            src={item.icon}
                            alt={item.title}
                            fill
                            className="object-contain"
                          />
                        </div>
                      )}
                      <h4 className="text-lg font-semibold text-gray-800 mb-2">
                        {item.title}
                      </h4>
                      <p className="text-sm text-gray-600">
                        {item.description}
                      </p>
                    </div>
                  ))}
                </div>
              </ComponentCard>
            )}

            {/* Why Choose Us */}
            {hasValidWhyChooseUs && (
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

            {/* Packages */}
            {hasValidPackages && (
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
            {(hasValidWeRequired || hasValidWeDeliver) && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {hasValidWeRequired && (
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

                {hasValidWeDeliver && (
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

            {/* Operating Cities */}
            {hasValidOperatingCities && (
              <ComponentCard title="Operating Cities">
                <div className="flex flex-wrap gap-3">
                  {operatingCities.map((city, index) => (
                    <span 
                      key={index} 
                      className="px-4 py-2 bg-blue-50 text-blue-700 rounded-full border border-blue-100"
                    >
                      {city}
                    </span>
                  ))}
                </div>
              </ComponentCard>
            )}

            {/* Brochure Images */}
            {hasValidBrochureImage && (
              <ComponentCard title="Brochure Images">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {brochureImage.map((img, index) => (
                    <div key={index} className="relative h-64 rounded-xl overflow-hidden border">
                      <Image
                        src={img}
                        alt={`Brochure ${index + 1}`}
                        fill
                        className="object-contain bg-gray-50"
                      />
                    </div>
                  ))}
                </div>
              </ComponentCard>
            )}

            {/* EMI Available */}
            {hasValidEmiAvailable && (
              <ComponentCard title="EMI Options Available">
                <div className="space-y-3">
                  {emiavalable.map((emi, index) => (
                    <div key={index} className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                      <div className="w-8 h-8 flex items-center justify-center bg-green-100 text-green-600 rounded-full">
                        ₹
                      </div>
                      <span className="text-gray-700">{emi}</span>
                    </div>
                  ))}
                </div>
              </ComponentCard>
            )}

            {/* Counter */}
            {hasValidCounter && (
              <ComponentCard title="Achievements">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  {counter.map((item, index) => {
                    const hasValue =
                      (typeof item.number === "number" && item.number >= 1) ||
                      (item.title && item.title.trim() !== "");

                    if (!hasValue) return null;

                    return (
                      <div key={item._id || index} className="text-center">
                        {typeof item.number === "number" && item.number >= 1 && (
                          <div className="text-3xl md:text-4xl font-bold text-blue-600 mb-2">
                            {item.number.toLocaleString()}
                          </div>
                        )}
                        {item.title && (
                          <div className="text-gray-600">{item.title}</div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </ComponentCard>
            )}

            {/* Franchise Operating Model */}
            {hasValidFranchiseOperatingModel && (
              <ComponentCard title="Franchise Operating Model">
                <div className="space-y-8">
                  {franchiseOperatingModel.map((model, index) => (
                    <div key={index} className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6">
                      {model.title && (
                        <h4 className="text-xl font-bold text-gray-900 mb-4">{model.title}</h4>
                      )}
                      {model.info && (
                        <p className="text-gray-700 mb-4">{model.info}</p>
                      )}
                      {model.description && (
                        <p className="text-gray-600 mb-4">{model.description}</p>
                      )}
                      {model.features && model.features.length > 0 && (
                        <div className="mt-6">
                          <h5 className="font-semibold text-gray-700 mb-3">Features:</h5>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {model.features.map((feature, fIndex) => (
                              <div key={fIndex} className="bg-white p-4 rounded-lg shadow-sm">
                                {feature.icon && (
                                  <div className="w-10 h-10 mb-2 relative">
                                    <Image
                                      src={feature.icon}
                                      alt={feature.subtitle || 'Feature icon'}
                                      fill
                                      className="object-contain"
                                    />
                                  </div>
                                )}
                                {feature.subtitle && (
                                  <h6 className="font-medium text-gray-800 mb-1">{feature.subtitle}</h6>
                                )}
                                {feature.subDescription && (
                                  <p className="text-sm text-gray-600">{feature.subDescription}</p>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      {model.tags && model.tags.length > 0 && (
                        <div className="mt-4 flex flex-wrap gap-2">
                          {model.tags.map((tag, tagIndex) => (
                            <span key={tagIndex} className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                      {model.example && (
                        <div className="mt-4 p-4 bg-white rounded-lg border">
                          <h6 className="font-semibold text-gray-700 mb-2">Example:</h6>
                          <p className="text-gray-600">{model.example}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </ComponentCard>
            )}

            {/* Business Fundamental */}
            {hasValidBusinessFundamental && (
              <ComponentCard title="Business Fundamentals">
                <div className="bg-white border rounded-xl p-6">
                  {businessFundamental.description &&
                    businessFundamental.description.trim() !== "" && (
                      <p className="text-gray-700 mb-6">
                        {businessFundamental.description}
                      </p>
                  )}
                  {businessFundamental.points &&
                    businessFundamental.points.length > 0 && (
                      <div className="space-y-4">
                        {businessFundamental.points.map((point, index) => (
                          <div key={index} className="flex gap-4">
                            <div className="flex-shrink-0 w-2 h-2 mt-2 rounded-full bg-blue-500"></div>
                            <div>
                              {point.subtitle && (
                                <h6 className="font-medium text-gray-800 mb-1">
                                  {point.subtitle}
                                </h6>
                              )}
                              {point.subDescription && (
                                <p className="text-gray-600">
                                  {point.subDescription}
                                </p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                  )}
                </div>
              </ComponentCard>
            )}

            {/* Key Advantages */}
            {hasValidKeyAdvantages && (
              <ComponentCard title="Key Advantages">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {keyAdvantages.map((advantage, index) => (
                    <div key={index} className="bg-white border rounded-xl p-6 text-center hover:shadow-md transition-shadow">
                      {advantage.icon && (
                        <div className="w-16 h-16 mx-auto mb-4 relative">
                          <Image
                            src={advantage.icon}
                            alt={advantage.title || 'Advantage icon'}
                            fill
                            className="object-contain"
                          />
                        </div>
                      )}
                      {advantage.title && (
                        <h5 className="font-semibold text-gray-800 mb-2">{advantage.title}</h5>
                      )}
                      {advantage.description && (
                        <p className="text-sm text-gray-600">{advantage.description}</p>
                      )}
                    </div>
                  ))}
                </div>
              </ComponentCard>
            )}

            {/* Complete Support System */}
            {hasValidCompleteSupportSystem && (
              <ComponentCard title="Complete Support System">
                <div className="space-y-6">
                  {completeSupportSystem.map((support, index) => (
                    <div key={index} className="flex flex-col md:flex-row gap-6 items-start bg-gray-50 p-6 rounded-xl">
                      {support.icon && (
                        <div className="md:w-1/6">
                          <div className="w-16 h-16 relative">
                            <Image
                              src={support.icon}
                              alt={support.title || 'Support icon'}
                              fill
                              className="object-contain"
                            />
                          </div>
                        </div>
                      )}
                      <div className="flex-grow">
                        {support.title && (
                          <h5 className="text-lg font-semibold text-gray-800 mb-3">{support.title}</h5>
                        )}
                        {support.lists && support.lists.length > 0 && (
                          <ul className="space-y-2">
                            {support.lists.map((item, itemIndex) => (
                              <li key={itemIndex} className="flex items-start gap-2">
                                <div className="w-1.5 h-1.5 mt-2 rounded-full bg-green-500 flex-shrink-0"></div>
                                <span className="text-gray-700">{item}</span>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </ComponentCard>
            )}

            {/* Training Details */}
            {hasValidTrainingDetails && (
              <ComponentCard title="Training Details">
                <div className="space-y-3">
                  {trainingDetails.map((detail, index) => (
                    <div key={index} className="p-4 bg-blue-50 rounded-lg">
                      <p className="text-gray-700">{detail}</p>
                    </div>
                  ))}
                </div>
              </ComponentCard>
            )}

            {/* Agreement Details */}
            {hasValidAgreementDetails && (
              <ComponentCard title="Agreement Details">
                <div className="space-y-3">
                  {agreementDetails.map((detail, index) => (
                    <div key={index} className="p-4 border rounded-lg">
                      <p className="text-gray-700">{detail}</p>
                    </div>
                  ))}
                </div>
              </ComponentCard>
            )}

            {/* Good Things */}
            {hasValidGoodThings && (
              <ComponentCard title="Why It's Good">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {goodThings.map((item, index) => (
                    <div key={index} className="flex items-center gap-3 p-4 bg-green-50 rounded-lg">
                      <div className="w-8 h-8 flex items-center justify-center bg-green-100 text-green-600 rounded-full">
                        ✓
                      </div>
                      <span className="text-gray-700">{item}</span>
                    </div>
                  ))}
                </div>
              </ComponentCard>
            )}

            {/* Compare and Choose */}
            {hasValidCompareAndChoose && (
              <ComponentCard title="Compare and Choose">
                <div className="bg-white border rounded-xl p-6 overflow-x-auto">
                  {compareAndChoose.map((item, index) => (
                    <div
                      key={index}
                      className="ckeditor-content"
                      dangerouslySetInnerHTML={{ __html: item }}
                    />
                  ))}
                </div>
              </ComponentCard>
            )}

            {/* Company Details */}
            {hasValidCompanyDetails && (
              <ComponentCard title="Company Details">
                <div className="space-y-6">
                  {companyDetails.map((company, index) => (
                    <div key={index} className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-6">
                      {company.name && (
                        <h4 className="text-xl font-bold text-gray-900 mb-2">{company.name}</h4>
                      )}
                      {company.location && (
                        <p className="text-gray-600 mb-4">📍 {company.location}</p>
                      )}
                      {company.details && company.details.length > 0 && (
                        <div className="space-y-4">
                          {company.details.map((detail, detailIndex) => (
                            <div key={detailIndex} className="border-t pt-4">
                              {detail.title && (
                                <h6 className="font-semibold text-gray-800 mb-1">{detail.title}</h6>
                              )}
                              {detail.description && (
                                <p className="text-gray-600">{detail.description}</p>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </ComponentCard>
            )}

            {/* ROI Details */}
            {hasValidRoi && (
              <ComponentCard title="Return on Investment (ROI)">
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-8">
                  <div className="text-center mb-6">
                    <h4 className="text-2xl font-bold text-gray-900 mb-2">Return on Investment Analysis</h4>
                  </div>
                  <div className="space-y-4">
                    {roi.map((item, index) => (
                      <div key={index} className="flex items-center gap-4 p-4 bg-white rounded-lg shadow-sm">
                        <div className="w-10 h-10 flex items-center justify-center bg-green-100 text-green-600 rounded-full">
                          ₹
                        </div>
                        <p className="text-gray-700">{item}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </ComponentCard>
            )}

            {/* Course Level, Duration, and Lesson Count */}
            {hasValidCourseInfo && (
              <ComponentCard title="Course Information">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {level !== 'beginner' && (
                    <div className="text-center p-6 bg-blue-50 rounded-xl">
                      <div className="text-3xl font-bold text-blue-600 mb-2 capitalize">{level}</div>
                      <p className="text-gray-600">Level</p>
                    </div>
                  )}
                  {lessonCount > 0 && (
                    <div className="text-center p-6 bg-green-50 rounded-xl">
                      <div className="text-3xl font-bold text-green-600 mb-2">{lessonCount}</div>
                      <p className="text-gray-600">Lessons</p>
                    </div>
                  )}
                  {(duration.weeks > 0 || duration.hours > 0) && (
                    <div className="text-center p-6 bg-purple-50 rounded-xl">
                      <div className="text-xl font-bold text-purple-600 mb-2">
                        {duration.weeks > 0 && `${duration.weeks} weeks`}
                        {duration.weeks > 0 && duration.hours > 0 && ' • '}
                        {duration.hours > 0 && `${duration.hours} hours`}
                      </div>
                      <p className="text-gray-600">Duration</p>
                    </div>
                  )}
                </div>
              </ComponentCard>
            )}

            {/* What You Will Learn */}
            {hasValidWhatYouWillLearn && (
              <ComponentCard title="What You Will Learn">
                <div className="space-y-3">
                  {whatYouWillLearn.map((item, index) => (
                    <div key={index} className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                      <div className="w-6 h-6 flex items-center justify-center bg-blue-100 text-blue-600 rounded-full text-sm">
                        {index + 1}
                      </div>
                      <span className="text-gray-700">{item}</span>
                    </div>
                  ))}
                </div>
              </ComponentCard>
            )}

            {/* Eligible For */}
            {hasValidEligibleFor && (
              <ComponentCard title="Eligible For">
                <div className="flex flex-wrap gap-3">
                  {eligibleFor.map((item, index) => (
                    <span 
                      key={index} 
                      className="px-4 py-2 bg-green-100 text-green-800 rounded-full border border-green-200"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </ComponentCard>
            )}

            {/* Course Curriculum */}
            {hasValidCourseCurriculum && (
              <ComponentCard title="Course Curriculum">
                <div className="space-y-6">
                  {courseCurriculum.map((curriculum, index) => (
                    <div key={index} className="border rounded-xl p-6">
                      {curriculum.title && (
                        <h5 className="text-lg font-semibold text-gray-900 mb-4">{curriculum.title}</h5>
                      )}
                      {curriculum.lists && curriculum.lists.length > 0 && (
                        <ul className="space-y-3 mb-4">
                          {curriculum.lists.map((item, itemIndex) => (
                            <li key={itemIndex} className="flex items-start gap-3">
                              <div className="w-1.5 h-1.5 mt-2 rounded-full bg-blue-500 flex-shrink-0"></div>
                              <span className="text-gray-700">{item}</span>
                            </li>
                          ))}
                        </ul>
                      )}
                      {curriculum.model && curriculum.model.length > 0 && (
                        <div className="mt-6">
                          <h6 className="text-lg font-semibold text-gray-800 mb-4">Models Covered</h6>
                          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                            {curriculum.model.map((model, modelIndex) => (
                              <div
                                key={modelIndex}
                                className="p-4 border border-blue-100 rounded-lg bg-white shadow-sm ckeditor-content"
                                dangerouslySetInnerHTML={{ __html: model }}
                              />
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </ComponentCard>
            )}

            {/* Course Includes */}
            {hasValidCourseIncludes && (
              <ComponentCard title="Course Includes">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {courseIncludes.map((item, index) => (
                    <div key={index} className="flex items-center gap-3 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg">
                      <div className="w-8 h-8 flex items-center justify-center bg-blue-100 text-blue-600 rounded-full">
                        ✓
                      </div>
                      <span className="text-gray-700">{item}</span>
                    </div>
                  ))}
                </div>
              </ComponentCard>
            )}

            {/* Certificate Images */}
            {hasValidCertificateImage && (
              <ComponentCard title="Certificates">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {certificateImage.map((img, index) => (
                    <div key={index} className="relative h-64 rounded-xl overflow-hidden border-4 border-white shadow-lg">
                      <Image
                        src={img}
                        alt={`Certificate ${index + 1}`}
                        fill
                        className="object-contain bg-gradient-to-br from-gray-50 to-gray-100"
                      />
                    </div>
                  ))}
                </div>
              </ComponentCard>
            )}

            {/* Whom to Sell */}
            {hasValidWhomToSell && (
              <ComponentCard title="Whom To Sell">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {whomToSell.map((item, index) => (
                    <div key={index} className="text-center p-6 bg-white border rounded-xl hover:shadow-md transition-shadow">
                      {item.icon && (
                        <div className="w-16 h-16 mx-auto mb-4 relative">
                          <Image
                            src={item.icon}
                            alt="whomToSell icon"
                            fill
                            className="object-contain"
                          />
                        </div>
                      )}
                      {item.lists && (
                        <p className="text-gray-700 font-medium">{item.lists}</p>
                      )}
                    </div>
                  ))}
                </div>
              </ComponentCard>
            )}

            {/* Includes & Not Includes */}
            {(hasValidInclude || hasValidNotInclude) && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {hasValidInclude && (
                  <ComponentCard title="What's Included">
                    <div className="space-y-3">
                      {include.map((item, index) => (
                        <div
                          key={index}
                          className="flex items-start gap-3 p-3 bg-green-50 rounded-lg"
                        >
                          <div className="w-6 h-6 flex items-center justify-center bg-green-100 text-green-600 rounded-full flex-shrink-0">
                            ✓
                          </div>
                          <div
                            className="text-gray-700 ckeditor-content"
                            dangerouslySetInnerHTML={{ __html: item }}
                          />
                        </div>
                      ))}
                    </div>
                  </ComponentCard>
                )}
                {hasValidNotInclude && (
                  <ComponentCard title="What's Not Included">
                    <div className="space-y-3">
                      {notInclude.map((item, index) => (
                        <div
                          key={index}
                          className="flex items-start gap-3 p-3 bg-red-50 rounded-lg"
                        >
                          <div className="w-6 h-6 flex items-center justify-center bg-red-100 text-red-600 rounded-full flex-shrink-0">
                            ✗
                          </div>
                          <div
                            className="text-gray-700 ckeditor-content"
                            dangerouslySetInnerHTML={{ __html: item }}
                          />
                        </div>
                      ))}
                    </div>
                  </ComponentCard>
                )}
              </div>
            )}

            {/* Safety and Assurance */}
            {hasValidSafetyAndAssurance && (
              <ComponentCard title="Safety and Assurance">
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {safetyAndAssurance.map((item, index) => (
                      <div key={index} className="flex items-start gap-4">
                        <div className="w-10 h-10 flex items-center justify-center bg-green-100 text-green-600 rounded-full flex-shrink-0">
                          🔒
                        </div>
                        <div
                          className="text-gray-700 ckeditor-content"
                          dangerouslySetInnerHTML={{ __html: item }}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </ComponentCard>
            )}

            {/* More Info */}
            {hasValidMoreInfo && (
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
            {hasValidConnectWith && (
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

            {/* Time Required */}
            {hasValidTimeRequired && (
              <ComponentCard title="Time Required">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {timeRequired.map((item, index) => (
                    <div
                      key={item._id || index}
                      className="flex flex-col items-center justify-center p-6 bg-gray-50 border rounded-xl text-center"
                    >
                      <h4 className="text-base font-semibold text-gray-800 mb-2">
                        {item.parameters}
                      </h4>
                      <span className="inline-block px-4 py-1 text-sm font-medium text-blue-700 bg-blue-100 rounded-full">
                        {item.range}
                      </span>
                    </div>
                  ))}
                </div>
              </ComponentCard>
            )}

            {/* Documents */}
            {hasValidDocuments && (
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
            {hasValidTerms && (
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
            {hasValidFaq && (
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
            {hasValidExtraSections && (
              <ComponentCard title="Additional Details">
                <div className="space-y-8">
                  {extraSections.map((item, index) => {
                    const isCounterSection = 
                      item.title?.toLowerCase() === 'counter' && 
                      item.subtitle?.length > 0 && 
                      item.subDescription?.length > 0;
                    
                    const isComparisonSection = 
                      item.title?.includes('Franchise') && 
                      item.subtitle?.length > 0 && 
                      item.subDescription?.length > 0;

                    if (isCounterSection) {
                      return (
                        <div key={item._id || index} className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-8">
                          <h4 className="text-2xl font-bold text-gray-900 mb-8 text-center">{item.title}</h4>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {item.subtitle?.map((value, i) => (
                              <div key={i} className="text-center">
                                <div className="text-4xl font-bold text-blue-600 mb-2">
                                  {value}
                                </div>
                                <div className="text-gray-600">
                                  {item.subDescription?.[i] || `Stat ${i + 1}`}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    } else if (isComparisonSection) {
                      return (
                        <div key={item._id || index} className="bg-white border rounded-xl p-6 shadow-sm">
                          <h4 className="text-2xl font-bold text-gray-900 mb-6">{item.title}</h4>
                          {item.description && item.description.length > 0 && (
                            <p className="text-gray-700 mb-6">{item.description[0]}</p>
                          )}
                          {item.subtitle && item.subtitle.length > 0 && (
                            <div className="overflow-x-auto">
                              <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                  <tr>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                      Aspect
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                      Details
                                    </th>
                                  </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                  {item.subtitle.map((aspect, aspectIndex) => (
                                    <tr key={aspectIndex} className="hover:bg-gray-50">
                                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                        {aspect}
                                      </td>
                                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {item.subDescription?.[aspectIndex] || 'N/A'}
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          )}
                          {item.lists && item.lists.length > 0 && (
                            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                              <h5 className="font-semibold text-blue-800 mb-2">Example:</h5>
                              <p className="text-blue-700">{item.lists[0]}</p>
                            </div>
                          )}
                        </div>
                      );
                    } else {
                      return (
                        <div key={item._id || index} className="bg-white border rounded-xl p-6 shadow-sm">
                          {item.title && (
                            <h4 className="text-xl font-bold text-gray-900 mb-4">{item.title}</h4>
                          )}
                          {item.subtitle && item.subtitle.length > 0 && (
                            <div className="mb-4">
                              <h5 className="font-semibold text-gray-700 mb-2">Sub Titles:</h5>
                              <div className="flex flex-wrap gap-2">
                                {item.subtitle.map((sub, subIndex) => (
                                  <span key={subIndex} className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full">
                                    {sub}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                          {item.description && item.description.length > 0 && (
                            <div className="mb-4 space-y-3">
                              {item.description.map((desc, descIndex) => (
                                <p key={descIndex} className="text-gray-700">{desc}</p>
                              ))}
                            </div>
                          )}
                          {item.subDescription && item.subDescription.length > 0 && (
                            <div className="mb-4">
                              <h5 className="font-semibold text-gray-700 mb-2">Details:</h5>
                              <ul className="space-y-2">
                                {item.subDescription.map((subDesc, subDescIndex) => (
                                  <li key={subDescIndex} className="flex items-start gap-2">
                                    <div className="w-1.5 h-1.5 mt-2 rounded-full bg-blue-500 flex-shrink-0"></div>
                                    <span className="text-gray-600">{subDesc}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                          {item.lists && item.lists.length > 0 && (
                            <div className="mb-4">
                              <h5 className="font-semibold text-gray-700 mb-2">List Items:</h5>
                              <ul className="space-y-2 pl-5">
                                {item.lists.map((listItem, listIndex) => (
                                  <li key={listIndex} className="text-gray-700 list-disc">
                                    {listItem}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                          {item.tags && item.tags.length > 0 && (
                            <div className="mb-4">
                              <h5 className="font-semibold text-gray-700 mb-2">Tags:</h5>
                              <div className="flex flex-wrap gap-2">
                                {item.tags.map((tag, tagIndex) => (
                                  <span
                                    key={tagIndex}
                                    className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
                                  >
                                    {tag}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                          {item.image && item.image.length > 0 && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
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
                      );
                    }
                  })}
                </div>
              </ComponentCard>
            )}

            {/* Extra Images */}
            {hasValidExtraImages && (
              <ComponentCard title="Extra Images">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {extraImages.map((img, index) => (
                    <div key={index} className="relative h-48 rounded-xl overflow-hidden shadow-md">
                      <Image
                        src={img}
                        alt={`Extra Images ${index + 1}`}
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
            {hasValidFranchiseCommission && (
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
            {hasValidInvestmentRange && (
              <ComponentCard title="Investment Range">
                <div className="flex flex-wrap gap-4">
                  {investmentRange.map((item, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-center px-6 py-4 bg-gradient-to-r from-green-50 to-emerald-100 border border-emerald-200 rounded-2xl shadow-sm"
                    >
                      <span className="text-xl font-semibold text-emerald-700">
                        {item.range}
                      </span>
                      <span className="ml-2 text-sm font-medium text-emerald-600">
                        {item.parameters}
                      </span>
                    </div>
                  ))}
                </div>
              </ComponentCard>
            )}

            {/* Monthly Earning Potential */}
            {hasValidMonthlyEarnPotential && (
              <ComponentCard title="Monthly Earning Potential">
                <div className="flex flex-wrap gap-4">
                  {monthlyEarnPotential.map((item, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-center px-6 py-4 bg-gradient-to-r from-green-50 to-emerald-100 border border-emerald-200 rounded-2xl shadow-sm"
                    >
                      <span className="text-xl font-semibold text-emerald-700">
                        {item.range}
                      </span>
                      <span className="ml-2 text-sm font-medium text-emerald-600">
                        {item.parameters}
                      </span>
                    </div>
                  ))}
                </div>
              </ComponentCard>
            )}

            {/* Franchise Models */}
            {hasValidFranchiseModel && (
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
            {hasValidFranchiseTerms && (
              <ComponentCard title="Franchise Terms & Conditions">
                <div 
                  className="prose prose-blue max-w-none p-6 bg-gray-50 rounded-lg"
                  dangerouslySetInnerHTML={{ __html: franchiseTerms }}
                />
              </ComponentCard>
            )}

            {/* Franchise Extra Sections */}
            {hasValidFranchiseExtraSections && (
              <ComponentCard title="Additional Information">
                <div className="space-y-8">
                  {franchiseExtraSections.map((item, index) => {
                    const hasContent =
                      item.title ||
                      item.description?.length > 0 ||
                      item.subDescription?.length > 0 ||
                      item.lists?.length > 0 ||
                      item.tags?.length > 0 ||
                      item.image?.length > 0;

                    if (!hasContent) return null;

                    return (
                      <div key={item._id || index} className="bg-white border rounded-xl p-6">
                        {item.title && (
                          <h4 className="text-xl font-bold text-gray-900 mb-4">
                            {item.title}
                          </h4>
                        )}
                        {item.description?.length > 0 && (
                          <div className="space-y-3 mb-4">
                            {item.description.map((desc, i) => (
                              <p key={i} className="text-gray-700">
                                {desc}
                              </p>
                            ))}
                          </div>
                        )}
                        {item.subDescription?.length > 0 && (
                          <div className="space-y-2 mb-4">
                            {item.subDescription.map((sub, i) => (
                              <p key={i} className="text-gray-600 text-sm">
                                {sub}
                              </p>
                            ))}
                          </div>
                        )}
                        {item.lists?.length > 0 && (
                          <ul className="list-disc list-inside text-gray-700 mb-4 space-y-1">
                            {item.lists.map((list, i) => (
                              <li key={i}>{list}</li>
                            ))}
                          </ul>
                        )}
                        {item.tags?.length > 0 && (
                          <div className="flex flex-wrap gap-2 mb-4">
                            {item.tags.map((tag, i) => (
                              <span
                                key={i}
                                className="px-3 py-1 text-xs font-medium bg-blue-100 text-blue-700 rounded-full"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                        {item.image?.length > 0 && (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {item.image.map((img, i) => (
                              <div
                                key={i}
                                className="relative h-48 rounded-lg overflow-hidden"
                              >
                                <Image
                                  src={img}
                                  alt={`${item.title || "Franchise"} image ${i + 1}`}
                                  fill
                                  className="object-cover"
                                />
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </ComponentCard>
            )}

            {/* Franchise Extra Images */}
            {hasValidFranchiseExtraImages && (
              <ComponentCard title="Extra Images">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {franchiseExtraImages.map((img, index) => (
                    <div key={index} className="relative h-48 rounded-xl overflow-hidden shadow-md">
                      <Image
                        src={img}
                        alt={`Extra Images ${index + 1}`}
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
    </div>
  );
};

export default ServiceDetailsPage;