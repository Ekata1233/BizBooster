// 'use client';

// import { useEffect, useState } from 'react';
// import { useParams, useRouter } from 'next/navigation';
// import Image from 'next/image';
// import Link from 'next/link';
// import axios from 'axios';

// import { useModal } from '@/hooks/useModal';
// import { Modal } from '@/components/ui/modal';
// import FileInput from '@/components/form/input/FileInput';
// import Input from '@/components/form/input/InputField';
// import Label from '@/components/form/Label';
// import Button from '@/components/ui/button/Button';
// import PageBreadcrumb from '@/components/common/PageBreadCrumb';
// import { TrashBinIcon } from '@/icons';

// import { useCertificate } from '@/context/CertificationContext';


// interface Video {
//   videoName: string;
//   videoDescription: string;
//   videoUrl: string;
// }

// interface Certificate {
//   _id: string;
//   name: string;
//   description: string;
//   imageUrl: string;
//   video: Video[];
// }



// const CertificateDetailPage: React.FC = () => {
//   const { id } = useParams();
//   const router = useRouter();

//   /* context / modal */
//   const { certificates, deleteCertificate, updateTutorial, deleteTutorial } =
//     useCertificate();
//   const { isOpen, openModal, closeModal } = useModal();

//   /* local state */
//   const [certificate, setCertificate] = useState<Certificate | null>(null);

//   const [videoFiles, setVideoFiles] = useState<File[]>([]);
//   const [currentVideoUrls, setCurrentVideoUrls] = useState<string[]>([]);
//   const [editingVideoIndex, setEditingVideoIndex] = useState<number | null>(
//     null,
//   );

//   const [newVideos, setNewVideos] = useState<
//     { name: string; description: string; file: File | null }[]
//   >([{ name: '', description: '', file: null }]);


//   useEffect(() => {
//     if (!id) return;
//     const found = certificates.find((c) => c._id === id);
//     if (found) setCertificate(found as Certificate);
//   }, [id, certificates]);



//   const handleUpdateVideo = (videoIdx: number) => {
//     if (!certificate) return;
//     const v = certificate.video[videoIdx];
//     setEditingVideoIndex(videoIdx);
//     setCurrentVideoUrls([v?.videoUrl || '']);
//     setNewVideos([{ name: v?.videoName || '', description: v?.videoDescription || '', file: null }]);
//     openModal();
//   };

//   const handleUpdateData = async () => {
//     if (!certificate || editingVideoIndex === null) return;

//     const fd = new FormData();
//     fd.append('videoIndex', String(editingVideoIndex));
//     fd.append('videoName', newVideos[0].name);
//     fd.append('videoDescription', newVideos[0].description);
//     if (newVideos[0].file) fd.append('videoFile', newVideos[0].file);

//     try {
//       await updateTutorial(certificate._id, fd);
//       closeModal();
//       setEditingVideoIndex(null);
//       setVideoFiles([]);
//       setNewVideos([{ name: '', description: '', file: null }]);

//       /* refresh certificate info */
//       const res = await axios.get(`/api/academy/tutorials/${certificate._id}`);
//       setCertificate(res.data.data as Certificate);
//     } catch (err) {
//       console.error('Update error:', err);
//     }
//   };

//   const handleDeleteVideo = async (videoIdx: number) => {
//     if (!certificate) return;
//     if (!confirm('Delete this video?')) return;

//     try {
//       await deleteTutorial(certificate._id, videoIdx);
//       const res = await axios.get(`/api/academy/tutorials/${certificate._id}`);
//       setCertificate(res.data.data as Certificate);
//     } catch (err) {
//       console.error('Delete video error:', err);
//     }
//   };

//   const handleDeleteCertificate = async () => {
//     if (!certificate) return;
//     if (!confirm('Delete entire certificate?')) return;
//     try {
//       await deleteCertificate(certificate._id);
//       router.back();
//     } catch (err) {
//       console.error('Delete certificate error:', err);
//     }
//   };

//   /* add / update form helpers */
//   const handleNewVideoChange = (key: 'name' | 'description' | 'file', value: string | File | null) =>
//     setNewVideos([{ ...newVideos[0], [key]: value }]);


//   if (!certificate) return <p className="p-4">Loading…</p>;

