'use client';

import ComponentCard from '@/components/common/ComponentCard';
import PageBreadcrumb from '@/components/common/PageBreadCrumb';
import DatePicker from '@/components/form/date-picker';
import FileInput from '@/components/form/input/FileInput';
import Input from '@/components/form/input/InputField';
import Label from '@/components/form/Label';
import Select from '@/components/form/Select';

import AddModule from '@/components/module-component/AddModule';
import BasicTableOne from '@/components/tables/BasicTableOne';
import Button from '@/components/ui/button/Button';
import { Modal } from '@/components/ui/modal';
import { useModule } from '@/context/ModuleContext';
import { useModal } from '@/hooks/useModal';
import { EyeIcon, PencilIcon, TrashBinIcon } from '@/icons';
import axios from 'axios';
import Image from 'next/image';
import Link from 'next/link';
import React, { useEffect, useState } from 'react';

// Define types
interface Module {
    _id: string;
    name: string;
    image: string;
    isDeleted: boolean;
    createdAt: string;
    updatedAt?: string;
    __v?: number;
}

interface TableData {
    id: string;
    name: string;
    image: string;
    status: string;
}


const Module = () => {
    const { modules, updateModule, deleteModule } = useModule();
    const { isOpen, openModal, closeModal } = useModal();
    const [moduleName, setModuleName] = useState('');
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [editingModuleId, setEditingModuleId] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [filteredModules, setFilteredModules] = useState<TableData[]>([]);

    if (!modules || !Array.isArray(modules)) {
        return <div>Loading...</div>;
    }


    const fetchFilteredModules = async () => {
        try {
            const params = {
                ...(searchQuery && { search: searchQuery }),
            };

            const response = await axios.get('/api/modules', { params });
            const data = response.data.data;
            console.log("data in module : ", data)

            if (data.length === 0) {
                setFilteredModules([]);
            } else {
                const tableData: TableData[] = data.map((mod: Module) => ({
                    id: mod._id,
                    name: mod.name,
                    image: mod.image,
                    status: mod.isDeleted ? 'Deleted' : 'Active',
                }));
                setFilteredModules(tableData);
            }
        } catch (error) {
            console.error('Error fetching users:', error);
            setFilteredModules([]);
        }
    }

    useEffect(() => {
        fetchFilteredModules()
    }, [searchQuery])



    const columns = [
        {
            header: 'Module Name',
            accessor: 'name',
        },
        {
            header: 'Image',
            accessor: 'image',
            render: (row: TableData) => (
                <div className="flex items-center gap-3">
                    <div className="w-20 h-20 overflow-hidden">
                        <Image
                            width={130}
                            height={130}
                            src={row.image}
                            alt={row.name || "module image"}
                            className="object-cover rounded"
                        />
                    </div>
                </div>
            ),
        },
        {
            header: 'Category Count',
            accessor: 'categoryCount',
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
                            <PencilIcon />
                        </button>
                        <button onClick={() => handleDelete(row.id)} className="text-red-500 border border-red-500 rounded-md p-2 hover:bg-red-500 hover:text-white hover:border-red-500">
                            <TrashBinIcon />
                        </button>
                        <Link href={`/customer-management/user/user-list/${row.id}`} passHref>
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
        const module = modules.find(item => item._id === id);

        if (module) {
            setEditingModuleId(id);
            setModuleName(module.name);
            // setSelectedCategoryId(module.category?._id || '');
            setSelectedFile(null);
            openModal();
        }
    };

    const handleUpdateData = async () => {
        if (!editingModuleId) return;

        const formData = new FormData();
        formData.append('name', moduleName);
        if (selectedFile) {
            formData.append('image', selectedFile);
        }

        try {
            await updateModule(editingModuleId, formData);
            alert('Module updated successfully');
            closeModal();
            setEditingModuleId(null);
            setModuleName('');
            setSelectedFile(null);
        } catch (error) {
            console.error('Error updating module:', error);
        }
    };


    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            setSelectedFile(file);
            console.log('Selected file:', file.name);
        }
    };

    const handleDelete = async (id: string) => {
        const confirmDelete = window.confirm('Are you sure you want to delete this module?');
        if (!confirmDelete) return;

        try {
            await deleteModule(id);
            alert('Module deleted successfully');
        } catch (error) {
            console.error('Error deleting module:', error); // ✅ using the error
        }
    };

    

    if (!modules) {
        return <div>Loading...</div>;
    }
    return (
        <div>
            <PageBreadcrumb pageTitle="Module" />
            <div className="my-5">
                <AddModule />
            </div>



            <div className="my-5">
                <ComponentCard title="All Modules">
                    <div>
                        <Input
                            type="text"
                            placeholder="Search by module name"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />

                    </div>
                    <div>
                        <BasicTableOne columns={columns} data={filteredModules} />
                    </div>
                </ComponentCard>
            </div>

            <div>
                <Modal isOpen={isOpen} onClose={closeModal} className="max-w-[700px] m-4">
                    <div className="no-scrollbar relative w-full max-w-[700px] overflow-y-auto rounded-3xl bg-white p-4 dark:bg-gray-900 lg:p-11">
                        <div className="px-2 pr-14">
                            <h4 className="mb-5 text-2xl font-semibold text-gray-800 dark:text-white/90">
                                Edit Module Information
                            </h4>

                        </div>

                        <form className="flex flex-col">
                            <div className="custom-scrollbar h-[200px] overflow-y-auto px-2 pb-3">
                                <div className="">
                                    <div className="grid grid-cols-1 gap-x-6 gap-y-5 ">
                                        <div>
                                            <Label>Module Name</Label>
                                            <Input
                                                type="text"
                                                value={moduleName}
                                                placeholder="Enter Module"
                                                onChange={(e) => setModuleName(e.target.value)}
                                            />

                                        </div>
                                        <div>
                                            <Label>Select Image</Label>
                                            <FileInput onChange={handleFileChange} className="custom-class" />

                                        </div>

                                    </div>
                                </div>

                            </div>
                            <div className="flex items-center gap-3 px-2 mt-6 lg:justify-end">
                                <Button size="sm" variant="outline" onClick={closeModal}>
                                    Close
                                </Button>
                                <Button size="sm" onClick={handleUpdateData}>
                                    Update Changes
                                </Button>
                            </div>
                        </form>
                    </div>
                </Modal>
            </div>
        </div>
    );
};

export default Module;
