'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import axios from 'axios';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/solid';
import { QuestionMarkCircleIcon } from '@heroicons/react/24/outline';
import { ClockIcon, PhotoIcon } from '@heroicons/react/24/solid';

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
};

const OfferDetailPage: React.FC = () => {
  const { id } = useParams();
  const [offer, setOffer] = useState<OfferEntry | null>(null);
  const [loading, setLoading] = useState(true);
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [currentImage, setCurrentImage] = useState(0); // Gallery slider

  const fetchOffer = async () => {
    try {
      const res = await axios.get(`/api/offer/${id}`);
      if (res.data.success) {
        setOffer({ ...res.data.data, faq: normalizeFAQ(res.data.data.faq) });
      }
    } catch (err) {
      console.error('Error fetching offer details:', err);
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

  if (loading) return <p className="text-center text-gray-500">Loading...</p>;
  if (!offer) return <p className="text-center text-red-500">Offer not found.</p>;

  const handlePrev = () => setCurrentImage((prev) => (prev === 0 ? offer.galleryImages.length - 1 : prev - 1));
  const handleNext = () => setCurrentImage((prev) => (prev === offer.galleryImages.length - 1 ? 0 : prev + 1));

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6 text-center flex justify-center items-center gap-2">
        <PhotoIcon className="w-7 h-7 text-indigo-600" />
        Offer Details
      </h1>

         {/* Thumbnail */}

       <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2 flex items-center gap-2">
          <PhotoIcon className="w-5 h-5 text-gray-700" /> Thumbnail
        </h2>
        {offer.thumbnailImage ? (
          <img src={offer.thumbnailImage} alt="Thumbnail" className="w-full h-64 object-fit rounded shadow-md" />
        ) : (
          <p>No Thumbnail image</p>
        )}
      </div>

      {/* Banner */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2 flex items-center gap-2">
          <PhotoIcon className="w-5 h-5 text-gray-700" /> Banner
        </h2>
        {offer.bannerImage ? (
          <img src={offer.bannerImage} alt="Banner" className="w-full h-64 object-fit rounded shadow-md" />
        ) : (
          <p>No banner image</p>
        )}
      </div>

      {/* Gallery Slider */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2 flex items-center gap-2">
          <PhotoIcon className="w-5 h-5 text-gray-700" /> Gallery Images
        </h2>
        {offer.galleryImages.length > 0 ? (
          <div className="relative w-full max-w-xl mx-auto">
            <img
              src={offer.galleryImages[currentImage]}
              alt={`Gallery ${currentImage + 1}`}
              className="w-full h-64 object-fit rounded border"
            />
            <button
              onClick={handlePrev}
              className="absolute top-1/2 left-0 transform -translate-y-1/2 bg-gray-800/70 hover:bg-gray-900 text-white p-2 rounded-r"
            >
              <ChevronLeftIcon className="w-5 h-5" />
            </button>
            <button
              onClick={handleNext}
              className="absolute top-1/2 right-0 transform -translate-y-1/2 bg-gray-800/70 hover:bg-gray-900 text-white p-2 rounded-l"
            >
              <ChevronRightIcon className="w-5 h-5" />
            </button>
          </div>
        ) : (
          <p>No gallery images</p>
        )}
      </div>

      {/* Offer Duration */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2 flex items-center gap-2">
          <ClockIcon className="w-5 h-5 text-gray-700" /> Offer Duration
        </h2>
        <div className="bg-gray-100 w-1/3 border border-gray-200 p-4 rounded">
          <p>
            <strong>Start:</strong> {new Date(offer.offerStartTime).toLocaleString()}
          </p>
          <p>
            <strong>End:</strong> {new Date(offer.offerEndTime).toLocaleString()}
          </p>
        </div>
      </div>

      {/* Sections */}
      <div className="space-y-6">
        <section>
          <h2 className="text-xl font-semibold mb-2">Eligibility Criteria</h2>
          <div
            className="prose border p-4 rounded bg-gray-50"
            dangerouslySetInnerHTML={{ __html: offer.eligibilityCriteria }}
          />
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-2">How to Participate</h2>
          <div
            className="prose border p-4 rounded bg-gray-50"
            dangerouslySetInnerHTML={{ __html: offer.howToParticipate }}
          />
        </section>

        {/* FAQ Accordion */}
        <section>
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <QuestionMarkCircleIcon className="w-5 h-5 text-gray-700" /> FAQ
          </h2>
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
            <p>No FAQs available.</p>
          )}
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-2">Terms and Conditions</h2>
          <div
            className="prose border p-4 rounded bg-gray-50"
            dangerouslySetInnerHTML={{ __html: offer.termsAndConditions }}
          />
        </section>
      </div>
    </div>
  );
};

export default OfferDetailPage;
