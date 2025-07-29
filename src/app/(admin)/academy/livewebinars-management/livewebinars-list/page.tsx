'use client';

import React, { useEffect, useState } from 'react';
import ComponentCard from '@/components/common/ComponentCard';
import PageBreadcrumb from '@/components/common/PageBreadCrumb';
import Input from '@/components/form/input/InputField';
import ModuleStatCard from '@/components/module-component/ModuleStatCard';
import RouteLoader from '@/components/RouteLoader';
import BasicTableOne from '@/components/tables/BasicTableOne';
import { useLiveWebinars } from '@/context/LiveWebinarContext';
import { EyeIcon, TrashBinIcon } from '@/icons';
import { PencilIcon } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface TableData {
  id: string;
  user: string[];
  name: string;
  imageUrl: string;
  description: string;
  displayVideoUrls: string[];
  date: string;
  startTime: string;
  endTime: string;
  status: string;
}

const LiveWebinar = () => {
  const router = useRouter();
  const { webinars, deleteWebinar } = useLiveWebinars();

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filteredCertificates, setFilteredCertificates] = useState<TableData[]>([]);
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    if (!webinars || !Array.isArray(webinars)) {
      setFilteredCertificates([]);
      return;
    }

    const filteredData = webinars
      .filter((webinar) => {
        const matchesSearch = webinar.name.toLowerCase().includes(searchQuery.toLowerCase());
        const status = webinar.isDeleted ? 'Deleted' : 'Active'; // Determine status
        const matchesTab =
          activeTab === 'all' ||
          (activeTab === 'active' && status === 'Active') ||
          (activeTab === 'inactive' && status === 'Deleted');
        return matchesSearch && matchesTab;
      })
      .map((mod) => ({
        id: mod._id,
        user: mod.user?.map((u) => u.id) || [],
        name: mod.name,
        imageUrl: mod.imageUrl,
        description: mod.description || 'N/A',
        displayVideoUrls: Array.isArray(mod.displayVideoUrls)
          ? mod.displayVideoUrls
          : typeof mod.displayVideoUrls === 'string'
            ? (mod.displayVideoUrls as string).split(',').map(url => url.trim()).filter(Boolean) // Ensure URLs are trimmed and not empty
            : [],
        date: mod.date || 'N/A',
        startTime: mod.startTime || 'N/A',
        endTime: mod.endTime || 'N/A',
        status: mod.isDeleted ? 'Deleted' : 'Active',
      }));

    setFilteredCertificates(filteredData);
  }, [searchQuery, webinars, activeTab]); // Added activeTab to dependency array for re-filtering on tab change

  const columns = [
    {
      header: 'Webinar Name',
      accessor: 'name',
    },
    {
      header: 'Image',
      accessor: 'imageUrl',
      render: (row: TableData) => (
        <div className="flex items-center gap-3">
          <div className="w-20 h-20 overflow-hidden">
            {row.imageUrl ? (
              <Image
                width={130}
                height={130}
                src={row.imageUrl}
                alt={row.name || 'certification image'}
                className="object-cover rounded"
              />
            ) : (
              <span>No Image</span>
            )}
          </div>
        </div>
      ),
    },
    {
      header: 'Webinar Description',
      accessor: 'description',
      render: (row: TableData) => (
        <div className="flex flex-col">
          {row.description ? (
            row.description.split(',').map((desc: string, idx: number) => (
              <p key={idx}>{desc.trim()}</p>
            ))
          ) : (
            <span>N/A</span>
          )}
        </div>
      ),
    },
    {
      header: 'Live Webinar Link',
      accessor: 'liveWebinarLink',
      render: (row: TableData) => (
        <div className="flex flex-col gap-1">
          {row.displayVideoUrls && row.displayVideoUrls.length > 0 ? (
            row.displayVideoUrls.map((url, idx) => (
              <a
                key={idx}
                href={url.trim()}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 underline break-all"
              >
                {url.trim()}
              </a>
            ))
          ) : (
            <span className="text-gray-400">No Links</span>
          )}
        </div>
      ),
    },
    {
      header: 'Webinar Date',
      accessor: 'date',
      render: (row: TableData) => (
        <div className="flex justify-center items-center">
          {row.date || 'N/A'}
        </div>
      ),
    },
    {
      header: 'Webinar Start Time',
      accessor: 'startTime',
      render: (row: TableData) => (
        <div className="flex justify-center items-center">
          {row.startTime || 'N/A'}
        </div>
      ),
    },
    {
      header: 'Webinar End Time',
      accessor: 'endTime',
      render: (row: TableData) => (
        <div className="flex justify-center items-center">
          {row.endTime || 'N/A'}
        </div>
      ),
    },
    {
      header: 'Videos Count',
      accessor: 'categoryCount',
      render: (row: TableData) => {
        return (
          <div className="flex justify-center items-center">
            {row.displayVideoUrls.length}
          </div>
        );
      },
    },
    {
      header: 'User Ids Count',
      accessor: 'userIdsCount',
      render: (row: TableData) => {
        return (
          <div className="flex justify-center items-center">
            {row.user.length}
          </div>
        );
      },
    },
    {
      header: 'Action',
      accessor: 'action',
      render: (row: TableData) => {
        return (
          <div className="flex gap-2">
            <button
              onClick={() => handleEdit(row.id)}
              className="text-yellow-500 border border-yellow-500 rounded-md p-2 hover:bg-yellow-500 hover:text-white hover:border-yellow-500"
            >
              <PencilIcon />
            </button>
            <button
              onClick={() => handleDelete(row.id)}
              className="text-red-500 border border-red-500 rounded-md p-2 hover:bg-red-500 hover:text-white hover:border-red-500"
            >
              <TrashBinIcon />
            </button>
            <Link href={`/academy/livewebinars-management/livewebinars-list/${row.id}`} passHref>
              <button className="text-blue-500 border border-blue-500 rounded-md p-2 hover:bg-blue-500 hover:text-white hover:border-blue-500">
                <EyeIcon />
              </button>
            </Link>
          </div>
        );
      },
    },
  ];

  const handleEdit = (id: string) => {
    // This will redirect to the edit modal page, as you've set it up
    router.push(`/academy/livewebinars-management/modals/${id}`);
  };

  const handleDelete = async (id: string) => {
    const confirmDelete = window.confirm('Are you sure you want to delete this webinar?');
    if (!confirmDelete) return;

    try {
      await deleteWebinar(id);
      alert('Webinar deleted successfully');
    } catch (error) {
      console.error('Error deleting webinar:', error);
    }
  };

  const getFilteredByStatus = () => {
    if (activeTab === 'active') {
      return filteredCertificates.filter((mod) => mod.status === 'Active');
    } else if (activeTab === 'inactive') {
      return filteredCertificates.filter((mod) => mod.status === 'Deleted');
    }
    return filteredCertificates;
  };

  if (!webinars || !Array.isArray(webinars)) {
    return <RouteLoader />;
  }

  return (
    <div>
      <PageBreadcrumb pageTitle="Live Webinar" />

      {/* Module Stat Card */}
      <div className="my-5">
        <ModuleStatCard />
      </div>

      {/* Removed AddLiveWebinar component as per requirement */}

      {/* Live Webinars Table */}
      <div className="my-5">
        <ComponentCard title="All Live Webinars">
          <div className="mb-4">
            <Input
              type="text"
              placeholder="Search by webinar name"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="border-b border-gray-200">
            <ul className="flex space-x-6 text-sm font-medium text-center text-gray-500">
              <li
                className={`cursor-pointer px-4 py-2 ${activeTab === 'all' ? 'border-b-2 border-blue-600 text-blue-600' : ''}`}
                onClick={() => setActiveTab('all')}
              >
                All
              </li>
              {/* <li
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
              </li> */}
            </ul>
          </div>
          <div>
            <BasicTableOne columns={columns} data={getFilteredByStatus()} />
          </div>
        </ComponentCard>
      </div>

      {/* The Modal component and its related states/functions have been removed */}
    </div>
  );
};

export default LiveWebinar;