// 'use client';

// import ComponentCard from '@/components/common/ComponentCard';
// import PageBreadcrumb from '@/components/common/PageBreadCrumb';
// import FileInput from '@/components/form/input/FileInput';
// import Input from '@/components/form/input/InputField';
// import Label from '@/components/form/Label';
// import AddCertificate from '@/components/certifications-component/CertificationComponent';
// import ModuleStatCard from '@/components/module-component/ModuleStatCard';
// import RouteLoader from '@/components/RouteLoader';
// import BasicTableOne from '@/components/tables/BasicTableOne';
// import Button from '@/components/ui/button/Button';
// import { Modal } from '@/components/ui/modal';
// import { useCertificate } from '@/context/CertificationContext';
// import { useModal } from '@/hooks/useModal';
// import { EyeIcon, TrashBinIcon } from '@/icons';
// import { PlusCircle } from 'lucide-react';
// import axios from 'axios';
// import Image from 'next/image';
// import Link from 'next/link';
// import React, { useEffect, useState } from 'react';

// // Define types
// interface Certificate {
//     _id: string;
//     name: string;
//     imageUrl: string;
//     description: string;
//     video: Array<{
//         videoName: string;
//         videoDescription: string;
//         videoUrl: string;
//     }>;
//     categoryCount: number;
//     isDeleted: boolean;
//     createdAt: string;
//     updatedAt?: string;
//     __v?: number;
// }

// interface TableData {
//     id: string;
//     name: string;
//     imageUrl: string;
//     description: string;
//     displayVideoNames: string[];
//     displayVideoDescriptions: string[];
//     displayVideoUrls: string[];
//     categoryCount: number;
//     status: string;
// }

// const Certificate = () => {
//     const { certificates, updateCertificate, deleteCertificate } = useCertificate();
//     const { isOpen, openModal, closeModal } = useModal();
//     const [name, setName] = useState('');
//     const [description, setDescription] = useState('');
//     const [imageUrl, setImageUrl] = useState<string | null>(null);
//     const [videoFiles, setVideoFiles] = useState<File[]>([]);
//     const [videoName, setVideoName] = useState('');
//     const [videoDescription, setVideoDescription] = useState('');
//     const [newVideos, setNewVideos] = useState([
//         { name: '', description: '', file: null as File | null }
//     ]);

//     const [currentVideoUrls, setCurrentVideoUrls] = useState<string[]>([]); 
//     const [selectedFile, setSelectedFile] = useState<File | null>(null);
//     const [editingCertificationId, setEditingCertificationId] = useState<string | null>(null);
//     const [searchQuery, setSearchQuery] = useState<string>('');
//     const [filteredCertificates, setFilteredCertificates] = useState<TableData[]>([]);
//     const [activeTab, setActiveTab] = useState('all');

//     const handleVideoFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
//         const files = Array.from(event.target.files || []);
//         setVideoFiles(files);
//     };

//     const fetchFilteredCertificates = async () => {
//         try {
//             const params = {
//                 ...(searchQuery && { search: searchQuery }),
//             };

//             const response = await axios.get('/api/certifications', { params });
//             const data = response.data.data;

//             if (data.length === 0) {
//                 setFilteredCertificates([]);
//             } else {
//                 const tableData: TableData[] = data.map((mod: Certificate) => ({
//                     id: mod._id,
//                     name: mod.name,
//                     imageUrl: mod.imageUrl,
//                     description: mod.description || 'N/A',
//                     // displayVideoName: mod.video && mod.video.length > 0 ? mod.video[0].videoName : 'N/A',
//                     // displayVideoDescription: mod.video && mod.video.length > 0 ? mod.video[0].videoDescription : 'N/A',
//                     displayVideoNames: mod.video ? mod.video.map(v => v.videoName) : [],
//                     displayVideoDescriptions: mod.video ? mod.video.map(v => v.videoDescription) : [],

