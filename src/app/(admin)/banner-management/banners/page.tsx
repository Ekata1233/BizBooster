'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import PageBreadcrumb from '@/components/common/PageBreadCrumb';
import ComponentCard from '@/components/common/ComponentCard';
import BasicTableOne from '@/components/tables/BasicTableOne';
import { TrashBinIcon, PencilIcon } from '@/icons';
import { Modal } from '@/components/ui/modal';
import AddBanner from '@/components/banner-component/AddBanner';
import { useModule } from '@/context/ModuleContext';
import { useCategory } from '@/context/CategoryContext';
import { useBanner } from '@/context/BannerContext';

interface ImageInfo {
  url: string;
  category?: string;
  module?: string;
}

interface BannerType {
  _id: string;
  file: string;
  page: string;
  selectionType?: string;
  isDeleted?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

interface TableData {
  id: string;
  _id: string;
  file: string;
  page: string;
  status: string;
 selectionType: string;
  category?: string;
}

const Banner = () => {
  const { banners, deleteBanner, updateBanner } = useBanner();
  const { modules: moduleData } = useModule();
  const { categories: categoryData } = useCategory();

  const moduleMap = Object.fromEntries(moduleData.map((mod) => [mod._id, mod.name]));
  const categoryMap = Object.fromEntries(categoryData.map((cat) => [cat._id, cat.name]));

  const [editModalOpen, setEditModalOpen] = useState(false);
  const [currentBanner, setCurrentBanner] = useState<BannerType | null>(null);
  const [updatedFile, setUpdatedFile] = useState<string>('');
  const [newImage, setNewImage] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // const moduleOptions = moduleData.map((mod) => mod.name);
  // const categoryOptions = categoryData.map((cat) => cat.name);
  const pageOptions = ['homepage', 'category'];

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
    formData.append('file', updatedFile);
    if (newImage) {
      formData.append('newImage', newImage);
    }

    try {
      await updateBanner(formData);
      alert('Banner updated successfully');
      setEditModalOpen(false);
      setNewImage(null);
    } catch (err) {
      setError('Failed to update banner.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!Array.isArray(banners)) return <div>Loading...</div>;

  const tableData: TableData[] = banners.map((item) => ({
    id: item._id,
    _id: item._id,
    file: item.file,
    page: item.page,
    nagivateto: item.selectionType,
    category: item.selectionType === 'category' ? categoryMap[item.file] : undefined,
    status: item.isDeleted ? 'Deleted' : 'Active',
  }));

  const columns = [
    {
      header: 'Page',
      accessor: 'page',
      render: (row: TableData) => <span className="capitalize">{row.page}</span>,
    },
    {
      header: 'Image',
      accessor: 'file',
      render: (row: TableData) => (
        <div className="flex flex-wrap gap-2">
          <div className="w-24 h-24 relative border rounded overflow-hidden">
            <Image src={row.file} alt="Banner" fill className="object-cover" />
          </div>
        </div>
      ),
    },
    {
      header: 'Navigate to',
      accessor: 'nagivateto',
      render: (row: TableData) => (
        <div className="flex flex-col gap-1">
          <span>{row.selectionType || '-'}</span>
        </div>
      ),
    },
    {
      header: 'Category',
      accessor: 'category',
      render: (row: TableData) => (
        <div className="flex flex-col gap-1">
          <span>{row.category || '-'}</span>
        </div>
      ),
    },
    {
      header: 'Status',
      accessor: 'status',
      render: (row: TableData) => {
        const statusColor =
          row.status === 'Deleted'
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

  return (
    <div>
      <PageBreadcrumb pageTitle="Banners" />
      <div className="my-5">
        <AddBanner />
      </div>
      <div className="my-5">
        <ComponentCard title="All Banners">
          <BasicTableOne columns={columns} data={tableData} />
        </ComponentCard>
      </div>

      {/* Edit Modal */}
      <Modal isOpen={editModalOpen} onClose={() => setEditModalOpen(false)} className="max-w-3xl">
        <div className="p-4">
          <h2 className="text-lg font-semibold mb-4">Edit Banner</h2>
          {error && <div className="text-red-500 mb-4">{error}</div>}

          <div className="grid md:grid-cols-3 gap-4 mb-4">
            {/* Module */}
            <div>
              <label className="block text-sm font-medium">Module</label>
              <select
                className="w-full border px-3 py-2 rounded"
                value={currentBanner?.selectionType === 'module' ? currentBanner.file : ''}
                onChange={(e) =>
                  setCurrentBanner((prev) =>
                    prev ? { ...prev, file: e.target.value, selectionType: 'module' } : null
                  )
                }
              >
                <option value="">Select Module</option>
                {moduleData.map((mod) => (
                  <option key={mod._id} value={mod._id}>
                    {mod.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-medium">Category</label>
              <select
                className="w-full border px-3 py-2 rounded"
                value={currentBanner?.selectionType === 'category' ? currentBanner.file : ''}
                onChange={(e) =>
                  setCurrentBanner((prev) =>
                    prev ? { ...prev, file: e.target.value, selectionType: 'category' } : null
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

            {/* Page */}
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
          </div>

          {/* Existing Image */}
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Current Image</label>
            <div className="flex gap-4 flex-wrap">
              <div className="relative w-24 h-24 border rounded overflow-hidden">
                <Image src={updatedFile} alt="Banner" fill className="object-cover" />
              </div>
            </div>
          </div>

          {/* Upload new image */}
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Change Image</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => e.target.files && setNewImage(e.target.files[0])}
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