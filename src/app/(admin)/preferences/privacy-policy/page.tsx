// 'use client';

// import React, { useState, useEffect } from 'react';
// import dynamic from 'next/dynamic';
// import axios from 'axios'; // Ensure axios is imported
// import { PlusCircle } from 'lucide-react';
// import { TrashBinIcon } from '@/icons';

// // Assuming AboutUsPage is the component with the CKEditor form
// const PrivacyPolicyPage = dynamic(() => import('@/components/privacy&policy-components/PrivacyPolicyPage'), {
//   ssr: false,
//   loading: () => (
//     <div className="flex justify-center items-center h-screen">
//       <p className="text-xl text-gray-700">Loading editor...</p>
//     </div>
//   ),
// });

// // Define the type for an About Us entry, now including _id
// type AboutUsEntry = {
//   _id: string; // MongoDB ID
//   content: string;
//   createdAt?: string; // Optional, good for display
//   updatedAt?: string; // Optional, good for display
// };

// const AdminAboutUsManagementPage: React.FC = () => {
//   const [aboutUsList, setAboutUsList] = useState<AboutUsEntry[]>([]); // State to hold ALL about us entries
//   const [editingEntry, setEditingEntry] = useState<AboutUsEntry | null>(null); // State to hold the entry being edited
//   const [isLoading, setIsLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);
//   const [isSaving, setIsSaving] = useState(false);
//   const [saveSuccess, setSaveSuccess] = useState(false);

//   // Function to fetch all About Us content
//   const fetchAboutUsContent = async () => {
//     setIsLoading(true);
//     setError(null);
//     try {
//       const response = await axios.get('/api/privacypolicy'); // Use axios
//       if (response.data.success) {
//         setAboutUsList(response.data.data); // Set the list of entries
//       } else {
//         setError(response.data.message || 'Failed to fetch About Us content.');
//         setAboutUsList([]); // Fallback to empty array
//       }
//     } catch (err: unknown) {
//       console.error('Failed to fetch About Us content:', err);
//       if (err instanceof Error) {
//         setError(err.message || 'Failed to load About Us content.');
//       } else {
//         setError('An unknown error occurred.');
//       }
//       setAboutUsList([]);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   // Function to handle saving (creating new or updating existing)
//   const handleSaveAboutUs = async (dataToSave: { _id?: string; content: string }) => {
//     setIsSaving(true);
//     setSaveSuccess(false);
//     setError(null);
//     try {
//       let response;
//       if (dataToSave._id) {
//         // Update existing entry
//         response = await axios.put(`/api/privacypolicy/${dataToSave._id}`, { content: dataToSave.content });
//       } else {
//         // Create new entry
//         response = await axios.post('/api/privacypolicy', { content: dataToSave.content });
//       }

//       if (response.data.success) {
//         setSaveSuccess(true);
//         console.log('Privacy Policy content saved successfully:', response.data.data);
//         setEditingEntry(null); // Clear editing state after save
//         fetchAboutUsContent(); // Re-fetch the list to update the UI
//       } else {
//         throw new Error(response.data.message || 'Failed to save Privacy Policy content.');
//       }

//       setTimeout(() => setSaveSuccess(false), 3000); // Hide success message
//     } catch (err: unknown) {
//       console.error('Error saving Privacy Policy content:', err);
//       if (err instanceof Error) {
//         setError(err.message || 'Failed to save Privacy Policy content.');
//       } else {
//         setError('An unknown error occurred.');
//       }
//     } finally {
//       setIsSaving(false);
//     }
//   };

//   // Function to handle editing an existing entry
//   const handleEditClick = (entry: AboutUsEntry) => {
//     setEditingEntry(entry); // Set the entry to be edited in the form
//   };

//   // Function to handle deleting an entry
//   const handleDeleteClick = async (id: string) => {
//     if (!window.confirm('Are you sure you want to delete this Privacy Policy entry?')) {
//       return;
//     }
//     setIsSaving(true); // Re-using saving state for delete feedback
//     setError(null);
//     try {
//       const response = await axios.delete(`/api/privacypolicy/${id}`);
//       if (response.data.success) {
//         console.log('Privacy Policy content deleted successfully.');
//         fetchAboutUsContent(); // Re-fetch the list
//       } else {
//         throw new Error(response.data.message || 'Failed to delete Privacy Policy content.');
//       }
//     } catch (err: unknown) {
//       console.error('Error deleting Privacy Policy content:', err);
//       if (err instanceof Error) {
//         setError(err.message || 'Failed to delete Privacy Policy content.');
//       } else {
//         setError('An unknown error occurred.');
//       }
//     } finally {
//       setIsSaving(false);
//     }
//   };

//   // Fetch content when the page component mounts
//   useEffect(() => {
//     fetchAboutUsContent();
//   }, []); // Empty dependency array means this runs once on mount

//   // Display loading state
//   if (isLoading) {
//     return (
//       <div className="flex justify-center items-center h-screen">
//         <p className="text-xl text-gray-700">Loading Privacy Policy content...</p>
//       </div>
//     );
//   }

