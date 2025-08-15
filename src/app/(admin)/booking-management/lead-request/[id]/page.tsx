// 'use client';

// import React, { useEffect, useState } from 'react';
// import PageBreadcrumb from '@/components/common/PageBreadCrumb';
// import ComponentCard from '@/components/common/ComponentCard';
// import { useParams, useRouter } from 'next/navigation';
// import { Lead, useLead } from '@/context/LeadContext';
// import { format } from 'date-fns';
// import BookingStatus from '@/components/booking-management/BookingStatus';
// import axios from 'axios';
// import { Checkout, useCheckout } from '@/context/CheckoutContext';
// import Label from '@/components/form/Label';
// import Input from '@/components/form/input/InputField';
// import { useService } from '@/context/ServiceContext';

// const LeadRequestDetails = () => {
//   const params = useParams();
//   const leadId = params?.id as string;
//   const { getLeadById, fetchLeads } = useLead();
//   const { updateLead } = useLead();
//   const { fetchCheckoutById } = useCheckout();
//   const router = useRouter();
//   const [lead, setLead] = useState<Lead | null>(null);
//   const [activeTab, setActiveTab] = useState<'details' | 'status'>('details');
//   const [extraCommissionValue, setExtraCommissionValue] = useState<string>('');
//   const [newCommissionValue, setNewCommissionValue] = useState<string>('');
//   const [isCommissionSet, setIsCommissionSet] = useState(false);
//   const [isApproved, setIsApproved] = useState(false);
//   const [checkoutDetails] = useState<any>(null);
//   const { fetchSingleService, singleService, } = useService();
//   const [extraCommissionType, setExtraCommissionType] = useState<'percentage' | 'amount'>('percentage');
//   const [newCommissionType, setNewCommissionType] = useState<'percentage' | 'amount'>('percentage');
//   const [assurityFee, setAssurityFee] = useState<number>(0);
//   const [checkoutInfo, setCheckoutInfo] = useState<Checkout | null>(null);
//   const [extraServiceTotal, setExtraServiceTotal] = useState<number>(0);


//   const checkoutId = lead?.checkout._id;

//   useEffect(() => {
//     if (checkoutId) {
//       (async () => {
//         const data = await fetchCheckoutById(checkoutId);
//         if (data) {
//           setCheckoutInfo(data);
//         }
//       })();
//     }
//   }, [checkoutId]);

//   console.log("checkout details info: ", checkoutInfo);


//   useEffect(() => {
//     const fetchCommission = async () => {
//       try {
//         const res = await axios.get("https://biz-booster.vercel.app/api/commission");
//         if (Array.isArray(res.data) && res.data.length > 0) {
//           setAssurityFee(res.data[0].assurityfee); // store in state variable
//         }
//       } catch (error) {
//         console.error("Error fetching commission data:", error);
//       }
//     };

//     fetchCommission();
//   }, []);

//   console.log("assurity charges : ", assurityFee)

//   const serviceId = lead?.checkout?.service;


//   useEffect(() => {
//     if (!leadId) return;

//     const fetchLead = async () => {
//       const result = await getLeadById(leadId);
//       setLead(result);
//     };

//     fetchLead();
//   }, [leadId]);

//   useEffect(() => {
//     if (serviceId) {
//       fetchSingleService(serviceId);
//     }
//   }, [serviceId]);



//   const handleApprove = async () => {
//     if (!lead || extraCommissionType === null) {
//       return alert('Missing lead or commission value');
//     }

//     const fallbackCommissionRaw = singleService?.franchiseDetails?.commission;
//     const fallbackCommission = fallbackCommissionRaw?.replace(/[^0-9.]/g, "") || "";

//     console.log("fallback commission : ", fallbackCommission)

//     if (newCommissionValue === "" && !fallbackCommission) {
//       return alert('Missing new commission and no default available');
//     }

//     try {
//       const formattedExtraCommission =
//         extraCommissionType === 'percentage'
//           ? `${extraCommissionValue}%`
//           : `₹${extraCommissionValue}`;

//       const rawNewCommission = newCommissionValue === '' ? fallbackCommission : newCommissionValue;
//       const formattedNewCommission =
//         newCommissionType === 'percentage'
//           ? `${rawNewCommission}%`
//           : `₹${rawNewCommission}`;

