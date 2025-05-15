'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import PageBreadcrumb from '@/components/common/PageBreadCrumb';
import ComponentCard from '@/components/common/ComponentCard';
import BasicTableOne from '@/components/tables/BasicTableOne';
import { TrashBinIcon, PencilIcon } from '@/icons';
import { useBannerContext } from '@/context/BannerContext';
import { Modal } from '@/components/ui/modal';
import AddBanner from '@/components/banner-component/AddBanner';
import { useModule } from '@/context/ModuleContext';
import { useCategory } from '@/context/CategoryContext';

interface ImageInfo {
  url: string;
  category: string;
  module: string;
}

interface BannerType {
  _id: string;
  images: ImageInfo[];
  page: 'homepage' | 'categorypage';
  isDeleted?: boolean;
}

interface TableData {
  id: string;
  _id: string;
  images: ImageInfo[];
  page: 'homepage' | 'categorypage';
  status: string;
}

const Banner = () => {
  const { banners, deleteBanner, updateBanner } = useBannerContext();
  const { modules: moduleData } = useModule();
  const { categories: categoryData } = useCategory();

  const [editModalOpen, setEditModalOpen] = useState(false);
  const [currentBanner, setCurrentBanner] = useState<BannerType | null>(null);
  const [updatedImages, setUpdatedImages] = useState<ImageInfo[]>([]);
  const [newImages, setNewImages] = useState<FileList | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Prepare dropdown options from context
  const moduleOptions = moduleData.map((mod) => mod.name);
  const categoryOptions = categoryData.map((cat) => cat.name);
  const pageOptions = ['homepage', 'categorypage'];

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
    setUpdatedImages(banner.images);
    setEditModalOpen(true);
  };

  const handleRemoveImage = (url: string) => {
    setUpdatedImages((prev) => prev.filter((img) => img.url !== url));
  };

  const handleUpdate = async () => {
    if (!currentBanner) return;

    const formData = new FormData();
    formData.append('id', currentBanner._id);
    formData.append('existingImages', JSON.stringify(updatedImages));

    if (newImages) {
      Array.from(newImages).forEach((img) => {
        formData.append('newImages', img);
      });
    }

    try {
      await updateBanner(formData);
      alert('Banner updated successfully');
      setEditModalOpen(false);
      setNewImages(null);
    } catch (error) {
      console.error('Error updating banner:', error);
    }
  };

  if (!Array.isArray(banners)) return <div>Loading...</div>;

  const tableData: TableData[] = banners
    .map((item) => {
      if (!item || !item._id || !Array.isArray(item.images)) {
        console.warn('Invalid banner item:', item);
        return null;
      }

      const validImages: ImageInfo[] = item.images
        .filter(img => img && typeof img.url === 'string' && typeof img.category === 'string' && typeof img.module === 'string')
        .map(img => ({
          url: img.url,
          category: img.category,
          module: img.module,
        }));

      return {
        id: item._id,
        _id: item._id,
        images: validImages,
        page: item.page,
        status: item.isDeleted ? 'Deleted' : 'Active',
      };
    })
    .filter((item): item is TableData => item !== null);

  const columns = [
    {
      header: 'Images',
      accessor: 'images',
      render: (row: TableData) => (
        <div className="flex gap-2 flex-wrap">
          {row.images.map((img, index) => (
            <div key={index} className="w-24 h-24 relative border rounded overflow-hidden">
              <Image
                src={img.url}
                alt={`Banner Image ${index}`}
                fill
                className="object-cover"
              />
            </div>
          ))}
        </div>
      ),
    },
    {
      header: 'Category',
      accessor: 'category',
      render: (row: TableData) => (
        <div className="flex flex-col gap-1">
          {row.images.map((img, index) => (
            <span key={index} className="text-sm text-gray-700">
              {img.category}
            </span>
          ))}
        </div>
      ),
    },
    {
      header: 'Module',
      accessor: 'module',
      render: (row: TableData) => (
        <div className="flex flex-col gap-1">
          {row.images.map((img, index) => (
            <span key={index} className="text-sm text-gray-700">
              {img.module}
            </span>
          ))}
        </div>
      ),
    },
    {
      header: 'Page',
      accessor: 'page',
      render: (row: TableData) => (
        <span className="capitalize">{row.page}</span>
      ),
    },
    {
      header: 'Banner ID',
      accessor: '_id',
      render: (row: TableData) => (
        <span className="text-xs text-gray-600 break-all">{row._id}</span>
      ),
    },
    {
      header: 'Status',
      accessor: 'status',
      render: (row: TableData) => {
        const colorClass = row.status === 'Deleted'
          ? 'text-red-500 bg-red-100 border border-red-300'
          : 'text-green-600 bg-green-100 border border-green-300';

        return (
          <span className={`px-3 py-1 rounded-full text-sm font-semibold ${colorClass}`}>
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
              if (selected) {
                handleEdit(selected);
              } else {
                console.error('Banner not found for editing');
              }
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

      <Modal isOpen={editModalOpen} onClose={() => setEditModalOpen(false)} className="max-w-[700px] m-4">
        <div className="p-4">
          <h2 className="text-lg font-semibold mb-4">Edit Banner</h2>

          {error && (
            <div className="text-red-500 text-sm mb-4">
              {error}
            </div>
          )}

          {/* Dropdowns in a single line */}
          <div className="flex flex-wrap gap-4 mb-4">
            {/* Module Dropdown */}
            <div className="flex-1 min-w-[150px]">
              <label className="block text-sm font-medium mb-1">Module</label>
              <select
                className="w-full border px-3 py-2 rounded disabled:opacity-50"
                value={updatedImages[0]?.module || ''}
                onChange={(e) => {
                  const newModule = e.target.value;
                  setUpdatedImages((prev) =>
                    prev.map((img) => ({
                      ...img,
                      module: newModule,
                    }))
                  );
                }}
                disabled={isLoading}
              >
                <option value="">Select Module</option>
                {moduleOptions.map((mod) => (
                  <option key={mod} value={mod}>
                    {mod}
                  </option>
                ))}
              </select>
            </div>

            {/* Category Dropdown */}
            <div className="flex-1 min-w-[150px]">
              <label className="block text-sm font-medium mb-1">Category</label>
              <select
                className="w-full border px-3 py-2 rounded disabled:opacity-50"
                value={updatedImages[0]?.category || ''}
                onChange={(e) => {
                  const newCategory = e.target.value;
                  setUpdatedImages((prev) =>
                    prev.map((img) => ({
                      ...img,
                      category: newCategory,
                    }))
                  );
                }}
                disabled={isLoading}
              >
                <option value="">Select Category</option>
                {categoryOptions.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Page Dropdown */}
            <div className="flex-1 min-w-[150px]">
              <label className="block text-sm font-medium mb-1">Page</label>
              <select
                className="w-full border px-3 py-2 rounded disabled:opacity-50"
                value={currentBanner?.page || ''}
                onChange={(e) => {
                  const newPage = e.target.value;
                  setCurrentBanner((prev) =>
                    prev ? { ...prev, page: newPage as 'homepage' | 'categorypage' } : null
                  );
                }}
                disabled={isLoading}
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

          {/* Image Previews with Remove Option */}
          <div className="grid grid-cols-3 gap-3 mb-4">
            {updatedImages.map((img, idx) => (
              <div key={idx} className="relative w-full h-24 border rounded overflow-hidden">
                <Image src={img.url} alt="Preview" fill className="object-cover" />
                <button
                  onClick={() => handleRemoveImage(img.url)}
                  className="absolute top-1 right-1 bg-white text-red-600 p-1 rounded-full text-xs"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>

          {/* Upload New Images */}
          <label className="block text-sm font-medium mb-2">Add More Images</label>
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={(e) => setNewImages(e.target.files)}
            className="mb-4 w-full"
          />

          {/* Action Buttons */}
          <div className="flex justify-end gap-3">
            <button
              onClick={() => {
                setEditModalOpen(false);
                setNewImages(null);
              }}
              className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300"
            >
              Cancel
            </button>
            <button
              onClick={handleUpdate}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Update
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Banner;