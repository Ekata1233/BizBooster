// import React, { useEffect } from 'react';

// type CustomerInfo = {
//   fullName: string;
//   phone: string;
//   address: string;
//   city: string;
//   state: string;
// };

// type CustomerInfoCardProps = {
//   serviceCustomer: CustomerInfo | null;
//   loading: boolean;
//   error: string | null;
// };

// const CustomerInfoCard = ({ serviceCustomer,singleUser, loading, error }: CustomerInfoCardProps) => {

//   console.log("single user : ", singleUser);
//   useEffect(() => {
//   }, [serviceCustomer]);

//   return (
//     <div className="px-8 py-6 bg-gray-100 rounded-xl">
//       <h4 className="text-lg font-semibold text-gray-800 dark:text-white">Customer Information</h4>
//       <hr className="my-4 border-gray-300 dark:border-gray-700" />
//       {loading && <p className="text-sm text-gray-600 dark:text-gray-400">Loading customer info...</p>}
//       {error && <p className="text-sm text-red-600 dark:text-red-400">Error: {error}</p>}
//       {serviceCustomer && (
//         <div className="flex items-center gap-5">
//           <div className="space-y-1">
//             <p className="text-sm text-gray-700 dark:text-gray-200"><strong>Name:</strong> {serviceCustomer.fullName}</p>
//             <p className="text-sm text-gray-700 dark:text-gray-200"><strong>Phone:</strong> {serviceCustomer.phone}</p>
//             <p className="text-sm text-gray-700 dark:text-gray-200">
//               <strong>Address:</strong> {serviceCustomer.address}, {serviceCustomer.city}, {serviceCustomer.state}
//             </p>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default CustomerInfoCard;



import React from 'react';

type CustomerInfo = {
  fullName: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  mobileNumber: string;
};

type CustomerInfoCardProps = {
  serviceCustomer: CustomerInfo | null;
   singleUser?: CustomerInfo | null;
  loading: boolean;
  error: string | null;
};

const CustomerInfoCard = ({
  serviceCustomer,
  singleUser,
  loading,
  error,
}: CustomerInfoCardProps) => {
  // Prefer serviceCustomer, fallback to singleUser
  const customerData = serviceCustomer ?? singleUser;

  // Show error ONLY if no data exists
  const showError = !loading && !customerData && error;

  console.log('serviceCustomer:', serviceCustomer);
  console.log('singleUser:', singleUser);
  console.log('error:', error);

  return (
    <div className="px-8 py-6 bg-gray-100 rounded-xl">
      <h4 className="text-lg font-semibold text-gray-800 dark:text-white">
        Customer Information
      </h4>

      <hr className="my-4 border-gray-300 dark:border-gray-700" />

      {/* Loading */}
      {loading && (
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Loading customer info...
        </p>
      )}

      {/* Error (only if no data) */}
      {showError && (
        <p className="text-sm text-red-600 dark:text-red-400">
          Error: {error}
        </p>
      )}

      {/* Customer Data */}
      {!loading && customerData && (
        <div className="flex items-center gap-5">
          <div className="space-y-1">
            <p className="text-sm text-gray-700 dark:text-gray-200">
              <strong>Name:</strong> {customerData.fullName}
            </p>

            <p className="text-sm text-gray-700 dark:text-gray-200">
              <strong>Phone:</strong> {customerData.phone || customerData.mobileNumber}
            </p>

            <p className="text-sm text-gray-700 dark:text-gray-200">
              <strong>Address:</strong>{' '}
              {customerData.address}, {customerData.city}, {customerData.state}
            </p>
          </div>
        </div>
      )}

      {/* No Data & No Error */}
      {!loading && !customerData && !error && (
        <p className="text-sm text-gray-500 dark:text-gray-400">
          No customer information available
        </p>
      )}
    </div>
  );
};

export default CustomerInfoCard;
