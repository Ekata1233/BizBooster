'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import PageBreadcrumb from '@/components/common/PageBreadCrumb';
import ComponentCard from '@/components/common/ComponentCard';
import BasicTableOne from '@/components/tables/BasicTableOne';
import { TrashBinIcon, PencilIcon } from '@/icons';
import { useBannerContext } from '@/context/BannerContext';
import { Modal } from '@/components/ui/modal';
import AddBanner from '@/components/banner-component/AddBanner';

interface BannerType {
  _id: string;
  images: string[];
  page: 'homepage' | 'categorypage';
  isDeleted?: boolean;
}

interface TableData {
  id: string;
  _id: string;
  images: string[];
  page: 'homepage' | 'categorypage';
  status: string;
}

const Banner = () => {
  const { banners, deleteBanner, updateBanner } = useBannerContext();

  const [editModalOpen, setEditModalOpen] = useState(false);
  const [currentBanner, setCurrentBanner] = useState<BannerType | null>(null);
  const [updatedImages, setUpdatedImages] = useState<string[]>([]);
  const [newImages, setNewImages] = useState<FileList | null>(null);

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
    setUpdatedImages((prev) => prev.filter((img) => img !== url));
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
      return {
        id: item._id,
        _id: item._id,
        images: item.images,
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
              <Image src={img} alt={`Banner ${index}`} fill className="object-cover" />
            </div>
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

          <div className="grid grid-cols-3 gap-3 mb-4">
            {updatedImages.map((img, idx) => (
              <div key={idx} className="relative w-full h-24 border rounded overflow-hidden">
                <Image src={img} alt="Preview" fill className="object-cover" />
                <button
                  onClick={() => handleRemoveImage(img)}
                  className="absolute top-1 right-1 bg-white text-red-600 p-1 rounded-full text-xs"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>

          <label className="block text-sm font-medium mb-2">Add More Images</label>
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={(e) => setNewImages(e.target.files)}
            className="mb-4 w-full"
          />

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
