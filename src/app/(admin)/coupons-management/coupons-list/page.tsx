// 'use client';

// import React, { useEffect, useState } from 'react';
// import axios from 'axios';

// /* ───── components & helpers ──────────────────────────────────────────────── */
// import PageBreadcrumb from '@/components/common/PageBreadCrumb';
// import ComponentCard from '@/components/common/ComponentCard';
// import BasicTableOne from '@/components/tables/BasicTableOne';
// import Label from '@/components/form/Label';
// import Input from '@/components/form/input/InputField';
// import Select from '@/components/form/Select';

// /* ───── icons ─────────────────────────────────────────────────────────────── */
// import { ChevronDownIcon, TrashBinIcon, UserIcon, ArrowUpIcon, PencilIcon, EyeIcon } from '@/icons';
// import { useCoupon } from '@/context/CouponContext';
// import { useSubcategory } from '@/context/SubcategoryContext';
// import { useCategory } from '@/context/CategoryContext';
// import StatCard from '@/components/common/StatCard';
// import EditCouponModal from '@/components/coupon-component/EditCouponModal';


// /* -------------------------------------------------------------------------- */
// /* 🔖 interfaces                                                              */
// /* -------------------------------------------------------------------------- */

// export interface CouponType {
//   _id: string;
//   couponType: 'default' | 'firstBooking' | 'customerWise';
//   couponCode: string;
//   discountType: 'Category Wise' | 'Service Wise' | 'Mixed';
//   discountAmountType: 'Fixed Amount' | 'Percentage';
//   discountCostBearer: 'Provider' | 'Customer';
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
// }

// export interface TableData {
//   id: string;
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

// const sortOptions = [
//   { value: 'latest', label: 'Latest' },
//   { value: 'oldest', label: 'Oldest' },
//   { value: 'ascending', label: 'Ascending' },
//   { value: 'descending', label: 'Descending' },
// ];

// const couponTypeOptions = [
//   { value: 'default', label: 'Default' },
//   { value: 'firstBooking', label: 'First Booking' },
//   { value: 'customerWise', label: 'Customer Wise' },
// ];

// /* -------------------------------------------------------------------------- */
// /* 🔖 component                                                               */
// /* -------------------------------------------------------------------------- */

// const CouponList: React.FC = () => {
//   /* ─── contexts ─────────────────────────────────────────────────────────── */
//   const { coupons, deleteCoupon } = useCoupon();
//   const [isModalOpen, setIsModalOpen] = useState(false);
//   const [editingCoupon, setEditingCoupon] = useState<CouponType | null>(null);

//   const { categories } = useCategory();
//   const { subcategories } = useSubcategory();

//   const categoryMap = Object.fromEntries(categories.map(c => [c._id, c.name]));
//   const subcategoryMap = Object.fromEntries(subcategories.map(s => [s._id, s.name]));

//   /* ─── ui state ─────────────────────────────────────────────────────────── */
//   const [search, setSearch] = useState('');
//   const [filterType, setFilterType] = useState('');
//   const [sort, setSort] = useState<'latest' | 'oldest' | 'ascending' | 'descending'>('latest');

//   const [rows, setRows] = useState<TableData[]>([]);
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
//     if (c.couponType === 'customerWise') return 'Customer';     // fallback
//     return c.zone?.name ?? '-';
//   };

//   /* ─── fetch + filter ───────────────────────────────────────────────────── */
//   useEffect(() => {
//     fetchFilteredCoupons();
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [search, filterType, sort]);

//   const fetchFilteredCoupons = async () => {
//     try {
//       const params: Record<string, string> = {
//         ...(search && { search }),
//         ...(filterType && { couponType: filterType }),
//         ...(sort && { sort }),
//       };

//       const res = await axios.get<CouponType[]>('/api/coupon', { params });
//       console.log("Coupons API response:", res.data); // ← debug log

//       const data: CouponType[] = Array.isArray(res.data)
//         ? res.data
//         : res.data.data ?? [];

//       if (data.length === 0) {
//         setRows([]);
//         setMessage('No coupons found.');
//         return;
//       }

//       /* map to table-friendly rows */
//       const mapped = data.map<TableData>((c) => ({
//         id: c._id,
//         couponCode: c.couponCode,
//         couponType: c.couponType,
//         discountTitle: c.discountTitle,
//         discount: formatDiscount(c),
//         appliesTo: formatAppliesTo(c),
//         validity: formatValidity(c),
//         status: c.isActive ? 'Active' : 'Inactive',
//       }));

