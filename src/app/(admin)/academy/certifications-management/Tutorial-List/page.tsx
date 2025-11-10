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
import BasicTableOne from '@/components/tables/BasicTableOne';

interface VideoDetail {
  videoName: string;
  videoDescription: string;
  videoUrl: string;
  videoImageUrl?: string;
}

type TutorialStatus = 'Active' | 'Inactive';

interface VideoPreviewCellProps {
  urls: string[];
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
        >
          Video {i + 1}
        </a>
      ))}
      {urls.length > 2 && (
        <button
          type="button"
          onClick={() => setShowAll((p) => !p)}
          className="text-sm text-red-600 hover:text-blue-800 underline w-fit mt-1"
        >
          {showAll ? 'Show Less' : 'Show More'}
        </button>
      )}
    </div>
  );
};

interface VideoImagePreviewCellProps {
  videoDetails: VideoDetail[];
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
          className="text-sm text-red-600 hover:text-blue-800 underline w-fit mt-1"
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

  if (!certificates) return <RouteLoader />;

  const filteredAndMappedCertificates = useMemo(() => {
    if (!Array.isArray(certificates)) return [];

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
      .map((c, index) => ({
        srNo: index + 1,
        id: c._id,
        name: c.name,
        imageUrl: c.imageUrl,
        description: c.description ?? 'N/A',
        videoDetails: c.video || [],
        displayVideoNames: c.video?.map((v: VideoDetail) => v.videoName) || [],
        displayVideoDescriptions: c.video?.map((v: VideoDetail) => v.videoDescription) || [],
        displayVideoUrls: c.video?.map((v: VideoDetail) => v.videoUrl) || [],
        videosCount: c.video?.length || 0,
        status: (c.isDeleted ? 'Inactive' : 'Active') as TutorialStatus,
      }));
  }, [certificates, searchQuery, activeTab]);

  const handleEdit = (id: string) => router.push(`/academy/certifications-management/modals/${id}`);

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this tutorial?')) return;
    await deleteCertificate(id);
  };

  const columns = [
    { header: 'Sr. No', accessor: 'srNo', render: (row: any) => <span>{row.srNo}</span> },
    { header: 'Tutorial Name', accessor: 'name', render: (row: any) => <span>{row.name}</span> },
    {
      header: 'Main Image',
      accessor: 'imageUrl',
      render: (row: any) => (
        <Image
          src={row.imageUrl}
          alt={row.name}
          width={60}
          height={60}
          className="rounded-md object-cover border"
        />
      ),
    },
    { header: 'Description', accessor: 'description', render: (row: any) => <span>{row.description}</span> },
    
    {
      header: 'Video Images',
      accessor: 'videoImages',
      render: (row: any) => <VideoImagePreviewCell videoDetails={row.videoDetails} />,
    },
    {
      header: 'Video Files',
      accessor: 'videoFiles',
      render: (row: any) => <VideoPreviewCell urls={row.displayVideoUrls} />,
    },
    { header: 'Videos Count', accessor: 'videosCount', render: (row: any) => <span>{row.videosCount}</span> },
    {
      header: 'Action',
      accessor: 'action',
      render: (row: any) => (
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
      ),
    },
  ];

  return (
    <div>
      <PageBreadcrumb pageTitle="Training Tutorials" />
      <ModuleStatCard />

      <div className="my-5">
        <ComponentCard title="All Training Tutorials">
          <Input
            placeholder="Search by tutorial name"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="mb-4"
          />

          <BasicTableOne columns={columns} data={filteredAndMappedCertificates} />
        </ComponentCard>
      </div>
    </div>
  );
};

export default CertificatePage;
