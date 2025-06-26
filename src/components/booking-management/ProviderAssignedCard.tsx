'use client';

import React, { useState, useEffect } from 'react';

interface ServiceMan {
  _id: string;
  name: string;
  lastName: string;
  phoneNo: string;
  generalImage?: string;
  businessInformation?: {
    identityType?: string;
    identityNumber?: string;
  };
}

const mockServiceMen: ServiceMan[] = [
  {
    _id: '1',
    name: 'John',
    lastName: 'Doe',
    phoneNo: '9876543210',
    generalImage: '',
    businessInformation: {
      identityType: 'Aadhar',
      identityNumber: '1234-5678-9012',
    },
  },
  {
    _id: '2',
    name: 'Jane',
    lastName: 'Smith',
    phoneNo: '8765432109',
    generalImage: '',
    businessInformation: {
      identityType: 'PAN',
      identityNumber: 'ABCDE1234F',
    },
  },
  {
    _id: '3',
    name: 'Alex',
    lastName: 'Johnson',
    phoneNo: '7654321098',
    generalImage: '',
    businessInformation: {
      identityType: 'Driving License',
      identityNumber: 'DL-1234567890',
    },
  },
];

function ProviderAssignedCard() {
  const [selectedManId, setSelectedManId] = useState<string | null>(null);
  const [showAll, setShowAll] = useState(false);

  const visibleServiceMen = showAll ? mockServiceMen : mockServiceMen.slice(0, 2);
  const totalServiceMen = mockServiceMen.length;

  const handleAssign = () => {
    alert(`Assigned Serviceman ID: ${selectedManId}`);
  };

  return (
    <div className="px-8 py-6 bg-gray-100 mt-3 rounded-xl">
      <h4 className="text-lg font-semibold text-gray-800 dark:text-white">Provider Info</h4>
      <hr className="my-4 border-gray-300 dark:border-gray-700" />

      {visibleServiceMen.map((man, index) => (
        <div key={index} className="flex items-center gap-5 mb-6">
          <div className="flex flex-col items-center gap-2">
            <input
              type="checkbox"
              checked={selectedManId === man._id}
              onChange={() => setSelectedManId(man._id)}
              className="form-checkbox h-5 w-5 text-blue-600"
            />
            <img
              src={man.generalImage || "/default-profile.png"}
              alt={man.name}
              className="w-14 h-12 rounded-full object-cover border border-gray-300"
            />
          </div>
          <div className="space-y-1">
            <p className="text-sm text-gray-700 dark:text-gray-200">
              <strong>Name:</strong> {man.name} {man.lastName}
            </p>
            <p className="text-sm text-gray-700 dark:text-gray-200">
              <strong>Phone:</strong> {man.phoneNo}
            </p>
            <p className="text-sm text-gray-700 dark:text-gray-200">
              <strong>Address:</strong> {man.businessInformation?.identityType || 'N/A'} - {man.businessInformation?.identityNumber || 'N/A'}
            </p>
          </div>
        </div>
      ))}

      {!showAll && totalServiceMen > 2 && (
        <button onClick={() => setShowAll(true)} className="text-blue-600 hover:underline text-sm mt-2">
          Show More
        </button>
      )}

      <div className="text-center">
        <button
          onClick={handleAssign}
          className="bg-blue-500 text-white px-7 my-3 py-2 rounded-md hover:bg-blue-600 transition duration-200"
        >
          Assign Provider
        </button>
      </div>
    </div>
  );
}

export default ProviderAssignedCard;
