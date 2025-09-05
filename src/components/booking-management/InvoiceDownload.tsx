'use client';

import React from 'react';

interface InvoiceDownloadProps {
  checkoutDetails: any;
}

const InvoiceDownload: React.FC<InvoiceDownloadProps> = ({ checkoutDetails }) => {

  const handleDownload = async () => {
    if (!checkoutDetails?._id) return;

    try {
      const response = await fetch(`https://api.fetchtrue.com/api/invoice/${checkoutDetails._id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/pdf',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch invoice');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `invoice-${checkoutDetails.bookingId || checkoutDetails._id}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Error downloading invoice:', error);
    }
  };

  return (
    <button
      onClick={handleDownload}
      className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
    >
      Download Invoice
    </button>
  );
};

export default InvoiceDownload;
