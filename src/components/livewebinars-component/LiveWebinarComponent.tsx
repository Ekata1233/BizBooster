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

// Validation functions
const validateWebinarName = (name: string): string => {
  if (!name.trim()) return 'Webinar name is required';
  
  // Check if it contains only numbers
  if (/^\d+$/.test(name)) return 'Webinar name cannot contain only numbers';
  
  // Check if it contains only special characters
  if (/^[^a-zA-Z0-9]+$/.test(name)) return 'Webinar name must contain letters or numbers';
  
  // Check if it has at least one letter
  if (!/[a-zA-Z]/.test(name)) return 'Webinar name must contain at least one letter';
  
  return '';
};

const validateWebinarDescription = (description: string): string => {
  if (!description.trim()) return 'Description is required';
  
  // Check if it contains only numbers
  if (/^\d+$/.test(description)) return 'Description cannot contain only numbers';
  
  // Check if it contains only special characters
  if (/^[^a-zA-Z0-9]+$/.test(description)) return 'Description must contain letters or numbers';
  
  // Check if it has at least one letter
  if (!/[a-zA-Z]/.test(description)) return 'Description must contain at least one letter';
  
  return '';
};

const validateWebinarLink = (link: string): string => {
  if (!link.trim()) return 'Webinar link is required';
  
  // Basic URL validation pattern
  const urlPattern = /^(https?:\/\/)?([\w-]+\.)+[\w-]+(\/[\w- .\/?%&=]*)?$/;
  
  if (!urlPattern.test(link)) {
    return 'Please enter a valid URL (e.g., https://example.com or example.com)';
  }
  
  return '';
};

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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Validation states
  const [nameError, setNameError] = useState('');
  const [descriptionError, setDescriptionError] = useState('');
  const [linkError, setLinkError] = useState('');
  
  // Track if fields have been touched
  const [touched, setTouched] = useState({
    name: false,
    description: false,
    link: false,
  });

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
        
        // Clear validation errors when loading data
        setNameError('');
        setDescriptionError('');
        setLinkError('');
        // Reset touched states
        setTouched({
          name: false,
          description: false,
          link: false,
        });
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
    setNameError('');
    setDescriptionError('');
    setLinkError('');
    setTouched({
      name: false,
      description: false,
      link: false,
    });
  };

  // Validate all fields
  const validateForm = (): boolean => {
    const nameValidation = validateWebinarName(name);
    const descriptionValidation = validateWebinarDescription(description);
    const linkValidation = validateWebinarLink(displayVideoUrls);
    
    setNameError(nameValidation);
    setDescriptionError(descriptionValidation);
    setLinkError(linkValidation);
    
    return !nameValidation && !descriptionValidation && !linkValidation;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Mark all fields as touched when submitting
    setTouched({
      name: true,
      description: true,
      link: true,
    });

    // Run validation before submission
    if (!validateForm()) {
      return;
    }

    // Original required field check
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

  // Handle field changes with immediate validation
  const handleNameChange = (value: string) => {
    setName(value);
    if (touched.name) {
      setNameError(validateWebinarName(value));
    }
  };

  const handleNameBlur = () => {
    setTouched(prev => ({ ...prev, name: true }));
    setNameError(validateWebinarName(name));
  };

  const handleDescriptionChange = (value: string) => {
    setDescription(value);
    if (touched.description) {
      setDescriptionError(validateWebinarDescription(value));
    }
  };

  const handleDescriptionBlur = () => {
    setTouched(prev => ({ ...prev, description: true }));
    setDescriptionError(validateWebinarDescription(description));
  };

  const handleLinkChange = (value: string) => {
    setDisplayVideoUrls(value);
    if (touched.link) {
      setLinkError(validateWebinarLink(value));
    }
  };

  const handleLinkBlur = () => {
    setTouched(prev => ({ ...prev, link: true }));
    setLinkError(validateWebinarLink(displayVideoUrls));
  };

  return (
    <div>
      <ComponentCard title={webinarIdToEdit ? 'Edit Webinar' : 'Add New Live Webinar'}>
        {loading && <p className="text-blue-500">Loading...</p>}
        {error && <p className="text-red-500">{error}</p>}

        <form onSubmit={handleSubmit} encType="multipart/form-data" className="space-y-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 md:gap-6">
          {/* Webinar Name Field */}
          <div>
            <Label>Live Webinar Name</Label>
            <Input
              type="text"
              placeholder="Enter Live Webinar Name"
              value={name}
              onChange={(e) => handleNameChange(e.target.value)}
              onBlur={handleNameBlur}
              className={nameError ? 'border-red-500 focus:border-red-500' : ''}
            />
            {touched.name && nameError && (
              <p className="text-red-500 text-sm mt-1">{nameError}</p>
            )}
          </div>

          {/* Main Image Field */}
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

          {/* Webinar Description Field */}
          <div>
            <Label>Live Webinar Description</Label>
            <Input
              type="text"
              placeholder="Enter Live Webinar Description"
              value={description}
              onChange={(e) => handleDescriptionChange(e.target.value)}
              onBlur={handleDescriptionBlur}
              className={descriptionError ? 'border-red-500 focus:border-red-500' : ''}
            />
            {touched.description && descriptionError && (
              <p className="text-red-500 text-sm mt-1">{descriptionError}</p>
            )}
          </div>

          {/* Webinar Link Field */}
          <div>
            <Label>Live Webinar Link</Label>
            <Input
              type="text"
              placeholder="Enter Webinar Link (e.g., https://example.com)"
              value={displayVideoUrls}
              onChange={(e) => handleLinkChange(e.target.value)}
              onBlur={handleLinkBlur}
              className={linkError ? 'border-red-500 focus:border-red-500' : ''}
            />
            {touched.link && linkError && (
              <p className="text-red-500 text-sm mt-1">{linkError}</p>
            )}
          </div>

          {/* Webinar Date Field */}
          <div>
            <Label>Webinar Date</Label>
            <Input
              type="date"
              value={webinarDate}
              onChange={(e) => setWebinarDate(e.target.value)}
            />
          </div>

          {/* Start Time Field */}
          <div>
            <Label htmlFor="startTime">Webinar Start Time</Label>
            <Input
              id="startTime"
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
            />
          </div>

          {/* End Time Field */}
          <div>
            <Label htmlFor="endTime">Webinar End Time</Label>
            <Input
              id="endTime"
              type="time"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
            />
          </div>

          {/* Submit Button */}
          <div className="col-span-full">
            <Button 
              type="submit" 
              size="sm" 
              disabled={loading}
            >
              {webinarIdToEdit ? 'Update Webinar' : 'Add Live Webinar'}
            </Button>
          </div>
        </form>
      </ComponentCard>
    </div>
  );
};

export default AddLiveWebinar;