//       setRows(mapped);
//       setMessage('');
//     } catch (e) {
//       console.error(e);
//       setMessage('Failed to load coupons.');
//     }
//   };

//   /* ─── actions ──────────────────────────────────────────────────────────── */
//   const handleDelete = async (id: string) => {
//     if (!confirm('Delete this coupon?')) return;
//     try {
//       await deleteCoupon(id);
//       await fetchFilteredCoupons();
//       alert('Coupon deleted.');
//     } catch (e) {
//       console.error(e);
//       alert('Failed to delete coupon.');
//     }
//   };

//   const handleEdit = (id: string) => {
//     const found = coupons.find(c => c._id === id);
//     if (found) {
//       setEditingCoupon(found);
//       setIsModalOpen(true);
//     }
//   };

//   /* ─── save (PUT) ────────────────────────────────────────────────────────── */
//   const handleUpdateCoupon = async (payload: Partial<CouponType>) => {
//     if (!editingCoupon) return;
//     await axios.put(`/api/coupon/${editingCoupon._id}`, payload);
//     setIsModalOpen(false);
//     await fetchFilteredCoupons();          // refresh list
//   };

//   /* ─── table columns ────────────────────────────────────────────────────── */
//   const columns = [
//     { header: 'Code', accessor: 'couponCode' },
//     { header: 'Type', accessor: 'couponType' },
//     { header: 'Title', accessor: 'discountTitle' },
//     { header: 'Discount', accessor: 'discount' },
//     // { header: 'Applies To', accessor: 'appliesTo' },
//     { header: 'Validity', accessor: 'validity' },
//     {
//       header: 'Status',
//       accessor: 'status',
//       render: (row: TableData) => (
//         <span
//           className={`px-3 py-1 rounded-full text-sm font-semibold
//             ${row.status === 'Inactive'
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
//           <button
//             onClick={() => handleEdit(row.id)}
//             className="text-yellow-500 border border-yellow-500 rounded-md p-2 hover:bg-yellow-500 hover:text-white"
//           >
//             <PencilIcon />
//           </button>
//           <button
//             onClick={() => handleDelete(row.id)}
//             className="text-red-500 border border-red-500 rounded-md p-2 hover:bg-red-500 hover:text-white"
//           >
//             <TrashBinIcon />
//           </button>
//           <button
//             className="text-blue-500 border border-blue-500 rounded-md p-2 hover:bg-blue-500 hover:text-white"
//           >
//             <EyeIcon />
//           </button>
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
//           <ComponentCard title="Search & Filter" className=" h-full">
//             <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 md:gap-6 py-3">
//               {/* Coupon Type Filter */}
//               <div>
//                 <Label>Coupon Type</Label>
//                 <div className="relative">
//                   <Select
//                     options={[{ value: '', label: 'All' }, ...couponTypeOptions]}
//                     placeholder="Select Type"
//                     onChange={setFilterType}
//                     className="dark:bg-dark-900"
//                   />
//                   <span className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500 dark:text-gray-400">
//                     <ChevronDownIcon />
//                   </span>
//                 </div>
//               </div>

//               {/* Sort */}
//               <div>
//                 <Label>Sort</Label>
//                 <div className="relative">
//                   <Select
//                     options={sortOptions}
//                     placeholder="Sort by"
//                     onChange={setSort}
//                     className="dark:bg-dark-900"
//                   />
//                   <span className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500 dark:text-gray-400">
//                     <ChevronDownIcon />
//                   </span>
//                 </div>
//               </div>

//               {/* Search */}
//               <div>
//                 <Label>Search by Code</Label>
//                 <Input
//                   placeholder="e.g. SAVE15"
//                   value={search}
//                   onChange={(e) => setSearch(e.target.value)}
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


//       {/* ▸─ table ─────────────────────────────────────────────────────────── */}
//       <ComponentCard title="All Coupons">
//         {message
//           ? <p className="text-red-500 text-center my-4">{message}</p>
//           : <BasicTableOne columns={columns} data={rows} />
//         }
//       </ComponentCard>

//       {/* …existing JSX… */}

//       <EditCouponModal
//         isOpen={isModalOpen}
//         onClose={() => setIsModalOpen(false)}
//         coupon={editingCoupon}
//         onSave={handleUpdateCoupon}
//       />

//     </div>
//   );
// };

// export default CouponList;
import React from 'react'

function page() {
  return (
    <div>page</div>
  )
}

export default page