'use client';

import React, { useEffect, useState } from 'react';
import PageBreadcrumb from '@/components/common/PageBreadCrumb';
import ComponentCard from '@/components/common/ComponentCard';
import CustomerInfoCard from '@/components/booking-management/CustomerInfoCard';
import ProviderAssignedCard from '@/components/booking-management/ProviderAssignedCard';
import { useParams } from 'next/navigation';
import { useCheckout } from '@/context/CheckoutContext';

const AllBookingsDetails = () => {
  const [activeTab, setActiveTab] = useState<'details' | 'status'>('details');
  const [showAll, setShowAll] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [checkoutDetails, setCheckoutDetails] = useState<any>(null);

  const handleUpdateStatus = () => setIsModalOpen(true);
  const handleCloseModal = () => setIsModalOpen(false);

  const { fetchCheckoutById } = useCheckout();
  const params = useParams();
  const id = params?.id as string;

  useEffect(() => {
    if (id) {
      fetchCheckoutById(id).then((data) => {
        console.log('✅ Fetched Checkout:', data);
        setCheckoutDetails(data);
      });
    }
  }, [id]);

  if (!checkoutDetails) {
    return <div className="p-6 text-center">Loading booking details...</div>;
  }

  return (
    <div>
      <PageBreadcrumb pageTitle="All Bookings Details" />

      <div className="space-y-6">
        <ComponentCard title="Booking Details">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-lg font-semibold">
                Booking ID: <span className="text-blue-600">{checkoutDetails?.bookingId || 'N/A'}</span>
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                Status: <span className="font-medium capitalize">{checkoutDetails?.orderStatus || 'N/A'}</span>
              </p>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-2 mt-4">
              <button
                className="bg-blue-800 text-white px-6 py-2 rounded-md hover:bg-blue-900 transition duration-300"
                onClick={() => setIsEditOpen(true)}
              >
                Edit Lead
              </button>
              <button className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 transition duration-300">
                Download Invoice
              </button>
            </div>
          </div>
        </ComponentCard>

        <div className="flex gap-4 border-b pb-2 mb-4">
          <button
            className={`px-4 py-2 font-medium ${activeTab === 'details' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500'}`}
            onClick={() => setActiveTab('details')}
          >
            Details
          </button>
          <button
            className={`px-4 py-2 font-medium ${activeTab === 'status' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500'}`}
            onClick={() => setActiveTab('status')}
          >
            Status
          </button>
        </div>

        {activeTab === 'details' && (
          <div className="flex flex-col lg:flex-row gap-4">
            {/* LEFT SIDE */}
            <div className="w-full lg:w-2/3 rounded-2xl border border-gray-200 bg-white p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Payment Details</h3>
              <div className="flex flex-col md:flex-row justify-between gap-6">
                <div className="flex-1 space-y-2">
                  <p className="text-gray-700"><strong>Payment Method:</strong> {checkoutDetails?.paymentMethod?.[0] || 'N/A'}</p>
                  <p className="text-gray-700"><strong>Total Amount:</strong> ₹{checkoutDetails?.totalAmount || 0}</p>
                </div>
                <div className="flex-1 space-y-2">
                  <p className="text-gray-700"><strong>Payment Status:</strong> <span className="text-green-600 capitalize">{checkoutDetails?.paymentStatus || 'N/A'}</span></p>
                  <p className="text-gray-700">
                    <strong>Schedule Date:</strong>{' '}
                    {checkoutDetails?.acceptedDate ? new Date(checkoutDetails.acceptedDate).toLocaleString('en-IN', {
                      day: '2-digit', month: 'long', year: 'numeric', hour: 'numeric', minute: 'numeric', hour12: true
                    }) : 'N/A'}
                  </p>
                </div>
              </div>
              <hr className="my-4 border-gray-300" />

              <div className="my-5">
                <h3 className="text-md font-semibold text-gray-700 mb-2">Booking Summary</h3>
                <table className="w-full table-auto border border-gray-200 text-sm">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="border px-4 py-2 text-left">Service</th>
                      <th className="border px-4 py-2 text-left">Price</th>
                      <th className="border px-4 py-2 text-left">Discount Price</th>
                      <th className="border px-4 py-2 text-left">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border px-4 py-2">{checkoutDetails?.service?.serviceName || 'N/A'}</td>
                      <td className="border px-4 py-2">₹{checkoutDetails?.service?.price || 0}</td>
                      <td className="border px-4 py-2">₹{checkoutDetails?.service?.discountedPrice || 0}</td>
                      <td className="border px-4 py-2">₹{checkoutDetails?.totalAmount || 0}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="mt-6 space-y-2 text-sm text-gray-800">
                <div className="flex justify-between"><span className="font-medium">Subtotal :</span><span>₹{checkoutDetails?.subtotal || 0}</span></div>
                <div className="flex justify-between"><span className="font-medium">Discount :</span><span>₹{checkoutDetails?.serviceDiscount || 0}</span></div>
                <div className="flex justify-between"><span className="font-medium">Campaign Discount :</span><span>₹{checkoutDetails?.champaignDiscount || 0}</span></div>
                <div className="flex justify-between"><span className="font-medium">Coupon Discount :</span><span>₹{checkoutDetails?.couponDiscount || 0}</span></div>
                <div className="flex justify-between"><span className="font-medium">VAT :</span><span>₹{checkoutDetails?.vat || 0}</span></div>
                <div className="flex justify-between"><span className="font-medium">Platform Fee :</span><span>₹{checkoutDetails?.platformFee || 0}</span></div>
                <div className="flex justify-between border-t pt-2 mt-2 font-semibold text-base">
                  <span>Grand Total :</span>
                  <span>₹{checkoutDetails?.totalAmount || 0}</span>
                </div>
              </div>
            </div>

            {/* RIGHT SIDE */}
            <div className="w-full lg:w-1/3 rounded-2xl border border-gray-200 bg-white p-6">
              <div className="bg-gray-100 p-4 rounded-xl mb-4">
                <h4 className="text-lg font-semibold text-gray-800">Booking Setup</h4>
                <hr className="my-4 border-gray-300" />
                <button
                  className="bg-red-500 text-white px-6 py-2 rounded-md hover:bg-red-600 transition duration-300"
                  onClick={handleUpdateStatus}
                >
                  Update Status
                </button>
              </div>

              <CustomerInfoCard  />
              <ProviderAssignedCard />
            </div>
          </div>
        )}

        {activeTab === 'status' && (
          <div className="flex flex-col lg:flex-row gap-4">
            {/* LEFT */}
            <div className="w-full lg:w-2/3 rounded-2xl border border-gray-200 bg-white p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Payment Details</h3>
              <div className="flex flex-col md:flex-row justify-between gap-6">
                <div className="flex-1 space-y-2">
                  <p className="text-gray-700"><strong>Payment Method:</strong> {checkoutDetails?.paymentMethod?.[0] || 'N/A'}</p>
                  <p className="text-gray-700"><strong>Total Amount:</strong> ₹{checkoutDetails?.totalAmount || 0}</p>
                </div>
                <div className="flex-1 space-y-2">
                  <p className="text-gray-700"><strong>Payment Status:</strong> <span className="text-green-600 capitalize">{checkoutDetails?.paymentStatus || 'N/A'}</span></p>
                  <p className="text-gray-700">
                    <strong>Schedule Date:</strong>{' '}
                    {checkoutDetails?.acceptedDate ? new Date(checkoutDetails.acceptedDate).toLocaleString('en-IN', {
                      day: '2-digit', month: 'long', year: 'numeric', hour: 'numeric', minute: 'numeric', hour12: true
                    }) : 'N/A'}
                  </p>
                </div>
              </div>
              <hr className="my-4 border-gray-300" />
            </div>

            {/* RIGHT */}
            <div className="w-full lg:w-1/3 rounded-2xl border border-gray-200 bg-white p-6">
              <CustomerInfoCard />
              <ProviderAssignedCard  />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AllBookingsDetails;
