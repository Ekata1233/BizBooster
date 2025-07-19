'use client';

import React from 'react';
import { useSearchParams } from 'next/navigation';
import OfferComponent from '@/components/offer-component/OfferComponent';

const AddFormPage: React.FC = () => {
  const searchParams = useSearchParams();

  // Accept both ?id= and ?offerId=
  const offerId =
    searchParams.get('id') ||
    searchParams.get('offerId') ||
    undefined;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6 text-center">
        {offerId ? 'Edit Offer' : 'Add New Offer'}
      </h1>

      <div className="bg-white p-6 rounded shadow mb-10">
        <OfferComponent offerIdToEdit={offerId} />
      </div>
    </div>
  );
};

export default AddFormPage;
