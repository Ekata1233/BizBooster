'use client';

import ComponentCard from '@/components/common/ComponentCard';
import PageBreadcrumb from '@/components/common/PageBreadCrumb';
import FileInput from '@/components/form/input/FileInput';
import Input from '@/components/form/input/InputField';
import Label from '@/components/form/Label';
// import AddWebinar from '@/components/webinars-component/WebinarComponent';
import ModuleStatCard from '@/components/module-component/ModuleStatCard';
import RouteLoader from '@/components/RouteLoader';
import BasicTableOne from '@/components/tables/BasicTableOne';
import Button from '@/components/ui/button/Button';
import { Modal } from '@/components/ui/modal';
// import { useWebinars } from '@/context/WebinarContext';
import { useLiveWebinars } from '@/context/LiveWebinarContext';
import { useModal } from '@/hooks/useModal';
import { EyeIcon, TrashBinIcon } from '@/icons';
import {  PencilIcon} from 'lucide-react';
// import axios from 'axios';
import Image from 'next/image';
import Link from 'next/link';
import React, { useEffect, useState } from 'react';
import AddLiveWebinar from '@/components/livewebinars-component/LiveWebinarComponent';
import { useRouter } from 'next/navigation';
// import { setDate } from 'date-fns';

// Import types from context to ensure compatibility
// import type { EnrolledUserEntry, LiveWebinar } from '@/context/LiveWebinarContext';

interface TableData {
    id: string;
    user: string[];
    name: string;
    imageUrl: string;
    description: string;
    displayVideoUrls: string[];
    date: string;
    startTime: string;
    endTime: string;
    categoryCount?: number;
    status: string;
}



