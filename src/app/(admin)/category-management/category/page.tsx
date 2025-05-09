'use client'
import AddCategory from '@/components/category-component/AddCategory'
import ComponentCard from '@/components/common/ComponentCard'
import PageBreadcrumb from '@/components/common/PageBreadCrumb'
import BasicTableOne from '@/components/tables/BasicTableOne'
import { useCategory } from '@/context/CategoryContext'
import { ChevronDownIcon, EyeIcon, PencilIcon, TrashBinIcon } from '@/icons'
import Image from 'next/image'
import Link from 'next/link'
import React, { useState } from 'react'
import FileInput from '@/components/form/input/FileInput';
import Input from '@/components/form/input/InputField';
import Label from '@/components/form/Label';
import Button from '@/components/ui/button/Button';
import { Modal } from '@/components/ui/modal';
import { useModal } from '@/hooks/useModal'
import Select from '@/components/form/Select'

interface Module {
  _id: string;
  name: string;
  image: string;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

interface Category {
  _id: string;
  name: string;
  image: string;
  isDeleted: boolean;
  createdAt: string;
  updatedAt?: string;
  __v?: number;
  module: Module | null;
}

interface TableData {
  id: string;
  moduleName: string;
  name: string;
  image: string;
  status: string;
}


const Category = () => {
  const { categories, updateCategory,deleteCategory } = useCategory();
  const { isOpen, openModal, closeModal } = useModal();
  const [CategoryName, setCategoryName] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState('');
  console.log("category : ", categories)

  if (!categories || !Array.isArray(categories)) {
    return <div>Loading...</div>;
  }

  const tableData: TableData[] = categories.map((cat) => ({
    id: cat._id || '',
    moduleName: cat.module?.name || 'N/A',
    name: cat.name || 'N/A',
    image: cat.image || '',
    status: cat.isDeleted ? 'Deleted' : 'Active',
  }));

  const columns = [
    {
      header: 'Module Name',
      accessor: 'moduleName',
      render: (row: TableData) => (
        <span className="font-medium text-blue-600">{row.moduleName}</span>
      ),
    },
    {
      header: 'Category Name',
      accessor: 'name',
    },
    {
      header: 'Image',
      accessor: 'image',
      render: (row: TableData) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 overflow-hidden">
            <Image
              width={40}
              height={40}
              src={row.image}
              alt={row.name || "Category image"}
              className="object-cover rounded"
            />
          </div>
        </div>
      ),
    },
    {
      header: 'Status',
      accessor: 'status',
      render: (row: TableData) => {
        const status = row.status;
        let colorClass = '';

        switch (status) {
          case 'Deleted':
            colorClass = 'text-red-500 bg-red-100 border border-red-300';
            break;
          case 'Active':
            colorClass = 'text-green-600 bg-green-100 border border-green-300';
            break;
          default:
            colorClass = 'text-gray-600 bg-gray-100 border border-gray-300';
        }

        return (
          <span className={`px-3 py-1 rounded-full text-sm font-semibold ${colorClass}`}>
            {status}
          </span>
        );
      },
    },
    {
      header: 'Action',
      accessor: 'action',
      render: (row: TableData) => (
        <div className="flex gap-2">
          <button onClick={() => {
            setEditingCategoryId(row.id);
            setCategoryName(row.name);
            // Optionally reset file
            setSelectedFile(null);
            openModal();
          }} className="text-yellow-500 border border-yellow-500 rounded-md p-2 hover:bg-yellow-500 hover:text-white hover:border-yellow-500">
            <PencilIcon />
          </button>
          <button onClick={() => handleDelete(row.id)} className="text-red-500 border border-red-500 rounded-md p-2 hover:bg-red-500 hover:text-white hover:border-red-500">
            <TrashBinIcon />
          </button>
          <Link href={`/customer-management/user/user-list/${row.id}`} passHref>
            <button className="text-blue-500 border border-blue-500 rounded-md p-2 hover:bg-blue-500 hover:text-white hover:border-blue-500">
              <EyeIcon />
            </button>
          </Link>
        </div>
      ),
    },
  ];

  const handleSave = async () => {
    if (!editingCategoryId) return;

    const formData = new FormData();
    formData.append('name', CategoryName);
    if (selectedFile) {
      formData.append('image', selectedFile);
    }

    try {
      await updateCategory(editingCategoryId, formData);
      console.log('Category updated successfully');
      closeModal();
      setEditingCategoryId(null);
      setCategoryName('');
      setSelectedFile(null);
    } catch (error) {
      console.error('Error updating Category:', error);
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      console.log('Selected file:', file.name);
    }
  };

  const options = categories.map((cat: any) => ({
    value: cat._id, // or mod._id
    label: cat.name,
  }));

  const handleSelectChange = (value: string) => {
    console.log("Selected value:", value);
    setSelectedCategory(value); // required to set the selected Category
  };

  const handleDelete = async (id: string) => {
    const confirmDelete = window.confirm('Are you sure you want to delete this category?');
    if (!confirmDelete) return;

    try {
        await deleteCategory(id);
        alert('Category deleted successfully');
    } catch (error) {
        alert('Error deleting category:');
    }
};

  return (
    <div>
      <PageBreadcrumb pageTitle="Category" />
      <div className='my-5'>
        <AddCategory />
      </div>
      <div className='my-5'>
        <ComponentCard title="All Categories">
          <div>
            <BasicTableOne columns={columns} data={tableData} />
          </div>
        </ComponentCard>
      </div>

      <div>
        <Modal isOpen={isOpen} onClose={closeModal} className="max-w-[700px] m-4">
          <div className="no-scrollbar relative w-full max-w-[700px] overflow-y-auto rounded-3xl bg-white p-4 dark:bg-gray-900 lg:p-11">
            <div className="px-2 pr-14">
              <h4 className="mb-5 text-2xl font-semibold text-gray-800 dark:text-white/90">
                Edit Category Information
              </h4>

            </div>

            <form className="flex flex-col">
              <div className="custom-scrollbar h-[270px] overflow-y-auto px-2 pb-3">
                <div className="">
                  <div className="grid grid-cols-1 gap-x-6 gap-y-5 ">

                    <div>
                      <Label>Select Module</Label>
                      <div className="relative">
                        <Select
                          options={options}
                          placeholder="Select an option"
                          onChange={handleSelectChange}
                          className="dark:bg-dark-900"
                        />
                        <span className="absolute text-gray-500 -translate-y-1/2 pointer-events-none right-3 top-1/2 dark:text-gray-400">
                          <ChevronDownIcon />
                        </span>
                      </div>
                    </div>

                    <div>
                      <Label>Category Name</Label>
                      <Input
                        type="text"
                        placeholder="Enter Category"
                        value={CategoryName}
                        onChange={(e) => setCategoryName(e.target.value)}
                      />

                    </div>
                    <div>
                      <Label>Select Image</Label>
                      <FileInput onChange={handleFileChange} className="custom-class" />

                    </div>

                  </div>
                </div>

              </div>
              <div className="flex items-center gap-3 px-2 mt-6 lg:justify-end">
                <Button size="sm" variant="outline" onClick={closeModal}>
                  Close
                </Button>
                <Button size="sm" onClick={handleSave}>
                  Save Changes
                </Button>
              </div>
            </form>
          </div>
        </Modal>
      </div>
    </div>
  )
}

export default Category