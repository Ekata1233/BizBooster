'use client';

import React, { useEffect, useState } from 'react';
import FileInput from '@/components/form/input/FileInput';
import Input from '@/components/form/input/InputField';
import Label from '@/components/form/Label';
import Button from '@/components/ui/button/Button';
import ComponentCard from '../common/ComponentCard';
import { useCertificate } from '@/context/CertificationContext';
import axios from 'axios';

interface AddCertificateProps {
    certificationIdToEdit?: string;
}

interface VideoEntry {
    videoUrl: string;
    name: string;
    description: string;
}

const AddCertificate: React.FC<AddCertificateProps> = ({ certificationIdToEdit }) => {
    const { addCertificate } = useCertificate();

    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [mainImageFile, setMainImageFile] = useState<File | null>(null);
    const [imageUrl, setImageUrl] = useState<string | null>(null);
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
                const data = res.data.data;

                setName(data.name || '');
                setDescription(data.description || '');
                setImageUrl(data.imageUrl || null);

                if (Array.isArray(data.video)) {
                    const formatted = data.video.map((v: unknown) => {
                        const videoObj = v as { videoUrl?: string; name?: string; description?: string };
                        return {
                            videoUrl: videoObj.videoUrl || '',
                            name: videoObj.name || '',
                            description: videoObj.description || '',
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
            setImageUrl(null);
        }
    };

    const handleAddUrl = () => {
        if (!newVideoUrl.trim()) return;

        setVideoEntries((prev) => [
            ...prev,
            { videoUrl: newVideoUrl, name: '', description: '' },
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

        if (mainImageFile) {
            formData.append('imageUrl', mainImageFile);
        }

        for (const [i, video] of videoEntries.entries()) {
            if (!video.videoUrl || !video.name || !video.description) {
                alert(`Please complete video entry ${i + 1}`);
                setLoading(false);
                return;
            }

            formData.append(`videoUrl`, video.videoUrl);
            formData.append(`videoName`, video.name);
            formData.append(`videoDescription`, video.description);
        }

        try {
            if (certificationIdToEdit) {
                await axios.put(`/api/academy/certifications/${certificationIdToEdit}`, formData);
                alert('Tutorial updated!');
            } else {
                if (addCertificate) {
                    await addCertificate(formData);
                } else {
                    await axios.post('/api/academy/certifications', formData, {
                        headers: { 'Content-Type': 'multipart/form-data' },
                    });
                }
                alert('Tutorial added!');
            }

            // Reset
            setName('');
            setDescription('');
            setMainImageFile(null);
            setImageUrl('');
            setVideoEntries([]);
        } catch (err) {
            console.error('Submission error:', err);
            setError('Failed to submit form.');
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
                                <p>Current: <a href={imageUrl} target="_blank">View</a></p>
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
                            <Label htmlFor="videoUrl">Paste Video URL</Label>
                            <div className="flex gap-2">
                                <Input
                                    id="videoUrl"
                                    type="text"
                                    placeholder="https://example.com/video.mp4"
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
                                <p className="text-sm text-gray-600 mb-3">URL: {video.videoUrl}</p>

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
                                            placeholder="Enter name"
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
                                            placeholder="Enter description"
                                        />
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
