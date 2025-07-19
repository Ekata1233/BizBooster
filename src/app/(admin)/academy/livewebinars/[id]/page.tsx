// // src/app/(admin)/academy/livewebinars/[id]/page.tsx
// 'use client';

// import React, { useEffect, useState, useCallback, useRef } from 'react'; // Import useRef
// import { useParams, useRouter } from 'next/navigation';
// import Image from 'next/image';
// import Link from 'next/link';
// import { CiLink } from 'react-icons/ci';
// import Button from '@/components/ui/button/Button';
// import { TrashBinIcon } from '@/icons';
// import { useLiveWebinars } from '@/context/LiveWebinarContext';

// /* ------------------------------------------------------------------ */
// /*  Types                                                             */
// /* ------------------------------------------------------------------ */

// type WebinarUser = {
//   user: { _id: string; fullName: string; email: string; mobileNumber: string };
//   status: boolean;
// };

// type Webinar = {
//   _id: string;
//   name: string;
//   description: string;
//   imageUrl: string;
//   displayVideoUrls: string[];
//   date: string;
//   startTime: string;
//   endTime: string;
//   user: WebinarUser[];
// };

// const WebinarDetailPage: React.FC = () => {
//   const { id: rawId } = useParams<{ id: string }>();
//   const id = rawId ?? '';
//   const router = useRouter();

//   const { deleteTutorial, fetchWebinarById } = useLiveWebinars();

//   const [webinar, setWebinar] = useState<Webinar | null>(null);
//   const [timeRemaining, setTimeRemaining] = useState({ hours: '00', minutes: '00' });

//   // Use useRef to store the interval ID so it persists across renders
//   const timerRef = useRef<NodeJS.Timeout | null>(null); // Explicitly type for NodeJS.Timeout

//   const loadWebinar = useCallback(async () => {
//     if (!id) return;
//     const data = await fetchWebinarById(id);

//     if (data) {
//       const transformedWebinar: Webinar = {
//         _id: data._id,
//         name: data.name,
//         description: data.description,
//         imageUrl: data.imageUrl,
//         displayVideoUrls: data.displayVideoUrls,
//         date: data.date,
//         startTime: data.startTime,
//         endTime: data.endTime,
//         user: (data.user || []) as WebinarUser[],
//       };

//       setWebinar(transformedWebinar);
//       // Call calculateCountdown only if data is available
//       calculateCountdown(data.date, data.startTime);
//     }
//   }, [id, fetchWebinarById]);

//   // Modified useEffect to correctly manage the countdown timer
//   useEffect(() => {
//     loadWebinar();

//     // Cleanup function for the effect to clear the interval
//     return () => {
//       if (timerRef.current) {
//         clearInterval(timerRef.current);
//       }
//     };
//   }, [loadWebinar]); // Depend on loadWebinar to re-run when it changes

//   const calculateCountdown = (date: string, startTime: string) => {
//     const target = new Date(`${date} ${startTime}`).getTime();

//     // Clear any existing timer before starting a new one
//     if (timerRef.current) {
//       clearInterval(timerRef.current);
//     }

//     const tick = () => {
//       const diff = target - Date.now();
//       if (diff <= 0) {
//         setTimeRemaining({ hours: '00', minutes: '00' });
//         if (timerRef.current) {
//           clearInterval(timerRef.current); // Clear using the ref
//           timerRef.current = null; // Reset the ref
//         }
//         return;
//       }
//       const hrs = String(Math.floor(diff / 3_600_000)).padStart(2, '0');
//       const mins = String(Math.floor((diff % 3_600_000) / 60_000)).padStart(2, '0');
//       setTimeRemaining({ hours: hrs, minutes: mins });
//     };

//     tick(); // Initial call
//     timerRef.current = setInterval(tick, 1_000); // Store interval ID in ref
//   };

//   /* ----------------------------------------------------------------
//     Handlers
//   ---------------------------------------------------------------- */
//   const updateStatus = async (webinarId: string, userId: string, status: boolean) => {
//     try {
//       const result = await (await fetch(`/api/academy/livewebinars/enroll/${webinarId}`, {
//         method: "PUT",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ users: [userId], status }),
//       })).json();

//       if (result.success) {
//         alert("Status updated");
//         loadWebinar(); // Refresh UI
//       } else {
//         alert("Error: " + result.message);
//       }
//     } catch (err) {
//       console.error("Update error", err);
//       alert("Failed to update status");
//     }
//   };

