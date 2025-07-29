'use client';

import React, { useEffect, useState } from 'react';
import ComponentCard from '@/components/common/ComponentCard';
import PageBreadcrumb from '@/components/common/PageBreadCrumb';
// Removed unused imports related to modal/form fields
// import FileInput from '@/components/form/input/FileInput';
import Input from '@/components/form/input/InputField';
// Removed AddWebinar as per requirement
// import AddWebinar from '@/components/webinars-component/WebinarComponent';
import ModuleStatCard from '@/components/module-component/ModuleStatCard';
import RouteLoader from '@/components/RouteLoader';
import BasicTableOne from '@/components/tables/BasicTableOne';
// Removed Button as it was only used inside the removed modal
// import Button from '@/components/ui/button/Button';
// Removed Modal as per requirement
// import { Modal } from '@/components/ui/modal';
import { useWebinars } from '@/context/WebinarContext';
// Removed useModal as per requirement
// import { useModal } from '@/hooks/useModal';
import { useRouter } from 'next/navigation';
import { EyeIcon, TrashBinIcon } from '@/icons';
import { PlusCircle } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

// interface Webinar {
//   _id: string;
//   name: string;
//   imageUrl: string;
//   description: string;
//   video: {
//     videoName: string;
//     videoDescription: string;
//     videoUrl: string;
//   }[];
//   // categoryCount is not directly from backend, calculated as video count for display
//   isDeleted: boolean;
// }

interface TableData {
  id: string;
  name: string;
  imageUrl: string;
  description: string;
  displayVideoNames: string[];
  displayVideoDescriptions: string[];
  displayVideoUrls: string[];
  status: 'Active' | 'Deleted'; // Explicitly define possible statuses
}

