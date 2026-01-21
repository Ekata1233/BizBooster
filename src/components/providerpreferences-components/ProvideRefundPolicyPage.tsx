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

// type RefundPolicyFormData = {
//   _id?: string;
//   content: string;
//   module: string;
// };

// interface EditorFormProps {
//   initialData?: RefundPolicyFormData;
//   onSave: (data: RefundPolicyFormData) => void;
//   onCancel: () => void;
// }

// const ProviderPrivacyPolicyPage: React.FC<EditorFormProps> = ({
//   initialData,
//   onSave,
// }) => {
//   const isContentEdited = useRef(false);
//   const [content, setContent] = useState<string>(initialData?.content || '');

//   useEffect(() => {
//     if (
//       initialData?.content !== undefined &&
//       (initialData.content !== content || !isContentEdited.current)
//     ) {
//       setContent(initialData.content);
//       isContentEdited.current = false;
//     }
//   }, [initialData?.content, initialData?._id]);

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
//     setContent  ('');
//   };

//   return (
//    <div className="p-6 bg-white rounded-lg shadow-md w-full my-8">
//       <h2 className="text-3xl font-bold text-gray-800 dark:text-white/90 text-center mb-6">
//         {initialData?._id ? 'Edit Refund Policy' : 'Add New Refund Policy'}
//       </h2>
//       <form onSubmit={handleSubmit}>
//         <div className="mb-6">
//           <Label htmlFor="privacyPolicyContent">Refund Policy Content</Label>
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
//             type="button"
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

// export default ProviderPrivacyPolicyPage;







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
  
}) => {
  const isContentEdited = useRef(false);
  // Initialize content directly from initialData, as it will be re-synced in useEffect
  const [content, setContent] = useState<string>(initialData?.content || '');

  // Use a ref to track if content has been set from initialData to avoid infinite loops
  const hasInitialContentBeenSet = useRef(false);

 

  useEffect(() => {
  if (initialData) {
    setContent(initialData.content || '');
    isContentEdited.current = false;
    hasInitialContentBeenSet.current = false; // Reset when initialData changes
  }
}, [initialData?._id, initialData?.content]);


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
    setContent  (''); // Clear content after save
    // Reset edited flag after save
  };

  // Use a key prop that changes when initialData._id changes.
  // This forces React to unmount and remount ClientSideCustomEditor,
  // ensuring its internal state is properly reset and initialized.
  const editorKey = initialData?._id || 'new-provider-about-us-entry'; // Unique key for new entries

  return (
   <div className="p-6 bg-white rounded-lg shadow-md w-full my-8">

      <h2 className="text-3xl font-bold text-gray-800 dark:text-white/90 text-center mb-6">
        {initialData?._id ? 'Edit Refund Policy' : 'Add New Refund Policy'}
      </h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-6">
          <Label htmlFor="Refund Policy Content">Provider Refund Policy Content</Label>
          <div className="my-editor mt-2 w-full ">
          
            <ClientSideCustomEditor
              key={editorKey} 
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

export default ProviderAboutUsPage;