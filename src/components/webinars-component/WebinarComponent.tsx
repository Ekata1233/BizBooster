

// import React, { useEffect, useState } from 'react';
// import FileInput from '@/components/form/input/FileInput';
// import Input from '@/components/form/input/InputField';
// import Label from '@/components/form/Label';
// import Button from '@/components/ui/button/Button';
// import ComponentCard from '../common/ComponentCard';
// // import { useCertificate } from '@/context/CertificationContext';
// import { useWebinars } from '@/context/WebinarContext'; // Assuming you have a similar context for webinars
// import axios from 'axios';

// interface AddWebinarProps {
//     webinarIdToEdit?: string;
// }

// const AddWebinar: React.FC<AddWebinarProps> = ({ webinarIdToEdit }) => {

//     const { addWebinar, } = useWebinars();

//     const [name, setName] = useState('');
//     const [description, setDescription] = useState('');
//     const [mainImageFile, setMainImageFile] = useState<File | null>(null);
//     const [imageUrl, setImageUrl] = useState<string | null>(null);
    
//     // Simpler state for videos: an array of File objects and single text fields
//     const [, setVideoFiles] = useState<File[]>([]); // To hold multiple video File objects
//     const [, setVideoName] = useState(''); // Single name for all videos
//     const [, setVideoDescription] = useState(''); // Single description for all videos
//     const [videoData, setVideoData] = useState<Array<{ file: File; name: string; description: string }>>([]);

//     const [currentVideoUrls, setCurrentVideoUrls] = useState<string[]>([]); // For existing video URLs on edit

//     const [loading, setLoading] = useState(false);
//     const [error, setError] = useState<string | null>(null);

//     const handleMainImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
//         const file = event.target.files?.[0];
//         if (file) {
//             setMainImageFile(file);
//             setImageUrl(null); // Clear existing URL if a new file is chosen
//         }
//     };

  
//     const handleVideoFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
//   const files = Array.from(event.target.files || []);
//   const newVideoData = files.map((file) => ({
//     file,
//     name: '',
//     description: '',
//   }));
//   setVideoData(newVideoData);
// };


//     // useEffect for fetching data for edit (simplified to match new state structure)
//     useEffect(() => {
//         const fetchWebinar = async () => {
//              if (!webinarIdToEdit) {
//                 // If no ID is provided, it means we are in "Add New Webinar" mode.
//                 // Reset all fields to initial empty states.
//                 setName('');
//                 setDescription('');
//                 setMainImageFile(null);
//                 setImageUrl(null);
//                 setVideoFiles([]);
//                 setVideoName('');
//                 setVideoDescription('');
//                 setCurrentVideoUrls([]);
//                 setLoading(false);
//                 setError(null);
//                 return; // Exit the effect, no fetch needed for adding
//             }


//             setLoading(true);
//             setError(null);
//             try {
//                 // Assuming your backend's GET endpoint also returns this flatter structure
//                 const response = await axios.get(`/api/academy/webinars/${webinarIdToEdit}`);

//                 const data = response.data.data;
//                 console.log("Data : ",data)
//                 console.log("webinarIdToEdit received:", webinarIdToEdit);

//                 setName(data.name || '');
//                 setDescription(data.description || '');
//                 setImageUrl(data.imageUrl || null);
                
//                 // Assuming videoName and videoDescription are from the first video or are top-level
//                 setVideoName(data.video?.[0]?.videoName || ''); 
//                 setVideoDescription(data.video?.[0]?.videoDescription || ''); 

//                 if (data.video && Array.isArray(data.video) && data.video.length > 0) {
//                     setCurrentVideoUrls(data.video.map((v: unknown) => (v as { videoUrl: string }).videoUrl));
//                 } else {
//                     setCurrentVideoUrls([]);
//                 }
//                 setVideoFiles([]); // Clear any pre-selected files when loading for edit
//             } catch (err: unknown) {
//                 console.error('Error fetching certification for edit:', err);
//                 if (axios.isAxiosError(err)) {
//                     setError(err.response?.data?.message || 'Failed to fetch certification for editing.');
//                 } else {
//                     setError('An unexpected error occurred.');
//                 }
//             } finally {
//                 setLoading(false);
//             }
//         };

//         fetchWebinar();
//     }, [webinarIdToEdit]);

    
//     const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setLoading(true);
//     setError(null);

//     const formData = new FormData();
//     formData.append('name', name);
//     formData.append('description', description);