//                     displayVideoUrls: mod.video ? mod.video.map(v => v.videoUrl) : [],
//                     categoryCount: mod.categoryCount || 0,
//                     status: mod.isDeleted ? 'Deleted' : 'Active',
//                 }));
//                 setFilteredCertificates(tableData);
//             }
//         } catch (error) {
//             console.error('Error fetching users:', error);
//             setFilteredCertificates([]);
//         }
//     }

//     useEffect(() => {
//         fetchFilteredCertificates();
//     }, [searchQuery, certificates]);

//     const handleNewVideoChange = (index: number, field: string, value: string | File | null) => {
//   const updated = [...newVideos];
//   if (field === 'file') {
//     updated[index].file = value as File;
//   } else {
//     updated[index][field as 'name' | 'description'] = value as string;
//   }
//   setNewVideos(updated);
// };

// const addNewVideoField = () => {
//   setNewVideos([...newVideos, { name: '', description: '', file: null }]);
// };


//     const columns = [
//         {
//             header: 'Tutorial Name',
//             accessor: 'name',
//         },
//         {
//             header: 'Image',
//             accessor: 'imageUrl',
//             render: (row: TableData) => (
//                 <div className="flex items-center gap-3">
//                     <div className="w-20 h-20 overflow-hidden">
//                         {row.imageUrl ? (
//                             <Image
//                                 width={130}
//                                 height={130}
//                                 src={row.imageUrl}
//                                 alt={row.name || "certification image"}
//                                 className="object-cover rounded"
//                             />
//                         ) : (
//                             <span>No Image</span>
//                         )}
//                     </div>
//                 </div>
//             ),
//         },

//         {
//   header: 'Tutorial Description',
//   accessor: 'description',
//   render: (row: TableData) => (
//     <div className="flex flex-col">
//       {row.description ? (
//         row.description.split(',').map((desc: string, idx: number) => (
//           <p key={idx}>{desc.trim()}</p>
//         ))
//       ) : (
//         <span>N/A</span>
//       )}
//     </div>
//   ),
// },

//        {
//     header: 'Tutorial Video Name',
//     accessor: 'displayVideoNames',
//     render: (row: TableData) => (
//         <div className="flex flex-col">
//             {row.displayVideoNames.length > 0 ? (
//                 row.displayVideoNames.map((name, idx) => (
//                     <p key={idx}>{name}</p>
//                 ))
//             ) : (
//                 <span>N/A</span>
//             )}
//         </div>
//     ),
// },


//         {
//     header: 'Tutorial Video Description',
//     accessor: 'displayVideoDescriptions',
//     render: (row: TableData) => (
//         <div className="flex flex-col">
//             {row.displayVideoDescriptions.length > 0 ? (
//                 row.displayVideoDescriptions.map((desc, idx) => (
//                     <p key={idx}>{desc}</p>
//                 ))
//             ) : (
//                 <span>N/A</span>
//             )}
//         </div>
//     ),
// },
// {
//   header: 'Tutorial Video Files',
//   accessor: 'displayVideoUrls',
//   render: (row: TableData) => {
//     const [showAll, setShowAll] = useState<boolean>(false); 

//     const videoUrls = row.displayVideoUrls || [];
//     const visibleVideos = showAll ? videoUrls : videoUrls.slice(0, 2);

//     return (
//       <div className="flex flex-col gap-1">
//         {visibleVideos.length > 0 ? (
//           visibleVideos.map((url: string, index: number) => (
//             <a
//               key={index}
//               href={url}
//               target="_blank"
//               rel="noopener noreferrer"
//               className="text-blue-500 hover:underline"
//             >
//               Video {index + 1}
//             </a>
//           ))
//         ) : (
//           <span>No Videos</span>
//         )}

//         {videoUrls.length > 2 && (
//           <button
//             className="text-sm text-red-600 hover:underline mt-1 w-fit"
//             onClick={() => setShowAll(!showAll)}
//           >
//             {showAll ? 'Show Less' : 'Show More'}
//           </button>
//         )}
//       </div>
//     );
//   },
// },

