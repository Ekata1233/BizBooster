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

import { useCertificate } from '@/context/CertificationContext';
import { useRouter } from 'next/navigation';

// --- UPDATED: Add videoImageUrl to VideoDetail interface ---
interface VideoDetail {
  videoName: string;
  videoDescription: string;
  videoUrl: string;
  videoImageUrl?: string; // New property for video thumbnail
}

type TutorialStatus = 'Active' | 'Inactive';

// --- ORIGINAL VideoPreviewCell (now only for links) ---
interface VideoPreviewCellProps {
  urls: string[]; // Still takes just URLs
}

const VideoPreviewCell: React.FC<VideoPreviewCellProps> = ({ urls }) => {
  const [showAll, setShowAll] = useState(false);
  if (!urls.length) return <span className="text-gray-500">No Videos</span>;

  const visible = showAll ? urls : urls.slice(0, 2);
  return (
    <div className="flex flex-col gap-1">
      {visible.map((url, i) => (
        <a
          key={i}
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 hover:underline text-sm truncate"
          title={`Video ${i + 1} URL`} // Add title for hover
        >
          Video {i + 1}
        </a>
      ))}

      {urls.length > 2 && (
        <button
          type="button"
          onClick={() => setShowAll((p) => !p)}
          className="text-sm text-red-600 hover:text-blue-800 underline w-fit mt-1 transition-colors duration-200"
        >
          {showAll ? 'Show Less' : 'Show More'}
        </button>
      )}
    </div>
  );
};

// --- NEW: VideoImagePreviewCell (for image thumbnails only) ---
interface VideoImagePreviewCellProps {
  videoDetails: VideoDetail[]; // Accepts full video details
}

const VideoImagePreviewCell: React.FC<VideoImagePreviewCellProps> = ({ videoDetails }) => {
  const [showAll, setShowAll] = useState(false);
  if (!videoDetails || videoDetails.length === 0) return <span className="text-gray-500">No Images</span>;

  const visibleVideos = showAll ? videoDetails : videoDetails.slice(0, 2);

  return (
    <div className="flex flex-col gap-2">
      {visibleVideos.map((video, i) => (
        <div key={i} className="flex items-center justify-center p-1 border rounded-md border-gray-100 bg-gray-50 shadow-sm">
          {video.videoImageUrl ? (
            <div className="relative w-12 h-10 flex-shrink-0">
              <Image
                src={video.videoImageUrl}
                alt={video.videoName ? `${video.videoName} thumbnail` : `Video ${i + 1} thumbnail`}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                className="object-cover rounded-sm"
              />
            </div>
          ) : (
            <span className="text-gray-400 text-xs">No img</span>
          )}
        </div>
      ))}

      {videoDetails.length > 2 && (
        <button
          type="button"
          onClick={() => setShowAll((p) => !p)}
          className="text-sm text-red-600 hover:text-blue-800 underline w-fit mt-1 transition-colors duration-200"
        >
          {showAll ? 'Show Less' : 'Show More'}
        </button>
      )}
    </div>
  );
};


