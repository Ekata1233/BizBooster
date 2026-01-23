'use client';

import React, { useEffect, useState } from 'react';
import FileInput from '@/components/form/input/FileInput';
import Input from '@/components/form/input/InputField';
import Label from '@/components/form/Label';
import Button from '@/components/ui/button/Button';
import ComponentCard from '../common/ComponentCard';
import { useCertificate } from '@/context/CertificationContext';
import axios from 'axios';
import Image from 'next/image';
import { XMarkIcon } from '@heroicons/react/24/outline'; // Import an icon for remove button

interface AddCertificateProps {
    certificationIdToEdit?: string;
}

interface VideoEntry {
    videoUrl: string;
    name: string;
    description: string;
    videoImageFile: File | null; 
    videoImageUrl: string | null; 
}
const validateVideoUrl = (url: string): boolean => {
  if (!url.trim()) return false; // Empty string is invalid
  
  // Common video URL patterns
  const videoUrlPatterns = [
    // YouTube patterns
    /^(https?:\/\/)?(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)[\w-]{11}/i,
    // Vimeo patterns
    /^(https?:\/\/)?(www\.)?vimeo\.com\/\d+/i,
    // MP4, WebM, etc. direct video files
    /^(https?:\/\/).+\.(mp4|webm|ogg|mov|avi|wmv|flv|mkv)(\?.*)?$/i,
    // Video streaming services
    /^(https?:\/\/).+(dailymotion\.com|twitch\.tv|facebook\.com\/watch|v\.qq\.com)/i,
    // Generic video URL with common video parameters
    /^(https?:\/\/).+\/.*(video|vid|mp4|watch)(\/|\?|&)/i
  ];
  
  return videoUrlPatterns.some(pattern => pattern.test(url));
};
const validateTextField = (text: string, fieldName: string): string => {
  if (!text.trim()) {
    return `${fieldName} is required`;
  }
  
  // Check if it contains only numbers (not allowed)
  const onlyNumbersRegex = /^[0-9\s]+$/;
  if (onlyNumbersRegex.test(text)) {
    return `${fieldName} cannot contain only numbers`;
  }
  
  // Check if it contains at least one letter (character)
  const hasAtLeastOneLetter = /[a-zA-Z]/;
  if (!hasAtLeastOneLetter.test(text)) {
    return `${fieldName} must contain at least one letter`;
  }
  
  return ''; // No error
};
const AddCertificate: React.FC<AddCertificateProps> = ({ certificationIdToEdit }) => {
    const { addCertificate } = useCertificate();

    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [mainImageFile, setMainImageFile] = useState<File | null>(null);
    const [imageUrl, setImageUrl] = useState<string | null>(null);
    const [videoErrors, setVideoErrors] = useState<{[key: number]: string}>({});
    const [nameError, setNameError] = useState<string>('');
const [descriptionError, setDescriptionError] = useState<string>('');
const [videoNameErrors, setVideoNameErrors] = useState<{[key: number]: string}>({});
const [videoDescErrors, setVideoDescErrors] = useState<{[key: number]: string}>({});
    const [videoEntries, setVideoEntries] = useState<VideoEntry[]>([{ 
        videoUrl: '', 
        name: '', 
        description: '', 
        videoImageFile: null, 
        videoImageUrl: null 
    }]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchCertification = async () => {
            if (!certificationIdToEdit) return;

            setLoading(true);
            setError(null);

            try {
                const res = await axios.get(`/api/academy/certifications/${certificationIdToEdit}`);
                const data = res.data.data;

                setName(data.name || '');
                setDescription(data.description || '');
                setImageUrl(data.imageUrl || null);

                if (Array.isArray(data.video) && data.video.length > 0) {
                    const formatted = data.video.map((v: unknown) => {
                        const videoObj = v as { videoUrl?: string; name?: string; description?: string; videoImageUrl?: string };
                        return {
                            videoUrl: videoObj.videoUrl || '',
                            name: videoObj.name || '',
                            description: videoObj.description || '',
                            videoImageFile: null,
                            videoImageUrl: videoObj.videoImageUrl || null,
                        };
                    });
                    setVideoEntries(formatted);
                }
            } catch (err) {
                console.error('Error fetching certificate:', err);
                setError('Failed to load certificate.');
            } finally {
                setLoading(false);
            }
        };

        fetchCertification();
    }, [certificationIdToEdit]);

    const validateVideoEntry = (index: number, url: string): boolean => {
  if (url.trim() === '') {
    // Clear error if URL is empty (optional, depends on your requirement)
    setVideoErrors(prev => ({...prev, [index]: ''}));
    return true; // or false if you want to require non-empty URLs
  }
  
  if (!validateVideoUrl(url)) {
    setVideoErrors(prev => ({
      ...prev, 
      [index]: 'Please enter a valid video URL (YouTube, Vimeo, or direct video file)'
    }));
    return false;
  }
  
  setVideoErrors(prev => ({...prev, [index]: ''}));
  return true;
};
const handleNameValidation = (value: string) => {
  const error = validateTextField(value, 'Tutorial Name');
  setNameError(error);
  return error === '';
};

