// app/academy/understandingfetchtrue/add/page.tsx
'use client';

import { useState } from 'react';
import axios from 'axios';
import Input from '@/components/form/input/InputField';
import Label from '@/components/form/Label';
import Button from '@/components/ui/button/Button';
import { useRouter } from 'next/navigation';

const AddUnderstandingEntryPage = () => {
  const [fullName, setFullName] = useState('');
  const [youtubeUrls, setYoutubeUrls] = useState<string[]>([]);
  const [currentYoutubeUrl, setCurrentYoutubeUrl] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || youtubeUrls.length === 0) {
      alert('Full Name and at least one YouTube URL are required.');
      return;
    }

    try {
      await axios.post('/api/academy/understandingfetchtrue', {
        fullName,
        youtubeUrls,
      });
      setFullName('');
      setYoutubeUrls([]);
      setCurrentYoutubeUrl('');
      alert('Entry submitted successfully!');
      router.push('/academy/understandingfetchtrue'); // Redirect back to the entries page
    } catch (error) {
      console.error('Error submitting entry:', error);
      alert('Failed to submit entry. Please try again.');
    }
  };

  return (
    <div className="p-6 w-full mx-auto font-sans">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Add New Understanding Entry</h1>

      <form onSubmit={handleSubmit} className="mb-10 p-6 bg-white rounded-lg shadow-md space-y-5">
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
        <div>
          <Label htmlFor="youtubeUrl" className="text-gray-700 font-medium mb-1 block">
            YouTube Video URL
          </Label>
          <div className="flex gap-2">
            <Input
              id="youtubeUrl"
              type="url"
              value={currentYoutubeUrl}
              onChange={(e) => setCurrentYoutubeUrl(e.target.value)}
              placeholder="Paste YouTube video URL"
              className="flex-grow p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
            <button
              type="button"
              onClick={() => {
                if (currentYoutubeUrl) {
                  setYoutubeUrls((prev) => [...prev, currentYoutubeUrl]);
                  setCurrentYoutubeUrl('');
                }
              }}
              className="bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 transition-colors duration-200"
            >
              Add
            </button>
          </div>
          {youtubeUrls.length > 0 && (
            <div className="mt-2 text-sm text-gray-500">
              <p className="font-semibold">Added URLs:</p>
              <ul className="list-disc list-inside">
                {youtubeUrls.map((url, index) => (
                  <li key={index} className="flex justify-between items-center break-all">
                    {url}
                    <button
                      type="button"
                      onClick={() => setYoutubeUrls(youtubeUrls.filter((_, i) => i !== index))}
                      className="text-red-500 ml-2"
                      aria-label="Remove URL"
                    >
                      ×
                    </button>
                  </li>
                ))}
              </ul>
            </div>
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