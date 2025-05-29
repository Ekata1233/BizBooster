'use client'
import AddCategory from '@/components/category-component/AddCategory'
import ComponentCard from '@/components/common/ComponentCard'
import PageBreadcrumb from '@/components/common/PageBreadCrumb'
import BasicTableOne from '@/components/tables/BasicTableOne'
import { useCategory } from '@/context/CategoryContext'
import { ChevronDownIcon, EyeIcon, PencilIcon, TrashBinIcon } from '@/icons'
import Image from 'next/image'
import Link from 'next/link'
import React, { useEffect, useState } from 'react'
import FileInput from '@/components/form/input/FileInput';
import Input from '@/components/form/input/InputField';
import Label from '@/components/form/Label';
import Button from '@/components/ui/button/Button';
import { Modal } from '@/components/ui/modal';
import { useModal } from '@/hooks/useModal'
import { useModule } from '@/context/ModuleContext'
import axios from 'axios'
import Select from '@/components/form/Select'
import ModuleStatCard from '@/components/module-component/ModuleStatCard'

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
  subcategoryCount: number;
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
  subcategoryCount: number;
  status: string;
}

type CategoryItem = {
  _id: string;
  name: string;
  module?: {
    _id: string;
  };
};
const Category = () => {
  const { categories, updateCategory, deleteCategory } = useCategory();
  const { modules } = useModule();
  const { isOpen, openModal, closeModal } = useModal();
  const [CategoryName, setCategoryName] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
  const [selectedModuleId, setSelectedModuleId] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filteredCategory, setFilteredCategory] = useState<TableData[]>([]);
  const [selectedModule, setSelectedModule] = useState<string>('');
  const [activeTab, setActiveTab] = useState('all');


  const moduleOptions = modules.map((module) => ({
    value: module._id, // or value: module if you want full object
    label: module.name,
    image: module.image,
  }));

  const fetchFilteredCategory = async () => {
    try {
      const params = {
        ...(selectedModule && { selectedModule }),
        ...(searchQuery && { search: searchQuery }),
      };

      console.log("params : ", params)

      const response = await axios.get('/api/category', { params });
      const data = response.data.data;
      console.log("data in category : ", data)

      if (data.length === 0) {
        setFilteredCategory([]);
      } else {
        const tableData: TableData[] = data.map((cat: Category) => ({
          id: cat._id || '',
          moduleName: cat.module?.name || 'N/A',
          name: cat.name || 'N/A',
          image: cat.image || '',
          subcategoryCount: cat.subcategoryCount,
          status: cat.isDeleted ? 'Deleted' : 'Active',
        }));
        setFilteredCategory(tableData);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      setFilteredCategory([]);
    }
  }

  useEffect(() => {
    fetchFilteredCategory()
  }, [selectedModule, searchQuery])


  const columns = [

    {
      header: 'Category Name',
      accessor: 'name',
    },
    {
      header: 'Module Name',
      accessor: 'moduleName',
      render: (row: TableData) => (
        <span className="font-medium text-blue-600">{row.moduleName}</span>
      ),
    },
    {
      header: 'Image',
      accessor: 'image',
      render: (row: TableData) => (
        <div className="flex items-center gap-3">
          <div className="w-20 h-20 overflow-hidden">
            <Image
              width={130}
              height={130}
              src={row.image}
              alt={row.name || "Category image"}
              className="object-cover rounded"
            />
          </div>
        </div>
      ),
    },
    {
      header: 'Subcategory Count',
      accessor: 'subcategoryCount',
      render: (row: TableData) => { // Log the row data
        return (
          <div className="flex justify-center items-center">
            {row.subcategoryCount}
          </div>
        );
      },
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
          <button
            onClick={() => handleEdit(row.id)}
            className="text-yellow-500 border border-yellow-500 rounded-md p-2 hover:bg-yellow-500 hover:text-white hover:border-yellow-500">
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

  const handleEdit = (id: string) => {
    const category = categories.find(item => item._id === id) as CategoryItem | undefined;
    console.log("in handle edit : ", category)
    if (category) {
      setEditingCategoryId(id);
      setCategoryName(category.name);
      setSelectedModuleId(category.module?._id || '');
      setSelectedFile(null);
      openModal();
    }
  };

  const handleUpdateData = async () => {
    if (!editingCategoryId) return;

    const formData = new FormData();
    formData.append('name', CategoryName);
    formData.append("module", selectedModuleId);
    if (selectedFile) {
      formData.append('image', selectedFile);
    }

    try {
      await updateCategory(editingCategoryId, formData);
      alert('Category updated successfully');
      closeModal();
      setEditingCategoryId(null);
      setCategoryName('');
      setSelectedFile(null);
      fetchFilteredCategory();
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

  const handleDelete = async (id: string) => {
    const confirmDelete = window.confirm('Are you sure you want to delete this category?');
    if (!confirmDelete) return;

    try {
      await deleteCategory(id);
      alert('Category deleted successfully');
      fetchFilteredCategory();
    } catch (error) {
      const err = error as Error;
      alert('Error deleting category: ' + err.message);
    }
  };

  const getFilteredByStatus = () => {
    if (activeTab === 'active') {
      return filteredCategory.filter(cat => cat.status === 'Active');
    } else if (activeTab === 'inactive') {
      return filteredCategory.filter(cat => cat.status === 'Deleted');
    }
    return filteredCategory;
  };

  if (!categories || !Array.isArray(categories)) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <PageBreadcrumb pageTitle="Category" />
      <div className='my-5'>
        <AddCategory />
      </div>

      <div>
        <ModuleStatCard />
      </div>

      <div className='my-5'>
        <ComponentCard title="All Categories">
          <div className="space-y-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 md:gap-6">
            <div>
              <Label>Filter by Name</Label>
              <Input
                type="text"
                placeholder="Search by category or module name"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />

            </div>
            <div>
              <Label>Select Module</Label>
              <div className="relative">
                <Select
                  options={moduleOptions}
                  placeholder="Modules"
                  onChange={(value: string) => setSelectedModule(value)}
                  className="dark:bg-dark-900"
                />
                <span className="absolute text-gray-500 -translate-y-1/2 pointer-events-none right-3 top-1/2 dark:text-gray-400">
                  <ChevronDownIcon />
                </span>
              </div>
            </div>
          </div>

          <div className="border-b border-gray-200">
            <ul className="flex space-x-6 text-sm font-medium text-center text-gray-500">
              <li
                className={`cursor-pointer px-4 py-2 ${activeTab === 'all' ? 'border-b-2 border-blue-600 text-blue-600' : ''}`}
                onClick={() => setActiveTab('all')}
              >
                All
              </li>
              <li
                className={`cursor-pointer px-4 py-2 ${activeTab === 'active' ? 'border-b-2 border-blue-600 text-blue-600' : ''}`}
                onClick={() => setActiveTab('active')}
              >
                Active
              </li>
              <li
                className={`cursor-pointer px-4 py-2 ${activeTab === 'inactive' ? 'border-b-2 border-blue-600 text-blue-600' : ''}`}
                onClick={() => setActiveTab('inactive')}
              >
                Inactive
              </li>
            </ul>
          </div>
          <div>
            <BasicTableOne columns={columns} data={getFilteredByStatus()} />

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

                        <select
                          value={selectedModuleId}
                          onChange={(e) => setSelectedModuleId(e.target.value)}
                          className="w-full p-2 border rounded"
                        >
                          <option value="">Select Module</option>
                          {modules.map((mod) => (
                            <option key={mod._id} value={mod._id}>
                              {mod.name}
                            </option>
                          ))}
                        </select>

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
                <Button size="sm" onClick={handleUpdateData}>
                  Update Changes
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