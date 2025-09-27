'use client';

import React, { useEffect, useState } from 'react';
import ComponentCard from '@/components/common/ComponentCard';
import PageBreadcrumb from '@/components/common/PageBreadCrumb';
import BasicTableOne from '@/components/tables/BasicTableOne';
import Input from '@/components/form/input/InputField';
import { EyeIcon } from '@/icons';
import Link from 'next/link';
import { useCheckout } from '@/context/CheckoutContext';
import Pagination from '@/components/tables/Pagination';
import * as XLSX from 'xlsx';
import { FaFileDownload } from 'react-icons/fa';

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
  isCompleted: boolean;
  isCancel?: boolean;
  isAccepted?: boolean;
  isPartialPayment?: boolean;
  paidAmount?: number;
}

const CompletedBookings = () => {
  const { checkouts, loading, error, fetchCheckouts } = useCheckout();
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10;

  useEffect(() => {
    fetchCheckouts();
  }, []);

  const columns = [
     {
      header: 'S.No',
      accessor: 'serialNo', // Serial number column
    },
    { header: 'Booking ID', accessor: 'bookingId' },
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
    {
      header: 'Booking Date',
      accessor: 'bookingDate',
      render: (row: BookingRow) => <span>{new Date(row.bookingDate).toLocaleString()}</span>,
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
        return <span className={`px-3 py-1 rounded-full text-sm font-medium ${colorClass}`}>{label}</span>;
      },
    },
    {
      header: 'Payment Status',
      accessor: 'paymentStatus',
      render: (row: BookingRow) => {
        let status = row.paymentStatus;
        if (row.paidAmount === 0) status = 'unpaid';
        else if (row.isPartialPayment) status = 'partpay';
        const statusColor =
          status === 'paid'
            ? 'bg-green-100 text-green-700 border-green-300'
            : status === 'unpaid'
            ? 'bg-red-100 text-red-700 border-red-300'
            : status === 'partpay'
            ? 'bg-purple-100 text-purple-700 border-purple-300'
            : 'bg-yellow-100 text-yellow-700 border-yellow-300';
        return <span className={`px-3 py-1 rounded-full text-sm border ${statusColor}`}>{status}</span>;
      },
    },
    {
      header: 'Booking Status',
      accessor: 'bookingStatus',
      render: (row: BookingRow) => {
        let label = '';
        let colorClass = '';
        if (row.isCancel) {
          label = 'Cancelled';
          colorClass = 'bg-red-100 text-red-700 border border-red-300';
        } else if (row.isCompleted) {
          label = 'Completed';
          colorClass = 'bg-green-100 text-green-700 border border-green-300';
        } else if (row.isAccepted && !row.isCompleted) {
          label = 'Accepted';
          colorClass = 'bg-blue-100 text-blue-700 border border-blue-300';
        } else {
          label = 'Pending';
          colorClass = 'bg-yellow-100 text-yellow-700 border border-yellow-300';
        }
        return <span className={`px-3 py-1 rounded-full text-sm font-medium ${colorClass}`}>{label}</span>;
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
        </div>
      ),
    },
  ];

  // ✅ Filter data based on search across multiple fields
  const filteredData = checkouts
    .filter(
      (checkout) =>
        checkout.isCompleted === true &&
        (
          checkout.bookingId?.toLowerCase().includes(search.toLowerCase()) ||
          checkout.serviceCustomer?.fullName?.toLowerCase().includes(search.toLowerCase()) ||
          checkout.serviceCustomer?.email?.toLowerCase().includes(search.toLowerCase()) ||
          String(checkout.grandTotal || checkout.totalAmount)?.includes(search) ||
          checkout.orderStatus?.toLowerCase().includes(search.toLowerCase())
        )
    )
    .map((checkout) => ({
      bookingId: checkout.bookingId,
      fullName: checkout.serviceCustomer?.fullName,
      email: checkout.serviceCustomer?.email,
      totalAmount: Number(checkout.grandTotal ?? checkout.totalAmount ?? 0),
      paymentStatus: checkout.paymentStatus || 'unpaid',
      bookingDate: checkout.createdAt,
      orderStatus: checkout.orderStatus,
      _id: checkout._id,
      provider: checkout.provider,
      isCompleted: checkout.isCompleted,
      isCancel: checkout.isCanceled,
      isAccepted: checkout.isAccepted,
      isPartialPayment: checkout.isPartialPayment,
      paidAmount: checkout.paidAmount,
    }));

  const totalPages = Math.ceil(filteredData.length / rowsPerPage);
  const indexOfLastRow = currentPage * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;
 const currentRows = filteredData
  .slice(indexOfFirstRow, indexOfLastRow)
  .map((row, idx) => ({
    ...row,
    serialNo: filteredData.length - ((currentPage - 1) * rowsPerPage + idx), // 🔹 Descending S.No
  }));
  // ✅ Download Excel
  const handleDownload = () => {
    if (filteredData.length === 0) {
      alert('No booking data available');
      return;
    }

    const dataToExport = filteredData.map((b,idx) => ({
      'S.No': idx + 1,
      'Booking ID': b.bookingId,
      'Customer Name': b.fullName,
      Email: b.email,
      'Total Amount': b.totalAmount,
      'Payment Status': b.paymentStatus,
      'Booking Date': new Date(b.bookingDate).toLocaleString(),
      'Provider Status': b.provider ? 'Assigned' : 'Unassigned',
      'Booking Status': b.isCancel
        ? 'Cancelled'
        : b.isCompleted
        ? 'Completed'
        : b.isAccepted
        ? 'Accepted'
        : 'Pending',
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Completed Bookings');
    XLSX.writeFile(workbook, 'Completed_Bookings.xlsx');
  };

  return (
    <div>
      <PageBreadcrumb pageTitle="Completed Bookings" />
      <div className="space-y-6">
        <ComponentCard
          title={
            <div className="flex justify-between items-center w-full">
              <span>Completed Bookings</span>
              <button
                onClick={handleDownload}
                className="flex items-center gap-2 px-4 py-2 text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 transition"
              >
                <FaFileDownload className="w-5 h-5" />
                <span>Download Excel</span>
              </button>
            </div>
          }
        >
          <div className="mb-4">
            <Input
              type="text"
              placeholder="Search by any field…"
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
            <>
              <BasicTableOne columns={columns} data={currentRows} />
              <div className="flex justify-center mt-4">
                <Pagination
                  currentPage={currentPage}
                  totalItems={filteredData.length}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                />
              </div>
            </>
          ) : (
            <p className="text-sm text-gray-500">No bookings to display.</p>
          )}
        </ComponentCard>
      </div>
    </div>
  );
};

export default CompletedBookings;
