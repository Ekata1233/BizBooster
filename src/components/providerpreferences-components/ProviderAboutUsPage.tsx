// 'use client';

// import React, { useState, useEffect, useRef } from 'react';
// import dynamic from 'next/dynamic';
// import Label from '@/components/form/Label';

// const ClientSideCustomEditor = dynamic(
//   () => import('@/components/custom-editor/CustomEditor'),
//   {
//     ssr: false,
//     loading: () => <p>Loading rich text editor...</p>,
//   }
// );

// type ProviderAboutUsFormData = {
//   _id?: string;
//   content: string;
//   module: string;
// };

// interface EditorFormProps {
//   initialData?: ProviderAboutUsFormData;
//   onSave: (data: ProviderAboutUsFormData) => void;
//   onCancel: () => void;
// }

// const ProviderAboutUsPage: React.FC<EditorFormProps> = ({
//   initialData,
//   onSave,
//   onCancel,
// }) => {
//   const isContentEdited = useRef(false);
//   const [content, setContent] = useState<string>(initialData?.content || '');
//   // 1. Add a mounted state variable
//   const [mounted, setMounted] = useState(false);

//   // 2. Update mounted in useEffect once the component mounts on client
//   useEffect(() => {
//     setMounted(true);
//   }, []); // Empty dependency array means this runs once after initial render/hydration

//   useEffect(() => {
//     // Only update content if initialData changes AND the component is mounted to prevent initial hydration mismatches
//     if (
//       mounted && // Ensure component is mounted before setting initial content
//       initialData?.content !== undefined &&
//       (initialData.content !== content || !isContentEdited.current)
//     ) {
//       setContent(initialData.content);
//       isContentEdited.current = false;
//     }
//   }, [initialData?.content, initialData?._id, mounted]); // Add 'mounted' to dependencies

//   const handleEditorChange = (data: string) => {
//     setContent(data);
//     isContentEdited.current = true;
//   };

//   const handleSubmit = (e: React.FormEvent) => {
//     e.preventDefault();
//     if (!initialData?.module) {
//       alert('Module is required');
//       return;
//     }
//     onSave({ _id: initialData?._id, content, module: initialData.module });
//   };

//   return (
//     <div className="p-6 bg-white rounded-lg shadow-md max-w-4xl mx-auto my-8">
//       <h2 className="text-3xl font-bold text-gray-800 dark:text-white/90 text-center mb-6">
//         {initialData?._id ? 'Edit About Us' : 'Add New About Us'}
//       </h2>
//       <form onSubmit={handleSubmit}>
//         <div className="mb-6">
//           <Label htmlFor="privacyPolicyContent">Provider About Us Content</Label>
//           <div className="my-editor mt-2">
//             {/* 3. Conditionally render ClientSideCustomEditor */}
//             {mounted ? (
//               <ClientSideCustomEditor
//                 value={content}
//                 onChange={handleEditorChange}
//               />
//             ) : (
//               // Show loading state or a placeholder while waiting for mount
//               <p>Loading rich text editor...</p>
//             )}
//           </div>
//         </div>

//         <div className="text-center mt-8 space-x-4">
//           <button
//             type="submit"
//             className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
//           >
//             Save Content
//           </button>
//           <button
//             type="button"
//             onClick={onCancel}
//             className="px-6 py-3 bg-gray-300 text-gray-800 font-semibold rounded-lg hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-2"
//           >
//             Cancel
//           </button>
//         </div>
//       </form>
//     </div>
//   );
// };

// export default ProviderAboutUsPage;



'use client';

import React, { useState, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import Label from '@/components/form/Label';

const ClientSideCustomEditor = dynamic(
  () => import('@/components/custom-editor/CustomEditor'),
  {
    ssr: false,
    loading: () => <p>Loading rich text editor...</p>,
  }
);

type ProviderAboutUsFormData = {
  _id?: string;
  content: string;
  module: string;
};

interface EditorFormProps {
  initialData?: ProviderAboutUsFormData;
  onSave: (data: ProviderAboutUsFormData) => void;
  onCancel: () => void;
}

const ProviderAboutUsPage: React.FC<EditorFormProps> = ({
  initialData,
  onSave,
  onCancel,
}) => {
  const isContentEdited = useRef(false);
  // Initialize content directly from initialData, as it will be re-synced in useEffect
  const [content, setContent] = useState<string>(initialData?.content || '');

  // Use a ref to track if content has been set from initialData to avoid infinite loops
  const hasInitialContentBeenSet = useRef(false);

  useEffect(() => {
    // This useEffect will now handle setting the initial content
    // and also resetting it if initialData changes (e.g., when switching edit entries)
    if (initialData?.content !== undefined && !hasInitialContentBeenSet.current) {
      setContent(initialData.content);
      hasInitialContentBeenSet.current = true;
      isContentEdited.current = false; // Reset edited flag
    }
    // If initialData changes to a different entry, reset content and flag
    // Check if initialData._id is different from the current content's implied ID
    // or if initialData._id exists and content is empty (for new entries)
    if (initialData?._id && initialData._id !== content) { // Simplified check for new entry
        setContent(initialData.content);
        isContentEdited.current = false;
    } else if (!initialData?._id && content !== '') { // For new entry creation, clear content if no initialData
        setContent('');
        isContentEdited.current = false;
    }
  }, [initialData?.content, initialData?._id]); // Depend on initialData content and ID

  const handleEditorChange = (data: string) => {
    setContent(data);
    isContentEdited.current = true;
    hasInitialContentBeenSet.current = true; // Mark as set when user edits
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!initialData?.module) {
      alert('Module is required');
      return;
    }
    onSave({ _id: initialData?._id, content, module: initialData.module });
  };

  // Use a key prop that changes when initialData._id changes.
  // This forces React to unmount and remount ClientSideCustomEditor,
  // ensuring its internal state is properly reset and initialized.
  const editorKey = initialData?._id || 'new-provider-about-us-entry'; // Unique key for new entries

  return (
    <div className="p-6 bg-white rounded-lg shadow-md max-w-4xl mx-auto my-8">
      <h2 className="text-3xl font-bold text-gray-800 dark:text-white/90 text-center mb-6">
        {initialData?._id ? 'Edit About Us' : 'Add New About Us'}
      </h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-6">
          <Label htmlFor="privacyPolicyContent">Provider About Us Content</Label>
          <div className="my-editor mt-2">
            {/* Conditionally render ClientSideCustomEditor */}
            {/* Pass a key to force remount when initialData changes */}
            <ClientSideCustomEditor
              key={editorKey} // <--- THE CRUCIAL CHANGE IS HERE
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
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-3 bg-gray-300 text-gray-800 font-semibold rounded-lg hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-2"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProviderAboutUsPage;