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
import { PlusCircle } from 'lucide-react';
import axios from 'axios';
import Image from 'next/image';
import Link from 'next/link';
import React, { useEffect, useState } from 'react';
import AddLiveWebinar from '@/components/livewebinars-component/LiveWebinarComponent';
// import { setDate } from 'date-fns';

// Define types
interface LiveWebinar {
    _id: string;
    user: string[];
    name: string;
    imageUrl: string;
    description: string;
    displayVideoUrls: string[] | string | null;
    date: string;
    startTime: string;
    endTime: string;
    categoryCount: number;
    isDeleted: boolean;
    createdAt: string;
    updatedAt?: string;
    __v?: number;
}

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
    categoryCount: number;
    status: string;
}



const LiveWebinar = () => {
    const { webinars, updateWebinar, deleteWebinar } = useLiveWebinars();
    const { isOpen, openModal, closeModal } = useModal();
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



    const fetchFilteredWebinars = async () => {
        try {
            const params = {
                ...(searchQuery && { search: searchQuery }),
            };

            const response = await axios.get('/api/academy/livewebinars', { params });
            const data = response.data.data;

            if (data.length === 0) {
                setFilteredCertificates([]);
            } else {
                const tableData: TableData[] = data.map((mod: LiveWebinar) => ({
                    id: mod._id,
                    user: mod.user || [],
                    name: mod.name,
                    imageUrl: mod.imageUrl,
                    description: mod.description || 'N/A',
                    displayVideoUrls: Array.isArray(mod.displayVideoUrls)
                        ? mod.displayVideoUrls
                        : (mod.displayVideoUrls ? mod.displayVideoUrls.split(',') : []),
                    date: mod.date || 'N/A',
                    startTime: mod.startTime || 'N/A',
                    endTime: mod.endTime || 'N/A',
                    categoryCount: mod.categoryCount || 0,
                    status: mod.isDeleted ? 'Deleted' : 'Active',
                }));

                setFilteredCertificates(tableData);
            }
        } catch (error) {
            console.error('Error fetching users:', error);
            setFilteredCertificates([]);
        }
    }

    useEffect(() => {
        fetchFilteredWebinars();
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
            header: 'Status',
            accessor: 'status',
            render: (row: TableData) => {
                const status = row.status;
                let colorClass = '';

                switch (status) {
                    case 'Deleted':
                        colorClass = 'text-red-500 bg-red-100 border border-red-300';
                        break;
                    case 'Active':
                        colorClass = 'text-green-600 bg-green-100 border border-green-300';
                        break;
                    default:
                        colorClass = 'text-gray-600 bg-gray-100 border border-gray-300';
                }

                return (
                    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${colorClass}`}>
                        {status}
                    </span>
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

                            <PlusCircle className="ml-1" />
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

        const selectedWebinar = webinars.find(item => item._id === id);
        if (selectedWebinar) {
            setEditingCertificationId(selectedWebinar._id);
            setName(selectedWebinar.name);
            setDescription(selectedWebinar.description || '');
            setImageUrl(selectedWebinar.imageUrl);
            setVideoUrl(selectedWebinar.displayVideoUrls?.[0] || '');
            setDate(selectedWebinar.date || '');
            setStartTime(selectedWebinar.startTime || '');
            setEndTime(selectedWebinar.endTime || '');
            //   setCurrentVideoUrls(Array.isArray(selectedWebinar.displayVideoUrls) ? selectedWebinar.displayVideoUrls : []);

            //   setNewVideos([{ name: '', description: '', file: null }]);

            openModal();
        }

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
            fetchFilteredWebinars();
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
        // setVideoFiles([]);
        // setCurrentVideoUrls([]);
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
            fetchFilteredWebinars();
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
            <div className="my-5">
                <AddLiveWebinar />
            </div>

            <div>
                <ModuleStatCard />
            </div>

            <div className="my-5">
                <ComponentCard title="All Certificates">
                    <div>
                        <Input
                            type="text"
                            placeholder="Search by certificate name"
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
                            <li
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
                            </li>
                        </ul>
                    </div>
                    <div>
                        <BasicTableOne columns={columns} data={getFilteredByStatus()} />
                    </div>
                </ComponentCard>
            </div>


            {/* Edit Modal */}
            <Modal isOpen={isOpen} onClose={closeModal} className="max-w-[700px] m-4">
                <div className="no-scrollbar relative w-full max-w-[700px] overflow-y-auto rounded-3xl bg-white p-4 dark:bg-gray-900 lg:p-11">
                    <div className="px-2 pr-14">
                        <h4 className="mb-5 text-2xl font-semibold text-gray-800 dark:text-white/90">
                            Edit Live Webinar Information
                        </h4>
                    </div>

                    <form className="flex flex-col">
                        <div className="custom-scrollbar h-[400px] overflow-y-auto px-2 pb-3">
                            <div className="grid grid-cols-1 gap-x-6 gap-y-5">

                                <div>
                                    <Label>Live Webinar Name</Label>
                                    <Input
                                        type="text"
                                        value={name}
                                        placeholder="Enter Webinar Name"
                                        onChange={(e) => setName(e.target.value)}
                                    />
                                </div>

                                <div>
                                    <Label>Select Image</Label>
                                    <FileInput onChange={handleFileChange} />
                                    {(selectedFile || imageUrl) && (
                                        <div className="mt-2">
                                            <Image
                                                width={100}
                                                height={100}
                                                src={selectedFile ? URL.createObjectURL(selectedFile) : imageUrl!}
                                                alt="Selected certificate image"
                                                className="object-cover rounded"
                                            />
                                        </div>
                                    )}
                                </div>

                                <div>
                                    <Label>Webinar Description</Label>
                                    <Input
                                        type="text"
                                        value={description}
                                        placeholder="Enter Webinar Description"
                                        onChange={(e) => setDescription(e.target.value)}
                                    />
                                </div>


                                <div>
                                    <Label>Live Webinar Link</Label>
                                    <Input
                                        type="text"
                                        value={videoUrl}
                                        placeholder="Enter Live Webinar Link"
                                        onChange={(e) => setVideoUrl(e.target.value)}
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label>Webinar Date</Label>
                                        <Input
                                            type="date"
                                            value={date}
                                            onChange={(e) => setDate(e.target.value)}
                                        />
                                    </div>

                                    <div>
                                        <Label>Webinar Start Time</Label>
                                        <Input
                                            type="time"
                                            value={startTime}
                                            onChange={(e) => setStartTime(e.target.value)}
                                        />
                                    </div>

                                    <div>
                                        <Label>Webinar End Time</Label>
                                        <Input
                                            type="time"
                                            value={endTime}
                                            onChange={(e) => setEndTime(e.target.value)}
                                        />
                                    </div>

                                </div>
                                {selectedFile && (
                                    <div className="col-span-2">
                                        <Label>Selected Image</Label>
                                        <Image
                                            width={100}
                                            height={100}
                                            src={URL.createObjectURL(selectedFile)}
                                            alt="Selected certificate image"
                                            className="object-cover rounded mt-2"
                                        />
                                    </div>
                                )}
                            </div>


                            <div className="flex items-center gap-3 px-2 mt-6 lg:justify-end">
                                <Button size="sm" variant="outline" onClick={closeModal}>
                                    Cancel
                                </Button>
                                <Button size="sm" onClick={handleUpdateData}>
                                    Save Changes
                                </Button>
                            </div>
                        </div>
                    </form>
                </div>
            </Modal>

        </div>

    );
};

export default LiveWebinar;