//   // Display error state
//   if (error) {
//     return (
//       <div className="flex justify-center items-center h-screen">
//         <p className="text-xl text-red-600">Error: {error}</p>
//       </div>
//     );
//   }

//   // Main render
//   return (
//     <div className="container mx-auto px-4 py-8">
//       <h1 className="text-4xl font-extrabold text-gray-900 mb-8 text-center">
//         Manage Privacy Policy Sections
//       </h1>

//       {/* Messages */}
//       {saveSuccess && (
//         <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4" role="alert">
//           <span className="block sm:inline">Content saved successfully!</span>
//         </div>
//       )}
//       {isSaving && (
//         <div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded relative mb-4" role="alert">
//           <span className="block sm:inline">Saving/Deleting content...</span>
//         </div>
//       )}
//       {error && (
//         <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
//           <span className="block sm:inline">Error: {error}</span>
//         </div>
//       )}

//       {/* Add New Button */}
//       {!editingEntry && (
//         <div className="mb-6 text-right">
//           <button
//             onClick={() => setEditingEntry({ _id: '', content: '' })} // Set empty entry for new creation
//             className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
//           >
//             Add New Privacy Policy Section
//           </button>
//         </div>
//       )}

//       {/* Conditional Editor Form */}
//       {editingEntry && (
//         <div className="mb-10 p-6 bg-white rounded-lg shadow-md">
//           <h2 className="text-2xl font-bold text-gray-800 mb-4">
//             {editingEntry._id ? 'Edit Privacy Policy Section' : 'Add New Privacy Policy Section'}
//           </h2>
//           <PrivacyPolicyPage
//             initialData={editingEntry} // Pass the entry to be edited
//             onSave={handleSaveAboutUs}
//             onCancel={() => setEditingEntry(null)} // Allow cancelling edit/add
//           />
//         </div>
//       )}

//       {/* Display List of About Us Entries */}
//       <h2 className="text-2xl font-bold text-gray-800 mb-4">Existing Privacy Policy Sections</h2>
//       {aboutUsList.length === 0 && !isLoading && !error && (
//         <p className="text-gray-600">No Privacy Policy section found. Click &quot;Add New&quot; to create one.</p>
//       )}

//       <div className="space-y-6">
//         {aboutUsList.map((entry) => (
//           <div key={entry._id} className="p-5 border border-gray-200 rounded-lg shadow-sm bg-white">
//             <div className="flex justify-between items-start mb-3">
//               {/* Display a snippet or title if you had one, otherwise just content */}
//               <h3 className="text-xl font-semibold text-gray-800">
//                 Privacy Policy Entry (ID: {entry._id.substring(0, 6)}...)
//               </h3>
//               <div className="flex space-x-2">
//                 <button
//                   onClick={() => handleEditClick(entry)}
//                   className="px-4 py-2 bg-yellow-500 text-white text-sm font-medium rounded-md hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-yellow-400"
//                 >
//                 <PlusCircle />
//                 </button>
//                 <button
//                   onClick={() => handleDeleteClick(entry._id)}
//                   className="px-4 py-2 bg-red-500 text-white text-sm font-medium rounded-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-400"
//                 >
//                   <TrashBinIcon />
//                 </button>
//               </div>
//             </div>
//             {/* Where else to show the data: a read-only preview of the content */}
//             <div
//               className="prose max-w-none text-gray-700 mt-2" // Add 'prose' if you use @tailwindcss/typography
//               dangerouslySetInnerHTML={{ __html: entry.content }}
//             />

//             <p className="text-xs text-gray-500 mt-3">
//   Last Updated: {entry.updatedAt ? new Date(entry.updatedAt).toLocaleString() : 'N/A'}
// </p>
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// };

// export default AdminAboutUsManagementPage;






// src/app/(admin)/privacy&policy-management/page.tsx (or similar path for AdminAboutUsManagementPage)
'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import axios from 'axios';
import { PlusCircle } from 'lucide-react';
import { TrashBinIcon } from '@/icons';

// Import the renamed component
const PrivacyPolicyEditorForm = dynamic(
  () => import('@/components/privacy&policy-components/PrivacyPolicyPage'), // Path to the file
  {
    ssr: false,
    loading: () => (
      <div className="flex justify-center items-center h-screen">
        <p className="text-xl text-gray-700">Loading editor form...</p>
      </div>
    ),
  }
);

// Define the type for an About Us entry, now including _id
type AboutUsEntry = {
  _id: string; // MongoDB ID
  content: string;
  createdAt?: string; // Optional, good for display
  updatedAt?: string; // Optional, good for display
};

