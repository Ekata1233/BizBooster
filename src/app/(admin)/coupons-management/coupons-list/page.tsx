'use client';

import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';

/* ───── components & helpers ──────────────────────────────────────────────── */
import PageBreadcrumb from '@/components/common/PageBreadCrumb';
import ComponentCard from '@/components/common/ComponentCard';
import BasicTableOne from '@/components/tables/BasicTableOne';
import Label from '@/components/form/Label';
import Input from '@/components/form/input/InputField';

/* ───── icons ─────────────────────────────────────────────────────────────── */
import { TrashBinIcon, UserIcon, ArrowUpIcon, PencilIcon, EyeIcon } from '@/icons';
import { useCoupon } from '@/context/CouponContext';
import { useCategory } from '@/context/CategoryContext';
import StatCard from '@/components/common/StatCard';
import Link from 'next/link';
import Pagination from '@/components/tables/Pagination';

/* -------------------------------------------------------------------------- */
/* 🔖 interfaces                                                              */
/* -------------------------------------------------------------------------- */

export interface CouponType {
  _id: string;
  couponType: 'default' | 'firstBooking' | 'customerWise';
  couponCode: string;
  discountType: 'Category Wise' | 'Service Wise' | 'Mixed';
  discountAmountType: 'Fixed Amount' | 'Percentage';
  discountCostBearer: 'Provider' | 'Admin';
  discountTitle: string;
  amount?: number;
  maxDiscount?: number;
  minPurchase: number;
  limitPerUser: number;
  startDate: string;
  endDate: string;
  isActive: boolean;
  zone?: { _id: string; name: string };
  category?: { _id: string; name: string };
  service?: { _id: string; serviceName: string };
  customer?: { _id: string; fullName: string };
  createdAt?: string;
  updatedAt?: string;
  couponAppliesTo?: string;
  isDeleted?: boolean;
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
/* 🔖 constants                                                               */
/* -------------------------------------------------------------------------- */

const sortOptions = [
  { value: 'latest', label: 'Latest' },
  { value: 'oldest', label: 'Oldest' },
  { value: 'ascending', label: 'Ascending' },
  { value: 'descending', label: 'Descending' },
];

const couponTypeOptions = [
  { value: 'default', label: 'Default' },
  { value: 'firstBooking', label: 'First Booking' },
  { value: 'customerWise', label: 'Customer Wise' },
];

type TabType = 'All' | 'Active' | 'Inactive';

/* -------------------------------------------------------------------------- */
/* 🔖 component                                                               */
/* -------------------------------------------------------------------------- */

const CouponList: React.FC = () => {
  /* ─── contexts ─────────────────────────────────────────────────────────── */
  const { coupons, deleteCoupon } = useCoupon();
  const { categories } = useCategory();

  const categoryMap = Object.fromEntries(categories.map(c => [c._id, c.name]));

  /* ─── ui state ─────────────────────────────────────────────────────────── */
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('');
  const [sort, setSort] = useState<'latest' | 'oldest' | 'ascending' | 'descending'>('latest');
  const [selectedTab, setSelectedTab] = useState<TabType>('All');

  const [rows, setRows] = useState<TableData[]>([]);
  const [allRows, setAllRows] = useState<TableData[]>([]);
  const [message, setMessage] = useState('');

  /* ─── pagination state ─────────────────────────────────────────────────── */
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  /* ─── helpers ──────────────────────────────────────────────────────────── */
  const formatValidity = (c: CouponType) =>
    `${new Date(c.startDate).toLocaleDateString()} – ${new Date(
      c.endDate,
    ).toLocaleDateString()}`;

  const formatDiscount = (c: CouponType) =>
    c.discountAmountType === 'Percentage'
      ? `${c.amount}%${c.maxDiscount ? ` (max ₹${c.maxDiscount})` : ''}`
      : `₹${c.amount}`;

  const formatAppliesTo = (c: CouponType) => {
    if (c.category) return categoryMap[c.category._id] ?? c.category.name;
    if (c.service) return c.service.serviceName;
    if (c.couponType === 'customerWise') return 'Customer';
    return c.zone?.name ?? '-';
  };

  const getCouponStatus = (coupon: CouponType): 'Active' | 'Inactive' => {
    return coupon.isActive ? 'Active' : 'Inactive';
  };

  /* ─── fetch data ───────────────────────────────────────────────────────── */
  useEffect(() => {
    fetchFilteredCoupons();
    setCurrentPage(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterType, sort]);

  const fetchFilteredCoupons = async () => {
    try {
      const params: Record<string, string> = {
        ...(filterType && { couponType: filterType }),
        ...(sort && { sort }),
      };

      const res = await axios.get<{ data: CouponType[] }>('/api/coupon/all', { params });
      const data: CouponType[] = res.data.data ?? [];
      
      console.log('📦 Raw coupon data from API:', data);

      if (data.length === 0) {
        setRows([]);
        setAllRows([]);
        setMessage('No coupons found.');
        return;
      }
      
      /* map to table-friendly rows */
      const mapped = data.map<TableData>((c, index) => {
        const status = getCouponStatus(c);
        return {
          id: c._id,
          srNo: index + 1,
          couponCode: c.couponCode,
          couponType: c.couponType,
          discountTitle: c.discountTitle,
          discount: formatDiscount(c),
          appliesTo: formatAppliesTo(c),
          validity: formatValidity(c),
          status: status,
        };
      });

      setAllRows(mapped); // Store all data
      
      // Filter by selected tab
      const filteredByTab = filterRowsByTab(mapped, selectedTab);
      setRows(filteredByTab);
      
      setMessage('');
    } catch (e) {
      console.error(e);
      setMessage('Failed to load coupons.');
    }
  };

  /* ─── filter rows by tab ──────────────────────────────────────────────── */
  const filterRowsByTab = (rowsToFilter: TableData[], tab: TabType): TableData[] => {
    if (tab === 'All') return rowsToFilter;
    return rowsToFilter.filter(row => row.status === tab);
  };

  /* ─── search functionality ─────────────────────────────────────────────── */
  useEffect(() => {
    setCurrentPage(1);

    if (!search.trim()) {
      const filteredByTab = filterRowsByTab(allRows, selectedTab);
      setRows(filteredByTab);
      return;
    }

    const searchTerm = search.toLowerCase().trim();
    
    const filtered = allRows.filter(row => {
      const matchesSearch = 
        row.couponCode.toLowerCase().includes(searchTerm) ||
        row.couponType.toLowerCase().includes(searchTerm) ||
        row.discountTitle.toLowerCase().includes(searchTerm) ||
        row.discount.toLowerCase().includes(searchTerm) ||
        row.appliesTo.toLowerCase().includes(searchTerm) ||
        row.validity.toLowerCase().includes(searchTerm) ||
        row.status.toLowerCase().includes(searchTerm);
      
      // Also filter by selected tab
      const matchesTab = selectedTab === 'All' || row.status === selectedTab;
      
      return matchesSearch && matchesTab;
    });

    setRows(filtered);
    
    if (filtered.length === 0) {
      setMessage('No coupons match your search criteria.');
    } else {
      setMessage('');
    }
  }, [search, allRows, selectedTab]);

  /* ─── handle tab change ───────────────────────────────────────────────── */
  const handleTabChange = (tab: TabType) => {
    setSelectedTab(tab);
    
    if (!search.trim()) {
      const filteredByTab = filterRowsByTab(allRows, tab);
      setRows(filteredByTab);
    } else {
      // If there's a search term, reapply both filters
      const searchTerm = search.toLowerCase().trim();
      const filtered = allRows.filter(row => {
        const matchesSearch = 
          row.couponCode.toLowerCase().includes(searchTerm) ||
          row.couponType.toLowerCase().includes(searchTerm) ||
          row.discountTitle.toLowerCase().includes(searchTerm) ||
          row.discount.toLowerCase().includes(searchTerm) ||
          row.appliesTo.toLowerCase().includes(searchTerm) ||
          row.validity.toLowerCase().includes(searchTerm) ||
          row.status.toLowerCase().includes(searchTerm);
        
        const matchesTab = tab === 'All' || row.status === tab;
        
        return matchesSearch && matchesTab;
      });
      
      setRows(filtered);
    }
  };

  /* ─── pagination calculations ──────────────────────────────────────────── */
  const totalPages = Math.ceil(rows.length / itemsPerPage);

  const paginatedRows = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return rows.slice(start, start + itemsPerPage);
  }, [rows, currentPage]);

