// src/app/preferences/partner-review/page.tsx
'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import Image from 'next/image'; // Ensure Image is imported for Next.js Image component
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { PencilIcon } from 'lucide-react';
import { TrashBinIcon } from '@/icons';
import Button from '@/components/ui/button/Button'; // Assuming you have a Button component

interface PartnerReview {
    _id: string;
    title: string;
    imageUrl: string;
    videoUrl: string;
}

const PartnerReviewListPage = () => {
    const [reviews, setReviews] = useState<PartnerReview[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    const fetchReviews = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const res = await axios.get('/api/partnerreview');
            setReviews(res.data.data || []);
         }
        catch (err: unknown) {
                    console.error('Failed to fetch entry :', err);
                    if (axios.isAxiosError(err)) {
                        setError(err.response?.data?.message || 'Failed to load webinar details.');
                    } else if (err instanceof Error) {
                        setError(err.message || 'An unexpected error occurred.');
                    } else {
                        setError('An unknown error occurred.');
                    }
                }
        finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchReviews();
    }, []);

    /** ✅ Delete Review */
    const deleteReview = async (id: string) => {
        if (!window.confirm('Are you sure you want to delete this review?')) return; // Consider custom modal
        try {
            await axios.delete(`/api/partnerreview/${id}`);
            fetchReviews(); // Re-fetch reviews after deletion
            alert('Review deleted successfully!');
        } 
        // catch (err: any) {
        //     console.error('Error deleting review:', err);
        //     alert(err.response?.data?.message || 'Failed to delete review.');
        // }
         catch (err: unknown) {
                    console.error('Failed to fetch entry :', err);
                  
                    if (axios.isAxiosError(err)) {
                        setError(err.response?.data?.message || 'Failed to delete review.');
                          alert(err.response?.data?.message || 'Failed to delete review.');
                    } else if (err instanceof Error) {
                        setError(err.message || 'An unexpected error occurred.');
                    } else {
                        setError('An unknown error occurred.');
                    }
                }
    };

    const handleEdit = (id: string) => {
        // Navigate to the dedicated edit page for the specific review
        router.push(`/preferences/partner-review/modals/${id}`);
    };

    if (isLoading) return <p className="p-6 text-center text-gray-600">Loading reviews...</p>;
    if (error) return <p className="p-6 text-center text-red-600">Error: {error}</p>;

    return (
        <div className="p-6 max-w-5xl mx-auto font-sans">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-800">Partner Reviews</h1>
                <Link href="/preferences/partner-review/add-entry" passHref>
                    <Button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors">
                        Add New Review
                    </Button>
                </Link>
            </div>

            {/* ✅ Reviews Grid */}
            {reviews.length > 0 ? (
                <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3">
                    {reviews.map((review) => (
                        <div key={review._id} className="border rounded-lg p-4 flex flex-col gap-3 shadow-sm hover:shadow-md transition-shadow duration-200">
                            <h3 className="font-semibold text-lg text-gray-800">{review.title}</h3>
                            <a href={review.videoUrl} target="_blank" rel="noopener noreferrer" className="block relative w-full h-40 overflow-hidden rounded-md">
                                {/* Use Next.js Image component for optimization */}
                                <Image
                                    src={review.imageUrl}
                                    alt={review.title}
                                    layout="fill" // Fill the parent container
                                    objectFit="cover" // Cover the area, cropping if necessary
                                    className="rounded-md hover:opacity-90 transition-opacity duration-200"
                                    unoptimized={true} // Add unoptimized if the URL is not from a known image host
                                />
                            </a>
                            <div className="flex gap-2 mt-auto pt-3 border-t border-gray-100">
                                <button
                                    onClick={() => handleEdit(review._id)}
                                    className="text-yellow-500 border border-yellow-500 rounded-md p-2 hover:bg-yellow-500 hover:text-white transition-colors"
                                    aria-label={`Edit ${review.title}`}
                                >
                                    <PencilIcon size={16} />
                                </button>
                                <button
                                    onClick={() => deleteReview(review._id)}
                                    className="text-red-500 border border-red-500 rounded-md p-2 hover:bg-red-500 hover:text-white transition-colors"
                                    aria-label={`Delete ${review.title}`}
                                >
                                    <TrashBinIcon />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <p className="text-center text-gray-600 text-lg py-10">No partner reviews found. Add one above!</p>
            )}
        </div>
    );
};

export default PartnerReviewListPage;