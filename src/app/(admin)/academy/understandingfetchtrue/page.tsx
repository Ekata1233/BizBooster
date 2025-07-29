// 'use client';

// import { useEffect, useState } from 'react';
// import axios from 'axios';
// import Input from '@/components/form/input/InputField';
// import Label from '@/components/form/Label';
// import Button from '@/components/ui/button/Button';
// import { PencilIcon } from 'lucide-react';
// import { TrashBinIcon } from '@/icons';
// import { useRouter } from 'next/navigation';

// interface VideoItem {
//   fileName: string;
//   filePath: string; // This will be the YouTube URL
//   _id?: string;
// }

// interface Entry {
//   _id: string;
//   fullName: string;
//   videos: VideoItem[]; // Correct: Changed back to 'videos' to match 'get all' API response
// }

// const UnderstandingPage = () => {
//   const [fullName, setFullName] = useState('');
//   const [youtubeUrls, setYoutubeUrls] = useState<string[]>([]);
//   const [currentYoutubeUrl, setCurrentYoutubeUrl] = useState('');
//   const [entries, setEntries] = useState<Entry[]>([]);
//   const router = useRouter();

//   const fetchEntries = async () => {
//     try {
//       const res = await axios.get('/api/academy/understandingfetchtrue');
//       console.log('API Response Data (UnderstandingPage):', res.data);
//       if (res.data && res.data.data) {
//         setEntries(res.data.data);
//         console.log('Entries fetched and set (UnderstandingPage):', res.data.data);
//       } else {
//         console.warn('API response did not contain data.data:', res.data);
//       }
//     } catch (error) {
//       console.error('Error fetching entries (UnderstandingPage):', error);
//     }
//   };

//   useEffect(() => {
//     fetchEntries();
//   }, []);

