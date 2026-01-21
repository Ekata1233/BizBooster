'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';

import Label from '@/components/form/Label';
import Input from '@/components/form/input/InputField';
import FileInput from '@/components/form/input/FileInput';
import Button from '@/components/ui/button/Button';
import { useCertificate } from '@/context/CertificationContext';


interface ExistingVideoDetail {
  videoName: string;
  videoDescription: string;
  videoUrl: string;
  videoImageUrl?: string; // Optional field for existing video thumbnail URL
}

const EditCertificatePage = () => {
  const router = useRouter();
  const { id } = useParams();
  const { certificates, updateCertificate } = useCertificate();

  const [editId, setEditId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [mainImgFile, setMainImgFile] = useState<File | null>(null);
  const [currentImgUrl, setCurrentImgUrl] = useState<string | null>(null);

  // State to hold existing video URLs and their image URLs
  const [currentVideos, setCurrentVideos] = useState<ExistingVideoDetail[]>([]);

  // State for new video entries to be added
  const [newVideos, setNewVideos] = useState<
    { name: string; description: string; url: string; imageFile: File | null; imageUrl: string | null }[]
  >([{ name: '', description: '', url: '', imageFile: null, imageUrl: null }]); // Added imageFile and imageUrl for preview

  useEffect(() => {
    if (id && certificates.length > 0) {
      const cert = certificates.find((c) => c._id === id);
      if (!cert) return;

      setEditId(cert._id);
      setName(cert.name);
      setDescription(cert.description ?? '');
      setCurrentImgUrl(cert.imageUrl);
      // Populate currentVideos with existing data, including image URLs
      setCurrentVideos(cert.video || []);
      // Reset new videos fields, or pre-fill if you want to allow editing existing videos in the new section
      // For now, newVideos are for "additions". Existing videos are displayed separately.
      setNewVideos([{ name: '', description: '', url: '', imageFile: null, imageUrl: null }]);
    }
  }, [id, certificates]);

  // Handler for changing fields in a new video entry (name, description, url)
  const handleNewVideoChange = (
    idx: number,
    key: 'name' | 'description' | 'url',
    val: string
  ) => {
    setNewVideos((prev) =>
      prev.map((v, i) => (i === idx ? { ...v, [key]: val } : v))
    );
  };

  // Handler for changing the image file for a new video entry
  const handleNewVideoImageChange = (
    idx: number,
    file: File | null
  ) => {
    setNewVideos((prev) =>
      prev.map((v, i) =>
        i === idx ? { ...v, imageFile: file, imageUrl: file ? URL.createObjectURL(file) : null } : v
      )
    );
  };

  const addNewVideoField = () =>
    setNewVideos((prev) => [...prev, { name: '', description: '', url: '', imageFile: null, imageUrl: null }]);

 
const handleUpdate = async () => {
    if (!editId) return;

    const fd = new FormData();
    fd.append('name', name);
    fd.append('description', description);

    // --- IMPORTANT CHANGE HERE FOR MAIN IMAGE ---
    if (mainImgFile) {
        // A new image file was selected
        fd.append('imageUrl', mainImgFile);
    } else if (currentImgUrl) {
        
        fd.append('currentImageUrl', currentImgUrl);
    } else {
      
        fd.append('currentImageUrl', 'null'); // Or an empty string if your backend prefers that to clear it
    }
    // --- END IMPORTANT CHANGE ---

    // Append new video data
    newVideos.forEach((v, index) => {
        if (v.url.trim() || v.name.trim() || v.description.trim() || v.imageFile) {
            fd.append(`newVideos[${index}][videoName]`, v.name);
            fd.append(`newVideos[${index}][videoDescription]`, v.description);
            fd.append(`newVideos[${index}][videoUrl]`, v.url);
            if (v.imageFile) {
                fd.append(`newVideos[${index}][videoImageUrl]`, v.imageFile);
            }
        }
    });

    try {
      const res =  await updateCertificate(editId, fd);
        if (!res || !res._id) {
    throw new Error('Failed to update tutorial');
  }

  alert('Tutorial updated successfully');
      router.push('/academy/certifications-management/Tutorial-List'); 
    } catch (err) {
        console.error('Error updating webinar:', err);
         const message =
      err?.response?.data?.message ||
      err.message ||
      'Failed to update tutorial';

    alert(message);
    }
};

  return (
    <div className="max-w-7xl mx-auto p-6 bg-white dark:bg-gray-900 rounded-2xl shadow">
      <h2 className="text-3xl font-bold text-center text-black dark:text-white mb-10">
        Edit Tutorial Information
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <Label>Tutorial Name</Label>
          <Input value={name} onChange={(e) => setName(e.target.value)} />
        </div>

        <div>
          <Label>Tutorial Description</Label>
          <Input value={description} onChange={(e) => setDescription(e.target.value)} />
        </div>

        <div>
          <Label>Main Image</Label>
          <FileInput
            accept="image/*"
            onChange={(e) => setMainImgFile(e.target.files?.[0] || null)}
          />
          {(mainImgFile || currentImgUrl) && (
            <Image
              src={mainImgFile ? URL.createObjectURL(mainImgFile) : currentImgUrl!}
              width={120}
              height={120}
              alt="Main Tutorial Image"
              className="mt-2 rounded object-cover"
            />
          )}
        </div>

        {/* Display Current Videos (read-only for existing) */}
        {currentVideos.length > 0 && (
          <div className="col-span-2 mt-4">
            <Label>Current Videos</Label>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {currentVideos.map((video, i) => (
                <div key={i} className="border p-3 rounded-md bg-gray-50 shadow-sm flex flex-col gap-2">
                  {video.videoImageUrl && (
                    <div className="relative w-full h-24">
                      <Image
                        src={video.videoImageUrl}
                        alt={`Current Video ${i + 1} thumbnail`}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        className="object-cover rounded-md"
                      />
                    </div>
                  )}
                  <p className="font-semibold text-gray-800 break-words">Name: {video.videoName || 'N/A'}</p>
                  <p className="text-gray-700 text-sm break-words">Desc: {video.videoDescription || 'N/A'}</p>
                  {video.videoUrl && (
                    <a
                      href={video.videoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 underline block text-sm break-words"
                    >
                      Watch Video
                    </a>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Section for adding NEW videos */}
        <div className="col-span-2 mt-6">
          <Label className="mb-4 block">Add New Videos</Label>
          {newVideos.map((v, idx) => (
            <div key={idx} className="border p-4 rounded-md mb-4 grid grid-cols-1 md:grid-cols-3 gap-4 relative">
              <div className="col-span-full text-sm font-medium text-gray-600 mb-2">
                New Video {idx + 1}
              </div>
              <div className="md:col-span-1">
                <Label>Video Name</Label>
                <Input
                  placeholder="Video Name"
                  value={v.name}
                  onChange={(e) => handleNewVideoChange(idx, 'name', e.target.value)}
                />
              </div>
              <div className="md:col-span-1">
                <Label>Video Description</Label>
                <Input
                  placeholder="Video Description"
                  value={v.description}
                  onChange={(e) => handleNewVideoChange(idx, 'description', e.target.value)}
                />
              </div>
              <div className="md:col-span-1">
                <Label>Video URL</Label>
                <Input
                  placeholder="Video URL"
                  value={v.url}
                  onChange={(e) => handleNewVideoChange(idx, 'url', e.target.value)}
                />
              </div>
              <div className="md:col-span-1">
                <Label>Video Thumbnail Image</Label>
                <FileInput
                  accept="image/*"
                  onChange={(e) => handleNewVideoImageChange(idx, e.target.files?.[0] || null)}
                />
                {(v.imageFile || v.imageUrl) && (
                  <Image
                    src={v.imageFile ? URL.createObjectURL(v.imageFile) : v.imageUrl!}
                    width={80}
                    height={60}
                    alt={`Video ${idx + 1} Thumbnail`}
                    className="mt-2 rounded object-cover"
                  />
                )}
              </div>
            </div>
          ))}
          <button
            type="button"
            onClick={addNewVideoField}
            className="text-blue-600 underline mt-2"
          >
            + Add Another Video
          </button>
        </div>
      </div>

      <div className="flex justify-end gap-4 mt-10">
        <Link href="/academy/certifications-management/Tutorial-List"> {/* Corrected path */}
          <Button variant="outline">Cancel</Button>
        </Link>
        <Button onClick={handleUpdate}>Save Changes</Button>
      </div>
    </div>
  );
};

export default EditCertificatePage;