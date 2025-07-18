'use client';

import React, { useEffect, useState } from 'react';
import ComponentCard from '@/components/common/ComponentCard';
import PageBreadcrumb from '@/components/common/PageBreadCrumb';
import BasicTableOne from '@/components/tables/BasicTableOne';
import Input from '@/components/form/input/InputField';
import { EyeIcon, PencilIcon, TrashBinIcon } from '@/icons';
import Link from 'next/link';
import { useCheckout } from '@/context/CheckoutContext';

interface BookingRow {
  _id: string;
  bookingId: string;
  fullName: string;
  email: string;
  totalAmount: number;
  paymentStatus: string;
  bookingDate: string;
  orderStatus: string;
  provider?: any;
  isCompleted: boolean; // ✅ new field
}

const AllBookings = () => {
  const { checkouts, loading, error, fetchCheckouts } = useCheckout();
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchCheckouts();
  }, []);

  useEffect(() => {
    if (checkouts.length > 0) {
      console.log('Checkout Data:', checkouts);
    }
    if (error) {
      console.error('Checkout Error:', error);
    }
  }, [checkouts, error]);

  const columns = [
    {
      header: 'Booking ID',
      accessor: 'bookingId',
    },
    {
      header: 'Customer Info',
      accessor: 'customerInfo',
      render: (row: BookingRow) => (
        <div className="text-sm">
          <p className="font-medium text-gray-900">{row.fullName || 'N/A'}</p>
          <p className="text-gray-500">{row.email || ''}</p>
        </div>
      ),
    },
    {
      header: 'Total Amount',
      accessor: 'totalAmount',
      render: (row: BookingRow) => (
        <span className="text-gray-800 font-semibold">₹ {row.totalAmount}</span>
      ),
    },

    // ✅ NEW COLUMN: Booking Status based on isCompleted
    

    {
      header: 'Booking Date',
      accessor: 'bookingDate',
      render: (row: BookingRow) => (
        <span>{new Date(row.bookingDate).toLocaleString()}</span>
      ),
    },
    {
      header: 'Provider Status',
      accessor: 'orderStatus',
      render: (row: BookingRow) => {
        const isAssigned = row.provider ? true : false;
        const label = isAssigned ? 'Assigned' : 'Unassigned';
        const colorClass = isAssigned
          ? 'bg-green-100 text-green-700 border border-green-300'
          : 'bg-yellow-100 text-yellow-700 border border-yellow-300';

        return (
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${colorClass}`}>
            {label}
          </span>
        );
      },
    },
    {
      header: 'Payment Status',
      accessor: 'paymentStatus',
      render: (row: BookingRow) => {
        const status = row.paymentStatus;
        const statusColor =
          status === 'paid'
            ? 'bg-green-100 text-green-700 border-green-300'
            : 'bg-yellow-100 text-yellow-700 border-yellow-300';

        return (
          <span className={`px-3 py-1 rounded-full text-sm border ${statusColor}`}>
            {status}
          </span>
        );
      },
    },
    {
      header: 'Booking Status',
      accessor: 'bookingStatus',
      render: (row: BookingRow) => {
        const isCompleted = row.isCompleted;
        const label = isCompleted ? 'Completed' : 'Pending';
        const colorClass = isCompleted
          ? 'bg-green-100 text-green-700 border border-green-300'
          : 'bg-yellow-100 text-yellow-700 border border-yellow-300';

        return (
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${colorClass}`}>
            {label}
          </span>
        );
      },
    },
    {
      header: 'Action',
      accessor: 'action',
      render: (row: BookingRow) => (
        <div className="flex gap-2">
          <Link href={`/booking-management/all-booking/${row._id}`} passHref>
            <button className="text-blue-500 border border-blue-500 rounded-md p-2 hover:bg-blue-500 hover:text-white">
              <EyeIcon />
            </button>
          </Link>
          <button
            onClick={() => alert(`Editing booking ID: ${row.bookingId}`)}
            className="text-yellow-500 border border-yellow-500 rounded-md p-2 hover:bg-yellow-500 hover:text-white"
          >
            <PencilIcon />
          </button>
          {/* <button
            onClick={() => alert(`Deleting booking ID: ${row.bookingId}`)}
            className="text-red-500 border border-red-500 rounded-md p-2 hover:bg-red-500 hover:text-white"
          >
            <TrashBinIcon />
          </button> */}
        </div>
      ),
    },
  ];

  const filteredData = checkouts
    .filter((checkout) =>
      checkout.bookingId?.toLowerCase().includes(search.toLowerCase())
    )
    .map((checkout) => ({
      bookingId: checkout.bookingId,
      fullName: checkout.serviceCustomer?.fullName,
      email: checkout.serviceCustomer?.email,
      totalAmount: checkout.service?.discountedPrice || 0,
      paymentStatus: checkout?.paymentStatus || 'unpaid',
      bookingDate: checkout?.createdAt,
      orderStatus: checkout.orderStatus,
      _id: checkout._id,
      provider: checkout.provider,
      isCompleted: checkout.isCompleted, // ✅ mapped for booking status
    }));

  return (
    <div>
      <PageBreadcrumb pageTitle="All Bookings" />
      <div className="space-y-6">
        <ComponentCard title="All Bookings">
          <div className="mb-4">
            <Input
              type="text"
              placeholder="Search by Booking ID…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition duration-200"
            />
          </div>

          {loading ? (
            <p>Loading...</p>
          ) : error ? (
            <p className="text-red-500">{error}</p>
          ) : filteredData.length > 0 ? (
            <BasicTableOne columns={columns} data={filteredData} />
          ) : (
            <p className="text-sm text-gray-500">No bookings to display.</p>
          )}
        </ComponentCard>
      </div>
    </div>
  );
};

export default AllBookings;
