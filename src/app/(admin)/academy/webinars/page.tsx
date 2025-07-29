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
import { useRouter } from 'next/navigation';
import { EyeIcon, TrashBinIcon } from '@/icons'; 
import { PlusCircle } from 'lucide-react'; 
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
  status: string;
}

const Webinar = () => {
  const { webinars, updateWebinar, deleteWebinar } = useWebinars();
  const { isOpen,  closeModal } = useModal();
  const router = useRouter();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, ] = useState<string | null>(null);
  const [videoFiles, setVideoFiles] = useState<File[]>([]);
  const [videoName, setVideoName] = useState('');
  const [videoDescription, setVideoDescription] = useState('');
  const [newVideos, setNewVideos] = useState([{ name: '', description: '', file: null as File | null }]);
  const [currentVideoUrls, ] = useState<string[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [editingWebinarId, ] = useState<string | null>(null);
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
    const filteredData = webinars
      .filter((c) =>
        c.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
      .map((c) => ({
        id: c._id,
        name: c.name,
        imageUrl: c.imageUrl,
        description: c.description ?? 'N/A',
        displayVideoNames: c.video.map((v) => v.videoName),
        displayVideoDescriptions: c.video.map((v) => v.videoDescription),
        displayVideoUrls: c.video.map((v) => v.videoUrl),
        status: (c.isDeleted ? 'Deleted' : 'Active') as TableData['status'],
      }));

    setFilteredWebinars(filteredData);
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
    // Combined 'Video Names' and 'Video Descriptions' into a single column with boxes and show more/less
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


                <span className="text-gray-600 font-medium">Video Name:</span>

                <span className="font-semibold text-gray-800 break-words">{name}</span>

                <Label className="mt-1">Description:</Label>

                <div className="text-gray-700 text-sm  max-w-md break-words whitespace-pre-wrap text-justify">
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
      header: 'Count',
      accessor: 'categoryCount',
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
          <Link href={`/academy/webinars/${r.id}`} passHref>
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

  // const handleEdit = (id: string) => {
  //   const w = webinars.find(x => x._id === id);
  //   if (!w) return;
  //   setEditingWebinarId(w._id);
  //   setName(w.name);
  //   setDescription(w.description);
  //   setVideoName(w.video?.[0]?.videoName || '');
  //   setVideoDescription(w.video?.[0]?.videoDescription || '');
  //   setCurrentVideoUrls(w.video?.map(v => v.videoUrl) || []);
  //   setImageUrl(w.imageUrl);
  //   setNewVideos([{ name: '', description: '', file: null }]);
  //   openModal();
  // };

   const handleEdit = (id: string) => {
    router.push(`/academy/webinars/modals/${id}`);
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
    // Assuming updateWebinar handles API call and context update
    await updateWebinar(editingWebinarId, fd);
    closeModal();
  };

  const handleDelete = async (id: string) => {
    if (confirm('Delete webinar?')) { // IMPORTANT: Replace with custom modal/toast
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
      <ModuleStatCard />

      <div className="my-5">
        <AddWebinar />
      </div>

      <div className="my-5">
        <ComponentCard title="All Webinars">
          <Input
            type="text"
            placeholder="Search by webinar name"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
          <div className="border-b my-3">
            {['all',].map(t => ( // Added 'active' and 'inactive' tabs
              <span
                key={t}
                className={`cursor-pointer mx-4 ${activeTab === t ? 'border-b-2 border-blue-600 text-blue-600' : ''
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
                {/* Rest of the modal form fields */}
                <div>
                  <Label>Webinar Description</Label>
                  <Input value={description} onChange={e => setDescription(e.target.value)} />
                </div>
                <div>
                  <Label>Select Image</Label>
                  <FileInput onChange={e => setSelectedFile(e.target.files?.[0] || null)} />
                  {(selectedFile || imageUrl) && (
                    <div className="mt-2">
                      <Image
                        width={100}
                        height={100}
                        src={selectedFile ? URL.createObjectURL(selectedFile) : imageUrl!}
                        alt="Selected webinar image"
                        className="object-cover rounded"
                      />
                    </div>
                  )}
                </div>
                {/* Video Name, Description, File for the first video (or current editing) */}
                <div>
                  <Label>Video Name</Label>
                  <Input value={videoName} onChange={e => setVideoName(e.target.value)} />
                </div>
                <div>
                  <Label>Video Description</Label>
                  <Input value={videoDescription} onChange={e => setVideoDescription(e.target.value)} />
                </div>
                <div>
                  <Label htmlFor="videoFiles">Select Video File(s)</Label>
                  <FileInput
                    id="videoFiles"
                    onChange={handleVideoFileChange}
                    accept="video/*"
                    multiple // Keep multiple if you intend to add multiple videos at once from this modal
                  />
                  {videoFiles.length > 0 && (
                    <p className="text-sm text-gray-500 mt-1">
                      Selected: {videoFiles.map((f) => f.name).join(', ')}
                    </p>
                  )}
                  {currentVideoUrls.length > 0 && videoFiles.length === 0 && (
                    <div className="mt-2">
                      <Label>Current Video(s):</Label>
                      {currentVideoUrls.map((url, i) => (
                        <a
                          key={i}
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 underline mr-2 block"
                        >
                          Video {i + 1}
                        </a>
                      ))}
                    </div>
                  )}
                </div>
                {/* Fields for adding new videos - this part might need rethinking if the modal is primarily for editing existing */}
                {newVideos.map((video, index) => (
                  <div key={index} className="border p-3 rounded-md mt-4">
                    <h5 className="font-semibold mb-2">New Video {index + 1}</h5>
                    <div>
                      <Label>Name</Label>
                      <Input
                        type="text"
                        value={video.name}
                        onChange={(e) => handleNewVideoChange(index, 'name', e.target.value)}
                        placeholder="New Video Name"
                      />
                    </div>
                    <div>
                      <Label>Description</Label>
                      <Input
                        type="text"
                        value={video.description}
                        onChange={(e) => handleNewVideoChange(index, 'description', e.target.value)}
                        placeholder="New Video Description"
                      />
                    </div>
                    <div>
                      <Label>File</Label>
                      <FileInput
                        onChange={(e) => handleNewVideoChange(index, 'file', e.target.files?.[0] || null)}
                        accept="video/*"
                      />
                      {video.file && (
                        <p className="text-sm text-gray-500 mt-1">Selected: {video.file.name}</p>
                      )}
                    </div>
                  </div>
                ))}
                <Button type="button" onClick={addNewVideoField} className="mt-4 bg-purple-500 hover:bg-purple-600 text-white">
                  Add Another New Video Field
                </Button>
              </div>
            </div>
            <div className="flex items-center gap-3 px-2 mt-6 lg:justify-end">
              <Button size="sm" variant="outline" onClick={closeModal} type="button">
                Cancel
              </Button>
              <Button size="sm" onClick={handleUpdateData} type="button">
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






