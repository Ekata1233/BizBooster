// 'use client';

// import React, { useEffect, useState } from 'react';
// import { useParams } from 'next/navigation';
// import axios from 'axios';

// type FAQItem = {
//     question: string;
//     answer: string;
// };

// type OfferEntry = {
//     _id: string;
//     bannerImage: string;
//     offerStartTime: string;
//     offerEndTime: string;
//     galleryImages: string[];
//     eligibilityCriteria: string;
//     howToParticipate: string;
//     faq: FAQItem[]; // ✅ Changed from string to array
//     termsAndConditions: string;
// };

// const OfferDetailPage: React.FC = () => {
//     const { id } = useParams();
//     const [offer, setOffer] = useState<OfferEntry | null>(null);
//     const [loading, setLoading] = useState(true);
//     const [openIndex, setOpenIndex] = useState<number | null>(null); // Accordion state


//     function normalizeFAQ(raw: unknown): FAQItem[] {
//         if (!raw) return [];

//         // If it's already an array of objects with question/answer
//         if (Array.isArray(raw)) {
//             return raw
//                 .map((it, idx) => {
//                     if (typeof it === 'string') {
//                         // Treat whole string as question, empty answer
//                         return { question: it, answer: '' };
//                     }
//                     if (typeof it === 'object' && it !== null) {
//                         const o = it as any;
//                         const question =
//                             o.question ||
//                             o.q ||
//                             o.title ||
//                             (typeof o.answer === 'string'
//                                 ? o.answer.replace(/<[^>]*>/g, '').slice(0, 60) + '…'
//                                 : `Question ${idx + 1}`);
//                         const answer = o.answer || o.a || o.content || '';
//                         return { question: String(question), answer: String(answer) };
//                     }
//                     return null;
//                 })
//                 .filter(Boolean) as FAQItem[];
//         }

//         if (typeof raw === 'string') {
//             // Try parse JSON first
//             try {
//                 const parsed = JSON.parse(raw);
//                 return normalizeFAQ(parsed);
//             } catch {
//                 // Fallback: single HTML blob → make one entry
//                 return [{ question: 'FAQ', answer: raw }];
//             }
//         }

//         return [];
//     }

//     const fetchOffer = async () => {
//         try {
//             const res = await axios.get(`/api/offer/${id}`);
//             if (res.data.success) {
//                 const data = res.data.data;

//                 // ✅ Parse FAQ JSON if it's a string
//                 const faqData = normalizeFAQ(data.faq);
//                 console.log('Normalized FAQ:', faqData);
//                 setOffer({ ...data, faq: faqData });

//                 setOffer({ ...data, faq: faqData });
//             }
//         } catch (err) {
//             console.error('Error fetching offer details:', err);
//         } finally {
//             setLoading(false);
//         }
//     };

//     useEffect(() => {
//         fetchOffer();
//     }, [id]);

//     if (loading) return <p className="text-center text-gray-500">Loading...</p>;
//     if (!offer) return <p className="text-center text-red-500">Offer not found.</p>;

//     return (
//         <div className="container mx-auto px-4 py-8">
//             <h1 className="text-3xl font-bold mb-6 text-center">Offer Details</h1>

//             {/* Banner */}
//             <div className="mb-6">
//                 <h2 className="text-xl font-semibold mb-2">Banner</h2>
//                 {offer.bannerImage ? (
//                     <img
//                         src={offer.bannerImage}
//                         alt="Banner"
//                         className="w-full h-64 object-cover rounded"
//                     />
//                 ) : (
//                     <p>No banner image</p>
//                 )}
//             </div>

//             {/* Gallery */}
//             <div className="mb-6">
//                 <h2 className="text-xl font-semibold mb-2">Gallery Images</h2>
//                 <div className="flex gap-4 flex-wrap">
//                     {offer.galleryImages.length > 0 ? (
//                         offer.galleryImages.map((img, idx) => (
//                             <img
//                                 key={idx}
//                                 src={img}
//                                 alt={`Gallery ${idx + 1}`}
//                                 className="w-32 h-32 object-cover rounded border"
//                             />
//                         ))
//                     ) : (
//                         <p>No gallery images</p>
//                     )}
//                 </div>
//             </div>

//             {/* Date Info */}
//             <div className="mb-6">
//                 <h2 className="text-xl font-semibold mb-2">Offer Duration</h2>
//                 <div className="bg-gray-100 w-1/3 border border-gray-200 p-4 rounded">
//                     <p>
//                         <strong>Start:</strong> {new Date(offer.offerStartTime).toLocaleString()}
//                     </p>
//                     <p>
//                         <strong>End:</strong> {new Date(offer.offerEndTime).toLocaleString()}
//                     </p>
//                 </div>
//             </div>

//             {/* CKEditor Content */}
//             <div className="space-y-6">
//                 <div>
//                     <h2 className="text-xl font-semibold mb-2">Eligibility Criteria</h2>
//                     <div
//                         className="prose border p-4 rounded bg-gray-50"
//                         dangerouslySetInnerHTML={{ __html: offer.eligibilityCriteria }}
//                     />
//                 </div>

