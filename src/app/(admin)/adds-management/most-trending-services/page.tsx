// 'use client';

// import React, { useEffect, useState } from 'react';
// import PageBreadcrumb from '@/components/common/PageBreadCrumb';
// import BasicTableOne from '@/components/tables/BasicTableOne';
// import ComponentCard from '@/components/common/ComponentCard';
// import Pagination from '@/components/tables/Pagination';
// import Switch from '@/components/form/switch/Switch';
// import Link from 'next/link';
// import axios from 'axios';
// import { ArrowUpIcon, ChevronDownIcon, EyeIcon } from '@/icons';
// import StatCard from '@/components/common/StatCard';
// import Label from '@/components/form/Label';
// import Input from '@/components/form/input/InputField';
// import { FaCube } from 'react-icons/fa';
// import Select from '@/components/form/Select';
// import { Category, useCategory } from '@/context/CategoryContext';
// import { useSubcategory } from '@/context/SubcategoryContext';

// /* -------------------- Types -------------------- */
// interface ServiceRow {
//   id: string;
//   name: string;
//   category: string;
//   status: 'Active' | 'Inactive';
//   mostlyTrending: boolean;
//   mostlyRecommended: boolean;
//   mostlyPopular: boolean;
// }

// const options = [
//   { value: "latest", label: "Latest" },
//   { value: "oldest", label: "Oldest" },
//   { value: "ascending", label: "Ascending" },
//   { value: "descending", label: "Descending" },
// ];
// /* -------------------- Component -------------------- */
// const MostHomeServicesPage = () => {
//     const { categories } = useCategory();
//     const { subcategories } = useSubcategory();
//   const [services, setServices] = useState<ServiceRow[]>([]);
//   const [loadingToggle, setLoadingToggle] = useState<string | null>(null);
//   const [currentPage, setCurrentPage] = useState(1);
//     const [sort, setSort] = useState<string>('oldest');
//     const [selectedCategory, setSelectedCategory] = useState('');
//     const [selectedSubcategory, setSelectedSubcategory] = useState('');
//     const [searchQuery, setSearchQuery] = useState<string>('');
//   const rowsPerPage = 10;


//   const categoryOptions = categories.map((cat: Category) => ({
//       value: cat._id ?? '',
//       label: cat.name,
//     }));
  
//     const filteredSubcategories = subcategories.filter(
//       (sub) => sub.category?._id === selectedCategory
//     );
  
//     const subcategoryOptions = filteredSubcategories.map((sub) => ({
//       value: sub._id ?? '',
//       label: sub.name,
//     }));

//       const handleSelectChange = (value: string) => {
//     setSelectedCategory(value);
//   };

//   const handleSelectSubcategory = (value: string) => {
//     setSelectedSubcategory(value);
//   };
//   /* -------------------- FETCH ALL SERVICES + FLAGS -------------------- */
//   const fetchAllData = async (page: number = 1) => {
//     try {
//             const params = {
//         page,
//         limit: rowsPerPage,
//         ...(searchQuery && { search: searchQuery }),
//         ...(selectedCategory && { category: selectedCategory }),
//         ...(selectedSubcategory && { subcategory: selectedSubcategory }),
//         ...(sort && { sort }),
//       };

//       const [
//         allServicesRes,
//         trendingRes,
//         recommendedRes,
//         popularRes,
//       ] = await Promise.all([
//         axios.get('/api/service', { params }),
//         axios.get('/api/service/mostlytrending'),
//         axios.get('/api/service/mostlyrecommended'),
//         axios.get('/api/service/mostlypopular'),
//       ]);

//       const trendingSet = new Set(
//         (trendingRes.data.data || []).map((i: any) => i.service?._id)
//       );
//       const recommendedSet = new Set(
//         (recommendedRes.data.data || []).map((i: any) => i.service?._id)
//       );
//       const popularSet = new Set(
//         (popularRes.data.data || []).map((i: any) => i.service?._id)
//       );

