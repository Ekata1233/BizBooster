'use client';

import React, { useState, useEffect } from 'react';
import PageBreadcrumb from '@/components/common/PageBreadCrumb';
import BasicTableOne from '@/components/tables/BasicTableOne';
import Link from 'next/link';
import ComponentCard from '@/components/common/ComponentCard';
import ModuleStatCard from '@/components/module-component/ModuleStatCard';
import Label from '@/components/form/Label';
import Select from '@/components/form/Select';
import Input from '@/components/form/input/InputField';
import { Category, useCategory } from '@/context/CategoryContext';
import { useSubcategory } from '@/context/SubcategoryContext';
import axios from 'axios';
import { useService } from '@/context/ServiceContext';
import { EyeIcon } from '@/icons';
import { useRouter } from 'next/navigation';
import Pagination from '@/components/tables/Pagination';
import Switch from '@/components/form/switch/Switch';

/* -------------------- Types -------------------- */
export interface ServiceData {
  _id: string;
  id: string;
  name: string;
  category: { _id: string; name: string };
  subcategory: { _id: string; name: string };
  price: number;
  status: 'Active' | 'Inactive';
    recommendedServices?: boolean;
  isTrending?: boolean;

}

/* -------------------- Sort Options -------------------- */
const options = [
  { value: 'latest', label: 'Latest' },
  { value: 'oldest', label: 'Oldest' },
  { value: 'ascending', label: 'Ascending' },
  { value: 'descending', label: 'Descending' },
];