//         {
//             header: 'Videos Count',
//             accessor: 'categoryCount',
//             render: (row: TableData) => {
//                 return (
//                     <div className="flex justify-center items-center">
//                         {row.displayVideoUrls.length}
//                     </div>
//                 );
//             },
//         },
//         {
//             header: 'Status',
//             accessor: 'status',
//             render: (row: TableData) => {
//                 const status = row.status;
//                 let colorClass = '';

//                 switch (status) {
//                     case 'Deleted':
//                         colorClass = 'text-red-500 bg-red-100 border border-red-300';
//                         break;
//                     case 'Active':
//                         colorClass = 'text-green-600 bg-green-100 border border-green-300';
//                         break;
//                     default:
//                         colorClass = 'text-gray-600 bg-gray-100 border border-gray-300';
//                 }

//                 return (
//                     <span className={`px-3 py-1 rounded-full text-sm font-semibold ${colorClass}`}>
//                         {status}
//                     </span>
//                 );
//             },
//         },
//         {
//             header: 'Action',
//             accessor: 'action',
//             render: (row: TableData) => {
//                 return (
//                     <div className="flex gap-2">
//                         <button
//                             onClick={() => handleEdit(row.id)}
//                             className="text-yellow-500 border border-yellow-500 rounded-md p-2 hover:bg-yellow-500 hover:text-white hover:border-yellow-500">

//                             <PlusCircle className="ml-1" />
//                         </button>

//                         <button onClick={() => handleDelete(row.id)} className="text-red-500 border border-red-500 rounded-md p-2 hover:bg-red-500 hover:text-white hover:border-red-500">
//                             <TrashBinIcon />
//                         </button>
//                         <Link href={`/academy/certifications/${row.id}`} passHref>
//                             <button className="text-blue-500 border border-blue-500 rounded-md p-2 hover:bg-blue-500 hover:text-white hover:border-blue-500">
//                                 <EyeIcon />
//                             </button>
//                         </Link>
//                     </div>
//                 )
//             },
//         },
//     ];

//     const handleEdit = (id: string) => {




//         const selectedCertificate = certificates.find(item => item._id === id);
// if (selectedCertificate) {
//   setEditingCertificationId(selectedCertificate._id);
//   setName(selectedCertificate.name);
//   setDescription(selectedCertificate.video?.[0]?.videoDescription || '');
//   setVideoName(selectedCertificate.video?.[0]?.videoName || '');
//   setVideoDescription(selectedCertificate.video?.[0]?.videoDescription || '');
//   setCurrentVideoUrls(selectedCertificate.video?.map(v => v.videoUrl) || []);
//   setImageUrl(selectedCertificate.imageUrl);
//   setNewVideos([{ name: '', description: '', file: null }]);

//   openModal();
// }

//     };

//     const handleUpdateData = async () => {
//         console.log("id for the change ; ", editingCertificationId)
//         if (!editingCertificationId) return;

//         const formData = new FormData();
//         formData.append('name', name);
//         formData.append('videoName', videoName);
//         formData.append('videoDescription', videoDescription);

//         if (selectedFile) {
//             formData.append('imageUrl', selectedFile);
//         }

//         // Append video files
//         // videoFiles.forEach(file => {
//         //     formData.append('videos', file);
//         // });
//         if (videoFiles.length > 0) {
//   videoFiles.forEach((file) => {
//     if (file) {
//       formData.append('videos', file);
//     }
//   });
// }

// //      newVideos.forEach((video, idx) => {
// //   if (video.file) {
// //     formData.append(`videos`, video.file);
// //     formData.append(`videoNames`, video.name);
// //     formData.append(`videoDescriptions`, video.description);
// //   }
// // });
// newVideos.forEach((video) => {
//   if (video.file) {
//     formData.append('videos', video.file);
//   }
//   formData.append('videoNames', video.name);
//   formData.append('videoDescriptions', video.description);
// });


//         try {
//             await updateCertificate(editingCertificationId, formData);
//             alert('Certificate updated successfully');
//             closeModal();
//             resetForm();
//             fetchFilteredCertificates();
//         } catch (error) {
//             console.error('Error updating certificate:', error);
//         }
//     };

