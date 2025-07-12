// 'use client';

// import React, { createContext, useContext, useEffect, useState } from 'react';
// import axios from 'axios';

// type Review = {
//   _id: string;
//   service: string;
//   user: {
//     _id: string;
//     email: string;
//   };
//   rating: number;
//   comment: string;
//   createdAt: string;
//   updatedAt?: string;
// };

// interface ReviewContextType {
//   reviews: Review[];
//   fetchReviews: (serviceId: string) => Promise<void>;
// }

// const ReviewContext = createContext<ReviewContextType | null>(null);

// export const ReviewProvider = ({ children }: { children: React.ReactNode }) => {
//   const [reviews, setReviews] = useState<Review[]>([]);

//   const fetchReviews = async (serviceId: string) => {
//     try {
//       const res = await axios.get(`/api/service/review/${serviceId}`);
//       setReviews(res.data.reviews || []); // Adjust based on your API response structure
//     } catch (err) {
//       console.error('Error fetching reviews:', err);
//     }
//   };

//   return (
//     <ReviewContext.Provider value={{ reviews, fetchReviews }}>
//       {children}
//     </ReviewContext.Provider>
//   );
// };

// export const useReview = () => {
//   const context = useContext(ReviewContext);
//   if (!context) {
//     throw new Error('useReview must be used within a ReviewProvider');
//   }
//   return context;
// };

'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import axios from 'axios';

type Review = {
  _id: string;
  service: string;
  user: {
    _id: string;
    email: string;
  };
  rating: number;
  comment: string;
  createdAt: string;
  updatedAt?: string;
};

interface ReviewContextType {
  reviews: Review[];
  loading: boolean;
  error: string | null;
  fetchReviews: (serviceId: string) => Promise<void>;
}

const ReviewContext = createContext<ReviewContextType | null>(null);

export const ReviewProvider = ({ children }: { children: React.ReactNode }) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchReviews = async (serviceId: string) => {
    setLoading(true);
    setError(null);

    try {
      const res = await axios.get(`/api/service/review/${serviceId}`);
      setReviews(res.data.reviews || []);
    } catch (err: any) {
      console.error('Error fetching reviews:', err);
      setError(err?.response?.data?.message || 'Failed to fetch reviews');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ReviewContext.Provider value={{ reviews, loading, error, fetchReviews }}>
      {children}
    </ReviewContext.Provider>
  );
};

export const useReview = () => {
  const context = useContext(ReviewContext);
  if (!context) {
    throw new Error('useReview must be used within a ReviewProvider');
  }
  return context;
};

