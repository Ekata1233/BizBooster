
'use client';

import React, { useEffect, useState } from 'react';
import FileInput from '@/components/form/input/FileInput';
import Input from '@/components/form/input/InputField';
import Label from '@/components/form/Label';
import Button from '@/components/ui/button/Button';
import ComponentCard from '@/components/common/ComponentCard';
import { useAdvisor } from '@/context/Advisor';
import axios from 'axios';

// 1. Modify the interface to fully match Next.js App Router page props
interface AddAdvisorProps {
  params: {
    advisorId?: string; // This will capture the dynamic segment like [advisorId]
  };
  // Add this line to satisfy the PageProps constraint
  searchParams: { [key: string]: string | string[] | undefined }; 
}

// 2. Adjust the component's prop destructuring
const AddAdvisor: React.FC<AddAdvisorProps> = ({ params }) => {
  // Extract advisorId from params. It will be undefined if no dynamic segment is present.
  const advisorIdToEdit = params.advisorId;

  const { addAdvisor, updateAdvisor } = useAdvisor();

  const [name, setName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [chat, setChat] = useState('');
  const [language, setLanguage] = useState('');
  const [rating, setRating] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [imageUrl, setImageUrl] = useState<File | null>(null);
  const [fileInputKey, setFileInputKey] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAdvisor = async () => {
      // Now advisorIdToEdit correctly reflects the dynamic route segment
      if (!advisorIdToEdit) {
        resetForm();
        return;
      }

      try {
        setLoading(true);
        const res = await axios.get(`/api/advisor/${advisorIdToEdit}`);
        const data = res.data.data;

        setName(data.name || '');
        setPhoneNumber(data.phoneNumber || '');
        setChat(data.chat || '');
        setLanguage(data.language || '');
        setRating(data.rating?.toString() || '');
        setTags(data.tags || []);
        setImageUrl(null); // Clear image when fetching existing advisor
      } catch (err) {
        setError('Error fetching advisor details: ' + (err as Error).message);
      } finally {
        setLoading(false);
      }
    };

    fetchAdvisor();
  }, [advisorIdToEdit]); // Dependency array remains correct

  const resetForm = () => {
    setName('');
    setPhoneNumber('');
    setChat('');
    setLanguage('');
    setRating('');
    setTags([]);
    setTagInput('');
    setImageUrl(null);
    setError(null);
    setFileInputKey(prevKey => prevKey + 1);
  };

  const handleRemoveTag = (indexToRemove: number) => {
    setTags((prev) => prev.filter((_, i) => i !== indexToRemove));
  };

  const handleTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && tagInput.trim() !== '') {
      e.preventDefault();
      const newTag = tagInput.trim().replace(/^#/, '');
      if (!tags.includes(newTag)) {
        setTags([...tags, newTag]);
      }
      setTagInput('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name || !phoneNumber || !imageUrl || !language || !rating || !chat || tags.length === 0) {
      // IMPORTANT: Do NOT use alert() in production React/Next.js apps.
      // Use a custom modal or toast notification system for user feedback.
      alert('Please fill in all required fields.');
      return;
    }

    try {
      setLoading(true);

      const formData = new FormData();
      formData.append('name', name);
      formData.append('phoneNumber', phoneNumber);
      formData.append('chat', chat);
      formData.append('language', language);
      formData.append('rating', rating);
      tags.forEach(tag => formData.append('tags', tag));
      if (imageUrl) formData.append('imageUrl', imageUrl);


      if (advisorIdToEdit) {
        await updateAdvisor(advisorIdToEdit, formData);
        alert('Advisor updated successfully!'); // Replace with proper UI feedback
      } else {
        await addAdvisor(formData);
        alert('Advisor added successfully!'); // Replace with proper UI feedback
      }

      resetForm();
    } catch (err) {
      console.error('Submit error:', err);
      setError('Submission failed. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <ComponentCard title={advisorIdToEdit ? 'Edit Advisor' : 'Add New Advisor'}>
        {loading && <p className="text-blue-500">Loading...</p>}
        {error && <p className="text-red-500">{error}</p>}

        <form
          onSubmit={handleSubmit}
          encType="multipart/form-data"
          className="space-y-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 md:gap-6"
        >
          <div>
            <Label>Name</Label>
            <Input
              type="text"
              placeholder="Enter your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div>
            <Label>Main Image</Label>
            <FileInput
              accept="image/*"
              key={fileInputKey}
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  setImageUrl(file);
                }
              }}
            />
            {imageUrl && <p className="text-sm text-gray-500 mt-1">Selected: {imageUrl.name}</p>}
          </div>

          <div>
            <Label>Language</Label>
            <Input
              type="text"
              placeholder="Enter Language"
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
            />
          </div>

          <div>
            <Label>Phone Number</Label>
            <Input
              type="text"
              placeholder="Enter Phone Number"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
            />
          </div>

          <div className="col-span-2">
            <Label>Tags</Label>
            <div className="border rounded px-3 py-2 flex flex-wrap gap-2">
              {tags.map((tag, index) => (
                <span
                  key={index}
                  className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm flex items-center"
                >
                  #{tag}
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(index)}
                    className="ml-2 text-red-500 hover:text-red-700"
                  >
                    &times;
                  </button>
                </span>
              ))}
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleTagKeyDown}
                placeholder="Type a tag and press Enter"
                className="flex-grow outline-none py-1"
              />
            </div>
          </div>

          <div>
            <Label>Rating</Label>
            <Input
              type="text"
              placeholder="Enter Rating (e.g. 4.5)"
              value={rating}
              onChange={(e) => setRating(e.target.value)}
            />
          </div>

          <div>
            <Label>Chat</Label>
            <Input
              type="text"
              placeholder="Enter chat"
              value={chat}
              onChange={(e) => setChat(e.target.value)}
            />
          </div>

          <div className="col-span-full">
            <Button type="submit" size="sm" disabled={loading}>
              {advisorIdToEdit ? 'Update Advisor' : 'Add Advisor'}
            </Button>
          </div>
        </form>
      </ComponentCard>
    </div>
  );
};

export default AddAdvisor;