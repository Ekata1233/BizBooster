'use client'
import AddCategory from '@/components/category-component/AddCategory'
import ComponentCard from '@/components/common/ComponentCard'
import PageBreadcrumb from '@/components/common/PageBreadCrumb'
import BasicTableOne from '@/components/tables/BasicTableOne'
import { useCategory } from '@/context/CategoryContext'
import { EyeIcon, PencilIcon, TrashBinIcon } from '@/icons'
import Image from 'next/image'
import Link from 'next/link'
import React from 'react'

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
        <button className="text-yellow-500 border border-yellow-500 rounded-md p-2 hover:bg-yellow-500 hover:text-white hover:border-yellow-500">
          <PencilIcon />
        </button>
        <button className="text-red-500 border border-red-500 rounded-md p-2 hover:bg-red-500 hover:text-white hover:border-red-500">
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

const Category = () => {
  const { categories } = useCategory();
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
    </div>
  )
}

export default Category