//     const resetForm = () => {
//         setEditingCertificationId(null);
//         setName('');
//         setDescription('');
//         setVideoName('');
//         setVideoDescription('');
//         setSelectedFile(null);
//         setVideoFiles([]);
//         setCurrentVideoUrls([]);
//         setImageUrl(null);
//     };

//     const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
//         const file = event.target.files?.[0];
//         if (file) {
//             setSelectedFile(file);
//         }
//     };

//     const handleDelete = async (id: string) => {
//         const confirmDelete = window.confirm('Are you sure you want to delete this certificate?');
//         if (!confirmDelete) return;

//         try {
//             await deleteCertificate(id);
//             alert('Certificate deleted successfully');
//             fetchFilteredCertificates();
//         } catch (error) {
//             console.error('Error deleting certificate:', error);
//         }
//     };

//     const getFilteredByStatus = () => {
//         if (activeTab === 'active') {
//             return filteredCertificates.filter(mod => mod.status === 'Active');
//         } else if (activeTab === 'inactive') {
//             return filteredCertificates.filter(mod => mod.status === 'Deleted');
//         }
//         return filteredCertificates;
//     };

//     if (!certificates || !Array.isArray(certificates)) {
//         return <RouteLoader />;
//     }

//     return (
//         <div>
//             <PageBreadcrumb pageTitle="Certificate" />
//             <div className="my-5">
//                 <AddCertificate />
//             </div>

//             <div>
//                 <ModuleStatCard />
//             </div>

//             <div className="my-5">
//                 <ComponentCard title="All Certificates">
//                     <div>
//                         <Input
//                             type="text"
//                             placeholder="Search by certificate name"
//                             value={searchQuery}
//                             onChange={(e) => setSearchQuery(e.target.value)}
//                         />
//                     </div>

//                     <div className="border-b border-gray-200">
//                         <ul className="flex space-x-6 text-sm font-medium text-center text-gray-500">
//                             <li
//                                 className={`cursor-pointer px-4 py-2 ${activeTab === 'all' ? 'border-b-2 border-blue-600 text-blue-600' : ''}`}
//                                 onClick={() => setActiveTab('all')}
//                             >
//                                 All
//                             </li>
//                             <li
//                                 className={`cursor-pointer px-4 py-2 ${activeTab === 'active' ? 'border-b-2 border-blue-600 text-blue-600' : ''}`}
//                                 onClick={() => setActiveTab('active')}
//                             >
//                                 Active
//                             </li>
//                             <li
//                                 className={`cursor-pointer px-4 py-2 ${activeTab === 'inactive' ? 'border-b-2 border-blue-600 text-blue-600' : ''}`}
//                                 onClick={() => setActiveTab('inactive')}
//                             >
//                                 Inactive
//                             </li>
//                         </ul>
//                     </div>
//                     <div>
//                         <BasicTableOne columns={columns} data={getFilteredByStatus()} />
//                     </div>
//                 </ComponentCard>
//             </div>


//             {/* Edit Modal */}
// <Modal isOpen={isOpen} onClose={closeModal} className="max-w-[700px] m-4">
//   <div className="no-scrollbar relative w-full max-w-[700px] overflow-y-auto rounded-3xl bg-white p-4 dark:bg-gray-900 lg:p-11">
//     <div className="px-2 pr-14">
//       <h4 className="mb-5 text-2xl font-semibold text-gray-800 dark:text-white/90">
//         Edit Tutorial Information
//       </h4>
//     </div>

//     <form className="flex flex-col">
//       <div className="custom-scrollbar h-[400px] overflow-y-auto px-2 pb-3">
//         <div className="grid grid-cols-1 gap-x-6 gap-y-5">
//           <div>
//             <Label>Tutorial Name</Label>
//             <Input
//               type="text"
//               value={name}
//               placeholder="Enter Tutorial Name"
//               onChange={(e) => setName(e.target.value)}
//             />
//           </div>

