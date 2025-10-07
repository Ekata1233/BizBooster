'use client';

import React, { useEffect, useState, useMemo } from 'react';
import axios from 'axios';
import Link from 'next/link';
import { EyeIcon, PencilIcon } from 'lucide-react';
import { TrashBinIcon, UserIcon, ArrowUpIcon } from '@/icons';

import ComponentCard from '@/components/common/ComponentCard';
import StatCard from '@/components/common/StatCard';
import Label from '@/components/form/Label';
import Input from '@/components/form/input/InputField'; // your styled input wrapper

interface OfferEntry {
  _id: string;
  bannerImage: string;
  thumbnailImage: string;
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
  let styles = '';

  switch (status) {
    case 'Active':
      styles = 'text-green-600 bg-green-100 border border-green-300';
      break;
    case 'Upcoming':
      styles = 'text-yellow-600 bg-yellow-100 border border-yellow-300';
      break;
    case 'Expired':
      styles = 'text-red-600 bg-red-100 border border-red-300';
      break;
    default:
      styles = 'text-gray-600 bg-gray-100 border border-gray-300';
  }

  return (
    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${styles}`}>
      {status}
    </span>
  );
}

const OfferListPage: React.FC = () => {
  const [offers, setOffers] = useState<OfferEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Tabs & filters
  const [selectedTab, setSelectedTab] = useState<'All' | OfferStatus>('All');
  const [selectedDate, setSelectedDate] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const fetchOffers = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/offer/all');
      if (res.data.success) setOffers(res.data.data);
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

  const filteredOffers = useMemo(() => {
    return offers.filter((offer) => {
      const status = getOfferStatus(offer.offerStartTime, offer.offerEndTime);
      const matchesTab = selectedTab === 'All' || status === selectedTab;

      // search (eligibilityCriteria HTML string -> plain text match)
      const raw = offer.eligibilityCriteria || '';
      const plain = raw.replace(/<[^>]+>/g, ' ').toLowerCase();
      const searchMatch = searchTerm.trim()
        ? plain.includes(searchTerm.toLowerCase())
        : true;

      if (!matchesTab || !searchMatch) return false;

      if (selectedDate) {
        const start = new Date(offer.offerStartTime);
        const end = new Date(offer.offerEndTime);
        const filterDate = new Date(selectedDate);
        if (!(start <= filterDate && end >= filterDate)) return false;
      }

      return true;
    });
  }, [offers, selectedTab, searchTerm, selectedDate]);

  // ✅ Date formatter function
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6 text-center">Offers List</h1>

      {error && (
        <p className="bg-red-100 text-red-700 px-4 py-2 mb-4 rounded">
          {error}
        </p>
      )}

      {/* Filter Row: Search Filter Card + Stat Card */}
      <div className="flex flex-col lg:flex-row gap-6 mb-8">
        {/* Left Search Filter Card */}
        <div className="w-full lg:w-3/4">
          <ComponentCard title="Search Filter">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6 py-3">
              {/* Search Eligibility Criteria */}
              <div>
                <Label>Search by Eligibility Criteria</Label>
                <Input
                  type="text"
                  placeholder="Enter keyword"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              {/* Date Filter */}
              <div>
                <Label>Filter by Date (within offer range)</Label>
                <div className="flex items-center gap-2">
                  <Input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="w-full"
                  />
                  {selectedDate && (
                    <button
                      type="button"
                      onClick={() => setSelectedDate('')}
                      className="text-xs text-blue-600 underline whitespace-nowrap"
                    >
                      Clear
                    </button>
                  )}
                </div>
              </div>
            </div>
          </ComponentCard>
        </div>

        {/* Right Stat Card */}
        <div className="w-full lg:w-1/4">
          <StatCard
            title="Total Offers"
            value={offers.length}
            icon={UserIcon}
            badgeColor="success"
            badgeValue="0.00%"
            badgeIcon={ArrowUpIcon}
          />
        </div>
      </div>

      {/* Tabs with counts */}
      <div className="flex gap-6 mb-5 border-b border-gray-200">
        {(['All', 'Active', 'Upcoming', 'Expired'] as const).map((tab) => {
          const active = selectedTab === tab;

          // Count offers for each tab
          const count =
            tab === 'All'
              ? offers.length
              : offers.filter(
                  (offer) =>
                    getOfferStatus(offer.offerStartTime, offer.offerEndTime) === tab
                ).length;

          return (
            <button
              key={tab}
              onClick={() => setSelectedTab(tab)}
              className={`relative pb-3 text-sm font-medium transition-colors ${
                active ? 'text-blue-600' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab}
              <span className="ml-2 bg-red-500 text-white text-xs font-semibold px-2 py-0.5 rounded-full">
                {count}
              </span>
              {active && (
                <span className="absolute left-0 -bottom-[1px] h-[2px] w-full rounded-full bg-blue-600" />
              )}
            </button>
          );
        })}
      </div>

      {/* All Offers Table */}
      <ComponentCard title="All Offers">
        {!loading ? (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className=" text-gray-600">
                  <th className="px-5 py-3 font-medium text-left">Sr. No</th>
                  <th className="px-5 py-3 font-medium text-left">Thumbnail Image</th>
                  <th className="px-5 py-3 font-medium text-left">Banner</th>
                  <th className="px-5 py-3 font-medium text-left">Gallery</th>
                  <th className="px-5 py-3 font-medium text-left">Start</th>
                  <th className="px-5 py-3 font-medium text-left">End</th>
                  <th className="px-5 py-3 font-medium text-left">Status</th>
                  <th className="px-5 py-3 font-medium text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {[...filteredOffers].reverse().map((offer, index) => {
                  const status = getOfferStatus(
                    offer.offerStartTime,
                    offer.offerEndTime
                  );
                  return (
                    <tr
                      key={offer._id}
                      className="border-t border-gray-100 hover:bg-gray-50 transition"
                    >
                      {/* Serial No */}
                      <td className="px-5 py-3">
                        {index + 1}
                      </td>
                      <td className="px-5 py-3">
                        {offer.thumbnailImage ? (
                          <img
                            src={offer.thumbnailImage}
                            alt="ThumbnailImage"
                            className="w-16 h-16 object-cover rounded-md ring-1 ring-gray-200"
                          />
                        ) : (
                          <span className="text-gray-400 italic text-xs">
                            No Image
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-3">
                        {offer.bannerImage ? (
                          <img
                            src={offer.bannerImage}
                            alt="Banner"
                            className="w-16 h-16 object-cover rounded-md ring-1 ring-gray-200"
                          />
                        ) : (
                          <span className="text-gray-400 italic text-xs">
                            No Image
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-3">
                        {offer.galleryImages?.length ? (
                          <span>{offer.galleryImages.length} images</span>
                        ) : (
                          <span className="text-gray-400 italic text-xs">
                            No Gallery
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-3 whitespace-nowrap">
                        {formatDate(offer.offerStartTime)}
                      </td>
                      <td className="px-5 py-3 whitespace-nowrap">
                        {formatDate(offer.offerEndTime)}
                      </td>
                      <td className="px-5 py-3">
                        <StatusBadge status={status} />
                      </td>
                      <td className="px-5 py-3">
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
                    <td
                      className="px-5 py-10 text-center text-gray-500 text-sm"
                      colSpan={8}
                    >
                      No offers found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-600">Loading offers...</p>
        )}
      </ComponentCard>
    </div>
  );
};

export default OfferListPage;
