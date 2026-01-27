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
  
  // Validation states
  const [errors, setErrors] = useState<{
    title?: string;
    videoUrl?: string;
    imageFile?: string;
  }>({});

  // ✅ Fetch existing data
  useEffect(() => {
    const fetchReview = async () => {
      try {
        const res = await axios.get(`/api/partnerreview/${id}`);
        const review = res.data.data;
        setEditTitle(review.title);
        setEditVideoUrl(review.videoUrl || '');
        setCurrentImageUrl(review.imageUrl || null);
        // Clear errors when loading data
        setErrors({});
      } catch (error) {
        console.error('Error fetching review:', error);
        alert('Failed to load review details');
      }
    };

    if (id) fetchReview();
  }, [id]);

  // Validation functions
  const validateTitle = (title: string): boolean => {
    // Allows letters, numbers, spaces, and basic punctuation
    const titleRegex = /^[a-zA-ZÀ-ÿ0-9\s.,!?@#$%^&*()_+\-=[\]{};':"\\|<>`~]+$/;
    return titleRegex.test(title.trim()) && title.trim().length > 0;
  };

  const validateYouTubeUrl = (url: string): boolean => {
    // Enhanced YouTube URL validation
    if (!url.trim()) return true; // Optional in edit mode
    
    const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.?be)\/.+$/;
    
    if (!youtubeRegex.test(url.trim())) {
      return false;
    }
    
    // Additional check for common YouTube URL patterns
    const urlLower = url.toLowerCase();
    return (
      urlLower.includes('youtube.com/watch') || 
      urlLower.includes('youtu.be/') ||
      urlLower.includes('youtube.com/embed/') ||
      urlLower.includes('youtube.com/v/') ||
      urlLower.includes('youtube.com/shorts/')
    );
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
    const newErrors: typeof errors = {};

    // Title validation
    if (!editTitle.trim()) {
      newErrors.title = 'Title is required.';
    } else if (!validateTitle(editTitle)) {
      newErrors.title = 'Title can only contain letters, numbers, spaces, and basic punctuation.';
    }

    // Video URL validation (optional in edit mode)
    if (editVideoUrl.trim() && !validateYouTubeUrl(editVideoUrl)) {
      newErrors.videoUrl = 'Please enter a valid YouTube URL. Examples:\n• https://youtube.com/watch?v=VIDEO_ID\n• https://youtu.be/VIDEO_ID\n• https://youtube.com/embed/VIDEO_ID';
    }

    // Image validation (only if new file is selected)
    if (editImageFile) {
      const imageError = validateImage(editImageFile, 1);
      if (imageError) {
        newErrors.imageFile = imageError;
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEditTitle(value);
    
    // Clear error when user starts typing
    if (errors.title) {
      setErrors(prev => ({ ...prev, title: undefined }));
    }
  };

  const handleVideoUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEditVideoUrl(value);
    
    // Clear error when user starts typing
    if (errors.videoUrl) {
      setErrors(prev => ({ ...prev, videoUrl: undefined }));
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    
    if (file) {
      const validationError = validateImage(file, 1);
      if (validationError) {
        setErrors(prev => ({
          ...prev,
          imageFile: validationError
        }));
        setEditImageFile(null);
        e.target.value = ''; // Clear the file input
        return;
      }
      
      setEditImageFile(file);
      // Clear error if file is valid
      setErrors(prev => ({ ...prev, imageFile: undefined }));
    } else {
      setEditImageFile(null);
      setErrors(prev => ({ ...prev, imageFile: undefined }));
    }
  };

  // Check if form is ready to submit
  const isFormReady = () => {
    // Check if required fields have values
    if (!editTitle.trim()) {
      return false;
    }
    
    // Check if there are any validation errors
    if (errors.title || errors.videoUrl || errors.imageFile) {
      return false;
    }
    
    // Additional validation check
    return validateTitle(editTitle) && 
           (editVideoUrl.trim() ? validateYouTubeUrl(editVideoUrl) : true);
  };

  // ✅ Handle update
  const handleUpdate = async () => {
    // Validate form before submission
    if (!validateForm()) {
      alert('Please fix the validation errors before submitting.');
      return;
    }

    const fd = new FormData();
    fd.append('title', editTitle.trim());
    fd.append('videoUrl', editVideoUrl.trim());
    if (editImageFile) fd.append('imageUrl', editImageFile);
    // Send current image URL if no new file is selected
    if (!editImageFile && currentImageUrl) {
      fd.append('currentImageUrl', currentImageUrl);
    }

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
            onChange={handleTitleChange}
            placeholder="Enter title (letters and numbers allowed)"
            className={errors.title ? 'border-red-500' : ''}
          />
          {errors.title && (
            <p className="text-red-500 text-sm mt-1">{errors.title}</p>
          )}
          <p className="text-xs text-gray-500 mt-1">
            Can contain letters, numbers, spaces, and basic punctuation
          </p>
        </div>

        {/* YouTube Video URL */}
        <div>
          <Label>YouTube Video URL</Label>
          <Input
            value={editVideoUrl}
            onChange={handleVideoUrlChange}
            placeholder="Enter YouTube link (optional)"
            className={errors.videoUrl ? 'border-red-500' : ''}
          />
          {errors.videoUrl && (
            <p className="text-red-500 text-sm mt-1 whitespace-pre-line">{errors.videoUrl}</p>
          )}
          <p className="text-xs text-gray-500 mt-1">
            Optional. Accepts: youtube.com/watch, youtu.be, youtube.com/embed
          </p>
        </div>

        {/* Image Upload */}
        <div>
          <Label>Replace Image (optional)</Label>
          <FileInput
            accept="image/*"
            onChange={handleImageChange}
            className={errors.imageFile ? 'border-red-500' : ''}
          />
          {errors.imageFile && (
            <p className="text-red-500 text-sm mt-1 whitespace-pre-line">{errors.imageFile}</p>
          )}
          {(editImageFile || currentImageUrl) && (
            <div className="mt-3">
              <Image
                src={editImageFile ? URL.createObjectURL(editImageFile) : currentImageUrl!}
                width={150}
                height={150}
                alt="Partner Review"
                className="rounded object-cover"
              />
              {editImageFile && !errors.imageFile && (
                <p className="text-green-600 text-sm mt-1">
                  ✓ Valid: {editImageFile.name} ({(editImageFile.size / (1024 * 1024)).toFixed(2)}MB)
                </p>
              )}
            </div>
          )}
          <p className="text-xs text-gray-500 mt-1">
            Max size: 1MB | Supported: JPEG, JPG, PNG, WEBP, GIF
          </p>
        </div>
      </div>

      {/* Buttons */}
      <div className="flex justify-end gap-4 mt-10">
        <Link href="/preferences/partner-review/entry-list">
          <Button variant="outline">Cancel</Button>
        </Link>
        <Button 
          onClick={handleUpdate} 
          disabled={loading || !isFormReady()}
          className={!isFormReady() ? 'opacity-50 cursor-not-allowed' : ''}
        >
          {loading ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>
    </div>
  );
};

export default EditPartnerReviewPage;