//   return (
//     <div className="space-y-6">
//       <PageBreadcrumb pageTitle="Tutorial Detail" />

//       <div className="flex justify-between items-center">
//         <h1 className="text-2xl font-semibold">{certificate.name}</h1>
//         <button
//           onClick={handleDeleteCertificate}
//           className="text-red-500 border border-red-500 rounded-md p-2 hover:bg-red-500 hover:text-white"
//         >
//           <TrashBinIcon />
//         </button>
//       </div>

//       {/* Image */}
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

//       {/* Description */}
//       <p className="text-lg font-medium">
//         Tutorial Description:&nbsp;
//         <span className="font-normal">{certificate.description || 'N/A'}</span>
//       </p>

//       {/* Videos list */}
//       <div className="border p-4 rounded-md shadow-sm">
//         <h2 className="text-lg font-medium mb-4">Videos</h2>
//         {certificate.video.length ? (
//           <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
//             {certificate.video.map((v, idx) => (
//               <div key={idx} className="border rounded-md p-4 shadow-sm flex flex-col gap-3">
//                 <h3 className="font-semibold">Video {idx + 1}</h3>

//                 {v.videoUrl ? (
//                   // <video src={v.videoUrl} controls className="w-full h-40 object-cover rounded" />
//                   <video controls className="w-full h-40 object-cover rounded" preload="metadata">
//                     <source
//                       src="https://ik.imagekit.io/hzyuadmua/tutorial-videos/YOUR_VIDEO.mp4?ik-gbp=no-transform"
//                       type="video/mp4"
//                     />
//                     Your browser does not support the video tag.
//                   </video>




//                 ) : (
//                   <div className="w-full h-40 bg-gray-100 flex items-center justify-center rounded">
//                     No video
//                   </div>
//                 )}

//                 <p className="text-sm">
//                   <strong>Name: </strong>
//                   {v.videoName || 'N/A'}
//                 </p>
//                 <p className="text-sm">
//                   <strong>Description: </strong>
//                   {v.videoDescription || 'N/A'}
//                 </p>

//                 <div className="flex justify-between">
//                   <button
//                     className="bg-blue-500 text-white px-3 py-1 rounded text-sm"
//                     onClick={() => handleUpdateVideo(idx)}
//                   >
//                     Update
//                   </button>
//                   <button
//                     className="bg-red-500 text-white px-3 py-1 rounded text-sm"
//                     onClick={() => handleDeleteVideo(idx)}
//                   >
//                     Delete
//                   </button>
//                 </div>
//               </div>
//             ))}
//           </div>
//         ) : (
//           <p>No videos available</p>
//         )}
//       </div>

//       <Link href="/academy/certifications" passHref>
//         <Button className="mt-4" onClick={() => router.back()}>
//           Back
//         </Button>
//       </Link>

//       {/* ---------------- EDIT VIDEO MODAL --------------- */}
//       <Modal isOpen={isOpen} onClose={closeModal} className="max-w-[700px] m-4">
//         <div className="w-full max-w-[700px] overflow-y-auto rounded-3xl bg-white p-6 dark:bg-gray-900">
//           <h4 className="text-2xl font-semibold mb-6">Edit Video</h4>

//           <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
//             <Label>Video Name</Label>
//             <Input
//               value={newVideos[0].name}
//               onChange={(e) => handleNewVideoChange('name', e.target.value)}
//             />

//             <Label>Video Description</Label>
//             <Input
//               value={newVideos[0].description}
//               onChange={(e) => handleNewVideoChange('description', e.target.value)}
//             />

//             <Label>Select New Video (optional)</Label>
//             <FileInput
//               accept="video/*"
//               onChange={(e) => handleNewVideoChange('file', e.target.files?.[0] || null)}
//             />

//             {currentVideoUrls.length > 0 && !videoFiles.length && (
//               <>
//                 <Label>Current Video</Label>
//                 <a
//                   href={currentVideoUrls[0]}
//                   target="_blank"
//                   rel="noopener noreferrer"
//                   className="text-blue-600 underline"
//                 >
//                   View / Download
//                 </a>
//               </>
//             )}
//           </div>

