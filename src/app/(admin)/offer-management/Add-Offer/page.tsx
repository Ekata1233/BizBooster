'use client';
export const dynamic = 'force-dynamic';
export const dynamicParams = true;

import React, { useEffect, useState } from 'react';
import dynamicImport from 'next/dynamic';
import { useSearchParams } from 'next/navigation';

// Dynamically import the component (no SSR)
const OfferComponent = dynamicImport(
  () => import('@/components/offer-component/OfferComponent'),
  { ssr: false }
);

const AddFormPage: React.FC = () => {
  const searchParams = useSearchParams();
  const [offerId, setOfferId] = useState<string | undefined>(undefined);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const id = searchParams.get('id') || searchParams.get('offerId') || undefined;
    setOfferId(id);
    setMounted(true);
  }, [searchParams]);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6 text-center">
        {offerId ? 'Edit Offer' : 'Add New Offer'}
      </h1>

      <div className="bg-white p-6 rounded shadow mb-10">
        {mounted && <OfferComponent offerIdToEdit={offerId} />}
      </div>
    </div>
  );
};

export default AddFormPage;
