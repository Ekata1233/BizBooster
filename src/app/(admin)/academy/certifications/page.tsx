// 'use client';

// import React, { useEffect, useState } from 'react';
// import Image from 'next/image';
// import Link from 'next/link';

// import PageBreadcrumb from '@/components/common/PageBreadCrumb';
// import ComponentCard from '@/components/common/ComponentCard';
// import ModuleStatCard from '@/components/module-component/ModuleStatCard';
// import RouteLoader from '@/components/RouteLoader';

// import FileInput from '@/components/form/input/FileInput';
// import Input from '@/components/form/input/InputField';
// import Label from '@/components/form/Label';

// import Button from '@/components/ui/button/Button';
// import { Modal } from '@/components/ui/modal';
// import BasicTableOne from '@/components/tables/BasicTableOne';

// import AddCertificate from '@/components/certifications-component/CertificationComponent';

// import { EyeIcon, TrashBinIcon } from '@/icons';
// import { PlusCircle } from 'lucide-react';

// import { useCertificate } from '@/context/CertificationContext';
// import { useModal } from '@/hooks/useModal';
// import { useRouter } from 'next/navigation';


// interface TableData {
//   id: string;
//   name: string;
//   imageUrl: string;
//   description: string;
//   displayVideoNames: string[];
//   displayVideoDescriptions: string[];
//   displayVideoUrls: string[];
//   status: 'Active' | 'Deleted';
// }

// const VideoPreviewCell: React.FC<{ urls: string[] }> = ({ urls }) => {
//   const [showAll, setShowAll] = useState(false);
//   if (!urls.length) return <span className="text-gray-500">No&nbsp;Videos</span>;

//   const visible = showAll ? urls : urls.slice(0, 2);
//   return (
//     <div className="flex flex-col gap-1">
//       {visible.map((url, i) => (
//         <a
//           key={i}
//           href={url}
//           target="_blank"
//           rel="noopener noreferrer"
//           className="text-blue-600 hover:underline"
//         >
//           Video&nbsp;{i + 1}
//         </a>
//       ))}

//       {urls.length > 2 && (
//         <button
//           type="button"
//           onClick={() => setShowAll((p) => !p)}
//           className="text-sm text-red-600 hover:underline w-fit mt-1 hover:text-blue-800"
//         >
//           {showAll ? 'Show Less' : 'Show More'}
//         </button>
//       )}
//     </div>
//   );
// };


// const CertificatePage: React.FC = () => {
//   /* ------------------- context / modal hooks -------------------- */
//   const { certificates, updateCertificate, deleteCertificate } = useCertificate();
//   const { isOpen, closeModal } = useModal();
//   const router = useRouter();

//   /* ------------------- local UI state --------------------------- */
//   const [searchQuery, setSearchQuery] = useState('');
//   const [activeTab, setActiveTab] = useState<'all' | 'active' | 'inactive'>('all');
//   const [filtered, setFiltered] = useState<TableData[]>([]);

//   /* ------------ edit‑modal specific state ----------------------- */
//   const [editId] = useState<string | null>(null); // editing handled via route push
//   const [name, setName] = useState('');
//   const [description, setDescription] = useState('');
//   const [videoName, setVideoName] = useState('');
//   const [videoDesc, setVideoDesc] = useState('');
//   const [mainImgFile, setMainImgFile] = useState<File | null>(null);
//   const [currentImgUrl] = useState<string | null>(null);
//   const [videoFiles, setVideoFiles] = useState<File[]>([]);
//   const [currentVideoUrls] = useState<string[]>([]);
//   const [newVideos, setNewVideos] = useState<
//     { name: string; description: string; file: File | null }[]
//   >([{ name: '', description: '', file: null }]);

//   const [expandedVideoDetailsRows, setExpandedVideoDetailsRows] = useState<string[]>([]);
//   const toggleVideoDetailsExpansion = (id: string) => {
//     setExpandedVideoDetailsRows((prev) =>
//       prev.includes(id) ? prev.filter((r) => r !== id) : [...prev, id],
//     );
//   };

  
//   useEffect(() => {
//     const filteredData = certificates
//       .filter((c) => c.name.toLowerCase().includes(searchQuery.toLowerCase()))
//       .map((c) => ({
//         id: c._id,
//         name: c.name,
//         imageUrl: c.imageUrl,
//         description: c.description ?? 'N/A',
//         displayVideoNames: c.video.map((v) => v.videoName),
//         displayVideoDescriptions: c.video.map((v) => v.videoDescription),
//         displayVideoUrls: c.video.map((v) => v.videoUrl),
//         status: (c.isDeleted ? 'Deleted' : 'Active') as TableData['status'],
//       }));

