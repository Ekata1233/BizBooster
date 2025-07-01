'use client';
import React from 'react';
import ComponentCard from '@/components/common/ComponentCard';
import BasicTableOne from '@/components/tables/BasicTableOne';
import { EyeIcon } from '@/icons';

const columnsSelfLead = [
  { header: 'Sr', accessor: 'sr' },
  { header: 'Service Name', accessor: 'serviceName' },
  { header: 'Contact Details', accessor: 'contactDetails' },
  { header: 'Price', accessor: 'price' },
  { header: 'My Commission', accessor: 'commission' },
  {
    header: 'Lead Status',
    accessor: 'leadStatus',
    render: (row: any) => {
      const status = row.leadStatus;
      let color = '';
      switch (status) {
        case 'completed':
          color = 'bg-green-100 text-green-600 border-green-300';
          break;
        case 'pending':
          color = 'bg-yellow-100 text-yellow-600 border-yellow-300';
          break;
        case 'ongoing':
          color = 'bg-blue-100 text-blue-600 border-blue-300';
          break;
        default:
          color = 'bg-gray-100 text-gray-600 border-gray-300';
      }
      return (
        <span className={`px-2 py-1 rounded-full text-xs border ${color}`}>
          {status}
        </span>
      );
    },
  },
  {
    header: 'Action',
    accessor: 'action',
    render: (row: any) => (
      <div className="flex gap-2">
        <button className="text-blue-500 border border-blue-500 rounded-md p-2 hover:bg-blue-500 hover:text-white">
          <EyeIcon />
        </button>
      </div>
    ),
  },
];

const dataSelfLead = [
  {
    sr: 1,
    serviceName: 'Office Booking',
    contactDetails: 'aniket@example.com / 9876543210',
    price: '₹50,000',
    commission: '₹5,000',
    leadStatus: 'completed',
  },
  {
    sr: 2,
    serviceName: 'Meeting Room',
    contactDetails: 'riya@example.com / 9123456789',
    price: '₹20,000',
    commission: '₹2,000',
    leadStatus: 'pending',
  },
  {
    sr: 3,
    serviceName: 'Coworking',
    contactDetails: 'rahul@example.com / 9012345678',
    price: '₹30,000',
    commission: '₹3,000',
    leadStatus: 'ongoing',
  },
];

const SelfLeadTable = () => {
  return (
    <ComponentCard title="Self Lead Table">
      <BasicTableOne columns={columnsSelfLead} data={dataSelfLead} />
    </ComponentCard>
  );
};

export default SelfLeadTable;
