// 'use client';

// import { useEffect, useState } from 'react';
// import { useParams, useRouter } from 'next/navigation';
// import Image from 'next/image';
// // import Link from 'next/link';
// import axios from 'axios';
// import { useModal } from '@/hooks/useModal';
// import { Modal } from '@/components/ui/modal';
// // import ComponentCard from '@/components/common/ComponentCard';
// import FileInput from '@/components/form/input/FileInput';
// import Input from '@/components/form/input/InputField';
// import Label from '@/components/form/Label';
// import { TrashBinIcon } from '@/icons';
// import { useCertificate } from '@/context/CertificationContext';
// import PageBreadcrumb from '@/components/common/PageBreadCrumb';
// import Button from '@/components/ui/button/Button';
// import Link from 'next/link';

// const CertificateDetailPage = () => {
//   const { id } = useParams();
//   const router = useRouter();
//   const { isOpen, openModal, closeModal } = useModal();
//   const { certificates,  deleteCertificate, updateTutorial, deleteTutorial} = useCertificate();
//   const [certificate, setCertificate] = useState<any>(null);
//   const [videoFiles, setVideoFiles] = useState<File[]>([]);
//   const [currentVideoUrls, setCurrentVideoUrls] = useState<string[]>([]); 
//   const [editingVideoIndex, setEditingVideoIndex] = useState<number | null>(null);
//   // const [filteredCertificates, setFilteredCertificates] = useState<[]>([]);
//   const [newVideos, setNewVideos] = useState([
//     { name: '', description: '', file: null as File | null }
//   ]);

//   useEffect(() => {
//     if (certificates && id) {
//       const selected = certificates.find((cert) => cert._id === id);
//       if (selected) {
//         setCertificate(selected);
//       }
//     }
//   }, [id, certificates]);




//    const handleVideoFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
//           const files = Array.from(event.target.files || []);
//           setVideoFiles(files);
//       };
// const handleUpdateVideo = (certificateId: string, videoIndex: number) => {
//   const selectedCertificate = certificates.find(item => item._id === certificateId);
//   if (selectedCertificate) {
//     const videoToEdit = selectedCertificate.video?.[videoIndex];
//     setEditingVideoIndex(videoIndex); // Track which video is being edited
//     setCurrentVideoUrls([videoToEdit?.videoUrl || '']);
//     setNewVideos([{
//       name: videoToEdit?.videoName || '',
//       description: videoToEdit?.videoDescription || '',
//       file: null
//     }]);
//     openModal();
//   }
// };
// const handleUpdateData = async () => {
//   const editingCertificationId = certificate._id;
//   console.log('Editing Certification ID:', editingCertificationId);
//   if (!editingCertificationId || editingVideoIndex === null) return;

//   const formData = new FormData();
//   formData.append('videoIndex', editingVideoIndex.toString()); // Tell backend which video to update
//   formData.append('videoName', newVideos[0].name);
//   formData.append('videoDescription', newVideos[0].description);

//   if (newVideos[0].file) {
//     formData.append('videoFile', newVideos[0].file);
//   }

//   try {
//     await updateTutorial(editingCertificationId, formData);
//     alert('Certificate updated successfully');
//     closeModal();
//     setEditingVideoIndex(null);
//     setNewVideos([{ name: '', description: '', file: null }]);
//     setVideoFiles([]);
//    const response = await axios.get(`/api/academy/tutorials/${editingCertificationId}`);
// setCertificate(response.data.data); // ← update certificate with latest data

//   } catch (error) {
//     console.error('Error updating certificate:', error);
//   }
// };

//  const handleDeleteVideo = async () => {
//     const confirmDelete = confirm('Are you sure you want to delete this certificate?');
//     if (!confirmDelete) return;

//     try {
//       await deleteTutorial(id as string, editingVideoIndex as number);
//       alert('Tutorial deleted successfully');
//       // router.push('/customer-management/user/user-list');
//     } catch (error) {
//       console.error('Failed to delete tutorial:', error);
//     }
//   };


//    const handleDelete = async () => {
//     const confirmDelete = confirm('Are you sure you want to delete this certificate?');
//     if (!confirmDelete) return;

//     try {
//       await deleteCertificate(id as string);
//       alert('Certificate deleted successfully');
//       // router.push('/customer-management/user/user-list');
//     } catch (error) {
//       console.error('Failed to delete certificate:', error);
//     }
//   };

//   if (!certificate) return <p>Loading...</p>;

