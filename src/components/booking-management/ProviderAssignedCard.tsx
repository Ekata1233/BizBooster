// import React, { useEffect, useState } from 'react';
// import { useProvider } from '@/context/ProviderContext';
// import { Provider } from '@/context/ProviderContext';
// import { Checkout, useCheckout } from '@/context/CheckoutContext';

// interface Props {
//   serviceId: string;
//   checkoutId: string;
// }

// function ProviderAssignedCard({ serviceId, checkoutId }: Props) {
//   const { getProvidersByServiceId, getProviderById } = useProvider(); // ⬅️ assume you have this function
//   const { updateCheckout, fetchCheckoutById } = useCheckout();
//   const [providers, setProviders] = useState<Provider[]>([]);
//   const [assignedProvider, setAssignedProvider] = useState<Provider | null>(null); // ⬅️ NEW
//   const [providerId, setProviderId] = useState<string>('');
//   const [checkoutDetails, setCheckoutDetails] = useState<Checkout | null>(null);
//   const [showAll, setShowAll] = useState(false);
//   const [loading, setLoading] = useState(false);

//   console.log("privdidfdf f  : ", providers)

//   useEffect(() => {

//     if (checkoutId && serviceId) {
//       fetchCheckout(); // ⬅️ initial call
//     }
//   }, [checkoutId, serviceId]);

//   const fetchCheckout = async () => {
//     setLoading(true);
//     const data = await fetchCheckoutById(checkoutId);
//     if (data) {
//       setCheckoutDetails(data);
//       // Check if already assigned
//       if (data.provider) {
//         // const providerData = await getProviderById(data.provider); // ⬅️ fetch assigned provider
//         // setAssignedProvider(providerData);
//       } else {
//         const result = await getProvidersByServiceId(serviceId); // ⬅️ load provider list
//         setProviders(result);
//       }
//     }
//     setLoading(false);
//   };

//   const handleAssign = async () => {
//     if (!providerId) {
//       alert('Please select a provider');
//       return;
//     }

//     try {
//       setLoading(true);
//       // await updateCheckout(checkoutId, { provider: providerId });
//       alert('Provider assigned successfully');
//       await fetchCheckout();
//     } catch (error) {
//       console.error('Error assigning provider:', error);
//       alert('Failed to assign provider');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const displayedProviders = showAll ? providers : providers.slice(0, 2);

//   if (!serviceId || !checkoutId) return <div>Loading...</div>;
//   if (!checkoutDetails) return <div>No provider details found.</div>;

//   return (
//     <div className="px-8 py-6 bg-gray-100 mt-3 rounded-xl">
//       <h4 className="text-lg font-semibold text-gray-800 dark:text-white">Provider Info</h4>
//       <hr className="my-4 border-gray-300 dark:border-gray-700" />

//       {/* ✅ Case 1: Already assigned provider */}
//       {assignedProvider && (
//         <div className="flex items-center gap-5 mb-6">
//           <img
//             src={(assignedProvider as any).generalImage || "/default-profile.png"}
//             alt={assignedProvider.fullName}
//             className="w-14 h-12 rounded-full object-cover border border-gray-300"
//           />
//           <div className="space-y-1">
//             <p className="text-sm text-gray-700 dark:text-gray-200">
//               <strong>Name:</strong> {assignedProvider.fullName}
//             </p>
//             <p className="text-sm text-gray-700 dark:text-gray-200">
//               <strong>Phone:</strong> {assignedProvider.phoneNo || 'N/A'}
//             </p>
//             <p className="text-sm text-gray-700 dark:text-gray-200">
//               <strong>Address:</strong> {assignedProvider?.storeInfo?.address || 'N/A'}
//             </p>
//           </div>
//         </div>
//       )}

//       {/* ❌ Case 2: No assigned provider, show list with checkbox */}
//       {!assignedProvider &&
//         displayedProviders.map((provider, index) => (
//           <div key={index} className="flex items-center gap-5 mb-6">
//             <div className="flex flex-col items-center gap-2">
//               <input
//                 type="checkbox"
//                 checked={providerId === provider._id}
//                 onChange={() => setProviderId(provider._id)}
//                 className="form-checkbox h-5 w-5 text-blue-600"
//               />
//               <img
//                 src={(provider as any).generalImage || "/default-profile.png"}
//                 alt={provider.fullName}
//                 className="w-14 h-12 rounded-full object-cover border border-gray-300"
//               />
//             </div>
//             <div className="space-y-1">
//               <p className="text-sm text-gray-700 dark:text-gray-200">
//                 <strong>Name:</strong> {provider.fullName}
//               </p>
//               <p className="text-sm text-gray-700 dark:text-gray-200">
//                 <strong>Phone:</strong> {provider.phoneNo || 'N/A'}
//               </p>
//               <p className="text-sm text-gray-700 dark:text-gray-200">
//                 <strong>Address:</strong> {provider?.storeInfo?.address || 'N/A'}
//               </p>
//             </div>
//           </div>
//         ))}

