"use client";

import React, { useEffect, useState } from 'react';
import { useAdvisor } from '@/context/Advisor';
import axios from 'axios';
import { useParams } from 'next/navigation'; // <-- Re-importing useParams
import Image from 'next/image';

type Advisor = {
  _id: string;
  name: string;
  imageUrl: string;
  tags: string[];
  language: string;
  rating: number;
  phoneNumber: number;
  chat: string;
};

// Renamed the component for clarity. This is now an AdvisorDetailsPage.
const AdvisorDetailsPage: React.FC = () => {
  // We need state to hold a single advisor object, not an array.
  const [advisor, setAdvisor] = useState<Advisor | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Get the id from the URL.
  const params = useParams();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;

  // Destructure fetchAdvisorById from the context.
  const { fetchAdvisorById } = useAdvisor();

  useEffect(() => {
    // Check if id is available before fetching.
    if (!id) {
      setIsLoading(false);
      setError('Advisor ID is missing.');
      return;
    }

    const loadAdvisor = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // Correctly call fetchAdvisorById with the id.
        const data = await fetchAdvisorById(id);
        
        // The data returned is a single advisor object.
        if (data) {
          setAdvisor(data);
        } else {
          setError('Advisor not found.');
          setAdvisor(null);
        }
      } catch (err: unknown) {
        console.error('Failed to fetch advisor:', err);
        if (axios.isAxiosError(err)) {
          setError(err.response?.data?.message || 'Failed to load advisor details.');
        } else if (err instanceof Error) {
          setError(err.message || 'An unexpected error occurred.');
        } else {
          setError('An unknown error occurred.');
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadAdvisor();
  }, [id, fetchAdvisorById]); // Dependency array includes id and the fetch function

  if (isLoading) return <div className="p-6">Loading advisor details...</div>;
  if (error) return <div className="p-6 text-red-500">{error}</div>;

  
  if (!advisor) {
    return <div className="p-6 text-gray-500">No advisor details available.</div>;
  }


  return (
    <div className="p-6 w-full mx-auto">
      <div className="flex flex-col md:flex-row items-center gap-8 p-6 border rounded-lg shadow-md bg-white">
        {/* Image with rating badge */}
        <div className="relative w-48 h-48 md:w-64 md:h-64 flex-shrink-0">
          <Image
            src={advisor.imageUrl}
            alt={advisor.name}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover rounded-lg"
            unoptimized
          />
          <div className="absolute bottom-2 right-2 bg-yellow-400 text-white text-lg font-semibold px-3 py-1 rounded">
            ⭐ {advisor.rating.toFixed(1)}
          </div>
        </div>

        {/* Info beside the image */}
        <div className="flex flex-col gap-2 w-full">
          <h1 className="text-3xl font-bold">{advisor.name}</h1>
          <p className="text-md text-gray-600">📞 <span className="font-medium">{advisor.phoneNumber}</span></p>
          <p className="text-md text-gray-600">💬 <span className="font-medium">{advisor.chat}</span></p>
          <p className="text-md text-gray-600">🌐 <span className="font-medium">{advisor.language}</span></p>

          {/* Tags */}
          {advisor.tags?.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-4">
              {advisor.tags.map((tag, index) => (
                <span
                  key={index}
                  className="bg-gray-100 text-gray-700 text-sm px-3 py-1 rounded-full font-medium"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdvisorDetailsPage;