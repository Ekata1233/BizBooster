// // src/app/(admin)/advisor-management/edit-advisor/[id]/page.tsx
// "use client";

// import React, { useEffect, useState } from "react";
// import { useParams, useRouter } from "next/navigation";
// import { useAdvisor } from "@/context/Advisor";
// import ComponentCard from "@/components/common/ComponentCard";
// import Label from "@/components/form/Label";
// import Input from "@/components/form/input/InputField";

// // Define a type for the form data
// type AdvisorFormData = {
//   name: string;
//   imageUrl: string;
//   tags: string;
//   language: string;
//   rating: number;
//   phoneNumber: number;
//   chat: string;
// };

// const EditAdvisorPage: React.FC = () => {
//   const router = useRouter();
//   const { id } = useParams();
//   const advisorId = Array.isArray(id) ? id[0] : id;

//   const { fetchAdvisorById, updateAdvisor } = useAdvisor();
//   const [formData, setFormData] = useState<AdvisorFormData>({
//     name: "",
//     imageUrl: "",
//     tags: "",
//     language: "",
//     rating: 0,
//     phoneNumber: 0,
//     chat: "",
//   });
//   const [isLoading, setIsLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);

//   useEffect(() => {
//     if (!advisorId) {
//       setError("Advisor ID not found.");
//       setIsLoading(false);
//       return;
//     }

//     const loadAdvisorData = async () => {
//       try {
//         const advisorData = await fetchAdvisorById(advisorId);
//         if (advisorData) {
//           setFormData({
//             name: advisorData.name,
//             imageUrl: advisorData.imageUrl,
//             tags: advisorData.tags.join(", "), // Convert array to comma-separated string
//             language: advisorData.language,
//             rating: advisorData.rating,
//             phoneNumber: advisorData.phoneNumber,
//             chat: advisorData.chat,
//           });
//         } else {
//           setError("Advisor not found.");
//         }
//       } catch (err) {
//         console.log("Failed to load advisor data.", err)
//         setError("Failed to load advisor data.");
//       } finally {
//         setIsLoading(false);
//       }
//     };
//     loadAdvisorData();
//   }, [advisorId, fetchAdvisorById]);

