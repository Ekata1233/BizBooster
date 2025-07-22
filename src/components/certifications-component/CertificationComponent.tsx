

import React, { useEffect, useState } from 'react';
import FileInput from '@/components/form/input/FileInput';
import Input from '@/components/form/input/InputField';
import Label from '@/components/form/Label';
import Button from '@/components/ui/button/Button';
import ComponentCard from '../common/ComponentCard';
// import { useModule } from '@/context/ModuleContext';
import { useCertificate } from '@/context/CertificationContext';
import axios from 'axios';

interface AddCertificateProps {
    certificationIdToEdit?: string;
}

interface VideoMeta {
  file: File;
  name: string;
  description: string;
}



const AddCertificate: React.FC<AddCertificateProps> = ({ certificationIdToEdit }) => {

    const { addCertificate,  } = useCertificate();

    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [mainImageFile, setMainImageFile] = useState<File | null>(null);
    const [imageUrl, setImageUrl] = useState<string | null>(null);
    
    
    const [videoData, setVideoData] = useState<VideoMeta[]>([]);

    const [currentVideoUrls, setCurrentVideoUrls] = useState<string[]>([]); // For existing video URLs on edit

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleMainImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            setMainImageFile(file);
            setImageUrl(null); // Clear existing URL if a new file is chosen
        }
    };

  
    const handleVideoFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
  const files = Array.from(event.target.files || []);
  const newVideoData = files.map((file) => ({
    file,
    name: '',
    description: '',
  }));
  setVideoData(newVideoData);
};


    // useEffect for fetching data for edit (simplified to match new state structure)
    useEffect(() => {
        const fetchCertification = async () => {
             if (!certificationIdToEdit) {
                // If no ID is provided, it means we are in "Add New Certificate" mode.
                // Reset all fields to initial empty states.
                setName('');
                setDescription('');
                setMainImageFile(null);
                setImageUrl(null);
                // setVideoFiles([]);
                // setVideoName('');
                // setVideoDescription('');
                setCurrentVideoUrls([]);
                setLoading(false);
                setError(null);
                return; // Exit the effect, no fetch needed for adding
            }


            setLoading(true);
            setError(null);
            try {
                // Assuming your backend's GET endpoint also returns this flatter structure
                const response = await axios.get(`/api/academy/certifications/${certificationIdToEdit}`);

                const data = response.data.data;
                console.log("Data : ",data)
                console.log("certificationIdToEdit received:", certificationIdToEdit);

                setName(data.name || '');
                setDescription(data.description || '');
                setImageUrl(data.imageUrl || null);
              

                if (data.video && Array.isArray(data.video) && data.video.length > 0) {
                    setCurrentVideoUrls(data.video.map((v: unknown) => (v as { videoUrl: string }).videoUrl));
                } else {
                    setCurrentVideoUrls([]);
                }
                // setVideoFiles([]); // Clear any pre-selected files when loading for edit
            } catch (err: unknown) {
                console.error('Error fetching certification for edit:', err);
                if (axios.isAxiosError(err)) {
                    setError(err.response?.data?.message || 'Failed to fetch certification for editing.');
                } else {
                    setError('An unexpected error occurred.');
                }
            } finally {
                setLoading(false);
            }
        };

        fetchCertification();
    }, [certificationIdToEdit]);

    
    const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append('name', name);
    formData.append('description', description);

    // --- Handle Main Image ---
    if (mainImageFile) {
        formData.append('imageUrl', mainImageFile);
    } else if (!certificationIdToEdit && !imageUrl) {
        alert('Please select a main image file.');
        setLoading(false);
        return;
    }

    // --- Handle Video Files and Metadata ---
    if (!certificationIdToEdit && videoData.length === 0 && currentVideoUrls.length === 0) {
        alert('Please select at least one video file.');
        setLoading(false);
        return;
    }

    // Validate each video entry
    for (const [i, video] of videoData.entries()) {
        if (!video.name || !video.description) {
            alert(`Please enter name and description for video ${i + 1}`);
            setLoading(false);
            return;
        }

        formData.append(`video`, video.file); // Use 'video' key multiple times
        formData.append(`videoName`, video.name);
        formData.append(`videoDescription`, video.description);
    }

    if (!name || !description) {
        alert('Please enter all required fields.');
        setLoading(false);
        return;
    }

    try {
        if (certificationIdToEdit) {
            await axios.put(`/api/certifications/${certificationIdToEdit}`, formData);
            alert('Certificate updated successfully!');
        } else {
            if (addCertificate) {
                await addCertificate(formData);
            } else {
                console.log("--- Frontend FormData Contents Before Sending ---");
                for (const pair of formData.entries()) {
                    console.log(pair[0] + ': ' + pair[1]);
                }
                console.log("--------------------------------------------------");
                await axios.post('/academy/certifications', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                });
            }
            alert('Certificate added successfully!');
        }

        // Reset everything
        setName('');
        setDescription('');
        setMainImageFile(null);
        setImageUrl(null);
        setVideoData([]);
        setCurrentVideoUrls([]);
        setError(null);

        const fileInputElements = document.querySelectorAll('input[type="file"]');
        fileInputElements.forEach(input => {
            (input as HTMLInputElement).value = '';
        });

    }
    
   catch (err: unknown) {
  let errorMessage = 'Error processing tutorial.';


  if (
    axios.isAxiosError(err) &&
    err.response?.data &&
    typeof err.response.data === 'object'
  ) {

    const data = err.response.data as { message?: string };
    if (data.message) errorMessage = data.message;
  }

  console.error('Submission error:', err);
  setError(errorMessage);
  alert(errorMessage);
}


    finally {
        setLoading(false);
    }
};


    return (
        <div>
            <ComponentCard title={certificationIdToEdit ? "Edit Tutorial" : "Add New Tutorial"}>
                {loading && <p className="text-blue-500">Loading...</p>}
                {error && <p className="text-red-500">{error}</p>}

                <form onSubmit={handleSubmit} encType="multipart/form-data">
                    <div className="space-y-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 md:gap-6">
                       
                        <div>
                            <Label htmlFor="certificateName">Tutorial Name</Label>
                            <Input
                                id="certificateName"
                                type="text"
                                placeholder="Enter Tutorial Name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                            />
                        </div>

                  
                        <div>
                            <Label htmlFor="mainImage">Select Main Image</Label>
                            <FileInput
                                id="mainImage"
                                onChange={handleMainImageChange}
                                className="custom-class"
                                accept="image/*"
                            />
                            {mainImageFile && <p className="text-sm text-gray-500">New: {mainImageFile.name}</p>}
                            {imageUrl && !mainImageFile && (
                                <p className="text-sm text-gray-500">Current: <a href={imageUrl} target="_blank" rel="noopener noreferrer">View Image</a></p>
                            )}
                        </div>

                      
                        <div>
                            <Label htmlFor="tutorialDescription">Tutorial Description</Label>
                            <Input
                                id="tutorialDescription"
                                type="text"
                                placeholder="Enter Tutorial Description"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                            />
                        </div>


                    <div>
                        <Label htmlFor="videoFiles">Select Video File(s)</Label>
                        <FileInput
                            id="videoFiles"
                            onChange={handleVideoFileChange}
                            accept="video/*"
                            multiple
                        />
                    </div>

                     

                                {videoData.map((video, index) => (
                                <div key={index} className="border p-4 rounded-md my-2 col-span-2">
                                    <p className="text-sm font-medium text-gray-600">Video File: {video.file.name}</p>

                                    <div className="mt-2">
                                    <Label htmlFor={`videoName-${index}`}>Video Name</Label>
                                    <Input
                                        id={`videoName-${index}`}
                                        type="text"
                                        value={video.name}
                                        placeholder="Enter Video Name"
                                        onChange={(e) => {
                                        const newVideoData = [...videoData];
                                        newVideoData[index].name = e.target.value;
                                        setVideoData(newVideoData);
                                        }}
                                    />
                                    </div>

                                    <div className="mt-2">
                                    <Label htmlFor={`videoDesc-${index}`}>Video Description</Label>
                                    <Input
                                        id={`videoDesc-${index}`}
                                        type="text"
                                        value={video.description}
                                        placeholder="Enter Video Description"
                                        onChange={(e) => {
                                        const newVideoData = [...videoData];
                                        newVideoData[index].description = e.target.value;
                                        setVideoData(newVideoData);
                                        }}
                                    />
                                    </div>
                                </div>
                                ))}


                        <div className='mt-35 '>
                            <Button size="sm" variant="primary" type="submit" disabled={loading}>
                                {certificationIdToEdit ? "Update Tutorial" : "Add Tutorial"}
                            </Button>
                        </div>
                    </div>
                </form>
            </ComponentCard>
        </div>
    );
};

export default AddCertificate;