// 'use client';

// import { useEffect, useState } from 'react';
// import { useParams, useRouter } from 'next/navigation';
// import Image from 'next/image';
// import axios from 'axios';
// import { useModal } from '@/hooks/useModal';
// import { Modal } from '@/components/ui/modal';
// import FileInput from '@/components/form/input/FileInput';
// import Input from '@/components/form/input/InputField';
// import Label from '@/components/form/Label';
// import { TrashBinIcon } from '@/icons';
// import { useWebinars } from '@/context/WebinarContext';
// import PageBreadcrumb from '@/components/common/PageBreadCrumb';
// import Button from '@/components/ui/button/Button';
// import Link from 'next/link';

// interface Video {
//   videoName: string;
//   videoDescription: string;
//   videoUrl: string;
// }

// interface Webinar {
//   _id: string;
//   name: string;
//   description: string;
//   imageUrl: string;
//   video: Video[];
// }

// const CertificateDetailPage = () => {
//   const { id } = useParams();
//   const router = useRouter();
//   const { isOpen, openModal, closeModal } = useModal();
//   const { webinars, deleteTutorial, updateTutorial, deleteWebinar } = useWebinars();

//   const [webinar, setWebinar] = useState<Webinar | null>(null);
//   const [videoFiles, setVideoFiles] = useState<File[]>([]);
//   const [currentVideoUrls, setCurrentVideoUrls] = useState<string[]>([]);
//   const [editingVideoIndex, setEditingVideoIndex] = useState<number | null>(null);
//   const [newVideos, setNewVideos] = useState([{ name: '', description: '', file: null as File | null }]);

//   useEffect(() => {
//     if (webinars && id) {
//       const selected = webinars.find((web) => web._id === id);
//       if (selected) {
//         setWebinar(selected);
//       }
//     }
//   }, [id, webinars]);

//   const handleVideoFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
//     const files = Array.from(event.target.files || []);
//     setVideoFiles(files);
//   };

//   const handleUpdateVideo = (webinarId: string, videoIndex: number) => {
//     const selectedWebinar = webinars.find(item => item._id === webinarId);
//     if (selectedWebinar) {
//       const videoToEdit = selectedWebinar.video?.[videoIndex];
//       setEditingVideoIndex(videoIndex);
//       setCurrentVideoUrls([videoToEdit?.videoUrl || '']);
//       setNewVideos([{
//         name: videoToEdit?.videoName || '',
//         description: videoToEdit?.videoDescription || '',
//         file: null
//       }]);
//       openModal();
//     }
//   };

//   const handleUpdateData = async () => {
//     const editingWebinarId = webinar?._id;
//     if (!editingWebinarId || editingVideoIndex === null) return;

//     const formData = new FormData();
//     formData.append('videoIndex', editingVideoIndex.toString());
//     formData.append('videoName', newVideos[0].name);
//     formData.append('videoDescription', newVideos[0].description);
//     if (newVideos[0].file) {
//       formData.append('videoFile', newVideos[0].file);
//     }

//     try {
//       await updateTutorial(editingWebinarId, formData);
//       alert('Webinar updated successfully');
//       closeModal();
//       setEditingVideoIndex(null);
//       setNewVideos([{ name: '', description: '', file: null }]);
//       setVideoFiles([]);
//       const response = await axios.get(`/api/academy/webinar-tutorials/${editingWebinarId}`);
//       setWebinar(response.data.data);
//     } catch (error) {
//       console.error('Error updating webinar:', error);
//     }
//   };

//   const handleDeleteVideo = async (videoIndex: number) => {
//     const confirmDelete = confirm('Are you sure you want to delete this webinar?');
//     if (!confirmDelete) return;

//     try {
//       await deleteTutorial(id as string, videoIndex);
//       alert('Webinar deleted successfully');
//     } catch (error) {
//       console.error('Failed to delete webinar:', error);
//     }
//   };