//       const commissionFormData = new FormData();
//       commissionFormData.append("updateType", "setCommission");
//       commissionFormData.append("commission", formattedExtraCommission);
//       commissionFormData.append("newCommission", formattedNewCommission);
//       await updateLead(lead._id!, commissionFormData);

//       // Step 2: Approve the lead
//       const approvalFormData = new FormData();
//       approvalFormData.append("updateType", "adminApproval");
//       approvalFormData.append("isAdminApproved", "true");

//       const response = await axios.put(`/api/leads/${lead._id}`, approvalFormData, {
//         headers: { 'Content-Type': 'multipart/form-data' },
//       });


//       if (response.data.success) {
//         alert('Commission and Lead approved successfully');

//         // Optional: refetch or update state
//         fetchLeads();
//         const updatedLead = await getLeadById(lead._id);
//         setLead(updatedLead);
//         setIsCommissionSet(false);
//         setExtraCommissionValue('');
//         setNewCommissionValue('');
//         setIsApproved(true);

//         // ✅ Redirect to lead-request page
//         router.push('/booking-management/lead-request');
//       } else {
//         throw new Error(response.data.message || 'Approval failed');
//       }
//     } catch (error) {
//       console.error(error);
//       alert('Error during approval');
//     }
//   };

//   const handleExtraTypeChange = (newType: 'percentage' | 'amount') => {
//     setExtraCommissionType(newType);
//     const formatted =
//       newType === 'percentage' ? `${extraCommissionValue}%` : `₹${extraCommissionType}`;
//   };

//   const handleExtraCommissionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const value = e.target.value;
//     // Allow only numbers
//     if (/^\d*$/.test(value)) {
//       setExtraCommissionValue(value);
//       const formatted =
//         extraCommissionType === "percentage" ? `${value}%` : `₹${value}`;
//     }
//   };

//   const handleNewTypeChange = (newType: 'percentage' | 'amount') => {
//     setNewCommissionType(newType);
//     const formatted =
//       newType === 'percentage' ? `${newCommissionValue}%` : `₹${newCommissionType}`;
//   };

//   const handleNewCommissionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const value = e.target.value;
//     // Allow only numbers
//     if (/^\d*$/.test(value)) {
//       setNewCommissionValue(value); // ✅ string
//       const formatted =
//         newCommissionType === "percentage" ? `${value}%` : `₹${value}`;
//     }
//   };

//   if (!lead) return <div className="p-4">Loading lead details...</div>;

//   return (
//     <div className="p-4 space-y-6">
//       <PageBreadcrumb pageTitle="Lead Request Details" />

//       <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-6 rounded-xl shadow">
//         <h2 className="text-xl font-bold text-blue-700 mb-1">
//           Booking ID: {lead.checkout?.bookingId}
//         </h2>

//         <p className="text-sm text-gray-600">
//           Status: <span className="font-medium">{lead.checkout?.orderStatus || 'N/A'}</span>
//         </p>
//       </div>

//       <div className="flex gap-4 border-b pb-2 mb-4">
//         <button
//           className={`px-4 py-2 font-semibold ${activeTab === 'details' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500'
//             }`}
//           onClick={() => setActiveTab('details')}
//         >
//           Details
//         </button>
//         <button
//           className={`px-4 py-2 font-semibold ${activeTab === 'status' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500'
//             }`}
//           onClick={() => setActiveTab('status')}
//         >
//           Status
//         </button>
//       </div>

//       {activeTab === 'details' && (
//         <div className="space-y-6">
//           <ComponentCard title="Lead Info">
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//               <InfoItem label="Booking ID" value={lead.checkout?.bookingId} />
//               <InfoItem label="Order Status" value={lead.checkout?.orderStatus} />
//               <InfoItem label="Payment Status" value={lead.checkout?.paymentStatus} />
//               <InfoItem
//                 label="Accepted Date"
//                 value={
//                   lead.checkout?.acceptedDate
//                     ? format(new Date(lead.checkout.acceptedDate), 'dd MMM yyyy hh:mm a')
//                     : 'N/A'
//                 }
//               />
//               <div className="md:col-span-2">
//                 <InfoItem label="Notes" value={lead.checkout?.notes} />
//               </div>
//             </div>
//           </ComponentCard>

