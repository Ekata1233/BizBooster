'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import axios from 'axios';
import { PencilIcon } from 'lucide-react';
import { TrashBinIcon } from '@/icons';

// Lazy‑load the CKEditor form wrapper
const AboutUsEditorForm = dynamic(
  () => import('@/components/about-us-component/AboutUsEditorForm'),
  {
    ssr: false,
    loading: () => (
      <div className="flex justify-center items-center h-40">
        <p className="text-xl text-gray-700">Loading editor...</p>
      </div>
    ),
  }
);

// Entry type
type AboutUsEntry = {
  _id: string;        // MongoDB ID ('' when adding new)
  content: string;
  createdAt?: string;
  updatedAt?: string;
};

// Blank template used when adding a new entry
const BLANK_ENTRY: AboutUsEntry = { _id: '', content: '' };

const AdminAboutUsManagementPage: React.FC = () => {
  const [aboutUsList, setAboutUsList] = useState<AboutUsEntry[]>([]);
  const [editingEntry, setEditingEntry] = useState<AboutUsEntry | null>(null); // null === Add New
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Fetch all About Us entries
  const fetchAboutUsContent = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await axios.get('/api/aboutus');
      if (response.data.success) {
        setAboutUsList(response.data.data);
      } else {
        setError(response.data.message || 'Failed to fetch About Us content.');
        setAboutUsList([]);
      }
    } catch (err: unknown) {
      console.error('Failed to fetch About Us content:', err);
      setError((err as Error).message || 'Failed to load About Us content.');
      setAboutUsList([]);
    } finally {
      setIsLoading(false);
    }
  };

 
  const handleSaveAboutUs = async (dataToSave: { _id?: string; content: string }) => {
    setIsSaving(true);
    setSaveSuccess(false);
    setError(null);
    try {
      let response;
      if (dataToSave._id) {
        // Update
        response = await axios.put(`/api/aboutus/${dataToSave._id}`, {
          content: dataToSave.content,
        });
      } else {
        // Create
        response = await axios.post('/api/aboutus', { content: dataToSave.content });
      }

      if (response.data.success) {
        setSaveSuccess(true);
        fetchAboutUsContent();
        // Return to Add New state (blank form stays visible)
        setEditingEntry(null);
        setTimeout(() => setSaveSuccess(false), 3000);
      } else {
        throw new Error(response.data.message || 'Failed to save About Us content.');
      }
    } catch (err: unknown) {
      console.error('Error saving About Us content:', err);
      setError((err as Error).message || 'Failed to save About Us content.');
    } finally {
      setIsSaving(false);
    }
  };

  // Edit existing
  const handleEditClick = (entry: AboutUsEntry) => {
    setEditingEntry(entry);
  };

  // Delete existing
  const handleDeleteClick = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this About Us entry?')) return;
    setIsSaving(true);
    setError(null);
    try {
      const response = await axios.delete(`/api/aboutus/${id}`);
      if (response.data.success) {
        fetchAboutUsContent();
        // If we were editing this entry, reset to Add New
        setEditingEntry((prev) => (prev && prev._id === id ? null : prev));
      } else {
        throw new Error(response.data.message || 'Failed to delete About Us content.');
      }
    } catch (err: unknown) {
      console.error('Error deleting About Us content:', err);
      setError((err as Error).message || 'Failed to delete About Us content.');
    } finally {
      setIsSaving(false);
    }
  };

  // Cancel editing -> go back to Add New blank form
  const handleCancel = () => {
    setEditingEntry(null);
  };

  // Initial load
  useEffect(() => {
    fetchAboutUsContent();
  }, []);

  // Loading state
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-xl text-gray-700">Loading About Us content...</p>
      </div>
    );
  }


  if (error) {
 
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-xl text-red-600">Error: {error}</p>
      </div>
    );
  }


  const currentFormEntry = editingEntry ?? BLANK_ENTRY;

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Page Title */}
      <h1 className="text-4xl font-extrabold text-gray-900 mb-8 text-center">
        Manage About Us Sections
      </h1>

      {/* Messages */}
      {saveSuccess && (
        <div
          className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4"
          role="alert"
        >
          Content saved successfully!
        </div>
      )}
      {isSaving && (
        <div
          className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded mb-4"
          role="alert"
        >
          Processing...
        </div>
      )}

      {/* Editor ALWAYS visible */}
      <div className="mb-10 p-6 bg-white rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">
          {currentFormEntry._id ? 'Edit About Us Section' : 'Add New About Us Section'}
        </h2>
        <AboutUsEditorForm
          initialData={currentFormEntry}
          onSave={handleSaveAboutUs}
          onCancel={handleCancel}
        />
      </div>

      {/* Existing About Us Entries */}
      <h2 className="text-2xl font-bold text-gray-800 mb-4">
        Existing About Us Sections
      </h2>

      {aboutUsList.length === 0 && (
        <p className="text-gray-600">
          No About Us sections found. Use the form above to create one.
        </p>
      )}

      <div className="space-y-6">
        {aboutUsList.map((entry) => (
          <div
            key={entry._id}
            className="p-5 border border-gray-200 rounded-lg shadow-sm bg-white"
          >
            <div className="flex justify-between items-start mb-3">
              <h3 className="text-xl font-semibold text-gray-800">
                About Us Entry (ID: {entry._id.substring(0, 6)}…)
              </h3>
              <div className="flex gap-2">
                <button
                  onClick={() => handleEditClick(entry)}
                  className="text-yellow-500 border border-yellow-500 rounded-md p-2 hover:bg-yellow-500 hover:text-white"
                  aria-label="Edit"
                >
                  <PencilIcon size={16} />
                </button>
                <button
                  onClick={() => handleDeleteClick(entry._id)}
                  className="text-red-500 border border-red-500 rounded-md p-2 hover:bg-red-500 hover:text-white"
                  aria-label="Delete"
                >
                  <TrashBinIcon />
                </button>
              </div>
            </div>

            <div
              className="prose max-w-none text-gray-700 mt-2"
              dangerouslySetInnerHTML={{ __html: entry.content }}
            />

            <p className="text-xs text-gray-500 mt-3">
              Last Updated:{' '}
              {entry.updatedAt
                ? new Date(entry.updatedAt).toLocaleString()
                : 'N/A'}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminAboutUsManagementPage;
