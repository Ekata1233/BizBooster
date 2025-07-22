'use client';

import React, { useState, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';

import Label from '@/components/form/Label'; // Assuming this is your Label component

// Dynamic import for CKEditor
const ClientSideCustomEditor = dynamic(
  () => import('@/components/custom-editor/CustomEditor'),
  {
    ssr: false,
    loading: () => <p>Loading rich text editor...</p>,
  }
);

// Update type to include optional _id
type AboutUsFormData = {
  _id?: string; // Optional for new entries, present for editing existing ones
  content: string;
};

interface AboutUsEditorFormProps {
  initialData?: AboutUsFormData; // This will now contain the _id for editing
  onSave: (data: AboutUsFormData) => void;
  onCancel: () => void; // Added for cancelling the editor form
}

const CancellationPolicyPage: React.FC<AboutUsEditorFormProps> = ({ initialData, onSave, }) => {
  const isContentEdited = useRef(false);
  const [content, setContent] = useState<string>(initialData?.content || '');

  // Log on initial render and when props change
  // console.log('AboutUsEditorForm: Render - initialData prop:', initialData);
  // console.log('AboutUsEditorForm: Render - content state (before useEffect):', content);

  // Effect to sync initialData with content state ONLY if it hasn't been edited
  useEffect(() => {
    if (
      initialData?.content !== undefined &&
      (initialData.content !== content || !isContentEdited.current)
    ) {
    setContent(initialData.content);
    isContentEdited.current = false;
  }
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [initialData?.content, initialData?._id]);


  // Custom onChange handler to update state and mark as edited
  const handleEditorChange = (data: string) => {
    // console.log('CKEditor provides data:', data);
    setContent(data);
    isContentEdited.current = true; // Mark content as having been edited by the user/editor
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // console.log("AboutUsEditorForm: Sending content on submit:", { _id: initialData?._id, content });
    onSave({ _id: initialData?._id, content }); // Pass _id back to parent for PUT/POST decision
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-md max-w-4xl mx-auto my-8">
      <h2 className="text-3xl font-bold text-gray-800 dark:text-white/90 text-center mb-6">
        {initialData?._id ? "Edit Cancellation Policy Content" : "Add New Cancellation Policy Content"}
      </h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-6">
          <Label htmlFor="aboutUsContent">Cancellation Policy Content</Label>
          <div className="my-editor mt-2">
            <ClientSideCustomEditor
              value={content} // Pass the current state to the editor
              onChange={handleEditorChange} // Use the new handler
            />
          </div>
        </div>

        <div className="text-center mt-8 space-x-4">
          <button
            type="submit"
            className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Save Content
          </button>
          {/* <button
            type="button" // Important: type="button" to prevent form submission
            onClick={onCancel}
            className="px-6 py-3 bg-gray-300 text-gray-800 font-semibold rounded-lg hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-2"
          >
            Cancel
          </button> */}
        </div>
      </form>
    </div>
  );
};

export default CancellationPolicyPage;