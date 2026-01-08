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
import { useService } from '@/context/ServiceContext';
import EditServiceModal from '@/components/service-component/EditServiceModal';
import { useRouter } from 'next/navigation';
import Pagination from '@/components/tables/Pagination';

// Drag and Drop Imports
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragOverlay,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  rectSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface KeyValue {
  key: string;
  value: string;
  _id?: string;
}

interface ConnectWithItem {
  name: string;
  email: string;
  mobileNo: string;
  _id?: string;
}

interface TitleDescItem {
  title: string;
  description: string;
  image?: string | File | null;
  _id?: string;
}

interface FaqItem {
  question: string;
  answer: string;
  _id?: string;
}

interface PackageItem {
  name: string;
  price: number;
  discount: number;
  discountedPrice: number;
  whatYouGet: string[];
  _id?: string;
}

interface TimeRequiredItem {
  range: string;
  parameters: string;
  _id?: string;
}

interface ExtraSection {
  title: string;
  subtitle?: string[];
  description?: string[];
  subDescription?: string[];
  lists?: string[];
  tags?: string[];
  image?: string[]; 
  _id?: string;
}

interface ServiceDetails {
  aboutUs: any[];
  assuredByFetchTrue: TitleDescItem[];
  benefits: any[];
  highlight: any[];
  howItWorks: TitleDescItem[];
  whyChooseUs: TitleDescItem[];
  faq: FaqItem[];
  document: any[];
  weRequired: TitleDescItem[];
  weDeliver: TitleDescItem[];
  moreInfo: TitleDescItem[];
  packages: PackageItem[];
  extraSections: ExtraSection[];
  extraImages: string[];
  connectWith: ConnectWithItem[];
  timeRequired: TimeRequiredItem[];
  termsAndConditions: any[];
}

interface FranchiseModelItem {
  title: string;
  agreement: string;
  price: number;
  discount: number;
  gst: number;
  _id?: string;
}

interface FranchiseDetails {
  commission: string;
  franchiseModel: FranchiseModelItem[];
  extraSections: ExtraSection[];
}

export interface ServiceData {
  _id: string;
  id: string;
  serviceName: string;
  name: string;
  category: { _id: string; name: string };
  subcategory: { _id: string; name: string };
  thumbnailImage: string;
  bannerImages: string[];
  price: number;
  discount: number;
  gst: number;
  includeGst: boolean;
  gstInRupees?: number;
  totalWithGst?: number;

  keyValues: KeyValue[];
  tags: string[];

  serviceDetails: ServiceDetails;
  franchiseDetails: FranchiseDetails;

  recommendedServices?: boolean;
  sortOrder?: number;
  isDeleted: boolean;
  createdAt?: string;
  updatedAt?: string;
}


const options = [
  { value: "latest", label: "Latest" },
  { value: "oldest", label: "Oldest" },
  { value: "ascending", label: "Ascending" },
  { value: "descending", label: "Descending" },
];