const AdminPrivacyPolicyManagementPage: React.FC = () => { // Renamed for clarity
  const [aboutUsList, setAboutUsList] = useState<AboutUsEntry[]>([]);
  const [editingEntry, setEditingEntry] = useState<AboutUsEntry | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const fetchAboutUsContent = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await axios.get('/api/privacypolicy');
      if (response.data.success) {
        setAboutUsList(response.data.data);
      } else {
        setError(response.data.message || 'Failed to fetch Privacy Policy content.');
        setAboutUsList([]);
      }
    } catch (err: unknown) {
      console.error('Failed to fetch Privacy Policy content:', err);
      if (err instanceof Error) {
        setError(err.message || 'Failed to load Privacy Policy content.');
      } else {
        setError('An unknown error occurred.');
      }
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
        response = await axios.put(`/api/privacypolicy/${dataToSave._id}`, { content: dataToSave.content });
      } else {
        response = await axios.post('/api/privacypolicy', { content: dataToSave.content });
      }

      if (response.data.success) {
        setSaveSuccess(true);
        console.log('Privacy Policy content saved successfully:', response.data.data);
        setEditingEntry(null);
        fetchAboutUsContent();
      } else {
        throw new Error(response.data.message || 'Failed to save Privacy Policy content.');
      }

      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err: unknown) {
      console.error('Error saving Privacy Policy content:', err);
      if (axios.isAxiosError(err) && err.response) {
        setError(err.response.data.message || 'Failed to save Privacy Policy content.');
      } else if (err instanceof Error) {
        setError(err.message || 'Failed to save Privacy Policy content.');
      } else {
        setError('An unknown error occurred.');
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleEditClick = (entry: AboutUsEntry) => {
    setEditingEntry(entry);
  };

  const handleDeleteClick = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this Privacy Policy entry?')) {
      return;
    }
    setIsSaving(true);
    setError(null);
    try {
      const response = await axios.delete(`/api/privacypolicy/${id}`);
      if (response.data.success) {
        console.log('Privacy Policy content deleted successfully.');
        fetchAboutUsContent();
      } else {
        throw new Error(response.data.message || 'Failed to delete Privacy Policy content.');
      }
    } catch (err: unknown) {
      console.error('Error deleting Privacy Policy content:', err);
      if (axios.isAxiosError(err) && err.response) {
        setError(err.response.data.message || 'Failed to delete Privacy Policy content.');
      } else if (err instanceof Error) {
        setError(err.message || 'Failed to delete Privacy Policy content.');
      } else {
        setError('An unknown error occurred.');
      }
    } finally {
      setIsSaving(false);
    }
  };

  useEffect(() => {
    fetchAboutUsContent();
  }, []);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-xl text-gray-700">Loading Privacy Policy content...</p>
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

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-extrabold text-gray-900 mb-8 text-center">
        Manage Privacy Policy Sections
      </h1>

      {saveSuccess && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4" role="alert">
          <span className="block sm:inline">Content saved successfully!</span>
        </div>
      )}
      {isSaving && (
        <div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded relative mb-4" role="alert">
          <span className="block sm:inline">Saving/Deleting content...</span>
        </div>
      )}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
          <span className="block sm:inline">Error: {error}</span>
        </div>
      )}

      {!editingEntry && (
        <div className="mb-6 text-right">
          <button
            onClick={() => setEditingEntry({ _id: '', content: '' })}
            className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
          >
            Add New Privacy Policy Section
          </button>
        </div>
      )}

      {editingEntry && (
        <div className="mb-10 p-6 bg-white rounded-lg shadow-md">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            {editingEntry._id ? 'Edit Privacy Policy Section' : 'Add New Privacy Policy Section'}
          </h2>
          <PrivacyPolicyEditorForm // Use the renamed component here
            initialData={editingEntry}
            onSave={handleSaveAboutUs}
            onCancel={() => setEditingEntry(null)}
          />
        </div>
      )}

      <h2 className="text-2xl font-bold text-gray-800 mb-4">Existing Privacy Policy Sections</h2>
      {aboutUsList.length === 0 && !isLoading && !error && (
        <p className="text-gray-600">No Privacy Policy section found. Click &quot;Add New&quot; to create one.</p>
      )}

      <div className="space-y-6">
        {aboutUsList.map((entry) => (
          <div key={entry._id} className="p-5 border border-gray-200 rounded-lg shadow-sm bg-white">
            <div className="flex justify-between items-start mb-3">
              <h3 className="text-xl font-semibold text-gray-800">
                Privacy Policy Entry (ID: {entry._id.substring(0, 6)}...)
              </h3>
              {/* <div className="flex space-x-2">
                <button
                  onClick={() => handleEditClick(entry)}
                  className="px-4 py-2 bg-yellow-500 text-white text-sm font-medium rounded-md hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                >
                  <PlusCircle />
                </button>
                <button
                  onClick={() => handleDeleteClick(entry._id)}
                  className="px-4 py-2 bg-red-500 text-white text-sm font-medium rounded-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-400"
                >
                  <TrashBinIcon />
                </button>
              </div> */}

              <div className="flex gap-2">
                <button
                  onClick={() => handleEditClick(entry)}
                  className="text-yellow-500 border border-yellow-500 rounded-md p-2 hover:bg-yellow-500 hover:text-white"
                  aria-label="Edit"
                >
                  <PlusCircle size={16} />
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
              Last Updated: {entry.updatedAt ? new Date(entry.updatedAt).toLocaleString() : 'N/A'}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminPrivacyPolicyManagementPage; // Export with the new name