//   const handleDelete = async () => {
//     if (!id) return;
//     if (!confirm('Are you sure you want to delete this webinar?')) return;
//     await deleteTutorial(id);
//     router.push('/academy/livewebinars');
//   };

//   const copyToClipboard = (text?: string) => {
//     if (!text) return;
//     navigator.clipboard.writeText(text);
//     alert('Link copied to clipboard!');
//   };


//   if (!webinar) return <p className="p-4">Loading…</p>;


//   return (
//     <div className="p-4 space-y-6 bg-[#f5f7fa] min-h-screen">
//       {/* header */}
//       <div className="flex justify-between items-center">
//         <h1 className="text-xl font-semibold text-blue-700">Webinar</h1>
//         <button
//           onClick={handleDelete}
//           className="text-red-500 border border-red-500 rounded-md p-2 hover:bg-red-500 hover:text-white"
//         >
//           <TrashBinIcon />
//         </button>
//       </div>


//       <div className="bg-white p-4 rounded-lg shadow-sm flex flex-col md:flex-row items-start md:items-center gap-9">
//         {/* Image on the left */}
//         <div className="flex-shrink-0 w-full md:w-1/3 lg:w-1/4"> {/* Adjust width as needed */}
//           <Image
//             src={webinar.imageUrl}
//             alt={webinar.name}
//             width={500}
//             height={200}
//             className="rounded-md object-cover w-full h-auto" // Ensure image is responsive
//           />
//         </div>

//         {/* Data on the right, stacked one after another */}
//         <div className="flex-grow space-y-2"> {/* Use flex-grow to take available space, space-y for vertical stacking */}
//           <h2 className="text-lg font-bold">{webinar.name}</h2>
//           <p className="text-gray-600">{webinar.description}</p>
//           <p><strong>Date:</strong> {webinar.date}</p>
//           <p><strong>Time:</strong> {webinar.startTime} – {webinar.endTime}</p>
//         </div>
//       </div>

//       {/* video link */}
//       <div className="bg-white p-4 rounded-lg shadow-sm">
//         <div className="flex items-center space-x-2">
//           <CiLink className="text-blue-800" />
//           <a
//             href={webinar.displayVideoUrls[0] ?? '#'}
//             target="_blank"
//             rel="noopener noreferrer"
//             className="text-blue-600 underline break-all"
//           >
//             {webinar.displayVideoUrls[0] ?? 'No link'}
//           </a>
//         </div>

//         <div className="flex space-x-4 mt-4">
//           <Button onClick={() => copyToClipboard(webinar.displayVideoUrls[0])}>Copy</Button>
//           <a
//             href={webinar.displayVideoUrls[0]}
//             target="_blank"
//             rel="noopener noreferrer"
//             className="inline-block bg-blue-600 text-white px-4 py-2 rounded"
//           >
//             Join
//           </a>
//         </div>

//         <div className="mt-6 text-center">
//           <p className="text-gray-700">Time Remaining</p>
//           <p className="text-xl font-bold">
//             {timeRemaining.hours}hr {timeRemaining.minutes}min
//           </p>
//         </div>
//       </div>

//       {/* enrolled users */}
//       <table className="min-w-full border border-gray-300 text-sm">
//         <thead className="bg-gray-100">
//           <tr>
//             <th className="border px-3 py-2">S.No</th>
//             <th className="border px-3 py-2">User ID</th>
//             <th className="border px-3 py-2">Name</th>
//             <th className="border px-3 py-2">Email</th>
//             <th className="border px-3 py-2">Mobile</th>
//             <th className="border px-3 py-2">Actions</th>
//           </tr>
//         </thead>
//         <tbody>
//           {webinar.user.length ? (
//             webinar.user.map((entry, idx) => (
//               <tr key={entry.user?._id || idx}>
//                 <td className="border px-3 py-2">{idx + 1}</td>
//                 <td className="border px-3 py-2">{entry.user?._id ?? 'N/A'}</td>
//                 <td className="border px-3 py-2">{entry.user?.fullName ?? 'Unknown'}</td>
//                 <td className="border px-3 py-2">{entry.user?.email ?? 'Unknown'}</td>
//                 <td className="border px-3 py-2">{entry.user?.mobileNumber ?? 'Unknown'}</td>
//                 <td className="border px-3 py-2">
//                   {entry.user ? (
//                     entry.status ? (
//                       <button
//                         className="bg-green-600 text-white px-2 py-1 rounded cursor-default"
//                         disabled
//                       >
//                         Enrolled
//                       </button>
//                     ) : (
//                       <>
//                         <button
//                           className="bg-green-600 text-white px-2 py-1 rounded mr-2"
//                           onClick={() => updateStatus(webinar._id, entry.user._id, true)}
//                         >
//                           Accept
//                         </button>
//                         <button
//                           className="bg-red-500 text-white px-2 py-1 rounded"
//                           onClick={() => updateStatus(webinar._id, entry.user._id, false)}
//                         >
//                           Reject
//                         </button>
//                       </>
//                     )
//                   ) : (
//                     <span className="text-red-500">User not found</span>
//                   )}
//                 </td>
//               </tr>
//             ))
//           ) : (
//             <tr>
//               <td colSpan={6} className="text-center py-2">No users enrolled</td>
//             </tr>
//           )}
//         </tbody>
//       </table>