//   const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
//     const { name, value } = e.target;
//     setFormData((prev) => ({
//       ...prev,
//       [name]: name === "rating" || name === "phoneNumber" ? Number(value) : value,
//     }));
//   };

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     if (!advisorId) {
//       setError("Advisor ID is missing. Cannot update.");
//       return;
//     }

//     setIsLoading(true);
//     setError(null);

//     const dataToSubmit = new FormData();
//     dataToSubmit.append("name", formData.name);
//     dataToSubmit.append("imageUrl", formData.imageUrl);
//     dataToSubmit.append("tags", formData.tags.split(",").map(tag => tag.trim()).filter(tag => tag !== "").join(","));
//     dataToSubmit.append("language", formData.language);
//     dataToSubmit.append("rating", formData.rating.toString());
//     dataToSubmit.append("phoneNumber", formData.phoneNumber.toString());
//     dataToSubmit.append("chat", formData.chat);

//     try {
//       await updateAdvisor(advisorId, dataToSubmit);
//       router.push("/advisor-management/advisor-list"); // Redirect to the list page on success
//     } catch (err) {
//         console.log("Failed to update advisor.", err)
//       setError("Failed to update advisor.");
//       setIsLoading(false);
//     }
//   };

//   if (isLoading) return <div className="p-6 text-center">Loading advisor data...</div>;
//   if (error) return <div className="p-6 text-center text-red-500">{error}</div>;

//   return (
//     <div className="container mx-auto px-4 py-8">
//       <h1 className="text-3xl font-bold mb-6 text-center">Edit Advisor</h1>
//       <ComponentCard title="Advisor Details">
//         <form onSubmit={handleSubmit} className="space-y-6">
          
//           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//             <div>
//               <Label htmlFor="name">Name</Label>
//               <Input
//                 id="name"
//                 name="name"
//                 type="text"
//                 value={formData.name}
//                 onChange={handleChange}
              
//               />
//             </div>
//             <div>
//               <Label htmlFor="imageUrl">Image URL</Label>
//               <Input
//                 id="imageUrl"
//                 name="imageUrl"
//                 type="text"
//                 value={formData.imageUrl}
//                 onChange={handleChange}
//               />
//             </div>
//             <div>
//               <Label htmlFor="tags">Tags (comma-separated)</Label>
//               <Input
//                 id="tags"
//                 name="tags"
//                 type="text"
//                 value={formData.tags}
//                 onChange={handleChange}
//                 placeholder="e.g. business, finance, career"
//               />
//             </div>
//             <div>
//               <Label htmlFor="language">Language</Label>
//               <Input
//                 id="language"
//                 name="language"
//                 type="text"
//                 value={formData.language}
//                 onChange={handleChange}
//               />
//             </div>
//             <div>
//               <Label htmlFor="rating">Rating</Label>
//               <input
//               className="border border-grey-200 p-2 rounded-md w-full"
//                 id="rating"
//                 name="rating"
//                 type="number"
//                 step="0.1"
//                 min="0"
//                 max="5"
//                 value={formData.rating}
//                 onChange={handleChange}
//                 required
//               />
//             </div>
//             <div>
//               <Label htmlFor="phoneNumber">Phone Number</Label>
//               <Input
//                 id="phoneNumber"
//                 name="phoneNumber"
//                 type="number"
//                 value={formData.phoneNumber}
//                 onChange={handleChange}
               
//               />
//             </div>
//             <div>
//               <Label htmlFor="chat">Chat Link</Label>
//               <Input
//                 id="chat"
//                 name="chat"
//                 type="text"
//                 value={formData.chat}
//                 onChange={handleChange}
//               />
//             </div>
//           </div>
//           <div className="mt-6 flex justify-end gap-4">
//             <button
//               type="button"
//               onClick={() => router.back()}
//               className="px-6 py-2 border rounded-md text-gray-700 hover:bg-gray-100 transition-colors"
//             >
//               Cancel
//             </button>
//             <button
//               type="submit"
//               className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
//               disabled={isLoading}
//             >
//               {isLoading ? "Updating..." : "Update Advisor"}
//             </button>
//           </div>
//         </form>
//       </ComponentCard>
//     </div>
//   );
// };

// export default EditAdvisorPage;




// src/app/(admin)/advisor-management/edit-advisor/[id]/page.tsx
"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image"; // Import the Next.js Image component
import { useAdvisor } from "@/context/Advisor";
import ComponentCard from "@/components/common/ComponentCard";
import Label from "@/components/form/Label";
import Input from "@/components/form/input/InputField";
import FileInput from "@/components/form/input/FileInput";
import Button from "@/components/ui/button/Button";
// import axios from "axios";

// Define a new type for the form data to handle both the URL and a new file
type AdvisorFormData = {
  name: string;
  imageUrl: string; // This will store the existing URL or the new one
  imageFile: File | null; // This will store the new file to be uploaded
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
    imageFile: null,
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
            imageFile: null, // No file initially selected
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
        console.error("Failed to load advisor data.", err);
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setFormData((prev) => ({
      ...prev,
      imageFile: file,
      imageUrl: "", // Clear the imageUrl when a new file is selected
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

    // Step 1: Create a FormData object to send to the backend
    const dataToSubmit = new FormData();
    dataToSubmit.append("name", formData.name);
    dataToSubmit.append("tags", formData.tags.split(",").map(tag => tag.trim()).filter(tag => tag !== "").join(","));
    dataToSubmit.append("language", formData.language);
    dataToSubmit.append("rating", formData.rating.toString());
    dataToSubmit.append("phoneNumber", formData.phoneNumber.toString());
    dataToSubmit.append("chat", formData.chat);

    // Step 2: Handle the image upload
    if (formData.imageFile) {
        // If a new file is selected, append the file to the FormData
        dataToSubmit.append("imageUrl", formData.imageFile);
    } else {
        // If no new file, append the existing imageUrl string
        dataToSubmit.append("imageUrl", formData.imageUrl);
    }

    try {
      await updateAdvisor(advisorId, dataToSubmit);
      router.push("/advisor-management/advisor-list"); // Redirect on success
    } catch (err) {
      console.error("Failed to update advisor.", err);
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
              <Label htmlFor="imageFile">Advisor Image</Label>
              {/* Display current image using Next.js Image component */}
              {formData.imageUrl && !formData.imageFile && (
                <div className="mb-2">
                  <Image 
                    src={formData.imageUrl} 
                    alt="Current Advisor Image" 
                    className="h-20 w-20 object-cover rounded-md"
                    width={80} // Must provide width and height
                    height={80} 
                  />
                </div>
              )}
              {/* The FileInput component for uploading a new image */}
              <FileInput
                id="imageFile"
                name="imageFile"
                accept="image/*"
                onChange={handleFileChange}
              />
              {/* Display the name of the newly selected file */}
              {formData.imageFile && (
                <p className="mt-2 text-sm text-gray-500">Selected file: {formData.imageFile.name}</p>
              )}
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
                className="border border-gray-200 p-2 rounded-md w-full"
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
            <Button
              type="button"
              onClick={() => router.back()}
              variant="outline"
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