//                 <div>
//                     <h2 className="text-xl font-semibold mb-2">How to Participate</h2>
//                     <div
//                         className="prose border p-4 rounded bg-gray-50"
//                         dangerouslySetInnerHTML={{ __html: offer.howToParticipate }}
//                     />
//                 </div>

//                 {/* ✅ FAQ Accordion */}
//                 <div>
//                     <h2 className="text-xl font-semibold mb-4">FAQ</h2>
//                     {offer.faq.length > 0 ? (
//                         <div className="space-y-3">
//                             {offer.faq.map((item, index) => {
//                                 console.log("item question", item.question);
//                                 return (
//                                     <div key={index} className="border rounded overflow-hidden">
//                                         <button
//                                             className="w-full text-left bg-gray-200 px-4 py-2 font-medium"
//                                             onClick={() => setOpenIndex(openIndex === index ? null : index)}
//                                         >
//                                             {item.question}
//                                         </button>
//                                         {openIndex === index && (
//                                             <div
//                                                 className="p-4 bg-white"
//                                                 dangerouslySetInnerHTML={{ __html: item.answer }}
//                                             />
//                                         )}
//                                     </div>
//                                 );
//                             })}

//                         </div>
//                     ) : (
//                         <p>No FAQs available.</p>
//                     )}
//                 </div>

//                 <div>
//                     <h2 className="text-xl font-semibold mb-2">Terms and Conditions</h2>
//                     <div
//                         className="prose border p-4 rounded bg-gray-50"
//                         dangerouslySetInnerHTML={{ __html: offer.termsAndConditions }}
//                     />
//                 </div>
//             </div>
//         </div>
//     );
// };

// export default OfferDetailPage;



'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import axios from 'axios';

type FAQItem = { question: string; answer: string; };

type OfferEntry = {
  _id: string;
  bannerImage: string;
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

  const [currentImage, setCurrentImage] = useState(0); // For slider

  function normalizeFAQ(raw: unknown): FAQItem[] {
    if (!raw) return [];
    if (Array.isArray(raw)) {
      return raw.map((it, idx) =>
        typeof it === 'object' && it !== null
          ? { question: (it as any).question || `Question ${idx + 1}`, answer: (it as any).answer || '' }
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

  const fetchOffer = async () => {
    try {
      const res = await axios.get(`/api/offer/${id}`);
      if (res.data.success) {
        const data = res.data.data;
        setOffer({ ...data, faq: normalizeFAQ(data.faq) });
      }
    } catch (err) {
      console.error('Error fetching offer details:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOffer();
  }, [id]);

  if (loading) return <p className="text-center text-gray-500">Loading...</p>;
  if (!offer) return <p className="text-center text-red-500">Offer not found.</p>;

  const handlePrev = () => {
    setCurrentImage((prev) =>
      prev === 0 ? offer.galleryImages.length - 1 : prev - 1
    );
  };

  const handleNext = () => {
    setCurrentImage((prev) =>
      prev === offer.galleryImages.length - 1 ? 0 : prev + 1
    );
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6 text-center">Offer Details</h1>

      {/* Banner */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Banner</h2>
        {offer.bannerImage ? (
          <img
            src={offer.bannerImage}
            alt="Banner"
            className="w-full h-64 object-cover rounded"
          />
        ) : (
          <p>No banner image</p>
        )}
      </div>

      {/* Gallery Slider */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Gallery Images</h2>
        {offer.galleryImages.length > 0 ? (
          <div className="relative w-full max-w-xl mx-auto">
            <img
              src={offer.galleryImages[currentImage]}
              alt={`Gallery ${currentImage + 1}`}
              className="w-full h-64 object-cover rounded border"
            />
            <button
              onClick={handlePrev}
              className="absolute top-1/2 left-0 transform -translate-y-1/2 bg-gray-800 text-white px-3 py-1 rounded-r"
            >
              Prev
            </button>
            <button
              onClick={handleNext}
              className="absolute top-1/2 right-0 transform -translate-y-1/2 bg-gray-800 text-white px-3 py-1 rounded-l"
            >
              Next
            </button>
          </div>
        ) : (
          <p>No gallery images</p>
        )}
      </div>

      {/* Offer Duration */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Offer Duration</h2>
        <div className="bg-gray-100 w-1/3 border border-gray-200 p-4 rounded">
          <p>
            <strong>Start:</strong>{' '}
            {new Date(offer.offerStartTime).toLocaleString()}
          </p>
          <p>
            <strong>End:</strong>{' '}
            {new Date(offer.offerEndTime).toLocaleString()}
          </p>
        </div>
      </div>

      {/* Other Details */}
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
          <h2 className="text-xl font-semibold mb-4">FAQ</h2>
          {offer.faq.length > 0 ? (
            <div className="space-y-3">
              {offer.faq.map((item, index) => (
                <div key={index} className="border rounded overflow-hidden">
                  <button
                    className="w-full text-left bg-gray-200 px-4 py-2 font-medium"
                    onClick={() =>
                      setOpenIndex(openIndex === index ? null : index)
                    }
                  >
                    {item.question}
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
