"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";
import ResponsiveTable from "@/components/tables/ResponsiveTable";

const LeadEarningsSection = () => {
  const [leadEarnings, setLeadEarnings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const limit = 10;
  const [total, setTotal] = useState(0);

  const formatAmount = (amount: number) => {
    if (!amount) return "₹0.00";
    return `₹${amount.toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const columns = [
    { header: "Booking ID", accessor: "bookingId" },
    {
      header: "Lead Price",
      accessor: "priceAfterDiscount",
      render: (r: any) => formatAmount(r.priceAfterDiscount),
    },
    {
      header: "Coupon Discount",
      accessor: "couponDiscountPrice",
      render: (r: any) => formatAmount(r.couponDiscountPrice),
    },
    {
      header: "Service GST",
      accessor: "serviceGSTPrice",
      render: (r: any) => formatAmount(r.serviceGSTPrice),
    },
    {
      header: "Platform Fee",
      accessor: "platformFeePrice",
      render: (r: any) => formatAmount(r.platformFeePrice),
    },
    {
      header: "Assurity Charges",
      accessor: "assurityChargesPrice",
      render: (r: any) => formatAmount(r.assurityChargesPrice),
    },
    {
      header: "Total Amount",
      accessor: "totalAmount",
      render: (r: any) => formatAmount(r.totalAmount),
    },
    {
      header: "Share 1",
      accessor: "share_1",
      render: (r: any) => (
        <div>
          <div>{formatAmount(r.share_1)}</div>
          <div className="text-xs text-gray-500">{formatAmount(r.extra_share_1)}</div>
        </div>
      ),
    },
    {
      header: "Share 2",
      accessor: "share_2",
      render: (r: any) => (
        <div>
          <div>{formatAmount(r.share_2)}</div>
          <div className="text-xs text-gray-500">{formatAmount(r.extra_share_2)}</div>
        </div>
      ),
    },
    {
      header: "Share 3",
      accessor: "share_3",
      render: (r: any) => (
        <div>
          <div>{formatAmount(r.share_3)}</div>
          <div className="text-xs text-gray-500">{formatAmount(r.extra_share_3)}</div>
        </div>
      ),
    },
    {
      header: "Provider",
      accessor: "provider_share",
      render: (r: any) => (
        <div>
          <div>{formatAmount(r.provider_share)}</div>
          <div className="text-xs text-gray-500">
            {formatAmount(r.extra_provider_share)}
          </div>
        </div>
      ),
    },
    {
      header: "Admin",
      accessor: "admin_commission",
      render: (r: any) => (
        <div>
          <div>{formatAmount(r.admin_commission)}</div>
          <div className="text-xs text-gray-500">
            {formatAmount(r.extra_admin_commission)}
          </div>
        </div>
      ),
    },
  ];

  const fetchLead = async () => {
    try {
      setLoading(true);
      const res = await axios.get(
        `/api/business-report/checkout?page=${page}&limit=${limit}`
      );

      setLeadEarnings(res.data.data || []);
      setTotal(res.data.total || 0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLead();
  }, [page]);

  return (
    <ResponsiveTable
      columns={columns}
      data={leadEarnings}
      page={page}
      limit={limit}
      total={total}
      onPageChange={setPage}
    />
  );
};

export default LeadEarningsSection;
