'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image'; // Import Image component
import FileInput from '@/components/form/input/FileInput'; // Import FileInput component
import Label from '@/components/form/Label';
import Input from '@/components/form/input/InputField';
import Button from '@/components/ui/button/Button';
import { useCertificate } from '@/context/CertificationContext';

// Define types for clarity, including videoImageUrl
interface Video {
  videoName: string;
  videoDescription: string;
  videoUrl: string;
  videoImageUrl?: string; // Add videoImageUrl to the Video interface
}



const EditTutorialModalPage = () => {
  const router = useRouter();
  const { certId, videoIdx } = useParams();
  const { certificates, updateTutorial } = useCertificate();

  const [videoName, setVideoName] = useState('');
  const [videoDescription, setVideoDescription] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [currentVideoImageUrl, setCurrentVideoImageUrl] = useState<string | null>(null); // State for current video image URL
  const [newVideoImageFile, setNewVideoImageFile] = useState<File | null>(null); // State for new video image file upload

  const videoIndex = parseInt(videoIdx as string, 10);

  useEffect(() => {
    if (!certId || isNaN(videoIndex) || !certificates.length) return;

    const cert = certificates.find((c) => c._id === certId);
    if (!cert || !cert.video[videoIndex]) return;
    
    const video = cert.video[videoIndex] as Video; // Explicitly cast to Video type
    setVideoName(video.videoName);
    setVideoDescription(video.videoDescription);
    setVideoUrl(video.videoUrl);
    setCurrentVideoImageUrl(video.videoImageUrl || null); // Set current video image URL
    setNewVideoImageFile(null); // Reset new file on load
  }, [certId, videoIndex, certificates]);

  const handleSave = async () => {
    if (!certId || isNaN(videoIndex)) return;

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
      
    }


    try {
      await updateTutorial(certId as string, fd);
      alert('Video updated successfully');
      router.push(`/academy/certifications-management/Tutorial-List/${certId}`); // Redirect back to the detail page
    } catch (err) {
      console.error('Update error:', err);
      alert('Error updating video');
    }
  };

  return (
    <div className="w-full mx-auto p-6 bg-white dark:bg-gray-900 rounded-2xl shadow">
      <h2 className="text-3xl font-bold text-center text-black dark:text-white mb-10">
        Edit Tutorial Video
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
          <Label>YouTube Video URL</Label>
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
                alt="Video Thumbnail"
                className="rounded-md object-cover border border-gray-200"
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