//   return (
//     <div className="space-y-6">
//       <PageBreadcrumb pageTitle="Tutorial Detail" />

//       <div className="flex justify-between items-center">
//         <h1 className="text-2xl font-semibold text-gray-800">Training Tutorial: {certificate.name}</h1>
//         <button
//           onClick={handleDelete}
//           className="text-red-500 border border-red-500 rounded-md p-2 hover:bg-red-500 hover:text-white"
//         >
//           <TrashBinIcon />
//         </button>
//       </div>

//       <div className="border p-4 rounded-md shadow-sm">
//         <h2 className="text-lg font-medium mb-2">Image</h2>
//         {certificate.imageUrl ? (
//           <Image
//             src={certificate.imageUrl}
//             alt={certificate.name}
//             width={200}
//             height={200}
//             className="rounded"
//           />
//         ) : (
//           <p>No image available</p>
//         )}
//       </div>

//        <h1 className="text-2xl font-semibold text-gray-800">Training Tutorial Description: {certificate.description}</h1>

//      <div className="border p-4 rounded-md shadow-sm">
//   <h2 className="text-lg font-medium mb-4">Videos</h2>
//   {certificate.video && certificate.video.length > 0 ? (
//     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
//       {certificate.video.map((vid: any, index: number) => (
//         <div key={index} className="border rounded-md p-4 shadow-sm flex flex-col justify-between">
//            <h2>Video : {index+1}</h2>
//           <div className="space-y-2">
//             {/* Video preview or link */}
//             {vid.videoUrl ? (
//               <video
//                 src={vid.videoUrl}
//                 controls
//                 className="w-full h-40 object-cover rounded-md"
//               />
//             ) : (
//               <div className="w-full h-40 bg-gray-100 flex items-center justify-center text-sm text-gray-500 rounded-md">
//                 No video file
//               </div>
//             )}

//             {/* Title */}
//             <p className="text-sm"><strong>Name:</strong> {vid.videoName || 'N/A'}</p>

//             {/* Description */}
//             <p className="text-sm"><strong>Description:</strong> {vid.videoDescription || 'N/A'}</p>
//           </div>

//           {/* Action buttons */}
//           <div className="flex justify-between items-center mt-4">
//             <button className="bg-blue-500 text-white text-sm px-4 py-1 rounded hover:bg-blue-600" 
//               onClick={() => handleUpdateVideo(certificate._id,index)} >
//               Update
//             </button>
//             <button className="bg-red-500 text-white text-sm px-4 py-1 rounded hover:bg-red-600"
//               onClick={() => handleDeleteVideo(index)}>
//               Delete
//             </button>
//           </div>
//         </div>
//       ))}
//     </div>
//   ) : (
//     <p>No video details available</p>
//   )}
// </div>



//       <Link href={`/academy/certifications/`} passHref>
//                                    <Button onClick={() => router.back()} className="mt-4">Back</Button>
//                               </Link>

//       <Modal isOpen={isOpen} onClose={closeModal} className="max-w-[700px] m-4">
//         <div className="no-scrollbar relative w-full max-w-[700px] overflow-y-auto rounded-3xl bg-white p-4 dark:bg-gray-900 lg:p-11">
//           <div className="px-2 pr-14">
//             <h4 className="mb-5 text-2xl font-semibold text-gray-800 dark:text-white/90">
//               Edit Tutorial Information
//             </h4>
//           </div>

//           <form className="flex flex-col">
//             <div className="custom-scrollbar h-[400px] overflow-y-auto px-2 pb-3">
//               <div className="grid grid-cols-1 gap-x-6 gap-y-5">
//                  <div>
//                   <Label>Tutorial Video Name</Label>
//                   <Input
//                     type="text"
//                     value={newVideos[0].name}
//                     placeholder="Enter Video Name"
//                     onChange={(e) => setNewVideos([{ ...newVideos[0], name: e.target.value }])}
//                   />
//                 </div>

//                 <div>
//                   <Label>Tutorial Video Description</Label>
//                   <Input
//                     type="text"
//                     value={newVideos[0].description}
//                     placeholder="Enter Video Description"
//                     onChange={(e) => setNewVideos([{ ...newVideos[0], description: e.target.value }])}
//                   />
//                 </div>

