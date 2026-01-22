// 'use client';

// import React, { useEffect, useState } from 'react';
// import axios from 'axios';

// /* ───── components & helpers ──────────────────────────────────────────────── */
// import PageBreadcrumb from '@/components/common/PageBreadCrumb';
// import ComponentCard from '@/components/common/ComponentCard';
// import BasicTableOne from '@/components/tables/BasicTableOne';
// import Label from '@/components/form/Label';
// import Input from '@/components/form/input/InputField';

// /* ───── icons ─────────────────────────────────────────────────────────────── */
// import {  TrashBinIcon, UserIcon, ArrowUpIcon, PencilIcon, EyeIcon } from '@/icons';
// import { useCoupon } from '@/context/CouponContext';
// import { useSubcategory } from '@/context/SubcategoryContext';
// import { useCategory } from '@/context/CategoryContext';
// import StatCard from '@/components/common/StatCard';
// import Link from 'next/link';

// /* -------------------------------------------------------------------------- */
// /* 🔖 interfaces                                                              */
// /* -------------------------------------------------------------------------- */

// export interface CouponType {
//   _id: string;
//   couponType: 'default' | 'firstBooking' | 'customerWise';
//   couponCode: string;
//   discountType: 'Category Wise' | 'Service Wise' | 'Mixed';
//   discountAmountType: 'Fixed Amount' | 'Percentage';
//   discountCostBearer: 'Provider' | 'Admin';
//   discountTitle: string;
//   amount?: number;
//   maxDiscount?: number;
//   minPurchase: number;
//   limitPerUser: number;
//   startDate: string;
//   endDate: string;
//   isActive: boolean;
//   zone?: { _id: string; name: string };
//   category?: { _id: string; name: string };
//   service?: { _id: string; serviceName: string };
//   customer?: { _id: string; fullName: string };
//   createdAt?: string;
//   updatedAt?: string;
//   couponAppliesTo?: string;
// }

// export interface TableData {
//   id: string;
//   srNo: number;
//   couponCode: string;
//   couponType: string;
//   discountTitle: string;
//   discount: string;
//   appliesTo: string;
//   validity: string;
//   status: string;
// }

// /* -------------------------------------------------------------------------- */
// /* 🔖 constants                                                               */
// /* -------------------------------------------------------------------------- */


// const CouponList: React.FC = () => {
//   /* ─── contexts ─────────────────────────────────────────────────────────── */
//   const { coupons, deleteCoupon } = useCoupon();
//   const { categories } = useCategory();
//   const categoryMap = Object.fromEntries(categories.map(c => [c._id, c.name]));

//   /* ─── ui state ─────────────────────────────────────────────────────────── */
//   const [search, setSearch] = useState('');
//   const [filterType, setFilterType] = useState('');
//   const [sort, setSort] = useState<'latest' | 'oldest' | 'ascending' | 'descending'>('latest');

//   const [rows, setRows] = useState<TableData[]>([]);
//   const [allRows, setAllRows] = useState<TableData[]>([]); // Store all data for client-side filtering
//   const [message, setMessage] = useState<string>('');

//   /* ─── helpers ──────────────────────────────────────────────────────────── */
//   const formatValidity = (c: CouponType) =>
//     `${new Date(c.startDate).toLocaleDateString()} – ${new Date(c.endDate).toLocaleDateString()}`;

//   const formatDiscount = (c: CouponType) =>
//     c.discountAmountType === 'Percentage'
//       ? `${c.amount}%${c.maxDiscount ? ` (max ₹${c.maxDiscount})` : ''}`
//       : `₹${c.amount}`;

//   const formatAppliesTo = (c: CouponType) => {
//     if (c.category) return categoryMap[c.category._id] ?? c.category.name;
//     if (c.service) return c.service.serviceName;
//     if (c.couponType === 'customerWise') return 'Customer';
//     return c.zone?.name ?? '-';
//   };

//   /* ─── fetch data ───────────────────────────────────────────────────────── */
//   useEffect(() => {
//     fetchFilteredCoupons();
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [filterType, sort]); // Remove search from dependencies

