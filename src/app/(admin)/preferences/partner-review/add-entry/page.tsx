'use client';

import { useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import Input from '@/components/form/input/InputField';
import FileInput from '@/components/form/input/FileInput';
import Label from '@/components/form/Label';
import Button from '@/components/ui/button/Button';

const AddPartnerReviewPage = () => {
    const [title, setTitle] = useState('');
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [videoUrl, setVideoUrl] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    
    // Validation states
    const [errors, setErrors] = useState<{
        title?: string;
        imageFile?: string;
        videoUrl?: string;
    }>({});
    
    const router = useRouter();

    // Validation functions
    const validateTitle = (title: string): boolean => {
        const titleRegex = /^[a-zA-ZÀ-ÿ0-9\s.,!?@#$%^&*()_+\-=[\]{};':"\\|<>`~]+$/;
        return titleRegex.test(title.trim()) && title.trim().length > 0;
    };

    const validateYouTubeUrl = (url: string): boolean => {
        const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.?be)\/.+$/;
        return youtubeRegex.test(url.trim());
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
        if (!title.trim()) {
            newErrors.title = 'Title is required.';
        } else if (!validateTitle(title)) {
            newErrors.title = 'Title contains invalid characters.';
        }

        // Image validation
        if (!imageFile) {
            newErrors.imageFile = 'Image is required.';
        } else if (!imageFile.type.startsWith('image/')) {
            newErrors.imageFile = 'Please upload a valid image file.';
        } else {
            const imageError = validateImage(imageFile, 1);
            if (imageError) {
                newErrors.imageFile = imageError;
            }
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

    const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setTitle(value);
        
        // Clear error when user starts typing
        if (errors.title) {
            setErrors(prev => ({ ...prev, title: undefined }));
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
                setImageFile(null);
                e.target.value = ''; // Clear the file input
                return;
            }
            
            setImageFile(file);
            // Clear error if file is valid
            setErrors(prev => ({ ...prev, imageFile: undefined }));
        } else {
            setImageFile(null);
            setErrors(prev => ({ ...prev, imageFile: undefined }));
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

    // Check if form is ready to submit
    const isFormReady = () => {
        // Check if all required fields have values
        if (!title.trim() || !imageFile || !videoUrl.trim()) {
            return false;
        }
        
        // Check if there are any validation errors
        if (errors.title || errors.imageFile || errors.videoUrl) {
            return false;
        }
        
        return true;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        // Validate form before submission
        if (!validateForm()) {
            alert('Please fix the validation errors before submitting.');
            return;
        }

        setIsLoading(true);
        const formData = new FormData();
        formData.append('title', title.trim());
        formData.append('imageUrl', imageFile!); // File for image
        formData.append('videoUrl', videoUrl.trim());

        try {
            await axios.post('/api/partnerreview', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            alert('Review added successfully!');
            setTitle('');
            setImageFile(null);
            setVideoUrl('');
            setErrors({});
            router.push('/preferences/partner-review/entry-list');
        } catch (error) {
            console.error('Error adding review:', error);
            alert('Failed to add review.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="p-6 w-full mx-auto font-sans ">
            <h1 className="text-3xl font-bold mb-6 text-gray-800 text-center">Add New Partner Review</h1>

            <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                    <Label htmlFor="title">Title</Label>
                    <Input
                        id="title"
                        type="text"
                        value={title}
                        onChange={handleTitleChange}
                        placeholder="Enter title for the review"
                        className={errors.title ? 'border-red-500' : ''}
                    />
                    {errors.title && (
                        <p className="text-red-500 text-sm mt-1">{errors.title}</p>
                    )}
                </div>
                
                <div>
                    <Label htmlFor="imageUpload">Upload Image</Label>
                    <FileInput
                        id="imageUpload"
                        accept="image/*"
                        onChange={handleImageChange}
                        required
                        className={errors.imageFile ? 'border-red-500' : ''}
                    />
                    {imageFile && !errors.imageFile && (
                        <p className="text-green-600 text-sm mt-1">
                            ✓ Valid: {imageFile.name} ({(imageFile.size / (1024 * 1024)).toFixed(2)}MB)
                        </p>
                    )}
                    {errors.imageFile && (
                        <p className="text-red-500 text-sm mt-1">{errors.imageFile}</p>
                    )}
                    <p className="text-xs text-gray-500 mt-1">
                        Max size: 1MB | Supported: JPEG, JPG, PNG, WEBP, GIF
                    </p>
                </div>
                
                <div>
                    <Label htmlFor="videoUrl">YouTube Video URL</Label>
                    <Input
                        id="videoUrl"
                        type="url"
                        value={videoUrl}
                        onChange={handleVideoUrlChange}
                        placeholder="e.g., https://www.youtube.com/watch?v=dQw4w9WgXcQ"
                        className={errors.videoUrl ? 'border-red-500' : ''}
                    />
                    {errors.videoUrl && (
                        <p className="text-red-500 text-sm mt-1">{errors.videoUrl}</p>
                    )}
                </div>
                
                <div className="flex gap-x-4">
                    <Button 
                        type="submit" 
                        className="w-1/4 bg-blue-600 text-white" 
                        disabled={isLoading || !isFormReady()}
                    >
                        {isLoading ? 'Adding Review...' : 'Add Review'}
                    </Button>
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => router.push('/preferences/partner-review/entry-list')}
                        className="w-1/4"
                    >
                        Back to List
                    </Button>
                </div>
            </form>
        </div>
    );
};

export default AddPartnerReviewPage;