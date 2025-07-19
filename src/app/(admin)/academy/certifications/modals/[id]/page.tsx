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

const EditCertificatePage = () => {
  const router = useRouter();
  const { id } = useParams();
  const { certificates, updateCertificate } = useCertificate();

  const [editId, setEditId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [videoName, setVideoName] = useState('');
  const [videoDesc, setVideoDesc] = useState('');
  const [mainImgFile, setMainImgFile] = useState<File | null>(null);
  const [currentImgUrl, setCurrentImgUrl] = useState<string | null>(null);
  const [videoFiles, setVideoFiles] = useState<File[]>([]);
  const [currentVideoUrls, setCurrentVideoUrls] = useState<string[]>([]);

  const [newVideos, setNewVideos] = useState<
    { name: string; description: string; file: File | null }[]
  >([{ name: '', description: '', file: null }]);

  useEffect(() => {
    if (id && certificates.length > 0) {
      const cert = certificates.find((c) => c._id === id);
      if (!cert) return;
      setEditId(cert._id);
      setName(cert.name);
      setDescription(cert.description ?? '');
      setVideoName(cert.video?.[0]?.videoName ?? '');
      setVideoDesc(cert.video?.[0]?.videoDescription ?? '');
      setCurrentImgUrl(cert.imageUrl);
      setCurrentVideoUrls(cert.video.map((v) => v.videoUrl));
    }
  }, [id, certificates]);

  const handleNewVideoChange = (
    idx: number,
    key: 'name' | 'description' | 'file',
    val: string | File | null
  ) => {
    setNewVideos((prev) =>
      prev.map((v, i) => (i === idx ? { ...v, [key]: val } : v))
    );
  };

  const addNewVideoField = () =>
    setNewVideos((prev) => [...prev, { name: '', description: '', file: null }]);

  const handleUpdate = async () => {
    if (!editId) return;

    const fd = new FormData();
    fd.append('name', name);
    fd.append('description', description);
    fd.append('videoName', videoName);
    fd.append('videoDescription', videoDesc);
    if (mainImgFile) fd.append('imageUrl', mainImgFile);
    videoFiles.forEach((f) => fd.append('videos', f));
    newVideos.forEach((v) => {
      if (v.file) fd.append('videos', v.file);
      fd.append('videoNames', v.name);
      fd.append('videoDescriptions', v.description);
    });

    try {
      await updateCertificate(editId, fd);
      alert('Certificate updated successfully');
      router.push('/academy/certifications');
    } catch (err) {
      console.error('Error updating certificate:', err);
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6 bg-white dark:bg-gray-900 rounded-2xl shadow">
      <h2 className="text-3xl font-bold text-center text-black dark:text-white mb-10">
        Edit Tutorial Information
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <Label>Name</Label>
          <Input value={name} onChange={(e) => setName(e.target.value)} />
        </div>

      

        <div>
          <Label>Description</Label>
          <Input value={description} onChange={(e) => setDescription(e.target.value)} />
        </div>

        <div>
          <Label>Video Name</Label>
          <Input value={videoName} onChange={(e) => setVideoName(e.target.value)} />
        </div>

         <div>
          <Label>Video Description</Label>
          <Input value={videoDesc} onChange={(e) => setVideoDesc(e.target.value)} />
        </div>

        <div>
          <Label>Add / Replace Video File(s)</Label>
          <FileInput
            multiple
            accept="video/*"
            onChange={(e) => setVideoFiles(Array.from(e.target.files || []))}
          />
          {videoFiles.length > 0 && (
            <p className="text-sm text-gray-500 mt-1">
              Selected: {videoFiles.map((f) => f.name).join(', ')}
            </p>
          )}
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
              alt="Certificate"
              className="mt-2 rounded object-cover"
            />
          )}
        </div>

        {currentVideoUrls.length > 0 && !videoFiles.length && (
          <div className="col-span-2">
            <Label>Current Videos</Label>
            {currentVideoUrls.map((u, i) => (
              <a
                key={i}
                href={u}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 underline block"
              >
                Video {i + 1}
              </a>
            ))}
          </div>
        )}

        <div className="col-span-2">
          <Label>Add New Video(s)</Label>
          {newVideos.map((v, idx) => (
            <div key={idx} className="border p-4 rounded-md mb-4 grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input
                placeholder="Video Name"
                value={v.name}
                onChange={(e) => handleNewVideoChange(idx, 'name', e.target.value)}
              />
              <Input
                placeholder="Video Description"
                value={v.description}
                onChange={(e) => handleNewVideoChange(idx, 'description', e.target.value)}
              />
              <FileInput
                accept="video/*"
                onChange={(e) =>
                  handleNewVideoChange(idx, 'file', e.target.files?.[0] || null)
                }
              />
            </div>
          ))}
          <button
            type="button"
            onClick={addNewVideoField}
            className="text-blue-600 underline"
          >
            + Add Another Video
          </button>
        </div>
      </div>

      <div className="flex justify-end gap-4 mt-10">
        <Link href="/academy/certifications">
          <Button variant="outline">Cancel</Button>
        </Link>
        <Button onClick={handleUpdate}>Save Changes</Button>
      </div>
    </div>
  );
};

export default EditCertificatePage;
