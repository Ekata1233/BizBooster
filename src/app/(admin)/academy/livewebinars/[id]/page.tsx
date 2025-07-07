// 'use client';

// import React, { useEffect, useState } from 'react';
// import { useParams, useRouter } from 'next/navigation';
// import Image from 'next/image';
// import Button from '@/components/ui/button/Button';
// import { useLiveWebinars } from '@/context/LiveWebinarContext';
// import { CiLink } from "react-icons/ci";
// import { TrashBinIcon } from "@/icons";
// import Link from 'next/link';

// const WebinarDetailPage = () => {
//   const { id } = useParams();
//   const router = useRouter();
//   const { webinars, deleteTutorial, fetchWebinarById } = useLiveWebinars();
//   const [webinar, setWebinar] = useState<any>(null);
//   const [timeRemaining, setTimeRemaining] = useState({ hours: '00', minutes: '00' });

//   useEffect(() => {
//     if (webinars && id) {
//       const selected = webinars.find((web) => web._id === id);
//       if (selected) {
//         setWebinar(selected);
//         calculateCountdown(selected.date, selected.startTime);
//       }
//     }
//     const fetchData = async () => {
//     const data = await fetchWebinarById(id);
//     if (data) {
//       setWebinar(data);
//       calculateCountdown(data.date, data.startTime);
//     }
//   };

//   fetchData();
//   }, [id, webinars]);

// // useEffect(() => {
// //   if (!id || typeof id !== 'string') return;

// //   const fetchData = async () => {
// //     const data = await fetchWebinarById(id);
// //     if (data) {
// //       setWebinar(data);
// //       calculateCountdown(data.date, data.startTime);
// //     }
// //   };

// //   fetchData();
// // }, [id]);

//   const handleDelete = async () => {
//     const confirmDelete = confirm("Are you sure you want to delete this webinar?");
//     if (!confirmDelete) return;

//     try {
//       await deleteTutorial(id as string);
//       alert("Webinar deleted successfully");
//       router.push("/academy/livewebinars/");
//     } catch (error) {
//       console.error("Failed to delete webinar:", error);
//     }
//   };

//   const calculateCountdown = (date: string, startTime: string) => {
//     const interval = setInterval(() => {
//       const target = new Date(`${date} ${startTime}`);
//       const now = new Date();
//       const diff = target.getTime() - now.getTime();

//       if (diff <= 0) {
//         clearInterval(interval);
//         setTimeRemaining({ hours: '00', minutes: '00' });
//         return;
//       }

//       const hours = String(Math.floor(diff / (1000 * 60 * 60))).padStart(2, '0');
//       const minutes = String(Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))).padStart(2, '0');
//       setTimeRemaining({ hours, minutes });
//     }, 1000);
//   };

//   const copyToClipboard = (text: string) => {
//     navigator.clipboard.writeText(text);
//     alert('Link copied to clipboard!');
//   };

//   if (!webinar) return <p>Loading...</p>;

//   return (
//     <div className="p-4 space-y-6 bg-[#f5f7fa] min-h-screen">
//       {/* Header */}
//       <div className="flex justify-between items-center">
//         <h1 className="text-xl font-semibold text-blue-700">Webinar</h1>
//         <button
//           onClick={handleDelete}
//           className="text-red-500 border border-red-500 rounded-md p-2 hover:bg-red-500 hover:text-white"
//         >
//           <TrashBinIcon />
//         </button>
//       </div>
//       {/* Card */}
//       <div className="bg-white p-4 rounded-lg shadow-sm">
//         {/* Image */}
//         <Image
//           src={webinar.imageUrl}
//           alt={webinar.name}
//           width={500}
//           height={200}
//           className="rounded-md object-cover"
//         />

//         <div className="mt-4 space-y-1">
//           <h2 className="text-lg font-bold">{webinar.name}</h2>
//           <p className="text-gray-600">{webinar.description}</p>

//           <p><strong>Date:</strong> {webinar.date}</p>
//           <p><strong>Time:</strong> {webinar.startTime} - {webinar.endTime}</p>
//         </div>

//         <div className="mt-4 text-right">
//           <Button className="bg-blue-600 text-white px-4 py-2 rounded">Enroll Now</Button>
//         </div>
//       </div>

//       {/* Video Link Section */}
//       <div className="bg-white p-4 rounded-lg shadow-sm">
//         <div className="flex items-center space-x-2">
//           <CiLink className="text-blue-800" />
//           {Array.isArray(webinar.displayVideoUrls) ? (
//             <a
//               href={webinar.displayVideoUrls[0]}
//               target="_blank"
//               rel="noopener noreferrer"
//               className="text-blue-600 underline break-all"
//             >
//               {webinar.displayVideoUrls[0]}
//             </a>
//           ) : (
//             <a
//               href={webinar.displayVideoUrls || '#'}
//               target="_blank"
//               rel="noopener noreferrer"
//               className="text-blue-600 underline break-all"
//             >
//               {webinar.displayVideoUrls || 'No Link'}
//             </a>
//           )}
//         </div>

