// 'use client';

// import React, { useEffect, useState } from 'react';
// import axios from 'axios';
// import Link from 'next/link';
// import { EyeIcon, PencilIcon } from 'lucide-react';
// import { TrashBinIcon } from '@/icons';

// interface OfferEntry {
//   _id: string;
//   bannerImage: string;
//   offerStartTime: string;
//   offerEndTime: string;
//   galleryImages: string[];
//   eligibilityCriteria: string;
//   howToParticipate: string;
//   faq: string;
//   termsAndConditions: string;
// }

// type OfferStatus = 'Upcoming' | 'Active' | 'Expired';

// function getOfferStatus(startISO: string, endISO: string): OfferStatus {
//   const now = Date.now();
//   const start = Date.parse(startISO);
//   const end = Date.parse(endISO);
//   if (Number.isNaN(start) || Number.isNaN(end)) return 'Expired';
//   if (now < start) return 'Upcoming';
//   if (now > end) return 'Expired';
//   return 'Active';
// }

// function StatusBadge({ status }: { status: OfferStatus }) {
//   const styles =
//     status === 'Active'
//       ? 'bg-green-100 text-green-700 border border-green-400'
//       : status === 'Upcoming'
//         ? 'bg-yellow-100 text-yellow-700 border border-yellow-400'
//         : 'bg-red-100 text-red-700 border border-red-400';
//   return (
//     <span className={`px-3 py-1 rounded-full text-xs font-semibold ${styles}`}>
//       {status}
//     </span>
//   );
// }

// const OfferListPage: React.FC = () => {
//   const [offers, setOffers] = useState<OfferEntry[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);

//   // Tab and filter states
//   const [selectedTab, setSelectedTab] = useState<'All' | OfferStatus>('All');
//   const [selectedDate, setSelectedDate] = useState<string>('');
//   const [searchTerm, setSearchTerm] = useState<string>('');

//   const fetchOffers = async () => {
//     setLoading(true);
//     try {
//       const res = await axios.get('/api/offer');
//       if (res.data.success) {
//         setOffers(res.data.data);
//       }
//     } catch (err) {
//       console.error('Error fetching offers:', err);
//       setError('Failed to load offers.');
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchOffers();
//   }, []);

//   const handleDelete = async (id: string) => {
//     if (!window.confirm('Are you sure you want to delete this offer?')) return;
//     try {
//       await axios.delete(`/api/offer/${id}`);
//       fetchOffers();
//     } catch {
//       setError('Failed to delete offer.');
//     }
//   };

//   // Filter offers
//   const filteredOffers = offers.filter((offer) => {
//     const status = getOfferStatus(offer.offerStartTime, offer.offerEndTime);
//     const matchesTab = selectedTab === 'All' || status === selectedTab;
//     const matchesSearch =
//       offer.eligibilityCriteria?.toLowerCase().includes(searchTerm.toLowerCase()) ||
//       '';

//     // Date filter
//     if (selectedDate) {
//       const start = new Date(offer.offerStartTime);
//       const end = new Date(offer.offerEndTime);
//       const filterDate = new Date(selectedDate);
//       const isInRange = start <= filterDate && end >= filterDate;
//       return matchesTab && matchesSearch && isInRange;
//     }

//     return matchesTab && matchesSearch;
//   });

//   return (
//     <div className="container mx-auto px-4 py-8">
//       <h1 className="text-3xl font-bold mb-6 text-center">Offers List</h1>
//       {error && <p className="bg-red-100 text-red-700 px-4 py-2 mb-4 rounded">{error}</p>}

//       {/* Search Bar */}
//       <div className="flex items-center gap-2 mb-4">
//         <input
//           type="text"
//           placeholder="Search by eligibility criteria"
//           value={searchTerm}
//           onChange={(e) => setSearchTerm(e.target.value)}
//           className="border border-gray-300 rounded px-3 py-2 w-1/3"
//         />
//       </div>

//       {/* Tabs */}
//       <div className="flex gap-4 mb-4 border-b">
//         {['All', 'Active', 'Upcoming', 'Expired'].map((tab) => (
//           <button
//             key={tab}
//             onClick={() => setSelectedTab(tab as 'All' | OfferStatus)}
//             className={`pb-2 ${
//               selectedTab === tab
//                 ? 'border-b-2 border-blue-600 text-blue-600 font-semibold'
//                 : 'text-gray-600'
//             }`}
//           >
//             {tab}
//           </button>
//         ))}
//       </div>

