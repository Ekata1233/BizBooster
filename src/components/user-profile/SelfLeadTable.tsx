'use client';

import React, { useEffect } from 'react';
import ComponentCard from '@/components/common/ComponentCard';
import BasicTableOne from '@/components/tables/BasicTableOne';
import { EyeIcon } from '@/icons';
import { useCheckout } from '@/context/CheckoutContext';

interface SelfLeadProps {
  userId: string;
  isAction: boolean;
}

const columnsSelfLead = [
  { header: 'Sr', accessor: 'sr' },
  { header: 'Service Name', accessor: 'serviceName' },
  {
    header: 'Contact Details',
    accessor: 'contactDetails',
    render: (row: any) => (
      <div className="text-sm text-gray-700">
        <div className="font-semibold">{row.userName}</div>
        <div>{row.userEmail}</div>
        <div>{row.userPhone}</div>
      </div>
    ),
  },
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

const SelfLeadTable = ({ userId, isAction }: SelfLeadProps) => {
  const { fetchCheckoutByUser, checkouts, loading, error } = useCheckout();

  console.log("checkout in self lead table : ", checkouts)

  useEffect(() => {
    fetchCheckoutByUser(userId);
  }, [userId]);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;

  const mappedData = checkouts.map((checkout, index) => {
    const customer = checkout?.serviceCustomer || {};

    return {
      sr: index + 1,
      serviceName: checkout?.service?.serviceName || 'N/A',
      userName: customer?.fullName || 'N/A',
      userEmail: customer?.email || 'N/A',
      userPhone: customer?.phone || 'N/A',
      price: `₹${checkout?.totalAmount?.toLocaleString() || 0}`,
      commission: `₹${checkout?.commission?.toLocaleString() || 0}`,
      leadStatus: checkout?.isCompleted
        ? 'completed'
        : checkout?.orderStatus === 'processing'
          ? 'ongoing'
          : 'pending',
    };
  });


  return (
    <ComponentCard title="Self Lead Table">
      <BasicTableOne columns={columnsSelfLead} data={mappedData} />
    </ComponentCard>
  );
};

export default SelfLeadTable;
