'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import axios from 'axios';
import Image from 'next/image';
import PageBreadcrumb from '@/components/common/PageBreadCrumb';
import ComponentCard from '@/components/common/ComponentCard';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/solid';
import { QuestionMarkCircleIcon } from '@heroicons/react/24/outline';

type FAQItem = { question: string; answer: string };

type OfferEntry = {
  _id: string;
  bannerImage: string;
  thumbnailImage: string;
  offerStartTime: string;
  offerEndTime: string;
  galleryImages: string[];
  eligibilityCriteria: string;
  howToParticipate: string;
  faq: FAQItem[];
  termsAndConditions: string;
  createdAt?: string;
  updatedAt?: string;
  isActive?: boolean;
};

const OfferDetailPage = () => {
  const { id } = useParams();
  const [offer, setOffer] = useState<OfferEntry | null>(null);
  const [loading, setLoading] = useState(true);
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [showAll, setShowAll] = useState(false);
  const [currentImage, setCurrentImage] = useState(0);

  const fetchOffer = async () => {
    try {
      const res = await axios.get(`/api/offer/${id}`);
      console.log('📦 Raw API Response:', res.data);

      if (res.data.success) {
        const normalizedData = {
          ...res.data.data,
          faq: normalizeFAQ(res.data.data.faq),
        };
        setOffer(normalizedData);
        console.log('🎯 Normalized Offer Data:', normalizedData);
      } else {
        console.warn('⚠️ Offer fetch failed:', res.data);
      }
    } catch (err) {
      console.error('❌ Error fetching offer details:', err);
    } finally {
      setLoading(false);
    }
  };

  function normalizeFAQ(raw: unknown): FAQItem[] {
    if (!raw) return [];
    if (Array.isArray(raw)) {
      return raw.map((it, idx) =>
        typeof it === 'object' && it !== null
          ? { question: (it as FAQItem).question || `Question ${idx + 1}`, answer: (it as FAQItem).answer || '' }
          : { question: String(it), answer: '' }
      );
    }
    if (typeof raw === 'string') {
      try {
        return JSON.parse(raw);
      } catch {
        return [{ question: 'FAQ', answer: raw }];
      }
    }
    return [];
  }

  useEffect(() => {
    fetchOffer();
  }, [id]);

  if (loading) return <div className="p-4">Loading...</div>;
  if (!offer) return <div className="p-4 text-red-600">Offer not found.</div>;

  const visibleGallery = showAll ? offer.galleryImages : offer.galleryImages.slice(0, 3);

  const handlePrev = () =>
    setCurrentImage((prev) => (prev === 0 ? offer.galleryImages.length - 1 : prev - 1));
  const handleNext = () =>
    setCurrentImage((prev) => (prev === offer.galleryImages.length - 1 ? 0 : prev + 1));

  return (
    <div>
      <PageBreadcrumb pageTitle="Offer Details" />

      {/* Card 1: Images Overview */}
      <div className="my-5">
        <ComponentCard title="Offer Overview">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
            {/* Thumbnail Image */}
            <div className="col-span-1">
              <h2 className="text-lg font-semibold mb-2">Thumbnail:</h2>
              {offer.thumbnailImage ? (
                <Image
                  src={offer.thumbnailImage}
                  alt="Thumbnail"
                  width={200}
                  height={200}
                  className="rounded border object-cover w-full h-[200px]"
                />
              ) : (
                <div className="w-full h-[200px] border flex items-center justify-center rounded text-gray-500 text-sm">
                  No Thumbnail
                </div>
              )}
            </div>

            {/* Banner Image */}
            <div className="col-span-3">
              <h2 className="text-lg font-semibold mb-2">Banner:</h2>
              {offer.bannerImage ? (
                <Image
                  src={offer.bannerImage}
                  alt="Banner"
                  width={600}
                  height={200}
                  className="rounded border object-cover w-full h-[200px]"
                />
              ) : (
                <p className="text-gray-500">No Banner Image</p>
              )}
            </div>
          </div>

          {/* Gallery Section */}
          <div className="mt-8">
            <h2 className="text-lg font-semibold mb-3">Gallery:</h2>
            {offer.galleryImages.length > 0 ? (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {visibleGallery.map((img, index) => (
                    <Image
                      key={index}
                      src={img}
                      alt={`Gallery ${index + 1}`}
                      width={300}
                      height={200}
                      className="rounded border object-cover w-full h-[200px]"
                    />
                  ))}
                </div>
                {offer.galleryImages.length > 3 && (
                  <div className="mt-4 text-center">
                    <button
                      onClick={() => setShowAll(!showAll)}
                      className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                      {showAll ? 'Show Less' : 'See More'}
                    </button>
                  </div>
                )}
              </>
            ) : (
              <p className="text-gray-500">No Gallery Images</p>
            )}
          </div>
        </ComponentCard>
      </div>

      {/* Card 2: Offer Details */}
      <div className="my-5">
        <ComponentCard title="Offer Information">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h2 className="text-lg font-semibold">Active Status:</h2>
              <p
                className={`px-3 py-1 rounded-full text-sm font-semibold inline-block ${
                  offer.isActive
                    ? 'text-green-600 bg-green-100 border border-green-300'
                    : 'text-red-600 bg-red-100 border border-red-300'
                }`}
              >
                {offer.isActive ? 'Active' : 'Inactive'}
              </p>
            </div>

            <div>
              <h2 className="text-lg font-semibold">Start Date:</h2>
              <p className="text-gray-700">
                {offer.offerStartTime ? new Date(offer.offerStartTime).toLocaleString() : 'N/A'}
              </p>
            </div>

            <div>
              <h2 className="text-lg font-semibold">End Date:</h2>
              <p className="text-gray-700">
                {offer.offerEndTime ? new Date(offer.offerEndTime).toLocaleString() : 'N/A'}
              </p>
            </div>

            <div>
              <h2 className="text-lg font-semibold">Created At:</h2>
              <p className="text-gray-700">
                {offer.createdAt ? new Date(offer.createdAt).toLocaleString() : 'N/A'}
              </p>
            </div>

            <div>
              <h2 className="text-lg font-semibold">Updated At:</h2>
              <p className="text-gray-700">
                {offer.updatedAt ? new Date(offer.updatedAt).toLocaleString() : 'N/A'}
              </p>
            </div>
          </div>
        </ComponentCard>
      </div>

      {/* Card 3: Content Sections */}
      <div className="my-5">
        <ComponentCard title="Offer Content">
          <section className="mb-6">
            <h3 className="text-lg font-semibold mb-2">Eligibility Criteria</h3>
            <div
              className="prose border p-4 rounded bg-gray-50"
              dangerouslySetInnerHTML={{ __html: offer.eligibilityCriteria }}
            />
          </section>

          <section className="mb-6">
            <h3 className="text-lg font-semibold mb-2">How to Participate</h3>
            <div
              className="prose border p-4 rounded bg-gray-50"
              dangerouslySetInnerHTML={{ __html: offer.howToParticipate }}
            />
          </section>

          <section className="mb-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <QuestionMarkCircleIcon className="w-5 h-5 text-gray-700" /> FAQs
            </h3>
            {offer.faq.length > 0 ? (
              <div className="space-y-3">
                {offer.faq.map((item, index) => (
                  <div key={index} className="border rounded overflow-hidden">
                    <button
                      className="w-full text-left bg-gray-200 px-4 py-2 font-medium flex items-center justify-between"
                      onClick={() => setOpenIndex(openIndex === index ? null : index)}
                    >
                      {item.question}
                      <span>{openIndex === index ? '-' : '+'}</span>
                    </button>
                    {openIndex === index && (
                      <div
                        className="p-4 bg-white"
                        dangerouslySetInnerHTML={{ __html: item.answer }}
                      />
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">No FAQs available.</p>
            )}
          </section>

          <section>
            <h3 className="text-lg font-semibold mb-2">Terms and Conditions</h3>
            <div
              className="prose border p-4 rounded bg-gray-50"
              dangerouslySetInnerHTML={{ __html: offer.termsAndConditions }}
            />
          </section>
        </ComponentCard>
      </div>
    </div>
  );
};

export default OfferDetailPage;