//     // --- Handle Main Image ---
//     if (mainImageFile) {
//         formData.append('imageUrl', mainImageFile);
//     } else if (!webinarIdToEdit && !imageUrl) {
//         alert('Please select a main image file.');
//         setLoading(false);
//         return;
//     }

//     // --- Handle Video Files and Metadata ---
//     if (!webinarIdToEdit && videoData.length === 0 && currentVideoUrls.length === 0) {
//         alert('Please select at least one video file.');
//         setLoading(false);
//         return;
//     }

//     // Validate each video entry
//     for (const [i, video] of videoData.entries()) {
//         if (!video.name || !video.description) {
//             alert(`Please enter name and description for video ${i + 1}`);
//             setLoading(false);
//             return;
//         }

//         formData.append(`video`, video.file); // Use 'video' key multiple times
//         formData.append(`videoName`, video.name);
//         formData.append(`videoDescription`, video.description);
//     }

//     if (!name || !description) {
//         alert('Please enter all required fields.');
//         setLoading(false);
//         return;
//     }

//     try {
//         if (webinarIdToEdit) {
//             await axios.put(`/api/webinars/${webinarIdToEdit}`, formData);
//             alert('Webinar updated successfully!');
//         } else {
//             if (addWebinar) {
//                 await addWebinar(formData);
//             } else {
//                 console.log("--- Frontend FormData Contents Before Sending ---");
//                 for (const pair of formData.entries()) {
//                     console.log(pair[0] + ': ' + pair[1]);
//                 }
//                 console.log("--------------------------------------------------");
//                 await axios.post('/academy/webinars', formData, {
//                     headers: { 'Content-Type': 'multipart/form-data' },
//                 });
//             }
//             alert('Webinar added successfully!');
//         }

//         // Reset everything
//         setName('');
//         setDescription('');
//         setMainImageFile(null);
//         setImageUrl(null);
//         setVideoData([]);
//         setCurrentVideoUrls([]);
//         setError(null);

//         const fileInputElements = document.querySelectorAll('input[type="file"]');
//         fileInputElements.forEach(input => {
//             (input as HTMLInputElement).value = '';
//         });

//     }
//     //  catch (err: unknown) {
//     //     console.error('Submission error:', (err as any).response?.data || err);
//     //     setError((err as any).response?.data?.message || 'Error processing webinar.');
//     //     alert((err as any).response?.data?.message || 'Error processing webinar.');
//     // } 
//     catch (err: unknown) { // 'err' is of type 'unknown' here
//   // Use axios.isAxiosError as a type guard
//   if (axios.isAxiosError(err)) {
//     // Now TypeScript knows 'err' is an AxiosError
//     console.error('Submission error:', err.response?.data || err);
//     setError(err.response?.data?.message || 'Error processing webinar.');
//     // IMPORTANT: Do NOT use alert() in production React apps.
//     // Use a custom modal or toast notification system instead.
//     // For now, keeping it as is per your original code.
//     alert(err.response?.data?.message || 'Error processing webinar.');
//   } else if (err instanceof Error) {
//     // Handle generic JavaScript Errors
//     console.error('Submission error:', err.message);
//     setError(err.message || 'Error processing webinar.');
//     alert(err.message || 'Error processing webinar.');
//   } else {
//     // Handle other unknown error types
//     console.error('Submission error: An unknown error occurred', err);
//     setError('An unknown error occurred.');
//     alert('An unknown error occurred.');
//   }
// }
// finally {
//         setLoading(false);
//     }
// };


//     return (
//         <div>
//             <ComponentCard title={webinarIdToEdit ? "Edit Webinars" : "Add New Record Webinars"}>
//                 {loading && <p className="text-blue-500">Loading...</p>}
//                 {error && <p className="text-red-500">{error}</p>}

//                 <form onSubmit={handleSubmit} encType="multipart/form-data">
//                     <div className="space-y-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 md:gap-6">
//                         {/* Webinar Name */}
//                         <div>
//                             <Label htmlFor="webinarName">Webinar Name</Label>
//                             <Input
//                                 id="webinarName"
//                                 type="text"
//                                 placeholder="Enter Webinar Name"
//                                 value={name}
//                                 onChange={(e) => setName(e.target.value)}
//                             />
//                         </div>

//                         {/* Main Image */}
//                         <div>
//                             <Label htmlFor="mainImage">Select Main Image</Label>
//                             <FileInput
//                                 id="mainImage"
//                                 onChange={handleMainImageChange}
//                                 className="custom-class"
//                                 accept="image/*"
//                             />
//                             {mainImageFile && <p className="text-sm text-gray-500">New: {mainImageFile.name}</p>}
//                             {imageUrl && !mainImageFile && (
//                                 <p className="text-sm text-gray-500">Current: <a href={imageUrl} target="_blank" rel="noopener noreferrer">View Image</a></p>
//                             )}
//                         </div>

