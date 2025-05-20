'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import PageBreadcrumb from '@/components/common/PageBreadCrumb';
import BasicTableOne from '@/components/tables/BasicTableOne';
import { PencilIcon, TrashBinIcon, EyeIcon } from '@/icons';
import Link from 'next/link';
import { useService } from '@/context/ServiceContext';

interface Service {
  _id: string;
  serviceName: string;
  thumbnailImage: string;
  category?: { name: string };
  subcategory?: { name: string };
  price: number;
  isDeleted: boolean;
}

interface ServiceTableData {
  id: string;
  name: string;
  image: string;
  bannerImage: string;
  price: number;
  status: string;
  thumbnailImage?: string;
}

interface ServicesResponse {
  success: boolean;
  data: Service[];
}


const ServiceList = () => {
  const { services } = useService();
  console.log("services", services);
  const [filteredServices, setFilteredServices] = useState<ServiceTableData[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'all' | 'active' | 'inactive'>('all');

  // Update filteredServices when services, searchQuery or activeTab changes
  useEffect(() => {
    if (!services?.data || !Array.isArray(services.data)) return;

    const filtered = services.data
      .filter((service: Service) => {
        if (activeTab === 'active') return !service.isDeleted;
        if (activeTab === 'inactive') return service.isDeleted;
        return true;
      })
      .filter((service: Service) =>
        service.serviceName.toLowerCase().replace(/"/g, '').includes(searchQuery.toLowerCase())
      )
      .map((service: Service) => ({
        id: service._id,
        name: service.serviceName.replace(/"/g, ''),
        thumbnailImage: service.thumbnailImage,
        categoryName: service.category?.name || 'N/A',
        subcategoryName: service.subcategory?.name || 'N/A',
        price: service.price,
        status: service.isDeleted ? 'Inactive' : 'Active',
      }));

    setFilteredServices(filtered);
  }, [services, searchQuery, activeTab]);




  const columns = [
    {
      header: 'Service Name',
      accessor: 'name',
      render: (row: ServiceTableData) => (
        <span className="font-semibold text-blue-600">{row.name}</span>
      ),
    },
    {
      header: 'Image',
      accessor: 'thumbnailImage',
      render: (row: ServiceTableData) => (
        <div className="w-20 h-20 overflow-hidden rounded">
          <Image
            width={80}
            height={80}
            src={row.thumbnailImage as string}
            alt={row.name}
            className="object-cover"
          />

        </div>
      ),
    },
    {
      header: 'Category',
      accessor: 'categoryName',
    },
    {
      header: 'Subcategory',
      accessor: 'subcategoryName',
    },
    {
      header: 'Price',
      accessor: 'price',
      render: (row: ServiceTableData) => <span>${row.price}</span>,
    },
    {
      header: 'Status',
      accessor: 'status',
      render: (row: ServiceTableData) => {
        const colorClass =
          row.status === 'Active'
            ? 'text-green-600 bg-green-100 border border-green-300'
            : 'text-red-500 bg-red-100 border border-red-300';

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
      render: (row: ServiceTableData) => (
        <div className="flex gap-2">
          <button className="text-yellow-500 border border-yellow-500 rounded-md p-2 hover:bg-yellow-500 hover:text-white">
            <PencilIcon />
          </button>
          <button className="text-red-500 border border-red-500 rounded-md p-2 hover:bg-red-500 hover:text-white">
            <TrashBinIcon />
          </button>
          <Link href={`/service-management/service-details/${row.id}`} passHref>
            <button className="text-blue-500 border border-blue-500 rounded-md p-2 hover:bg-blue-500 hover:text-white">
              <EyeIcon />
            </button>
          </Link>
        </div>
      ),
    },
  ];


  return (
    <div>
      <PageBreadcrumb pageTitle="Service List" />

      <div className="my-5">
        <input
          type="text"
          placeholder="Search by service name"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="border border-gray-300 rounded px-4 py-2 mb-4 w-full max-w-sm"
        />

        <div className="border-b border-gray-200 mb-4">
          <ul className="flex space-x-6 text-sm font-medium text-center text-gray-500 cursor-pointer">
            <li
              className={`px-4 py-2 ${activeTab === 'all' ? 'border-b-2 border-blue-600 text-blue-600' : ''
                }`}
              onClick={() => setActiveTab('all')}
            >
              All
            </li>
            <li
              className={`px-4 py-2 ${activeTab === 'active' ? 'border-b-2 border-blue-600 text-blue-600' : ''
                }`}
              onClick={() => setActiveTab('active')}
            >
              Active
            </li>
            <li
              className={`px-4 py-2 ${activeTab === 'inactive' ? 'border-b-2 border-blue-600 text-blue-600' : ''
                }`}
              onClick={() => setActiveTab('inactive')}
            >
              Inactive
            </li>
          </ul>
        </div>

        <BasicTableOne columns={columns} data={filteredServices} />
      </div>
    </div>
  );
};

export default ServiceList;