//     setFiltered(filteredData);
//   }, [searchQuery, certificates]);

 
//   const columns = [
//     { header: 'Tutorial Name', accessor: 'name' },
//     {
//       header: 'Image',
//       accessor: 'imageUrl',
//       render: (row: TableData) => (
//         <Image
//           src={row.imageUrl}
//           alt={row.name}
//           width={80}
//           height={80}
//           className="object-cover rounded"
//         />
//       ),
//     },
//     {
//       header: 'Tutorial Description',
//       accessor: 'description',
//       render: (row: TableData) => (
//         <div className="whitespace-pre-line">{row.description}</div>
//       ),
//     },
    
//     {
//           header: 'Tutorial Details',
//           accessor: 'videoDetails', // Dummy accessor, content is rendered
//           render: (r: TableData) => {
//             const expanded = expandedVideoDetailsRows.includes(r.id);
//             const visibleCount = expanded ? r.displayVideoNames.length : Math.min(r.displayVideoNames.length, 2);
//             const hasMore = r.displayVideoNames.length > 2;
    
//             return (
//               <div className="flex flex-col gap-2 w-full"> {/* Container for individual video boxes */}
//                 {r.displayVideoNames.slice(0, visibleCount).map((name, i) => (
//                   <div key={i} className="border border-gray-200 p-1 rounded-md shadow-sm bg-gray-50"> {/* The "box" for each video detail */}
    
    
    
//                     <span className="text-gray-600 font-medium">Video Name:</span>
    
//                     <span className="font-semibold text-gray-800 break-words">{name}</span>
    
//                     <Label className="mt-1">Description:</Label>
    
//                     <div className="text-gray-700 text-sm  max-w-md break-words whitespace-pre-wrap text-justify">
//                       {r.displayVideoDescriptions[i] || 'No description'}
//                     </div>
    
    
//                   </div>
//                 ))}
//                 {hasMore && (
//                   <button
//                     className="text-sm text-red-600 underline mt-1 hover:text-blue-800 transition-colors duration-200"
//                     onClick={() => toggleVideoDetailsExpansion(r.id)}
//                   >
//                     {expanded ? 'Show Less' : 'Show More'}
//                   </button>
//                 )}
//               </div>
    
    
    
//             );
//           },
//         },
//     {
//       header: 'Video Files',
//       accessor: 'displayVideoUrls',
//       render: (row: TableData) => <VideoPreviewCell urls={row.displayVideoUrls} />,
//     },
//     {
//       header: 'Videos Count',
//       accessor: 'categoryCount',
//       render: (row: TableData) => <span>{row.displayVideoUrls.length}</span>,
//     },
//     {
//       header: 'Action',
//       accessor: 'action',
//       render: (row: TableData) => (
//         <div className="flex gap-2">
//           <button
//             onClick={() => handleEdit(row.id)}
//             className="text-yellow-500 border border-yellow-500 rounded-md p-2 hover:bg-yellow-500 hover:text-white"
//             aria-label="Edit"
//           >
//             <PlusCircle size={16} />
//           </button>
//           <button
//             onClick={() => handleDelete(row.id)}
//             className="text-red-500 border border-red-500 rounded-md p-2 hover:bg-red-500 hover:text-white"
//             aria-label="Delete"
//           >
//             <TrashBinIcon />
//           </button>
//           <Link
//             href={`/academy/certifications/${row.id}`}
//             className="text-blue-500 border border-blue-500 rounded-md p-2 hover:bg-blue-500 hover:text-white"
//             aria-label="View"
//           >
//             <EyeIcon />
//           </Link>
//         </div>
//       ),
//     },
//   ];

//   <div className="overflow-x-auto bg-white rounded-xl shadow-lg border border-gray-200">
//   <table className="min-w-full border-collapse text-sm">
//     <thead className="bg-gradient-to-r from-blue-100 to-blue-50">
//       <tr>
//         {columns.map((col) => (
//           <th
//             key={col.header}
//             className="px-5 py-3 text-left text-gray-700 font-semibold uppercase tracking-wide border-b border-gray-300"
//           >
//             {col.header}
//           </th>
//         ))}
//       </tr>
//     </thead>
//     <tbody className="divide-y divide-gray-200">
//       {tableData.map((row) => (
//         <tr
//           key={row.id}
//           className="hover:bg-blue-50 transition-colors duration-200"
//         >
//           {columns.map((col) => (
//             <td key={col.accessor} className="px-5 py-4 text-gray-800">
//               {col.render ? col.render(row) : row[col.accessor]}
//             </td>
//           ))}
//         </tr>
//       ))}
//     </tbody>
//   </table>
// </div>

