'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import axios from 'axios';
import { PencilIcon } from 'lucide-react';
import { TrashBinIcon } from '@/icons';
import PageBreadcrumb from '@/components/common/PageBreadCrumb';
import ComponentCard from '@/components/common/ComponentCard';

// Lazily load the editor wrapper component
const CancellationPolicyPage = dynamic(
  () => import('@/components/privacy&policy-components/CancellationPolicyPage'),
  {
    ssr: false,
    loading: () => (
      <div className="flex justify-center items-center h-40">
        <p className="text-xl text-gray-700">Loading editor...</p>
      </div>
    ),
  }
);

// Data model (reuse AboutUsEntry type but renamed if preferred)
type PolicyEntry = {
  _id: string;
  content: string;
  createdAt?: string;
  updatedAt?: string;
};

// Blank template used when adding a new entry
const BLANK_ENTRY: PolicyEntry = { _id: '', content: '' };

const AdminCancellationPolicyManagementPage: React.FC = () => {
  const [policyList, setPolicyList] = useState<PolicyEntry[]>([]);
  const [editingEntry, setEditingEntry] = useState<PolicyEntry | null>(null); // null => adding new
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  /* ---------------- Fetch All ---------------- */
  const fetchPolicyContent = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await axios.get('/api/cancellationpolicy');
      if (response.data?.success) {
        // Ensure array
        const arr: PolicyEntry[] = Array.isArray(response.data.data)
          ? response.data.data
          : response.data.data
            ? [response.data.data]
            : [];
        setPolicyList(arr);
      } else {
        setError(response.data?.message || 'Failed to fetch Cancellation Policy content.');
        setPolicyList([]);
      }
    } catch (err: unknown) {
      console.error('Failed to fetch Cancellation Policy content:', err);
      setError((err as Error).message || 'Failed to load Cancellation Policy content.');
      setPolicyList([]);
    } finally {
      setIsLoading(false);
    }
  };

  /* ---------------- Save (Create/Update) ---------------- */
  const handleSavePolicy = async (dataToSave: { _id?: string; content: string }) => {
    setIsSaving(true);
    setSaveSuccess(false);
    setError(null);
    try {
      let response;
      if (dataToSave._id) {
        // update
        response = await axios.put(`/api/cancellationpolicy/${dataToSave._id}`, {
          content: dataToSave.content,
        });
      } else {
        // create
        response = await axios.post('/api/cancellationpolicy', {
          content: dataToSave.content,
        });
      }

      if (response.data?.success) {
        setSaveSuccess(true);
        // refresh list
        await fetchPolicyContent();
        // clear editing
        setEditingEntry(null);
        // hide success message later
        setTimeout(() => setSaveSuccess(false), 3000);
      } else {
        throw new Error(response.data?.message || 'Failed to save Cancellation Policy content.');
      }
    } catch (err: unknown) {
      console.error('Error saving Cancellation Policy content:', err);
      setError((err as Error).message || 'Failed to save Cancellation Policy content.');
    } finally {
      setIsSaving(false);
    }
  };

  /* ---------------- Edit ---------------- */
  const handleEditClick = (entry: PolicyEntry) => {
    setEditingEntry(entry);
  };

  /* ---------------- Delete ---------------- */
  const handleDeleteClick = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this Cancellation Policy entry?')) return;
    setIsSaving(true);
    setError(null);
    try {
      const response = await axios.delete(`/api/cancellationpolicy/${id}`);
      if (response.data?.success) {
        await fetchPolicyContent();
        // If currently editing deleted row, reset
        setEditingEntry((prev) => (prev && prev._id === id ? null : prev));
      } else {
        throw new Error(response.data?.message || 'Failed to delete Cancellation Policy content.');
      }
    } catch (err: unknown) {
      console.error('Error deleting Cancellation Policy content:', err);
      setError((err as Error).message || 'Failed to delete Cancellation Policy content.');
    } finally {
      setIsSaving(false);
    }
  };

  /* ---------------- Cancel Editing ---------------- */
  const handleCancel = () => {
    setEditingEntry(null);
  };

  /* ---------------- Initial Load ---------------- */
  useEffect(() => {
    fetchPolicyContent();
  }, []);

  /* ---------------- Loading State ---------------- */
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-xl text-gray-700">Loading Cancellation Policy content...</p>
      </div>
    );
  }

  /* ---------------- Error State (blocking) ---------------- */
  if (error && policyList.length === 0 && !isSaving) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-xl text-red-600">Error: {error}</p>
      </div>
    );
  }


  const currentFormEntry = editingEntry ?? BLANK_ENTRY;

  return (
    <div className="container mx-auto px-4">

      <PageBreadcrumb pageTitle="Manage Cancellation Policy Sections" />


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
      {error && policyList.length > 0 && (
        <div
          className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4"
          role="alert"
        >
          Error: {error}
        </div>
      )}

      {/* Always-visible Editor */}
      <div className="mb-10">
        <ComponentCard title={currentFormEntry._id ? 'Edit Cancellation Policy Section' : 'Add New Cancellation Policy Section'}>


          <CancellationPolicyPage
            /* IMPORTANT: pass the safe object, not possibly-null editingEntry */
            initialData={currentFormEntry}
            onSave={handleSavePolicy}
            onCancel={handleCancel}
          />
        </ComponentCard>
      </div>



      <ComponentCard title="Existing Cancellation Policy Sections">


        {policyList.length === 0 ? (
          <p className="text-gray-600">
            No Cancellation Policy sections found. Use the form above to create one.
          </p>
        ) : (
          <div className="space-y-6">
            {policyList.map((entry) => (
              <div
                key={entry._id}
                className=""
              >
                <div className="flex justify-between items-start mb-3">
                  <h3 className="text-xl font-semibold text-gray-800">
                    Cancellation Policy Entry (ID: {entry._id.substring(0, 6)}…)
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
        )}

      </ComponentCard>
    </div>
  );
};

export default AdminCancellationPolicyManagementPage;
