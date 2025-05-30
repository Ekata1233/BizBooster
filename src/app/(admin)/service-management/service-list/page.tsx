'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import PageBreadcrumb from '@/components/common/PageBreadCrumb';
import BasicTableOne from '@/components/tables/BasicTableOne';
import { PencilIcon, TrashBinIcon, EyeIcon, ChevronDownIcon } from '@/icons';
import Link from 'next/link';
import ComponentCard from '@/components/common/ComponentCard';
import ModuleStatCard from '@/components/module-component/ModuleStatCard';
import Label from '@/components/form/Label';
import Select from '@/components/form/Select';
import Input from '@/components/form/input/InputField';
import { Category, useCategory } from '@/context/CategoryContext';
import { useSubcategory } from '@/context/SubcategoryContext';
import axios from 'axios';
import EditServiceModal from '@/components/service-component/EditServiceModal';
import { useService } from '@/context/ServiceContext';



interface Service {
  _id: string;
  serviceName: string;
  thumbnailImage: string;
  bannerImages: string[];
  category: { _id: string; name: string };
  subcategory: { _id: string; name: string };
  price: number;
  serviceDetails: ServiceDetails;
  franchiseDetails: FranchiseDetails;
  isDeleted: boolean;
}

interface ExtraSection {
  title: string;
  description: string;
}

interface WhyChooseItem {
 _id?: string;
}

interface FaqItem {
  question: string;
  answer: string;
}

interface ServiceDetails {
  overview: string;
  highlight: File[] | FileList | null;
  benefits: string;
  howItWorks: string;
  terms: string;
  document: string;
  row?: ExtraSection[]; // <-- add this
  whyChoose?: WhyChooseItem[];    // <-- and this
  faqs?: FaqItem[];                // <-- and this
}

interface FranchiseDetails {
  overview: string;
  commission: string;
  howItWorks: string;
  termsAndConditions: string;
  extraSections?: ExtraSection[];
}

export interface ServiceData {
  _id: string;
  id: string;
  name: string;
  thumbnailImage: string;
  bannerImages: string[];
  category: { _id: string, name: string };
  subcategory: { _id: string, name: string };
  price: number;
  serviceDetails: ServiceDetails;
  franchiseDetails: FranchiseDetails;
  status: string;
}



const options = [
  { value: "latest", label: "Latest" },
  { value: "oldest", label: "Oldest" },
  { value: "ascending", label: "Ascending" },
  { value: "descending", label: "Descending" },
];


