'use client';

import ComponentCard from '@/components/common/ComponentCard';
import PageBreadcrumb from '@/components/common/PageBreadCrumb';
import FileInput from '@/components/form/input/FileInput';
import Input from '@/components/form/input/InputField';
import Label from '@/components/form/Label';
import BasicTableOne from '@/components/tables/BasicTableOne';
import Button from '@/components/ui/button/Button';
import { useModule } from '@/context/ModuleContext';
import { EyeIcon, PencilIcon, TrashBinIcon } from '@/icons';
import Image from 'next/image';
import Link from 'next/link';
import React from 'react';

// Define types
interface Module {
  _id: string;
  id: string;
  image: string;
  name: string;
  isDeleted: boolean;
}

interface TableData {
  id: string;
  name: string;
  image: string;
  status: string;
}

const columns = [
  {
    header: 'Module Name',
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
            alt={row.name || "module image"}
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

const Module = () => {
  const { modules } = useModule();

  // Safely extract data array
  const moduleData: TableData[] = Array.isArray(modules?.data)
    ? modules.data.map((mod: Module) => ({
        id: mod._id,
        name: mod.name,
        image: mod.image,
        status: mod.isDeleted ? 'Deleted' : 'Active',
      }))
    : [];

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      console.log('Selected file:', file.name);
    }
  };

  return (
    <div>
      <PageBreadcrumb pageTitle="Module" />
      <div className="my-5">
        <ComponentCard title="Add New Module">
          <div className="space-y-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 md:gap-6">
            <div>
              <Label>Module Name</Label>
              <Input type="text" placeholder="Enter Name" />
            </div>
            <div>
              <Label>Select Image</Label>
              <FileInput onChange={handleFileChange} className="custom-class" />
            </div>
            <div className="mt-6">
              <Button size="sm" variant="primary">
                Add Module
              </Button>
            </div>
          </div>
        </ComponentCard>
      </div>

      <div className="my-5">
        <ComponentCard title="All Modules">
          <div>
            <BasicTableOne columns={columns} data={moduleData} />
          </div>
        </ComponentCard>
      </div>
    </div>
  );
};

export default Module;
