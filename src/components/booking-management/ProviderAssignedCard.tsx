import React, { useEffect, useState } from 'react';
import { useProvider } from '@/context/ProviderContext';
import { Provider } from '@/context/ProviderContext';
import { Checkout, useCheckout } from '@/context/CheckoutContext';

interface Props {
  serviceId: string;
  checkoutId: string;
}

function ProviderAssignedCard({ serviceId, checkoutId }: Props) {
  const { getProvidersByServiceId, getProviderById } = useProvider(); // ⬅️ assume you have this function
  const { updateCheckout, fetchCheckoutById } = useCheckout();
  const [providers, setProviders] = useState<Provider[]>([]);
  const [assignedProvider, setAssignedProvider] = useState<Provider | null>(null); // ⬅️ NEW
  const [providerId, setProviderId] = useState<string>('');
  const [checkoutDetails, setCheckoutDetails] = useState<Checkout | null>(null);
  const [showAll, setShowAll] = useState(false);
  const [loading, setLoading] = useState(false);


  useEffect(() => {

    if (checkoutId && serviceId) {
      fetchCheckout(); // ⬅️ initial call
    }
  }, [checkoutId, serviceId]);

  const fetchCheckout = async () => {
    setLoading(true);
    const data = await fetchCheckoutById(checkoutId);
    console.log("chekcout details : : ", data)
    if (data) {
      setCheckoutDetails(data);
      if (data.provider) {
        // const providerData = await getProviderById(data.provider); 
        const providerId =
          typeof data.provider === 'string' ? data.provider : data.provider._id;
        const providerData = await getProviderById(providerId);

        setAssignedProvider(providerData);
      } else {
        const result = await getProvidersByServiceId(serviceId); // ⬅️ load provider list
        setProviders(result);
      }
    }
    setLoading(false);
  };

  const handleAssign = async () => {
    if (!providerId) {
      alert('Please select a provider');
      return;
    }

    try {
      setLoading(true);
      await updateCheckout(checkoutId, { provider: providerId });
      alert('Provider assigned successfully');
      await fetchCheckout();
    } catch (error) {
      console.error('Error assigning provider:', error);
      alert('Failed to assign provider');
    } finally {
      setLoading(false);
    }
  };

  const displayedProviders = showAll ? providers : providers.slice(0, 2);

  console.log("assignedProvider ", assignedProvider);
  console.log("displayedProviders ", assignedProvider);



  if (!serviceId || !checkoutId) return <div>Loading...</div>;
  if (!checkoutDetails) return <div>No provider details found.</div>;

  return (
    <div className="px-8 py-6 bg-gray-100 mt-3 rounded-xl">
      <h4 className="text-lg font-semibold text-gray-800 dark:text-white">Provider Info</h4>
      <hr className="my-4 border-gray-300 dark:border-gray-700" />

      {/* ✅ Case 1: Already assigned provider */}
      {assignedProvider && (
        <div className="flex items-center gap-5 mb-6">
          <img
            src={assignedProvider.storeInfo?.logo || "/default-profile.png"}
            alt={assignedProvider.fullName}
            className="w-14 h-14 rounded-full object-cover border border-gray-300"
          />
          <div className="space-y-1">
            <p className="text-sm text-gray-700 dark:text-gray-200">
              <strong>Name:</strong> {assignedProvider.fullName}
            </p>
            <p className="text-sm text-gray-700 dark:text-gray-200">
              <strong>Phone:</strong> {assignedProvider.phoneNo || 'N/A'}
            </p>
            <p className="text-sm text-gray-700 dark:text-gray-200">
              <strong>Address:</strong> {assignedProvider?.storeInfo?.address || 'N/A'}
            </p>
          </div>
        </div>
      )}

      {/* ❌ Case 2: No assigned provider, show list with checkbox */}
      {!assignedProvider &&
        displayedProviders.map((provider, index) => (
          <div key={index} className="flex items-center gap-5 mb-6">
            <div className="flex flex-col items-center gap-2">
              <input
                type="checkbox"
                checked={providerId === provider._id}
                onChange={() => setProviderId(provider._id)}
                className="form-checkbox h-5 w-5 text-blue-600"
              />
              
              <img
                src={provider.storeInfo?.logo || "/default-profile.png"}
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
                <strong>Address:</strong> {provider?.storeInfo?.address || 'N/A'}
              </p>
            </div>
          </div>
        )
        
        )}

      {/* Show More Button */}
      {!assignedProvider && !showAll && providers.length > 2 && (
        <button
          onClick={() => setShowAll(true)}
          className="text-blue-600 hover:underline text-sm mt-2"
        >
          Show More
        </button>
      )}

      {/* Assign Button */}
      {!assignedProvider && (
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
      )}
    </div>
  );
}

export default ProviderAssignedCard;





