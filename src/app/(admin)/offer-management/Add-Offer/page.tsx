// 'use client';
// export const dynamic = 'force-dynamic';
// export const dynamicParams = true;

// import React from 'react';
// import dynamicImport from 'next/dynamic';
// import { useSearchParams } from 'next/navigation';

// const OfferComponent = dynamicImport(() => import('@/components/offer-component/OfferComponent'), {
//   ssr: false,
// });

// const AddFormPage: React.FC = () => {
//   const searchParams = useSearchParams();

//   const offerId =
//     searchParams.get('id') || searchParams.get('offerId') || undefined;

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

// export default AddFormPage;

// // import React from 'react'

// // function page() {
// //   return (
// //     <div>page</div>
// //   )
// // }

// // export default page

import React from 'react'

const page = () => {
  return (
    <div>page</div>
  )
}

export default page