//   /* ------------------------------------------------------------------
//    * Handlers (Edit / Delete / Modal form)
//    * ------------------------------------------------------------------ */
//   const handleEdit = (id: string) => {
//     // Navigate to edit page (modal route)
//     router.push(`/academy/certifications/modals/${id}`);
//   };

//   const handleDelete = async (id: string) => {
//     if (!window.confirm('Delete certificate?')) return;
//     try {
//       await deleteCertificate(id);
//     } catch (err) {
//       console.error('Delete error', err);
//     }
//   };

//   const handleNewVideoChange = (
//     idx: number,
//     key: 'name' | 'description' | 'file',
//     val: string | File | null,
//   ) => {
//     setNewVideos((prev) =>
//       prev.map((v, i) => (i === idx ? { ...v, [key]: val } : v)),
//     );
//   };

//   const addNewVideoField = () =>
//     setNewVideos((prev) => [...prev, { name: '', description: '', file: null }]);

//   const submitEdit = async () => {
//     if (!editId) return; // Guard (this path not currently used when routing away)
//     const fd = new FormData();
//     fd.append('name', name);
//     fd.append('description', description);
//     fd.append('videoName', videoName);
//     fd.append('videoDescription', videoDesc);
//     if (mainImgFile) fd.append('imageUrl', mainImgFile);
//     videoFiles.forEach((f) => fd.append('videos', f));

//     newVideos.forEach((v) => {
//       if (v.file) fd.append('videos', v.file);
//       fd.append('videoNames', v.name);
//       fd.append('videoDescriptions', v.description);
//     });

//     try {
//       await updateCertificate(editId, fd);
//       closeModal();
//     } catch (err) {
//       console.error('Update error', err);
//     }
//   };

//   /* ------------------------------------------------------------------
//    * Filter rows by active tab (currently only 'all' is shown)
//    * ------------------------------------------------------------------ */
//   const visibleRows = filtered.filter((r) =>
//     activeTab === 'all'
//       ? true
//       : activeTab === 'active'
//         ? r.status === 'Active'
//         : r.status === 'Deleted',
//   );

//   if (!certificates) return <RouteLoader />;

 
//   return (
//     <div>
//       <PageBreadcrumb pageTitle="Training Tutorials" />

//       {/* Top stats / quick add */}
//       <ModuleStatCard />
//       <div className="my-5">
//         <AddCertificate />
//       </div>

//       {/* Table / search */}
//       <div className="my-5">
//         <ComponentCard title="All Training Tutorials">
//           <Input
//             placeholder="Search by tutorial name"
//             value={searchQuery}
//             onChange={(e) => setSearchQuery(e.target.value)}
//           />

//           <div className="border-b border-gray-200 mt-4">
//             {(['all'] as const).map((tab) => (
//               <button
//                 key={tab}
//                 type="button"
//                 onClick={() => setActiveTab(tab)}
//                 className={`px-4 py-2 text-sm font-medium ${
//                   activeTab === tab
//                     ? 'border-b-2 border-blue-600 text-blue-600'
//                     : 'text-gray-500'
//                 }`}
//               >
//                 {tab === 'all' ? 'All' : tab === 'active' ? 'Active' : 'Inactive'}
//               </button>
//             ))}
//           </div>

//           <BasicTableOne columns={columns} data={visibleRows} />
//         </ComponentCard>
//       </div>

//       {/* ---------------------- EDIT MODAL ---------------------- */}
//       <Modal isOpen={isOpen} onClose={closeModal} className="max-w-[700px] m-4">
//         <div className="relative w-full max-w-[700px] overflow-y-auto rounded-3xl bg-white p-6 dark:bg-gray-900">
//           <h4 className="text-2xl font-semibold mb-6">Edit Tutorial Information</h4>

//           {/* FORM */}
//           <div className="space-y-5 max-h-[65vh] overflow-y-auto pr-2">
//             <Label>Name</Label>
//             <Input value={name} onChange={(e) => setName(e.target.value)} />