//           <div>
//             <Label>Select Image</Label>
//             <FileInput onChange={handleFileChange} />
//             {(selectedFile || imageUrl) && (
//               <div className="mt-2">
//                 <Image
//                   width={100}
//                   height={100}
//                   src={selectedFile ? URL.createObjectURL(selectedFile) : imageUrl!}
//                   alt="Selected certificate image"
//                   className="object-cover rounded"
//                 />
//               </div>
//             )}
//           </div>

//           <div>
//             <Label>Tutorial Description</Label>
//             <Input
//               type="text"
//               value={description}
//               placeholder="Enter Description"
//               onChange={(e) => setDescription(e.target.value)}
//             />
//           </div>

//           <div>
//             <Label>Tutorial Video Name</Label>
//             <Input
//               type="text"
//               value={videoName}
//               placeholder="Enter Video Name"
//               onChange={(e) => setVideoName(e.target.value)}
//             />
//           </div>

//           <div>
//             <Label>Tutorial Video Description</Label>
//             <Input
//               type="text"
//               value={videoDescription}
//               placeholder="Enter Video Description"
//               onChange={(e) => setVideoDescription(e.target.value)}
//             />
//           </div>

//           <div>
//             <Label htmlFor="videoFiles">Select Video File(s)</Label>
//             <FileInput
//               id="videoFiles"
//               onChange={handleVideoFileChange}
//               accept="video/*"
//               multiple
//             />
//             {videoFiles.length > 0 && (
//               <p className="text-sm text-gray-500 mt-1">
//                 Selected: {videoFiles.map((f) => f.name).join(', ')}
//               </p>
//             )}
//             {currentVideoUrls.length > 0 && videoFiles.length === 0 && (
//               <div className="mt-2">
//                 <Label>Current Video(s):</Label>
//                 {currentVideoUrls.map((url, i) => (
//                   <a
//                     key={i}
//                     href={url}
//                     target="_blank"
//                     rel="noopener noreferrer"
//                     className="text-blue-600 underline mr-2 block"
//                   >
//                     Video {i + 1}
//                   </a>
//                 ))}


//                 <div>
//   <Label>Add New Video(s)</Label>
//   {newVideos.map((video, index) => (
//     <div key={index} className="border p-3 rounded-md mb-3">
//       <div className="mb-2">
//         <Input
//           placeholder="Video Name"
//           value={video.name}
//           onChange={(e) => handleNewVideoChange(index, 'name', e.target.value)}
//         />
//       </div>
//       <div className="mb-2">
//         <Input
//           placeholder="Video Description"
//           value={video.description}
//           onChange={(e) => handleNewVideoChange(index, 'description', e.target.value)}
//         />
//       </div>
//       <div>
//         <FileInput
//           accept="video/*"
//           onChange={(e) => handleNewVideoChange(index, 'file', e.target.files?.[0] || null)}
//         />
//         {video.file && <p className="text-sm text-gray-500 mt-1">{video.file.name}</p>}
//       </div>
//     </div>
//   ))}

//   <button
//     type="button"
//     onClick={addNewVideoField}
//     className="text-blue-600 underline mt-2"
//   >
//     + Add Another Video
//   </button>
// </div>
//               </div>
//             )}
//           </div>
//         </div>
//       </div>

//       <div className="flex items-center gap-3 px-2 mt-6 lg:justify-end">
//         <Button size="sm" variant="outline" onClick={closeModal}>
//           Cancel
//         </Button>
//         <Button size="sm" onClick={handleUpdateData}>
//           Save Changes
//         </Button>
//       </div>
//     </form>
//   </div>
// </Modal>

//         </div>
//     );
// };

// export default Certificate;




'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import axios from 'axios';

import PageBreadcrumb from '@/components/common/PageBreadCrumb';
import ComponentCard from '@/components/common/ComponentCard';
import ModuleStatCard from '@/components/module-component/ModuleStatCard';
import RouteLoader from '@/components/RouteLoader';

