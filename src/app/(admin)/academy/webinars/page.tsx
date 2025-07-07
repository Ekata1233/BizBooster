'use client';

import React, { useEffect, useState } from 'react';
import ComponentCard from '@/components/common/ComponentCard';
import PageBreadcrumb from '@/components/common/PageBreadCrumb';
import FileInput from '@/components/form/input/FileInput';
import Input from '@/components/form/input/InputField';
import Label from '@/components/form/Label';
import AddWebinar from '@/components/webinars-component/WebinarComponent';
import ModuleStatCard from '@/components/module-component/ModuleStatCard';
import RouteLoader from '@/components/RouteLoader';
import BasicTableOne from '@/components/tables/BasicTableOne';
import Button from '@/components/ui/button/Button';
import { Modal } from '@/components/ui/modal';
import { useWebinars } from '@/context/WebinarContext';
import { useModal } from '@/hooks/useModal';
import { EyeIcon, TrashBinIcon } from '@/icons';
import { PlusCircle } from 'lucide-react';
import axios from 'axios';
import Image from 'next/image';
import Link from 'next/link';

interface Webinar {
  _id: string;
  name: string;
  imageUrl: string;
  description: string;
  video: {
    videoName: string;
    videoDescription: string;
    videoUrl: string;
  }[];
  categoryCount: number;
  isDeleted: boolean;
}

interface TableData {
  id: string;
  name: string;
  imageUrl: string;
  description: string;
  displayVideoNames: string[];
  displayVideoDescriptions: string[];
  displayVideoUrls: string[];
  categoryCount: number;
  status: string;
}

