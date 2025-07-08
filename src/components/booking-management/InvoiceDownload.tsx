'use client';

import React, { useEffect, useRef, useState } from 'react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { Lead, useLead } from '@/context/LeadContext';
import { Checkout } from '@/context/CheckoutContext';
import { Provider, useProvider } from '@/context/ProviderContext';
import { IServiceCustomer } from '@/models/ServiceCustomer';
import Image from 'next/image';
import img from '../../../public/images/logo/fetcht-true.jpg'

interface InvoiceDownloadProps {
  checkoutDetails: Checkout;
  serviceCustomer: IServiceCustomer | null;
}

export default function InvoiceDownload({ checkoutDetails, serviceCustomer }: InvoiceDownloadProps) {
  const invoiceRef = useRef<HTMLDivElement>(null);
  const { getProviderById } = useProvider();
  const { getLeadByCheckoutId } = useLead();
  const [leadDetails, setLead] = useState<Lead | null>(null);
  const [providerDetails, setProviderDetails] = useState<Provider | null>(null)

  console.log("provdier in invoice : ", providerDetails)

  useEffect(() => {
    const fetchLead = async () => {
      if (!checkoutDetails?._id) return;

      try {
        const fetchedLead = await getLeadByCheckoutId(checkoutDetails._id);

        if (!fetchedLead) {
          console.warn("No lead found for ID:", checkoutDetails._id);
          return;
        }

        setLead(fetchedLead);
      } catch (error: any) {
        if (error.response?.status === 404) {
          console.warn("Lead not found (404) for ID:", checkoutDetails._id);
        } else {
          console.error("Error fetching lead:", error.message || error);
        }
      }
    };

    fetchLead();
  }, [checkoutDetails]);

  useEffect(() => {
    const fetchProvider = async () => {
      console.log("checout in invoice : ", checkoutDetails?.provider)
      if (!checkoutDetails?.provider) return;
      try {
        const providerId = typeof checkoutDetails?.provider === 'string'
          ? checkoutDetails.provider
          : checkoutDetails?.provider?._id;

        const fetchedProvider = await getProviderById(providerId);
        setProviderDetails(fetchedProvider); // ✅ now this works
      } catch (error: unknown) {
        if (error instanceof Error) {
          console.error("Error fetching provider:", error.message);
        } else {
          console.error("Unexpected error:", error);
        }
      }

    };


    fetchProvider();
  }, [checkoutDetails]);


  const handleDownload = async () => {
    const element = invoiceRef.current;
    if (!element) return;

    const originalDisplay = element.style.display;
    const originalPosition = element.style.position;
    const originalLeft = element.style.left;

    element.style.display = 'block';
    element.style.position = 'absolute';
    element.style.left = '-9999px';

    try {
      const canvas = await html2canvas(element, { scale: 2 });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`invoice-${checkoutDetails?.bookingId || 'download'}.pdf`);
    } catch (err) {
      console.error('PDF generation failed:', err);
    } finally {
      element.style.display = originalDisplay;
      element.style.position = originalPosition;
      element.style.left = originalLeft;
    }
  };

  const formatDateTime = (dateStr?: string) => dateStr ? new Date(dateStr).toLocaleString('en-IN') : 'N/A';
  const formatPrice = (amount: number) => `₹${amount?.toFixed(2)}`;

  // const hasExtraServices = Array.isArray(leadDetails?.extraService) && leadDetails.extraService.length > 0;
  const hasExtraServices =
    leadDetails?.isAdminApproved === true &&
    Array.isArray(leadDetails?.extraService) &&
    leadDetails.extraService.length > 0;

  const updatedAmount = leadDetails?.newAmount;

  const baseAmount = leadDetails?.afterDicountAmount ?? checkoutDetails?.totalAmount ?? 0;
  const assurityfee = checkoutDetails?.assurityfee ?? 0;
  const platformFee = checkoutDetails?.platformFee ?? 0;
  const extraAmount = leadDetails?.extraService?.reduce((sum, service) => sum + (service.total || 0), 0) ?? 0;
  const grandTotal = baseAmount + extraAmount + assurityfee + platformFee;
  return (
    <div className="p-4">
      <button
        onClick={handleDownload}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        Download Invoice
      </button>
      <div
        ref={invoiceRef}
        style={{
          display: 'none',
          width: '794px',
          padding: '30px',
          fontFamily: 'Arial, sans-serif',
          fontSize: '13px',
          lineHeight: '1.2',
          color: '#000',
          backgroundColor: '#fff',
          margin: '0 auto',
          boxSizing: 'border-box',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
          <div>
            <h2 style={{ fontSize: '18px', margin: 0 }}>Invoice</h2>
            <p style={{ margin: '4px 0' }}>Booking #{checkoutDetails?.bookingId}</p>
            <p>Date: {formatDateTime(checkoutDetails?.createdAt)}</p>
          </div>
          <div style={{ textAlign: 'right', lineHeight: '1.6' }}>
            {/* <Image
                            src="../../../public/images/logo/fetcht-true.jpg"
                            alt="Company Logo"
                            width={100}
                            height={50}
                        /> */}
            <p>3rd Floor, 307 Amanora Chamber, Amanora Mall, Hadapsar, Pune – 411028</p>
            <p>+91 93096 517500</p>
            <p>info@bizbooster2x.com</p>
          </div>

        </div>
        <div style={{ border: '1px solid #ccc', padding: '16px', marginBottom: '20px', fontSize: '14px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
            <div style={{ width: '30%' }}>
              <p><strong>Customer Details</strong></p>
              <p>{serviceCustomer?.fullName || '-'}</p>
            </div>
            <div style={{ width: '20%' }}>
              <p><strong>Email</strong></p>
              <p>{serviceCustomer?.email || '-'}</p>
            </div>
            <div style={{ width: '25%' }}>
              <p><strong>Phone</strong></p>
              <p>{serviceCustomer?.phone || '-'}</p>
            </div>
            <div style={{ width: '25%' }}>
              <p><strong>Invoice of (INR)</strong></p>
              <p style={{ fontWeight: 'bold', fontSize: '18px', color: '#007bff' }}>
                {formatPrice(grandTotal || 0)}
              </p>

            </div>
          </div>
          <hr style={{ margin: '16px 0' }} />
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <div style={{ width: '33%' }}>
              <p><strong>Payment</strong></p>
              <p>{checkoutDetails?.paymentMethod || 'Cash after service'}</p>
              <p><strong>Reference ID:</strong> {checkoutDetails?.bookingId}</p>
            </div>
            <div style={{ width: '33%' }}>
              <p><strong>Service Provider</strong></p>
              <p>{providerDetails?.fullName}</p>
              <p>{providerDetails?.email}</p>
              <p>{providerDetails?.phoneNo || '-'}</p>
            </div>
            <div style={{ width: '33%' }}>
              <p><strong>Service Time</strong></p>
              <p>Request: {formatDateTime(checkoutDetails?.createdAt)}</p>
              <p>
                Service: {checkoutDetails?.serviceDate ? formatDateTime(checkoutDetails.serviceDate.toISOString()) : 'N/A'}
              </p>

            </div>
          </div>
        </div>


        <div style={{ margin: '20px 0' }}>
          <h3 style={{ fontWeight: 600, marginBottom: '10px', color: '#333' }}>Booking Summary</h3>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
            <thead style={{ backgroundColor: '#f3f3f3' }}>
              <tr>
                <th style={thStyle}>Service</th>
                <th style={thStyle}>Price</th>
                <th style={thStyle}>Discount Price</th>
                <th style={thStyle}>Total</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={tdStyle}>{checkoutDetails?.service?.serviceName || 'N/A'}</td>
                <td style={tdStyle}>
                  {formatPrice(leadDetails?.newAmount ?? checkoutDetails?.service?.price ?? 0)}
                </td>
                <td style={tdStyle}>
                  {formatPrice(leadDetails?.newDiscountAmount ?? checkoutDetails?.service?.discountedPrice ?? 0)}
                </td>
                <td style={tdStyle}>
                  {formatPrice(leadDetails?.afterDicountAmount ?? checkoutDetails?.totalAmount ?? 0)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Summary Totals */}
        <div style={{ marginTop: '20px', fontSize: '13px', color: '#222' }}>
          {[
            ['Subtotal', leadDetails?.newAmount ?? checkoutDetails?.service?.price ?? 0],
            ['Discount', leadDetails?.newDiscountAmount ?? (checkoutDetails?.service?.price - checkoutDetails?.service?.discountedPrice) ?? 0],
            ['Campaign Discount', 0],
            ['Coupon Discount', checkoutDetails.couponDiscount || 0],
            ['VAT', 0],
            ['Platform Fee', 0],
            ['Total', leadDetails?.afterDicountAmount ?? checkoutDetails?.service?.discountedPrice ?? 0],
          ].map(([label, amount]) => (
            <div key={label} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
              <span style={{ fontWeight: 500 }}>{label}:</span>
              <span>{formatPrice(Number(amount))}</span>
            </div>
          ))}

          {/* Extra Services */}
          {hasExtraServices && (() => {
            const extraServices = leadDetails!.extraService!;
            const subtotal = extraServices.reduce((acc, s) => acc + (s.price || 0), 0);
            const totalDiscount = extraServices.reduce((acc, s) => acc + (s.discount || 0), 0);
            const extraTotal = extraServices.reduce((acc, s) => acc + (s.total || 0), 0);

            return (
              <>
                <h4 style={{ fontWeight: 600, marginTop: '30px', marginBottom: '10px', color: '#333' }}>Extra Services</h4>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', marginBottom: '10px' }}>
                  <thead style={{ backgroundColor: '#f3f3f3' }}>
                    <tr>
                      <th style={thStyle}>SL</th>
                      <th style={thStyle}>Service Name</th>
                      <th style={thStyle}>Price</th>
                      <th style={thStyle}>Discount</th>
                      <th style={thStyle}>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {extraServices.map((service, index) => (
                      <tr key={index}>
                        <td style={tdStyle}>{index + 1}</td>
                        <td style={tdStyle}>{service.serviceName}</td>
                        <td style={tdStyle}>{formatPrice(service.price)}</td>
                        <td style={tdStyle}>{formatPrice(service.discount)}</td>
                        <td style={tdStyle}>{formatPrice(service.total)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {[
                  ['Subtotal', subtotal],
                  ['Discount', totalDiscount],
                  ['Campaign Discount', 0],
                  ['Coupon Discount', checkoutDetails.couponDiscount || 0],
                  ['VAT', 0],
                  ['Platform Fee', 0],
                  ['Extra Service Total', extraTotal],
                ].map(([label, amount]) => (
                  <div key={label} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span style={{ fontWeight: 500 }}>{label}:</span>
                    <span>{formatPrice(Number(amount))}</span>
                  </div>
                ))}
              </>
            );
          })()}

          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px', fontWeight: 'bold', color: '#007bff' }}>
            <span>Grand Total</span>
            <span>{formatPrice(grandTotal)}</span>
          </div>
        </div>

        {/* Footer */}
        <div style={{ marginTop: '30px', borderTop: '1px solid #ccc', paddingTop: '10px' }}>
          <p><strong>Terms & Conditions</strong></p>
          <p>
            All service purchases are final and non-refundable once the project has been initiated or delivered. Refunds are
            not applicable for change-of-mind requests or delays caused by incomplete information or approvals from the client.
          </p>
          <p>
            Customers who opt for the "Assurity" option at the time of purchase are eligible for a 100% refund in case of
            dissatisfaction, subject to company review and approval. This assurance is designed to provide added confidence
            and transparency in our service process.
          </p>
          <p>
            Please read the full Terms & Conditions for complete details regarding our refund policy and service commitments.
          </p>
        </div>


        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginTop: '40px',
          fontSize: '13px',
          color: '#555',
          gap: '20px',
          backgroundColor: '#f0f0f0',
          padding: '10px'
        }}>
          <span>bizbooster.lifelinecart.com</span>
          <span>+91 93096 517500</span>
          <span>info@bizbooster2x.com</span>
        </div>
      </div>
    </div>
  );
}

// Styles
const thStyle = {
  border: '1px solid #ccc',
  padding: '8px',
  textAlign: 'left' as const,
  fontWeight: 'bold',
  backgroundColor: '#f9f9f9',
};

const tdStyle = {
  border: '1px solid #ccc',
  padding: '8px',
  textAlign: 'left' as const,
};
