'use client';

import React, { useEffect, useState } from 'react';
import FileInput from '@/components/form/input/FileInput';
import Input from '@/components/form/input/InputField';
import Label from '@/components/form/Label';
import Button from '@/components/ui/button/Button';
import ComponentCard from '@/components/common/ComponentCard';
import { useAdvisor } from '@/context/Advisor';
import axios from 'axios';

// Simplified interface, no longer a Next.js PageProps type
interface AddAdvisorProps {
  advisorIdToEdit?: string;
}

const AddAdvisor: React.FC<AddAdvisorProps> = ({ advisorIdToEdit }) => {
  const { addAdvisor, updateAdvisor } = useAdvisor();

  const [name, setName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [chat, setChat] = useState('');
  const [language, setLanguage] = useState('');
  const [rating, setRating] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [imageUrl, setImageUrl] = useState<File | null>(null);
  const [fileInputKey, setFileInputKey] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  // Validation states
  const [validationErrors, setValidationErrors] = useState<{
    name?: string;
    phoneNumber?: string;
    chat?: string;
    language?: string;
    rating?: string;
    tags?: string;
    image?: string;
  }>({});

  useEffect(() => {
    const fetchAdvisor = async () => {
      if (!advisorIdToEdit) {
        resetForm();
        return;
      }

      try {
        setLoading(true);
        const res = await axios.get(`/api/advisor/${advisorIdToEdit}`);
        const data = res.data.data;

        setName(data.name || '');
        setPhoneNumber(data.phoneNumber || '');
        setChat(data.chat || '');
        setLanguage(data.language || '');
        setRating(data.rating?.toString() || '');
        setTags(data.tags || []);
        setImageUrl(null);
        setValidationErrors({}); // Clear validation errors
      } catch (err) {
        setError('Error fetching advisor details: ' + (err as Error).message);
      } finally {
        setLoading(false);
      }
    };

    fetchAdvisor();
  }, [advisorIdToEdit]);

  // Validation functions
  const validateName = (name: string): boolean => {
    const nameRegex = /^[a-zA-ZÀ-ÿ\s'-]+$/;
    return nameRegex.test(name.trim()) && name.trim().length > 0;
  };

  const validatePhoneNumber = (phone: string): boolean => {
    // Allow numbers, spaces, +, -, (, )
    const phoneRegex = /^[\d\s+\-()]+$/;
    return phoneRegex.test(phone.trim()) && phone.trim().length >= 10;
  };

  const validateLanguage = (language: string): boolean => {
    const languageRegex = /^[a-zA-Z\s]+$/;
    return languageRegex.test(language.trim()) && language.trim().length > 0;
  };

  const validateChat = (chat: string): boolean => {
    const chatRegex = /^[a-zA-ZÀ-ÿ0-9\s.,!?@#$%^&*()_+\-=[\]{};':"\\|<>`~]+$/;
    return chatRegex.test(chat.trim()) && chat.trim().length > 0;
  };

  const validateRating = (rating: string): boolean => {
    const ratingRegex = /^[0-5](\.\d{1,2})?$/;
    if (!ratingRegex.test(rating.trim())) return false;
    
    const numericRating = parseFloat(rating);
    return numericRating >= 0 && numericRating <= 5;
  };

  const validateImage = (file: File, maxSizeMB: number = 1): string | null => {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      return `Invalid file type. Allowed types: ${allowedTypes.join(', ')}`;
    }

    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      return `Image size must be less than or equal to ${maxSizeMB}MB. Current size: ${(file.size / (1024 * 1024)).toFixed(2)}MB`;
    }

    return null;
  };

  const validateForm = (): boolean => {
    const newErrors: typeof validationErrors = {};

    // Name validation
    if (!name.trim()) {
      newErrors.name = 'Name is required.';
    } else if (!validateName(name)) {
      newErrors.name = 'Name should contain only letters, spaces, hyphens, and apostrophes.';
    }

    // Phone Number validation
    if (!phoneNumber.trim()) {
      newErrors.phoneNumber = 'Phone Number is required.';
    } else if (!validatePhoneNumber(phoneNumber)) {
      newErrors.phoneNumber = 'Please enter a valid phone number (minimum 10 digits).';
    }

    // Language validation
    if (!language.trim()) {
      newErrors.language = 'Language is required.';
    } else if (!validateLanguage(language)) {
      newErrors.language = 'Language should contain only letters and spaces.';
    }

    // Chat validation
    if (!chat.trim()) {
      newErrors.chat = 'Chat is required.';
    } else if (!validateChat(chat)) {
      newErrors.chat = 'Chat contains invalid characters.';
    }

    // Rating validation
    if (!rating.trim()) {
      newErrors.rating = 'Rating is required.';
    } else if (!validateRating(rating)) {
      newErrors.rating = 'Rating must be a number between 0 and 5 (e.g., 4.5, 3.75).';
    }

    // Tags validation
    if (tags.length === 0) {
      newErrors.tags = 'At least one tag is required.';
    }

    // Image validation
    if (!imageUrl) {
      newErrors.image = 'Image is required.';
    } else if (imageUrl && !errorMessage) {
      const imageError = validateImage(imageUrl, 1);
      if (imageError) {
        newErrors.image = imageError;
      }
    }

    setValidationErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const resetForm = () => {
    setName('');
    setPhoneNumber('');
    setChat('');
    setLanguage('');
    setRating('');
    setTags([]);
    setTagInput('');
    setImageUrl(null);
    setError(null);
    setValidationErrors({});
    setFileInputKey(prevKey => prevKey + 1);
    setPreview(null);
    setErrorMessage(null);
  };

  const handleRemoveTag = (indexToRemove: number) => {
    setTags((prev) => prev.filter((_, i) => i !== indexToRemove));
    
    // Clear tags error if tags are added
    if (validationErrors.tags && tags.length > 1) {
      setValidationErrors(prev => ({ ...prev, tags: undefined }));
    }
  };

  const handleTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && tagInput.trim() !== '') {
      e.preventDefault();
      const newTag = tagInput.trim().replace(/^#/, '');
      if (!tags.includes(newTag)) {
        setTags([...tags, newTag]);
        // Clear tags error when at least one tag is added
        if (validationErrors.tags) {
          setValidationErrors(prev => ({ ...prev, tags: undefined }));
        }
      }
      setTagInput('');
    }
  };

  // Event handlers with error clearing
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setName(value);
    if (validationErrors.name) {
      setValidationErrors(prev => ({ ...prev, name: undefined }));
    }
  };

  const handlePhoneNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPhoneNumber(value);
    if (validationErrors.phoneNumber) {
      setValidationErrors(prev => ({ ...prev, phoneNumber: undefined }));
    }
  };

  const handleLanguageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setLanguage(value);
    if (validationErrors.language) {
      setValidationErrors(prev => ({ ...prev, language: undefined }));
    }
  };

  const handleChatChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setChat(value);
    if (validationErrors.chat) {
      setValidationErrors(prev => ({ ...prev, chat: undefined }));
    }
  };

  const handleRatingChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setRating(value);
    if (validationErrors.rating) {
      setValidationErrors(prev => ({ ...prev, rating: undefined }));
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;

    if (!file) {
      setImageUrl(null);
      setPreview(null);
      setErrorMessage(null);
      setValidationErrors(prev => ({ ...prev, image: undefined }));
      return;
    }

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif"];
    if (!allowedTypes.includes(file.type)) {
      setErrorMessage("Invalid file type. Allowed: JPEG, JPG, PNG, WEBP, GIF");
      setValidationErrors(prev => ({ ...prev, image: "Invalid file type. Allowed: JPEG, JPG, PNG, WEBP, GIF" }));
      e.target.value = "";
      return;
    }

    // Validate file size (1MB)
    if (file.size > 1024 * 1024) {
      setErrorMessage("Image size must be ≤ 1MB");
      setValidationErrors(prev => ({ 
        ...prev, 
        image: `Image size must be less than or equal to 1MB. Current size: ${(file.size / (1024 * 1024)).toFixed(2)}MB`
      }));
      e.target.value = "";
      return;
    }

    setErrorMessage(null);
    setImageUrl(file);
    setPreview(URL.createObjectURL(file));
    // Clear any previous image error
    setValidationErrors(prev => ({ ...prev, image: undefined }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate form before submission
    if (!validateForm()) {
      alert('Please fix the validation errors before submitting.');
      return;
    }

    if (errorMessage) {
      alert("Please fix image errors before submitting.");
      return;
    }

    try {
      setLoading(true);

      const formData = new FormData();
      formData.append('name', name.trim());
      formData.append('phoneNumber', phoneNumber.trim());
      formData.append('chat', chat.trim());
      formData.append('language', language.trim());
      formData.append('rating', rating.trim());
      tags.forEach(tag => formData.append('tags', tag));
      if (imageUrl) formData.append('imageUrl', imageUrl);

      if (advisorIdToEdit) {
        await updateAdvisor(advisorIdToEdit, formData);
        alert('Advisor updated successfully!');
      } else {
        const res = await addAdvisor(formData);
        console.log("response for add advisor : ", res);
        if (!res?.success) {
          alert(res?.message || 'Submission failed');
          return;
        }
        alert('Advisor added successfully!');
      }

      resetForm();
    } catch (err: any) {
      console.error('Submit error:', err);
      const apiMessage = err.response?.data?.message || err.message || 'Submission failed';
      alert(apiMessage);
      setError(apiMessage);
    } finally {
      setLoading(false);
    }
  };

  // Check if form is ready to submit
  const isFormReady = () => {
    return name.trim() && 
           phoneNumber.trim() && 
           chat.trim() && 
           language.trim() && 
           rating.trim() && 
           tags.length > 0 && 
           imageUrl && 
           !errorMessage;
  };

  return (
    <div>
      <ComponentCard title={advisorIdToEdit ? 'Edit Advisor' : 'Add New Advisor'}>
        {loading && <p className="text-blue-500">Loading...</p>}

        <form
          onSubmit={handleSubmit}
          encType="multipart/form-data"
          className="space-y-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 md:gap-6"
        >
          <div>
            <Label>Name</Label>
            <Input
              type="text"
              placeholder="Enter your name (letters only)"
              value={name}
              onChange={handleNameChange}
              className={validationErrors.name ? 'border-red-500' : ''}
            />
            {validationErrors.name && (
              <p className="text-red-500 text-sm mt-1">{validationErrors.name}</p>
            )}
          </div>

          <div>
            <Label>Main Image</Label>
            <FileInput
              accept="image/*"
              key={fileInputKey}
              onChange={handleImageChange}
              className={validationErrors.image ? 'border-red-500' : ''}
            />

            {imageUrl && !errorMessage && !validationErrors.image && (
              <p className="text-green-600 text-sm mt-1">
                ✓ Valid: {imageUrl.name} ({(imageUrl.size / (1024 * 1024)).toFixed(2)}MB)
              </p>
            )}

            {preview && (
              <img
                src={preview}
                alt="Advisor Preview"
                className="w-full h-48 object-cover rounded-lg mt-2"
              />
            )}
            {validationErrors.image && (
              <div className="text-red-500 text-sm mt-1">{validationErrors.image}</div>
            )}
            <p className="text-xs text-gray-500 mt-1">
              Max size: 1MB | Supported: JPEG, JPG, PNG, WEBP, GIF
            </p>
          </div>

          <div>
            <Label>Language</Label>
            <Input
              type="text"
              placeholder="Enter Language (letters only)"
              value={language}
              onChange={handleLanguageChange}
              className={validationErrors.language ? 'border-red-500' : ''}
            />
            {validationErrors.language && (
              <p className="text-red-500 text-sm mt-1">{validationErrors.language}</p>
            )}
          </div>

          <div>
            <Label>Phone Number</Label>
            <Input
              type="text"
              placeholder="Enter Phone Number (minimum 10 digits)"
              value={phoneNumber}
              onChange={handlePhoneNumberChange}
              className={validationErrors.phoneNumber ? 'border-red-500' : ''}
            />
            {validationErrors.phoneNumber && (
              <p className="text-red-500 text-sm mt-1">{validationErrors.phoneNumber}</p>
            )}
          </div>

          <div className="col-span-2">
            <Label>Tags</Label>
            <div className={`border rounded px-3 py-2 flex flex-wrap gap-2 ${validationErrors.tags ? 'border-red-500' : ''}`}>
              {tags.map((tag, index) => (
                <span
                  key={index}
                  className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm flex items-center"
                >
                  #{tag}
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(index)}
                    className="ml-2 text-red-500 hover:text-red-700"
                  >
                    &times;
                  </button>
                </span>
              ))}
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleTagKeyDown}
                placeholder="Type a tag and press Enter"
                className="flex-grow outline-none py-1"
              />
            </div>
            {validationErrors.tags && (
              <p className="text-red-500 text-sm mt-1">{validationErrors.tags}</p>
            )}
          </div>

          <div>
            <Label>Rating</Label>
            <Input
              type="text"
              placeholder="Enter Rating (0-5, e.g. 4.5)"
              value={rating}
              onChange={handleRatingChange}
              className={validationErrors.rating ? 'border-red-500' : ''}
            />
            {validationErrors.rating && (
              <p className="text-red-500 text-sm mt-1">{validationErrors.rating}</p>
            )}
          </div>

          <div>
            <Label>Chat</Label>
            <Input
              type="text"
              placeholder="Enter chat (letters, numbers allowed)"
              value={chat}
              onChange={handleChatChange}
              className={validationErrors.chat ? 'border-red-500' : ''}
            />
            {validationErrors.chat && (
              <p className="text-red-500 text-sm mt-1">{validationErrors.chat}</p>
            )}
          </div>

          <div className="col-span-full">
            <Button 
              type="submit" 
              size="sm" 
              disabled={loading || !isFormReady()}
              className={!isFormReady() ? 'opacity-50 cursor-not-allowed' : ''}
            >
              {advisorIdToEdit ? 'Update Advisor' : 'Add Advisor'}
            </Button>
          </div>
        </form>
      </ComponentCard>
    </div>
  );
};

export default AddAdvisor;