//       {/* back */}
//       <Link href="/academy/livewebinars" className="inline-block">
//         <Button className="mt-4">Back</Button>
//       </Link>
//     </div>
//   );
// };

// export default WebinarDetailPage;







'use client';

import React, { useEffect, useState, useCallback, useRef } from 'react'; // Import useRef
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { CiLink } from 'react-icons/ci'; // Assuming CiLink is imported from react-icons/ci
// import Button from '@/components/ui/button/Button';
import { TrashBinIcon } from '@/icons'; // Assuming this is a custom SVG/React component for the trash bin
import { useLiveWebinars } from '@/context/LiveWebinarContext';
import PageBreadcrumb from '@/components/common/PageBreadCrumb'; // Assuming PageBreadcrumb exists

// Modal and Form components (assuming these are styled consistently elsewhere or will be updated)
// import { Modal } from '@/components/ui/modal';
// import FileInput from '@/components/form/input/FileInput';
// import Input from '@/components/form/input/InputField';
// import Label from '@/components/form/Label';
import axios from 'axios'; // Import axios for error handling type guard
import Button from '@/components/ui/button/Button';


type WebinarUser = {
  user: { _id: string; fullName: string; email: string; mobileNumber: string };
  status: boolean;
};

type Webinar = {
  _id: string;
  name: string;
  description: string;
  imageUrl: string;
  displayVideoUrls: string[];
  date: string;
  startTime: string;
  endTime: string;
  user: WebinarUser[];
};