//         {/* Copy and Join Buttons */}
//         <div className="flex space-x-4 mt-4">
//           <Button onClick={() => copyToClipboard(webinar.displayVideoUrls?.[0])}>
//             Copy
//           </Button>
//           <Button asChild>
//             <a href={webinar.displayVideoUrls?.[0]} target="_blank" rel="noopener noreferrer">
//               Join
//             </a>
//           </Button>
//         </div>

//         {/* Countdown */}
//         <div className="mt-6 text-center">
//           <p className="text-gray-700">Time Remaining</p>
//           <p className="text-xl font-bold">
//             {timeRemaining.hours}hr {timeRemaining.minutes}min
//           </p>
//         </div>
//       </div>


//       {/* <div className="mt-4">
//         <table className="min-w-full border border-gray-300 text-sm">
//           <thead className="bg-gray-100">
//             <tr>
//               <th className="border px-3 py-2 text-left">S.No</th>
//               <th className="border px-3 py-2 text-left">User ID</th>
//             </tr>
//           </thead>
//           <tbody>
//             {webinar.user && webinar.user.length > 0 ? (
//               webinar.user.map((userId: string, index: number) => (
//                 <tr key={index}>
//                   <td className="border px-3 py-2">{index + 1}</td>
//                   <td className="border px-3 py-2 break-all">{userId}</td>
//                   <td className="border px-3 py-2 break-all">{userId.fullName}</td>

//                 </tr>
//               ))
//             ) : (
//               <tr>
//                 <td colSpan={2} className="border px-3 py-2 text-gray-500 text-center">
//                   No users enrolled
//                 </td>
//               </tr>
//             )}
//           </tbody>
//         </table>
//       </div>  */}

// <table className="min-w-full border border-gray-300 text-sm">
//   <thead className="bg-gray-100">
//     <tr>
//       <th className="border px-3 py-2 text-left">S.No</th>
//       <th className="border px-3 py-2 text-left">User ID</th>
//       <th className="border px-3 py-2 text-left">User Name</th>
//       <th className="border px-3 py-2 text-left">Email</th>
//       <th className="border px-3 py-2 text-left">Mobile</th>
//     </tr>
//   </thead>
//   <tbody>
//     {webinar.user && webinar.user.length > 0 ? (
//       webinar.user.map((u: any, index: number) => (
//         <tr key={u._id || `user-${index}`}>
//           <td className="border px-3 py-2">{index + 1}</td>
//           <td className="border px-3 py-2 break-all">{u._id}</td>
//           <td className="border px-3 py-2">{u.fullName || 'N/A'}</td>
//           <td className="border px-3 py-2">{u.email || 'N/A'}</td>
//           <td className="border px-3 py-2">{u.mobileNumber || 'N/A'}</td>
//         </tr>
//       ))
//     ) : (
//       <tr>
//         <td colSpan={5} className="border px-3 py-2 text-center text-gray-500">
//           No users enrolled
//         </td>
//       </tr>
//     )}
//   </tbody>
// </table>


     

//       <Link href="/academy/webinars/" passHref>
//         <Button onClick={() => router.back()} className="mt-4">Back</Button>
//       </Link>
//     </div>
//   );
// };

// export default WebinarDetailPage;





// src/app/(admin)/academy/livewebinars/[id]/page.tsx
'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { CiLink } from 'react-icons/ci';
import Button from '@/components/ui/button/Button';
import { TrashBinIcon } from '@/icons';
import { useLiveWebinars } from '@/context/LiveWebinarContext';

