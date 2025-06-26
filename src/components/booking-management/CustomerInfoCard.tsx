import React from 'react';

type Customer = {
  fullName: string;
  phone: string;
  address: string;
};

type CheckoutDetails = {
  serviceCustomer: Customer | null;
};

type Props = {
  checkoutDetails: CheckoutDetails | null;
};

const CustomerInfo: React.FC<Props> = ({ checkoutDetails }) => {

  const customer = checkoutDetails?.serviceCustomer;

  return (
    <div className="px-8 py-6 bg-gray-100 rounded-xl">
      <h4 className="text-lg font-semibold text-gray-800 dark:text-white">Customer Information</h4>
      <hr className="my-4 border-gray-300 dark:border-gray-700" />

      {customer ? (
        <div className="flex items-center gap-5">
          <div className="space-y-1">
            <p className="text-sm text-gray-700 dark:text-gray-200"><strong>Name:</strong> {customer.fullName}</p>
            <p className="text-sm text-gray-700 dark:text-gray-200"><strong>Phone:</strong> {customer.phone}</p>
            <p className="text-sm text-gray-700 dark:text-gray-200"><strong>Address:</strong> {customer.address}</p>
          </div>
        </div>
      ) : (
        <p className="text-sm text-gray-500 dark:text-gray-400">No customer information available.</p>
      )}
    </div>
  );
};

export default CustomerInfo;
