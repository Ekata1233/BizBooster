
'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import axios from "axios"; 
import Button from '@/components/ui/button/Button';
import PageBreadcrumb from '@/components/common/PageBreadCrumb';
import { TrashBinIcon } from '@/icons';
import { useCertificate } from '@/context/CertificationContext';
import { PencilIcon } from 'lucide-react';
import { CheckCircle2, Lock } from 'lucide-react'; 
import ComponentCard from '@/components/common/ComponentCard';

interface Video {
  _id: string;
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

interface VideoProgress {
  userId: string;
  certificateId: string;
  videoId: string;
}

interface YTPlayer {
  destroy: () => void;
}

declare global {
  interface Window {
    onYouTubeIframeAPIReady: () => void;
    YT: {
      Player: new (element: HTMLElement | string, options: {
        videoId: string;
        events: {
          onStateChange: (event: { data: number }) => void;
        };
      }) => YTPlayer;
      PlayerState: {
        ENDED: number;
      };
    };
  }
}

const CertificateDetailPage: React.FC = () => {
  const params = useParams();
  const id = params?.id as string;
  const router = useRouter();
  
  const currentUserId = "68b581020057b79c97c99e23"; 

  const { certificates, deleteCertificate, deleteTutorial: deleteVideoInCertificate } = useCertificate();

  const [certificate, setCertificate] = useState<Certificate | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [completedVideos, setCompletedVideos] = useState<string[]>([]);
  
  const [selectedVideoId, setSelectedVideoId] = useState<string | null>(null);

  const playersRef = useRef<Record<string, YTPlayer>>({});
  const [isApiReady, setIsApiReady] = useState(false);

  const handleVideoEnd = useCallback(async (videoId: string) => {
    console.log(`handleVideoEnd called for video ID: ${videoId}.`);
    try {
      await axios.post('/api/video-progress', {
        userId: currentUserId,
        certificateId: id,
        videoId,
      });
      console.log('Video progress saved to database successfully!');
      setCompletedVideos(prev => [...prev, videoId]);
    } catch (error) {
      console.error('Failed to save video progress:', error);
    }
  }, [currentUserId, id]);

  const getYoutubeId = (url: string): string | null => {
    const regExp = /(?:https?:\/\/)?(?:www\.)?(?:m\.)?(?:youtube\.com|youtu\.be)\/(?:watch\?v=|embed\/|v\/|)([\w-]{11})(?:\S+)?/;
    const match = url.match(regExp);
    return (match && match[1].length === 11) ? match[1] : null;
  };

  const initPlayer = useCallback((videoId: string, videoUrl: string) => {
    const youtubeId = getYoutubeId(videoUrl);
    if (!youtubeId) {
      console.log(`YouTube ID not found for URL: ${videoUrl}`);
      return;
    }

    Object.values(playersRef.current).forEach(player => player.destroy());
    playersRef.current = {};

    const container = document.getElementById(`Youtubeer-${videoId}`);
    if (container) {
      playersRef.current[`Youtubeer-${videoId}`] = new window.YT.Player(container, {
        videoId: youtubeId,
        events: {
          'onStateChange': (event: { data: number }) => {
            if (event.data === window.YT.PlayerState.ENDED) {
              handleVideoEnd(videoId);
            }
          }
        }
      });
    } else {
      console.log(`Container for video ID ${videoId} not found.`);
    }
  }, [handleVideoEnd]);

  useEffect(() => {
    if (window.YT && window.YT.Player) {
      setIsApiReady(true);
      return;
    }

    window.onYouTubeIframeAPIReady = () => {
      console.log('YouTube IFrame API is ready.');
      setIsApiReady(true);
    };

    const scriptTag = document.createElement('script');
    scriptTag.src = 'https://www.youtube.com/iframe_api';
    document.body.appendChild(scriptTag);

    return () => {
      if (document.body.contains(scriptTag)) {
        document.body.removeChild(scriptTag);
      }
      Object.values(playersRef.current).forEach(player => {
        try {
          if (typeof player.destroy === 'function') {
            player.destroy();
          }
        } catch (e) {
          console.error('Failed to destroy player:', e);
        }
      });
      playersRef.current = {};
    };
  }, []);
const loadCertificateDetails = useCallback(async () => {
  if (!id || !currentUserId) {
    setIsLoading(false);
    return;
  }
  setIsLoading(true);
  setError(null);
  try {
    const found = certificates.find((c) => c._id === id);
    const certificateData =
      found ||
      (await axios.get<Certificate>(
        `/api/academy/certifications/${id}`
      )).data;

    setCertificate({ ...certificateData, video: certificateData.video || [] });

    const progressRes = await axios.get<VideoProgress[]>(
      `/api/video-progress?userId=${currentUserId}&certificateId=${id}`
    );
    const completedVideoIds = progressRes.data.map(
      (record) => record.videoId
    );
    setCompletedVideos(completedVideoIds);

    // Check if the video array is not empty before trying to access index 0
    const nextVideoToPlay = (certificateData.video || []).find(
      (v) => !completedVideoIds.includes(v._id)
    );

    let initialVideoId = null;
    const videoList = certificateData.video || [];
    if (videoList.length > 0) {
      initialVideoId = nextVideoToPlay?._id || videoList[0]._id;
    }

    setSelectedVideoId(initialVideoId);
  } catch (err: unknown) {
    console.error("Failed to fetch details or progress:", err);

    const axiosErr = err as any;
    if (axiosErr?.response?.data?.message) {
      setError(axiosErr.response.data.message);
    } else if (err instanceof Error) {
      setError(err.message || "An unexpected error occurred.");
    } else {
      setError("An unknown error occurred.");
    }
  } finally {
    setIsLoading(false);
  }
}, [id, certificates, currentUserId]);

useEffect(() => {
  if (isApiReady && certificate?.video && selectedVideoId) {
    const videoToPlay = certificate.video.find(
      (v) => v._id === selectedVideoId
    );
    if (videoToPlay) {
      initPlayer(videoToPlay._id, videoToPlay.videoUrl);
    }
  }
}, [isApiReady, selectedVideoId, certificate, initPlayer]);

useEffect(() => {
  loadCertificateDetails();
}, [loadCertificateDetails]);

const handleDeleteVideo = async (videoId: string) => {
  if (!certificate) return;
  if (!window.confirm("Are you sure you want to delete this video?")) return;

  try {
    const videoIdx = certificate.video.findIndex((v) => v._id === videoId);
    if (videoIdx === -1) {
      throw new Error("Video not found.");
    }

    await deleteVideoInCertificate(certificate._id, videoIdx);
    loadCertificateDetails();
    alert("Video deleted successfully!");
  } catch (err: unknown) {
    console.error("Delete video error:", err);

    const axiosErr = err as any;
    if (axiosErr?.response?.data?.message) {
      alert(axiosErr.response.data.message);
    } else if (err instanceof Error) {
      alert(
        err.message || "An unexpected error occurred during video deletion."
      );
    } else {
      alert("An unknown error occurred during video deletion.");
    }
  }
};

const handleDeleteCertificate = async () => {
  if (!certificate) return;
  if (!window.confirm("Are you sure you want to delete this entire tutorial?"))
    return;

  try {
    await deleteCertificate(certificate._id);
    alert("Tutorial deleted successfully!");
    router.back();
  } catch (err: unknown) {
    console.error("Delete tutorial error:", err);

    const axiosErr = err as any;
    if (axiosErr?.response?.data?.message) {
      alert(axiosErr.response.data.message);
    } else if (err instanceof Error) {
      alert(
        err.message || "An unexpected error occurred during tutorial deletion."
      );
    } else {
      alert("An unknown error occurred during tutorial deletion.");
    }
  }
};


  const handleEdit = (certId: string, videoId: string) => {
    const videoIdx = certificate?.video.findIndex(v => v._id === videoId);
    if (videoIdx === undefined || videoIdx === -1) {
      console.error("Video not found for editing.");
      return;
    }
    router.push(`/academy/certifications-management/updateModals/${certId}/${videoIdx}`);
  };

  if (isLoading) return <p className="text-center text-gray-500 py-10">Loading tutorial details...</p>;
  if (error) return <p className="text-center text-red-500 py-10">Error: {error}</p>;
  if (!certificate) return <p className="text-center text-gray-500 py-10">Tutorial not found.</p>;

  const isCertificationCompleted = certificate.video.length > 0 && completedVideos.length === certificate.video.length;

  return (
    <div className="min-h-screen bg-gray-50  font-sans text-gray-800">
      <ComponentCard title="Tutorial Details">
      <div className="max-w-7xl mx-auto">
        <PageBreadcrumb pageTitle="Tutorial Detail" />

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 bg-white p-6 sm:p-8 rounded-3xl shadow-sm">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-4 sm:mb-0">
            {certificate.name}
          </h1>
          
        </div>

        <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-lg mb-10 flex flex-col md:flex-row items-center md:items-start gap-8">
          <div className="flex-shrink-0 w-full md:w-2/5 lg:w-1/3 relative overflow-hidden rounded-2xl shadow-xl border border-gray-200">
            {certificate.imageUrl ? (
              <Image
                src={certificate.imageUrl}
                alt={certificate.name}
                width={600}
                height={350}
                className="rounded-2xl object-cover w-full h-auto transform transition-transform duration-300 hover:scale-105"
              />
            ) : (
              <div className="w-full h-48 md:h-60 bg-gray-100 rounded-2xl flex items-center justify-center text-gray-400 text-lg">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            )}
          </div>

          <div className="flex-grow space-y-5 text-gray-700">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 leading-tight">
              {certificate.name}
            </h2>
            <p className="text-base sm:text-lg leading-relaxed text-gray-600">
              {certificate.description || 'No description provided.'}
            </p>
            {isCertificationCompleted && (
              <div className="flex items-center gap-2 mt-4 text-green-600 font-bold bg-green-50 p-3 rounded-lg border border-green-200">
                <CheckCircle2 className="h-5 w-5" />
                <span>Certification Completed!</span>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-lg mb-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6 pb-4 border-b border-gray-200">Tutorial Videos</h2>
          {(certificate.video || []).length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {(certificate.video || []).map((v, idx) => {
                const videoId = getYoutubeId(v.videoUrl);
                const isVideoCompleted = completedVideos.includes(v._id);
                
                const isPlayable = isCertificationCompleted || idx === 0 || completedVideos.includes(certificate.video[idx-1]?._id);
                const isSelected = v._id === selectedVideoId;

                return (
                  <div 
                    key={v._id} 
                    className={`border rounded-2xl p-5 shadow-sm flex flex-col gap-4 bg-gray-50 hover:shadow-lg hover:border-blue-400 transition-all duration-300 ${isSelected ? 'border-blue-500 ring-2 ring-blue-500 bg-white' : 'border-gray-200'} ${isPlayable ? 'cursor-pointer' : 'cursor-not-allowed opacity-60'}`}
                    onClick={() => isPlayable && setSelectedVideoId(v._id)}
                  >
                    <div className="relative w-full aspect-video rounded-lg overflow-hidden mb-2 shadow-md">
                      {videoId && isSelected && isPlayable ? (
                        <div id={`Youtubeer-${v._id}`} className="w-full h-full"></div>
                      ) : (
                        <div className="absolute inset-0 bg-black bg-opacity-70 flex flex-col items-center justify-center text-white p-4 text-center">
                          <div className="relative w-full h-full">
                            {v.videoImageUrl && (
                              <Image
                                src={v.videoImageUrl}
                                alt={`${v.videoName || 'Video'} thumbnail`}
                                fill
                                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                className="object-cover opacity-50"
                              />
                            )}
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                              {isPlayable ? (
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-white bg-blue-600 rounded-full p-2" viewBox="0 0 24 24" fill="currentColor">
                                  <path d="M8 5v14l11-7z" />
                                </svg>
                              ) : (
                                <div className="p-3 bg-gray-800 rounded-full">
                                  <Lock className="h-8 w-8 text-white" />
                                </div>
                              )}
                              <p className="mt-4 text-lg font-bold text-shadow">
                                {isPlayable ? 'Click to play' : 'Locked'}
                              </p>
                              {!isPlayable && (
                                <p className="text-sm text-gray-200 mt-1 text-shadow">
                                  Complete the previous video to unlock.
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                    <h3 className="text-lg font-semibold text-gray-800">Video {idx + 1}: {v.videoName || 'Untitled Video'}</h3>
                    <p className="text-sm text-gray-600 flex-grow">
                      <strong>Description: </strong>
                      {v.videoDescription || 'No description.'}
                    </p>
                    <div className="flex justify-between items-center mt-2">
                      {isVideoCompleted ? (
                        <span className="flex items-center gap-1 text-green-600 font-semibold text-sm">
                          <CheckCircle2 className="h-4 w-4" /> Completed
                        </span>
                      ) : (
                        <span className="text-gray-400 text-sm">In Progress</span>
                      )}
                      <div className="flex gap-2">
                        <button
                          onClick={(e) => { e.stopPropagation(); handleEdit(certificate._id, v._id); }}
                          className="p-2 rounded-lg border border-yellow-500 text-yellow-500 hover:bg-yellow-500 hover:text-white transition-colors duration-200"
                          aria-label="Edit"
                        >
                          <PencilIcon size={16} />
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); handleDeleteVideo(v._id); }}
                          className="p-2 rounded-lg border border-red-500 text-red-500 hover:bg-red-500 hover:text-white transition-colors duration-200"
                          aria-label="Delete"
                        >
                          <TrashBinIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-center text-gray-500 text-lg py-8">No tutorial videos available for this certificate.</p>
          )}
        </div>

        <Link href="/academy/certifications-management/Tutorial-List" passHref>
          <Button variant="outline" className="px-6 py-3 text-lg font-semibold border-gray-300 text-gray-600 hover:bg-gray-100 transition-colors">
            Back 
          </Button>
        </Link>
      </div>
      </ComponentCard>
    </div>
  );
};

export default CertificateDetailPage;