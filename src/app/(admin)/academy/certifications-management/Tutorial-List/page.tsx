'use client';

import React, {  useState, useMemo } from 'react';
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

interface VideoDetail {
  videoName: string;
  videoDescription: string;
  videoUrl: string;
}

// interface CertificateEntry {
//   _id: string;
//   name: string;
//   imageUrl: string;
//   description: string;
//   video: VideoDetail[];
//   isDeleted: boolean; // Assuming this property exists to determine status
// }

type TutorialStatus = 'Active' | 'Inactive'; // Using 'Inactive' to align with the tab, which likely means 'Deleted' or 'Disabled'

const VideoPreviewCell: React.FC<{ urls: string[] }> = ({ urls }) => {
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
          className="text-blue-600 hover:underline"
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

const CertificatePage: React.FC = () => {
  const { certificates, deleteCertificate } = useCertificate();
  const router = useRouter();

  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | TutorialStatus>('all');

  // For expanding video details
  const [expandedVideoDetailsRows, setExpandedVideoDetailsRows] = useState<string[]>([]);
  const toggleVideoDetailsExpansion = (id: string) => {
    setExpandedVideoDetailsRows((prev) =>
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
          activeTab === 'all'
           || (activeTab === 'Active' && status === 'Active') || (activeTab === 'Inactive' && status === 'Inactive');

        
        return matchesSearch && matchesTab;
      })
      .map((c) => ({
        id: c._id,
        name: c.name,
        imageUrl: c.imageUrl,
        description: c.description ?? 'N/A',
        displayVideoNames: c.video?.map((v: VideoDetail) => v.videoName) || [],
        displayVideoDescriptions: c.video?.map((v: VideoDetail) => v.videoDescription) || [],
        displayVideoUrls: c.video?.map((v: VideoDetail) => v.videoUrl) || [],
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
      <ModuleStatCard /> {/* This is your stat card */}

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
                  <th className="px-5 py-3 text-left text-gray-500 border-b">Image</th>
                  <th className="px-5 py-3 text-left text-gray-500 border-b">Tutorial Description</th>
                  <th className="px-5 py-3 text-left text-gray-500 border-b">Tutorial Details</th>
                  <th className="px-5 py-3 text-left text-gray-500 border-b">Video Files</th>
                  <th className="px-5 py-3 text-left text-gray-500 border-b">Videos Count</th>
                  <th className="px-5 py-3 text-center text-gray-500 border-b">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredAndMappedCertificates.length > 0 ? (
                  filteredAndMappedCertificates.map((row) => {
                    const expanded = expandedVideoDetailsRows.includes(row.id);
                    const visibleCount = expanded
                      ? row.displayVideoNames.length
                      : Math.min(row.displayVideoNames.length, 2);
                    const hasMore = row.displayVideoNames.length > 2;

                    return (
                      <tr key={row.id} className="">
                        {/* Name */}
                        <td className="px-5 py-4 font-medium text-gray-800">{row.name}</td>

                        {/* Image */}
                        <td className="px-5 py-4">
                          <div className="relative w-20 h-20">
                            <Image
                              src={row.imageUrl}
                              alt={row.name}
                              fill
                              className="object-cover rounded-md ring-1 ring-gray-200"
                            />
                          </div>
                        </td>

                        {/* Description */}
                        <td className="px-5 py-4 text-gray-700 whitespace-pre-line max-w-xs">
                          {row.description}
                        </td>

                        {/* Video Details */}
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
                                onClick={() => toggleVideoDetailsExpansion(row.id)}
                              >
                                {expanded ? 'Show Less' : 'Show More'}
                              </button>
                            )}
                          </div>
                        </td>

                        {/* Video Files */}
                        <td className="px-5 py-4 text-gray-700">
                          <VideoPreviewCell urls={row.displayVideoUrls} />
                        </td>

                        {/* Count */}
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
                    <td colSpan={7} className="px-5 py-10 text-center text-gray-500">
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