import FileInput from '@/components/form/input/FileInput';
import Input from '@/components/form/input/InputField';
import Label from '@/components/form/Label';

import Button from '@/components/ui/button/Button';
import { Modal } from '@/components/ui/modal';
import BasicTableOne from '@/components/tables/BasicTableOne';

import AddCertificate from '@/components/certifications-component/CertificationComponent';

import { EyeIcon, TrashBinIcon } from '@/icons';
import { PlusCircle } from 'lucide-react';

import { useCertificate } from '@/context/CertificationContext';
import { useModal } from '@/hooks/useModal';

interface Certificate {
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
  status: 'Active' | 'Deleted';
}

const VideoPreviewCell: React.FC<{ urls: string[] }> = ({ urls }) => {
  const [showAll, setShowAll] = useState(false);
  if (!urls.length) return <span className="text-gray-500">No&nbsp;Videos</span>;

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
          Video&nbsp;{i + 1}
        </a>
      ))}

      {urls.length > 2 && (
        <button
          type="button"
          onClick={() => setShowAll((p) => !p)}
          className="text-sm text-red-600 hover:underline w-fit mt-1"
        >
          {showAll ? 'Show Less' : 'Show More'}
        </button>
      )}
    </div>
  );
};

const CertificatePage: React.FC = () => {
  /* ------------------- context / modal hooks -------------------- */
  const { certificates, updateCertificate, deleteCertificate } = useCertificate();
  const { isOpen, openModal, closeModal } = useModal();

  /* ------------------- local UI state --------------------------- */
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'active' | 'inactive'>('all');
  const [filtered, setFiltered] = useState<TableData[]>([]);

  /* ------------ edit‑modal specific state ----------------------- */
  const [editId, setEditId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [videoName, setVideoName] = useState('');
  const [videoDesc, setVideoDesc] = useState('');
  const [mainImgFile, setMainImgFile] = useState<File | null>(null);
  const [currentImgUrl, setCurrentImgUrl] = useState<string | null>(null);
  const [videoFiles, setVideoFiles] = useState<File[]>([]);
  const [currentVideoUrls, setCurrentVideoUrls] = useState<string[]>([]);
  const [newVideos, setNewVideos] = useState<
    { name: string; description: string; file: File | null }[]
  >([{ name: '', description: '', file: null }]);

  const fetchFiltered = async () => {
    try {
      const res = await axios.get('/api/certifications', {
        params: searchQuery ? { search: searchQuery } : {},
      });
      const rows: TableData[] = res.data.data.map((c: Certificate) => ({
        id: c._id,
        name: c.name,
        imageUrl: c.imageUrl,
        description: c.description ?? 'N/A',
        displayVideoNames: c.video.map((v) => v.videoName),
        displayVideoDescriptions: c.video.map((v) => v.videoDescription),
        displayVideoUrls: c.video.map((v) => v.videoUrl),
        categoryCount: c.categoryCount ?? 0,
        status: c.isDeleted ? 'Deleted' : 'Active',
      }));
      setFiltered(rows);
    } catch (err) {
      console.error('Fetch error', err);
      setFiltered([]);
    }
  };

  useEffect(() => {
    fetchFiltered();
  }, [searchQuery, certificates]);

 
  const columns = [
    { header: 'Tutorial Name', accessor: 'name' },
    {
      header: 'Image',
      accessor: 'imageUrl',
      render: (row: TableData) => (
        <Image
          src={row.imageUrl}
          alt={row.name}
          width={80}
          height={80}
          className="object-cover rounded"
        />
      ),
    },
    {
      header: 'Tutorial Description',
      accessor: 'description',
      render: (row: TableData) => (
        <div className="whitespace-pre-line">{row.description}</div>
      ),
    },
    {
      header: 'Video Name(s)',
      accessor: 'displayVideoNames',
      render: (row: TableData) =>
        row.displayVideoNames.map((n, i) => <p key={i}>{n}</p>),
    },
    {
      header: 'Video Description(s)',
      accessor: 'displayVideoDescriptions',
      render: (row: TableData) =>
        row.displayVideoDescriptions.map((d, i) => <p key={i}>{d}</p>),
    },
    {
      header: 'Video Files',
      accessor: 'displayVideoUrls',
      render: (row: TableData) => <VideoPreviewCell urls={row.displayVideoUrls} />,
    },
    {
      header: 'Videos Count',
      accessor: 'categoryCount',
      render: (row: TableData) => <span>{row.displayVideoUrls.length}</span>,
    },
    {
      header: 'Status',
      accessor: 'status',
      render: (row: TableData) => (
        <span
          className={`px-3 py-1 rounded-full text-sm font-semibold ${row.status === 'Active'
              ? 'bg-green-100 text-green-700'
              : 'bg-red-100 text-red-600'
            }`}
        >
          {row.status}
        </span>
      ),
    },
    {
      header: 'Action',
      accessor: 'action',
      render: (row: TableData) => (
        <div className="flex gap-2">
          <button
            onClick={() => handleEdit(row.id)}
            className="text-yellow-500 border border-yellow-500 rounded-md p-2 hover:bg-yellow-500 hover:text-white"
            aria-label="Edit"
          >
            <PlusCircle size={16} />
          </button>
          <button
            onClick={() => handleDelete(row.id)}
            className="text-red-500 border border-red-500 rounded-md p-2 hover:bg-red-500 hover:text-white"
            aria-label="Delete"
          >
            <TrashBinIcon />
          </button>
          <Link
            href={`/academy/certifications/${row.id}`}
            className="text-blue-500 border border-blue-500 rounded-md p-2 hover:bg-blue-500 hover:text-white"
            aria-label="View"
          >
            <EyeIcon />
          </Link>
        </div>
      ),
    },
  ];

  const handleEdit = (id: string) => {
    const cert = certificates.find((c) => c._id === id);
    if (!cert) return;
    setEditId(cert._id);
    setName(cert.name);
    setDescription(cert.description ?? '');
    setVideoName(cert.video[0]?.videoName ?? '');
    setVideoDesc(cert.video[0]?.videoDescription ?? '');
    setCurrentImgUrl(cert.imageUrl);
    setCurrentVideoUrls(cert.video.map((v) => v.videoUrl));
    setMainImgFile(null);
    setVideoFiles([]);
    setNewVideos([{ name: '', description: '', file: null }]);
    openModal();
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete certificate?')) return;
    try {
      await deleteCertificate(id);
      await fetchFiltered();
    } catch (err) {
      console.error('Delete error', err);
    }
  };

  const handleNewVideoChange = (
    idx: number,
    key: 'name' | 'description' | 'file',
    val: string | File | null,
  ) => {
    setNewVideos((prev) =>
      prev.map((v, i) => (i === idx ? { ...v, [key]: val } : v)),
    );
  };
  const addNewVideoField = () =>
    setNewVideos((prev) => [...prev, { name: '', description: '', file: null }]);

  const submitEdit = async () => {
    if (!editId) return;
    const fd = new FormData();
    fd.append('name', name);
    fd.append('description', description);
    fd.append('videoName', videoName);
    fd.append('videoDescription', videoDesc);
    if (mainImgFile) fd.append('imageUrl', mainImgFile);
    videoFiles.forEach((f) => fd.append('videos', f));

    newVideos.forEach((v) => {
      if (v.file) fd.append('videos', v.file);
      fd.append('videoNames', v.name);
      fd.append('videoDescriptions', v.description);
    });

    try {
      await updateCertificate(editId, fd);
      closeModal();
      await fetchFiltered();
    } catch (err) {
      console.error('Update error', err);
    }
  };

  
  const visibleRows = filtered.filter((r) =>
    activeTab === 'all'
      ? true
      : activeTab === 'active'
        ? r.status === 'Active'
        : r.status === 'Deleted',
  );

 
  if (!certificates) return <RouteLoader />;

  return (
    <div>
      <PageBreadcrumb pageTitle="Certificate" />

      {/* Add new certificate section */}
      <div className="my-5">
        <AddCertificate />
      </div>

      {/* Stats */}
      <ModuleStatCard />

      {/* Table / search */}
      <div className="my-5">
        <ComponentCard title="All Certificates">
          <Input
            placeholder="Search by certificate name"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />

          <div className="border-b border-gray-200 mt-4">
            {(['all', 'active', 'inactive'] as const).map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 text-sm font-medium ${activeTab === tab
                    ? 'border-b-2 border-blue-600 text-blue-600'
                    : 'text-gray-500'
                  }`}
              >
                {tab === 'all'
                  ? 'All'
                  : tab === 'active'
                    ? 'Active'
                    : 'Inactive'}
              </button>
            ))}
          </div>

          <BasicTableOne columns={columns} data={visibleRows} />
        </ComponentCard>
      </div>

      {/* ---------------------- EDIT MODAL ---------------------- */}
      <Modal isOpen={isOpen} onClose={closeModal} className="max-w-[700px] m-4">
        <div className="relative w-full max-w-[700px] overflow-y-auto rounded-3xl bg-white p-6 dark:bg-gray-900">
          <h4 className="text-2xl font-semibold mb-6">Edit Tutorial Information</h4>

          {/* FORM */}
          <div className="space-y-5 max-h-[65vh] overflow-y-auto pr-2">
            <Label>Name</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} />

            <Label>Main Image</Label>
            <FileInput accept="image/*" onChange={(e) => setMainImgFile(e.target.files?.[0] || null)} />
            {mainImgFile ? (
              <Image
                src={URL.createObjectURL(mainImgFile)}
                width={120}
                height={120}
                alt="preview"
                className="mt-2 rounded object-cover"
              />
            ) : currentImgUrl ? (
              <Image
                src={currentImgUrl}
                width={120}
                height={120}
                alt="current"
                className="mt-2 rounded object-cover"
              />
            ) : null}

            <Label>Description</Label>
            <Input value={description} onChange={(e) => setDescription(e.target.value)} />

            <Label>Video Name</Label>
            <Input value={videoName} onChange={(e) => setVideoName(e.target.value)} />

            <Label>Video Description</Label>
            <Input value={videoDesc} onChange={(e) => setVideoDesc(e.target.value)} />

            <Label>Add / Replace Video File(s)</Label>
            <FileInput multiple accept="video/*" onChange={(e) => setVideoFiles(Array.from(e.target.files || []))} />
            {videoFiles.length > 0 && (
              <p className="text-sm text-gray-500">
                Selected: {videoFiles.map((f) => f.name).join(', ')}
              </p>
            )}

            {currentVideoUrls.length > 0 && !videoFiles.length && (
              <div>
                <Label>Current Videos</Label>
                {currentVideoUrls.map((u, i) => (
                  <a
                    key={i}
                    href={u}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 underline block"
                  >
                    Video&nbsp;{i + 1}
                  </a>
                ))}
              </div>
            )}

            <Label>Add New Video(s)</Label>
            {newVideos.map((v, idx) => (
              <div key={idx} className="border p-3 rounded-md mb-3 space-y-2">
                <Input
                  placeholder="Video Name"
                  value={v.name}
                  onChange={(e) => handleNewVideoChange(idx, 'name', e.target.value)}
                />
                <Input
                  placeholder="Video Description"
                  value={v.description}
                  onChange={(e) => handleNewVideoChange(idx, 'description', e.target.value)}
                />
                <FileInput
                  accept="video/*"
                  onChange={(e) => handleNewVideoChange(idx, 'file', e.target.files?.[0] || null)}
                />
              </div>
            ))}
            <button type="button" onClick={addNewVideoField} className="text-blue-600 underline">
              +&nbsp;Add Another Video
            </button>
          </div>

          {/* ACTIONS */}
          <div className="flex justify-end gap-3 mt-6">
            <Button variant="outline" onClick={closeModal}>
              Cancel
            </Button>
            <Button onClick={submitEdit}>Save Changes</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default CertificatePage;
