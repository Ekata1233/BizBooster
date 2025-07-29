'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Label from '@/components/form/Label';
import Input from '@/components/form/input/InputField';
import Button from '@/components/ui/button/Button';
import { useWebinars } from '@/context/WebinarContext';

const EditTutorialModalPage = () => {
  const router = useRouter();
  const { webId, videoIdx } = useParams();
  const { webinars, updateTutorial } = useWebinars();

  const [videoName, setVideoName] = useState('');
  const [videoDescription, setVideoDescription] = useState('');
  const [videoUrl, setVideoUrl] = useState('');

  const videoIndex = parseInt(videoIdx as string, 10);

  useEffect(() => {
    if (!webId || isNaN(videoIndex) || !webinars.length) return;

    const webinar = webinars.find((c) => c._id === webId);
    if (!webinar || !webinar.video[videoIndex]) return;

    const video = webinar.video[videoIndex];
    setVideoName(video.videoName);
    setVideoDescription(video.videoDescription);
    setVideoUrl(video.videoUrl);
  }, [webId, videoIndex, webinars]);

  const handleSave = async () => {
    if (!webId || isNaN(videoIndex)) return;

    const fd = new FormData();
    fd.append('videoIndex', String(videoIndex));
    fd.append('videoName', videoName);
    fd.append('videoDescription', videoDescription);
    fd.append('videoUrl', videoUrl);

    try {
      await updateTutorial(webId as string, fd);

      alert('Video updated successfully');
      router.push(`/academy/webinars/${webId}`);
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
          <Input
            value={videoDescription}
            onChange={(e) => setVideoDescription(e.target.value)}
          />
        </div>

        <div>
          <Label>Video URL</Label>
          <Input
            value={videoUrl}
            onChange={(e) => setVideoUrl(e.target.value)}
            placeholder="https://example.com/video.mp4"
          />
        </div>

        
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
