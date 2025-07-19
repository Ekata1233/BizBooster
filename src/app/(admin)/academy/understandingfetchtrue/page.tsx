// 'use client';

// import { useEffect, useState } from 'react';
// import axios from 'axios';
// import { Modal } from '@/components/ui/modal';
// import Input from '@/components/form/input/InputField';
// import FileInput from '@/components/form/input/FileInput';
// import Label from '@/components/form/Label';
// import Button from '@/components/ui/button/Button';
// import { PlusCircle } from 'lucide-react';
// import { TrashBinIcon } from '@/icons';

// interface VideoItem {
//   fileName: string;
//   filePath: string;
// }
// interface Entry {
//   _id: string;
//   fullName: string;
//   videos: VideoItem[];
// }

// const UnderstandingPage = () => {
//   const [fullName, setFullName] = useState('');
//   const [videos, setVideos] = useState<File[]>([]);
//   const [entries, setEntries] = useState<Entry[]>([]);

//   const [isOpen, setIsOpen] = useState(false);
//   const [editEntryId, setEditEntryId] = useState<string | null>(null);
//   const [editVideoIdx, setEditVideoIdx] = useState<number | null>(null);
//   const [editName, setEditName] = useState('');
//   const [editFile, setEditFile] = useState<File | null>(null);

//   const openModal = (id: string, idx: number) => {
//     const entry = entries.find((e) => e._id === id);
//     if (!entry) return;
//     setEditEntryId(id);
//     setEditVideoIdx(idx);
//     setEditName(entry.fullName);
//     setEditFile(null); // Clear previous file selection
//     setIsOpen(true);
//   };

//   const closeModal = () => {
//     setIsOpen(false);
//     setEditEntryId(null);
//     setEditVideoIdx(null);
//     setEditFile(null);
//     setEditName(''); // Clear edit name as well
//   };

//   const fetchEntries = async () => {
//     try {
//       const res = await axios.get('/api/academy/understandingfetchtrue');
//       setEntries(res.data.data);
//     } catch (error) {
//       console.error('Error fetching entries:', error);
//       // Optionally, show an error message to the user
//       // alert('Failed to load entries. Please try again.');
//     }
//   };