//             <Label>Main Image</Label>
//             <FileInput
//               accept="image/*"
//               onChange={(e) => setMainImgFile(e.target.files?.[0] || null)}
//             />
//             {mainImgFile ? (
//               <Image
//                 src={URL.createObjectURL(mainImgFile)}
//                 width={120}
//                 height={120}
//                 alt="preview"
//                 className="mt-2 rounded object-cover"
//               />
//             ) : currentImgUrl ? (
//               <Image
//                 src={currentImgUrl}
//                 width={120}
//                 height={120}
//                 alt="current"
//                 className="mt-2 rounded object-cover"
//               />
//             ) : null}

//             <Label>Description</Label>
//             <Input value={description} onChange={(e) => setDescription(e.target.value)} />

//             <Label>Video Name</Label>
//             <Input value={videoName} onChange={(e) => setVideoName(e.target.value)} />

//             <Label>Video Description</Label>
//             <Input value={videoDesc} onChange={(e) => setVideoDesc(e.target.value)} />

//             <Label>Add / Replace Video File(s)</Label>
//             <FileInput
//               multiple
//               accept="video/*"
//               onChange={(e) => setVideoFiles(Array.from(e.target.files || []))}
//             />
//             {videoFiles.length > 0 && (
//               <p className="text-sm text-gray-500">
//                 Selected: {videoFiles.map((f) => f.name).join(', ')}
//               </p>
//             )}

//             {currentVideoUrls.length > 0 && !videoFiles.length && (
//               <div>
//                 <Label>Current Videos</Label>
//                 {currentVideoUrls.map((u, i) => (
//                   <a
//                     key={i}
//                     href={u}
//                     target="_blank"
//                     rel="noopener noreferrer"
//                     className="text-blue-600 underline block"
//                   >
//                     Video&nbsp;{i + 1}
//                   </a>
//                 ))}
//               </div>
//             )}

//             <Label>Add New Video(s)</Label>
//             {newVideos.map((v, idx) => (
//               <div key={idx} className="border p-3 rounded-md mb-3 space-y-2">
//                 <Input
//                   placeholder="Video Name"
//                   value={v.name}
//                   onChange={(e) => handleNewVideoChange(idx, 'name', e.target.value)}
//                 />
//                 <Input
//                   placeholder="Video Description"
//                   value={v.description}
//                   onChange={(e) => handleNewVideoChange(idx, 'description', e.target.value)}
//                 />
//                 <FileInput
//                   accept="video/*"
//                   onChange={(e) => handleNewVideoChange(idx, 'file', e.target.files?.[0] || null)}
//                 />
//               </div>
//             ))}
//             <button type="button" onClick={addNewVideoField} className="text-blue-600 underline">
//               +&nbsp;Add Another Video
//             </button>
//           </div>

//           {/* ACTIONS */}
//           <div className="flex justify-end gap-3 mt-6">
//             <Button variant="outline" onClick={closeModal}>
//               Cancel
//             </Button>
//             <Button onClick={submitEdit}>Save Changes</Button>
//           </div>
//         </div>
//       </Modal>
//     </div>
//   );
// };

// export default CertificatePage;






'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';

import PageBreadcrumb from '@/components/common/PageBreadCrumb';
import ComponentCard from '@/components/common/ComponentCard';
import ModuleStatCard from '@/components/module-component/ModuleStatCard';
import RouteLoader from '@/components/RouteLoader';

import FileInput from '@/components/form/input/FileInput';
import Input from '@/components/form/input/InputField';
import Label from '@/components/form/Label';

import Button from '@/components/ui/button/Button';
import { Modal } from '@/components/ui/modal';
// import BasicTableOne from '@/components/tables/BasicTableOne'; // no longer used (we hand‑craft table)

import AddCertificate from '@/components/certifications-component/CertificationComponent';

import { EyeIcon, TrashBinIcon } from '@/icons';
import { PlusCircle } from 'lucide-react';

import { useCertificate } from '@/context/CertificationContext';
import { useModal } from '@/hooks/useModal';
import { useRouter } from 'next/navigation';

/* ------------------------------------------------------------------
 * Types
 * ------------------------------------------------------------------ */
interface TableData {
  id: string;
  name: string;
  imageUrl: string;
  description: string;
  displayVideoNames: string[];
  displayVideoDescriptions: string[];
  displayVideoUrls: string[];
  status: 'Active' | 'Deleted';
}

