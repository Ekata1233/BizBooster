"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { useAdvisor } from "@/context/Advisor";
import ComponentCard from "@/components/common/ComponentCard";
import Label from "@/components/form/Label";
import Input from "@/components/form/input/InputField";
import FileInput from "@/components/form/input/FileInput";
import Button from "@/components/ui/button/Button";

type AdvisorFormData = {
  name: string;
  imageUrl: string;
  imageFile: File | null;
  tags: string[];
  language: string;
  rating: number;
  phoneNumber: number;
  chat: string;
};

type ValidationErrors = {
  name?: string;
  imageFile?: string;
  tags?: string;
  language?: string;
  rating?: string;
  phoneNumber?: string;
  chat?: string;
  general?: string;
};

const EditAdvisorPage: React.FC = () => {
  const router = useRouter();
  const { id } = useParams();
  const advisorId = Array.isArray(id) ? id[0] : id;
  const [tagInput, setTagInput] = useState("");
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});

  const { fetchAdvisorById, updateAdvisor } = useAdvisor();
  const [formData, setFormData] = useState<AdvisorFormData>({
    name: "",
    imageUrl: "",
    imageFile: null,
    tags: [],
    language: "",
    rating: 0,
    phoneNumber: 0,
    chat: "",
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Validation functions
  const validateName = (name: string): string | undefined => {
    const trimmedName = name.trim();
    
    if (!trimmedName) {
      return "Name is required";
    }
    
    if (trimmedName.length < 2) {
      return "Name must be at least 2 characters";
    }
    
    if (trimmedName.length > 100) {
      return "Name cannot exceed 100 characters";
    }
    
    // Check if name contains only numbers
    if (/^\d+$/.test(trimmedName)) {
      return "Name cannot contain only numbers";
    }
    
    // Check if name contains at least one alphabet character
    if (!/[a-zA-Z]/.test(trimmedName)) {
      return "Name must contain at least one letter";
    }
    
    // Check for valid characters (allow letters, numbers, spaces, and common punctuation)
    if (!/^[a-zA-Z0-9\s.,'-]+$/.test(trimmedName)) {
      return "Name contains invalid characters. Use only letters, numbers, spaces, and basic punctuation";
    }
    
    return undefined;
  };

  const validatePhoneNumber = (phoneNumber: number): string | undefined => {
    const phoneStr = phoneNumber.toString();
    
    if (!phoneNumber) {
      return "Phone number is required";
    }
    
    // Check if it's exactly 10 digits
    if (!/^\d{10}$/.test(phoneStr)) {
      return "Phone number must be exactly 10 digits";
    }
    
    // Check if it starts with a valid digit (typically 6-9 in many countries, but we'll keep it generic)
    if (!/^[1-9]/.test(phoneStr)) {
      return "Phone number cannot start with 0";
    }
    
    return undefined;
  };

  const validateRating = (rating: number): string | undefined => {
    if (isNaN(rating) || rating < 0 || rating > 5) {
      return "Rating must be between 0 and 5";
    }
    
    // Check if rating has more than 1 decimal place
    if (!Number.isInteger(rating * 10)) {
      return "Rating can have only one decimal place (e.g., 4.5)";
    }
    
    // Optional: You can restrict to specific increments
    // if (rating % 0.5 !== 0) {
    //   return "Rating must be in increments of 0.5 (e.g., 0, 0.5, 1, 1.5, ..., 5)";
    // }
    
    return undefined;
  };

  const validateForm = (): boolean => {
    const errors: ValidationErrors = {};

    // Name validation
    const nameError = validateName(formData.name);
    if (nameError) {
      errors.name = nameError;
    }

    // Image validation
    if (formData.imageFile) {
      // Check file type
      const allowedTypes = ["image/jpeg", "image/png", "image/jpg", "image/gif", "image/webp"];
      if (!allowedTypes.includes(formData.imageFile.type)) {
        errors.imageFile = "Only JPG, PNG, GIF, and WebP images are allowed";
      }
      
      // Check file size (≤1 MB)
      const maxSizeInBytes = 1 * 1024 * 1024; // 1 MB
      if (formData.imageFile.size > maxSizeInBytes) {
        errors.imageFile = "Image size must be 1 MB or less";
      }
    }

    // Tags validation
    if (formData.tags.length === 0) {
      errors.tags = "At least one tag is required";
    }
    formData.tags.forEach(tag => {
      if (tag.length > 20) {
        errors.tags = "Each tag must be 20 characters or less";
      }
    });

    // Language validation
    if (!formData.language.trim()) {
      errors.language = "Language is required";
    } else if (formData.language.trim().length > 50) {
      errors.language = "Language cannot exceed 50 characters";
    }

    // Rating validation
    const ratingError = validateRating(formData.rating);
    if (ratingError) {
      errors.rating = ratingError;
    }

    // Phone number validation
    const phoneError = validatePhoneNumber(formData.phoneNumber);
    if (phoneError) {
      errors.phoneNumber = phoneError;
    }

    // Chat validation
    if (!formData.chat.trim()) {
      errors.chat = "Chat field is required";
    } else if (formData.chat.trim().length > 200) {
      errors.chat = "Chat cannot exceed 200 characters";
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  useEffect(() => {
    if (!advisorId) {
      setError("Advisor ID not found.");
      setIsLoading(false);
      return;
    }

    const loadAdvisorData = async () => {
      try {
        const advisorData = await fetchAdvisorById(advisorId);
        if (advisorData) {
          setFormData({
            name: advisorData.name,
            imageUrl: advisorData.imageUrl,
            imageFile: null,
            tags: Array.isArray(advisorData.tags)
              ? advisorData.tags
              : advisorData.tags
                  ?.split(",")
                  .map((tag: string) => tag.trim())
                  .filter(Boolean) || [],
            language: advisorData.language,
            rating: advisorData.rating,
            phoneNumber: advisorData.phoneNumber,
            chat: advisorData.chat,
          });
        } else {
          setError("Advisor not found.");
        }
      } catch (err) {
        console.error("Failed to load advisor data.", err);
        setError("Failed to load advisor data.");
      } finally {
        setIsLoading(false);
      }
    };
    loadAdvisorData();
  }, [advisorId, fetchAdvisorById]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    // Clear validation error for this field when user starts typing
    setValidationErrors(prev => ({ ...prev, [name]: undefined }));

    let processedValue: string | number = value;

    if (name === "rating") {
      // Handle rating input with proper validation
      const numValue = parseFloat(value);
      processedValue = isNaN(numValue) ? 0 : Math.min(5, Math.max(0, numValue));
      
      // Format to one decimal place
      if (value && !value.endsWith('.')) {
        processedValue = parseFloat(processedValue.toFixed(1));
      }
    } else if (name === "phoneNumber") {
      // Handle phone number input - only allow digits
      const digitsOnly = value.replace(/\D/g, '');
      processedValue = digitsOnly ? parseInt(digitsOnly, 10) : 0;
      
      // Limit to 10 digits
      if (digitsOnly.length > 10) {
        processedValue = parseInt(digitsOnly.slice(0, 10), 10);
      }
    } else if (name === "name") {
      // Allow name with letters, numbers, spaces, and basic punctuation
      processedValue = value;
    } else {
      processedValue = value;
    }

    setFormData((prev) => ({
      ...prev,
      [name]: processedValue,
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    
    // Clear validation error when new file is selected
    setValidationErrors(prev => ({ ...prev, imageFile: undefined }));

    // Validate file size immediately
    if (file) {
      const maxSizeInBytes = 1 * 1024 * 1024; // 1 MB
      if (file.size > maxSizeInBytes) {
        setValidationErrors(prev => ({ 
          ...prev, 
          imageFile: "Image size must be 1 MB or less" 
        }));
        return; // Don't set the file if it's too large
      }

      // Validate file type
      const allowedTypes = ["image/jpeg", "image/png", "image/jpg", "image/gif", "image/webp"];
      if (!allowedTypes.includes(file.type)) {
        setValidationErrors(prev => ({ 
          ...prev, 
          imageFile: "Only JPG, PNG, GIF, and WebP images are allowed" 
        }));
        return;
      }
    }

    setFormData((prev) => ({
      ...prev,
      imageFile: file,
      imageUrl: file ? "" : prev.imageUrl, // Clear imageUrl only if a new file is selected
    }));
  };

  const handleTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && tagInput.trim() !== "") {
      e.preventDefault();
      const newTag = tagInput.trim().replace(/^#/, "");
      
      // Validate tag length
      if (newTag.length > 20) {
        setValidationErrors(prev => ({ 
          ...prev, 
          tags: "Each tag must be 20 characters or less" 
        }));
        return;
      }
      
      if (!formData.tags.includes(newTag)) {
        // Clear tags error when adding a valid tag
        if (formData.tags.length === 0) {
          setValidationErrors(prev => ({ ...prev, tags: undefined }));
        }
        
        setFormData(prev => ({
          ...prev,
          tags: [...prev.tags, newTag],
        }));
      }
      setTagInput("");
    }
  };

  const handleRemoveTag = (index: number) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!advisorId) {
      setError("Advisor ID is missing. Cannot update.");
      return;
    }

    // Validate form before submission
    if (!validateForm()) {
      // Scroll to the first error
      const firstErrorElement = document.querySelector('[class*="error-message"]');
      firstErrorElement?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const dataToSubmit = new FormData();
      dataToSubmit.append("name", formData.name.trim());
      dataToSubmit.append("tags", formData.tags.join(","));
      dataToSubmit.append("language", formData.language.trim());
      dataToSubmit.append("rating", formData.rating.toString());
      dataToSubmit.append("phoneNumber", formData.phoneNumber.toString());
      dataToSubmit.append("chat", formData.chat.trim());

      if (formData.imageFile) {
        dataToSubmit.append("imageUrl", formData.imageFile);
      } else {
        dataToSubmit.append("imageUrl", formData.imageUrl);
      }

      await updateAdvisor(advisorId, dataToSubmit);
      alert("Advisor updated successfully!");
      router.push("/advisor-management/advisor-list");
    } catch (err) {
      console.error("Failed to update advisor.", err);
      setError("Failed to update advisor. Please try again.");
      setIsLoading(false);
    }
  };

  // Helper function to render error messages
  const renderErrorMessage = (field: keyof ValidationErrors) => {
    if (validationErrors[field]) {
      return (
        <p className="mt-1 text-sm text-red-600 error-message">
          {validationErrors[field]}
        </p>
      );
    }
    return null;
  };

  if (isLoading) return <div className="p-6 text-center">Loading advisor data...</div>;
  if (error) return <div className="p-6 text-center text-red-500">{error}</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6 text-center">Edit Advisor</h1>
      
      {/* General error display */}
      {validationErrors.general && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {validationErrors.general}
        </div>
      )}
      
      <ComponentCard title="Advisor Details">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Name field */}
            <div>
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                name="name"
                type="text"
                value={formData.name}
                onChange={handleChange}
                className={validationErrors.name ? "border-red-500" : ""}
                placeholder="Enter advisor name (e.g., John Smith)"
              />
              <p className="mt-1 text-xs text-gray-500">
                Must contain letters (can include numbers, spaces, and basic punctuation)
              </p>
              {renderErrorMessage("name")}
            </div>

            {/* Image field */}
            <div>
              <Label htmlFor="imageFile">Advisor Image</Label>
              <FileInput
                id="imageFile"
                name="imageFile"
                accept=".jpg,.jpeg,.png,.gif,.webp"
                onChange={handleFileChange}
                className={validationErrors.imageFile ? "border-red-500" : ""}
              />
              <p className="mt-1 text-xs text-gray-500">
                Supported formats: JPG, PNG, GIF, WebP. Max size: 1 MB
              </p>
              
              {/* Display the name of the newly selected file */}
              {formData.imageFile && (
                <div className="mb-2">
                  <Image 
                    src={URL.createObjectURL(formData.imageFile)} 
                    alt="Selected Advisor Image" 
                    className="h-20 w-20 object-cover rounded-md mt-2"
                    width={80}
                    height={80}
                  />
                  <p className="mt-1 text-sm text-gray-600">
                    Selected: {formData.imageFile.name} 
                    ({(formData.imageFile.size / 1024).toFixed(1)} KB)
                  </p>
                </div>
              )}
              
              {/* Display current image if no new file selected */}
              {formData.imageUrl && !formData.imageFile && (
                <div className="mb-2">
                  <Image 
                    src={formData.imageUrl} 
                    alt="Current Advisor Image" 
                    className="h-20 w-20 object-cover rounded-md mt-2"
                    width={80}
                    height={80}
                  />
                  <p className="mt-1 text-sm text-gray-600">
                    Current image
                  </p>
                </div>
              )}
              {renderErrorMessage("imageFile")}
            </div>

            {/* Tags field */}
            <div>
              <Label htmlFor="tags">Tags *</Label>
              <div className={`border rounded px-3 py-2 flex flex-wrap gap-2 ${validationErrors.tags ? "border-red-500" : ""}`}>
                {formData.tags.map((tag, index) => (
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
                      ×
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
              <p className="mt-1 text-xs text-gray-500">
                Press Enter to add a tag. Maximum 20 characters per tag.
              </p>
              {renderErrorMessage("tags")}
            </div>

            {/* Language field */}
            <div>
              <Label htmlFor="language">Language *</Label>
              <Input
                id="language"
                name="language"
                type="text"
                value={formData.language}
                onChange={handleChange}
                className={validationErrors.language ? "border-red-500" : ""}
              />
              {renderErrorMessage("language")}
            </div>

            {/* Rating field */}
            <div>
              <Label htmlFor="rating">Rating *</Label>
              <input
                className={`border border-gray-200 p-2 rounded-md w-full ${validationErrors.rating ? "border-red-500" : ""}`}
                id="rating"
                name="rating"
                type="number"
                step="0.1"
                min="0"
                max="5"
                value={formData.rating}
                onChange={handleChange}
                placeholder="0.0 to 5.0"
              />
              <p className="mt-1 text-xs text-gray-500">
                Must be between 0 and 5 (one decimal place allowed, e.g., 4.5)
              </p>
              {renderErrorMessage("rating")}
            </div>

            {/* Phone number field */}
            <div>
              <Label htmlFor="phoneNumber">Phone Number *</Label>
              <Input
                id="phoneNumber"
                name="phoneNumber"
                type="tel"
                value={formData.phoneNumber || ""}
                onChange={handleChange}
                className={validationErrors.phoneNumber ? "border-red-500" : ""}
                placeholder="10-digit phone number"
                maxLength={10}
              />
              <p className="mt-1 text-xs text-gray-500">
                Must be exactly 10 digits (no spaces or special characters)
              </p>
              {renderErrorMessage("phoneNumber")}
            </div>

            {/* Chat field */}
            <div>
              <Label htmlFor="chat">Chat *</Label>
              <Input
                id="chat"
                name="chat"
                type="text"
                value={formData.chat}
                onChange={handleChange}
                className={validationErrors.chat ? "border-red-500" : ""}
              />
              {renderErrorMessage("chat")}
            </div>
          </div>

          {/* Required fields note */}
          <div className="text-sm text-gray-600">
            <p>* Required fields</p>
          </div>

          <div className="mt-6 flex justify-end gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                router.back();
              }}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              variant="primary"
            >
              {isLoading ? "Updating..." : "Update Advisor"}
            </Button>
          </div>
        </form>
      </ComponentCard>
    </div>
  );
};

export default EditAdvisorPage;