const CertificatePage: React.FC = () => {
  const { certificates, deleteCertificate } = useCertificate();
  const router = useRouter();

  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | TutorialStatus>('all');

  // For expanding video details and video files/images
  const [expandedRowIds, setExpandedRowIds] = useState<string[]>([]); // Consolidated state for row expansion
  const toggleRowExpansion = (id: string) => {
    setExpandedRowIds((prev) =>
      prev.includes(id) ? prev.filter((r) => r !== id) : [...prev, id],
    );
  };

  const filteredAndMappedCertificates = useMemo(() => {
    if (!certificates || !Array.isArray(certificates)) {
      return [];
    }

    return certificates
      .filter((c) => {
        const matchesSearch = c.name.toLowerCase().includes(searchQuery.toLowerCase());
        const status: TutorialStatus = c.isDeleted ? 'Inactive' : 'Active';
        const matchesTab =
          activeTab === 'all' ||
          (activeTab === 'Active' && status === 'Active') ||
          (activeTab === 'Inactive' && status === 'Inactive');

        return matchesSearch && matchesTab;
      })
      .map((c) => ({
        id: c._id,
        name: c.name,
        imageUrl: c.imageUrl, // This is for the main tutorial image
        description: c.description ?? 'N/A',
        videoDetails: c.video || [], // Pass the entire video array for both video cells
        displayVideoNames: c.video?.map((v: VideoDetail) => v.videoName) || [],
        displayVideoDescriptions: c.video?.map((v: VideoDetail) => v.videoDescription) || [],
        displayVideoUrls: c.video?.map((v: VideoDetail) => v.videoUrl) || [],
        // The image URLs for the videos are contained within videoDetails
        status: (c.isDeleted ? 'Inactive' : 'Active') as TutorialStatus,
      }));
  }, [certificates, searchQuery, activeTab]);

  const handleEdit = (id: string) => {
    router.push(`/academy/certifications-management/modals/${id}`);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this tutorial?')) return;
    try {
      await deleteCertificate(id);
      // Optionally, refetch certificates or update local state
    } catch (err) {
      console.error('Delete error', err);
    }
  };

  /* ---------------------------- Loader --------------------------- */
  if (!certificates) return <RouteLoader />;

  return (
    <div>
      <PageBreadcrumb pageTitle="Training Tutorials" />
      <ModuleStatCard />

      <div className="my-5">
        <ComponentCard title="All Training Tutorials">
          {/* Search */}
          <Input
            placeholder="Search by tutorial name"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="mb-4"
          />

          {/* Tabs */}
          <div className="border-b border-gray-200 mt-4 flex gap-2">
            {(['all', ] as const).map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                className={`relative px-4 pb-2 text-sm font-medium transition-colors ${
                  activeTab === tab
                    ? 'text-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab === 'all' ? 'All' : tab}
                {activeTab === tab && (
                  <span className="absolute left-0 -bottom-[1px] h-[2px] w-full rounded-full bg-blue-600" />
                )}
              </button>
            ))}
          </div>

          {/* Table */}
          <div className="mt-6 overflow-x-auto bg-white rounded-xl shadow-lg border border-gray-200">
            <table className="min-w-full border-collapse text-sm">
              <thead>
                <tr>
                  <th className="px-5 py-3 text-left text-gray-500 border-b">Tutorial Name</th>
                  <th className="px-5 py-3 text-left text-gray-500 border-b">Main Image</th>
                  <th className="px-5 py-3 text-left text-gray-500 border-b">Tutorial Description</th>
                  <th className="px-5 py-3 text-left text-gray-500 border-b">Video Details</th>
                  <th className="px-5 py-3 text-left text-gray-500 border-b">Video Images</th> 
                  <th className="px-5 py-3 text-left text-gray-500 border-b">Video Files</th>
                  <th className="px-5 py-3 text-left text-gray-500 border-b">Videos Count</th>
                  <th className="px-5 py-3 text-center text-gray-500 border-b">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredAndMappedCertificates.length > 0 ? (
                  filteredAndMappedCertificates.map((row) => {
                    // Use a single expanded state for consistency across Video Details/Files/Images
                    const expanded = expandedRowIds.includes(row.id);
                    const visibleCount = expanded
                      ? row.displayVideoNames.length
                      : Math.min(row.displayVideoNames.length, 2);
                    const hasMore = row.displayVideoNames.length > 2;

                    return (
                      <tr key={row.id} className="">
                        {/* Name */}
                        <td className="px-5 py-4 font-medium text-gray-800">{row.name}</td>

                        {/* Main Image */}
                        <td className="px-5 py-4">
                          <div className="relative w-20 h-20">
                            <Image
                              src={row.imageUrl}
                              alt={row.name}
                              fill
                              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                              className="object-cover rounded-md ring-1 ring-gray-200"
                            />
                          </div>
                        </td>

                        {/* Description */}
                        <td className="px-5 py-4 text-gray-700 whitespace-pre-line max-w-xs">
                          {row.description}
                        </td>

                        {/* Video Details (Name & Description) */}
                        <td className="px-5 py-4">
                          <div className="flex flex-col gap-3 w-full">
                            {row.displayVideoNames.slice(0, visibleCount).map((name, i) => (
                              <div
                                key={i}
                                className="border border-gray-200 p-3 rounded-lg bg-gray-50 shadow-sm"
                              >
                                <span className="text-black-700 font-semibold block">Video Name:</span>
                                <span className="font-medium text-gray-800">{name}</span>

                                <Label className="mt-2 text-gray-600">Description:</Label>
                                <div className="text-gray-700 text-sm mt-1">
                                  {row.displayVideoDescriptions[i] || 'No description'}
                                </div>
                              </div>
                            ))}
                            {hasMore && (
                              <button
                                className="text-sm text-red-600 underline mt-1 hover:text-blue-800"
                                onClick={() => toggleRowExpansion(row.id)}
                              >
                                {expanded ? 'Show Less' : 'Show More'}
                              </button>
                            )}
                          </div>
                        </td>

                        
                        <td className="px-5 py-4 text-gray-700">
                          <VideoImagePreviewCell videoDetails={row.videoDetails} />
                        </td>

                        
                        <td className="px-5 py-4 text-gray-700">
                          <VideoPreviewCell urls={row.displayVideoUrls} />
                        </td>

                        {/* Videos Count */}
                        <td className="px-5 py-4 text-gray-700">{row.displayVideoUrls.length}</td>

                        {/* Actions */}
                        <td className="px-5 py-4 text-center">
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
                              href={`/academy/certifications-management/Tutorial-List/${row.id}`}
                              className="p-2 rounded-md border border-blue-500 text-blue-500 hover:bg-blue-500 hover:text-white"
                            >
                              <EyeIcon />
                            </Link>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={8} className="px-5 py-10 text-center text-gray-500">
                      No tutorials found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </ComponentCard>
      </div>
    </div>
  );
};

export default CertificatePage;