  /* ─── actions ──────────────────────────────────────────────────────────── */
  const handleDelete = async (id: string) => {
    if (!confirm('Delete this coupon?')) return;
    await deleteCoupon(id);
    await fetchFilteredCoupons();
    alert('Coupon deleted.');
  };

  /* ─── count coupons by status ─────────────────────────────────────────── */
  const countCouponsByTab = (tab: TabType): number => {
    if (tab === 'All') return allRows.length;
    return allRows.filter(row => row.status === tab).length;
  };

  /* ─── table columns ────────────────────────────────────────────────────── */
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
          className={`px-3 py-1 rounded-full text-sm font-semibold
            ${row.status === 'Inactive'
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
          <Link href={`/coupons-management/coupons-list/update-coupon/${row.id}`}>
            <button className="text-yellow-500 border border-yellow-500 rounded-md p-2 hover:bg-yellow-500 hover:text-white">
              <PencilIcon />
            </button>
          </Link>
          <button
            onClick={() => handleDelete(row.id)}
            className="text-red-500 border border-red-500 rounded-md p-2 hover:bg-red-500 hover:text-white"
          >
            <TrashBinIcon />
          </button>
          <Link href={`/coupons-management/coupons-list/${row.id}`}>
            <button className="text-blue-500 border border-blue-500 rounded-md p-2 hover:bg-blue-500 hover:text-white">
              <EyeIcon />
            </button>
          </Link>
        </div>
      ),
    },
  ];

  return (
    <div>
      <PageBreadcrumb pageTitle="Coupons" />

      <div className="flex flex-col lg:flex-row gap-6">
        <div className="w-full lg:w-3/4 my-5">
          <ComponentCard title="Search & Filter">
            <Label>Search Coupons</Label>
            <Input
              placeholder="Search by code name"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </ComponentCard>
        </div>

        <div className="w-full lg:w-1/4 my-5">
          <StatCard
            title="Total Coupons"
            value={coupons.length}
            icon={UserIcon}
            badgeColor="success"
            badgeValue="0.00%"
            badgeIcon={ArrowUpIcon}
          />
        </div>
      </div>

      {/* Tabs with counts */}
      <div className="flex gap-6 mb-5 border-b border-gray-200">
        {(['All', 'Active', 'Inactive'] as const).map((tab) => {
          const active = selectedTab === tab;
          const count = countCouponsByTab(tab);

          return (
            <button
              key={tab}
              onClick={() => handleTabChange(tab)}
              className={`relative pb-3 text-sm font-medium transition-colors ${
                active ? 'text-blue-600' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab}
              <span className="ml-2 bg-red-500 text-white text-xs font-semibold px-2 py-0.5 rounded-full">
                {count}
              </span>
              {active && (
                <span className="absolute left-0 -bottom-[1px] h-[2px] w-full rounded-full bg-blue-600" />
              )}
            </button>
          );
        })}
      </div>

      {/* Table Section */}
      <ComponentCard title="All Coupons">
        {message ? (
          <p className="text-red-500 text-center my-4">{message}</p>
        ) : (
          <>
            <BasicTableOne columns={columns} data={paginatedRows} />

            {totalPages > 1 && (
              <div className="flex justify-center mt-4">
                <Pagination
                  currentPage={currentPage}
                  totalItems={rows.length}
                  onPageChange={setCurrentPage}
                />
              </div>
            )}
          </>
        )}
      </ComponentCard>
    </div>
  );
};

export default CouponList;