/* -------------------- Component -------------------- */
const ServiceList = () => {
  const router = useRouter();
  const { deleteService } = useService();
  const { categories } = useCategory();
  const { subcategories } = useSubcategory();
  const [services, setServices] = useState<ServiceData[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [modules, setModules] = useState<any[]>([]);
const [selectedModule, setSelectedModule] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedSubcategory, setSelectedSubcategory] = useState('');
const [loadingToggle, setLoadingToggle] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [message, setMessage] = useState('');

  const fetchModules = async () => {
  try {
    const res = await axios.get('/api/modules');
    setModules(res.data.data || []);
  } catch (error) {
    console.error('Error fetching modules', error);
  }
};

useEffect(() => {
  fetchModules();
}, []);


  /* -------------------- Fetch Services -------------------- */
  const fetchServices = async (page = 1) => {
    try {
      const params = {
        page,
        limit: rowsPerPage,
        ...(searchQuery && { search: searchQuery }),
         ...(selectedModule && { module: selectedModule }),
        ...(selectedCategory && { category: selectedCategory }),
        ...(selectedSubcategory && { subcategory: selectedSubcategory }),
      };

      const res = await axios.get('/api/service', { params });
      const data = res.data;

      if (!data.data || data.data.length === 0) {
        setServices([]);
        setMessage(data.message || 'No services found');
        setTotalPages(0);
        return;
      }

      const mapped = data.data.map((service: any) => ({
        id: service._id,
        name: service.serviceName.replace(/"/g, ''),
        category: service.category || { _id: '', name: 'N/A' },
        subcategory: service.subcategory || { _id: '', name: 'N/A' },
        price: service.price,
        status: service.isDeleted ? 'Inactive' : 'Active',
        recommendedServices: service.recommendedServices ?? false,
  isTrending: service.isTrending ?? false,
      }));

      setServices(mapped);
      setTotalPages(data.totalPages || 1);
      setMessage('');
    } catch (err) {
      console.error(err);
      setServices([]);
      setMessage('Something went wrong while fetching services');
    }
  };

// useEffect(() => {
//   setCurrentPage(1); // optional but recommended
//   fetchServices(1);
// }, [searchQuery, selectedModule, selectedCategory, selectedSubcategory]);

  useEffect(() => {
    fetchServices(currentPage);
  }, [searchQuery,selectedModule, selectedCategory, selectedSubcategory, currentPage]);


  const moduleOptions = modules.map((mod) => ({
  value: mod._id,
  label: mod.name,
}));

const filteredCategories = categories.filter(
  (cat) => cat.module?._id === selectedModule
);

const categoryOptions = filteredCategories.map((cat: Category) => ({
  value: cat._id,
  label: cat.name,
}));

const filteredSubcategories = subcategories.filter(
  (sub) => sub.category?._id === selectedCategory
);

const subcategoryOptions = filteredSubcategories.map((sub) => ({
  value: sub._id,
  label: sub.name,
}));


const handleModuleChange = (value: string) => {
  setSelectedModule(value);
  setSelectedCategory('');
  setSelectedSubcategory('');
};

const handleToggleChange = async (
  id: string,
  field: "recommendedServices" | "isTrending",
  checked: boolean
) => {
  const previousValue = !checked;
  try {
    setLoadingToggle(id);
    // Optimistic UI update
    setServices((prev) =>
      prev.map((p) =>
        p.id === id ? { ...p, [field]: checked } : p
      )
    );

    const formData = new FormData();
    formData.append(field, String(checked));

    await axios.patch(
      `/api/service/${id}`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    setLoadingToggle(null);
  } catch (error: any) {
    // 🔁 Rollback optimistic update
    setServices((prev) =>
      prev.map((p) =>
        p.id === id ? { ...p, [field]: previousValue } : p
      )
    );

    // ✅ Show backend error message
    const message =
      error?.response?.data?.message || "Something went wrong";

      console.log("message : ", message);

    alert(message);
  } finally {
    setLoadingToggle(null);
  }
};

  /* -------------------- Table Columns -------------------- */
  const columns = [
    {
      header: 'S.No',
      accessor: 'serial',
      render: (_: any, index: number) =>
        (currentPage - 1) * rowsPerPage + index + 1,
    },
    {
      header: 'Service Name',
      accessor: 'name',
      render: (row: ServiceData) => (
        <span className="font-semibold text-blue-600">{row.name}</span>
      ),
    },
    {
      header: 'Category',
      accessor: 'category',
      render: (row: ServiceData) => row.category?.name || 'N/A',
    },
    {
      header: 'Status',
      accessor: 'status',
      render: (row: ServiceData) => (
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
      accessor: 'action',
      render: (row: ServiceData) => (
        <Link href={`/service-management/service-details/${row.id}`}>
          <button className="text-blue-500 border border-blue-500 rounded-md p-2 hover:bg-blue-500 hover:text-white">
            <EyeIcon />
          </button>
        </Link>
      ),
    },
    {
      header: "Recommended",
      accessor: "recommended",
      render: (row) => (
        <div className="flex justify-center">
         <Switch
      checked={row.recommendedServices}
      disabled={loadingToggle === row.id}
      onChange={(checked) =>
        handleToggleChange(row.id, "recommendedServices", checked)
      }
      color="gray"
    />
    
        </div>
      ),
    },
    {
      header: "Top Trending",
      accessor: "trending",
      render: (row) => (
        <div className="flex justify-center">
        <Switch
      checked={row.isTrending}
      disabled={loadingToggle === row.id}
      onChange={(checked) =>
        handleToggleChange(row.id, "isTrending", checked)
      }
      color="gray"
    />
    
        </div>
      ),
    },
  ];




  /* -------------------- UI -------------------- */
  return (
    <div>
      <PageBreadcrumb pageTitle="Service List" />
      <ModuleStatCard />

      {/* Filters */}
      <div className="my-5">
        <ComponentCard title="Search Filter">
  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">

    {/* Module */}
    <div>
      <Label>Select Module</Label>
      <Select
        options={moduleOptions}
        placeholder="Select Module"
        onChange={handleModuleChange}
      />
    </div>

    {/* Category */}
    <div>
      <Label>Select Category</Label>
      <Select
        options={categoryOptions}
        placeholder="Select Category"
        onChange={setSelectedCategory}
        isDisabled={!selectedModule}
      />
    </div>

    {/* Subcategory */}
    <div>
      <Label>Select Subcategory</Label>
      <Select
        options={subcategoryOptions}
        placeholder="Select Subcategory"
        onChange={setSelectedSubcategory}
        isDisabled={!selectedCategory}
      />
    </div>

    {/* Search */}
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

      </div>

      {/* Table */}
      <ComponentCard title="Service List">
        {message ? (
          <p className="text-center text-red-500">{message}</p>
        ) : (
          <>
            <BasicTableOne columns={columns} data={services} />

            {services.length > 0 && (
              <div className="flex justify-center mt-4">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  totalItems={totalPages * rowsPerPage}
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

export default ServiceList;