const LiveWebinar = () => {
    const router = useRouter();
    const { webinars, updateWebinar, deleteWebinar } = useLiveWebinars();
    const { isOpen, closeModal } = useModal();
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [imageUrl, setImageUrl] = useState<string | null>(null);
    // const [videoFiles, setVideoFiles] = useState<File[]>([]);
    const [videoUrl, setVideoUrl] = useState('');
    const [date, setDate] = useState('');
    const [startTime, setStartTime] = useState('');
    const [endTime, setEndTime] = useState('');

    // const [currentVideoUrls, setCurrentVideoUrls] = useState<string[]>([]);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [editingCertificationId, setEditingCertificationId] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [filteredCertificates, setFilteredCertificates] = useState<TableData[]>([]);
    const [activeTab, setActiveTab] = useState('all');



    // const fetchFilteredWebinars = async () => {
    //     try {
    //         const params = {
    //             ...(searchQuery && { search: searchQuery }),
    //         };

    //         const response = await axios.get('/api/academy/livewebinars', { params });
    //         const data = response.data.data;

    //         if (data.length === 0) {
    //             setFilteredCertificates([]);
    //         } else {
    //             const tableData: TableData[] = data.map((mod: LiveWebinar) => ({
    //                 id: mod._id,
    //                 user: mod.user || [],
    //                 name: mod.name,
    //                 imageUrl: mod.imageUrl,
    //                 description: mod.description || 'N/A',
    //                 displayVideoUrls: Array.isArray(mod.displayVideoUrls)
    //                     ? mod.displayVideoUrls
    //                     : (mod.displayVideoUrls ? mod.displayVideoUrls.split(',') : []),
    //                 date: mod.date || 'N/A',
    //                 startTime: mod.startTime || 'N/A',
    //                 endTime: mod.endTime || 'N/A',
    //                 categoryCount: mod.categoryCount || 0,
    //                 status: mod.isDeleted ? 'Deleted' : 'Active',
    //             }));

    //             setFilteredCertificates(tableData);
    //         }
    //     } catch (error) {
    //         console.error('Error fetching users:', error);
    //         setFilteredCertificates([]);
    //     }
    // }

    // useEffect(() => {
    //     fetchFilteredWebinars();
    // }, [searchQuery, webinars]);

useEffect(() => {
  const filteredData = webinars
    .filter((webinar) =>
      webinar.name.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .map((mod) => ({
      id: mod._id,
    //   user: mod.user || [],
      user: mod.user?.map((u) => u.id) || [],
      name: mod.name,
      imageUrl: mod.imageUrl,
      description: mod.description || 'N/A',
      displayVideoUrls: Array.isArray(mod.displayVideoUrls)
        ? mod.displayVideoUrls
        : (typeof mod.displayVideoUrls === 'string'
            ? (mod.displayVideoUrls as string ? (mod.displayVideoUrls as string).split(',') : [])
            : []),
      date: mod.date || 'N/A',
      startTime: mod.startTime || 'N/A',
      endTime: mod.endTime || 'N/A',
        // categoryCount: mod.categoryCount || 0,
      status: mod.isDeleted ? 'Deleted' : 'Active',
    }));

  setFilteredCertificates(filteredData);
}, [searchQuery, webinars]);



    const columns = [

        {
            header: 'Webinar Name',
            accessor: 'name',
        },
        {
            header: 'Image',
            accessor: 'imageUrl',
            render: (row: TableData) => (
                <div className="flex items-center gap-3">
                    <div className="w-20 h-20 overflow-hidden">
                        {row.imageUrl ? (
                            <Image
                                width={130}
                                height={130}
                                src={row.imageUrl}
                                alt={row.name || "certification image"}
                                className="object-cover rounded"
                            />
                        ) : (
                            <span>No Image</span>
                        )}
                    </div>
                </div>
            ),
        },

        {
            header: 'Webinar Description',
            accessor: 'description',
            render: (row: TableData) => (
                <div className="flex flex-col">
                    {row.description ? (
                        row.description.split(',').map((desc: string, idx: number) => (
                            <p key={idx}>{desc.trim()}</p>
                        ))
                    ) : (
                        <span>N/A</span>
                    )}
                </div>
            ),
        },

        {
            header: 'Live Webinar Link',
            accessor: 'liveWebinarLink',
            render: (row: TableData) => (
                <div className="flex flex-col gap-1">
                    {row.displayVideoUrls && row.displayVideoUrls.length > 0 ? (
                        row.displayVideoUrls.map((url, idx) => (
                            <a
                                key={idx}
                                href={url.trim()}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-500 underline break-all"
                            >
                                {url.trim()}
                            </a>
                        ))
                    ) : (
                        <span className="text-gray-400">No Links</span>
                    )}
                </div>
            ),
        },
        {
            header: 'Webinar Date',
            accessor: 'date',
            render: (row: TableData) => (
                <div className="flex justify-center items-center">
                    {row.date || 'N/A'}
                </div>
            ),
        },
        {
            header: 'Webinar Start Time',
            accessor: 'startTime',
            render: (row: TableData) => (
                <div className="flex justify-center items-center">
                    {row.startTime || 'N/A'}
                </div>
            ),
        },
        {
            header: 'Webinar End Time',
            accessor: 'endTime',
            render: (row: TableData) => (
                <div className="flex justify-center items-center">
                    {row.endTime || 'N/A'}
                </div>
            ),
        },

        {
            header: 'Videos Count',
            accessor: 'categoryCount',
            render: (row: TableData) => {
                return (
                    <div className="flex justify-center items-center">
                        {row.displayVideoUrls.length}
                    </div>
                );
            },
        },

        {
            header: 'UserIds Count',
            accessor: 'userIdsCount',
            render: (row: TableData) => {
                return (
                    <div className="flex justify-center items-center">
                        {row.user.length}
                    </div>
                );
            },
        },
     
        {
            header: 'Action',
            accessor: 'action',
            render: (row: TableData) => {
                return (
                    <div className="flex gap-2">
                        <button
                            onClick={() => handleEdit(row.id)}
                            className="text-yellow-500 border border-yellow-500 rounded-md p-2 hover:bg-yellow-500 hover:text-white hover:border-yellow-500">

                            {/* <PlusCircle className="ml-1" /> */}
                            <PencilIcon />
                        </button>

                        <button onClick={() => handleDelete(row.id)} className="text-red-500 border border-red-500 rounded-md p-2 hover:bg-red-500 hover:text-white hover:border-red-500">
                            <TrashBinIcon />
                        </button>
                        <Link href={`/academy/livewebinars/${row.id}`} passHref>
                            <button className="text-blue-500 border border-blue-500 rounded-md p-2 hover:bg-blue-500 hover:text-white hover:border-blue-500">
                                <EyeIcon />
                            </button>
                        </Link>
                    </div>
                )
            },
        },
    ];

    const handleEdit = (id: string) => {

        // const selectedWebinar = webinars.find(item => item._id === id);
        // if (selectedWebinar) {
        //     setEditingCertificationId(selectedWebinar._id);
        //     setName(selectedWebinar.name);
        //     setDescription(selectedWebinar.description || '');
        //     setImageUrl(selectedWebinar.imageUrl);
        //     setVideoUrl(selectedWebinar.displayVideoUrls?.[0] || '');
        //     setDate(selectedWebinar.date || '');
        //     setStartTime(selectedWebinar.startTime || '');
        //     setEndTime(selectedWebinar.endTime || '');
        //     //   setCurrentVideoUrls(Array.isArray(selectedWebinar.displayVideoUrls) ? selectedWebinar.displayVideoUrls : []);

        //     //   setNewVideos([{ name: '', description: '', file: null }]);

        //     openModal();
     router.push(`/academy/livewebinars/modals/${id}`);
    //  Router.push(`/academy/livewebinars/modals/${id}`);
    };
    const handleUpdateData = async () => {
        if (!editingCertificationId) return;

        const formData = new FormData();
        formData.append('name', name);
        formData.append('description', description);
        formData.append('date', date);
        formData.append('startTime', startTime);
        formData.append('endTime', endTime);
        formData.append('displayVideoUrls', videoUrl); // or loop if multiple

        if (selectedFile) {
            formData.append('imageUrl', selectedFile);
        }

        try {
            await updateWebinar(editingCertificationId, formData);
            alert('Webinar updated successfully');
            closeModal();
            resetForm();
            // fetchFilteredWebinars();
        } catch (error) {
            console.error('Error updating webinar:', error);
        }
    };


    const resetForm = () => {
        setEditingCertificationId(null);
        setName('');
        setDescription('');
        setVideoUrl('');
        setDate('');
        setStartTime('');
        setEndTime('');
        setSelectedFile(null);
        setImageUrl(null);
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            setSelectedFile(file);
        }
    };

    const handleDelete = async (id: string) => {
        const confirmDelete = window.confirm('Are you sure you want to delete this certificate?');
        if (!confirmDelete) return;

        try {
            await deleteWebinar(id);
            alert('Webinar deleted successfully');
            // fetchFilteredWebinars();
        } catch (error) {
            console.error('Error deleting webinar:', error);
        }
    };

    const getFilteredByStatus = () => {
        if (activeTab === 'active') {
            return filteredCertificates.filter(mod => mod.status === 'Active');
        } else if (activeTab === 'inactive') {
            return filteredCertificates.filter(mod => mod.status === 'Deleted');
        }
        return filteredCertificates;
    };

    if (!webinars || !Array.isArray(webinars)) {
        return <RouteLoader />;
    }

    return (
        <div>
            <PageBreadcrumb pageTitle="Webinar" />

            <div>
                <ModuleStatCard />
            </div>

            <div className="my-5">
                <AddLiveWebinar />
            </div>


            <div className="my-5">
                <ComponentCard title="All Live Webinars">
                    <div>
                        <Input
                            type="text"
                            placeholder="Search by webinar name"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>

                    <div className="border-b border-gray-200">
                        <ul className="flex space-x-6 text-sm font-medium text-center text-gray-500">
                            <li
                                className={`cursor-pointer px-4 py-2 ${activeTab === 'all' ? 'border-b-2 border-blue-600 text-blue-600' : ''}`}
                                onClick={() => setActiveTab('all')}
                            >
                                All
                            </li>
                            {/* <li
                                className={`cursor-pointer px-4 py-2 ${activeTab === 'active' ? 'border-b-2 border-blue-600 text-blue-600' : ''}`}
                                onClick={() => setActiveTab('active')}
                            >
                                Active
                            </li>
                            <li
                                className={`cursor-pointer px-4 py-2 ${activeTab === 'inactive' ? 'border-b-2 border-blue-600 text-blue-600' : ''}`}
                                onClick={() => setActiveTab('inactive')}
                            >
                                Inactive
                            </li> */}
                        </ul>
                    </div>
                    <div>
                        <BasicTableOne columns={columns} data={getFilteredByStatus()} />
                    </div>
                </ComponentCard>
            </div>



            <Modal
                isOpen={isOpen}
                onClose={closeModal}
                className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70"
            >
                <div className="relative w-screen h-screen bg-white overflow-hidden">
                    {/* Close Button */}
                    <button
                        onClick={closeModal}
                        className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 transition-colors duration-200 text-3xl font-bold z-10"
                        aria-label="Close modal"
                    >
                        &times;
                    </button>

                    {/* Scrollable Content */}
                    <div className="w-full h-full overflow-y-auto p-6 sm:p-8 md:p-10 pt-20">
                        <h4 className="text-3xl sm:text-4xl font-extrabold text-blue-800 mb-8 text-center">
                            Edit Live Webinar Information
                        </h4>

                        <form className="space-y-8">
                            {/* Webinar Name */}
                            <div>
                                <Label htmlFor="webinarName" className="text-gray-800 font-bold text-lg mb-3 block">
                                    Live Webinar Name
                                </Label>
                                <Input
                                    id="webinarName"
                                    type="text"
                                    value={name}
                                    placeholder="Enter Webinar Name"
                                    onChange={(e) => setName(e.target.value)}
                                    className="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-blue-500 focus:border-blue-500 text-lg"
                                />
                            </div>

                            {/* Image Upload */}
                            <div>
                                <Label htmlFor="webinarImage" className="text-gray-800 font-bold text-lg mb-4 block">
                                    Select Image
                                </Label>
                                <FileInput
                                    id="webinarImage"
                                    onChange={handleFileChange}
                                    className="w-full p-1 border-2 border-gray-200 rounded-xl focus:ring-blue-500 focus:border-blue-500 mt-4"
                                />
                                {(selectedFile || imageUrl) && (
                                    <div className="mt-6 relative w-40 h-40 rounded-lg overflow-hidden shadow-md border border-gray-200">
                                        <Image
                                            width={160}
                                            height={160}
                                            src={selectedFile ? URL.createObjectURL(selectedFile) : imageUrl!}
                                            alt="Selected webinar image"
                                            className="object-fit w-full h-full"
                                        />
                                    </div>
                                )}
                            </div>

                            {/* Description */}
                            <div>
                                <Label htmlFor="webinarDescription" className="text-gray-800 font-bold text-lg mb-3 block">
                                    Webinar Description
                                </Label>
                                <Input
                                    id="webinarDescription"
                                    type="text"
                                    value={description}
                                    placeholder="Enter Webinar Description"
                                    onChange={(e) => setDescription(e.target.value)}
                                    className="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-blue-500 focus:border-blue-500 text-lg"
                                />
                            </div>

                            {/* Video Link */}
                            <div>
                                <Label htmlFor="liveWebinarLink" className="text-gray-800 font-bold text-lg mb-3 block">
                                    Live Webinar Link
                                </Label>
                                <Input
                                    id="liveWebinarLink"
                                    type="text"
                                    value={videoUrl}
                                    placeholder="Enter Live Webinar Link"
                                    onChange={(e) => setVideoUrl(e.target.value)}
                                    className="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-blue-500 focus:border-blue-500 text-lg"
                                />
                            </div>

                            {/* Date & Time */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div>
                                    <Label htmlFor="webinarDate" className="text-gray-800 font-bold text-lg mb-3 block">
                                        Webinar Date
                                    </Label>
                                    <Input
                                        id="webinarDate"
                                        type="date"
                                        value={date}
                                        onChange={(e) => setDate(e.target.value)}
                                        className="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-blue-500 focus:border-blue-500 text-lg"
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="startTime" className="text-gray-800 font-bold text-lg mb-3 block">
                                        Start Time
                                    </Label>
                                    <Input
                                        id="startTime"
                                        type="time"
                                        value={startTime}
                                        onChange={(e) => setStartTime(e.target.value)}
                                        className="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-blue-500 focus:border-blue-500 text-lg"
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="endTime" className="text-gray-800 font-bold text-lg mb-3 block">
                                        End Time
                                    </Label>
                                    <Input
                                        id="endTime"
                                        type="time"
                                        value={endTime}
                                        onChange={(e) => setEndTime(e.target.value)}
                                        className="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-blue-500 focus:border-blue-500 text-lg"
                                    />
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex justify-end gap-5 mt-10 pt-6 border-t-2 border-gray-100">
                                <Button
                                    variant="outline"
                                    onClick={closeModal}
                                    className="px-6 py-3 rounded-full text-gray-700 border border-gray-300 hover:bg-gray-100 text-lg font-semibold"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    onClick={handleUpdateData}
                                    className="bg-gradient-to-r from-blue-600 to-blue-800 text-white px-6 py-3 rounded-full hover:from-blue-700 hover:to-blue-900 text-lg font-semibold"
                                >
                                    Save Changes
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            </Modal>

        </div>

    );
};

export default LiveWebinar;





