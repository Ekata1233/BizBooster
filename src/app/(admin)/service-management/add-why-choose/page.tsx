"use client";

import { useWhyChoose, WhyChooseItem } from '@/context/WhyChooseContext';
import React, { useMemo, useState } from 'react';
import Image from "next/image";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import ComponentCard from "@/components/common/ComponentCard";
import Input from '@/components/form/input/InputField';
import Link from "next/link";
import { EyeIcon, PencilIcon, TrashBinIcon } from '@/icons';
import BasicTableOne from '@/components/tables/BasicTableOne';
import Button from '@/components/ui/button/Button';
import Label from '@/components/form/Label';
import { Modal } from '@/components/ui/modal';

const Page = () => {
  const { items, loading, deleteItem, updateItem, addItem } = useWhyChoose();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');

  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState<WhyChooseItem | null>(null);
  const [formState, setFormState] = useState({
    title: '',
    description: '',
    image: '',
    extraSections: ''
  });

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this item?")) {
      await deleteItem(id);
    }
  };

  const handleEdit = (item: WhyChooseItem) => {
    setEditItem(item);
    setFormState({
      title: item.title,
      description: item.description,
      image: item.image,
      extraSections: item.extraSections?.map((e) => e.description).join(', ') || ''
    });
    setShowModal(true);
  };

  const handleAddNew = () => {
    setEditItem(null);
    setFormState({ title: '', description: '', image: '', extraSections: '' });
    setShowModal(true);
  };

  const handleSubmit = async () => {
    const formData = new FormData();

    // Ensure all values are not undefined
    formData.append("title", formState.title ?? "");
    formData.append("description", formState.description ?? "");

    // Check for image file before appending
    if (formState.image) {
      formData.append("image", formState.image);
    }

    // Ensure extraSections is defined
    const extraSections = formState.extraSections
      ? JSON.stringify(formState.extraSections.split(',').map(desc => ({ description: desc.trim() })))
      : "[]";
    formData.append("extraSections", extraSections);

    if (editItem) {
      await updateItem(editItem._id, formData);
    } else {
      await addItem(formData);
    }

    setShowModal(false);
    setEditItem(null);
  };


  const columns = useMemo(() => [
    {
      header: "Image",
      accessor: "image",
      render: (row: WhyChooseItem) => (
        row.image ? (
          <div className="w-70 h-30 overflow-hidden">
            {row.image.startsWith("http") ? (
              <img
                src={row.image}
                alt={row.title ?? "Item image"}
                className="w-[350px] h-[130px] object-cover rounded"
              />
            ) : (
              <Image
                width={350}
                height={130}
                src={row.image}
                alt={row.title ?? "Item image"}
                className="object-cover rounded"
              />
            )}
          </div>
        ) : (
          <span className="text-gray-400 italic">No image</span>
        )
      ),
    },
    {
      header: "Title",
      accessor: "title",
      render: (row: WhyChooseItem) => (
        <span className="font-medium text-sm text-gray-800 dark:text-white/90">
          {row.title ?? "—"}
        </span>
      ),
    },
    {
      header: "Description",
      accessor: "description",
      render: (row: WhyChooseItem) => (
        <p className="text-sm text-gray-600 dark:text-gray-300">
          {row.description ?? "—"}
        </p>
      ),
    },
    {
      header: "Extra Sections",
      accessor: "extraSections",
      render: (row: WhyChooseItem) => (
        <div>
          {row.extraSections?.length > 0 ? (
            row.extraSections.map((extra, index) => (
              <p key={index} className="text-sm text-gray-600 dark:text-gray-300">
                {extra.description ?? "—"}
              </p>
            ))
          ) : (
            <p className="text-sm text-gray-400 italic">No extra sections</p>
          )}
        </div>
      ),
    },
    {
      header: "Action",
      accessor: "action",
      render: (row: WhyChooseItem) => (
        <div className="flex gap-2">
          <button
            title="Edit"
            onClick={() => handleEdit(row)}
            className="text-yellow-500 border border-yellow-500 rounded-md p-2 hover:bg-yellow-500 hover:text-white hover:border-yellow-500"
          >
            <PencilIcon />
          </button>
          <button
            title="Delete"
            onClick={() => handleDelete(row._id)}
            className="text-red-500 border border-red-500 rounded-md p-2 hover:bg-red-500 hover:text-white hover:border-red-500"
          >
            <TrashBinIcon />
          </button>
          <Link href={`/why-choose-us/${row._id}`} passHref>
            <button
              title="View Details"
              className="text-blue-500 border border-blue-500 rounded-md p-2 hover:bg-blue-500 hover:text-white hover:border-blue-500"
            >
              <EyeIcon />
            </button>
          </Link>
        </div>
      ),
    },
  ], []);

  const filteredItems = items.filter(item =>
    item.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getFilteredByStatus = () => filteredItems;

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <PageBreadcrumb pageTitle="Why Choose Us" />

      <div className="my-5">
        <ComponentCard title="Add New Item">
          <div className="space-y-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 md:gap-6">
            <div>
              <Label>Title</Label>
              <Input
                type="text"
                placeholder="Enter Title"
                value={formState.title}
                onChange={(e) => setFormState({ ...formState, title: e.target.value })}
              />
            </div>
            <div>
              <Label>Description</Label>
              <Input
                type="text"
                placeholder="Enter Description"
                value={formState.description}
                onChange={(e) => setFormState({ ...formState, description: e.target.value })}
              />
            </div>
            <div>
              <Label>Select Image</Label>
              <Input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    setFormState({ ...formState, image: e.target.files[0] });
                  }
                }}
              />
            </div>
            <div>
              <Label>Extra Sections (comma separated)</Label>
              <Input
                type="text"
                placeholder="Extra Sections"
                value={formState.extraSections}
                onChange={(e) => setFormState({ ...formState, extraSections: e.target.value })}
              />
            </div>
            <div className="">
              <Button size="sm" variant="primary" onClick={handleSubmit}>
                Add Item
              </Button>
            </div>
          </div>
        </ComponentCard>
        <ComponentCard>
          <div className="mb-4">
            <Input
              type="text"
              placeholder="Search by title or description"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="border-b border-gray-200 dark:border-gray-700">
            <ul className="flex space-x-6 text-sm font-medium text-center text-gray-500">
              <li
                className={`cursor-pointer px-4 py-2 ${activeTab === 'all' ? 'border-b-2 border-blue-600 text-blue-600' : ''}`}
                onClick={() => setActiveTab('all')}
              >
                All
              </li>
            </ul>
          </div>
        </ComponentCard>
        {filteredItems.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500 dark:text-gray-400">No items found.</p>
            <Button className="mt-4" onClick={handleAddNew}>Add New Item</Button>
          </div>
        ) : (
          <div>
            <div className="text-right mb-2">
            </div>
            <BasicTableOne columns={columns} data={getFilteredByStatus()} />
          </div>
        )}

      </div>

      {editItem && showModal && (
  <Modal isOpen={showModal} onClose={() => setShowModal(false)} className="max-w-[700px] m-4">
    <div className="bg-white rounded-lg p-6 w-full">
      <h2 className="text-xl font-semibold mb-4">Edit Item</h2>
      <div className="space-y-3">
        <Input
          label="Title"
          value={formState.title}
          onChange={e => setFormState({ ...formState, title: e.target.value })}
        />
        <Input
          label="Description"
          value={formState.description}
          onChange={e => setFormState({ ...formState, description: e.target.value })}
        />
        <div>
          <label className="block text-sm font-medium text-gray-700">Image</label>
          <Input
            type="file"
            accept="image/*"
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                setFormState({ ...formState, image: e.target.files[0] });
              }
            }}
          />
          {/* Show image preview if editing */}
          {formState.image && typeof formState.image === 'string' && (
            <div className="mt-2">
              <Image
                src={formState.image}
                alt="Current"
                width={100}
                height={50}
                className="object-cover rounded"
              />
            </div>
          )}
        </div>

        <Input
          label="Extra Sections (comma separated)"
          value={formState.extraSections}
          onChange={e => setFormState({ ...formState, extraSections: e.target.value })}
        />
        <div className="flex justify-end gap-2">
          <Button onClick={() => setShowModal(false)} variant="outline">Cancel</Button>
          <Button onClick={handleSubmit}>Update</Button>
        </div>
      </div>
    </div>
  </Modal>
)}


    </div>
  );
};

export default Page;