//       const mapped: ServiceRow[] = (allServicesRes.data.data || []).map(
//         (service: any) => ({
//           id: service._id,
//           name: service.serviceName,
//           category: service.category?.name || 'N/A',
//           status: service.isDeleted ? 'Inactive' : 'Active',
//           mostlyTrending: trendingSet.has(service._id),
//           mostlyRecommended: recommendedSet.has(service._id),
//           mostlyPopular: popularSet.has(service._id),
//         })
//       );

//       setServices(mapped);
//     } catch (error) {
//       console.error('Failed to load services', error);
//     }
//   };

//   useEffect(() => {
//     fetchAllData();
//   }, []);

//   /* -------------------- TOGGLE HANDLER -------------------- */
//  const handleToggle = async (
//   serviceId: string,
//   field: 'mostlyTrending' | 'mostlyRecommended' | 'mostlyPopular',
//   checked: boolean
// ) => {
//   // 🔴 Confirmation first
//   const confirmAction = window.confirm(
//     `Are you sure you want to ${checked ? 'enable' : 'disable'} this option?`
//   );

//   if (!confirmAction) {
//     return; // ❌ Stop if user cancels
//   }

//   try {
//     setLoadingToggle(serviceId);

//     // Optimistic UI
//     setServices((prev) =>
//       prev.map((s) =>
//         s.id === serviceId ? { ...s, [field]: checked } : s
//       )
//     );

//     const res = await axios.post('/api/service/most-home-service', {
//       service: serviceId,
//       [field]: checked,
//     });

//     // ✅ Show backend success message
//     if (res.data?.success) {
//       alert(res.data.message);
//     }
//   } catch (error: any) {
//     console.error('Toggle update failed', error);

//     // ❌ Revert UI on error
//     setServices((prev) =>
//       prev.map((s) =>
//         s.id === serviceId ? { ...s, [field]: !checked } : s
//       )
//     );

//     alert('Something went wrong. Please try again.');
//   } finally {
//     setLoadingToggle(null);
//   }
// };


//   /* -------------------- TABLE COLUMNS (NO DESIGN CHANGE) -------------------- */
//   const columns = [
//     {
//       header: 'S.No',
//       render: (_: any, index: number) =>
//         (currentPage - 1) * rowsPerPage + index + 1,
//     },
//     {
//       header: 'Service Name',
//       render: (row: ServiceRow) => (
//         <span className="font-semibold text-blue-600">{row.name}</span>
//       ),
//     },
//     {
//       header: 'Category',
//       render: (row: ServiceRow) => row.category,
//     },
//     {
//       header: 'Status',
//       render: (row: ServiceRow) => (
//         <span
//           className={`px-3 py-1 rounded-full text-sm font-semibold ${
//             row.status === 'Active'
//               ? 'text-green-600 bg-green-100 border border-green-300'
//               : 'text-red-500 bg-red-100 border border-red-300'
//           }`}
//         >
//           {row.status}
//         </span>
//       ),
//     },
//     {
//       header: 'Action',
//       render: (row: ServiceRow) => (
//         <Link href={`/service-management/service-details/${row.id}`}>
//           <button className="text-blue-500 border border-blue-500 rounded-md p-2 hover:bg-blue-500 hover:text-white">
//             <EyeIcon />
//           </button>
//         </Link>
//       ),
//     },
//     {
//       header: 'Mostly Trending',
//       render: (row: ServiceRow) => (
//         <Switch
//           checked={row.mostlyTrending}
//           disabled={loadingToggle === row.id}
//           onChange={(checked) =>
//             handleToggle(row.id, 'mostlyTrending', checked)
//           }
//         />
//       ),
//     },
//     {
//       header: 'Mostly Recommended',
//       render: (row: ServiceRow) => (
//         <Switch
//           checked={row.mostlyRecommended}
//           disabled={loadingToggle === row.id}
//           onChange={(checked) =>
//             handleToggle(row.id, 'mostlyRecommended', checked)
//           }
//         />
//       ),
//     },
//     {
//       header: 'Mostly Popular',
//       render: (row: ServiceRow) => (
//         <Switch
//           checked={row.mostlyPopular}
//           disabled={loadingToggle === row.id}
//           onChange={(checked) =>
//             handleToggle(row.id, 'mostlyPopular', checked)
//           }
//         />
//       ),
//     },
//   ];