const WebinarPage = () => { // Renamed from 'Webinar'
  const { webinars, deleteWebinar } = useWebinars();
  const router = useRouter();

  const [searchQuery, setSearchQuery] = useState('');
  const [filteredWebinars, setFilteredWebinars] = useState<TableData[]>([]);
  const [activeTab, setActiveTab] = useState<'all' | 'active' | 'inactive'>('all');

  // State to manage expansion for 'Video Files' column
  const [expandedVideoFilesRows, setExpandedVideoFilesRows] = useState<string[]>([]);
  // State to manage expansion for 'Video Details' column
  const [expandedVideoDetailsRows, setExpandedVideoDetailsRows] = useState<string[]>([]);

  const toggleVideoFilesExpansion = (id: string) => {
    setExpandedVideoFilesRows(prev => (prev.includes(id) ? prev.filter(r => r !== id) : [...prev, id]));
  };

  const toggleVideoDetailsExpansion = (id: string) => {
    setExpandedVideoDetailsRows(prev => (prev.includes(id) ? prev.filter(r => r !== id) : [...prev, id]));
  };

  useEffect(() => {
    if (!webinars || !Array.isArray(webinars)) {
      setFilteredWebinars([]);
      return;
    }

    const filteredData = webinars
      .filter((w) => {
        const matchesSearch = w.name.toLowerCase().includes(searchQuery.toLowerCase());
        const status: TableData['status'] = w.isDeleted ? 'Deleted' : 'Active';
        const matchesTab =
          activeTab === 'all' ||
          (activeTab === 'active' && status === 'Active') ||
          (activeTab === 'inactive' && status === 'Deleted');
        return matchesSearch && matchesTab;
      })
      .map((w) => ({
        id: w._id,
        name: w.name,
        imageUrl: w.imageUrl,
        description: w.description ?? 'N/A',
        displayVideoNames: w.video?.map((v) => v.videoName) || [],
        displayVideoDescriptions: w.video?.map((v) => v.videoDescription) || [],
        displayVideoUrls: w.video?.map((v) => v.videoUrl) || [],
        status: (w.isDeleted ? 'Deleted' : 'Active') as TableData['status'],
      }));

    setFilteredWebinars(filteredData);
  }, [searchQuery, webinars, activeTab]); // Added activeTab to dependency array

  const columns = [
    { header: 'Webinar Name', accessor: 'name' },
    {
      header: 'Image',
      accessor: 'imageUrl',
      render: (row: TableData) => (
        <Image
          src={row.imageUrl || '/path/to/default-image.png'} // Provide a default image path
          alt={row.name}
          width={130}
          height={130}
          className="object-cover rounded"
        />
      ),
    },
    {
      header: 'Description',
      accessor: 'description',
      render: (row: TableData) =>
        row.description.split(',').map((d, i) => <p key={i}>{d.trim()}</p>),
    },
    {
      header: 'Video Details',
      accessor: 'videoDetails', // Dummy accessor, content is rendered
      render: (r: TableData) => {
        const expanded = expandedVideoDetailsRows.includes(r.id);
        const visibleCount = expanded ? r.displayVideoNames.length : Math.min(r.displayVideoNames.length, 2);
        const hasMore = r.displayVideoNames.length > 2;

        return (
          <div className="flex flex-col gap-2 w-full">
            {r.displayVideoNames.slice(0, visibleCount).map((name, i) => (
              <div key={i} className="border border-gray-200 p-1 rounded-md shadow-sm bg-gray-50">
                {/* Note: Label component expects htmlFor or content. Assuming content here. */}
                <span className="text-gray-600 font-medium">Video Name: </span>
                <span className="font-semibold text-gray-800 break-words">{name}</span>
                <p className="mt-1 text-gray-600 font-medium">Description:</p> {/* Changed Label to p for simpler styling here */}
                <div className="text-gray-700 text-sm max-w-md break-words whitespace-pre-wrap text-justify">
                  {r.displayVideoDescriptions[i] || 'No description'}
                </div>
              </div>
            ))}
            {hasMore && (
              <button
                className="text-sm text-red-600 underline mt-1 hover:text-blue-800 transition-colors duration-200"
                onClick={() => toggleVideoDetailsExpansion(r.id)}
              >
                {expanded ? 'Show Less' : 'Show More'}
              </button>
            )}
          </div>
        );
      },
    },
    {
      header: 'Video Files',
      accessor: 'displayVideoUrls',
      render: (r: TableData) => {
        const expanded = expandedVideoFilesRows.includes(r.id);
        const list = expanded ? r.displayVideoUrls : r.displayVideoUrls.slice(0, 2);
        return (
          <div className="flex flex-col gap-1">
            {list.map((u, i) => (
              <a key={i} href={u} target="_blank" rel="noopener noreferrer" className="text-blue-500 underline">
                Video {i + 1}
              </a>
            ))}
            {r.displayVideoUrls.length > 2 && (
              <button
                className="text-sm text-red-600 hover:underline w-fit mt-1 hover:text-blue-800"
                onClick={() => toggleVideoFilesExpansion(r.id)}
              >
                {expanded ? 'Show Less' : 'Show More'}
              </button>
            )}
          </div>
        );
      },
    },
    {
      header: 'Video Count', // Changed from 'Count' to be more descriptive
      accessor: 'videoCount', // Dummy accessor
      render: (r: TableData) => r.displayVideoUrls.length,
    },
    {
      header: 'Action',
      accessor: 'action',
      render: (r: TableData) => (
        <div className="flex gap-2">
          {/* PlusCircle (Edit) Button */}
          <button
            onClick={() => handleEdit(r.id)}
            className="text-yellow-500 border border-yellow-500 p-2 rounded-md
                         hover:bg-yellow-500 hover:text-white transition-colors duration-200"
          >
            <PlusCircle size={16} />
          </button>
          {/* TrashBinIcon (Delete) Button */}
          <button
            onClick={() => handleDelete(r.id)}
            className="text-red-500 border border-red-500 p-2 rounded-md
                         hover:bg-red-500 hover:text-white transition-colors duration-200"
          >
            <TrashBinIcon />
          </button>
          {/* EyeIcon (View Details) Link Button */}
          <Link href={`/academy/webinars-management/webinars-list/${r.id}`} passHref>
            <button
              className="text-blue-500 border border-blue-500 p-2 rounded-md
                           hover:bg-blue-500 hover:text-white transition-colors duration-200"
            >
              <EyeIcon />
            </button>
          </Link>
        </div>
      ),
    },
  ];

  const handleEdit = (id: string) => {
    router.push(`/academy/webinars-management/modals/${id}`);
  };

  const handleDelete = async (id: string) => {
    // IMPORTANT: Replace with a custom modal/toast for user confirmation
    if (confirm('Are you sure you want to delete this webinar?')) {
      await deleteWebinar(id);
    }
  };

  // The filtering logic for tabs is now integrated into the useEffect
  // const visibleData is already correctly set by useEffect and filteredWebinars state.

  if (!webinars) {
    // Show a loader while webinars are being fetched
    return <RouteLoader />;
  }

  return (
    <div>
      <PageBreadcrumb pageTitle="Webinars" />
      <ModuleStatCard /> {/* This will now correctly display webinar stats with the ModuleStatCard changes */}

      {/* Removed AddWebinar component */}

      <div className="my-5">
        <ComponentCard title="All Webinars">
          <Input
            type="text"
            placeholder="Search by webinar name"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="mb-4" // Added some margin for separation
          />
          <div className="border-b my-3 flex"> {/* Added flex to keep tabs on one line */}
            {/* --- CORRECTED TABS RENDERING START --- */}
            {['all', 'active', 'inactive'].map(t => ( // Now includes 'active' and 'inactive'
              <span
                key={t}
                className={`cursor-pointer px-4 py-2 ${activeTab === t ? 'border-b-2 border-blue-600 text-blue-600 font-semibold' : 'text-gray-500 hover:text-gray-700'
                  } transition-colors duration-200`}
                onClick={() => setActiveTab(t as typeof activeTab)}
              >
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </span>
            ))}
            {/* --- CORRECTED TABS RENDERING END --- */}
          </div>
          <BasicTableOne columns={columns} data={filteredWebinars} /> {/* Use filteredWebinars directly */}
        </ComponentCard>
      </div>

      {/* The Modal component and its content are entirely removed */}
    </div>
  );
};

export default WebinarPage;