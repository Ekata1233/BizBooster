'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';

/* ───── components ─────────────────────────────────────────────── */
import PageBreadcrumb from '@/components/common/PageBreadCrumb';
import ComponentCard from '@/components/common/ComponentCard';
import BasicTableOne from '@/components/tables/BasicTableOne';
import Label from '@/components/form/Label';
import Input from '@/components/form/input/InputField';
import StatCard from '@/components/common/StatCard';

/* ───── icons ─────────────────────────────────────────────────── */
import {
  TrashBinIcon,
  UserIcon,
  ArrowUpIcon,
  EyeIcon,
  CheckLineIcon,
  ErrorIcon,
} from '@/icons';

/* ───── contexts ──────────────────────────────────────────────── */
import { useCoupon } from '@/context/CouponContext';
import { useCategory } from '@/context/CategoryContext';
import { useSubcategory } from '@/context/SubcategoryContext';

/* -------------------------------------------------------------------------- */
/* 🔖 types                                                                    */
/* -------------------------------------------------------------------------- */

export interface CouponType {
  _id: string;
  couponType: string;
  couponCode: string;
  discountAmountType: 'Fixed Amount' | 'Percentage';
  discountTitle: string;
  amount?: number;
  maxDiscount?: number;
  minPurchase: number;
  limitPerUser: number;
  startDate: string;
  endDate: string;
  isActive: boolean;
  isDeleted?: boolean;
  category?: { _id: string; name: string };
  service?: { _id: string; serviceName: string };
  zone?: { _id: string; name: string };
}

export interface TableData {
  id: string;
  srNo: number;
  couponCode: string;
  couponType: string;
  discountTitle: string;
  discount: string;
  appliesTo: string;
  validity: string;
  status: string;
}

/* -------------------------------------------------------------------------- */
/* 🔖 component                                                                */
/* -------------------------------------------------------------------------- */