const WebinarDetailPage: React.FC = () => {
  const { id: rawId } = useParams<{ id: string }>();
  const id = rawId ?? '';
  const router = useRouter();

  const { deleteTutorial, fetchWebinarById } = useLiveWebinars();

  const [webinar, setWebinar] = useState<Webinar | null>(null);
  const [timeRemaining, setTimeRemaining] = useState({ hours: '00', minutes: '00' });
  const [isLoading, setIsLoading] = useState(true); // Added loading state
  const [error, setError] = useState<string | null>(null); // Added error state

  // Use useRef to store the interval ID so it persists across renders
  const timerRef = useRef<NodeJS.Timeout | null>(null); // Explicitly type for NodeJS.Timeout



  const loadWebinar = useCallback(async () => {
    if (!id) {
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchWebinarById(id);

      if (data) {
        const transformedWebinar: Webinar = {
          _id: data._id,
          name: data.name,
          description: data.description,
          imageUrl: data.imageUrl,
          displayVideoUrls: data.displayVideoUrls,
          date: data.date,
          startTime: data.startTime,
          endTime: data.endTime,
          user: (data.user || []) as WebinarUser[],
        };

        setWebinar(transformedWebinar);
        // Call calculateCountdown only if data is available
        calculateCountdown(data.date, data.startTime);
      } else {
        setError('Webinar data not found.');
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
  }, [id, fetchWebinarById]);

  // Modified useEffect to correctly manage the countdown timer
  useEffect(() => {
    loadWebinar();

    // Cleanup function for the effect to clear the interval
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [loadWebinar]); // Depend on loadWebinar to re-run when it changes

  const calculateCountdown = (date: string, startTime: string) => {
    const target = new Date(`${date} ${startTime}`).getTime();

    // Clear any existing timer before starting a new one
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    const tick = () => {
      const diff = target - Date.now();
      if (diff <= 0) {
        setTimeRemaining({ hours: '00', minutes: '00' });
        if (timerRef.current) {
          clearInterval(timerRef.current); // Clear using the ref
          timerRef.current = null; // Reset the ref
        }
        return;
      }
      const hrs = String(Math.floor(diff / 3_600_000)).padStart(2, '0');
      const mins = String(Math.floor((diff % 3_600_000) / 60_000)).padStart(2, '0');
      setTimeRemaining({ hours: hrs, minutes: mins });
    };

    tick(); // Initial call
    timerRef.current = setInterval(tick, 1_000); // Store interval ID in ref
  };

  /* ----------------------------------------------------------------
    Handlers
  ---------------------------------------------------------------- */
  const updateStatus = async (webinarId: string, userId: string, status: boolean) => {
    try {
      const result = await (await fetch(`/api/academy/livewebinars/enroll/${webinarId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ users: [userId], status }),
      })).json();

      if (result.success) {
        alert("Status updated"); // IMPORTANT: Replace with custom modal/toast
        loadWebinar(); // Refresh UI
      } else {
        alert("Error: " + result.message); // IMPORTANT: Replace with custom modal/toast
      }
    } catch (err: unknown) { // Use unknown for error type
      console.error("Update error", err);
      if (axios.isAxiosError(err)) {
        alert(err.response?.data?.message || "Failed to update status"); // IMPORTANT: Replace with custom modal/toast
      } else {
        alert("Failed to update status"); // IMPORTANT: Replace with custom modal/toast
      }
    }
  };

  const handleDelete = async () => {
    if (!id) return;
    // IMPORTANT: Replace window.confirm with a custom modal for better UX and consistency
    if (!window.confirm('Are you sure you want to delete this webinar?')) return;
    try {
      await deleteTutorial(id); // This seems to be for deleting a video, not the whole webinar based on context usage
      alert('Webinar deleted successfully'); // This alert message seems inconsistent with deleteTutorial
      router.push('/academy/livewebinars');
    } catch (err: unknown) {
      console.error('Failed to delete webinar:', err);
      if (axios.isAxiosError(err)) {
        alert(err.response?.data?.message || 'Error deleting webinar.');
      } else {
        alert('An unexpected error occurred during webinar deletion.');
      }
    }
  };

  const copyToClipboard = (text?: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    alert('Link copied to clipboard!'); // IMPORTANT: Replace with custom modal/toast
  };


  if (isLoading) return <p className="p-8 text-center text-gray-600">Loading webinar details...</p>;
  if (error) return <p className="p-8 text-center text-red-600">Error: {error}</p>;
  if (!webinar) return <p className="p-8 text-center text-gray-600">Webinar not found.</p>;

  return (
    <div className="min-h-screen  p-6 sm:p-8 md:p-10 font-sans">
      <PageBreadcrumb pageTitle="Webinar Detail" />

      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8  p-6 sm:p-8 ">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-black mb-4 sm:mb-0">
          Training Webinar: {webinar.name}
        </h1>


        <button onClick={handleDelete} className="text-red-500 border border-red-500 rounded-md p-2 hover:bg-red-500 hover:text-white hover:border-red-500">
          <TrashBinIcon />
        </button>
      </div>

      {/* Main Info Card (Image and Description) */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-sm mb-8 flex flex-col md:flex-row items-center md:items-start gap-6 md:gap-8">
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
          <p className="text-base sm:text-lg leading-relaxed text-black">
            {webinar.description || 'No description provided.'}
          </p>
        </div>
      </div>

      {/* Video Link & Countdown Section */}
      <div className="bg-white p-6 sm:p-8 rounded-lg  mb-8">
        <h2 className="text-2xl sm:text-3xl font-bold text-black mb-6 pb-4 border-blue-200">Live Webinar Details</h2>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-6 mb-8">
          <div className="flex items-center space-x-3 flex-grow">
            <CiLink className="text-blue-800 text-3xl flex-shrink-0" />
            <div className="overflow-hidden">
              <a
                href={webinar.displayVideoUrls[0] ?? '#'}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 underline break-all text-lg font-medium hover:text-blue-800 transition-colors duration-200"
              >
                {webinar.displayVideoUrls[0] || 'No live link available'}
              </a>
            </div>
          </div>
          <div className="flex space-x-4 flex-shrink-0">
            <button
              onClick={() => copyToClipboard(webinar.displayVideoUrls[0])}
              className="text-blue-600 border border-blue-600 flex items-center justify-center rounded-md px-3 py-1 hover:bg-blue-600 hover:text-white"
            >
              Copy Link
            </button>

            <a
              href={webinar.displayVideoUrls[0]}
              target="_blank"
              rel="noopener noreferrer"
              className="text-green-600 border border-green-600 flex items-center justify-center rounded-md px-3 py-1 hover:bg-green-600 hover:text-white"
            >
              Join Webinar
            </a>
          </div>
        </div>

        <div className="mt-8 text-center bg-blue-50 p-6 rounded-2xl shadow-inner border border-blue-200">
          <p className="text-black font-semibold text-lg">Time Remaining Until Webinar</p>
          <p className="text-3xl font-extrabold text-black mt-2">
            {timeRemaining.hours}hr {timeRemaining.minutes}min
          </p>
        </div>
      </div>

      {/* Enrolled Users Table */}
      <div className="bg-white p-6 sm:p-8 rounded-lg shadow-sm mb-8">
        <h2 className="text-2xl sm:text-3xl font-bold text-black mb-6 pb-4 border-blue-200">Enrolled Users</h2>
        <div className="overflow-x-auto rounded-lg border border-gray-200">
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-blue-50">
              <tr>
                <th className="px-4 py-3 text-left text-black font-bold uppercase tracking-wider">S.No</th>
                <th className="px-4 py-3 text-left text-black font-bold uppercase tracking-wider">User ID</th>
                <th className="px-4 py-3 text-left text-black font-bold uppercase tracking-wider">Name</th>
                <th className="px-4 py-3 text-left text-black font-bold uppercase tracking-wider">Email</th>
                <th className="px-4 py-3 text-left text-black font-bold uppercase tracking-wider">Mobile</th>
                <th className="px-4 py-3 text-left text-black font-bold uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {webinar.user.length ? (
                webinar.user.map((entry, idx) => (
                  <tr key={entry.user?._id || idx} className="hover:bg-gray-50 transition-colors duration-150">
                    <td className="px-4 py-3 whitespace-nowrap text-gray-700">{idx + 1}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-gray-700">{entry.user?._id ?? 'N/A'}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-gray-700">{entry.user?.fullName ?? 'Unknown'}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-gray-700">{entry.user?.email ?? 'Unknown'}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-gray-700">{entry.user?.mobileNumber ?? 'Unknown'}</td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {entry.user ? (
                        entry.status ? (
                          <span
                            className="bg-green-200 text-green-800 px-4 py-2 rounded-full text-sm font-medium cursor-default shadow-sm"
                          >
                            Enrolled
                          </span>
                        ) : (
                          <div className="flex gap-2">
                            {/* <Button
                              className="bg-gradient-to-r from-green-500 to-green-700 text-white px-4 py-2 rounded-full text-sm font-medium hover:from-green-600 hover:to-green-800 transition-colors duration-200 shadow-md"
                              onClick={() => updateStatus(webinar._id, entry.user._id, true)}
                            >
                              Accept
                            </Button> */}
                            <button
                              onClick={() => updateStatus(webinar._id, entry.user._id, true)}
                              className="text-green-600 border border-green-600 rounded-md px-3 py-1 hover:bg-green-600 hover:text-white"
                            >
                              Approve
                            </button>
                            {/* <Button
                              className="bg-gradient-to-r from-red-500 to-red-700 text-white px-4 py-2 rounded-full text-sm font-medium hover:from-red-600 hover:to-red-800 transition-colors duration-200 shadow-md"
                              onClick={() => updateStatus(webinar._id, entry.user._id, false)}
                            >
                              Reject
                            </Button> */}
                            <button
                              onClick={() => updateStatus(webinar._id, entry.user._id, false)}
                              className="text-red-600 border border-red-600 rounded-md px-3 py-1 hover:bg-red-600 hover:text-white"
                            >
                              Reject
                            </button>
                          </div>
                        )
                      ) : (
                        <span className="text-red-500 text-sm">User data missing</span>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="text-center py-6 text-gray-600 text-lg">No users enrolled for this webinar.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

     

      <Link href="/academy/livewebinars" passHref>

        <Button variant="outline">Back</Button>
      </Link>


    </div>
  );
};

export default WebinarDetailPage;