//   const handleEdit = (entryId: string, videoIndex: number) => {
//     router.push(`/academy/understandingfetchtrue/modals/${entryId}?videoIndex=${videoIndex}`);
//   };

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     if (!fullName || youtubeUrls.length === 0) {
//       alert('Full Name and at least one YouTube URL are required.');
//       return;
//     }

//     try {
//       await axios.post('/api/academy/understandingfetchtrue', {
//         fullName,
//         youtubeUrls,
//       });
//       setFullName('');
//       setYoutubeUrls([]);
//       setCurrentYoutubeUrl('');
//       fetchEntries();
//       alert('Entry submitted successfully!');
//     } catch (error) {
//       console.error('Error submitting entry:', error);
//       alert('Failed to submit entry. Please try again.');
//     }
//   };

//   const deleteVideo = async (entryId: string, idx: number) => {
//     if (!window.confirm('Are you sure you want to delete this video?')) return;
//     try {
//       await axios.delete(`/api/academy/understandingfetchtrue/${entryId}?videoIndex=${idx}`);
//       fetchEntries();
//       alert('Video deleted successfully!');
//     } catch (error) {
//       console.error('Error deleting video:', error);
//       alert('Failed to delete video. Please try again.');
//     }
//   };

//   // Helper function to extract YouTube video ID from various YouTube URL formats
//   const getYoutubeId = (url: string): string | null => {
//     // Regex to match various YouTube URL formats including watch, embed, and short URLs
//     const regExp = /(?:https?:\/\/)?(?:www\.)?(?:m\.)?(?:youtube\.com|youtu\.be)\/(?:watch\?v=|embed\/|v\/|)([\w-]{11})(?:\S+)?/;
//     const match = url.match(regExp);
//     return (match && match[1].length === 11) ? match[1] : null;
//   };

//   // Helper function to get standard YouTube embed URL
//   const getYoutubeEmbedUrl = (url: string): string | null => {
//     const videoId = getYoutubeId(url);
//     // Standard YouTube embed URL format
//     return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
//   };

//   // Helper function to get standard YouTube watch URL
//   const getYoutubeWatchUrl = (url: string): string | null => {
//     const videoId = getYoutubeId(url);
//     // Standard YouTube watch URL format
//     return videoId ? `https://www.youtube.com/watch?v=${videoId}` : null;
//   };

//   // Flatten videos with their entry info and index
//   const allVideosWithEntryInfo = entries.flatMap((entry) => {
//     return (entry.videos || []).map((video, entryLocalIndex) => ({
//       ...video,
//       entryId: entry._id,
//       entryFullName: entry.fullName,
//       entryLocalIndex,
//     }));
//   });

//   console.log('Final allVideosWithEntryInfo (UnderstandingPage):', allVideosWithEntryInfo);

//   return (
//     <div className="p-6 max-w-5xl mx-auto font-sans">
//       <h1 className="text-3xl font-bold mb-6 text-gray-800">Understanding FetchTrue</h1>

//       {/* Input Form for YouTube URLs */}
//       <form onSubmit={handleSubmit} className="mb-10 p-6 bg-white rounded-lg shadow-md space-y-5">
//         <div>
//           <Label htmlFor="fullName" className="text-gray-700 font-medium mb-1 block">
//             Full Name
//           </Label>
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
//           <Label htmlFor="youtubeUrl" className="text-gray-700 font-medium mb-1 block">
//             YouTube Video URL
//           </Label>
//           <div className="flex gap-2">
//             <Input
//               id="youtubeUrl"
//               type="url"
//               value={currentYoutubeUrl}
//               onChange={(e) => setCurrentYoutubeUrl(e.target.value)}
//               placeholder="Paste YouTube video URL"
//               className="flex-grow p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
//             />
//             <button
//               type="button"
//               onClick={() => {
//                 if (currentYoutubeUrl) {
//                   setYoutubeUrls((prev) => [...prev, currentYoutubeUrl]);
//                   setCurrentYoutubeUrl('');
//                 }
//               }}
//               className="bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 transition-colors duration-200"
//             >
//               Add
//             </button>
//           </div>
//           {youtubeUrls.length > 0 && (
//             <div className="mt-2 text-sm text-gray-500">
//               <p className="font-semibold">Added URLs:</p>
//               <ul className="list-disc list-inside">
//                 {youtubeUrls.map((url, index) => (
//                   <li key={index} className="flex justify-between items-center break-all">
//                     {url}
//                     <button
//                       type="button"
//                       onClick={() => setYoutubeUrls(youtubeUrls.filter((_, i) => i !== index))}
//                       className="text-red-500 ml-2"
//                       aria-label="Remove URL"
//                     >
//                       ×
//                     </button>
//                   </li>
//                 ))}
//               </ul>
//             </div>
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

//       {/* Video Grid */}
//       <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
//         {allVideosWithEntryInfo.map((vid) => {
//           const youtubeWatchUrl = getYoutubeWatchUrl(vid.filePath);
//           const embedUrl = getYoutubeEmbedUrl(vid.filePath);

//           return (
//             <div
//               key={`${vid.entryId}-${vid.entryLocalIndex}`}
//               className="border rounded-md p-3 flex flex-col gap-2"
//             >
//               <p className="font-medium">Full Name: {vid.entryFullName}</p>

//               {youtubeWatchUrl ? (
//                 <a
//                   href={youtubeWatchUrl}
//                   target="_blank"
//                   rel="noopener noreferrer"
//                   className="relative w-full block"
//                   style={{ paddingBottom: '56.25%', cursor: 'pointer' }}
//                   title="Click to watch on YouTube"
//                 >
//                   {embedUrl ? (
//                     <iframe
//                       className="absolute top-0 left-0 w-full h-full rounded"
//                       src={embedUrl}
//                       title="YouTube video player"
//                       frameBorder="0"
//                       allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
//                       allowFullScreen
//                     ></iframe>
//                   ) : (
//                     <div className="w-full h-full absolute top-0 left-0 flex items-center justify-center bg-gray-200 rounded text-gray-500">
//                       Invalid Embed URL
//                     </div>
//                   )}
//                 </a>
//               ) : (
//                 <div className="w-full h-56 flex items-center justify-center bg-gray-200 rounded text-red-500">
//                   Invalid YouTube URL
//                 </div>
//               )}

//               <p className="text-gray-700 text-sm font-medium break-all">
//                 Original Stored URL: {vid.filePath}
//               </p>
//               {youtubeWatchUrl && (
//                 <a
//                   href={youtubeWatchUrl}
//                   target="_blank"
//                   rel="noopener noreferrer"
//                   className="text-blue-600 hover:underline cursor-pointer text-sm font-medium break-all"
//                 >
//                   Watch on YouTube (Standard Link)
//                 </a>
//               )}

//               <div className="flex gap-2">
//                 <button
//                   onClick={() => handleEdit(vid.entryId, vid.entryLocalIndex)}
//                   className="text-yellow-500 border border-yellow-500 rounded-md p-2 hover:bg-yellow-500 hover:text-white"
//                   aria-label="Edit"
//                 >
//                   <PencilIcon size={16} />
//                 </button>
//                 <button
//                   onClick={() => deleteVideo(vid.entryId, vid.entryLocalIndex)}
//                   className="text-red-500 border border-red-500 rounded-md p-2 hover:bg-red-500 hover:text-white"
//                   aria-label="Delete"
//                 >
//                   <TrashBinIcon />
//                 </button>
//               </div>
//             </div>
//           );
//         })}
//       </div>
//     </div>
//   );
// };

// export default UnderstandingPage;




// app/academy/understandingfetchtrue/page.tsx
'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import Button from '@/components/ui/button/Button';
import { PencilIcon } from 'lucide-react';
import { TrashBinIcon } from '@/icons';
import { useRouter } from 'next/navigation';
import Link from 'next/link'; // Import Link for navigation

interface VideoItem {
  fileName: string;
  filePath: string; // This will be the YouTube URL
  _id?: string;
}

interface Entry {
  _id: string;
  fullName: string;
  videos: VideoItem[];
}

const UnderstandingPage = () => {
  const [entries, setEntries] = useState<Entry[]>([]);
  const router = useRouter();

  const fetchEntries = async () => {
    try {
      const res = await axios.get('/api/academy/understandingfetchtrue');
      console.log('API Response Data (UnderstandingPage):', res.data);
      if (res.data && res.data.data) {
        setEntries(res.data.data);
        console.log('Entries fetched and set (UnderstandingPage):', res.data.data);
      } else {
        console.warn('API response did not contain data.data:', res.data);
      }
    } catch (error) {
      console.error('Error fetching entries (UnderstandingPage):', error);
    }
  };

  useEffect(() => {
    fetchEntries();
  }, []);

  const handleEdit = (entryId: string, videoIndex: number) => {
    router.push(`/academy/understandingfetchtrue/modals/${entryId}?videoIndex=${videoIndex}`);
  };

  const deleteVideo = async (entryId: string, idx: number) => {
    if (!window.confirm('Are you sure you want to delete this video?')) return;
    try {
      await axios.delete(`/api/academy/understandingfetchtrue/${entryId}?videoIndex=${idx}`);
      fetchEntries(); // Re-fetch entries after deletion
      alert('Video deleted successfully!');
    } catch (error) {
      console.error('Error deleting video:', error);
      alert('Failed to delete video. Please try again.');
    }
  };

  // Helper function to extract YouTube video ID from various YouTube URL formats
  const getYoutubeId = (url: string): string | null => {
    const regExp = /(?:https?:\/\/)?(?:www\.)?(?:m\.)?(?:youtube\.com|youtu\.be)\/(?:watch\?v=|embed\/|v\/|)([\w-]{11})(?:\S+)?/;
    const match = url.match(regExp);
    return (match && match[1].length === 11) ? match[1] : null;
  };

  // Helper function to get standard YouTube embed URL
  const getYoutubeEmbedUrl = (url: string): string | null => {
    const videoId = getYoutubeId(url);
    return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
  };

  // Helper function to get standard YouTube watch URL
  const getYoutubeWatchUrl = (url: string): string | null => {
    const videoId = getYoutubeId(url);
    return videoId ? `https://www.youtube.com/watch?v=${videoId}` : null;
  };

  // Flatten videos with their entry info and index
  const allVideosWithEntryInfo = entries.flatMap((entry) => {
    return (entry.videos || []).map((video, entryLocalIndex) => ({
      ...video,
      entryId: entry._id,
      entryFullName: entry.fullName,
      entryLocalIndex,
    }));
  });

  console.log('Final allVideosWithEntryInfo (UnderstandingPage):', allVideosWithEntryInfo);

  return (
    <div className="p-6 max-w-5xl mx-auto font-sans">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Understanding Entries</h1>
        <Link href="/academy/understandingfetchtrue/add" passHref>
          <Button className="bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors duration-200 shadow-sm">
            Add New Entry
          </Button>
        </Link>
      </div>

      {allVideosWithEntryInfo.length === 0 && (
        <p className="text-gray-600 text-center py-8">No entries uploaded yet.</p>
      )}

      {/* Video Grid */}
      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
        {allVideosWithEntryInfo.map((vid) => {
          const youtubeWatchUrl = getYoutubeWatchUrl(vid.filePath);
          const embedUrl = getYoutubeEmbedUrl(vid.filePath);

          return (
            <div
              key={`${vid.entryId}-${vid.entryLocalIndex}`}
              className="border rounded-md p-3 flex flex-col gap-2"
            >
              <p className="font-medium">Full Name: {vid.entryFullName}</p>

              {youtubeWatchUrl ? (
                <a
                  href={youtubeWatchUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="relative w-full block"
                  style={{ paddingBottom: '56.25%', cursor: 'pointer' }}
                  title="Click to watch on YouTube"
                >
                  {embedUrl ? (
                    <iframe
                      className="absolute top-0 left-0 w-full h-full rounded"
                      src={embedUrl}
                      title="YouTube video player"
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    ></iframe>
                  ) : (
                    <div className="w-full h-full absolute top-0 left-0 flex items-center justify-center bg-gray-200 rounded text-gray-500">
                      Invalid Embed URL
                    </div>
                  )}
                </a>
              ) : (
                <div className="w-full h-56 flex items-center justify-center bg-gray-200 rounded text-red-500">
                  Invalid YouTube URL
                </div>
              )}

              <p className="text-gray-700 text-sm font-medium break-all">
                Original Stored URL: {vid.filePath}
              </p>
              {youtubeWatchUrl && (
                <a
                  href={youtubeWatchUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline cursor-pointer text-sm font-medium break-all"
                >
                  Watch on YouTube (Standard Link)
                </a>
              )}

              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(vid.entryId, vid.entryLocalIndex)}
                  className="text-yellow-500 border border-yellow-500 rounded-md p-2 hover:bg-yellow-500 hover:text-white"
                  aria-label="Edit"
                >
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
          );
        })}
      </div>
    </div>
  );
};

export default UnderstandingPage;