/* ✅ Sortable Service Card - Only 3 lines */
const SortableServiceItem: React.FC<{
  item: TableData;
  handleEdit: (id: string) => void;
  handleDelete: (id: string) => void;
}> = ({ item, handleEdit, handleDelete }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: item.id });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 999 : undefined,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`w-full p-4 rounded-lg border shadow-sm bg-white flex flex-col gap-2 min-h-[120px]
        ${isDragging ? 'ring-2 ring-blue-400 bg-blue-50 shadow-lg' : ''} transition-all duration-150 cursor-grab`}
    >
      <div className="flex items-center gap-2">
        {/* ✅ Sort Order Badge */}
        <span className="bg-gray-200 text-gray-700 text-xs font-bold px-2 py-0.5 rounded">
          #{item.sortOrder}
        </span>

      </div>
      {/* Service Name - First Line */}
      <div className="flex justify-between items-start">
        <h3 className="font-semibold text-sm text-gray-800 truncate flex-1">
          {item.name}
        </h3>
        <span className="text-lg select-none ml-2">⠿</span>
      </div>

      {/* Category Name - Second Line */}
      <div className="flex items-center text-xs text-gray-600">
        <span className="font-medium mr-1">Category:</span>
        <span className="truncate">{item.category}</span>
      </div>

      {/* Subcategory Name - Third Line */}
      <div className="flex items-center text-xs text-gray-600">
        <span className="font-medium mr-1">Subcategory:</span>
        <span className="truncate">{item.subcategory}</span>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2 mt-2 pt-2 border-t border-gray-100">
        {/* <button 
          onClick={(e) => {
            e.stopPropagation();
            handleEdit(item.id);
          }} 
          className="text-yellow-600 p-1 border border-yellow-300 rounded hover:bg-yellow-50 text-xs flex items-center justify-center w-6 h-6"
          title="Edit"
        >
          <PencilIcon className="w-3 h-3" />
        </button> */}
        {/* <button 
          onClick={(e) => {
            e.stopPropagation();
            handleDelete(item.id);
          }} 
          className="text-red-600 p-1 border border-red-300 rounded hover:bg-red-50 text-xs flex items-center justify-center w-6 h-6"
          title="Delete"
        >
          <TrashBinIcon className="w-3 h-3" />
        </button> */}
      </div>
    </div>
  );
};

