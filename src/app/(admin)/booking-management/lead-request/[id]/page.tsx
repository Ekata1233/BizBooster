'use client';

import React, { useEffect, useState } from 'react';
import PageBreadcrumb from '@/components/common/PageBreadCrumb';
import ComponentCard from '@/components/common/ComponentCard';
import { useParams, useRouter } from 'next/navigation';
import { useLead } from '@/context/LeadContext';
import { LeadType } from '@/types/LeadType';
import { format } from 'date-fns';
import BookingStatus from '@/components/booking-management/BookingStatus';
import axios from 'axios';
import { useCheckout } from '@/context/CheckoutContext';

const LeadRequestDetails = () => {
  const params = useParams();
  const leadId = params?.id as string;
  const { getLeadById, fetchLeads } = useLead();
  const { updateCheckout } = useCheckout();
const router = useRouter();
  const [lead, setLead] = useState<LeadType | null>(null);
  const [activeTab, setActiveTab] = useState<'details' | 'status'>('details');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [commissionValue, setCommissionValue] = useState<number | ''>('');
  const [isCommissionSet, setIsCommissionSet] = useState(false);
  const [isApproved, setIsApproved] = useState(false); // ✅ Added

<<<<<<< HEAD
  useEffect(() => {
    if (!leadId) return;
=======
    useEffect(() => {
        const fetchLead = async () => {
            // const lead = await getLeadById(leadId);
            // console.log("Fetched lead:", lead);
        };
>>>>>>> 44ea7d948983fa06c12a924df960a66624457a4f

    const fetchLead = async () => {
      const result = await getLeadById(leadId);
      setLead(result);
    };

    fetchLead();
  }, [leadId]);

  const handleSaveCommission = () => {
    if (commissionValue !== '') {
      setIsCommissionSet(true);
      setIsModalOpen(false);
    }
  };

const handleApprove = async () => {
  if (!lead || commissionValue === '') {
    return alert('Missing lead or commission value');
  }

  try {
    // 1. Update checkout commission
    await updateCheckout(lead.checkout?._id!, {
      commission: Number(commissionValue),
    });

    // 2. Approve the lead
    const formData = new FormData();
    formData.append('updateType', 'adminApproval');
    formData.append('isAdminApproved', 'true');

    const response = await axios.put(`/api/leads/${lead._id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });

    if (response.data.success) {
      alert('Commission and Lead approved successfully');

      // Optional: refetch or update state
      fetchLeads();
      const updatedLead = await getLeadById(lead._id);
      setLead(updatedLead);
      setIsCommissionSet(false);
      setCommissionValue('');
      setIsApproved(true);

      // ✅ Redirect to lead-request page
      router.push('/booking-management/lead-request');
    } else {
      throw new Error(response.data.message || 'Approval failed');
    }
  } catch (error) {
    console.error(error);
    alert('Error during approval');
  }
};

  if (!lead) return <div className="p-4">Loading lead details...</div>;

  return (
    <div className="p-4 space-y-6">
      <PageBreadcrumb pageTitle="Lead Request Details" />

      <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-6 rounded-xl shadow">
        <h2 className="text-xl font-bold text-blue-700 mb-1">
          Booking ID: {lead.checkout?.bookingId}
        </h2>
        <h5 className="text-sm text-gray-600 font-bold">
          Service Name: <span>{lead.service?.name || 'N/A'}</span>
        </h5>
        <p className="text-sm text-gray-600">
          Status: <span className="font-medium">{lead.checkout?.orderStatus || 'N/A'}</span>
        </p>
      </div>

      <div className="flex gap-4 border-b pb-2 mb-4">
        <button
          className={`px-4 py-2 font-semibold ${activeTab === 'details' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500'
            }`}
          onClick={() => setActiveTab('details')}
        >
          Details
        </button>
        <button
          className={`px-4 py-2 font-semibold ${activeTab === 'status' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500'
            }`}
          onClick={() => setActiveTab('status')}
        >
          Status
        </button>
      </div>

      {activeTab === 'details' && (
        <div className="space-y-6">
          <ComponentCard title="🎯 Lead Info">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <InfoItem label="Booking ID" value={lead.checkout?.bookingId} />
              <InfoItem label="Order Status" value={lead.checkout?.orderStatus} />
              <InfoItem label="Payment Status" value={lead.checkout?.paymentStatus} />
              <InfoItem
                label="Accepted Date"
                value={
                  lead.checkout?.acceptedDate
                    ? format(new Date(lead.checkout.acceptedDate), 'dd MMM yyyy hh:mm a')
                    : 'N/A'
                }
              />
              <div className="md:col-span-2">
                <InfoItem label="Notes" value={lead.checkout?.notes} />
              </div>
            </div>
          </ComponentCard>

          <ComponentCard title="💰 Payment Details">
            <div className="overflow-x-auto">
              <table className="min-w-full table-auto border border-gray-200">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-4 py-2 text-left">Label</th>
                    <th className="px-4 py-2 text-left">Amount</th>
                  </tr>
                </thead>
                <tbody className="text-gray-800">
                  <tr><td className="px-4 py-2">Service Amount</td><td className="px-4 py-2">₹{lead.amount}</td></tr>
                  <tr><td className="px-4 py-2">Subtotal</td><td className="px-4 py-2">₹{lead.checkout?.subtotal || 0}</td></tr>
                  <tr><td className="px-4 py-2">Service Discount</td><td className="px-4 py-2">₹{lead.checkout?.serviceDiscount || 0}</td></tr>
                  <tr><td className="px-4 py-2">Coupon Discount</td><td className="px-4 py-2">₹{lead.checkout?.couponDiscount || 0}</td></tr>
                  <tr><td className="px-4 py-2 font-semibold">Total Amount</td><td className="px-4 py-2 font-semibold">₹{lead.checkout?.totalAmount || 0}</td></tr>
                  <tr><td className="px-4 py-2">Commission</td><td className="px-4 py-2">₹{lead.checkout?.commission || 0}</td></tr>
                  <tr><td className="px-4 py-2">Platform Fee</td><td className="px-4 py-2">₹{lead.checkout?.platformFee || 0}</td></tr>
                  <tr><td className="px-4 py-2">Guarantee Fee</td><td className="px-4 py-2">₹{lead.checkout?.garrentyFee || 0}</td></tr>
                </tbody>
              </table>
            </div>
          </ComponentCard>

          {lead.extraService?.length > 0 && (
            <ComponentCard title="🧾 Extra Services">
              <table className="w-full text-sm border border-gray-300">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-4 py-2 border">#</th>
                    <th className="px-4 py-2 border text-left">Service Name</th>
                    <th className="px-4 py-2 border">Price</th>
                    <th className="px-4 py-2 border">Discount</th>
                    <th className="px-4 py-2 border">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {lead.extraService.map((item, index) => (
                    <tr key={index}>
                      <td className="px-4 py-2 border text-center">{index + 1}</td>
                      <td className="px-4 py-2 border">{item.serviceName}</td>
                      <td className="px-4 py-2 border text-center">₹{item.price}</td>
                      <td className="px-4 py-2 border text-center">₹{item.discount}</td>
                      <td className="px-4 py-2 border text-center">₹{item.total}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </ComponentCard>
          )}
        </div>
      )}

      {activeTab === 'status' && (
        <ComponentCard title="Lead Status Updates">
          <BookingStatus />
        </ComponentCard>
      )}

      {/* ✅ Action Buttons / Done */}
      <div className="flex justify-end mt-8">
        {!isApproved ? (
          !isCommissionSet ? (
            <button
              onClick={() => setIsModalOpen(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-xl shadow font-medium"
            >
              Add Commission & Approve
            </button>
          ) : (
            <button
              onClick={handleApprove}
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-xl shadow font-medium"
            >
              Approve
            </button>
          )
        ) : (
          <div className="flex items-center gap-2 text-green-600 font-semibold text-lg">
            ✅ Done
          </div>
        )}
      </div>

      {/* Modal for Commission Input */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg w-96 space-y-4">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-white">Set Commission Amount</h2>
            <input
              type="number"
              value={commissionValue}
              onChange={(e) => setCommissionValue(Number(e.target.value))}
              placeholder="Enter commission"
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <div className="flex justify-end gap-4">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 rounded-md bg-gray-300 hover:bg-gray-400 text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveCommission}
                className="px-4 py-2 rounded-md bg-blue-600 hover:bg-blue-700 text-white"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const InfoItem = ({ label, value }: { label: string; value?: string | number | null }) => (
  <div>
    <div className="text-sm text-gray-500">{label}</div>
    <div className="text-base font-medium text-gray-800">{value ?? 'N/A'}</div>
  </div>
);

export default LeadRequestDetails;