//           {(lead.extraService?.length ?? 0) > 0 && (
//             <ComponentCard title="Extra Services">
//               <table className="w-full text-sm border border-gray-300">
//                 <thead className="bg-gray-100">
//                   <tr>
//                     <th className="px-4 py-2 border">#</th>
//                     <th className="px-4 py-2 border text-left">Service Name</th>
//                     <th className="px-4 py-2 border">Price</th>
//                     <th className="px-4 py-2 border">Discount</th>
//                     <th className="px-4 py-2 border">Total</th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {lead.extraService!.map((item, index) => (
//                     <tr key={index}>
//                       <td className="px-4 py-2 border text-center">{index + 1}</td>
//                       <td className="px-4 py-2 border">{item.serviceName}</td>
//                       <td className="px-4 py-2 border text-center">₹{item.price}</td>
//                       <td className="px-4 py-2 border text-center">₹{item.discount}</td>
//                       <td className="px-4 py-2 border text-center">₹{item.total}</td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>

//               {(() => {
//                 const listingPrice = lead.extraService?.reduce((sum, item) => sum + item.price, 0);
//                 const serviceDiscount = lead.extraService?.reduce((sum, item) => sum + item.discount, 0);
//                 const priceAfterDiscount = lead.extraService?.reduce((sum, item) => sum + item.total, 0);

//                 // GST from checkoutInfo (percentage)
//                 const gstPercentage = checkoutInfo?.gst ?? 0;
//                 const gstAmount = (priceAfterDiscount * gstPercentage) / 100;

//                 // Assurity fee from state (percentage)
//                 const assurityAmount = (priceAfterDiscount * assurityFee) / 100;

//                 const extraServiceTotal = priceAfterDiscount + gstAmount + assurityAmount;

//                 // Store for further use if needed
//                 setExtraServiceTotal(extraServiceTotal);

//                 return (
//                   <div className="mt-4 text-sm border border-gray-300">
//                     <div className="flex justify-between px-4 py-2 border-b">
//                       <span>Listing Price:</span>
//                       <span>₹{listingPrice.toFixed(2)}</span>
//                     </div>
//                     <div className="flex justify-between px-4 py-2 border-b">
//                       <span>Service Discount:</span>
//                       <span>₹-{serviceDiscount.toFixed(2)}</span>
//                     </div>
//                     <div className="flex justify-between px-4 py-2 border-b">
//                       <span>Price After Discount:</span>
//                       <span>₹{priceAfterDiscount.toFixed(2)}</span>
//                     </div>
//                     <div className="flex justify-between px-4 py-2 border-b">
//                       <span>Service GST ({gstPercentage}%):</span>
//                       <span>₹{gstAmount.toFixed(2)}</span>
//                     </div>
//                     <div className="flex justify-between px-4 py-2 border-b">
//                       <span>Fetch True Assurity Charges ({assurityFee}%):</span>
//                       <span>₹{assurityAmount.toFixed(2)}</span>
//                     </div>
//                     <div className="flex justify-between px-4 py-2 font-semibold">
//                       <span>Extra Service Total:</span>
//                       <span>₹{extraServiceTotal.toFixed(2)}</span>
//                     </div>
//                   </div>
//                 );
//               })()}

//               <div className="flex items-center gap-4">
//                 {/* Input with symbol */}
//                 <div className="relative w-40">
//                   <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm select-none">
//                     {extraCommissionType === "percentage" ? "%" : "₹"}
//                   </span>
//                   <Input
//                     type="text"
//                     value={extraCommissionValue}
//                     onChange={handleExtraCommissionChange}
//                     placeholder="Commission"
//                     className="pl-8 pr-3 py-2 text-sm w-full"
//                   />
//                 </div>

//                 {/* Type selector buttons */}
//                 <div className="flex gap-2">
//                   <button
//                     type="button"
//                     onClick={() => handleExtraTypeChange("percentage")}
//                     className={`px-3 py-2 rounded-md border text-sm transition ${extraCommissionType === "percentage"
//                       ? "bg-blue-600 text-white border-blue-600"
//                       : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100"
//                       }`}
//                   >
//                     %
//                   </button>
//                   <button
//                     type="button"
//                     onClick={() => handleExtraTypeChange("amount")}
//                     className={`px-3 py-2 rounded-md border text-sm transition ${extraCommissionType === "amount"
//                       ? "bg-blue-600 text-white border-blue-600"
//                       : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100"
//                       }`}
//                   >
//                     ₹
//                   </button>
//                 </div>
//               </div>
//             </ComponentCard>
//           )}
//         </div>
//       )}

