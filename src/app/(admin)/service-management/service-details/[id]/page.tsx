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

  console.log("service details : ", singleService);
  
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

  // Safe access to nested properties with fallbacks
  const serviceDetails = service?.serviceDetails || {};
  const franchiseDetails = service?.franchiseDetails || {};
  
  const highlightRaw = serviceDetails?.highlight || [];
  const benefits = serviceDetails?.benefits || [];
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

  // Normalize to string[] whether it's File[] or string[]
  const highlightArray: string[] = Array.isArray(highlightRaw)
    ? highlightRaw.map((item) =>
        typeof item === 'string' ? item : URL.createObjectURL(item)
      )
    : [];

  const bannerImages = service?.bannerImages || [];

  return (
    <div className="p-4 space-y-6 ">
      <PageBreadcrumb pageTitle={`${service.serviceName}`} />

      {/* Meta Card */}
      <div className="flex items-center justify-between gap-6 ">
        {/* Left side: Image + Service Details */}
        <div className="flex items-center gap-6">
          <Image
            src={service.thumbnailImage || '/placeholder-image.jpg'}
            alt={service.serviceName}
            width={150}
            height={100}
            className="rounded shadow"
          />
          <div>
            <h2 className="text-2xl font-semibold">{service.serviceName}</h2>
            <p className="text-gray-600">
              {service.category?.name || "No category"} / {service.subcategory?.name || "No subcategory"}
            </p>
            <p className="text-lg font-medium mt-2">₹{service.price || 0}</p>
          </div>
        </div>

        {/* Right side: Rating */}
        <Link href={`/service-management/service-details/review/${service._id}`}>
          <div className="text-right cursor-pointer hover:underline">
            <h1 className="text-lg font-semibold">⭐ {service.averageRating || 0} / 5</h1>
            <p className="text-sm text-gray-500">{service.totalReviews || 0} Reviews</p>
          </div>
        </Link>
      </div>

      {/* Banner Images */}
      {bannerImages.length > 0 && (
        <div className="flex items-center gap-6">
          <div>
            <p className="text-gray-600">Cover Images</p>
          </div>
          {bannerImages.map((bannerUrl, index) => (
            <Image
              key={index}
              src={bannerUrl}
              alt={`${service.serviceName} Banner ${index + 1}`}
              width={150}
              height={100}
              className="rounded shadow"
            />
          ))}
        </div>
      )}

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
            {/* About Us */}
            {serviceDetails.aboutUs && serviceDetails.aboutUs.length > 0 && (
              <SectionCard title="About Us">
                {serviceDetails.aboutUs.map((item: string, index: number) => (
                  <p key={index} className="text-sm text-gray-700 mb-2">{item}</p>
                ))}
              </SectionCard>
            )}

            {/* Benefits */}
            {benefits.length > 0 && (
              <SectionCard title="Benefits">
                {benefits.map((benefit: string, index: number) => (
                  <p key={index} className="text-sm text-gray-700 mb-2">• {benefit}</p>
                ))}
              </SectionCard>
            )}

            {/* Highlight Images */}
            {highlightArray.length > 0 && (
              <SectionCard title="Highlight">
                {highlightArray.map((img, index) => (
                  <div key={index} className="mb-4 rounded-lg overflow-hidden relative w-full h-80">
                    <Image
                      src={img}
                      alt={`Highlight ${index + 1}`}
                      layout="fill"
                      objectFit="cover"
                      className="rounded-lg"
                      priority={index === 0}
                    />
                  </div>
                ))}
              </SectionCard>
            )}

            {/* How It Works */}
            {howItWorks.length > 0 && (
              <SectionCard title="How It Works">
                {howItWorks.map((item: any, index: number) => (
                  <div key={item._id || index} className="mb-4">
                    <h5 className="font-medium text-gray-800">{item.title}</h5>
                    <p className="text-sm text-gray-700 mt-1">{item.description}</p>
                  </div>
                ))}
              </SectionCard>
            )}

            {/* Assured By FetchTrue */}
            {assuredByFetchTrue.length > 0 && (
              <SectionCard title="Assured By FetchTrue">
                {assuredByFetchTrue.map((item: any, index: number) => (
                  <div key={item._id || index} className="mb-4">
                    <h5 className="font-medium text-gray-800">{item.title}</h5>
                    <p className="text-sm text-gray-700 mt-1">{item.description}</p>
                  </div>
                ))}
              </SectionCard>
            )}

            {/* Why Choose Us */}
            {whyChooseUs.length > 0 && (
              <SectionCard title="Why Choose Us">
                {whyChooseUs.map((item: any, index: number) => (
                  <div key={item._id || index} className="mb-4">
                    <h5 className="font-medium text-gray-800">{item.title}</h5>
                    <p className="text-sm text-gray-700 mt-1">{item.description}</p>
                  </div>
                ))}
              </SectionCard>
            )}

            {/* Packages */}
            {packages.length > 0 && (
              <SectionCard title="Packages">
                {packages.map((pkg: any, index: number) => (
                  <div key={pkg._id || index} className="mb-4 p-3 border rounded-lg">
                    <h5 className="font-medium text-gray-800">{pkg.name}</h5>
                    <p className="text-sm text-gray-700">Price: ₹{pkg.price}</p>
                    {pkg.discount && <p className="text-sm text-gray-700">Discount: {pkg.discount}%</p>}
                    {pkg.discountedPrice && <p className="text-sm text-gray-700">Discounted Price: ₹{pkg.discountedPrice}</p>}
                    {pkg.whatYouGet && pkg.whatYouGet.length > 0 && (
                      <div className="mt-2">
                        <h6 className="font-medium text-gray-700">What You Get:</h6>
                        <ul className="list-disc list-inside text-sm text-gray-700">
                          {pkg.whatYouGet.map((item: string, i: number) => (
                            <li key={i}>{item}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ))}
              </SectionCard>
            )}

            {/* We Required */}
            {weRequired.length > 0 && (
              <SectionCard title="We Required">
                {weRequired.map((item: any, index: number) => (
                  <div key={item._id || index} className="mb-4">
                    <h5 className="font-medium text-gray-800">{item.title}</h5>
                    <p className="text-sm text-gray-700 mt-1">{item.description}</p>
                  </div>
                ))}
              </SectionCard>
            )}

            {/* We Deliver */}
            {weDeliver.length > 0 && (
              <SectionCard title="We Deliver">
                {weDeliver.map((item: any, index: number) => (
                  <div key={item._id || index} className="mb-4">
                    <h5 className="font-medium text-gray-800">{item.title}</h5>
                    <p className="text-sm text-gray-700 mt-1">{item.description}</p>
                  </div>
                ))}
              </SectionCard>
            )}

            {/* More Info */}
            {moreInfo.length > 0 && (
              <SectionCard title="More Information">
                {moreInfo.map((item: any, index: number) => (
                  <div key={item._id || index} className="mb-4">
                    <h5 className="font-medium text-gray-800">{item.title}</h5>
                    {item.image && (
                      <div className="mb-2 rounded-lg overflow-hidden relative w-full h-48">
                        <Image
                          src={item.image}
                          alt={item.title}
                          layout="fill"
                          objectFit="cover"
                          className="rounded-lg"
                        />
                      </div>
                    )}
                    <p className="text-sm text-gray-700 mt-1">{item.description}</p>
                  </div>
                ))}
              </SectionCard>
            )}

            {/* Time Required */}
            {timeRequired.length > 0 && (
              <SectionCard title="Time Required">
                {timeRequired.map((item: any, index: number) => (
                  <div key={item._id || index} className="mb-4">
                    <p className="text-sm text-gray-700">
                      {item.minDays && item.maxDays 
                        ? `${item.minDays} - ${item.maxDays} days`
                        : item.minDays 
                        ? `Minimum ${item.minDays} days`
                        : item.maxDays 
                        ? `Maximum ${item.maxDays} days`
                        : 'Time not specified'
                      }
                    </p>
                  </div>
                ))}
              </SectionCard>
            )}

            {/* Connect With */}
            {connectWith.length > 0 && (
              <SectionCard title="Connect With">
                {connectWith.map((item: any, index: number) => (
                  <div key={item._id || index} className="mb-4">
                    <h5 className="font-medium text-gray-800">{item.name}</h5>
                    <p className="text-sm text-gray-700">Mobile: {item.mobileNo}</p>
                    <p className="text-sm text-gray-700">Email: {item.email}</p>
                  </div>
                ))}
              </SectionCard>
            )}

            {/* Documents */}
            {document.length > 0 && (
              <SectionCard title="Documents">
                {document.map((doc: string, index: number) => (
                  <p key={index} className="text-sm text-gray-700 mb-2">• {doc}</p>
                ))}
              </SectionCard>
            )}

            {/* Terms and Conditions */}
            {termsAndConditions.length > 0 && (
              <SectionCard title="Terms and Conditions">
                {termsAndConditions.map((term: string, index: number) => (
                  <p key={index} className="text-sm text-gray-700 mb-2">• {term}</p>
                ))}
              </SectionCard>
            )}

            {/* FAQ Section */}
            {faq.length > 0 && (
              <ComponentCard title="FAQs">
                <div className="space-y-2">
                  {faq.map((item: { question: string; answer: string }, i: number) => (
                    <div key={i} className="border rounded-md p-3 shadow-sm bg-white">
                      <button
                        onClick={() => setOpenFaqIndex(openFaqIndex === i ? null : i)}
                        className="flex items-center justify-between w-full text-left"
                      >
                        <span className="flex items-center font-medium text-primary">
                          <ChevronDownIcon className="mr-2" />
                          Q: {item.question}
                        </span>
                        {openFaqIndex === i ? (
                          <ChevronDownIcon className="text-xl transform rotate-180" />
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

            {/* Extra Sections */}
            {extraSections.length > 0 && (
              <ComponentCard title="Extra Sections">
                {extraSections.map((item: any, i: number) => (
                  <div key={i} className="mb-6">
                    {item.title && <h4 className="font-semibold text-lg mb-3">{item.title}</h4>}
                    
                    {item.subtitle && item.subtitle.length > 0 && (
                      <div className="mb-2">
                        {item.subtitle.map((sub: string, subIndex: number) => (
                          <p key={subIndex} className="font-medium text-gray-800">{sub}</p>
                        ))}
                      </div>
                    )}
                    
                    {item.description && item.description.length > 0 && (
                      <div className="mb-2">
                        {item.description.map((desc: string, descIndex: number) => (
                          <p key={descIndex} className="text-sm text-gray-700 mb-1">{desc}</p>
                        ))}
                      </div>
                    )}
                    
                    {item.subDescription && item.subDescription.length > 0 && (
                      <div className="mb-2">
                        {item.subDescription.map((subDesc: string, subDescIndex: number) => (
                          <p key={subDescIndex} className="text-xs text-gray-600 mb-1">{subDesc}</p>
                        ))}
                      </div>
                    )}
                    
                    {item.lists && item.lists.length > 0 && (
                      <ul className="list-disc list-inside mb-2">
                        {item.lists.map((listItem: string, listIndex: number) => (
                          <li key={listIndex} className="text-sm text-gray-700">{listItem}</li>
                        ))}
                      </ul>
                    )}
                    
                    {item.tags && item.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-2">
                        {item.tags.map((tag: string, tagIndex: number) => (
                          <span key={tagIndex} className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                    
                    {item.image && item.image.length > 0 && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-2">
                        {item.image.map((img: string, imgIndex: number) => (
                          <div key={imgIndex} className="rounded-lg overflow-hidden relative w-full h-48">
                            <Image
                              src={img}
                              alt={`${item.title} image ${imgIndex + 1}`}
                              layout="fill"
                              objectFit="cover"
                              className="rounded-lg"
                            />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </ComponentCard>
            )}

            {/* Extra Images */}
            {extraImages.length > 0 && (
              <SectionCard title="Additional Images">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {extraImages.map((img: string, index: number) => (
                    <div key={index} className="rounded-lg overflow-hidden relative w-full h-48">
                      <Image
                        src={img}
                        alt={`Extra image ${index + 1}`}
                        layout="fill"
                        objectFit="cover"
                        className="rounded-lg"
                      />
                    </div>
                  ))}
                </div>
              </SectionCard>
            )}
          </div>
        </ComponentCard>
      )}

      {/* Franchise Tab Content */}
      {activeTab === 'franchise' && (
        <ComponentCard title="Franchise Details">
          <div className="space-y-4">
            {/* Commission */}
            {franchiseDetails.commission && (
              <SectionCard title="Commission" content={franchiseDetails.commission.toString()} />
            )}

            {/* Terms & Conditions */}
            {franchiseDetails.termsAndConditions && (
              <SectionCard title="Terms & Conditions" isHtml content={franchiseDetails.termsAndConditions} />
            )}

            {/* Investment Range */}
            {franchiseDetails.investmentRange && franchiseDetails.investmentRange.length > 0 && (
              <SectionCard title="Investment Range">
                {franchiseDetails.investmentRange.map((item: any, index: number) => (
                  <div key={item._id || index} className="mb-2">
                    <p className="text-sm text-gray-700">
                      ₹{item.minRange || 0} - ₹{item.maxRange || 0}
                    </p>
                  </div>
                ))}
              </SectionCard>
            )}

            {/* Monthly Earning Potential */}
            {franchiseDetails.monthlyEarnPotential && franchiseDetails.monthlyEarnPotential.length > 0 && (
              <SectionCard title="Monthly Earning Potential">
                {franchiseDetails.monthlyEarnPotential.map((item: any, index: number) => (
                  <div key={item._id || index} className="mb-2">
                    <p className="text-sm text-gray-700">
                      ₹{item.minEarn || 0} - ₹{item.maxEarn || 0}
                    </p>
                  </div>
                ))}
              </SectionCard>
            )}

            {/* Franchise Model */}
            {franchiseDetails.franchiseModel && franchiseDetails.franchiseModel.length > 0 && (
              <SectionCard title="Franchise Models">
                {franchiseDetails.franchiseModel.map((item: any, index: number) => (
                  <div key={index} className="mb-4 p-3 border rounded-lg">
                    <h5 className="font-medium text-gray-800">{item.title}</h5>
                    {item.agreement && <p className="text-sm text-gray-700">Agreement: {item.agreement}</p>}
                    {item.price && <p className="text-sm text-gray-700">Price: ₹{item.price}</p>}
                    {item.discount && <p className="text-sm text-gray-700">Discount: {item.discount}%</p>}
                    {item.gst && <p className="text-sm text-gray-700">GST: {item.gst}%</p>}
                    {item.fees && <p className="text-sm text-gray-700">Fees: ₹{item.fees}</p>}
                  </div>
                ))}
              </SectionCard>
            )}

            {/* Extra Sections */}
            {franchiseDetails.extraSections && franchiseDetails.extraSections.length > 0 && (
              <ComponentCard title="Extra Sections">
                {franchiseDetails.extraSections.map((item: any, i: number) => (
                  <div key={i} className="mb-6">
                    {item.title && <h4 className="font-semibold text-lg mb-3">{item.title}</h4>}
                    
                    {item.subtitle && item.subtitle.length > 0 && (
                      <div className="mb-2">
                        {item.subtitle.map((sub: string, subIndex: number) => (
                          <p key={subIndex} className="font-medium text-gray-800">{sub}</p>
                        ))}
                      </div>
                    )}
                    
                    {item.description && item.description.length > 0 && (
                      <div className="mb-2">
                        {item.description.map((desc: string, descIndex: number) => (
                          <p key={descIndex} className="text-sm text-gray-700 mb-1">{desc}</p>
                        ))}
                      </div>
                    )}
                    
                    {item.image && item.image.length > 0 && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-2">
                        {item.image.map((img: string, imgIndex: number) => (
                          <div key={imgIndex} className="rounded-lg overflow-hidden relative w-full h-48">
                            <Image
                              src={img}
                              alt={`${item.title} image ${imgIndex + 1}`}
                              layout="fill"
                              objectFit="cover"
                              className="rounded-lg"
                            />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </ComponentCard>
            )}

            {/* Extra Images */}
            {franchiseDetails.extraImages && franchiseDetails.extraImages.length > 0 && (
              <SectionCard title="Additional Images">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {franchiseDetails.extraImages.map((img: string, index: number) => (
                    <div key={index} className="rounded-lg overflow-hidden relative w-full h-48">
                      <Image
                        src={img}
                        alt={`Franchise image ${index + 1}`}
                        layout="fill"
                        objectFit="cover"
                        className="rounded-lg"
                      />
                    </div>
                  ))}
                </div>
              </SectionCard>
            )}
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
  children,
}: {
  title: string;
  content?: string;
  icon?: React.ReactNode;
  isHtml?: boolean;
  children?: React.ReactNode;
}) => (
  <div className="bg-white shadow-sm border rounded p-4">
    <h4 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
      {icon}
      {title}
    </h4>

    {children ? (
      <div className="text-sm text-gray-700">{children}</div>
    ) : isHtml ? (
      <div
        className="text-sm text-gray-700"
        dangerouslySetInnerHTML={{ __html: content || '' }}
      />
    ) : (
      <p className="text-sm text-gray-700">{content}</p>
    )}
  </div>
);

export default ServiceDetailsPage;