'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';

import Label from '@/components/form/Label';
import Input from '@/components/form/input/InputField';
import FileInput from '@/components/form/input/FileInput';
import Button from '@/components/ui/button/Button';
import { useCertificate } from '@/context/CertificationContext';


interface ExistingVideoDetail {
  videoName: string;
  videoDescription: string;
  videoUrl: string;
  videoImageUrl?: string; // Optional field for existing video thumbnail URL
}

const EditCertificatePage = () => {
  const router = useRouter();
  const { id } = useParams();
  const { certificates, updateCertificate } = useCertificate();

  const [editId, setEditId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [mainImgFile, setMainImgFile] = useState<File | null>(null);
  const [currentImgUrl, setCurrentImgUrl] = useState<string | null>(null);

  // State to hold existing video URLs and their image URLs
  const [currentVideos, setCurrentVideos] = useState<ExistingVideoDetail[]>([]);

  // State for new video entries to be added
  const [newVideos, setNewVideos] = useState<
    { name: string; description: string; url: string; imageFile: File | null; imageUrl: string | null }[]
  >([{ name: '', description: '', url: '', imageFile: null, imageUrl: null }]); // Added imageFile and imageUrl for preview

  // Validation states
  const [errors, setErrors] = useState<{
    name?: string;
    description?: string;
    mainImage?: string;
    newVideos?: Array<{
      name?: string;
      description?: string;
      url?: string;
      imageFile?: string;
    }>;
  }>({});

  useEffect(() => {
    if (id && certificates.length > 0) {
      const cert = certificates.find((c) => c._id === id);
      if (!cert) return;

      setEditId(cert._id);
      setName(cert.name);
      setDescription(cert.description ?? '');
      setCurrentImgUrl(cert.imageUrl);
      // Populate currentVideos with existing data, including image URLs
      setCurrentVideos(cert.video || []);
      // Reset new videos fields, or pre-fill if you want to allow editing existing videos in the new section
      // For now, newVideos are for "additions". Existing videos are displayed separately.
      setNewVideos([{ name: '', description: '', url: '', imageFile: null, imageUrl: null }]);
      // Clear errors when loading data
      setErrors({});
    }
  }, [id, certificates]);

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
    // Allow any valid URL
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
    const videoErrors: Array<{ name?: string; description?: string; url?: string; imageFile?: string }> = [];

    // Tutorial Name validation
    if (!name.trim()) {
      newErrors.name = 'Tutorial Name is required.';
    } else if (!validateName(name)) {
      newErrors.name = 'Tutorial Name contains invalid characters.';
    }

    // Tutorial Description validation
    if (!description.trim()) {
      newErrors.description = 'Tutorial Description is required.';
    } else if (!validateDescription(description)) {
      newErrors.description = 'Tutorial Description contains invalid characters.';
    }

    // Main Image validation (only if new file is selected)
    if (mainImgFile) {
      const imageError = validateImage(mainImgFile, 1);
      if (imageError) {
        newErrors.mainImage = imageError;
      }
    }

    // New Videos validation
    let hasNewVideoData = false;
    newVideos.forEach((video, index) => {
      const videoError: { name?: string; description?: string; url?: string; imageFile?: string } = {};

      // Check if any field in this video is filled
      if (video.name.trim() || video.description.trim() || video.url.trim() || video.imageFile) {
        hasNewVideoData = true;

        // Video Name validation
        if (!video.name.trim()) {
          videoError.name = 'Video Name is required when adding new video.';
        } else if (!validateName(video.name)) {
          videoError.name = 'Video Name contains invalid characters.';
        }

        // Video Description validation
        if (!video.description.trim()) {
          videoError.description = 'Video Description is required when adding new video.';
        } else if (!validateDescription(video.description)) {
          videoError.description = 'Video Description contains invalid characters.';
        }

        // Video URL validation
        if (!video.url.trim()) {
          videoError.url = 'Video URL is required when adding new video.';
        } else if (!validateVideoUrl(video.url)) {
          videoError.url = 'Please enter a valid Video URL.';
        }

        // Video Image validation (if file is selected)
        if (video.imageFile) {
          const imageError = validateImage(video.imageFile, 1);
          if (imageError) {
            videoError.imageFile = imageError;
          }
        }
      }

      videoErrors.push(videoError);
    });

    // Only add video errors if there's at least one new video with data
    if (hasNewVideoData && videoErrors.some(error => Object.keys(error).length > 0)) {
      newErrors.newVideos = videoErrors;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handler for changing fields in a new video entry (name, description, url)
  const handleNewVideoChange = (
    idx: number,
    key: 'name' | 'description' | 'url',
    val: string
  ) => {
    setNewVideos((prev) =>
      prev.map((v, i) => (i === idx ? { ...v, [key]: val } : v))
    );

    // Clear errors for this field
    if (errors.newVideos?.[idx]) {
      setErrors(prev => {
        const updatedNewVideos = [...(prev.newVideos || [])];
        if (updatedNewVideos[idx]) {
          delete updatedNewVideos[idx][key];
          // Remove the video error entry if all errors are cleared
          if (Object.keys(updatedNewVideos[idx]).length === 0) {
            updatedNewVideos.splice(idx, 1);
          }
        }
        return {
          ...prev,
          newVideos: updatedNewVideos.length > 0 ? updatedNewVideos : undefined
        };
      });
    }
  };

  // Handler for changing the image file for a new video entry
  const handleNewVideoImageChange = (
    idx: number,
    file: File | null
  ) => {
    if (file) {
      const validationError = validateImage(file, 1);
      if (validationError) {
        setErrors(prev => {
          const updatedNewVideos = [...(prev.newVideos || [])];
          updatedNewVideos[idx] = {
            ...updatedNewVideos[idx],
            imageFile: validationError
          };
          return {
            ...prev,
            newVideos: updatedNewVideos
          };
        });
        setNewVideos((prev) =>
          prev.map((v, i) => i === idx ? { ...v, imageFile: null, imageUrl: null } : v)
        );
        return;
      }
    }

    setNewVideos((prev) =>
      prev.map((v, i) =>
        i === idx ? { ...v, imageFile: file, imageUrl: file ? URL.createObjectURL(file) : null } : v
      )
    );

    // Clear image error
    if (errors.newVideos?.[idx]?.imageFile) {
      setErrors(prev => {
        const updatedNewVideos = [...(prev.newVideos || [])];
        if (updatedNewVideos[idx]) {
          delete updatedNewVideos[idx].imageFile;
          // Remove the video error entry if all errors are cleared
          if (Object.keys(updatedNewVideos[idx]).length === 0) {
            updatedNewVideos.splice(idx, 1);
          }
        }
        return {
          ...prev,
          newVideos: updatedNewVideos.length > 0 ? updatedNewVideos : undefined
        };
      });
    }
  };

  const addNewVideoField = () =>
    setNewVideos((prev) => [...prev, { name: '', description: '', url: '', imageFile: null, imageUrl: null }]);

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

  const handleMainImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    
    if (file) {
      const validationError = validateImage(file, 1);
      if (validationError) {
        setErrors(prev => ({
          ...prev,
          mainImage: validationError
        }));
        setMainImgFile(null);
        e.target.value = ''; // Clear the file input
        return;
      }
      setMainImgFile(file);
      // Clear any previous image error
      setErrors(prev => ({ ...prev, mainImage: undefined }));
    } else {
      setMainImgFile(null);
      setErrors(prev => ({ ...prev, mainImage: undefined }));
    }
  };
 
const handleUpdate = async () => {
    if (!editId) return;

    // Validate form before submission
    if (!validateForm()) {
      alert('Please fix the validation errors before submitting.');
      return;
    }

    const fd = new FormData();
    fd.append('name', name.trim());
    fd.append('description', description.trim());

    // --- IMPORTANT CHANGE HERE FOR MAIN IMAGE ---
    if (mainImgFile) {
        // A new image file was selected
        fd.append('imageUrl', mainImgFile);
    } else if (currentImgUrl) {
        
        fd.append('currentImageUrl', currentImgUrl);
    } else {
      
        fd.append('currentImageUrl', 'null'); // Or an empty string if your backend prefers that to clear it
    }
    // --- END IMPORTANT CHANGE ---

    // Append new video data
    newVideos.forEach((v, index) => {
        if (v.url.trim() || v.name.trim() || v.description.trim() || v.imageFile) {
            fd.append(`newVideos[${index}][videoName]`, v.name.trim());
            fd.append(`newVideos[${index}][videoDescription]`, v.description.trim());
            fd.append(`newVideos[${index}][videoUrl]`, v.url.trim());
            if (v.imageFile) {
                fd.append(`newVideos[${index}][videoImageUrl]`, v.imageFile);
            }
        }
    });

    try {
      const res =  await updateCertificate(editId, fd);
        if (!res || !res._id) {
    throw new Error('Failed to update tutorial');
  }

  alert('Tutorial updated successfully');
      router.push('/academy/certifications-management/Tutorial-List'); 
    } catch (err) {
        console.error('Error updating webinar:', err);
         const message =
      err?.response?.data?.message ||
      err.message ||
      'Failed to update tutorial';

    alert(message);
    }
};

  return (
    <div className="max-w-7xl mx-auto p-6 bg-white dark:bg-gray-900 rounded-2xl shadow">
      <h2 className="text-3xl font-bold text-center text-black dark:text-white mb-10">
        Edit Tutorial Information
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <Label>Tutorial Name</Label>
          <Input 
            value={name} 
            onChange={handleNameChange} 
            className={errors.name ? 'border-red-500' : ''}
          />
          {errors.name && (
            <p className="text-red-500 text-sm mt-1">{errors.name}</p>
          )}
        </div>

        <div>
          <Label>Tutorial Description</Label>
          <Input 
            value={description} 
            onChange={handleDescriptionChange} 
            className={errors.description ? 'border-red-500' : ''}
          />
          {errors.description && (
            <p className="text-red-500 text-sm mt-1">{errors.description}</p>
          )}
        </div>

        <div>
          <Label>Main Image</Label>
          <FileInput
            accept="image/*"
            onChange={handleMainImageChange}
            className={errors.mainImage ? 'border-red-500' : ''}
          />
          {errors.mainImage && (
            <p className="text-red-500 text-sm mt-1">{errors.mainImage}</p>
          )}
          {(mainImgFile || currentImgUrl) && (
            <div className="mt-2">
              <Image
                src={mainImgFile ? URL.createObjectURL(mainImgFile) : currentImgUrl!}
                width={120}
                height={120}
                alt="Main Tutorial Image"
                className="rounded object-cover"
              />
              {mainImgFile && !errors.mainImage && (
                <p className="text-green-600 text-sm mt-1">
                  ✓ Valid: {mainImgFile.name} ({(mainImgFile.size / (1024 * 1024)).toFixed(2)}MB)
                </p>
              )}
            </div>
          )}
          <p className="text-xs text-gray-500 mt-1">
            Max size: 1MB | Supported: JPEG, JPG, PNG, WEBP, GIF
          </p>
        </div>

        {/* Display Current Videos (read-only for existing) */}
        {currentVideos.length > 0 && (
          <div className="col-span-2 mt-4">
            <Label>Current Videos</Label>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {currentVideos.map((video, i) => (
                <div key={i} className="border p-3 rounded-md bg-gray-50 shadow-sm flex flex-col gap-2">
                  {video.videoImageUrl && (
                    <div className="relative w-full h-24">
                      <Image
                        src={video.videoImageUrl}
                        alt={`Current Video ${i + 1} thumbnail`}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        className="object-cover rounded-md"
                      />
                    </div>
                  )}
                  <p className="font-semibold text-gray-800 break-words">Name: {video.videoName || 'N/A'}</p>
                  <p className="text-gray-700 text-sm break-words">Desc: {video.videoDescription || 'N/A'}</p>
                  {video.videoUrl && (
                    <a
                      href={video.videoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 underline block text-sm break-words"
                    >
                      Watch Video
                    </a>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Section for adding NEW videos */}
        <div className="col-span-2 mt-6">
          <Label className="mb-4 block">Add New Videos</Label>
          {newVideos.map((v, idx) => (
            <div key={idx} className="border p-4 rounded-md mb-4 grid grid-cols-1 md:grid-cols-3 gap-4 relative">
              <div className="col-span-full text-sm font-medium text-gray-600 mb-2">
                New Video {idx + 1}
              </div>
              <div className="md:col-span-1">
                <Label>Video Name</Label>
                <Input
                  placeholder="Video Name"
                  value={v.name}
                  onChange={(e) => handleNewVideoChange(idx, 'name', e.target.value)}
                  className={errors.newVideos?.[idx]?.name ? 'border-red-500' : ''}
                />
                {errors.newVideos?.[idx]?.name && (
                  <p className="text-red-500 text-sm mt-1">{errors.newVideos?.[idx]?.name}</p>
                )}
              </div>
              <div className="md:col-span-1">
                <Label>Video Description</Label>
                <Input
                  placeholder="Video Description"
                  value={v.description}
                  onChange={(e) => handleNewVideoChange(idx, 'description', e.target.value)}
                  className={errors.newVideos?.[idx]?.description ? 'border-red-500' : ''}
                />
                {errors.newVideos?.[idx]?.description && (
                  <p className="text-red-500 text-sm mt-1">{errors.newVideos?.[idx]?.description}</p>
                )}
              </div>
              <div className="md:col-span-1">
                <Label>Video URL</Label>
                <Input
                  placeholder="Video URL"
                  value={v.url}
                  onChange={(e) => handleNewVideoChange(idx, 'url', e.target.value)}
                  className={errors.newVideos?.[idx]?.url ? 'border-red-500' : ''}
                />
                {errors.newVideos?.[idx]?.url && (
                  <p className="text-red-500 text-sm mt-1">{errors.newVideos?.[idx]?.url}</p>
                )}
              </div>
              <div className="md:col-span-1">
                <Label>Video Thumbnail Image</Label>
                <FileInput
                  accept="image/*"
                  onChange={(e) => handleNewVideoImageChange(idx, e.target.files?.[0] || null)}
                  className={errors.newVideos?.[idx]?.imageFile ? 'border-red-500' : ''}
                />
                {errors.newVideos?.[idx]?.imageFile && (
                  <p className="text-red-500 text-sm mt-1">{errors.newVideos?.[idx]?.imageFile}</p>
                )}
                {(v.imageFile || v.imageUrl) && (
                  <div className="mt-2">
                    <Image
                      src={v.imageFile ? URL.createObjectURL(v.imageFile) : v.imageUrl!}
                      width={80}
                      height={60}
                      alt={`Video ${idx + 1} Thumbnail`}
                      className="rounded object-cover"
                    />
                    {v.imageFile && !errors.newVideos?.[idx]?.imageFile && (
                      <p className="text-green-600 text-sm mt-1">
                        ✓ Valid: {v.imageFile.name} ({(v.imageFile.size / (1024 * 1024)).toFixed(2)}MB)
                      </p>
                    )}
                  </div>
                )}
                <p className="text-xs text-gray-500 mt-1">
                  Max size: 1MB | Supported: JPEG, JPG, PNG, WEBP, GIF
                </p>
              </div>
            </div>
          ))}
          <button
            type="button"
            onClick={addNewVideoField}
            className="text-blue-600 underline mt-2"
          >
            + Add Another Video
          </button>
        </div>
      </div>

      <div className="flex justify-end gap-4 mt-10">
        <Link href="/academy/certifications-management/Tutorial-List"> {/* Corrected path */}
          <Button variant="outline">Cancel</Button>
        </Link>
        <Button 
          onClick={handleUpdate}
          disabled={Object.keys(errors).some(key => key !== 'newVideos') || 
                   (errors.newVideos && errors.newVideos.some(video => Object.keys(video).length > 0))}
          className={
            Object.keys(errors).some(key => key !== 'newVideos') || 
            (errors.newVideos && errors.newVideos.some(video => Object.keys(video).length > 0))
              ? 'opacity-50 cursor-not-allowed'
              : ''
          }
        >
          Save Changes
        </Button>
      </div>
    </div>
  );
};

export default EditCertificatePage;