//       {/* Date Filter */}
//       <div className="flex items-center gap-2 mb-4">
//         <label className="text-sm text-gray-600">Filter by Date:</label>
//         <input
//           type="date"
//           value={selectedDate}
//           onChange={(e) => setSelectedDate(e.target.value)}
//           className="border border-gray-300 rounded px-2 py-1"
//         />
//         {selectedDate && (
//           <button
//             onClick={() => setSelectedDate('')}
//             className="text-sm text-blue-600 underline"
//           >
//             Clear
//           </button>
//         )}
//       </div>

//       {!loading ? (
//         <div className="overflow-x-auto">
//           <table className="min-w-full table-auto text-sm border border-gray-300">
//             <thead className="bg-gray-100 text-left">
//               <tr>
//                 <th className="p-3 border">Banner</th>
//                 <th className="p-3 border">Gallery</th>
//                 <th className="p-3 border">Start</th>
//                 <th className="p-3 border">End</th>
//                 <th className="p-3 border">Status</th>
//                 <th className="p-3 border text-center">Actions</th>
//               </tr>
//             </thead>
//             <tbody>
//               {filteredOffers.map((offer) => {
//                 const status = getOfferStatus(offer.offerStartTime, offer.offerEndTime);
//                 return (
//                   <tr key={offer._id} className="hover:bg-gray-50">
//                     <td className="p-3 border">
//                       {offer.bannerImage ? (
//                         <img
//                           src={offer.bannerImage}
//                           alt="Banner"
//                           className="w-16 h-16 object-cover rounded"
//                         />
//                       ) : (
//                         <span className="text-gray-500 italic">No Image</span>
//                       )}
//                     </td>
//                     <td className="p-3 border">
//                       {offer.galleryImages?.length
//                         ? `${offer.galleryImages.length} images`
//                         : <span className="text-gray-500 italic">No Gallery</span>}
//                     </td>
//                     <td className="p-3 border">{new Date(offer.offerStartTime).toLocaleString()}</td>
//                     <td className="p-3 border">{new Date(offer.offerEndTime).toLocaleString()}</td>
//                     <td className="p-3 border">
//                       <StatusBadge status={status} />
//                     </td>
//                     <td className="p-3 border text-center">
//                       <div className="flex justify-center gap-2">
//                         <Link
//                           href={`/offer-management/Offer-List/${offer._id}`}
//                           className="text-blue-500 border border-blue-500 rounded-md p-2 hover:bg-blue-500 hover:text-white"
//                         >
//                           <EyeIcon size={16} />
//                         </Link>
//                         <Link
//                           href={`/offer-management/Add-Offer?page=edit&id=${offer._id}`}
//                           className="text-yellow-500 border border-yellow-500 rounded-md p-2 hover:bg-yellow-500 hover:text-white"
//                         >
//                           <PencilIcon size={16} />
//                         </Link>
//                         <button
//                           onClick={() => handleDelete(offer._id)}
//                           className="text-red-500 border border-red-500 rounded-md p-2 hover:bg-red-500 hover:text-white"
//                         >
//                           <TrashBinIcon />
//                         </button>
//                       </div>
//                     </td>
//                   </tr>
//                 );
//               })}
//               {filteredOffers.length === 0 && (
//                 <tr>
//                   <td className="p-4 text-center text-gray-500" colSpan={6}>No offers found.</td>
//                 </tr>
//               )}
//             </tbody>
//           </table>
//         </div>
//       ) : (
//         <p className="text-gray-600">Loading offers...</p>
//       )}
//     </div>
//   );
// };

// export default OfferListPage;




'use client';

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Link from 'next/link';
import { EyeIcon, PencilIcon } from 'lucide-react';
import { TrashBinIcon } from '@/icons';

interface OfferEntry {
  _id: string;
  bannerImage: string;
  offerStartTime: string;
  offerEndTime: string;
  galleryImages: string[];
  eligibilityCriteria: string;
  howToParticipate: string;
  faq: string;
  termsAndConditions: string;
}

type OfferStatus = 'Upcoming' | 'Active' | 'Expired';

function getOfferStatus(startISO: string, endISO: string): OfferStatus {
  const now = Date.now();
  const start = Date.parse(startISO);
  const end = Date.parse(endISO);
  if (Number.isNaN(start) || Number.isNaN(end)) return 'Expired';
  if (now < start) return 'Upcoming';
  if (now > end) return 'Expired';
  return 'Active';
}

