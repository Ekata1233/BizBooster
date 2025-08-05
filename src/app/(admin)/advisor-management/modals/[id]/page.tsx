// src/app/(admin)/advisor-management/edit-advisor/[id]/page.tsx
"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAdvisor } from "@/context/Advisor";
import ComponentCard from "@/components/common/ComponentCard";
import Label from "@/components/form/Label";
import Input from "@/components/form/input/InputField";

// Define a type for the form data
type AdvisorFormData = {
  name: string;
  imageUrl: string;
  tags: string;
  language: string;
  rating: number;
  phoneNumber: number;
  chat: string;
};

const EditAdvisorPage: React.FC = () => {
  const router = useRouter();
  const { id } = useParams();
  const advisorId = Array.isArray(id) ? id[0] : id;

  const { fetchAdvisorById, updateAdvisor } = useAdvisor();
  const [formData, setFormData] = useState<AdvisorFormData>({
    name: "",
    imageUrl: "",
    tags: "",
    language: "",
    rating: 0,
    phoneNumber: 0,
    chat: "",
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
            tags: advisorData.tags.join(", "), // Convert array to comma-separated string
            language: advisorData.language,
            rating: advisorData.rating,
            phoneNumber: advisorData.phoneNumber,
            chat: advisorData.chat,
          });
        } else {
          setError("Advisor not found.");
        }
      } catch (err) {
        console.log("Failed to load advisor data.", err)
        setError("Failed to load advisor data.");
      } finally {
        setIsLoading(false);
      }
    };
    loadAdvisorData();
  }, [advisorId, fetchAdvisorById]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "rating" || name === "phoneNumber" ? Number(value) : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!advisorId) {
      setError("Advisor ID is missing. Cannot update.");
      return;
    }

    setIsLoading(true);
    setError(null);

    const dataToSubmit = new FormData();
    dataToSubmit.append("name", formData.name);
    dataToSubmit.append("imageUrl", formData.imageUrl);
    dataToSubmit.append("tags", formData.tags.split(",").map(tag => tag.trim()).filter(tag => tag !== "").join(","));
    dataToSubmit.append("language", formData.language);
    dataToSubmit.append("rating", formData.rating.toString());
    dataToSubmit.append("phoneNumber", formData.phoneNumber.toString());
    dataToSubmit.append("chat", formData.chat);

    try {
      await updateAdvisor(advisorId, dataToSubmit);
      router.push("/advisor-management/advisor-list"); // Redirect to the list page on success
    } catch (err) {
        console.log("Failed to update advisor.", err)
      setError("Failed to update advisor.");
      setIsLoading(false);
    }
  };

  if (isLoading) return <div className="p-6 text-center">Loading advisor data...</div>;
  if (error) return <div className="p-6 text-center text-red-500">{error}</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6 text-center">Edit Advisor</h1>
      <ComponentCard title="Advisor Details">
        <form onSubmit={handleSubmit} className="space-y-6">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                name="name"
                type="text"
                value={formData.name}
                onChange={handleChange}
              
              />
            </div>
            <div>
              <Label htmlFor="imageUrl">Image URL</Label>
              <Input
                id="imageUrl"
                name="imageUrl"
                type="text"
                value={formData.imageUrl}
                onChange={handleChange}
              />
            </div>
            <div>
              <Label htmlFor="tags">Tags (comma-separated)</Label>
              <Input
                id="tags"
                name="tags"
                type="text"
                value={formData.tags}
                onChange={handleChange}
                placeholder="e.g. business, finance, career"
              />
            </div>
            <div>
              <Label htmlFor="language">Language</Label>
              <Input
                id="language"
                name="language"
                type="text"
                value={formData.language}
                onChange={handleChange}
              />
            </div>
            <div>
              <Label htmlFor="rating">Rating</Label>
              <input
              className="border border-grey-200 p-2 rounded-md w-full"
                id="rating"
                name="rating"
                type="number"
                step="0.1"
                min="0"
                max="5"
                value={formData.rating}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <Label htmlFor="phoneNumber">Phone Number</Label>
              <Input
                id="phoneNumber"
                name="phoneNumber"
                type="number"
                value={formData.phoneNumber}
                onChange={handleChange}
               
              />
            </div>
            <div>
              <Label htmlFor="chat">Chat Link</Label>
              <Input
                id="chat"
                name="chat"
                type="text"
                value={formData.chat}
                onChange={handleChange}
              />
            </div>
          </div>
          <div className="mt-6 flex justify-end gap-4">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-6 py-2 border rounded-md text-gray-700 hover:bg-gray-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              disabled={isLoading}
            >
              {isLoading ? "Updating..." : "Update Advisor"}
            </button>
          </div>
        </form>
      </ComponentCard>
    </div>
  );
};

export default EditAdvisorPage;