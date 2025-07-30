'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image'; // Import Image component
import FileInput from '@/components/form/input/FileInput'; // Import FileInput component
import Label from '@/components/form/Label';
import Input from '@/components/form/input/InputField';
import Button from '@/components/ui/button/Button';
import { useWebinars } from '@/context/WebinarContext';

// Define types for clarity, including videoImageUrl
interface Video {
    videoName: string;
    videoDescription: string;
    videoUrl: string;
    videoImageUrl?: string; // Add videoImageUrl to the Video interface
}

const EditTutorialModalPage = () => {
    const router = useRouter();
    const { webId, videoIdx } = useParams(); // Changed certId to webId
    const { webinars, updateTutorial } = useWebinars(); // Changed updateTutorial to updateWebinar

    const [videoName, setVideoName] = useState('');
    const [videoDescription, setVideoDescription] = useState('');
    const [videoUrl, setVideoUrl] = useState('');
    const [currentVideoImageUrl, setCurrentVideoImageUrl] = useState<string | null>(null); // State for current video image URL
    const [newVideoImageFile, setNewVideoImageFile] = useState<File | null>(null); // State for new video image file upload

    const videoIndex = parseInt(videoIdx as string, 10);

    useEffect(() => {
        if (!webId || isNaN(videoIndex) || !webinars.length) return; // Changed certId to webId

        const webinar = webinars.find((w) => w._id === webId); // Changed cert to webinar, c to w, _id === certId to _id === webId
        if (!webinar || !webinar.video[videoIndex]) return;

        const video = webinar.video[videoIndex] as Video; // Explicitly cast to Video type
        setVideoName(video.videoName);
        setVideoDescription(video.videoDescription);
        setVideoUrl(video.videoUrl);
        setCurrentVideoImageUrl(video.videoImageUrl || null); // Set current video image URL
        setNewVideoImageFile(null); // Reset new file on load
    }, [webId, videoIndex, webinars]); // Changed certId to webId

    const handleSave = async () => {
        if (!webId || isNaN(videoIndex)) return; // Changed certId to webId

        const fd = new FormData();
        fd.append('videoIndex', String(videoIndex));
        fd.append('videoName', videoName);
        fd.append('videoDescription', videoDescription);
        fd.append('videoUrl', videoUrl);

        // Handle video image file or current URL
        if (newVideoImageFile) {
            fd.append('videoImageFile', newVideoImageFile); // New file to upload
        } else if (currentVideoImageUrl) {
            fd.append('currentVideoImageUrl', currentVideoImageUrl); // Keep existing URL
        } else {
            // If no new file and no current URL, explicitly send 'null' to indicate clearing/absence
            fd.append('currentVideoImageUrl', 'null');
        }

        try {
            await updateTutorial(webId as string, fd); // Changed updateTutorial to updateWebinar, certId to webId
            alert('Video updated successfully');
            router.push(`/academy/webinars-management/webinars-list`); // Redirect back to the webinar list or detail page
        } catch (err) {
            console.error('Update error:', err);
            alert('Error updating video');
        }
    };

    return (
        <div className="w-full mx-auto p-6 bg-white dark:bg-gray-900 rounded-2xl shadow">
            <h2 className="text-3xl font-bold text-center text-black dark:text-white mb-10">
                Edit Webinar Video {/* Changed title */}
            </h2>

            <div className="space-y-6">
                <div>
                    <Label>Video Name</Label>
                    <Input value={videoName} onChange={(e) => setVideoName(e.target.value)} />
                </div>

                <div>
                    <Label>Video Description</Label>
                    <Input value={videoDescription} onChange={(e) => setVideoDescription(e.target.value)} />
                </div>

                <div>
                    <Label>Video URL</Label> {/* Changed label from YouTube Video URL */}
                    <Input value={videoUrl} onChange={(e) => setVideoUrl(e.target.value)} />
                </div>

                {/* --- Video Image Section --- */}
                <div>
                    <Label>Video Thumbnail Image</Label>
                    <FileInput
                        accept="image/*"
                        onChange={(e) => setNewVideoImageFile(e.target.files?.[0] || null)}
                    />
                    {/* Display current image or new selected image preview */}
                    {(newVideoImageFile || currentVideoImageUrl) && (
                        <div className="mt-2">
                            <Label className="block mb-1 text-gray-600">Current/New Thumbnail Preview:</Label>
                            <Image
                                src={newVideoImageFile ? URL.createObjectURL(newVideoImageFile) : currentVideoImageUrl!}
                                width={150}
                                height={100}
                                alt="Webinar Video Thumbnail" // Changed alt text
                                className="rounded-md object-cover border border-gray-200"
                                unoptimized={true} // Add unoptimized if the URL is not from a known image host
                            />
                        </div>
                    )}
                    {/* Fallback if no image is present */}
                    {!newVideoImageFile && !currentVideoImageUrl && (
                        <p className="text-sm text-gray-500 mt-2">No thumbnail image selected or available.</p>
                    )}
                </div>
                {/* --- End Video Image Section --- */}

                {videoUrl && (
                    <div>
                        <Label>Current Video Link</Label>
                        <a
                            href={videoUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 underline block"
                        >
                            View Current Video
                        </a>
                    </div>
                )}
            </div>

            <div className="flex justify-end gap-4 mt-10">
                <Button variant="outline" onClick={() => router.back()}>
                    Cancel
                </Button>
                <Button onClick={handleSave}>Save Changes</Button>
            </div>
        </div>
    );
};

export default EditTutorialModalPage;