function StatusBadge({ status }: { status: OfferStatus }) {
  const styles =
    status === 'Active'
      ? 'bg-green-100 text-green-700 border border-green-400'
      : status === 'Upcoming'
        ? 'bg-yellow-100 text-yellow-700 border border-yellow-400'
        : 'bg-red-100 text-red-700 border border-red-400';
  return (
    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${styles}`}>
      {status}
    </span>
  );
}

const OfferListPage: React.FC = () => {
  const [offers, setOffers] = useState<OfferEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedTab, setSelectedTab] = useState<'All' | OfferStatus>('All');
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');

  const fetchOffers = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/offer');
      if (res.data.success) {
        setOffers(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching offers:', err);
      setError('Failed to load offers.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOffers();
  }, []);

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this offer?')) return;
    try {
      await axios.delete(`/api/offer/${id}`);
      fetchOffers();
    } catch {
      setError('Failed to delete offer.');
    }
  };

  const filteredOffers = offers.filter((offer) => {
    const status = getOfferStatus(offer.offerStartTime, offer.offerEndTime);
    const matchesTab = selectedTab === 'All' || status === selectedTab;
    const matchesSearch =
      offer.eligibilityCriteria?.toLowerCase().includes(searchTerm.toLowerCase()) || '';

    if (selectedDate) {
      const start = new Date(offer.offerStartTime);
      const end = new Date(offer.offerEndTime);
      const filterDate = new Date(selectedDate);
      const isInRange = start <= filterDate && end >= filterDate;
      return matchesTab && matchesSearch && isInRange;
    }

    return matchesTab && matchesSearch;
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6 text-center">Offers List</h1>
      {error && <p className="bg-red-100 text-red-700 px-4 py-2 mb-4 rounded">{error}</p>}

      {/* Search Bar */}
      <div className="flex items-center gap-2 mb-4">
        <input
          type="text"
          placeholder="Search by eligibility criteria"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="border border-gray-300 rounded px-3 py-2 w-1/3"
        />
      </div>

      {/* Tabs */}
      <div className="flex gap-4 mb-4 border-b">
        {['All', 'Active', 'Upcoming', 'Expired'].map((tab) => (
          <button
            key={tab}
            onClick={() => setSelectedTab(tab as 'All' | OfferStatus)}
            className={`pb-2 ${
              selectedTab === tab
                ? 'border-b-2 border-blue-600 text-blue-600 font-semibold'
                : 'text-gray-600'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Date Filter */}
      <div className="flex items-center gap-2 mb-4">
        <label className="text-sm text-gray-600">Filter by Date:</label>
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="border border-gray-300 rounded px-2 py-1"
        />
        {selectedDate && (
          <button
            onClick={() => setSelectedDate('')}
            className="text-sm text-blue-600 underline"
          >
            Clear
          </button>
        )}
      </div>

      {!loading ? (
        <div className="overflow-x-auto">
          <table className="min-w-full table-auto text-sm">
            <thead className="bg-gray-100 text-left">
              <tr>
                <th className="p-3">Banner</th>
                <th className="p-3">Gallery</th>
                <th className="p-3">Start</th>
                <th className="p-3">End</th>
                <th className="p-3">Status</th>
                <th className="p-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredOffers.map((offer) => {
                const status = getOfferStatus(offer.offerStartTime, offer.offerEndTime);
                return (
                  <tr key={offer._id} className="hover:bg-gray-50">
                    <td className="p-3">
                      {offer.bannerImage ? (
                        <img
                          src={offer.bannerImage}
                          alt="Banner"
                          className="w-16 h-16 object-cover rounded"
                        />
                      ) : (
                        <span className="text-gray-500 italic">No Image</span>
                      )}
                    </td>
                    <td className="p-3">
                      {offer.galleryImages?.length
                        ? `${offer.galleryImages.length} images`
                        : <span className="text-gray-500 italic">No Gallery</span>}
                    </td>
                    <td className="p-3">{new Date(offer.offerStartTime).toLocaleString()}</td>
                    <td className="p-3">{new Date(offer.offerEndTime).toLocaleString()}</td>
                    <td className="p-3">
                      <StatusBadge status={status} />
                    </td>
                    <td className="p-3 text-center">
                      <div className="flex justify-center gap-2">
                        <Link
                          href={`/offer-management/Offer-List/${offer._id}`}
                          className="text-blue-500 border border-blue-500 rounded-md p-2 hover:bg-blue-500 hover:text-white"
                        >
                          <EyeIcon size={16} />
                        </Link>
                        <Link
                          href={`/offer-management/Add-Offer?page=edit&id=${offer._id}`}
                          className="text-yellow-500 border border-yellow-500 rounded-md p-2 hover:bg-yellow-500 hover:text-white"
                        >
                          <PencilIcon size={16} />
                        </Link>
                        <button
                          onClick={() => handleDelete(offer._id)}
                          className="text-red-500 border border-red-500 rounded-md p-2 hover:bg-red-500 hover:text-white"
                        >
                          <TrashBinIcon />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filteredOffers.length === 0 && (
                <tr>
                  <td className="p-4 text-center text-gray-500" colSpan={6}>No offers found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-gray-600">Loading offers...</p>
      )}
    </div>
  );
};

export default OfferListPage;
