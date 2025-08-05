'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import axios from 'axios';

import Label from '@/components/form/Label';
import Input from '@/components/form/input/InputField';
import FileInput from '@/components/form/input/FileInput';
import Button from '@/components/ui/button/Button';

const EditPartnerReviewPage = () => {
  const router = useRouter();
  const { id } = useParams();

  const [editTitle, setEditTitle] = useState('');
  const [editImageFile, setEditImageFile] = useState<File | null>(null);
  const [currentImageUrl, setCurrentImageUrl] = useState<string | null>(null);
  const [editVideoUrl, setEditVideoUrl] = useState('');
  const [loading, setLoading] = useState(false);

  // ✅ Fetch existing data
  useEffect(() => {
    const fetchReview = async () => {
      try {
        const res = await axios.get(`/api/partnerreview/${id}`);
        const review = res.data.data;
        setEditTitle(review.title);
        setEditVideoUrl(review.videoUrl || '');
        setCurrentImageUrl(review.imageUrl || null);
      } catch (error) {
        console.error('Error fetching review:', error);
        alert('Failed to load review details');
      }
    };

    if (id) fetchReview();
  }, [id]);

  // ✅ Handle update
  const handleUpdate = async () => {
    if (!editTitle.trim()) {
      alert('Title is required');
      return;
    }

    const fd = new FormData();
    fd.append('title', editTitle);
    fd.append('videoUrl', editVideoUrl);
    if (editImageFile) fd.append('imageUrl', editImageFile);

    try {
      setLoading(true);
      await axios.put(`/api/partnerreview/${id}`, fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      alert('Partner Review updated successfully!');
      router.push('/preferences/partner-review/entry-list');
    } catch (error) {
      console.error('Error updating review:', error);
      alert('Failed to update review.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full mx-auto p-6 bg-white dark:bg-gray-900 rounded-2xl shadow-lg">
      <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-8">
        Edit Partner Review
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Title */}
        <div>
          <Label>Title</Label>
          <Input
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            placeholder="Enter title"
          />
        </div>

        
        <div>
          <Label>YouTube Video URL</Label>
          <Input
            value={editVideoUrl}
            onChange={(e) => setEditVideoUrl(e.target.value)}
            placeholder="Enter YouTube link"
          />
        </div>

      
        <div>
          <Label>Replace Image (optional)</Label>
          <FileInput
            accept="image/*"
            onChange={(e) => setEditImageFile(e.target.files?.[0] || null)}
          />
          {(editImageFile || currentImageUrl) && (
            <Image
              src={editImageFile ? URL.createObjectURL(editImageFile) : currentImageUrl!}
              width={150}
              height={150}
              alt="Partner Review"
              className="mt-3 rounded object-cover"
            />
          )}
        </div>
      </div>

      {/* Buttons */}
      <div className="flex justify-end gap-4 mt-10">
        <Link href="/preferences/partner-review/entry-list">
          <Button variant="outline">Cancel</Button>
        </Link>
        <Button onClick={handleUpdate} disabled={loading}>
          {loading ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>
    </div>
  );
};

export default EditPartnerReviewPage;
