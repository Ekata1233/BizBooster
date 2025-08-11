'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import axios from 'axios';

import Label from '@/components/form/Label';
import Input from '@/components/form/input/InputField';
import FileInput from '@/components/form/input/FileInput';
import Button from '@/components/ui/button/Button';

interface Entry {
  _id: string;
  fullName: string;
  imageUrl: string;
  description: string;
  videoUrl: string;
}

const EditEntryPage = () => {
  const router = useRouter();
  const params = useParams();
  const entryId = params.id as string;

  const [entryData, setEntryData] = useState<Entry | null>(null);
  const [editName, setEditName] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editYoutubeUrl, setEditYoutubeUrl] = useState('');
  const [currentImageUrl, setCurrentImageUrl] = useState('');
  const [newImageFile, setNewImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!entryId) {
      setError('Invalid entry ID provided.');
      setLoading(false);
      return;
    }

    const fetchEntry = async () => {
      try {
        const res = await axios.get(`/api/academy/understandingfetchtrue/${entryId}`);
        const fetchedEntry: Entry = res.data.data;

        if (!fetchedEntry) {
          setError('Entry not found.');
          setLoading(false);
          return;
        }

        setEntryData(fetchedEntry);
        setEditName(fetchedEntry.fullName || '');
        setEditDescription(fetchedEntry.description || '');
        setEditYoutubeUrl(fetchedEntry.videoUrl || '');
        setCurrentImageUrl(fetchedEntry.imageUrl || '');
      } catch (err) {
        console.error('Error fetching entry for edit:', err);
        setError('Failed to load entry data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchEntry();
  }, [entryId]);

  // cleanup preview URL on change/unmount
  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
    if (file) {
      setNewImageFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    } else {
      setNewImageFile(null);
    }
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!entryId || !entryData) {
      setError('Cannot save: Missing entry ID or entry data.');
      return;
    }
    if (!editName.trim() || !editYoutubeUrl.trim()) {
      setError('Full Name and YouTube URL cannot be empty.');
      return;
    }

    setSaving(true);

    try {
      const formData = new FormData();
      formData.append('fullName', editName.trim());
      formData.append('description', editDescription.trim());
      formData.append('videoUrl', editYoutubeUrl.trim());

      // Only append new image when user selected one
      if (newImageFile) {
        formData.append('imageFile', newImageFile);
      }

      await axios.put(`/api/academy/understandingfetchtrue/${entryId}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      alert('Entry updated successfully!');
      router.push('/academy/understandingfetchtrue');
    } catch (err) {
      console.error('Error saving edit:', err);
      setError('Failed to save changes. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p>Loading entry details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen text-red-600">
        <p>Error: {error}</p>
        <Button onClick={() => router.push('/academy/understandingfetchtrue')} className="mt-4">
          Go Back
        </Button>
      </div>
    );
  }

  if (!entryData) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen text-gray-700">
        <p>No entry found for editing.</p>
        <Button onClick={() => router.push('/academy/understandingfetchtrue')} className="mt-4">
          Go Back
        </Button>
      </div>
    );
  }

  return (
    <div className="w-full mx-auto p-6 bg-white dark:bg-gray-900 rounded-2xl shadow">
      <h2 className="text-3xl font-bold text-center text-black dark:text-white mb-8">Edit Entry</h2>

      <form onSubmit={handleSaveEdit} className="space-y-6">
        <div>
          <Label htmlFor="editName">Full Name</Label>
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
          <Label htmlFor="editDescription">Description</Label>
          <textarea
            id="editDescription"
            value={editDescription}
            onChange={(e) => setEditDescription(e.target.value)}
            placeholder="Enter description"
            className="w-full border rounded-md p-2"
            rows={4}
          />
        </div>

        <div>
          <Label htmlFor="imageFile">Image</Label>

          {/* Preview: if user chose new file show preview, otherwise show current image */}
          {previewUrl ? (
            <img src={previewUrl} alt="New preview" className="w-full h-48 object-cover rounded mb-2" />
          ) : currentImageUrl ? (
            <img src={currentImageUrl} alt="Current" className="w-full h-48 object-cover rounded mb-2" />
          ) : null}

          <FileInput
            id="imageFile"
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="w-full"
          />
          <p className="text-sm text-gray-500 mt-1">
            Choose a new image to replace the current one (optional).
          </p>
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

        <div className="flex justify-end gap-4 mt-6">
          <button
            className="border border-black rounded-md p-2"
            onClick={() => router.push('/academy/understandingfetchtrue')}
            type="button"
          >
            Cancel
          </button>
          <Button type="submit" disabled={saving}>
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default EditEntryPage;
