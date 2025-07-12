// src/app/(admin)/academy/livewebinars/[id]/page.tsx
'use client';

import React, { useEffect, useState, useCallback, useRef } from 'react'; // Import useRef
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { CiLink } from 'react-icons/ci';
import Button from '@/components/ui/button/Button';
import { TrashBinIcon } from '@/icons';
import { useLiveWebinars } from '@/context/LiveWebinarContext';

/* ------------------------------------------------------------------ */
/*  Types                                                             */
/* ------------------------------------------------------------------ */

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

  // Use useRef to store the interval ID so it persists across renders
  const timerRef = useRef<NodeJS.Timeout | null>(null); // Explicitly type for NodeJS.Timeout

  const loadWebinar = useCallback(async () => {
    if (!id) return;
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
        alert("Status updated");
        loadWebinar(); // Refresh UI
      } else {
        alert("Error: " + result.message);
      }
    } catch (err) {
      console.error("Update error", err);
      alert("Failed to update status");
    }
  };

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
            {timeRemaining.hours}hr {timeRemaining.minutes}min
          </p>
        </div>
      </div>

      {/* enrolled users */}
      <table className="min-w-full border border-gray-300 text-sm">
        <thead className="bg-gray-100">
          <tr>
            <th className="border px-3 py-2">S.No</th>
            <th className="border px-3 py-2">User ID</th>
            <th className="border px-3 py-2">Name</th>
            <th className="border px-3 py-2">Email</th>
            <th className="border px-3 py-2">Mobile</th>
            <th className="border px-3 py-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {webinar.user.length ? (
            webinar.user.map((entry, idx) => (
              <tr key={entry.user?._id || idx}>
                <td className="border px-3 py-2">{idx + 1}</td>
                <td className="border px-3 py-2">{entry.user?._id ?? 'N/A'}</td>
                <td className="border px-3 py-2">{entry.user?.fullName ?? 'Unknown'}</td>
                <td className="border px-3 py-2">{entry.user?.email ?? 'Unknown'}</td>
                <td className="border px-3 py-2">{entry.user?.mobileNumber ?? 'Unknown'}</td>
                <td className="border px-3 py-2">
                  {entry.user ? (
                    entry.status ? (
                      <button
                        className="bg-green-600 text-white px-2 py-1 rounded cursor-default"
                        disabled
                      >
                        Enrolled
                      </button>
                    ) : (
                      <>
                        <button
                          className="bg-green-600 text-white px-2 py-1 rounded mr-2"
                          onClick={() => updateStatus(webinar._id, entry.user._id, true)}
                        >
                          Accept
                        </button>
                        <button
                          className="bg-red-500 text-white px-2 py-1 rounded"
                          onClick={() => updateStatus(webinar._id, entry.user._id, false)}
                        >
                          Reject
                        </button>
                      </>
                    )
                  ) : (
                    <span className="text-red-500">User not found</span>
                  )}
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={6} className="text-center py-2">No users enrolled</td>
            </tr>
          )}
        </tbody>
      </table>

      {/* back */}
      <Link href="/academy/livewebinars" className="inline-block">
        <Button className="mt-4">Back</Button>
      </Link>
    </div>
  );
};

export default WebinarDetailPage;