const CouponList: React.FC = () => {
  const {
    approvalCoupons,
    fetchApprovalCoupons,
    deleteCoupon,
  } = useCoupon();

  const { categories } = useCategory();
  const { subcategories } = useSubcategory();

  const categoryMap = Object.fromEntries(categories.map(c => [c._id, c.name]));
  const subcategoryMap = Object.fromEntries(subcategories.map(s => [s._id, s.name]));

  const [search, setSearch] = useState('');
  const [rows, setRows] = useState<TableData[]>([]);
  const [allRows, setAllRows] = useState<TableData[]>([]);
  const [message, setMessage] = useState('');

  /* ---------------- helpers ---------------- */

  const formatValidity = (c: CouponType) =>
    `${new Date(c.startDate).toLocaleDateString()} – ${new Date(
      c.endDate
    ).toLocaleDateString()}`;

  const formatDiscount = (c: CouponType) =>
    c.discountAmountType === 'Percentage'
      ? `${c.amount}%${c.maxDiscount ? ` (max ₹${c.maxDiscount})` : ''}`
      : `₹${c.amount}`;

  const formatAppliesTo = (c: CouponType) => {
    if (c.category) return categoryMap[c.category._id] ?? c.category.name;
    if (c.service) return c.service.serviceName;
    return c.zone?.name ?? '-';
  };

  /* ---------------- map approval coupons ---------------- */

  const mapCouponsToRows = (data: CouponType[]) => {
    const mapped = data.map<TableData>((c, index) => ({
      id: c._id,
      srNo: index + 1,
      couponCode: c.couponCode,
      couponType: c.couponType,
      discountTitle: c.discountTitle,
      discount: formatDiscount(c),
      appliesTo: formatAppliesTo(c),
      validity: formatValidity(c),
      status: !c.isActive || c.isDeleted ? 'Expired' : 'Active',
    }));

    setAllRows(mapped);
    setRows(mapped);
    setMessage(mapped.length ? '' : 'No coupons pending approval.');
  };

  /* ---------------- effects ---------------- */

  useEffect(() => {
    fetchApprovalCoupons();
  }, []);

  useEffect(() => {
    if (approvalCoupons.length) {
      mapCouponsToRows(approvalCoupons as CouponType[]);
    }
  }, [approvalCoupons]);

  /* ---------------- search ---------------- */

  useEffect(() => {
    if (!search.trim()) {
      setRows(allRows);
      return;
    }

    const term = search.toLowerCase();
    const filtered = allRows.filter(row =>
      Object.values(row).some(val =>
        String(val).toLowerCase().includes(term)
      )
    );

    setRows(filtered);
    setMessage(filtered.length ? '' : 'No coupons match your search.');
  }, [search, allRows]);

  /* ---------------- actions ---------------- */

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this coupon?')) return;
    await deleteCoupon(id);
    fetchApprovalCoupons();
  };

  const handleApprove = async (id: string) => {
  try {
    const res = await fetch(`/api/coupon/approve/${id}`, {
      method: 'PUT',
    });

    const data = await res.json();

    if (!data.success) {
      alert(data.message || 'Approval failed');
      return;
    }
alert('Coupon approved successfully');
    fetchApprovalCoupons(); // refresh list
  } catch (error) {
    console.error('Approve error:', error);
    alert('Something went wrong while approving coupon');
  }
};

  /* ---------------- table columns ---------------- */

  const columns = [
    { header: 'Sr No.', accessor: 'srNo' },
    { header: 'Code', accessor: 'couponCode' },
    { header: 'Type', accessor: 'couponType' },
    { header: 'Title', accessor: 'discountTitle' },
    { header: 'Discount', accessor: 'discount' },
    { header: 'Validity', accessor: 'validity' },
    {
      header: 'Status',
      accessor: 'status',
      render: (row: TableData) => (
        <span
          className={`px-3 py-1 rounded-full text-sm font-semibold ${
            row.status === 'Expired'
              ? 'text-red-600 bg-red-100 border border-red-300'
              : 'text-green-600 bg-green-100 border border-green-300'
          }`}
        >
          {row.status}
        </span>
      ),
    },
    {
      header: 'Action',
      accessor: 'action',
      render: (row: TableData) => (
        <div className="flex gap-2">
         <button
  onClick={() => handleApprove(row.id)}
  className="text-green-500 border border-green-500 rounded-md p-2 hover:bg-green-500 hover:text-white"
  title="Approve Coupon"
>
  <CheckLineIcon />
</button>


          <button
            onClick={() => handleDelete(row.id)}
            className="text-red-500 border border-red-500 rounded-md p-2 hover:bg-red-500 hover:text-white"
          >
            <TrashBinIcon />
          </button>

          <Link href={`/coupons-management/coupons-request/${row.id}`}>
            <button className="text-blue-500 border border-blue-500 rounded-md p-2 hover:bg-blue-500 hover:text-white">
              <EyeIcon />
            </button>
          </Link>
        </div>
      ),
    },
  ];

  /* ---------------- render ---------------- */

  return (
    <div>
      <PageBreadcrumb pageTitle="Coupons Request" />

      <div className="flex flex-col lg:flex-row gap-6">
        <div className="w-full lg:w-3/4 my-5">
          <ComponentCard title="Search Coupons">
            <Label>Search</Label>
            <Input
              placeholder="Search coupons"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </ComponentCard>
        </div>

        <div className="w-full lg:w-1/4 my-5">
          <StatCard
            title="Total Requests"
            value={approvalCoupons.length}
            icon={UserIcon}
            badgeColor="success"
            badgeValue="Live"
            badgeIcon={ArrowUpIcon}
          />
        </div>
      </div>

      <ComponentCard title="Coupons Pending Approval">
        {rows.length === 0 ? (
  <div className="flex flex-col items-center justify-center py-16 px-6 border-2 border-dashed border-gray-300 rounded-xl bg-gray-50">
    {/* <div className="flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 text-blue-600 mb-4"> */}
      <ErrorIcon className="w-12 h-12" />
    {/* </div> */}

    <h3 className="text-lg font-semibold text-gray-700 mb-1">
      No Coupons Found
    </h3>

    <p className="text-sm text-gray-500 text-center max-w-md">
      {message}
    </p>
  </div>
) : (
          <BasicTableOne columns={columns} data={rows} />
        )}
      </ComponentCard>
    </div>
  );
};

export default CouponList;