//       {activeTab === 'status' && (
//         <ComponentCard title="Lead Status Updates">
//           <BookingStatus checkout={checkoutDetails} />
//         </ComponentCard>
//       )}

//       {/* ✅ Action Buttons / Done */}
//       <div className="flex justify-end mt-8">
//         {!isApproved ? (
//           <button
//             onClick={handleApprove}
//             className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg shadow font-medium"
//           >
//             Approve
//           </button>
//         ) : null}
//       </div>
//     </div>
//   );
// };

// const InfoItem = ({ label, value }: { label: string; value?: string | number | null }) => (
//   <div>
//     <div className="text-sm text-gray-500">{label}</div>
//     <div className="text-base font-medium text-gray-800">{value ?? 'N/A'}</div>
//   </div>
// );

// export default LeadRequestDetails;


'use client';

import React, { useEffect, useState } from 'react';
import PageBreadcrumb from '@/components/common/PageBreadCrumb';
import ComponentCard from '@/components/common/ComponentCard';
import { useParams, useRouter } from 'next/navigation';
import { Lead, useLead } from '@/context/LeadContext';
import { format } from 'date-fns';
import BookingStatus from '@/components/booking-management/BookingStatus';
import axios from 'axios';
import { Checkout, useCheckout } from '@/context/CheckoutContext';
import Label from '@/components/form/Label';
import Input from '@/components/form/input/InputField';
import { useService } from '@/context/ServiceContext';