//   const handleDelete = async () => {
//     const confirmDelete = confirm('Are you sure you want to delete this certificate?');
//     if (!confirmDelete) return;

//     try {
//       await deleteWebinar(id as string);
//       alert('Webinar deleted successfully');
//     } catch (error) {
//       console.error('Failed to delete webinar:', error);
//     }
//   };

//   if (!webinar) return <p>Loading...</p>;

//   return (
//     <div className="space-y-6">
//       <PageBreadcrumb pageTitle="Webinar Detail" />

//       <div className="flex justify-between items-center">
//         <h1 className="text-2xl font-semibold text-gray-800">Training Webinar: {webinar.name}</h1>
//         <button
//           onClick={handleDelete}
//           className="text-red-500 border border-red-500 rounded-md p-2 hover:bg-red-500 hover:text-white"
//         >
//           <TrashBinIcon />
//         </button>
//       </div>

//       <div className="border p-4 rounded-md shadow-sm">
//         <h2 className="text-lg font-medium mb-2">Image</h2>
//         {webinar.imageUrl ? (
//           <Image
//             src={webinar.imageUrl}
//             alt={webinar.name}
//             width={200}
//             height={200}
//             className="rounded"
//           />
//         ) : (
//           <p>No image available</p>
//         )}
//       </div>

//       <h1 className="text-2xl font-semibold text-gray-800">
//         Training Webinar Description: {webinar.description}
//       </h1>

//       <div className="border p-4 rounded-md shadow-sm">
//         <h2 className="text-lg font-medium mb-4">Videos</h2>
//         {webinar.video && webinar.video.length > 0 ? (
//           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
//             {webinar.video.map((vid, index) => (
//               <div key={index} className="border rounded-md p-4 shadow-sm flex flex-col justify-between">
//                 <h2>Video : {index + 1}</h2>
//                 <div className="space-y-2">
//                   {vid.videoUrl ? (
//                     <video
//                       src={vid.videoUrl}
//                       controls
//                       className="w-full h-40 object-cover rounded-md"
//                     />
//                   ) : (
//                     <div className="w-full h-40 bg-gray-100 flex items-center justify-center text-sm text-gray-500 rounded-md">
//                       No video file
//                     </div>
//                   )}
//                   <p className="text-sm"><strong>Name:</strong> {vid.videoName || 'N/A'}</p>
//                   <p className="text-sm"><strong>Description:</strong> {vid.videoDescription || 'N/A'}</p>
//                 </div>
//                 <div className="flex justify-between items-center mt-4">
//                   <button
//                     className="bg-blue-500 text-white text-sm px-4 py-1 rounded hover:bg-blue-600"
//                     onClick={() => handleUpdateVideo(webinar._id, index)}
//                   >
//                     Update
//                   </button>
//                   <button
//                     className="bg-red-500 text-white text-sm px-4 py-1 rounded hover:bg-red-600"
//                     onClick={() => handleDeleteVideo(index)}
//                   >
//                     Delete
//                   </button>
//                 </div>
//               </div>
//             ))}
//           </div>
//         ) : (
//           <p>No video details available</p>
//         )}
//       </div>

//       <Link href={`/academy/webinars/`} passHref>
//         <Button onClick={() => router.back()} className="mt-4">Back</Button>
//       </Link>

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
//                 <div>
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

import { useWebinars } from '@/context/WebinarContext'; // This context is for Webinars
import { PlusCircle } from 'lucide-react';

// Define types for clarity
interface Video {
  videoName: string;
  videoDescription: string;
  videoUrl: string;
}

interface Webinar {
  _id: string;
  name: string;
  description: string;
  imageUrl: string;
  video: Video[];
}