//   /* -------------------- UI -------------------- */
//   return (
//     <div>
//       <PageBreadcrumb pageTitle="Most Home Services" />

//            <div className="my-5">
//              <ComponentCard title="Search Filter">
//                <div className="space-y-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 md:gap-6">
//                  <div>
//                    <Label>Select Category</Label>
//                    <div className="relative">
//                      <Select
//                        options={categoryOptions}
//                        placeholder="Select Category"
//                        onChange={handleSelectChange}
//                        className="dark:bg-dark-900"
//                      />
//                      <span className="absolute text-gray-500 -translate-y-1/2 pointer-events-none right-3 top-1/2 dark:text-gray-400">
//                        <ChevronDownIcon />
//                      </span>
//                    </div>
//                  </div>
     
//                  <div>
//                    <Label>Select Subcategory</Label>
//                    <div className="relative">
//                      <Select
//                        options={subcategoryOptions}
//                        placeholder="Select Subcategory"
//                        onChange={handleSelectSubcategory}
//                        className="dark:bg-dark-900"
//                      />
//                      <span className="absolute text-gray-500 -translate-y-1/2 pointer-events-none right-3 top-1/2 dark:text-gray-400">
//                        <ChevronDownIcon />
//                      </span>
//                    </div>
//                  </div>
     
//                  <div>
//                    <Label>Select Input</Label>
//                    <div className="relative">
//                      <Select
//                        options={options}
//                        placeholder="Sort By"
//                        onChange={(value: string) => setSort(value)}
//                        className="dark:bg-dark-900"
//                      />
//                      <span className="absolute text-gray-500 -translate-y-1/2 pointer-events-none right-3 top-1/2 dark:text-gray-400">
//                        <ChevronDownIcon />
//                      </span>
//                    </div>
//                  </div>
     
//                  <div>
//                    <Label>Other Filter</Label>
//                    <Input
//                      type="text"
//                      placeholder="Search by service name"
//                      value={searchQuery}
//                      onChange={(e) => setSearchQuery(e.target.value)}
//                    />
//                  </div>
//                </div>
//              </ComponentCard>
//            </div>

//       <ComponentCard title="All Services">
//         <BasicTableOne columns={columns} data={services} />

//         {services.length > rowsPerPage && (
//           <div className="flex justify-center mt-4">
//             <Pagination
//               currentPage={currentPage}
//               totalPages={Math.ceil(services.length / rowsPerPage)}
//               totalItems={services.length}
//               onPageChange={setCurrentPage}
//             />
//           </div>
//         )}
//       </ComponentCard>
//     </div>
//   );
// };

// export default MostHomeServicesPage;


'use client';

import React, { useEffect, useState } from 'react';
import PageBreadcrumb from '@/components/common/PageBreadCrumb';
import BasicTableOne from '@/components/tables/BasicTableOne';
import ComponentCard from '@/components/common/ComponentCard';
import Pagination from '@/components/tables/Pagination';
import Switch from '@/components/form/switch/Switch';
import Link from 'next/link';
import axios from 'axios';
import { ChevronDownIcon, EyeIcon } from '@/icons';
import Label from '@/components/form/Label';
import Input from '@/components/form/input/InputField';
import Select from '@/components/form/Select';
import { Category, useCategory } from '@/context/CategoryContext';
import { useSubcategory } from '@/context/SubcategoryContext';

/* -------------------- Types -------------------- */
interface ServiceRow {
  id: string;
  name: string;
  category: string;
  status: 'Active' | 'Inactive';
  mostlyTrending: boolean;
  mostlyRecommended: boolean;
  mostlyPopular: boolean;
}