//       {/* Show More Button */}
//       {!assignedProvider && !showAll && providers.length > 2 && (
//         <button
//           onClick={() => setShowAll(true)}
//           className="text-blue-600 hover:underline text-sm mt-2"
//         >
//           Show More
//         </button>
//       )}

//       {/* Assign Button */}
//       {!assignedProvider && (
//         <div className="text-center">
//           <button
//             onClick={handleAssign}
//             disabled={loading}
//             className={`bg-blue-500 text-white px-7 my-3 py-2 rounded-md transition duration-200 ${loading ? 'bg-blue-400 cursor-not-allowed' : 'hover:bg-blue-600'
//               }`}
//           >
//             {loading ? 'Assigning...' : 'Assign Provider'}
//           </button>
//         </div>
//       )}
//     </div>
//   );
// }

// export default ProviderAssignedCard;



'use client';

import React, { useEffect, useState } from 'react';
import { useProvider } from '@/context/ProviderContext';
import { Provider } from '@/context/ProviderContext';
import { useCheckout } from '@/context/CheckoutContext';

interface Props {
  serviceId: string;
  checkoutId: string;
}


function ProviderAssignedCard({ serviceId, checkoutId }: Props) {
  const { getProvidersByServiceId } = useProvider();
  const { updateCheckout } = useCheckout();
  const [providers, setProviders] = useState<Provider[]>([]);
  const [providerId, setProviderId] = useState<string>('');
  const [showAll, setShowAll] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchProviders = async () => {
      if (!serviceId) return;
      const result = await getProvidersByServiceId(serviceId);
      setProviders(result);
    };

    fetchProviders();
  }, [serviceId]);

  const handleAssign = async () => {
    if (!providerId) {
      alert('Please select a provider');
      return;
    }

    try {
      setLoading(true);
      await updateCheckout(checkoutId, { provider: providerId });
      alert('Provider assigned successfully');
    } catch (error) {
      console.error('Error assigning provider:', error);
      alert('Failed to assign provider');
    } finally {
      setLoading(false); // ⬅️ Stop loading
    }
  };

  const displayedProviders = showAll ? providers : providers.slice(0, 2);

  if (!serviceId || !checkoutId) return <div>Loading...</div>;

  return (
    <div className="px-8 py-6 bg-gray-100 mt-3 rounded-xl">
      <h4 className="text-lg font-semibold text-gray-800 dark:text-white">Provider Info</h4>
      <hr className="my-4 border-gray-300 dark:border-gray-700" />

      {displayedProviders.map((provider, index) => (
        <div key={index} className="flex items-center gap-5 mb-6">
          <div className="flex flex-col items-center gap-2">
            <input
              type="checkbox"
              checked={providerId === provider._id}
              onChange={() => setProviderId(provider._id)}
              className="form-checkbox h-5 w-5 text-blue-600"
            />
            <img
              src={(provider as any).generalImage || "/default-profile.png"}
              alt={provider.fullName}
              className="w-14 h-12 rounded-full object-cover border border-gray-300"
            />
          </div>
          <div className="space-y-1">
            <p className="text-sm text-gray-700 dark:text-gray-200">
              <strong>Name:</strong> {provider.fullName}
            </p>
            <p className="text-sm text-gray-700 dark:text-gray-200">
              <strong>Phone:</strong> {provider.phoneNo || 'N/A'}
            </p>
            <p className="text-sm text-gray-700 dark:text-gray-200">
              <strong>Address:</strong>{' '}
              {provider?.storeInfo?.address || 'N/A'}
            </p>
          </div>
        </div>
      ))}

      {!showAll && providers.length > 2 && (
        <button
          onClick={() => setShowAll(true)}
          className="text-blue-600 hover:underline text-sm mt-2"
        >
          Show More
        </button>
      )}

      <div className="text-center">
        <button
          onClick={handleAssign}
          disabled={loading}
          className={`bg-blue-500 text-white px-7 my-3 py-2 rounded-md transition duration-200 ${loading ? 'bg-blue-400 cursor-not-allowed' : 'hover:bg-blue-600'
            }`}
        >
          {loading ? 'Assigning...' : 'Assign Provider'}
        </button>
      </div>
    </div>
  );
}

export default ProviderAssignedCard;