//           <div className="flex justify-end gap-3 mt-6">
//             <Button variant="outline" onClick={closeModal}>
//               Cancel
//             </Button>
//             <Button onClick={handleUpdateData}>Save Changes</Button>
//           </div>
//         </div>
//       </Modal>
//     </div>
//   );
// };

// export default CertificateDetailPage;




'use client';

import { useEffect, useState, useCallback } from 'react';
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
import { TrashBinIcon } from '@/icons'; // Assuming this is a custom SVG/React component for the trash bin

import { useCertificate } from '@/context/CertificationContext'; // Assuming this context exists
import { PlusCircle } from 'lucide-react';

// Define types for clarity
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
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  /* context / modal */
  // Renamed deleteTutorial to deleteVideoInCertificate for clarity, assuming it's for sub-documents
  const { certificates, deleteCertificate, updateTutorial: updateCertificateTutorial, deleteTutorial: deleteVideoInCertificate } = useCertificate();
  const { isOpen, openModal, closeModal } = useModal();

  /* local state */
  const [certificate, setCertificate] = useState<Certificate | null>(null);
  const [isLoading, setIsLoading] = useState(true); // Add loading state
  const [error, setError] = useState<string | null>(null); // Add error state

  const [videoFiles,] = useState<File[]>([]); // This state seems unused for current video logic
  const [currentVideoUrls, setCurrentVideoUrls] = useState<string[]>([]);
  const [editingVideoIndex, setEditingVideoIndex] = useState<number | null>(null);

  const [newVideos, setNewVideos] = useState<
    { name: string; description: string; file: File | null }[]
  >([{ name: '', description: '', file: null }]);


  // Callback to fetch certificate details
  const loadCertificateDetails = useCallback(async () => {
    if (!id) {
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      // First, try to find in context (if already loaded)
      const found = certificates.find((c) => c._id === id);
      if (found) {
        setCertificate(found as Certificate);
      } else {
        // If not found in context, fetch from API (useful on direct URL access/refresh)
        const res = await axios.get(`/api/academy/tutorials/${id}`);
        setCertificate(res.data.data as Certificate);
      }
    } catch (err: unknown) {
      console.error('Failed to fetch certificate details:', err);
      // More robust error handling for axios errors
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.message || 'Failed to load certificate details.');
      } else if (err instanceof Error) {
        setError(err.message || 'An unexpected error occurred.');
      } else {
        setError('An unknown error occurred.');
      }
    } finally {
      setIsLoading(false);
    }
  }, [id, certificates]); // Add certificates to dependency array

  useEffect(() => {
    loadCertificateDetails();
  }, [loadCertificateDetails]);


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
      // Use the correct update function from context
      await updateCertificateTutorial(certificate._id, fd);
      closeModal();
      setEditingVideoIndex(null);
      // setVideoFiles([]); // This state seems unused for current video logic
      setNewVideos([{ name: '', description: '', file: null }]);

      /* refresh certificate info */
      loadCertificateDetails(); // Re-fetch to update UI
      alert('Video updated successfully!');
    } catch (err: unknown) { // Use unknown for error type
      if (axios.isAxiosError(err)) {
        console.error('Update error:', err.response?.data || err);
        alert(err.response?.data?.message || 'Error updating video.');
      } else {
        console.error('Update error:', err);
        alert('An unexpected error occurred during video update.');
      }
    }
  };

  const handleDeleteVideo = async (videoIdx: number) => {
    if (!certificate) return;
    // IMPORTANT: Replace window.confirm with a custom modal for better UX and consistency
    if (!window.confirm('Are you sure you want to delete this video?')) return;

    try {
      // Use the correct delete function from context
      await deleteVideoInCertificate(certificate._id, videoIdx);
      loadCertificateDetails(); // Refresh certificate info after deletion
      alert('Video deleted successfully!');
    } catch (err: unknown) {
      console.error('Delete video error:', err);
      if (axios.isAxiosError(err)) {
        alert(err.response?.data?.message || 'Error deleting video.');
      } else {
        alert('An unexpected error occurred during video deletion.');
      }
    }
  };

  const handleDeleteCertificate = async () => {
    if (!certificate) return;
    // IMPORTANT: Replace window.confirm with a custom modal for better UX and consistency
    if (!window.confirm('Are you sure you want to delete this entire certificate?')) return;

    try {
      await deleteCertificate(certificate._id);
      alert('Certificate deleted successfully!');
      router.back(); // Navigate back after successful deletion
    } catch (err: unknown) {
      console.error('Delete certificate error:', err);
      if (axios.isAxiosError(err)) {
        alert(err.response?.data?.message || 'Error deleting certificate.');
      } else {
        alert('An unexpected error occurred during certificate deletion.');
      }
    }
  };

  /* add / update form helpers */
  const handleNewVideoChange = (key: 'name' | 'description' | 'file', value: string | File | null) =>
    setNewVideos([{ ...newVideos[0], [key]: value }]);


  if (isLoading) return <p className="p-8 text-center text-gray-600">Loading certificate details...</p>;
  if (error) return <p className="p-8 text-center text-red-600">Error: {error}</p>;
  if (!certificate) return <p className="p-8 text-center text-gray-600">Certificate not found.</p>;

  return (
    <div className="min-h-screen bg-white p-6 sm:p-8 md:p-10 font-sans">
      <PageBreadcrumb pageTitle="Tutorial Detail" />

      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8  p-6 sm:p-8 ">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-black mb-4 sm:mb-0">
          {certificate.name}
        </h1>
        {/* <Button
          onClick={handleDeleteCertificate}
          className="bg-gradient-to-r from-red-500 to-red-700 text-white px-6 py-3 rounded-full shadow-lg hover:from-red-600 hover:to-red-800 transition-all duration-300 flex items-center space-x-3 text-lg font-semibold"
        >
          <TrashBinIcon className="w-5 h-5" />
         
        </Button> */}
        <button onClick={handleDeleteCertificate} className="text-red-500 border border-red-500 rounded-md p-2 hover:bg-red-500 hover:text-white hover:border-red-500">
          <TrashBinIcon />
        </button>
      </div>

      {/* Main Info Card (Image and Description) */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-sm mb-8 flex flex-col md:flex-row items-center md:items-start gap-6 md:gap-8">
        {/* Image on Left */}
        <div className="flex-shrink-0 w-full md:w-2/5 lg:w-1/3 relative overflow-hidden rounded-2xl shadow-xl">
          {certificate.imageUrl ? (
            <Image
              src={certificate.imageUrl}
              alt={certificate.name}
              width={600} // Adjusted for better quality/display
              height={350} // Adjusted height
              className="rounded-2xl object-cover w-full h-auto shadow-sm transform transition-transform duration-300 hover:scale-105"
            />
          ) : (
            <div className="w-full h-48 md:h-60 bg-gray-100 rounded-2xl flex items-center justify-center text-gray-500 text-lg">
              No Image Available
            </div>
          )}
        </div>

        {/* Data on Right, stacked */}
        <div className="flex-grow space-y-5 text-gray-800">
          <h2 className="text-2xl sm:text-3xl font-bold text-black leading-tight">
            {certificate.name}
          </h2>
          <p className="text-base sm:text-lg leading-relaxed text-gray-700">
            {certificate.description || 'No description provided.'}
          </p>
        </div>
      </div>

      {/* Videos List Section */}
      <div className=" p-6 sm:p-8   mb-8">
        <h2 className="text-2xl sm:text-3xl font-bold text-black mb-6 pb-4 ">Tutorial Videos</h2>
        {certificate.video.length ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {certificate.video.map((v, idx) => (
              <div key={idx} className="border border-blue-100 rounded-2xl p-5 shadow-md flex flex-col gap-4 bg-white hover:shadow-xl hover:border-blue-300 transition-all duration-300">
                <h3 className="text-lg font-semibold text-gray-800">Video {idx + 1}: {v.videoName || 'Untitled Video'}</h3>

                {v.videoUrl ? (
                  <video controls className="w-full h-56 object-cover rounded-lg border border-blue-300" preload="metadata">
                    <source src={v.videoUrl} type="video/mp4" />
                    Your browser does not support the video tag.
                  </video>
                ) : (
                  <div className="w-full h-56 bg-gray-200 rounded-lg flex items-center justify-center text-gray-600 text-md">
                    Video Not Available
                  </div>
                )}

                <p className="text-sm text-gray-700">
                  <strong>Description: </strong>
                  {v.videoDescription || 'No description.'}
                </p>



                <div className="flex gap-2">
                  <button
                    onClick={() => handleUpdateVideo(idx)}
                    className="text-yellow-500 border border-yellow-500 rounded-md p-2 hover:bg-yellow-500 hover:text-white"
                    aria-label="Edit"
                  >
                    <PlusCircle size={16} />
                  </button>
                  <button
                    onClick={() => handleDeleteVideo(idx)}
                    className="text-red-500 border border-red-500 rounded-md p-2 hover:bg-red-500 hover:text-white"
                    aria-label="Delete"
                  >
                    <TrashBinIcon />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-gray-600 text-lg py-8">No tutorial videos available for this certificate.</p>
        )}
      </div>


      <Link href="/academy/certifications" passHref>
        {/* <Button className="bg-gradient-to-r from-gray-600 to-gray-800 text-white px-8 py-4 rounded-full shadow-lg hover:from-gray-700 hover:to-gray-900 transition-all duration-300 text-lg font-semibold">
                Back to Webinars
              </Button> */}
        {/* <button
                className="text-white bg-black border border-violet-200 rounded-md px-3 py-1 hover:bg-violet-600 "
              >
                Back to Webinars
              </button> */}
        <Button variant="outline">Back</Button>
      </Link>

      {/* ---------------- EDIT VIDEO MODAL --------------- */}
      <Modal isOpen={isOpen} onClose={closeModal} className="max-w-3xl mx-auto p-8 bg-white rounded-3xl shadow-3xl">
        <div className="w-full">
          <h4 className="text-3xl sm:text-4xl font-extrabold text-blue-800 mb-10 text-center">Edit Video Information</h4>

          <div className="space-y-8 max-h-[75vh] overflow-y-auto pr-6"> {/* Added pr-6 for scrollbar, increased space-y */}
            <div>
              <Label htmlFor="videoName" className="text-gray-800 font-bold text-lg mb-3 block">Video Name</Label>
              <Input
                id="videoName"
                value={newVideos[0].name}
                onChange={(e) => handleNewVideoChange('name', e.target.value)}
                className="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-blue-500 focus:border-blue-500 transition-all text-lg"
                placeholder="Enter video name"
              />
            </div>

            <div>
              <Label htmlFor="videoDescription" className="text-gray-800 font-bold text-lg mb-3 block">Video Description</Label>
              <Input
                id="videoDescription"
                value={newVideos[0].description}
                onChange={(e) => handleNewVideoChange('description', e.target.value)}
                className="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-blue-500 focus:border-blue-500 transition-all text-lg"
                placeholder="Enter video description"
              />
            </div>

            <div>
              <Label htmlFor="newVideoFile" className="text-gray-800 font-bold text-lg mb-3 block">Select New Video File (optional)</Label>
              <FileInput
                id="newVideoFile"
                accept="video/*"
                onChange={(e) => handleNewVideoChange('file', e.target.files?.[0] || null)}
                className="w-full p-1 border-2 border-gray-200 rounded-xl focus:ring-blue-500 focus:border-blue-500 transition-all"
              />
            </div>

            {currentVideoUrls.length > 0 && !videoFiles.length && (
              <div className="bg-blue-50 border-2 border-blue-300 text-blue-900 p-5 rounded-xl flex items-center justify-between shadow-inner">
                <div>
                  <Label className="text-blue-800 font-semibold text-base mb-1">Current Video:</Label>
                  <a
                    href={currentVideoUrls[0]}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 underline hover:text-blue-800 transition-colors duration-200 text-base"
                  >
                    View / Download Current Video
                  </a>
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-end gap-5 mt-10 pt-6 border-t-2 border-gray-100">
            <Button
              variant="outline"
              onClick={closeModal}
              className="px-6 py-3 rounded-full text-gray-700 border border-gray-300 hover:bg-gray-100 transition-colors duration-200 text-lg font-semibold"
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpdateData}
              className="bg-gradient-to-r from-blue-600 to-blue-800 text-white px-6 py-3 rounded-full shadow-md hover:from-blue-700 hover:to-blue-900 transition-all duration-300 text-lg font-semibold"
            >
              Save Changes
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default CertificateDetailPage;
