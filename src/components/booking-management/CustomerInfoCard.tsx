import React from 'react';

function CustomerInfo() {
  return (
    <div className="px-8 py-6 bg-gray-100  rounded-xl">
      <h4 className="text-lg font-semibold text-gray-800 dark:text-white">Customer Information</h4>
      <hr className="my-4 border-gray-300 dark:border-gray-700" />
      
      <p className="text-sm text-gray-600 dark:text-gray-400">Loading customer info...</p>
      
      <p className="text-sm text-red-600 dark:text-red-400">Error: Unable to fetch customer info</p>
      
      <div className="flex items-center gap-5">
        <div className="space-y-1">
          <p className="text-sm text-gray-700 dark:text-gray-200"><strong>Name:</strong> John Doe</p>
          <p className="text-sm text-gray-700 dark:text-gray-200"><strong>Phone:</strong> +91 9876543210</p>
          <p className="text-sm text-gray-700 dark:text-gray-200">
            <strong>Address:</strong> 123 Street, Mumbai, Maharashtra
          </p>
        </div>
      </div>
    </div>
  );
}

export default CustomerInfo;