/* ------------------------------------------------------------------
 * Small cell component: shows n video links w/ show more/less
 * ------------------------------------------------------------------ */
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
          className="text-sm text-red-600 hover:text-blue-800 underline w-fit mt-1 transition-colors duration-200"
        >
          {showAll ? 'Show Less' : 'Show More'}
        </button>
      )}
    </div>
  );
};

/* ==================================================================
 * Main Page Component
 * ================================================================== */
const CertificatePage: React.FC = () => {
  /* ------------------- context / modal hooks -------------------- */
  const { certificates, updateCertificate, deleteCertificate } = useCertificate();
  const { isOpen, closeModal } = useModal();
  const router = useRouter();

  /* ------------------- local UI state --------------------------- */
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'active' | 'inactive'>('all');
  const [filtered, setFiltered] = useState<TableData[]>([]);

  /* ------------ edit‑modal specific state ----------------------- */
  const [editId] = useState<string | null>(null); // editing handled via route push
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [videoName, setVideoName] = useState('');
  const [videoDesc, setVideoDesc] = useState('');
  const [mainImgFile, setMainImgFile] = useState<File | null>(null);
  const [currentImgUrl] = useState<string | null>(null);
  const [videoFiles, setVideoFiles] = useState<File[]>([]);
  const [currentVideoUrls] = useState<string[]>([]);
  const [newVideos, setNewVideos] = useState<
    { name: string; description: string; file: File | null }[]
  >([{ name: '', description: '', file: null }]);

  /* ------------------------------------------------------------------
   * Expand/collapse Tutorial Details rows
   * ------------------------------------------------------------------ */
  const [expandedVideoDetailsRows, setExpandedVideoDetailsRows] = useState<string[]>([]);
  const toggleVideoDetailsExpansion = (id: string) => {
    setExpandedVideoDetailsRows((prev) =>
      prev.includes(id) ? prev.filter((r) => r !== id) : [...prev, id],
    );
  };

  /* ------------------------------------------------------------------
   * Filter certificates when list or search changes
   * ------------------------------------------------------------------ */
  useEffect(() => {
    const filteredData = certificates
      .filter((c) => c.name.toLowerCase().includes(searchQuery.toLowerCase()))
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

    setFiltered(filteredData);
  }, [searchQuery, certificates]);

  /* ------------------------------------------------------------------
   * Visible rows by tab selection
   * ------------------------------------------------------------------ */
  const visibleRows = filtered.filter((r) =>
    activeTab === 'all'
      ? true
      : activeTab === 'active'
        ? r.status === 'Active'
        : r.status === 'Deleted',
  );

  /* ------------------------------------------------------------------
   * Handlers (Edit / Delete / Modal form)
   * ------------------------------------------------------------------ */
  const handleEdit = (id: string) => {
    // Navigate to edit page (modal route)
    router.push(`/academy/certifications/modals/${id}`);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete certificate?')) return;
    try {
      await deleteCertificate(id);
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
    if (!editId) return; // Guard (this path not currently used when routing away)
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
    } catch (err) {
      console.error('Update error', err);
    }
  };

  if (!certificates) return <RouteLoader />;

  /* ==================================================================
   * Render
   * ================================================================== */
  return (
    <div>
      <PageBreadcrumb pageTitle="Training Tutorials" />

      {/* Top stats / quick add */}
      <ModuleStatCard />
      <div className="my-5">
        <AddCertificate />
      </div>

      {/* Table / search */}
      <div className="my-5">
        <ComponentCard title="All Training Tutorials">
          {/* Search input */}
          <Input
            placeholder="Search by tutorial name"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="mb-4"
          />

          {/* Tabs */}
          <div className="border-b border-gray-200 mt-4 flex gap-2">
            {(['all', 'active', 'inactive'] as const).map((tab) => (
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
                {tab === 'all' ? 'All' : tab === 'active' ? 'Active' : 'Inactive'}
                {activeTab === tab && (
                  <span className="absolute left-0 -bottom-[1px] h-[2px] w-full rounded-full bg-blue-600" />
                )}
              </button>
            ))}
          </div>

          {/* Styled Table */}
          <div className="mt-6 overflow-x-auto bg-white rounded-xl shadow-lg border border-gray-200">
            <table className="min-w-full border-collapse text-sm">
              <thead className="">
                <tr>
                  <th className="px-5 py-3 text-left text-gray-700 font-semibold uppercase tracking-wide border-b border-gray-300">
                    Tutorial Name
                  </th>
                  <th className="px-5 py-3 text-left text-gray-700 font-semibold uppercase tracking-wide border-b border-gray-300">
                    Image
                  </th>
                  <th className="px-5 py-3 text-left text-gray-700 font-semibold uppercase tracking-wide border-b border-gray-300">
                    Tutorial Description
                  </th>
                  <th className="px-5 py-3 text-left text-gray-700 font-semibold uppercase tracking-wide border-b border-gray-300">
                    Tutorial Details
                  </th>
                  <th className="px-5 py-3 text-left text-gray-700 font-semibold uppercase tracking-wide border-b border-gray-300">
                    Video Files
                  </th>
                  <th className="px-5 py-3 text-left text-gray-700 font-semibold uppercase tracking-wide border-b border-gray-300">
                    Videos Count
                  </th>
                  <th className="px-5 py-3 text-center text-gray-700 font-semibold uppercase tracking-wide border-b border-gray-300">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {visibleRows.map((row) => {
                  const expanded = expandedVideoDetailsRows.includes(row.id);
                  const visibleCount = expanded
                    ? row.displayVideoNames.length
                    : Math.min(row.displayVideoNames.length, 2);
                  const hasMore = row.displayVideoNames.length > 2;

                  return (
                    <tr
                      key={row.id}
                      className="hover:bg-blue-50 transition-colors duration-200"
                    >
                      {/* Tutorial Name */}
                      <td className="px-5 py-4 text-gray-800 font-medium">
                        {row.name}
                      </td>

                      {/* Image */}
                      <td className="px-5 py-4">
                        <Image
                          src={row.imageUrl}
                          alt={row.name}
                          width={80}
                          height={80}
                          className="object-cover rounded-md ring-1 ring-gray-200"
                        />
                      </td>

                      {/* Description */}
                      <td className="px-5 py-4 text-gray-700 whitespace-pre-line max-w-xs">
                        {row.description}
                      </td>

                      {/* Tutorial Details (video names & descriptions) */}
                      <td className="px-5 py-4">
                        <div className="flex flex-col gap-3 w-full">
                          {row.displayVideoNames
                            .slice(0, visibleCount)
                            .map((name, i) => (
                              <div
                                key={i}
                                className="border border-gray-200 p-3 rounded-lg shadow-sm bg-gray-50 hover:shadow-md transition duration-200"
                              >
                                <span className="text-blue-700 font-semibold block">
                                  Video Name:
                                </span>
                                <span className="font-medium text-gray-800 break-words">
                                  {name}
                                </span>

                                <Label className="mt-2 text-gray-600">
                                  Description:
                                </Label>
                                <div className="text-gray-700 text-sm mt-1 max-w-md break-words whitespace-pre-wrap text-justify">
                                  {row.displayVideoDescriptions[i] || 'No description'}
                                </div>
                              </div>
                            ))}
                          {hasMore && (
                            <button
                              className="text-sm text-red-600 underline mt-1 hover:text-blue-800 transition-colors duration-200 w-fit"
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
                      <td className="px-5 py-4 text-gray-800 font-semibold">
                        {row.displayVideoUrls.length}
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-4 text-center">
                        <div className="flex gap-2 justify-center">
                          <button
                            onClick={() => handleEdit(row.id)}
                            className="p-2 rounded-md border border-yellow-500 text-yellow-500 hover:bg-yellow-500 hover:text-white transition duration-200 shadow-sm"
                            aria-label="Edit"
                          >
                            <PlusCircle size={16} />
                          </button>
                          <button
                            onClick={() => handleDelete(row.id)}
                            className="p-2 rounded-md border border-red-500 text-red-500 hover:bg-red-500 hover:text-white transition duration-200 shadow-sm"
                            aria-label="Delete"
                          >
                            <TrashBinIcon />
                          </button>
                          <Link
                            href={`/academy/certifications/${row.id}`}
                            className="p-2 rounded-md border border-blue-500 text-blue-500 hover:bg-blue-500 hover:text-white transition duration-200 shadow-sm"
                            aria-label="View"
                          >
                            <EyeIcon />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })}

                {/* No rows */}
                {!visibleRows.length && (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-5 py-10 text-center text-gray-500 text-sm"
                    >
                      No tutorials found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
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
            <FileInput
              accept="image/*"
              onChange={(e) => setMainImgFile(e.target.files?.[0] || null)}
            />
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
            <FileInput
              multiple
              accept="video/*"
              onChange={(e) => setVideoFiles(Array.from(e.target.files || []))}
            />
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
            <button
              type="button"
              onClick={addNewVideoField}
              className="text-blue-600 underline"
            >
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
