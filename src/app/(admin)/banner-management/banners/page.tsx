'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import PageBreadcrumb from '@/components/common/PageBreadCrumb';
import ComponentCard from '@/components/common/ComponentCard';
import BasicTableOne from '@/components/tables/BasicTableOne';
import { TrashBinIcon, PencilIcon, ChevronDownIcon, UserIcon, ArrowUpIcon } from '@/icons';
import { Modal } from '@/components/ui/modal';
// import { useModule } from '@/context/ModuleContext';
import { useCategory } from '@/context/CategoryContext';
import { useBanner } from '@/context/BannerContext';
import { useSubcategory } from '@/context/SubcategoryContext';
import Label from '@/components/form/Label';
import Select from '@/components/form/Select';
import Input from '@/components/form/input/InputField';
import StatCard from '@/components/common/StatCard';
import axios from 'axios';
import { useService } from '@/context/ServiceContext';
import Pagination from '@/components/tables/Pagination';

interface BannerType {
  _id: string;
  file: string;
  page: string;
  selectionType: string;
  category?: string | { _id: string; name: string };
  subcategory?: string | { _id: string; name: string };
  service?: string;
  referralUrl?: string;
  isDeleted?: boolean;
  createdAt?: string;
  updatedAt?: string;
}
type ServiceType = { name?: string };
interface TableData {
  id: string;

  file: string;
  page: string;
  selectionType: string;
  navigationTarget: string;
  status: string;
}

const options = [
  { value: "latest", label: "Latest" },
  { value: "oldest", label: "Oldest" },
  { value: "ascending", label: "Ascending" },
  { value: "descending", label: "Descending" },
];