//   const fetchFilteredCoupons = async () => {
//     try {
//       const params: Record<string, string> = {
//         ...(filterType && { couponType: filterType }),
//         ...(sort && { sort }),
//       };

//       const res = await axios.get<{ data: CouponType[] }>('/api/coupon/all', { params });
//       const data: CouponType[] = res.data.data ?? [];
//   console.log('📦 Raw coupon data from API:', data);
//       if (data.length === 0) {
//         setRows([]);
//         setAllRows([]);
//         setMessage('No coupons found.');
//         return;
//       }
//       /* map to table-friendly rows */
//       const mapped = data.map<TableData>((c, index) => ({
//         id: c._id,
//         srNo: index + 1,
//         couponCode: c.couponCode,
//         couponType: c.couponType,
//         discountTitle: c.discountTitle,
//         discount: formatDiscount(c),
//         appliesTo: formatAppliesTo(c),
//         validity: formatValidity(c),
//         status: !c.isActive || (c as any).isDeleted ? 'Expired' : 'Active',
//       }));

//       setAllRows(mapped); // Store all data
//       setRows(mapped); // Initially show all data
//       setMessage('');
//     } catch (e) {
//       console.error(e);
//       setMessage('Failed to load coupons.');
//     }
//   };

//   /* ─── search functionality ─────────────────────────────────────────────── */
//   useEffect(() => {
//     if (!search.trim()) {
//       setRows(allRows); // Show all data when search is empty
//       return;
//     }

//     const searchTerm = search.toLowerCase().trim();
    
//     const filtered = allRows.filter(row => 
//       row.couponCode.toLowerCase().includes(searchTerm) ||
//       row.couponType.toLowerCase().includes(searchTerm) ||
//       row.discountTitle.toLowerCase().includes(searchTerm) ||
//       row.discount.toLowerCase().includes(searchTerm) ||
//       row.appliesTo.toLowerCase().includes(searchTerm) ||
//       row.validity.toLowerCase().includes(searchTerm) ||
//       row.status.toLowerCase().includes(searchTerm)
//     );

//     setRows(filtered);
    
//     if (filtered.length === 0) {
//       setMessage('No coupons match your search criteria.');
//     } else {
//       setMessage('');
//     }
//   }, [search, allRows]);

//   /* ─── actions ──────────────────────────────────────────────────────────── */
//   const handleDelete = async (id: string) => {
//     if (!confirm('Delete this coupon?')) return;
//     try {
//       await deleteCoupon(id);
//       await fetchFilteredCoupons(); // Refresh data
//       alert('Coupon deleted.');
//     } catch (e) {
//       console.error(e);
//       alert('Failed to delete coupon.');
//     }
//   };


//   /* ─── table columns ────────────────────────────────────────────────────── */
//   const columns = [
//     { header: 'Sr No.', accessor: 'srNo' },
//     { header: 'Code', accessor: 'couponCode' },
//     { header: 'Type', accessor: 'couponType' },
//     { header: 'Title', accessor: 'discountTitle' },
//     { header: 'Discount', accessor: 'discount' },
//     { header: 'Validity', accessor: 'validity' },
//     {
//       header: 'Status',
//       accessor: 'status',
//       render: (row: TableData) => (
//         <span
//           className={`px-3 py-1 rounded-full text-sm font-semibold
//             ${row.status === 'Expired'
//               ? 'text-red-600 bg-red-100 border border-red-300'
//               : 'text-green-600 bg-green-100 border border-green-300'
//             }`}
//         >
//           {row.status}
//         </span>
//       ),
//     },
//     {
//       header: 'Action',
//       accessor: 'action',
//       render: (row: TableData) => (
//         <div className="flex gap-2">
//           <Link href={`/coupons-management/coupons-list/update-coupon/${row.id}`} passHref>
//             <button
//               className="text-yellow-500 border border-yellow-500 rounded-md p-2 hover:bg-yellow-500 hover:text-white"
//             >
//               <PencilIcon />
//             </button>
//           </Link>
//           <button
//             onClick={() => handleDelete(row.id)}
//             className="text-red-500 border border-red-500 rounded-md p-2 hover:bg-red-500 hover:text-white"
//           >
//             <TrashBinIcon />
//           </button>
//           <Link href={`/coupons-management/coupons-list/${row.id}`} passHref>
//             <button className="text-blue-500 border border-blue-500 rounded-md p-2 hover:bg-blue-500 hover:text-white hover:border-blue-500">
//               <EyeIcon />
//             </button>
//           </Link>
//         </div>
//       ),
//     },
//   ];

