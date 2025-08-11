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

  const router = useRouter();

  // Handle image file selection
  

    const handleMainImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
          const file = e.target.files?.[0];
          if (file) {
              setMainImageFile(file);
             // Clear existing URL if a new file is selected, as new file takes precedence
          } else {
              // If user clears selection, reset file but keep current URL if it exists
              setMainImageFile(null);
              // Don't change imageUrl here; it means they might want to keep the old one.
              // The handleSubmit will send `currentImageUrl` if mainImageFile is null.
          }
      };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!fullName || !mainImageFile || !description || !videoUrl) {
      alert('All fields are required.');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('fullName', fullName);
      formData.append('imageFile', mainImageFile);
      formData.append('description', description);
      formData.append('videoUrl', videoUrl);

      await axios.post('/api/academy/understandingfetchtrue', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setFullName('');
      setMainImageFile(null);
      setDescription('');
      setVideoUrl('');

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
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Enter full name"
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* Image Upload */}
        <div>
          <Label htmlFor="mainImage">Main Image</Label>
          <FileInput
            id="mainImage"
            type="file"
            accept="image/*"
            onChange={handleMainImageChange}
            className="w-full"
          />
          {mainImageFile && <p>Selected: {mainImageFile.name}</p>}
        </div>

        {/* Description */}
        <div>
          <Label htmlFor="description" className="text-gray-700 font-medium mb-1 block">
            Description
          </Label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Enter description"
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 min-h-[100px]"
          />
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
            onChange={(e) => setVideoUrl(e.target.value)}
            placeholder="Paste YouTube video URL"
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          />
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
