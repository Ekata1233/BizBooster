'use client';

import { useState } from 'react';
import axios from 'axios';
import Input from '@/components/form/input/InputField';
import Label from '@/components/form/Label';
import Button from '@/components/ui/button/Button';
import { useRouter } from 'next/navigation';
import FileInput from '@/components/form/input/FileInput';

const AddUnderstandingEntryPage = () => {
  const [fullName, setFullName] = useState('');
  const [mainImageFile, setMainImageFile] = useState<File | null>(null);
  const [description, setDescription] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [errors, setErrors] = useState<{
    fullName?: string;
    mainImageFile?: string;
    description?: string;
    videoUrl?: string;
  }>({});

  const router = useRouter();

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

  // Updated image validation function
  const validateImage = (file: File, maxSizeMB: number = 1): string | null => {
    // Check file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      return `Invalid file type. Allowed types: ${allowedTypes.join(', ')}`;
    }

    // Check file size (1MB = 1024 * 1024 bytes)
    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      return `Image size must be less than or equal to ${maxSizeMB}MB. Current size: ${(file.size / (1024 * 1024)).toFixed(2)}MB`;
    }

    return null;
  };

  const validateForm = (): boolean => {
    const newErrors: typeof errors = {};

    // Full Name validation
    if (!fullName.trim()) {
      newErrors.fullName = 'Full Name is required.';
    } else if (!validateFullName(fullName)) {
      newErrors.fullName = 'Full Name should contain only letters, spaces, hyphens, and apostrophes.';
    }

    // Main Image validation
    if (!mainImageFile) {
      newErrors.mainImageFile = 'Main Image is required.';
    } else if (!mainImageFile.type.startsWith('image/')) {
      newErrors.mainImageFile = 'Please upload a valid image file.';
    } else {
      // Additional validation for image size and type
      const imageError = validateImage(mainImageFile, 1);
      if (imageError) {
        newErrors.mainImageFile = imageError;
      }
    }

    // Description validation
    if (!description.trim()) {
      newErrors.description = 'Description is required.';
    } else if (!validateDescription(description)) {
      newErrors.description = 'Description should contain only letters, numbers, and basic punctuation.';
    }

    // Video URL validation
    if (!videoUrl.trim()) {
      newErrors.videoUrl = 'YouTube Video URL is required.';
    } else if (!validateYouTubeUrl(videoUrl)) {
      newErrors.videoUrl = 'Please enter a valid YouTube URL.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleMainImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file using the new validateImage function
      const validationError = validateImage(file, 1);
      if (validationError) {
        setErrors(prev => ({
          ...prev,
          mainImageFile: validationError
        }));
        setMainImageFile(null);
        e.target.value = ''; // Clear the file input
        return;
      }
      
      setMainImageFile(file);
      // Clear error if file is valid
      setErrors(prev => ({ ...prev, mainImageFile: undefined }));
    } else {
      setMainImageFile(null);
      setErrors(prev => ({ ...prev, mainImageFile: undefined }));
    }
  };

  const handleFullNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFullName(value);
    
    if (errors.fullName) {
      setErrors(prev => ({ ...prev, fullName: undefined }));
    }
  };

  const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setDescription(value);
    
    if (errors.description) {
      setErrors(prev => ({ ...prev, description: undefined }));
    }
  };

  const handleVideoUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setVideoUrl(value);
    
    if (errors.videoUrl) {
      setErrors(prev => ({ ...prev, videoUrl: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate form before submission
    if (!validateForm()) {
      alert('Please fix the validation errors before submitting.');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('fullName', fullName.trim());
      
      if (mainImageFile) {
        formData.append('imageFile', mainImageFile);
      }
      
      formData.append('description', description.trim());
      formData.append('videoUrl', videoUrl.trim());

      await axios.post('/api/academy/understandingfetchtrue', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      // Reset form
      setFullName('');
      setMainImageFile(null);
      setDescription('');
      setVideoUrl('');
      setErrors({});

      alert('Entry submitted successfully!');
      router.push('/academy/understandingfetchtrue');
    } catch (error) {
      console.error('Error submitting entry:', error);
      alert('Failed to submit entry. Please try again.');
    }
  };

  return (
    <div className="p-6 w-full mx-auto font-sans">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">
        Add New Understanding Entry
      </h1>

      <form
        onSubmit={handleSubmit}
        className="mb-10 p-6 bg-white rounded-lg shadow-md space-y-5"
      >
        {/* Full Name */}
        <div>
          <Label htmlFor="fullName" className="text-gray-700 font-medium mb-1 block">
            Full Name
          </Label>
          <Input
            id="fullName"
            type="text"
            value={fullName}
            onChange={handleFullNameChange}
            placeholder="Enter full name (letters only)"
            className={`w-full p-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 ${
              errors.fullName ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {errors.fullName && (
            <p className="text-red-500 text-sm mt-1">{errors.fullName}</p>
          )}
        </div>

        {/* Image Upload */}
        <div>
          <Label htmlFor="mainImage">Main Image</Label>
          <FileInput
            id="mainImage"
            type="file"
            accept="image/*"
            onChange={handleMainImageChange}
            className={`w-full ${errors.mainImageFile ? 'border-red-500' : ''}`}
          />
          {mainImageFile && !errors.mainImageFile && (
            <p className="text-green-600 mt-1 text-sm">
              ✓ Valid: {mainImageFile.name} ({(mainImageFile.size / (1024 * 1024)).toFixed(2)}MB)
            </p>
          )}
          {errors.mainImageFile && (
            <p className="text-red-500 text-sm mt-1">{errors.mainImageFile}</p>
          )}
          <p className="text-xs text-gray-500 mt-1">Max size: 1MB | Supported: JPEG, JPG, PNG, WEBP, GIF</p>
        </div>

        {/* Description */}
        <div>
          <Label htmlFor="description" className="text-gray-700 font-medium mb-1 block">
            Description
          </Label>
          <textarea
            id="description"
            value={description}
            onChange={handleDescriptionChange}
            placeholder="Enter description (letters and numbers allowed)"
            className={`w-full p-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 min-h-[100px] ${
              errors.description ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {errors.description && (
            <p className="text-red-500 text-sm mt-1">{errors.description}</p>
          )}
        </div>

        {/* Video URL */}
        <div>
          <Label htmlFor="videoUrl" className="text-gray-700 font-medium mb-1 block">
            YouTube Video URL
          </Label>
          <Input
            id="videoUrl"
            type="url"
            value={videoUrl}
            onChange={handleVideoUrlChange}
            placeholder="Paste YouTube video URL (e.g., https://youtube.com/watch?v=...)"
            className={`w-full p-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 ${
              errors.videoUrl ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {errors.videoUrl && (
            <p className="text-red-500 text-sm mt-1">{errors.videoUrl}</p>
          )}
        </div>

        <Button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors duration-200 shadow-sm"
        >
          Submit
        </Button>
      </form>
    </div>
  );
};

export default AddUnderstandingEntryPage;