const Webinar = () => {
  const { webinars, updateWebinar, deleteWebinar } = useWebinars();
  const { isOpen, openModal, closeModal } = useModal();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [videoFiles, setVideoFiles] = useState<File[]>([]);
  const [videoName, setVideoName] = useState('');
  const [videoDescription, setVideoDescription] = useState('');
  const [newVideos, setNewVideos] = useState([{ name: '', description: '', file: null as File | null }]);
  const [currentVideoUrls, setCurrentVideoUrls] = useState<string[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [editingWebinarId, setEditingWebinarId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredWebinars, setFilteredWebinars] = useState<TableData[]>([]);
  const [activeTab, setActiveTab] = useState<'all' | 'active' | 'inactive'>('all');
  const [expandedRows, setExpandedRows] = useState<string[]>([]);

  const toggleRowExpansion = (id: string) => {
    setExpandedRows(prev => (prev.includes(id) ? prev.filter(r => r !== id) : [...prev, id]));
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const params = { ...(searchQuery && { search: searchQuery }) };
        const res = await axios.get('/api/academy/webinars', { params });
        const data: Webinar[] = res.data.data;
        const table: TableData[] = data.map(w => ({
          id: w._id,
          name: w.name,
          imageUrl: w.imageUrl,
          description: w.description || 'N/A',
          displayVideoNames: w.video?.map(v => v.videoName) || [],
          displayVideoDescriptions: w.video?.map(v => v.videoDescription) || [],
          displayVideoUrls: w.video?.map(v => v.videoUrl) || [],
          categoryCount: w.categoryCount || 0,
          status: w.isDeleted ? 'Deleted' : 'Active',
        }));
        setFilteredWebinars(table);
      } catch {
        setFilteredWebinars([]);
      }
    };
    fetchData();
  }, [searchQuery, webinars]);

  const handleVideoFileChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setVideoFiles(Array.from(e.target.files || []));

  const handleNewVideoChange = (i: number, f: 'name' | 'description' | 'file', v: string | File | null) => {
    setNewVideos(p => {
      const u = [...p];
      if (f === 'file') u[i].file = v as File | null;
      else u[i][f] = v as string;
      return u;
    });
  };

  const addNewVideoField = () =>
    setNewVideos(p => [...p, { name: '', description: '', file: null }]);

  const columns = [
    { header: 'Webinar Name', accessor: 'name' },
    {
      header: 'Image',
      accessor: 'imageUrl',
      render: (row: TableData) => (
        <Image
          src={row.imageUrl || ''}
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
      header: 'Video Names',
      accessor: 'displayVideoNames',
      render: (r: TableData) => r.displayVideoNames.map((n, i) => <p key={i}>{n}</p>),
    },
    {
      header: 'Video Descriptions',
      accessor: 'displayVideoDescriptions',
      render: (r: TableData) => r.displayVideoDescriptions.map((d, i) => <p key={i}>{d}</p>),
    },
    {
      header: 'Video Files',
      accessor: 'displayVideoUrls',
      render: (r: TableData) => {
        const expanded = expandedRows.includes(r.id);
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
                className="text-sm text-red-600 underline"
                onClick={() => toggleRowExpansion(r.id)}
              >
                {expanded ? 'Show Less' : 'Show More'}
              </button>
            )}
          </div>
        );
      },
    },
    {
      header: 'Count',
      accessor: 'categoryCount',
      render: (r: TableData) => r.displayVideoUrls.length,
    },
    {
      header: 'Status',
      accessor: 'status',
      render: (r: TableData) => (
        <span
          className={`px-3 py-1 rounded-full text-sm font-semibold ${
            r.status === 'Active'
              ? 'text-green-600 bg-green-100'
              : 'text-red-500 bg-red-100'
          }`}
        >
          {r.status}
        </span>
      ),
    },
    {
      header: 'Action',
      accessor: 'action',
      render: (r: TableData) => (
        <div className="flex gap-2">
          <button onClick={() => handleEdit(r.id)} className="text-yellow-500 border p-2 rounded-md">
            <PlusCircle size={16} />
          </button>
          <button onClick={() => handleDelete(r.id)} className="text-red-500 border p-2 rounded-md">
            <TrashBinIcon />
          </button>
          <Link href={`/academy/webinars/${r.id}`} passHref>
            <button className="text-blue-500 border p-2 rounded-md">
              <EyeIcon />
            </button>
          </Link>
        </div>
      ),
    },
  ];

  const handleEdit = (id: string) => {
    const w = webinars.find(x => x._id === id);
    if (!w) return;
    setEditingWebinarId(w._id);
    setName(w.name);
    setDescription(w.description);
    setVideoName(w.video?.[0]?.videoName || '');
    setVideoDescription(w.video?.[0]?.videoDescription || '');
    setCurrentVideoUrls(w.video?.map(v => v.videoUrl) || []);
    setImageUrl(w.imageUrl);
    setNewVideos([{ name: '', description: '', file: null }]);
    openModal();
  };

  const handleUpdateData = async () => {
    if (!editingWebinarId) return;
    const fd = new FormData();
    fd.append('name', name);
    fd.append('videoName', videoName);
    fd.append('videoDescription', videoDescription);
    if (selectedFile) fd.append('imageUrl', selectedFile);
    videoFiles.forEach(f => fd.append('videos', f));
    newVideos.forEach(v => {
      if (v.file) fd.append('videos', v.file);
      fd.append('videoNames', v.name);
      fd.append('videoDescriptions', v.description);
    });
    await updateWebinar(editingWebinarId, fd);
    closeModal();
  };

  const handleDelete = async (id: string) => {
    if (confirm('Delete webinar?')) {
      await deleteWebinar(id);
    }
  };

  const visibleData =
    activeTab === 'active'
      ? filteredWebinars.filter(w => w.status === 'Active')
      : activeTab === 'inactive'
      ? filteredWebinars.filter(w => w.status === 'Deleted')
      : filteredWebinars;

  if (!webinars) return <RouteLoader />;

  return (
    <div>
      <PageBreadcrumb pageTitle="Webinar" />
      <div className="my-5">
        <AddWebinar />
      </div>
      <ModuleStatCard />
      <div className="my-5">
        <ComponentCard title="All Webinars">
          <Input
            type="text"
            placeholder="Search by webinar name"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
          <div className="border-b my-3">
            {['all', 'active', 'inactive'].map(t => (
              <span
                key={t}
                className={`cursor-pointer mx-4 ${
                  activeTab === t ? 'border-b-2 border-blue-600 text-blue-600' : ''
                }`}
                onClick={() => setActiveTab(t as typeof activeTab)}
              >
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </span>
            ))}
          </div>
          <BasicTableOne columns={columns} data={visibleData} />
        </ComponentCard>
      </div>
      <Modal isOpen={isOpen} onClose={closeModal} className="max-w-[700px] m-4">
        <div className="no-scrollbar w-full max-w-[700px] overflow-y-auto rounded-3xl bg-white p-4 dark:bg-gray-900 lg:p-11">
          <h4 className="mb-5 text-2xl font-semibold">Edit Webinar</h4>
          <form className="flex flex-col">
            <div className="custom-scrollbar h-[400px] overflow-y-auto px-2 pb-3 grid gap-5">
              <div>
                <Label>Webinar Name</Label>
                <Input value={name} onChange={e => setName(e.target.value)} />
              </div>
              <div>
                <Label>Select Image</Label>
                <FileInput onChange={e => setSelectedFile(e.target.files?.[0] || null)} />
                {(selectedFile || imageUrl) && (
                  <Image
                    src={selectedFile ? URL.createObjectURL(selectedFile) : imageUrl!}
                    alt="img"
                    width={100}
                    height={100}
                    className="mt-2 rounded object-cover"
                  />
                )}
              </div>
              <div>
                <Label>Description</Label>
                <Input value={description} onChange={e => setDescription(e.target.value)} />
              </div>
              <div>
                <Label>Video Name</Label>
                <Input value={videoName} onChange={e => setVideoName(e.target.value)} />
              </div>
              <div>
                <Label>Video Description</Label>
                <Input value={videoDescription} onChange={e => setVideoDescription(e.target.value)} />
              </div>
              <div>
                <Label htmlFor="videos">Select Video File(s)</Label>
                <FileInput id="videos" multiple accept="video/*" onChange={handleVideoFileChange} />
                {currentVideoUrls.map((u, i) => (
                  <a key={i} href={u} target="_blank" rel="noopener noreferrer" className="block text-blue-600">
                    Current Video {i + 1}
                  </a>
                ))}
              </div>
              <div>
                <Label>Add New Video(s)</Label>
                {newVideos.map((v, i) => (
                  <div key={i} className="border p-3 rounded-md mb-3">
                    <Input
                      placeholder="Video Name"
                      value={v.name}
                      onChange={e => handleNewVideoChange(i, 'name', e.target.value)}
                      className="mb-2"
                    />
                    <Input
                      placeholder="Video Description"
                      value={v.description}
                      onChange={e => handleNewVideoChange(i, 'description', e.target.value)}
                      className="mb-2"
                    />
                    <FileInput
                      accept="video/*"
                      onChange={e => handleNewVideoChange(i, 'file', e.target.files?.[0] || null)}
                    />
                  </div>
                ))}
                <button type="button" onClick={addNewVideoField} className="text-blue-600 underline">
                  + Add Another Video
                </button>
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <Button variant="outline" size="sm" onClick={closeModal}>
                Cancel
              </Button>
              <Button size="sm" onClick={handleUpdateData}>
                Save Changes
              </Button>
            </div>
          </form>
        </div>
      </Modal>
    </div>
  );
};

export default Webinar;
