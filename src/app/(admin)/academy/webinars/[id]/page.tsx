


'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import axios from 'axios';
import { useModal } from '@/hooks/useModal';
import { Modal } from '@/components/ui/modal';
import FileInput from '@/components/form/input/FileInput';
import Input from '@/components/form/input/InputField';
import Label from '@/components/form/Label';
import { TrashBinIcon } from '@/icons';
import { useWebinars } from '@/context/WebinarContext';
import PageBreadcrumb from '@/components/common/PageBreadCrumb';
import Button from '@/components/ui/button/Button';
import Link from 'next/link';

interface Video {
  videoName: string;
  videoDescription: string;
  videoUrl: string;
}

interface Webinar {
  _id: string;
  name: string;
  description: string;
  imageUrl: string;
  video: Video[];
}

const CertificateDetailPage = () => {
  const { id } = useParams();
  const router = useRouter();
  const { isOpen, openModal, closeModal } = useModal();
  const { webinars, deleteTutorial, updateTutorial, deleteWebinar } = useWebinars();

  const [webinar, setWebinar] = useState<Webinar | null>(null);
  const [videoFiles, setVideoFiles] = useState<File[]>([]);
  const [currentVideoUrls, setCurrentVideoUrls] = useState<string[]>([]);
  const [editingVideoIndex, setEditingVideoIndex] = useState<number | null>(null);
  const [newVideos, setNewVideos] = useState([{ name: '', description: '', file: null as File | null }]);

  useEffect(() => {
    if (webinars && id) {
      const selected = webinars.find((web) => web._id === id);
      if (selected) {
        setWebinar(selected);
      }
    }
  }, [id, webinars]);

  const handleVideoFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setVideoFiles(files);
  };

  const handleUpdateVideo = (webinarId: string, videoIndex: number) => {
    const selectedWebinar = webinars.find(item => item._id === webinarId);
    if (selectedWebinar) {
      const videoToEdit = selectedWebinar.video?.[videoIndex];
      setEditingVideoIndex(videoIndex);
      setCurrentVideoUrls([videoToEdit?.videoUrl || '']);
      setNewVideos([{
        name: videoToEdit?.videoName || '',
        description: videoToEdit?.videoDescription || '',
        file: null
      }]);
      openModal();
    }
  };

  const handleUpdateData = async () => {
    const editingWebinarId = webinar?._id;
    if (!editingWebinarId || editingVideoIndex === null) return;

    const formData = new FormData();
    formData.append('videoIndex', editingVideoIndex.toString());
    formData.append('videoName', newVideos[0].name);
    formData.append('videoDescription', newVideos[0].description);
    if (newVideos[0].file) {
      formData.append('videoFile', newVideos[0].file);
    }

    try {
      await updateTutorial(editingWebinarId, formData);
      alert('Webinar updated successfully');
      closeModal();
      setEditingVideoIndex(null);
      setNewVideos([{ name: '', description: '', file: null }]);
      setVideoFiles([]);
      const response = await axios.get(`/api/academy/webinar-tutorials/${editingWebinarId}`);
      setWebinar(response.data.data);
    } catch (error) {
      console.error('Error updating webinar:', error);
    }
  };

  const handleDeleteVideo = async (videoIndex: number) => {
    const confirmDelete = confirm('Are you sure you want to delete this webinar?');
    if (!confirmDelete) return;

    try {
      await deleteTutorial(id as string, videoIndex);
      alert('Webinar deleted successfully');
    } catch (error) {
      console.error('Failed to delete webinar:', error);
    }
  };

  const handleDelete = async () => {
    const confirmDelete = confirm('Are you sure you want to delete this certificate?');
    if (!confirmDelete) return;

    try {
      await deleteWebinar(id as string);
      alert('Webinar deleted successfully');
    } catch (error) {
      console.error('Failed to delete webinar:', error);
    }
  };

  if (!webinar) return <p>Loading...</p>;

  return (
    <div className="space-y-6">
      <PageBreadcrumb pageTitle="Webinar Detail" />

      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-800">Training Webinar: {webinar.name}</h1>
        <button
          onClick={handleDelete}
          className="text-red-500 border border-red-500 rounded-md p-2 hover:bg-red-500 hover:text-white"
        >
          <TrashBinIcon />
        </button>
      </div>

      <div className="border p-4 rounded-md shadow-sm">
        <h2 className="text-lg font-medium mb-2">Image</h2>
        {webinar.imageUrl ? (
          <Image
            src={webinar.imageUrl}
            alt={webinar.name}
            width={200}
            height={200}
            className="rounded"
          />
        ) : (
          <p>No image available</p>
        )}
      </div>

      <h1 className="text-2xl font-semibold text-gray-800">
        Training Webinar Description: {webinar.description}
      </h1>

      <div className="border p-4 rounded-md shadow-sm">
        <h2 className="text-lg font-medium mb-4">Videos</h2>
        {webinar.video && webinar.video.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {webinar.video.map((vid, index) => (
              <div key={index} className="border rounded-md p-4 shadow-sm flex flex-col justify-between">
                <h2>Video : {index + 1}</h2>
                <div className="space-y-2">
                  {vid.videoUrl ? (
                    <video
                      src={vid.videoUrl}
                      controls
                      className="w-full h-40 object-cover rounded-md"
                    />
                  ) : (
                    <div className="w-full h-40 bg-gray-100 flex items-center justify-center text-sm text-gray-500 rounded-md">
                      No video file
                    </div>
                  )}
                  <p className="text-sm"><strong>Name:</strong> {vid.videoName || 'N/A'}</p>
                  <p className="text-sm"><strong>Description:</strong> {vid.videoDescription || 'N/A'}</p>
                </div>
                <div className="flex justify-between items-center mt-4">
                  <button
                    className="bg-blue-500 text-white text-sm px-4 py-1 rounded hover:bg-blue-600"
                    onClick={() => handleUpdateVideo(webinar._id, index)}
                  >
                    Update
                  </button>
                  <button
                    className="bg-red-500 text-white text-sm px-4 py-1 rounded hover:bg-red-600"
                    onClick={() => handleDeleteVideo(index)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p>No video details available</p>
        )}
      </div>

      <Link href={`/academy/webinars/`} passHref>
        <Button onClick={() => router.back()} className="mt-4">Back</Button>
      </Link>

      <Modal isOpen={isOpen} onClose={closeModal} className="max-w-[700px] m-4">
        <div className="no-scrollbar relative w-full max-w-[700px] overflow-y-auto rounded-3xl bg-white p-4 dark:bg-gray-900 lg:p-11">
          <div className="px-2 pr-14">
            <h4 className="mb-5 text-2xl font-semibold text-gray-800 dark:text-white/90">
              Edit Tutorial Information
            </h4>
          </div>

          <form className="flex flex-col">
            <div className="custom-scrollbar h-[400px] overflow-y-auto px-2 pb-3">
              <div className="grid grid-cols-1 gap-x-6 gap-y-5">
                <div>
                  <Label>Tutorial Video Name</Label>
                  <Input
                    type="text"
                    value={newVideos[0].name}
                    placeholder="Enter Video Name"
                    onChange={(e) => setNewVideos([{ ...newVideos[0], name: e.target.value }])}
                  />
                </div>
                <div>
                  <Label>Tutorial Video Description</Label>
                  <Input
                    type="text"
                    value={newVideos[0].description}
                    placeholder="Enter Video Description"
                    onChange={(e) => setNewVideos([{ ...newVideos[0], description: e.target.value }])}
                  />
                </div>
                <div>
                  <Label htmlFor="videoFiles">Select Video File(s)</Label>
                  <FileInput
                    id="videoFiles"
                    onChange={handleVideoFileChange}
                    accept="video/*"
                    multiple
                  />
                  {videoFiles.length > 0 && (
                    <p className="text-sm text-gray-500 mt-1">
                      Selected: {videoFiles.map((f) => f.name).join(', ')}
                    </p>
                  )}
                  {currentVideoUrls.length > 0 && videoFiles.length === 0 && (
                    <div className="mt-2">
                      <Label>Current Video(s):</Label>
                      {currentVideoUrls.map((url, i) => (
                        <a
                          key={i}
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 underline mr-2 block"
                        >
                          Video {i + 1}
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 px-2 mt-6 lg:justify-end">
              <Button size="sm" variant="outline" onClick={closeModal}>
                Cancel
              </Button>
              <Button size="sm" onClick={handleUpdateData}>
                Save Changes
              </Button>
            </div>
          </form>
        </div>
      </Modal>
    </div>
  );
};

export default CertificateDetailPage;
