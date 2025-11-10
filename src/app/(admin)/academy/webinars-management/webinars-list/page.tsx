'use client';

import React, { useState, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import PageBreadcrumb from '@/components/common/PageBreadCrumb';
import ComponentCard from '@/components/common/ComponentCard';
import ModuleStatCard from '@/components/module-component/ModuleStatCard';
import RouteLoader from '@/components/RouteLoader';
import Input from '@/components/form/input/InputField';
import Label from '@/components/form/Label';
import { EyeIcon, TrashBinIcon } from '@/icons';
import { PlusCircle } from 'lucide-react';
import { useWebinars } from '@/context/WebinarContext';
import { useRouter } from 'next/navigation';
import BasicTableOne from '@/components/tables/BasicTableOne'; // ✅ Added
import Pagination from '@/components/tables/Pagination'; // ✅ Added pagination

// Interfaces
interface VideoDetail {
  videoName: string;
  videoDescription: string;
  videoUrl: string;
  videoImageUrl?: string;
}

interface TableData {
  id: string;
  name: string;
  imageUrl: string;
  description: string;
  videoDetails: VideoDetail[];
  displayVideoNames: string[];
  displayVideoDescriptions: string[];
  displayVideoUrls: string[];
  status: 'Active' | 'Inactive';
}

const WebinarPage = () => {
  const { webinars, deleteWebinar } = useWebinars();
  const router = useRouter();

  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'Active' | 'Inactive'>('all');
  const [expandedRowIds, setExpandedRowIds] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10;

  const toggleRowExpansion = (id: string) => {
    setExpandedRowIds((prev) =>
      prev.includes(id) ? prev.filter((r) => r !== id) : [...prev, id],
    );
  };

  const filteredAndMappedWebinars = useMemo(() => {
    if (!webinars || !Array.isArray(webinars)) return [];

    return webinars
      .filter((w) => {
        const matchesSearch = w.name.toLowerCase().includes(searchQuery.toLowerCase());
        const status: TableData['status'] = w.isDeleted ? 'Inactive' : 'Active';
        const matchesTab =
          activeTab === 'all' ||
          (activeTab === 'Active' && status === 'Active') ||
          (activeTab === 'Inactive' && status === 'Inactive');
        return matchesSearch && matchesTab;
      })
      .map((w) => ({
        id: w._id,
        name: w.name,
        imageUrl: w.imageUrl,
        description: w.description ?? 'N/A',
        videoDetails: w.video || [],
        displayVideoNames: w.video?.map((v: VideoDetail) => v.videoName) || [],
        displayVideoDescriptions: w.video?.map((v: VideoDetail) => v.videoDescription) || [],
        displayVideoUrls: w.video?.map((v: VideoDetail) => v.videoUrl) || [],
        status: (w.isDeleted ? 'Inactive' : 'Active') as TableData['status'],
      }));
  }, [webinars, searchQuery, activeTab]);

  const handleEdit = (id: string) => router.push(`/academy/webinars-management/modals/${id}`);

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this webinar?')) return;
    await deleteWebinar(id);
  };

  // Pagination logic
  const totalPages = Math.ceil(filteredAndMappedWebinars.length / rowsPerPage);
  const indexOfLast = currentPage * rowsPerPage;
  const indexOfFirst = indexOfLast - rowsPerPage;
  const currentRows = filteredAndMappedWebinars.slice(indexOfFirst, indexOfLast);

  if (!webinars) return <RouteLoader />;

  // ✅ Define columns for BasicTableOne
  const columns = [
    {
      header: 'Sr. No',
      accessor: 'srNo',
      render: (_: TableData, i: number) => (
        <span>{(currentPage - 1) * rowsPerPage + i + 1}</span>
      ),
    },
    {
      header: 'Name',
      accessor: 'name',
      render: (row: TableData) => <span className="font-medium text-gray-800">{row.name}</span>,
    },
    {
      header: 'Image',
      accessor: 'image',
      render: (row: TableData) => (
        <div className="relative w-16 h-16">
          <Image
            src={row.imageUrl || '/path/to/default-image.png'}
            alt={row.name}
            fill
            className="object-cover rounded-md border"
          />
        </div>
      ),
    },
    {
      header: 'Description',
      accessor: 'description',
      render: (row: TableData) => (
        <div className="text-gray-700 whitespace-pre-line max-w-xs">{row.description}</div>
      ),
    },
    {
      header: 'Videos Count',
      accessor: 'count',
      render: (row: TableData) => <span>{row.displayVideoUrls.length}</span>,
    },
    {
      header: 'Action',
      accessor: 'action',
      render: (row: TableData) => (
        <div className="flex gap-2 justify-center">
          <button
            onClick={() => handleEdit(row.id)}
            className="p-2 rounded-md border border-yellow-500 text-yellow-500 hover:bg-yellow-500 hover:text-white"
          >
            <PlusCircle size={16} />
          </button>
          <button
            onClick={() => handleDelete(row.id)}
            className="p-2 rounded-md border border-red-500 text-red-500 hover:bg-red-500 hover:text-white"
          >
            <TrashBinIcon />
          </button>
          <Link
            href={`/academy/webinars-management/webinars-list/${row.id}`}
            className="p-2 rounded-md border border-blue-500 text-blue-500 hover:bg-blue-500 hover:text-white"
          >
            <EyeIcon />
          </Link>
        </div>
      ),
    },
  ];

  return (
    <div>
      <PageBreadcrumb pageTitle="Webinars" />
      <ModuleStatCard />

      <div className="my-5">
        <ComponentCard title="All Webinars">
          {/* Search */}
          <Input
            placeholder="Search by webinar name"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="mb-4"
          />

          {/* Table Section */}
          <BasicTableOne columns={columns} data={currentRows} />

          {/* Pagination */}
          {filteredAndMappedWebinars.length > 0 && (
            <div className="flex justify-center mt-4">
              <Pagination
                currentPage={currentPage}
                totalItems={filteredAndMappedWebinars.length}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
              />
            </div>
          )}
        </ComponentCard>
      </div>
    </div>
  );
};

export default WebinarPage;
