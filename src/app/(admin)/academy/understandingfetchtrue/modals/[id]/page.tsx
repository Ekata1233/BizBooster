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
  const [validationErrors, setValidationErrors] = useState<{
    fullName?: string;
    description?: string;
    videoUrl?: string;
    imageFile?: string;
  }>({});

  // Validation functions
  const validateFullName = (name: string): boolean => {
    const nameRegex = /^[a-zA-ZÀ-ÿ\s'-]+$/;
    return nameRegex.test(name.trim());
  };

  const validateDescription = (desc: string): boolean => {
    const descRegex = /^[a-zA-Z0-9\s.,!?@#$%^&*()_+\-=[\]{};':"\\|<>`~]+$/;
    return descRegex.test(desc.trim()) && desc.trim().length > 0;
  };

  const validateYouTubeUrl = (url: string): boolean => {
    const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.?be)\/.+$/;
    return youtubeRegex.test(url.trim());
  };

  const validateImage = (file: File, maxSizeMB: number = 1): string | null => {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      return `Invalid file type. Allowed types: ${allowedTypes.join(', ')}`;
    }

    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      return `Image size must be less than or equal to ${maxSizeMB}MB. Current size: ${(file.size / (1024 * 1024)).toFixed(2)}MB`;
    }

    return null;
  };

  const validateForm = (): boolean => {
    const newErrors: typeof validationErrors = {};

    // Full Name validation
    if (!editName.trim()) {
      newErrors.fullName = 'Full Name is required.';
    } else if (!validateFullName(editName)) {
      newErrors.fullName = 'Full Name should contain only letters, spaces, hyphens, and apostrophes.';
    }

    // Description validation
    if (!editDescription.trim()) {
      newErrors.description = 'Description is required.';
    } else if (!validateDescription(editDescription)) {
      newErrors.description = 'Description should contain only letters, numbers, and basic punctuation.';
    }

    // Video URL validation
    if (!editYoutubeUrl.trim()) {
      newErrors.videoUrl = 'YouTube Video URL is required.';
    } else if (!validateYouTubeUrl(editYoutubeUrl)) {
      newErrors.videoUrl = 'Please enter a valid YouTube URL.';
    }

    // Image validation (only if new file is selected)
    if (newImageFile) {
      const imageError = validateImage(newImageFile, 1);
      if (imageError) {
        newErrors.imageFile = imageError;
      }
    }

    setValidationErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

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
      const validationError = validateImage(file, 1);
      if (validationError) {
        setValidationErrors(prev => ({
          ...prev,
          imageFile: validationError
        }));
        setNewImageFile(null);
        e.target.value = ''; // Clear the file input
        return;
      }
      
      setNewImageFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      // Clear any previous image error
      setValidationErrors(prev => ({ ...prev, imageFile: undefined }));
    } else {
      setNewImageFile(null);
      setValidationErrors(prev => ({ ...prev, imageFile: undefined }));
    }
  };

  const handleFullNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEditName(value);
    
    // Clear error when user starts typing
    if (validationErrors.fullName) {
      setValidationErrors(prev => ({ ...prev, fullName: undefined }));
    }
  };

  const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setEditDescription(value);
    
    // Clear error when user starts typing
    if (validationErrors.description) {
      setValidationErrors(prev => ({ ...prev, description: undefined }));
    }
  };

  const handleYoutubeUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEditYoutubeUrl(value);
    
    // Clear error when user starts typing
    if (validationErrors.videoUrl) {
      setValidationErrors(prev => ({ ...prev, videoUrl: undefined }));
    }
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validate form before submission
    if (!validateForm()) {
      alert('Please fix the validation errors before submitting.');
      return;
    }

    if (!entryId || !entryData) {
      setError('Cannot save: Missing entry ID or entry data.');
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
            onChange={handleFullNameChange}
            placeholder="Enter full name (letters only)"
            className={`w-full ${validationErrors.fullName ? 'border-red-500' : ''}`}
          />
          {validationErrors.fullName && (
            <p className="text-red-500 text-sm mt-1">{validationErrors.fullName}</p>
          )}
        </div>

        <div>
          <Label htmlFor="editDescription">Description</Label>
          <textarea
            id="editDescription"
            value={editDescription}
            onChange={handleDescriptionChange}
            placeholder="Enter description (letters and numbers allowed)"
            className={`w-full border rounded-md p-2 ${validationErrors.description ? 'border-red-500' : ''}`}
            rows={4}
          />
          {validationErrors.description && (
            <p className="text-red-500 text-sm mt-1">{validationErrors.description}</p>
          )}
        </div>

        <div>
          <Label htmlFor="imageFile">Image</Label>

          {/* Preview: if user chose new file show preview, otherwise show current image */}
          {previewUrl ? (
            <div className="mb-2">
              <img src={previewUrl} alt="New preview" className="w-full h-48 object-cover rounded" />
              {newImageFile && !validationErrors.imageFile && (
                <p className="text-green-600 text-sm mt-1">
                  ✓ Valid: {newImageFile.name} ({(newImageFile.size / (1024 * 1024)).toFixed(2)}MB)
                </p>
              )}
            </div>
          ) : currentImageUrl ? (
            <img src={currentImageUrl} alt="Current" className="w-full h-48 object-cover rounded mb-2" />
          ) : null}

          <FileInput
            id="imageFile"
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className={`w-full ${validationErrors.imageFile ? 'border-red-500' : ''}`}
          />
          {validationErrors.imageFile && (
            <p className="text-red-500 text-sm mt-1">{validationErrors.imageFile}</p>
          )}
          <p className="text-sm text-gray-500 mt-1">
            Choose a new image to replace the current one (optional). Max size: 1MB | Supported: JPEG, JPG, PNG, WEBP, GIF
          </p>
        </div>

        <div>
          <Label htmlFor="editYoutubeUrl">YouTube Video URL</Label>
          <Input
            id="editYoutubeUrl"
            type="url"
            value={editYoutubeUrl}
            onChange={handleYoutubeUrlChange}
            placeholder="Paste YouTube video URL (e.g., https://youtube.com/watch?v=...)"
            className={`w-full ${validationErrors.videoUrl ? 'border-red-500' : ''}`}
          />
          {validationErrors.videoUrl && (
            <p className="text-red-500 text-sm mt-1">{validationErrors.videoUrl}</p>
          )}
        </div>

        <div className="flex justify-end gap-4 mt-6">
          <button
            className="border border-black rounded-md p-2"
            onClick={() => router.push('/academy/understandingfetchtrue')}
            type="button"
          >
            Cancel
          </button>
          <Button 
            type="submit" 
            disabled={saving}
            className={Object.keys(validationErrors).length > 0 ? 'opacity-50 cursor-not-allowed' : ''}
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default EditEntryPage;