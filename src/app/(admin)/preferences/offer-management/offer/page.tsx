'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import axios from 'axios';
import { EyeIcon, PencilIcon } from 'lucide-react';
import { TrashBinIcon } from '@/icons';
import Link from 'next/link';
// Lazy load AddOffer form component
const AddOfferForm = dynamic(() => import('@/components/offer-component/OfferComponent'), {
    ssr: false,
    loading: () => (
        <div className="flex justify-center items-center h-screen">
            <p className="text-xl text-gray-700">Loading form...</p>
        </div>
    ),
});

type OfferEntry = {
    _id: string;
    bannerImage: string;
    offerStartTime: string;
    offerEndTime: string;
    galleryImages: string[];
    eligibilityCriteria: string;
    howToParticipate: string;
    faq: string;
    termsAndConditions: string;
};

const AdminOffersPage: React.FC = () => {
    const [offers, setOffers] = useState<OfferEntry[]>([]);
    const [editingOfferId, setEditingOfferId] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isSaving,] = useState(false);
    const [saveSuccess,] = useState(false);

    const fetchOffers = async () => {
        setIsLoading(true);
        try {
            const res = await axios.get('/api/offer');
            if (res.data.success) {
                setOffers(res.data.data);
            }
        } catch (err) {
            console.error('Error fetching offers:', err);
            setError('Failed to load offers.');
        } finally {
            setIsLoading(false);
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

    type OfferStatus = 'Upcoming' | 'Active' | 'Expired';

    function getOfferStatus(startISO: string, endISO: string): OfferStatus {
        const now = Date.now();
        const start = Date.parse(startISO);
        const end = Date.parse(endISO);
        if (Number.isNaN(start) || Number.isNaN(end)) return 'Expired'; // fallback
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
                    : 'bg-red-100 text-red-700 border border-red-400'; // Expired

        return (
            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${styles}`}>
                {status}
            </span>
        );
    }


    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-4xl font-bold mb-6 text-center">Manage Offers</h1>

            {saveSuccess && <p className="bg-green-100 text-green-700 px-4 py-2 mb-4 rounded">Offer saved!</p>}
            {isSaving && <p className="bg-blue-100 text-blue-700 px-4 py-2 mb-4 rounded">Processing...</p>}
            {error && <p className="bg-red-100 text-red-700 px-4 py-2 mb-4 rounded">{error}</p>}

            {!editingOfferId && (
                <button
                    onClick={() => setEditingOfferId('new')}
                    className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 mb-6"
                >
                    Add New Offer
                </button>
            )}

            {/* Add/Edit Form */}
            {editingOfferId && (
                <div className="bg-white p-6 rounded shadow mb-10">
                    <h2 className="text-2xl font-semibold mb-4">
                        {editingOfferId === 'new' ? 'Add New Offer' : 'Edit Offer'}
                    </h2>

                    <AddOfferForm
                        offerIdToEdit={editingOfferId === 'new' ? undefined : editingOfferId}
                    />

                    <div className="mt-4">
                        <button
                            onClick={() => setEditingOfferId(null)}
                            className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            )}

            {/* Table of Offers */}
            {!isLoading ? (
                <div className="overflow-x-auto">
                    <table className="min-w-full table-auto text-sm border border-gray-300">
                        <thead className="bg-gray-100 text-left">
                            <tr>
                                <th className="p-3 border">Banner</th>
                                <th className="p-3 border">Gallery</th>
                                <th className="p-3 border">Start</th>
                                <th className="p-3 border">End</th>
                                <th className="p-3 border">Status</th> {/* ✅ New */}
                                <th className="p-3 border text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {offers.map((offer) => {
                                const status = getOfferStatus(offer.offerStartTime, offer.offerEndTime);
                                const start = new Date(offer.offerStartTime);
                                const end = new Date(offer.offerEndTime);

                                return (
                                    <tr key={offer._id} className="hover:bg-gray-50">
                                        {/* Banner */}
                                        <td className="p-3 border">
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

                                        {/* Gallery Count */}
                                        <td className="p-3 border">
                                            {offer.galleryImages?.length ? (
                                                <span>{offer.galleryImages.length} images</span>
                                            ) : (
                                                <span className="text-gray-500 italic">No Gallery</span>
                                            )}
                                        </td>

                                        {/* Start & End */}
                                        <td className="p-3 border">{start.toLocaleString()}</td>
                                        <td className="p-3 border">{end.toLocaleString()}</td>

                                        {/* Status */}
                                        <td className="p-3 border">
                                            <StatusBadge status={status} />
                                        </td>

                                        {/* Actions */}
                                        <td className="p-3 border text-center">
                                            <div className="flex justify-center gap-2">
                                                <button
                                                    onClick={() => setEditingOfferId(offer._id)}
                                                    className="text-yellow-500 border border-yellow-500 rounded-md p-2 hover:bg-yellow-500 hover:text-white"
                                                    aria-label="Edit"
                                                >
                                                    <PencilIcon size={16} />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(offer._id)}
                                                    className="text-red-500 border border-red-500 rounded-md p-2 hover:bg-red-500 hover:text-white"
                                                    aria-label="Delete"
                                                >
                                                    <TrashBinIcon />
                                                </button>
                                                <Link
                                                    href={`/preferences/offer-management/offer/${offer._id}`}
                                                    className="text-blue-500 border border-blue-500 rounded-md p-2 hover:bg-blue-500 hover:text-white"
                                                    aria-label="View"
                                                >
                                                    <EyeIcon />
                                                </Link>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>


                    </table>
                </div>
            ) : (
                <p className="text-gray-600">Loading offers...</p>
            )}
        </div>
    );
};

export default AdminOffersPage;
