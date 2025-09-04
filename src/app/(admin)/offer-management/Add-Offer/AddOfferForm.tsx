// 'use client';

// import React, { useEffect, useState } from 'react';
// import dynamicImport from 'next/dynamic';
// import { useSearchParams } from 'next/navigation';

// // Dynamically import the component (no SSR)
// const OfferComponent = dynamicImport(
//   () => import('@/components/offer-component/OfferComponent'),
//   { ssr: false }
// );

// const AddOfferForm: React.FC = () => {
//   const searchParams = useSearchParams();
//   const [offerId, setOfferId] = useState<string | undefined>(undefined);

//   useEffect(() => {
//     // This logic now runs safely on the client
//     const id = searchParams.get('id') || searchParams.get('offerId') || undefined;
//     setOfferId(id);
//   }, [searchParams]);

//   return (
//     <div className="container mx-auto px-4 py-8">
//       <h1 className="text-3xl font-bold mb-6 text-center">
//         {offerId ? 'Edit Offer' : 'Add New Offer'}
//       </h1>

//       <div className="bg-white p-6 rounded shadow mb-10">

//         <OfferComponent offerIdToEdit={offerId} />
//       </div>
//     </div>
//   );
// };

// export default AddOfferForm;






'use client';

import React, { useEffect, useState, Suspense } from 'react';
import dynamic from 'next/dynamic';
import { useSearchParams } from 'next/navigation';
import PageBreadcrumb from '@/components/common/PageBreadCrumb';

// Loading component for suspense fallback
const LoadingSpinner = () => (
  <div className="flex justify-center items-center h-64">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
  </div>
);

// Dynamically import the main component with no SSR
const OfferComponent = dynamic(
  () => import('@/components/offer-component/OfferComponent'),
  {
    ssr: false,
    loading: () => <LoadingSpinner />
  }
);

// Main form component that uses searchParams
const AddOfferFormContent: React.FC = () => {
  const searchParams = useSearchParams();
  const [offerId, setOfferId] = useState<string | undefined>(undefined);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    // Get offer ID from URL parameters
    const id = searchParams.get('id') || undefined;
    setOfferId(id);
  }, [searchParams]);

  if (!isClient) {
    return <LoadingSpinner />;
  }

  return (
    <div className="container mx-auto px-4 ">
      <PageBreadcrumb pageTitle={offerId ? "Edit Offer" : "Add New Offer"} />


      <div className="bg-white rounded-lg shadow-md">
        <OfferComponent offerIdToEdit={offerId} />
      </div>
    </div>
  );
};

// Wrap the component that uses useSearchParams in Suspense
const AddOfferForm: React.FC = () => {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <AddOfferFormContent />
    </Suspense>
  );
};

export default AddOfferForm;