'use client';

import React, { useEffect, useState } from 'react';
import FileInput from '@/components/form/input/FileInput';
import Input from '@/components/form/input/InputField';
import Label from '@/components/form/Label';
import Button from '@/components/ui/button/Button';
import ComponentCard from '../common/ComponentCard';
import { useWebinars } from '@/context/WebinarContext';
import axios from 'axios';
import Image from 'next/image';
import { XMarkIcon } from '@heroicons/react/24/outline';

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

// Validation functions
const validateVideoUrl = (url: string): boolean => {
    if (!url.trim()) return false;
    
    const videoUrlPatterns = [
        /^(https?:\/\/)?(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)[\w-]{11}/i,
        /^(https?:\/\/)?(www\.)?vimeo\.com\/\d+/i,
        /^(https?:\/\/).+\.(mp4|webm|ogg|mov|avi|wmv|flv|mkv)(\?.*)?$/i,
        /^(https?:\/\/).+(dailymotion\.com|twitch\.tv|facebook\.com\/watch|v\.qq\.com)/i,
    ];
    
    return videoUrlPatterns.some(pattern => pattern.test(url));
};

const validateTextField = (text: string, fieldName: string): string => {
    if (!text.trim()) {
        return `${fieldName} is required`;
    }
    
    if (text.trim().length < 2) {
        return `${fieldName} must be at least 2 characters`;
    }
    
    const onlyNumbersSpecialChars = /^[0-9\s\W_]+$/;
    if (onlyNumbersSpecialChars.test(text)) {
        return `${fieldName} must contain letters`;
    }
    
    return '';
};

