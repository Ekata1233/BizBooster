'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import axios from 'axios';

import Label from '@/components/form/Label';
import Input from '@/components/form/input/InputField';
import Button from '@/components/ui/button/Button';

// Define interfaces (you might want to put these in a shared types file)
interface VideoItem {
  fileName: string;
  filePath: string;
}

interface Entry {
  _id: string;
  fullName: string;
  videoUrl: VideoItem[]; // <--- CHANGED from 'videos' to 'videoUrl'
}

const EditVideoEntryPage = () => {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();

  const entryId = params.id as string;
  const videoIndexStr = searchParams.get('videoIndex');
  const videoIndex = videoIndexStr ? parseInt(videoIndexStr, 10) : null;

  const [entryData, setEntryData] = useState<Entry | null>(null);
  const [editName, setEditName] = useState('');
  const [editYoutubeUrl, setEditYoutubeUrl] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (entryId && videoIndex !== null) {
      const fetchEntryAndVideo = async () => {
        try {
          const res = await axios.get(`/api/academy/understandingfetchtrue/${entryId}`);
          const fetchedEntry: Entry = res.data.data;

          if (!fetchedEntry) {
            setError('Entry not found.');
            setLoading(false);
            return;
          }

          // Ensure fetchedEntry.videoUrl is an array before accessing its length
          if (!fetchedEntry.videoUrl || !Array.isArray(fetchedEntry.videoUrl)) { // <--- CHANGED from 'videos' to 'videoUrl'
            setError('Entry data is malformed: videos array is missing or invalid.');
            setLoading(false);
            return;
          }

          if (videoIndex >= 0 && videoIndex < fetchedEntry.videoUrl.length) { // <--- CHANGED from 'videos' to 'videoUrl'
            setEntryData(fetchedEntry);
            setEditName(fetchedEntry.fullName);
            setEditYoutubeUrl(fetchedEntry.videoUrl[videoIndex].filePath || ''); // <--- CHANGED from 'videos' to 'videoUrl'
          } else {
            setError('Video not found at the specified index.');
          }
        } catch (err) {
          console.error('Error fetching entry for edit:', err);
          setError('Failed to load entry data. Please try again.');
        } finally {
          setLoading(false);
        }
      };
      fetchEntryAndVideo();
    } else {
      setError('Invalid entry ID or video index provided.');
      setLoading(false);
    }
  }, [entryId, videoIndex]);

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!entryId || videoIndex === null || !entryData) {
      setError('Cannot save: Missing entry ID, video index, or entry data.');
      return;
    }
    if (!editName.trim() || !editYoutubeUrl.trim()) {
      setError('Full Name and YouTube URL cannot be empty.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await axios.put(`/api/academy/understandingfetchtrue/${entryId}`, {
        fullName: editName,
        videoIndex: videoIndex,
        youtubeUrl: editYoutubeUrl,
      });

      alert('Video entry updated successfully!');
      router.push('/academy/understandingfetchtrue'); // Navigate back to the main list
    } catch (err) {
      console.error('Error saving edit:', err);
      setError('Failed to save changes. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p>Loading video entry details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen text-red-600">
        <p>Error: {error}</p>
        <Button onClick={() => router.push('/academy/understandingtrue')} className="mt-4">
          Go Back
        </Button>
      </div>
    );
  }

  if (!entryData) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen text-gray-700">
        <p>No entry found for editing.</p>
        <Button onClick={() => router.push('/academy/understandingtrue')} className="mt-4">
          Go Back
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 bg-white dark:bg-gray-900 rounded-2xl shadow">
      <h2 className="text-3xl font-bold text-center text-black dark:text-white mb-10">
        Edit Video Entry
      </h2>

      <form onSubmit={handleSaveEdit} className="space-y-6">
        <div>
          <Label htmlFor="editName">Full Name (for entry)</Label>
          <Input
            id="editName"
            type="text"
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            placeholder="Enter full name"
            className="w-full"
          />
        </div>
        <div>
          <Label htmlFor="editYoutubeUrl">YouTube Video URL</Label>
          <Input
            id="editYoutubeUrl"
            type="url"
            value={editYoutubeUrl}
            onChange={(e) => setEditYoutubeUrl(e.target.value)}
            placeholder="Paste YouTube video URL"
            className="w-full"
          />
        </div>

        <div className="flex justify-end gap-4 mt-10">
          <button variant="outline" onClick={() => router.push('/academy/understandingfetchtrue')} type="button">
            Cancel
          </button>
          <Button type="submit" disabled={loading}>
            {loading ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default EditVideoEntryPage;