//                 <div>
//                   <Label htmlFor="videoFiles">Select Video File(s)</Label>
//                   <FileInput
//                     id="videoFiles"
//                     onChange={handleVideoFileChange}
//                     accept="video/*"
//                     multiple
//                   />
//                   {videoFiles.length > 0 && (
//                     <p className="text-sm text-gray-500 mt-1">
//                       Selected: {videoFiles.map((f) => f.name).join(', ')}
//                     </p>
//                   )}
//                   {currentVideoUrls.length > 0 && videoFiles.length === 0 && (
//                     <div className="mt-2">
//                       <Label>Current Video(s):</Label>
//                       {currentVideoUrls.map((url, i) => (
//                         <a
//                           key={i}
//                           href={url}
//                           target="_blank"
//                           rel="noopener noreferrer"
//                           className="text-blue-600 underline mr-2 block"
//                         >
//                           Video {i + 1}
//                         </a>
//                       ))}



//                     </div>
//                   )}
//                 </div>
//               </div>
//             </div>

//             <div className="flex items-center gap-3 px-2 mt-6 lg:justify-end">
//               <Button size="sm" variant="outline" onClick={closeModal}>
//                 Cancel
//               </Button>
//               <Button size="sm" onClick={handleUpdateData}>
//                 Save Changes
//               </Button>
//             </div>
//           </form>
//         </div>
//       </Modal>

//     </div>

//   );
// };

// export default CertificateDetailPage;






'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import axios from 'axios';

import { useModal } from '@/hooks/useModal';
import { Modal } from '@/components/ui/modal';
import FileInput from '@/components/form/input/FileInput';
import Input from '@/components/form/input/InputField';
import Label from '@/components/form/Label';
import Button from '@/components/ui/button/Button';
import PageBreadcrumb from '@/components/common/PageBreadCrumb';
import { TrashBinIcon } from '@/icons';

import { useCertificate } from '@/context/CertificationContext';


interface Video {
  videoName: string;
  videoDescription: string;
  videoUrl: string;
}

interface Certificate {
  _id: string;
  name: string;
  description: string;
  imageUrl: string;
  video: Video[];
}