const LeadRequestDetails = () => {
  const params = useParams();
  const leadId = params?.id as string;
  const { getLeadById, fetchLeads, updateLead } = useLead();
  const { fetchCheckoutById } = useCheckout();
  const router = useRouter();
  const [lead, setLead] = useState<Lead | null>(null);
  const [activeTab, setActiveTab] = useState<'details' | 'status'>('details');
  const [extraCommissionValue, setExtraCommissionValue] = useState<string>('');
  const [newCommissionValue, setNewCommissionValue] = useState<string>('');
  const [isApproved, setIsApproved] = useState(false);
  const { fetchSingleService, singleService } = useService();
  const [extraCommissionType, setExtraCommissionType] = useState<'percentage' | 'amount'>('percentage');
  const [newCommissionType, setNewCommissionType] = useState<'percentage' | 'amount'>('percentage');
  const [assurityFee, setAssurityFee] = useState<number>(0);
  const [checkoutInfo, setCheckoutInfo] = useState<Checkout | null>(null);
  const [extraServiceTotal, setExtraServiceTotal] = useState<number>(0);
  const [checkoutDetails] = useState<any>(null);

  const checkoutId = lead?.checkout?._id;

  useEffect(() => {
    if (checkoutId) {
      (async () => {
        const data = await fetchCheckoutById(checkoutId);
        if (data) {
          setCheckoutInfo(data);
        }
      })();
    }
  }, [checkoutId]);

  useEffect(() => {
    const fetchCommission = async () => {
      try {
        const res = await axios.get("https://biz-booster.vercel.app/api/commission");
        if (Array.isArray(res.data) && res.data.length > 0) {
          setAssurityFee(Number(res.data[0].assurityfee) || 0);
        }
      } catch (error) {
        console.error("Error fetching commission data:", error);
      }
    };
    fetchCommission();
  }, []);

  useEffect(() => {
    if (leadId) {
      (async () => {
        const result = await getLeadById(leadId);
        setLead(result);
      })();
    }
  }, [leadId, getLeadById]);

  useEffect(() => {
    if (lead?.checkout?.service) {
      fetchSingleService(lead.checkout.service);
    }
  }, [lead?.checkout?.service]);

  // Calculate extra service total only when dependencies change
  useEffect(() => {
    if (lead?.extraService && lead.extraService.length > 0) {
      const priceAfterDiscount = lead.extraService.reduce((sum, item) => sum + item.total, 0);
      const gstPercentage = checkoutInfo?.gst ?? 0;
      const gstAmount = (priceAfterDiscount * gstPercentage) / 100;
      const assurityAmount = (priceAfterDiscount * assurityFee) / 100;
      setExtraServiceTotal(priceAfterDiscount + gstAmount + assurityAmount);
    }
  }, [lead?.extraService, checkoutInfo?.gst, assurityFee]);

  const handleApprove = async () => {
    if (!lead) return alert('Missing lead or commission value');

    const fallbackCommissionRaw = singleService?.franchiseDetails?.commission;
    const fallbackCommission = fallbackCommissionRaw?.replace(/[^0-9.]/g, "") || "";

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

      const approvalFormData = new FormData();
      approvalFormData.append("updateType", "adminApproval");
      approvalFormData.append("isAdminApproved", "true");

      const response = await axios.put(`/api/leads/${lead._id}`, approvalFormData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (checkoutInfo?._id) {
      const newGrandTotal = Number((extraServiceTotal + (checkoutInfo.totalAmount ?? 0)).toFixed(2));
      const roundedExtraServiceTotal = Number(extraServiceTotal.toFixed(2));

      await fetch(`/api/checkout/add-on-service/${checkoutInfo._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          extraServicePrice: roundedExtraServiceTotal,
          grandTotal: newGrandTotal
        })
      });
    }

      if (response.data.success) {
        alert('Commission and Lead approved successfully');
        fetchLeads();
        const updatedLead = await getLeadById(lead._id);
        setLead(updatedLead);
        setExtraCommissionValue('');
        setNewCommissionValue('');
        setIsApproved(true);
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
        <p className="text-sm text-gray-600">
          Status: <span className="font-medium">{lead.checkout?.orderStatus || 'N/A'}</span>
        </p>
      </div>

      <div className="flex gap-4 border-b pb-2 mb-4">
        <button
          className={`px-4 py-2 font-semibold ${activeTab === 'details' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500'}`}
          onClick={() => setActiveTab('details')}
        >
          Details
        </button>
        <button
          className={`px-4 py-2 font-semibold ${activeTab === 'status' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500'}`}
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

              {(() => {
                const listingPrice = lead.extraService?.reduce((sum, item) => sum + item.price, 0) ?? 0;
                const serviceDiscount = lead.extraService?.reduce((sum, item) => sum + item.discount, 0) ?? 0;
                const priceAfterDiscount = lead.extraService?.reduce((sum, item) => sum + item.total, 0) ?? 0;
                const gstPercentage = checkoutInfo?.gst ?? 0;
                const gstAmount = (priceAfterDiscount * gstPercentage) / 100;
                const assurityAmount = (priceAfterDiscount * assurityFee) / 100;

                return (
                  <div className="mt-4 text-sm border border-gray-300">
                    <div className="flex justify-between px-4 py-2 border-b">
                      <span>Listing Price:</span>
                      <span>₹{listingPrice.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between px-4 py-2 border-b">
                      <span>Service Discount:</span>
                      <span>₹-{serviceDiscount.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between px-4 py-2 border-b">
                      <span>Price After Discount:</span>
                      <span>₹{priceAfterDiscount.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between px-4 py-2 border-b">
                      <span>Service GST ({gstPercentage}%):</span>
                      <span>₹{gstAmount.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between px-4 py-2 border-b">
                      <span>Fetch True Assurity Charges ({assurityFee}%):</span>
                      <span>₹{assurityAmount.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between px-4 py-2 font-semibold">
                      <span>Extra Service Total:</span>
                      <span>₹{extraServiceTotal.toFixed(2)}</span>
                    </div>
                  </div>
                );
              })()}

              <div className="flex items-center gap-4">
                <div className="relative w-40">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm select-none">
                    {extraCommissionType === "percentage" ? "%" : "₹"}
                  </span>
                  <Input
                    type="text"
                    value={extraCommissionValue}
                    onChange={(e) => /^\d*$/.test(e.target.value) && setExtraCommissionValue(e.target.value)}
                    placeholder="Commission"
                    className="pl-8 pr-3 py-2 text-sm w-full"
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setExtraCommissionType("percentage")}
                    className={`px-3 py-2 rounded-md border text-sm transition ${extraCommissionType === "percentage"
                      ? "bg-blue-600 text-white border-blue-600"
                      : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100"
                      }`}
                  >
                    %
                  </button>
                  <button
                    type="button"
                    onClick={() => setExtraCommissionType("amount")}
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

      <div className="flex justify-end mt-8">
        {!isApproved && (
          <button
            onClick={handleApprove}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg shadow font-medium"
          >
            Approve
          </button>
        )}
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
