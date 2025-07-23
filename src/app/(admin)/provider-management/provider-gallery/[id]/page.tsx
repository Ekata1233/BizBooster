'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useProvider } from '@/context/ProviderContext';
import PageBreadcrumb from '@/components/common/PageBreadCrumb';
import ComponentCard from '@/components/common/ComponentCard';

const ViewProviderGalleryPage = () => {
  const { id } = useParams();
  const { providerDetails } = useProvider();
  const [galleryImages, setGalleryImages] = useState<string[]>([]);
useEffect(() => {
  if (id && providerDetails!.length > 0) {
    const provider = providerDetails!.find((p) => p._id === id);
    if (provider) {
      setGalleryImages(provider.galleryImages || []);
    }
  }
}, [id, providerDetails]);


  return (
    <div className="p-4">
      <PageBreadcrumb pageTitle="Provider Gallery View" />
      <ComponentCard title="Gallery Images">
        {galleryImages.length === 0 ? (
          <p className="text-center text-gray-500 py-10">No images found.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {galleryImages.map((img, i) => (
              <img
                key={i}
                src={img}
                alt={`Gallery ${i + 1}`}
                className="w-full h-48 object-cover rounded shadow"
              />
            ))}
          </div>
        )}
      </ComponentCard>
    </div>
  );
};

export default ViewProviderGalleryPage;