const CertificateDetailPage: React.FC = () => {
  const { id } = useParams();
  const router = useRouter();

  /* context / modal */
  const { certificates, deleteCertificate, updateTutorial, deleteTutorial } =
    useCertificate();
  const { isOpen, openModal, closeModal } = useModal();

  /* local state */
  const [certificate, setCertificate] = useState<Certificate | null>(null);

  const [videoFiles, setVideoFiles] = useState<File[]>([]);
  const [currentVideoUrls, setCurrentVideoUrls] = useState<string[]>([]);
  const [editingVideoIndex, setEditingVideoIndex] = useState<number | null>(
    null,
  );

  const [newVideos, setNewVideos] = useState<
    { name: string; description: string; file: File | null }[]
  >([{ name: '', description: '', file: null }]);


  useEffect(() => {
    if (!id) return;
    const found = certificates.find((c) => c._id === id);
    if (found) setCertificate(found as Certificate);
  }, [id, certificates]);



  const handleUpdateVideo = (videoIdx: number) => {
    if (!certificate) return;
    const v = certificate.video[videoIdx];
    setEditingVideoIndex(videoIdx);
    setCurrentVideoUrls([v?.videoUrl || '']);
    setNewVideos([{ name: v?.videoName || '', description: v?.videoDescription || '', file: null }]);
    openModal();
  };

  const handleUpdateData = async () => {
    if (!certificate || editingVideoIndex === null) return;

    const fd = new FormData();
    fd.append('videoIndex', String(editingVideoIndex));
    fd.append('videoName', newVideos[0].name);
    fd.append('videoDescription', newVideos[0].description);
    if (newVideos[0].file) fd.append('videoFile', newVideos[0].file);

    try {
      await updateTutorial(certificate._id, fd);
      closeModal();
      setEditingVideoIndex(null);
      setVideoFiles([]);
      setNewVideos([{ name: '', description: '', file: null }]);

      /* refresh certificate info */
      const res = await axios.get(`/api/academy/tutorials/${certificate._id}`);
      setCertificate(res.data.data as Certificate);
    } catch (err) {
      console.error('Update error:', err);
    }
  };

  const handleDeleteVideo = async (videoIdx: number) => {
    if (!certificate) return;
    if (!confirm('Delete this video?')) return;

    try {
      await deleteTutorial(certificate._id, videoIdx);
      const res = await axios.get(`/api/academy/tutorials/${certificate._id}`);
      setCertificate(res.data.data as Certificate);
    } catch (err) {
      console.error('Delete video error:', err);
    }
  };

  const handleDeleteCertificate = async () => {
    if (!certificate) return;
    if (!confirm('Delete entire certificate?')) return;
    try {
      await deleteCertificate(certificate._id);
      router.back();
    } catch (err) {
      console.error('Delete certificate error:', err);
    }
  };

  /* add / update form helpers */
  const handleNewVideoChange = (key: 'name' | 'description' | 'file', value: string | File | null) =>
    setNewVideos([{ ...newVideos[0], [key]: value }]);


  if (!certificate) return <p className="p-4">Loading…</p>;

  return (
    <div className="space-y-6">
      <PageBreadcrumb pageTitle="Tutorial Detail" />

      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold">{certificate.name}</h1>
        <button
          onClick={handleDeleteCertificate}
          className="text-red-500 border border-red-500 rounded-md p-2 hover:bg-red-500 hover:text-white"
        >
          <TrashBinIcon />
        </button>
      </div>

      {/* Image */}
      <div className="border p-4 rounded-md shadow-sm">
        <h2 className="text-lg font-medium mb-2">Image</h2>
        {certificate.imageUrl ? (
          <Image
            src={certificate.imageUrl}
            alt={certificate.name}
            width={200}
            height={200}
            className="rounded"
          />
        ) : (
          <p>No image available</p>
        )}
      </div>

      {/* Description */}
      <p className="text-lg font-medium">
        Tutorial Description:&nbsp;
        <span className="font-normal">{certificate.description || 'N/A'}</span>
      </p>

      {/* Videos list */}
      <div className="border p-4 rounded-md shadow-sm">
        <h2 className="text-lg font-medium mb-4">Videos</h2>
        {certificate.video.length ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {certificate.video.map((v, idx) => (
              <div key={idx} className="border rounded-md p-4 shadow-sm flex flex-col gap-3">
                <h3 className="font-semibold">Video {idx + 1}</h3>

                {v.videoUrl ? (
                  // <video src={v.videoUrl} controls className="w-full h-40 object-cover rounded" />
                  <video controls className="w-full h-40 object-cover rounded" preload="metadata">
                    <source
                      src="https://ik.imagekit.io/hzyuadmua/tutorial-videos/YOUR_VIDEO.mp4?ik-gbp=no-transform"
                      type="video/mp4"
                    />
                    Your browser does not support the video tag.
                  </video>




                ) : (
                  <div className="w-full h-40 bg-gray-100 flex items-center justify-center rounded">
                    No video
                  </div>
                )}

                <p className="text-sm">
                  <strong>Name: </strong>
                  {v.videoName || 'N/A'}
                </p>
                <p className="text-sm">
                  <strong>Description: </strong>
                  {v.videoDescription || 'N/A'}
                </p>

                <div className="flex justify-between">
                  <button
                    className="bg-blue-500 text-white px-3 py-1 rounded text-sm"
                    onClick={() => handleUpdateVideo(idx)}
                  >
                    Update
                  </button>
                  <button
                    className="bg-red-500 text-white px-3 py-1 rounded text-sm"
                    onClick={() => handleDeleteVideo(idx)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p>No videos available</p>
        )}
      </div>

      <Link href="/academy/certifications" passHref>
        <Button className="mt-4" onClick={() => router.back()}>
          Back
        </Button>
      </Link>

      {/* ---------------- EDIT VIDEO MODAL --------------- */}
      <Modal isOpen={isOpen} onClose={closeModal} className="max-w-[700px] m-4">
        <div className="w-full max-w-[700px] overflow-y-auto rounded-3xl bg-white p-6 dark:bg-gray-900">
          <h4 className="text-2xl font-semibold mb-6">Edit Video</h4>

          <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
            <Label>Video Name</Label>
            <Input
              value={newVideos[0].name}
              onChange={(e) => handleNewVideoChange('name', e.target.value)}
            />

            <Label>Video Description</Label>
            <Input
              value={newVideos[0].description}
              onChange={(e) => handleNewVideoChange('description', e.target.value)}
            />

            <Label>Select New Video (optional)</Label>
            <FileInput
              accept="video/*"
              onChange={(e) => handleNewVideoChange('file', e.target.files?.[0] || null)}
            />

            {currentVideoUrls.length > 0 && !videoFiles.length && (
              <>
                <Label>Current Video</Label>
                <a
                  href={currentVideoUrls[0]}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 underline"
                >
                  View / Download
                </a>
              </>
            )}
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <Button variant="outline" onClick={closeModal}>
              Cancel
            </Button>
            <Button onClick={handleUpdateData}>Save Changes</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default CertificateDetailPage;