/* -------------------- Sort Options -------------------- */
const options = [
  { value: 'latest', label: 'Latest' },
  { value: 'oldest', label: 'Oldest' },
  { value: 'ascending', label: 'Ascending' },
  { value: 'descending', label: 'Descending' },
];

/* -------------------- Debounce Hook -------------------- */
function useDebounce<T>(value: T, delay = 500): T {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}

/* -------------------- Component -------------------- */
const MostHomeServicesPage = () => {
  const { categories } = useCategory();
  const { subcategories } = useSubcategory();
const [totalServices, setTotalServices] = useState(0);
  const [services, setServices] = useState<ServiceRow[]>([]);
  const [loadingToggle, setLoadingToggle] = useState<string | null>(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [sort, setSort] = useState('oldest');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedSubcategory, setSelectedSubcategory] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const rowsPerPage = 10;

  /* -------------------- Debounced Values -------------------- */
  const debouncedSearch = useDebounce(searchQuery);
  const debouncedCategory = useDebounce(selectedCategory);
  const debouncedSubcategory = useDebounce(selectedSubcategory);
  const debouncedSort = useDebounce(sort);
  const debouncedPage = useDebounce(currentPage, 300);

  /* -------------------- Category Options -------------------- */
  const categoryOptions = categories.map((cat: Category) => ({
    value: cat._id ?? '',
    label: cat.name,
  }));

  const filteredSubcategories = subcategories.filter(
    (sub) => sub.category?._id === selectedCategory
  );

  const subcategoryOptions = filteredSubcategories.map((sub) => ({
    value: sub._id ?? '',
    label: sub.name,
  }));

  /* -------------------- Fetch Services -------------------- */
  const fetchAllData = async () => {
    try {
      const params = {
        page: debouncedPage,
        limit: rowsPerPage,
        ...(debouncedSearch && { search: debouncedSearch }),
        ...(debouncedCategory && { category: debouncedCategory }),
        ...(debouncedSubcategory && { subcategory: debouncedSubcategory }),
        ...(debouncedSort && { sort: debouncedSort }),
      };

      const [
        allServicesRes,
        trendingRes,
        recommendedRes,
        popularRes,
      ] = await Promise.all([
        axios.get('/api/service', { params }),
        axios.get('/api/service/mostlytrending'),
        axios.get('/api/service/mostlyrecommended'),
        axios.get('/api/service/mostlypopular'),
      ]);

      const trendingSet = new Set(
        (trendingRes.data.data || []).map((i: any) => i.service?._id)
      );
      const recommendedSet = new Set(
        (recommendedRes.data.data || []).map((i: any) => i.service?._id)
      );
      const popularSet = new Set(
        (popularRes.data.data || []).map((i: any) => i.service?._id)
      );

      const mapped: ServiceRow[] = (allServicesRes.data.data || []).map(
        (service: any) => ({
          id: service._id,
          name: service.serviceName,
          category: service.category?.name || 'N/A',
          status: service.isDeleted ? 'Inactive' : 'Active',
          mostlyTrending: trendingSet.has(service._id),
          mostlyRecommended: recommendedSet.has(service._id),
          mostlyPopular: popularSet.has(service._id),
        })
      );

      console.log("all services : ", allServicesRes);
      setServices(mapped);
      setTotalServices(allServicesRes.data.total || 0);
    } catch (error) {
      console.error('Failed to load services', error);
    }
  };

  /* -------------------- Effect (DEBOUNCED) -------------------- */
  useEffect(() => {
    fetchAllData();
  }, [
    debouncedSearch,
    debouncedCategory,
    debouncedSubcategory,
    debouncedSort,
    debouncedPage,
  ]);

  /* -------------------- TOGGLE HANDLER (UNCHANGED) -------------------- */
  const handleToggle = async (
    serviceId: string,
    field: 'mostlyTrending' | 'mostlyRecommended' | 'mostlyPopular',
    checked: boolean
  ) => {
    const confirmAction = window.confirm(
      `Are you sure you want to ${checked ? 'enable' : 'disable'} this option?`
    );

    if (!confirmAction) return;

    try {
      setLoadingToggle(serviceId);

      setServices((prev) =>
        prev.map((s) =>
          s.id === serviceId ? { ...s, [field]: checked } : s
        )
      );

      const res = await axios.post('/api/service/most-home-service', {
        service: serviceId,
        [field]: checked,
      });

      if (res.data?.success) {
        alert(res.data.message);
      }
    } catch (error) {
      setServices((prev) =>
        prev.map((s) =>
          s.id === serviceId ? { ...s, [field]: !checked } : s
        )
      );
      alert('Something went wrong. Please try again.');
    } finally {
      setLoadingToggle(null);
    }
  };

  /* -------------------- Table Columns -------------------- */
  const columns = [
    {
      header: 'S.No',
      render: (_: any, index: number) =>
        (currentPage - 1) * rowsPerPage + index + 1,
    },
    {
      header: 'Service Name',
      render: (row: ServiceRow) => (
        <span className="font-semibold text-blue-600">{row.name}</span>
      ),
    },
    {
      header: 'Category',
      render: (row: ServiceRow) => row.category,
    },
    {
      header: 'Status',
      render: (row: ServiceRow) => (
        <span
          className={`px-3 py-1 rounded-full text-sm font-semibold ${
            row.status === 'Active'
              ? 'text-green-600 bg-green-100 border border-green-300'
              : 'text-red-500 bg-red-100 border border-red-300'
          }`}
        >
          {row.status}
        </span>
      ),
    },
    {
      header: 'Action',
      render: (row: ServiceRow) => (
        <Link href={`/service-management/service-details/${row.id}`}>
          <button className="text-blue-500 border border-blue-500 rounded-md p-2 hover:bg-blue-500 hover:text-white">
            <EyeIcon />
          </button>
        </Link>
      ),
    },
    {
      header: 'Mostly Trending',
      render: (row: ServiceRow) => (
        <Switch
          checked={row.mostlyTrending}
          disabled={loadingToggle === row.id}
          onChange={(checked) =>
            handleToggle(row.id, 'mostlyTrending', checked)
          }
        />
      ),
    },
    {
      header: 'Mostly Recommended',
      render: (row: ServiceRow) => (
        <Switch
          checked={row.mostlyRecommended}
          disabled={loadingToggle === row.id}
          onChange={(checked) =>
            handleToggle(row.id, 'mostlyRecommended', checked)
          }
        />
      ),
    },
    {
      header: 'Mostly Popular',
      render: (row: ServiceRow) => (
        <Switch
          checked={row.mostlyPopular}
          disabled={loadingToggle === row.id}
          onChange={(checked) =>
            handleToggle(row.id, 'mostlyPopular', checked)
          }
        />
      ),
    },
  ];

  /* -------------------- UI -------------------- */
  return (
    <div>
      <PageBreadcrumb pageTitle="Most Home Services" />

      <ComponentCard title="Search Filter">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <div>
            <Label>Select Category</Label>
            <Select options={categoryOptions} onChange={setSelectedCategory} />
          </div>

          <div>
            <Label>Select Subcategory</Label>
            <Select options={subcategoryOptions} onChange={setSelectedSubcategory} />
          </div>

          <div>
            <Label>Sort By</Label>
            <Select options={options} onChange={setSort} />
          </div>

          <div>
            <Label>Search</Label>
            <Input
              placeholder="Search by service name"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </ComponentCard>

      <ComponentCard title="All Services" className='mt-4'>
        <BasicTableOne columns={columns} data={services} />
        <Pagination
          currentPage={currentPage}
          totalItems={services.length}
          totalPages={Math.ceil(totalServices / rowsPerPage)}
          onPageChange={setCurrentPage}
        />
      </ComponentCard>
    </div>
  );
};

export default MostHomeServicesPage;
