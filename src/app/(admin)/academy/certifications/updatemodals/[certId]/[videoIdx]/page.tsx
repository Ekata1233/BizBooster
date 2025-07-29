'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Label from '@/components/form/Label';
import Input from '@/components/form/input/InputField';
import Button from '@/components/ui/button/Button';
import { useCertificate } from '@/context/CertificationContext';

const EditTutorialModalPage = () => {
  const router = useRouter();
  const { certId, videoIdx } = useParams();
  const { certificates, updateTutorial } = useCertificate();

  const [videoName, setVideoName] = useState('');
  const [videoDescription, setVideoDescription] = useState('');
  const [videoUrl, setVideoUrl] = useState('');

  const videoIndex = parseInt(videoIdx as string, 10);

  useEffect(() => {
    if (!certId || isNaN(videoIndex) || !certificates.length) return;

    const cert = certificates.find((c) => c._id === certId);
    if (!cert || !cert.video[videoIndex]) return;

    const video = cert.video[videoIndex];
    setVideoName(video.videoName);
    setVideoDescription(video.videoDescription);
    setVideoUrl(video.videoUrl);
  }, [certId, videoIndex, certificates]);

  const handleSave = async () => {
    if (!certId || isNaN(videoIndex)) return;

    const fd = new FormData();
    fd.append('videoIndex', String(videoIndex));
    fd.append('videoName', videoName);
    fd.append('videoDescription', videoDescription);
    fd.append('videoUrl', videoUrl);

    try {
      await updateTutorial(certId as string, fd);
      alert('Video updated successfully');
      router.push(`/academy/certifications/${certId}`);
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

        {videoUrl && (
          <div>
            <Label>Current Video</Label>
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
