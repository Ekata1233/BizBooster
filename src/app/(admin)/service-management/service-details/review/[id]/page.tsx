'use client';

import React, { useEffect, useMemo } from 'react';
import { useParams } from 'next/navigation';
import { useReview } from '@/context/ReviewContext';
import ComponentCard from '@/components/common/ComponentCard';
import PageBreadcrumb from '@/components/common/PageBreadCrumb';

const getRatingLabel = (rating: number) => {
  if (rating >= 4.5) return 'Excellent';
  if (rating >= 3.5) return 'Good';
  if (rating >= 2.5) return 'Average';
  if (rating >= 1.5) return 'Below Average';
  return 'Poor';
};

const ratingLabels = ['Excellent', 'Good', 'Average', 'Below Average', 'Poor'];

const Page = () => {
  const { reviews, fetchReviews, loading, error } = useReview();
  const params = useParams();
  const serviceId = params.id as string;

  useEffect(() => {
    if (serviceId) {
      fetchReviews(serviceId);
    }
  }, [serviceId]);

  const { averageRating, ratingCounts, totalRatings } = useMemo(() => {
    if (!reviews.length)
      return { averageRating: 0, ratingCounts: {}, totalRatings: 0 };

    const counts: Record<string, number> = {
      Excellent: 0,
      Good: 0,
      Average: 0,
      'Below Average': 0,
      Poor: 0,
    };

    let total = 0;

    reviews.forEach((review) => {
      const label = getRatingLabel(review.rating);
      counts[label]++;
      total += review.rating;
    });

    return {
      averageRating: (total / reviews.length).toFixed(2),
      ratingCounts: counts,
      totalRatings: reviews.length,
    };
  }, [reviews]);

  return (
    <div className="p-4 space-y-6">
      <PageBreadcrumb pageTitle="All Reviews" />

      {/* Loading State */}
      {loading && (
        <div className="text-center text-blue-600 font-medium">Loading reviews...</div>
      )}

      {/* Error State */}
      {error && (
        <div className="text-center text-red-500 font-medium">
          Error loading reviews: {error}
        </div>
      )}

      {/* Render only when not loading and no error */}
      {!loading && !error && (
        <>
          {/* Rating Overview */}
          <ComponentCard title="Review Summary">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Left: Rating Graph */}
              <div className="space-y-4">
                {ratingLabels.map((label) => {
                  const count = ratingCounts[label] || 0;
                  const percent = reviews.length ? (count / reviews.length) * 100 : 0;
                  return (
                    <div key={label} className="flex items-center space-x-3">
                      <div className="w-28 text-sm font-medium text-gray-700">{label}</div>
                      <div className="flex-1 bg-gray-200 h-2 rounded-full overflow-hidden">
                        <div
                          className="bg-blue-500 h-full rounded-full transition-all duration-300"
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                      <div className="w-6 text-sm text-gray-600">{count}</div>
                    </div>
                  );
                })}
              </div>

              {/* Right: Rating Stats */}
              <div className="flex flex-col items-center justify-center space-y-2">
                <div className="flex items-center space-x-2">
                  <span className="text-yellow-500 text-3xl">★</span>
                  <span className="text-3xl font-bold text-gray-900">{averageRating}</span>
                  <span className="text-gray-500 text-lg">/ 5</span>
                </div>
                <div className="text-sm text-gray-600">{totalRatings} Ratings</div>
                <div className="text-sm text-gray-600">{reviews.length} Reviews</div>
              </div>
            </div>
          </ComponentCard>

          {/* Review Cards */}
          <ComponentCard title="All Reviews">
            <div className="space-y-4">
              {reviews.map((review) => (
                <div
                  key={review._id}
                  className="rounded-lg border border-gray-200 p-4 shadow-sm bg-white"
                >
                  <div className="flex items-start space-x-4">
                    {/* Avatar Placeholder */}
                    <div className="w-12 h-12 rounded-full bg-gray-300 flex items-center justify-center font-semibold text-white text-lg">
                      {review.user?.email?.[0]?.toUpperCase() || 'U'}
                    </div>

                    <div className="flex-1 space-y-1">
                      <div className="flex justify-between items-center">
                        <p className="font-medium text-gray-900">
                          {review.user?.email || 'Anonymous'}
                        </p>
                        <span className="text-sm text-gray-500">
                          {new Date(review.createdAt).toLocaleDateString('en-GB', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </span>
                      </div>

                      {/* Star rating using Unicode */}
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
    </div>
  );
};

export default Page;
