'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import axios from 'axios';
import Image from 'next/image';

import PageBreadcrumb from '@/components/common/PageBreadCrumb';
import ComponentCard from '@/components/common/ComponentCard';

type AdDetail = {
  _id: string;
  addType: string;
  title: string;
  description: string;
  fileUrl: string;
  startDate: string;
  endDate: string;
  provider: {
    fullName: string;
    storeInfo: { logo: string };
  };
  category: { name: string };
  service: { serviceName: string };
};

const AdDetailPage: React.FC = () => {
  const { id } = useParams();
  const [ad, setAd] = useState<AdDetail | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchAd = async () => {
    try {
      const res = await axios.get(`/api/ads/${id}`);
      if (res.data.success) {
        setAd(res.data.data);
      }
    } catch (error) {
      console.error('Error fetching ad:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAd();
  }, [id]);

  if (loading) return <div className="p-4">Loading...</div>;
  if (!ad) return <div className="p-4 text-red-500">Ad not found.</div>;

  return (
    <div>
      <PageBreadcrumb pageTitle="Advertisement Details" />

      {/* Card 1: Image + Title + Description */}
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
              <h2 className="text-lg font-semibold">Provider:</h2>
              <p className="text-gray-700">{ad.provider?.fullName || 'N/A'}</p>
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

            {ad.provider?.storeInfo?.logo && (
              <div>
                <h2 className="text-lg font-semibold">Store Logo:</h2>
                <Image
                  src={ad.provider.storeInfo.logo}
                  alt="Store Logo"
                  width={100}
                  height={100}
                  className="rounded border mt-2"
                />
              </div>
            )}
          </div>
        </ComponentCard>
      </div>
    </div>
  );
};

export default AdDetailPage;