//   return (
//     <div>
//       <PageBreadcrumb pageTitle="Coupons" />

//       <div className="flex flex-col lg:flex-row gap-6">
//         {/* Search & Filter Section */}
//         <div className="w-full lg:w-3/4 my-5 flex flex-col">
//           <ComponentCard title="Search & Filter" className="h-full">
//             <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 md:gap-6 py-3">
//               {/* Universal Search Bar */}
//               <div className="sm:col-span-2 lg:col-span-3 xl:col-span-4">
//                 <Label>Search Coupons</Label>
//                 <Input
//                   placeholder="Search by code name"
//                   value={search}
//                   onChange={(e) => setSearch(e.target.value)}
//                   className="w-full"
//                 />
//               </div>
//             </div>
//           </ComponentCard>
//         </div>

//         {/* Stat Card Section */}
//         <div className="w-full lg:w-1/4 my-5 flex flex-col">
//           <div className="h-full">
//             <StatCard
//               title="Total Coupons"
//               value={coupons.length}
//               icon={UserIcon}
//               badgeColor="success"
//               badgeValue="0.00%"
//               badgeIcon={ArrowUpIcon}
//             />
//           </div>
//         </div>
//       </div>

//       {/* Table Section */}
//       <ComponentCard title="All Coupons">
//         {message ? (
//           <p className="text-red-500 text-center my-4">{message}</p>
//         ) : (
//           <BasicTableOne columns={columns} data={rows} />
//           <div className="flex justify-center mt-4">
//                         <Pagination
//                           currentPage={currentPage}
//                           totalItems={.length}
//                           totalPages={totalPages}
//                           onPageChange={setCurrentPage}
//                         />
//                       </div>
//         )}
//       </ComponentCard>

      
//     </div>
//   );
// };

// export default CouponList;

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

const CouponList: React.FC = () => {
  /* ─── contexts ─────────────────────────────────────────────────────────── */
  const { coupons, deleteCoupon } = useCoupon();
  const { categories } = useCategory();

  const categoryMap = Object.fromEntries(categories.map(c => [c._id, c.name]));

  /* ─── ui state ─────────────────────────────────────────────────────────── */
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('');
  const [sort, setSort] =
    useState<'latest' | 'oldest' | 'ascending' | 'descending'>('latest');

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

      const res = await axios.get<{ data: CouponType[] }>(
        '/api/coupon/all',
        { params },
      );

      const data = res.data.data ?? [];

      if (!data.length) {
        setRows([]);
        setAllRows([]);
        setMessage('No coupons found.');
        return;
      }

      const mapped = data.map<TableData>((c, index) => ({
        id: c._id,
        srNo: index + 1,
        couponCode: c.couponCode,
        couponType: c.couponType,
        discountTitle: c.discountTitle,
        discount: formatDiscount(c),
        appliesTo: formatAppliesTo(c),
        validity: formatValidity(c),
        status: !c.isActive ? 'Expired' : 'Active',
      }));

      setAllRows(mapped);
      setRows(mapped);
      setMessage('');
    } catch (e) {
      console.error(e);
      setMessage('Failed to load coupons.');
    }
  };

  /* ─── search functionality ─────────────────────────────────────────────── */
  useEffect(() => {
    setCurrentPage(1);

    if (!search.trim()) {
      setRows(allRows);
      return;
    }

    const term = search.toLowerCase();
    const filtered = allRows.filter(row =>
      Object.values(row).some(val =>
        String(val).toLowerCase().includes(term),
      ),
    );

    setRows(filtered);
    setMessage(filtered.length ? '' : 'No coupons match your search criteria.');
  }, [search, allRows]);

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
                  // totalPages={totalPages}
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