// Renamed the component to WebinarDetailPage for clarity
const WebinarDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  /* context / modal */
  // Keeping original context method names: deleteTutorial (for video), updateTutorial (for video), deleteWebinar (for main webinar)
  const { webinars, deleteTutorial, updateTutorial, deleteWebinar } = useWebinars();
  const { isOpen, openModal, closeModal } = useModal();

  /* local state */
  const [webinar, setWebinar] = useState<Webinar | null>(null);
  const [isLoading, setIsLoading] = useState(true); // Add loading state
  const [error, setError] = useState<string | null>(null); // Add error state

  // Removed videoFiles state as it was not actively used in the modal's update logic
  const [currentVideoUrls, setCurrentVideoUrls] = useState<string[]>([]);
  const [editingVideoIndex, setEditingVideoIndex] = useState<number | null>(null);

  const [newVideos, setNewVideos] = useState<
    { name: string; description: string; file: File | null }[]
  >([{ name: '', description: '', file: null }]);


  // Callback to fetch webinar details
  const loadWebinarDetails = useCallback(async () => {
    if (!id) {
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      // First, try to find in context (if already loaded)
      const found = webinars.find((w) => w._id === id);
      if (found) {
        setWebinar(found as Webinar);
      } else {
        // If not found in context, fetch from API (useful on direct URL access/refresh)
        // Assuming the API endpoint for fetching a single webinar by ID is /api/academy/webinar-tutorials/[id]
        const res = await axios.get(`/api/academy/webinar-tutorials/${id}`);
        console.log('Webinar details fetched:', res.data.data);
        setWebinar(res.data.data as Webinar);
      }
    } catch (err: unknown) {
      console.error('Failed to fetch webinar details:', err);
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.message || 'Failed to load webinar details.');
      } else if (err instanceof Error) {
        setError(err.message || 'An unexpected error occurred.');
      } else {
        setError('An unknown error occurred.');
      }
    } finally {
      setIsLoading(false);
    }
  }, [id, webinars]); // Add webinars to dependency array

  useEffect(() => {
    loadWebinarDetails();
  }, [loadWebinarDetails]);





  const handleUpdateVideo = (videoIdx: number) => {
    if (!webinar) return;
    const v = webinar.video[videoIdx];
    setEditingVideoIndex(videoIdx);
    setCurrentVideoUrls([v?.videoUrl || '']);
    setNewVideos([{ name: v?.videoName || '', description: v?.videoDescription || '', file: null }]);
    openModal();
  };

  const handleUpdateData = async () => {
    if (!webinar || editingVideoIndex === null) return;

    const fd = new FormData();
    fd.append('videoIndex', String(editingVideoIndex));
    fd.append('videoName', newVideos[0].name);
    fd.append('videoDescription', newVideos[0].description);
    if (newVideos[0].file) fd.append('videoFile', newVideos[0].file);

    try {
      // Using updateTutorial from useWebinars context for video updates
      await updateTutorial(webinar._id, fd);
      closeModal();
      setEditingVideoIndex(null);
      // setVideoFiles([]); // Not used for single video update
      setNewVideos([{ name: '', description: '', file: null }]);

      /* refresh webinar info */
      loadWebinarDetails(); // Re-fetch to update UI
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
    if (!webinar) return;
    // IMPORTANT: Replace window.confirm with a custom modal for better UX and consistency
    if (!window.confirm('Are you sure you want to delete this video?')) return;

    try {
      // Using deleteTutorial from useWebinars context for video deletion
      await deleteTutorial(id as string, videoIdx);
      loadWebinarDetails(); // Refresh webinar info after deletion
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

  const handleDeleteWebinar = async () => { // Renamed from handleDelete to handleDeleteWebinar
    if (!webinar) return;
    // IMPORTANT: Replace window.confirm with a custom modal for better UX and consistency
    if (!window.confirm('Are you sure you want to delete this entire webinar?')) return;

    try {
      // Using deleteWebinar from useWebinars context for main webinar deletion
      await deleteWebinar(id as string);
      alert('Webinar deleted successfully!');
      router.back(); // Navigate back after successful deletion
    } catch (err: unknown) {
      console.error('Delete webinar error:', err);
      if (axios.isAxiosError(err)) {
        alert(err.response?.data?.message || 'Error deleting webinar.');
      } else {
        alert('An unexpected error occurred during webinar deletion.');
      }
    }
  };

  /* add / update form helpers */
  const handleNewVideoChange = (key: 'name' | 'description' | 'file', value: string | File | null) =>
    setNewVideos([{ ...newVideos[0], [key]: value }]);


  if (isLoading) return <p className="p-8 text-center text-gray-600">Loading webinar details...</p>;
  if (error) return <p className="p-8 text-center text-red-600">Error: {error}</p>;
  if (!webinar) return <p className="p-8 text-center text-gray-600">Webinar not found.</p>;

  return (
    <div className="min-h-screen  p-6 sm:p-8 md:p-10 font-sans">
      <PageBreadcrumb pageTitle="Webinar Detail" />

      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 p-6 sm:p-8 ">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-black mb-4 sm:mb-0">
          Training Webinar: {webinar.name}
        </h1>

        <button onClick={handleDeleteWebinar} className="text-red-500 border border-red-500 rounded-md p-2 hover:bg-red-500 hover:text-white hover:border-red-500">
          <TrashBinIcon />
        </button>
      </div>

      {/* Main Info Card (Image and Description) */}
      <div className=" p-6 sm:p-8 rounded-3xl shadow-sm border-red-200 mb-8 flex flex-col md:flex-row items-center md:items-start gap-6 md:gap-8">
        {/* Image on Left */}
        <div className="flex-shrink-0 w-full md:w-2/5 lg:w-1/3 relative overflow-hidden rounded-2xl shadow-xl">
          {webinar.imageUrl ? (
            <Image
              src={webinar.imageUrl}
              alt={webinar.name}
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
            Webinar Description:
          </h2>
          <p className="text-base sm:text-lg leading-relaxed text-gray-700">
            {webinar.description || 'No description provided.'}
          </p>
        </div>
      </div>

      {/* Videos List Section */}
      <div className=" p-6 sm:p-8 mb-8">
        <h2 className="text-2xl sm:text-3xl font-bold text-black mb-6 pb-4 border-blue-200">Webinar Videos</h2>
        {webinar.video && webinar.video.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {webinar.video.map((vid, index) => (
              <div key={index} className="border border-blue-100  p-5 rounded-lg flex flex-col gap-4 bg-white hover:shadow-xl hover:border-blue-300 transition-all duration-300">
                <h3 className="text-lg font-semibold text-gray-800">Video {index + 1}: {vid.videoName || 'Untitled Video'}</h3>

                {vid.videoUrl ? (
                  <video controls className="w-full h-56 object-cover rounded-lg border border-blue-300" preload="metadata">
                    <source src={vid.videoUrl} type="video/mp4" />
                    Your browser does not support the video tag.
                  </video>
                ) : (
                  <div className="w-full h-56 bg-gray-200 rounded-lg flex items-center justify-center text-gray-600 text-md">
                    Video Not Available
                  </div>
                )}

                <p className="text-sm text-gray-700">
                  <strong>Description: </strong>
                  {vid.videoDescription || 'No description.'}
                </p>


                <div className="flex gap-2">
                  <button
                    onClick={() => handleUpdateVideo(index)}
                    className="text-yellow-500 border border-yellow-500 rounded-md p-2 hover:bg-yellow-500 hover:text-white"
                    aria-label="Edit"
                  >
                    <PlusCircle size={16} />
                  </button>
                  <button
                    onClick={() => handleDeleteVideo(index)}
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
          <p className="text-center text-gray-600 text-lg py-8">No webinar videos available for this webinar.</p>
        )}
      </div>


      <Link href="/academy/webinars" passHref>

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

            {currentVideoUrls.length > 0 && !newVideos[0].file && ( // Check newVideos[0].file instead of videoFiles.length
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

export default WebinarDetailPage;