//   useEffect(() => {
//     fetchEntries();
//   }, []);

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     if (!fullName || videos.length === 0) {
//       alert('Full Name and at least one video are required.');
//       return;
//     }

//     const fd = new FormData();
//     fd.append('fullName', fullName);
//     videos.forEach((v) => fd.append('videoUrl', v)); // Append each video file

//     try {
//       // Assuming your backend API at /api/academy/understandingfetchtrue (POST)
//       // will either create a new entry or append videos to an existing entry
//       // if 'fullName' matches.
//       await axios.post('/api/academy/understandingfetchtrue', fd);
//       setFullName('');
//       setVideos([]);
//       fetchEntries(); // Refresh the list of entries
//       alert('Entry submitted successfully!');
//     } catch (error) {
//       console.error('Error submitting entry:', error);
//       alert('Failed to submit entry. Please try again.');
//     }
//   };

//   const deleteVideo = async (entryId: string, idx: number) => {
//     if (!window.confirm('Are you sure you want to delete this video?')) return;
//     try {
//       // Assuming your backend API at /api/academy/understandingfetchtrue (DELETE)
//       // handles deleting a specific video by entryId and videoIndex.
//       await axios.delete(`/api/academy/understandingfetchtrue/${entryId}?videoIndex=${idx}`);
//       fetchEntries(); // Refresh the list of entries
//       alert('Video deleted successfully!');
//     } catch (error) {
//       console.error('Error deleting video:', error);
//       alert('Failed to delete video. Please try again.');
//     }
//   };

//   const saveEdit = async () => {
//     if (!editEntryId || editVideoIdx === null) {
//       alert('No entry selected for editing.');
//       return;
//     }

//     const fd = new FormData();
//     fd.append('fullName', editName); // Update the full name
//     fd.append('videoIndex', String(editVideoIdx)); // Specify which video to update

//     if (editFile) {
//       fd.append('videoUrl', editFile); // Only append if a new file is selected
//     } else {
//       // If no new file is selected, but the name is changed,
//       // the backend should handle updating just the name.
//       // This might require a specific flag or separate endpoint on the backend.
//       // For now, assuming backend can handle partial updates based on FormData.
//     }

//     try {
//       // Assuming your backend API at /api/academy/understandingfetchtrue (PUT)
//       // handles updating a specific video within an entry.
//       await axios.put(`/api/academy/understandingfetchtrue/${editEntryId}`, fd); // Removed videoIndex from URL, sending in FormData
//       closeModal();
//       fetchEntries(); // Refresh the list of entries
//       alert('Entry updated successfully!');
//     } catch (error) {
//       console.error('Error saving edit:', error);
//       alert('Failed to save changes. Please try again.');
//     }
//   };

//   // Flatten all videos from all entries into a single array for continuous display
//   const allVideosWithEntryInfo = entries.flatMap(entry =>
//     entry.videos.map(video => ({
//       ...video,
//       entryId: entry._id,
//       entryFullName: entry.fullName,
//     }))
//   );


//   return (
//     <div className="p-6 max-w-5xl mx-auto font-sans">
//       <h1 className="text-3xl font-bold mb-6 text-gray-800">Understanding FetchTrue</h1>

//       <form onSubmit={handleSubmit} className="mb-10 p-6 bg-white rounded-lg shadow-md space-y-5">
//         <div>
//           <Label htmlFor="fullName" className="text-gray-700 font-medium mb-1 block">Full Name</Label>
//           <Input
//             id="fullName"
//             type="text"
//             value={fullName}
//             onChange={(e) => setFullName(e.target.value)}
//             placeholder="Enter full name"
//             className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
//           />
//         </div>
//         <div>
//           <Label htmlFor="uploadVideos" className="text-gray-700 font-medium mb-1 block">Upload Videos</Label>
//           <FileInput
//             id="uploadVideos"
//             accept="video/*"
//             multiple
//             onChange={(e) => e.target.files && setVideos(Array.from(e.target.files))}
//             className="w-full p-2 border border-gray-300 rounded-md file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
//           />
//           {videos.length > 0 && (
//             <p className="text-sm text-gray-500 mt-2">Selected: {videos.map(f => f.name).join(', ')}</p>
//           )}
//         </div>
//         <Button
//           type="submit"
//           className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors duration-200 shadow-sm"
//         >
//           Submit
//         </Button>
//       </form>

//       <h2 className="text-2xl font-semibold mb-4 text-gray-800">Uploaded Entries</h2>

//       {allVideosWithEntryInfo.length === 0 && (
//         <p className="text-gray-600 text-center py-8">No entries uploaded yet.</p>
//       )}

//       {/* Single grid container for all videos */}
//       <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3"> {/* Reverted to original grid classes */}
//         {allVideosWithEntryInfo.map((vid, idx) => (
//           <div key={`${vid.entryId}-${idx}`} className="border rounded-md p-3 flex flex-col gap-2">
//             {/* Display the entry's full name for each video */}
//             <p className="font-medium">Full Name: {vid.entryFullName}</p>
//             <video controls className="w-full h-56 object-cover rounded"> {/* Reverted to original video height */}
//               <source src={vid.filePath} type="video/mp4" />
//               Your browser does not support the video tag.
//             </video>
//             {/* Keeping the file name display as it was in the continuous grid version */}
//             <p className="text-gray-700 text-sm font-medium">File: {vid.fileName}</p>

//             <div className="flex gap-2"> {/* Original button container flex and gap */}
//               <button
//                 onClick={() => openModal(vid.entryId, idx)}
//                 className="text-yellow-500 border border-yellow-500 rounded-md p-2 hover:bg-yellow-500 hover:text-white"
//                 aria-label="Edit"
//               >
//                 <PlusCircle size={16} />
//               </button>
//               <button
//                 onClick={() => deleteVideo(vid.entryId, idx)}
//                 className="text-red-500 border border-red-500 rounded-md p-2 hover:bg-red-500 hover:text-white"
//                 aria-label="Delete"
//               >
//                 <TrashBinIcon />
//               </button>
//             </div>
//           </div>
//         ))}
//       </div>

//       <Modal isOpen={isOpen} onClose={closeModal} className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
//         <div className="bg-white p-8 rounded-lg shadow-xl dark:bg-gray-900 w-full max-w-md">
//           <h3 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white">Update Video Entry</h3>
//           <div className="space-y-5">
//             <div>
//               <Label htmlFor="editName" className="text-gray-700 font-medium mb-1 block">Full Name (for entry)</Label>
//               <Input
//                 id="editName"
//                 type="text"
//                 value={editName}
//                 onChange={(e) => setEditName(e.target.value)}
//                 className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
//               />
//             </div>
//             <div>
//               <Label htmlFor="editFile" className="text-gray-700 font-medium mb-1 block">Replace Video (optional)</Label>
//               <FileInput
//                 id="editFile"
//                 accept="video/*"
//                 onChange={(e) => setEditFile(e.target.files?.[0] || null)}
//                 className="w-full p-3 border border-gray-300 rounded-md file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
//               />
//               {editFile && (
//                 <p className="text-sm text-gray-500 mt-2">Selected: {editFile.name}</p>
//               )}
//             </div>
//           </div>
//           <div className="flex justify-end gap-3 mt-8">
//             <Button
//               variant="outline"
//               onClick={closeModal}
//               type="button"
//               className="px-5 py-2 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-100 transition-colors"
//             >
//               Cancel
//             </Button>
//             <Button
//               onClick={saveEdit}
//               type="button"
//               className="bg-blue-600 text-white px-5 py-2 rounded-md hover:bg-blue-700 transition-colors"
//             >
//               Save Changes
//             </Button>
//           </div>
//         </div>
//       </Modal>
//     </div>
//   );
// };

// export default UnderstandingPage;






'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import { Modal } from '@/components/ui/modal';
import Input from '@/components/form/input/InputField';
import FileInput from '@/components/form/input/FileInput';
import Label from '@/components/form/Label';
import Button from '@/components/ui/button/Button';
import {PencilIcon} from 'lucide-react';
import { TrashBinIcon } from '@/icons';

interface VideoItem {
  fileName: string;
  filePath: string;
}

interface Entry {
  _id: string;
  fullName: string;
  videos: VideoItem[];
}

const UnderstandingPage = () => {
  const [fullName, setFullName] = useState('');
  const [videos, setVideos] = useState<File[]>([]);
  const [entries, setEntries] = useState<Entry[]>([]);

  const [isOpen, setIsOpen] = useState(false);
  const [editEntryId, setEditEntryId] = useState<string | null>(null);
  const [editVideoIdx, setEditVideoIdx] = useState<number | null>(null);
  const [editName, setEditName] = useState('');
  const [editFile, setEditFile] = useState<File | null>(null);
    
  const openModal = (id: string, idx: number) => {
    const entry = entries.find((e) => e._id === id);
    if (!entry) return;
    setEditEntryId(id);
    setEditVideoIdx(idx);
    setEditName(entry.fullName);
    setEditFile(null);
    setIsOpen(true);
  };

  const closeModal = () => {
    setIsOpen(false);
    setEditEntryId(null);
    setEditVideoIdx(null);
    setEditFile(null);
    setEditName('');
  };

  const fetchEntries = async () => {
    try {
      const res = await axios.get('/api/academy/understandingfetchtrue');
      setEntries(res.data.data);
    } catch (error) {
      console.error('Error fetching entries:', error);
    }
  };

  useEffect(() => {
    fetchEntries();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || videos.length === 0) {
      alert('Full Name and at least one video are required.');
      return;
    }

    const fd = new FormData();
    fd.append('fullName', fullName);
    videos.forEach((v) => fd.append('videoUrl', v));

    try {
      await axios.post('/api/academy/understandingfetchtrue', fd);
      setFullName('');
      setVideos([]);
      fetchEntries();
      alert('Entry submitted successfully!');
    } catch (error) {
      console.error('Error submitting entry:', error);
      alert('Failed to submit entry. Please try again.');
    }
  };

  const deleteVideo = async (entryId: string, idx: number) => {
    if (!window.confirm('Are you sure you want to delete this video?')) return;
    try {
      await axios.delete(`/api/academy/understandingfetchtrue/${entryId}?videoIndex=${idx}`);
      fetchEntries();
      alert('Video deleted successfully!');
    } catch (error) {
      console.error('Error deleting video:', error);
      alert('Failed to delete video. Please try again.');
    }
  };

  const saveEdit = async () => {
    if (!editEntryId || editVideoIdx === null) {
      alert('No entry selected for editing.');
      return;
    }

    const fd = new FormData();
    fd.append('fullName', editName);
    fd.append('videoIndex', String(editVideoIdx));

    if (editFile) {
      fd.append('videoUrl', editFile);
    }

    try {
      // await axios.put(`/api/academy/understandingfetchtrue/${editEntryId}`, fd);
      await axios.put(
        `/api/academy/understandingfetchtrue/${editEntryId}?videoIndex=${editVideoIdx}`,
        fd
      );

      closeModal();
      fetchEntries();
      alert('Entry updated successfully!');
    } catch (error) {
      console.error('Error saving edit:', error);
      alert('Failed to save changes. Please try again.');
    }
  };

  // Flatten videos with their entry info and index
  const allVideosWithEntryInfo = entries.flatMap((entry) =>
    entry.videos.map((video, entryLocalIndex) => ({
      ...video,
      entryId: entry._id,
      entryFullName: entry.fullName,
      entryLocalIndex,
    }))
  );

  return (
    <div className="p-6 max-w-5xl mx-auto font-sans">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Understanding FetchTrue</h1>

      {/* Upload Form */}
      <form onSubmit={handleSubmit} className="mb-10 p-6 bg-white rounded-lg shadow-md space-y-5">
        <div>
          <Label htmlFor="fullName" className="text-gray-700 font-medium mb-1 block">Full Name</Label>
          <Input
            id="fullName"
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Enter full name"
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div>
          <Label htmlFor="uploadVideos" className="text-gray-700 font-medium mb-1 block">Upload Videos</Label>
          <FileInput
            id="uploadVideos"
            accept="video/*"
            multiple
            onChange={(e) => e.target.files && setVideos(Array.from(e.target.files))}
            className="w-full p-2 border border-gray-300 rounded-md file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
          {videos.length > 0 && (
            <p className="text-sm text-gray-500 mt-2">Selected: {videos.map((f) => f.name).join(', ')}</p>
          )}
        </div>
        <Button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors duration-200 shadow-sm"
        >
          Submit
        </Button>
      </form>

      <h2 className="text-2xl font-semibold mb-4 text-gray-800">Uploaded Entries</h2>

      {allVideosWithEntryInfo.length === 0 && (
        <p className="text-gray-600 text-center py-8">No entries uploaded yet.</p>
      )}

      {/* Video Grid */}
      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
        {allVideosWithEntryInfo.map((vid) => (
          <div
            key={`${vid.entryId}-${vid.entryLocalIndex}`}
            className="border rounded-md p-3 flex flex-col gap-2"
          >
            <p className="font-medium">Full Name: {vid.entryFullName}</p>
            <video controls className="w-full h-56 object-cover rounded">
              <source src={vid.filePath} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
            <p className="text-gray-700 text-sm font-medium">File: {vid.fileName}</p>

            <div className="flex gap-2">
              <button
                onClick={() => openModal(vid.entryId, vid.entryLocalIndex)}
                className="text-yellow-500 border border-yellow-500 rounded-md p-2 hover:bg-yellow-500 hover:text-white"
                aria-label="Edit"
              >
                {/* <PlusCircle size={16} /> */}
                <PencilIcon size={16} />
              </button>
              <button
                onClick={() => deleteVideo(vid.entryId, vid.entryLocalIndex)}
                className="text-red-500 border border-red-500 rounded-md p-2 hover:bg-red-500 hover:text-white"
                aria-label="Delete"
              >
                <TrashBinIcon />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Updated Modal */}
      <Modal isOpen={isOpen} onClose={closeModal} className="max-w-[700px] m-4">
        <div className="no-scrollbar w-full max-w-[700px] overflow-y-auto rounded-3xl bg-white p-4 dark:bg-gray-900 lg:p-11">
          <h4 className="mb-5 text-2xl font-semibold">Update Video Entry</h4>
          <form className="flex flex-col">
            <div className="custom-scrollbar h-[400px] overflow-y-auto px-2 pb-3 grid gap-5">
              <div>
                <Label htmlFor="editName">Full Name (for entry)</Label>
                <Input
                  id="editName"
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  placeholder="Enter full name"
                />
              </div>
              <div>
                <Label htmlFor="editFile">Replace Video (optional)</Label>
                <FileInput
                  id="editFile"
                  accept="video/*"
                  onChange={(e) => setEditFile(e.target.files?.[0] || null)}
                />
                {editFile && (
                  <p className="text-sm text-gray-500 mt-1">
                    Selected: {editFile.name}
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3 px-2 mt-6 lg:justify-end">
              <Button size="sm" variant="outline" onClick={closeModal} type="button">
                Cancel
              </Button>
              <Button size="sm" onClick={saveEdit} type="button">
                Save Changes
              </Button>
            </div>
          </form>
        </div>
      </Modal>
    </div>
  );
};

export default UnderstandingPage;
