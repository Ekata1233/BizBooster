'use client';

import React, { useEffect, useMemo, useState } from 'react';
import ComponentCard from '@/components/common/ComponentCard';
import PageBreadcrumb from '@/components/common/PageBreadCrumb';

/* =======================
   Types
======================= */

interface User {
  email?: string;
}

interface Review {
  _id: string;
  rating: number;
  comment: string;
  createdAt: string;
  user?: User;
}

interface PageProps {
  provider: {
    _id: string;
  };
}

type RatingCountsType = Record<
  'Excellent' | 'Good' | 'Average' | 'Below Average' | 'Poor',
  number
>;

/* =======================
   Helpers
======================= */

const getRatingLabel = (rating: number) => {
  if (rating >= 4.5) return 'Excellent';
  if (rating >= 3.5) return 'Good';
  if (rating >= 2.5) return 'Average';
  if (rating >= 1.5) return 'Below Average';
  return 'Poor';
};

const ratingLabels: Array<keyof RatingCountsType> = [
  'Excellent',
  'Good',
  'Average',
  'Below Average',
  'Poor',
];

/* =======================
   Page Component
======================= */

const Page: React.FC<PageProps> = ({ provider }) => {
  const providerId = provider._id;

  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /* =======================
     Fetch Reviews
  ======================= */

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/provider/review/${providerId}`);
        if (!res.ok) throw new Error('Failed to fetch reviews');
        const data = await res.json();
        setReviews(data.reviews || []);
      } catch (err: any) {
        setError(err.message || 'Something went wrong');
      } finally {
        setLoading(false);
      }
    };

    if (providerId) fetchReviews();
  }, [providerId]);

  /* =======================
     Rating Calculations
  ======================= */

  const { averageRating, ratingCounts, totalRatings } = useMemo(() => {
    const emptyCounts: RatingCountsType = {
      Excellent: 0,
      Good: 0,
      Average: 0,
      'Below Average': 0,
      Poor: 0,
    };

    if (!reviews.length) {
      return {
        averageRating: 0,
        ratingCounts: emptyCounts,
        totalRatings: 0,
      };
    }

    let total = 0;
    const counts = { ...emptyCounts };

    reviews.forEach((review) => {
      const label = getRatingLabel(review.rating);
      counts[label]++;
      total += review.rating;
    });

    return {
      averageRating: parseFloat((total / reviews.length).toFixed(2)),
      ratingCounts: counts,
      totalRatings: reviews.length,
    };
  }, [reviews]);

  /* =======================
     UI
  ======================= */

  return (
    <div className="p-4 space-y-6">
      <ComponentCard title="All Reviews" >

      {loading && (
        <div className="text-center text-blue-600 font-medium">
          Loading reviews...
        </div>
      )}

      {error && (
        <div className="text-center text-red-500 font-medium">
          Error loading reviews: {error}
        </div>
      )}

      {!loading && !error && (
        <>
          {/* =======================
              Review Summary
          ======================= */}

          <ComponentCard title="Review Summary">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Rating Graph */}
              <div className="space-y-4">
                {ratingLabels.map((label) => {
                  const count = ratingCounts[label];
                  const percent = totalRatings
                    ? (count / totalRatings) * 100
                    : 0;

                  return (
                    <div key={label} className="flex items-center space-x-3">
                      <div className="w-28 text-sm font-medium text-gray-700">
                        {label}
                      </div>
                      <div className="flex-1 bg-gray-200 h-2 rounded-full overflow-hidden">
                        <div
                          className="bg-blue-500 h-full transition-all duration-300"
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                      <div className="w-6 text-sm text-gray-600">
                        {count}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Rating Stats */}
              <div className="flex flex-col items-center justify-center space-y-2">
                <div className="flex items-center space-x-2">
                  <span className="text-yellow-500 text-3xl">★</span>
                  <span className="text-3xl font-bold text-gray-900">
                    {averageRating}
                  </span>
                  <span className="text-gray-500 text-lg">/ 5</span>
                </div>
                <div className="text-sm text-gray-600">
                  {totalRatings} Ratings
                </div>
                <div className="text-sm text-gray-600">
                  {reviews.length} Reviews
                </div>
              </div>
            </div>
          </ComponentCard>

          {/* =======================
              All Reviews
          ======================= */}

          <ComponentCard title="All Reviews">
            <div className="space-y-4">
              {reviews.map((review) => (
                <div
                  key={review._id}
                  className="rounded-lg border p-4 shadow-sm bg-white"
                >
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 rounded-full bg-gray-400 flex items-center justify-center text-white font-semibold">
                      {review.user?.email?.[0]?.toUpperCase() || 'U'}
                    </div>

                    <div className="flex-1 space-y-1">
                      <div className="flex justify-between items-center">
                        <p className="font-medium text-gray-900">
                          {review.user?.email || 'Anonymous'}
                        </p>
                        <span className="text-sm text-gray-500">
                          {new Date(review.createdAt).toLocaleDateString(
                            'en-GB',
                            {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric',
                            }
                          )}
                        </span>
                      </div>

                      <div className="flex items-center space-x-1 text-yellow-500">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <span key={i}>
                            {i < Math.round(review.rating) ? '★' : '☆'}
                          </span>
                        ))}
                        <span className="text-gray-700 text-sm ml-1">
                          {review.rating.toFixed(1)}
                        </span>
                      </div>

                      <p className="text-gray-700">{review.comment}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ComponentCard>
        </>
      )}
      </ComponentCard>
    </div>
  );
};

export default Page;
