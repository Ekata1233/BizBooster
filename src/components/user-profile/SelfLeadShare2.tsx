"use client";

import React, { useEffect, useState } from "react";
import ComponentCard from "@/components/common/ComponentCard";
import BasicTableOne from "@/components/tables/BasicTableOne";
import { EyeIcon } from "@/icons";
import { useCheckout } from "@/context/CheckoutContext";
import Link from "next/link";

interface SelfLeadProps {
  userId: string;
  isAction: boolean;
}

interface CommissionData {
  checkoutId: string;
  share_1: number;
  share_2: number;
}

const columnsSelfLead = [
  { header: "Sr", accessor: "sr" },
  { header: "Lead Id", accessor: "leadId" },
  { header: "Service Name", accessor: "serviceName" },
  {
    header: "Contact Details",
    accessor: "contactDetails",
    render: (row: any) => (
      <div className="text-sm text-gray-700">
        <div className="font-semibold">{row.userName}</div>
        <div>{row.userEmail}</div>
        <div>{row.userPhone}</div>
      </div>
    ),
  },
  { header: "Price", accessor: "price" },
  { header: "My Commission", accessor: "commission" },
  {
    header: "Lead Status",
    accessor: "leadStatus",
    render: (row: any) => {
      const status = row.leadStatus;
      let color = "";
      switch (status) {
        case "completed":
          color = "bg-green-100 text-green-600 border-green-300";
          break;
        case "pending":
          color = "bg-yellow-100 text-yellow-600 border-yellow-300";
          break;
        case "ongoing":
          color = "bg-blue-100 text-blue-600 border-blue-300";
          break;
        case "Accepted":
          color = "bg-blue-100 text-blue-600 border-blue-300";
          break;
        case "cancelled":
          color = "bg-red-100 text-red-600 border-red-300";
          break;
        default:
          color = "bg-gray-100 text-gray-600 border-gray-300";
      }
      return (
        <span className={`px-2 py-1 rounded-full text-xs border ${color}`}>
          {status}
        </span>
      );
    },
  },
  {
    header: "Action",
    accessor: "action",
    render: (row: any) => (
      <div className="flex gap-2">
        <Link href={`/booking-management/all-booking/${row.id}`} passHref>
          <button className="text-blue-500 border border-blue-500 rounded-md p-2 hover:bg-blue-500 hover:text-white">
            <EyeIcon size={16} />
          </button>
        </Link>
      </div>
    ),
  },
];

const SelfLeadShare2 = ({ userId, isAction }: SelfLeadProps) => {
  const { fetchCheckoutByUser, checkouts, loading, error } = useCheckout();
  const [commissions, setCommissions] = useState<CommissionData[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await fetchCheckoutByUser(userId);
        console.log("Checkout data by user:", data);
      } catch (err) {
        console.error("Error fetching checkout:", err);
      }
    };

    if (userId) {
      fetchData();
    }
  }, [userId]);

  // Fetch commission for each checkoutId
  useEffect(() => {
    if (!checkouts || checkouts.length === 0) return;

    const fetchCommissions = async () => {
      const results: CommissionData[] = [];

      await Promise.all(
        checkouts.map(async (checkout) => {
          try {
            const res = await fetch(
              `/api/upcoming-lead-commission/find-by-checkoutId/${checkout._id}`
            );
            const json = await res.json();

            console.log("json : ", json)
            if (json.success && json.data) {
              results.push({
                checkoutId: checkout._id,
                share_1: json.data.share_1 ?? 0,
                share_2: json.data.share_2 ?? 0,
              });
            } else {
              results.push({ checkoutId: checkout._id, share_1: 0, share_2: 0 });
            }
          } catch (err) {
            results.push({ checkoutId: checkout._id, share_1: 0, share_2: 0 });
          }
        })
      );

      setCommissions(results);
    };

    fetchCommissions();
  }, [checkouts]);

  if (loading) return <p>Loading...</p>;

  if (error) {
    return (
      <ComponentCard title="Self Lead Table">
        <div className="p-4 text-red-600">Error: {error}</div>
      </ComponentCard>
    );
  }

  if (!checkouts || checkouts.length === 0) {
    return (
      <ComponentCard title="Self Lead Table">
        <div className="p-4 text-gray-600 text-sm">No self leads found.</div>
      </ComponentCard>
    );
  }

  const mappedData = checkouts.map((checkout, index) => {
    const customer = checkout?.serviceCustomer || {};
    const commissionEntry = commissions.find(
      (c) => c.checkoutId === checkout._id
    );
    const myCommission = commissionEntry
      ? `₹${commissionEntry.share_2.toLocaleString()}`
      : "₹0";

    let commissionWithStatus: React.ReactNode = (
      <div className="flex flex-col">
        <span>{myCommission}</span>
        {checkout?.isCompleted && (
          <span className="text-xs text-green-600">(completed)</span>
        )}
        {!checkout?.isCompleted && checkout?.isAccepted && (
          <span className="text-xs text-blue-600">(expected)</span>
        )}
      </div>
    );

    return {
      id: checkout._id,
      sr: index + 1,
      leadId: checkout?.bookingId || "N/A",
      serviceName: checkout?.service?.serviceName || "N/A",
      userName: customer?.fullName || "N/A",
      userEmail: customer?.email || "N/A",
      userPhone: customer?.phone || "N/A",
      price: `₹${Number(checkout?.totalAmount ?? 0).toLocaleString()}`,
      commission: commissionWithStatus,
      leadStatus: checkout?.isCompleted
        ? "completed"
        : checkout?.isAccepted
          ? "Accepted"
          : checkout?.orderStatus === "processing"
            ? "ongoing"
            : checkout?.isCanceled
              ? "cancelled"
              : "pending",
    };
  });


  return (
    <ComponentCard title="Self Lead Table">
      <BasicTableOne columns={columnsSelfLead} data={mappedData} />
    </ComponentCard>
  );
};

export default SelfLeadShare2;