//                         {/* Webinar Description */}
//                         <div>
//                             <Label htmlFor="webinarDescription">Webinar Description</Label>
//                             <Input
//                                 id="webinarDescription"
//                                 type="text"
//                                 placeholder="Enter Webinar Description"
//                                 value={description}
//                                 onChange={(e) => setDescription(e.target.value)}
//                             />
//                         </div>


//                     <div>
//                         <Label htmlFor="videoFiles">Select Video File(s)</Label>
//                         <FileInput
//                             id="videoFiles"
//                             onChange={handleVideoFileChange}
//                             accept="video/*"
//                             multiple
//                         />
//                     </div>

//                         {/* Render inputs for each selected video file */}

//                                 {videoData.map((video, index) => (
//                                 <div key={index} className="border p-4 rounded-md my-2 col-span-2">
//                                     <p className="text-sm font-medium text-gray-600">Video File: {video.file.name}</p>

//                                     <div className="mt-2">
//                                     <Label htmlFor={`videoName-${index}`}>Video Name</Label>
//                                     <Input
//                                         id={`videoName-${index}`}
//                                         type="text"
//                                         value={video.name}
//                                         placeholder="Enter Video Name"
//                                         onChange={(e) => {
//                                         const newVideoData = [...videoData];
//                                         newVideoData[index].name = e.target.value;
//                                         setVideoData(newVideoData);
//                                         }}
//                                     />
//                                     </div>

//                                     <div className="mt-2">
//                                     <Label htmlFor={`videoDesc-${index}`}>Video Description</Label>
//                                     <Input
//                                         id={`videoDesc-${index}`}
//                                         type="text"
//                                         value={video.description}
//                                         placeholder="Enter Video Description"
//                                         onChange={(e) => {
//                                         const newVideoData = [...videoData];
//                                         newVideoData[index].description = e.target.value;
//                                         setVideoData(newVideoData);
//                                         }}
//                                     />
//                                     </div>
//                                 </div>
//                                 ))}


//                         <div className='mt-6 '>
//                             <Button size="sm" variant="primary" type="submit" disabled={loading}>
//                                 {webinarIdToEdit ? "Update Webinar" : "Add Webinar"}
//                             </Button>
//                         </div>
//                     </div>
//                 </form>
//             </ComponentCard>
//         </div>
//     );
// };

// export default AddWebinar;






'use client';

import React, { useEffect, useState } from 'react';
import FileInput from '@/components/form/input/FileInput';
import Input from '@/components/form/input/InputField';
import Label from '@/components/form/Label';
import Button from '@/components/ui/button/Button';
import ComponentCard from '../common/ComponentCard';
import { useWebinars } from '@/context/WebinarContext'; 
import axios from 'axios';

interface AddWebinarProps {
    certificationIdToEdit?: string;
}

interface VideoEntry {
    videoUrl: string;
    name: string;
    description: string;
}

