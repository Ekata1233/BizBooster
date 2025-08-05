'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import axios from 'axios';
import Button from '@/components/ui/button/Button';
import PageBreadcrumb from '@/components/common/PageBreadCrumb';
import { TrashBinIcon } from '@/icons';
import { useCertificate } from '@/context/CertificationContext';
import { PencilIcon } from 'lucide-react';

// Define types for clarity
interface Video {
  videoName: string;
  videoDescription: string;
  videoUrl: string;
  videoImageUrl?: string; 
}

interface Certificate {
  _id: string;
  name: string;
  description: string;
  imageUrl: string;
  video: Video[]; 
}

const CertificateDetailPage: React.FC = () => {
  const params = useParams();
  const id = params?.id as string;

  const router = useRouter();

  const { certificates, deleteCertificate, deleteTutorial: deleteVideoInCertificate } = useCertificate();

  const [certificate, setCertificate] = useState<Certificate | null>(null);
  const [isLoading, setIsLoading] = useState(true); 
  const [error, setError] = useState<string | null>(null); 

  
  const loadCertificateDetails = useCallback(async () => {
    if (!id) {
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const found = certificates.find((c) => c._id === id);
      if (found) {
        setCertificate({ ...found, video: found.video || [] } as Certificate);
      } else { 
        const res = await axios.get(`/api/academy/certifications/${id}`);
        setCertificate({ ...res.data, video: res.data.video || [] } as Certificate);
      }
    } catch (err: unknown) {
      console.error('Failed to fetch tutorial details:', err);
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.message || 'Failed to load tutorial details.');
      } else if (err instanceof Error) {
        setError(err.message || 'An unexpected error occurred.');
      } else {
        setError('An unknown error occurred.');
      }
    } finally {
      setIsLoading(false);
    }
  }, [id, certificates]); 

  useEffect(() => {
    loadCertificateDetails();
  }, [loadCertificateDetails]);



  const handleDeleteVideo = async (videoIdx: number) => {
    if (!certificate) return;
    if (!window.confirm('Are you sure you want to delete this video?')) return;

    try {
      await deleteVideoInCertificate(certificate._id, videoIdx);
      loadCertificateDetails(); 
      alert('Video deleted successfully!');
    } catch (err: unknown) {
      console.error('Delete video error:', err);
      if (axios.isAxiosError(err)) {
        alert(err.response?.data?.message || 'Error deleting video.');
      } else {
        alert('An unexpected error occurred during video deletion.');
      }
    }
  };

  const handleDeleteCertificate = async () => {
    if (!certificate) return;
    if (!window.confirm('Are you sure you want to delete this entire tutorial?')) return;

    try {
      await deleteCertificate(certificate._id);
      alert('Tutorial deleted successfully!');
      router.back(); 
    } catch (err: unknown) {
      console.error('Delete tutorial error:', err);
      if (axios.isAxiosError(err)) {
        alert(err.response?.data?.message || 'Error deleting tutorial.');
      } else {
        alert('An unexpected error occurred during tutorial deletion.');
      }
    }
  };

  const handleEdit = (certId: string, videoIdx: number) => {
   
    router.push(`/academy/certifications-management/updateModals/${certId}/${videoIdx}`);
  };


  if (isLoading) return <p className="p-8 text-center text-gray-600">Loading tutorial details...</p>;
  if (error) return <p className="p-8 text-center text-red-600">Error: {error}</p>;
  
  if (!certificate) return <p className="p-8 text-center text-gray-600">Tutorial not found.</p>;

  return (
    <div className="min-h-screen bg-white p-6 sm:p-8 md:p-10 font-sans">
      <PageBreadcrumb pageTitle="Tutorial Detail" />

    
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 p-6 sm:p-8">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-black mb-4 sm:mb-0">
          {certificate.name}
        </h1>
        <button onClick={handleDeleteCertificate} className="text-red-500 border border-red-500 rounded-md p-2 hover:bg-red-500 hover:text-white hover:border-red-500">
          <TrashBinIcon />
        </button>
      </div>

  
      <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-sm mb-8 flex flex-col md:flex-row items-center md:items-start gap-6 md:gap-8">
    
        <div className="flex-shrink-0 w-full md:w-2/5 lg:w-1/3 relative overflow-hidden rounded-2xl shadow-xl">
          {certificate.imageUrl ? (
            <Image
              src={certificate.imageUrl}
              alt={certificate.name}
              width={600} 
              height={350} 
              className="rounded-2xl object-cover w-full h-auto shadow-sm transform transition-transform duration-300 hover:scale-105"
            />
          ) : (
            <div className="w-full h-48 md:h-60 bg-gray-100 rounded-2xl flex items-center justify-center text-gray-500 text-lg">
              No Image Available
            </div>
          )}
        </div>

       
        <div className="flex-grow space-y-5 text-gray-800">
          <h2 className="text-2xl sm:text-3xl font-bold text-black leading-tight">
            {certificate.name}
          </h2>
          <p className="text-base sm:text-lg leading-relaxed text-gray-700">
            {certificate.description || 'No description provided.'}
          </p>
        </div>
      </div>

   
      <div className="p-6 sm:p-8 mb-8">
        <h2 className="text-2xl sm:text-3xl font-bold text-black mb-6 pb-4">Tutorial Videos</h2>       
        {(certificate.video || []).length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {(certificate.video || []).map((v, idx) => (
              <div key={idx} className="border border-blue-100 rounded-2xl p-5 shadow-md flex flex-col gap-4 bg-white hover:shadow-xl hover:border-blue-300 transition-all duration-300">
                
                {v.videoImageUrl && (
                  <div className="relative w-full h-40 rounded-lg overflow-hidden mb-2">
                    <Image
                      src={v.videoImageUrl}
                      alt={`${v.videoName || 'Video'} thumbnail`}
                      fill 
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      className="object-cover"
                    />
                  </div>
                )}
              
                {!v.videoImageUrl && (
                  <div className="w-full h-40 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400 text-sm mb-2">
                    No Thumbnail Available
                  </div>
                )}


                <h3 className="text-lg font-semibold text-gray-800">Video {idx + 1}: {v.videoName || 'Untitled Video'}</h3>
                <strong>Video Url:
                  <a
                    href={v.videoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 underline hover:text-blue-800 transition-colors duration-200 ml-2"
                  >
                    View Video
                  </a>
                </strong>

                <p className="text-sm text-gray-700">
                  <strong>Description: </strong>
                  {v.videoDescription || 'No description.'}
                </p>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(certificate._id, idx)}
                    className="text-yellow-500 border border-yellow-500 rounded-md p-2 hover:bg-yellow-500 hover:text-white"
                    aria-label="Edit"
                  >
                    <PencilIcon size={16} />
                  </button>
                  <button
                    onClick={() => handleDeleteVideo(idx)}
                    className="text-red-500 border border-red-500 rounded-md p-2 hover:bg-red-500 hover:text-white"
                    aria-label="Delete"
                  >
                    <TrashBinIcon />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-gray-600 text-lg py-8">No tutorial videos available for this certificate.</p>
        )}
      </div>


      <Link href="/academy/certifications-management/Tutorial-List" passHref>
        <Button variant="outline">Back</Button>
      </Link>

     
    </div>
  );
};

export default CertificateDetailPage; 