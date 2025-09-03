'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';

import PageBreadcrumb from '@/components/common/PageBreadCrumb';
import ComponentCard from '@/components/common/ComponentCard';
import { useAdContext } from '@/context/AdContext';

interface AdType {
  _id: string;
  title: string;
  description: string;
  fileUrl: string;
  addType: string;
  category?: {
    _id?: string;   // 👈 make optional
    name: string;
  };
  service?: {
    _id?: string;   // 👈 make optional
    serviceName: string;
  };
  provider?: string;
  startDate?: string;
  endDate?: string;
  isApproved?: boolean;
  isExpired?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

const AdDetailsPage = () => {
  const { id } = useParams();
  const { ads } = useAdContext();

  const [ad, setAd] = useState<AdType | null>(null);

  useEffect(() => {
    if (id && ads.length > 0) {
      const found = ads.find((a) => a._id === id);
      if (found) setAd(found);
    }
  }, [id, ads]);

  if (!ad) return <div className="p-4">Loading...</div>;

  return (
    <div>
      <PageBreadcrumb pageTitle="Advertisement Details" />

      {/* Card 1: Image + Title */}
      <div className="my-5">
        <ComponentCard title="Ad Overview">
          <div className="flex flex-col md:flex-row items-start gap-6">
            {ad.fileUrl ? (
              <Image
                src={ad.fileUrl}
                alt="Ad Image"
                width={200}
                height={200}
                className="object-cover rounded border"
              />
            ) : (
              <div className="w-[200px] h-[200px] flex items-center justify-center border rounded text-gray-500 text-sm">
                No Image
              </div>
            )}

            <div>
              <h2 className="text-lg font-semibold">Title:</h2>
              <p className="text-gray-700 mt-1">{ad.title}</p>

              <h2 className="text-lg font-semibold mt-4">Description:</h2>
              <p className="text-gray-700 mt-1">{ad.description || 'N/A'}</p>
            </div>
          </div>
        </ComponentCard>
      </div>

      {/* Card 2: Other Details */}
      <div className="my-5">
        <ComponentCard title="Additional Info">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h2 className="text-lg font-semibold">Category:</h2>
              <p className="text-gray-700">{ad.category?.name || 'N/A'}</p>
            </div>

            <div>
              <h2 className="text-lg font-semibold">Service:</h2>
              <p className="text-gray-700">{ad.service?.serviceName || 'N/A'}</p>
            </div>

            <div>
              <h2 className="text-lg font-semibold">Provider ID:</h2>
              <p className="text-gray-700">{ad.provider || 'N/A'}</p>
            </div>

            <div>
              <h2 className="text-lg font-semibold">Ad Type:</h2>
              <p className="text-gray-700 capitalize">{ad.addType || 'N/A'}</p>
            </div>

            <div>
              <h2 className="text-lg font-semibold">Start Date:</h2>
              <p className="text-gray-700">
                {ad.startDate ? new Date(ad.startDate).toLocaleDateString() : 'N/A'}
              </p>
            </div>

            <div>
              <h2 className="text-lg font-semibold">End Date:</h2>
              <p className="text-gray-700">
                {ad.endDate ? new Date(ad.endDate).toLocaleDateString() : 'N/A'}
              </p>
            </div>

            <div>
              <h2 className="text-lg font-semibold">Status:</h2>
              <p
                className={`px-3 py-1 rounded-full text-sm font-semibold inline-block ${
                  ad.isApproved
                    ? 'text-green-600 bg-green-100 border border-green-300'
                    : 'text-yellow-600 bg-yellow-100 border border-yellow-300'
                }`}
              >
                {ad.isApproved ? 'Approved' : 'Pending'}
              </p>
            </div>

            <div>
              <h2 className="text-lg font-semibold">Expired:</h2>
              <p className="text-gray-700">{ad.isExpired ? 'Yes' : 'No'}</p>
            </div>

            <div>
              <h2 className="text-lg font-semibold">Created At:</h2>
              <p className="text-gray-700">
                {ad.createdAt ? new Date(ad.createdAt).toLocaleString() : 'N/A'}
              </p>
            </div>

            <div>
              <h2 className="text-lg font-semibold">Updated At:</h2>
              <p className="text-gray-700">
                {ad.updatedAt ? new Date(ad.updatedAt).toLocaleString() : 'N/A'}
              </p>
            </div>
          </div>
        </ComponentCard>
      </div>
    </div>
  );
};

export default AdDetailsPage;
