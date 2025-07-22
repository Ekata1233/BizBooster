

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


type AboutUsFormData = {
  _id?: string; 
  content: string;
};

interface AboutUsEditorFormProps {
  initialData?: AboutUsFormData; // This will now contain the _id for editing
  onSave: (data: AboutUsFormData) => void;
  onCancel: () => void; // Added for cancelling the editor form
}

const AboutUsEditorForm: React.FC<AboutUsEditorFormProps> = ({ initialData, onSave,  }) => {
  const isContentEdited = useRef(false);
  const [content, setContent] = useState<string>(initialData?.content || '');

  
  useEffect(() => {
   
    if (initialData?.content !== undefined && (initialData.content !== content || !isContentEdited.current)) {
        setContent(initialData.content);
        isContentEdited.current = false; 
      
    }
  }, [initialData?.content, initialData?._id]); 

  
  const handleEditorChange = (data: string) => {
   
    setContent(data);
    isContentEdited.current = true; 
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
  
    onSave({ _id: initialData?._id, content }); 
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-md max-w-4xl mx-auto my-8">
      <h2 className="text-3xl font-bold text-gray-800 dark:text-white/90 text-center mb-6">
        {initialData?._id ? "Edit About Us Content" : "Add New About Us Content"}
      </h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-6">
          <Label htmlFor="aboutUsContent">About Us Content</Label>
          <div className="my-editor mt-2">
            <ClientSideCustomEditor
              value={content} 
              onChange={handleEditorChange} 
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

export default AboutUsEditorForm;