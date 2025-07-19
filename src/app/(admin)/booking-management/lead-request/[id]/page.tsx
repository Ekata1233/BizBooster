'use client';

import React, { useEffect, useState } from 'react';
import PageBreadcrumb from '@/components/common/PageBreadCrumb';
import ComponentCard from '@/components/common/ComponentCard';
import { useParams, useRouter } from 'next/navigation';
import { Lead, useLead } from '@/context/LeadContext';
import { format } from 'date-fns';
import BookingStatus from '@/components/booking-management/BookingStatus';
import axios from 'axios';
import { useCheckout } from '@/context/CheckoutContext';
import Label from '@/components/form/Label';
import Input from '@/components/form/input/InputField';
import { useService } from '@/context/ServiceContext';



const LeadRequestDetails = () => {
  const params = useParams();
  const leadId = params?.id as string;
  const { getLeadById, fetchLeads } = useLead();
  const { updateLead } = useLead();
  const router = useRouter();
  const [lead, setLead] = useState<Lead | null>(null);
  const [activeTab, setActiveTab] = useState<'details' | 'status'>('details');
  const [extraCommissionValue, setExtraCommissionValue] = useState<string>('');
  const [newCommissionValue, setNewCommissionValue] = useState<string>('');
  const [isCommissionSet, setIsCommissionSet] = useState(false);
  const [isApproved, setIsApproved] = useState(false);
  const [checkoutDetails] = useState<any>(null);
  const { fetchSingleService, singleService, } = useService();
  const [extraCommissionType, setExtraCommissionType] = useState<'percentage' | 'amount'>('percentage');
  const [newCommissionType, setNewCommissionType] = useState<'percentage' | 'amount'>('percentage');
console.log(isCommissionSet);


  const serviceId = lead?.checkout?.service;

  useEffect(() => {
    if (!leadId) return;

    const fetchLead = async () => {
      const result = await getLeadById(leadId);
      setLead(result);
    };

    fetchLead();
  }, [leadId]);

  useEffect(() => {
    if (serviceId) {
      fetchSingleService(serviceId);
    }
  }, [serviceId]);



  const handleApprove = async () => {
    if (!lead || extraCommissionType === null) {
      return alert('Missing lead or commission value');
    }

    const fallbackCommissionRaw = singleService?.franchiseDetails?.commission;
    const fallbackCommission = fallbackCommissionRaw?.replace(/[^0-9.]/g, "") || "";

    console.log("fallback commission : ", fallbackCommission)

    if (newCommissionValue === "" && !fallbackCommission) {
      return alert('Missing new commission and no default available');
    }

    try {
      const formattedExtraCommission =
        extraCommissionType === 'percentage'
          ? `${extraCommissionValue}%`
          : `₹${extraCommissionValue}`;

      const rawNewCommission = newCommissionValue === '' ? fallbackCommission : newCommissionValue;
      const formattedNewCommission =
        newCommissionType === 'percentage'
          ? `${rawNewCommission}%`
          : `₹${rawNewCommission}`;

      const commissionFormData = new FormData();
      commissionFormData.append("updateType", "setCommission");
      commissionFormData.append("commission", formattedExtraCommission);
      commissionFormData.append("newCommission", formattedNewCommission);
      await updateLead(lead._id!, commissionFormData);

      // Step 2: Approve the lead
      const approvalFormData = new FormData();
      approvalFormData.append("updateType", "adminApproval");
      approvalFormData.append("isAdminApproved", "true");

      const response = await axios.put(`/api/leads/${lead._id}`, approvalFormData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });


      if (response.data.success) {
        alert('Commission and Lead approved successfully');

        // Optional: refetch or update state
        fetchLeads();
        const updatedLead = await getLeadById(lead._id);
        setLead(updatedLead);
        setIsCommissionSet(false);
        setExtraCommissionValue('');
        setNewCommissionValue('');
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

  const handleExtraTypeChange = (newType: 'percentage' | 'amount') => {
    setExtraCommissionType(newType);
    const formatted =
      newType === 'percentage' ? `${extraCommissionValue}%` : `₹${extraCommissionType}`;
  };

  const handleExtraCommissionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Allow only numbers
    if (/^\d*$/.test(value)) {
      setExtraCommissionValue(value);
      const formatted =
        extraCommissionType === "percentage" ? `${value}%` : `₹${value}`;
    }
  };

  const handleNewTypeChange = (newType: 'percentage' | 'amount') => {
    setNewCommissionType(newType);
    const formatted =
      newType === 'percentage' ? `${newCommissionValue}%` : `₹${newCommissionType}`;
  };

  const handleNewCommissionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Allow only numbers
    if (/^\d*$/.test(value)) {
      setNewCommissionValue(value); // ✅ string
      const formatted =
        newCommissionType === "percentage" ? `${value}%` : `₹${value}`;
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
          <ComponentCard title="Lead Info">
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

          <ComponentCard title="Payment Details">
            <div className="grid grid-cols-3 gap-6">
              {/* Block 1 */}
              <div className="flex flex-col">
                <Label>Previous Price</Label>
                <Input
                  type="text"
                  placeholder="Previous Price"
                  value={`₹${singleService?.price ?? ''}`}
                />
              </div>

              <div className="flex flex-col">
                <Label>Previous After Discount Price</Label>
                <Input
                  type="text"
                  placeholder="After Discount Price"
                  value={`₹${singleService?.discountedPrice ?? ''}`}
                />
              </div>

              <div className="flex flex-col">
                <Label>Previous Commission</Label>
                <Input
                  type="text"
                  placeholder="Previous Commission"
                  value={singleService?.franchiseDetails?.commission ?? ''}
                />
              </div>


              {/* Block 2 */}
              <div className="flex flex-col">
                <Label>Updated Price</Label>
                <Input type="text" placeholder="Updated Price" value={lead.newAmount} />
              </div>
              <div className="flex flex-col">
                <Label>Updated After Discount Price</Label>
                <Input type="text" placeholder="After Discount Price" value={lead.afterDicountAmount} />
              </div>

            </div>
            <div className="flex items-center gap-4">
              {/* Input with symbol */}
              <div className="relative w-40">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm select-none">
                  {newCommissionType === "percentage" ? "%" : "₹"}
                </span>
                <Input
                  type="text"
                  value={newCommissionValue}
                  onChange={handleNewCommissionChange}
                  placeholder={singleService?.franchiseDetails?.commission}
                  className="pl-8 pr-3 py-2 text-sm w-full"
                />
              </div>

              {/* Type selector buttons */}
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => handleNewTypeChange("percentage")}
                  className={`px-3 py-2 rounded-md border text-sm transition ${newCommissionType === "percentage"
                    ? "bg-blue-600 text-white border-blue-600"
                    : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100"
                    }`}
                >
                  %
                </button>
                <button
                  type="button"
                  onClick={() => handleNewTypeChange("amount")}
                  className={`px-3 py-2 rounded-md border text-sm transition ${newCommissionType === "amount"
                    ? "bg-blue-600 text-white border-blue-600"
                    : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100"
                    }`}
                >
                  ₹
                </button>
              </div>
            </div>

          </ComponentCard>


          {(lead.extraService?.length ?? 0) > 0 && (
            <ComponentCard title="Extra Services">
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
                  {lead.extraService!.map((item, index) => (
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

              <div className="flex items-center gap-4">
                {/* Input with symbol */}
                <div className="relative w-40">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm select-none">
                    {extraCommissionType === "percentage" ? "%" : "₹"}
                  </span>
                  <Input
                    type="text"
                    value={extraCommissionValue}
                    onChange={handleExtraCommissionChange}
                    placeholder="Commission"
                    className="pl-8 pr-3 py-2 text-sm w-full"
                  />
                </div>

                {/* Type selector buttons */}
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => handleExtraTypeChange("percentage")}
                    className={`px-3 py-2 rounded-md border text-sm transition ${extraCommissionType === "percentage"
                      ? "bg-blue-600 text-white border-blue-600"
                      : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100"
                      }`}
                  >
                    %
                  </button>
                  <button
                    type="button"
                    onClick={() => handleExtraTypeChange("amount")}
                    className={`px-3 py-2 rounded-md border text-sm transition ${extraCommissionType === "amount"
                      ? "bg-blue-600 text-white border-blue-600"
                      : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100"
                      }`}
                  >
                    ₹
                  </button>
                </div>
              </div>

            </ComponentCard>
          )}

        </div>
      )}

      {activeTab === 'status' && (
        <ComponentCard title="Lead Status Updates">
          <BookingStatus checkout={checkoutDetails} />
        </ComponentCard>
      )}

      {/* ✅ Action Buttons / Done */}
      <div className="flex justify-end mt-8">
        {!isApproved ? (
          <button
            onClick={handleApprove}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg shadow font-medium"
          >
            Approve
          </button>
        ) : null}

      </div>

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