/* ------------------------------------------------------------------ */
/*  Types                                                             */
/* ------------------------------------------------------------------ */
type WebinarUser = {
  _id: string;
  fullName: string;
  email: string;
  mobileNumber: string;
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
  /* --- path / router --- */
  const { id: rawId } = useParams<{ id: string }>(); // ensures string
  const id = rawId ?? '';                             // remove undefined
  const router = useRouter();

  /* --- context --- */
  const { deleteTutorial, fetchWebinarById } = useLiveWebinars();

  /* --- state --- */
  const [webinar, setWebinar] = useState<Webinar | null>(null);
  const [timeRemaining, setTimeRemaining] = useState({ hours: '00', minutes: '00' });

  const loadWebinar = useCallback(async () => {
    if (!id) return;
    const data = await fetchWebinarById(id);
    if (data) {
      setWebinar(data as Webinar);
      calculateCountdown(data.date, data.startTime);
    }
  }, [id, fetchWebinarById]);

  useEffect(() => {
    loadWebinar();
  }, [loadWebinar]);

  const calculateCountdown = (date: string, startTime: string) => {
    const target = new Date(`${date} ${startTime}`).getTime();
    const tick = () => {
      const diff = target - Date.now();
      if (diff <= 0) {
        setTimeRemaining({ hours: '00', minutes: '00' });
        clearInterval(timer);
        return;
      }
      const hrs = String(Math.floor(diff / 3_600_000)).padStart(2, '0');
      const mins = String(Math.floor((diff % 3_600_000) / 60_000)).padStart(2, '0');
      setTimeRemaining({ hours: hrs, minutes: mins });
    };
    tick();
    const timer = setInterval(tick, 1_000);
  };

  /* ----------------------------------------------------------------
     Handlers
  ---------------------------------------------------------------- */
  const handleDelete = async () => {
    if (!id) return;
    if (!confirm('Are you sure you want to delete this webinar?')) return;
    await deleteTutorial(id);
    router.push('/academy/livewebinars');
  };

  const copyToClipboard = (text?: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    alert('Link copied to clipboard!');
  };

  /* ----------------------------------------------------------------
     Loading
  ---------------------------------------------------------------- */
  if (!webinar) return <p className="p-4">Loading…</p>;

  /* ----------------------------------------------------------------
     Render
  ---------------------------------------------------------------- */
  return (
    <div className="p-4 space-y-6 bg-[#f5f7fa] min-h-screen">
      {/* header */}
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-semibold text-blue-700">Webinar</h1>
        <button
          onClick={handleDelete}
          className="text-red-500 border border-red-500 rounded-md p-2 hover:bg-red-500 hover:text-white"
        >
          <TrashBinIcon />
        </button>
      </div>

      {/* info card */}
      <div className="bg-white p-4 rounded-lg shadow-sm">
        <Image
          src={webinar.imageUrl}
          alt={webinar.name}
          width={500}
          height={200}
          className="rounded-md object-cover"
        />

        <div className="mt-4 space-y-1">
          <h2 className="text-lg font-bold">{webinar.name}</h2>
          <p className="text-gray-600">{webinar.description}</p>
          <p><strong>Date:</strong> {webinar.date}</p>
          <p><strong>Time:</strong> {webinar.startTime} – {webinar.endTime}</p>
        </div>

        <div className="mt-4 text-right">
          <Button className="bg-blue-600 text-white px-4 py-2 rounded">Enroll Now</Button>
        </div>
      </div>

      {/* video link */}
      <div className="bg-white p-4 rounded-lg shadow-sm">
        <div className="flex items-center space-x-2">
          <CiLink className="text-blue-800" />
          <a
            href={webinar.displayVideoUrls[0] ?? '#'}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 underline break-all"
          >
            {webinar.displayVideoUrls[0] ?? 'No link'}
          </a>
        </div>

        <div className="flex space-x-4 mt-4">
          <Button onClick={() => copyToClipboard(webinar.displayVideoUrls[0])}>Copy</Button>
          {/* just use anchor, Button doesn’t support asChild */}
          <a
            href={webinar.displayVideoUrls[0]}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block bg-blue-600 text-white px-4 py-2 rounded"
          >
            Join
          </a>
        </div>

        <div className="mt-6 text-center">
          <p className="text-gray-700">Time Remaining</p>
          <p className="text-xl font-bold">
            {timeRemaining.hours}hr {timeRemaining.minutes}min
          </p>
        </div>
      </div>

      {/* enrolled users */}
      <table className="min-w-full border border-gray-300 text-sm">
        <thead className="bg-gray-100">
          <tr>
            <th className="border px-3 py-2">S.No</th>
            <th className="border px-3 py-2">User ID</th>
            <th className="border px-3 py-2">Name</th>
            <th className="border px-3 py-2">Email</th>
            <th className="border px-3 py-2">Mobile</th>
          </tr>
        </thead>
        <tbody>
          {webinar.user.length ? (
            webinar.user.map((u, idx) => (
              <tr key={u._id}>
                <td className="border px-3 py-2">{idx + 1}</td>
                <td className="border px-3 py-2 break-all">{u._id}</td>
                <td className="border px-3 py-2">{u.fullName}</td>
                <td className="border px-3 py-2">{u.email}</td>
                <td className="border px-3 py-2">{u.mobileNumber}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={5} className="text-center py-2">No users enrolled</td>
            </tr>
          )}
        </tbody>
      </table>

      {/* back */}
      <Link href="/academy/webinars" className="inline-block">
        <Button className="mt-4">Back</Button>
      </Link>
    </div>
  );
};

export default WebinarDetailPage;