const AddRecorededWebinar: React.FC<AddCertificateProps> = ({ certificationIdToEdit }) => {
    const { addWebinar } = useWebinars();

    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [mainImageFile, setMainImageFile] = useState<File | null>(null);
    const [imageUrl, setImageUrl] = useState<string | null>(null);
    const [videoEntries, setVideoEntries] = useState<VideoEntry[]>([{ 
        videoUrl: '', 
        name: '', 
        description: '', 
        videoImageFile: null, 
        videoImageUrl: null 
    }]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    // Validation states
    const [videoErrors, setVideoErrors] = useState<{[key: number]: string}>({});
    const [nameError, setNameError] = useState<string>('');
    const [descriptionError, setDescriptionError] = useState<string>('');
    const [videoNameErrors, setVideoNameErrors] = useState<{[key: number]: string}>({});
    const [videoDescErrors, setVideoDescErrors] = useState<{[key: number]: string}>({});
    const [videoImageErrors, setVideoImageErrors] = useState<{[key: number]: string}>({});

    useEffect(() => {
        const fetchCertification = async () => {
            if (!certificationIdToEdit) return;

            setLoading(true);
            setError(null);

            try {
                const res = await axios.get(`/api/academy/webinars/${certificationIdToEdit}`);
                const data = res.data.data;

                setName(data.name || '');
                setDescription(data.description || '');
                setImageUrl(data.imageUrl || null);

                if (Array.isArray(data.video)) {
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

    // Validation functions
    const validateVideoEntry = (index: number, url: string): boolean => {
        if (!url.trim()) {
            setVideoErrors(prev => ({...prev, [index]: 'Video URL is required'}));
            return false;
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

    const validateVideoImage = (index: number, video: VideoEntry): boolean => {
        if (!video.videoImageFile && !video.videoImageUrl) {
            setVideoImageErrors(prev => ({...prev, [index]: 'Video thumbnail is required'}));
            return false;
        }
        setVideoImageErrors(prev => ({...prev, [index]: ''}));
        return true;
    };

    const handleNameValidation = (value: string) => {
        const error = validateTextField(value, 'Webinar Name');
        setNameError(error);
        return error === '';
    };

    const handleDescriptionValidation = (value: string) => {
        const error = validateTextField(value, 'Webinar Description');
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
            if (!file.type.startsWith('image/')) {
                alert('Please select an image file');
                return;
            }
            if (file.size > 5 * 1024 * 1024) {
                alert('Image size should be less than 5MB');
                return;
            }
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
                if (!file.type.startsWith('image/')) {
                    alert('Please select an image file');
                    return updated;
                }
                if (file.size > 5 * 1024 * 1024) {
                    alert('Image size should be less than 5MB');
                    return updated;
                }
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
        setVideoImageErrors(prev => ({...prev, [index]: ''}));
    };

    const handleAddVideo = () => {
        setVideoEntries((prev) => [
            ...prev,
            { videoUrl: '', name: '', description: '', videoImageFile: null, videoImageUrl: null },
        ]);
    };

    const handleRemoveVideo = (index: number) => {
        if (videoEntries.length > 1) {
            setVideoEntries((prev) => prev.filter((_, i) => i !== index));
            setVideoErrors(prev => {
                const newErrors = {...prev};
                delete newErrors[index];
                return newErrors;
            });
            setVideoNameErrors(prev => {
                const newErrors = {...prev};
                delete newErrors[index];
                return newErrors;
            });
            setVideoDescErrors(prev => {
                const newErrors = {...prev};
                delete newErrors[index];
                return newErrors;
            });
            setVideoImageErrors(prev => {
                const newErrors = {...prev};
                delete newErrors[index];
                return newErrors;
            });
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
        if (value.trim()) {
            setVideoErrors(prev => ({...prev, [index]: ''}));
        }
    };

    const validateForm = (): boolean => {
        let isValid = true;

        // Validate main fields
        if (!handleNameValidation(name)) isValid = false;
        if (!handleDescriptionValidation(description)) isValid = false;
        
        // Check main image
        if (!mainImageFile && !imageUrl && !certificationIdToEdit) {
            alert('Please upload a main image');
            isValid = false;
        }

        // Validate all video entries
        videoEntries.forEach((video, index) => {
            if (!validateVideoEntry(index, video.videoUrl)) isValid = false;
            if (!handleVideoNameValidation(index, video.name)) isValid = false;
            if (!handleVideoDescValidation(index, video.description)) isValid = false;
            if (!validateVideoImage(index, video)) isValid = false;
        });

        return isValid;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!validateForm()) {
            return;
        }

        setIsSubmitting(true);
        setError(null);

        // Filter out empty video entries
        const validVideoEntries = videoEntries.filter(video => 
            video.videoUrl.trim() && video.name.trim() && 
            video.description.trim() && (video.videoImageFile || video.videoImageUrl)
        );

        // If no valid video entries and not editing, show error
        if (validVideoEntries.length === 0 && !certificationIdToEdit) {
            alert('Please add at least one video entry with a URL.');
            setIsSubmitting(false);
            return;
        }

        const formData = new FormData();
        formData.append('name', name.trim());
        formData.append('description', description.trim());

        // Main Image Handling
        if (mainImageFile) {
            formData.append('imageUrl', mainImageFile);
        } else if (imageUrl) {
            formData.append('currentImageUrl', imageUrl);
        } else {
            alert('Please add first basic details.');
            setIsSubmitting(false);
            return;
        }

        // Add video entries
        validVideoEntries.forEach((video, index) => {
            formData.append(`video[${index}][videoUrl]`, video.videoUrl.trim());
            formData.append(`video[${index}][name]`, video.name.trim());
            formData.append(`video[${index}][description]`, video.description.trim());

            if (video.videoImageFile) {
                formData.append(`video[${index}][videoImage]`, video.videoImageFile);
            } else if (video.videoImageUrl) {
                formData.append(`video[${index}][videoImageUrl]`, video.videoImageUrl);
            }
        });

        try {
            if (certificationIdToEdit) {
                await axios.put(`/api/academy/webinars/${certificationIdToEdit}`, formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                alert('✅ Webinar updated successfully!');
            } else {
                if (addWebinar) {
                    await addWebinar(formData);
                } else {
                    await axios.post('/api/academy/webinars', formData, {
                        headers: { 'Content-Type': 'multipart/form-data' },
                    });
                }
                alert('✅ Webinar added successfully!');
                
                // Reset form
                setName('');
                setDescription('');
                setMainImageFile(null);
                setImageUrl(null);
                setVideoEntries([{ videoUrl: '', name: '', description: '', videoImageFile: null, videoImageUrl: null }]);
            }
        } catch (err) {
            console.error('Submission error:', err);
            let message = 'Failed to submit form. Please try again.';
            if (axios.isAxiosError(err)) {
                message = err.response?.data?.message || err.message || message;
            }
            setError(message);
            alert(`Error: ${message}`);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div>
            <ComponentCard title={certificationIdToEdit ? "Edit Webinar" : "Add New Webinar"}>
                {loading && <p className="text-blue-500">Loading...</p>}
                {error && <p className="text-red-500">{error}</p>}

                <form onSubmit={handleSubmit} encType="multipart/form-data">
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4">

                        <div>
                            <Label htmlFor="webinarName">Webinar Name</Label>
                            <Input
                                id="webinarName"
                                type="text"
                                placeholder="Enter Webinar Name"
                                value={name}
                                onChange={(e) => {
                                    setName(e.target.value);
                                    handleNameValidation(e.target.value);
                                }}
                                onBlur={() => handleNameValidation(name)}
                                className={nameError ? 'border-red-500' : ''}
                                disabled={isSubmitting}
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
                                disabled={isSubmitting}
                            />
                            {mainImageFile && <p>New: {mainImageFile.name}</p>}
                            {imageUrl && !mainImageFile && (
                                <p>Current: <a href={imageUrl} target="_blank" rel="noopener noreferrer">View Main Image</a></p>
                            )}
                        </div>

                        <div>
                            <Label htmlFor="tutorialDescription">Webinar Description</Label>
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
                                disabled={isSubmitting}
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
                                                disabled={isSubmitting}
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
                                        onBlur={() => validateVideoEntry(index, video.videoUrl)}
                                        className={videoErrors[index] ? 'border-red-500' : ''}
                                        disabled={isSubmitting}
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
                                                disabled={isSubmitting}
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
                                                disabled={isSubmitting}
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
                                                disabled={isSubmitting}
                                            />
                                            {videoImageErrors[index] && (
                                                <p className="text-red-500 text-sm mt-1">{videoImageErrors[index]}</p>
                                            )}
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
                            <Button type="button" onClick={handleAddVideo} disabled={isSubmitting}>
                                + Add Another Video
                            </Button>
                        </div>

                        <div className="mt-6 col-span-2">
                            <Button className="w-full" size="sm" variant="primary" type="submit" disabled={isSubmitting || loading}>
                                {isSubmitting ? 'Processing...' : certificationIdToEdit ? "Update Webinar" : "Add Webinar"}
                            </Button>
                        </div>
                    </div>
                </form>
            </ComponentCard>
        </div>
    );
};

export default AddRecorededWebinar;