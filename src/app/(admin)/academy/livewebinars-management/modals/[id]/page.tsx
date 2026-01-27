'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useLiveWebinars } from '@/context/LiveWebinarContext';
import Label from '@/components/form/Label';
import Input from '@/components/form/input/InputField';
import FileInput from '@/components/form/input/FileInput';
import Image from 'next/image';
import Button from '@/components/ui/button/Button';
import Link from 'next/link';

const EditLiveWebinarPage = () => {
  const router = useRouter();
  const { id } = useParams();
  const { webinars, updateWebinar } = useLiveWebinars();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  
  // Validation states
  const [errors, setErrors] = useState<{
    name?: string;
    description?: string;
    videoUrl?: string;
    date?: string;
    startTime?: string;
    endTime?: string;
    imageFile?: string;
  }>({});

  useEffect(() => {
    if (id && webinars.length > 0) {
      const selected = webinars.find(w => w._id === id);
      if (selected) {
        setName(selected.name);
        setDescription(selected.description || '');
        setVideoUrl(Array.isArray(selected.displayVideoUrls) ? selected.displayVideoUrls[0] : selected.displayVideoUrls || '');
        setDate(selected.date || '');
        setStartTime(selected.startTime || '');
        setEndTime(selected.endTime || '');
        setImageUrl(selected.imageUrl || null);
      }
    }
  }, [id, webinars]);

  // Validation functions
  const validateName = (name: string): boolean => {
    const nameRegex = /^[a-zA-ZÀ-ÿ0-9\s.,!?@#$%^&*()_+\-=[\]{};':"\\|<>`~]+$/;
    return nameRegex.test(name.trim()) && name.trim().length > 0;
  };

  const validateDescription = (desc: string): boolean => {
    const descRegex = /^[a-zA-Z0-9\s.,!?@#$%^&*()_+\-=[\]{};':"\\|<>`~]+$/;
    return descRegex.test(desc.trim()) && desc.trim().length > 0;
  };

  const validateVideoUrl = (url: string): boolean => {
    // Allow any valid URL for webinar links
    const urlRegex = /^(https?:\/\/)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/;
    return urlRegex.test(url.trim());
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

    // Name validation
    if (!name.trim()) {
      newErrors.name = 'Webinar Name is required.';
    } else if (!validateName(name)) {
      newErrors.name = 'Webinar Name contains invalid characters.';
    }

    // Description validation
    if (!description.trim()) {
      newErrors.description = 'Description is required.';
    } else if (!validateDescription(description)) {
      newErrors.description = 'Description contains invalid characters.';
    }

    // Video URL validation
    if (!videoUrl.trim()) {
      newErrors.videoUrl = 'Webinar Link is required.';
    } else if (!validateVideoUrl(videoUrl)) {
      newErrors.videoUrl = 'Please enter a valid URL.';
    }

    // Date validation
    if (!date.trim()) {
      newErrors.date = 'Date is required.';
    } else {
      const selectedDate = new Date(date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (selectedDate < today) {
        newErrors.date = 'Date cannot be in the past.';
      }
    }

    // Start Time validation
    if (!startTime.trim()) {
      newErrors.startTime = 'Start Time is required.';
    }

    // End Time validation
    if (!endTime.trim()) {
      newErrors.endTime = 'End Time is required.';
    } else if (startTime && endTime) {
      if (endTime <= startTime) {
        newErrors.endTime = 'End Time must be after Start Time.';
      }
    }

    // Image validation (only if new file is selected)
    if (selectedFile) {
      const imageError = validateImage(selectedFile, 1);
      if (imageError) {
        newErrors.imageFile = imageError;
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const validationError = validateImage(file, 1);
      if (validationError) {
        setErrors(prev => ({
          ...prev,
          imageFile: validationError
        }));
        setSelectedFile(null);
        e.target.value = ''; // Clear the file input
        return;
      }
      
      setSelectedFile(file);
      // Clear any previous image error
      setErrors(prev => ({ ...prev, imageFile: undefined }));
    } else {
      setSelectedFile(null);
      setErrors(prev => ({ ...prev, imageFile: undefined }));
    }
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setName(value);
    
    // Clear error when user starts typing
    if (errors.name) {
      setErrors(prev => ({ ...prev, name: undefined }));
    }
  };

  const handleDescriptionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setDescription(value);
    
    // Clear error when user starts typing
    if (errors.description) {
      setErrors(prev => ({ ...prev, description: undefined }));
    }
  };

  const handleVideoUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setVideoUrl(value);
    
    // Clear error when user starts typing
    if (errors.videoUrl) {
      setErrors(prev => ({ ...prev, videoUrl: undefined }));
    }
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setDate(value);
    
    // Clear error when user starts typing
    if (errors.date) {
      setErrors(prev => ({ ...prev, date: undefined }));
    }
  };

  const handleStartTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setStartTime(value);
    
    // Clear error when user starts typing
    if (errors.startTime) {
      setErrors(prev => ({ ...prev, startTime: undefined }));
    }
    // Clear end time error if it was about time ordering
    if (errors.endTime === 'End Time must be after Start Time.') {
      setErrors(prev => ({ ...prev, endTime: undefined }));
    }
  };

  const handleEndTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEndTime(value);
    
    // Clear error when user starts typing
    if (errors.endTime) {
      setErrors(prev => ({ ...prev, endTime: undefined }));
    }
  };

  const handleUpdate = async () => {
    if (!id) return;

    // Validate form before submission
    if (!validateForm()) {
      alert('Please fix the validation errors before submitting.');
      return;
    }

    const formData = new FormData();
    formData.append('name', name.trim());
    formData.append('description', description.trim());
    formData.append('date', date.trim());
    formData.append('startTime', startTime.trim());
    formData.append('endTime', endTime.trim());
    formData.append('displayVideoUrls', videoUrl.trim());

    if (selectedFile) {
      formData.append('imageUrl', selectedFile);
    }

    try {
      await updateWebinar(id as string, formData);
      alert('Webinar updated successfully');
      resetForm();
      router.push('/academy/livewebinars-management/livewebinars-list');
    } catch (error) {
      console.error('Error updating webinar:', error);
    }
  };

   const resetForm = () => {   
        setName('');
        setDescription('');
        setVideoUrl('');
        setDate('');
        setStartTime('');
        setEndTime('');
        setSelectedFile(null);
        setImageUrl(null);
        setErrors({});
    };

  return (
    <div className="w-full h-full px-6 md:px-10 lg:px-20 py-10 overflow-y-auto">
      <h1 className="text-3xl font-bold text-black mb-8 text-center">Edit Live Webinar</h1>

      <form className="space-y-8">
        {/* Name */}
        <div>
          <Label htmlFor="name">Webinar Name</Label>
          <Input 
            id="name" 
            value={name} 
            onChange={handleNameChange} 
            className={errors.name ? 'border-red-500' : ''}
          />
          {errors.name && (
            <p className="text-red-500 text-sm mt-1">{errors.name}</p>
          )}
        </div>
    
        {/* Description */}
        <div>
          <Label htmlFor="description">Description</Label>
          <Input 
            id="description" 
            value={description} 
            onChange={handleDescriptionChange} 
            className={errors.description ? 'border-red-500' : ''}
          />
          {errors.description && (
            <p className="text-red-500 text-sm mt-1">{errors.description}</p>
          )}
        </div>

        {/* Video URL */}
        <div>
          <Label htmlFor="videoUrl">Webinar Link</Label>
          <Input 
            id="videoUrl" 
            value={videoUrl} 
            onChange={handleVideoUrlChange} 
            className={errors.videoUrl ? 'border-red-500' : ''}
          />
          {errors.videoUrl && (
            <p className="text-red-500 text-sm mt-1">{errors.videoUrl}</p>
          )}
        </div>

        {/* Date & Time */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <Label htmlFor="date">Date</Label>
            <Input 
              type="date" 
              id="date" 
              value={date} 
              onChange={handleDateChange}
              min={new Date().toISOString().split('T')[0]}
              className={errors.date ? 'border-red-500' : ''}
            />
            {errors.date && (
              <p className="text-red-500 text-sm mt-1">{errors.date}</p>
            )}
          </div>

          <div>
            <Label htmlFor="startTime">Start Time</Label>
            <Input 
              type="time" 
              id="startTime" 
              value={startTime} 
              onChange={handleStartTimeChange}
              className={errors.startTime ? 'border-red-500' : ''}
            />
            {errors.startTime && (
              <p className="text-red-500 text-sm mt-1">{errors.startTime}</p>
            )}
          </div>

          <div>
            <Label htmlFor="endTime">End Time</Label>
            <Input 
              type="time" 
              id="endTime" 
              value={endTime} 
              onChange={handleEndTimeChange}
              min={startTime}
              className={errors.endTime ? 'border-red-500' : ''}
            />
            {errors.endTime && (
              <p className="text-red-500 text-sm mt-1">{errors.endTime}</p>
            )}
          </div>
        </div>

        {/* Image Upload */}
        <div>
          <Label htmlFor="image">Upload Image</Label>
          <FileInput 
            id="image" 
            onChange={handleFileChange}
            className={errors.imageFile ? 'border-red-500' : ''}
          />
          {errors.imageFile && (
            <p className="text-red-500 text-sm mt-1">{errors.imageFile}</p>
          )}
          {(selectedFile || imageUrl) && (
            <div className="mt-4 w-40 h-40">
              <Image
                src={selectedFile ? URL.createObjectURL(selectedFile) : imageUrl!}
                alt="Webinar Image"
                width={160}
                height={160}
                className="object-cover rounded"
              />
              {selectedFile && !errors.imageFile && (
                <p className="text-green-600 text-sm mt-1">
                  ✓ Valid: {selectedFile.name} ({(selectedFile.size / (1024 * 1024)).toFixed(2)}MB)
                </p>
              )}
            </div>
          )}
          <p className="text-xs text-gray-500 mt-1">
            Max size: 1MB | Supported: JPEG, JPG, PNG, WEBP, GIF
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-4">
          <Link href="/academy/livewebinars-management/livewebinars-list" passHref>
            <Button variant="outline">Back</Button>
          </Link>
          <Button 
            onClick={handleUpdate}
            disabled={Object.keys(errors).length > 0}
            className={Object.keys(errors).length > 0 ? 'opacity-50 cursor-not-allowed' : ''}
          >
            Save Changes
          </Button>
        </div>
      </form>
    </div>
  );
};

export default EditLiveWebinarPage;