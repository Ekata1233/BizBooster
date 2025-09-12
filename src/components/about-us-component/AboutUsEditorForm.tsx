

// 'use client';

// import React, { useState, useEffect, useRef } from 'react';
// import dynamic from 'next/dynamic';

// import Label from '@/components/form/Label'; // Assuming this is your Label component

// // Dynamic import for CKEditor
// const ClientSideCustomEditor = dynamic(
//   () => import('@/components/custom-editor/CustomEditor'),
//   {
//     ssr: false,
//     loading: () => <p>Loading rich text editor...</p>,
//   }
// );


// type AboutUsFormData = {
//   _id?: string; 
//   content: string;
// };

// interface AboutUsEditorFormProps {
//   initialData?: AboutUsFormData; // This will now contain the _id for editing
//   onSave: (data: AboutUsFormData) => void;
//   onCancel: () => void; // Added for cancelling the editor form
// }

// const AboutUsEditorForm: React.FC<AboutUsEditorFormProps> = ({ initialData, onSave,  }) => {
//   const isContentEdited = useRef(false);
//   const [content, setContent] = useState<string>(initialData?.content || '');

  
//   useEffect(() => {
   
//     if (initialData?.content !== undefined && (initialData.content !== content || !isContentEdited.current)) {
//         setContent(initialData.content);
//         isContentEdited.current = false; 
      
//     }
//   }, [initialData?.content, initialData?._id]); 

  
//   const handleEditorChange = (data: string) => {
   
//     setContent(data);
//     isContentEdited.current = true; 
//   };

//   const handleSubmit = (e: React.FormEvent) => {
//     e.preventDefault();
  
//     onSave({ _id: initialData?._id, content }); 
//   };

//   return (
//     <div className="p-6 bg-white rounded-lg shadow-md max-w-4xl mx-auto my-8">
//       <h2 className="text-3xl font-bold text-gray-800 dark:text-white/90 text-center mb-6">
//         {initialData?._id ? "Edit About Us Content" : "Add New About Us Content"}
//       </h2>
//       <form onSubmit={handleSubmit}>
//         <div className="mb-6">
//           <Label htmlFor="aboutUsContent">About Us Content</Label>
//           <div className="my-editor mt-2">
//             <ClientSideCustomEditor
//               value={content} 
//               onChange={handleEditorChange} 
//             />
//           </div>
//         </div>

//         <div className="text-center mt-8 space-x-4">
//           <button
//             type="submit"
//             className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
//           >
//             Save Content
//           </button>
//           {/* <button
//             type="button" // Important: type="button" to prevent form submission
//             onClick={onCancel}
//             className="px-6 py-3 bg-gray-300 text-gray-800 font-semibold rounded-lg hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-2"
//           >
//             Cancel
//           </button> */}
//         </div>
//       </form>
//     </div>
//   );
// };

// export default AboutUsEditorForm;




'use client';

import React, { useState, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import Label from '@/components/form/Label';

// This dynamic import is for the CustomEditor itself
const ClientSideCustomEditor = dynamic(
  () => import('@/components/custom-editor/CustomEditor'),
  {
    ssr: false,
    loading: () => <p>Loading rich text editor...</p>,
  }
);

// Define the type for the form data specific to PrivacyPolicyPage
type PrivacyPolicyFormData = {
  _id?: string;
  content: string;
  // If your PrivacyPolicyPage also has a 'module' like ProviderAboutUsPage, add it here:
  // module?: string; // Add this if applicable
};

interface EditorFormProps {
  initialData?: PrivacyPolicyFormData; // Use PrivacyPolicyFormData
  onSave: (data: PrivacyPolicyFormData) => void;
  onCancel: () => void;
}

const PrivacyPolicyEditorForm: React.FC<EditorFormProps> = ({
  initialData,
  onSave,
 
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
    onSave({ _id: initialData?._id, content });
  };

  // Use a key prop that changes when initialData._id changes.
  // This forces React to unmount and remount ClientSideCustomEditor,
  // ensuring its internal state is properly reset and initialized.
  const editorKey = initialData?._id || 'new-entry'; // Use ID or a unique string for new entries

  return (
<<<<<<< HEAD
    <div className="p-6 bg-white rounded-lg shadow-md max-w-4xl mx-auto my-8">
      <h2 className="text-3xl font-bold text-gray-800 dark:text-white/90 text-center mb-6">
        {initialData?._id ? 'Edit About Us  Section' : 'Add New About Us  Section'}
      </h2>
=======
    <div className="">
      
>>>>>>> a8680fb606342f5a260f80fc0f3658ea15be0720
      <form onSubmit={handleSubmit}>
        <div className="mb-6">
          <Label htmlFor="About Us Content">About Us Content</Label>
          <div className="my-editor mt-2">
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
          {/* <button
            type="button"
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

export default PrivacyPolicyEditorForm;