"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";
import ResponsiveTable from "@/components/tables/ResponsiveTable";

const PackageEarningsSection = () => {
  const [packageEarnings, setPackageEarnings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const limit = 10;
  const [total, setTotal] = useState(0);

  const columns = [
    {
      header: "Commission From",
      accessor: "commissionFrom",
      render: (r: any) => (
        <div className="flex flex-col">
          <span className="font-medium">{r?.commissionFrom?.fullName || "-"}</span>
          <span className="text-xs text-gray-500">
            {r?.commissionFrom?.userId || "-"}
          </span>
        </div>
      ),
    },
    { header: "Share 1", accessor: "share_1", render: (r: any) => `₹${r.share_1}` },
    { header: "Share 2", accessor: "share_2", render: (r: any) => `₹${r.share_2}` },
    {
      header: "Admin Commission",
      accessor: "admin_commission",
      render: (r: any) => `₹${r.admin_commission}`,
    },
    { header: "Status", accessor: "status" },
  ];

  const fetchPackage = async () => {
    try {
      setLoading(true);
      const res = await axios.get(
        `/api/business-report/package?page=${page}&limit=${limit}`
      );

      setPackageEarnings(res.data.data || []);
      setTotal(res.data.total || 0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPackage();
  }, [page]);

  return (
    <ResponsiveTable
      columns={columns}
      data={packageEarnings}
      page={page}
      limit={limit}
      total={total}
      onPageChange={setPage}
    />
  );
};

export default PackageEarningsSection;