const AddWebinar: React.FC<AddWebinarProps> = ({ certificationIdToEdit }) => {
    const { addWebinar } = useWebinars();

    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [mainImageFile, setMainImageFile] = useState<File | null>(null);
    const [imageUrl, setImageUrl] = useState<string | null>(null);
    const [videoEntries, setVideoEntries] = useState<VideoEntry[]>([]);
    const [newVideoUrl, setNewVideoUrl] = useState('');

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchCertification = async () => {
            if (!certificationIdToEdit) return;

            setLoading(true);
            setError(null);

            try {
                const res = await axios.get(`/api/academy/webinars/${certificationIdToEdit}`);
                const data = res.data.data;

                setName(data.name || '');
                setDescription(data.description || '');
                setImageUrl(data.imageUrl || null);

                if (Array.isArray(data.video)) {
                    const formatted = data.video.map((v: unknown) => {
                        const videoObj = v as { videoUrl?: string; name?: string; description?: string };
                        return {
                            videoUrl: videoObj.videoUrl || '',
                            name: videoObj.name || '',
                            description: videoObj.description || '',
                        };
                    });
                    setVideoEntries(formatted);
                }
            } catch (err) {
                console.error('Error fetching webinar:', err);
                setError('Failed to load webinar.');
            } finally {
                setLoading(false);
            }
        };

        fetchCertification();
    }, [certificationIdToEdit]);

    const handleMainImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setMainImageFile(file);
            setImageUrl(null);
        }
    };

    const handleAddUrl = () => {
        if (!newVideoUrl.trim()) return;

        setVideoEntries((prev) => [
            ...prev,
            { videoUrl: newVideoUrl, name: '', description: '' },
        ]);
        setNewVideoUrl('');
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const formData = new FormData();
        formData.append('name', name);
        formData.append('description', description);

        if (mainImageFile) {
            formData.append('imageUrl', mainImageFile);
        }

        for (const [i, video] of videoEntries.entries()) {
            if (!video.videoUrl || !video.name || !video.description) {
                alert(`Please complete video entry ${i + 1}`);
                setLoading(false);
                return;
            }

            formData.append(`videoUrl`, video.videoUrl);
            formData.append(`videoName`, video.name);
            formData.append(`videoDescription`, video.description);
        }

        try {
            if (certificationIdToEdit) {
                await axios.put(`/api/academy/webinars/${certificationIdToEdit}`, formData);
                alert('Webinar updated!');
            } else {
                if (addWebinar) {
                    await addWebinar(formData);
                } else {
                    await axios.post('/api/academy/webinars', formData, {
                        headers: { 'Content-Type': 'multipart/form-data' },
                    });
                }
                alert('Webinar added!');
            }

            // Reset
            setName('');
            setDescription('');
            setMainImageFile(null);
            setImageUrl('');
            setVideoEntries([]);
        } catch (err) {
            console.error('Submission error:', err);
            setError('Failed to submit form.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <ComponentCard title={certificationIdToEdit ? "Edit Webinar" : "Add New Webinar"}>
                {loading && <p className="text-blue-500">Loading...</p>}
                {error && <p className="text-red-500">{error}</p>}

                <form onSubmit={handleSubmit} encType="multipart/form-data">
                    <div className="space-y-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 md:gap-6">

                        <div>
                            <Label htmlFor="WebinarName">Webinar Name</Label>
                            <Input
                                id="webinarName"
                                type="text"
                                placeholder="Enter Webinar Name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                            />
                        </div>

                        <div>
                            <Label htmlFor="mainImage">Main Image</Label>
                            <FileInput
                                id="mainImage"
                                onChange={handleMainImageChange}
                                accept="image/*"
                            />
                            {mainImageFile && <p>New: {mainImageFile.name}</p>}
                            {imageUrl && !mainImageFile && (
                                <p>Current: <a href={imageUrl} target="_blank">View</a></p>
                            )}
                        </div>

                        <div>
                            <Label htmlFor="tutorialDescription">Tutorial Description</Label>
                            <Input
                                id="tutorialDescription"
                                type="text"
                                placeholder="Enter Description"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                            />
                        </div>

                        <div className="col-span-2">
                            <Label htmlFor="videoUrl">Paste Video URL</Label>
                            <div className="flex gap-2">
                                <Input
                                    id="videoUrl"
                                    type="text"
                                    placeholder="https://example.com/video.mp4"
                                    value={newVideoUrl}
                                    onChange={(e) => setNewVideoUrl(e.target.value)}
                                />
                                <Button type="button" onClick={handleAddUrl}>
                                    + URL
                                </Button>
                            </div>
                        </div>


                        {videoEntries.map((video, index) => (
                            <div key={index} className="col-span-2 border p-4 rounded-md mb-4">
                                <p className="text-sm text-gray-600 mb-3">URL: {video.videoUrl}</p>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor={`videoName-${index}`}>Video Name</Label>
                                        <Input
                                            id={`videoName-${index}`}
                                            type="text"
                                            value={video.name}
                                            onChange={(e) => {
                                                const updated = [...videoEntries];
                                                updated[index].name = e.target.value;
                                                setVideoEntries(updated);
                                            }}
                                            placeholder="Enter name"
                                        />
                                    </div>

                                    <div>
                                        <Label htmlFor={`videoDesc-${index}`}>Video Description</Label>
                                        <Input
                                            id={`videoDesc-${index}`}
                                            type="text"
                                            value={video.description}
                                            onChange={(e) => {
                                                const updated = [...videoEntries];
                                                updated[index].description = e.target.value;
                                                setVideoEntries(updated);
                                            }}
                                            placeholder="Enter description"
                                        />
                                    </div>
                                </div>
                            </div>
                        ))}


                        <div className="mt-4 col-span-2">
                            <Button size="sm" variant="primary" type="submit" disabled={loading}>
                                {certificationIdToEdit ? "Update Webinar" : "Add Webinar"}
                            </Button>
                        </div>

                    </div>
                </form>
            </ComponentCard>
        </div>
    );
};

export default AddWebinar;