const ServiceList = () => {
  const { updateService,deleteService } = useService();
  const { categories } = useCategory();
  const { subcategories } = useSubcategory();
  const [filteredServices, setFilteredServices] = useState<ServiceData[]>([]);
  const [activeTab, setActiveTab] = useState<'all' | 'active' | 'inactive'>('all');
  const [sort, setSort] = useState<string>('oldest');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedSubcategory, setSelectedSubcategory] = useState('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [message, setMessage] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<ServiceData | null>(null);

  const fetchFilteredServices = async () => {
    try {
      const params = {
        ...(searchQuery && { search: searchQuery }),
        ...(selectedCategory && { category: selectedCategory }),
        ...(selectedSubcategory && { subcategory: selectedSubcategory }),
        ...(sort && { sort }),
      };

      const response = await axios.get('/api/service', { params });

      const serviceData = response.data;

      console.log("service data in frontend  : ", serviceData)

      if (serviceData.data.length === 0) {
        setFilteredServices([]);
        setMessage(serviceData.message || 'No services found');
      } else {
        const mapped = serviceData.data.map((service: Service) => ({
          id: service._id,
          name: service.serviceName.replace(/"/g, ''),
          thumbnailImage: service.thumbnailImage,
          bannerImages: service.bannerImages || [],
          category: service.category || { _id: '', name: 'N/A' },
          subcategory: service.subcategory || { _id: '', name: 'N/A' },
          price: service.price,
          serviceDetails: service.serviceDetails,
          franchiseDetails: service.franchiseDetails,
          status: service.isDeleted ? 'Inactive' : 'Active',
        }));

        setFilteredServices(mapped);
        setMessage('');
      }
    } catch (error) {
      console.error('Error fetching services:', error);
      setFilteredServices([]);
      setMessage('Something went wrong while fetching services');
    }
  };

  useEffect(() => {
    fetchFilteredServices();
  }, [searchQuery, selectedCategory, selectedSubcategory, sort]);

  const handleDelete = async (id: string) => {
    // const confirmDelete = window.confirm('Are you sure you want to delete this service?');
    // if (!confirmDelete) return;

    try {
      await deleteService(id);
      alert('service deleted successfully');
      fetchFilteredServices();
    } catch (error) {
      const err = error as Error;
      alert('Error deleting service: ' + err.message);
    }
  };

  const columns = [
    {
      header: 'Service Name',
      accessor: 'name',
      render: (row: ServiceData) => (
        <span className="font-semibold text-blue-600">{row.name}</span>
      ),
    },
    {
      header: 'Image',
      accessor: 'thumbnailImage',
      render: (row: ServiceData) => (
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
      accessor: 'category', // Keep this as string
      render: (row: ServiceData) => <span>{row.category?.name || 'N/A'}</span>,
    },

    {
      header: 'Subcategory',
      accessor: 'subcategory', // Keep this as string
      render: (row: ServiceData) => <span>{row.subcategory?.name || 'N/A'}</span>,
    },
    {
      header: 'Price',
      accessor: 'price',
      render: (row: ServiceData) => <span>${row.price}</span>,
    },
    {
      header: 'Status',
      accessor: 'status',
      render: (row: ServiceData) => {
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
      render: (row: ServiceData) => (
        <div className="flex gap-2">
          <button className="text-yellow-500 border border-yellow-500 rounded-md p-2 hover:bg-yellow-500 hover:text-white"
            onClick={() => openModal(row)}
          >
            <PencilIcon />
          </button>
          <button onClick={() => handleDelete(row.id)} className="text-red-500 border border-red-500 rounded-md p-2 hover:bg-red-500 hover:text-white">
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


  const categoryOptions = categories.map((cat: Category) => ({
    value: cat._id ?? '',
    label: cat.name,
  }));

  const filteredSubcategories = subcategories.filter(
    (sub) => sub.category?._id === selectedCategory
  );

  const subcategoryOptions = filteredSubcategories.map((sub) => ({
    value: sub._id ?? '',
    label: sub.name,
  }));

  const handleSelectChange = (value: string) => {
    setSelectedCategory(value); // required to set the selected module
  };

  const handleSelectSubcategory = (value: string) => {
    setSelectedSubcategory(value); // required to set the selected module
  };

  const openModal = (service: ServiceData) => {
    setSelectedService(service);
    setIsOpen(true);
  };

  const closeModal = () => {
    setIsOpen(false);

  };

  return (
    <div>
      <PageBreadcrumb pageTitle="Service List" />

      <div>
        <ModuleStatCard />
      </div>

      <div className="my-5">
        <ComponentCard title="Search Filter">
          <div className="space-y-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 md:gap-6">

            <div>
              <Label>Select Category</Label>
              <div className="relative">
                <Select
                  options={categoryOptions}
                  placeholder="Select Category"
                  onChange={handleSelectChange}
                  className="dark:bg-dark-900"
                />
                <span className="absolute text-gray-500 -translate-y-1/2 pointer-events-none right-3 top-1/2 dark:text-gray-400">
                  <ChevronDownIcon />
                </span>
              </div>
            </div>

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

            <div>
              <Label>Select Input</Label>
              <div className="relative">
                <Select
                  options={options}
                  placeholder="Sort By"
                  onChange={(value: string) => setSort(value)}
                  className="dark:bg-dark-900"
                />
                <span className="absolute text-gray-500 -translate-y-1/2 pointer-events-none right-3 top-1/2 dark:text-gray-400">
                  <ChevronDownIcon />
                </span>
              </div>
            </div>

            <div>
              <Label>Other Filter</Label>
              <Input
                type="text"
                placeholder="Search by service name"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />

            </div>
          </div>
        </ComponentCard>
      </div>

      <div>
        <ComponentCard title="Service List" className="">
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

          {message ? (
            <p className="text-red-500 text-center my-4">{message}</p>
          ) : (
            <BasicTableOne columns={columns} data={filteredServices} />
          )}
        </ComponentCard>
      </div>

      <EditServiceModal
        isOpen={isOpen}
        onClose={closeModal}
        service={selectedService}
        onUpdate={async (id, formData) => {
          await updateService(id, formData);
          fetchFilteredServices();
        }}
      />
    </div>
  );
};

export default ServiceList;