const Banner = () => {
  const { banners, deleteBanner, updateBanner } = useBanner();
  const [searchQuery, setSearchQuery] = useState<string>('');
  const { categories: categoryData } = useCategory();
  const { subcategories: subcategoryData } = useSubcategory();
  const { services: serviceData } = useService();
  const [selectedSubcategory, setSelectedSubcategory] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10;

  // Create mapping objects for easy lookup
  // const moduleMap = Object.fromEntries(moduleData.map((mod) => [mod._id, mod.name]));
  const categoryMap = Object.fromEntries(categoryData.map((cat) => [cat._id, cat.name]));
  const subcategoryMap = Object.fromEntries(subcategoryData.map((cat) => [cat._id, cat.name]));
  const serviceMap = Object.fromEntries(serviceData.map((cat) => [cat._id, cat.serviceName]));


  const [sort, setSort] = useState<string>('oldest');
const [totalBanners, setTotalBanners] = useState(0);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [currentBanner, setCurrentBanner] = useState<BannerType | null>(null);
  const [updatedFile, setUpdatedFile] = useState<string>('');
  const [newImage, setNewImage] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [filteredBanner, setFilteredBanners] = useState<TableData[]>([]);
  const [message, setMessage] = useState('');
  const pageOptions = ['home', 'category'];
  const selectionTypeOptions = ['category', 'subcategory', 'service', 'referralUrl'];


  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this banner?')) return;
    try {
      await deleteBanner(id);
      alert('Banner deleted successfully');
    } catch (error) {
      console.error('Error deleting banner:', error);
    }
  };

  const handleEdit = (banner: BannerType) => {
    setCurrentBanner(banner);
    setUpdatedFile(banner.file);
    setEditModalOpen(true);
  };

  const handleUpdate = async () => {
    if (!currentBanner) return;
    setIsLoading(true);
    const formData = new FormData();

    formData.append('id', currentBanner._id);
    formData.append('page', currentBanner.page);
    formData.append('selectionType', currentBanner.selectionType);

    // Handle category object case
    const categoryId = typeof currentBanner.category === 'object'
      ? currentBanner.category?._id
      : currentBanner.category;

    const subcategoryId = typeof currentBanner.subcategory === 'object'
      ? currentBanner.subcategory?._id
      : currentBanner.subcategory;

    if (currentBanner.selectionType === 'category' && categoryId) {
      formData.append('category', categoryId);
    } else if (currentBanner.selectionType === 'subcategory' && subcategoryId) {
      formData.append('subcategory', subcategoryId);
    } else if (currentBanner.selectionType === 'service' && currentBanner.service) {
      formData.append('service', currentBanner.service);
    } else if (currentBanner.selectionType === 'referralUrl' && currentBanner.referralUrl) {
      formData.append('referralUrl', currentBanner.referralUrl);
    }

    if (newImage) {
      formData.append('file', newImage);
    } else {
      formData.append('file', currentBanner.file);
    }

    try {
      // Pass both id and formData as separate arguments
      await updateBanner(currentBanner._id, formData);
      alert('Banner updated successfully');
      setEditModalOpen(false);
      setNewImage(null);
    } catch (err) {
      setError('Failed to update banner.');
      console.log(err);

    } finally {
      setIsLoading(false);
    }
  };


  // Helper function to get navigation target display text
  const getNavigationTarget = (banner: BannerType): string => {
    switch (banner.selectionType) {
      case 'category':
        if (typeof banner.category === 'object') {
          return banner.category?.name || '-';
        }
        return banner.category ? categoryMap[banner.category] || banner.category : '-';
      case 'subcategory':
        // return banner.subcategory || '-';
        if (typeof banner.subcategory === 'object') {
          return banner.subcategory?.name || '-';
        }
        return banner.subcategory ? subcategoryMap[banner.subcategory] || banner.subcategory : '-';
      case 'service':
        if (typeof banner.service === 'object' && banner.service !== null) {
          return (banner.service as { name?: string })?.name || '-';
        }

        return banner.service ? serviceMap[banner.service] || banner.service : '-';
      case 'referralUrl':
        return banner.referralUrl ? 'External Link' : '-';
      default:
        return '-';
    }
  };

  const fetchFilteredBanners = async () => {
    try {
      const params = {
        ...(searchQuery && { search: searchQuery }),
        ...(selectedSubcategory && { subcategory: selectedSubcategory }),
        ...(sort && { sort }),
      }

      const response = await axios.get('/api/banner', { params });
      const bannerData = response.data;

      setTotalBanners(bannerData.length || 0);

      if (bannerData.length === 0) {
        setFilteredBanners([]);
        setMessage(bannerData.message || 'No services found');
      } else {
        const mapped = bannerData.map((banner: BannerType) => ({
          id: banner._id,
          file: banner.file,
          page: banner.page,
          selectionType: banner.selectionType,
          navigationTarget: getNavigationTarget(banner),
          status: banner.isDeleted ? 'Deleted' : 'Active',
        }));

        setFilteredBanners(mapped);
        setMessage('');
      }

    } catch (error) {
      console.log(error)
    }
  }

  const columns = [
    {
  header: 'Sr. No',
  accessor: 'srNo',
  render: (_row: TableData) => {
    const idx = currentRows.findIndex(row => row.id === _row.id);
    return <span>{(currentPage - 1) * rowsPerPage + idx + 1}</span>;
  },
},
    {
      header: 'Page',
      accessor: 'page',
      render: (row: TableData) => <span className="capitalize">{row.page}</span>,
    },
    {
      header: 'Image',
      accessor: 'file',
      render: (row: TableData) => (
        <div className="w-40 h-20 relative border rounded overflow-hidden">
          <Image
            src={row.file}
            alt="Banner"
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        </div>
      ),
    },
    {
      header: 'Selection Type',
      accessor: 'selectionType',
      render: (row: TableData) => (
        <span className="capitalize">{row.selectionType || '-'}</span>
      ),
    },
    {
      header: 'Navigate To',
      accessor: 'navigationTarget',
      render: (row: TableData) => (
        <span className="truncate max-w-xs inline-block">{row.navigationTarget}</span>
      ),
    },
    {
      header: 'Status',
      accessor: 'status',
      render: (row: TableData) => {
        const statusColor = row.status === 'Deleted'
          ? 'text-red-600 bg-red-100 border border-red-300'
          : 'text-green-600 bg-green-100 border border-green-300';
        return (
          <span className={`px-3 py-1 rounded-full text-sm font-semibold ${statusColor}`}>
            {row.status}
          </span>
        );
      },
    },
    {
      header: 'Action',
      accessor: 'action',
      render: (row: TableData) => (
        <div className="flex gap-2">
          <button
            onClick={() => {
              const selected = banners.find((b) => b._id === row.id);
              if (selected) handleEdit(selected);
            }}
            className="text-yellow-500 border border-yellow-500 rounded-md p-2 hover:bg-yellow-500 hover:text-white"
          >
            <PencilIcon />
          </button>
          <button
            onClick={() => handleDelete(row.id)}
            className="text-red-500 border border-red-500 rounded-md p-2 hover:bg-red-500 hover:text-white"
          >
            <TrashBinIcon />
          </button>
        </div>
      ),
    },
  ];

  const subcategoryOptions = subcategoryData.map((sub) => ({
    value: sub._id ?? '',
    label: sub.name,
  }));

  const handleSelectSubcategory = (value: string) => {
    setSelectedSubcategory(value); // required to set the selected module
  };

  const totalPages = Math.ceil(filteredBanner.length / rowsPerPage);
  const indexOfLastRow = currentPage * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;
  const currentRows = filteredBanner.slice(indexOfFirstRow, indexOfLastRow);

  useEffect(() => {
    setCurrentPage(1);
    fetchFilteredBanners();
  }, [searchQuery, selectedSubcategory, sort])

  console.log("Banner data in frontend  : ", banners);


  if (!filteredBanner) return <div>Loading...</div>;


  return (
    <div>
      <PageBreadcrumb pageTitle="Banners" />
      {/* <div className="my-5">
        <AddBanner />
      </div> */}

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Left section - Search Filter */}
        <div className="w-full lg:w-3/4 my-5">
          <ComponentCard title="Search Filter">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 md:gap-6 py-3">
              {/* Subcategory Select */}
              <div>
                <Label>Select Subcategory</Label>
                <div className="relative">
                  <Select
                    options={subcategoryOptions}
                    placeholder="Select Subcategory"
                    onChange={handleSelectSubcategory}
                    className="dark:bg-dark-900"
                  />
                  <span className="absolute text-gray-500 -translate-y-1/2 pointer-events-none right-3 top-1/2 dark:text-gray-400">
                    <ChevronDownIcon />
                  </span>
                </div>
              </div>

              {/* Sort Select */}
              <div>
                <Label>Select Input</Label>
                <div className="relative">
                  <Select
                    options={options}
                    placeholder="Sort By"
                    onChange={(value) => setSort(value)}
                    className="dark:bg-dark-900"
                  />
                  <span className="absolute text-gray-500 -translate-y-1/2 pointer-events-none right-3 top-1/2 dark:text-gray-400">
                    <ChevronDownIcon />
                  </span>
                </div>
              </div>

              {/* Search Input */}
              <div>
                <Label>Other Filter</Label>
                <Input
                  type="text"
                  placeholder="Search by page name"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
          </ComponentCard>
        </div>

        {/* Right section - StatCard */}
        <div className="w-full lg:w-1/4 my-5">
          <StatCard
            title="Total Banners"
            value={totalBanners || 0}
            icon={UserIcon}
            badgeColor="success"
            badgeValue="0.00%"
            badgeIcon={ArrowUpIcon}
          />
        </div>
      </div>


      <div className="my-5">
        <ComponentCard title="All Banners">
          {message ? (
            <p className="text-red-500 text-center my-4">{message}</p>
          ) : (
            <>
              <BasicTableOne columns={columns} data={currentRows} />

              {filteredBanner.length > 0 && (
                <div className="flex justify-center mt-4">
                  <Pagination
                    currentPage={currentPage}
                    totalItems={filteredBanner.length}
                    totalPages={totalPages}
                    onPageChange={(page) => setCurrentPage(page)}
                  />
                </div>
              )}
            </>
          )}
        </ComponentCard>
      </div>


      {/* Edit Modal */}
      <Modal isOpen={editModalOpen} onClose={() => setEditModalOpen(false)} className="max-w-3xl">
        <div className="p-4">
          <h2 className="text-lg font-semibold mb-4">Edit Banner</h2>
          {error && <div className="text-red-500 mb-4">{error}</div>}

          <div className="grid md:grid-cols-2 gap-4 mb-4">
            {/* Page Selection */}
            <div>
              <label className="block text-sm font-medium">Page</label>
              <select
                className="w-full border px-3 py-2 rounded"
                value={currentBanner?.page || ''}
                onChange={(e) =>
                  setCurrentBanner((prev) =>
                    prev ? { ...prev, page: e.target.value } : null
                  )
                }
              >
                <option value="">Select Page</option>
                {pageOptions.map((pg) => (
                  <option key={pg} value={pg}>
                    {pg}
                  </option>
                ))}
              </select>
            </div>

            {/* Selection Type */}
            <div>
              <label className="block text-sm font-medium">Navigate To</label>
              <select
                className="w-full border px-3 py-2 rounded"
                value={currentBanner?.selectionType || ''}
                onChange={(e) =>
                  setCurrentBanner((prev) =>
                    prev ? {
                      ...prev,
                      selectionType: e.target.value,
                      category: undefined,
                      subcategory: undefined,
                      service: undefined,
                      referralUrl: undefined
                    } : null
                  )
                }
              >
                <option value="">Select Navigation Target</option>
                {selectionTypeOptions.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>



            {/* Category Selection */}
            {currentBanner?.selectionType === 'category' && (
              <div className="md:col-span-2">
                <label className="block text-sm font-medium">Category</label>
                <select
                  className="w-full border px-3 py-2 rounded"
                  value={
                    typeof currentBanner?.category === 'object'
                      ? currentBanner.category?._id
                      : currentBanner?.category || ''
                  }
                  onChange={(e) =>
                    setCurrentBanner((prev) =>
                      prev ? { ...prev, category: e.target.value, subcategory: '' } : null
                    )
                  }
                >
                  <option value="">Select Category</option>
                  {categoryData.map((cat) => (
                    <option key={cat._id} value={cat._id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Subcategory Selection */}
            {currentBanner?.selectionType === 'subcategory' && (
              <div className="md:col-span-2">
                <label className="block text-sm font-medium">Subcategory</label>
                <select
                  className="w-full border px-3 py-2 rounded"
                  value={
                    typeof currentBanner?.subcategory === 'object'
                      ? currentBanner.subcategory?._id
                      : currentBanner?.subcategory || ''
                  }
                  onChange={(e) =>
                    setCurrentBanner((prev) =>
                      prev ? { ...prev, subcategory: e.target.value, category: '' } : null
                    )
                  }
                >
                  <option value="">Select Subcategory</option>
                  {subcategoryData.map((sub) => (
                    <option key={sub._id} value={sub._id}>
                      {sub.name}
                    </option>
                  ))}
                </select>
              </div>
            )}


            {currentBanner?.selectionType === 'service' && (
              <div className="md:col-span-2">
                <label className="block text-sm font-medium">Service</label>
                <input
                  type="text"
                  className="w-full border px-3 py-2 rounded"
                  value={currentBanner?.service || ''}
                  onChange={(e) =>
                    setCurrentBanner((prev) =>
                      prev ? { ...prev, service: e.target.value } : null
                    )
                  }
                  placeholder="Enter service ID"
                />
              </div>
            )}

            {currentBanner?.selectionType === 'referralUrl' && (
              <div className="md:col-span-2">
                <label className="block text-sm font-medium">Referral URL</label>
                <input
                  type="text"
                  className="w-full border px-3 py-2 rounded"
                  value={currentBanner?.referralUrl || ''}
                  onChange={(e) =>
                    setCurrentBanner((prev) =>
                      prev ? { ...prev, referralUrl: e.target.value } : null
                    )
                  }
                  placeholder="Enter referral URL"
                />
              </div>
            )}
          </div>

          {/* Existing Image */}
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Current Image</label>
            <div className="flex gap-4 flex-wrap">
              <div className="relative w-24 h-24 border rounded overflow-hidden">
                <Image
                  src={updatedFile}
                  alt="Banner"
                  fill
                  className="object-cover"
                  sizes="100vw"
                />
              </div>
            </div>
          </div>

          {/* Upload new image */}
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Change Image</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                if (e.target.files?.[0]) {
                  setNewImage(e.target.files[0]);
                  setUpdatedFile(URL.createObjectURL(e.target.files[0]));
                }
              }}
              className="border px-3 py-2 rounded w-full"
            />
          </div>

          <div className="flex justify-end gap-3">
            <button
              onClick={() => setEditModalOpen(false)}
              className="px-4 py-2 rounded border border-gray-300"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              onClick={handleUpdate}
              className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
              disabled={isLoading}
            >
              {isLoading ? 'Updating...' : 'Update'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Banner;