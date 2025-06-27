import React from 'react'


type CustomerInfo = {
  fullName: string;
  phone: string;
  address: string;
  city: string;
  state: string;
};

type CustomerInfoCardProps = {
  serviceCustomer: CustomerInfo | null;
  loading: boolean;
  error: string | null;
};
const CustomerInfoCard = ({ serviceCustomer, loading, error }: CustomerInfoCardProps) => (
  <div className="px-8 py-6 bg-gray-100 m-3 rounded-xl">
    <h4 className="text-lg font-semibold text-gray-800 dark:text-white">Customer Information</h4>
    <hr className="my-4 border-gray-300 dark:border-gray-700" />
    {loading && <p className="text-sm text-gray-600 dark:text-gray-400">Loading customer info...</p>}
    {error && <p className="text-sm text-red-600 dark:text-red-400">Error: {error}</p>}
    {serviceCustomer && (
      <div className="flex items-center gap-5">
        <div className="space-y-1">
          <p className="text-sm text-gray-700 dark:text-gray-200"><strong>Name:</strong> {serviceCustomer.fullName}</p>
          <p className="text-sm text-gray-700 dark:text-gray-200"><strong>Phone:</strong> {serviceCustomer.phone}</p>
          <p className="text-sm text-gray-700 dark:text-gray-200">
            <strong>Address:</strong> {serviceCustomer.address}, {serviceCustomer.city}, {serviceCustomer.state}
          </p>
        </div>
      </div>
    )}
  </div>
);


export default CustomerInfoCard