const handleDescriptionValidation = (value: string) => {
  const error = validateTextField(value, 'Tutorial Description');
  setDescriptionError(error);
  return error === '';
};

const handleVideoNameValidation = (index: number, value: string) => {
  const error = validateTextField(value, 'Video Name');
  setVideoNameErrors(prev => ({...prev, [index]: error}));
  return error === '';
};

const handleVideoDescValidation = (index: number, value: string) => {
  const error = validateTextField(value, 'Video Description');
  setVideoDescErrors(prev => ({...prev, [index]: error}));
  return error === '';
};

    const handleMainImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setMainImageFile(file);
            setImageUrl(null);
        } else {
            setMainImageFile(null);
        }
    };

    const handleVideoImageChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        setVideoEntries((prev) => {
            const updated = [...prev];
            if (file) {
                updated[index] = {
                    ...updated[index],
                    videoImageFile: file,
                    videoImageUrl: null,
                };
            } else {
                updated[index] = {
                    ...updated[index],
                    videoImageFile: null,
                };
            }
            return updated;
        });
         validateVideoEntry(index, value);
    };

    const handleAddUrl = () => {
        setVideoEntries((prev) => [
            ...prev,
            { videoUrl: '', name: '', description: '', videoImageFile: null, videoImageUrl: null },
        ]);
    };

    const handleRemoveVideo = (index: number) => {
        if (videoEntries.length > 1) {
            setVideoEntries((prev) => prev.filter((_, i) => i !== index));
        }
    };

    const handleVideoUrlChange = (index: number, value: string) => {
        setVideoEntries((prev) => {
            const updated = [...prev];
            updated[index] = {
                ...updated[index],
                videoUrl: value
            };
            return updated;
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
  // First, validate all video URLs
  const urlValidations = videoEntries.map((video, index) => 
    validateVideoEntry(index, video.videoUrl)
  );
    // Check if any URL is invalid
  if (urlValidations.some(isValid => !isValid)) {
    alert('Please fix invalid video URLs before submitting.');
    setLoading(false);
    return;
  }

   // Validate main fields
  const isNameValid = handleNameValidation(name);
  const isDescriptionValid = handleDescriptionValidation(description);
  
  if (!isNameValid || !isDescriptionValid) {
    alert('Please fix errors in the main fields before submitting.');
    setLoading(false);
    return;
  }

  // Validate all video name and description fields
  const videoValidations = videoEntries.map((video, index) => {
    const nameValid = handleVideoNameValidation(index, video.name);
    const descValid = handleVideoDescValidation(index, video.description);
    return nameValid && descValid;
  });
  
  if (videoValidations.some(isValid => !isValid)) {
    alert('Please fix errors in video details before submitting.');
    setLoading(false);
    return;
  }

        // Filter out empty video entries (where videoUrl is empty)
        const validVideoEntries = videoEntries.filter(video => video.videoUrl.trim() !== '');

        // If no valid video entries and not editing, show error
        if (validVideoEntries.length === 0 && !certificationIdToEdit) {
            alert('Please add at least one video entry with a URL.');
            setLoading(false);
            return;
        }

        const formData = new FormData();
        formData.append('name', name);
        formData.append('description', description);

        // Main Image Handling
        if (mainImageFile) {
            formData.append('imageUrl', mainImageFile);
        } else if (imageUrl) {
            formData.append('currentImageUrl', imageUrl);
        } else {
            alert('Please add first basic details.');
            setLoading(false);
            return;
        }

        // Loop through valid video entries
        for (const [i, video] of validVideoEntries.entries()) {
            // Basic text field validation
            if (!video.videoUrl || !video.name || !video.description) {
                alert(`Please complete all details for video no ${i + 1}.`);
                setLoading(false);
                return;
            }

            // Video Image validation
            if (!video.videoImageFile && !video.videoImageUrl) {
                alert(`Please upload a video image or ensure an existing image is present for video entry ${i + 1}.`);
                setLoading(false);
                return;
            }

            formData.append(`video[${i}][videoUrl]`, video.videoUrl);
            formData.append(`video[${i}][name]`, video.name);
            formData.append(`video[${i}][description]`, video.description);

            if (video.videoImageFile) {
                formData.append(`video[${i}][videoImage]`, video.videoImageFile);
            } else if (video.videoImageUrl) {
                formData.append(`video[${i}][videoImageUrl]`, video.videoImageUrl);
            }
        }

        try {
            let res;
            if (certificationIdToEdit) {
                await axios.put(`/api/academy/certifications/${certificationIdToEdit}`, formData);
                alert('Tutorial updated!');
            } else {
                res = await axios.post(
                    '/api/academy/certifications',
                    formData,
                    { headers: { 'Content-Type': 'multipart/form-data' } }
                );

                console.log("response of tutorial: ", res);

                if (!res.data?.success) {
                    const msg = res.data?.message || 'Failed to submit form.';
                    alert(msg);
                    throw new Error(msg);
                }

                alert('✅ Tutorial added successfully!');
            }
            setName('');
            setDescription('');
            setMainImageFile(null);
            setImageUrl(null);
            setVideoEntries([{ videoUrl: '', name: '', description: '', videoImageFile: null, videoImageUrl: null }]);
        } catch (err) {
            console.error('Submission error:', err);
            let message = 'Failed to submit form. Please try again.';
            if (axios.isAxiosError(err)) {
                message = err.response?.data?.message || err.message || message;
            }
            setError(message);
            alert(message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <ComponentCard title={certificationIdToEdit ? "Edit Tutorial" : "Add New Tutorial"}>
                {loading && <p className="text-blue-500">Loading...</p>}

                <form onSubmit={handleSubmit} encType="multipart/form-data">
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4">

                        <div>
                            <Label htmlFor="certificateName">Tutorial Name</Label>
                           <Input
  id="certificateName"
  type="text"
  placeholder="Enter Tutorial Name"
  value={name}
  onChange={(e) => {
    setName(e.target.value);
    handleNameValidation(e.target.value);
  }}
  onBlur={() => handleNameValidation(name)}
  className={nameError ? 'border-red-500' : ''}
/>
{nameError && (
  <p className="text-red-500 text-sm mt-1">{nameError}</p>
)}
                        </div>

                        <div>
                            <Label htmlFor="mainImage">Main Image</Label>
                            <FileInput
                                id="mainImage"
                                onChange={handleMainImageChange}
                                accept="image/*"
                            />
                            {mainImageFile && <p>New: {mainImageFile.name}</p>}
                            {imageUrl && !mainImageFile && (
                                <p>Current: <a href={imageUrl} target="_blank" rel="noopener noreferrer">View Main Image</a></p>
                            )}
                        </div>

                        <div>
                            <Label htmlFor="tutorialDescription">Tutorial Description</Label>
                           <Input
  id="tutorialDescription"
  type="text"
  placeholder="Enter Description"
  value={description}
  onChange={(e) => {
    setDescription(e.target.value);
    handleDescriptionValidation(e.target.value);
  }}
  onBlur={() => handleDescriptionValidation(description)}
  className={descriptionError ? 'border-red-500' : ''}
/>
{descriptionError && (
  <p className="text-red-500 text-sm mt-1">{descriptionError}</p>
)}
                        </div>

                        {/* Display existing video entries */}
                        {videoEntries.map((video, index) => (
                            <React.Fragment key={index}>
                              <div className="col-span-2 relative">
  <div className="flex justify-between items-center mb-1">
    <Label htmlFor={`videoUrl-${index}`}>
      Paste Video URL {videoEntries.length > 1 && `#${index + 1}`}
    </Label>
    {videoEntries.length > 1 && (
      <button
        type="button"
        onClick={() => handleRemoveVideo(index)}
        className="text-red-500 hover:text-red-700 p-1 rounded-full hover:bg-red-50"
        title="Remove this video"
      >
        <XMarkIcon className="h-5 w-5" />
      </button>
    )}
  </div>
  <Input
    id={`videoUrl-${index}`}
    type="text"
    placeholder="https://youtube.com/watch?v=... or https://vimeo.com/..."
    value={video.videoUrl}
    onChange={(e) => handleVideoUrlChange(index, e.target.value)}
    onBlur={() => validateVideoEntry(index, video.videoUrl)} // Validate on blur too
    className={videoErrors[index] ? 'border-red-500' : ''}
  />
  {videoErrors[index] && (
    <p className="text-red-500 text-sm mt-1">{videoErrors[index]}</p>
  )}
</div>

                                <div className="col-span-2 border p-4 rounded-md mb-4">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div>
  <Label htmlFor={`videoName-${index}`}>Video Name</Label>
  <Input
    id={`videoName-${index}`}
    type="text"
    value={video.name}
    onChange={(e) => {
      const updated = [...videoEntries];
      updated[index].name = e.target.value;
      setVideoEntries(updated);
      handleVideoNameValidation(index, e.target.value);
    }}
    onBlur={() => handleVideoNameValidation(index, video.name)}
    placeholder="Enter video name"
    className={videoNameErrors[index] ? 'border-red-500' : ''}
  />
  {videoNameErrors[index] && (
    <p className="text-red-500 text-sm mt-1">{videoNameErrors[index]}</p>
  )}
</div>
                                        <div>
  <Label htmlFor={`videoDesc-${index}`}>Video Description</Label>
  <Input
    id={`videoDesc-${index}`}
    type="text"
    value={video.description}
    onChange={(e) => {
      const updated = [...videoEntries];
      updated[index].description = e.target.value;
      setVideoEntries(updated);
      handleVideoDescValidation(index, e.target.value);
    }}
    onBlur={() => handleVideoDescValidation(index, video.description)}
    placeholder="Enter video description"
    className={videoDescErrors[index] ? 'border-red-500' : ''}
  />
  {videoDescErrors[index] && (
    <p className="text-red-500 text-sm mt-1">{videoDescErrors[index]}</p>
  )}
</div>

                                        {/* Video Image Input and Display */}
                                        <div className="col-span-full">
                                            <Label htmlFor={`videoImage-${index}`}>Video Image (Thumbnail)</Label>
                                            <FileInput
                                                id={`videoImage-${index}`}
                                                onChange={(e) => handleVideoImageChange(index, e)}
                                                accept="image/*"
                                            />
                                            {video.videoImageFile && <p>New Thumbnail: {video.videoImageFile.name}</p>}
                                            {video.videoImageUrl && !video.videoImageFile && (
                                                <div className="mt-2">
                                                    <p>Current Thumbnail:</p>
                                                    <Image
                                                        src={video.videoImageUrl}
                                                        alt={`Video thumbnail for ${video.name}`}
                                                        width={100}
                                                        height={60}
                                                        className="object-cover rounded-md"
                                                    />
                                                    <a href={video.videoImageUrl} target="_blank" rel="noopener noreferrer" className="text-blue-500 text-sm ml-2">View Full Size</a>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </React.Fragment>
                        ))}

                        {/* Add More Videos Button */}
                        <div className="col-span-2">
                            <Button type="button" onClick={handleAddUrl}>
                                + Add Another Video
                            </Button>
                        </div>

                        <div className="mt-6 col-span-2">
                            <Button className="w-full" size="sm" variant="primary" type="submit" disabled={loading}>
                                {certificationIdToEdit ? "Update Tutorial" : "Add Tutorial"}
                            </Button>
                        </div>
                    </div>
                </form>
            </ComponentCard>
        </div>
    );
};

export default AddCertificate; 