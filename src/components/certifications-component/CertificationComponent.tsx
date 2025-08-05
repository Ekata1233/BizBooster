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

const AddCertificate: React.FC< AddCertificateProps> = ({ certificationIdToEdit }) => {
    const { addCertificate } = useCertificate();

    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [mainImageFile, setMainImageFile] = useState<File | null>(null);
    const [imageUrl, setImageUrl] = useState<string | null>(null); // This holds the main image URL for display/sending back
    const [videoEntries, setVideoEntries] = useState<VideoEntry[]>([]);
    const [newVideoUrl, setNewVideoUrl] = useState('');

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchCertification = async () => {
            if (!certificationIdToEdit) return;

            setLoading(true);
            setError(null);

            try {
                const res = await axios.get(`/api/academy/certifications/${certificationIdToEdit}`);
                // IMPORTANT: Adjust this line based on your actual API response structure
                // If your API returns { data: { ... } }, then res.data.data is correct.
                // If your API returns { ... } directly, then use res.data.
                const data = res.data.data; // KEEP THIS IF YOUR API NESTS DATA. If not, change to res.data;

                setName(data.name || '');
                setDescription(data.description || '');
                setImageUrl(data.imageUrl || null); // Set the current main image URL for display and resending

                if (Array.isArray(data.video)) {
                    const formatted = data.video.map((v: unknown) => {
                        const videoObj = v as { videoUrl?: string; name?: string; description?: string; videoImageUrl?: string };
                        return {
                            videoUrl: videoObj.videoUrl || '',
                            name: videoObj.name || '',
                            description: videoObj.description || '',
                            videoImageFile: null,
                            videoImageUrl: videoObj.videoImageUrl || null, // This is correctly populated
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

    const handleMainImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setMainImageFile(file);
            setImageUrl(null); // Clear existing URL if a new file is selected, as new file takes precedence
        } else {
            // If user clears selection, reset file but keep current URL if it exists
            setMainImageFile(null);
            // Don't change imageUrl here; it means they might want to keep the old one.
            // The handleSubmit will send `currentImageUrl` if mainImageFile is null.
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
                    videoImageUrl: null, // Clear existing URL if a new file is selected
                };
            } else {
                // If user clears selection, reset file but keep current URL if it exists
                updated[index] = {
                    ...updated[index],
                    videoImageFile: null,
                    // Don't set videoImageUrl to null here if it had a value,
                    // as it means they might want to keep the old one.
                };
            }
            return updated;
        });
    };

    const handleAddUrl = () => {
        if (!newVideoUrl.trim()) return;

        setVideoEntries((prev) => [
            ...prev,
            { videoUrl: newVideoUrl, name: '', description: '', videoImageFile: null, videoImageUrl: null },
        ]);
        setNewVideoUrl('');
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const formData = new FormData();
        formData.append('name', name);
        formData.append('description', description);

        // --- Start Main Image Handling for FormData ---
        if (mainImageFile) {
            formData.append('imageUrl', mainImageFile); // Append new file
        } else if (imageUrl) {
            // If no new file is selected, but there's an existing imageUrl, send it
            formData.append('currentImageUrl', imageUrl);
        } else {
            // If neither new file nor existing URL, and it's required for creation/update
            alert('Main image for the tutorial is required.');
            setLoading(false);
            return;
        }
        // --- End Main Image Handling for FormData ---


        // Loop through video entries and append their data including image files/URLs
        for (const [i, video] of videoEntries.entries()) {
            // Basic text field validation for each video
            if (!video.videoUrl || !video.name || !video.description) {
                alert(`Please complete all text fields (URL, Name, Description) for video entry ${i + 1}.`);
                setLoading(false);
                return;
            }

            // Video Image validation:
            // For a new video, a file or URL must be provided.
            // For an existing video, if both file and existing URL are absent, it's an error.
            if (!video.videoImageFile && !video.videoImageUrl) {
                 alert(`Please upload a video image or ensure an existing image is present for video entry ${i + 1}.`);
                 setLoading(false);
                 return;
            }

            formData.append(`video[${i}][videoUrl]`, video.videoUrl);
            formData.append(`video[${i}][name]`, video.name);
            formData.append(`video[${i}][description]`, video.description);

            if (video.videoImageFile) {
                formData.append(`video[${i}][videoImage]`, video.videoImageFile); // New file upload
            } else if (video.videoImageUrl) {
                // If no new file, but an existing URL is present, send the existing URL
                formData.append(`video[${i}][videoImageUrl]`, video.videoImageUrl);
            }
        }

        // Validate that at least one video entry exists for new certifications
        if (videoEntries.length === 0 && !certificationIdToEdit) {
            alert('Please add at least one video entry.');
            setLoading(false);
            return;
        }

        try {
            if (certificationIdToEdit) {
                await axios.put(`/api/academy/certifications/${certificationIdToEdit}`, formData);
                alert('Tutorial updated!');
            } else {
                if (addCertificate) {
                    await addCertificate(formData);
                } else {
                    // This path is for direct POST to the API if addCertificate is not provided
                    await axios.post('/api/academy/certifications', formData, {
                        headers: { 'Content-Type': 'multipart/form-data' },
                    });
                }
                alert('Tutorial added!');
            }

            // Reset form fields after successful submission
            setName('');
            setDescription('');
            setMainImageFile(null);
            setImageUrl(null); // Reset imageUrl state
            setVideoEntries([]);
        } catch (err) {
            console.error('Submission error:', err);
            // Attempt to get a more specific error message from the response
            if (axios.isAxiosError(err) && err.response && err.response.data && err.response.data.message) {
                setError(err.response.data.message);
            } else {
                setError('Failed to submit form. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <ComponentCard title={certificationIdToEdit ? "Edit Tutorial" : "Add New Tutorial"}>
                {loading && <p className="text-blue-500">Loading...</p>}
                {error && <p className="text-red-500">{error}</p>}

                <form onSubmit={handleSubmit} encType="multipart/form-data">
                    <div className="space-y-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 md:gap-6">

                        <div>
                            <Label htmlFor="certificateName">Tutorial Name</Label>
                            <Input
                                id="certificateName"
                                type="text"
                                placeholder="Enter Tutorial Name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                            />
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
                                onChange={(e) => setDescription(e.target.value)}
                            />
                        </div>

                        <div className="col-span-2">
                            <Label htmlFor="newVideoUrl">Paste Video URL</Label>
                            <div className="flex gap-2">
                                <Input
                                    id="newVideoUrl"
                                    type="text"
                                    placeholder="https://example.com/video"
                                    value={newVideoUrl}
                                    onChange={(e) => setNewVideoUrl(e.target.value)}
                                />
                                <Button type="button" onClick={handleAddUrl}>
                                    + URL
                                </Button>
                            </div>
                        </div>

                        {videoEntries.map((video, index) => (
                            <div key={index} className="col-span-2 border p-4 rounded-md mb-4">
                                <p className="text-sm text-gray-600 mb-3">Video URL: {video.videoUrl}</p>

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
                                            }}
                                            placeholder="Enter video name"
                                        />
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
                                            }}
                                            placeholder="Enter video description"
                                        />
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
                        ))}

                        <div className="mt-4 col-span-2">
                            <Button size="sm" variant="primary" type="submit" disabled={loading}>
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