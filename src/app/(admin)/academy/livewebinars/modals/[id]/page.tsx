'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useLiveWebinars } from '@/context/LiveWebinarContext';
import Label from '@/components/form/Label';
import Input from '@/components/form/input/InputField';
import FileInput from '@/components/form/input/FileInput';
import Image from 'next/image';
import Button from '@/components/ui/button/Button';
import Link from 'next/link';

const EditLiveWebinarPage = () => {
  const router = useRouter();
  const { id } = useParams();
  const { webinars, updateWebinar } = useLiveWebinars();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  useEffect(() => {
    if (id && webinars.length > 0) {
      const selected = webinars.find(w => w._id === id);
      if (selected) {
        setName(selected.name);
        setDescription(selected.description || '');
        setVideoUrl(Array.isArray(selected.displayVideoUrls) ? selected.displayVideoUrls[0] : selected.displayVideoUrls || '');
        setDate(selected.date || '');
        setStartTime(selected.startTime || '');
        setEndTime(selected.endTime || '');
        setImageUrl(selected.imageUrl || null);
      }
    }
  }, [id, webinars]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleUpdate = async () => {
    if (!id) return;

    const formData = new FormData();
    formData.append('name', name);
    formData.append('description', description);
    formData.append('date', date);
    formData.append('startTime', startTime);
    formData.append('endTime', endTime);
    formData.append('displayVideoUrls', videoUrl);

    if (selectedFile) {
      formData.append('imageUrl', selectedFile);
    }

    try {
      await updateWebinar(id as string, formData);
      alert('Webinar updated successfully');
      resetForm();
      router.push('/academy/livewebinars');
    } catch (error) {
      console.error('Error updating webinar:', error);
    }
  };

   const resetForm = () => {   
        setName('');
        setDescription('');
        setVideoUrl('');
        setDate('');
        setStartTime('');
        setEndTime('');
        setSelectedFile(null);
        setImageUrl(null);
    };

  return (
    <div className="w-full h-full px-6 md:px-10 lg:px-20 py-10 overflow-y-auto">
      <h1 className="text-3xl font-bold text-black mb-8 text-center">Edit Live Webinar</h1>

      <form className="space-y-8">
        {/* Name */}
        <div>
          <Label htmlFor="name">Webinar Name</Label>
          <Input id="name" value={name} onChange={e => setName(e.target.value)} />
        </div>
    
       

        {/* Description */}
        <div>
          <Label htmlFor="description">Description</Label>
          <Input id="description" value={description} onChange={e => setDescription(e.target.value)} />
        </div>

        {/* Video URL */}
        <div>
          <Label htmlFor="videoUrl">Webinar Link</Label>
          <Input id="videoUrl" value={videoUrl} onChange={e => setVideoUrl(e.target.value)} />
        </div>

        {/* Date & Time */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <Label htmlFor="date">Date</Label>
            <Input type="date" id="date" value={date} onChange={e => setDate(e.target.value)} />
          </div>

          <div>
            <Label htmlFor="startTime">Start Time</Label>
            <Input type="time" id="startTime" value={startTime} onChange={e => setStartTime(e.target.value)} />
          </div>

          <div>
            <Label htmlFor="endTime">End Time</Label>
            <Input type="time" id="endTime" value={endTime} onChange={e => setEndTime(e.target.value)} />
          </div>
        </div>

        {/* Image Upload */}
        <div>
          <Label htmlFor="image">Upload Image</Label>
          <FileInput id="image" onChange={handleFileChange} />
          {(selectedFile || imageUrl) && (
            <div className="mt-4 w-40 h-40">
              <Image
                src={selectedFile ? URL.createObjectURL(selectedFile) : imageUrl!}
                alt="Webinar Image"
                width={160}
                height={160}
                className="object-cover rounded"
              />
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-4">
          <Link href="/academy/livewebinars" passHref>
            <Button variant="outline">Back</Button>
          </Link>
          <Button onClick={handleUpdate}>Save Changes</Button>
        </div>
      </form>
    </div>
  );
};

export default EditLiveWebinarPage;