const ServiceList = () => {
  const { updateService, deleteService } = useService();
  const { categories } = useCategory();
  const { subcategories } = useSubcategory();
  const [filteredServices, setFilteredServices] = useState<ServiceData[]>([]);
  const [allServices, setAllServices] = useState<ServiceData[]>([]); // For drag & drop view
  const [activeTab, setActiveTab] = useState<'all' | 'active' | 'inactive' | 'drag'>('all');
  const [sort, setSort] = useState<string>('oldest');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedSubcategory, setSelectedSubcategory] = useState('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [message, setMessage] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<ServiceData | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(0);

  // Drag and Drop States
  const [dragServices, setDragServices] = useState<TableData[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [overlayItem, setOverlayItem] = useState<TableData | null>(null);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));
  const router = useRouter();

  // Fetch services for table view (paginated)
  const fetchFilteredServices = async (page: number = 1) => {
    try {
      const params = {
        page,
        limit: rowsPerPage,
        ...(searchQuery && { search: searchQuery }),
        ...(selectedCategory && { category: selectedCategory }),
        ...(selectedSubcategory && { subcategory: selectedSubcategory }),
        ...(sort && { sort }),
      };

      const response = await axios.get('/api/service', { params });
      const serviceData = response.data;
      console.log("services :",serviceData);
      
      if (!serviceData.data || serviceData.data.length === 0) {
        setFilteredServices([]);
        setAllServices([]);
        setDragServices([]);
        setMessage(serviceData.message || 'No services found');
        setTotalPages(0);
      } else {
        const mapped = serviceData.data.map((service: Service) => ({
          id: service._id,
          name: service.serviceName.replace(/"/g, ''),
          thumbnailImage: service.thumbnailImage,
          bannerImages: service.bannerImages || [],
          category: service.category || { _id: '', name: 'N/A' },
          subcategory: service.subcategory || { _id: '', name: 'N/A' },
          price: service.price,
          discount: service.discount,
          gst: service.gst,
          includeGst: service.includeGst,
          tags: service.tags?.length ? service.tags : ['N/A'],
          keyValues: service.keyValues?.length
            ? service.keyValues
            : [{ key: 'N/A', value: 'N/A' }],
          serviceDetails: service.serviceDetails,
          franchiseDetails: service.franchiseDetails,
          status: service.isDeleted ? 'Inactive' : 'Active',
          sortOrder: serviceData.data.indexOf(service),
        }));

        setFilteredServices(mapped);
        setTotalPages(serviceData.totalPages || 1);
        setMessage('');
      }
    } catch (error) {
      console.error('Error fetching services:', error);
      setFilteredServices([]);
      setAllServices([]);
      setDragServices([]);
      setMessage('Something went wrong while fetching services');
      setTotalPages(0);
    }
  };

  // Fetch ALL services for drag & drop view (no pagination)
  const fetchAllServicesForDrag = async () => {
    try {
      const params = {
        limit: 1000, // Fetch large number to get all services
        ...(searchQuery && { search: searchQuery }),
        ...(selectedCategory && { category: selectedCategory }),
        ...(selectedSubcategory && { subcategory: selectedSubcategory }),
        ...(sort && { sort }),
      };

      const response = await axios.get('/api/service', { params });
      const serviceData = response.data;

      if (!serviceData.data || serviceData.data.length === 0) {
        setAllServices([]);
        setDragServices([]);
      } else {
        const mapped = serviceData.data.map((service: Service) => ({
          id: service._id,
          name: service.serviceName.replace(/"/g, ''),
          thumbnailImage: service.thumbnailImage,
          bannerImages: service.bannerImages || [],
          category: service.category || { _id: '', name: 'N/A' },
          subcategory: service.subcategory || { _id: '', name: 'N/A' },
          price: service.price,
          discount: service.discount,
          gst: service.gst,
          includeGst: service.includeGst,
          tags: service.tags?.length ? service.tags : ['N/A'],
          keyValues: service.keyValues?.length
            ? service.keyValues
            : [{ key: 'N/A', value: 'N/A' }],
          serviceDetails: service.serviceDetails,
          franchiseDetails: service.franchiseDetails,
          status: service.isDeleted ? 'Inactive' : 'Active',
          sortOrder: serviceData.data.indexOf(service),
        }));

        setAllServices(mapped);

        // Prepare simplified data for drag and drop view
        const dragData: TableData[] = mapped.map((service: ServiceData) => ({
          id: service.id,
          name: service.name,
          category: service.category?.name || 'N/A',
          subcategory: service.subcategory?.name || 'N/A',
          status: service.status,
          sortOrder: service.sortOrder || 0,
        }));

        setDragServices(dragData);
      }
    } catch (error) {
      console.error('Error fetching all services for drag view:', error);
      setAllServices([]);
      setDragServices([]);
    }
  };

  useEffect(() => {
    if (activeTab === 'drag') {
      fetchAllServicesForDrag();
    } else {
      fetchFilteredServices(currentPage);
    }
  }, [searchQuery, selectedCategory, selectedSubcategory, sort, currentPage, activeTab]);

  const handleDelete = async (id: string) => {
    const confirmDelete = window.confirm('Are you sure you want to delete this service?');
    if (!confirmDelete) return;

    try {
      await deleteService(id);
      alert('Service deleted successfully');
      // Refresh both views
      fetchFilteredServices(currentPage);
      if (activeTab === 'drag') {
        fetchAllServicesForDrag();
      }
    } catch (error) {
      const err = error as Error;
      alert('Error deleting service: ' + err.message);
    }
  };

  const handleEdit = (id: string) => {
    router.push(`/service-management/service-list/${id}`);
  };

  // Drag and Drop Handlers
  const { reorderServices } = useService();

  const onDragEnd = async ({ active, over }) => {
    if (!over || active.id === over.id) return;

    const oldIndex = dragServices.findIndex((i) => i.id === active.id);
    const newIndex = dragServices.findIndex((i) => i.id === over.id);

    const newList = arrayMove(dragServices, oldIndex, newIndex).map((item, i) => ({
      ...item,
      sortOrder: i,
    }));

    setDragServices(newList);

    try {
      await reorderServices(
        newList.map((s) => ({ _id: s.id, sortOrder: s.sortOrder }))
      );
    } catch {
      fetchAllServicesForDrag();
    }
  };

  const columns = [
    {
      header: "S.No",
      accessor: "serial",
      render: (_: TableData, index: number) => {
        return (
          <span>{(currentPage - 1) * rowsPerPage + index + 1}</span>
        );
      },
    },

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
  src={row.thumbnailImage && row.thumbnailImage.trim() !== "" 
        ? row.thumbnailImage 
        : "/no-image.png"}
  alt="Thumbnail"
  className="object-cover w-full h-full"
/>

        </div>
      ),
    },
    {
      header: 'Category',
      accessor: 'category',
      render: (row: ServiceData) => <span>{row.category?.name || 'N/A'}</span>,
    },
    {
      header: 'Subcategory',
      accessor: 'subcategory',
      render: (row: ServiceData) => <span>{row.subcategory?.name || 'N/A'}</span>,
    },
    {
      header: 'Price',
      accessor: 'price',
      render: (row: ServiceData) => <span>₹{row.price}</span>,
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
          <Link href={`/service-management/service-list/${row.id}`} passHref>
            <button className="text-yellow-500 border border-yellow-500 rounded-md p-2 hover:bg-yellow-500 hover:text-white">
              <PencilIcon />
            </button>
          </Link>

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
    setSelectedCategory(value);
  };

  const handleSelectSubcategory = (value: string) => {
    setSelectedSubcategory(value);
  };

  const openModal = (service: ServiceData) => {
    console.log("service in modal of gst and include gst : ", service)
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
                className={`px-4 py-2 ${activeTab === 'drag' ? 'border-b-2 border-blue-600 text-blue-600' : ''
                  }`}
                onClick={() => setActiveTab('drag')}
              >
                Drag & Drop
              </li>
            </ul>
          </div>

          <div>
            {message ? (
              <p className="text-red-500 text-center my-4">{message}</p>
            ) : (
              <div>
                {activeTab === 'all' && (
                  <>
                    <BasicTableOne columns={columns} data={filteredServices} />
                    {filteredServices.length > 0 && (
                      <div className="flex justify-center mt-4">
                        <Pagination
                          currentPage={currentPage}
                          totalItems={totalPages * rowsPerPage}
                          totalPages={totalPages}
                          onPageChange={(page) => setCurrentPage(page)}
                        />
                      </div>
                    )}
                  </>
                )}

                {activeTab === 'drag' && (
                  <div>
                    <div className="mb-4 text-sm text-gray-600">
                      Showing all {dragServices.length} services. Drag to reorder.
                    </div>
                    <DndContext
                      sensors={sensors}
                      collisionDetection={closestCenter}
                      onDragEnd={onDragEnd}
                    >
                      <SortableContext items={dragServices.map((d) => d.id)} strategy={rectSortingStrategy}>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
                          {dragServices.map((service) => (
                            <SortableServiceItem
                              key={service.id}
                              item={service}
                              handleEdit={handleEdit}
                              handleDelete={handleDelete}
                            />
                          ))}
                        </div>
                      </SortableContext>

                      <DragOverlay>
                        {activeId && overlayItem && (
                          <div className="w-full p-4 rounded-lg border shadow bg-white flex flex-col gap-2 opacity-80 min-h-[120px]">
                            <div className="flex justify-between items-start">
                              <h3 className="font-semibold text-sm text-gray-800 truncate flex-1">
                                {overlayItem.name}
                              </h3>
                              <span className="text-lg select-none ml-2">⠿</span>
                            </div>
                            <div className="flex items-center text-xs text-gray-600">
                              <span className="font-medium mr-1">Category:</span>
                              <span className="truncate">{overlayItem.category}</span>
                            </div>
                            <div className="flex items-center text-xs text-gray-600">
                              <span className="font-medium mr-1">Subcategory:</span>
                              <span className="truncate">{overlayItem.subcategory}</span>
                            </div>
                          </div>
                        )}
                      </DragOverlay>
                    </DndContext>
                  </div>
                )}
              </div>
            )}
          </div>
        </ComponentCard>
      </div>
    </div>
  );
};

export default ServiceList;