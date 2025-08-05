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
    const [fileInputKey, setFileInputKey] = useState(0)
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

  
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim() || !imageFile || !videoUrl.trim()) {
            alert('Title, image, and video URL are required.');
            return;
        }

        setIsLoading(true);
        const formData = new FormData();
        formData.append('title', title);
        formData.append('imageUrl', imageFile); // File for image
        formData.append('videoUrl', videoUrl);

        try {
            await axios.post('/api/partnerreview', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            alert('Review added successfully!');
            setTitle('');
            setImageFile(null);
            setFileInputKey((key)=> key + 1)
            setVideoUrl('');
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
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Enter title for the review"
                        
                    />
                </div>
                <div>
                    <Label htmlFor="imageUpload">Upload Image</Label>
                    <FileInput
                        id="imageUpload"
                        value={fileInputKey}
                        accept="image/*"
                        onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                        required
                    />
                    {imageFile && (
                        <p className="text-sm text-gray-500 mt-1">Selected: {imageFile.name}</p>
                    )}
                </div>
                <div>
                    <Label htmlFor="videoUrl">YouTube Video URL</Label>
                    <Input
                        id="videoUrl"
                        type="url" // Use type="url" for better browser validation
                        value={videoUrl}
                        onChange={(e) => setVideoUrl(e.target.value)}
                        placeholder="e.g., https://www.youtube.com/watch?v=dQw4w9WgXcQ"
                        
                    />
                </div>
                <div className="flex gap-x-4">
                <Button type="submit" className="w-1/4 bg-blue-600 text-white " disabled={isLoading}>
                    {isLoading ? 'Adding Review...' : 'Add Review'}
                </Button>
                <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.push('/preferences/partner-review/entry-list')}
                    className="w-1/4 "
                >
                    Back to List
                </Button>
                </div>
            </form>
        </div>
    );
};

export default AddPartnerReviewPage;