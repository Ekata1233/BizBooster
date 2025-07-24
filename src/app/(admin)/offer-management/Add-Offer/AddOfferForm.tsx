'use client';

import React, { useEffect, useState } from 'react';
import dynamicImport from 'next/dynamic';
import { useSearchParams } from 'next/navigation';

// Dynamically import the component (no SSR)
const OfferComponent = dynamicImport(
  () => import('@/components/offer-component/OfferComponent'),
  { ssr: false }
);

const AddOfferForm: React.FC = () => {
  const searchParams = useSearchParams();
  const [offerId, setOfferId] = useState<string | undefined>(undefined);

  useEffect(() => {
    // This logic now runs safely on the client
    const id = searchParams.get('id') || searchParams.get('offerId') || undefined;
    setOfferId(id);
  }, [searchParams]);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6 text-center">
        {offerId ? 'Edit Offer' : 'Add New Offer'}
      </h1>

      <div className="bg-white p-6 rounded shadow mb-10">
        {/* You may not even need the 'mounted' check anymore with this pattern */}
        <OfferComponent offerIdToEdit={offerId} />
      </div>
    </div>
  );
};

export default AddOfferForm;