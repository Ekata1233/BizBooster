'use client';

import React, { useEffect, useState } from 'react';
import FileInput from '@/components/form/input/FileInput';
import Input from '@/components/form/input/InputField';
import Label from '@/components/form/Label';
import Button from '@/components/ui/button/Button';
import ComponentCard from '../common/ComponentCard';
import { useLiveWebinars } from '@/context/LiveWebinarContext';
import axios from 'axios';

interface AddLiveWebinarProps {
  webinarIdToEdit?: string;
}

const AddLiveWebinar: React.FC<AddLiveWebinarProps> = ({ webinarIdToEdit }) => {
  const { addWebinar, updateWebinar } = useLiveWebinars();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [displayVideoUrls, setDisplayVideoUrls] = useState('');
  const [webinarDate, setWebinarDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');

//   const [webinarTime, setWebinarTime] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchWebinar = async () => {
      if (!webinarIdToEdit) {
        resetForm();
        return;
      }

      try {
        setLoading(true);
        const res = await axios.get(`/api/academy/livewebinars/${webinarIdToEdit}`);
        const data = res.data.data;

        setName(data.name || '');
        setDescription(data.description || '');
        setImageUrl(data.imageUrl || null);
        setDisplayVideoUrls(data.displayVideoUrls || '');
        setWebinarDate(data.date || '');
        setStartTime(data.startTime || '');
        setEndTime(data.endTime || '');
      } catch (err) {
        setError('Error fetching webinar details: ' + (err as Error).message);
      } finally {
        setLoading(false);
      }
    };

    fetchWebinar();
  }, [webinarIdToEdit]);

  const resetForm = () => {
    setName('');
    setDescription('');
    setImageFile(null);
    setImageUrl(null);
    setDisplayVideoUrls('');
    setWebinarDate('');
    setStartTime('');
    setEndTime('');
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name || !description || (!imageFile && !imageUrl) || !displayVideoUrls || !webinarDate || !startTime || !endTime) {
      alert('Please fill in all required fields.');
      return;
    }

    try {
      setLoading(true);

      const formData = new FormData();
      formData.append('name', name);
      formData.append('description', description);
      formData.append('displayVideoUrls', displayVideoUrls);
      formData.append('date', webinarDate);
      formData.append('startTime', startTime);
      formData.append('endTime', endTime);

      if (imageFile) {
        formData.append('imageUrl', imageFile);
      }

      if (webinarIdToEdit) {
        await updateWebinar(webinarIdToEdit, formData);
        alert('Webinar updated successfully!');
      } else {
        await addWebinar(formData);
        alert('Webinar added successfully!');
      }

      resetForm();
    } catch (err) {
      console.error('Submit error:', err);
      setError('Submission failed. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <ComponentCard title={webinarIdToEdit ? 'Edit Webinar' : 'Add New Live Webinar'}>
        {loading && <p className="text-blue-500">Loading...</p>}
        {error && <p className="text-red-500">{error}</p>}

        <form onSubmit={handleSubmit} encType="multipart/form-data" className="space-y-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 md:gap-6">
          <div>
            <Label>Live Webinar Name</Label>
            <Input
              type="text"
              placeholder="Enter Live Webinar Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div>
            <Label>Main Image</Label>
            <FileInput
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  setImageFile(file);
                  setImageUrl(null);
                }
              }}
            />
            {imageUrl && !imageFile && (
              <p className="text-sm text-gray-500 mt-1">
                Current Image:{' '}
                <a href={imageUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">
                  View
                </a>
              </p>
            )}
            {imageFile && <p className="text-sm text-gray-500 mt-1">Selected: {imageFile.name}</p>}
          </div>

          <div>
            <Label>Live Webinar Description</Label>
            <Input
              type="text"
              placeholder="Enter Live Webinar Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div>
            <Label>Live Webinar Link</Label>
            <Input
              type="text"
              placeholder="Enter Webinar Link"
              value={displayVideoUrls}
              onChange={(e) => setDisplayVideoUrls(e.target.value)}
            />
          </div>

          <div>
            <Label>Webinar Date</Label>
            <Input
              type="date"
              value={webinarDate}
              onChange={(e) => setWebinarDate(e.target.value)}
            />
          </div>

                            
                    <div>
                        <Label htmlFor="startTime">Webinar Start Time</Label>
                        <Input
                        id="startTime"
                        type="time"
                        value={startTime}
                        onChange={(e) => setStartTime(e.target.value)}
                        />
                    </div>
                    <div>
                        <Label htmlFor="endTime">Webinar End Time</Label>
                        <Input
                        id="endTime"
                        type="time"
                        value={endTime}
                        onChange={(e) => setEndTime(e.target.value)}
                        />
                    </div>





          <div className="col-span-full">
            <Button type="submit" size="sm" disabled={loading}>
              {webinarIdToEdit ? 'Update Webinar' : 'Add Live Webinar'}
            </Button>
          </div>
        </form>
      </ComponentCard>
    </div>
  );
};

export default AddLiveWebinar;
